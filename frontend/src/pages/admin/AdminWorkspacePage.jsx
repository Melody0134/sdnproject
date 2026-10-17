import { useEffect, useState } from 'react';
import { adminApi, notificationApi } from '../../api';
import { Badge, Button, Card, CardBody, EmptyState, ErrorState, Input, LoadingState, Modal, Select, Textarea, ConfirmDialog } from '../../components/common';
import PageHeader from '../../components/layout/PageHeader';
import { useToast } from '../../context/ToastContext';

const tabs = [
  { key: 'clubs', label: 'Câu lạc bộ' },
  { key: 'registrations', label: 'Đơn đăng ký' },
  { key: 'taxonomies', label: 'Danh mục' },
  { key: 'reports', label: 'Báo cáo' },
  { key: 'settings', label: 'Cài đặt' },
  { key: 'notifications', label: 'Gửi thông báo' },
];

const AdminWorkspacePage = () => {
  const [tab, setTab] = useState('clubs');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [editor, setEditor] = useState(null);
  const [taxonomyType, setTaxonomyType] = useState('skill');
  const [toDelete, setToDelete] = useState(null);
  const load = async () => {
    setLoading(true);
    try {
      if (tab === 'notifications') {
        setData(null);
        setError('');
        setLoading(false);
        return;
      }
       const loaders = { clubs: () => adminApi.clubs({ search, limit: 50 }), registrations: () => adminApi.registrations({ limit: 50 }), taxonomies: () => adminApi.taxonomies({ type: taxonomyType, limit: 50 }), reports: () => adminApi.reports({}), settings: () => adminApi.settings() };
      const response = await loaders[tab]();
      setData(response.data || response);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [tab, taxonomyType]);
  const updateRegistration = async (item, isApproved) => {
    try {
      if (isApproved) await adminApi.approveRegistration(item._id);
      else await adminApi.rejectRegistration(item._id, { rejectionReason: 'Không đáp ứng tiêu chí xét duyệt.' });
      load();
    } catch (requestError) {
      setError(requestError.message);
    }
  };
  const saveItem = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...editor.form };
      if (editor.kind === 'taxonomy') payload.type = taxonomyType;
      if (editor.kind === 'club') payload.category = payload.category || null;
      if (editor.kind === 'club' && !editor.id) payload.leader = payload.leader.trim();
      if (editor.id) await (editor.kind === 'club' ? adminApi.updateClub(editor.id, payload) : adminApi.updateTaxonomy(editor.id, payload));
      else await (editor.kind === 'club' ? adminApi.createClub(payload) : adminApi.createTaxonomy(payload));
      setEditor(null);
      load();
    } catch (requestError) {
      setError(requestError.message);
    }
  };
  const removeItem = async () => {
    try {
      if (toDelete.kind === 'club') await adminApi.deleteClub(toDelete.item._id);
      else await adminApi.deleteTaxonomy(toDelete.item._id);
      setToDelete(null);
      load();
    } catch (requestError) {
      setError(requestError.message);
    }
  };
  const openClub = (club = {}) => setEditor({ kind: 'club', id: club._id, form: { name: club.name || '', description: club.description || '', category: club.category?._id || club.category || '', leader: club.leader?._id || club.leader || '', contactEmail: club.contactEmail || '', logoUrl: club.logoUrl || '', status: club.status || 'active' } });
  const openTaxonomy = (taxonomy = {}) => setEditor({ kind: 'taxonomy', id: taxonomy._id, form: { name: taxonomy.name || '', description: taxonomy.description || '', isActive: taxonomy.isActive !== false } });
  const items = data?.data || data?.items || [];
  const managedItems = items.map((item) => <Card key={item._id}><CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-slate-900">{item.name || item.clubName || item.type}</p><p className="text-sm text-slate-500">{item.description || item.contactEmail || item.status || item.category || 'Chưa có mô tả'}</p></div><div className="flex flex-wrap items-center gap-2">{item.status && <Badge tone={item.status === 'approved' || item.status === 'active' ? 'success' : item.status === 'pending' ? 'brand' : 'neutral'}>{item.status}</Badge>}{tab === 'registrations' && item.status === 'pending' && <><Button variant="secondary" onClick={() => updateRegistration(item, false)}>Từ chối</Button><Button onClick={() => updateRegistration(item, true)}>Duyệt</Button></>}{tab === 'clubs' && <><Button variant="secondary" onClick={() => openClub(item)}>Sửa</Button><Button variant="danger" onClick={() => setToDelete({ kind: 'club', item })}>Xóa</Button></>}{tab === 'taxonomies' && <><Button variant="secondary" onClick={() => openTaxonomy(item)}>Sửa</Button><Button variant="danger" onClick={() => setToDelete({ kind: 'taxonomy', item })}>Xóa</Button></>}</div></CardBody></Card>);
  return <div><PageHeader title="Không gian quản trị" description="Quản lý câu lạc bộ, danh mục, báo cáo và cấu hình hệ thống." /><div className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200">{tabs.map((item) => <button key={item.key} type="button" onClick={() => setTab(item.key)} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold ${tab === item.key ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>{item.label}</button>)}</div>{tab === 'clubs' && <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end"><form onSubmit={(event) => { event.preventDefault(); load(); }} className="max-w-md flex-1"><Input id="club-search" label="Tìm câu lạc bộ" value={search} onChange={(event) => setSearch(event.target.value)} /></form><Button onClick={() => openClub()}>Thêm câu lạc bộ</Button></div>}{tab === 'taxonomies' && <div className="mb-4 flex flex-wrap items-end gap-3"><Select id="taxonomy-type" label="Loại danh mục" value={taxonomyType} onChange={(event) => setTaxonomyType(event.target.value)}><option value="skill">Kỹ năng</option><option value="major">Ngành học</option><option value="category">Thể loại</option></Select><Button onClick={() => openTaxonomy()}>Thêm danh mục</Button></div>}{loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : tab === 'notifications' ? <NotificationView /> : tab === 'reports' ? <ReportView report={data?.report} /> : tab === 'settings' ? <SettingsView setting={data?.setting} onSaved={load} /> : items.length === 0 ? <EmptyState title="Chưa có dữ liệu" /> : <div className="grid gap-3">{managedItems}</div>}{editor && <AdminEditor editor={editor} setEditor={setEditor} onSave={saveItem} taxonomyType={taxonomyType} />}{toDelete && <ConfirmDialog open title="Xác nhận xóa" message="Dữ liệu sẽ bị xóa khỏi hệ thống. Bạn có chắc muốn tiếp tục?" confirmLabel="Xóa" onConfirm={removeItem} onClose={() => setToDelete(null)} />}</div>;
};

