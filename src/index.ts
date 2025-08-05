// src/index.ts
import express from 'express';
import cors from 'cors';
import mongoose, { Schema, model } from 'mongoose';

const app = express();
const PORT = 3001;

app.use(cors({
  origin: [
    'https://medpres-frontend.netlify.app',
    'http://localhost:5173'
  ],
  credentials: true,
}));
app.use(express.json());

// MongoDB connection
const MONGO_URI = 'mongodb+srv://medpres:medpres@cluster0.rzmspwa.mongodb.net/medpress?retryWrites=true&w=majority';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Doctor schema/model
const DoctorSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  specialization: String,
  licenseNumber: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});
const Doctor = model('Doctor', DoctorSchema);

// Pharmacist schema/model
const PharmacistSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  licenseNumber: { type: String, unique: true },
  pharmacyName: String,
  createdAt: { type: Date, default: Date.now }
});
const Pharmacist = model('Pharmacist', PharmacistSchema);

// Patient schema/model
const PatientSchema = new Schema({
  name: String,
  age: Number,
  gender: String,
  conditions: [String],
  lastVisit: String,
  prescriptionCount: { type: Number, default: 0 }
});
const Patient = model('Patient', PatientSchema);

// Prescription schema/model
const PrescriptionSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient' },
  doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor' },
  date: String,
  medications: [Schema.Types.Mixed],
  instructions: String,
  prescriptionNumber: { type: String, unique: true },
  status: String
});
const Prescription = model('Prescription', PrescriptionSchema);

// Verification schema/model
const VerificationSchema = new Schema({
  prescriptionNumber: String,
  verifiedBy: String,
  pharmacistId: String,
  doctorId: String,
  verificationDate: String,
  status: String,
  notes: String
});
const Verification = model('Verification', VerificationSchema);

