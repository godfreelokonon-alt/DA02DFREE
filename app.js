const data = {
    items: JSON.parse(localStorage.getItem('rail_v3')) || [],
    types: { 'M240': '#3498db', 'M243': '#2980b9', 'JIC': '#e74c3c', 'BALLAST': '#27ae60' },
    
    save() {
        localStorage.setItem('rail_v3', JSON.stringify(this.items));
        ui.render();
    },
    add(type, pks, pke, status, voie) {
        this.items.push({ id: Date.now(), type, pks, pke, status, voie });
        this.save();
    },
    delete(id) {
        this.items = this.items.filter(i => i.id !== id);
        this.save();
    },
    clear() {
        if(confirm("Effacer TOUTES les données ?")) {
            this.items = [];
            localStorage.removeItem('rail_v3');
            ui.render();
        }
    }
};

const ui = {
    render() {
        const canv = document.getElementById('canvas');
        const ctx = canv.getContext('2d');
        canv.width = canv.parentElement.clientWidth;
        canv.height = canv.parentElement.clientHeight;

        ctx.clearRect(0,0, canv.width, canv.height);
        
        // Liste de droite (avec le X pour supprimer)
        const list = document.getElementById('object-list');
        list.innerHTML = data.items.map(i => `
            <div class="card status-${i.status}">
                <span>${i.type} (${i.voie}) PK ${i.pks}</span>
                <button onclick="data.delete(${i.id})">X</button>
            </div>
        `).join('');

        // Dessin Synoptique
        ctx.save();
        ctx.translate(50, 50);
        data.items.forEach((item, index) => {
            let color = data.types[item.type] || '#95a5a6';
            if(item.status === 'C') color = '#27ae60'; //
            if(item.status === 'NC') color = '#e74c3c'; //
            if(item.status === 'NR') color = '#f39c12'; //

            const x = (item.pks - 18000) * 10;
            const w = Math.max(5, (item.pke - item.pks) * 10);
            // On décale chaque fiche vers le bas pour éviter l'empilement
            const y = (item.voie === 'V1' ? 20 : 250) + (index * 25);

            ctx.fillStyle = color;
            ctx.fillRect(x, y, w, 20);
            ctx.fillStyle = "white";
            ctx.fillText(`${item.type} ${item.voie}`, x, y - 5);
        });
        ctx.restore();
    },
    openModal() { document.getElementById('modal').style.display = 'flex'; },
    closeModal() { document.getElementById('modal').style.display = 'none'; },
    save() {
        data.add(
            document.getElementById('in-type').value.toUpperCase(),
            parseFloat(document.getElementById('in-pks').value),
            parseFloat(document.getElementById('in-pke').value),
            document.getElementById('in-status').value,
            document.getElementById('in-voie').value
        );
        this.closeModal();
    }
};

// Console Revit
document.getElementById('cmd').addEventListener('keydown', (e) => {
    if(e.key === 'Enter') {
        const p = e.target.value.split(' ');
        if(p[0].toUpperCase() === 'ZONE') data.add(p[3], parseFloat(p[1]), parseFloat(p[2]), p[4]||'', p[5]||'V1');
        e.target.value = '';
    }
});

window.onload = () => ui.render();
