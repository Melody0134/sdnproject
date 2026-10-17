import { useEffect, useState } from 'react';
import { userApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Card, CardBody, Badge, Button, Input, Textarea, Select, Modal, LoadingState, EmptyState, Pagination, ConfirmDialog } from '../../components/common';
import Avatar from '../../components/common/Avatar';
import Icon from '../../components/common/Icon';
import PageHeader from '../../components/layout/PageHeader';
import { ROLE_LABELS } from '../../utils/constants';

const ROLE_TONE = { student: 'brand', lecturer: 'accent', admin: 'danger', club_leader: 'success' };
const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'student',
  major: '',
  gpa: '',
  skills: '',
  interests: '',
  description: '',
  isActive: true,
};

const UsersPage = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', role: '', page: 1 });
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, limit: 15 };
      if (filters.search) params.search = filters.search;
      if (filters.role) params.role = filters.role;
      const res = await userApi.list(params);
      setUsers(res.data);
      setPagination(res.pagination);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filters.page, filters.role]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setEditorOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name || '',
      email: item.email || '',
      password: '',
      role: item.role || 'student',
      major: item.major || '',
      gpa: item.gpa == null ? '' : String(item.gpa),
      skills: (item.skills || []).join(', '),
      interests: (item.interests || []).join(', '),
      description: item.description || '',
      isActive: item.isActive !== false,
    });
    setEditorOpen(true);
  };

  const parseList = (value) =>
    value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);

  const saveUser = async () => {
    setSaving(true);
    try {
      if (editing) {
        const payload = {
          name: form.name,
          role: form.role,
          isActive: form.isActive,
          major: form.major,
          description: form.description,
          skills: parseList(form.skills),
          interests: parseList(form.interests),
          gpa: form.gpa === '' ? null : Number(form.gpa),
        };
        await userApi.update(editing._id, payload);
        toast.success('Đã cập nhật người dùng');
      } else {
        await userApi.create({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          major: form.major,
        });
        toast.success('Đã tạo người dùng');
      }
      setEditorOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const changeRole = async (userItem, role) => {
    try {
      await userApi.update(userItem._id, { role });
      toast.success('Đã cập nhật vai trò');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleActive = async (userItem) => {
    try {
      await userApi.update(userItem._id, { isActive: !userItem.isActive });
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const confirmDelete = async () => {
    try {
      await userApi.remove(toDelete._id);
      toast.success('Đã xóa người dùng');
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Quản lý người dùng"
        description="Tạo tài khoản, phân quyền và chỉnh sửa thông tin người dùng trong hệ thống."
        action={
          <Button onClick={openCreate}>
            <Icon name="plus" className="h-4 w-4" /> Thêm người dùng
          </Button>
        }
      />

      <form
        className="mb-5 flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          setFilters((prev) => ({ ...prev, page: 1 }));
          load();
        }}
      >
        <Input className="flex-1" placeholder="Tìm theo tên hoặc mô tả..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <Select className="sm:w-52" value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}>
          <option value="">Tất cả vai trò</option>
          <option value="student">Sinh viên</option>
          <option value="lecturer">Giảng viên</option>
          <option value="admin">Quản trị viên</option>
          <option value="club_leader">Chủ nhiệm CLB</option>
        </Select>
        <Button type="submit" variant="secondary">Tìm</Button>
      </form>

      {loading ? (
        <LoadingState />
      ) : users.length === 0 ? (
        <EmptyState title="Không có người dùng" />
      ) : (
        <Card>
          <CardBody className="overflow-x-auto p-0">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Người dùng</th>
                  <th className="px-5 py-3">Vai trò</th>
                  <th className="px-5 py-3">Ngành / GPA</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item._id} className="border-b border-slate-50 last:border-0">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={item.name} src={item.avatarUrl} size="sm" />
                        <div>
                          <p className="font-medium text-slate-800">{item.name}</p>
                          <p className="text-xs text-slate-400">{item.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={item.role}
                        onChange={(e) => changeRole(item, e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium"
                      >
                        <option value="student">Sinh viên</option>
                        <option value="lecturer">Giảng viên</option>
                        <option value="admin">Quản trị viên</option>
                        <option value="club_leader">Chủ nhiệm CLB</option>
                      </select>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {item.major || '—'}
                      {item.gpa != null && <span className="text-slate-400"> · {item.gpa}</span>}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        onClick={() => toggleActive(item)}
                        className="focus:outline-none"
                        title="Đổi trạng thái"
                      >
                        <Badge tone={item.isActive ? 'success' : 'danger'}>
                          {item.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-brand-50 hover:text-brand-600"
                          title="Chỉnh sửa"
                        >
                          <Icon name="edit" className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setToDelete(item)}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                          title="Xóa"
                        >
                          <Icon name="trash" className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

      <div className="mt-4">
        <Pagination pagination={pagination} onChange={(page) => setFilters({ ...filters, page })} />
      </div>

      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editing ? 'Chỉnh sửa người dùng' : 'Thêm người dùng'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditorOpen(false)}>Hủy</Button>
            <Button onClick={saveUser} loading={saving}>{editing ? 'Lưu' : 'Tạo'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Họ và tên" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          {editing ? (
            <Input label="Email" value={form.email} disabled />
          ) : (
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          )}
          {!editing && (
            <Input label="Mật khẩu" type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Vai trò" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="student">Sinh viên</option>
              <option value="lecturer">Giảng viên</option>
              <option value="admin">Quản trị viên</option>
              <option value="club_leader">Chủ nhiệm CLB</option>
            </Select>
            {editing && (
              <Select label="Trạng thái" value={form.isActive ? 'active' : 'locked'} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'active' })}>
                <option value="active">Đang hoạt động</option>
                <option value="locked">Đã khóa</option>
              </Select>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Chuyên ngành" value={form.major} onChange={(e) => setForm({ ...form, major: e.target.value })} />
            {editing && (
              <Input label="GPA" type="number" step="0.01" min="0" max="4" value={form.gpa} onChange={(e) => setForm({ ...form, gpa: e.target.value })} />
            )}
          </div>
          {editing && (
            <>
              <Input label="Kỹ năng (phân tách bằng dấu phẩy)" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
              <Input label="Sở thích (phân tách bằng dấu phẩy)" value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} />
              <Textarea label="Giới thiệu" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Xóa người dùng"
        message={`Xóa tài khoản "${toDelete?.name}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
};

export default UsersPage;
