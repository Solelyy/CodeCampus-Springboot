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
        const response = await fetch("http://localhost:8080/api/users/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.status === "success") {
            errorMessage.style.color = 'rgb(119, 211, 119)';
            errorMessage.textContent = 'Sign in successful! Redirecting...';

            /* Save user info to localStorage (optional)
            localStorage.setItem("user", JSON.stringify(result)); */

            // Redirect based on role
            setTimeout(() => {
                if (result.role === "professor") {
                    window.location.href = "/frontend/webpages/professor-homepage.html";
                } else if (result.role === "student") {
                    window.location.href = "/frontend/webpages/student-homepage.html";
                } else {
                    window.location.href = "/frontend/webpages/index.html";
                }
            }, 1000);
        } else {
            errorMessage.style.color = 'rgb(255, 148, 148)';
            errorMessage.textContent = result.message || 'Incorrect username or password.';
            signInBtn.disabled = false; // Re-enable button
            signInBtn.textContent = 'Sign In';
        }
    } catch (error) {
        console.error('Error during sign-in:', error);
        errorMessage.style.color = 'rgb(255, 148, 148)';
        errorMessage.textContent = 'Something went wrong. Please try again.';

        signInBtn.disabled = false;
        signInBtn.textContent = 'Sign In';
    }
});