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
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
    recentKeys = '';
  }
});
