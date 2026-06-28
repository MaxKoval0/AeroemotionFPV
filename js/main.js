(() => {
  // Single place to update the WhatsApp number used across the page.
  const WHATSAPP_NUMBER = '34600000000';
  document.querySelectorAll('[data-whatsapp-link]').forEach((el) => {
    const text = encodeURIComponent(el.dataset.whatsappText || '');
    el.href = `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${text}` : ''}`;
  });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* (hover: hover) and (pointer: fine) alone is unreliable: a desktop browser
     window just resized narrow still reports a real mouse, so cursor-driven
     effects would stay active in what is, for every other purpose on this
     site, the mobile layout. Folding in the same width breakpoint the rest
     of the CSS already treats as "mobile" makes the two agree. */
  const isDesktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches && window.innerWidth > 900;

  /* Navbar scroll state */
  const navbar = document.getElementById('navbar');
  const onScroll = () => navbar.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Hero parallax — background layers drift at different speeds on scroll */
  if (!reduceMotion) {
    const parallaxLayers = [
      { el: document.querySelector('.hero-art__ridge--back'), speed: 18 },
      { el: document.querySelector('.hero-art__ridge--front'), speed: 40 },
    ].filter((layer) => layer.el);
    if (parallaxLayers.length) {
      let parallaxTicking = false;
      const updateParallax = () => {
        const progress = Math.min(window.scrollY / window.innerHeight, 1);
        parallaxLayers.forEach(({ el, speed }) => {
          el.style.transform = `translateY(${progress * speed}px)`;
        });
        parallaxTicking = false;
      };
      window.addEventListener('scroll', () => {
        if (!parallaxTicking) {
          parallaxTicking = true;
          requestAnimationFrame(updateParallax);
        }
      }, { passive: true });
    }
  }

  /* Hero sparkle particles — twinkling motes confined to the title zone */
  const heroCanvas = document.querySelector('.hero__particles');
  if (heroCanvas && !reduceMotion) {
    const heroEl = document.querySelector('.hero');
    const ctx = heroCanvas.getContext('2d');
    const canHover = isDesktopPointer;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const colors = ['211,178,124', '246,231,200', '246,243,238'];
    /* Pre-render each sparkle color once to an offscreen sprite — the live draw
       loop then does one drawImage() per particle instead of building 5 fresh
       canvas gradients per particle every frame (the old approach could mean
       thousands of gradient allocations per second with a full particle set). */
    const spriteSize = 36;
    const sprites = colors.map((color) => {
      const sprite = document.createElement('canvas');
      sprite.width = spriteSize;
      sprite.height = spriteSize;
      const sctx = sprite.getContext('2d');
      const c = spriteSize / 2;

      const glowR = 6.5;
      const outerGlow = sctx.createRadialGradient(c, c, 0, c, c, glowR);
      outerGlow.addColorStop(0,   `rgba(${color},0.48)`);
      outerGlow.addColorStop(0.3, `rgba(${color},0.14)`);
      outerGlow.addColorStop(1,   'rgba(0,0,0,0)');
      sctx.beginPath();
      sctx.fillStyle = outerGlow;
      sctx.arc(c, c, glowR, 0, Math.PI * 2);
      sctx.fill();

      const armLen = 5.0;
      [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx, dy]) => {
        const ag = sctx.createLinearGradient(c, c, c + dx * armLen, c + dy * armLen);
        ag.addColorStop(0,   `rgba(${color},0.88)`);
        ag.addColorStop(0.5, `rgba(${color},0.20)`);
        ag.addColorStop(1,   'rgba(0,0,0,0)');
        sctx.beginPath();
        sctx.strokeStyle = ag;
        sctx.lineWidth = 0.52;
        sctx.lineCap = 'round';
        sctx.moveTo(c, c);
        sctx.lineTo(c + dx * armLen, c + dy * armLen);
        sctx.stroke();
      });

      sctx.beginPath();
      sctx.fillStyle = `rgba(${color},0.96)`;
      sctx.arc(c, c, 0.72, 0, Math.PI * 2);
      sctx.fill();
      return sprite;
    });
    let particles = [];
    let width = 0;
    let height = 0;
    let frame = null;
    const pointer = { x: -9999, y: -9999 };
    const glowPos = { x: 0, y: 0 };
    let glowAlpha = 0;
    let zoneTop = 0.64;
    let zoneHeight = 160;

    const makeParticle = (init = false) => {
      const yMin = height * zoneTop;
      const zH = Math.min(zoneHeight, Math.max(1, height - yMin));
      return {
        x: Math.random() * width,
        y: yMin + (init ? Math.random() * zH : Math.random() * zH * 0.12),
        r: Math.random() * 1.0 + 0.45,
        maxA: Math.random() * 0.78 + 0.22,
        dx: (Math.random() - 0.5) * 0.13,
        dy: (Math.random() - 0.5) * 0.13,
        ddx: (Math.random() - 0.5) * 0.003,
        ddy: (Math.random() - 0.5) * 0.003,
        rotation: (Math.random() - 0.5) * Math.PI * 0.4,
        life: init ? Math.random() : 0,
        lifeSpeed: Math.random() * 0.0028 + 0.001,
        colorIndex: Math.floor(Math.random() * colors.length),
      };
    };

    const buildParticles = () => {
      const yMin = height * zoneTop;
      const zH = Math.min(zoneHeight, Math.max(1, height - yMin));
      const area = width * zH;
      const count = Math.min(55, Math.max(18, Math.round(area / 2000)));
      particles = Array.from({ length: count }, () => makeParticle(true));
    };

    const resize = () => {
      const rect = heroEl.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      heroCanvas.width = width * dpr;
      heroCanvas.height = height * dpr;
      heroCanvas.style.width = `${width}px`;
      heroCanvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const contentEl = heroEl.querySelector('.hero__content');
      if (contentEl && height > 0) {
        const rootFS = parseFloat(getComputedStyle(document.documentElement).fontSize);
        const goldLineY = contentEl.offsetTop + (8 * rootFS - 25);
        const contentBottom = contentEl.offsetTop + contentEl.offsetHeight;
        zoneTop = Math.max(0.35, goldLineY / height);
        zoneHeight = Math.max(80, contentBottom - goldLineY + 28);
        const zoneBottomPct = Math.min(100, Math.round((contentBottom + 28) / height * 100));
        heroEl.style.setProperty('--hero-zone-top', `${Math.round(zoneTop * 100)}%`);
        heroEl.style.setProperty('--hero-zone-bottom', `${zoneBottomPct}%`);
      }
      buildParticles();
    };

    const drawSparkle = (x, y, r, alpha, colorIndex, rotation) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.rotate(rotation);
      const size = spriteSize * r;
      ctx.drawImage(sprites[colorIndex], -size / 2, -size / 2, size, size);
      ctx.restore();
    };

    const draw = (t) => {
      ctx.clearRect(0, 0, width, height);

      if (canHover && pointer.x > -999) {
        glowAlpha = Math.min(1, glowAlpha + 0.06);
        glowPos.x += (pointer.x - glowPos.x) * 0.04;
        glowPos.y += (pointer.y - glowPos.y) * 0.04;
      } else {
        glowAlpha = Math.max(0, glowAlpha - 0.04);
      }

      const yMin = height * zoneTop;
      const yMax = yMin + Math.min(zoneHeight, height - yMin);

      if (canHover && glowAlpha > 0.01) {
        ctx.save();
        ctx.globalAlpha = glowAlpha;
        const breathe = 1 + Math.sin(t / 3200) * 0.07;
        const r = 220 * breathe;
        const glow = ctx.createRadialGradient(glowPos.x, glowPos.y, 0, glowPos.x, glowPos.y, r);
        glow.addColorStop(0,    'rgba(238,178,88,0.20)');
        glow.addColorStop(0.12, 'rgba(225,168,100,0.13)');
        glow.addColorStop(0.38, 'rgba(211,178,124,0.06)');
        glow.addColorStop(0.65, 'rgba(200,155,90,0.02)');
        glow.addColorStop(1,    'rgba(200,155,90,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      particles.forEach((p) => {
        p.life += p.lifeSpeed;

        p.dx += p.ddx; p.dy += p.ddy;
        const spd = Math.hypot(p.dx, p.dy);
        if (spd > 0.20) { p.dx *= 0.20 / spd; p.dy *= 0.20 / spd; }

        p.x += p.dx;
        p.y += p.dy;

        if (p.x < -4) p.x = width + 4;
        if (p.x > width + 4) p.x = -4;

        if (p.life >= 1 || p.y < yMin - 3 || p.y > yMax + 4) {
          Object.assign(p, makeParticle(false));
          return;
        }

        const fadeIn  = Math.min(1, p.life / 0.15);
        const fadeOut = p.life > 0.78 ? Math.max(0, 1 - (p.life - 0.78) / 0.22) : 1;
        let alpha = fadeIn * fadeOut * p.maxA;

        let drawX = p.x, drawY = p.y;
        if (canHover) {
          const dx = p.x - pointer.x, dy = p.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 110 && dist > 0) {
            const force = (110 - dist) / 110;
            drawX += (dx / dist) * force * 12;
            drawY += (dy / dist) * force * 12;
            alpha = Math.min(1, alpha + force * 0.28);
          }
        }

        drawSparkle(drawX, drawY, p.r, alpha, p.colorIndex, p.rotation);
      });

      frame = requestAnimationFrame(draw);
    };

    const start = () => { if (!frame) frame = requestAnimationFrame(draw); };
    const stop = () => { if (frame) { cancelAnimationFrame(frame); frame = null; } };

    resize();
    start();
    document.fonts.ready.then(() => resize());

    let resizeQueued = false;
    window.addEventListener('resize', () => {
      if (resizeQueued) return;
      resizeQueued = true;
      requestAnimationFrame(() => { resize(); resizeQueued = false; });
    });

    if (canHover) {
      heroEl.addEventListener('pointermove', (e) => {
        const rect = heroEl.getBoundingClientRect();
        const nx = e.clientX - rect.left;
        const ny = e.clientY - rect.top;
        if (glowAlpha < 0.01) { glowPos.x = nx; glowPos.y = ny; }
        pointer.x = nx;
        pointer.y = ny;
      });
      heroEl.addEventListener('pointerleave', () => {
        pointer.x = -9999;
        pointer.y = -9999;
      });
    }

    new IntersectionObserver((entries) => {
      entries.forEach((entry) => (entry.isIntersecting ? start() : stop()));
    }, { threshold: 0 }).observe(heroEl);
  }

  /* Mobile menu — full-screen overlay with body scroll lock */
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  function setMenuOpen(isOpen) {
    mobileMenu.classList.toggle('is-open', isOpen);
    navToggle.classList.toggle('is-active', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    document.documentElement.classList.toggle('menu-open', isOpen);
  }
  navToggle.addEventListener('click', () => {
    setMenuOpen(!mobileMenu.classList.contains('is-open'));
  });
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) setMenuOpen(false);
  });

  /* Split headline words for a line-by-line "blinds" reveal */
  if (!reduceMotion) {
    const splitWords = (root) => {
      let i = 0;
      const walk = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          node.textContent.split(/(\s+)/).forEach((part) => {
            if (part === '') return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(part));
              return;
            }
            const word = document.createElement('span');
            word.className = 'word';
            const inner = document.createElement('span');
            inner.className = 'word__inner';
            inner.textContent = part;
            inner.style.setProperty('--word-i', i++);
            word.appendChild(inner);
            frag.appendChild(word);
          });
          node.replaceWith(frag);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          [...node.childNodes].forEach(walk);
        }
      };
      [...root.childNodes].forEach(walk);
    };
    document.querySelectorAll('.hero__title, .section-head h2, .contact__intro h2').forEach((heading) => {
      heading.classList.add('reveal--split');
      splitWords(heading);
    });
  }

  /* Reveal-on-scroll */
  const revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 4, 3) * 80}ms`;
      revealObserver.observe(el);
    });
  }

  /* Scroll-spy nav indicator */
  const navLinks = document.querySelectorAll('.navbar__link[href^="#"]');
  const spyTargets = [...navLinks]
    .map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) }))
    .filter((entry) => entry.section);
  if (spyTargets.length) {
    const spyObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const match = spyTargets.find(({ section }) => section === entry.target);
        navLinks.forEach((link) => link.classList.toggle('is-active', link === match?.link));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    spyTargets.forEach(({ section }) => spyObserver.observe(section));
  }

  /* Lazy-load background videos; fall back to the placeholder gradient on error.
     Only the layer/device that's actually visible loads — inactive tier videos
     are fetched on demand when the user switches tabs, so we never download
     and decode 3-4 multi-MB videos at once just from one scroll. */
  function loadVideo(video) {
    if (video.dataset.loaded) return;
    video.dataset.loaded = 'true';
    video.src = video.dataset.src;
    video.addEventListener('loadeddata', () => video.classList.add('is-loaded'));
    video.addEventListener('error', () => video.remove());
    video.load();
  }
  /* Autoplay can silently fail (slow connection still buffering, a policy
     quirk, etc.) and a muted background video has no controls to recover
     with — so a tap directly on it always retries, which is a real user
     gesture and therefore guaranteed to be allowed. */
  function playVideo(video) {
    video.play().catch(() => {
      video.addEventListener('click', () => video.play().catch(() => {}), { once: true });
    });
  }
  const videos = document.querySelectorAll('.screen-media__video[data-src]');
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (!entry.isIntersecting) return;
      const stage = video.closest('.demo-stage');
      const inPhone = video.closest('.device-phone');
      let isInitiallyVisible;
      if (inPhone) {
        isInitiallyVisible = stage && stage.dataset.tierStage === '3';
      } else {
        const layer = video.closest('.screen-media__layer');
        isInitiallyVisible = layer ? layer.classList.contains('is-active') : true;
      }
      if (!isInitiallyVisible) return;
      loadVideo(video);
      playVideo(video);
      videoObserver.unobserve(video);
    });
  }, { threshold: 0.25 });
  videos.forEach((video) => videoObserver.observe(video));

  /* Cinematic hover cursor for device screens */
  if (!reduceMotion && isDesktopPointer) {
    const cineCursor = document.createElement('div');
    cineCursor.className = 'cine-cursor';
    cineCursor.setAttribute('aria-hidden', 'true');
    cineCursor.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg><span>Watch</span>';
    document.body.appendChild(cineCursor);

    document.querySelectorAll('.device-laptop__screen, .device-phone__screen').forEach((screen) => {
      screen.style.cursor = 'none';
      screen.addEventListener('pointerenter', () => cineCursor.classList.add('is-active'));
      screen.addEventListener('pointerleave', () => cineCursor.classList.remove('is-active'));
      screen.addEventListener('pointermove', (e) => {
        cineCursor.style.setProperty('--cx', `${e.clientX}px`);
        cineCursor.style.setProperty('--cy', `${e.clientY}px`);
      });
    });
  }

  /* Magnetic CTA buttons */
  if (!reduceMotion && isDesktopPointer) {
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    document.querySelectorAll('.btn--primary, .btn--ghost').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const rect = btn.getBoundingClientRect();
        const dx = clamp((e.clientX - (rect.left + rect.width / 2)) * 0.25, -8, 8);
        const dy = clamp((e.clientY - (rect.top + rect.height / 2)) * 0.25, -8, 8);
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  /* Tilt + spotlight glow for philosophy and audience cards */
  if (!reduceMotion && isDesktopPointer) {
    document.querySelectorAll('.pillar, .audience-card, .shift-card').forEach((card) => {
      card.style.transitionDelay = '0s';
      card.addEventListener('pointerenter', (e) => {
        const from = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.pillar, .audience-card, .shift-card');
        if (from && from !== card) {
          card.classList.add('is-glow-transfer');
          card.addEventListener('animationend', () => card.classList.remove('is-glow-transfer'), { once: true });
        }
      });
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        card.style.setProperty('--mx', `${px * 100}%`);
        card.style.setProperty('--my', `${py * 100}%`);
        const tilt = 6;
        card.style.setProperty('--rx', `${(0.5 - py) * tilt * 2}deg`);
        card.style.setProperty('--ry', `${(px - 0.5) * tilt * 2}deg`);
      });
      card.addEventListener('pointerleave', (e) => {
        const rect = card.getBoundingClientRect();
        const px = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
        const py = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
        card.style.setProperty('--mx', `${px * 100}%`);
        card.style.setProperty('--my', `${py * 100}%`);
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* Ambient cursor glow behind The Shift section — softens the cut from the hero */
  if (!reduceMotion && isDesktopPointer) {
    const philosophyGlow = document.querySelector('.philosophy__glow');
    const philosophySection = document.querySelector('.philosophy');
    if (philosophyGlow && philosophySection) {
      philosophySection.addEventListener('pointermove', (e) => {
        const rect = philosophySection.getBoundingClientRect();
        philosophyGlow.style.setProperty('--gx', `${e.clientX - rect.left}px`);
        philosophyGlow.style.setProperty('--gy', `${e.clientY - rect.top}px`);
        philosophyGlow.classList.add('is-active');
      });
      philosophySection.addEventListener('pointerleave', () => {
        philosophyGlow.classList.remove('is-active');
      });
    }
  }

  /* Touch equivalent of the tilt/spotlight: continuous scroll-position tilt
     instead of pointer position, since there's no cursor to react to on touch.
     Cards above viewport-centre tilt down toward it, cards below tilt up
     toward it, settling flat as they pass through the centre. */
  if (!reduceMotion && !isDesktopPointer) {
    const tiltEls = document.querySelectorAll('.pillar, .audience-card, .shift-card');
    const philosophyGlow = document.querySelector('.philosophy__glow');
    const philosophySection = document.querySelector('.philosophy');
    const maxTilt = 13;

    function updateScrollTilt() {
      const vh = window.innerHeight;
      const vCenter = vh / 2;
      tiltEls.forEach((card) => {
        const rect = card.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > vh + 100) return;
        card.classList.add('is-scroll-tilt');
        const cardCenter = rect.top + rect.height / 2;
        const progress = Math.max(-1, Math.min(1, (cardCenter - vCenter) / vCenter));
        card.style.setProperty('--rx', `${(-progress * maxTilt).toFixed(2)}deg`);
        card.style.setProperty('--depth-scale', `${(1 - Math.abs(progress) * 0.06).toFixed(3)}`);
        card.style.setProperty('--mx', '50%');
        card.style.setProperty('--my', `${(50 + progress * 15).toFixed(1)}%`);
      });
      if (philosophyGlow && philosophySection) {
        const rect = philosophySection.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < vh) {
          const center = rect.top + rect.height / 2;
          const progress = Math.max(-1, Math.min(1, (center - vCenter) / vCenter));
          philosophyGlow.style.setProperty('--gx', `${50 + progress * 20}%`);
          philosophyGlow.style.setProperty('--gy', `${50 + progress * 30}%`);
          philosophyGlow.classList.add('is-active');
        }
      }
    }

    /* A scroll-event listener isn't enough here: iOS Safari batches/throttles
       scroll event dispatch during momentum scrolling, so a handler driven by
       it only "catches up" once the finger lifts. Polling every animation
       frame instead stays in sync with the actual compositor-driven scroll. */
    function rafLoop() {
      updateScrollTilt();
      requestAnimationFrame(rafLoop);
    }
    requestAnimationFrame(rafLoop);
  }

  /* Tier switcher: laptop media + phone reel + tier detail panels */
  const tierTabs = document.querySelectorAll('.tier-tab');
  const tierSwitcher = document.querySelector('.tier-switcher');
  const demoStage = document.querySelector('.demo-stage');
  const tierPanels = document.querySelectorAll('.tier-panel');
  const laptopLayers = document.querySelectorAll('.device-laptop [data-tier-media]');

  function updateTierSwitcherFade() {
    if (!tierSwitcher) return;
    const maxScroll = tierSwitcher.scrollWidth - tierSwitcher.clientWidth;
    tierSwitcher.classList.toggle('is-scrolled', tierSwitcher.scrollLeft > 8);
    tierSwitcher.classList.toggle('is-end', tierSwitcher.scrollLeft >= maxScroll - 8);
  }
  if (tierSwitcher) {
    updateTierSwitcherFade();
    tierSwitcher.addEventListener('scroll', updateTierSwitcherFade, { passive: true });
  }

  function scrollTabIntoView(tab) {
    if (!tierSwitcher) return;
    const maxScroll = tierSwitcher.scrollWidth - tierSwitcher.clientWidth;
    const tabCenter = tab.offsetLeft + tab.offsetWidth / 2;
    const target = Math.min(maxScroll, Math.max(0, tabCenter - tierSwitcher.clientWidth / 2));
    tierSwitcher.scrollTo({ left: target, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function setTier(tier) {
    const prevTier = demoStage.dataset.tierStage;
    const prevLaptopMediaKey = prevTier === '1' ? '1' : '2';

    tierTabs.forEach((tab) => {
      const active = tab.dataset.tier === tier;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      if (active) {
        scrollTabIntoView(tab);
        const price = tab.querySelector('.tier-tab__price');
        if (price) {
          price.classList.remove('is-pulse');
          void price.offsetWidth;
          price.classList.add('is-pulse');
        }
      }
    });
    tierPanels.forEach((panel) => {
      panel.hidden = panel.dataset.tierPanel !== tier;
    });
    demoStage.dataset.tierStage = tier;

    const laptopMediaKey = tier === '1' ? '1' : '2';
    laptopLayers.forEach((layer) => {
      const active = layer.dataset.tierMedia === laptopMediaKey;
      layer.classList.toggle('is-active', active);
      const video = layer.querySelector('video');
      if (!video) return;
      if (active) { loadVideo(video); playVideo(video); }
      else video.pause();
    });

    const phoneVideo = document.querySelector('.device-phone__screen video[data-src]');
    if (phoneVideo) {
      if (tier === '3') { loadVideo(phoneVideo); playVideo(phoneVideo); }
      else if (phoneVideo.dataset.loaded) phoneVideo.pause();
    }

    if (laptopMediaKey !== prevLaptopMediaKey) triggerScanSweep();
    if (laptopMediaKey === '2') animatePriceCount();
    if (tier === '3') animateLikeCount();
  }

  tierTabs.forEach((tab) => tab.addEventListener('click', () => setTier(tab.dataset.tier)));

  /* Scan-sweep across the laptop screen when the footage changes */
  const scanSweep = document.querySelector('.scan-sweep');
  function triggerScanSweep() {
    if (!scanSweep || reduceMotion) return;
    scanSweep.classList.remove('is-sweeping');
    void scanSweep.offsetWidth;
    scanSweep.classList.add('is-sweeping');
  }

  /* Price count-up for the 3D Edition overlay */
  const priceCountEl = document.querySelector('[data-price-count]');
  function formatPrice(n) {
    return `€${Math.round(n).toLocaleString('en-US')}`;
  }
  function animatePriceCount() {
    if (!priceCountEl) return;
    const target = Number(priceCountEl.dataset.target);
    if (reduceMotion) {
      priceCountEl.textContent = formatPrice(target);
      return;
    }
    const start = Math.round(target * 0.55);
    const duration = 1000;
    const startTime = performance.now();
    function frame(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      priceCountEl.textContent = formatPrice(start + (target - start) * eased);
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* Like-count animation for the 3D + Social Edition reel */
  const likeCountEl = document.querySelector('[data-like-count]');
  function formatCount(n) {
    if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
    if (n >= 1e3) return `${(n / 1e3).toFixed(1).replace(/\.0$/, '')}K`;
    return String(n);
  }
  function animateLikeCount() {
    if (!likeCountEl) return;
    const start = 842000;
    const target = 1247000;
    if (reduceMotion) {
      likeCountEl.textContent = formatCount(target);
      return;
    }
    const duration = 1200;
    const startTime = performance.now();
    function frame(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      likeCountEl.textContent = formatCount(Math.round(start + (target - start) * eased));
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* Lead form */
  const form = document.getElementById('leadForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    form.classList.add('is-submitted');
  });
})();
