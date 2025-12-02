const signupForm = document.getElementById('signupForm');
const errorMessage = document.getElementById('error-message');
const createAccountBtn = document.getElementById('createAccount-btn');

const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const nameInput = document.getElementById('name');

// Create inline message elements
const passwordMessage = document.createElement('div');
const confirmMessage = document.createElement('div');
const usernameMessage = document.createElement('div');
const emailMessage = document.createElement('div');
const nameMessage = document.createElement('div');

passwordMessage.className = 'validation-message';
confirmMessage.className = 'validation-message';
usernameMessage.className = 'validation-message';
emailMessage.className = 'validation-message';
nameMessage.className = 'validation-message';

passwordInput.insertAdjacentElement('afterend', passwordMessage);
confirmPasswordInput.insertAdjacentElement('afterend', confirmMessage);
usernameInput.insertAdjacentElement('afterend', usernameMessage);
emailInput.insertAdjacentElement('afterend', emailMessage);
nameInput.insertAdjacentElement('afterend', nameMessage);

// Create password strength indicator
const strengthIndicator = document.createElement('div');
strengthIndicator.className = 'strength-indicator';
strengthIndicator.innerHTML = `
    <div class="strength-bars">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
    </div>
    <span class="strength-text">Password strength</span>
`;
passwordMessage.insertAdjacentElement('afterend', strengthIndicator);

// Validation helper functions
function validateEmail(email) {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    return passwordRegex.test(password);
}

function getPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    return Math.min(strength, 4);
}

function updateStrengthIndicator(strength) {
    const bars = strengthIndicator.querySelectorAll('.bar');
    const strengthText = strengthIndicator.querySelector('.strength-text');
    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['#ff4757', '#ffa502', '#f39c12', '#66C355'];
    
    bars.forEach((bar, index) => {
        if (index < strength) {
            bar.classList.add('active');
            bar.style.backgroundColor = colors[strength - 1];
        } else {
            bar.classList.remove('active');
            bar.style.backgroundColor = '';
        }
    });
    
    strengthText.textContent = strength > 0 ? labels[strength - 1] : 'Password strength';
    strengthText.style.color = strength > 0 ? colors[strength - 1] : '';
}

function setInputState(input, isValid, message = '') {
    const parent = input.closest('.textbox');
    if (isValid) {
        parent.classList.add('valid');
        parent.classList.remove('invalid');
        input.classList.add('valid-input');
        input.classList.remove('invalid-input');
    } else if (input.value.length > 0) {
        parent.classList.add('invalid');
        parent.classList.remove('valid');
        input.classList.add('invalid-input');
        input.classList.remove('valid-input');
    } else {
        parent.classList.remove('valid', 'invalid');
        input.classList.remove('valid-input', 'invalid-input');
    }
}

