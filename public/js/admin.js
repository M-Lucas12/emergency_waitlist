// admin.js - Admin Dashboard using backend API (shared with user form + DB)

document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const waitlistBody = document.getElementById('waitlistBody');
    const emptyState = document.getElementById('emptyState');
    const actionLog = document.getElementById('actionLog');
    const emptyLog = document.getElementById('emptyLog');
    const totalPatientsElement = document.getElementById('totalPatients');
    const patientDetailBody = document.getElementById('patientDetailBody');

    const refreshBtn = document.getElementById('refreshBtn');
    const addPatientBtn = document.getElementById('addPatientBtn');
    const clearLogBtn = document.getElementById('clearLogBtn');

    // Modals + forms
    const addPatientModal = document.getElementById('addPatientModal');
    const confirmRemoveModal = document.getElementById('confirmRemoveModal');
    const closeAddModal = document.getElementById('closeAddModal');
    const cancelAddBtn = document.getElementById('cancelAddBtn');
    const submitAddBtn = document.getElementById('submitAddBtn');
    const closeRemoveModal = document.getElementById('closeRemoveModal');
    const cancelRemoveBtn = document.getElementById('cancelRemoveBtn');
    const confirmRemoveBtn = document.getElementById('confirmRemoveBtn');

    const addPatientForm = document.getElementById('addPatientForm');
    const modalPainLevel = document.getElementById('modalPainLevel');
    const modalPainValue = document.getElementById('modalPainValue');

    // In-memory data loaded from backend
    let patients = [];
    let logs = [];
    let selectedPatientId = null;

    // Priority meta (same mapping as server/user.js)
    const priorityLevels = {
        1: { id: 1, name: 'Critical', color: 'critical', waitLabel: 'Immediate' },
        2: { id: 2, name: 'High',     color: 'high',     waitLabel: '15 min'   },
        3: { id: 3, name: 'Medium',   color: 'medium',   waitLabel: '30 min'   },
        4: { id: 4, name: 'Low',      color: 'low',      waitLabel: '60 min'   }
    };

    // Injury code → nice label (for patients created from user form)
    const injuryLabelMap = {
        head: 'Head / Concussion',
        chest: 'Chest Pain',
        abdomen: 'Abdomen / Stomach Pain',
        neck: 'Neck / Spinal Injury',
        back: 'Back / Spine Pain',
        arm: 'Arm / Upper Limb Injury',
        leg: 'Leg / Lower Limb Injury',
        burn: 'Burn / Thermal Injury',
        bleeding: 'Severe Bleeding',
        allergic: 'Allergic Reaction',
        other: 'Other / General Symptoms'
    };

    const formatInjuryType = (value) => {
        if (!value) return '';
        const lower = String(value).toLowerCase();
        return injuryLabelMap[lower] || value;
    };

    // Small helper for fetch + JSON
    async function api(path, options = {}) {
        const res = await fetch(path, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        if (!res.ok) {
            const text = await res.text();
            console.error(`API error ${res.status} on ${path}:`, text);
            throw new Error(`Request failed: ${res.status}`);
        }
        return res.json();
    }

    /* ------------ LOAD DATA FROM BACKEND ------------ */

    async function loadPatients() {
        try {
            patients = await api('/api/patients');
            renderPatients();
        } catch (err) {
            console.error('Error loading patients:', err);
            alert('Error loading patients from server.');
        }
    }

    async function loadActionLogs() {
        try {
            logs = await api('/api/action-logs');
            renderActionLogs();
        } catch (err) {
            console.error('Error loading action logs:', err);
            // don’t alert spam on every refresh – just log
        }
    }

    /* ------------ RENDER PATIENT TABLE ------------ */

    function renderPatients() {
        if (!patients || patients.length === 0) {
            waitlistBody.innerHTML = '';
            emptyState.style.display = 'block';
            totalPatientsElement.textContent = '0';
            renderNoPatientSelected();
            return;
        }

        emptyState.style.display = 'none';
        totalPatientsElement.textContent = patients.length.toString();

        // Sort: priority (1..4) then arrival_time (oldest first)
        const sorted = [...patients].sort((a, b) => {
            const pDiff = a.priority_id - b.priority_id;
            if (pDiff !== 0) return pDiff;
            return new Date(a.arrival_time) - new Date(b.arrival_time);
        });

        let html = '';

        sorted.forEach(p => {
            const pr = priorityLevels[p.priority_id] || priorityLevels[4];
            const arrival = new Date(p.arrival_time);
            const arrivalStr = arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const injuryText = formatInjuryType(p.injury_type);

            const isSelected = p.patient_id === selectedPatientId;

            html += `
                <tr data-patient-id="${p.patient_id}" class="${isSelected ? 'selected' : ''}">
                    <td class="detail-code">${p.code}</td>
                    <td>${p.name}</td>
                    <td>${injuryText}</td>
                    <td>${p.pain_level}/10</td>
                    <td>
                        <span class="priority-badge priority-${pr.color}">
                            ${pr.name}
                        </span>
                    </td>
                    <td>
                        <span class="wait-time-indicator wait-time-${pr.color}">
                            ${pr.waitLabel}
                        </span>
                    </td>
                    <td>${arrivalStr}</td>
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

        waitlistBody.innerHTML = html;

        // Attach events for each row + buttons
        document.querySelectorAll('#waitlistBody tr').forEach(row => {
            const id = parseInt(row.dataset.patientId, 10);

            row.addEventListener('click', (e) => {
                if (e.target.closest('.action-buttons')) return;
                selectPatient(id);
            });

            row.querySelector('.increase-attention-btn')
                .addEventListener('click', (e) => {
                    e.stopPropagation();
                    changePatientPriority(id, 'increase');
                });

            row.querySelector('.decrease-attention-btn')
                .addEventListener('click', (e) => {
                    e.stopPropagation();
                    changePatientPriority(id, 'decrease');
                });

            row.querySelector('.remove-patient-btn')
                .addEventListener('click', (e) => {
                    e.stopPropagation();
                    showRemoveConfirmation(id);
                });
        });
    }

    /* ------------ RENDER ACTION LOGS ------------ */

    function renderActionLogs() {
        if (!logs || logs.length === 0) {
            actionLog.innerHTML = '';
            emptyLog.style.display = 'block';
            return;
        }

        emptyLog.style.display = 'none';

        const sorted = [...logs].sort(
            (a, b) => new Date(b.action_timestamp) - new Date(a.action_timestamp)
        );

        let html = '';

        sorted.forEach(log => {
            const ts = new Date(log.action_timestamp).toLocaleString();
            const patient = patients.find(p => p.patient_id === log.patient_id);
            const patientInfo = patient ? `${patient.code} (${patient.name})` : `Patient #${log.patient_id}`;

            let actionText;
            if (log.action_type === 'Add Patient') {
                actionText = `Added patient ${patientInfo}`;
            } else if (log.action_type === 'Remove Patient') {
                actionText = `Removed patient ${patientInfo}`;
            } else if (log.action_type === 'Change Priority') {
                const oldP = log.old_priority_id ? priorityLevels[log.old_priority_id]?.name : 'None';
                const newP = log.new_priority_id ? priorityLevels[log.new_priority_id]?.name : 'None';
                actionText = `Changed priority for ${patientInfo} from ${oldP} to ${newP}`;
            } else {
                actionText = `${log.action_type} for ${patientInfo}`;
            }

            html += `
                <div class="log-entry">
                    <div class="log-timestamp">${ts}</div>
                    <div class="log-action">${actionText}</div>
                    ${log.notes ? `<div class="log-notes">${log.notes}</div>` : ''}
                </div>
            `;
        });

        actionLog.innerHTML = html;
    }

    /* ------------ PATIENT DETAILS PANEL ------------ */

    function renderNoPatientSelected() {
        patientDetailBody.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-circle"></i>
                <h3>No Patient Selected</h3>
                <p>Select a patient from the waitlist to view details</p>
            </div>
        `;
        selectedPatientId = null;
    }

    function selectPatient(patientId) {
        const p = patients.find(pt => pt.patient_id === patientId);
        if (!p) {
            renderNoPatientSelected();
            return;
        }
        selectedPatientId = patientId;

        // Update selected row highlight
        document.querySelectorAll('#waitlistBody tr').forEach(row => {
            row.classList.toggle(
                'selected',
                parseInt(row.dataset.patientId, 10) === patientId
            );
        });

        const pr = priorityLevels[p.priority_id] || priorityLevels[4];
        const arrivalFull = new Date(p.arrival_time).toLocaleString();

        const painLabel =
            p.pain_level >= 8 ? 'Severe' :
                p.pain_level >= 5 ? 'Moderate' : 'Mild';

        patientDetailBody.innerHTML = `
            <div class="detail-group">
                <div class="detail-label">
                    <i class="fas fa-id-card"></i> Patient Code
                </div>
                <div class="detail-value detail-code">${p.code}</div>
            </div>

            <div class="detail-group">
                <div class="detail-label">
                    <i class="fas fa-user"></i> Full Name
                </div>
                <div class="detail-value">${p.name}</div>
            </div>

            <div class="detail-group">
                <div class="detail-label">
                    <i class="fas fa-user-injured"></i> Injury Type
                </div>
                <div class="detail-value">${formatInjuryType(p.injury_type)}</div>
            </div>

            <div class="detail-group">
                <div class="detail-label">
                    <i class="fas fa-tachometer-alt"></i> Pain Level
                </div>
                <div class="detail-value">
                    ${p.pain_level}/10
                    <span class="priority-badge priority-${pr.color}">${painLabel}</span>
                </div>
            </div>

            <div class="detail-group">
                <div class="detail-label">
                    <i class="fas fa-exclamation-triangle"></i> Priority Level
                </div>
                <div class="detail-value">
                    <span class="priority-badge priority-${pr.color}">${pr.name}</span>
                </div>
            </div>

            <div class="detail-group">
                <div class="detail-label">
                    <i class="fas fa-clock"></i> Arrival Time
                </div>
                <div class="detail-value">${arrivalFull}</div>
            </div>

            <div class="detail-group">
                <div class="detail-label">
                    <i class="fas fa-hourglass-half"></i> Estimated Wait
                </div>
                <div class="detail-value">
                    <span class="wait-time-indicator wait-time-${pr.color}">
                        ${pr.waitLabel}
                    </span>
                </div>
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
        `;

        // Detail buttons
        document.getElementById('increasePriorityBtn')
            .addEventListener('click', () => changePatientPriority(patientId, 'increase'));

        document.getElementById('decreasePriorityBtn')
            .addEventListener('click', () => changePatientPriority(patientId, 'decrease'));

        document.getElementById('removePatientDetailBtn')
            .addEventListener('click', () => showRemoveConfirmation(patientId));
    }

    /* ------------ PRIORITY CHANGES & REMOVAL ------------ */

    async function changePatientPriority(patientId, direction) {
        const p = patients.find(pt => pt.patient_id === patientId);
        if (!p) return;

        let newPriorityId;
        if (direction === 'increase') {
            newPriorityId = Math.max(1, p.priority_id - 1);
        } else {
            newPriorityId = Math.min(4, p.priority_id + 1);
        }

        if (newPriorityId === p.priority_id) {
            alert(`Patient is already at ${priorityLevels[newPriorityId].name} priority.`);
            return;
        }

        try {
            await api(`/api/patients/${patientId}/priority`, {
                method: 'PUT',
                body: JSON.stringify({
                    new_priority_id: newPriorityId,
                    notes: `Priority changed from ${priorityLevels[p.priority_id].name} to ${priorityLevels[newPriorityId].name} by admin dashboard`
                })
            });

            await loadPatients();
            await loadActionLogs();
            if (selectedPatientId === patientId) {
                selectPatient(patientId);
            }

            alert(`${p.name}'s priority changed to ${priorityLevels[newPriorityId].name}.`);
        } catch (err) {
            console.error('Error changing priority:', err);
            alert('Error updating patient priority.');
        }
    }

    function showRemoveConfirmation(patientId) {
        const p = patients.find(pt => pt.patient_id === patientId);
        if (!p) return;

        document.getElementById('removePatientName').textContent = p.name;
        document.getElementById('removePatientCode').textContent = p.code;

        confirmRemoveModal.dataset.patientId = String(patientId);
        confirmRemoveModal.classList.add('active');
    }

    async function removePatient(patientId, reason = '') {
        try {
            await api(`/api/patients/${patientId}`, {
                method: 'DELETE',
                body: JSON.stringify({ notes: reason || 'Removed from waitlist via admin dashboard' })
            });

            confirmRemoveModal.classList.remove('active');
            document.getElementById('removeReason').value = '';

            await loadPatients();
            await loadActionLogs();
            renderNoPatientSelected();

            alert('Patient removed from waitlist.');
        } catch (err) {
            console.error('Error removing patient:', err);
            alert('Error removing patient.');
        }
    }

    /* ------------ ADD PATIENT MODAL (ADMIN) ------------ */

    function calculatePriorityFromPain(painLevel) {
        if (painLevel >= 8) return 1; // Critical
        if (painLevel >= 5) return 2; // High
        if (painLevel >= 3) return 3; // Medium
        return 4;                    // Low
    }

    async function addPatientFromModal() {
        const name = document.getElementById('modalPatientName').value.trim();
        const code = document.getElementById('modalPatientCode').value.trim().toUpperCase();
        const injuryType = document.getElementById('modalInjuryType').value;
        const painLevel = parseInt(document.getElementById('modalPainLevel').value, 10);

        if (!name || name.length < 2) {
            alert('Please enter a valid patient name (minimum 2 characters).');
            return;
        }
        if (!/^[A-Za-z]{3}$/.test(code)) {
            alert('Please enter a valid 3-letter patient code (e.g., ABC).');
            return;
        }
        if (!injuryType) {
            alert('Please select an injury type.');
            return;
        }

        try {
            await api('/api/patients', {
                method: 'POST',
                body: JSON.stringify({
                    code,
                    name,
                    injury_type: injuryType,
                    pain_level: painLevel
                })
            });

            addPatientModal.classList.remove('active');
            await loadPatients();
            await loadActionLogs();
            alert(`Patient ${name} (${code}) added successfully.`);
        } catch (err) {
            console.error('Error adding patient:', err);
            alert('Error adding patient.');
        }
    }

    /* ------------ CLEAR LOGS (CLIENT-SIDE ONLY) ------------ */

    function clearActionLogsClientSide() {
        // Just clear on screen; on refresh they’ll re-load from server.
        logs = [];
        renderActionLogs();
    }

    /* ------------ MODALS + EVENT LISTENERS ------------ */

    function initModalsAndEvents() {
        // Add Patient
        addPatientBtn.addEventListener('click', () => {
            addPatientForm.reset();
            modalPainLevel.value = 5;
            modalPainValue.textContent = '5';
            addPatientModal.classList.add('active');
        });

        closeAddModal.addEventListener('click', () => {
            addPatientModal.classList.remove('active');
        });

        cancelAddBtn.addEventListener('click', () => {
            addPatientModal.classList.remove('active');
        });

        submitAddBtn.addEventListener('click', () => {
            addPatientFromModal();
        });

        modalPainLevel.addEventListener('input', () => {
            modalPainValue.textContent = modalPainLevel.value;
        });

        // Remove Patient modal
        closeRemoveModal.addEventListener('click', () => {
            confirmRemoveModal.classList.remove('active');
        });

        cancelRemoveBtn.addEventListener('click', () => {
            confirmRemoveModal.classList.remove('active');
        });

        confirmRemoveBtn.addEventListener('click', () => {
            const id = parseInt(confirmRemoveModal.dataset.patientId || '0', 10);
            const reason = document.getElementById('removeReason').value.trim();
            if (id) removePatient(id, reason);
        });

        // Refresh button
        refreshBtn.addEventListener('click', async () => {
            const original = refreshBtn.innerHTML;
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';

            await Promise.all([loadPatients(), loadActionLogs()]);

            refreshBtn.innerHTML = original;
            refreshBtn.disabled = false;
        });

        // Clear log (client side)
        clearLogBtn.addEventListener('click', () => {
            if (confirm('Clear the action log from the screen? (Server history will remain.)')) {
                clearActionLogsClientSide();
            }
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === addPatientModal) addPatientModal.classList.remove('active');
            if (e.target === confirmRemoveModal) confirmRemoveModal.classList.remove('active');
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' && selectedPatientId) {
                showRemoveConfirmation(selectedPatientId);
            }
        });
    }

    /* ------------ INIT ------------ */

    async function init() {
        initModalsAndEvents();
        await Promise.all([loadPatients(), loadActionLogs()]);

        // Auto-select first patient if any
        if (patients.length > 0) {
            selectPatient(patients[0].patient_id);
        } else {
            renderNoPatientSelected();
        }

        console.log('Admin dashboard initialized with backend API');
    }

    init();
});