import { api } from "../lib/api.js";
import { endpoints } from "../lib/endpoints.js";


export async function getLeaveBalance({
  empid,
  lvid
} = {}) {

  const params = {};

  if (
    empid !== undefined &&
    empid !== null &&
    empid !== ""
  ) {
    params.empid = empid;
  }

  if (
    lvid !== undefined &&
    lvid !== null &&
    lvid !== ""
  ) {
    params.lvid = lvid;
  }

  const res = await api.get(
    endpoints.leaveBalance.list,
    {
      params
    }
  );

  return res.data;
}


// payload:
// {
//   lvid,
//   empid,
//   opening_bal
// }
export async function addLeaveBalance(payload) {

  const res = await api.post(
    endpoints.leaveBalance.add,
    payload
  );

  return res.data;
}


// payload:
// {
//   opening_bal
// }
export async function updateLeaveBalance(
  lbid,
  payload
) {

  const res = await api.put(
    endpoints.leaveBalance.update(lbid),
    payload
  );

  return res.data;
}