const AdminEditor = ({ editor, setEditor, onSave, taxonomyType }) => {
  const setField = (field, value) => setEditor((current) => ({ ...current, form: { ...current.form, [field]: value } }));
  return <Modal open onClose={() => setEditor(null)} title={editor.kind === 'club' ? (editor.id ? 'Chỉnh sửa câu lạc bộ' : 'Thêm câu lạc bộ') : (editor.id ? 'Chỉnh sửa danh mục' : 'Thêm danh mục')} size="lg" footer={<><Button variant="secondary" onClick={() => setEditor(null)}>Hủy</Button><Button type="submit" form="admin-editor-form">Lưu</Button></>}><form id="admin-editor-form" onSubmit={onSave} className="space-y-4">{editor.kind === 'club' ? <><Input label="Tên câu lạc bộ" required value={editor.form.name} onChange={(event) => setField('name', event.target.value)} /><Textarea label="Mô tả" value={editor.form.description} onChange={(event) => setField('description', event.target.value)} /><div className="grid gap-4 sm:grid-cols-2"><Input label="ID người phụ trách" required={!editor.id} value={editor.form.leader} onChange={(event) => setField('leader', event.target.value)} /><Input label="Email liên hệ" type="email" required value={editor.form.contactEmail} onChange={(event) => setField('contactEmail', event.target.value)} /><Input label="ID danh mục" value={editor.form.category} onChange={(event) => setField('category', event.target.value)} /><Select label="Trạng thái" value={editor.form.status} onChange={(event) => setField('status', event.target.value)}><option value="active">Đang hoạt động</option><option value="inactive">Tạm dừng</option></Select></div><Input label="URL logo" type="url" value={editor.form.logoUrl} onChange={(event) => setField('logoUrl', event.target.value)} /></> : <><Input label={taxonomyType === 'skill' ? 'Tên kỹ năng' : taxonomyType === 'major' ? 'Tên ngành học' : 'Tên thể loại'} required value={editor.form.name} onChange={(event) => setField('name', event.target.value)} /><Textarea label="Mô tả" value={editor.form.description} onChange={(event) => setField('description', event.target.value)} /><label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={editor.form.isActive} onChange={(event) => setField('isActive', event.target.checked)} /> Đang hoạt động</label></>}</form></Modal>;
};

