// Add this to your backend/src/index.ts (for development only!)
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