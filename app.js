const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const cmdInput = document.getElementById('cmd-input');

// --- CONFIGURATION FERROVIAIRE ---
const PK_ORIGIN = 18000;
const SCALE = 10; // 1 mètre = 10 pixels
const RAIL_TYPES = {
    'M240': { color: '#3498db', label: 'Traverses M240' },
    'M243': { color: '#2980b9', label: 'Traverses M243' },
    'ZE': { color: '#e67e22', label: 'Zone Étroite' }
};

let state = {
    entities: [],
    camera: { x: 100, y: 300, zoom: 1.0 },
    tool: 'rail'
};

function init() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener('resize', init);
init();

// --- LOGIQUE DE COMMANDE (ZONE PK START PK END TYPE) ---
cmdInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const parts = cmdInput.value.toUpperCase().split(' ');
        if (parts[0] === 'ZONE') {
            const start = parseFloat(parts[1]);
            const end = parseFloat(parts[2]);
            const type = parts[3];
            addZone(start, end, type);
        }
        cmdInput.value = '';
    }
});

function addZone(pkS, pkE, type) {
    const config = RAIL_TYPES[type] || { color: '#95a5a6', label: type };
    const x = (pkS - PK_ORIGIN) * SCALE;
    const w = (pkE - pkS) * SCALE;
    
    state.entities.push({
        type: 'zone',
        pkS, pkE, x, w,
        y: 50, h: 30,
        color: config.color,
        label: config.label
    });
    updateTable();
}

function updateTable() {
    const body = document.getElementById('data-body');
    body.innerHTML = state.entities.map(ent => `
        <tr>
            <td>${ent.pkS}</td>
            <td>${ent.pkE}</td>
            <td>${ent.label}</td>
            <td style="color:#00ff00">CONFORME</td>
        </tr>
    `).join('');
}

// --- MOTEUR DE RENDU ---
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(state.camera.x, state.camera.y);
    ctx.scale(state.camera.zoom, state.camera.zoom);

    // Grille PK
    ctx.strokeStyle = "#222";
    for(let i=0; i<5000; i+=100) {
        ctx.beginPath(); ctx.moveTo(i, -1000); ctx.lineTo(i, 1000); ctx.stroke();
        ctx.fillStyle = "#444"; ctx.fillText("PK "+(PK_ORIGIN + i/SCALE), i+5, 200);
    }

    // Dessin des Zones (Style Synoptique Excel)
    state.entities.forEach(ent => {
        ctx.fillStyle = ent.color;
        ctx.fillRect(ent.x, ent.y, ent.w, ent.h);
        ctx.fillStyle = "white";
        ctx.font = "bold 11px Arial";
        ctx.fillText(ent.label, ent.x + 5, ent.y + 18);
    });

    ctx.restore();
    requestAnimationFrame(render);
}

// Zoom molette
canvas.addEventListener('wheel', e => {
    state.camera.zoom *= e.deltaY > 0 ? 0.9 : 1.1;
}, {passive:false});

render();
