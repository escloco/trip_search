// Generates island-themed Cycladic SVG scenes into ./images
// (External photo hosts are blocked by the sandbox network allowlist, so we
//  produce real image assets locally; swap with .jpg photos later if desired.)
const fs = require('fs');
fs.mkdirSync('images', {recursive:true});

// palettes per "time of day" variant
const variants = [
  {name:'morning', skyTop:'#aee1f9', skyBot:'#fdf6e3', sun:'#ffe08a', sea1:'#5bc0de', sea2:'#2a9fd6', sunX:150, sunY:120},
  {name:'midday',  skyTop:'#4a90d9', skyBot:'#cdeefe', sun:'#fff6cf', sea1:'#1b9ad6', sea2:'#0b6fa4', sunX:640, sunY:110},
  {name:'sunset',  skyTop:'#3a2a6b', skyBot:'#ff9e6d', sun:'#ffd36e', sea1:'#7a5aa6', sea2:'#2c2151', sunX:400, sunY:150},
];

// island accents: a small scene-defining extra element
function accent(island){
  switch(island){
    case 'Naxos': // Portara marble gate
      return `<g><rect x="560" y="300" width="120" height="210" fill="#efe7d6" stroke="#cabfa6" stroke-width="4"/>
              <rect x="560" y="300" width="120" height="34" fill="#e2d7be"/>
              <rect x="585" y="334" width="14" height="176" fill="#d8ccae"/>
              <rect x="641" y="334" width="14" height="176" fill="#d8ccae"/></g>`;
    case 'Milos': // white cliff arch (Kleftiko)
      return `<path d="M540 520 Q560 360 660 360 Q760 360 780 520 L780 540 L720 540 Q700 460 660 460 Q620 460 600 540 L540 540 Z" fill="#f4f1ea"/>`;
    case 'Koufonisia': // little boat on a turquoise lagoon
      return `<g><path d="M250 470 q60 26 120 0 l-16 34 q-44 14 -88 0 z" fill="#ffffff" stroke="#1b4965" stroke-width="3"/>
              <rect x="306" y="420" width="4" height="52" fill="#1b4965"/>
              <path d="M310 424 l44 40 -44 6 z" fill="#e63946"/></g>`;
    case 'Sifnos': // hilltop chapel
      return `<g><rect x="600" y="360" width="90" height="150" fill="#ffffff" stroke="#dfe3e6" stroke-width="2"/>
              <rect x="636" y="320" width="18" height="40" fill="#ffffff"/>
              <circle cx="645" cy="312" r="12" fill="#2a6f97"/></g>`;
    default: // Paros: extra fishing boats
      return `<g><path d="M150 500 q50 20 100 0 l-14 28 q-36 12 -72 0 z" fill="#fff" stroke="#1b4965" stroke-width="3"/>
              <rect x="196" y="458" width="4" height="44" fill="#1b4965"/><path d="M200 462 l36 32 -36 6 z" fill="#2a9d8f"/></g>`;
  }
}

// a cluster of Cycladic white houses with a blue dome
function village(){
  return `<g>
    <rect x="60" y="430" width="90" height="110" rx="6" fill="#ffffff"/>
    <rect x="130" y="470" width="80" height="70" rx="6" fill="#f3f4f6"/>
    <rect x="200" y="440" width="70" height="100" rx="6" fill="#ffffff"/>
    <rect x="95" y="455" width="16" height="16" fill="#2a6f97"/>
    <rect x="160" y="492" width="14" height="14" fill="#2a6f97"/>
    <rect x="225" y="465" width="16" height="16" fill="#2a6f97"/>
    <path d="M250 440 a30 30 0 0 1 60 0 z" fill="#1d70a2"/>
    <rect x="250" y="440" width="60" height="100" fill="#ffffff"/>
    <rect x="276" y="408" width="8" height="32" fill="#ffffff"/>
    <rect x="266" y="420" width="28" height="8" fill="#ffffff"/>
    <rect x="270" y="478" width="20" height="62" fill="#2a6f97"/>
  </g>`;
}

function scene(island, v){
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 760" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${v.skyTop}"/><stop offset="1" stop-color="${v.skyBot}"/>
    </linearGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${v.sea1}"/><stop offset="1" stop-color="${v.sea2}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="760" fill="url(#sky)"/>
  <circle cx="${v.sunX}" cy="${v.sunY}" r="46" fill="${v.sun}" opacity="0.9"/>
  <path d="M0 360 Q160 300 360 340 Q560 380 800 330 L800 560 L0 560 Z" fill="#c9b79c" opacity="0.55"/>
  ${accent(island)}
  ${village()}
  <rect y="540" width="800" height="220" fill="url(#sea)"/>
  <g stroke="#ffffff" stroke-opacity="0.35" stroke-width="3" fill="none">
    <path d="M40 590 q40 -12 80 0 t80 0 t80 0 t80 0"/>
    <path d="M120 640 q40 -12 80 0 t80 0 t80 0 t80 0"/>
    <path d="M60 690 q40 -12 80 0 t80 0 t80 0 t80 0 t80 0"/>
  </g>
  <rect width="800" height="760" fill="none"/>
</svg>`;
}

const islands = ['Paros','Milos','Sifnos','Koufonisia','Naxos'];
const slug = s => s.toLowerCase();
islands.forEach(isl=>{
  variants.forEach((v,i)=>{
    fs.writeFileSync(`images/${slug(isl)}-${i+1}.svg`, scene(isl, v));
  });
});
console.log('Generated', islands.length*variants.length, 'images in ./images');
