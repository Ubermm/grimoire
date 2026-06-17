"""
Distributional JEPA — Feasibility Experiment
=============================================
Tests the core hypothesis: does making the encoder output a Gaussian (mu, log_var)
and using KL divergence as the loss naturally prevent representational collapse,
eliminating the need for auxiliary regularizers like VICReg/SigReg?

Runs on synthetic structured data (colored geometric shapes) to isolate the
training dynamics question from dataset/compute concerns. Trains on CPU in minutes.

Compares:
  1. Standard JEPA (point embeddings + smooth L1 loss, no regularizer)
  2. Standard JEPA + VICReg-style regularization (for reference)
  3. Distributional JEPA (Gaussian embeddings + KL loss, no regularizer)
"""

import os
import copy
import time
import json

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader, TensorDataset
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt


# ---------------------------------------------------------------------------
# Synthetic dataset: colored geometric shapes on random backgrounds
# ---------------------------------------------------------------------------

def generate_shapes_dataset(n_samples=5000, img_size=32, n_classes=8, seed=42):
    rng = np.random.RandomState(seed)
    images = rng.uniform(0.1, 0.3, (n_samples, 3, img_size, img_size)).astype(np.float32)
    labels = rng.randint(0, n_classes, n_samples)

    colors = [
        [1.0, 0.2, 0.2], [0.2, 1.0, 0.2], [0.2, 0.2, 1.0], [1.0, 1.0, 0.2],
        [1.0, 0.2, 1.0], [0.2, 1.0, 1.0], [1.0, 0.6, 0.2], [0.6, 0.2, 1.0],
    ]

    for i in range(n_samples):
        c = labels[i]
        color = np.array(colors[c % len(colors)])
        cx = rng.randint(8, img_size - 8)
        cy = rng.randint(8, img_size - 8)
        size = rng.randint(4, 8)

        if c < 4:  # rectangles
            x1, x2 = max(0, cx - size), min(img_size, cx + size)
            y1, y2 = max(0, cy - size), min(img_size, cy + size)
            for ch in range(3):
                images[i, ch, y1:y2, x1:x2] = color[ch]
        else:  # circles
            yy, xx = np.ogrid[:img_size, :img_size]
            mask = (xx - cx)**2 + (yy - cy)**2 <= size**2
            for ch in range(3):
                images[i, ch, mask] = color[ch]

        images[i] += rng.normal(0, 0.05, (3, img_size, img_size)).astype(np.float32)

    images = np.clip(images, 0, 1)
    return torch.from_numpy(images), torch.from_numpy(labels).long()


# ---------------------------------------------------------------------------
# Tiny ViT components
# ---------------------------------------------------------------------------

