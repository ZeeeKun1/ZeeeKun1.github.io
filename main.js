const progress = document.createElement('div');
progress.className = 'reading-progress';
progress.setAttribute('aria-hidden', 'true');
document.body.appendChild(progress);

const sections = [...document.querySelectorAll('main section[id]')];
const tocLinks = [...document.querySelectorAll('.toc a[href^="#"]')];
let scrollScheduled = false;

function updateReadingState() {
  const available = document.documentElement.scrollHeight - window.innerHeight;
  const percent = available > 0 ? Math.min(100, Math.max(0, window.scrollY / available * 100)) : 0;
  progress.style.width = `${percent}%`;

  const current = [...sections].reverse().find(section => section.getBoundingClientRect().top <= 120) || sections[0];
  tocLinks.forEach(link => {
    if (link.getAttribute('href') === `#${current?.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scrollScheduled = false;
}

window.addEventListener('scroll', () => {
  if (scrollScheduled) return;
  scrollScheduled = true;
  requestAnimationFrame(updateReadingState);
}, { passive: true });
window.addEventListener('resize', updateReadingState);
updateReadingState();

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const avatar = document.querySelector('.profile-pic');
let avatarResetTimer;

if (avatar) {
  avatar.addEventListener('pointerdown', event => {
    if (reducedMotion.matches || event.button !== 0) return;
    clearTimeout(avatarResetTimer);
    avatar.classList.remove('is-rebounding');
    avatar.classList.add('is-pressed');
  });
  avatar.addEventListener('pointerup', () => {
    if (reducedMotion.matches || !avatar.classList.contains('is-pressed')) return;
    avatar.classList.remove('is-pressed');
    avatar.classList.add('is-rebounding');
    avatarResetTimer = setTimeout(() => avatar.classList.remove('is-rebounding'), 300);
  });
  const resetAvatar = () => {
    clearTimeout(avatarResetTimer);
    avatar.classList.remove('is-pressed', 'is-rebounding');
  };
  avatar.addEventListener('pointerleave', resetAvatar);
  avatar.addEventListener('pointercancel', resetAvatar);
}

const cards = [...document.querySelectorAll('.pub-item')];
cards.forEach(card => {
  let resetTimer;
  let cardRect;
  card.addEventListener('pointerenter', () => { cardRect = card.getBoundingClientRect(); });
  card.addEventListener('pointermove', event => {
    if (reducedMotion.matches || !finePointer.matches) return;
    clearTimeout(resetTimer);
    const rect = cardRect || card.getBoundingClientRect();
    const rotateX = ((event.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -4;
    const rotateY = ((event.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 4;
    card.classList.add('is-tilting');
    card.style.transitionDuration = '100ms';
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  });
  card.addEventListener('pointerleave', () => {
    cardRect = undefined;
    card.style.transitionDuration = '450ms';
    card.style.transform = '';
    card.classList.remove('is-tilting');
    resetTimer = setTimeout(() => { card.style.transitionDuration = ''; }, 450);
  });
});

reducedMotion.addEventListener('change', () => {
  if (!reducedMotion.matches) return;
  avatar?.classList.remove('is-pressed', 'is-rebounding');
  cards.forEach(card => {
    card.classList.remove('is-tilting');
    card.style.transform = '';
  });
});

document.addEventListener('click', event => {
  if (reducedMotion.matches || event.detail === 0 || !(event.target instanceof Element) || event.target.closest('a, button, .pub-item')) return;
  const ripple = document.createElement('span');
  ripple.className = 'mindful-ripple';
  ripple.setAttribute('aria-hidden', 'true');
  ripple.style.left = `${event.clientX}px`;
  ripple.style.top = `${event.clientY}px`;
  document.body.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
});

function showMessage(message) {
  document.querySelector('.secret-banner')?.remove();
  const banner = document.createElement('div');
  banner.className = 'secret-banner';
  banner.setAttribute('role', 'status');
  banner.textContent = message;
  document.body.appendChild(banner);
  requestAnimationFrame(() => banner.classList.add('is-visible'));
  setTimeout(() => {
    banner.classList.remove('is-visible');
    setTimeout(() => banner.remove(), 350);
  }, 3000);
}

const stressButton = document.createElement('button');
stressButton.className = 'stress-button';
stressButton.type = 'button';
stressButton.textContent = '☕';
stressButton.setAttribute('aria-label', 'Take a break');
stressButton.title = 'Need a break?';
stressButton.addEventListener('click', () => {
  stressButton.classList.add('is-bouncing');
  setTimeout(() => stressButton.classList.remove('is-bouncing'), 150);
  if (reducedMotion.matches) {
    showMessage('☕ Take a moment to breathe.');
    return;
  }
  const emojis = ['🌟', '🐾', '🍃', '☕', '🎵', '☁️', '🎈', '✨'];
  for (let i = 0; i < 6; i++) {
    const bubble = document.createElement('span');
    bubble.className = 'bubble';
    bubble.setAttribute('aria-hidden', 'true');
    bubble.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    bubble.style.setProperty('--right', `${20 + Math.random() * 72}px`);
    bubble.style.setProperty('--sway', `${Math.random() * 80 - 45}px`);
    bubble.style.fontSize = `${15 + Math.random() * 15}px`;
    bubble.style.animationDelay = `${i * 60}ms`;
    document.body.appendChild(bubble);
    bubble.addEventListener('animationend', () => bubble.remove(), { once: true });
  }
});
document.body.appendChild(stressButton);

let recentKeys = '';
window.addEventListener('keydown', event => {
  if (event.ctrlKey || event.altKey || event.metaKey || event.key.length !== 1) return;
  recentKeys = (recentKeys + event.key.toLowerCase()).slice(-3);
  if (recentKeys === 'hci') {
    showMessage('🎉 You found the secret! Keep calm and do HCI.');
    if (!reducedMotion.matches) {
      document.body.classList.add('secret-flash');
      setTimeout(() => document.body.classList.remove('secret-flash'), 3000);
    }
    recentKeys = '';
  }
});
