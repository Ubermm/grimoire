// Creates (or cleans up) a throwaway user for the authenticated HTTP integration
// test. Uses raw collections (avoids the mongoose ESM model-import issue under tsx).
//   npx tsx scripts/itest-user.ts          -> create user itest@example.com / Testpass123!
//   npx tsx scripts/itest-user.ts cleanup  -> delete the user + their AI Act data
import fs from 'fs';
import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
import { genSaltSync, hashSync } from 'bcrypt-ts';

const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf8').split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

const EMAIL = 'itest@example.com';
const PASSWORD = 'Testpass123!';

async function main() {
  const cleanup = process.argv[2] === 'cleanup';
  await mongoose.connect(env.MONGODB_URI, { dbName: 'Grimoire' } as any);
  const db = mongoose.connection.db;
  const users = db.collection('users');
  const existing = await users.findOne({ email: EMAIL });

  if (cleanup) {
    if (existing) {
      const uid = String(existing._id);
      await db.collection('aisystems').deleteMany({ userId: uid });
      await db.collection('ai_act_audits').deleteMany({ userId: uid });
      await users.deleteOne({ email: EMAIL });
      console.log('cleaned up itest user + data');
    } else console.log('no itest user to clean');
  } else {
    if (!existing) {
      const hash = hashSync(PASSWORD, genSaltSync(10));
      await users.insertOne({ _id: randomUUID(), email: EMAIL, password: hash, createdAt: new Date(), updatedAt: new Date() } as any);
      console.log(`created ${EMAIL}`);
    } else console.log(`${EMAIL} already exists`);
    const u = await users.findOne({ email: EMAIL });
    console.log('userId:', String(u._id));
  }
  await mongoose.disconnect();
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
