import { useEffect, useState } from 'react';
import { postApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button, Textarea } from './common';
import Avatar from './common/Avatar';
import Icon from './common/Icon';
import { formatRelative } from '../utils/format';

const CommentSection = ({ postId }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await postApi.comments(postId);
      setComments(res.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [postId]);

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await postApi.addComment(postId, text.trim());
      setText('');
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  const remove = async (comment) => {
    try {
      await postApi.removeComment(postId, comment._id);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="border-t border-slate-100 pt-4">
      <p className="mb-3 text-sm font-semibold text-slate-700">
        Bình luận {comments.length > 0 ? `(${comments.length})` : ''}
      </p>

      <div className="mb-4 flex items-start gap-2">
        <Textarea
          rows={2}
          className="flex-1"
          placeholder="Viết bình luận..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button size="sm" loading={sending} onClick={send}>Gửi</Button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Đang tải bình luận...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-slate-400">Chưa có bình luận nào.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => {
            const canDelete = user?.role === 'admin' || comment.author?._id === user?.id;
            return (
              <div key={comment._id} className="flex items-start gap-2.5">
                <Avatar name={comment.author?.name} src={comment.author?.avatarUrl} size="sm" />
                <div className="flex-1 rounded-lg bg-slate-50 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">{comment.author?.name}</p>
                    <span className="text-xs text-slate-400">{formatRelative(comment.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 whitespace-pre-line text-sm text-slate-600">{comment.content}</p>
                </div>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => remove(comment)}
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
