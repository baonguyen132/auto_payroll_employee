import React from 'react'
import NavItem from '../components/NavItem/NavItem'
import { useLocation } from 'react-router-dom'

const list = [
    { icon: 'House', label: 'Trang chủ', to: '/' },
    { icon: 'UserFocus', label: 'Thông tin cá nhân', to: '/employee/profile'},
    { icon: 'CurrencyCircleDollar', label: 'Quản lý số dư', to: '/employee/balance' },
    { icon: 'Storefront', label: 'Menu đặt món', to: '/employee/menu' },
]

const Sidebar = () => {

    const location = useLocation()

  return (
    <div className='w-64 h-screen border-r p-4'>
        <div className='text-md text-neutral-700 font-bold mb-8'><span className='font-alternates text-2xl bg-gradient-to-r from-purple-600 to-purple-300 bg-clip-text text-transparent'>BLOCKCHAIN</span> employee</div>
        <div className='space-y-2'>
            {list.map((item, index) => (
                <NavItem key={index} icon={item.icon} label={item.label} to={item.to} isActive={location.pathname === item.to} />
            ))}
        </div>
    </div>
  )
}

export default Sidebar