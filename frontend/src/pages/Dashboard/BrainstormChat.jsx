import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Settings, Plus, Send, Bot, User, Trash2, BrainCircuit, BookOpen } from 'lucide-react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './BrainstormChat.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Custom renderer: render tables nicely but strip all other markdown characters
const markdownComponents = {
  // Paragraphs render as plain text
  p: ({ children }) => <p style={{ margin: '0 0 8px 0', lineHeight: '1.7' }}>{children}</p>,
  // Strong/em: render as plain text (no bold/italic)
  strong: ({ children }) => <>{children}</>,
  em: ({ children }) => <>{children}</>,
  // Headings: render as plain text
  h1: ({ children }) => <p style={{ margin: '0 0 8px 0', fontWeight: 'normal' }}>{children}</p>,
  h2: ({ children }) => <p style={{ margin: '0 0 8px 0', fontWeight: 'normal' }}>{children}</p>,
  h3: ({ children }) => <p style={{ margin: '0 0 8px 0', fontWeight: 'normal' }}>{children}</p>,
  // List items: render as plain text line
  li: ({ children }) => <p style={{ margin: '2px 0', lineHeight: '1.7' }}>{children}</p>,
  ul: ({ children }) => <div style={{ margin: '4px 0' }}>{children}</div>,
  ol: ({ children }) => <div style={{ margin: '4px 0' }}>{children}</div>,
  // Code: render as plain text
  code: ({ children }) => <span>{children}</span>,
  pre: ({ children }) => <div style={{ whiteSpace: 'pre-wrap', margin: '4px 0' }}>{children}</div>,
  // Tables: render nicely
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', margin: '10px 0' }}>
      <table style={{
        borderCollapse: 'collapse',
        width: '100%',
        fontSize: '13px',
        border: '1px solid rgba(255,255,255,0.15)'
      }}>{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th style={{
      padding: '8px 12px',
      background: 'rgba(168,85,247,0.3)',
      border: '1px solid rgba(255,255,255,0.15)',
      textAlign: 'left',
      fontWeight: '600'
    }}>{children}</th>
  ),
  td: ({ children }) => (
    <td style={{
      padding: '7px 12px',
      border: '1px solid rgba(255,255,255,0.1)',
      verticalAlign: 'top'
    }}>{children}</td>
  ),
  tr: ({ children }) => <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{children}</tr>,
};

