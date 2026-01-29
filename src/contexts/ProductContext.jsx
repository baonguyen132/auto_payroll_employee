import React, { createContext, useCallback, useState } from 'react';
import { productService } from '../services/product/productService';

const ProductContext = createContext();

const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Helper để reset lỗi
    const clearError = () => setError(null);

    // 1. Lấy danh sách sản phẩm
    const getProducts = useCallback(async () => {
        setIsLoading(true);
        clearError();
        try {
            const data = await productService.getProducts();
            // Giả sử API trả về mảng sản phẩm trực tiếp hoặc object chứa mảng
            // Cần đảm bảo data là array, nếu API trả về { data: [...] } thì sửa thành data.data
            setProducts(Array.isArray(data) ? data : []); 
        } catch (error) {
            console.error('getProducts error', error);
            setError(error.message || 'Lỗi khi tải danh sách sản phẩm');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 2. Mua sản phẩm (Checkout)
    const buyProducts = async (cartData) => {
        setIsLoading(true);
        clearError();
        try {
            // cartData format: Backend thường yêu cầu array các object { productId, quantity }
            const result = await productService.buyProducts(cartData);
            
            // Sau khi mua thành công, có thể cần load lại danh sách sản phẩm (nếu backend có trừ kho)
            // await getProducts(); 
            
            return result;
        } catch (error) {
            console.error('buyProducts error', error);
            setError(error.message || 'Thanh toán thất bại');
            throw error; // Ném lỗi để component UI bắt được và hiện thông báo
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        products,
        isLoading,
        error,
        getProducts,
        buyProducts,
        clearError
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
};

export { ProductContext, ProductProvider };