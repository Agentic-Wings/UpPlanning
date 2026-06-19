import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Copy, Plus, Search, Tag, CheckCircle2, Trash2, Edit2, AlertTriangle } from 'lucide-react';
import './PromptHub.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const PromptHub = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [promptToDelete, setPromptToDelete] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data states
  const [prompts, setPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch prompts on mount
  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/prompts`);
      const data = await res.json();
      if (!res.ok) {
        console.error('API Error:', data);
        alert(`Gagal mengambil data prompt: ${data.error || 'Server error'}`);
        return;
      }
      
      if (Array.isArray(data)) {
        setPrompts(data);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
      alert(`Koneksi ke server gagal: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setNewTitle('');
    setNewCategory('');
    setNewContent('');
    setShowModal(true);
  };

  const handleOpenEdit = (prompt) => {
    setEditingId(prompt.id);
    setNewTitle(prompt.judul);
    setNewCategory(prompt.kategori);
    setNewContent(prompt.isiTeks);
    setShowModal(true);
  };

  const handleSavePrompt = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    
    setIsSaving(true);
    try {
      const url = editingId ? `${API_URL}/prompts/${editingId}` : `${API_URL}/prompts`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul: newTitle,
          kategori: newCategory,
          isiTeks: newContent
        })
      });
      
      if (res.ok) {
        setShowModal(false);
        setEditingId(null);
        setNewTitle('');
        setNewCategory('');
        setNewContent('');
        fetchPrompts(); // Refresh data
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Gagal menyimpan prompt: ${errorData.error || 'Terjadi kesalahan pada server'}`);
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
      alert(`Gagal terhubung ke server: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (id) => {
    setPromptToDelete(id);
  };

  const confirmDelete = async () => {
    if (!promptToDelete) return;
    try {
      const res = await fetch(`${API_URL}/prompts/${promptToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        setPromptToDelete(null);
        fetchPrompts();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Gagal menghapus prompt: ${errorData.error || 'Server error'}`);
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
      alert(`Koneksi ke server gagal: ${error.message}`);
    }
  };

  const filteredPrompts = prompts.filter(p => 
    (p.judul || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.kategori || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="prompt-hub">
      <div className="view-header">
        <div>
          <h1 className="view-title">Prompt Hub</h1>
          <p className="view-subtitle">Save, manage, and quickly copy your favorite AI prompts.</p>
        </div>
        <button className="btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} /> New Prompt
        </button>
      </div>

      <div className="toolbar glass-panel">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by title or category..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select className="filter-select">
            <option value="All">All Categories</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Loading prompts...
        </div>
      ) : (
        <div className="prompts-grid">
          {filteredPrompts.length === 0 ? (
            <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>No prompts found.</div>
          ) : (
            filteredPrompts.map(prompt => (
              <div key={prompt.id} className="prompt-card glass-panel">
                <div className="prompt-header">
                  <h3>{prompt.judul}</h3>
                  <div className="category-tag">
                    <Tag size={12} /> {prompt.kategori}
                  </div>
                </div>
                
                <div className="prompt-content" style={{ whiteSpace: 'pre-wrap' }}>
                  {prompt.isiTeks}
                </div>
                
                <div className="prompt-footer">
                  <span className="prompt-date">
                    Added {new Date(prompt.createdAt).toLocaleDateString('en-US')}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn-icon"
                      style={{ width: '30px', height: '30px', color: 'var(--text-secondary)', borderColor: 'transparent' }}
                      onClick={() => handleOpenEdit(prompt)}
                      title="Edit Prompt"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      className="btn-icon"
                      style={{ width: '30px', height: '30px', color: '#ff4a4a', borderColor: 'transparent' }}
                      onClick={() => handleDeleteClick(prompt.id)}
                      title="Delete Prompt"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button 
                      className={`btn-copy ${copiedId === prompt.id ? 'copied' : ''}`}
                      onClick={() => handleCopy(prompt.id, prompt.isiTeks)}
                      title="Copy to Clipboard"
                    >
                      {copiedId === prompt.id ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showModal && createPortal(
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content glass-panel animate-fade-in">
            <h3>{editingId ? 'Edit Prompt' : 'Add New Prompt'}</h3>
            
            <div className="form-group">
              <label>Prompt Title *</label>
              <input 
                type="text" 
                placeholder="Example: SEO Blog Intro" 
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Category / Tag</label>
              <input 
                type="text" 
                placeholder="Example: Copywriting" 
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Prompt Content *</label>
              <textarea 
                rows="6" 
                placeholder="Paste your prompt template here..."
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
              ></textarea>
            </div>
            
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(false)} disabled={isSaving}>Cancel</button>
              <button className="btn-primary" onClick={handleSavePrompt} disabled={isSaving || !newTitle || !newContent}>
                {isSaving ? 'Saving...' : 'Save Prompt'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {promptToDelete && createPortal(
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content glass-panel animate-fade-in" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <AlertTriangle size={48} color="#ff4a4a" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ marginBottom: '8px' }}>Confirm Delete</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Are you sure you want to delete this prompt? Deleted data cannot be recovered.
            </p>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={() => setPromptToDelete(null)}>Cancel</button>
              <button className="btn-primary" style={{ backgroundColor: '#ff4a4a', borderColor: '#ff4a4a' }} onClick={confirmDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PromptHub;
