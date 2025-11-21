const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// --- MongoDB Setup ---
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- Vault Schema ---
const vaultSchema = new mongoose.Schema({
    id: Number,
    name: String,
    created: { type: Date, default: Date.now },
});
const Vault = mongoose.model('Vault', vaultSchema);

// --- Utility: Auto Backup ---
const backupVault = async () => {
    const records = await Vault.find({});
    const backupsDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir);

    const backupFile = path.join(backupsDir, `backup_${new Date().toISOString().replace(/:/g,'-')}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(records, null, 2));
    console.log(`Backup created: ${backupFile}`);
};

// --- Routes ---

// Get record by ID
app.get('/todo/:id', async (req, res) => {
    try {
        const record = await Vault.findOne({ id: req.params.id });
        if (!record) return res.status(404).json({ message: "Record not found" });
        res.json(record);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Search Records
app.get('/search', async (req, res) => {
    const keyword = req.query.q;
    if (!keyword) return res.status(400).json({ message: "Query param 'q' is required" });

    const results = await Vault.find({
        $or: [
            { name: { $regex: keyword, $options: "i" } },
            { id: Number(keyword) }
        ]
    });

    if (results.length === 0) return res.json({ message: "No records found." });
    res.json(results);
});

// Sort Records
app.get('/sort', async (req, res) => {
    const { field, order } = req.query;
    if (!field || !['name','created'].includes(field)) return res.status(400).json({ message: "Invalid field" });
    const sortOrder = order === 'desc' ? -1 : 1;

    const records = await Vault.find({}).sort({ [field]: sortOrder });
    res.json(records);
});

// Export Vault
app.get('/export', async (req, res) => {
    const records = await Vault.find({});
    const filePath = path.join(__dirname, 'export.txt');

    const header = `Export Date: ${new Date().toISOString()}\nTotal Records: ${records.length}\nFile: export.txt\n\n`;
    const content = records.map(r => `ID: ${r.id} | Name: ${r.name} | Created: ${r.created}`).join('\n');

    fs.writeFileSync(filePath, header + content);
    res.json({ message: 'Data exported successfully to export.txt' });
});

// Add Record (example endpoint)
app.post('/vault', async (req, res) => {
    const { id, name } = req.body;
    const newRecord = new Vault({ id, name });
    await newRecord.save();
    await backupVault(); // auto backup
    res.json(newRecord);
});

// Delete Record
app.delete('/vault/:id', async (req, res) => {
    const record = await Vault.findOneAndDelete({ id: req.params.id });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    await backupVault(); // auto backup
    res.json({ message: 'Deleted', record });
});

// Vault Statistics
app.get('/stats', async (req, res) => {
    const records = await Vault.find({});
    if (records.length === 0) return res.json({ message: "No records in vault" });

    const total = records.length;
    const lastModified = records.reduce((a,b) => a.created > b.created ? a : b).created;
    const longestName = records.reduce((a,b) => a.name.length > b.name.length ? a : b).name;
    const earliest = records.reduce((a,b) => a.created < b.created ? a : b).created;
    const latest = records.reduce((a,b) => a.created > b.created ? a : b).created;

    res.json({
        totalRecords: total,
        lastModified,
        longestName,
        earliest,
        latest
    });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

