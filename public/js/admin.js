// admin_login.js - Admin login functionality

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('adminLoginForm');
    const loginError = document.getElementById('loginError');
    const loginLoading = document.getElementById('loginLoading');
    const errorMessage = document.getElementById('errorMessage');
    const emergencyProtocolLink = document.getElementById('emergencyProtocolLink');
    
    // Form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const staffId = document.getElementById('staffId').value.trim();
            const password = document.getElementById('password').value;
            
            // Simple validation
            if (!staffId) {
                showError('Please enter your staff ID');
                return;
            }
            
            if (password.length < 6) {
                showError('Password must be at least 6 characters');
                return;
            }
            
            // Show loading
            loginLoading.classList.add('show');
            
            // Simulate API call
            setTimeout(function() {
                // Demo credentials
                if ((staffId === 'admin' && password === 'password123') || 
                    (staffId === 'doctor' && password === 'doctor123') ||
                    (staffId === 'nurse' && password === 'nurse123')) {
                    
                    // Determine role
                    let staffName, staffRole;
                    if (staffId === 'admin') {
                        staffName = 'Dr. Meredith Grey';
                        staffRole = 'Chief of Surgery';
                    } else if (staffId === 'doctor') {
                        staffName = 'Dr. Derek Shepherd';
                        staffRole = 'Neurosurgeon';
                    } else {
                        staffName = 'Nurse Miranda Bailey';
                        staffRole = 'Head Nurse';
                    }
                    
                    // Successful login
                    localStorage.setItem('adminSession', JSON.stringify({
                        loggedIn: true,
                        staffId: staffId,
                        staffName: staffName,
                        staffRole: staffRole,
                        loginTime: new Date().toISOString()
                    }));
                    
                    // Redirect to admin dashboard
                    window.location.href = 'admin.html';
                } else {
                    showError('Invalid credentials. Please try again.');
                }
                
                loginLoading.classList.remove('show');
            }, 1000);
        });
    }
    
    // Emergency protocol
    if (emergencyProtocolLink) {
        emergencyProtocolLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Activate emergency protocol? This will notify all available staff.')) {
                alert('Emergency protocol activated. All staff have been notified.');
            }
        });
    }
    
    // Forgot password
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Please contact the IT department at ext. 5555 to reset your password.');
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
        document.getElementById('staffId').value = 'admin';
        document.getElementById('password').value = 'password123';
    }
});