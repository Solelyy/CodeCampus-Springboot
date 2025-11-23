const signupForm = document.getElementById('signupForm');
const errorMessage = document.getElementById('error-message');
const createAccountBtn = document.getElementById('createAccount-btn');

// Enable/disable button based on input
function checkFormValues() {
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const firstName = document.getElementById('firstName').value.replace(/\s+/g, ' ').trim();
    const lastName = document.getElementById('lastName').value.replace(/\s+/g, ' ').trim();

    createAccountBtn.disabled = !(username && email && password && confirmPassword && lastName && firstName);
}

signupForm.addEventListener('input', checkFormValues);

// Form submission
signupForm.addEventListener('submit', async (event) => {
    event.preventDefault(); //Prevent default form submission

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const role = signupForm.role.value;

    // Clear previous errors
    errorMessage.textContent = '';
    errorMessage.style.color = 'red';

    //Check for empty fields
    if (!username || !email || !password || !confirmPassword || !lastName || !firstName) {
        errorMessage.textContent = 'All fields are required!';
        return;
    }

    //Username Validation
    if (username.length < 4) {
        errorMessage.textContent = 'Username must be at least 4 characters long.';
        return;
    }

    // Basic email format validation
    const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/;
    if (!emailRegex.test(email)) {
        errorMessage.textContent = 'Please enter a valid email address.';
        return;
    }

    //Password Validation
    if (password.length < 8) {
        errorMessage.textContent = 'Password must be at least 8 characters long.';
        return;
    }

    //Password strength validation
    const passwordRegex= /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(password)) {
        errorMessage.textContent = "Password must contain uppercase, lowercase, number, and special character.";
        return;
    }

    //Check if passwords match
    if (password !== confirmPassword) {
        errorMessage.textContent = 'Passwords do not match!';
        return;
    }

    const data = {username, email, password, role, firstName, lastName};

    createAccountBtn.disabled = true;
    createAccountBtn.textContent = "Creating...";
    
try {
        // Sign up
        const signupResponse = await fetch('http://localhost:8081/api/users/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role, firstName, lastName })
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

        // Store token and user info in localStorage
        localStorage.setItem('token', loginResult.token);
        localStorage.setItem('username', loginResult.username);
        localStorage.setItem('role', loginResult.role);

        // Show success message
        errorMessage.style.color = 'green';
        errorMessage.textContent = 'Account created successfully! Redirecting...';

        // Redirect based on role
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
