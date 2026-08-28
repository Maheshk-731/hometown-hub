import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCommunityBySlug, getMembershipStatus } from '../api/communities';
import { listMessages, sendMessage } from '../api/messages';
import { useAuth } from '../context/AuthContext';

const POLL_INTERVAL_MS = 4000;

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function CommunityChat() {
  const { slug } = useParams();
  const { user } = useAuth();

  const [community, setCommunity] = useState(null);
  const [allowed, setAllowed] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sendError, setSendError] = useState('');
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);
  const lastTimestampRef = useRef(null);
  const pollRef = useRef(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const init = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const communityData = await getCommunityBySlug(slug);
      setCommunity(communityData);

      const membership = await getMembershipStatus(communityData._id);
      if (membership.status !== 'approved') {
        setAllowed(false);
        setLoading(false);
        return;
      }
      setAllowed(true);

      const initialMessages = await listMessages(communityData._id);
      setMessages(initialMessages);
      if (initialMessages.length > 0) {
        lastTimestampRef.current = initialMessages[initialMessages.length - 1].createdAt;
      } else {
        lastTimestampRef.current = new Date().toISOString();
      }
    } catch {
      setError('This community could not be found.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!community || !allowed) return;

    pollRef.current = setInterval(async () => {
      try {
        const newMessages = await listMessages(community._id, lastTimestampRef.current);
        if (newMessages.length > 0) {
          setMessages((prev) => [...prev, ...newMessages]);
          lastTimestampRef.current = newMessages[newMessages.length - 1].createdAt;
        }
      } catch {
        // silent — next poll will retry
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(pollRef.current);
  }, [community, allowed]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    setSendError('');
    try {
      const sent = await sendMessage(community._id, text.trim());
      setMessages((prev) => [...prev, sent]);
      lastTimestampRef.current = sent.createdAt;
      setText('');
    } catch (err) {
      setSendError(err.response?.data?.message || 'Could not send message.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="container py-5 text-soft">Loading chat…</div>;

  if (error || !community) {
    return (
      <div className="container py-5 text-center">
        <h1 className="font-display">Chat not found</h1>
        <p className="text-soft">{error}</p>
      </div>
    );
  }

  if (!user || allowed === false) {
    return (
      <div className="container py-5 text-center">
        <h1 className="font-display">Members only</h1>
        <p className="text-soft">You need to be an approved member of {community.name} to join the chat.</p>
        <Link to={`/communities/${slug}`} className="btn btn-primary mt-2">
          Go to {community.name}
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: 640 }}>
      <p className="eyebrow mb-1">
        <Link to={`/communities/${slug}`}>{community.name}</Link>
      </p>
      <h1 className="font-display mb-4" style={{ fontSize: '1.8rem' }}>
        Community chat
      </h1>

      <div className="card p-3 mb-3 d-flex flex-column" style={{ height: '55vh', overflowY: 'auto' }}>
        {messages.length === 0 ? (
          <p className="text-soft small m-auto">No messages yet. Say hello!</p>
        ) : (
          messages.map((m) => {
            const isMine = m.sender?._id === user.id || m.sender === user.id;
            return (
              <div key={m._id} className={`mb-2 d-flex ${isMine ? 'justify-content-end' : 'justify-content-start'}`}>
                <div
                  style={{
                    maxWidth: '75%',
                    background: isMine ? 'var(--color-primary-tint)' : 'var(--color-bg-alt)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.5rem 0.75rem',
                  }}
                >
                  {!isMine ? (
                    <div className="fw-semibold" style={{ fontSize: '0.78rem' }}>
                      {m.sender?.name || 'Member'}
                    </div>
                  ) : null}
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
                  <div className="text-faint font-mono" style={{ fontSize: '0.65rem', textAlign: 'right' }}>
                    {formatTime(m.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {sendError ? <div className="text-danger small mb-2">{sendError}</div> : null}

      <form onSubmit={handleSend} className="d-flex gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Type a message"
        />
        <button type="submit" className="btn btn-primary" disabled={sending || !text.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}