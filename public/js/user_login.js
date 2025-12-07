// user_login.js - Patient login functionality

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('patientLoginForm');
    const loginError = document.getElementById('loginError');
    const loginLoading = document.getElementById('loginLoading');
    const errorMessage = document.getElementById('errorMessage');
    const guestAccessBtn = document.getElementById('guestAccessBtn');
    const quickTriageBtn = document.getElementById('quickTriageBtn');
    const emergencyHelpLink = document.getElementById('emergencyHelpLink');
    
    // Form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const patientCode = document.getElementById('patientCode').value.toUpperCase();
            const patientName = document.getElementById('patientName').value.trim();
            
            // Simple validation
            if (!patientCode.match(/^[A-Z]{3}$/)) {
                showError('Please enter a valid 3-letter code (e.g., ABC)');
                return;
            }
            
            if (patientName.length < 2) {
                showError('Please enter your full name');
                return;
            }
            
            // Show loading
            loginLoading.classList.add('show');
            
            // Simulate API call
            setTimeout(function() {
                // Check if this is a returning patient
                const existingPatients = JSON.parse(localStorage.getItem('patients') || '[]');
                const existingPatient = existingPatients.find(p => 
                    p.code === patientCode && p.name.toLowerCase() === patientName.toLowerCase());
                
                if (existingPatient || patientCode === 'ABC') { // Demo patient
                    // Successful login
                    localStorage.setItem('patientSession', JSON.stringify({
                        loggedIn: true,
                        patientCode: patientCode,
                        patientName: patientName
                    }));
                    
                    // Redirect to patient portal
                    window.location.href = 'user.html';
                } else {
                    // New patient - allow access
                    localStorage.setItem('patientSession', JSON.stringify({
                        loggedIn: true,
                        patientCode: patientCode,
                        patientName: patientName,
                        isNew: true
                    }));
                    
                    // Redirect to patient portal
                    window.location.href = 'user.html';
                }
                
                loginLoading.classList.remove('show');
            }, 1000);
        });
    }
    
    // Guest access
    if (guestAccessBtn) {
        guestAccessBtn.addEventListener('click', function() {
            localStorage.setItem('guestSession', JSON.stringify({
                isGuest: true,
                accessTime: new Date().toISOString()
            }));
            window.location.href = 'user.html';
        });
    }
    
    // Quick triage
    if (quickTriageBtn) {
        quickTriageBtn.addEventListener('click', function() {
            localStorage.setItem('guestSession', JSON.stringify({
                isGuest: true,
                accessTime: new Date().toISOString()
            }));
            window.location.href = 'user.html#triageFormSection';
        });
    }
    
    // Emergency help
    if (emergencyHelpLink) {
        emergencyHelpLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Call emergency services?')) {
                if (/Mobi|Android/i.test(navigator.userAgent)) {
                    window.location.href = 'tel:911';
                } else {
                    alert('Please dial 911 on your phone for emergency services.');
                }
            }
        });
    }
    
    // Error handling
    function showError(message) {
        errorMessage.textContent = message;
        loginError.classList.add('show');
        
        setTimeout(function() {
            loginError.classList.remove('show');
        }, 5000);
    }
    
    // Auto-fill demo credentials for testing
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('demo')) {
        document.getElementById('patientCode').value = 'ABC';
        document.getElementById('patientName').value = 'John Smith';
    }
});