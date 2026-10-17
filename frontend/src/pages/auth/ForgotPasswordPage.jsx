import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api';
import { Button, Input } from '../../components/common';
import { useToast } from '../../context/ToastContext';
import AuthShell from './AuthShell';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      toast.success('Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.');
      navigate('/reset-password');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return <AuthShell title="Quên mật khẩu" subtitle="Nhập email trường để nhận hướng dẫn đặt lại mật khẩu.">
    <form onSubmit={submit} className="space-y-4">
      <Input id="forgot-email" label="Email trường" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      <Button type="submit" loading={loading} className="w-full">Gửi hướng dẫn</Button>
      <p className="text-center text-sm text-slate-500"><Link to="/login" className="font-semibold text-brand-600 hover:underline">Quay lại đăng nhập</Link></p>
    </form>
  </AuthShell>;
};

export default ForgotPasswordPage;
