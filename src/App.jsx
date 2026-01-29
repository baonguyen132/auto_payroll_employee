import React from 'react'
// SỬA DÒNG NÀY:
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom' 
import EmployeeLayout from './layouts/EmployeeLayout'
import ProfilePage from './pages/profile/ProfilePage'
// import AccessLogManagement from './pages/AccessLogManagement/AccessLogManagement'
// import ETHHistoryManagement from './pages/ETHHistoryManagement/ETHHistoryManagement'
import {AuthProvider} from './contexts/AuthContext'
import LoginPage from './pages/auth/LoginPage'
import ProtectedRoute from './components/ProtectedRoute'
// import EmployeeManagementPage from './pages/home/EmployeeManagementPage'
import { EmployeeProvider } from './contexts/EmployeeContext'
import OrderPage from './pages/order/OrderPage'
import BalanceManagerment from './pages/balance/BalanceManagerment'
import { ProductProvider } from './contexts/ProductContext'

const App = () => {
  return (
    <EmployeeProvider>
      <ProductProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* THÊM DÒNG NÀY: */}
              <Route path="/" element={<Navigate to="/employee" replace />} /> 
              
              <Route path='/login' element={<LoginPage />} />
              <Route path="/employee" element={<ProtectedRoute><EmployeeLayout /></ProtectedRoute>}>
                <Route path='profile' element={<ProfilePage/>} />
                <Route path="balance" element={<BalanceManagerment/>} />
                <Route path="menu" element={<OrderPage />} />
              </Route>
              
              <Route path="*" element={<div>404 - Page Not Found</div>} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ProductProvider>
    </EmployeeProvider>
  )
}

export default App