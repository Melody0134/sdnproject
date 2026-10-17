import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({ open, title = 'Xác nhận', message, confirmLabel = 'Xác nhận', tone = 'danger', loading, onConfirm, onClose }) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    size="sm"
    footer={
      <>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button variant={tone} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </>
    }
  >
    <p className="text-sm text-slate-600">{message}</p>
  </Modal>
);

export default ConfirmDialog;
