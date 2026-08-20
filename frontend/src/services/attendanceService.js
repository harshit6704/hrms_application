import { api } from "../lib/api.js";
import { endpoints } from "../lib/endpoints.js";

// Backend derives the employee from the JWT (current_user), so we never send empid here.
export async function punchIn(latitude, longitude) {
  const res = await api.post(endpoints.attendance.punchIn, { latitude, longitude });
  return res.data;
}

export async function punchOut(latitude, longitude) {
  const res = await api.post(endpoints.attendance.punchOut, { latitude, longitude });
  return res.data;
}

// empid omitted -> backend defaults to the current user.
// Passing empid requires the current user to be Admin/HR/Manager (backend-enforced).
export async function getAttendance({ empid, from_date, to_date } = {}) {
  const params = {};
  if (empid !== undefined && empid !== null && empid !== "") params.empid = empid;
  if (from_date) params.from_date = from_date;
  if (to_date) params.to_date = to_date;

  const res = await api.get(endpoints.attendance.list, { params });
  return res.data;
}
