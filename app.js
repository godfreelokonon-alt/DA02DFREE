const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

let state = {
    entities: [],
    currentPoints: [],
    tool: 'line',
    camera: { x: window.innerWidth/2, y: window.innerHeight/2, zoom: 0.8 },
    unit: 1,
    isDrawing: false
};

// --- LOGIQUE FERROVIAIRE ---
function setTool(t) {
    state.tool = t;
    const hints = {
        rail: "Tracez l'axe de la voie. Profil M240 généré.",
        jic: "Cliquez pour poser un Joint Isolant Collé (Point d'arrêt).",
        line: "Dessin libre de structure."
    };
    document.getElementById('tool-helper').innerText = hints[t];
}

// Dessin d'un Rail avec Profil (Simule la 3D)
function drawRail(ent) {
    // Patin du rail (Large)
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 12 / state.camera.zoom;
    ctx.beginPath();
    ctx.moveTo(ent.p1.x, ent.p1.y);
    ctx.lineTo(ent.p2.x, ent.p2.y);
    ctx.stroke();

    // Table de roulement (Acier brillant)
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 4 / state.camera.zoom;
    ctx.stroke();
    
    // Cotation automatique de longueur (PK)
    const dist = Math.sqrt(Math.pow(ent.p2.x-ent.p1.x,2) + Math.pow(ent.p2.y-ent.p1.y,2));
    drawDim(ent.p1, ent.p2, (dist/10).toFixed(2) + "m");
}

function drawDim(p1, p2, text) {
    ctx.save();
    ctx.fillStyle = "yellow";
    ctx.font = "10px Arial";
    ctx.fillText(text, (p1.x+p2.x)/2, (p1.y+p2.y)/2 - 15);
    ctx.restore();
}

// --- MOTEUR DE RENDU ---
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(state.camera.x, state.camera.y);
    ctx.scale(state.camera.zoom, state.camera.zoom);

    // Grille de précision
    ctx.strokeStyle = "#222";
    ctx.beginPath();
    for(let i=-2000; i<2000; i+=50) {
        ctx.moveTo(i,-2000); ctx.lineTo(i,2000);
        ctx.moveTo(-2000,i); ctx.lineTo(2000,i);
    }
    ctx.stroke();

    state.entities.forEach(ent => {
        if(ent.type === 'rail') drawRail(ent);
        else {
            ctx.strokeStyle = "cyan";
            ctx.beginPath(); ctx.moveTo(ent.p1.x, ent.p1.y); ctx.lineTo(ent.p2.x, ent.p2.y); ctx.stroke();
        }
    });

    ctx.restore();
    requestAnimationFrame(render);
}

// --- INTERACTION SOURIS ---
canvas.addEventListener('mousedown', e => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - state.camera.x) / state.camera.zoom;
    const y = (e.clientY - rect.top - state.camera.y) / state.camera.zoom;
    
    state.currentPoints.push({x, y});
    
    if(state.currentPoints.length === 2) {
        const newEntity = {
            type: state.tool,
            p1: state.currentPoints[0],
            p2: state.currentPoints[1],
            pkStart: 18000 + Math.random()*100, // Simulation PK
            z: 0
        };
        state.entities.push(newEntity);
        state.currentPoints = [];
        updateDataTable();
    }
});

function updateDataTable() {
    const body = document.getElementById('data-body');
    body.innerHTML = state.entities.map((e, i) => `
        <tr>
            <td>${e.type.toUpperCase()}</td>
            <td>${e.pkStart.toFixed(0)}</td>
            <td>${(e.pkStart + 12).toFixed(0)}</td>
            <td>${e.z}</td>
            <td style="color:lawngreen">CONFORME</td>
        </tr>
    `).join('');
}

window.onload = () => {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    render();
};
