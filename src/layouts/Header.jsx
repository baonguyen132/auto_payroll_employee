import React from 'react'
import * as Icon from 'phosphor-react'
import { useAuth } from '../hook/useAuth'
import { useState } from 'react'
import UploadAvatarDialog from '../components/UploadAvatarDialog.jsx'
import { API_URL_IMAGE } from '../services/api.jsx'

const Header = () => {

    const { currentUser, logout } = useAuth()
    const [showDialog, setShowDialog] = useState(false);

    let [avatarUrl, setAvatarUrl] = useState(currentUser?.image_url || null);
    const handleLogout = async () => {
        if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
            await logout()
        }
    }

    const getCurrentDateTime = () => {
        const now = new Date()
        return now.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <>
            <header className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800">Hệ thống quản lý</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Thông tin user */}
                        <div className="flex items-center space-x-3">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-700">
                                    {currentUser?.username}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Nhân viên
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full flex items-center justify-center shadow-md" onClick={() => setShowDialog(true)} style={{ cursor: 'pointer' }}>
                                {
                                    avatarUrl ? (
                                        <img
                                            src={API_URL_IMAGE + avatarUrl}
                                            alt="Avatar"
                                            className="w-10 h-10 rounded-full object-cover shadow-md"
                                        />
                                    ) : (

                                        <span className="text-white text-sm font-bold">
                                            {currentUser?.username?.charAt(0).toUpperCase()}
                                        </span>
                                    )
                                }
                            </div>
                        </div>

                        {/* Nút đăng xuất */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200"
                            title="Đăng xuất"
                        >
                            <Icon.SignOut size={18} />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </div>

                {/* Thời gian truy cập */}
                <div className="mt-2">
                    <span className="text-xs text-gray-500">
                        <Icon.Clock size={14} className="inline mr-1" />
                        Truy cập gần nhất: {getCurrentDateTime()}
                    </span>
                </div>
            </header>

            <UploadAvatarDialog isOpen={showDialog} onClose={() => setShowDialog(false)} userCode={currentUser?.id} handleChangeAvatar={(url) => { setAvatarUrl(url) }} />
        </>
    )
}

export default Header