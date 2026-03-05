/**
 * MiniRevit 2D / Rail Synoptic Engine
 * Architecture : Vectorielle pilotée par les données
 */

const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const cmdInput = document.getElementById('cmd-input');

// --- ÉTAT GLOBAL (Source unique de vérité) ---
let state = JSON.parse(localStorage.getItem('railData')) || {
    entities: [],     // Objets dessinés
    pkOrigin: 18000,  // Référence PK pour le ferroviaire
    scale: 10,        // Échelle de rendu
    camera: { x: 100, y: 150, zoom: 1.0 }, // Vue (Pan & Zoom)
    ficheTypes: {
        'M240': { label: 'Traverses M240', color: '#add8e6' },
        'JIC': { label: 'Joint JIC', color: '#ff0000' }
    }
};

// --- UTILITAIRES ---
const save = () => localStorage.setItem('railData', JSON.stringify(state));

// Conversion coordonnées Écran -> Monde Réel (pour le zoom/pan)
function toWorld(x, y) {
    return {
        x: (x - state.camera.x) / state.camera.zoom,
        y: (y - state.camera.y) / state.camera.zoom
    };
}

// --- MOTEUR D'IMPORTATION EXCEL / PRESSE-PAPIER ---
window.addEventListener('paste', (e) => {
    const data = (e.clipboardData || window.clipboardData).getData('text');
    const lines = data.trim().split(/\r?\n/);
    
    lines.forEach(line => {
        // Format attendu : PK_DEBUT PK_FIN TYPE STATUT VOIE (séparé par tab ou virgule)
        const p = line.split(/[\t,; ]/);
        if (p.length >= 3) {
            addEntity(p[2], parseFloat(p[0]), parseFloat(p[1]), p[3]||'C', p[4]||'V1');
        }
    });
});

// --- INTERACTIONS (ZOOM & PAN) ---
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    const m = { x: e.offsetX, y: e.offsetY };
    const wBefore = toWorld(m.x, m.y);
    state.camera.zoom *= factor;
    const wAfter = toWorld(m.x, m.y);
    state.camera.x += (wAfter.x - wBefore.x) * state.camera.zoom;
    state.camera.y += (wAfter.y - wBefore.y) * state.camera.zoom;
}, { passive: false });

// --- LOGIQUE MÉTIER ---
function addEntity(type, pks, pke, status, voie) {
    state.entities.push({ 
        id: Date.now() + Math.random(), 
        type, pks, pke, status, voie 
    });
    save();
    render();
}

// --- RENDU HAUTE PERFORMANCE (60 FPS) ---
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    
    // Application de la vue (Pan & Zoom)
    ctx.translate(state.camera.x, state.camera.y);
    ctx.scale(state.camera.zoom, state.camera.zoom);

    // 1. Grille de PK (Repères ferroviaires)
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1 / state.camera.zoom;
    for(let i = 0; i < 5000; i += 100) {
        const x = i * state.scale;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 400); ctx.stroke();
    }

    // 2. Dessin des objets (Rails / Zones)
    state.entities.forEach(ent => {
        const config = state.ficheTypes[ent.type] || { color: '#777' };
        let color = config.color;
        if(ent.status === 'C') color = '#27ae60';
        if(ent.status === 'NC') color = '#e74c3c';

        const x = (ent.pks - state.pkOrigin) * state.scale;
        const w = Math.max(5, (ent.pke - ent.pks) * state.scale);
        const y = (ent.voie === 'V1' ? 50 : 150);

        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, 20);
        
        ctx.fillStyle = "white";
        ctx.font = `${12 / state.camera.zoom}px Arial`;
        ctx.fillText(ent.type, x, y - 5);
    });

    ctx.restore();
    requestAnimationFrame(render);
}

// Initialisation
window.onload = () => {
    canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    render();
};
