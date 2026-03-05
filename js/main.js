/* ═══════════════════════════════════
   Cross-browser requestAnimationFrame polyfill
═══════════════════════════════════ */
window.requestAnimationFrame = window.requestAnimationFrame
  || window.webkitRequestAnimationFrame
  || window.mozRequestAnimationFrame
  || window.msRequestAnimationFrame
  || function (cb) { return setTimeout(cb, 1000 / 60); };

window.cancelAnimationFrame = window.cancelAnimationFrame
  || window.webkitCancelAnimationFrame
  || window.mozCancelAnimationFrame
  || clearTimeout;

/* ═══════════════════════════════════
   performance.now polyfill (IE11 / very old browsers)
═══════════════════════════════════ */
if (!window.performance || !window.performance.now) {
  window.performance = window.performance || {};
  var _perfOffset = Date.now();
  window.performance.now = function () { return Date.now() - _perfOffset; };
}

/* ═══════════════════════════════════
   1. CANVAS PARTICLE SYSTEM
═══════════════════════════════════ */
var canvas = document.getElementById('bgCanvas');
var ctx = canvas ? canvas.getContext('2d') : null;
var W, H, particles = [], mouseX = 0, mouseY = 0;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

if (canvas && ctx) {
  resize();
  window.addEventListener('resize', resize);

  function Particle() { this.reset(true); }
  Particle.prototype.reset = function (init) {
    this.x = Math.random() * W;
    this.y = init ? Math.random() * H : H + 10;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = -(Math.random() * 0.6 + 0.2);
    this.size = Math.random() * 2 + 0.5;
    this.alpha = Math.random() * 0.5 + 0.1;
    this.color = Math.random() > 0.6 ? '#6c5dd3' : Math.random() > 0.5 ? '#4a90e2' : '#ffffff';
    this.life = 0;
    this.maxLife = Math.random() * 200 + 100;
  };
  Particle.prototype.update = function () {
    var dx = mouseX - this.x, dy = mouseY - this.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 200) {
      this.vx += dx / dist * 0.015;
      this.vy += dy / dist * 0.015;
    }
    this.x += this.vx;
    this.y += this.vy;
    this.life++;
    if (this.y < -10 || this.life > this.maxLife) this.reset(false);
  };
  Particle.prototype.draw = function () {
    var fade = this.life < 20 ? this.life / 20
      : this.life > this.maxLife - 20 ? (this.maxLife - this.life) / 20 : 1;
    ctx.save();
    ctx.globalAlpha = this.alpha * fade;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  for (var i = 0; i < 120; i++) particles.push(new Particle());

  function drawConnections() {
    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < 90) {
          ctx.save();
          ctx.globalAlpha = (1 - d / 90) * 0.12;
          ctx.strokeStyle = '#6c5dd3';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  function animCanvas() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(function (p) { p.update(); p.draw(); });
    requestAnimationFrame(animCanvas);
  }
  animCanvas();
}

window.addEventListener('mousemove', function (e) { mouseX = e.clientX; mouseY = e.clientY; });