// Doctor registration
app.post('/api/doctors/register', async (req, res) => {
  const { name, email, password, specialization, licenseNumber } = req.body;
  console.log('Doctor registration attempt:', { name, email, specialization, licenseNumber });
  try {
    const doctorExists = await Doctor.findOne({ email });
    const pharmacistExists = await Pharmacist.findOne({ email });
    if (doctorExists || pharmacistExists) {
      console.log('Registration failed: Email already registered');
      return res.status(400).json({ error: 'Email already registered' });
    }
    const doctor = new Doctor({ name, email, password, specialization, licenseNumber });
    await doctor.save();
    console.log('Doctor registered successfully:', email);
    res.status(201).json({ message: 'Doctor registered successfully' });
  } catch (err) {
    console.error('Doctor registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Doctor login
app.post('/api/doctors/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const doctor = await Doctor.findOne({ email, password });
    if (doctor) {
      res.json({
        success: true,
        doctor: {
          id: doctor._id,
          name: doctor.name,
          email: doctor.email,
          specialization: doctor.specialization
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Pharmacist registration
app.post('/api/pharmacists/register', async (req, res) => {
  const { name, email, password, licenseNumber, pharmacyName } = req.body;
  console.log('Pharmacist registration attempt:', { name, email, licenseNumber, pharmacyName });
  try {
    const pharmacistExists = await Pharmacist.findOne({ email });
    const doctorExists = await Doctor.findOne({ email });
    if (pharmacistExists || doctorExists) {
      console.log('Registration failed: Email already registered');
      return res.status(400).json({ error: 'Email already registered' });
    }
    const pharmacist = new Pharmacist({ name, email, password, licenseNumber, pharmacyName });
    await pharmacist.save();
    console.log('Pharmacist registered successfully:', email);
    res.status(201).json({ message: 'Pharmacist registered successfully' });
  } catch (err) {
    console.error('Pharmacist registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Pharmacist login
app.post('/api/pharmacists/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Pharmacist login attempt:', { email, password });
  try {
    const pharmacist = await Pharmacist.findOne({ email, password });
    if (pharmacist) {
      console.log('Pharmacist login successful:', email);
      res.json({
        success: true,
        pharmacist: {
          id: pharmacist._id,
          name: pharmacist.name,
          email: pharmacist.email,
          pharmacyName: pharmacist.pharmacyName
        }
      });
    } else {
      console.log('Pharmacist login failed - no match found for:', email);
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Pharmacist login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Patients endpoints
app.get('/api/patients', async (req, res) => {
  const patients = await Patient.find();
  res.json(patients);
});

app.post('/api/patients', async (req, res) => {
  const { name, age, gender, conditions, lastVisit } = req.body;
  const condArr = Array.isArray(conditions) ? conditions : (conditions ? conditions.split(',').filter(Boolean) : []);
  const patient = new Patient({ name, age, gender, conditions: condArr, lastVisit });
  console.log('Patient creation attempt:', patient);
  try {
    await patient.save();
    console.log('Patient saved:', patient);
    res.status(201).json(patient);
  } catch (err) {
    console.error('Patient save error:', err);
    res.status(500).json({ error: 'Failed to save patient' });
  }
});

// Prescriptions endpoints
app.get('/api/prescriptions', async (req, res) => {
  const prescriptions = await Prescription.find().populate('doctorId', 'name email specialization licenseNumber').lean();
  // Transform to include doctorName and doctorLicense
  const transformed = prescriptions.map(p => ({
    ...p,
    doctorName: (p.doctorId as any)?.name || '',
    doctorLicense: (p.doctorId as any)?.licenseNumber || '',
    doctorSpecialization: (p.doctorId as any)?.specialization || '',
  }));
  res.json(transformed);
});

app.post('/api/prescriptions', async (req, res) => {
  const { patientId, doctorId, date, medications, instructions } = req.body;
  const prescriptionNumber = `RX-${Date.now()}-${patientId}`;
  const prescription = new Prescription({ patientId, doctorId, date, medications, instructions, prescriptionNumber, status: 'completed' });
  console.log('Prescription creation attempt:', prescription);
  try {
    await prescription.save();
    await Patient.findByIdAndUpdate(patientId, { $inc: { prescriptionCount: 1 } });
    console.log('Prescription saved:', prescription);
    res.status(201).json(prescription);
  } catch (err) {
    console.error('Prescription save error:', err);
    res.status(500).json({ error: 'Failed to save prescription' });
  }
});

// Get prescriptions by doctorId
app.get('/api/prescriptions/doctor/:doctorId', async (req, res) => {
  const { doctorId } = req.params;
  const prescriptions = await Prescription.find({ doctorId }).populate('doctorId', 'name email specialization');
  res.json(prescriptions);
});

// Get prescriptions by patientId
app.get('/api/prescriptions/patient/:patientId', async (req, res) => {
  const { patientId } = req.params;
  const prescriptions = await Prescription.find({ patientId }).populate('doctorId', 'name email specialization licenseNumber');
  res.json(prescriptions);
});

// Verifications endpoints
app.get('/api/verifications', async (req, res) => {
  const { prescriptionNumber } = req.query;
  let verifications;
  if (prescriptionNumber) {
    verifications = await Verification.find({ prescriptionNumber });
  } else {
    verifications = await Verification.find();
  }
  res.json(verifications);
});

app.post('/api/verifications', async (req, res) => {
  const { prescriptionNumber, verifiedBy, pharmacistId, doctorId, verificationDate, status, notes } = req.body;
  const verification = new Verification({ 
    prescriptionNumber, 
    verifiedBy, 
    pharmacistId, 
    doctorId, 
    verificationDate, 
    status, 
    notes 
  });
  console.log('Verification creation attempt:', verification);
  try {
    await verification.save();
    console.log('Verification saved:', verification);
    res.status(201).json(verification);
  } catch (err) {
    console.error('Verification save error:', err);
    res.status(500).json({ error: 'Failed to save verification' });
  }
});

// TEMPORARY: Delete all data from all collections (for development only)
app.delete('/api/dev/clear-all', async (req, res) => {
  try {
    await Promise.all([
      Doctor.deleteMany({}),
      Pharmacist.deleteMany({}),
      Patient.deleteMany({}),
      Prescription.deleteMany({}),
      Verification.deleteMany({}),
    ]);
    res.json({ message: 'All data deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete all data' });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}/api`);
});

