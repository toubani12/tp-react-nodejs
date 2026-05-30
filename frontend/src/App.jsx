
import { useState, useEffect } from 'react';
import './App.css';
import { getUsers, createUser, updateUser, deleteUser } from './api';

const EMPTY_FORM = { nom: '', prenom: '', email: '', role: 'Étudiant' };
const ROLES      = ['Étudiant', 'Professeur', 'Admin'];

function UserForm({ initial, editId, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial);

  useEffect(() => { setForm(initial); }, [initial]);

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


        <form
          className="form"
          onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
        >
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
function DeleteConfirm({ user, onConfirm, onCancel }) {
  return (
    <div className="overlay">
      <div className="modal delete-modal">
        <div className="modal-header">
          <div className="modal-icon modal-icon-delete">🗑️</div>
          <div>
            <h2 className="modal-title">Confirmer la suppression</h2>
            <p className="modal-subtitle">Action irréversible</p>
          </div>
        </div>

        <div className="delete-warning">
          <p>
            Vous allez supprimer l'utilisateur{' '}
            <strong>{user.prenom} {user.nom}</strong> (ID #{user.id}).<br />
            Cette action ne peut pas être annulée.
          </p>
        </div>

        <div className="form-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Annuler
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            🗑️ Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
function UserRow({ user, onEdit, onDelete }) {
  const roleClass = {
    'Admin':      'role-admin',
    'Professeur': 'role-professeur',
    'Étudiant':   'role-etudiant',
  }[user.role] || 'role-etudiant';

  return (
    <tr>
      <td><span className="id-badge">#{user.id}</span></td>
      <td className="name-cell">{user.nom}</td>
      <td>{user.prenom}</td>
      <td className="email-cell">{user.email}</td>
      <td>
        <span className={`role-badge ${roleClass}`}>{user.role}</span>
      </td>
      <td>
        <div className="actions-cell">
          <button className="btn btn-edit"   onClick={() => onEdit(user)}>   ✏️ Modifier  </button>
          <button className="btn btn-delete" onClick={() => onDelete(user)}>  🗑️ Supprimer </button>
        </div>
      </td>
    </tr>
  );
}
export default function App() {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [success,    setSuccess]    = useState('');
  const [error,      setError]      = useState('');

  const [showForm,   setShowForm]   = useState(false);
  const [editUser,   setEditUser]   = useState(null);
  const [delUser,    setDelUser]    = useState(null);



  useEffect(() => {
    loadUsers();
  }, []);


  useEffect(() => {
    if (success || error) {
      const t = setTimeout(() => { setSuccess(''); setError(''); }, 3500);
      return () => clearTimeout(t);
    }
  }, [success, error]);






  async function loadUsers() {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (e) {
      setError('❌ Impossible de contacter le serveur. Vérifiez que Express tourne sur le port 5000.');
    } finally {
      setLoading(false);
    }
  }


  async function handleFormSubmit(formData) {
    try {
      if (editUser) {

        const updated = await updateUser(editUser.id, formData);
        setUsers(prev => prev.map(u => u.id === editUser.id ? updated : u));
        setSuccess(`✅ Utilisateur "${updated.prenom} ${updated.nom}" modifié avec succès !`);
      } else {

        const created = await createUser(formData);
        setUsers(prev => [...prev, created]);
        setSuccess(`✅ Utilisateur "${created.prenom} ${created.nom}" créé avec succès !`);
      }
      closeForm();
    } catch (e) {
      setError(`❌ ${e.message}`);
    }
  }


  async function handleDelete() {
    try {
      await deleteUser(delUser.id);
      setUsers(prev => prev.filter(u => u.id !== delUser.id));
      setSuccess(`🗑️ Utilisateur "${delUser.prenom} ${delUser.nom}" supprimé.`);
    } catch (e) {
      setError(`❌ ${e.message}`);
    } finally {
      setDelUser(null);
    }
  }


  function openEdit(user) {
    setEditUser(user);
    setShowForm(true);
  }


  function closeForm() {
    setShowForm(false);
    setEditUser(null);
  }


  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (
      u.nom.toLowerCase().includes(q)    ||
      u.prenom.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)  ||
      u.role.toLowerCase().includes(q)
    );
  });


  const stats = {
    total:      users.length,
    admin:      users.filter(u => u.role === 'Admin').length,
    professeur: users.filter(u => u.role === 'Professeur').length,
    etudiant:   users.filter(u => u.role === 'Étudiant').length,
  };

  return (
    <div className="app">


      <header className="header">
        <div className="header-brand">
          <div className="header-icon">👥</div>
          <div>
            <div className="header-title">Gestion des Utilisateurs</div>
            
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { setEditUser(null); setShowForm(true); }}
        >
          + Nouvel utilisateur
        </button>
      </header>


      <main className="main">


        {success && <div className="notif notif-success">{success}</div>}
        {error   && <div className="notif notif-error">{error}</div>}


        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-icon stat-icon-total">👥</div>
            <div><div className="stat-value">{stats.total}</div><div className="stat-label">Total</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-etud">🎓</div>
            <div><div className="stat-value">{stats.etudiant}</div><div className="stat-label">Étudiants</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-prof">📚</div>
            <div><div className="stat-value">{stats.professeur}</div><div className="stat-label">Professeurs</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-admin">⚡</div>
            <div><div className="stat-value">{stats.admin}</div><div className="stat-label">Admins</div></div>
          </div>
        </div>


        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input
                className="search-input"
                type="text"
                placeholder="Rechercher…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {search && (
              <span className="count-badge">
                {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <span className="count-badge">
            {users.length} utilisateur{users.length !== 1 ? 's' : ''}
          </span>
        </div>


        <div className="table-card">
          <div className="table-responsive">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Chargement des utilisateurs…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <h3>{search ? 'Aucun résultat' : 'Aucun utilisateur'}</h3>
                <p>{search ? `Aucun utilisateur ne correspond à "${search}"` : 'Cliquez sur "+ Nouvel utilisateur" pour commencer.'}</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(user => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onEdit={openEdit}
                      onDelete={setDelUser}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>


      {showForm && (
        <UserForm
          initial={editUser
            ? { nom: editUser.nom, prenom: editUser.prenom, email: editUser.email, role: editUser.role }
            : EMPTY_FORM
          }
          editId={editUser?.id}
          onSubmit={handleFormSubmit}
          onCancel={closeForm}
        />
      )}


      {delUser && (
        <DeleteConfirm
          user={delUser}
          onConfirm={handleDelete}
          onCancel={() => setDelUser(null)}
        />
      )}
    </div>
  );
}
