import { api } from "../lib/api.js";
import { endpoints } from "../lib/endpoints.js";

// payload: { empid?, lvid, start_date, end_date, reason }
// Omit empid to apply for yourself. Only Admin/HR/Manager may set empid to someone else.
export async function applyLeave(payload) {
  const res = await api.post(endpoints.leaveApplications.create, payload);
  return res.data;
}

export async function updateLeave(laid, payload) {
  // payload must match LeaveApplicationUpdateSchema: { empid?, lvid, start_date, end_date, reason }
  const res = await api.put(endpoints.leaveApplications.update(laid), payload);
  return res.data;
}

// payload: { status: "Approved" | "Rejected", remarks }
export async function approveLeave(laid, payload) {
  const res = await api.put(endpoints.leaveApplications.approval(laid), payload);
  return res.data;
}

export async function getLeaveApplications({ empid, lvid, status, from_date, to_date } = {}) {
  const params = {};
  if (empid !== undefined && empid !== null && empid !== "") params.empid = empid;
  if (lvid !== undefined && lvid !== null && lvid !== "") params.lvid = lvid;
  if (status) params.status = status;
  if (from_date) params.from_date = from_date;
  if (to_date) params.to_date = to_date;

  const res = await api.get(endpoints.leaveApplications.list, { params });
  return res.data;
}

export async function getLeaveApplicationById(laid) {
  const res = await api.get(endpoints.leaveApplications.byId(laid));
  return res.data;
}
