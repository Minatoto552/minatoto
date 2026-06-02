import { getApps, initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const cfg = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(cfg);
const db = getFirestore(app, cfg.firestoreDatabaseId);

const TABLES = ['VIP', 'A', 'B', 'C', 'D', 'E'];

async function run() {
  const q = await getDocs(collection(db, 'rotationAssignments'));
  const docs = q.docs.map(d => d.data());
  let added = 0;
  for (const table of TABLES) {
    const id = `rot0-${table}`;
    if (!docs.find(d => d.id === id)) {
      await setDoc(doc(db, 'rotationAssignments', id), {
        id,
        rotationNumber: 0,
        tableId: table,
        castId1: null,
        castId2: null,
        castId3: null,
        updatedAt: new Date()
      });
      added++;
    }
  }
  console.log('Added ' + added + ' rotation 0 assignments.');
  process.exit(0);
}
run();
