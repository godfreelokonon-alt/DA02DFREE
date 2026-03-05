const app = {
    settings: { origin: 18000, scale: 10, offset: 60 },
    data: {
        entities: [],
        types: { 'M240': '#add8e6', 'M243': '#3498db', 'JIC': '#ff0000', 'BALLAST': '#2ea043' },
        
        init() {
            const saved = localStorage.getItem('rail_engine_data');
            if(saved) this.entities = JSON.parse(saved);
            app.ui.refresh();
        },
        save() { localStorage.setItem('rail_engine_data', JSON.stringify(this.entities)); },
        
        addZone(type, pks, pke, status, voie) {
            this.entities.push({ id: Date.now(), type, pks, pke, status, voie });
            this.save();
            app.ui.refresh();
        },
        delete(id) {
            this.entities = this.entities.filter(e => e.id !== id);
            this.save();
            app.ui.refresh();
        },
        addFicheType() {
            const name = document.getElementById('new-type-name').value.toUpperCase();
            const color = document.getElementById('new-type-color').value;
            if(name) { this.types[name] = color; app.ui.refresh(); }
        },
        clearAll() { if(confirm("Supprimer tout le projet ?")) { this.entities = []; this.save(); app.ui.refresh(); } }
    },
    ui: {
        toggleModal() { 
            const m = document.getElementById('form-modal');
            m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
            const sel = document.getElementById('m-type');
            sel.innerHTML = Object.keys(app.data.types).map(t => `<option value="${t}">${t}</option>`).join('');
        },
        saveModal() {
            app.data.addZone(
                document.getElementById('m-type').value,
                parseFloat(document.getElementById('m-pks').value),
                parseFloat(document.getElementById('m-pke').value),
                document.getElementById('m-status').value,
                document.getElementById('m-voie').value
            );
            this.toggleModal();
        },
        refresh() {
            this.draw();
            this.renderLists();
        },
        renderLists() {
            const feed = document.getElementById('reception-feed');
            feed.innerHTML = app.data.entities.map(e => `
                <div class="reception-card status-${e.status}">
                    <div><strong>${e.type}</strong> (${e.voie})<br>PK ${e.pks}-${e.pke}</div>
                    <button onclick="app.data.delete(${e.id})">✕</button>
                </div>
            `).reverse().join('');

            const leg = document.getElementById('fiche-legend');
            leg.innerHTML = Object.entries(app.data.types).map(([k, v]) => `
                <div style="padding:5px; border-bottom:1px solid #333">
                    <span style="display:inline-block; width:15px; height:15px; background:${v}; margin-right:10px"></span>${k}
                </div>
            `).join('');
        },
        draw() {
            const canvas = document.getElementById('mainCanvas');
            const ctx = canvas.getContext('2d');
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
            
            ctx.clearRect(0,0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(app.settings.offset, 100);

            // Grille PK
            ctx.strokeStyle = "#30363d";
            for(let i=0; i<10000; i += (app.settings.scale * 10)) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 600); ctx.stroke();
                if(i % (app.settings.scale * 50) === 0) {
                    ctx.fillStyle = "#8b949e";
                    ctx.fillText(app.settings.origin + (i/app.settings.scale), i+2, -10);
                }
            }

            // Dessin des zones par ligne dédiée (V1 en haut, V2 en bas)
            const typeKeys = Object.keys(app.data.types);
            app.data.entities.forEach(ent => {
                let color = app.data.types[ent.type] || '#777';
                if(ent.status === 'C') color = '#2ea043'; //
                if(ent.status === 'NC') color = '#f85149'; //
                if(ent.status === 'NR') color = '#d29922'; //

                const x = (ent.pks - app.settings.origin) * app.settings.scale;
                const w = Math.max(5, (ent.pke - ent.pks) * app.settings.scale);
                // Calcul de la ligne Y pour éviter les chevauchements
                const typeIndex = typeKeys.indexOf(ent.type);
                const y = (ent.voie === 'V1' ? 20 : 300) + (typeIndex * 25);

                ctx.fillStyle = color;
                ctx.fillRect(x, y, w, 20);
                ctx.fillStyle = "white";
                ctx.font = "bold 10px Arial";
                ctx.fillText(`${ent.type} (${ent.voie})`, x + 5, y + 14);
            });
            ctx.restore();
        }
    },
    updateSettings() {
        this.settings.origin = parseFloat(document.getElementById('cfg-origin').value);
        this.settings.scale = parseFloat(document.getElementById('cfg-scale').value);
        this.ui.refresh();
    }
};

// Pilotage par console
document.getElementById('cmd-input').addEventListener('keydown', (e) => {
    if(e.key === 'Enter') {
        const p = e.target.value.toUpperCase().split(' ');
        if(p[0] === 'ZONE') app.data.addZone(p[3], parseFloat(p[1]), parseFloat(p[2]), p[4]||'', p[5]||'V1');
        e.target.value = '';
    }
});

window.onload = () => app.data.init();
