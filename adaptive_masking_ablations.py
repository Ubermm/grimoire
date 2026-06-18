#!/usr/bin/env python3
"""
Ablation study: Error-Adaptive Masking strategies in a toy JEPA.
CPU-only. Uses a synthetic dataset where ground-truth patch difficulty is known:
  - Patches 0-7  ("easy"): class-specific smooth spatial gradient, predictable from context.
  - Patches 8-15 ("hard"): independent Gaussian noise, irreducible error.

This lets us measure not just linear-probe accuracy but also *mask placement quality*:
does adaptive masking correctly concentrate on the learning frontier?

Architecture: ViT-Tiny (32x32, 8x8 patches → 16 patches, dim=64, depth=3)
              Predictor (dim=32, depth=2)
Strategies:   random | V1 error_adaptive (τ sweep) | blend (α sweep) |
              V3 competence_boundary (EMA sweep) | V4 learned difficulty
"""

import copy, json, time
from pathlib import Path
from typing import Optional

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader, Dataset, Subset

DEVICE = torch.device("cpu")
torch.set_num_threads(4)


# ─────────────────────────────────────────────── synthetic dataset ────────────

class SyntheticJEPADataset(Dataset):
    """
    32x32 images, 8x8 patches → 4x4 grid = 16 patches (indices 0-15).

    Patch layout (row-major):
      0  1  2  3
      4  5  6  7    ← "EASY" patches: value = class_slope * row + (1-slope) * col
      8  9 10 11    ← "HARD" patches: iid Gaussian noise per sample
     12 13 14 15

    Classes 0-9: slope = c/9. The structured half is predictable from neighboring
    context; the noise half has irreducible error regardless of training duration.
    """

    N_EASY = 8   # patches 0-7
    N_HARD = 8   # patches 8-15

    def __init__(self, n: int = 5000, seed: int = 0):
        rng = np.random.default_rng(seed)
        imgs, labels = [], []
        for i in range(n):
            label = i % 10
            slope = label / 9.0
            img = np.zeros((3, 32, 32), dtype=np.float32)

            # Easy patches (first 8: rows 0-1 of the 4x4 patch grid)
            for pr in range(2):          # patch rows 0,1
                for pc in range(4):      # patch cols 0-3
                    val = slope * pr + (1 - slope) * pc / 3.0
                    img[:, pr*8:(pr+1)*8, pc*8:(pc+1)*8] = val

            # Hard patches (last 8: rows 2-3 of the patch grid)
            for pr in range(2, 4):
                for pc in range(4):
                    noise = rng.standard_normal((3, 8, 8)).astype(np.float32) * 0.5
                    img[:, pr*8:(pr+1)*8, pc*8:(pc+1)*8] = noise

            imgs.append(img)
            labels.append(label)

        self.data = torch.from_numpy(np.stack(imgs))   # N, 3, 32, 32
        self.labels = torch.tensor(labels, dtype=torch.long)

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        return self.data[idx], self.labels[idx]


# ─────────────────────────────────────────── tiny transformer blocks ──────────

class Attention(nn.Module):
    def __init__(self, dim: int, heads: int):
        super().__init__()
        self.heads = heads
        self.hd = dim // heads
        self.scale = self.hd ** -0.5
        self.qkv = nn.Linear(dim, dim * 3, bias=False)
        self.proj = nn.Linear(dim, dim)

    def forward(self, x):
        B, N, D = x.shape
        H, HD = self.heads, self.hd
        qkv = self.qkv(x).reshape(B, N, 3, H, HD).permute(2, 0, 3, 1, 4)
        q, k, v = qkv.unbind(0)
        attn = (q @ k.transpose(-2, -1)) * self.scale
        x = (attn.softmax(-1) @ v).transpose(1, 2).reshape(B, N, D)
        return self.proj(x)


class Block(nn.Module):
    def __init__(self, dim: int, heads: int, mlp_ratio: float = 2.0):
        super().__init__()
        self.norm1 = nn.LayerNorm(dim)
        self.attn = Attention(dim, heads)
        self.norm2 = nn.LayerNorm(dim)
        mlp_dim = int(dim * mlp_ratio)
        self.mlp = nn.Sequential(nn.Linear(dim, mlp_dim), nn.GELU(), nn.Linear(mlp_dim, dim))

    def forward(self, x):
        x = x + self.attn(self.norm1(x))
        x = x + self.mlp(self.norm2(x))
        return x


