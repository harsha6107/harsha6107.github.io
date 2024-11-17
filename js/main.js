document.addEventListener('DOMContentLoaded', () => {
  // Initialize AOS
  AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true
  });

  // Navigation functionality
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const header = document.querySelector('nav');

  navToggle?.addEventListener('click', () => {
      navMenu.classList.toggle('show-menu');
      navToggle.querySelector('i').classList.toggle('fa-bars');
      navToggle.querySelector('i').classList.toggle('fa-times');
  });

  // Close menu on link click
  document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
          navMenu.classList.remove('show-menu');
          navToggle.querySelector('i').classList.add('fa-bars');
          navToggle.querySelector('i').classList.remove('fa-times');
      });
  });

  // Sticky header
  window.addEventListener('scroll', () => {
      header.classList.toggle('sticky', window.scrollY > 50);
  });

  // Typewriter effect
  new Typewriter('#typewriter-text', {
      strings: [
          'Software Engineer',
          'Backend Developer',
          'ML/AI Engineer'
      ],
      autoStart: true,
      loop: true,
      deleteSpeed: 50,
      delay: 80
  });

  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  const icon = themeToggle.querySelector('i');

  themeToggle.addEventListener('click', () => {
      body.classList.toggle('light-mode');
      icon.classList.toggle('fa-moon');
      icon.classList.toggle('fa-sun');
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
          e.preventDefault();
          document.querySelector(this.getAttribute('href')).scrollIntoView({
              behavior: 'smooth'
          });
      });
  });
});