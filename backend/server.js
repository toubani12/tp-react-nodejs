const express = require('express');
const cors    = require('cors');

const app  = express();
const PORT = 5000;


app.use(cors());
app.use(express.json());


let users = [
  { id: 1, nom: 'TOUBANI',   prenom: 'badr eddine', email: 'fadre6@gmail.com',   role: 'Admin'      },
  { id: 2, nom: 'massan',  prenom: 'Fatima',  email: 'fatima@gmail.com',    role: 'Étudiant'   },
  { id: 3, nom: 'douiri', prenom: 'ahmed',   email: 'ahmed@enset.ma',    role: 'Professeur' },
  { id: 4, nom: 'messi',  prenom: 'leonel',    email: 'lionel@barca.ma',      role: 'Étudiant'   },
];
let nextId = 5;


const findUser  = (id) => users.find(u => u.id === parseInt(id));
const findIndex = (id) => users.findIndex(u => u.id === parseInt(id));

const validate = ({ nom, prenom, email, role }) => {
  if (!nom || !prenom || !email || !role) return 'Tous les champs sont obligatoires.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email invalide.';
  return null;
};






app.get('/api/users', (req, res) => {
  res.json(users);
});


app.get('/api/users/:id', (req, res) => {
  const user = findUser(req.params.id);
  if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
  res.json(user);
});


app.post('/api/users', (req, res) => {
  const err = validate(req.body);
  if (err) return res.status(400).json({ message: err });

  const { nom, prenom, email, role } = req.body;
  const newUser = { id: nextId++, nom, prenom, email, role };
  users.push(newUser);
  res.status(201).json(newUser);
});


app.put('/api/users/:id', (req, res) => {
  const index = findIndex(req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Utilisateur introuvable.' });

  const err = validate(req.body);
  if (err) return res.status(400).json({ message: err });

  const { nom, prenom, email, role } = req.body;
  users[index] = { ...users[index], nom, prenom, email, role };
  res.json(users[index]);
});


app.delete('/api/users/:id', (req, res) => {
  const index = findIndex(req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Utilisateur introuvable.' });

  const [deleted] = users.splice(index, 1);
  res.json({ message: `Utilisateur "${deleted.prenom} ${deleted.nom}" supprimé avec succès.`, deleted });
});


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
