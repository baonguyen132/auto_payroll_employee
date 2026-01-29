import getAuthHeaders, {API_BASE_URL} from '../api'

export const authService = {
    login: async (credentials) =>  {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(credentials),
        });

        const result = await response.json();

        if(!response.ok) {
            throw new Error(result.message || 'Đăng nhập thất bại!')
        }        
        console.log("Dữ liệu phản hồi từ API đăng nhập:", result); // Log the response data

        if (result.token) { 
            localStorage.setItem('authToken', result.token);
            localStorage.setItem('user' , JSON.stringify(result.user))
            // AuthContext mong đợi một đối tượng có 'access_token' vaf 'data user'
            return { token: result.token, user: result.user };
        } else {
            console.error('Không tìm thấy token', result);
            throw new Error('Không tìm thấy "token" trong phản hồi đăng nhập. Vui lòng kiểm tra cấu trúc phản hồi của backend.')
        }  
    },


    //đăng xuất
    logout: () =>  {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        
    },

    getToken: () =>  {
        return localStorage.getItem('authToken')
        
    },
    getUser: () => {
        return JSON.parse(localStorage.getItem('user')) ;
    },
    isAuthenticated: () =>  {
        return !!localStorage.getItem('authToken');  
    },

   

}