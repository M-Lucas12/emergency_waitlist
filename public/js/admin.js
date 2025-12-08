// admin.js - Fully functional Admin Dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Initialize data storage
    initializeData();
    
    // DOM Elements
    const waitlistBody = document.getElementById('waitlistBody');
    const emptyState = document.getElementById('emptyState');
    const actionLog = document.getElementById('actionLog');
    const emptyLog = document.getElementById('emptyLog');
    const totalPatientsElement = document.getElementById('totalPatients');
    const patientDetailBody = document.getElementById('patientDetailBody');
    
    // Buttons
    const refreshBtn = document.getElementById('refreshBtn');
    const addPatientBtn = document.getElementById('addPatientBtn');
    const clearLogBtn = document.getElementById('clearLogBtn');
    const increasePriorityBtn = document.getElementById('increasePriorityBtn');
    const decreasePriorityBtn = document.getElementById('decreasePriorityBtn');
    const removePatientBtn = document.getElementById('removePatientBtn');
    
    // Modal Elements
    const addPatientModal = document.getElementById('addPatientModal');
    const confirmRemoveModal = document.getElementById('confirmRemoveModal');
    const closeAddModal = document.getElementById('closeAddModal');
    const cancelAddBtn = document.getElementById('cancelAddBtn');
    const submitAddBtn = document.getElementById('submitAddBtn');
    const closeRemoveModal = document.getElementById('closeRemoveModal');
    const cancelRemoveBtn = document.getElementById('cancelRemoveBtn');
    const confirmRemoveBtn = document.getElementById('confirmRemoveBtn');
    
    // Form Elements
    const modalPainLevel = document.getElementById('modalPainLevel');
    const modalPainValue = document.getElementById('modalPainValue');
    const addPatientForm = document.getElementById('addPatientForm');
    
    // Current selected patient
    let selectedPatientId = null;
    
    // Priority levels
    const priorityLevels = {
        1: { id: 1, name: 'Critical', color: 'critical', waitTime: 'Immediate', order: 1 },
        2: { id: 2, name: 'High', color: 'high', waitTime: '15 min', order: 2 },
        3: { id: 3, name: 'Medium', color: 'medium', waitTime: '30 min', order: 3 },
        4: { id: 4, name: 'Low', color: 'low', waitTime: '60 min', order: 4 }
    };
    
    // Initialize application
    function initializeData() {
        // Check if data exists in localStorage
        if (!localStorage.getItem('patients')) {
            // Create initial demo data
            const initialPatients = [
                {
                    id: 1,
                    code: 'ABC',
                    name: 'John Smith',
                    injuryType: 'Chest Pain',
                    painLevel: 8,
                    priorityId: 1,
                    arrivalTime: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutes ago
                    status: 'waiting',
                    notes: 'Patient complaining of severe chest pain'
                },
                {
                    id: 2,
                    code: 'XYZ',
                    name: 'Jane Doe',
                    injuryType: 'Arm Injury',
                    painLevel: 5,
                    priorityId: 3,
                    arrivalTime: new Date(Date.now() - 15 * 60000).toISOString(), // 15 minutes ago
                    status: 'waiting',
                    notes: 'Fractured arm from fall'
                },
                {
                    id: 3,
                    code: 'DEF',
                    name: 'Robert Johnson',
                    injuryType: 'Headache',
                    painLevel: 3,
                    priorityId: 4,
                    arrivalTime: new Date(Date.now() - 5 * 60000).toISOString(), // 5 minutes ago
                    status: 'waiting',
                    notes: 'Persistent headache for 2 days'
                }
            ];
            
            localStorage.setItem('patients', JSON.stringify(initialPatients));
            localStorage.setItem('nextPatientId', '4');
        }
        
        if (!localStorage.getItem('actionLogs')) {
            const initialLogs = [
                {
                    id: 1,
                    patientId: 1,
                    actionType: 'Add Patient',
                    oldPriorityId: null,
                    newPriorityId: 1,
                    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
                    notes: 'Patient checked in with severe chest pain'
                },
                {
                    id: 2,
                    patientId: 2,
                    actionType: 'Add Patient',
                    oldPriorityId: null,
                    newPriorityId: 3,
                    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
                    notes: 'Patient with fractured arm'
                },
                {
                    id: 3,
                    patientId: 3,
                    actionType: 'Add Patient',
                    oldPriorityId: null,
                    newPriorityId: 4,
                    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
                    notes: 'Patient with persistent headache'
                }
            ];
            
            localStorage.setItem('actionLogs', JSON.stringify(initialLogs));
            localStorage.setItem('nextLogId', '4');
        }
    }
    
    // Get data from localStorage
    function getPatients() {
        return JSON.parse(localStorage.getItem('patients') || '[]');
    }
    
    function getActionLogs() {
        return JSON.parse(localStorage.getItem('actionLogs') || '[]');
    }
    
    // Save data to localStorage
    function savePatients(patients) {
        localStorage.setItem('patients', JSON.stringify(patients));
    }
    
    function saveActionLogs(logs) {
        localStorage.setItem('actionLogs', JSON.stringify(logs));
    }
    
    // Generate next ID
    function getNextPatientId() {
        const nextId = parseInt(localStorage.getItem('nextPatientId') || '1');
        localStorage.setItem('nextPatientId', (nextId + 1).toString());
        return nextId;
    }
    
    function getNextLogId() {
        const nextId = parseInt(localStorage.getItem('nextLogId') || '1');
        localStorage.setItem('nextLogId', (nextId + 1).toString());
        return nextId;
    }
    
    // Render patient table
    function renderPatients() {
        const patients = getPatients();
        
        if (patients.length === 0) {
            waitlistBody.innerHTML = '';
            emptyState.style.display = 'block';
            totalPatientsElement.textContent = '0';
            patientDetailBody.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-circle"></i>
                    <h3>No Patient Selected</h3>
                    <p>Select a patient from the waitlist to view details</p>
                </div>
            `;
            selectedPatientId = null;
            return;
        }
        
        emptyState.style.display = 'none';
        totalPatientsElement.textContent = patients.length;
        
        // Sort patients by priority (critical first) and then by arrival time
        const sortedPatients = [...patients].sort((a, b) => {
            const priorityDiff = a.priorityId - b.priorityId;
            if (priorityDiff !== 0) return priorityDiff;
            return new Date(a.arrivalTime) - new Date(b.arrivalTime);
        });
        
        let tableHTML = '';
        
        sortedPatients.forEach(patient => {
            const priority = priorityLevels[patient.priorityId];
            const arrivalTime = new Date(patient.arrivalTime);
            const formattedTime = arrivalTime.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            const isSelected = patient.id === selectedPatientId;
            
            tableHTML += `
                <tr data-patient-id="${patient.id}" class="${isSelected ? 'selected' : ''}">
                    <td class="detail-code">${patient.code}</td>
                    <td>${patient.name}</td>
                    <td>${patient.injuryType}</td>
                    <td>${patient.painLevel}/10</td>
                    <td><span class="priority-badge priority-${priority.color}">${priority.name}</span></td>
                    <td class="wait-time-indicator wait-time-${priority.color}">${priority.waitTime}</td>
                    <td>${formattedTime}</td>
                    <td class="action-buttons">
                        <button class="btn btn-sm btn-warning increase-attention-btn" title="Increase Attention">
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <button class="btn btn-sm btn-outline decrease-attention-btn" title="Decrease Attention">
                            <i class="fas fa-arrow-down"></i>
                        </button>
                        <button class="btn btn-sm btn-danger remove-patient-btn" title="Remove Patient">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        waitlistBody.innerHTML = tableHTML;
        
        // Add event listeners to table rows and buttons
        document.querySelectorAll('.waitlist-table tbody tr').forEach(row => {
            row.addEventListener('click', function(e) {
                if (!e.target.closest('.action-buttons')) {
                    const patientId = parseInt(this.dataset.patientId);
                    selectPatient(patientId);
                }
            });
            
            // Add event listeners to action buttons
            const increaseBtn = row.querySelector('.increase-attention-btn');
            const decreaseBtn = row.querySelector('.decrease-attention-btn');
            const removeBtn = row.querySelector('.remove-patient-btn');
            
            increaseBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const patientId = parseInt(row.dataset.patientId);
                changePatientPriority(patientId, 'increase');
            });
            
            decreaseBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const patientId = parseInt(row.dataset.patientId);
                changePatientPriority(patientId, 'decrease');
            });
            
            removeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const patientId = parseInt(row.dataset.patientId);
                showRemoveConfirmation(patientId);
            });
        });
    }
    
    // Render action logs
    function renderActionLogs() {
        const logs = getActionLogs();
        
        if (logs.length === 0) {
            actionLog.innerHTML = '';
            emptyLog.style.display = 'block';
            return;
        }
        
        emptyLog.style.display = 'none';
        
        // Sort logs by timestamp (newest first)
        const sortedLogs = [...logs].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
        
        let logsHTML = '';
        
        sortedLogs.forEach(log => {
            const timestamp = new Date(log.timestamp);
            const formattedTime = timestamp.toLocaleString();
            
            let actionText = '';
            let patient = getPatients().find(p => p.id === log.patientId);
            let patientInfo = patient ? `${patient.code} (${patient.name})` : 'Unknown Patient';
            
            switch (log.actionType) {
                case 'Add Patient':
                    actionText = `Added patient ${patientInfo}`;
                    break;
                case 'Remove Patient':
                    actionText = `Removed patient ${patientInfo}`;
                    break;
                case 'Change Priority':
                    const oldPriority = log.oldPriorityId ? priorityLevels[log.oldPriorityId].name : 'None';
                    const newPriority = log.newPriorityId ? priorityLevels[log.newPriorityId].name : 'None';
                    actionText = `Changed priority for ${patientInfo} from ${oldPriority} to ${newPriority}`;
                    break;
                default:
                    actionText = `${log.actionType} for ${patientInfo}`;
            }
            
            logsHTML += `
                <div class="log-entry">
                    <div class="log-timestamp">${formattedTime}</div>
                    <div class="log-action">${actionText}</div>
                    ${log.notes ? `<div class="log-notes">${log.notes}</div>` : ''}
                </div>
            `;
        });
        
        actionLog.innerHTML = logsHTML;
    }
    
    // Select a patient
    function selectPatient(patientId) {
        const patients = getPatients();
        const patient = patients.find(p => p.id === patientId);
        
        if (!patient) return;
        
        selectedPatientId = patientId;
        
        // Update table selection
        document.querySelectorAll('.waitlist-table tbody tr').forEach(row => {
            row.classList.remove('selected');
            if (parseInt(row.dataset.patientId) === patientId) {
                row.classList.add('selected');
            }
        });
        
        // Update patient details
        const priority = priorityLevels[patient.priorityId];
        const arrivalTime = new Date(patient.arrivalTime);
        const formattedArrivalTime = arrivalTime.toLocaleString();
        
        patientDetailBody.innerHTML = `
            <div class="detail-group">
                <div class="detail-label">
                    <i class="fas fa-id-card"></i> Patient Code
                </div>
                <div class="detail-value detail-code">${patient.code}</div>
            </div>
            
            <div class="detail-group">
                <div class="detail-label">
                    <i class="fas fa-user"></i> Full Name
                </div>
                <div class="detail-value">${patient.name}</div>
            </div>
            
            <div class="detail-group">
                <div class="detail-label">
                    <i class="fas fa-user-injured"></i> Injury Type
                </div>
                <div class="detail-value">${patient.injuryType}</div>
            </div>
            
            <div class="detail-group">
                <div class="detail-label">
                    <i class="fas fa-tachometer-alt"></i> Pain Level
                </div>
                <div class="detail-value">${patient.painLevel}/10 
                    <span class="priority-badge priority-${priority.color}">${patient.painLevel >= 8 ? 'Severe' : patient.painLevel >= 5 ? 'Moderate' : 'Mild'}</span>
                </div>
            </div>
            
            <div class="detail-group">
                <div class="detail-label">
                    <i class="fas fa-exclamation-triangle"></i> Priority Level
                </div>
                <div class="detail-value">
                    <span class="priority-badge priority-${priority.color}">${priority.name}</span>
                </div>
            </div>
            
            <div class="detail-group">
                <div class="detail-label">
                    <i class="fas fa-clock"></i> Arrival Time
                </div>
                <div class="detail-value">${formattedArrivalTime}</div>
            </div>
            
            <div class="detail-group">
                <div class="detail-label">
                    <i class="fas fa-hourglass-half"></i> Estimated Wait
                </div>
                <div class="detail-value wait-time-indicator wait-time-${priority.color}">${priority.waitTime}</div>
            </div>
            
            <div class="detail-actions">
                <button class="btn btn-warning" id="increasePriorityBtn">
                    <i class="fas fa-arrow-up"></i> Increase Attention
                </button>
                <button class="btn btn-outline" id="decreasePriorityBtn">
                    <i class="fas fa-arrow-down"></i> Decrease Attention
                </button>
                <button class="btn btn-danger" id="removePatientDetailBtn">
                    <i class="fas fa-trash"></i> Remove Patient
                </button>
            </div>
            
            <div class="detail-group">
                <div class="detail-label">
                    <i class="fas fa-sticky-note"></i> Notes
                </div>
                <textarea id="patientNotes" class="form-input" placeholder="Add notes about this patient..." rows="3">${patient.notes || ''}</textarea>
                <button class="btn btn-sm btn-primary mt-1" id="saveNotesBtn">
                    <i class="fas fa-save"></i> Save Notes
                </button>
            </div>
        `;
        
        // Add event listeners to detail buttons
        document.getElementById('increasePriorityBtn').addEventListener('click', function() {
            changePatientPriority(patientId, 'increase');
        });
        
        document.getElementById('decreasePriorityBtn').addEventListener('click', function() {
            changePatientPriority(patientId, 'decrease');
        });
        
        document.getElementById('removePatientDetailBtn').addEventListener('click', function() {
            showRemoveConfirmation(patientId);
        });
        
        document.getElementById('saveNotesBtn').addEventListener('click', function() {
            savePatientNotes(patientId);
        });
    }
    
    // Change patient priority
    function changePatientPriority(patientId, direction) {
        const patients = getPatients();
        const patientIndex = patients.findIndex(p => p.id === patientId);
        
        if (patientIndex === -1) return;
        
        const patient = patients[patientIndex];
        const oldPriorityId = patient.priorityId;
        
        let newPriorityId;
        let actionType;
        
        if (direction === 'increase') {
            // Move to higher priority (lower number)
            newPriorityId = Math.max(1, patient.priorityId - 1);
            actionType = 'Increase Attention';
        } else {
            // Move to lower priority (higher number)
            newPriorityId = Math.min(4, patient.priorityId + 1);
            actionType = 'Decrease Attention';
        }
        
        if (oldPriorityId === newPriorityId) {
            alert(`Patient is already at ${priorityLevels[newPriorityId].name} priority`);
            return;
        }
        
        // Update patient priority
        patient.priorityId = newPriorityId;
        patients[patientIndex] = patient;
        savePatients(patients);
        
        // Log the action
        const logs = getActionLogs();
        const newLog = {
            id: getNextLogId(),
            patientId: patientId,
            actionType: actionType,
            oldPriorityId: oldPriorityId,
            newPriorityId: newPriorityId,
            timestamp: new Date().toISOString(),
            notes: `Priority changed from ${priorityLevels[oldPriorityId].name} to ${priorityLevels[newPriorityId].name}`
        };
        
        logs.push(newLog);
        saveActionLogs(logs);
        
        // Update UI
        renderPatients();
        renderActionLogs();
        
        // Reselect patient if it was selected
        if (selectedPatientId === patientId) {
            selectPatient(patientId);
        }
        
        // Show confirmation
        const patientName = patient.name;
        const oldPriority = priorityLevels[oldPriorityId].name;
        const newPriority = priorityLevels[newPriorityId].name;
        
        alert(`${patientName}'s priority changed from ${oldPriority} to ${newPriority}`);
    }
    
    // Show remove confirmation modal
    function showRemoveConfirmation(patientId) {
        const patients = getPatients();
        const patient = patients.find(p => p.id === patientId);
        
        if (!patient) return;
        
        document.getElementById('removePatientName').textContent = patient.name;
        document.getElementById('removePatientCode').textContent = patient.code;
        
        // Store the patient ID in the modal for later use
        confirmRemoveModal.dataset.patientId = patientId;
        confirmRemoveModal.classList.add('active');
    }
    
    // Remove patient
    function removePatient(patientId, reason = '') {
        const patients = getPatients();
        const patientIndex = patients.findIndex(p => p.id === patientId);
        
        if (patientIndex === -1) return;
        
        const patient = patients[patientIndex];
        
        // Remove patient from array
        patients.splice(patientIndex, 1);
        savePatients(patients);
        
        // Log the action
        const logs = getActionLogs();
        const newLog = {
            id: getNextLogId(),
            patientId: patientId,
            actionType: 'Remove Patient',
            oldPriorityId: patient.priorityId,
            newPriorityId: null,
            timestamp: new Date().toISOString(),
            notes: reason || `Patient ${patient.code} removed from waitlist`
        };
        
        logs.push(newLog);
        saveActionLogs(logs);
        
        // Update UI
        renderPatients();
        renderActionLogs();
        
        // Clear selected patient
        selectedPatientId = null;
        
        alert(`Patient ${patient.name} (${patient.code}) has been removed from the waitlist.`);
    }
    
    // Save patient notes
    function savePatientNotes(patientId) {
        const notesTextarea = document.getElementById('patientNotes');
        if (!notesTextarea) return;
        
        const notes = notesTextarea.value.trim();
        const patients = getPatients();
        const patientIndex = patients.findIndex(p => p.id === patientId);
        
        if (patientIndex === -1) return;
        
        patients[patientIndex].notes = notes;
        savePatients(patients);
        
        // Show confirmation
        const saveBtn = document.getElementById('saveNotesBtn');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
        saveBtn.disabled = true;
        
        setTimeout(() => {
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }, 2000);
    }
    
    // Add new patient
    function addPatient(patientData) {
        const patients = getPatients();
        
        // Check if code already exists
        const existingPatient = patients.find(p => p.code === patientData.code.toUpperCase());
        if (existingPatient) {
            alert(`Patient code ${patientData.code} is already in use. Please use a different code.`);
            return false;
        }
        
        const newPatient = {
            id: getNextPatientId(),
            code: patientData.code.toUpperCase(),
            name: patientData.name,
            injuryType: patientData.injuryType,
            painLevel: parseInt(patientData.painLevel),
            priorityId: patientData.priorityId,
            arrivalTime: new Date().toISOString(),
            status: 'waiting',
            notes: ''
        };
        
        patients.push(newPatient);
        savePatients(patients);
        
        // Log the action
        const logs = getActionLogs();
        const newLog = {
            id: getNextLogId(),
            patientId: newPatient.id,
            actionType: 'Add Patient',
            oldPriorityId: null,
            newPriorityId: newPatient.priorityId,
            timestamp: new Date().toISOString(),
            notes: `New patient checked in: ${newPatient.name} (${newPatient.code})`
        };
        
        logs.push(newLog);
        saveActionLogs(logs);
        
        return true;
    }
    
    // Clear action logs
    function clearActionLogs() {
        if (confirm('Are you sure you want to clear all action logs? This action cannot be undone.')) {
            localStorage.setItem('actionLogs', JSON.stringify([]));
            localStorage.setItem('nextLogId', '1');
            renderActionLogs();
            alert('All action logs have been cleared.');
        }
    }
    
    // Calculate priority from pain level
    function calculatePriorityFromPain(painLevel) {
        if (painLevel >= 8) return 1; // Critical
        if (painLevel >= 5) return 2; // High
        if (painLevel >= 3) return 3; // Medium
        return 4; // Low
    }
    
    // Initialize modal functionality
    function initModals() {
        // Add Patient Modal
        addPatientBtn.addEventListener('click', function() {
            addPatientModal.classList.add('active');
            addPatientForm.reset();
            modalPainLevel.value = 5;
            modalPainValue.textContent = '5';
        });
        
        closeAddModal.addEventListener('click', function() {
            addPatientModal.classList.remove('active');
        });
        
        cancelAddBtn.addEventListener('click', function() {
            addPatientModal.classList.remove('active');
        });
        
        // Remove Patient Modal
        closeRemoveModal.addEventListener('click', function() {
            confirmRemoveModal.classList.remove('active');
        });
        
        cancelRemoveBtn.addEventListener('click', function() {
            confirmRemoveModal.classList.remove('active');
        });
        
        confirmRemoveBtn.addEventListener('click', function() {
            const patientId = parseInt(confirmRemoveModal.dataset.patientId);
            const reason = document.getElementById('removeReason').value.trim();
            
            if (patientId) {
                removePatient(patientId, reason);
                confirmRemoveModal.classList.remove('active');
                document.getElementById('removeReason').value = '';
            }
        });
        
        // Submit Add Patient Form
        submitAddBtn.addEventListener('click', function() {
            const formData = {
                name: document.getElementById('modalPatientName').value.trim(),
                code: document.getElementById('modalPatientCode').value.trim(),
                injuryType: document.getElementById('modalInjuryType').value,
                painLevel: parseInt(document.getElementById('modalPainLevel').value),
                priorityId: calculatePriorityFromPain(parseInt(document.getElementById('modalPainLevel').value))
            };
            
            // Validation
            if (!formData.name || formData.name.length < 2) {
                alert('Please enter a valid patient name (minimum 2 characters)');
                return;
            }
            
            if (!formData.code.match(/^[A-Za-z]{3}$/)) {
                alert('Please enter a valid 3-letter patient code (e.g., ABC)');
                return;
            }
            
            if (!formData.injuryType) {
                alert('Please select an injury type');
                return;
            }
            
            if (addPatient(formData)) {
                addPatientModal.classList.remove('active');
                renderPatients();
                renderActionLogs();
                alert(`Patient ${formData.name} (${formData.code.toUpperCase()}) added successfully!`);
            }
        });
        
        // Pain level slider in modal
        modalPainLevel.addEventListener('input', function() {
            modalPainValue.textContent = this.value;
        });
        
        // Close modals when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === addPatientModal) {
                addPatientModal.classList.remove('active');
            }
            if (e.target === confirmRemoveModal) {
                confirmRemoveModal.classList.remove('active');
            }
        });
    }
    
    // Initialize other event listeners
    function initEventListeners() {
        // Refresh button
        refreshBtn.addEventListener('click', function() {
            renderPatients();
            renderActionLogs();
            
            // Show refresh feedback
            const originalText = refreshBtn.innerHTML;
            refreshBtn.innerHTML = '<i class="fas fa-check"></i> Refreshed!';
            refreshBtn.disabled = true;
            
            setTimeout(() => {
                refreshBtn.innerHTML = originalText;
                refreshBtn.disabled = false;
            }, 2000);
        });
        
        // Clear logs button
        clearLogBtn.addEventListener('click', clearActionLogs);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Ctrl+R to refresh
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                refreshBtn.click();
            }
            
            // Delete key to remove selected patient
            if (e.key === 'Delete' && selectedPatientId) {
                showRemoveConfirmation(selectedPatientId);
            }
        });
    }
    
    // Initialize the application
    function init() {
        initModals();
        initEventListeners();
        renderPatients();
        renderActionLogs();
        
        // Select first patient by default if exists
        const patients = getPatients();
        if (patients.length > 0) {
            selectPatient(patients[0].id);
        }
        
        console.log('Admin dashboard initialized successfully');
    }
    
    // Start the application
    init();
});