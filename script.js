/* ═══════════════════════════════════════════
   1. CURSOR CUSTOMIZADO
═══════════════════════════════════════════ */
const dot  = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  dot.style.left = mx + 'px';
  dot.style.top  = my + 'px';
});

(function animRing() {
  rx += (mx - rx) * .14;
  ry += (my - ry) * .14;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(animRing);
})();

document.querySelectorAll('a, button, .project-card, .value-card, .contact-link, .skill-category').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

/* ═══════════════════════════════════════════
   2. SISTEMA DE PARTÍCULAS — pontos flutuantes sutis
═══════════════════════════════════════════ */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [];
  const COUNT  = 55;
  const COLORS = [
    'rgba(62,207,142,',   // verde
    'rgba(167,139,250,',  // lilás
    'rgba(62,207,142,',
  ];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function rand(a, b) { return a + Math.random() * (b - a); }

  for (let i = 0; i < COUNT; i++) {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    particles.push({
      x:  rand(0, window.innerWidth),
      y:  rand(0, window.innerHeight),
      r:  rand(.8, 2.4),
      vx: rand(-.18, .18),
      vy: rand(-.12, .12),
      alpha: rand(.18, .5),
      dAlpha: rand(.002, .006) * (Math.random() > .5 ? 1 : -1),
      color,
      baseAlpha: rand(.18, .45),
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x  += p.vx;
      p.y  += p.vy;
      p.alpha += p.dAlpha;
      if (p.alpha <= .05 || p.alpha >= p.baseAlpha + .15) p.dAlpha *= -1;
      if (p.x < -10)  p.x = W + 10;
      if (p.x > W+10) p.x = -10;
      if (p.y < -10)  p.y = H + 10;
      if (p.y > H+10) p.y = -10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + Math.max(0, p.alpha).toFixed(2) + ')';
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();

  // Paralaxe sutil: partículas deslocam-se levemente com a rolagem
  window.addEventListener('scroll', () => {
    const sy = window.scrollY * .04;
    canvas.style.transform = `translateY(${sy}px)`;
  }, { passive: true });
})();

/* ═══════════════════════════════════════════
   3. MÁQUINA DE ESCREVER — última linha do hero
═══════════════════════════════════════════ */
(function initTypewriter() {
  const el     = document.getElementById('typewriter-target');
  const cursor = document.getElementById('tw-cursor');
  if (!el) return;

  const phrases = ['& Creator.', '& Builder.', '& Problem Solver.'];
  let pi = 0, ci = 0, deleting = false, pauseTick = 0;
  const PAUSE = 48; // ticks para pausar na palavra completa

  function tick() {
    const phrase = phrases[pi];
    if (!deleting) {
      ci++;
      el.textContent = phrase.slice(0, ci);
      if (ci === phrase.length) {
        deleting = true; pauseTick = PAUSE;
      }
    } else {
      if (pauseTick > 0) { pauseTick--; setTimeout(tick, 30); return; }
      ci--;
      el.textContent = phrase.slice(0, ci);
      if (ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
      }
    }
    const speed = deleting ? 38 : (ci === phrase.length ? 120 : 68);
    setTimeout(tick, speed);
  }

  // Inicia após o delay da entrada do hero
  setTimeout(tick, 1400);
})();

/* ═══════════════════════════════════════════
   4. ENTRADA DO TÍTULO HERO POR LETRAS
═══════════════════════════════════════════ */
(function splitHeroTitle() {
  const h1 = document.getElementById('hero-title');
  if (!h1) return;
  // Apenas os dois primeiros nós de texto / spans (não o span da máquina de escrever)
  const targets = [h1.firstChild, h1.querySelector('.line-accent')];

  targets.forEach((node, ni) => {
    if (!node) return;
    const text = node.textContent.trim();
    if (!text) return;
    const frag = document.createDocumentFragment();
    [...text].forEach((ch, ci) => {
      if (ch === ' ') {
        const s = document.createElement('span');
        s.className = 'space'; s.textContent = ' ';
        frag.appendChild(s);
      } else {
        const s = document.createElement('span');
        s.className = 'char';
        s.textContent = ch;
        s.style.transitionDelay = (ni * 160 + ci * 38) + 'ms';
        frag.appendChild(s);
      }
    });
    if (node.nodeType === 3) {
      node.parentNode.replaceChild(frag, node);
    } else {
      node.innerHTML = '';
      node.appendChild(frag);
    }
  });

  // Dispara após um frame
  requestAnimationFrame(() => {
    setTimeout(() => {
      document.querySelectorAll('#hero-title .char').forEach(c => c.classList.add('visible'));
    }, 200);
  });
})();

/* ═══════════════════════════════════════════
   5. REVELAÇÃO NA ROLAGEM (classes existentes + novas)
═══════════════════════════════════════════ */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('visible');
    // Dispara desenho de sublinhado nos títulos das seções
    e.target.querySelectorAll && e.target.querySelectorAll('.underline-draw').forEach(u => {
      setTimeout(() => u.classList.add('drawn'), 400);
    });
    revealObserver.unobserve(e.target);
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal, .reveal-left, .stagger-children').forEach(el => {
  revealObserver.observe(el);
});