const NotificationView = () => {
  const toast = useToast();
  const [form, setForm] = useState({ audience: 'all', recipient: '', message: '', link: '' });
  const [sending, setSending] = useState(false);
  const [recipientCount, setRecipientCount] = useState(null);
  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const send = async (event) => {
    event.preventDefault();
    setSending(true);
    setRecipientCount(null);
    try {
      const payload = { message: form.message, link: form.link };
      if (form.recipient.trim()) payload.recipient = form.recipient.trim();
      else payload.audience = form.audience;
      const response = await notificationApi.send(payload);
      setRecipientCount(response.data?.recipientCount ?? 0);
      setForm((current) => ({ ...current, message: '', recipient: '' }));
      toast.success('Đã gửi thông báo');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSending(false);
    }
  };
  return <Card className="max-w-2xl"><CardBody><form onSubmit={send} className="space-y-4"><Select id="notification-audience" label="Đối tượng" value={form.audience} onChange={(event) => setField('audience', event.target.value)}><option value="all">Tất cả người dùng</option><option value="student">Sinh viên</option><option value="lecturer">Giảng viên</option><option value="admin">Quản trị viên</option><option value="club_leader">Trưởng câu lạc bộ</option></Select><Input id="notification-recipient" label="Mã người nhận (tùy chọn)" placeholder="Nhập ID để gửi riêng" value={form.recipient} onChange={(event) => setField('recipient', event.target.value)} /><Textarea id="notification-message" label="Nội dung" maxLength={300} required value={form.message} onChange={(event) => setField('message', event.target.value)} /><Input id="notification-link" label="Liên kết (tùy chọn)" value={form.link} onChange={(event) => setField('link', event.target.value)} /><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-500" aria-live="polite">{recipientCount === null ? 'Chưa gửi thông báo' : `Đã gửi tới ${recipientCount} người nhận`}</p><Button type="submit" loading={sending}>Gửi thông báo</Button></div></form></CardBody></Card>;
};

const ReportView = ({ report }) => <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(report?.totals || {}).map(([key, value]) => <Card key={key}><CardBody><p className="text-sm text-slate-500">{key}</p><p className="mt-1 text-3xl font-bold text-slate-900">{value}</p></CardBody></Card>)}</div>;

const SettingsView = ({ setting, onSaved }) => {
  const [form, setForm] = useState({ platformName: setting?.platformName || '', supportEmail: setting?.supportEmail || '', maintenanceMode: Boolean(setting?.maintenanceMode), allowRegistration: setting?.allowRegistration !== false, maxUploadSizeMb: setting?.maxUploadSizeMb || 10 });
  const [saving, setSaving] = useState(false);
  useEffect(() => { setForm({ platformName: setting?.platformName || '', supportEmail: setting?.supportEmail || '', maintenanceMode: Boolean(setting?.maintenanceMode), allowRegistration: setting?.allowRegistration !== false, maxUploadSizeMb: setting?.maxUploadSizeMb || 10 }); }, [setting]);
  const save = async (event) => { event.preventDefault(); setSaving(true); try { await adminApi.updateSettings({ ...form, maxUploadSizeMb: Number(form.maxUploadSizeMb) }); onSaved(); } finally { setSaving(false); } };
  return <Card className="max-w-2xl"><CardBody><form onSubmit={save} className="space-y-4"><Input id="platform-name" label="Tên nền tảng" value={form.platformName} onChange={(event) => setForm({ ...form, platformName: event.target.value })} required /><Input id="support-email" label="Email hỗ trợ" type="email" value={form.supportEmail} onChange={(event) => setForm({ ...form, supportEmail: event.target.value })} /><Input id="max-upload" label="Dung lượng tải lên tối đa (MB)" type="number" min="1" value={form.maxUploadSizeMb} onChange={(event) => setForm({ ...form, maxUploadSizeMb: event.target.value })} /><label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.allowRegistration} onChange={(event) => setForm({ ...form, allowRegistration: event.target.checked })} /> Cho phép đăng ký tài khoản</label><label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.maintenanceMode} onChange={(event) => setForm({ ...form, maintenanceMode: event.target.checked })} /> Bật chế độ bảo trì</label><div className="flex justify-end"><Button type="submit" loading={saving}>Lưu cài đặt</Button></div></form></CardBody></Card>;
};

export default AdminWorkspacePage;
