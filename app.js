const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

// On ajuste la taille du canvas à sa zone d'affichage
canvas.width = canvas.parentElement.clientWidth;
canvas.height = canvas.parentElement.clientHeight;

let currentTool = 'poly';
let points = []; // Liste des points pour la polyligne en cours
let allShapes = []; // Stockage final

function setTool(tool) {
    currentTool = tool;
    points = []; // On réinitialise si on change d'outil
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'poly') {
        points.push({x, y});
        draw();
        if (points.length > 1) {
            updateCalculations();
        }
    }
});

// Pour fermer la forme (clic droit)
canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (points.length > 2) {
        // On ferme la forme en reliant le dernier point au premier
        allShapes.push({type: 'polygon', path: [...points], color: 'rgba(0, 120, 215, 0.3)'});
        points = [];
        draw();
    }
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dessiner les formes terminées
    allShapes.forEach(shape => {
        ctx.beginPath();
        ctx.fillStyle = shape.color;
        ctx.moveTo(shape.path[0].x, shape.path[0].y);
        shape.path.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    });

    // Dessiner la polyligne en cours
    if (points.length > 0) {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#0078d7';
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
    }
}

function updateCalculations() {
    // Calcul de surface simplifié (Algorithme du lacet / Shoelace)
    let area = 0;
    for (let i = 0; i < points.length; i++) {
        let j = (i + 1) % points.length;
        area += points[i].x * points[j].y;
        area -= points[j].x * points[i].y;
    }
    area = Math.abs(area) / 2;
    
    // Conversion simulée (100px = 1m -> donc /10000 pour m²)
    const realArea = (area / 10000).toFixed(2);
    document.getElementById('val-area').innerText = realArea;
}