// Também observa diretamente os títulos das seções para o sublinhado
document.querySelectorAll('h2.section-title').forEach(el => revealObserver.observe(el));

/* ═══════════════════════════════════════════
   6. ROLAGEM DO CONTADOR — números de estatística
═══════════════════════════════════════════ */
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el     = e.target;
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const color  = el.style.color;
    // Obtém a cor do span de destaque
    const accentSpan = el.querySelector('span');
    const accentColor = accentSpan ? accentSpan.style.color : color;
    if (!target) return;
    let start = 0;
    const dur  = 1200;
    const step = dur / target;
    const timer = setInterval(() => {
      start++;
      el.innerHTML = start + `<span style="color:${accentColor}">${suffix}</span>`;
      if (start >= target) clearInterval(timer);
    }, step);
    counterObs.unobserve(el);
  });
}, { threshold: .5 });

document.querySelectorAll('.stat-num[data-target]').forEach(el => counterObs.observe(el));

/* ═══════════════════════════════════════════
   7. ROLAGEM DA NAVBAR
═══════════════════════════════════════════ */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

/* ═══════════════════════════════════════════
   8. LINK ATIVO NA NAV
═══════════════════════════════════════════ */
const sections = document.querySelectorAll('section[id], div[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const activeObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a => {
        a.style.color = '';
        if (a.getAttribute('href') === '#' + e.target.id) a.style.color = 'var(--ink)';
      });
    }
  });
}, { threshold: .4 });

sections.forEach(s => activeObs.observe(s));

/* ═══════════════════════════════════════════
   9. BOTÕES MAGNÉTICOS
═══════════════════════════════════════════ */
document.querySelectorAll('.btn-primary, .contact-cta, .nav-cta').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r  = btn.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width  / 2)) * .22;
    const dy = (e.clientY - (r.top  + r.height / 2)) * .22;
    btn.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

/* ═══════════════════════════════════════════
   10. BRILHO DO CARD + SEGUIMENTO DO GLOW
═══════════════════════════════════════════ */
document.querySelectorAll('.project-card').forEach(card => {
  const glow = card.querySelector('.project-glow');
  card.addEventListener('mousemove', e => {
    const r  = card.getBoundingClientRect();
    const x  = e.clientX - r.left;
    const y  = e.clientY - r.top;
    if (glow) { glow.style.left = (x - 100) + 'px'; glow.style.top = (y - 100) + 'px'; }
    // Inclinação 3D sutil
    const rx = ((y / r.height) - .5) * 5;
    const ry = ((.5 - (x / r.width))) * 5;
    card.style.transform = `translateY(-8px) perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ═══════════════════════════════════════════
   11. INCLINAÇÃO 3D DO CARD DE VALOR
═══════════════════════════════════════════ */
document.querySelectorAll('.value-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r  = card.getBoundingClientRect();
    const x  = e.clientX - r.left;
    const y  = e.clientY - r.top;
    const rx = ((y / r.height) - .5) * 6;
    const ry = ((.5 - (x / r.width))) * 6;
    card.style.transform = `translateX(6px) perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateX(0)';
  });
});

/* ═══════════════════════════════════════════
   12. BLOBS DE PARALAXE na rolagem
═══════════════════════════════════════════ */
const blobs = document.querySelectorAll('[aria-hidden="true"] > div');
window.addEventListener('scroll', () => {
  const sy = window.scrollY;
  blobs.forEach((b, i) => {
    const speed = [.04, -.03, .025][i % 3];
    b.style.transform = `translateY(${sy * speed}px)`;
  });
}, { passive: true });

