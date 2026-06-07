// Seeds the EU AI Act regulation text, seed validation forms, and example AI
// systems into the Grimoire DB. Idempotent. Run: npx tsx scripts/seed-ai-act.ts
import fs from 'fs';
import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
import { AI_ACT_REGULATION_SEED } from '../src/lib/ai-act/regulation-text';
import { SEED_FORMS } from '../src/lib/ai-act/seed-forms';
import { emptyTechnicalDocumentation } from '../src/lib/ai-act/annex-iv-sections';

const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

async function main() {
  await mongoose.connect(env.MONGODB_URI, { dbName: 'Grimoire' } as any);
  const db = mongoose.connection.db;

  // 1. Regulations
  const regs = db.collection('ai_act_regulations');
  for (const r of AI_ACT_REGULATION_SEED) {
    await regs.updateOne(
      { RegCode: r.regCode },
      { $set: { RegCode: r.regCode, RegText: r.fullText, category: r.category, source: r.source, FormCode: r.formCode }, $setOnInsert: { _id: randomUUID() } },
      { upsert: true }
    );
  }
  console.log(`ai_act_regulations: ${await regs.countDocuments()} docs`);

  // 2. Seed forms
  const forms = db.collection('ai_act_forms');
  for (const [formCode, form] of Object.entries(SEED_FORMS)) {
    const reg = AI_ACT_REGULATION_SEED.find((r) => r.formCode === formCode);
    await forms.updateOne(
      { FormCode: formCode },
      { $set: { FormCode: formCode, RegCode: reg?.regCode || '', FormText: JSON.stringify(form), generatedByLLM: false, editedByUser: false, version: 1, updatedAt: new Date() }, $setOnInsert: { _id: randomUUID(), createdAt: new Date() } },
      { upsert: true }
    );
  }
  console.log(`ai_act_forms: ${await forms.countDocuments()} docs`);

  // 3. Example AI systems (attached to every user so the registry renders for whoever logs in)
  const allUsers = await db.collection('users').find({}).toArray();
  const userIds = allUsers.length ? allUsers.map((u: any) => String(u._id)) : ['seed-user'];
  const systems = db.collection('aisystems');
  const examples = [
    {
      name: 'TalentRank — CV screening',
      description: 'Ranks and filters job applicants for recruitment.',
      provider: 'Acme HR Tech',
      role: 'provider',
      isGPAI: false,
      riskLevel: 'high',
      classificationBasis: ['High-risk — Annex III(4) employment / recruitment use without Art. 6(3) derogation.'],
      article50Obligations: [],
      technicalDocumentation: emptyTechnicalDocumentation(),
      validationResults: [],
      status: 'active',
    },
    {
      name: 'Aurora-7 — foundation model',
      description: 'A general-purpose language model offered via API to downstream developers.',
      provider: 'Aurora Labs',
      role: 'provider',
      isGPAI: true,
      riskLevel: 'gpai',
      classificationBasis: ['General-purpose AI model (Art. 3(63)) — Article 53 provider obligations apply.'],
      article50Obligations: [],
      technicalDocumentation: emptyTechnicalDocumentation(),
      validationResults: [],
      status: 'active',
    },
  ];
  for (const userId of userIds) {
    for (const ex of examples) {
      await systems.updateOne(
        { userId, name: ex.name },
        { $set: { ...ex, userId, updatedAt: new Date() }, $setOnInsert: { _id: randomUUID(), createdAt: new Date() } },
        { upsert: true }
      );
    }
  }
  console.log(`aisystems: ${await systems.countDocuments()} docs (examples attached to ${userIds.length} user(s))`);

  await mongoose.disconnect();
  console.log('SEED COMPLETE ✓');
  process.exit(0);
}

main().catch((e) => { console.error('SEED ERROR:', e); process.exit(1); });
