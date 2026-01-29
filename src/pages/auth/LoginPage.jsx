import Button from '../../components/commons/button/Button.jsx'
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import bg from '../../assets/bg.png'
import { useEffect, useState } from 'react';
import { useAuth } from '../../hook/useAuth.js';


const LoginPage = () => {

    const navigate = useNavigate();
    const {login , isLoggedIn} = useAuth();
    const [loginErr, setLoginErr] = useState(null);

    useEffect(() => {
      if(isLoggedIn) {
        navigate('/employee');
      }
    }, [isLoggedIn, navigate])

    const onSubmit = async (data) => {
      setLoginErr(null);
      try {
        await login(data);
      } catch (error) {
        setLoginErr(error.message || 'Đã xảy ra lỗi khi đăng nhập.')
      }

    }
    

  
    const {register, handleSubmit, formState: { errors }} = useForm()

  return (
    <div className='relative min-h-screen flex items-center justify-center'>
        <img src={bg} alt="Background" className='absolute inset-0 w-full h-full object-cover'/>
        
        <div className='relative z-10 flex flex-col items-center justify-center bg-gradient-to-b from-white to-transparent min-w-[400px] h-fit p-8 rounded-3xl shadow-lg'>
            <div className='text-2xl text-neutral-700 font-bold mb-8'> Xin chào! Đăng nhập ngay thôi!</div>
            {loginErr && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Lỗi!</strong>
                <span className="block sm:inline"> {loginErr}</span>
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className='w-full max-w-sm space-y-4'>
                <input 
                    type="text" id="username" placeholder='Username' className='mt-1 font-medium text-sm text-neutral-700 block w-full bg-purple-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-400'
                    {...register('username', { required: 'Username không được để trống' })}
                />
                {errors.username && <span className='text-accent-500 text-sm'>{errors.username.message}</span>}
                <input 
                    type="password" id="password" placeholder='Mật khẩu' className='mt-1 font-medium text-sm text-neutral-700 block w-full bg-purple-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-400'
                    {...register('password', { required: 'Mật khẩu không được để trống' })}
                />
                {errors.password && <span className='text-accent-500 text-sm'>{errors.password.message}</span>}
                <div className='flex justify-center pt-4'>
                    <Button type='submit' fullWidth={true}>Đăng nhập</Button>
                </div>
                <div className='flex justify-end'>
                    <Link to="/auth/verify-code" className='text-sm text-primary-500 hover:underline'>Quên mật khẩu?</Link>
                </div>
                <div className='border-t border-neutral-300'></div>
                
            </form>
        </div>

    </div>
  )
}

export default LoginPage