import { Navigate } from 'react-router-dom';
import { isUserLogged } from '../utils/auth';

const ProtectedRoute = ({ children, roles = [] }) => {
  const user = isUserLogged();
  
  if (!user) {
    // Not logged in - redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (roles.length && !roles.includes(user.role)) {
    // Role not authorized - redirect to home page
    return <Navigate to="/" replace />;
  }

  // Authorized - render children
  return children;
};

export default ProtectedRoute;