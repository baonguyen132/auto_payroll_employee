import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    Wallet, RefreshCcw, Copy, CheckCircle, 
    ArrowUpRight, History, CreditCard, 
    Activity, AlertCircle, X, Lock, FileText, TrendingDown,
    Calendar, Filter, XCircle // Import thêm icon
} from 'lucide-react';
import { employeeService } from '../../services/employee/employeeService'; 
import { authService } from '../../services/auth/authService'; 

const BalanceManagement = () => {
    // --- STATE ---
    const [user, setUser] = useState(null);
    const [balanceData, setBalanceData] = useState({ balance: 0, address: '' });
    const [logsData, setLogsData] = useState({ logs: [], bookBalance: 0, logCount: 0 });
    
    // State cho bộ lọc ngày
    const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    // Modal State
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawForm, setWithdrawForm] = useState({
        amount: '',
        privateKey: '' 
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [withdrawResult, setWithdrawResult] = useState(null);

    // --- INITIALIZE ---
    useEffect(() => {
        const currentUser = authService.getUser(); 
        if (currentUser) setUser(currentUser);
    }, []);

    // --- FETCH DATA ---
    const fetchData = useCallback(async (showLoading = true) => {
        if (!user) return;
        
        if (showLoading) setIsLoading(true);
        setError(null);
        try {
            const balRes = await employeeService.getBalance();
            setBalanceData({
                balance: Number(balRes.balance),
                address: balRes.address
            });

            const logsRes = await employeeService.getTransactionLogs(user.id);
            setLogsData({
                logs: logsRes.logs || [],
                bookBalance: logsRes.bookBalance,
                logCount: logsRes.logCount
            });

        } catch (err) {
            console.error("Fetch data error:", err);
            setError(err.message || "Không thể tải dữ liệu ví.");
        } finally {
            if (showLoading) setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) fetchData();
    }, [fetchData, user]);

    // --- FILTER LOGIC (MỚI) ---
    // Sử dụng useMemo để tối ưu hiệu năng, chỉ tính toán lại khi logs hoặc filter thay đổi
    const filteredLogs = useMemo(() => {
        if (!logsData.logs || logsData.logs.length === 0) return [];

        return logsData.logs.filter(log => {
            // Timestamp từ API là seconds, convert sang Date object
            const logDate = new Date(log.timestamp * 1000);
            logDate.setHours(0, 0, 0, 0); // Reset giờ để so sánh ngày chính xác

            let isValid = true;

            if (dateFilter.start) {
                const startDate = new Date(dateFilter.start);
                startDate.setHours(0, 0, 0, 0);
                if (logDate < startDate) isValid = false;
            }

            if (dateFilter.end) {
                const endDate = new Date(dateFilter.end);
                endDate.setHours(0, 0, 0, 0);
                if (logDate > endDate) isValid = false;
            }

            return isValid;
        });
    }, [logsData.logs, dateFilter]);

    // --- HANDLERS ---
    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchData(false);
    };

    const handleCopyAddress = () => {
        if (!balanceData.address) return;
        navigator.clipboard.writeText(balanceData.address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSetMaxAmount = () => {
        setWithdrawForm(prev => ({ ...prev, amount: balanceData.balance }));
    };

    const handleWithdrawSubmit = async (e) => {
        e.preventDefault();
        setWithdrawResult(null);
        setIsSubmitting(true);

        const amountNum = parseFloat(withdrawForm.amount);

        if (amountNum <= 0) {
            setWithdrawResult({ error: 'Số lượng rút không hợp lệ.' });
            setIsSubmitting(false);
            return;
        }
        if (amountNum > balanceData.balance) {
            setWithdrawResult({ error: 'Số dư không đủ.' });
            setIsSubmitting(false);
            return;
        }

        try {
            const result = await employeeService.withdrawETH({
                userCode: user.id,
                privateKey: withdrawForm.privateKey,
                amount: amountNum
            });

            setWithdrawResult({ 
                success: true, 
                message: result.message || 'Giao dịch thành công!',
                txHash: result.transferTx,
                fiatValue: result.fiatValue
            });
            
            setWithdrawForm({ amount: '', privateKey: '' });
            fetchData(false); 

        } catch (err) {
            setWithdrawResult({ error: err.message || 'Giao dịch thất bại.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // --- RENDER ---
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    <p className="text-gray-500 text-sm font-medium">Đang đồng bộ dữ liệu ví...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 font-sans">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Wallet className="text-indigo-600" />
                            Ví Tiền Mã Hóa
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Quản lý tài sản ETH và lịch sử giao dịch</p>
                    </div>
                    
                    <button 
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className={`
                            flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 
                            text-gray-700 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm
                            ${isRefreshing ? 'opacity-70 cursor-not-allowed' : ''}
                        `}
                    >
                        <RefreshCcw size={16} className={isRefreshing ? "animate-spin text-indigo-600" : ""} />
                        <span>{isRefreshing ? 'Đang cập nhật...' : 'Làm mới'}</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT COLUMN: WALLET CARD */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="relative overflow-hidden rounded-3xl bg-[#0f172a] text-white shadow-xl shadow-indigo-200 min-h-[260px] group transition-all hover:shadow-2xl">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-20 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500 opacity-10 blur-[60px] rounded-full -translate-x-1/3 translate-y-1/3"></div>
                            
                            <div className="relative p-8 flex flex-col justify-between h-full z-10">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/10">
                                            <CreditCard size={20} className="text-indigo-300" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-indigo-200 uppercase font-bold tracking-widest">Employee Wallet</p>
                                            <p className="text-xs text-white/60">Ethereum Network</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-green-500/20 border border-green-500/30 px-3 py-1 rounded-full text-green-400 text-xs font-bold uppercase tracking-wide animate-pulse">
                                        <Activity size={12} /> Active
                                    </div>
                                </div>

                                <div className="mt-8 mb-6">
                                    <div className="flex items-end gap-3">
                                        <h2 className="text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
                                            {balanceData.balance}
                                        </h2>
                                        <span className="text-2xl font-medium text-indigo-400 mb-2">ETH</span>
                                    </div>
                                    <p className="text-indigo-300/60 text-sm pl-1">
                                        ≈ {(balanceData.balance * 20000).toLocaleString()} VND (Tỉ giá tham khảo)
                                    </p>
                                </div>

                                <div 
                                    onClick={handleCopyAddress}
                                    className="bg-black/30 backdrop-blur-md rounded-xl p-1 pr-4 border border-white/10 flex items-center justify-between cursor-pointer hover:bg-black/40 hover:border-indigo-500/30 transition-all group/addr"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-2.5 rounded-lg shadow-lg">
                                            <Wallet size={16} className="text-white" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-white/40 uppercase font-bold">Wallet Address</span>
                                            <code className="text-sm font-mono text-indigo-100">{balanceData.address}</code>
                                        </div>
                                    </div>
                                    <div className="text-white/40 group-hover/addr:text-indigo-400 transition-colors">
                                        {copied ? <CheckCircle size={18} className="text-green-400"/> : <Copy size={18}/>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3 text-red-700 animate-fade-in">
                                <AlertCircle size={20} className="mt-0.5 shrink-0" />
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm">Lỗi kết nối</h4>
                                    <p className="text-sm opacity-90">{error}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: WITHDRAW ACTION */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 h-full flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
                            <div className="relative z-10">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <div className="p-1.5 bg-red-100 rounded-md text-red-600">
                                        <ArrowUpRight size={18} />
                                    </div>
                                    Rút Tài Sản
                                </h3>
                                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                                    Thực hiện lệnh rút ETH từ ví nội bộ. Hệ thống sẽ xử lý giao dịch ngay lập tức.
                                </p>

                                <div className="space-y-3 mt-auto">
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Book Balance</p>
                                        <p className="font-mono font-medium text-gray-800">
                                            {logsData.bookBalance} ETH
                                        </p>
                                    </div>

                                    <button 
                                        onClick={() => setIsWithdrawModalOpen(true)}
                                        className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl active:scale-95"
                                    >
                                        <ArrowUpRight size={20} />
                                        Tạo Lệnh Rút
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- TRANSACTION LOGS SECTION --- */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header Logs & Filter Bar */}
                    <div className="p-5 border-b border-gray-100 bg-gray-50/30">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <History size={20}/>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">Lịch Sử Giao Dịch</h3>
                                    <p className="text-xs text-gray-500">
                                        Hiển thị {filteredLogs.length} / {logsData.logCount} kết quả
                                    </p>
                                </div>
                            </div>

                            {/* --- FILTER BAR (MỚI) --- */}
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm hover:border-indigo-300 transition-colors">
                                    <Calendar size={14} className="text-gray-400 mr-2"/>
                                    <span className="text-xs text-gray-500 mr-2">Từ:</span>
                                    <input 
                                        type="date" 
                                        className="text-xs font-medium text-gray-700 focus:outline-none bg-transparent"
                                        value={dateFilter.start}
                                        onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                                    />
                                </div>
                                <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm hover:border-indigo-300 transition-colors">
                                    <Calendar size={14} className="text-gray-400 mr-2"/>
                                    <span className="text-xs text-gray-500 mr-2">Đến:</span>
                                    <input 
                                        type="date" 
                                        className="text-xs font-medium text-gray-700 focus:outline-none bg-transparent"
                                        value={dateFilter.end}
                                        onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                                    />
                                </div>
                                
                                {(dateFilter.start || dateFilter.end) && (
                                    <button 
                                        onClick={() => setDateFilter({ start: '', end: '' })}
                                        className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                    >
                                        <XCircle size={14} /> Xóa lọc
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                        {filteredLogs && filteredLogs.length > 0 ? (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="py-3 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Thời gian</th>
                                        <th className="py-3 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Loại GD</th>
                                        <th className="py-3 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Số lượng</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredLogs.map((log, index) => (
                                        <tr key={index} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                        {formatTime(log.timestamp)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`
                                                    inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase
                                                    ${log.action === 'withdraw' || log.action === 'purchase'
                                                        ? 'bg-red-50 text-red-600 border border-red-100' 
                                                        : 'bg-green-50 text-green-600 border border-green-100'}
                                                `}>
                                                    {log.action === 'withdraw' || log.action === 'purchase' ? <TrendingDown size={12}/> : <ArrowUpRight size={12}/>}
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <span className={`font-mono font-medium ${log.action === 'withdraw' || log.action === 'purchase' ? 'text-red-600' : 'text-gray-900'}`}>
                                                    {log.action === 'withdraw' || log.action === 'purchase' ? '-' : '+'}{log.amountEth} ETH
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="py-16 text-center flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    {logsData.logs.length > 0 ? <Filter size={32} className="text-gray-300"/> : <FileText size={32} className="text-gray-300" />}
                                </div>
                                <p className="text-gray-500 font-medium">
                                    {logsData.logs.length > 0 
                                        ? "Không tìm thấy giao dịch nào trong khoảng thời gian này" 
                                        : "Chưa có dữ liệu giao dịch"}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* --- MODAL RÚT TIỀN (Giữ nguyên) --- */}
            {isWithdrawModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        onClick={() => !isSubmitting && setIsWithdrawModalOpen(false)}
                    ></div>

                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 text-lg">Xác nhận Rút tiền</h3>
                            <button onClick={() => setIsWithdrawModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            {withdrawResult ? (
                                <div className="text-center space-y-4">
                                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${withdrawResult.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {withdrawResult.success ? <CheckCircle size={32}/> : <AlertCircle size={32}/>}
                                    </div>
                                    <h4 className={`text-lg font-bold ${withdrawResult.success ? 'text-green-700' : 'text-red-700'}`}>
                                        {withdrawResult.success ? 'Rút tiền thành công!' : 'Giao dịch thất bại'}
                                    </h4>
                                    <p className="text-gray-600 text-sm">{withdrawResult.message || withdrawResult.error}</p>
                                    
                                    {withdrawResult.success && (
                                        <div className="bg-gray-50 p-3 rounded-lg text-xs font-mono break-all text-gray-500">
                                            Tx: {withdrawResult.txHash}
                                        </div>
                                    )}

                                    <button 
                                        onClick={() => {
                                            if(withdrawResult.success) setIsWithdrawModalOpen(false);
                                            setWithdrawResult(null);
                                        }}
                                        className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
                                    >
                                        {withdrawResult.success ? 'Đóng' : 'Thử lại'}
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleWithdrawSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Số lượng ETH cần rút</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                step="any"
                                                value={withdrawForm.amount}
                                                onChange={(e) => setWithdrawForm({...withdrawForm, amount: e.target.value})}
                                                className="w-full pl-4 pr-16 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-lg"
                                                placeholder="0.0"
                                                required
                                            />
                                            <button 
                                                type="button"
                                                onClick={handleSetMaxAmount}
                                                className="absolute right-2 top-2 bottom-2 px-3 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-100"
                                            >
                                                MAX
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                        <label className="flex items-center gap-1.5 text-xs font-bold text-orange-800 mb-2 uppercase">
                                            <Lock size={12} /> Nhập Private Key để ký
                                        </label>
                                        <input 
                                            type="password" 
                                            value={withdrawForm.privateKey}
                                            onChange={(e) => setWithdrawForm({...withdrawForm, privateKey: e.target.value})}
                                            className="w-full px-4 py-3 bg-white border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                                            placeholder="••••••••••••••••••••••••"
                                            required
                                        />
                                    </div>

                                    <button 
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2
                                            ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all'}
                                        `}
                                    >
                                        {isSubmitting ? <RefreshCcw className="animate-spin" size={20}/> : <ArrowUpRight size={20}/>}
                                        {isSubmitting ? 'Đang xử lý...' : 'Xác nhận Rút'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BalanceManagement;