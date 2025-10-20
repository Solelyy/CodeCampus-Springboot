document.addEventListener('coursesRendered', () => {
  const courseTitles = document.querySelectorAll('.course-title');
  console.log('coursesRendered fired — titles found:', courseTitles.length);

  // Create tooltip once
  let tooltip = document.querySelector('.dynamic-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'dynamic-tooltip';
    document.body.appendChild(tooltip);
    console.log('Tooltip element created and added to body.');
  }

  courseTitles.forEach(title => {
    const fullText = title.getAttribute('data-fulltitle');
    if (!fullText) return;

    title.addEventListener('mouseenter', () => {
      tooltip.textContent = fullText;
      tooltip.style.display = 'block';
    });

    title.addEventListener('mousemove', e => {
      tooltip.style.left = e.pageX + 10 + 'px';
      tooltip.style.top = e.pageY - 25 + 'px';
    });

    title.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });
  });
});
