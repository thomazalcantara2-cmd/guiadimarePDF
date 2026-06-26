// tweaks.jsx — Tweaks panel for the welcome guide.
// Lets the user swap palette, fonts, brand name, and density at runtime.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#5BBFE0", "#4FA85F", "#F4C430", "#EE6C4D"],
  "displayFont": "Fraunces",
  "headFont": "Plus Jakarta Sans",
  "bodyFont": "Inter",
  "brandName": "Di Maré Residence",
  "showEmojis": true
}/*EDITMODE-END*/;

const PALETTES = [
  ["#5BBFE0", "#4FA85F", "#F4C430", "#EE6C4D"], // Tropical Vibrante
  ["#C97B5C", "#7A8C5C", "#E8C97B", "#3D2E26"], // Boutique Terracota
  ["#2E89A8", "#1F8A5B", "#F4EBD8", "#1F2D3D"], // Praiano Sereno
  ["#7B5CB6", "#EE6C4D", "#F4C430", "#2E7D3F"], // Carnaval
  ["#1F2D3D", "#E8C97B", "#C97B5C", "#FBF6EC"], // Editorial
];

const FONT_PAIRS = [
  { display: "Fraunces", head: "Plus Jakarta Sans", body: "Inter", label: "Editorial" },
  { display: "Playfair Display", head: "Montserrat", body: "Open Sans", label: "Clássico" },
  { display: "DM Serif Display", head: "Work Sans", body: "Inter", label: "Suave" },
  { display: "Caveat", head: "Poppins", body: "Nunito", label: "Aconchegante" },
];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply palette to CSS vars
  React.useEffect(() => {
    const root = document.documentElement;
    if (Array.isArray(t.palette) && t.palette.length >= 4) {
      root.style.setProperty('--c-sky', t.palette[0]);
      root.style.setProperty('--c-leaf', t.palette[1]);
      root.style.setProperty('--c-sun', t.palette[2]);
      root.style.setProperty('--c-coral', t.palette[3]);
      // Derive deeper variants
      root.style.setProperty('--c-sky-deep', shade(t.palette[0], -0.25));
      root.style.setProperty('--c-leaf-deep', shade(t.palette[1], -0.25));
    }
  }, [t.palette]);

  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--f-display', `"${t.displayFont}", Georgia, serif`);
    root.style.setProperty('--f-head', `"${t.headFont}", system-ui, sans-serif`);
    root.style.setProperty('--f-body', `"${t.bodyFont}", system-ui, sans-serif`);
    // Inject Google Font import
    const id = 'tweak-font-import';
    let link = document.getElementById(id);
    if (!link) {
      link = document.createElement('link');
      link.id = id; link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    const fams = [t.displayFont, t.headFont, t.bodyFont]
      .filter(Boolean)
      .map(f => `family=${encodeURIComponent(f)}:wght@400;500;600;700`)
      .join('&');
    link.href = `https://fonts.googleapis.com/css2?${fams}&display=swap`;
  }, [t.displayFont, t.headFont, t.bodyFont]);

  // Brand name → all .hdr-logo span[data-edit]
  React.useEffect(() => {
    document.querySelectorAll('.hdr-logo [data-edit]').forEach(el => {
      el.innerText = (t.brandName || '').toUpperCase();
    });
  }, [t.brandName]);

  // Show/hide emojis
  React.useEffect(() => {
    document.querySelectorAll('.amenity-icon, .guide-emoji, .kitchen-emoji, .trans-emoji, .region-pin span, .region-tag').forEach(el => {
      const txt = el.innerText || '';
      // Heuristic — just hide elements containing emoji-only content
      if (/^\p{Extended_Pictographic}+$/u.test(txt.trim())) {
        el.style.display = t.showEmojis ? '' : 'none';
      }
    });
  }, [t.showEmojis]);

  return (
    <TweaksPanel title="Tweaks · Guia">
      <TweakSection label="Paleta" />
      <TweakColor
        label="Tropical"
        value={t.palette}
        options={PALETTES}
        onChange={(v) => setTweak('palette', v)}
      />

      <TweakSection label="Tipografia" />
      <TweakSelect
        label="Combinação"
        value={`${t.displayFont}|${t.headFont}|${t.bodyFont}`}
        options={FONT_PAIRS.map(p => ({
          value: `${p.display}|${p.head}|${p.body}`,
          label: p.label,
        }))}
        onChange={(v) => {
          const [d, h, b] = v.split('|');
          setTweak({ displayFont: d, headFont: h, bodyFont: b });
        }}
      />

      <TweakSection label="Conteúdo" />
      <TweakText
        label="Marca"
        value={t.brandName}
        onChange={(v) => setTweak('brandName', v)}
      />

      <TweakSection label="Estilo" />
      <TweakToggle
        label="Mostrar emojis"
        value={t.showEmojis}
        onChange={(v) => setTweak('showEmojis', v)}
      />
    </TweaksPanel>
  );
}

function shade(hex, p) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c+c).join('') : h, 16);
  let r = (n >> 16) & 0xff, g = (n >> 8) & 0xff, b = n & 0xff;
  if (p < 0) { r = Math.round(r * (1 + p)); g = Math.round(g * (1 + p)); b = Math.round(b * (1 + p)); }
  else { r = Math.round(r + (255 - r) * p); g = Math.round(g + (255 - g) * p); b = Math.round(b + (255 - b) * p); }
  return '#' + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join('');
}

const root = document.createElement('div');
document.body.appendChild(root);
ReactDOM.createRoot(root).render(<App />);
