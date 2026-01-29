import React from 'react'
import PropTypes from 'prop-types';
import * as Icon from 'phosphor-react' // Thêm import phosphor-react

const Button = ({
    children, 
    onClick,
    variant = 'primary',
    size = 'medium',
    isDisabled = false,
    icon,
    type = 'button',
    fullWidth = false,
    ...props
    
}) => {

    const IconComponent = icon ? Icon[icon] : null;

    // Map kích thước nút với kích thước icon
    const iconSizeMap = {
        small: 16,
        medium: 20,
        large: 24
    };
    const iconSize = iconSizeMap[size];

    //tyle mặc định

    const baseStyles = 'font-semibold rounded-xl transition ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-75'

    //các biến thể variant
    const variantStyles = {
        primary: 'bg-purple-500 hover:bg-purple-600 text-white focus:ring-purple-400',
        secondary: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-2 border-purple-200 focus:ring-gray-400',

        gradient: 'bg-gradient-to-r from-blue-400 to-blue-600 text-white focus:ring-blue-400 hover:bg-black/85',
        danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
        success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-red-500',
        outline: 'border-2 border-blue-300 text-white hover:bg-blue-400 focus:ring-blue-500',
        text: 'text-blue-200 hover:bg-gray-500 focus:ring-blue-500',
        current: 'bg-primary-400 text-white shadow-md hover:bg-primary-600',
        answered: 'bg-primary-500 text-white hover:bg-primary-500',
        unanswered: 'bg-white-400 text-black hover:bg-primary-400',

    }

    //size
    const sizeStyles = {
        small: 'px-3 py-1.5 text-xs',
        medium: 'px-4 py-2 text-sm',
        large: 'px-5 py-2.5 text-md'
    }

    //disable style
    const disabledStyles = 'opacity-50 cursor-not-allowed'

    const widthStyles = fullWidth ? 'w-full' : 'flex-shrink-0 whitespace-nowrap'




  return (
    <button
        type={type}
        onClick={onClick}
        disabled={isDisabled}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${isDisabled ? disabledStyles : ''} ${widthStyles} flex justify-center items-center space-x-2 `}
        {...props} 
    >
        
        {IconComponent && <IconComponent size={iconSize} weight="bold" />}
        
        {children}
        
    </button>
  )
}

Button.propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func,
    variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'outline', 'text']),
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    isDisabled:PropTypes.bool,
    type: PropTypes.oneOf(['button', 'submit', 'reset']),
    icon: PropTypes.string,
    fullWidth: PropTypes.bool,
    className: PropTypes.string
}



export default Button