
import React, { useState, useEffect } from 'react';
import { authService } from '../../services/auth/authService'; // Đảm bảo đường dẫn import đúng file authService của bạn
import { 
    User, Mail, Calendar, Wallet, Key, Shield, 
    Copy, CheckCircle, LogOut, Lock, Unlock, 
    ChevronRight, CreditCard, Activity 
} from 'lucide-react';
import { API_URL_IMAGE } from '../../services/api'

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showPrivateKey, setShowPrivateKey] = useState(false);
    const [copiedField, setCopiedField] = useState(null);


    // 1. Load data an toàn trong useEffect
    useEffect(() => {
        try {
            const storedUser = authService.getUser();
            if (storedUser) {
                setUser(storedUser);
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin user:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 2. Hàm tiện ích
    const handleCopy = (text, fieldName) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa cập nhật';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRoleBadge = (roleId) => {
        // Giả sử: 1=Admin, 2=Manager, 3=User
        const configs = {
            1: { label: 'Administrator', color: 'bg-purple-100 text-purple-700 border-purple-200' },
            3: { label: 'Standard User', color: 'bg-blue-100 text-blue-700 border-blue-200' },
            default: { label: `Role ID: ${roleId}`, color: 'bg-gray-100 text-gray-700 border-gray-200' }
        };
        const config = configs[roleId] || configs.default;
        
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.color} inline-flex items-center gap-1`}>
                <Shield size={10} />
                {config.label}
            </span>
        );
    };

    const handleLogout = () => {
        if (window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?')) {
            authService.logout();
            window.location.reload(); // Hoặc điều hướng về trang login
        }
    };

    // 3. Loading State
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-500 text-sm font-medium">Đang tải hồ sơ...</p>
                </div>
            </div>
        );
    }

    // 4. Empty State
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center bg-white p-8 rounded-2xl shadow-sm border max-w-md w-full">
                    <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User size={32} className="text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy thông tin</h2>
                    <p className="text-gray-500 mb-6">Vui lòng đăng nhập lại để xem trang cá nhân.</p>
                    <button 
                        onClick={handleLogout}
                        className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Đến trang đăng nhập
                    </button>
                </div>
            </div>
        );
    }

    // 5. Main UI
    return (
        <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* --- HEADER SECTION --- */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative group">
                    {/* Cover Background */}
                    <div className="h-40 bg-gradient-to-r from-[#F1F3E0] via-[#D2DCB6] to-[#A1BC98] relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    </div>
                    
                    <div className="px-8 pb-8 relative">
                        <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 gap-6">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-32 h-32 rounded-3xl bg-white p-2 shadow-lg rotate-3 transition-transform group-hover:rotate-0">
                                    <div className="w-full h-full rounded-3xl overflow-hidden">
                                        {user?.image_url ? (
                                            <img
                                                src={API_URL_IMAGE + user.image_url}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-full h-full text-gray-300 p-6" />
                                        )}
                                    </div>
                                </div>
                                <div className="absolute bottom-4 right-0 w-6 h-6 bg-green-500 border-4 border-white rounded-full" title="Online"></div>
                            </div>

                            {/* User Info */}
                            <div className="flex-1 mb-2">
                                <div className="flex flex-wrap items-center gap-3 mb-1">
                                    <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
                                    {getRoleBadge(user.role_id)}
                                </div>
                                <p className="text-gray-500 flex items-center gap-2 text-sm">
                                    <span className="font-mono text-gray-400">ID: #{user.id}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                    <span>Member since {new Date(user.created_at).getFullYear()}</span>
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                                <button 
                                    onClick={handleLogout}
                                    className="flex-1 md:flex-none items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all text-sm font-medium shadow-sm"
                                >
                                    <LogOut size={16} />
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* --- LEFT COLUMN: PERSONAL INFO --- */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                                <Activity size={16} className="text-blue-500"/>
                                Thông tin chung
                            </h3>
                            
                            <div className="space-y-6">
                                <div className="relative pl-4 border-l-2 border-gray-100">
                                    <label className="text-xs font-medium text-gray-400 block mb-1">Tên tài khoản</label>
                                    <p className="font-medium text-gray-900">{user.username}</p>
                                </div>
                                
                                <div className="relative pl-4 border-l-2 border-gray-100">
                                    <label className="text-xs font-medium text-gray-400 block mb-1">Ngày tham gia</label>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Calendar size={14} />
                                        <span className="text-sm">{formatDate(user.created_at)}</span>
                                    </div>
                                </div>

                                <div className="relative pl-4 border-l-2 border-gray-100">
                                    <label className="text-xs font-medium text-gray-400 block mb-1">Cập nhật lần cuối</label>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-sm">{formatDate(user.updated_at)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN: WALLET & SECURITY --- */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Wallet Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                    <Wallet size={16} className="text-indigo-500"/>
                                    Thông tin Ví
                                </h3>
                                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase">Active</span>
                            </div>

                            <div className="space-y-5">
                                <div className="group">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-semibold text-gray-500">ĐỊA CHỈ VÍ (PUBLIC KEY)</label>
                                        {copiedField === 'wallet' && (
                                            <span className="text-xs text-green-600 flex items-center animate-fade-in">
                                                <CheckCircle size={12} className="mr-1"/> Đã copy
                                            </span>
                                        )}
                                    </div>
                                    <div 
                                        className="flex items-center bg-gray-50 border border-gray-200 hover:border-indigo-300 rounded-xl p-3 transition-colors cursor-pointer"
                                        onClick={() => handleCopy(user.wallet_address, 'wallet')}
                                    >
                                        <div className="p-2 bg-white rounded-lg shadow-sm mr-3">
                                            <CreditCard size={20} className="text-gray-400" />
                                        </div>
                                        <code className="flex-1 font-mono text-sm text-gray-600 truncate mr-2 select-all">
                                            {user.wallet_address}
                                        </code>
                                        <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                            <Copy size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Zone - Private Key */}
                        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-100 p-6 relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Lock size={120} />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider flex items-center gap-2">
                                        <Shield size={16} className="text-red-600"/>
                                        Vùng Bảo Mật
                                    </h3>
                                </div>

                                <div className="bg-white/80 backdrop-blur-sm border border-red-100 rounded-xl p-5 shadow-sm">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-xs font-semibold text-red-600 flex items-center gap-1">
                                            <Key size={12}/> PRIVATE KEY
                                        </label>
                                        
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => setShowPrivateKey(!showPrivateKey)}
                                                className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-all shadow-sm"
                                            >
                                                {showPrivateKey ? <><Unlock size={12}/> Ẩn</> : <><Lock size={12}/> Hiện</>}
                                            </button>
                                            
                                            {showPrivateKey && (
                                                <button 
                                                    onClick={() => handleCopy(user.private_key, 'pk')}
                                                    className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 hover:bg-blue-100 transition-all shadow-sm"
                                                >
                                                    {copiedField === 'pk' ? <CheckCircle size={12}/> : <Copy size={12}/>}
                                                    {copiedField === 'pk' ? 'Đã copy' : 'Copy'}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <div className={`
                                            font-mono text-sm break-all p-4 rounded-lg border transition-all duration-300
                                            ${showPrivateKey 
                                                ? 'bg-red-50 text-red-800 border-red-200' 
                                                : 'bg-gray-100 text-gray-400 border-gray-200 select-none blur-[4px] group-hover:blur-[2px] cursor-not-allowed'}
                                        `}>
                                            {showPrivateKey ? user.private_key : '0x••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                                        </div>
                                        
                                        {!showPrivateKey && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="bg-white/90 text-gray-600 text-xs px-3 py-1 rounded-full shadow-sm border border-gray-200 font-medium flex items-center gap-1">
                                                    <Lock size={10} /> Nội dung được ẩn
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <p className="mt-3 text-xs text-red-500 italic flex items-center gap-1">
                                        <Shield size={10} />
                                        Cảnh báo: Tuyệt đối không chia sẻ Private Key cho bất kỳ ai.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;