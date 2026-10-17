import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api';
import { Button, Input } from '../../components/common';
import { useToast } from '../../context/ToastContext';
import AuthShell from './AuthShell';

const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const [form, setForm] = useState({ token: params.get('token') || '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Mật khẩu xác nhận không khớp.');
    setLoading(true);
    try {
      await authApi.resetPassword({ resetToken: form.token, newPassword: form.password });
      toast.success('Đặt lại mật khẩu thành công.');
      navigate('/login');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return <AuthShell title="Đặt lại mật khẩu" subtitle="Dùng mã trong email để tạo mật khẩu mới.">
    <form onSubmit={submit} className="space-y-4">
      <Input id="reset-token" label="Mã đặt lại" value={form.token} onChange={(event) => setForm({ ...form, token: event.target.value })} required />
      <Input id="reset-password" label="Mật khẩu mới" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required minLength={8} />
      <Input id="reset-confirm" label="Xác nhận mật khẩu" type="password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} required />
      <Button type="submit" loading={loading} className="w-full">Đặt lại mật khẩu</Button>
      <p className="text-center text-sm text-slate-500"><Link to="/login" className="font-semibold text-brand-600 hover:underline">Quay lại đăng nhập</Link></p>
    </form>
  </AuthShell>;
};

export default ResetPasswordPage;
