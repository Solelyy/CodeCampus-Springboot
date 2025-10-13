// Notification Overlay Toggle
const notifIcon = document.getElementById('notif-icon');
const notifOverlay = document.getElementById('notif-overlay');

notifIcon.addEventListener('click', (e) => {
  e.preventDefault();
  notifOverlay.classList.toggle('show');
});

// Hide when clicking outside
document.addEventListener('click', (e) => {
  if (!notifIcon.contains(e.target) && !notifOverlay.contains(e.target)) {
    notifOverlay.classList.remove('show');
  }
});