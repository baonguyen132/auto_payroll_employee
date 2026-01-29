import React, { useState, useMemo, useEffect } from 'react'
import Button from '../../components/commons/button/Button'
import Input from '../../components/commons/input/Input'
import { Basketball, Coffee, Minus, Plus, ShoppingCart, Trash, Spinner, Package } from 'phosphor-react'
import { useProduct } from '../../hook/useProduct' 
import { API_URL_IMAGE as IPFS_GATEWAY } from '../../services/api';
import { useAuth } from '../../hook/useAuth';

const OrderPage = () => {
    // Lấy data và hàm từ Context
    const { products, getProducts, buyProducts, isLoading } = useProduct();

    const { currentUser } = useAuth();

    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [cart, setCart] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')

    // --- 1. Gọi API lấy sản phẩm khi trang load ---
    useEffect(() => {
        getProducts();
    }, [getProducts]);

    const formatWeiToEth = (wei) => {
        if (!wei) return '0';
        return (parseFloat(wei) / 1e18).toString();
    };

    const getImageUrl = (ipfsHash) => {
        if (!ipfsHash) return null;
        return IPFS_GATEWAY+'ipfs/'+ipfsHash;
    };
    // --- Logic Giỏ Hàng (Giữ nguyên logic cũ nhưng chỉnh sửa checkout) ---
    const addToCart = (product) => {
        setCart((prev) => {
            const existingItem = prev.find((item) => item.id === product.id)
            if (existingItem) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                )
            }
            return [...prev, { ...product, quantity: 1 }]
        })
    }

    const updateQuantity = (id, delta) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    const newQty = item.quantity + delta
                    return newQty > 0 ? { ...item, quantity: newQty } : item
                }
                return item
            })
        )
    }

    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((item) => item.id !== id))
    }

    const totalPrice = useMemo(() => {
        const totalWei = cart.reduce((total, item) => {
            // Chuyển priceWei sang số thực và nhân với số lượng
            const itemWei = parseFloat(item.priceWei || 0); 
            return total + (itemWei * item.quantity);
        }, 0);

        // Chuyển đổi từ Wei sang ETH (1 ETH = 10^18 Wei)
        return totalWei / 1e18;
    }, [cart])

    // --- 2. Xử lý Thanh Toán với API ---
    // --- 2. Xử lý Thanh Toán với API ---
    const handleCheckout = async () => {
        // CHẶN NGAY LẬP TỨC nếu đang xử lý (isSubmitting = true)
        if (cart.length === 0 || isSubmitting || isLoading) return;
        
        if (!currentUser || !currentUser.id) {
            alert("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại!");
            return;
        }

        if (window.confirm(`Xác nhận thanh toán ${totalPrice.toLocaleString('vi-VN', { maximumFractionDigits: 5 })} ETH?`)) {
            // 1. KHÓA NÚT NGAY
            setIsSubmitting(true);
            
            try {
                const orderData = {
                    userCode: currentUser.id.toString(),
                    buyerPrivateKey: currentUser.private_key, 
                    products: cart.map(item => ({
                        productCode: item.productCode,
                        quantity: item.quantity,
                    })),
                    totalAmount: totalPrice 
                };

                console.log('Đang gửi dữ liệu đơn hàng:', orderData);

                await buyProducts(orderData); 
                
                alert('Đặt hàng thành công!');
                setCart([]); 
            } catch (error) {
                console.error(error);
                // Chỉ hiện lỗi nếu server thực sự trả về lỗi (tránh hoang mang khi bị double submit)
                alert(`Giao dịch thất bại: ${error.message}`);
            } finally {
                // 2. MỞ KHÓA NÚT (dù thành công hay thất bại)
                setIsSubmitting(false);
            }
        }
    }

    // --- Logic Lọc Menu (Dynamic Category từ API) ---
    // Tạo danh sách category động dựa trên products trả về từ API
    const categories = useMemo(() => {
        if (!products || products.length === 0) return ['All'];
        const cats = new Set(products.map((p) => p.category || 'Khác')); // Fallback 'Khác' nếu thiếu category
        return ['All', ...cats];
    }, [products]);

    const filteredMenu = useMemo(() => {
        if (!products) return [];
        return products.filter((item) => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesCategory = selectedCategory === 'All' || (item.category || 'Khác') === selectedCategory
            return matchesSearch && matchesCategory
        });
    }, [products, searchTerm, selectedCategory]);

    // --- Render Loading State ---
    if (isLoading && products.length === 0) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Spinner size={40} className="animate-spin text-purple-600" />
                    <span className="text-gray-500">Đang tải thực đơn...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-[calc(100vh-140px)] gap-6">
            {/* --- PHẦN TRÁI: DANH SÁCH MÓN (70%) --- */}
            <div className="w-[70%] flex flex-col bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                {/* Header Menu: Search & Filter */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                                    selectedCategory === cat
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="w-64 ml-4">
                        <Input
                            placeholder="Tìm món..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Grid Menu Items */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredMenu.length > 0 ? (
                            filteredMenu.map((product) => (
                                <div
                                    key={product.productCode}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col overflow-hidden group"
                                >
                                    <div className="h-32 overflow-hidden relative">
                                        {product.image ? (
                                            <img 
                                                src={getImageUrl(product.image)} 
                                                alt={product.name} 
                                                className="w-full h-full object-cover"
                                                onError={(e) => {e.target.onerror = null; e.target.src = "https://via.placeholder.com/64?text=Error"}}
                                            />
                                        ) : (
                                            <Package className="text-gray-400" size={24} />
                                        )}
                                        <button 
                                            onClick={() => addToCart(product)}
                                            className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow text-purple-600 hover:text-purple-800 hover:bg-purple-50 transition-colors"
                                        >
                                            <Plus size={20} weight="bold" />
                                        </button>
                                    </div>
                                    <div className="p-3 flex flex-col flex-1">
                                        <h3 className="font-semibold text-gray-800 text-sm line-clamp-1" title={product.name}>
                                            {product.name}
                                        </h3>
                                        <div className="mt-auto pt-2 flex justify-between items-end">
                                            <span className="font-bold text-purple-600 text-md">
                                                {parseFloat(formatWeiToEth(product.priceWei)).toFixed(5)} ETH
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center pt-10 text-gray-500">
                                <Coffee size={48} className="mb-2 opacity-50" />
                                <p>Không tìm thấy món nào.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- PHẦN PHẢI: GIỎ HÀNG (30%) --- */}
            <div className="w-[30%] bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col h-full">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-purple-50 rounded-t-xl">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <ShoppingCart size={24} className="text-purple-600" />
                        Giỏ hàng
                    </h2>
                    <span className="bg-purple-200 text-purple-800 text-xs font-bold px-2 py-1 rounded-full">
                        {cart.length} món
                    </span>
                </div>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <Coffee size={64} className="mb-4 opacity-20" />
                            <p className="text-sm">Chưa có món nào được chọn</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.productCode} className="flex gap-3 items-center group">
                                {item.image ? (
                                    <img 
                                        src={getImageUrl(item.image)} 
                                        alt={item.name} 
                                        className="w-8 h-8 object-cover"
                                        onError={(e) => {e.target.onerror = null; e.target.src = "https://via.placeholder.com/64?text=Error"}}
                                    />
                                ) : (
                                    <Package className="text-gray-400" size={24} />
                                )}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-800 text-sm truncate">{item.name}</h4>
                                    <p className="text-xs text-gray-500">{parseFloat(formatWeiToEth(item.priceWei)).toFixed(5)} ETH</p>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => updateQuantity(item.id, -1)}
                                        className="p-1 hover:bg-white rounded-md transition-colors text-gray-600"
                                    >
                                        <Minus size={12} weight="bold" />
                                    </button>
                                    <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, 1)}
                                        className="p-1 hover:bg-white rounded-md transition-colors text-gray-600"
                                    >
                                        <Plus size={12} weight="bold" />
                                    </button>
                                </div>
                                <button 
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                                >
                                    <Trash size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer: Total & Actions */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600">Tổng cộng</span>
                        <span className="text-xl font-bold text-purple-600">
                            {totalPrice.toLocaleString('vi-VN', { maximumFractionDigits: 5 })} ETH
                            
                        </span>
                    </div>
                    <Button 
                        variant="primary" 
                        fullWidth 
                        size="medium" 
                        icon="CreditCard"
                        onClick={handleCheckout}
                        // THÊM: isSubmitting vào điều kiện disable
                        isDisabled={cart.length === 0 || isLoading || isSubmitting} 
                    >
                        {isLoading || isSubmitting ? 'Đang xử lý...' : 'Thanh toán'}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default OrderPage