const BrainstormChat = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [topPrompts, setTopPrompts] = useState([]);

  const triggerActivity = () => {
    fetch(`${API_URL}/streaks/record`, { method: 'POST' }).catch(() => {});
  };

  // Settings Modal
  const [showSettings, setShowSettings] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [sessionTitle, setSessionTitle] = useState('New Conversation');

  // Persistent memory
  const [userMemory, setUserMemory] = useState('');
  const [memorySaved, setMemorySaved] = useState(false);

  // Delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchSessions();
    fetchMemory();
    fetchTopPrompts();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMemory = async () => {
    try {
      const res = await fetch(`${API_URL}/chat/memory/global`);
      const data = await res.json();
      setUserMemory(data.memory || '');
    } catch (error) {
      console.error('Error fetching memory:', error);
    }
  };

  const saveMemory = async () => {
    try {
      await fetch(`${API_URL}/chat/memory/global`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memory: userMemory })
      });
      setMemorySaved(true);
      setTimeout(() => setMemorySaved(false), 2000);
    } catch (error) {
      console.error('Error saving memory:', error);
    }
  };

  const fetchTopPrompts = async () => {
    try {
      const res = await fetch(`${API_URL}/prompts`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const sorted = data.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
        setTopPrompts(sorted.slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching top prompts:', error);
    }
  };

  const handleUsePrompt = async (prompt) => {
    setInputMessage(prompt.isiTeks);
    // Call API to increment usage
    fetch(`${API_URL}/prompts/${prompt.id}/use`, { method: 'POST' }).catch(() => {});
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_URL}/chat`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSessions(data);
      }
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    }
  };

  const loadSession = async (sessionId) => {
    try {
      const res = await fetch(`${API_URL}/chat/${sessionId}`);
      const data = await res.json();
      setCurrentSession(data);
      setMessages(data.messages || []);
      setSystemPrompt(data.systemPrompt || '');
      setSessionTitle(data.title || 'Conversation');
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const createNewSession = () => {
    setCurrentSession(null);
    setMessages([]);
    setSessionTitle('New Conversation');
    setSystemPrompt('');
  };

  const deleteSession = (e, sessionId) => {
    e.stopPropagation();
    setPendingDeleteId(sessionId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      await fetch(`${API_URL}/chat/${pendingDeleteId}`, { method: 'DELETE' });
      if (currentSession?.id === pendingDeleteId) {
        createNewSession();
      }
      fetchSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
    } finally {
      setShowDeleteConfirm(false);
      setPendingDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setPendingDeleteId(null);
  };

  const saveSettings = async () => {
    await saveMemory();
    setShowSettings(false);
    if (currentSession) {
      try {
        await fetch(`${API_URL}/chat/${currentSession.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ systemPrompt, title: sessionTitle })
        });
        fetchSessions();
      } catch (error) {
        console.error('Error updating settings:', error);
      }
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: 'user', content: inputMessage };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInputMessage('');
    setIsTyping(true);

    let activeSessionId = currentSession?.id;

    // Create session if it doesn't exist
    if (!activeSessionId) {
      try {
        const createRes = await fetch(`${API_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: userMessage.content.slice(0, 40) + (userMessage.content.length > 40 ? '...' : ''),
            systemPrompt,
            messages: newMessages
          })
        });
        const createdData = await createRes.json();
        activeSessionId = createdData.id;
        setCurrentSession(createdData);
        setSessionTitle(createdData.title);
        fetchSessions();
      } catch (error) {
        console.error('Error creating session:', error);
      }
    }

    // Call Gemini AI via backend
    try {
      const aiRes = await fetch(`${API_URL}/chat/ask-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt, messages: newMessages })
      });

      const aiData = await aiRes.json();
      const aiText = aiData.response || 'Maaf, bot sedang sibuk. Coba lagi ya.';

      const aiMessage = { role: 'assistant', content: aiText };
      const finalMessages = [...newMessages, aiMessage];

      setMessages(finalMessages);

      // Save to Firebase
      if (activeSessionId) {
        await fetch(`${API_URL}/chat/${activeSessionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: finalMessages })
        });
      }

    } catch (error) {
      console.error('Error calling AI:', error);
      setMessages([...newMessages, { role: 'assistant', content: 'Maaf, terjadi kesalahan koneksi. Silakan coba lagi.' }]);
    } finally {
      setIsTyping(false);
      triggerActivity();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      {/* Sidebar History */}
      <div className="chat-sidebar glass-panel">
        <button className="btn-primary new-chat-btn" onClick={createNewSession}>
          <Plus size={18} /> New Chat
        </button>
        <div className="history-list">
          <h4 className="history-title">Recent Conversations</h4>
          {sessions.map(session => (
            <div
              key={session.id}
              className={`history-item ${currentSession?.id === session.id ? 'active' : ''}`}
              onClick={() => loadSession(session.id)}
            >
              <MessageSquare size={16} className="history-icon" />
              <span className="history-text">{session.title}</span>
              <button className="delete-chat-btn" onClick={(e) => deleteSession(e, session.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="no-history">No history yet.</p>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main glass-panel">
        <div className="chat-header">
          <div className="chat-header-info">
            <BrainCircuit size={24} color="#a855f7" />
            <div>
              <h3>{currentSession ? sessionTitle : 'New Brainstorming Session'}</h3>
              <p>AI Assistant - Free &amp; Unlimited</p>
            </div>
          </div>
          <button className="btn-icon" onClick={() => setShowSettings(true)} title="Brain Settings">
            <Settings size={20} />
          </button>
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="empty-chat-state">
              <Bot size={48} color="rgba(255,255,255,0.2)" />
              <h2>Mau brainstorming apa hari ini?</h2>
              <p>Ketik pesan di bawah untuk mulai. Aku selalu ingat siapa kamu!</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`message-wrapper ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
                </div>
                <div className="message-bubble markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))
          )}
          {isTyping && (
            <div className="message-wrapper assistant">
              <div className="message-avatar"><Bot size={20} /></div>
              <div className="message-bubble typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {topPrompts.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', padding: '10px 20px 0', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            {topPrompts.map(p => (
              <button 
                key={p.id} 
                onClick={() => handleUsePrompt(p)}
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.target.style.background = 'var(--bg-hover)'; e.target.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.target.style.background = 'var(--bg-subtle)'; e.target.style.color = 'var(--text-secondary)'; }}
              >
                🔥 {p.judul}
              </button>
            ))}
          </div>
        )}

        <div className="chat-input-area">
          <textarea
            placeholder="Ketik pesan di sini... (Shift+Enter untuk baris baru)"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows="1"
          />
          <button className="btn-primary send-btn" onClick={sendMessage} disabled={!inputMessage.trim() || isTyping}>
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Brain Settings Modal */}
      {showSettings && createPortal(
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content glass-panel animate-fade-in" style={{ maxWidth: '540px' }}>
            <h3>🧠 Brain Settings</h3>

            {/* Memory Section */}
            <div style={{
              background: 'rgba(168,85,247,0.1)',
              border: '1px solid rgba(168,85,247,0.3)',
              borderRadius: '10px',
              padding: '14px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <BookOpen size={16} color="#a855f7" />
                <label style={{ color: '#a855f7', fontWeight: '600', fontSize: '13px' }}>
                  Memori Permanen (Disimpan di Cloud)
                </label>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '10px' }}>
                Tulis informasi tentang dirimu di sini. Bot akan selalu mengingat ini di setiap sesi chat manapun.
                Contoh: nama, jurusan, kebiasaan belajar, topik yang sering dibahas.
              </p>
              <textarea
                rows="4"
                value={userMemory}
                onChange={e => setUserMemory(e.target.value)}
                placeholder="Contoh: Nama saya [nama]. Saya mahasiswa jurusan [jurusan] di [universitas]. Saya sering membahas topik [topik]. Bahasa yang saya suka: santai dan langsung to the point..."
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(168,85,247,0.4)',
                  borderRadius: '8px',
                  padding: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  lineHeight: '1.6',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div className="form-group">
              <label>Judul Chat</label>
              <input
                type="text"
                value={sessionTitle}
                onChange={e => setSessionTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Konteks Khusus Sesi Ini (Opsional)</label>
              <textarea
                rows="3"
                value={systemPrompt}
                onChange={e => setSystemPrompt(e.target.value)}
                placeholder="Misal: Fokus sesi ini adalah membahas tugas algoritma..."
              />
            </div>

            <div className="modal-actions" style={{ justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn-secondary" onClick={() => setShowSettings(false)}>Batal</button>
              <button className="btn-primary" onClick={saveSettings}>
                {memorySaved ? '✓ Tersimpan!' : 'Simpan Semua'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && createPortal(
        <div className="modal-overlay" style={{ zIndex: 1200 }} onClick={cancelDelete}>
          <div
            className="modal-content glass-panel animate-fade-in"
            style={{ maxWidth: '380px', textAlign: 'center', padding: '32px 28px' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              width: '52px', height: '52px',
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.4)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Trash2 size={22} color="#ef4444" />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '17px' }}>Delete Chat History?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>
              Deleted chats cannot be recovered. Are you sure you want to continue?
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                className="btn-secondary"
                onClick={cancelDelete}
                style={{ flex: 1, maxWidth: '140px' }}
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  flex: 1, maxWidth: '140px',
                  padding: '10px 16px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  border: 'none', borderRadius: '8px',
                  color: '#fff', fontWeight: '600',
                  cursor: 'pointer', fontSize: '14px',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={e => e.target.style.opacity = '0.85'}
                onMouseLeave={e => e.target.style.opacity = '1'}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default BrainstormChat;