# ─────────────────────────────────────── encoder / predictor / diff-pred ──────

class ViT(nn.Module):
    def __init__(self, img_size=32, patch_size=8, embed_dim=64, depth=3, heads=4):
        super().__init__()
        self.n_patches = (img_size // patch_size) ** 2
        self.patch_embed = nn.Conv2d(3, embed_dim, patch_size, patch_size)
        self.pos_embed = nn.Parameter(torch.zeros(1, self.n_patches, embed_dim))
        self.blocks = nn.ModuleList([Block(embed_dim, heads) for _ in range(depth)])
        self.norm = nn.LayerNorm(embed_dim)
        nn.init.trunc_normal_(self.pos_embed, std=0.02)
        self.apply(self._init)

    def _init(self, m):
        if isinstance(m, nn.Linear):
            nn.init.trunc_normal_(m.weight, std=0.02)
            if m.bias is not None: nn.init.zeros_(m.bias)

    def forward(self, x, vis_idx=None):
        x = self.patch_embed(x).flatten(2).transpose(1, 2) + self.pos_embed
        if vis_idx is not None:
            x = x[:, vis_idx]
        for blk in self.blocks:
            x = blk(x)
        return self.norm(x)


class Predictor(nn.Module):
    def __init__(self, embed_dim=64, pred_dim=32, n_patches=16, depth=2, heads=4):
        super().__init__()
        self.q_embed = nn.Parameter(torch.zeros(1, n_patches, pred_dim))
        self.proj_in = nn.Linear(embed_dim, pred_dim)
        self.blocks = nn.ModuleList([Block(pred_dim, heads) for _ in range(depth)])
        self.norm = nn.LayerNorm(pred_dim)
        self.proj_out = nn.Linear(pred_dim, embed_dim)
        nn.init.trunc_normal_(self.q_embed, std=0.02)
        self.apply(self._init)

    def _init(self, m):
        if isinstance(m, nn.Linear):
            nn.init.trunc_normal_(m.weight, std=0.02)
            if m.bias is not None: nn.init.zeros_(m.bias)

    def forward(self, ctx, vis_idx, tgt_idx):
        B = ctx.shape[0]
        x = torch.cat([
            self.proj_in(ctx) + self.q_embed[:, vis_idx],
            self.q_embed[:, tgt_idx].expand(B, -1, -1),
        ], dim=1)
        for blk in self.blocks:
            x = blk(x)
        return self.proj_out(self.norm(x[:, -len(tgt_idx):]))


class DifficultyPredictor(nn.Module):
    """V4: predicts per-patch difficulty from pooled visible context."""
    def __init__(self, embed_dim=64, n_patches=16, hidden=64):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(embed_dim, hidden), nn.GELU(),
            nn.Linear(hidden, n_patches), nn.Softplus(),
        )

    def forward(self, ctx):
        return self.net(ctx.mean(1))   # (B, N)


# ─────────────────────────────────────────────────── masking strategies ───────

def _vis_tgt(N, tgt_idx):
    mask = torch.ones(N, dtype=torch.bool)
    mask[tgt_idx] = False
    return torch.arange(N)[mask], tgt_idx


def random_mask(N, n_tgt):
    p = torch.randperm(N)
    return p[n_tgt:], p[:n_tgt]


def error_adaptive_mask(errors, n_tgt, temperature):
    log_p = errors / max(temperature, 1e-6)
    p = (log_p - log_p.max()).exp()
    return _vis_tgt(len(errors), torch.multinomial(p / p.sum(), n_tgt, replacement=False))


def competence_boundary_mask(errors, n_tgt, mu_e, sigma_e):
    center = mu_e + 0.5 * max(sigma_e, 1e-4)
    scores = torch.exp(-((errors - center) ** 2) / (2 * max(sigma_e, 1e-4) ** 2))
    return _vis_tgt(len(errors), torch.multinomial(scores / scores.sum(), n_tgt, replacement=False))


