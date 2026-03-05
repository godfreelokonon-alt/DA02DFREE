const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const propArea = document.getElementById('val-area');
const propLen = document.getElementById('val-len');

// --- CONFIGURATION ---
let currentTool = 'line';
let points = [];
let shapes = [];
const GRID_SIZE = 20; // 20px = 1 unité

// Ajuster la taille
function init() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    render();
}

window.addEventListener('resize', init);

// --- OUTILS ---
window.setTool = (tool) => {
    currentTool = tool;
    points = []; // On vide le tampon
    console.log("Outil actif : " + tool);
};

// --- LOGIQUE DE DESSIN ---
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    // Le "Snap" : on arrondit à la grille la plus proche
    const x = Math.round((e.clientX - rect.left) / GRID_SIZE) * GRID_SIZE;
    const y = Math.round((e.clientY - rect.top) / GRID_SIZE) * GRID_SIZE;

    points.push({x, y});
    
    if (currentTool === 'line' && points.length === 2) {
        saveShape('line');
    }
});

function saveShape(type) {
    shapes.push({
        type: type,
        path: [...points],
        color: document.getElementById('colorPicker').value,
        width: document.getElementById('strokeWeight').value
    });
    points = [];
    updateCalculations();
}

// --- RENDU FLUIDE ---
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Dessiner la grille
    ctx.beginPath();
    ctx.strokeStyle = "#e5e5e5";
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
        ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
    }
    for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
        ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();

    // 2. Dessiner les formes sauvegardées
    shapes.forEach(s => {
        ctx.beginPath();
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.width;
        ctx.moveTo(s.path[0].x, s.path[0].y);
        s.path.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
    });

    // 3. Dessiner le tracé en cours
    if (points.length > 0) {
        ctx.beginPath();
        ctx.strokeStyle = "#0078d7";
        ctx.setLineDash([5, 5]); // Ligne pointillée Revit
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
        ctx.setLineDash([]);
    }

    requestAnimationFrame(render);
}

function updateCalculations() {
    // Exemple calcul longueur dernier trait
    const last = shapes[shapes.length - 1];
    if(last && last.path.length >= 2) {
        const d = Math.sqrt(Math.pow(last.path[1].x - last.path[0].x, 2) + Math.pow(last.path[1].y - last.path[0].y, 2));
        propLen.innerText = (d / GRID_SIZE).toFixed(2);
    }
}

init();
