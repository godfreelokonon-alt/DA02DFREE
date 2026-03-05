const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

// --- ÉTAT DU SYSTÈME ---
let state = {
    currentTool: 'line',
    shapes: [],
    points: [],
    camera: { x: 0, y: 0, zoom: 1 },
    isPanning: false,
    color: "#0078d7",
    width: 2
};

// --- INITIALISATION ---
function init() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener('resize', init);
init();

// --- TRICHE AUTOCAD : CONNEXION DES BOUTONS ---
document.getElementById('btn-line').onclick = () => state.currentTool = 'line';
document.getElementById('btn-rect').onclick = () => state.currentTool = 'rect';
document.getElementById('btn-text').onclick = () => state.currentTool = 'text';
document.getElementById('btn-clear').onclick = () => { state.shapes = []; state.points = []; };

// --- GESTION SOURIS (COORDONNÉES MONDE) ---
function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left - state.camera.x) / state.camera.zoom,
        y: (e.clientY - rect.top - state.camera.y) / state.camera.zoom
    };
}

canvas.addEventListener('mousedown', (e) => {
    if (e.button === 1) { state.isPanning = true; return; } // Clic molette = Pan
    
    const pos = getMousePos(e);
    state.points.push(pos);

    if (state.currentTool === 'line' && state.points.length === 2) {
        state.shapes.push({ type: 'line', p1: state.points[0], p2: state.points[1], color: state.color, width: state.width });
        state.points = []; // Reset pour la prochaine ligne
    }
});

// --- TRICHE REVIT : ZOOM MOLETTE ---
canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    state.camera.zoom *= delta;
}, { passive: false });

// --- RENDU FLUIDE (60 FPS) ---
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(state.camera.x, state.camera.y);
    ctx.scale(state.camera.zoom, state.camera.zoom);

    // Dessiner Grille
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 0.5 / state.camera.zoom;
    for(let i=-2000; i<2000; i+=50) {
        ctx.beginPath(); ctx.moveTo(i, -2000); ctx.lineTo(i, 2000); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-2000, i); ctx.lineTo(2000, i); ctx.stroke();
    }

    // Dessiner Formes
    state.shapes.forEach(s => {
        ctx.beginPath();
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.width / state.camera.zoom;
        if(s.type === 'line') {
            ctx.moveTo(s.p1.x, s.p1.y);
            ctx.lineTo(s.p2.x, s.p2.y);
        }
        ctx.stroke();
    });

    // Dessiner élastique (pendant qu'on trace)
    if (state.points.length === 1) {
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(state.points[0].x, state.points[0].y);
        // On récupère la position actuelle de la souris "monde"
        // (Note: nécessite de suivre mousemove pour être parfait)
        ctx.stroke();
        ctx.setLineDash([]);
    }

    ctx.restore();
    requestAnimationFrame(render);
}
render();