def blend_mask(errors, n_tgt, temperature, alpha):
    N = len(errors)
    uniform = torch.ones(N) / N
    log_p = errors / max(temperature, 1e-6)
    adaptive = (log_p - log_p.max()).exp(); adaptive /= adaptive.sum()
    p = (1 - alpha) * uniform + alpha * adaptive
    return _vis_tgt(N, torch.multinomial(p / p.sum(), n_tgt, replacement=False))


def learned_mask(diff_scores, n_tgt, epsilon=0.15):
    N = len(diff_scores)
    if torch.rand(1).item() < epsilon:
        return random_mask(N, n_tgt)
    p = diff_scores / (diff_scores.sum() + 1e-8)
    return _vis_tgt(N, torch.multinomial(p, n_tgt, replacement=False))


def get_mask(strategy, N, n_tgt, errors, mu_e, sigma_e, tau, alpha, diff_scores):
    if strategy == "random" or errors is None:
        return random_mask(N, n_tgt)
    if strategy == "error_adaptive":
        return error_adaptive_mask(errors, n_tgt, tau)
    if strategy == "competence_boundary":
        return competence_boundary_mask(errors, n_tgt, mu_e, sigma_e)
    if strategy == "blend":
        return blend_mask(errors, n_tgt, tau, alpha)
    if strategy == "learned":
        scores = diff_scores if diff_scores is not None else errors
        return learned_mask(scores, n_tgt)
    raise ValueError(strategy)


# ─────────────────────────────────────────────────────── training ─────────────

def train_epoch(encoder, target_enc, predictor, diff_pred, loader, optimizer,
                cfg, errors, mu_e, sigma_e, diff_scores):
    encoder.train(); predictor.train()
    if diff_pred: diff_pred.train()

    N = encoder.n_patches
    n_tgt = int(N * cfg["mask_ratio"])
    epoch_loss = 0.0
    new_errors = torch.zeros(N)
    patch_counts = torch.zeros(N)
    # Track hard-patch mask frequency: how often each of the 16 patches is masked
    mask_freq = torch.zeros(N)
    batch_diff = torch.zeros(N) if diff_pred else None
    diff_loss_total = 0.0
    n_batches = 0

    for imgs, _ in loader:
        imgs = imgs.to(DEVICE)
        B = imgs.shape[0]

        vis_idx, tgt_idx = get_mask(
            cfg["strategy"], N, n_tgt, errors, mu_e, sigma_e,
            cfg["temperature"], cfg["blend_alpha"], diff_scores
        )
        mask_freq[tgt_idx] += 1

        ctx = encoder(imgs, vis_idx)

        with torch.no_grad():
            tgt_embs = target_enc(imgs)[:, tgt_idx]

        preds = predictor(ctx, vis_idx, tgt_idx)
        jepa_loss = F.mse_loss(preds, tgt_embs.detach())
        total_loss = jepa_loss

        if diff_pred is not None:
            d_pred = diff_pred(ctx.detach())   # B, N
            actual_err = ((preds.detach() - tgt_embs) ** 2).mean(-1).detach()  # B, n_tgt
            d_loss = F.mse_loss(d_pred[:, tgt_idx], actual_err)
            total_loss = jepa_loss + 0.1 * d_loss
            diff_loss_total += d_loss.item()
            batch_diff[tgt_idx] += d_pred[:, tgt_idx].mean(0).detach().cpu()

        optimizer.zero_grad()
        total_loss.backward()
        all_params = list(encoder.parameters()) + list(predictor.parameters())
        if diff_pred: all_params += list(diff_pred.parameters())
        nn.utils.clip_grad_norm_(all_params, 1.0)
        optimizer.step()

        with torch.no_grad():
            for p, pk in zip(encoder.parameters(), target_enc.parameters()):
                pk.data.mul_(cfg["ema_decay"]).add_(p.data, alpha=1.0 - cfg["ema_decay"])

        with torch.no_grad():
            pe = ((preds.detach() - tgt_embs) ** 2).mean(-1).mean(0).cpu()
            new_errors[tgt_idx] += pe
            patch_counts[tgt_idx] += 1

        epoch_loss += jepa_loss.item()
        n_batches += 1

    ema = cfg["ema_error_decay"]
    valid = patch_counts > 0
    avg_new = torch.zeros(N)
    avg_new[valid] = new_errors[valid] / patch_counts[valid]
    errors = avg_new if errors is None else ema * errors + (1 - ema) * avg_new
    mu_e = errors.mean().item()
    sigma_e = max(errors.std().item(), 1e-6)

    if diff_pred is not None and n_batches > 0:
        diff_scores = batch_diff / n_batches

    # Normalize mask_freq to fraction
    total_masks = mask_freq.sum().item()
    mask_freq_norm = (mask_freq / max(total_masks / N, 1e-8)).tolist()

    return (
        epoch_loss / n_batches,
        errors,
        mu_e,
        sigma_e,
        diff_scores,
        diff_loss_total / max(n_batches, 1),
        mask_freq_norm,
    )


