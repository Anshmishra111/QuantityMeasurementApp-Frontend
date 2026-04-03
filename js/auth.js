const BASE_URL = 'http://localhost:8081';

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
            let users = JSON.parse(localStorage.getItem('mockUsers') || '[]');
            const existingUser = users.find(u => u.email === email);
            
            if (existingUser) {
                alert('Account already exists. Please login.');
                loginTab.click();
                return;
            }

            const newUser = { id: Date.now(), email, password };
            users.push(newUser);
            localStorage.setItem('mockUsers', JSON.stringify(users));

            alert('Account created successfully! Please login.');
            loginTab.click();
        } catch (error) {
            console.error('Error in signup:', error);
            alert('Something went wrong during signup.');
        }
    });

    // Login Form Handler
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            let users = JSON.parse(localStorage.getItem('mockUsers') || '[]');
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                // Success
                const mockToken = btoa(email + new Date().getTime());
                localStorage.setItem('currentUser', JSON.stringify({ email: user.email, token: mockToken, id: user.id }));
                window.location.href = 'dashboard.html';
            } else {
                alert('Invalid email or password.');
            }
        } catch (error) {
            console.error('Error in login:', error);
            alert('Something went wrong during login.');
        }
    });
});
