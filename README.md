# 🏗️ MiniRevit 2D (Concept)

**MiniRevit 2D** est une application web de DAO (Dessin Assisté par Ordinateur) ultra-légère. Elle reprend l'ergonomie structurée de Revit (Ruban + Propriétés + Arborescence) pour se concentrer sur l'efficacité pure en 2D : tracer, mesurer, et documenter sans la lourdeur du BIM 3D.

---

## 🎯 Objectifs du Projet
L'idée est de combler le vide entre le croquis à la main et le logiciel CAO complexe.
* **Rapidité :** Interface épurée avec peu de commandes mais essentielles.
* **Intelligence :** Calculs automatiques de surfaces et de longueurs en temps réel.
* **Personnalisation :** Création d'une bibliothèque d'objets (blocs) propre à l'utilisateur.

## 🛠️ Fonctionnalités Clés
### 1. Outils de Dessin & Annotation
- [ ] **Lignes & Polylignes :** Tracés libres ou contraints (mode Ortho).
- [ ] **Géométries simples :** Rectangle, Cercle.
- [ ] **Gestion du Texte :** Insertion, édition et suppression d'annotations.
- [ ] **Style :** Modification dynamique des couleurs et épaisseurs de traits.

### 2. Moteur de Calcul
- [ ] Calcul automatique de la longueur d'un segment sélectionné ($L$).
- [ ] Calcul de l'aire ($A$) pour les formes fermées (Polylignes).

### 3. Bibliothèque (Library)
- [ ] Création de "Composants" personnalisés.
- [ ] Système de drag-and-drop pour insérer des éléments réutilisables.
- [ ] Sauvegarde locale ou Cloud des bibliothèques.

## 🎨 Interface Utilisateur (UI)
L'interface est divisée en 4 zones majeures :
1.  **Le Ruban (Haut) :** Outils de dessin, calcul et export.
2.  **Panneau Propriétés (Gauche) :** Paramètres de l'objet sélectionné (Couleur, Coordonnées, Dimensions).
3.  **Panneau Bibliothèque (Droite) :** Liste des composants créés et calques.
4.  **Le Canvas (Centre) :** Espace de dessin avec grille de repère magnétique.

## 💻 Stack Technique Suggestion
- **Langage :** JavaScript (ES6+)
- **Moteur Graphique :** `Canvas API` (via Konva.js ou Fabric.js)
- **Framework UI :** React ou Vue.js (pour la réactivité des panneaux)
- **Stockage :** LocalStorage ou Firebase

---

## 🚀 Comment contribuer ?
1. Clonez le dépôt : `git clone https://github.com/votre-compte/minirevit-2d.git`
2. Installez les dépendances : `npm install`
3. Lancez le projet : `npm run dev`
