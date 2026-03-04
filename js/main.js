
    /* ═══════════════════════════════════
       1. CANVAS PARTICLE SYSTEM
    ═══════════════════════════════════ */
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas.getContext('2d');
    let W, H, particles = [], mouseX = 0, mouseY = 0;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() { this.reset(true); }
      reset(init = false) {
        this.x = Math.random() * W;
        this.y = init ? Math.random() * H : H + 10;
        this.vx = (Math.random() - .5) * .4;
        this.vy = -(Math.random() * .6 + .2);
        this.size = Math.random() * 2 + .5;
        this.alpha = Math.random() * .5 + .1;
        this.color = Math.random() > .6 ? '#6c5dd3' : Math.random() > .5 ? '#4a90e2' : '#ffffff';
        this.life = 0;
        this.maxLife = Math.random() * 200 + 100;
      }
      update() {
        // slight attraction to mouse
        const dx = mouseX - this.x, dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          this.vx += dx / dist * .015;
          this.vy += dy / dist * .015;
        }
        this.x += this.vx; this.y += this.vy;
        this.life++;
        if (this.y < -10 || this.life > this.maxLife) this.reset();
      }
      draw() {
        const fade = this.life < 20 ? this.life / 20 : this.life > this.maxLife - 20 ? (this.maxLife - this.life) / 20 : 1;
        ctx.save();
        ctx.globalAlpha = this.alpha * fade;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < 120; i++) particles.push(new Particle());

    // connection lines between nearby particles
    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 90) {
            ctx.save();
            ctx.globalAlpha = (1 - d / 90) * .12;
            ctx.strokeStyle = '#6c5dd3';
            ctx.lineWidth = .8;
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
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animCanvas);
    }
    animCanvas();

    window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });



    /* ═══════════════════════════════════
       3. TYPEWRITER EFFECT
    ═══════════════════════════════════ */
    const words = ['Elite', 'Reliable', 'Proven', 'Expert', 'Smart'];
    let wi = 0, ci = 0, deleting = false;
    const typedEl = document.getElementById('typedWord');

    function typeLoop() {
      const word = words[wi];
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

    /* ═══════════════════════════════════
       4. MOUSE PARALLAX on hero content
    ═══════════════════════════════════ */
    const heroLeft = document.getElementById('heroLeft');
    const videoCont = document.getElementById('videoContainer');
    window.addEventListener('mousemove', e => {
      const xOff = (e.clientX / window.innerWidth - .5) * 18;
      const yOff = (e.clientY / window.innerHeight - .5) * 10;
      heroLeft.style.transform = `translate(${xOff * .4}px, ${yOff * .4}px)`;
      videoCont.style.transform = `translate(${-xOff * .6}px, ${-yOff * .6}px)`;
    });

    /* ═══════════════════════════════════
       5. MUTE TOGGLE
    ═══════════════════════════════════ */
    const vid = document.getElementById('heroVideo');
    const muteBtn = document.getElementById('muteBtn');
    const muteIcon = document.getElementById('muteIcon');
    muteBtn.addEventListener('click', () => {
      vid.muted = !vid.muted;
      muteIcon.className = vid.muted ? 'bi bi-volume-mute-fill' : 'bi bi-volume-up-fill';
    });

    /* ═══════════════════════════════════
       6. ANIMATED COUNTERS
    ═══════════════════════════════════ */
    function animCount(el, target) {
      const dur = 2000, start = performance.now();
      (function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      })(start);
    }
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        document.querySelectorAll('.stat-num').forEach(el => animCount(el, +el.dataset.target));
        io.disconnect();
      }
    }, { threshold: .4 });
    io.observe(document.querySelector('.hero-stats'));

    // Manual AOS trigger on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
      AOS.refresh();
      // Ensure all AOS elements are visible if AOS fails
      setTimeout(() => {
        document.querySelectorAll('[data-aos]').forEach(el => {
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
      }, 3000); // 3s safety margin
    });

    /* ═══════════════════════════════════
       7. BUTTON RIPPLE EFFECT
    ═══════════════════════════════════ */
    document.getElementById('btnFilled').addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const r = document.createElement('span');
      r.className = 'ripple';
      r.style.cssText = `width:60px;height:60px;left:${e.clientX - rect.left - 30}px;top:${e.clientY - rect.top - 30}px`;
      this.appendChild(r);
      setTimeout(() => r.remove(), 600);
    });

    /* ═══════════════════════════════════
       8. AOS & MOBILE MENU
    ═══════════════════════════════════ */
    // Initialize AOS
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100
    });

    // Mobile Menu Toggle
    const navHamburger = document.getElementById('navHamburger');
    const navLinks = document.getElementById('navLinks');

    navHamburger.addEventListener('click', () => {
      navHamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close menu when link is clicked (excluding dropdown toggles)
    document.querySelectorAll('.nav-links > li > a').forEach(link => {
      link.addEventListener('click', (e) => {
        const parent = link.parentElement;
        if (window.innerWidth <= 991 && parent.classList.contains('has-dropdown')) {
          e.preventDefault();
          parent.classList.toggle('active');
        } else {
          navHamburger.classList.remove('active');
          navLinks.classList.remove('active');
        }
      });
    });

    // explicit close button inside mobile menu
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    if (closeMenuBtn) {
      closeMenuBtn.addEventListener('click', () => {
        navHamburger.classList.remove('active');
        navLinks.classList.remove('active');
      });
    }

    // Sub-menu links should also close the main menu
    document.querySelectorAll('.sub-menu a').forEach(link => {
      link.addEventListener('click', () => {
        navHamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.querySelectorAll('.has-dropdown').forEach(d => d.classList.remove('active'));
      });
    });
  
      // Scroll Top Button Logic
    const scrollTopBtn = document.getElementById('scrollTop');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        scrollTopBtn.classList.add('show');
      } else {
        scrollTopBtn.classList.remove('show');
      }
    });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    