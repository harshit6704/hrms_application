import { useAuth } from "../context/AuthContext.jsx";
import { hasRole } from "../utils/roles.js";

// UI-only gate. NOT security - the backend is the real authority. See utils/roles.js
// for why `user.role` is currently always null (BACKEND GAP: no endpoint exposes role).
export default function RoleGuard({ roles, children, fallback = null }) {
  const { user } = useAuth();
  return hasRole(user, roles) ? children : fallback;
}
