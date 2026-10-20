import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const token = localStorage.getItem('token');

    // Basic check for token presence. 
    // For enhanced security, you could decode the JWT here to check expiration if desired.
    return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
