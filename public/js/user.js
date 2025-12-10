// user.js - Patient portal functionality

document.addEventListener('DOMContentLoaded', function() {
    // ===== SIDEBAR NAV: SWITCH BETWEEN SECTIONS =====
    const navButtons = document.querySelectorAll('.sidebar-nav-item');
    const contentSections = document.querySelectorAll('.content-section');

    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.id.replace('Btn', 'Section');

            // Update active nav button
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Show target section
            contentSections.forEach(section => {
                section.classList.remove('active');
            });

            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    // ===== PAIN LEVEL SLIDER =====
    const painSlider = document.getElementById('painLevel');
    const painValue = document.getElementById('painValue');
    const painSliderThumb = document.getElementById('painSliderThumb');

    if (painSlider && painValue && painSliderThumb) {
        function updatePainSlider() {
            const value = painSlider.value;
            painValue.textContent = value;

            // Update thumb position
            const percent = ((value - painSlider.min) / (painSlider.max - painSlider.min)) * 100;
            painSliderThumb.style.left = percent + '%';

            // Update active pain description
            document.querySelectorAll('.pain-description').forEach(desc => {
                desc.classList.remove('active');
            });

            if (value <= 3) {
                document.querySelector('.pain-description[data-level="1-3"]').classList.add('active');
            } else if (value <= 7) {
                document.querySelector('.pain-description[data-level="4-7"]').classList.add('active');
            } else {
                document.querySelector('.pain-description[data-level="8-10"]').classList.add('active');
            }
        }

        painSlider.addEventListener('input', updatePainSlider);
        updatePainSlider(); // Initialize

        // Clicking on the labels sets an average value
        document.querySelectorAll('.pain-description').forEach(desc => {
            desc.addEventListener('click', function() {
                const range = this.dataset.level.split('-');
                const avgValue = Math.floor((parseInt(range[0]) + parseInt(range[1])) / 2);
                painSlider.value = avgValue;
                updatePainSlider();
            });
        });
    }

    // ===== TRIAGE FORM SUBMISSION =====
    const triageForm = document.getElementById('patientTriageForm');
    if (triageForm) {
        triageForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Get form data
            const formData = {
                name: document.getElementById('fullName').value.trim(),
                code: document.getElementById('patientCode').value.trim().toUpperCase(),
                injuryType: document.getElementById('injuryType').value,
                symptoms: document.getElementById('symptoms').value,
                painLevel: parseInt(document.getElementById('painLevel').value, 10),
                emergencySymptoms: {
                    chestPain: document.getElementById('chestPain').checked,
                    difficultyBreathing: document.getElementById('difficultyBreathing').checked,
                    severeBleeding: document.getElementById('severeBleeding').checked,
                    lossOfConsciousness: document.getElementById('lossOfConsciousness').checked,
                    severeHeadache: document.getElementById('severeHeadache').checked
                }
            };

            // Basic validation (client-side)
            if (!formData.name || formData.name.length < 2) {
                alert('Please enter your full name (at least 2 characters).');
                return;
            }
            if (!/^[A-Za-z]{3}$/.test(formData.code)) {
                alert('Please enter a 3-letter code (e.g., ABC).');
                return;
            }
            if (!formData.injuryType) {
                alert('Please select an injury type.');
                return;
            }

            // --- SEND TO BACKEND / DATABASE ---
            // Our backend /api/patients route expects: code, name, injury_type, pain_level
            const payload = {
                code: formData.code,
                name: formData.name,
                injury_type: formData.injuryType,
                pain_level: formData.painLevel
            };

            try {
                const response = await fetch('/api/patients', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    console.error('Server returned error:', response.status);
                    alert('There was an error submitting your triage form. Please try again.');
                    return;
                }

                // This is the row inserted into PostgreSQL (with patient_id, arrival_time, priority_id, etc.)
                const savedPatient = await response.json();

                // Map priority_id from DB -> text + wait time (same mapping as server/admin)
                const priorityMap = {
                    1: { level: 'critical', wait: 0 },
                    2: { level: 'high',     wait: 15 },
                    3: { level: 'medium',   wait: 30 },
                    4: { level: 'low',      wait: 60 }
                };

                const pr = priorityMap[savedPatient.priority_id] || priorityMap[4];

                const patientData = {
                    ...formData,
                    priority: pr.level,
                    estimatedWait: pr.wait,
                    arrivalTime: savedPatient.arrival_time,
                    status: 'waiting'
                };

                // Save to localStorage for the patient view
                localStorage.setItem('currentPatient', JSON.stringify(patientData));

                // Update patient session
                localStorage.setItem('patientSession', JSON.stringify({
                    loggedIn: true,
                    patientCode: formData.code,
                    patientName: formData.name
                }));

                alert('Triage form submitted successfully! Your priority level is: ' + pr.level);

                // Update sidebar info
                document.getElementById('patientNameDisplay').textContent = 'Welcome, ' + formData.name;
                document.getElementById('patientCodeDisplay').textContent = 'Code: ' + formData.code;
                const statusEl = document.getElementById('patientStatus');
                statusEl.textContent = 'Status: In Queue';
                statusEl.className = 'profile-status status-waiting';

                // Switch to wait time section
                const waitTimeBtn = document.getElementById('waitTimeBtn');
                if (waitTimeBtn) waitTimeBtn.click();

                // Update wait time UI
                updateWaitTimeDisplay(patientData);

            } catch (err) {
                console.error('Error submitting triage form:', err);
                alert('Network or server error. Please try again.');
            }
        });
    }

    // ===== CLEAR FORM BUTTON =====
    const clearFormBtn = document.getElementById('clearFormBtn');
    if (clearFormBtn && triageForm) {
        clearFormBtn.addEventListener('click', function() {
            if (confirm('Clear all form data?')) {
                triageForm.reset();
                if (painSlider && painValue) {
                    painSlider.value = 5;
                    painValue.textContent = '5';
                }
                // un-highlight checklist cards
                document.querySelectorAll('.checkbox-card').forEach(card => {
                    card.classList.remove('selected');
                });
            }
        });
    }

    // ===== EMERGENCY SYMPTOMS CHECKLIST INTERACTION =====
    document.querySelectorAll('.checkbox-card').forEach(card => {
        const checkbox = card.querySelector('input[type="checkbox"]');
        if (!checkbox) return;

        // If some are pre-checked, sync the style
        if (checkbox.checked) {
            card.classList.add('selected');
        }

        // Rely on the label's native toggle, just update styling on change
        checkbox.addEventListener('change', function () {
            card.classList.toggle('selected', checkbox.checked);
        });
    });

    // ===== WAIT TIME & PRIORITY DISPLAY =====
    function updateWaitTimeDisplay(patientData) {
        document.getElementById('displayPatientCode').textContent = patientData.code;
        document.getElementById('displayInjuryType').textContent =
            patientData.injuryType.replace(/([A-Z])/g, ' $1').trim();
        document.getElementById('waitTimeValue').textContent = patientData.estimatedWait;

        const arrivalDate = new Date(patientData.arrivalTime);
        document.getElementById('checkInTime').textContent =
            arrivalDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const priorityBadge = document.getElementById('priorityBadge');
        priorityBadge.className = 'priority-badge priority-' + patientData.priority;
        priorityBadge.innerHTML =
            `<i class="fas fa-exclamation-circle"></i><span>${patientData.priority.charAt(0).toUpperCase() + patientData.priority.slice(1)}</span>`;
    }

    // Load existing patient data if present
    const patientSession = JSON.parse(localStorage.getItem('patientSession') || '{}');
    const currentPatient = JSON.parse(localStorage.getItem('currentPatient') || '{}');

    if (patientSession.loggedIn && currentPatient.code) {
        document.getElementById('patientNameDisplay').textContent = 'Welcome, ' + currentPatient.name;
        document.getElementById('patientCodeDisplay').textContent = 'Code: ' + currentPatient.code;
        const statusEl = document.getElementById('patientStatus');
        statusEl.textContent = 'Status: In Queue';
        statusEl.className = 'profile-status status-waiting';

        updateWaitTimeDisplay(currentPatient);
    }

    // ===== STATUS BANNER (USED BY CONTACT STAFF) =====
    const statusBanner = document.getElementById('statusBanner');
    const bannerMessage = document.getElementById('bannerMessage');
    const dismissBannerBtn = document.getElementById('dismissBannerBtn');

    if (dismissBannerBtn && statusBanner) {
        dismissBannerBtn.addEventListener('click', function() {
            statusBanner.style.display = 'none';
        });
    }

    // ===== EMERGENCY MODAL =====
    const emergencyBtns = document.querySelectorAll('#call911Btn, #mobileEmergencyBtn');
    const emergencyModal = document.getElementById('emergencyModal');
    const closeEmergencyModal = document.getElementById('closeEmergencyModal');
    const cancelEmergencyBtn = document.getElementById('cancelEmergencyBtn');
    const call911ModalBtn = document.getElementById('call911ModalBtn');

    emergencyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (emergencyModal) {
                emergencyModal.classList.add('active');
            }
        });
    });

    if (closeEmergencyModal && emergencyModal) {
        closeEmergencyModal.addEventListener('click', function() {
            emergencyModal.classList.remove('active');
        });
    }

    if (cancelEmergencyBtn && emergencyModal) {
        cancelEmergencyBtn.addEventListener('click', function() {
            emergencyModal.classList.remove('active');
        });
    }

    if (call911ModalBtn && emergencyModal) {
        call911ModalBtn.addEventListener('click', function() {
            if (confirm('Call 911 for emergency services?')) {
                if (/Mobi|Android/i.test(navigator.userAgent)) {
                    window.location.href = 'tel:911';
                } else {
                    alert('Please dial 911 on your phone for emergency services.');
                }
                emergencyModal.classList.remove('active');
            }
        });
    }

    // ===== SYMPTOMS UPDATE MODAL =====
    const symptomsModal = document.getElementById('symptomsModal');
    const closeSymptomsModal = document.getElementById('closeSymptomsModal');
    const cancelSymptomsBtn = document.getElementById('cancelSymptomsBtn');
    const submitSymptomsBtn = document.getElementById('submitSymptomsBtn');
    const updatedPainLevel = document.getElementById('updatedPainLevel');
    const updatedPainValue = document.getElementById('updatedPainValue');
    const updateSymptomsBtn = document.getElementById('updateSymptomsBtn');

    // Open modal when "Update Symptoms" button is clicked
    if (updateSymptomsBtn && symptomsModal) {
        updateSymptomsBtn.addEventListener('click', function() {
            symptomsModal.classList.add('active');
        });
    }

    // Close buttons
    if (closeSymptomsModal && symptomsModal) {
        closeSymptomsModal.addEventListener('click', function() {
            symptomsModal.classList.remove('active');
        });
    }

    if (cancelSymptomsBtn && symptomsModal) {
        cancelSymptomsBtn.addEventListener('click', function() {
            symptomsModal.classList.remove('active');
        });
    }

    // Slider inside modal
    if (updatedPainLevel && updatedPainValue) {
        const updateModalSlider = () => {
            updatedPainValue.textContent = updatedPainLevel.value;
        };
        updatedPainLevel.addEventListener('input', updateModalSlider);
        updateModalSlider();
    }

    // Submit updated symptoms (simple demo: recalc priority + wait)
    if (submitSymptomsBtn && symptomsModal) {
        submitSymptomsBtn.addEventListener('click', function() {
            const current = JSON.parse(localStorage.getItem('currentPatient') || '{}');
            if (!current.code) {
                alert('No active triage record found.');
                symptomsModal.classList.remove('active');
                return;
            }

            const newPain = updatedPainLevel ? parseInt(updatedPainLevel.value) : current.painLevel;
            const newNotes = document.getElementById('updatedSymptoms')?.value || '';

            // Very simple re-prioritization
            let priority = current.priority;
            let estimatedWait = current.estimatedWait;

            if (newPain >= 8) {
                priority = 'critical';
                estimatedWait = 0;
            } else if (newPain >= 5) {
                priority = 'high';
                estimatedWait = 15;
            } else if (newPain >= 3) {
                priority = 'medium';
                estimatedWait = 30;
            } else {
                priority = 'low';
                estimatedWait = 45;
            }

            const updated = {
                ...current,
                painLevel: newPain,
                symptoms: current.symptoms + '\n\n[Update] ' + newNotes,
                priority,
                estimatedWait
            };

            localStorage.setItem('currentPatient', JSON.stringify(updated));
            updateWaitTimeDisplay(updated);

            alert('Your symptoms have been updated. Your current priority is: ' + priority);
            symptomsModal.classList.remove('active');
        });
    }

    // ===== CONTACT STAFF BUTTON =====
    const contactStaffBtn = document.getElementById('contactStaffBtn');
    if (contactStaffBtn) {
        contactStaffBtn.addEventListener('click', function() {
            alert('A notification has been sent to the emergency staff. Someone will check on you shortly.');
            if (statusBanner && bannerMessage) {
                bannerMessage.textContent = 'Your request for assistance has been sent to the emergency staff.';
                statusBanner.style.display = 'flex';
            }
        });
    }

    // ===== "NEW TRIAGE" BUTTON ON WAIT TIME CARD =====
    const newTriageBtn = document.getElementById('newTriageBtn');
    if (newTriageBtn) {
        newTriageBtn.addEventListener('click', function() {
            const triageNavBtn = document.getElementById('triageFormBtn');
            if (triageNavBtn) {
                triageNavBtn.click(); // switches section & updates sidebar active state
            }
            const triageSection = document.getElementById('triageFormSection');
            if (triageSection) {
                triageSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // ===== REFRESH WAIT TIME (simple re-read from storage) =====
    const refreshWaitBtn = document.getElementById('refreshWaitBtn');
    if (refreshWaitBtn) {
        refreshWaitBtn.addEventListener('click', function() {
            const latest = JSON.parse(localStorage.getItem('currentPatient') || '{}');
            if (latest.code) {
                updateWaitTimeDisplay(latest);
                alert('Wait time refreshed.');
            } else {
                alert('No active triage record found to refresh.');
            }
        });
    }

    // ===== CLOSE MODALS WHEN CLICKING OUTSIDE =====
    window.addEventListener('click', function(e) {
        if (e.target === emergencyModal) {
            emergencyModal.classList.remove('active');
        }
        if (e.target === symptomsModal) {
            symptomsModal.classList.remove('active');
        }
    });
});