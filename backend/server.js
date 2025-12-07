// server.js - Basic Node.js server for the Hospital Triage App

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// In-memory database for demo purposes
let patients = [];
let priorities = [
  { id: 1, level_name: 'Critical', description: 'Immediate attention required', color_code: '#B10000', estimated_wait_time: 0 },
  { id: 2, level_name: 'High', description: 'Attention within 15 minutes', color_code: '#FF4444', estimated_wait_time: 15 },
  { id: 3, level_name: 'Medium', description: 'Attention within 30 minutes', color_code: '#FFD700', estimated_wait_time: 30 },
  { id: 4, level_name: 'Low', description: 'Attention within 60 minutes', color_code: '#3CB371', estimated_wait_time: 60 }
];
let actionLogs = [];

// API Routes

// Get all patients
app.get('/api/patients', (req, res) => {
  res.json(patients);
});

// Add new patient
app.post('/api/patients', (req, res) => {
  const { code, name, injury_type, pain_level } = req.body;
  
  // Validate required fields
  if (!code || !name || !injury_type || !pain_level) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Calculate priority based on pain level
  let priority_id;
  if (pain_level >= 8) {
    priority_id = 1; // Critical
  } else if (pain_level >= 5) {
    priority_id = 2; // High
  } else if (pain_level >= 3) {
    priority_id = 3; // Medium
  } else {
    priority_id = 4; // Low
  }
  
  const newPatient = {
    patient_id: patients.length + 1,
    code: code.toUpperCase(),
    name,
    injury_type,
    pain_level,
    arrival_time: new Date().toISOString(),
    priority_id
  };
  
  patients.push(newPatient);
  
  // Log the action
  const actionLog = {
    action_id: actionLogs.length + 1,
    patient_id: newPatient.patient_id,
    action_type: 'Add Patient',
    old_priority_id: null,
    new_priority_id: priority_id,
    action_timestamp: new Date().toISOString(),
    notes: 'Patient checked in via triage form'
  };
  
  actionLogs.push(actionLog);
  
  res.status(201).json(newPatient);
});

// Update patient priority
app.put('/api/patients/:id/priority', (req, res) => {
  const patientId = parseInt(req.params.id);
  const { new_priority_id, notes } = req.body;
  
  const patient = patients.find(p => p.patient_id === patientId);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  
  const old_priority_id = patient.priority_id;
  patient.priority_id = new_priority_id;
  
  // Log the action
  const actionLog = {
    action_id: actionLogs.length + 1,
    patient_id: patientId,
    action_type: 'Change Priority',
    old_priority_id,
    new_priority_id,
    action_timestamp: new Date().toISOString(),
    notes: notes || 'Priority changed by admin'
  };
  
  actionLogs.push(actionLog);
  
  res.json({ message: 'Priority updated successfully', patient, actionLog });
});

// Remove patient
app.delete('/api/patients/:id', (req, res) => {
  const patientId = parseInt(req.params.id);
  const { notes } = req.body;
  
  const patientIndex = patients.findIndex(p => p.patient_id === patientId);
  if (patientIndex === -1) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  
  const patient = patients[patientIndex];
  patients.splice(patientIndex, 1);
  
  // Log the action
  const actionLog = {
    action_id: actionLogs.length + 1,
    patient_id: patientId,
    action_type: 'Remove Patient',
    old_priority_id: patient.priority_id,
    new_priority_id: null,
    action_timestamp: new Date().toISOString(),
    notes: notes || 'Patient removed from waitlist'
  };
  
  actionLogs.push(actionLog);
  
  res.json({ message: 'Patient removed successfully', actionLog });
});

// Get action logs
app.get('/api/action-logs', (req, res) => {
  res.json(actionLogs);
});

// Get priorities
app.get('/api/priorities', (req, res) => {
  res.json(priorities);
});

// Serve the main application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the application at: http://localhost:${PORT}`);
});