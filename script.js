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

/* ============ MUSIC PLAYER ============
   Add your own audio files in a "music" folder and fill in the `src` below
   (for example "music/over-the-moon.mp3"). Without audio files, the player
   still works as a visual playlist.
*/
(function () {
  const songs = [
    { title: 'Over the Moon',     artist: 'The Marías',         src: '', colors: ['#6a1b3a', '#1a0a14'] },
    { title: 'The Ghost of You',  artist: 'My Chemical Romance', src: '', colors: ['#3a0f14', '#0d0607'] },
    { title: 'Beautiful World',   artist: 'Evangelion',          src: '', colors: ['#5a2a6a', '#140a1e'] },
    { title: 'Gun to My Head',    artist: 'Malcolm Todd',        src: '', colors: ['#7a4a1e', '#1a0f08'] },
    { title: 'Beautiful World',   artist: 'Hikaru Utada',        src: '', colors: ['#1e4a6a', '#08121a'] }
  ];

  const audio = new Audio();
  audio.preload = 'none';
  let index = 0;
  let playing = false;

  const $ = function (id) { return document.getElementById(id); };
  const cover = $('playerCover');
  const title = $('playerTitle');
  const artist = $('playerArtist');
  const playBtn = $('playBtn');
  const bar = $('progressBar');
  const progress = $('progress');
  const timeNow = $('timeNow');
  const timeTotal = $('timeTotal');
  const list = $('playlist');

  function grad(c) { return 'linear-gradient(135deg,' + c[0] + ',' + c[1] + ')'; }
  function fmt(s) {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60), r = Math.floor(s % 60);
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  // build playlist
  songs.forEach(function (s, i) {
    const li = document.createElement('li');
    li.innerHTML =
      '<div class="pl-cover" style="background:' + grad(s.colors) + '">♪</div>' +
      '<div><div class="pl-title"></div><div class="pl-artist"></div></div>' +
      '<span class="pl-num">' + String(i + 1).padStart(2, '0') + '</span>';
    li.querySelector('.pl-title').textContent = s.title;
    li.querySelector('.pl-artist').textContent = s.artist;
    li.addEventListener('click', function () { load(i); play(); });
    list.appendChild(li);
  });

  function load(i) {
    index = (i + songs.length) % songs.length;
    const s = songs[index];
    title.textContent = s.title;
    artist.textContent = s.artist;
    cover.style.background = grad(s.colors);
    audio.src = s.src || '';
    bar.style.width = '0%';
    timeNow.textContent = '0:00';
    timeTotal.textContent = '0:00';
    list.querySelectorAll('li').forEach(function (li, n) { li.classList.toggle('active', n === index); });
  }

  function setPlaying(state) {
    playing = state;
    playBtn.textContent = state ? '❚❚' : '▶';
    playBtn.setAttribute('aria-label', state ? 'Pause' : 'Play');
    cover.classList.toggle('playing', state);
  }

  function play() {
    if (!songs[index].src) { setPlaying(true); return; } // visual-only mode
    audio.play().then(function () { setPlaying(true); }).catch(function () { setPlaying(false); });
  }
  function pause() { audio.pause(); setPlaying(false); }

  playBtn.addEventListener('click', function () { playing ? pause() : play(); });
  $('nextBtn').addEventListener('click', function () { load(index + 1); if (playing) play(); });
  $('prevBtn').addEventListener('click', function () { load(index - 1); if (playing) play(); });

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