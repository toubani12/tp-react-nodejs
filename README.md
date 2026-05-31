# TP6 – Site Web Simple (Express.js / React.js)
## Rapport Technique et Compte Rendu

---

## 📋 Informations Générales

| Élément          | Détail                                |
|------------------|---------------------------------------|
| **Étudiant**     | TOUBANI Badr Eddine                   |
| **Professeur**   | Oumayma AGHERAI                       |
| **Filière**      | SDIA (Systèmes Distribués et Internet des Objets)  |
| **Établissement**| ENSET (École Nationale Supérieure de l'Éducation et de la Formation Technique) |
| **Module**       | Technologies Web et Web Sémantique    |
| **TP**           | TP6 – Site Web Simple                 |
| **Date**         | Mai 2026                              |

---

## 📌 Objectifs du TP

Ce travail pratique a pour objectifs :

1. **Concevoir une application web full-stack** utilisant Express.js (backend) et React.js (frontend)
2. **Implémenter les opérations CRUD** (Create, Read, Update, Delete) pour la gestion des utilisateurs
3. **Utiliser les API REST** pour la communication entre le client et le serveur
4. **Gérer l'état de l'application** avec React (useState, useEffect)
5. **Appliquer les bonnes pratiques** de développement web moderne

---

## 🏗️ Architecture du Projet

Le projet suit une architecture **client-serveur** classique :

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (React.js)                     │
│                   (Port 3000)                             │
│  ┌──────────────────────────────────────────────────┐   │
│  │  - Interface utilisateur (Components)             │   │
│  │  - Gestion de l'état (useState, useEffect)        │   │
│  │  - Appels API (fetch)                             │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         ↕ (HTTP)
           ┌─────────────────────────────────┐
           │   API REST (Express.js)         │
           │      (Port 5000)                │
           ├─────────────────────────────────┤
           │  GET    /api/users              │
           │  GET    /api/users/:id          │
           │  POST   /api/users              │
           │  PUT    /api/users/:id          │
           │  DELETE /api/users/:id          │
           └─────────────────────────────────┘
                         ↕
           ┌─────────────────────────────────┐
           │   Données (Mémoire)              │
           │   Array de users                 │
           └─────────────────────────────────┘
```

---

## 🔙 Backend - Express.js

### 📁 Structure et Configuration

**Fichier:** `backend/server.js`

#### 1️⃣ Initialisation du serveur

```javascript
const express = require('express');
const cors    = require('cors');

const app  = express();
const PORT = 5000;

app.use(cors());                  // Active CORS pour l'accès depuis le frontend
app.use(express.json());          // Parse les requêtes JSON
```

**Explication:**
- **Express** : Framework pour créer un serveur HTTP
- **CORS** (Cross-Origin Resource Sharing) : Permet au frontend (port 3000) d'accéder à l'API (port 5000)
- **express.json()** : Middleware pour parser automatiquement le corps des requêtes JSON

#### 2️⃣ Données et Initialisation

```javascript
let users = [
  { id: 1, nom: 'TOUBANI',   prenom: 'badr eddine', email: 'fadre6@gmail.com',   role: 'Admin'      },
  { id: 2, nom: 'massan',    prenom: 'Fatima',      email: 'fatima@gmail.com',   role: 'Étudiant'   },
  { id: 3, nom: 'douiri',    prenom: 'ahmed',       email: 'ahmed@enset.ma',     role: 'Professeur' },
  { id: 4, nom: 'messi',     prenom: 'leonel',      email: 'lionel@barca.ma',    role: 'Étudiant'   },
];
let nextId = 5;
```

**Explication:**
- Les données sont stockées en mémoire dans un tableau JavaScript
- Chaque utilisateur a : `id`, `nom`, `prenom`, `email`, `role`
- `nextId` suit le prochain identifiant à attribuer

#### 3️⃣ Fonctions Utilitaires

```javascript
// Trouver un utilisateur par ID
const findUser  = (id) => users.find(u => u.id === parseInt(id));

// Trouver l'index d'un utilisateur par ID
const findIndex = (id) => users.findIndex(u => u.id === parseInt(id));

// Valider les données d'un utilisateur
const validate = ({ nom, prenom, email, role }) => {
  if (!nom || !prenom || !email || !role)
    return 'Tous les champs sont obligatoires.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return 'Email invalide.';
  return null;
};
```

**Explication:**
- `findUser()` : Retourne l'utilisateur trouvé (ou `undefined`)
- `findIndex()` : Retourne l'index de l'utilisateur (-1 si non trouvé)
- `validate()` : Vérifie que tous les champs sont présents et que l'email est valide
  - Utilise une **expression régulière** pour valider le format email

---

### 🔗 Points d'Accès API (Endpoints)

#### 1. **GET /api/users** – Récupérer tous les utilisateurs

```javascript
app.get('/api/users', (req, res) => {
  res.json(users);
});
```

**Exemple de réponse (200 OK):**
```json
[
  { "id": 1, "nom": "TOUBANI", "prenom": "badr eddine", "email": "fadre6@gmail.com", "role": "Admin" },
  { "id": 2, "nom": "massan", "prenom": "Fatima", "email": "fatima@gmail.com", "role": "Étudiant" },
  ...
]
```

---

#### 2. **GET /api/users/:id** – Récupérer un utilisateur par ID

```javascript
app.get('/api/users/:id', (req, res) => {
  const user = findUser(req.params.id);
  if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
  res.json(user);
});
```

**Exemple de requête:** `GET /api/users/1`

**Réponse (200 OK):**
```json
{ "id": 1, "nom": "TOUBANI", "prenom": "badr eddine", "email": "fadre6@gmail.com", "role": "Admin" }
```

**Erreur (404 Not Found):**
```json
{ "message": "Utilisateur introuvable." }
```

---

#### 3. **POST /api/users** – Créer un nouvel utilisateur

```javascript
app.post('/api/users', (req, res) => {
  const err = validate(req.body);
  if (err) return res.status(400).json({ message: err });

  const { nom, prenom, email, role } = req.body;
  const newUser = { id: nextId++, nom, prenom, email, role };
  users.push(newUser);
  res.status(201).json(newUser);
});
```

**Processus:**
1. Valider les données reçues
2. Si validation échoue → Retourner erreur 400 (Bad Request)
3. Si succès → Créer un nouvel objet utilisateur avec un ID unique
4. Ajouter l'utilisateur au tableau
5. Retourner le nouvel utilisateur (201 Created)

**Exemple de requête:**
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean@example.com",
  "role": "Étudiant"
}
```

**Réponse (201 Created):**
```json
{
  "id": 5,
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean@example.com",
  "role": "Étudiant"
}
```

---

#### 4. **PUT /api/users/:id** – Modifier un utilisateur

```javascript
app.put('/api/users/:id', (req, res) => {
  const index = findIndex(req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Utilisateur introuvable.' });

  const err = validate(req.body);
  if (err) return res.status(400).json({ message: err });

  const { nom, prenom, email, role } = req.body;
  users[index] = { ...users[index], nom, prenom, email, role };
  res.json(users[index]);
});
```

**Processus:**
1. Trouver l'index de l'utilisateur par ID
2. Si non trouvé → Erreur 404
3. Valider les nouvelles données
4. Mettre à jour l'utilisateur (en conservant son ID)
5. Retourner l'utilisateur modifié

---

#### 5. **DELETE /api/users/:id** – Supprimer un utilisateur

```javascript
app.delete('/api/users/:id', (req, res) => {
  const index = findIndex(req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Utilisateur introuvable.' });

  const [deleted] = users.splice(index, 1);
  res.json({ message: `Utilisateur "${deleted.prenom} ${deleted.nom}" supprimé avec succès.`, deleted });
});
```

**Processus:**
1. Trouver l'index de l'utilisateur
2. Si non trouvé → Erreur 404
3. Supprimer l'utilisateur du tableau avec `splice()`
4. Retourner confirmation + données supprimées

**Réponse (200 OK):**
```json
{
  "message": "Utilisateur \"Fatima massan\" supprimé avec succès.",
  "deleted": { "id": 2, "nom": "massan", "prenom": "Fatima", ... }
}
```

---

#### 🚀 Démarrage du serveur

```javascript
app.listen(PORT, () => {
   console.log(`\n✅  Serveur Express démarré → http://localhost:${PORT}`);
  console.log('─'.repeat(45));
  console.log('  GET    /api/users');
  console.log('  GET    /api/users/:id');
  console.log('  POST   /api/users');
  console.log('  PUT    /api/users/:id');
  console.log('  DELETE /api/users/:id');
  console.log('─'.repeat(45) + '\n');
});
```

---

### 💻 Sortie Console du Backend

```
✅  Serveur Express démarré → http://localhost:5000
─────────────────────────────────────────────────
  GET    /api/users
  GET    /api/users/:id
  POST   /api/users
  PUT    /api/users/:id
  DELETE /api/users/:id