/* ═══════════════════════════════════════════
   13. SUBLINHADO DO TÍTULO DA SEÇÃO ao ficar visível
═══════════════════════════════════════════ */
const underlineObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.querySelectorAll('.underline-draw').forEach(u => {
      setTimeout(() => u.classList.add('drawn'), 300);
    });
    underlineObs.unobserve(e.target);
  });
}, { threshold: .2 });
document.querySelectorAll('h2.section-title').forEach(el => underlineObs.observe(el));

/* ═══════════════════════════════════════════
   14. ROLAGEM SUAVE nos links da nav
═══════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ═══════════════════════════════════════════
   15. OBSERVER REVEAL-SCALE & TIMELINE
═══════════════════════════════════════════ */
const scaleObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('visible');
    scaleObserver.unobserve(e.target);
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal-scale, .timeline-item, .section-watermark').forEach(el => {
  scaleObserver.observe(el);
});

/* ═══════════════════════════════════════════
   16. HABILIDADES com atraso — observa container pai
═══════════════════════════════════════════ */
const skillsObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('visible');
    skillsObs.unobserve(e.target);
  });
}, { threshold: 0.15 });

document.querySelectorAll('.skills-categories').forEach(el => skillsObs.observe(el));

/* ═══════════════════════════════════════════
   17. RIPPLE NO LINK DE CONTATO ao clicar
═══════════════════════════════════════════ */
document.querySelectorAll('.contact-link').forEach(link => {
  link.addEventListener('click', e => {
    const r    = link.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 1.5;
    const x    = e.clientX - r.left - size / 2;
    const y    = e.clientY - r.top  - size / 2;
    const rip  = document.createElement('span');
    rip.className = 'ripple';
    rip.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
    link.appendChild(rip);
    setTimeout(() => rip.remove(), 700);
  });
});

/* ═══════════════════════════════════════════
   18. INCLINAÇÃO SUTIL DO BADGE do hero no mousemove
═══════════════════════════════════════════ */
const badge = document.querySelector('.hero-badge');
if (badge) {
  document.addEventListener('mousemove', e => {
    const cx  = window.innerWidth  / 2;
    const cy  = window.innerHeight / 2;
    const dx  = (e.clientX - cx) / cx;
    const dy  = (e.clientY - cy) / cy;
    badge.style.transform = `translate(${dx * 4}px, ${dy * 3}px)`;
  });
}

/* ═══════════════════════════════════════════
   19. CARD DE PROJETO — delay de revelação sequencial na rolagem
═══════════════════════════════════════════ */
// Já tratado pelo observer reveal-scale acima com estilos de transition-delay in-line

/* ═══════════════════════════════════════════
   20. CARD HERO — inclinação no mousemove global (sutil)
═══════════════════════════════════════════ */
const heroCard = document.querySelector('.hero-card');
if (heroCard) {
  document.addEventListener('mousemove', e => {
    const cx  = window.innerWidth  / 2;
    const cy  = window.innerHeight / 2;
    const dx  = (e.clientX - cx) / cx;
    const dy  = (e.clientY - cy) / cy;
    heroCard.style.transform = `translateY(-6px) perspective(900px) rotateX(${-dy * 3}deg) rotateY(${dx * 4}deg)`;
  });
  heroCard.closest('section')?.addEventListener('mouseleave', () => {
    heroCard.style.transform = '';
  });
}
/* ═══════════════════════════════════════════
   21. ALTERNÂNCIA DE TEMA
═══════════════════════════════════════════ */
(function initTheme() {
  const html   = document.documentElement;
  const btn    = document.getElementById('theme-toggle');
  const stored = localStorage.getItem('portfolio-theme');

  // Aplica preferência salva ou padrão para light
  if (stored === 'dark') html.setAttribute('data-theme', 'dark');

  btn.addEventListener('click', () => {
    const isDark = html.getAttribute('data-theme') === 'dark';
    if (isDark) {
      html.removeAttribute('data-theme');
      localStorage.setItem('portfolio-theme', 'light');
    } else {
      html.setAttribute('data-theme', 'dark');
      localStorage.setItem('portfolio-theme', 'dark');
    }
  });

  // Registra para hover do cursor
  btn.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  btn.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
})();
