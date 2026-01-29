import getAuthHeaders, { API_BASE_URL } from '../api'

// Hàm helper để xử lý phản hồi từ API
const handleResponse = async (response) => {
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
        const error = (data && data.message) || (data && data.error) || response.statusText;
        throw new Error(error);
    }
    return data;
};

export const employeeService = {
    // 1. Lấy danh sách tất cả nhân viên
    // GET /api/employee
    getEmployees: async () => {
        const response = await fetch(`${API_BASE_URL}/employee`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    },

    // 2. Lấy chi tiết nhân viên theo userCode
    // GET /api/employee/:userCode
    getEmployeeByCode: async (userCode) => {
        const response = await fetch(`${API_BASE_URL}/employee/${userCode}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    },

    // 3. Tạo nhân viên mới
    // POST /api/employee
    createNewEmployee: async (employeeData) => {
        const response = await fetch(`${API_BASE_URL}/employee`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(employeeData)
        });
        return handleResponse(response);
    },

    // 4. Upload Avatar
    // POST /api/employee/:userCode/avatar
    uploadAvatar: async (userCode, file) => {
        const formData = new FormData();
        formData.append('avatar', file);

        // Lấy headers mặc định nhưng XÓA Content-Type để trình duyệt tự đặt multipart/form-data boundary
        const headers = getAuthHeaders();
        delete headers['Content-Type'];

        const response = await fetch(`${API_BASE_URL}/employee/${userCode}/avatar`, {
            method: 'POST',
            headers: headers,
            body: formData
        });
        return handleResponse(response);
    },

    // 5. Cập nhật trạng thái hoạt động (Active/Inactive)
    // PUT /api/employee/:userCode/status
    updateEmployeeStatus: async (userCode, active) => {
        const response = await fetch(`${API_BASE_URL}/employee/${userCode}/status`, {
            method: 'PUT', // Backend định nghĩa là PUT
            headers: getAuthHeaders(),
            body: JSON.stringify({ active })
        });
        return handleResponse(response);
    },

    // 6. Lấy số dư ví ETH
    // POST /api/employee/balance
    getBalance: async () => {
        const response = await fetch(`${API_BASE_URL}/employee/balance`, {
            method: 'POST',
            headers: getAuthHeaders(),
            // Body rỗng vì backend lấy thông tin từ token (req.user)
            body: JSON.stringify({}) 
        });
        return handleResponse(response);
    },

    // 7. Rút tiền ETH
    // POST /api/employee/withdraw
    withdrawETH: async ({ userCode, privateKey, amount }) => {
        // Body: { userCode, privateKey, amount }
        const response = await fetch(`${API_BASE_URL}/employee/withdraw`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ 
                userCode: String(userCode), // Đảm bảo là string như swagger mẫu
                privateKey, 
                amount 
            })
        });
        return handleResponse(response);
    },

    // 8. Lấy lịch sử giao dịch (Logs)
    getTransactionLogs: async (userCode) => {
        const response = await fetch(`${API_BASE_URL}/employee/${userCode}/logs`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
        // API trả về: { userCode, logs: [], bookBalance, ... }
        // Ta chỉ cần trả về nguyên cục data này để Component tự xử lý
        return handleResponse(response);
    }

}