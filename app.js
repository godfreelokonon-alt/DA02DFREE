const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const cmdInput = document.getElementById('cmd-input');

// --- ETAT DU SYSTEME ---
let state = {
    entities: [],
    tempPoints: [],
    camera: { x: 0, y: 0, zoom: 1.0 },
    mouseWorld: { x: 0, y: 0 },
    tool: 'line',
    isPanning: false
};

// Initialisation au démarrage
function init() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    state.camera.x = canvas.width / 2;
    state.camera.y = canvas.height / 2;
}
window.addEventListener('resize', init);
init();

// TRANSFORMATIONS (Ecran <-> Monde)
function toWorld(x, y) {
    return { x: (x - state.camera.x) / state.camera.zoom, y: (y - state.camera.y) / state.camera.zoom };
}

// GESTION DU ZOOM (Centré sur souris)
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

// INTERACTION SOURIS
canvas.addEventListener('mousedown', (e) => {
    if (e.button === 1) { state.isPanning = true; return; }
    const pos = toWorld(e.offsetX, e.offsetY);
    
    if (state.tool === 'line') {
        state.tempPoints.push(pos);
        if (state.tempPoints.length === 2) {
            state.entities.push({
                type: 'line',
                p1: state.tempPoints[0],
                p2: state.tempPoints[1],
                color: document.getElementById('colorPicker').value,
                width: document.getElementById('strokeWeight').value
            });
            state.tempPoints = [pos]; // Mode continu type AutoCAD
        }
    }
});

window.addEventListener('mousemove', (e) => {
    state.mouseWorld = toWorld(e.offsetX, e.offsetY);
    document.getElementById('stat-x').innerText = Math.round(state.mouseWorld.x);
    document.getElementById('stat-y').innerText = Math.round(state.mouseWorld.y);
    
    if (state.isPanning) {
        state.camera.x += e.movementX;
        state.camera.y += e.movementY;
    }
});

window.addEventListener('mouseup', () => state.isPanning = false);

// LIGNE DE COMMANDE (Le secret de la productivité)
cmdInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const val = cmdInput.value.trim();
        if (val.includes(',')) {
            const [x, y] = val.split(',').map(Number);
            const p = {x, y};
            state.tempPoints.push(p);
            if (state.tempPoints.length >= 2) {
                state.entities.push({ type:'line', p1:state.tempPoints[state.tempPoints.length-2], p2:p, color:'#00ff00', width:2 });
            }
        }
        cmdInput.value = '';
        document.getElementById('stat-count').innerText = state.entities.length;
    }
});

// MOTEUR DE RENDU (60 FPS)
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(state.camera.x, state.camera.y);
    ctx.scale(state.camera.zoom, state.camera.zoom);

    // AXES XYZ (Rouge=X, Vert=Y)
    ctx.lineWidth = 1/state.camera.zoom;
    ctx.strokeStyle = "rgba(255, 0, 0, 0.5)"; 
    ctx.beginPath(); ctx.moveTo(-10000, 0); ctx.lineTo(10000, 0); ctx.stroke();
    ctx.strokeStyle = "rgba(0, 255, 0, 0.5)"; 
    ctx.beginPath(); ctx.moveTo(0, -10000); ctx.lineTo(0, 10000); ctx.stroke();

    // GRILLE TECHNIQUE
    ctx.strokeStyle = "#333";
    ctx.beginPath();
    for(let i=-2000; i<=2000; i+=100) {
        ctx.moveTo(i, -2000); ctx.lineTo(i, 2000);
        ctx.moveTo(-2000, i); ctx.lineTo(2000, i);
    }
    ctx.stroke();

    // DESSIN DES ENTITÉS
    state.entities.forEach(ent => {
        ctx.strokeStyle = ent.color;
        ctx.lineWidth = ent.width / state.camera.zoom;
        ctx.beginPath();
        ctx.moveTo(ent.p1.x, ent.p1.y);
        ctx.lineTo(ent.p2.x, ent.p2.y);
        ctx.stroke();
    });

    // GHOST LINE (PRÉVISUALISATION)
    if (state.tempPoints.length > 0) {
        ctx.beginPath(); ctx.setLineDash([5, 5]); ctx.strokeStyle = "#888";
        const lp = state.tempPoints[state.tempPoints.length-1];
        ctx.moveTo(lp.x, lp.y); ctx.lineTo(state.mouseWorld.x, state.mouseWorld.y);
        ctx.stroke(); ctx.setLineDash([]);
    }

    ctx.restore();
    requestAnimationFrame(render);
}

// Branchement des outils
document.getElementById('btn-line').onclick = () => state.tool = 'line';
document.getElementById('btn-clear').onclick = () => { state.entities = []; state.tempPoints = []; };

render();
