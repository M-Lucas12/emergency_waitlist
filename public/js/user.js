// user.js - Patient portal functionality

document.addEventListener('DOMContentLoaded', function() {
    // Navigation between sections
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
    
    // Pain level slider
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
        
        // Click on pain descriptions
        document.querySelectorAll('.pain-description').forEach(desc => {
            desc.addEventListener('click', function() {
                const range = this.dataset.level.split('-');
                const avgValue = Math.floor((parseInt(range[0]) + parseInt(range[1])) / 2);
                painSlider.value = avgValue;
                updatePainSlider();
            });
        });
    }
    
    // Form submission
    const triageForm = document.getElementById('patientTriageForm');
    if (triageForm) {
        triageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('fullName').value,
                code: document.getElementById('patientCode').value.toUpperCase(),
                injuryType: document.getElementById('injuryType').value,
                symptoms: document.getElementById('symptoms').value,
                painLevel: parseInt(document.getElementById('painLevel').value),
                emergencySymptoms: {
                    chestPain: document.getElementById('chestPain').checked,
                    difficultyBreathing: document.getElementById('difficultyBreathing').checked,
                    severeBleeding: document.getElementById('severeBleeding').checked,
                    lossOfConsciousness: document.getElementById('lossOfConsciousness').checked,
                    severeHeadache: document.getElementById('severeHeadache').checked
                }
            };
            
            // Calculate priority based on pain level and emergency symptoms
            let priority = 'low';
            let estimatedWait = 60; // minutes
            
            if (formData.painLevel >= 8 || 
                formData.emergencySymptoms.chestPain || 
                formData.emergencySymptoms.difficultyBreathing ||
                formData.emergencySymptoms.severeBleeding) {
                priority = 'critical';
                estimatedWait = 0;
            } else if (formData.painLevel >= 5 || 
                      formData.emergencySymptoms.lossOfConsciousness ||
                      formData.emergencySymptoms.severeHeadache) {
                priority = 'high';
                estimatedWait = 15;
            } else if (formData.painLevel >= 3) {
                priority = 'medium';
                estimatedWait = 30;
            }
            
            // Save to localStorage (simulating database)
            const patientData = {
                ...formData,
                priority: priority,
                estimatedWait: estimatedWait,
                arrivalTime: new Date().toISOString(),
                status: 'waiting'
            };
            
            // Save patient data
            localStorage.setItem('currentPatient', JSON.stringify(patientData));
            
            // Update patient session
            localStorage.setItem('patientSession', JSON.stringify({
                loggedIn: true,
                patientCode: formData.code,
                patientName: formData.name
            }));
            
            // Show success message and switch to wait time view
            alert('Triage form submitted successfully! Your priority level is: ' + priority);
            
            // Update display
            document.getElementById('patientNameDisplay').textContent = 'Welcome, ' + formData.name;
            document.getElementById('patientCodeDisplay').textContent = 'Code: ' + formData.code;
            document.getElementById('patientStatus').textContent = 'Status: In Queue';
            document.getElementById('patientStatus').className = 'profile-status status-waiting';
            
            // Switch to wait time section
            document.getElementById('waitTimeBtn').click();
            
            // Update wait time display
            updateWaitTimeDisplay(patientData);
        });
    }
    
    // Clear form button
    const clearFormBtn = document.getElementById('clearFormBtn');
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', function() {
            if (confirm('Clear all form data?')) {
                triageForm.reset();
                if (painSlider && painValue) {
                    painSlider.value = 5;
                    painValue.textContent = '5';
                }
            }
        });
    }
    
    // Update wait time display
    function updateWaitTimeDisplay(patientData) {
        document.getElementById('displayPatientCode').textContent = patientData.code;
        document.getElementById('displayInjuryType').textContent = 
            patientData.injuryType.replace(/([A-Z])/g, ' $1').trim();
        document.getElementById('waitTimeValue').textContent = patientData.estimatedWait;
        
        // Format arrival time
        const arrivalDate = new Date(patientData.arrivalTime);
        document.getElementById('checkInTime').textContent = 
            arrivalDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        // Update priority badge
        const priorityBadge = document.getElementById('priorityBadge');
        priorityBadge.className = 'priority-badge priority-' + patientData.priority;
        priorityBadge.innerHTML = `<i class="fas fa-exclamation-circle"></i><span>${patientData.priority.charAt(0).toUpperCase() + patientData.priority.slice(1)}</span>`;
    }
    
    // Load existing patient data if available
    const patientSession = JSON.parse(localStorage.getItem('patientSession') || '{}');
    const currentPatient = JSON.parse(localStorage.getItem('currentPatient') || '{}');
    
    if (patientSession.loggedIn && currentPatient.code) {
        document.getElementById('patientNameDisplay').textContent = 'Welcome, ' + currentPatient.name;
        document.getElementById('patientCodeDisplay').textContent = 'Code: ' + currentPatient.code;
        document.getElementById('patientStatus').textContent = 'Status: In Queue';
        document.getElementById('patientStatus').className = 'profile-status status-waiting';
        
        updateWaitTimeDisplay(currentPatient);
    }
    
    // Emergency modal functionality
    const emergencyBtns = document.querySelectorAll('#call911Btn, #mobileEmergencyBtn');
    const emergencyModal = document.getElementById('emergencyModal');
    const closeEmergencyModal = document.getElementById('closeEmergencyModal');
    const cancelEmergencyBtn = document.getElementById('cancelEmergencyBtn');
    const call911ModalBtn = document.getElementById('call911ModalBtn');
    
    emergencyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            emergencyModal.classList.add('active');
        });
    });
    
    if (closeEmergencyModal) {
        closeEmergencyModal.addEventListener('click', function() {
            emergencyModal.classList.remove('active');
        });
    }
    
    if (cancelEmergencyBtn) {
        cancelEmergencyBtn.addEventListener('click', function() {
            emergencyModal.classList.remove('active');
        });
    }
    
    if (call911ModalBtn) {
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
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === emergencyModal) {
            emergencyModal.classList.remove('active');
        }
    });
});