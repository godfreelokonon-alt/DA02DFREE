const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

let state = {
    pkOrigin: 18000,
    scale: 10,
    entities: [],
    camera: { x: 50, y: 300, zoom: 0.8 },
    // Légende initiale (tu peux en supprimer/ajouter)
    ficheTypes: {
        'M240': { color: '#3498db', label: 'Traverses M240' },
        'ZE': { color: '#e67e22', label: 'Zone Étroite' }
    }
};

// --- CONFIGURATION INITIALE ---
function updateProjectSettings() {
    state.pkOrigin = parseFloat(document.getElementById('pk-start-cfg').value);
    state.scale = parseFloat(document.getElementById('pk-scale-cfg').value);
    render();
}

// --- GESTION DE LA LÉGENDE (CORBEILLE & AJOUT) ---
function renderLegend() {
    const list = document.getElementById('legend-list');
    list.innerHTML = Object.entries(state.ficheTypes).map(([id, data]) => `
        <div class="fiche-item">
            <span style="border-left: 10px solid ${data.color}; padding-left: 8px;">${data.label}</span>
            <button class="btn-del" onclick="removeFicheType('${id}')">✕</button>
        </div>
    `).join('');
}

function addNewFicheType() {
    const name = document.getElementById('new-fiche-name').value;
    const color = document.getElementById('new-fiche-color').value;
    if(!name) return;
    const id = name.toUpperCase().replace(/\s/g, '_');
    state.ficheTypes[id] = { color, label: name };
    document.getElementById('new-fiche-name').value = '';
    renderLegend();
}

function removeFicheType(id) {
    delete state.ficheTypes[id];
    renderLegend();
}

// --- TRAVAIL SUR LES ZONES (SYNOPTIQUE) ---
function addZone(pkS, pkE, typeKey, status = '') {
    const config = state.ficheTypes[typeKey] || { color: '#7f8c8d', label: typeKey };
    const x = (pkS - state.pkOrigin) * state.scale;
    const w = (pkE - pkS) * state.scale;
    
    state.entities.push({
        id: Date.now(),
        pkS, pkE, x, w,
        y: (Object.keys(state.ficheTypes).indexOf(typeKey) * 40) + 50,
        h: 25,
        typeKey,
        label: config.label,
        status: status, // C, NC, NR
        date: ''
    });
    render();
}

// --- RENDU GRAPHIQUE ---
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(state.camera.x, state.camera.y);
    ctx.scale(state.camera.zoom, state.camera.zoom);

    // Grille PK
    ctx.strokeStyle = "#222";
    for(let i=0; i<10000; i+= (state.scale * 10)) {
        ctx.beginPath(); ctx.moveTo(i, -500); ctx.lineTo(i, 500); ctx.stroke();
        ctx.fillStyle = "#555";
        ctx.fillText("PK " + (state.pkOrigin + i/state.scale), i + 5, 250);
    }

    // Dessin des Zones
    state.entities.forEach(ent => {
        // Logique de couleur selon Statut (C=Vert, NC=Rouge, NR=Orange)
        let color = state.ficheTypes[ent.typeKey]?.color || '#7f8c8d';
        if(ent.status === 'C') color = '#27ae60';
        if(ent.status === 'NC') color = '#e74c3c';
        if(ent.status === 'NR') color = '#f39c12';

        ctx.fillStyle = color;
        ctx.fillRect(ent.x, ent.y, ent.w, ent.h);
        ctx.fillStyle = "white";
        ctx.font = "bold 11px Arial";
        ctx.fillText(`${ent.label} [${ent.status}]`, ent.x + 5, ent.y + 17);
    });

    ctx.restore();
}

// --- COMMANDES CONSOLE ---
document.getElementById('cmd-input').addEventListener('keydown', (e) => {
    if(e.key === 'Enter') {
        const p = e.target.value.toUpperCase().split(' ');
        if(p[0] === 'ZONE') addZone(parseFloat(p[1]), parseFloat(p[2]), p[3], p[4]||'');
        e.target.value = '';
    }
});

function clearAll() { if(confirm("Vider tout le projet ?")) { state.entities = []; render(); } }

// Init
window.onload = () => {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    renderLegend();
    render();
};
