// ===== ADMIN LOGIN JAVASCRIPT =====

// ===== DOM ELEMENTS =====
const adminLoginForm = document.getElementById('adminLoginForm');
const staffIdInput = document.getElementById('staffId');
const passwordInput = document.getElementById('password');
const staffRoleInputs = document.querySelectorAll('input[name="staffRole"]');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const errorMessage = document.getElementById('errorMessage');
const loginLoading = document.getElementById('loginLoading');
const emergencyProtocolLink = document.getElementById('emergencyProtocolLink');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const biometricLoginBtn = document.getElementById('biometricLoginBtn');
const accessCardBtn = document.getElementById('accessCardBtn');
const rememberMeCheckbox = document.getElementById('rememberMe');

// Mock credentials for demo (in production, this would be server-side)
const MOCK_CREDENTIALS = {
    'triage1': { password: 'triage123', role: 'triage', name: 'Nurse Johnson' },
    'doctor1': { password: 'doctor123', role: 'doctor', name: 'Dr. Smith' },
    'admin1': { password: 'admin123', role: 'admin', name: 'Admin User' },
    'staff': { password: 'staff123', role: 'triage', name: 'Staff Member' }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Login Page Loaded');
    
    // Load saved credentials if "Remember me" was checked
    loadSavedCredentials();
    
    // Setup event listeners
    setupEventListeners();
    
    // Check if admin is already logged in
    checkExistingSession();
});

// ===== EVENT LISTENERS SETUP =====
function setupEventListeners() {
    // Form submission
    adminLoginForm.addEventListener('submit', handleLogin);
    
    // Emergency protocol link
    emergencyProtocolLink.addEventListener('click', handleEmergencyProtocol);
    
    // Forgot password link
    forgotPasswordLink.addEventListener('click', handleForgotPassword);
    
    // Biometric login button
    biometricLoginBtn.addEventListener('click', handleBiometricLogin);
    
    // Access card button
    accessCardBtn.addEventListener('click', handleAccessCardLogin);
    
    // Real-time validation
    staffIdInput.addEventListener('input', validateStaffId);
    passwordInput.addEventListener('input', validatePassword);
}

// ===== VALIDATION FUNCTIONS =====
function validateStaffId() {
    const staffId = staffIdInput.value.trim();
    
    if (staffId.length >= 3) {
        staffIdInput.style.borderColor = 'var(--stable-green)';
        return true;
    } else if (staffId.length > 0) {
        staffIdInput.style.borderColor = 'var(--critical-red)';
        return false;
    } else {
        staffIdInput.style.borderColor = 'var(--soft-grey)';
        return false;
    }
}

function validatePassword() {
    const password = passwordInput.value;
    
    if (password.length >= 6) {
        passwordInput.style.borderColor = 'var(--stable-green)';
        return true;
    } else if (password.length > 0) {
        passwordInput.style.borderColor = 'var(--critical-red)';
        return false;
    } else {
        passwordInput.style.borderColor = 'var(--soft-grey)';
        return false;
    }
}

// ===== LOGIN HANDLING =====
async function handleLogin(e) {
    e.preventDefault();
    
    // Validate inputs
    if (!validateStaffId() || !validatePassword()) {
        showError('Please enter valid credentials');
        return;
    }
    
    const staffId = staffIdInput.value.trim();
    const password = passwordInput.value;
    const staffRole = document.querySelector('input[name="staffRole"]:checked').value;
    const rememberMe = rememberMeCheckbox.checked;
    
    // Show loading state
    showLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
        // Mock authentication logic
        const authResult = mockAdminAuthentication(staffId, password, staffRole);
        
        if (authResult.success) {
            // Save session
            saveAdminSession(staffId, authResult.name, staffRole, rememberMe);
            
            // Show success message
            showSuccess('Authentication successful! Redirecting to dashboard...');
            
            // Redirect to admin portal
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1500);
        } else {
            // Show error
            showError(authResult.message || 'Invalid credentials. Please try again.');
            showLoading(false);
            
            // Log failed attempt (in production, this would be server-side)
            logFailedAttempt(staffId);
        }
    }, 1500);
}

function mockAdminAuthentication(staffId, password, requestedRole) {
    // Mock authentication logic
    // In a real system, this would call a secure API
    
    const credentials = MOCK_CREDENTIALS[staffId];
    
    if (!credentials) {
        return {
            success: false,
            message: 'Invalid staff ID or password.'
        };
    }
    
    if (credentials.password !== password) {
        return {
            success: false,
            message: 'Invalid staff ID or password.'
        };
    }
    
    // Check role permissions
    if (requestedRole !== credentials.role) {
        return {
            success: false,
            message: `Insufficient permissions for ${requestedRole} role.`
        };
    }
    
    return {
        success: true,
        name: credentials.name,
        role: credentials.role
    };
}

// ===== SESSION MANAGEMENT =====
function saveAdminSession(staffId, name, role, rememberMe) {
    const sessionData = {
        staffId: staffId,
        staffName: name,
        staffRole: role,
        loggedIn: true,
        loginTime: new Date().toISOString(),
        sessionId: generateSessionId(),
        permissions: getRolePermissions(role)
    };
    
    // Save to localStorage
    localStorage.setItem('adminSession', JSON.stringify(sessionData));
    
    // Save credentials if "Remember me" is checked
    if (rememberMe) {
        const credentials = {
            staffId: staffId,
            rememberMe: true
        };
        localStorage.setItem('adminCredentials', JSON.stringify(credentials));
    } else {
        localStorage.removeItem('adminCredentials');
    }
    
    // Set session cookie (for demo purposes)
    document.cookie = `adminSession=${sessionData.sessionId}; path=/; max-age=7200`; // 2 hours for security
}

