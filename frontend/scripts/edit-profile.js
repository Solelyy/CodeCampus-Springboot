const BACKEND_URL = 'http://localhost:8081';

// Elements
const profilePicEl = document.querySelector('.profile-image img');
const uploadBtn = document.querySelector('.upload-btn');
const bioEl = document.getElementById('bio');
const fullNameEl = document.getElementById('full-name');
const usernameEl = document.getElementById('username');
const saveBtn = document.querySelector('.btn.save');
const cancelBtn = document.querySelector('.btn.cancel');

const profilePicMsg = document.getElementById('profile-pic-update-msg');
const bioMsg = document.getElementById('bio-update-msg');

const DEFAULT_PROFILE_PIC = '/frontend/assets/images/starter-profile.jpeg';
let selectedFile = null;
const token = localStorage.getItem('token');

// --- Fetch profile ---
async function fetchProfile() {
    try {
        const profileRes = await fetch(BACKEND_URL + '/api/profile', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!profileRes.ok) throw new Error('Failed to fetch profile info');
        const profileData = await profileRes.json();

        const userRes = await fetch(BACKEND_URL + '/api/users/me', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!userRes.ok) throw new Error('Failed to fetch user info');
        const userData = await userRes.json();

        profilePicEl.src = profileData.profilePicture ? BACKEND_URL + profileData.profilePicture : DEFAULT_PROFILE_PIC;
        bioEl.value = profileData.bio || "";
        fullNameEl.textContent = userData.name || "Unknown";
        usernameEl.textContent = '@' + userData.username || "Unknown";

    } catch (err) {
        console.error(err);
        bioMsg.textContent = 'Failed to load profile info.';
        bioMsg.style.color = 'red';
    }
}

// --- Upload button ---
uploadBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.click();

    input.onchange = () => {
        if (input.files && input.files[0]) {
            selectedFile = input.files[0];
            const reader = new FileReader();
            reader.onload = e => profilePicEl.src = e.target.result;
            reader.readAsDataURL(selectedFile);
        }
    };
});

// --- Save profile ---
saveBtn.addEventListener('click', async () => {
    bioMsg.textContent = '';
    profilePicMsg.textContent = '';

    try {
        const formData = new FormData();
        formData.append('bio', bioEl.value);
        if (selectedFile) formData.append('profilePicture', selectedFile);

        const res = await fetch(BACKEND_URL + '/api/profile', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token },
            body: formData
        });

        if (!res.ok) throw new Error('Failed to update profile');
        const updatedData = await res.json();

        bioEl.value = updatedData.bio;
        profilePicEl.src = updatedData.profilePicture ? BACKEND_URL + updatedData.profilePicture : DEFAULT_PROFILE_PIC;

        bioMsg.textContent = 'Bio updated successfully!';
        bioMsg.style.color = 'green';

        if (selectedFile) {
            profilePicMsg.textContent = 'Profile picture updated successfully!';
            profilePicMsg.style.color = 'green';
        }

        selectedFile = null;

    } catch (err) {
        console.error(err);
        bioMsg.textContent = 'Error updating bio.';
        bioMsg.style.color = 'red';
        if (selectedFile) {
            profilePicMsg.textContent = 'Error updating profile picture.';
            profilePicMsg.style.color = 'red';
        }
    }
});

// --- Cancel ---
cancelBtn.addEventListener('click', () => {
    window.location.href = 'student-profile.html';
});

// --- Init ---
document.addEventListener('DOMContentLoaded', fetchProfile);
