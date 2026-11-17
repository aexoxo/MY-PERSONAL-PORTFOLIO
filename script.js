/* ============ THEME ============ */
(function () {
  const root = document.documentElement;
  const saved = (function () { try { return localStorage.getItem('theme'); } catch (e) { return null; } })();
  if (saved) root.setAttribute('data-theme', saved);

  document.getElementById('themeToggle').addEventListener('click', function () {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
})();

/* ============ MOBILE MENU ============ */
(function () {
  const btn = document.getElementById('menuBtn');
  const links = document.getElementById('navLinks');
  btn.addEventListener('click', function () {
    const open = links.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  });
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      links.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ============ ACTIVE NAV LINK ============ */
(function () {
  const sections = document.querySelectorAll('main section[id]');
  const links = document.querySelectorAll('.nav-links a');
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        links.forEach(function (l) {
          l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id);
        });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(function (s) { io.observe(s); });
})();

/* ============ SCROLL REVEAL ============ */
(function () {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (i) { i.classList.add('visible'); });
    return;
  }
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach(function (i) { io.observe(i); });
})();

/* ============ MUSIC PLAYER (offline MP3) ============
   Songs play from the files in the "music" folder, so no internet is needed.
   Each song also keeps a YouTube link.
*/
(function () {
  const songs = [
    { title: 'Beautiful World', artist: 'Hikaru Utada',        src: 'music/beautiful-world.mp3', yt: 'https://youtu.be/fVsDtG1y_Qs', colors: ['#1e4a6a', '#08121a'] },
    { title: 'Over the Moon',   artist: 'The Marías',          src: 'music/over-the-moon.mp3',   yt: 'https://youtu.be/Ah_Ig6wggtI', colors: ['#6a1b3a', '#1a0a14'] },
    { title: 'Disenchanted',    artist: 'My Chemical Romance', src: 'music/disenchanted.mp3',    yt: 'https://youtu.be/j_MlBCb9-m8', colors: ['#3a0f14', '#0d0607'] },
    { title: 'La Vaguelette',   artist: '',                    src: 'music/la-vaguelette.mp3',   yt: 'https://youtu.be/lm3t3myPspk', colors: ['#5a2a6a', '#140a1e'] },
    { title: 'Gun to My Head',  artist: 'Malcolm Todd',        src: 'music/gun-to-my-head.mp3',  yt: 'https://youtu.be/G0Hh2xX_8FU', colors: ['#7a4a1e', '#1a0f08'] }
  ];

  const audio = new Audio();
  audio.preload = 'metadata';
  let index = 0, playing = false;

  const $ = function (id) { return document.getElementById(id); };
  const cover = $('playerCover'), title = $('playerTitle'), artist = $('playerArtist');
  const playBtn = $('playBtn'), bar = $('progressBar'), progress = $('progress');
  const timeNow = $('timeNow'), timeTotal = $('timeTotal'), list = $('playlist'), ytLink = $('ytLink');

  function grad(c) { return 'linear-gradient(135deg,' + c[0] + ',' + c[1] + ')'; }
  function fmt(s) {
    if (!isFinite(s) || s < 0) return '0:00';
    const m = Math.floor(s / 60), r = Math.floor(s % 60);
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  songs.forEach(function (s, i) {
    const li = document.createElement('li');
    li.innerHTML =
      '<div class="pl-cover" style="background:' + grad(s.colors) + '">♪</div>' +
      '<div><div class="pl-title"></div><div class="pl-artist"></div></div>' +
      '<span class="pl-num">' + String(i + 1).padStart(2, '0') + '</span>';
    li.querySelector('.pl-title').textContent = s.title;
    li.querySelector('.pl-artist').textContent = s.artist || '—';
    li.addEventListener('click', function () { load(i); play(); });
    list.appendChild(li);
  });

  function setPlaying(state) {
    playing = state;
    playBtn.textContent = state ? '❚❚' : '▶';
    playBtn.setAttribute('aria-label', state ? 'Pause' : 'Play');
    cover.classList.toggle('playing', state);
  }

  function load(i) {
    index = (i + songs.length) % songs.length;
    const s = songs[index];
    title.textContent = s.title;
    artist.textContent = s.artist || '—';
    cover.style.background = grad(s.colors);
    ytLink.href = s.yt;
    audio.src = s.src;
    bar.style.width = '0%';
    timeNow.textContent = '0:00';
    timeTotal.textContent = '0:00';
    list.querySelectorAll('li').forEach(function (li, n) { li.classList.toggle('active', n === index); });
  }

  function play() { audio.play().then(function () { setPlaying(true); }).catch(function () { setPlaying(false); }); }
  function pause() { audio.pause(); setPlaying(false); }

  playBtn.addEventListener('click', function () { playing ? pause() : play(); });
  $('nextBtn').addEventListener('click', function () { const was = playing; load(index + 1); if (was) play(); });
  $('prevBtn').addEventListener('click', function () { const was = playing; load(index - 1); if (was) play(); });

  audio.addEventListener('timeupdate', function () {
    if (audio.duration) {
      bar.style.width = (audio.currentTime / audio.duration * 100) + '%';
      timeNow.textContent = fmt(audio.currentTime);
      progress.setAttribute('aria-valuenow', Math.round(audio.currentTime / audio.duration * 100));
    }
  });
  audio.addEventListener('loadedmetadata', function () { timeTotal.textContent = fmt(audio.duration); });
  audio.addEventListener('ended', function () { load(index + 1); play(); });
  progress.addEventListener('click', function (e) {
    if (!audio.duration) return;
    const r = progress.getBoundingClientRect();
    audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
  });

  load(0);
})();

/* ============ CONTACT FORM ============
   Opens the visitor's email app addressed to you (no backend needed). */
(function () {
  const form = document.getElementById('contactForm');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const d = new FormData(form);
    const subject = encodeURIComponent('Portfolio message from ' + d.get('name'));
    const body = encodeURIComponent(d.get('message') + '\n\nFrom: ' + d.get('name') + ' (' + d.get('email') + ')');
    window.location.href = 'mailto:aealbaxoxo@gmail.com?subject=' + subject + '&body=' + body;
  });
})();