def eval_linear_probe(encoder, train_ds, test_ds, cfg):
    encoder.eval()

    def extract(ds):
        loader = DataLoader(ds, batch_size=256, shuffle=False, num_workers=0)
        feats, labels = [], []
        with torch.no_grad():
            for imgs, lbls in loader:
                feats.append(encoder(imgs.to(DEVICE)).mean(1).cpu())
                labels.append(lbls)
        return torch.cat(feats), torch.cat(labels)

    tr_f, tr_l = extract(train_ds)
    te_f, te_l = extract(test_ds)
    mean = tr_f.mean(0); std = tr_f.std(0) + 1e-6
    tr_f = (tr_f - mean) / std; te_f = (te_f - mean) / std

    clf = nn.Linear(tr_f.shape[1], 10)
    opt = torch.optim.Adam(clf.parameters(), lr=0.02, weight_decay=1e-4)
    for _ in range(cfg["linear_epochs"]):
        p = torch.randperm(len(tr_f))
        for i in range(0, len(tr_f), 256):
            idx = p[i:i+256]
            opt.zero_grad()
            F.cross_entropy(clf(tr_f[idx]), tr_l[idx]).backward()
            opt.step()

    clf.eval()
    with torch.no_grad():
        acc = (clf(te_f).argmax(1) == te_l).float().mean().item()
    return acc


def knn_acc(encoder, train_ds, test_ds, k=5):
    encoder.eval()
    def extract(ds):
        loader = DataLoader(ds, batch_size=256, shuffle=False, num_workers=0)
        feats, labels = [], []
        with torch.no_grad():
            for imgs, lbls in loader:
                f = encoder(imgs.to(DEVICE)).mean(1)
                feats.append(F.normalize(f, dim=-1).cpu())
                labels.append(lbls)
        return torch.cat(feats), torch.cat(labels)

    tr_f, tr_l = extract(train_ds)
    te_f, te_l = extract(test_ds)

    correct = 0
    for i in range(0, len(te_f), 128):
        nn_idx = (te_f[i:i+128] @ tr_f.T).topk(k, dim=-1).indices
        correct += (tr_l[nn_idx].mode(dim=-1).values == te_l[i:i+128]).sum().item()
    return correct / len(te_l)


# ─────────────────────────────────────────────────────── experiment ───────────

