import { useState } from 'react';
import { teamApi } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Modal, Button, Input, Textarea, TagInput } from '../../components/common';

const CreateTeamModal = ({ open, onClose, onCreated, defaults }) => {
  const toast = useToast();
  const [form, setForm] = useState({
    name: defaults?.name || '',
    topic: defaults?.topic || '',
    major: defaults?.major || '',
    description: defaults?.description || '',
    skillsNeeded: defaults?.skillsNeeded || [],
    maxMembers: 5,
  });
  const [saving, setSaving] = useState(false);

  const update = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await teamApi.create({ ...form, maxMembers: Number(form.maxMembers) });
      toast.success('Đã tạo nhóm thành công');
      onCreated?.(res.data.team);
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tạo nhóm mới"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button onClick={submit} loading={saving}>Tạo nhóm</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Input label="Tên nhóm / dự án" value={form.name} onChange={(e) => update({ name: e.target.value })} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Chủ đề" placeholder="Y tế số, Fintech..." value={form.topic} onChange={(e) => update({ topic: e.target.value })} />
          <Input label="Ngành liên quan" value={form.major} onChange={(e) => update({ major: e.target.value })} />
        </div>
        <Textarea label="Mô tả dự án" value={form.description} onChange={(e) => update({ description: e.target.value })} />
        <TagInput
          label="Kỹ năng cần tuyển"
          value={form.skillsNeeded}
          onChange={(skillsNeeded) => update({ skillsNeeded })}
          hint="Kỹ năng nhóm đang cần bổ sung"
        />
        <Input
          label="Số thành viên tối đa"
          type="number"
          min="1"
          max="20"
          value={form.maxMembers}
          onChange={(e) => update({ maxMembers: e.target.value })}
        />
      </form>
    </Modal>
  );
};

export default CreateTeamModal;
