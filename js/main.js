// Mobile Menu Toggle
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('show-menu');
  navToggle.querySelector('i').classList.toggle('fa-bars');
  navToggle.querySelector('i').classList.toggle('fa-times');
});

// Close menu when link is clicked
const navLinks = document.querySelectorAll('.nav-link');

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('show-menu');
    navToggle.querySelector('i').classList.add('fa-bars');
    navToggle.querySelector('i').classList.remove('fa-times');
  });
});

// Scroll Animation
window.addEventListener('scroll', () => {
  const header = document.querySelector('nav');
  header.classList.toggle('sticky', window.scrollY > 0);
});

// Initialize TypewriterJS
const typewriter = new Typewriter('#typewriter-text', {
  loop: true
});

typewriter.typeString('Software Engineer')
  .pauseFor(2000)
  .deleteAll()
  .typeString('Machine Learning Enthusiast')
  .pauseFor(2000)
  .deleteAll()
  .typeString('iOS Developer')
  .pauseFor(2000)
  .start();

// Dark/Light Mode Toggle
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
  body.classList.toggle('light-mode');
});
