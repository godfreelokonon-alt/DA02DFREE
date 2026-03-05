const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

let state = {
    entities: [],
    // Ta légende personnalisable
    ficheTypes: {
        'M240': { label: 'Traverses M240', color: '#3498db' },
        'M243': { label: 'Traverses M243', color: '#2980b9' },
        'JIC': { label: 'Joint JIC', color: '#e74c3c', isPoint: true },
        'BALLAST': { label: 'Pose Ballast', color: '#2ecc71' }
    },
    pkOrigin: 18000,
    scale: 10
};

// --- SYNCHRONISATION DES PARAMÈTRES ---
function sync() {
    state.pkOrigin = parseFloat(document.getElementById('pk-start').value);
    state.scale = parseFloat(document.getElementById('scale-val').value);
    render();
}

// --- GESTION DES MODALS ---
function openModal(mode) {
    const select = document.getElementById('input-type');
    select.innerHTML = Object.entries(state.ficheTypes)
        .map(([id, data]) => `<option value="${id}">${data.label}</option>`).join('');
    document.getElementById('zone-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('zone-modal').style.display = 'none';
}

// --- AJOUT ET SUPPRESSION ---
function saveZone() {
    const type = document.getElementById('input-type').value;
    const pks = parseFloat(document.getElementById('input-pks').value);
    const pke = parseFloat(document.getElementById('input-pke').value) || pks;
    const status = document.getElementById('input-status').value;
    const voie = document.getElementById('input-voie').value;

    const x = (pks - state.pkOrigin) * state.scale;
    const w = (pke - pks) * state.scale;

    state.entities.push({
        id: Date.now(),
        type, pks, pke, x, w, status, voie,
        y: (voie === 'V1' ? 60 : 100) + (Object.keys(state.ficheTypes).indexOf(type) * 20)
    });

    closeModal();
    updateReceptionList();
    render();
}

function deleteEntity(id) {
    state.entities = state.entities.filter(e => e.id !== id);
    updateReceptionList();
    render();
}

// --- MISE À JOUR DU TABLEAU DE DROITE (CORBEILLE) ---
function updateReceptionList() {
    const list = document.getElementById('reception-list');
    list.innerHTML = state.entities.map(ent => `
        <div class="reception-card status-${ent.status}">
            <div class="info">
                <strong>${ent.type} (${ent.voie})</strong><br>
                PK ${ent.pks} -> ${ent.pke}
            </div>
            <button onclick="deleteEntity(${ent.id})" class="btn-del">✕</button>
        </div>
    `).join('');
}

// --- DESSIN DU SYNOPTIQUE ---
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(50, 200); // Décalage caméra

    // Lignes de Voie (V1 et V2)
    [60, 100, 140, 180].forEach(y => {
        ctx.strokeStyle = "#333";
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(5000, y); ctx.stroke();
    });

    // Dessin des entités (Zones et Points)
    state.entities.forEach(ent => {
        const config = state.ficheTypes[ent.type];
        
        // Couleur selon statut
        let color = config.color;
        if(ent.status === 'C') color = '#27ae60'; // Vert conforme
        if(ent.status === 'NC') color = '#e74c3c'; // Rouge
        if(ent.status === 'NR') color = '#f39c12'; // Orange

        ctx.fillStyle = color;
        
        if (ent.pks === ent.pke) { // Point ponctuel (JIC)
            ctx.fillRect(ent.x - 2, ent.y - 10, 4, 20);
        } else { // Zone
            ctx.fillRect(ent.x, ent.y, ent.w, 15);
        }
        
        ctx.fillStyle = "white";
        ctx.font = "9px Arial";
        ctx.fillText(ent.type, ent.x, ent.y - 5);
    });

    ctx.restore();
}

window.onload = () => {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    render();
};
