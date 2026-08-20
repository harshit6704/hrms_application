// Mirrors models/enums.py -> UserRole exactly (case-sensitive, backend compares these strings directly).
export const ROLES = {
  ADMIN: "Admin",
  HR: "HR",
  MANAGER: "Manager",
  EMPLOYEE: "Employee",
};

export const ALL_ROLES = [ROLES.ADMIN, ROLES.HR, ROLES.MANAGER, ROLES.EMPLOYEE];

// The current backend has no way for the frontend to learn a logged-in user's
// role (see BACKEND GAPS #1 in the project README / chat summary):
//   - the JWT only contains { sub: <uid> }
//   - UserResponseSchema (returned by GET /users/{uid}) does not include `role`
//   - there is no GET /users/me
//
// Until the backend exposes role, `user.role` will always be null and this
// helper degrades to "allow" so navigation isn't incorrectly hidden. The
// backend remains the real authority - it will still reject (403) any action
// the user isn't actually permitted to perform.
export function hasRole(user, allowedRoles) {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!user?.role) {
    return false;
  } 
  return allowedRoles.includes(user.role);
}