class PatchEmbed(nn.Module):
    def __init__(self, img_size=32, patch_size=4, embed_dim=64):
        super().__init__()
        self.num_patches = (img_size // patch_size) ** 2
        self.proj = nn.Conv2d(3, embed_dim, kernel_size=patch_size, stride=patch_size)

    def forward(self, x):
        return self.proj(x).flatten(2).transpose(1, 2)


class Block(nn.Module):
    def __init__(self, dim, num_heads=4):
        super().__init__()
        self.norm1 = nn.LayerNorm(dim)
        self.attn = nn.MultiheadAttention(dim, num_heads, batch_first=True)
        self.norm2 = nn.LayerNorm(dim)
        self.mlp = nn.Sequential(nn.Linear(dim, dim * 4), nn.GELU(), nn.Linear(dim * 4, dim))

    def forward(self, x):
        x2 = self.norm1(x)
        x = x + self.attn(x2, x2, x2, need_weights=False)[0]
        x = x + self.mlp(self.norm2(x))
        return x


def sincos_pos_embed(num_patches, dim):
    grid_size = int(num_patches**0.5)
    pe = np.zeros((num_patches, dim))
    pos = np.arange(num_patches)[:, None]
    div = np.exp(np.arange(0, dim, 2) * -(np.log(10000.0) / dim))
    pe[:, 0::2] = np.sin(pos * div)
    pe[:, 1::2] = np.cos(pos * div)
    return torch.from_numpy(pe).float().unsqueeze(0)


# ---------------------------------------------------------------------------
# Encoders
# ---------------------------------------------------------------------------

class PointEncoder(nn.Module):
    def __init__(self, img_size=32, patch_size=4, embed_dim=64, depth=4):
        super().__init__()
        self.patch_embed = PatchEmbed(img_size, patch_size, embed_dim)
        n = self.patch_embed.num_patches
        self.pos_embed = nn.Parameter(sincos_pos_embed(n, embed_dim), requires_grad=False)
        self.blocks = nn.ModuleList([Block(embed_dim) for _ in range(depth)])
        self.norm = nn.LayerNorm(embed_dim)
        self.embed_dim = embed_dim

    def forward(self, x, mask=None):
        x = self.patch_embed(x) + self.pos_embed
        if mask is not None:
            x = torch.gather(x, 1, mask.unsqueeze(-1).expand(-1, -1, x.size(-1)))
        for blk in self.blocks:
            x = blk(x)
        return self.norm(x)


class DistributionalEncoder(nn.Module):
    def __init__(self, img_size=32, patch_size=4, embed_dim=64, depth=4):
        super().__init__()
        self.patch_embed = PatchEmbed(img_size, patch_size, embed_dim)
        n = self.patch_embed.num_patches
        self.pos_embed = nn.Parameter(sincos_pos_embed(n, embed_dim), requires_grad=False)
        self.blocks = nn.ModuleList([Block(embed_dim) for _ in range(depth)])
        self.norm = nn.LayerNorm(embed_dim)
        self.mu_head = nn.Linear(embed_dim, embed_dim)
        self.logvar_head = nn.Linear(embed_dim, embed_dim)
        nn.init.zeros_(self.logvar_head.weight)
        nn.init.constant_(self.logvar_head.bias, -1.0)
        self.embed_dim = embed_dim

    def forward(self, x, mask=None):
        x = self.patch_embed(x) + self.pos_embed
        if mask is not None:
            x = torch.gather(x, 1, mask.unsqueeze(-1).expand(-1, -1, x.size(-1)))
        for blk in self.blocks:
            x = blk(x)
        x = self.norm(x)
        mu = self.mu_head(x)
        log_var = torch.clamp(self.logvar_head(x), -10.0, 2.0)
        return mu, log_var


# ---------------------------------------------------------------------------
# Predictors
# ---------------------------------------------------------------------------

class PointPredictor(nn.Module):
    def __init__(self, num_patches, embed_dim=64, pred_dim=32, depth=2):
        super().__init__()
        self.proj_in = nn.Linear(embed_dim, pred_dim)
        self.mask_token = nn.Parameter(torch.randn(1, 1, pred_dim) * 0.02)
        self.pos_embed = nn.Parameter(sincos_pos_embed(num_patches, pred_dim), requires_grad=False)
        self.blocks = nn.ModuleList([Block(pred_dim) for _ in range(depth)])
        self.norm = nn.LayerNorm(pred_dim)
        self.proj_out = nn.Linear(pred_dim, embed_dim)

    def forward(self, ctx, ctx_idx, tgt_idx):
        B, _, D = ctx.shape
        x = self.proj_in(ctx)
        x = x + torch.gather(self.pos_embed.expand(B, -1, -1), 1,
                              ctx_idx.unsqueeze(-1).expand(-1, -1, x.size(-1)))
        N_tgt = tgt_idx.size(1)
        tokens = self.mask_token.expand(B, N_tgt, -1)
        tokens = tokens + torch.gather(self.pos_embed.expand(B, -1, -1), 1,
                                        tgt_idx.unsqueeze(-1).expand(-1, -1, tokens.size(-1)))
        x = torch.cat([x, tokens], dim=1)
        for blk in self.blocks:
            x = blk(x)
        x = self.norm(x[:, ctx.size(1):])
        return self.proj_out(x)


class DistributionalPredictor(nn.Module):
    def __init__(self, num_patches, embed_dim=64, pred_dim=32, depth=2):
        super().__init__()
        self.proj_in = nn.Linear(embed_dim * 2, pred_dim)
        self.mask_token = nn.Parameter(torch.randn(1, 1, pred_dim) * 0.02)
        self.pos_embed = nn.Parameter(sincos_pos_embed(num_patches, pred_dim), requires_grad=False)
        self.blocks = nn.ModuleList([Block(pred_dim) for _ in range(depth)])
        self.norm = nn.LayerNorm(pred_dim)
        self.mu_head = nn.Linear(pred_dim, embed_dim)
        self.logvar_head = nn.Linear(pred_dim, embed_dim)
        nn.init.zeros_(self.logvar_head.weight)
        nn.init.constant_(self.logvar_head.bias, -1.0)

    def forward(self, ctx_mu, ctx_logvar, ctx_idx, tgt_idx):
        B = ctx_mu.size(0)
        x = self.proj_in(torch.cat([ctx_mu, ctx_logvar], dim=-1))
        x = x + torch.gather(self.pos_embed.expand(B, -1, -1), 1,
                              ctx_idx.unsqueeze(-1).expand(-1, -1, x.size(-1)))
        N_tgt = tgt_idx.size(1)
        tokens = self.mask_token.expand(B, N_tgt, -1)
        tokens = tokens + torch.gather(self.pos_embed.expand(B, -1, -1), 1,
                                        tgt_idx.unsqueeze(-1).expand(-1, -1, tokens.size(-1)))
        x = torch.cat([x, tokens], dim=1)
        for blk in self.blocks:
            x = blk(x)
        x = self.norm(x[:, ctx_mu.size(1):])
        mu = self.mu_head(x)
        logvar = torch.clamp(self.logvar_head(x), -10.0, 2.0)
        return mu, logvar


# ---------------------------------------------------------------------------
# Losses
# ---------------------------------------------------------------------------

def kl_gaussian(p_mu, p_lv, q_mu, q_lv):
    """KL(p || q) for diagonal Gaussians."""
    return 0.5 * (q_lv - p_lv + torch.exp(p_lv - q_lv) + (p_mu - q_mu)**2 * torch.exp(-q_lv) - 1).mean()


def symmetric_kl(mu1, lv1, mu2, lv2):
    return 0.5 * (kl_gaussian(mu1, lv1, mu2, lv2) + kl_gaussian(mu2, lv2, mu1, lv1))


def vicreg_regularizer(z, lam_var=1.0, lam_cov=0.04):
    """VICReg-style variance + covariance regularization (no invariance term)."""
    z_flat = z.reshape(-1, z.size(-1))  # [B*N, D]
    std = z_flat.std(dim=0)
    var_loss = torch.relu(1.0 - std).mean()
    z_centered = z_flat - z_flat.mean(dim=0)
    cov = (z_centered.T @ z_centered) / (z_centered.size(0) - 1)
    off_diag = cov - torch.diag(cov.diag())
    cov_loss = (off_diag**2).sum() / z_flat.size(-1)
    return lam_var * var_loss + lam_cov * cov_loss


# ---------------------------------------------------------------------------
# Masking
# ---------------------------------------------------------------------------

def make_masks(num_patches, ctx_ratio=0.7, B=64, device='cpu'):
    N_ctx = int(num_patches * ctx_ratio)
    ctx, tgt = [], []
    for _ in range(B):
        perm = torch.randperm(num_patches, device=device)
        ctx.append(perm[:N_ctx].sort().values)
        tgt.append(perm[N_ctx:].sort().values)
    return torch.stack(ctx), torch.stack(tgt)


# ---------------------------------------------------------------------------
# Collapse diagnostics
# ---------------------------------------------------------------------------

@torch.no_grad()
def compute_collapse_metrics(encoder, loader, device, distributional=False):
    """Measures how collapsed the representations are."""
    all_z = []
    for imgs, _ in loader:
        imgs = imgs.to(device)
        if distributional:
            mu, lv = encoder(imgs)
            all_z.append(mu.mean(dim=1))
        else:
            all_z.append(encoder(imgs).mean(dim=1))
    z = torch.cat(all_z)  # [N_samples, embed_dim]

    std_per_dim = z.std(dim=0)  # [D]
    mean_std = std_per_dim.mean().item()
    min_std = std_per_dim.min().item()
    frac_dead = (std_per_dim < 0.01).float().mean().item()

    z_norm = z / (z.norm(dim=1, keepdim=True) + 1e-8)
    cos_sim = (z_norm @ z_norm.T)
    mask = ~torch.eye(len(z), dtype=torch.bool, device=device)
    mean_cos_sim = cos_sim[mask].mean().item()

    rank = torch.linalg.matrix_rank(z - z.mean(dim=0)).item()
    effective_rank = rank / z.size(1)

    return {
        'mean_std': mean_std,
        'min_std': min_std,
        'frac_dead_dims': frac_dead,
        'mean_cosine_sim': mean_cos_sim,
        'effective_rank': effective_rank,
    }


def linear_probe(encoder, train_loader, test_loader, device, distributional=False, n_classes=8):
    encoder.eval()
    def get_feats(loader):
        fs, ls = [], []
        with torch.no_grad():
            for imgs, labels in loader:
                imgs = imgs.to(device)
                if distributional:
                    mu, _ = encoder(imgs)
                    fs.append(mu.mean(dim=1))
                else:
                    fs.append(encoder(imgs).mean(dim=1))
                ls.append(labels)
        return torch.cat(fs), torch.cat(ls)

    train_f, train_l = get_feats(train_loader)
    test_f, test_l = get_feats(test_loader)
    dim = train_f.size(1)

    clf = nn.Linear(dim, n_classes)
    opt = torch.optim.Adam(clf.parameters(), lr=0.01)
    ds = TensorDataset(train_f, train_l)
    dl = DataLoader(ds, batch_size=256, shuffle=True)
    clf.train()
    for _ in range(50):
        for f, l in dl:
            opt.zero_grad()
            F.cross_entropy(clf(f), l).backward()
            opt.step()
    clf.eval()
    with torch.no_grad():
        acc = (clf(test_f).argmax(1) == test_l).float().mean().item()
    return acc


# ---------------------------------------------------------------------------
# Training
# ---------------------------------------------------------------------------

def train_epoch_standard(enc, tgt_enc, pred, loader, opt, device, ema_m, use_vicreg=False):
    enc.train(); pred.train()
    N = enc.patch_embed.num_patches
    total_loss, total_reg, count = 0, 0, 0
    for imgs, _ in loader:
        imgs = imgs.to(device); B = imgs.size(0)
        ctx_idx, tgt_idx = make_masks(N, 0.7, B, device)
        with torch.no_grad():
            h = tgt_enc(imgs)
            h = F.layer_norm(h, (h.size(-1),))
            h_tgt = torch.gather(h, 1, tgt_idx.unsqueeze(-1).expand(-1, -1, h.size(-1)))
        z_ctx = enc(imgs, ctx_idx)
        z_pred = pred(z_ctx, ctx_idx, tgt_idx)
        loss = F.smooth_l1_loss(z_pred, h_tgt)
        reg = torch.tensor(0.0)
        if use_vicreg:
            reg = vicreg_regularizer(z_ctx)
            loss = loss + reg
        opt.zero_grad(); loss.backward()
        nn.utils.clip_grad_norm_(list(enc.parameters()) + list(pred.parameters()), 1.0)
        opt.step()
        with torch.no_grad():
            for pq, pk in zip(enc.parameters(), tgt_enc.parameters()):
                pk.data.mul_(ema_m).add_((1 - ema_m) * pq.data)
        total_loss += loss.item(); total_reg += reg.item(); count += 1
    return total_loss / count, total_reg / count


def train_epoch_distributional(enc, tgt_enc, pred, loader, opt, device, ema_m):
    enc.train(); pred.train()
    N = enc.patch_embed.num_patches
    total_loss, total_var, total_mu_std, count = 0, 0, 0, 0
    for imgs, _ in loader:
        imgs = imgs.to(device); B = imgs.size(0)
        ctx_idx, tgt_idx = make_masks(N, 0.7, B, device)
        with torch.no_grad():
            tgt_mu, tgt_lv = tgt_enc(imgs)
            tgt_mu_m = torch.gather(tgt_mu, 1, tgt_idx.unsqueeze(-1).expand(-1, -1, tgt_mu.size(-1)))
            tgt_lv_m = torch.gather(tgt_lv, 1, tgt_idx.unsqueeze(-1).expand(-1, -1, tgt_lv.size(-1)))
        ctx_mu, ctx_lv = enc(imgs, ctx_idx)
        pred_mu, pred_lv = pred(ctx_mu, ctx_lv, ctx_idx, tgt_idx)
        loss = symmetric_kl(pred_mu, pred_lv, tgt_mu_m, tgt_lv_m)
        opt.zero_grad(); loss.backward()
        nn.utils.clip_grad_norm_(list(enc.parameters()) + list(pred.parameters()), 1.0)
        opt.step()
        with torch.no_grad():
            for pq, pk in zip(enc.parameters(), tgt_enc.parameters()):
                pk.data.mul_(ema_m).add_((1 - ema_m) * pq.data)
            total_var += torch.exp(tgt_lv_m).mean().item()
            total_mu_std += tgt_mu_m.std(dim=0).mean().item()
        total_loss += loss.item(); count += 1
    return total_loss / count, total_var / count, total_mu_std / count


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    device = 'cpu'
    seed = 42
    torch.manual_seed(seed)
    np.random.seed(seed)

    EPOCHS = 30
    BATCH = 64
    LR = 3e-4
    EMBED = 64
    DEPTH = 3
    PRED_DIM = 32
    PRED_DEPTH = 2
    IMG_SIZE = 32
    PATCH_SIZE = 4
    EMA_START = 0.996
    EMA_END = 1.0
    PROBE_EVERY = 5

    print("Generating synthetic dataset...")
    train_imgs, train_labels = generate_shapes_dataset(4000, IMG_SIZE, seed=seed)
    test_imgs, test_labels = generate_shapes_dataset(1000, IMG_SIZE, seed=seed + 1)
    train_dl = DataLoader(TensorDataset(train_imgs, train_labels), batch_size=BATCH, shuffle=True, drop_last=True)
    test_dl = DataLoader(TensorDataset(test_imgs, test_labels), batch_size=256)
    train_dl_eval = DataLoader(TensorDataset(train_imgs, train_labels), batch_size=256)

    num_patches = (IMG_SIZE // PATCH_SIZE) ** 2
    out_dir = os.path.dirname(os.path.abspath(__file__))

    configs = {
        'standard_jepa': {'distributional': False, 'vicreg': False},
        'standard_jepa_vicreg': {'distributional': False, 'vicreg': True},
        'distributional_jepa': {'distributional': True, 'vicreg': False},
    }

    all_results = {}

    for name, cfg in configs.items():
        print(f"\n{'='*60}")
        print(f"  {name.upper()}")
        print(f"{'='*60}")

        torch.manual_seed(seed)

        if cfg['distributional']:
            enc = DistributionalEncoder(IMG_SIZE, PATCH_SIZE, EMBED, DEPTH).to(device)
            tgt = copy.deepcopy(enc)
            pred = DistributionalPredictor(num_patches, EMBED, PRED_DIM, PRED_DEPTH).to(device)
        else:
            enc = PointEncoder(IMG_SIZE, PATCH_SIZE, EMBED, DEPTH).to(device)
            tgt = copy.deepcopy(enc)
            pred = PointPredictor(num_patches, EMBED, PRED_DIM, PRED_DEPTH).to(device)

        for p in tgt.parameters():
            p.requires_grad = False

        opt = torch.optim.AdamW(list(enc.parameters()) + list(pred.parameters()), lr=LR, weight_decay=0.05)
        sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=EPOCHS)

        history = {'loss': [], 'probe_acc': [], 'collapse': [], 'variance': [], 'mu_std': []}

        for epoch in range(1, EPOCHS + 1):
            t0 = time.time()
            ema_m = EMA_START + (EMA_END - EMA_START) * (epoch - 1) / max(EPOCHS - 1, 1)

            if cfg['distributional']:
                loss, avg_var, avg_mu_std = train_epoch_distributional(enc, tgt, pred, train_dl, opt, device, ema_m)
                history['variance'].append(avg_var)
                history['mu_std'].append(avg_mu_std)
            else:
                loss, reg = train_epoch_standard(enc, tgt, pred, train_dl, opt, device, ema_m, cfg['vicreg'])
            sched.step()
            history['loss'].append(loss)

            elapsed = time.time() - t0

            if epoch % PROBE_EVERY == 0 or epoch == 1 or epoch == EPOCHS:
                cm = compute_collapse_metrics(enc, test_dl, device, cfg['distributional'])
                acc = linear_probe(enc, train_dl_eval, test_dl, device, cfg['distributional'])
                history['probe_acc'].append((epoch, acc))
                history['collapse'].append((epoch, cm))

                extra = ""
                if cfg['distributional']:
                    extra = f"  var={avg_var:.4f}  mu_std={avg_mu_std:.4f}"
                print(f"  [Ep {epoch:2d}] loss={loss:.4f}  acc={acc:.4f}  "
                      f"cos_sim={cm['mean_cosine_sim']:.3f}  eff_rank={cm['effective_rank']:.2f}  "
                      f"dead={cm['frac_dead_dims']:.2f}{extra}  ({elapsed:.1f}s)")
            else:
                extra = ""
                if cfg['distributional']:
                    extra = f"  var={avg_var:.4f}  mu_std={avg_mu_std:.4f}"
                print(f"  [Ep {epoch:2d}] loss={loss:.4f}{extra}  ({elapsed:.1f}s)")

        all_results[name] = history

    # =====================================================================
    # Plotting
    # =====================================================================
    fig, axes = plt.subplots(2, 3, figsize=(18, 10))
    colors = {'standard_jepa': 'blue', 'standard_jepa_vicreg': 'green', 'distributional_jepa': 'red'}
    labels_nice = {'standard_jepa': 'Std JEPA (no reg)', 'standard_jepa_vicreg': 'Std JEPA + VICReg', 'distributional_jepa': 'Distributional JEPA'}

    # Loss
    for name, h in all_results.items():
        axes[0, 0].plot(h['loss'], color=colors[name], label=labels_nice[name])
    axes[0, 0].set_title('Training Loss'); axes[0, 0].set_xlabel('Epoch'); axes[0, 0].legend(); axes[0, 0].grid(True, alpha=0.3)

    # Probe accuracy
    for name, h in all_results.items():
        if h['probe_acc']:
            eps, accs = zip(*h['probe_acc'])
            axes[0, 1].plot(eps, accs, 'o-', color=colors[name], label=labels_nice[name])
    axes[0, 1].set_title('Linear Probe Accuracy'); axes[0, 1].set_xlabel('Epoch'); axes[0, 1].legend(); axes[0, 1].grid(True, alpha=0.3)

    # Cosine similarity (collapse indicator)
    for name, h in all_results.items():
        if h['collapse']:
            eps, cms = zip(*h['collapse'])
            axes[0, 2].plot(eps, [c['mean_cosine_sim'] for c in cms], 'o-', color=colors[name], label=labels_nice[name])
    axes[0, 2].set_title('Mean Cosine Similarity (1.0 = collapsed)'); axes[0, 2].set_xlabel('Epoch')
    axes[0, 2].axhline(y=1.0, color='black', linestyle='--', alpha=0.3, label='Full collapse')
    axes[0, 2].legend(); axes[0, 2].grid(True, alpha=0.3)

    # Effective rank
    for name, h in all_results.items():
        if h['collapse']:
            eps, cms = zip(*h['collapse'])
            axes[1, 0].plot(eps, [c['effective_rank'] for c in cms], 'o-', color=colors[name], label=labels_nice[name])
    axes[1, 0].set_title('Effective Rank (higher = more diverse)'); axes[1, 0].set_xlabel('Epoch')
    axes[1, 0].legend(); axes[1, 0].grid(True, alpha=0.3)

    # Dead dimensions
    for name, h in all_results.items():
        if h['collapse']:
            eps, cms = zip(*h['collapse'])
            axes[1, 1].plot(eps, [c['frac_dead_dims'] for c in cms], 'o-', color=colors[name], label=labels_nice[name])
    axes[1, 1].set_title('Fraction Dead Dimensions (<0.01 std)'); axes[1, 1].set_xlabel('Epoch')
    axes[1, 1].legend(); axes[1, 1].grid(True, alpha=0.3)

    # Distributional-specific: variance trajectory
    h = all_results['distributional_jepa']
    if h['variance']:
        axes[1, 2].plot(h['variance'], color='red', label='Mean target variance')
        ax2 = axes[1, 2].twinx()
        ax2.plot(h['mu_std'], color='purple', label='Mean mu std')
        ax2.set_ylabel('Mu std (purple)')
        axes[1, 2].set_title('Distributional JEPA: Variance & Diversity')
        axes[1, 2].set_xlabel('Epoch')
        axes[1, 2].set_ylabel('Variance (red)')
        axes[1, 2].legend(loc='upper left'); ax2.legend(loc='upper right')
    axes[1, 2].grid(True, alpha=0.3)

    plt.tight_layout()
    fig.savefig(os.path.join(out_dir, 'results.png'), dpi=150)
    print(f"\nPlot saved to {os.path.join(out_dir, 'results.png')}")

    # Summary
    print("\n" + "=" * 60)
    print("FINAL SUMMARY")
    print("=" * 60)
    for name, h in all_results.items():
        best_acc = max(a for _, a in h['probe_acc']) if h['probe_acc'] else 0
        final_collapse = h['collapse'][-1][1] if h['collapse'] else {}
        print(f"\n{labels_nice[name]}:")
        print(f"  Best probe acc:     {best_acc:.4f}")
        print(f"  Final loss:         {h['loss'][-1]:.4f}")
        if final_collapse:
            print(f"  Cosine similarity:  {final_collapse['mean_cosine_sim']:.4f} (1.0=collapsed)")
            print(f"  Effective rank:     {final_collapse['effective_rank']:.4f}")
            print(f"  Dead dimensions:    {final_collapse['frac_dead_dims']:.4f}")
        if h.get('variance'):
            print(f"  Final variance:     {h['variance'][-1]:.4f}")
            print(f"  Final mu diversity: {h['mu_std'][-1]:.4f}")

    # Save JSON
    save_results = {}
    for name, h in all_results.items():
        save_results[name] = {
            'losses': h['loss'],
            'probe_accs': h['probe_acc'],
            'final_collapse': h['collapse'][-1][1] if h['collapse'] else {},
        }
        if h.get('variance'):
            save_results[name]['variance_trajectory'] = h['variance']
            save_results[name]['mu_std_trajectory'] = h['mu_std']
    with open(os.path.join(out_dir, 'results.json'), 'w') as f:
        json.dump(save_results, f, indent=2)

    return all_results


if __name__ == '__main__':
    main()
