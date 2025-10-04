const signupForm = document.getElementById('signupForm');
const errorMessage = document.getElementById('error-message');
const createAccountBtn = document.getElementById('createAccount-btn');

// Enable/disable button based on input
function checkFormValues() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    createAccountBtn.disabled = !(username && password && confirmPassword);
}

signupForm.addEventListener('input', checkFormValues);

// Form submission
signupForm.addEventListener('submit', async (event) => {
    event.preventDefault(); //Prevent default form submission

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const role = signupForm.role.value;

    // Clear previous errors
    errorMessage.textContent = '';
    errorMessage.style.color = 'red';

    //Check for empty fields
    if (!username || !password || !confirmPassword) {
        errorMessage.textContent = 'All fields are required!';
        return;
    }

    //Username Validation
    if (username.length < 4) {
        errorMessage.textContent = 'Username must be at least 4 characters long.';
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

    const data = {username, password, role};

    try {
        createAccountBtn.disabled = true; //Disable button while processing
        createAccountBtn.textContent = "Creating...";

        const response = await fetch('http://localhost:8080/api/users/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result= await response.json();

        if (result.status === "success") {
        // Show success message
        errorMessage.style.color = 'green';
        errorMessage.textContent = 'Account created successfully! Redirecting to login...';

        //Redirect based on role after 1 second
        setTimeout(() => {
            if (role === 'professor') {
                window.location.href = '/frontend/webpages/professor-homepage.html';
                return;
            }
            if (role === 'student') {
                window.location.href = '/frontend/webpages/student-homepage.html';
                return;
            }
        }, 1000);
        } else {
            //Show backend error message
            errorMessage.style.color = 'red';
            errorMessage.textContent = result.message;

            createAccountBtn.disabled = false; //Re-enable button
            createAccountBtn.textContent = "Create Account";
        }
    } catch (error) {
        console.error('Signup error:', error);
        errorMessage.style.color = 'red';
        errorMessage.textContent = `Something went wrong: ${error.message}`;

        createAccountBtn.disabled = false;
        createAccountBtn.textContent = "Create Account";

    }
});
