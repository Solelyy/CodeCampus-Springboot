const signInForm = document.getElementById('sign-in-form');
const errorMessage = document.getElementById('error-message');
const signInBtn = document.getElementById('sign-in-btn');

function checkFormValues() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    signInBtn.disabled = !(username && password);
}

// Update on input
signInForm.addEventListener('input', checkFormValues);

// Form submission
signInForm.addEventListener('submit', async (event) => {
    event.preventDefault(); //Prevent default form submission

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Clear previous errors
    errorMessage.textContent = '';
    errorMessage.style.color = 'rgb(255, 148, 148)';

    //Check for empty fields
    if (!username || !password) {
        errorMessage.textContent = 'All fields are required!';
        return;
    }

    const data = {username, password};

    try {
        signInBtn.disabled = true; // Disable button to prevent multiple submissions
        signInBtn.textContent = 'Signing In...';
        const response = await fetch("http://localhost:8081/api/users/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ error: 'Incorrect username or password.' }));
            throw new Error(errorBody.error || 'Incorrect username or password.');
        }

        const result = await response.json();
        if (!result.token) {
            throw new Error('Login succeeded but no token was returned.');
        }

        localStorage.setItem('token', result.token);
        localStorage.setItem('username', result.username);
        localStorage.setItem('role', result.role);

        errorMessage.style.color = 'rgb(119, 211, 119)';
        errorMessage.textContent = 'Sign in successful! Redirecting...';
        
        // Redirect based on role
        setTimeout(() => {
            if (result.role === "ROLE_PROFESSOR") {
                window.location.href = "/frontend/webpages/professor-homepage.html";
            } else if (result.role === "ROLE_STUDENT") {
                window.location.href = "/frontend/webpages/student-homepage.html";
            } else {
                window.location.href = "/index.html";
            }
        }, 500);
    } catch (error) {
        console.error('Error during sign-in:', error);
        errorMessage.style.color = 'rgb(255, 148, 148)';
        errorMessage.textContent = error.message || 'Something went wrong. Please try again.';
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
    }finally {
        signInBtn.disabled = false;
        signInBtn.textContent = 'Sign In';
    }
});