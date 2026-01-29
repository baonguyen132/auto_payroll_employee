import { createContext, useCallback, useState } from "react";
import { employeeService } from "../services/employee/employeeService";

const EmployeeContext = createContext();

const EmployeeProvider = ({ children }) => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null); // State lưu nhân viên đang xem chi tiết
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- Helper để reset lỗi ---
    const clearError = () => setError(null);

    // 1. Lấy danh sách nhân viên
    const getEmployees = useCallback(async () => {
        setIsLoading(true);
        clearError();
        try {
            const data = await employeeService.getEmployees();
            setEmployees(data || []);
        } catch (error) {
            console.error('getEmployees error', error);
            setError(error.message || 'Lỗi khi tải danh sách nhân viên');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 2. Lấy chi tiết nhân viên
    const getEmployeeByCode = useCallback(async (userCode) => {
        setIsLoading(true);
        clearError();
        try {
            const data = await employeeService.getEmployeeByCode(userCode);
            setSelectedEmployee(data);
            return data;
        } catch (error) {
            console.error('getEmployeeByCode error', error);
            setError(error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 3. Tạo nhân viên mới
    const createEmployee = async (employeeData) => {
        setIsLoading(true);
        clearError();
        try {
            const result = await employeeService.createNewEmployee(employeeData);
            await getEmployees(); // Refresh lại danh sách sau khi tạo
            return result;
        } catch (error) {
            console.error('createEmployee error', error);
            setError(error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    // 4. Upload Avatar
    const uploadAvatar = async (userCode, file) => {
        setIsLoading(true);
        clearError();
        try {
            const result = await employeeService.uploadAvatar(userCode, file);
            return result;
        } catch (error) {
            console.error('uploadAvatar error', error);
            setError(error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    // 5. Cập nhật trạng thái (Active/Inactive)
    const updateEmployeeStatus = async (userCode, isActive) => {
        setIsLoading(true);
        clearError();
        try {
            await employeeService.updateEmployeeStatus(userCode, isActive);
            
            // Cập nhật lại state employees ngay lập tức (Optimistic UI update)
            setEmployees(prev => prev.map(emp => 
                emp.userCode === userCode ? { ...emp, active: isActive } : emp
            ));
            
        } catch (error) {
            console.error('updateEmployeeStatus error', error);
            setError(error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    // 6. Lấy số dư (Balance)
    const getBalance = async () => {
        // Hàm này thường không set global state mà trả về data trực tiếp cho component gọi nó
        try {
            const data = await employeeService.getBalance();
            return data;
        } catch (error) {
            console.error('getBalance error', error);
            throw error;
        }
    }

    // 7. Rút tiền (Withdraw)
    const withdrawETH = async (userCode, privateKey, amount) => {
        setIsLoading(true);
        clearError();
        try {
            const result = await employeeService.withdrawETH({ userCode, privateKey, amount });
            return result;
        } catch (error) {
            console.error('withdrawETH error', error);
            setError(error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    // 8. Lấy Logs
    const getTransactionLogs = async (userCode) => {
        try {
            const data = await employeeService.getTransactionLogs(userCode);
            return data;
        } catch (error) {
            console.error('getTransactionLogs error', error);
            throw error;
        }
    }

    const value = { 
        employees, 
        selectedEmployee,
        isLoading, 
        error,
        getEmployees, 
        getEmployeeByCode,
        createEmployee,
        uploadAvatar,
        updateEmployeeStatus,
        getBalance,
        withdrawETH,
        getTransactionLogs,
        clearError
    };

    return (
        <EmployeeContext.Provider value={value}>
            {children}
        </EmployeeContext.Provider>
    );
};

export { EmployeeContext, EmployeeProvider };