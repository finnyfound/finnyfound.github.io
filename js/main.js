document.addEventListener('DOMContentLoaded', () => {
  // --- Theme Toggle Logic ---
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  let themeIcon = themeToggle ? themeToggle.querySelector('i') : null;

  // Check Local Storage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    // Remove existing theme classes first to be safe, though className overwrite works too
    body.classList.remove('oled-mode', 'light-mode');
    body.classList.add(savedTheme);
    updateIcon(savedTheme);
  } else {
    // Default check if no storage
    if (
      !body.classList.contains('oled-mode') &&
      !body.classList.contains('light-mode')
    ) {
      body.classList.add('oled-mode');
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      // Toggle on HTML element for background color correctness
      const html = document.documentElement;

      if (html.classList.contains('oled-mode')) {
        html.classList.remove('oled-mode');
        html.classList.add('light-mode');
        body.classList.remove('oled-mode'); // Sync body just in case styles use it
        body.classList.add('light-mode');

        localStorage.setItem('theme', 'light-mode');
        updateIcon('light-mode');
      } else {
        html.classList.remove('light-mode');
        html.classList.add('oled-mode');
        body.classList.remove('light-mode');
        body.classList.add('oled-mode');

        localStorage.setItem('theme', 'oled-mode');
        updateIcon('oled-mode');
      }
    });
  }

  // Init Theme
  const html = document.documentElement;
  if (savedTheme) {
    body.className = savedTheme; // Keep body class for other styles
    html.className = savedTheme; // Add to html for background
    updateIcon(savedTheme);
  } else {
    html.classList.add('oled-mode');
    body.classList.add('oled-mode');
  }

  function updateIcon(theme) {
    if (!themeIcon) return;
    if (theme === 'light-mode') {
      themeIcon.className = 'fas fa-moon';
    } else {
      themeIcon.className = 'fas fa-sun';
    }
  }

  // --- Mobile Sidebar Toggle ---
  const mobileToggle = document.querySelector('.mobile-toggle');
  const sidebar = document.querySelector('.sidebar');

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      // Change icon
      const icon = mobileToggle.querySelector('i');
      if (sidebar.classList.contains('open')) {
        icon.className = 'fas fa-times';
      } else {
        icon.className = 'fas fa-bars';
      }
    });
  }

  // --- Close Sidebar on Link Click (Mobile) ---
  const navLinks = document.querySelectorAll('.nav-item');
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
        mobileToggle.querySelector('i').className = 'fas fa-bars';
      }
    });
  });

  // --- Intersection Observer for Scroll Animations ---
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show-section');

        // Highlight Nav Item
        const id = entry.target.getAttribute('id');
        highlightNav(id);
      }
    });
  }, observerOptions);

  const sections = document.querySelectorAll('section');
  sections.forEach((section) => {
    observer.observe(section);
  });

  // --- Floating Cursor Effect ---
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorOutline = document.querySelector('.cursor-outline');

  if (window.innerWidth > 768 && cursorDot && cursorOutline) {
    window.addEventListener('mousemove', (e) => {
      const posX = e.clientX;
      const posY = e.clientY;

      // Dot moves instantly
      cursorDot.style.left = `${posX}px`;
      cursorDot.style.top = `${posY}px`;

      // Outline moves with delay/animation
      cursorOutline.animate(
        {
          left: `${posX}px`,
          top: `${posY}px`,
        },
        { duration: 500, fill: 'forwards' },
      );
    });
  }

  // --- Background Grid Generation ---
  const bgGrid = document.getElementById('bg-grid');
  if (bgGrid) {
    let cols, rows;
    const cellSize = 100; // Increased from 50

    const createGrid = () => {
      bgGrid.innerHTML = '';
      const width = window.innerWidth;
      const height = window.innerHeight;
      cols = Math.ceil(width / cellSize);
      rows = Math.ceil(height / cellSize);

      bgGrid.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
      bgGrid.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;

      const totalCells = cols * rows;
      const fragment = document.createDocumentFragment();

      for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.classList.add('bg-cell');

        // Determine column and row index
        const colIndex = i % cols;
        const rowIndex = Math.floor(i / cols);

        // Triangular Shape in Top-Right Corner
        // The condition defines a diagonal line: colIndex + rowIndex > Threshold
        // To make it top-right specific, we invert the row logic slightly relative to columns
        // Logic: The further right you go, the deeper down the triangle goes.
        // We want cells where (cols - colIndex) + rowIndex < Threshold
        const cornerSize = Math.min(cols, rows) * 0.5; // Controls the size of the corner triangle
        const distFromTopRight = cols - 1 - colIndex + rowIndex;

        const isCornerTriangle = distFromTopRight < cornerSize;

        // Add random scatter density for organic feel
        // Reduced density from > 0.15 to > 0.65 to appear less cluttered
        if (isCornerTriangle && Math.random() > 0.65) {
          cell.classList.add('right-side');
        } else {
          cell.classList.add('left-side');
        }

        fragment.appendChild(cell);
      }
      bgGrid.appendChild(fragment);
    };

    createGrid();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(createGrid, 200);
    });
  }

  // --- Stats Counter Animation ---
  const statsSection = document.querySelector('.stats-grid');
  let statsAnimated = false; // Ensure it only runs once

  if (statsSection) {
    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !statsAnimated) {
            const counters = document.querySelectorAll('.stat-box .number');
            counters.forEach((counter) => {
              const target = +counter.getAttribute('data-target');
              const duration = 2000; // ms
              const step = target / (duration / 16); // 60fps approx

              let current = 0;
              const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                  current = target;
                  clearInterval(timer);
                  // Add a + sign if it's the projects counter
                  counter.innerText = Math.floor(current) + '+';
                } else {
                  counter.innerText = Math.floor(current);
                }
              }, 16);
            });
            statsAnimated = true;
          }
        });
      },
      { threshold: 0.5 },
    );

    statsObserver.observe(statsSection);
  }
  // --- Decode Text Animation (Matrix Style) ---
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  document.querySelectorAll('.glitch-text').forEach((header) => {
    header.addEventListener('mouseover', (event) => {
      // Trigger on hover
      let iteration = 0;
      const originalText = event.target.dataset.text;

      // Safety check
      if (!originalText) return;

      clearInterval(event.target.interval);

      event.target.interval = setInterval(() => {
        event.target.innerText = originalText
          .split('')
          .map((letter, index) => {
            if (index < iteration) {
              return originalText[index];
            }
            return letters[Math.floor(Math.random() * 26)];
          })
          .join('');

        if (iteration >= originalText.length) {
          clearInterval(event.target.interval);
        }

        iteration += 1 / 3;
      }, 30);
    });
  });
  // --- Active Nav Highlighting Fix ---
  function highlightNav(id) {
    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('data-section') === id) {
        link.classList.add('active');
      }
    });
  }

  // --- Glitch Text Effect (Simple Random Character Swap) ---
  const glitchText = document.querySelector('.glitch-text');
  if (glitchText) {
    const originalText = glitchText.getAttribute('data-text');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#$%^&*()';

    glitchText.addEventListener('mouseenter', () => {
      let iterations = 0;
      const interval = setInterval(() => {
        glitchText.innerText = originalText
          .split('')
          .map((char, index) => {
            if (index < iterations) return originalText[index];
            return chars[Math.floor(Math.random() * 20)];
          })
          .join('');

        if (iterations >= originalText.length) clearInterval(interval);
        iterations += 1 / 2;
      }, 30);
    });
  }
});
