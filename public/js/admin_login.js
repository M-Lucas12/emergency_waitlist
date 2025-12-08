// ===== SIMPLE ADMIN LOGIN JAVASCRIPT =====

// ===== DOM ELEMENTS =====
const adminLoginForm = document.getElementById('adminLoginForm');
const staffIdInput = document.getElementById('staffId');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const errorMessage = document.getElementById('errorMessage');
const loginLoading = document.getElementById('loginLoading');
const emergencyProtocolLink = document.getElementById('emergencyProtocolLink');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const rememberMeCheckbox = document.getElementById('rememberMe');

// 🔐 Demo credentials (use these to log in)
const MOCK_CREDENTIALS = {
    admin:  { password: 'password123', role: 'admin', name: 'Dr. Meredith Grey' },
    doctor: { password: 'doctor123',  role: 'admin', name: 'Dr. Derek Shepherd' },
    nurse:  { password: 'nurse123',   role: 'admin', name: 'Nurse Miranda Bailey' }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin Login Page Loaded');

    loadSavedCredentials();
    setupEventListeners();
    checkExistingSession();
});

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleLogin);
    }

    if (emergencyProtocolLink) {
        emergencyProtocolLink.addEventListener('click', handleEmergencyProtocol);
    }

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', handleForgotPassword);
    }

    if (staffIdInput) {
        staffIdInput.addEventListener('input', validateStaffId);
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', validatePassword);

        // block Ctrl+C / Ctrl+V / Ctrl+X in password
        passwordInput.addEventListener('keydown', e => {
            if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
                e.preventDefault();
            }
        });
    }
}

// ===== VALIDATION =====
function validateStaffId() {
    if (!staffIdInput) return false;
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
    if (!passwordInput) return false;
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

// ===== LOGIN HANDLER =====
function handleLogin(e) {
    e.preventDefault();

    if (!validateStaffId() || !validatePassword()) {
        showError('Please enter valid credentials');
        return;
    }

    const staffId = staffIdInput.value.trim();
    const password = passwordInput.value;
    const rememberMe = rememberMeCheckbox && rememberMeCheckbox.checked;
    const staffRole = 'admin'; // 🔒 fixed role for now

    showLoading(true);

    // Simulate API delay
    setTimeout(() => {
        const authResult = mockAdminAuthentication(staffId, password, staffRole);

        if (authResult.success) {
            saveAdminSession(staffId, authResult.name, staffRole, rememberMe);
            showSuccess('Authentication successful! Redirecting to dashboard...');

            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1200);
        } else {
            showError(authResult.message || 'Invalid credentials. Please try again.');
            showLoading(false);
            logFailedAttempt(staffId);
        }
    }, 800);
}

function mockAdminAuthentication(staffId, password, requestedRole) {
    const credentials = MOCK_CREDENTIALS[staffId];

    if (!credentials) {
        return { success: false, message: 'Invalid staff ID or password.' };
    }

    if (credentials.password !== password) {
        return { success: false, message: 'Invalid staff ID or password.' };
    }

    if (requestedRole !== credentials.role) {
        return { success: false, message: `Insufficient permissions for ${requestedRole} role.` };
    }

    return { success: true, name: credentials.name, role: credentials.role };
}

// ===== SESSION =====
function saveAdminSession(staffId, name, role, rememberMe) {
    const sessionData = {
        staffId,
        staffName: name,
        staffRole: role,
        loggedIn: true,
        loginTime: new Date().toISOString()
    };

    localStorage.setItem('adminSession', JSON.stringify(sessionData));

    if (rememberMe) {
        localStorage.setItem(
            'adminCredentials',
            JSON.stringify({ staffId, rememberMe: true })
        );
    } else {
        localStorage.removeItem('adminCredentials');
    }
}

function loadSavedCredentials() {
    try {
        const saved = JSON.parse(localStorage.getItem('adminCredentials'));
        if (saved && saved.rememberMe && saved.staffId && staffIdInput) {
            staffIdInput.value = saved.staffId;
            if (rememberMeCheckbox) rememberMeCheckbox.checked = true;
            validateStaffId();
        }
    } catch (e) {
        console.error('Error loading saved credentials', e);
    }
}

function checkExistingSession() {
    try {
        const session = JSON.parse(localStorage.getItem('adminSession') || '{}');
        if (session && session.loggedIn) {
            const loginTime = new Date(session.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);

            if (hoursDiff < 2) {
                // already logged in → go straight to dashboard
                window.location.href = 'admin.html';
            } else {
                localStorage.removeItem('adminSession');
            }
        }
    } catch (e) {
        console.error('Error checking session', e);
    }
}

// ===== UI HELPERS =====
function showLoading(show) {
    if (!loginLoading || !loginBtn) return;
    if (show) {
        loginLoading.classList.add('show');
        loginBtn.disabled = true;
        if (loginError) loginError.classList.remove('show');
    } else {
        loginLoading.classList.remove('show');
        loginBtn.disabled = false;
    }
}

function showError(message) {
    if (!loginError || !errorMessage) return;
    errorMessage.textContent = message;
    loginError.classList.add('show');

    setTimeout(() => {
        loginError.classList.remove('show');
    }, 5000);
}

function showSuccess(message) {
    if (!adminLoginForm) return;

    const successDiv = document.createElement('div');
    successDiv.className = 'login-error';
    successDiv.style.backgroundColor = 'rgba(60,179,113,0.1)';
    successDiv.style.borderColor = 'rgba(60,179,113,0.2)';
    successDiv.style.color = 'var(--stable-green)';
    successDiv.innerHTML = `<i class="fas fa-check-circle"></i> <span>${message}</span>`;

    adminLoginForm.parentNode.insertBefore(successDiv, adminLoginForm);

    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.parentNode.removeChild(successDiv);
        }
    }, 3000);
}

// ===== EXTRA HANDLERS (emergency + forgot pwd) =====
function handleEmergencyProtocol(e) {
    e.preventDefault();
    if (confirm('🚨 Activate emergency protocol?')) {
        const code = prompt('Enter emergency authorization code:');
        if (code === '911' || code === 'EMER') {
            alert('Emergency protocol activated (demo).');
        } else {
            showError('Invalid authorization code.');
        }
    }
}

function handleForgotPassword(e) {
    e.preventDefault();
    const staffId = prompt('Please enter your Staff ID:');
    if (staffId && staffId.trim()) {
        showSuccess('If this Staff ID exists, reset instructions will be sent.');
    } else if (staffId !== null) {
        showError('Please enter a valid Staff ID.');
    }
}

// ===== FAILED ATTEMPTS TRACKING =====
function logFailedAttempt(staffId) {
    const store = JSON.parse(localStorage.getItem('failedLoginAttempts') || '{}');
    store[staffId] = (store[staffId] || 0) + 1;
    localStorage.setItem('failedLoginAttempts', JSON.stringify(store));
}