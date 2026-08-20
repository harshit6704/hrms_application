import { api } from "../lib/api.js";
import { endpoints } from "../lib/endpoints.js";

export async function getAllEmployees() {
  const res = await api.get(endpoints.employees.list);
  return res.data; // EmployeeResponseSchema[] -> empnumber, name, email, phone, dob, doj, department, shifthours
}

export async function getEmployeeById(empid) {
  const res = await api.get(endpoints.employees.byId(empid));
  return res.data;
}

// Backend EmployeeCreateSchema: name, email, phone, dob, doj, department, salary,
// is_active, empnumber, shifthours
export async function createEmployee(payload) {
  const res = await api.post(endpoints.employees.create, payload);
  return res.data;
}

export async function updateEmployee(empid, payload) {
  const res = await api.put(
    endpoints.employees.update(empid),
    payload
  );

  return res.data;
}

