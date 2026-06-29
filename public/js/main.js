// public/js/main.js
// Client-side JavaScript for CareerTrack.
// Keeps interactions snappy without any heavy frameworks.

// ── Run after the entire DOM is loaded ──
document.addEventListener('DOMContentLoaded', function () {

  // ── 1. Auto-dismiss flash messages (if any are added in the future) ──
  // This pattern is useful to know for interviews: auto-remove an element after N seconds
  var flashes = document.querySelectorAll('.flash-message');
  flashes.forEach(function (el) {
    setTimeout(function () {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.4s ease';
      setTimeout(function () { el.remove(); }, 400);
    }, 3000);
  });

  // ── 2. Active sidebar link highlighting ──
  // Mark the nav link whose href matches the current URL path
  var currentPath = window.location.pathname;
  var navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(function (link) {
    var href = link.getAttribute('href');
    // Exact match for '/', prefix match for others
    if (href === '/' && currentPath === '/') {
      link.classList.add('active');
    } else if (href !== '/' && currentPath.startsWith(href)) {
      link.classList.add('active');
    }
  });

  // ── 3. Delete confirmation improvement ──
  // All delete buttons already have onsubmit="return confirm(...)" inline,
  // so no extra JS needed. This is just a backup for any delete forms.
  var deleteForms = document.querySelectorAll('form[data-confirm]');
  deleteForms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      var message = form.getAttribute('data-confirm') || 'Are you sure?';
      if (!window.confirm(message)) {
        e.preventDefault(); // stop the form from submitting
      }
    });
  });

  // ── 4. Set min date for deadline input to today ──
  // Stops users from accidentally setting past deadlines
  var deadlineInput = document.getElementById('deadline');
  if (deadlineInput) {
    var today = new Date().toISOString().split('T')[0];
    deadlineInput.setAttribute('min', today);
  }

  // ── 5. Checklist item toggle visual feedback ──
  // When a checkbox is toggled, add/remove the visual 'checked' style on its label
  var checklistItems = document.querySelectorAll('.checklist-item input[type="checkbox"]');
  checklistItems.forEach(function (checkbox) {
    // Apply initial state
    updateChecklistStyle(checkbox);

    checkbox.addEventListener('change', function () {
      updateChecklistStyle(checkbox);
    });
  });

  function updateChecklistStyle(checkbox) {
    var label = checkbox.closest('.checklist-item');
    if (!label) return;
    if (checkbox.checked) {
      label.style.borderColor = 'var(--color-offer)';
      label.style.backgroundColor = 'rgba(16, 185, 129, 0.08)';
    } else {
      label.style.borderColor = '';
      label.style.backgroundColor = '';
    }
  }

  // ── 6. Smooth card hover animation (enhancement) ──
  // Adds a subtle lift effect on stat cards
  var statCards = document.querySelectorAll('.stat-card');
  statCards.forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      card.style.transform = 'translateY(-3px)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = 'translateY(0)';
    });
  });

}); // end DOMContentLoaded