/* ============ FOOTER YEAR ============ */
document.getElementById('year').textContent = new Date().getFullYear();

/* ============ CERTIFICATE LIGHTBOX ============ */
(function () {
  const box = document.getElementById('lightbox');
  if (!box) return;
  const img = document.getElementById('lightboxImg');
  document.querySelectorAll('.cert-img').forEach(function (b) {
    b.addEventListener('click', function () { img.src = b.dataset.full; box.hidden = false; });
  });
  function close() { box.hidden = true; img.src = ''; }
  box.addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
})();

/* ============ ALBUM SLIDESHOWS ============
   Put photos in images/albums/<folder>/1.jpg, 2.jpg ... (up to data-count).
   Hover (or tap on touch screens, or Enter on a keyboard) plays the slideshow. */
(function () {
  document.querySelectorAll('.album').forEach(function (album) {
    const folder = album.dataset.folder;
    const count = parseInt(album.dataset.count, 10) || 8;
    const win = album.querySelector('.album-window');
    const badge = album.querySelector('.album-badge');
    const now = badge.querySelector('.now');
    const total = badge.querySelector('.total');
    const slides = [];
    let current = 0, timer = null;

    function ok() { return slides.filter(function (s) { return s.classList.contains('ok'); }); }
    function show(i) {
      const list = ok();
      if (!list.length) return;
      current = (i + list.length) % list.length;
      slides.forEach(function (s) { s.classList.remove('active'); });
      list[current].classList.add('active');
      now.textContent = current + 1;
      total.textContent = list.length;
    }
    function refresh() {
      const list = ok();
      album.classList.toggle('has-photos', list.length > 0);
      badge.hidden = list.length < 2;
      if (list.length && !slides.some(function (s) { return s.classList.contains('active'); })) show(0);
      total.textContent = list.length || 1;
    }
    function start() {
      if (timer || ok().length < 2) return;
      album.classList.add('playing');
      timer = setInterval(function () { show(current + 1); }, 1000);
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
      album.classList.remove('playing');
      show(0);
    }

    for (let i = 1; i <= count; i++) {
      const img = new Image();
      img.className = 'slide';
      img.alt = album.dataset.folder + ' photo ' + i;
      img.decoding = 'async';
      img.onload = function () { img.classList.add('ok'); refresh(); };
      img.onerror = function () { img.remove(); const k = slides.indexOf(img); if (k > -1) slides.splice(k, 1); };
      img.src = 'images/albums/' + folder + '/' + i + '.jpg';
      slides.push(img);
      win.insertBefore(img, badge);
    }

    album.addEventListener('mouseenter', start);
    album.addEventListener('mouseleave', stop);
    album.addEventListener('focus', start);
    album.addEventListener('blur', stop);
    album.addEventListener('pointerup', function (e) {
      if (e.pointerType === 'mouse') return;
      timer ? stop() : start();
    });
    album.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); timer ? stop() : start(); }
    });
  });
})();
