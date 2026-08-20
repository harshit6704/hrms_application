import { api } from "../lib/api.js";
import { endpoints } from "../lib/endpoints.js";

// "Leave types" (e.g. Sick Leave, Casual Leave) - routes/leave_routes.py
export async function getAllLeaveTypes() {
  const res = await api.get(endpoints.leaveTypes.list);
  return res.data;
}

export async function getLeaveTypeById(lvid) {
  const res = await api.get(endpoints.leaveTypes.byId(lvid));
  return res.data;
}

export async function createLeaveType(payload) {
  // payload: { lvname, is_paid, description }
  const res = await api.post(endpoints.leaveTypes.create, payload);
  return res.data;
}