─────────────────────────────────────────────────
```

**[Placeholder: Screenshot du terminal affichant le serveur Express démarré]**

---

## 🎨 Frontend - React.js

### 📁 Structure et Configuration

Le frontend utilise **React 18** avec une architecture basée sur des composants réutilisables.

#### **Fichier:** `frontend/src/api.js` – Couche de communication API

Ce fichier gère toutes les requêtes HTTP vers le backend.

```javascript
const BASE = 'http://localhost:5000/api/users';

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur serveur');
  return data;
}
```

**Explication:**
- `BASE` : URL de base de l'API
- `handleResponse()` : Fonction utilitaire qui :
  - Parse la réponse JSON
  - Lève une exception si la réponse n'est pas OK (status >= 200 && < 300)

---

#### **Fonctions d'API:**

```javascript
// 1. Récupérer tous les utilisateurs
export async function getUsers() {
  const res = await fetch(BASE);
  return handleResponse(res);
}

// 2. Récupérer un utilisateur par ID
export async function getUserById(id) {
  const res = await fetch(`${BASE}/${id}`);
  return handleResponse(res);
}

// 3. Créer un utilisateur
export async function createUser(userData) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return handleResponse(res);
}

// 4. Modifier un utilisateur
export async function updateUser(id, userData) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return handleResponse(res);
}

