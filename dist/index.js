"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importStar(require("mongoose"));
const app = (0, express_1.default)();
const PORT = 3001;
app.use((0, cors_1.default)({
    origin: [
        'https://medpres-frontend.netlify.app',
        'http://localhost:5173'
    ],
    credentials: true,
}));
app.use(express_1.default.json());
// MongoDB connection
const MONGO_URI = 'mongodb+srv://medpres:medpres@cluster0.rzmspwa.mongodb.net/medpress?retryWrites=true&w=majority';
mongoose_1.default.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
// Doctor schema/model
const DoctorSchema = new mongoose_1.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    specialization: String,
    licenseNumber: { type: String, unique: true },
    createdAt: { type: Date, default: Date.now }
});
const Doctor = (0, mongoose_1.model)('Doctor', DoctorSchema);
// Pharmacist schema/model
const PharmacistSchema = new mongoose_1.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    licenseNumber: { type: String, unique: true },
    pharmacyName: String,
    createdAt: { type: Date, default: Date.now }
});
const Pharmacist = (0, mongoose_1.model)('Pharmacist', PharmacistSchema);
// Patient schema/model
const PatientSchema = new mongoose_1.Schema({
    name: String,
    age: Number,
    gender: String,
    conditions: [String],
    lastVisit: String,
    prescriptionCount: { type: Number, default: 0 }
});
const Patient = (0, mongoose_1.model)('Patient', PatientSchema);
// Prescription schema/model
const PrescriptionSchema = new mongoose_1.Schema({
    patientId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Patient' },
    doctorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Doctor' },
    date: String,
    medications: [mongoose_1.Schema.Types.Mixed],
    instructions: String,
    prescriptionNumber: { type: String, unique: true },
    status: String
});
const Prescription = (0, mongoose_1.model)('Prescription', PrescriptionSchema);
// Verification schema/model
const VerificationSchema = new mongoose_1.Schema({
    prescriptionNumber: String,
    verifiedBy: String,
    pharmacistId: String,
    doctorId: String,
    verificationDate: String,
    status: String,
    notes: String
});
const Verification = (0, mongoose_1.model)('Verification', VerificationSchema);
// Doctor registration
app.post('/api/doctors/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, specialization, licenseNumber } = req.body;
    console.log('Doctor registration attempt:', { name, email, specialization, licenseNumber });
    try {
        const doctorExists = yield Doctor.findOne({ email });
        const pharmacistExists = yield Pharmacist.findOne({ email });
        if (doctorExists || pharmacistExists) {
            console.log('Registration failed: Email already registered');
            return res.status(400).json({ error: 'Email already registered' });
        }
        const doctor = new Doctor({ name, email, password, specialization, licenseNumber });
        yield doctor.save();
        console.log('Doctor registered successfully:', email);
        res.status(201).json({ message: 'Doctor registered successfully' });
    }
    catch (err) {
        console.error('Doctor registration error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
}));
// Doctor login
app.post('/api/doctors/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const doctor = yield Doctor.findOne({ email, password });
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
        }
        else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    }
    catch (err) {
        res.status(500).json({ error: 'Login failed' });
    }
}));
// Pharmacist registration
app.post('/api/pharmacists/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, licenseNumber, pharmacyName } = req.body;
    console.log('Pharmacist registration attempt:', { name, email, licenseNumber, pharmacyName });
    try {
        const pharmacistExists = yield Pharmacist.findOne({ email });
        const doctorExists = yield Doctor.findOne({ email });
        if (pharmacistExists || doctorExists) {
            console.log('Registration failed: Email already registered');
            return res.status(400).json({ error: 'Email already registered' });
        }
        const pharmacist = new Pharmacist({ name, email, password, licenseNumber, pharmacyName });
        yield pharmacist.save();
        console.log('Pharmacist registered successfully:', email);
        res.status(201).json({ message: 'Pharmacist registered successfully' });
    }
    catch (err) {
        console.error('Pharmacist registration error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
}));
// Pharmacist login
app.post('/api/pharmacists/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    console.log('Pharmacist login attempt:', { email, password });
    try {
        const pharmacist = yield Pharmacist.findOne({ email, password });
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
        }
        else {
            console.log('Pharmacist login failed - no match found for:', email);
            res.status(401).json({ error: 'Invalid credentials' });
        }
    }
    catch (err) {
        console.error('Pharmacist login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
}));
// Patients endpoints
app.get('/api/patients', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const patients = yield Patient.find();
    res.json(patients);
}));
app.post('/api/patients', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, age, gender, conditions, lastVisit } = req.body;
    const condArr = Array.isArray(conditions) ? conditions : (conditions ? conditions.split(',').filter(Boolean) : []);
    const patient = new Patient({ name, age, gender, conditions: condArr, lastVisit });
    console.log('Patient creation attempt:', patient);
    try {
        yield patient.save();
        console.log('Patient saved:', patient);
        res.status(201).json(patient);
    }
    catch (err) {
        console.error('Patient save error:', err);
        res.status(500).json({ error: 'Failed to save patient' });
    }
}));
// Prescriptions endpoints
app.get('/api/prescriptions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prescriptions = yield Prescription.find().populate('doctorId', 'name email specialization licenseNumber').lean();
    // Transform to include doctorName and doctorLicense
    const transformed = prescriptions.map(p => {
        var _a, _b, _c;
        return (Object.assign(Object.assign({}, p), { doctorName: ((_a = p.doctorId) === null || _a === void 0 ? void 0 : _a.name) || '', doctorLicense: ((_b = p.doctorId) === null || _b === void 0 ? void 0 : _b.licenseNumber) || '', doctorSpecialization: ((_c = p.doctorId) === null || _c === void 0 ? void 0 : _c.specialization) || '' }));
    });
    res.json(transformed);
}));
app.post('/api/prescriptions', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { patientId, doctorId, date, medications, instructions } = req.body;
    const prescriptionNumber = `RX-${Date.now()}-${patientId}`;
    const prescription = new Prescription({ patientId, doctorId, date, medications, instructions, prescriptionNumber, status: 'completed' });
    console.log('Prescription creation attempt:', prescription);
    try {
        yield prescription.save();
        yield Patient.findByIdAndUpdate(patientId, { $inc: { prescriptionCount: 1 } });
        console.log('Prescription saved:', prescription);
        res.status(201).json(prescription);
    }
    catch (err) {
        console.error('Prescription save error:', err);
        res.status(500).json({ error: 'Failed to save prescription' });
    }
}));
// Get prescriptions by doctorId
app.get('/api/prescriptions/doctor/:doctorId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { doctorId } = req.params;
    const prescriptions = yield Prescription.find({ doctorId }).populate('doctorId', 'name email specialization');
    res.json(prescriptions);
}));
// Get prescriptions by patientId
app.get('/api/prescriptions/patient/:patientId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { patientId } = req.params;
    const prescriptions = yield Prescription.find({ patientId }).populate('doctorId', 'name email specialization licenseNumber');
    res.json(prescriptions);
}));
// Verifications endpoints
app.get('/api/verifications', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { prescriptionNumber } = req.query;
    let verifications;
    if (prescriptionNumber) {
        verifications = yield Verification.find({ prescriptionNumber });
    }
    else {
        verifications = yield Verification.find();
    }
    res.json(verifications);
}));
app.post('/api/verifications', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield verification.save();
        console.log('Verification saved:', verification);
        res.status(201).json(verification);
    }
    catch (err) {
        console.error('Verification save error:', err);
        res.status(500).json({ error: 'Failed to save verification' });
    }
}));
// TEMPORARY: Delete all data from all collections (for development only)
app.delete('/api/dev/clear-all', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Promise.all([
            Doctor.deleteMany({}),
            Pharmacist.deleteMany({}),
            Patient.deleteMany({}),
            Prescription.deleteMany({}),
            Verification.deleteMany({}),
        ]);
        res.json({ message: 'All data deleted' });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to delete all data' });
    }
}));
app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}/api`);
});
