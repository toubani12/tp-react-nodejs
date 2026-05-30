const BASE = 'http://localhost:5000/api/users';

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erreur serveur');
  return data;
}


export async function getUsers() {
  const res = await fetch(BASE);
  return handleResponse(res);
}


export async function getUserById(id) {
  const res = await fetch(`${BASE}/${id}`);
  return handleResponse(res);
}


export async function createUser(userData) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return handleResponse(res);
}


export async function updateUser(id, userData) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return handleResponse(res);
}


export async function deleteUser(id) {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  return handleResponse(res);
}
