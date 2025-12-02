// Role toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const roleButtons = document.querySelectorAll('.role-btn');
    const featureLists = document.querySelectorAll('.features');

    roleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetRole = button.getAttribute('data-role');
            
            // Update active button
            roleButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Toggle feature lists with animation
            featureLists.forEach(list => {
                if (list.getAttribute('data-role') === targetRole) {
                    list.classList.remove('hidden');
                    // Reset animations for immediate effect
                    const items = list.querySelectorAll('li');
                    items.forEach((item, index) => {
                        item.style.animation = 'none';
                        setTimeout(() => {
                            item.style.animation = `fadeUp 0.4s ease forwards`;
                            item.style.animationDelay = `${index * 0.1}s`;
                        }, 10);
                    });
                } else {
                    list.classList.add('hidden');
                }
            });
        });
    });
});

const signInForm = document.getElementById('sign-in-form');
const errorMessage = document.getElementById('error-message');
const signInBtn = document.getElementById('sign-in-btn');
const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('toggle-password');

//Password hide/unhide
let isPasswordVisible = false;

togglePassword.addEventListener("click", () => {
    isPasswordVisible = !isPasswordVisible;

    if (isPasswordVisible) {
        passwordInput.type = "text";
        togglePassword.src = "/frontend/assets/icons/icon-show.png";
    } else {
        passwordInput.type = "password";
        togglePassword.src = "/frontend/assets/icons/icon-hide.png";
    }
})

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
        signInBtn.textContent = 'Signing in...';
        const response = await fetch("http://localhost:8081/api/users/login", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        console.log(response);

        // Handle error responses
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ error: 'Incorrect username or password.' }));

            if (response.status === 423) {
                // Account locked
                throw new Error(errorBody.error || 'Maximum login attempts reached. Account locked for 15 minutes.');
            } else if (response.status === 401) {
                // Wrong password
                throw new Error(errorBody.error || 'Incorrect username or password.');
            } else if (response.status === 404) {
                // User not found
                throw new Error(errorBody.error || 'Incorrect username or password.');
            } else {
                throw new Error(errorBody.error || 'Something went wrong. Please try again.');
            }
        }

        const result = await response.json();
        if (!result.token) {
            throw new Error('Login succeeded but no token was returned.');
        }

        console.log(response);

        localStorage.setItem('token', result.token);
        localStorage.setItem('username', result.username);
        localStorage.setItem('role', result.role);
        localStorage.setItem('isNewUser', 'false');
        sessionStorage.setItem('showWelcome', 'false');

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
        localStorage.removeItem('isNewUser');
        sessionStorage.clear();
    }finally {
        signInBtn.disabled = false;
        signInBtn.textContent = 'Sign In';
    }
});