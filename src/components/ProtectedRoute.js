import { Navigate } from 'react-router-dom';
import { isUserLogged } from '../utils/auth';

const ProtectedRoute = ({ children, roles = [] }) => {
  const user = isUserLogged();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;