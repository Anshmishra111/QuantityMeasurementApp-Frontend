const BASE_URL = 'http://localhost:8082';

document.addEventListener('DOMContentLoaded', () => {
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    // Tab Switching Logic
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    });

    signupTab.addEventListener('click', () => {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    });

    // Toggle Password Visibility
    const togglePassword = (inputId, iconId) => {
        const input = document.getElementById(inputId);
        const icon = document.getElementById(iconId);
        icon.addEventListener('click', () => {
            if (input.type === 'password') {
                input.type = 'text';
                icon.setAttribute('name', 'eye-outline');
            } else {
                input.type = 'password';
                icon.setAttribute('name', 'eye-off-outline');
            }
        });
    };

    togglePassword('regPassword', 'regTogglePwd');
    togglePassword('loginPassword', 'loginTogglePwd');

    // Registration Form Handler
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        try {
            const res = await fetch(`${BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Backend AuthRequest expects username and password
                body: JSON.stringify({ username: email, password: password })
            });

            if (res.ok) {
                alert('Account created successfully! Please login.');
                loginTab.click();
            } else {
                alert('Could not create account to the Backend.');
            }
        } catch (error) {
            console.error('Error in signup:', error);
            alert('Could not connect to Spring Boot Server on port 8082.');
        }
    });

    // Login Form Handler
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const res = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, password: password })
            });
            
            if (res.ok) {
                const token = await res.text(); // Backend returns JWT string
                // Success
                localStorage.setItem('currentUser', JSON.stringify({ email: email, token: token }));
                window.location.href = 'dashboard.html';
            } else {
                alert('Invalid email or password.');
            }
        } catch (error) {
            console.error('Error in login:', error);
            alert('Could not connect to Spring Boot Server on port 8082.');
        }
    });
});
