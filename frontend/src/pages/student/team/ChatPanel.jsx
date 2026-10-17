import { useEffect, useRef, useState } from 'react';
import { teamApi } from '../../../api';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { Card, CardBody, Button, Input } from '../../../components/common';
import Avatar from '../../../components/common/Avatar';
import { formatRelative } from '../../../utils/format';
import { cn } from '../../../utils/cn';

const POLL_INTERVAL_MS = 5000;

const ChatPanel = ({ teamId }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const load = async () => {
    try {
      const res = await teamApi.messages(teamId);
      setMessages(res.data);
    } catch {
      setMessages([]);
    }
  };

  useEffect(() => {
    load();
    const timer = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [teamId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  const send = async (e) => {
    e?.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await teamApi.sendMessage(teamId, text.trim());
      setText('');
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardBody>
        <p className="mb-3 text-sm font-semibold text-slate-700">Trò chuyện nhóm</p>

        <div ref={scrollRef} className="mb-3 max-h-72 space-y-3 overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">Chưa có tin nhắn. Hãy bắt đầu trò chuyện!</p>
          ) : (
            messages.map((message) => {
              const isMine = message.sender?._id === user?.id;
              return (
                <div key={message._id} className={cn('flex items-start gap-2', isMine && 'flex-row-reverse')}>
                  <Avatar name={message.sender?.name} src={message.sender?.avatarUrl} size="sm" />
                  <div
                    className={cn(
                      'max-w-[75%] rounded-xl px-3 py-2',
                      isMine ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-800'
                    )}
                  >
                    {!isMine && <p className="text-xs font-semibold text-slate-500">{message.sender?.name}</p>}
                    <p className="whitespace-pre-line text-sm">{message.content}</p>
                    <p className={cn('mt-0.5 text-[10px]', isMine ? 'text-brand-100' : 'text-slate-400')}>
                      {formatRelative(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={send} className="flex gap-2">
          <Input className="flex-1" placeholder="Nhắn tin cho nhóm..." value={text} onChange={(e) => setText(e.target.value)} />
          <Button type="submit" loading={sending}>Gửi</Button>
        </form>
      </CardBody>
    </Card>
  );
};

export default ChatPanel;
