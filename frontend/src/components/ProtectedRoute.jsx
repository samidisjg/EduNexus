import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import authService from '../services/auth.service';

/**
 * Protected Route Component
 * Wraps components that require authentication
 * Redirects to sign-in if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useSelector((state) => state.user);
  const isAuthenticated = authService.isAuthenticated();

  // Check if user is authenticated
  if (!isAuthenticated || !currentUser) {
    // Redirect to sign-in page if not authenticated
    return <Navigate to="/sign-in" replace />;
  }

  // Render the protected component if authenticated
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
