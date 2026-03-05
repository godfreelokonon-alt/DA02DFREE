const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

// --- CONFIGURATION MOTEUR ---
let state = {
    shapes: [],
    points: [],
    currentTool: 'line',
    camera: { x: 0, y: 0, zoom: 1 },
    mouseWorld: { x: 0, y: 0 },
    isPanning: false,
    cmdBuffer: "", // Barre de commande invisible
    gridSize: 50
};

function init() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener('resize', init);
init();

// --- LOGIQUE DE COORDONNÉES ---
function toWorld(x, y) {
    return { x: (x - state.camera.x) / state.camera.zoom, y: (y - state.camera.y) / state.camera.zoom };
}

// --- ÉCOUTEURS D'ÉVÉNEMENTS ---
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    state.mouseWorld = toWorld(e.clientX - rect.left, e.clientY - rect.top);
    
    if (state.isPanning) {
        state.camera.x += e.movementX;
        state.camera.y += e.movementY;
    }
});

canvas.addEventListener('mousedown', (e) => {
    if (e.button === 1) { state.isPanning = true; return; }
    const pos = {...state.mouseWorld};
    state.points.push(pos);

    if (state.currentTool === 'line' && state.points.length === 2) {
        state.shapes.push({ type: 'line', p1: state.points[0], p2: state.points[1], color: document.getElementById('colorPicker').value });
        state.points = [pos]; // Continue la chaîne comme dans AutoCAD
    }
});

window.addEventListener('mouseup', () => state.isPanning = false);

// --- ZOOM INSTANTANÉ ---
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const ratio = e.deltaY > 0 ? 0.9 : 1.1;
    state.camera.zoom *= ratio;
}, { passive: false });

// --- LIGNE DE COMMANDE (SAISIE DIRECTE) ---
window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const coords = state.cmdBuffer.split(',');
        if (coords.length === 2) {
            const p = { x: parseFloat(coords[0]), y: parseFloat(coords[1]) };
            state.points.push(p);
            if (state.points.length >= 2) state.shapes.push({type:'line', p1:state.points[state.points.length-2], p2:p, color:'#000'});
        }
        state.cmdBuffer = "";
    } else if (e.key === 'Escape') {
        state.points = [];
        state.cmdBuffer = "";
    } else if (/^[0-9.,-]$/.test(e.key)) {
        state.cmdBuffer += e.key;
    }
});

// --- BOUCLE DE RENDU (SANS LATENCE) ---
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(state.camera.x, state.camera.y);
    ctx.scale(state.camera.zoom, state.camera.zoom);

    // 1. REPERES GLOBAUX (Axes X=Rouge, Y=Vert)
    ctx.lineWidth = 2 / state.camera.zoom;
    ctx.strokeStyle = "rgba(255,0,0,0.5)"; 
    ctx.beginPath(); ctx.moveTo(-1000,0); ctx.lineTo(1000,0); ctx.stroke(); // X
    ctx.strokeStyle = "rgba(0,255,0,0.5)"; 
    ctx.beginPath(); ctx.moveTo(0,-1000); ctx.lineTo(0,1000); ctx.stroke(); // Y

    // 2. GRILLE TECHNIQUE
    ctx.strokeStyle = "#eee";
    ctx.lineWidth = 1 / state.camera.zoom;
    ctx.beginPath();
    for(let i=-2000; i<=2000; i+=state.gridSize) {
        ctx.moveTo(i, -2000); ctx.lineTo(i, 2000);
        ctx.moveTo(-2000, i); ctx.lineTo(2000, i);
    }
    ctx.stroke();

    // 3. DESSIN DES OBJETS
    state.shapes.forEach(s => {
        ctx.beginPath();
        ctx.strokeStyle = s.color;
        ctx.moveTo(s.p1.x, s.p1.y);
        ctx.lineTo(s.p2.x, s.p2.y);
        ctx.stroke();
    });

    // 4. GHOST LINE (L'effet AutoCAD)
    if (state.points.length > 0) {
        ctx.beginPath();
        ctx.strokeStyle = "#aaa";
        ctx.setLineDash([5, 5]);
        const lastP = state.points[state.points.length - 1];
        ctx.moveTo(lastP.x, lastP.y);
        ctx.lineTo(state.mouseWorld.x, state.mouseWorld.y);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    ctx.restore();

    // 5. HUD (Barre de commande en bas à gauche)
    ctx.fillStyle = "#333";
    ctx.fillRect(10, canvas.height - 40, 250, 30);
    ctx.fillStyle = "#fff";
    ctx.font = "14px monospace";
    ctx.fillText("COMMAND: " + state.cmdBuffer, 20, canvas.height - 20);
    
    requestAnimationFrame(render);
}
render();
