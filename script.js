document.addEventListener('DOMContentLoaded', function () {
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');

  // Button click handlers
  loginBtn.addEventListener('click', function (e) {
    e.preventDefault();
    alert('Login functionality will be implemented here');
  });

  signupBtn.addEventListener('click', function (e) {
    e.preventDefault();
    alert('Sign up functionality will be implemented here');
  });

  // Ensure background image covers the viewport completely
  function resizeBackground() {
    const background = document.querySelector('.background-image');
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Maintain aspect ratio while covering viewport
    background.style.width = viewportWidth + 'px';
    background.style.height = viewportHeight + 'px';
  }

  // Initial resize
  resizeBackground();

  // Resize on window changes
  window.addEventListener('resize', resizeBackground);
});
// Scroll-based reveal for about section
const aboutSection = document.querySelector('.about-us');

window.addEventListener('scroll', () => {
    const rect = aboutSection.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
        aboutSection.classList.add('visible');
    }
});
document.getElementById('loginBtn').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('loginPanel').classList.add('active');
});
    