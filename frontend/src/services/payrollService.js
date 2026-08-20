import { api } from "../lib/api.js";
import { endpoints } from "../lib/endpoints.js";

// payload: { empid: number[], month, year, select_all }
export async function generatePayroll(payload) {
  const res = await api.post(endpoints.payroll.generate, payload);
  return res.data;
}

export async function getPayroll({ empid, month, year } = {}) {
  const params = {};
  if (empid !== undefined && empid !== null && empid !== "") params.empid = empid;
  if (month !== undefined && month !== null && month !== "") params.month = month;
  if (year !== undefined && year !== null && year !== "") params.year = year;

  const res = await api.get(endpoints.payroll.list, { params });
  return res.data;
}
