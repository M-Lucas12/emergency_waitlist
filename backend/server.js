// server.js - Node.js server for the Hospital Triage App (PostgreSQL version)

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const pool = require('./db');     // <-- use PostgreSQL pool

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// --- Helpers for priority logic (same rules as before) ---
function calculatePriorityId(pain_level) {
    if (pain_level >= 8) return 1;  // Critical
    if (pain_level >= 5) return 2;  // High
    if (pain_level >= 3) return 3;  // Medium
    return 4;                       // Low
}

// --- API ROUTES (now using PostgreSQL) ---

// Get all patients
app.get('/api/patients', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT
        patient_id,
        code,
        name,
        injury_type,
        pain_level,
        arrival_time,
        priority_id
      FROM patient
      ORDER BY arrival_time;
    `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching patients:', err);
        res.status(500).json({ error: 'Database error fetching patients' });
    }
});

// Add new patient
app.post('/api/patients', async (req, res) => {
    try {
        const { code, name, injury_type, pain_level } = req.body;

        if (!code || !name || !injury_type || pain_level == null) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const pain = parseInt(pain_level, 10);
        const priority_id = calculatePriorityId(pain);

        // Insert into patient table
        const insertPatientQuery = `
      INSERT INTO patient
        (code, name, injury_type, pain_level, arrival_time, priority_id)
      VALUES
        ($1, $2, $3, $4, NOW(), $5)
      RETURNING patient_id, code, name, injury_type, pain_level, arrival_time, priority_id;
    `;

        const patientResult = await pool.query(insertPatientQuery, [
            code.toUpperCase(),
            name,
            injury_type,
            pain,
            priority_id
        ]);

        const newPatient = patientResult.rows[0];

        // Log action in action_logs table
        const insertLogQuery = `
      INSERT INTO action_logs
        (patient_id, action_type, old_priority_id, new_priority_id, action_timestamp, notes)
      VALUES
        ($1, 'Add Patient', NULL, $2, NOW(), 'Patient checked in via triage form');
    `;

        await pool.query(insertLogQuery, [newPatient.patient_id, priority_id]);

        res.status(201).json(newPatient);
    } catch (err) {
        console.error('Error adding patient:', err);
        res.status(500).json({ error: 'Database error adding patient' });
    }
});

// Update patient priority
app.put('/api/patients/:id/priority', async (req, res) => {
    try {
        const patientId = parseInt(req.params.id, 10);
        const { new_priority_id, notes } = req.body;

        // Get current patient
        const patientResult = await pool.query(
            'SELECT patient_id, priority_id FROM patient WHERE patient_id = $1',
            [patientId]
        );

        if (patientResult.rowCount === 0) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        const old_priority_id = patientResult.rows[0].priority_id;

        // Update priority
        const updateResult = await pool.query(
            'UPDATE patient SET priority_id = $1 WHERE patient_id = $2 RETURNING *;',
            [new_priority_id, patientId]
        );

        const updatedPatient = updateResult.rows[0];

        // Log action
        const insertLogQuery = `
      INSERT INTO action_logs
        (patient_id, action_type, old_priority_id, new_priority_id, action_timestamp, notes)
      VALUES
        ($1, 'Change Priority', $2, $3, NOW(), $4);
    `;

        await pool.query(insertLogQuery, [
            patientId,
            old_priority_id,
            new_priority_id,
            notes || 'Priority changed by admin'
        ]);

        res.json({
            message: 'Priority updated successfully',
            patient: updatedPatient
        });
    } catch (err) {
        console.error('Error updating priority:', err);
        res.status(500).json({ error: 'Database error updating priority' });
    }
});

// Remove patient
app.delete('/api/patients/:id', async (req, res) => {
    try {
        const patientId = parseInt(req.params.id, 10);
        const { notes } = req.body;

        // Get patient before deleting
        const patientResult = await pool.query(
            'SELECT patient_id, priority_id FROM patient WHERE patient_id = $1',
            [patientId]
        );

        if (patientResult.rowCount === 0) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        const patient = patientResult.rows[0];

        // Delete from patient table
        await pool.query('DELETE FROM patient WHERE patient_id = $1', [patientId]);

        // Log removal
        const insertLogQuery = `
      INSERT INTO action_logs
        (patient_id, action_type, old_priority_id, new_priority_id, action_timestamp, notes)
      VALUES
        ($1, 'Remove Patient', $2, NULL, NOW(), $3);
    `;

        await pool.query(insertLogQuery, [
            patientId,
            patient.priority_id,
            notes || 'Patient removed from waitlist'
        ]);

        res.json({ message: 'Patient removed successfully' });
    } catch (err) {
        console.error('Error removing patient:', err);
        res.status(500).json({ error: 'Database error removing patient' });
    }
});

// Get action logs (simple version)
app.get('/api/action-logs', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT
        action_id,
        patient_id,
        action_type,
        old_priority_id,
        new_priority_id,
        action_timestamp,
        notes
      FROM action_logs
      ORDER BY action_timestamp DESC;
    `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching action logs:', err);
        res.status(500).json({ error: 'Database error fetching action logs' });
    }
});

// Get priorities
app.get('/api/priorities', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT priority_id, level_name, description, color_code, estimated_wait_time
      FROM priorities
      ORDER BY priority_id;
    `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching priorities:', err);
        res.status(500).json({ error: 'Database error fetching priorities' });
    }
});

// Serve the main application (always send index from /public)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access the application at: http://localhost:${PORT}`);
});