def run_experiment(cfg, train_ds, test_ds, seed=42):
    torch.manual_seed(seed); np.random.seed(seed)

    N = (cfg["img_size"] // cfg["patch_size"]) ** 2
    encoder = ViT(cfg["img_size"], cfg["patch_size"], cfg["embed_dim"],
                  cfg["depth"], cfg["heads"]).to(DEVICE)
    target_enc = copy.deepcopy(encoder)
    for p in target_enc.parameters(): p.requires_grad_(False)

    predictor = Predictor(cfg["embed_dim"], cfg["pred_dim"], N,
                          cfg["pred_depth"], cfg["pred_heads"]).to(DEVICE)
    diff_pred = DifficultyPredictor(cfg["embed_dim"], N) if cfg["strategy"] == "learned" else None

    params = list(encoder.parameters()) + list(predictor.parameters())
    if diff_pred: params += list(diff_pred.parameters())
    optimizer = torch.optim.AdamW(params, lr=cfg["lr"], weight_decay=cfg["weight_decay"])

    loader = DataLoader(train_ds, batch_size=cfg["batch_size"], shuffle=True,
                        num_workers=0, drop_last=True)

    errors = None
    mu_e, sigma_e = 0.0, 1.0
    diff_scores = None
    history = []
    t0 = time.time()

    for ep in range(cfg["epochs"]):
        loss, errors, mu_e, sigma_e, diff_scores, d_loss, mf = train_epoch(
            encoder, target_enc, predictor, diff_pred, loader, optimizer,
            cfg, errors, mu_e, sigma_e, diff_scores
        )

        # Mean mask frequency: easy (0-7) vs hard (8-15)
        easy_freq = float(np.mean(mf[:8]))
        hard_freq = float(np.mean(mf[8:]))
        # Hard-patch bias: >1 means hard patches masked more than uniform
        hard_bias = hard_freq / (easy_freq + 1e-6)

        # Easy vs hard error split
        if errors is not None:
            easy_err = errors[:8].mean().item()
            hard_err = errors[8:].mean().item()
        else:
            easy_err = hard_err = 0.0

        rec = dict(epoch=ep+1, loss=loss, mu_e=mu_e, sigma_e=sigma_e,
                   easy_freq=easy_freq, hard_freq=hard_freq, hard_bias=hard_bias,
                   easy_err=easy_err, hard_err=hard_err)
        if diff_pred: rec["diff_loss"] = d_loss
        history.append(rec)

        print(
            f"  ep {ep+1:2d} | loss={loss:.4f} | easy_err={easy_err:.4f} "
            f"hard_err={hard_err:.4f} | hard_bias={hard_bias:.2f}"
            + (f" | d_loss={d_loss:.4f}" if diff_pred else "")
        )

    lin = eval_linear_probe(encoder, train_ds, test_ds, cfg)
    knn = knn_acc(encoder, train_ds, test_ds)
    elapsed = time.time() - t0

    # Final epoch stats
    last = history[-1]
    return dict(
        config=cfg, history=history, linear_acc=lin, knn_acc=knn, elapsed=elapsed,
        final_loss=last["loss"], final_hard_bias=last["hard_bias"],
        final_easy_err=last["easy_err"], final_hard_err=last["hard_err"],
    )


# ──────────────────────────────────────────────────── ablation grid ───────────

def main():
    ds_train = SyntheticJEPADataset(n=5000, seed=0)
    ds_test  = SyntheticJEPADataset(n=1000, seed=99)
    print(f"Dataset: {len(ds_train)} train, {len(ds_test)} test")
    print(f"Patches 0-7 = EASY (smooth gradient), Patches 8-15 = HARD (iid noise)")

    base = dict(
        img_size=32, patch_size=8, embed_dim=64, depth=3, heads=4,
        pred_dim=32, pred_depth=2, pred_heads=4,
        epochs=25, batch_size=128, lr=5e-4, weight_decay=0.05,
        ema_decay=0.996, mask_ratio=0.5,
        strategy="random", temperature=1.0, blend_alpha=0.5,
        ema_error_decay=0.99,
        linear_epochs=50,
    )

    ablations = [
        # ── Baseline ─────────────────────────────────────────────────────────
        ("baseline_random",      dict(strategy="random")),

        # ── V1: temperature sensitivity ───────────────────────────────────────
        ("v1_tau0.1",            dict(strategy="error_adaptive", temperature=0.1)),
        ("v1_tau0.5",            dict(strategy="error_adaptive", temperature=0.5)),
        ("v1_tau1.0",            dict(strategy="error_adaptive", temperature=1.0)),
        ("v1_tau2.0",            dict(strategy="error_adaptive", temperature=2.0)),

        # ── Blend ─────────────────────────────────────────────────────────────
        ("blend_a0.3",           dict(strategy="blend", temperature=1.0, blend_alpha=0.3)),
        ("blend_a0.5",           dict(strategy="blend", temperature=1.0, blend_alpha=0.5)),
        ("blend_a0.7",           dict(strategy="blend", temperature=1.0, blend_alpha=0.7)),

        # ── V3: competence boundary ───────────────────────────────────────────
        ("v3_ema0.99",           dict(strategy="competence_boundary", ema_error_decay=0.99)),
        ("v3_ema0.95",           dict(strategy="competence_boundary", ema_error_decay=0.95)),
        ("v3_ema0.90",           dict(strategy="competence_boundary", ema_error_decay=0.90)),

        # ── V4: learned difficulty predictor ─────────────────────────────────
        ("v4_learned",           dict(strategy="learned")),
    ]

    out_dir = Path("./ablation_results")
    out_dir.mkdir(exist_ok=True)
    all_results = {}
    grand_t0 = time.time()

    for name, overrides in ablations:
        cfg = {**base, **overrides}
        print(f"\n{'='*65}")
        print(f"  {name}  |  strategy={cfg['strategy']}  τ={cfg['temperature']}  "
              f"α={cfg['blend_alpha']}  ema={cfg['ema_error_decay']}")
        print('='*65)
        try:
            r = run_experiment(cfg, ds_train, ds_test)
            all_results[name] = r
            print(f"  → lin={r['linear_acc']:.4f}  knn={r['knn_acc']:.4f}  "
                  f"hard_bias={r['final_hard_bias']:.2f}  ({r['elapsed']:.1f}s)")
        except Exception as e:
            print(f"  !! FAILED: {e}")
            import traceback; traceback.print_exc()
            all_results[name] = {"error": str(e)}

        with open(out_dir / "results.json", "w") as f:
            json.dump(all_results, f, indent=2, default=float)

    # ── Summary table ─────────────────────────────────────────────────────────
    baseline_lin = all_results.get("baseline_random", {}).get("linear_acc")
    total = time.time() - grand_t0

    print(f"\n{'='*80}")
    print("ABLATION RESULTS SUMMARY")
    print(f"{'='*80}")
    print(f"  hard_bias > 1 = strategy is correctly focusing on hard (noise) patches")
    print(f"  Ideal: easy patches have low error, hard patches retain high error,")
    print(f"         but model doesn't waste time chasing irreducible noise.\n")
    print(f"  {'Name':<22} {'Lin':>6} {'Δlin':>7} {'kNN':>6} "
          f"{'Loss':>7} {'HardBias':>9} {'EasyErr':>8} {'HardErr':>8} {'T(s)':>6}")
    print('  ' + '-'*78)

    for name, r in all_results.items():
        if "error" in r:
            print(f"  {name:<22}  FAILED")
            continue
        dl = f"{r['linear_acc']-baseline_lin:+.4f}" if baseline_lin and name != "baseline_random" else "  base "
        print(f"  {name:<22} {r['linear_acc']:>6.4f} {dl:>7} {r['knn_acc']:>6.4f} "
              f"{r['final_loss']:>7.4f} {r['final_hard_bias']:>9.2f} "
              f"{r['final_easy_err']:>8.4f} {r['final_hard_err']:>8.4f} {r['elapsed']:>6.1f}")

    print(f"\n  Total: {total/60:.1f} min")

    # ── Group winners ─────────────────────────────────────────────────────────
    groups = {
        "Baseline":          ["baseline_random"],
        "V1 error-adaptive": [k for k in all_results if k.startswith("v1_")],
        "Blend":             [k for k in all_results if k.startswith("blend_")],
        "V3 comp-boundary":  [k for k in all_results if k.startswith("v3_")],
        "V4 learned":        [k for k in all_results if k.startswith("v4_")],
    }
    print(f"\n  {'Group':<20} {'Best run':<22} {'Lin':>6} {'HardBias':>9}")
    print('  ' + '-'*62)
    for grp, keys in groups.items():
        valid = [(k, all_results[k]) for k in keys if "linear_acc" in all_results.get(k, {})]
        if valid:
            best = max(valid, key=lambda x: x[1]["linear_acc"])
            print(f"  {grp:<20} {best[0]:<22} {best[1]['linear_acc']:>6.4f} "
                  f"{best[1]['final_hard_bias']:>9.2f}")

    print(f"\n  Full results: {out_dir}/results.json")


if __name__ == "__main__":
    main()
