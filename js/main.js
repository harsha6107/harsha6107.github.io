document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
  
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('show-menu');
        navToggle.querySelector('i').classList.toggle('fa-bars');
        navToggle.querySelector('i').classList.toggle('fa-times');
      });
    }
  
    // Close menu when link is clicked
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (navLinks) {
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('show-menu');
          navToggle.querySelector('i').classList.add('fa-bars');
          navToggle.querySelector('i').classList.remove('fa-times');
        });
      });
    }
  
    // Scroll Animation (Sticky Header)
    window.addEventListener('scroll', () => {
      const header = document.querySelector('nav');
      if (header) {
        header.classList.toggle('sticky', window.scrollY > 0);
      }
    });
  
    // Initialize TypewriterJS
    new Typewriter('#typewriter-text', {
        strings: [
            'Full Stack Engineer',
            'Backend Developer',
            'ML/AI Engineer'
        ],
        autoStart: true,
        loop: true,
        deleteSpeed: 50,
        delay: 80
    });
  
    // Add click event listener to each hobby item
    const hobbyItems = document.querySelectorAll('.hobby-item');
    hobbyItems.forEach(item => {
      item.addEventListener('click', function() {
        this.classList.toggle('expanded');
        let hiddenInfo = this.querySelector('.hidden-info');
        if (this.classList.contains('expanded')) {
          hiddenInfo.style.maxHeight = hiddenInfo.scrollHeight + "px";
        } else {
          hiddenInfo.style.maxHeight = '0';
        }
      });
    });
  
    // Dark/Light Mode Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
  
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        body.classList.toggle('light-mode');
      });
    }
  });