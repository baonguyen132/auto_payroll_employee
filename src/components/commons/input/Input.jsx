import React from 'react'
import PropTypes from 'prop-types'

const Input = ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder = '',
    isDisabled = false,
    error = '',
    required = false,
    className = ''
}) => {
    return (
        <div className={`flex flex-col space-y-1 ${className}`}>
            {label && (
                <label className="text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={isDisabled}
                className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ${
                    error ? 'border-red-500' : 'border-gray-300'
                } ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
            />
            {error && (
                <p className="text-red-500 text-xs">{error}</p>
            )}
        </div>
    )
}

Input.propTypes = {
    label: PropTypes.string,
    type: PropTypes.oneOf(['text', 'password', 'email', 'number', 'date']),
    value: PropTypes.string,
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
    isDisabled: PropTypes.bool,
    error: PropTypes.string,
    required: PropTypes.bool,
    className: PropTypes.string
}

export default Input