/* ═══════════════════════════════════
   Custom cursor — dot only (no ring)
═══════════════════════════════════ */
(function () {
  var cursor = document.getElementById('cursor');
  // Hide the ring element entirely if it exists
  var cursorRing = document.getElementById('cursor-ring');
  if (cursorRing) cursorRing.style.display = 'none';
  if (!cursor) return;

  // Only show on non-touch, large-screen devices
  if ('ontouchstart' in window || window.innerWidth < 900) {
    cursor.style.display = 'none';
    return;
  }

  var s = cursor.style;
  s.position = 'fixed';
  s.width = '10px';
  s.height = '10px';
  s.background = '#6c5dd3';
  s.borderRadius = '50%';
  s.pointerEvents = 'none';
  s.zIndex = '99999';
  s.transform = 'translate(-50%,-50%)';
  s.boxShadow = '0 0 12px rgba(108,93,211,0.8)';
  s.willChange = 'left,top';
  s.transition = 'background 0.2s ease, transform 0.15s ease';

  document.addEventListener('mousemove', function (e) {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  // Scale up on interactive elements
  document.addEventListener('mouseover', function (e) {
    if (e.target && (e.target.tagName === 'A' || e.target.tagName === 'BUTTON'
      || e.target.closest('a') || e.target.closest('button'))) {
      cursor.style.transform = 'translate(-50%,-50%) scale(1.8)';
      cursor.style.background = '#8b7cf8';
    }
  });
  document.addEventListener('mouseout', function (e) {
    if (e.target && (e.target.tagName === 'A' || e.target.tagName === 'BUTTON'
      || e.target.closest('a') || e.target.closest('button'))) {
      cursor.style.transform = 'translate(-50%,-50%) scale(1)';
      cursor.style.background = '#6c5dd3';
    }
  });

  document.body.style.cursor = 'none';
})();

/* ═══════════════════════════════════
   All DOM-dependent code wrapped in DOMContentLoaded
═══════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {

  /* ══ AUTO ACTIVE NAV TAB ══
     Matches current page filename to nav links and sets .active class */
  (function () {
    var page = window.location.pathname.split('/').pop() || 'index.html';
    // Remove any existing active classes first
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      a.classList.remove('active');
    });
    // Match top-level links by their href filename
    document.querySelectorAll('.nav-links > li > a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var hrefPage = href.split('/').pop().split('#')[0] || 'index.html';
      if (hrefPage === page) {
        a.classList.add('active');
      }
    });
    // Match sub-menu links (e.g. eld.html, factoring.html)
    document.querySelectorAll('.sub-menu a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var hrefPage = href.split('/').pop().split('#')[0];
      if (hrefPage && hrefPage === page) {
        a.classList.add('active');
        // Also mark the parent Services link as active
        var parentDropdown = a.closest('.has-dropdown');
        if (parentDropdown) {
          var parentLink = parentDropdown.querySelector(':scope > a');
          if (parentLink) parentLink.classList.add('active');
        }
      }
    });
  })();

  /* ══ 3. TYPEWRITER EFFECT ══ */
  var words = ['Elite', 'Reliable', 'Proven', 'Expert', 'Smart'];
  var wi = 0, ci = 0, deleting = false;
  var typedEl = document.getElementById('typedWord');

  if (typedEl) {
    function typeLoop() {
      var word = words[wi];
      if (!deleting) {
        typedEl.textContent = word.slice(0, ++ci);
        if (ci === word.length) { deleting = true; setTimeout(typeLoop, 1200); return; }
        setTimeout(typeLoop, 70);
      } else {
        typedEl.textContent = word.slice(0, --ci);
        if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; setTimeout(typeLoop, 200); return; }
        setTimeout(typeLoop, 40);
      }
    }
    setTimeout(typeLoop, 1200);
  }

  /* ══ 4. MOUSE PARALLAX on hero content ══ */
  var heroLeft = document.getElementById('heroLeft');
  var videoCont = document.getElementById('videoContainer');
  if (heroLeft && videoCont) {
    // Only apply on non-touch, larger screens
    if (window.innerWidth > 900 && !('ontouchstart' in window)) {
      window.addEventListener('mousemove', function (e) {
        var xOff = (e.clientX / window.innerWidth - 0.5) * 18;
        var yOff = (e.clientY / window.innerHeight - 0.5) * 10;
        heroLeft.style.transform = 'translate(' + (xOff * 0.4) + 'px, ' + (yOff * 0.4) + 'px)';
        videoCont.style.transform = 'translate(' + (-xOff * 0.6) + 'px, ' + (-yOff * 0.6) + 'px)';
      });
    }
  }

  /* ══ 5. MUTE TOGGLE ══ */
  var vid = document.getElementById('heroVideo');
  var muteBtn = document.getElementById('muteBtn');
  var muteIcon = document.getElementById('muteIcon');
  if (vid && muteBtn && muteIcon) {
    muteBtn.addEventListener('click', function () {
      vid.muted = !vid.muted;
      muteIcon.className = vid.muted ? 'bi bi-volume-mute-fill' : 'bi bi-volume-up-fill';
    });

    // Proactive play attempt for Firefox/Chrome
    var playAttempt = function () {
      vid.play().catch(function (err) {
        console.log("Autoplay prevented, waiting for interaction:", err);
      });
    };

    // Try immediately after short delay
    setTimeout(playAttempt, 500);

    // Autoplay policy: some browsers block autoplay; try to play on first user interaction
    document.addEventListener('click', function tryPlay() {
      vid.play().catch(function () { });
      document.removeEventListener('click', tryPlay);
    }, { once: true });
  }

  /* ══ 6. ANIMATED COUNTERS ══ */
  function animCount(el, target) {
    var dur = 2000, start = performance.now();
    (function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    })(start);
  }

  var heroStats = document.querySelector('.hero-stats');
  if (heroStats && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        document.querySelectorAll('.stat-num').forEach(function (el) {
          animCount(el, +el.dataset.target);
        });
        io.disconnect();
      }
    }, { threshold: 0.4 });
    io.observe(heroStats);
  } else if (heroStats) {
    // Fallback for browsers without IntersectionObserver (IE11)
    document.querySelectorAll('.stat-num').forEach(function (el) {
      el.textContent = el.dataset.target;
    });
  }

  /* ══ 7. BUTTON RIPPLE EFFECT ══ */
  var btnFilled = document.getElementById('btnFilled');
  if (btnFilled) {
    btnFilled.addEventListener('click', function (e) {
      var rect = this.getBoundingClientRect();
      var r = document.createElement('span');
      r.className = 'ripple';
      r.style.cssText = 'width:60px;height:60px;left:' + (e.clientX - rect.left - 30) + 'px;top:' + (e.clientY - rect.top - 30) + 'px';
      this.appendChild(r);
      setTimeout(function () { if (r.parentNode) r.parentNode.removeChild(r); }, 600);
    });
  }

  /* ══ 8. AOS INIT & MOBILE MENU ══ */
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
      disable: function () { return window.innerWidth < 480; } // disable on very small screens for perf
    });

    // Safety net: ensure AOS elements are visible after 3s (in case AOS fails)
    setTimeout(function () {
      document.querySelectorAll('[data-aos]').forEach(function (el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }, 3000);
  } else {
    // AOS library failed to load — make all elements visible immediately
    document.querySelectorAll('[data-aos]').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  /* ══ Mobile Menu Toggle ══ */
  var navHamburger = document.getElementById('navHamburger');
  var navLinks = document.getElementById('navLinks');

  if (navHamburger && navLinks) {
    navHamburger.addEventListener('click', function () {
      navHamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close menu when nav link is clicked
    document.querySelectorAll('.nav-links > li > a').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var parent = link.parentElement;
        if (window.innerWidth <= 991 && parent.classList.contains('has-dropdown')) {
          e.preventDefault();
          parent.classList.toggle('active');
        } else {
          navHamburger.classList.remove('active');
          navLinks.classList.remove('active');
        }
      });
    });

    // Sub-menu links close the main menu
    document.querySelectorAll('.sub-menu a').forEach(function (link) {
      link.addEventListener('click', function () {
        navHamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.querySelectorAll('.has-dropdown').forEach(function (d) {
          d.classList.remove('active');
        });
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
      if (navLinks.classList.contains('active')
        && !navLinks.contains(e.target)
        && !navHamburger.contains(e.target)) {
        navHamburger.classList.remove('active');
        navLinks.classList.remove('active');
      }
    });
  }

  // explicit close button inside mobile menu (optional element)
  var closeMenuBtn = document.getElementById('closeMenuBtn');
  if (closeMenuBtn && navHamburger && navLinks) {
    closeMenuBtn.addEventListener('click', function () {
      navHamburger.classList.remove('active');
      navLinks.classList.remove('active');
    });
  }

  /* ══ Scroll Top Button ══ */
  var scrollTopBtn = document.getElementById('scrollTop');
  if (scrollTopBtn) {
    window.addEventListener('scroll', function () {
      if (window.pageYOffset > 500) {   // pageYOffset for IE11 compat (scrollY not in IE)
        scrollTopBtn.classList.add('show');
      } else {
        scrollTopBtn.classList.remove('show');
      }
    });

    scrollTopBtn.addEventListener('click', function () {
      // Smooth scroll with fallback for browsers without behavior: smooth
      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Fallback: animate manually
        var start = window.pageYOffset || document.documentElement.scrollTop;
        var startTime = performance.now();
        var duration = 500;
        function scrollStep(timestamp) {
          var elapsed = timestamp - startTime;
          var progress = Math.min(elapsed / duration, 1);
          var ease = 1 - Math.pow(1 - progress, 3);
          window.scrollTo(0, start * (1 - ease));
          if (progress < 1) requestAnimationFrame(scrollStep);
        }
        requestAnimationFrame(scrollStep);
      }
    });
  }

}); // end DOMContentLoaded