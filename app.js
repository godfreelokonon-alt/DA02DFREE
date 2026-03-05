function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // On ajoute un petit padding à gauche pour les textes de PK
    const offsetX = 60; 
    ctx.save();
    ctx.translate(offsetX, 0);

    // --- DESSIN DES LIGNES DE VOIE (CONTEXTE VISUEL) ---
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 2;
    [100, 250].forEach(y => { // Ligne pour V1 et V2
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    });

    // --- GRILLE ET GRADUATIONS PK ---
    ctx.strokeStyle = "#333";
    ctx.fillStyle = "#888";
    ctx.font = "10px Arial";
    
    // On dessine une graduation tous les 100m (ajustable selon le scale)
    const step = 100; 
    for(let pk = state.pkOrigin; pk < state.pkOrigin + (canvas.width / state.scale); pk += step) {
        const x = (pk - state.pkOrigin) * state.scale;
        ctx.beginPath();
        ctx.moveTo(x, 50);
        ctx.lineTo(x, 300);
        ctx.stroke();
        ctx.fillText(`PK ${pk.toFixed(0)}`, x + 2, 45);
    }

    // --- DESSIN DES ENTITÉS ---
    state.entities.forEach(ent => {
        const config = state.ficheTypes[ent.type] || { color: '#777' };
        
        // Logique de couleur selon le statut
        let color = config.color;
        if(ent.status === 'C') color = '#27ae60';  // Conforme
        if(ent.status === 'NC') color = '#e74c3c'; // Non-Conforme
        if(ent.status === 'NR') color = '#f39c12'; // À reprendre

        const x = (ent.pks - state.pkOrigin) * state.scale;
        const w = Math.max(8, (ent.pke - ent.pks) * state.scale);
        
        // Position Y dynamique selon la Voie et le Type (pour éviter les superpositions)
        const baseY = (ent.voie === 'V1' ? 80 : 230);
        const typeOffset = Object.keys(state.ficheTypes).indexOf(ent.type) * 20;
        const y = baseY + typeOffset;

        // Ombre pour le relief
        ctx.shadowBlur = 4;
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w, 15);
        
        // Reset ombre pour le texte
        ctx.shadowBlur = 0;
        ctx.fillStyle = "white";
        ctx.fillText(`${ent.type}`, x + 2, y + 11);
    });

    ctx.restore();
}
