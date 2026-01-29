import React from 'react'
import { useAuth } from '../hook/useAuth';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({children}) => {
    const { isLoggedIn} = useAuth();
    const location = useLocation();

    if(!isLoggedIn) {
        return <Navigate to={'/login'} state={{from: location}} replace />
    }


  return children;
}

export default ProtectedRoute