const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

let state = JSON.parse(localStorage.getItem('railData')) || {
    entities: [],
    pkOrigin: 18000,
    scale: 10,
    ficheTypes: {
        'M240': { label: 'Traverses M240', color: '#add8e6' },
        'JIC': { label: 'Joint JIC', color: '#ff0000' }
    }
};

function saveToLocal() { localStorage.setItem('railData', JSON.stringify(state)); }

function sync() {
    state.pkOrigin = parseFloat(document.getElementById('pk-start').value);
    state.scale = parseFloat(document.getElementById('scale-val').value);
    saveToLocal();
    render();
}

// Commande Console
document.getElementById('cmd-input').addEventListener('keydown', (e) => {
    if(e.key === 'Enter') {
        const p = e.target.value.toUpperCase().split(' ');
        if(p[0] === 'ZONE') {
            addEntity(p[3], parseFloat(p[1]), parseFloat(p[2]), p[4]||'', p[5]||'V1');
        }
        e.target.value = '';
    }
});

function addEntity(type, pks, pke, status, voie) {
    state.entities.push({ id: Date.now(), type, pks, pke, status, voie });
    saveToLocal();
    updateUI();
    render();
}

function updateUI() {
    const list = document.getElementById('reception-list');
    list.innerHTML = state.entities.map(ent => `
        <div class="item status-${ent.status}">
            <div><strong>${ent.type}</strong> (${ent.voie})<br>PK ${ent.pks}-${ent.pke}</div>
            <button onclick="deleteEnt(${ent.id})">✕</button>
        </div>
    `).join('');

    const leg = document.getElementById('legend-list');
    leg.innerHTML = Object.entries(state.ficheTypes).map(([k, v]) => `
        <div style="margin-bottom:5px;"><span style="display:inline-block;width:12px;height:12px;background:${v.color}"></span> ${v.label}</div>
    `).join('');
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(60, 100);

    // Grille de fond
    ctx.strokeStyle = "#222";
    for(let i=0; i<5000; i+= (state.scale * 5)) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 400); ctx.stroke();
    }

    // Dessin des objets
    state.entities.forEach(ent => {
        const config = state.ficheTypes[ent.type] || { color: '#777' };
        let color = config.color;
        if(ent.status === 'C') color = '#27ae60'; // Vert
        if(ent.status === 'NC') color = '#e74c3c'; // Rouge
        if(ent.status === 'NR') color = '#f39c12'; // Orange

        const x = (ent.pks - state.pkOrigin) * state.scale;
        const w = Math.max(5, (ent.pke - ent.pks) * state.scale);
        const y = (ent.voie === 'V1' ? 50 : 150) + (Object.keys(state.ficheTypes).indexOf(ent.type) * 20);

        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, 15);
        ctx.fillStyle = "white";
        ctx.font = "10px sans-serif";
        ctx.fillText(`${ent.type} (${ent.status})`, x + 2, y + 11);
    });
    ctx.restore();
}

function deleteEnt(id) {
    state.entities = state.entities.filter(e => e.id !== id);
    saveToLocal();
    updateUI();
    render();
}

function clearAll() { if(confirm("Supprimer tout le projet ?")) { state.entities = []; saveToLocal(); updateUI(); render(); } }
function openModal() { document.getElementById('form-modal').style.display = 'flex'; }
function closeModal() { document.getElementById('form-modal').style.display = 'none'; }
function saveFromModal() {
    addEntity(
        document.getElementById('input-type').value,
        parseFloat(document.getElementById('input-pks').value),
        parseFloat(document.getElementById('input-pke').value),
        document.getElementById('input-status').value,
        document.getElementById('input-voie').value
    );
    closeModal();
}

window.onload = () => {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    // Pré-remplir les types dans le modal
    const s = document.getElementById('input-type');
    s.innerHTML = Object.keys(state.ficheTypes).map(t => `<option value="${t}">${t}</option>`).join('');
    updateUI();
    render();
};
