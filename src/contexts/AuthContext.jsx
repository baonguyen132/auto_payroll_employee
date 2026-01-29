import React, { createContext, useCallback, useState } from 'react'
import {useNavigate} from 'react-router-dom'
import {authService} from '../services/auth/authService.jsx'


const AuthContext = createContext();

const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(authService.getToken());
    const [currentUser, setUser] = useState(authService.getUser());

    const navigate = useNavigate();

    const login = useCallback(async (credentials) => {
        try {
            const data = await authService.login(credentials);
            setToken(data.token);
            setUser(data.user);            
            // navigate('/employee');
            window.location.href = "/employee";
            return true;
            
        } catch (error) {
            console.log('Đăng nhập thất bại: ', error);
            throw error;
            
        }
    }, [navigate, setToken, setUser]);

    const logout = useCallback(() => {
        authService.logout();
        setToken(null);
        setUser(null);
        navigate('/login');
    }, [navigate, setToken, setUser]);
    ///liệt kê tất cả kết quả mà provider này thực hiện
    const value = {
        token,
        currentUser,
        isLoggedIn: !!token,
        login,
        logout
    }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export {AuthContext, AuthProvider}