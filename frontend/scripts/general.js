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

// Menu Overlay Toggle
const menuIcon = document.getElementById('menu-icon');
const menuOverlay = document.getElementById('menu-overlay');

menuIcon.addEventListener('click', (e) => {
  e.preventDefault();
  menuOverlay.classList.toggle('show');
});

// Hide when clicking outside
document.addEventListener('click', (e) => {
  if (!menuIcon.contains(e.target) && !menuOverlay.contains(e.target)) {
    menuOverlay.classList.remove('show');
  }
});

// Smooth page transitions
window.addEventListener("load", () => {
  const main = document.querySelector("main");
  if (main) main.classList.add("fade-in");
});

document.querySelectorAll("a").forEach(link => {
  if (link.hostname === window.location.hostname && link.getAttribute("href")) {
    link.addEventListener("click", e => {
      const url = link.getAttribute("href");
      if (url.startsWith("#") || url.startsWith("javascript:")) return;

      e.preventDefault();

      const main = document.querySelector("main");
      if (main) {
        main.classList.remove("fade-in");
        main.classList.add("fade-out");
      }

      setTimeout(() => {
        window.location.href = url;
      }, 180);
    });
  }
});

/* 
   AUTH GUARD SCRIPT
   Purpose: Protect student/professor pages from unauthorized access
   and prevent back navigation after logout.
 */

/* ==========================================================
   AUTH GUARD SCRIPT
   Purpose: Protect student/professor pages from unauthorized access
   and prevent back navigation after logout.
   ========================================================== */

// Detect current page path
const currentPath = window.location.pathname;

// Pages that should NOT trigger auth guard
const publicPages = [
  "/",
  "/index.html",
  "/frontend/webpages/sign-up.html",
  "/frontend/webpages/sign-in.html"
];

// Logout functionality
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();

    // Clear stored session data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem('isNewUser');
    sessionStorage.clear();

    // Redirect to landing and prevent back
    window.location.replace("/index.html");
  });
}

