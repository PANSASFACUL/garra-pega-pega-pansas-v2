import '@google/model-viewer';
import QRCode from 'qrcode';
import '@fontsource/barlow/400.css';
import '@fontsource/barlow/500.css';
import '@fontsource/barlow/600.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/barlow-condensed/700.css';
import './style.css';
import HG from './hot_grab.json';

// HG: linha do tempo da garra pegando a palavra IGOR (posições dos números das peças, fase e abertura)
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
let view = 'garra', showNums = true, auto = false, raf = 0;
const lerp = (a, b, t) => a + (b - a) * t;
const ends = document.getElementById('ends'), ctlLbl = document.getElementById('ctlLbl');
const dur = () => view === 'garra' ? HG.T : 2.0;      // garra: linha do tempo inteira; braço: abrir -> fechar
const applyState = s => {
  if (view === 'garra') {
    const S = HG.s, x = s * (S.length - 1), i = Math.min(S.length - 2, Math.floor(x)), f = x - i, A = S[i], B = S[i + 1];
    const ab = Math.round(lerp(A.ab, B.ab, f));
    const pega = ['Levantando a palavra', 'Segurando no alto', 'Descendo com a palavra'].includes(A.f) ? 'palavra presa entre os dedos' : ab + ' mm entre as pontas';
    abreTxt.innerHTML = A.f + ' <small>' + pega + '</small>';
    for (let n = 1; n <= 10; n++) {
      const a = A['n' + n], b = B['n' + n];
      mv.updateHotspot({name: 'hotspot-n' + n, position: `${lerp(a[0], b[0], f)}m ${lerp(a[1], b[1], f)}m ${lerp(a[2], b[2], f)}m`});
    }
  } else {
    const L = HG.abb, x = s * (L.length - 1), i = Math.min(L.length - 2, Math.floor(x));
    abreTxt.innerHTML = Math.round(lerp(L[i], L[i + 1], x - i)) + ' <small>mm entre as pontas</small>';
  }
};
const setManual = s => {
  auto = false; cancelAnimationFrame(raf); playBtn.textContent = view === 'garra' ? 'Pegar a palavra sozinha' : 'Abrir e fechar sozinha';
  mv.pause(); mv.currentTime = s * dur(); applyState(s);
};
const follow = () => {
  if (!auto) return;
  let s;
  if (view === 'garra') s = (mv.currentTime % HG.T) / HG.T;
  else { const t = mv.currentTime % 4; s = t <= 2 ? t / 2 : 2 - t / 2; }
  slider.value = Math.round(s * 100); applyState(s);
  raf = requestAnimationFrame(follow);
};
slider.addEventListener('input', () => setManual(slider.value / 100));
playBtn.addEventListener('click', () => {
  if (auto) { setManual(slider.value / 100); return; }
  auto = true; playBtn.textContent = 'Parar a animação';
  mv.currentTime = (slider.value / 100) * dur(); mv.play(); raf = requestAnimationFrame(follow);
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
  mv.cameraOrbit = v === 'braco' ? '35deg 72deg auto' : '20deg 75deg auto';
  mv.cameraTarget = 'auto auto auto';
  viewer.classList.toggle('show-hot', v === 'garra' && showNums);
  ctlLbl.textContent = v === 'garra' ? 'Pegar a palavra IGOR' : 'Mexa a garra';
  ends.innerHTML = v === 'garra' ? '<span>início</span><span>fim</span>' : '<span>aberta</span><span>fechada</span>';
  auto = false; cancelAnimationFrame(raf); slider.value = 0;
};
tB.addEventListener('click', () => setView('braco'));
tG.addEventListener('click', () => setView('garra'));
mv.addEventListener('load', () => { if (auto) mv.play(); else setManual(slider.value / 100); });
arBtn.addEventListener('click', async () => {
  if (mv.canActivateAR) {
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