function loadSavedCredentials() {
    try {
        const savedCredentials = JSON.parse(localStorage.getItem('adminCredentials'));
        
        if (savedCredentials && savedCredentials.rememberMe) {
            staffIdInput.value = savedCredentials.staffId || '';
            rememberMeCheckbox.checked = true;
            
            // Validate loaded credentials
            validateStaffId();
        }
    } catch (error) {
        console.error('Error loading saved credentials:', error);
    }
}

function checkExistingSession() {
    try {
        const session = JSON.parse(localStorage.getItem('adminSession'));
        
        if (session && session.loggedIn) {
            // Check if session is still valid (less than 2 hours old for security)
            const loginTime = new Date(session.loginTime);
            const currentTime = new Date();
            const hoursDiff = (currentTime - loginTime) / (1000 * 60 * 60);
            
            if (hoursDiff < 2) {
                // Auto-redirect to admin portal
                window.location.href = 'admin.html';
            } else {
                // Session expired
                localStorage.removeItem('adminSession');
                showError('Your session has expired. Please log in again.');
            }
        }
    } catch (error) {
        console.error('Error checking session:', error);
    }
}

function generateSessionId() {
    return 'admin_session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 12);
}

// ===== SECURITY FUNCTIONS =====
function logFailedAttempt(staffId) {
    // In production, this would be sent to a server
    console.warn(`Failed login attempt for staff ID: ${staffId}`);
    
    // Track failed attempts locally (for demo)
    const failedAttempts = JSON.parse(localStorage.getItem('failedLoginAttempts') || '{}');
    failedAttempts[staffId] = (failedAttempts[staffId] || 0) + 1;
    localStorage.setItem('failedLoginAttempts', JSON.stringify(failedAttempts));
    
    // Implement lockout after 5 failed attempts
    if (failedAttempts[staffId] >= 5) {
        showError('Too many failed attempts. Account temporarily locked for 15 minutes');
        // In production, would lock account for 15 minutes
        setTimeout(() => {
            delete failedAttempts[staffId];
            localStorage.setItem('failedLoginAttempts', JSON.stringify(failedAttempts));
        }, 900000); // 15 minutes
    }
}

// ===== UI HELPER FUNCTIONS =====
function showLoading(show) {
    if (show) {
        loginLoading.classList.add('show');
        loginBtn.disabled = true;
        loginError.classList.remove('show');
    } else {
        loginLoading.classList.remove('show');
        loginBtn.disabled = false;
    }
}

function showError(message) {
    errorMessage.textContent = message;
    loginError.classList.add('show');
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
        loginError.classList.remove('show');
    }, 5000);
}

function showSuccess(message) {
    // Create success message
    const successDiv = document.createElement('div');
    successDiv.className = 'login-error';
    successDiv.style.backgroundColor = 'rgba(60, 179, 113, 0.1)';
    successDiv.style.borderColor = 'rgba(60, 179, 113, 0.2)';
    successDiv.style.color = 'var(--stable-green)';
    successDiv.innerHTML = `<i class="fas fa-check-circle"></i> <span>${message}</span>`;
    
    // Insert before form
    adminLoginForm.parentNode.insertBefore(successDiv, adminLoginForm);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.parentNode.removeChild(successDiv);
        }
    }, 3000);
}

// ===== EVENT HANDLERS =====
function handleEmergencyProtocol(e) {
    e.preventDefault();
    
    if (confirm('🚨 EMERGENCY PROTOCOL ACTIVATION\n\nThis will trigger hospital-wide emergency procedures.\n\nAre you authorized to activate emergency protocol?')) {
        const code = prompt('Enter emergency authorization code:');
        
        if (code === '911' || code === 'EMER') {
            alert('Emergency protocol activated. All staff notified.');
            // In production, would trigger actual emergency procedures
        } else {
            showError('Invalid authorization code. Protocol not activated.');
        }
    }
}

function handleForgotPassword(e) {
    e.preventDefault();
    
    const staffId = prompt('Please enter your Staff ID:');
    
    if (staffId && staffId.trim()) {
        showSuccess('If this Staff ID exists, password reset instructions will be sent to the registered email.');
        
        // Simulate sending reset email
        setTimeout(() => {
            alert('📧 Password reset instructions have been sent to the email associated with this Staff ID.');
        }, 1000);
    } else if (staffId !== null) {
        showError('Please enter a valid Staff ID.');
    }
}

// ===== INPUT SECURITY =====
passwordInput.addEventListener('keydown', function(e) {
    // Prevent copy/paste in password field for security
    if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        e.preventDefault();
    }
});

// ===== AUTO-LOGOUT TIMER =====
let inactivityTimer;
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(logoutDueToInactivity, INACTIVITY_TIMEOUT);
}

function logoutDueToInactivity() {
    if (localStorage.getItem('adminSession')) {
        localStorage.removeItem('adminSession');
        showError('Logged out due to inactivity. Please log in again.');
        resetInactivityTimer();
    }
}

// Set up activity listeners
['mousemove', 'keydown', 'click', 'scroll'].forEach(event => {
    document.addEventListener(event, resetInactivityTimer);
});

// Initialize timer
resetInactivityTimer();