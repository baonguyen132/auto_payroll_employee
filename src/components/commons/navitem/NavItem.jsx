import React from 'react'
import * as Icon from 'phosphor-react'
import { Link } from 'react-router-dom'

const NavItem = ({icon, label, to, isActive}) => {

  const IconComponent = Icon[icon]



  return (
    <Link to={to} className={`flex space-x-2 items-center p-2 cursor-pointer hover:bg-purple-100 hover:text-purple-500 rounded-lg ${isActive ? 'bg-purple-100 text-purple-500' : 'text-neutral-700'}`}>
        <IconComponent size={20} weight={`${isActive ? 'fill' : 'regular'}`}/>
        <span className='font-semibold text-sm'>{label}</span>
    </Link>
  )
}

export default NavItem