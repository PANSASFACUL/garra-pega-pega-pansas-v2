import '@google/model-viewer';
import QRCode from 'qrcode';
import '@fontsource/barlow/400.css';
import '@fontsource/barlow/500.css';
import '@fontsource/barlow/600.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/barlow-condensed/700.css';
import './style.css';
import HG from './hot_grab.json';
import ARM from './arm_timeline.json';

// HG: linha do tempo da garra pegando o tijolo IGOR (posições dos números das peças, fase e abertura)
const mv = document.getElementById('mv');
const viewer = document.getElementById('viewer');
const tB = document.getElementById('t-braco'), tG = document.getElementById('t-garra');
const arBtn = document.getElementById('arBtn'), arMsg = document.getElementById('arMsg');
const playBtn = document.getElementById('playBtn');
const PECAS = [
  [1, 'Dedo', 4], [2, 'Bracinho', 4], [3, 'Encaixe do bracinho', 8], [4, 'Placa da cruz “link”', 4],
  [5, 'Placa da cruz “link2”', 4], [6, 'Porta-seringa', 2], [7, 'Espaçador Ø6 × 7,5', 16],
  [8, 'Eixo Ø3 × 30', 8], [9, 'Pino curto da junta', 8], [10, 'Seringa 10 ml', 1]
];
const legend = document.getElementById('legend');
legend.innerHTML = PECAS.map(p => `<li><button data-n="${p[0]}"><b>${p[0]}</b><span>${p[1]}</span><em>× ${p[2]}</em></button></li>`).join('');
const slider = document.getElementById('abre'), abreTxt = document.getElementById('abreTxt');
const numBtn = document.getElementById('numBtn');
let view = 'braco', showNums = true, auto = false, raf = 0;
const lerp = (a, b, t) => a + (b - a) * t;
const ends = document.getElementById('ends'), ctlLbl = document.getElementById('ctlLbl');
const dur = () => view === 'garra' ? HG.T : ARM.T;    // duração da animação de cada vista (s)
const applyState = s => {
  if (view === 'garra') {
    const S = HG.s, x = s * (S.length - 1), i = Math.min(S.length - 2, Math.floor(x)), f = x - i, A = S[i], B = S[i + 1];
    const ab = Math.round(lerp(A.ab, B.ab, f));
    const pega = ['Levantando o tijolo', 'Segurando no alto', 'Descendo com o tijolo'].includes(A.f) ? 'tijolo preso entre os dedos' : ab + ' mm entre as pontas';
    abreTxt.innerHTML = A.f + ' <small>' + pega + '</small>';
    for (let n = 1; n <= 10; n++) {
      const a = A['n' + n], b = B['n' + n];
      mv.updateHotspot({name: 'hotspot-n' + n, position: `${lerp(a[0], b[0], f)}m ${lerp(a[1], b[1], f)}m ${lerp(a[2], b[2], f)}m`});
    }
  } else {
    const t = s * ARM.T;
    let fase = ARM.fases[0][1];
    for (const [t0, nome] of ARM.fases) if (t >= t0) fase = nome;
    const presa = ARM.carry.some(([a, b]) => t > a && t < b);
    abreTxt.innerHTML = fase + ' <small>' + (presa ? 'tijolo preso na garra' : 'garra vazia') + '</small>';
  }
};
const setManual = s => {
  auto = false; cancelAnimationFrame(raf); playBtn.textContent = view === 'garra' ? 'Pegar o tijolo sozinha' : 'Mover o braço sozinho';
  mv.pause(); mv.currentTime = s * dur(); applyState(s);
};
const follow = () => {
  if (!auto) return;
  let s;
  if (view === 'garra') s = (mv.currentTime % HG.T) / HG.T;
  else s = (mv.currentTime % ARM.T) / ARM.T;
  slider.value = Math.round(s * 100); applyState(s);
  raf = requestAnimationFrame(follow);
};
const calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const startAuto = () => {           // anima sozinho (ao abrir a página, ao trocar de vista e na realidade aumentada)
  auto = true; playBtn.textContent = 'Parar a animação';
  mv.play(); cancelAnimationFrame(raf); raf = requestAnimationFrame(follow);
};
slider.addEventListener('input', () => setManual(slider.value / 100));
playBtn.addEventListener('click', () => {
  if (auto) { setManual(slider.value / 100); return; }
  mv.currentTime = (slider.value / 100) * dur(); startAuto();
});
const mark = n => {
  document.querySelectorAll('.hot, .legend button').forEach(e => e.classList.toggle('on', e.dataset.n === String(n)));
};
legend.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (view !== 'garra') setView('garra');
  if (!showNums) { showNums = true; viewer.classList.add('show-hot'); numBtn.textContent = 'Esconder números'; }
  mark(b.dataset.n);
});
mv.addEventListener('click', e => { const h = e.target.closest('.hot'); if (h) mark(h.dataset.n); });
numBtn.addEventListener('click', () => {
  showNums = !showNums; numBtn.textContent = showNums ? 'Esconder números' : 'Mostrar números';
  viewer.classList.toggle('show-hot', showNums && view === 'garra');
});
const setView = v => {
  view = v;
  tB.setAttribute('aria-pressed', v === 'braco'); tG.setAttribute('aria-pressed', v === 'garra');
  mv.src = `models/${v}.glb`; mv.iosSrc = `models/${v}.usdz`; mv.poster = `img/poster_${v}.webp`;
  mv.cameraOrbit = v === 'braco' ? '-25deg 70deg auto' : '20deg 75deg auto';
  mv.cameraTarget = 'auto auto auto';
  viewer.classList.toggle('show-hot', v === 'garra' && showNums);
  ctlLbl.textContent = v === 'garra' ? 'Pegar o tijolo IGOR' : 'Levar o tijolo de A até B';
  ends.innerHTML = v === 'garra' ? '<span>início</span><span>fim</span>' : '<span>A</span><span>B e de volta a A</span>';
  cancelAnimationFrame(raf); slider.value = 0;
  auto = !calmo; playBtn.textContent = auto ? 'Parar a animação' : (v === 'garra' ? 'Pegar o tijolo sozinha' : 'Mover o braço sozinho');
};
tB.addEventListener('click', () => setView('braco'));
tG.addEventListener('click', () => setView('garra'));
setView(view);
mv.addEventListener('load', () => { if (auto) { mv.currentTime = 0; startAuto(); } else setManual(slider.value / 100); });
// na realidade aumentada o braço/garra sempre se movem sozinhos
mv.addEventListener('ar-status', e => { if (e.detail.status === 'session-started') startAuto(); });
arBtn.addEventListener('click', async () => {
  if (mv.canActivateAR) {
    startAuto();
    try { await mv.activateAR(); arMsg.textContent = ''; }
    catch (e) { arMsg.textContent = 'Não foi possível abrir a RA neste navegador.'; }
  } else {
    arMsg.textContent = 'Abra este link no celular: Chrome no Android ou Safari no iPhone.';
  }
});
// QR code com o endereço da página, para abrir no celular
const qr = document.getElementById('qr');
if (/^https?:/.test(location.href) && !/localhost|127\.0\.0\.1/.test(location.hostname)) {
  const c = document.createElement('canvas');
  document.getElementById('qrBox').appendChild(c);
  QRCode.toCanvas(c, location.href.split('#')[0], {errorCorrectionLevel: 'Q', margin: 0, width: 184}).catch(() => { qr.style.display = 'none'; });
} else qr.style.display = 'none';
