import './styles/main.scss'


// Apply the yozora-container class to the presentation section
const presentationSection = document.querySelector('#presentation .container');
if (presentationSection) {
  presentationSection.classList.add('yozora-container');
}

// Apply TextBlock styling to all elements with the class (if needed)
// Since content is now in HTML, you might only need to apply styling
const textBlockElements = document.querySelectorAll('.text-blocks-container');
textBlockElements.forEach(element => {
  // Apply any additional JavaScript-based styling or effects if needed
  // For example, if TextBlock adds specific classes or behavior:
  element.classList.add('text-block'); // Add your TextBlock CSS class
});

// Smooth scroll navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});


