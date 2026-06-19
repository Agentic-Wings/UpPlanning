import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Calendar as CalendarIcon, Clock, CheckCircle2, PlayCircle, AlertCircle } from 'lucide-react';
import './TasksView.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TasksView = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  // Form States
  const [editingTask, setEditingTask] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newStatus, setNewStatus] = useState('todo'); // todo, in_progress, done

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/tasks`);
      const data = await res.json();
      if (!res.ok) {
        alert(`Gagal mengambil data tugas: ${data.error || 'Server error'}`);
        return;
      }
      if (Array.isArray(data)) {
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      alert(`Koneksi ke server gagal: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddTaskModal = (status = 'todo') => {
    setEditingTask(null);
    setNewTitle('');
    setNewDescription('');
    setNewDeadline('');
    setNewStatus(status);
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setNewTitle(task.title || '');
    setNewDescription(task.description || '');
    setNewDeadline(task.deadline || '');
    setNewStatus(task.status || 'todo');
    setShowModal(true);
  };

  const handleSaveTask = async () => {
    if (!newTitle.trim()) return;
    setIsSaving(true);
    
    const payload = {
      title: newTitle,
      description: newDescription,
      deadline: newDeadline,
      status: newStatus
    };

    try {
      const url = editingTask 
        ? `${API_URL}/tasks/${editingTask.id}` 
        : `${API_URL}/tasks`;
      const method = editingTask ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowModal(false);
        fetchTasks();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Gagal menyimpan tugas: ${errorData.error || 'Terjadi kesalahan pada server'}`);
      }
    } catch (error) {
      console.error('Error saving task:', error);
      alert(`Gagal terhubung ke server: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!editingTask) return;
    try {
      const res = await fetch(`${API_URL}/tasks/${editingTask.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setShowConfirmDelete(false);
        setShowModal(false);
        fetchTasks();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Gagal menghapus tugas: ${errorData.error || 'Server error'}`);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert(`Gagal terhubung ke server: ${error.message}`);
    }
  };

  const changeTaskStatus = async (task, newStatus) => {
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
      
      const res = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, status: newStatus })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(`Gagal mengubah status: ${errorData.error || 'Server error'}`);
        fetchTasks(); // Revert on failure
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert(`Koneksi ke server gagal: ${error.message}`);
      fetchTasks(); // Revert on failure
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const renderTaskCards = (status) => {
    const filteredTasks = tasks.filter(t => t.status === status);
    
    if (filteredTasks.length === 0) {
      return (
        <div className="empty-column-state">
          <p>No tasks here.</p>
        </div>
      );
    }

    return filteredTasks.map(task => (
      <div key={task.id} className="task-card glass-panel">
        <div className="task-card-header">
          <h4 onClick={() => openEditModal(task)}>{task.title}</h4>
        </div>
        
        {task.description && (
          <p className="task-desc">{task.description}</p>
        )}
        
        {task.deadline && (
          <div className="task-deadline">
            <Clock size={14} /> 
            <span className={new Date(task.deadline) < new Date() && status !== 'done' ? 'overdue' : ''}>
              {formatDate(task.deadline)}
            </span>
          </div>
        )}
        
        <div className="task-card-footer">
          <div className="task-actions">
            {status !== 'todo' && (
               <button className="status-btn back" onClick={(e) => { e.stopPropagation(); changeTaskStatus(task, status === 'done' ? 'in_progress' : 'todo'); }}>
                 &larr;
               </button>
            )}
            
            <div style={{flex: 1}}></div>
            
            {status !== 'done' && (
               <button className="status-btn forward" onClick={(e) => { e.stopPropagation(); changeTaskStatus(task, status === 'todo' ? 'in_progress' : 'done'); }}>
                 {status === 'todo' ? 'Start' : 'Complete'} &rarr;
               </button>
            )}
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="tasks-view">
      <div className="view-header">
        <div>
          <h1 className="view-title">Assignment Board</h1>
          <p className="view-subtitle">Organize your assignments and track your progress.</p>
        </div>
        <button className="btn-primary" onClick={() => openAddTaskModal('todo')}>
          <Plus size={18} /> Add Task
        </button>
      </div>

      {isLoading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading tasks...</p>
      ) : (
        <div className="kanban-board">
          {/* Column: To-Do */}
          <div className="kanban-column">
            <div className="column-header">
              <div className="column-title">
                <AlertCircle size={18} color="#f39c12" />
                <h3>To-Do</h3>
                <span className="task-count">{tasks.filter(t => t.status === 'todo').length}</span>
              </div>
              <button className="btn-icon-small" onClick={() => openAddTaskModal('todo')}>
                <Plus size={16} />
              </button>
            </div>
            <div className="column-content">
              {renderTaskCards('todo')}
            </div>
          </div>

          {/* Column: In Progress */}
          <div className="kanban-column">
            <div className="column-header">
              <div className="column-title">
                <PlayCircle size={18} color="#3498db" />
                <h3>In Progress</h3>
                <span className="task-count">{tasks.filter(t => t.status === 'in_progress').length}</span>
              </div>
              <button className="btn-icon-small" onClick={() => openAddTaskModal('in_progress')}>
                <Plus size={16} />
              </button>
            </div>
            <div className="column-content">
              {renderTaskCards('in_progress')}
            </div>
          </div>

          {/* Column: Done */}
          <div className="kanban-column">
            <div className="column-header">
              <div className="column-title">
                <CheckCircle2 size={18} color="#2ecc71" />
                <h3>Done</h3>
                <span className="task-count">{tasks.filter(t => t.status === 'done').length}</span>
              </div>
              <button className="btn-icon-small" onClick={() => openAddTaskModal('done')}>
                <Plus size={16} />
              </button>
            </div>
            <div className="column-content">
              {renderTaskCards('done')}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Task Modal */}
      {showModal && createPortal(
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content glass-panel animate-fade-in" style={{ maxWidth: '500px' }}>
            <h3>{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
            
            <div className="form-group">
              <label>Nama Tugas / Assignment Name *</label>
              <input 
                type="text" 
                placeholder="Example: Makalah PBO Bab 1" 
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Deskripsi (Opsional)</label>
              <textarea 
                rows="3" 
                placeholder="Detail tugas atau catatan kecil..."
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>Deadline / Tenggat Waktu (Opsional)</label>
              <input 
                type="date" 
                value={newDeadline}
                onChange={e => setNewDeadline(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                <option value="todo">To-Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            
            <div className="modal-actions" style={{ justifyContent: editingTask ? 'space-between' : 'flex-end', marginTop: '24px' }}>
              {editingTask && (
                <button className="btn-danger" onClick={() => setShowConfirmDelete(true)} disabled={isSaving}>
                  <Trash2 size={16} style={{marginRight: '6px'}} /> Delete
                </button>
              )}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-secondary" onClick={() => setShowModal(false)} disabled={isSaving}>Cancel</button>
                <button className="btn-primary" onClick={handleSaveTask} disabled={isSaving || !newTitle.trim()}>
                  {isSaving ? 'Saving...' : 'Save Task'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Confirm Delete Modal */}
      {showConfirmDelete && createPortal(
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content glass-panel animate-fade-in" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <h3 style={{ color: '#ef4444', marginBottom: '16px' }}>Confirm Delete</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>
              Apakah Anda yakin ingin menghapus tugas <strong>"{editingTask?.title}"</strong>? Data ini akan terhapus secara permanen.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={() => setShowConfirmDelete(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleDeleteTask}>Yes, Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TasksView;
