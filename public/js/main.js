// main.js - Home page functionality

document.addEventListener('DOMContentLoaded', function() {
    // Login modal functionality
    const startTriageBtn = document.getElementById('startTriageBtn');
    const loginModal = document.getElementById('loginModal');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const cancelLoginBtn = document.getElementById('cancelLoginBtn');
    const modalPatientBtn = document.getElementById('modalPatientBtn');
    const modalAdminBtn = document.getElementById('modalAdminBtn');
    
    // Emergency call button
    const emergencyCallBtn = document.getElementById('emergencyCallBtn');
    
    if (startTriageBtn) {
        startTriageBtn.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.classList.add('active');
        });
    }
    
    if (closeLoginModal) {
        closeLoginModal.addEventListener('click', function() {
            loginModal.classList.remove('active');
        });
    }
    
    if (cancelLoginBtn) {
        cancelLoginBtn.addEventListener('click', function() {
            loginModal.classList.remove('active');
        });
    }
    
    if (modalPatientBtn) {
        modalPatientBtn.addEventListener('click', function() {
            window.location.href = 'user_login.html';
        });
    }
    
    if (modalAdminBtn) {
        modalAdminBtn.addEventListener('click', function() {
            window.location.href = 'admin_login.html';
        });
    }
    
    // Emergency call button
    if (emergencyCallBtn) {
        emergencyCallBtn.addEventListener('click', function() {
            if (confirm('Call 911 for emergency services?')) {
                // Note: This will only work on mobile devices
                // For desktop, we show a message
                if (/Mobi|Android/i.test(navigator.userAgent)) {
                    window.location.href = 'tel:911';
                } else {
                    alert('Please dial 911 on your phone for emergency services.');
                }
            }
        });
    }
    
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.main-nav .nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            loginModal.classList.remove('active');
        }
    });
    
    // Demo data for patient session (for testing)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('demo')) {
        localStorage.setItem('patientSession', JSON.stringify({
            loggedIn: true,
            patientCode: 'ABC',
            patientName: 'John Smith',
            injuryType: 'Chest Pain',
            painLevel: 8,
            priority: 'critical',
            waitTime: 0,
            arrivalTime: new Date().toISOString()
        }));
        
        localStorage.setItem('adminSession', JSON.stringify({
            loggedIn: true,
            staffName: 'Dr. Meredith Grey',
            staffRole: 'Chief of Surgery',
            staffId: 'GSM001'
        }));
        
        alert('Demo data loaded! You can now access both patient and admin portals.');
    }
});