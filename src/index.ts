// src/index.ts
import express from 'express';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join } from 'path';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// LowDB setup
const file = join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low<any>(adapter, { patients: [], prescriptions: [], verifications: [] });

// Initialize DB with default structure if empty
async function initDB() {
  await db.read();
  db.data ||= { patients: [], prescriptions: [], verifications: [] };
  db.data.verifications ||= [];
  await db.write();
}

initDB();

// Patients endpoints
app.get('/api/patients', async (req, res) => {
  await db.read();
  const patients = db.data.patients.map((p: any) => ({
    ...p,
    conditions: Array.isArray(p.conditions) ? p.conditions : (p.conditions ? p.conditions.split(',').filter(Boolean) : [])
  }));
  res.json(patients);
});

app.post('/api/patients', async (req, res) => {
  await db.read();
  const { name, age, gender, conditions, lastVisit } = req.body;
  const condArr = Array.isArray(conditions) ? conditions : (conditions ? conditions.split(',').filter(Boolean) : []);
  const newPatient = {
    id: Date.now(),
    name,
    age,
    gender,
    conditions: condArr,
    lastVisit,
    prescriptionCount: 0
  };
  db.data.patients.push(newPatient);
  await db.write();
  res.status(201).json(newPatient);
});

// Prescriptions endpoints
app.get('/api/prescriptions', async (req, res) => {
  await db.read();
  res.json(db.data.prescriptions);
});

app.post('/api/prescriptions', async (req, res) => {
  await db.read();
  const { patientId, date, medications, instructions } = req.body;
  const prescriptionNumber = `RX-${Date.now()}-${patientId}`;
  const newPrescription = {
    id: Date.now(),
    patientId,
    date,
    medications,
    instructions,
    prescriptionNumber,
    status: 'completed'
  };
  db.data.prescriptions.push(newPrescription);
  // Increment prescription count for patient
  const patient = db.data.patients.find((p: any) => p.id === patientId);
  if (patient) {
    patient.prescriptionCount = (patient.prescriptionCount || 0) + 1;
  }
  await db.write();
  res.status(201).json(newPrescription);
});

// Verifications endpoints
app.get('/api/verifications', async (req, res) => {
  await db.read();
  const { prescriptionNumber } = req.query;
  let verifications = db.data.verifications;
  if (prescriptionNumber) {
    verifications = verifications.filter((v: any) => v.prescriptionNumber === prescriptionNumber);
  }
  res.json(verifications);
});

app.post('/api/verifications', async (req, res) => {
  await db.read();
  const { prescriptionNumber, verifiedBy, verificationDate, status, notes } = req.body;
  const newVerification = {
    id: Date.now(),
    prescriptionNumber,
    verifiedBy,
    verificationDate,
    status,
    notes
  };
  db.data.verifications.push(newVerification);
  await db.write();
  res.status(201).json(newVerification);
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}/api`);
});