// Real-time validation
function validateFields() {
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const name = nameInput.value.replace(/\s+/g, ' ').trim();

    // Username validation
    const usernameValid = username.length >= 4;
    setInputState(usernameInput, usernameValid);
    if (username.length > 0) {
        usernameMessage.textContent = usernameValid 
            ? '✓ Username looks good' 
            : '✗ Username must be at least 4 characters';
        usernameMessage.className = usernameValid ? 'validation-message success' : 'validation-message error';
    } else {
        usernameMessage.textContent = '';
    }

    // Email validation
    const emailValid = validateEmail(email);
    setInputState(emailInput, emailValid);
    if (email.length > 0) {
        emailMessage.textContent = emailValid 
            ? '✓ Email is valid' 
            : '✗ Please enter a valid email';
        emailMessage.className = emailValid ? 'validation-message success' : 'validation-message error';
    } else {
        emailMessage.textContent = '';
    }

    // Password validation with strength indicator
    const passwordValid = validatePassword(password);
    setInputState(passwordInput, passwordValid);
    const strength = getPasswordStrength(password);
    
    if (password.length > 0) {
        updateStrengthIndicator(strength);
        if (passwordValid) {
            passwordMessage.textContent = '✓ Strong password';
            passwordMessage.className = 'validation-message success';
        } else {
            const missing = [];
            if (password.length < 8) missing.push('8+ characters');
            if (!/[A-Z]/.test(password)) missing.push('uppercase');
            if (!/[a-z]/.test(password)) missing.push('lowercase');
            if (!/\d/.test(password)) missing.push('number');
            if (!/[@$!%*?&]/.test(password)) missing.push('special char');
            passwordMessage.textContent = `✗ Need: ${missing.join(', ')}`;
            passwordMessage.className = 'validation-message error';
        }
    } else {
        updateStrengthIndicator(0);
        passwordMessage.textContent = '';
    }

    // Confirm password validation
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
    setInputState(confirmPasswordInput, passwordsMatch);
    if (confirmPassword.length > 0) {
        confirmMessage.textContent = passwordsMatch 
            ? '✓ Passwords match' 
            : '✗ Passwords do not match';
        confirmMessage.className = passwordsMatch ? 'validation-message success' : 'validation-message error';
    } else {
        confirmMessage.textContent = '';
    }

    // Name validation
    const nameValid = name.length > 0;
    setInputState(nameInput, nameValid);
    if (name.length > 0) {
        nameMessage.textContent = nameValid 
            ? '✓ Name looks good' 
            : '✗ Name is required';
        nameMessage.className = nameValid ? 'validation-message success' : 'validation-message error';
    } else {
        nameMessage.textContent = '';
    }

    // Enable/disable create account button
    createAccountBtn.disabled = !(
        username.length >= 4 &&
        validateEmail(email) &&
        passwordValid &&
        passwordsMatch &&
        name.length > 0
    );
}

// Attach input listeners for real-time validation
[usernameInput, emailInput, passwordInput, confirmPasswordInput, nameInput].forEach(input => {
    input.addEventListener('input', validateFields);
});

// Form submission
signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    validateFields();
    if (createAccountBtn.disabled) return;

    const name = nameInput.value.trim();
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    const role = signupForm.role.value;

    errorMessage.textContent = '';

    const data = { username, email, password, role, name };

    createAccountBtn.disabled = true;
    createAccountBtn.innerHTML = '<span class="spinner"></span>Creating...';

    try {
        const signupResponse = await fetch('http://localhost:8081/api/users/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const signupResult = await signupResponse.json();
        if (signupResult.status !== "success") {
            throw new Error(signupResult.message || "Signup failed. Please try again.");
        }

        // Auto-login after signup
        const loginResponse = await fetch('http://localhost:8081/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!loginResponse.ok) {
            throw new Error('Signup succeeded but auto-login failed.');
        }

        const loginResult = await loginResponse.json();
        if (!loginResult.token) {
            throw new Error('Login succeeded but no token was returned.');
        }

        localStorage.setItem('token', loginResult.token);
        localStorage.setItem('username', loginResult.username);
        localStorage.setItem('role', loginResult.role);
        localStorage.setItem('isNewUser', 'true');
        sessionStorage.setItem('showWelcome', 'true');

        errorMessage.className = 'success-message';
        errorMessage.textContent = '✓ Account created successfully! Redirecting...';

        const normalizedRole = loginResult.role.replace("ROLE_", "").toLowerCase();
        setTimeout(() => {
            if (normalizedRole === 'professor') {
                window.location.href = '/frontend/webpages/professor-homepage.html';
            } else if (normalizedRole === 'student') {
                window.location.href = '/frontend/webpages/student-homepage.html';
            }
        }, 1000);

    } catch (error) {
        console.error('Signup/Login error:', error);
        errorMessage.className = 'error-message';
        errorMessage.textContent = `✗ ${error.message}`;
    } finally {
        if (!errorMessage.classList.contains('success-message')) {
            createAccountBtn.disabled = false;
            createAccountBtn.innerHTML = 'Create Account';
        }
    }
});
