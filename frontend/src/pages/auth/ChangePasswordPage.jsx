import { useState } from 'react';
import { authApi } from '../../api';
import { Button, Card, CardBody, Input } from '../../components/common';
import PageHeader from '../../components/layout/PageHeader';
import { useToast } from '../../context/ToastContext';

const ChangePasswordPage = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const submit = async (event) => {
    event.preventDefault();
    if (form.newPassword !== form.confirmPassword) return toast.error('Mật khẩu xác nhận không khớp.');
    setLoading(true);
    try {
      await authApi.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Đã đổi mật khẩu.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  return <><PageHeader title="Đổi mật khẩu" description="Cập nhật mật khẩu để bảo vệ tài khoản của bạn." /><Card className="max-w-xl"><CardBody><form onSubmit={submit} className="space-y-4">
    <Input id="current-password" label="Mật khẩu hiện tại" type="password" value={form.currentPassword} onChange={(event) => setForm({ ...form, currentPassword: event.target.value })} required />
    <Input id="new-password" label="Mật khẩu mới" type="password" minLength={8} value={form.newPassword} onChange={(event) => setForm({ ...form, newPassword: event.target.value })} required />
    <Input id="confirm-password" label="Xác nhận mật khẩu mới" type="password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} required />
    <div className="flex justify-end"><Button type="submit" loading={loading}>Lưu mật khẩu</Button></div>
  </form></CardBody></Card></>;
};

export default ChangePasswordPage;
