import { api } from "../lib/api.js";
import { endpoints } from "../lib/endpoints.js";

export async function login(email, password) {
  const res = await api.post(endpoints.users.login, { email, password });
  return res.data; // { access_token, token_type }
}

export async function getAllUsers() {
  const res = await api.get(endpoints.users.list);
  return res.data;
}

export async function getUserById(uid) {
  const res = await api.get(endpoints.users.byId(uid));
  return res.data;
}

// Backend UserCreateSchema: { email, password, name, phone, empid, role, is_active }
// NOTE (BACKEND GAP): services/user_services.py currently ignores `role` when
// creating the row, so every user is created with the model's default role
// regardless of what is sent here. Sending it anyway since the schema requires it.
export async function createUser(payload) {
  const res = await api.post(endpoints.users.create, payload);
  return res.data;
}
