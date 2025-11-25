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
passwordMessage.style.fontSize = '0.9em';
confirmMessage.style.fontSize = '0.9em';
passwordInput.insertAdjacentElement('afterend', passwordMessage);
confirmPasswordInput.insertAdjacentElement('afterend', confirmMessage);

// Validation helper functions
function validateEmail(email) {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    return passwordRegex.test(password);
}

function setInputState(input, isValid) {
    input.style.borderColor = isValid ? 'green' : 'red';
}

// Real-time validation
function validateFields() {
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const name = nameInput.value.replace(/\s+/g, ' ').trim();

    // Username validation
    setInputState(usernameInput, username.length >= 4);

    // Email validation
    setInputState(emailInput, validateEmail(email));

    // Password validation
    const passwordValid = validatePassword(password);
    setInputState(passwordInput, passwordValid);
    passwordMessage.style.color = passwordValid ? 'green' : 'red';
    passwordMessage.textContent = passwordValid
        ? 'Password looks good ✅'
        : 'Password must be 8+ chars, include uppercase, lowercase, number & special char';

    // Confirm password validation
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
    setInputState(confirmPasswordInput, passwordsMatch);
    confirmMessage.style.color = passwordsMatch ? 'green' : 'red';
    confirmMessage.textContent = passwordsMatch
        ? 'Passwords match ✅'
        : 'Passwords do not match';

    // Name validation
    setInputState(nameInput, name.length > 0);

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

    validateFields(); // Ensure everything is valid before submit
    if (createAccountBtn.disabled) return;

    const name = nameInput.value.trim();
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    const role = signupForm.role.value;

    // Clear previous error
    errorMessage.textContent = '';
    errorMessage.style.color = 'red';

    const data = { username, email, password, role, name };

    createAccountBtn.disabled = true;
    createAccountBtn.textContent = "Creating...";

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
        // Mark this user as newly created
        localStorage.setItem('isNewUser', 'true');
        sessionStorage.setItem('showWelcome', 'true');

        errorMessage.style.color = 'green';
        errorMessage.textContent = 'Account created successfully! Redirecting...';

        const normalizedRole = loginResult.role.replace("ROLE_", "").toLowerCase();
        setTimeout(() => {
            if (normalizedRole === 'professor') {
                window.location.href = '/frontend/webpages/professor-homepage.html';
            } else if (normalizedRole === 'student') {
                window.location.href = '/frontend/webpages/student-homepage.html';
            }
        }, 500);

    } catch (error) {
        console.error('Signup/Login error:', error);
        errorMessage.style.color = 'red';
        errorMessage.textContent = `Something went wrong: ${error.message}`;
    } finally {
        createAccountBtn.disabled = false;
        createAccountBtn.textContent = "Create Account";
    }
});
