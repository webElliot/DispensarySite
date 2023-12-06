// JavaScript to handle the animation
window.addEventListener('load', function() {
  const panels = document.querySelectorAll('.panel');
  const arrow = document.querySelector('.arrow');

  // Animate each panel to disappear into the arrow
  panels.forEach((panel, index) => {
    setTimeout(() => {
      panel.classList.add('animate-disappear');
    }, index * 500); // Stagger the start times of the animations
  });

  // Once all panels are animated, rotate the arrow
  setTimeout(() => {
    arrow.classList.add('rotate-arrow');
  }, panels.length * 500);
});