// 5. Supprimer un utilisateur
export async function deleteUser(id) {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  return handleResponse(res);
}
```

**Points clés:**
- Utilisation de **fetch API** pour les requêtes HTTP
- Async/await pour une meilleure lisibilité du code asynchrone
- Gestion centralisée des erreurs avec `handleResponse()`

---

#### **Fichier:** `frontend/src/App.jsx` – Composant principal

```javascript
import { useState, useEffect } from 'react';
import './App.css';
import { getUsers, createUser, updateUser, deleteUser } from './api';

const EMPTY_FORM = { nom: '', prenom: '', email: '', role: 'Étudiant' };
const ROLES = ['Étudiant', 'Professeur', 'Admin'];
```

**Constantes:**
- `EMPTY_FORM` : Formulaire vierge pour la création
- `ROLES` : Liste des rôles disponibles

---

#### **Composant UserForm** – Formulaire de création/modification

```javascript
function UserForm({ initial, editId, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="overlay">
      <div className="modal">
        <div className="modal-header">
          <div className={`modal-icon ${editId ? 'modal-icon-edit' : 'modal-icon-create'}`}>
            {editId ? '✏️' : '➕'}
          </div>
          <div>
            <h2 className="modal-title">
              {editId ? "Modifier l'utilisateur" : 'Créer un utilisateur'}
            </h2>
            <p className="modal-subtitle">
              {editId ? `ID #${editId}` : 'Remplissez tous les champs'}
            </p>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
          <div className="form-row">
            <div className="field">
              <label className="label">Nom *</label>
              <input
                className="input"
                name="nom"
                value={form.nom}
                onChange={change}
                placeholder="Ex : LastName"
                required
              />
            </div>
            <div className="field">
              <label className="label">Prénom *</label>
              <input
                className="input"
                name="prenom"
                value={form.prenom}
                onChange={change}
                placeholder="Ex : firstName"
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Email *</label>
            <input
              className="input"
              type="email"
              name="email"
              value={form.email}
              onChange={change}
              placeholder="Ex : user@example.ma"
              required
            />
          </div>

          <div className="field">
            <label className="label">Rôle *</label>
            <select className="input" name="role" value={form.role} onChange={change}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              {editId ? '💾 Enregistrer' : '✨ Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

**Fonctionnalités:**
- **Props:** `initial` (données initiales), `editId` (ID si modification), `onSubmit`, `onCancel`
- **useState:** Gère l'état du formulaire
- **useEffect:** Met à jour le formulaire quand `initial` change
- **Changement d'input:** Fonction `change()` met à jour l'état de manière immuable
- **Affichage conditionnel:** Mode création (➕) ou modification (✏️)
- **Validation HTML:** `required` sur les champs obligatoires

---

#### **Composant DeleteConfirm** – Confirmation de suppression

```javascript
function DeleteConfirm({ user, onConfirm, onCancel }) {
  return (
    <div className="overlay">
      <div className="modal delete-modal">
        {/* Contenu : demande de confirmation */}
      </div>
    </div>
  );
}
```

**[Placeholder: Screenshot du modal de suppression]**

---

### 🎯 Fonctionnalités Principales

#### 1. **Affichage de la liste des utilisateurs**
- Récupération via `getUsers()` au chargement du composant
- Affichage dans un tableau avec colonnes : Nom, Prénom, Email, Rôle
- Actions : Modifier, Supprimer

#### 2. **Créer un utilisateur**
- Clic sur bouton "Créer"
- Ouverture d'un modal avec formulaire
- Validation côté client
- Appel à `createUser()` pour envoyer au backend
- Actualisation de la liste

#### 3. **Modifier un utilisateur**
- Clic sur "Modifier"
- Formulaire pré-rempli avec les données actuelles
- Appel à `updateUser()` après soumission
- Actualisation de la liste

#### 4. **Supprimer un utilisateur**
- Clic sur "Supprimer"
- Modal de confirmation
- Appel à `deleteUser()` après confirmation
- Actualisation de la liste

---

## 📥 Installation et Configuration

### **Étape 1 : Cloner le projet**
```bash
git clone <repository-url>
cd projet-sdia
```

### **Étape 2 : Configurer le backend**
```bash
cd backend
npm install
npm start      # Démarre sur http://localhost:5000
# ou
npm run dev    # Avec auto-reload (nodemon)
```

### **Étape 3 : Configurer le frontend**
```bash
cd ../frontend
npm install
npm start      # Démarre sur http://localhost:3000
```

### **Étape 4 : Accéder à l'application**
Ouvrir le navigateur → `http://localhost:3000`

---

## 📊 Exemples d'Utilisation

### **1. Récupérer tous les utilisateurs**

**Request:**
```bash
curl -X GET http://localhost:5000/api/users
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "nom": "TOUBANI",
    "prenom": "badr eddine",
    "email": "fadre6@gmail.com",
    "role": "Admin"
  },
  {
    "id": 2,
    "nom": "massan",
    "prenom": "Fatima",
    "email": "fatima@gmail.com",
    "role": "Étudiant"
  },
  ...
]
```

**[Placeholder: Screenshot de la page d'accueil avec la liste des utilisateurs]**

---

### **2. Créer un nouvel utilisateur**

**Request:**
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Martin",
    "prenom": "Sophie",
    "email": "sophie@example.com",
    "role": "Professeur"
  }'
```

**Response (201 Created):**
```json
{
  "id": 5,
  "nom": "Martin",
  "prenom": "Sophie",
  "email": "sophie@example.com",
  "role": "Professeur"
}
```

**[Placeholder: Screenshot du modal de création avec données saisies]**

---

### **3. Modifier un utilisateur**

**Request:**
```bash
curl -X PUT http://localhost:5000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "TOUBANI",
    "prenom": "Badr",
    "email": "badr.toubani@enset.ma",
    "role": "Admin"
  }'
```

**Response (200 OK):**
```json
{
  "id": 1,
  "nom": "TOUBANI",
  "prenom": "Badr",
  "email": "badr.toubani@enset.ma",
  "role": "Admin"
}
```

**[Placeholder: Screenshot du modal de modification]**

---

### **4. Supprimer un utilisateur**

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/users/2
```

**Response (200 OK):**
```json
{
  "message": "Utilisateur \"Fatima massan\" supprimé avec succès.",
  "deleted": {
    "id": 2,
    "nom": "massan",
    "prenom": "Fatima",
    "email": "fatima@gmail.com",
    "role": "Étudiant"
  }
}
```

**[Placeholder: Screenshot du modal de confirmation de suppression]**

---

## 🛡️ Gestion des Erreurs

### **Erreurs côté Backend:**

| Code HTTP | Cas d'Usage | Exemple |
|-----------|-----------|---------|
| **400** | Données invalides | Email mal formaté, champs vides |
| **404** | Ressource non trouvée | Utilisateur avec ID inexistant |
| **500** | Erreur serveur | Exception non gérée |

### **Erreurs côté Frontend:**

```javascript
try {
  const newUser = await createUser(formData);
  // Succès
} catch (error) {
  // Afficher le message d'erreur à l'utilisateur
  console.error('Erreur:', error.message);
}
```

---

## 📈 Flux de Données

```
┌─────────────────────────────────────────────────────────────┐
│ Utilisateur clique "Créer"                                   │
└────────────────┬────────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ Modal s'affiche avec formulaire vierge                       │
└────────────────┬────────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ Utilisateur remplit les champs (onChange → setState)         │
└────────────────┬────────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ Utilisateur clique "Créer"                                   │
└────────────────┬────────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ fetch POST /api/users avec les données                       │
└────────────────┬────────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ Backend valide et crée l'utilisateur                         │
│ Retourne 201 Created + données nouvelles                     │
└────────────────┬────────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ Frontend reçoit la réponse                                   │
│ Ferme le modal                                               │
│ Appelle getUsers() pour rafraîchir la liste                  │
└────────────────┬────────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────────────────────┐
│ Nouveau utilisateur visible dans le tableau                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Fichiers CSS

- **`App.css`** : Styles pour les modals, formulaires, tableau
  - Classes : `.modal`, `.overlay`, `.btn`, `.input`, `.table`
  - Mode sombre/clair avec variables CSS
  - Responsive design

- **`index.css`** : Styles globaux
  - Font-family
  - Couleurs de base
  - Reset CSS

---

## 📦 Dépendances

### **Backend (`backend/package.json`):**
```json
{
  "express": "^4.18.2",      // Framework web
  "cors": "^2.8.5",           // Gestion CORS
  "nodemon": "^3.0.1"         // Auto-reload en développement
}
```

### **Frontend (`frontend/package.json`):**
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-scripts": "5.0.1"
}
```

---

## 🚀 Déploiement et Tests

### **Tests Manuels:**

1. ✅ Créer un utilisateur avec données valides
2. ✅ Créer un utilisateur avec email invalide (doit être rejeté)
3. ✅ Créer un utilisateur avec champs vides (doit être rejeté)
4. ✅ Modifier un utilisateur existant
5. ✅ Supprimer un utilisateur (avec confirmation)
6. ✅ Actualiser la page (les données persistes en mémoire)

### **Limitation Actuelle:**

⚠️ Les données sont stockées en mémoire → perdues au redémarrage du serveur
✅ Pour la persistance : utiliser une base de données (MongoDB, PostgreSQL, etc.)

---

## 🎓 Concepts Clés Appliqués

### **1. API REST**
- Verbes HTTP corrects (GET, POST, PUT, DELETE)
- Codes HTTP significatifs (200, 201, 400, 404)
- Endpoint cohérents et prévisibles

### **2. React**
- Components fonctionnels
- Hooks (useState, useEffect)
- Conditional rendering
- Gestion de l'état applicatif

### **3. JavaScript Moderne**
- Async/await
- Spread operator (`...`)
- Destructuring
- Arrow functions

### **4. Sécurité de Base**
- Validation côté serveur
- Validation email avec regex
- CORS activé

---

## 📝 Conclusion

Ce projet TP6 démontre la création d'une application web full-stack complète utilisant :
- **Express.js** pour une API REST robuste et simple
- **React.js** pour une interface utilisateur moderne et réactive
- **Communication HTTP** via fetch API
- **Gestion d'état** et **composants réutilisables**

L'application est fonctionnelle et extensible. Des améliorations futures pourraient inclure :
- Intégration d'une base de données
- Authentification et autorisation
- Tests unitaires et d'intégration
- Déploiement sur cloud (Heroku, AWS, Azure)

---

## 📚 Ressources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MDN - Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [REST API Best Practices](https://restfulapi.net/)

---

**Auteur:** TOUBANI Badr Eddine
**Date:** Mai 2026
**Module:** Technologies Web et Web Sémantique (ENSET - SDIA)

---

## 📸 Annexe - Captures d'écran (Placeholders)

### **Figure 1: Page d'accueil - Liste des utilisateurs**
```
<img width="1512" height="982" alt="Screenshot 2026-05-31 at 00 59 13" src="https://github.com/user-attachments/assets/dcfeb6b9-a2ba-4e11-859f-39e398cf486d" />

```

### **Figure 2: Modal de création d'utilisateur**
```
<img width="1512" height="982" alt="Screenshot 2026-05-31 at 01 00 15" src="https://github.com/user-attachments/assets/0a2bc3bc-7e0d-4d7b-a0ce-d44c6ce75d5b" />

```

### **Figure 3: Modal de modification d'utilisateur**
```
<img width="1512" height="982" alt="Screenshot 2026-05-31 at 01 00 23" src="https://github.com/user-attachments/assets/e314db71-6ba3-41e1-9797-17e3e4db6b1d" />

```

### **Figure 4: Modal de confirmation de suppression**
```
<img width="1512" height="982" alt="Screenshot 2026-05-31 at 01 00 33" src="https://github.com/user-attachments/assets/61113523-2a36-4dd2-bfa4-9b6310972074" />

```

### **Figure 5: Console serveur (Démarrage)**
```
<img width="773" height="250" alt="Screenshot 2026-05-31 at 00 56 58" src="https://github.com/user-attachments/assets/45675ba7-00c0-477c-accb-f3b42dccfebc" />

```


