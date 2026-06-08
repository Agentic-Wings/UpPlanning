import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import './CalendarView.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date()); // Auto-sync to current month
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null); // Track the event being edited

  
  // Data states
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('Feed');
  const [newDescription, setNewDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/calendar-events`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDayClick = (day) => {
    if (day) {
      setSelectedDate(day);
      setEditingEvent(null);
      setShowConfirmDelete(false);
      
      // Reset form
      setNewTitle('');
      setNewDescription('');
      setNewType('Feed');
      
      setShowModal(true);
    }
  };

  const handleEventClick = (e, evt, day) => {
    e.stopPropagation(); // Prevent triggering handleDayClick
    setSelectedDate(day);
    setEditingEvent(evt);
    setShowConfirmDelete(false);
    
    // Populate form
    setNewTitle(evt.judul || '');
    setNewDescription(evt.deskripsi || '');
    setNewType(evt.label || 'Feed');
    
    setShowModal(true);
  };


  const handleSaveEvent = async () => {
    if (!newTitle.trim() || !selectedDate) return;
    
    setIsSaving(true);
    try {
      // Build date string YYYY-MM-DD
      const year = currentDate.getFullYear();
      // Month is 0-indexed in JS
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate).padStart(2, '0');
      
      // If editingEvent has its own date logic or if we just use the selectedDate
      // For editing, we might want to allow moving the date, but currently the form doesn't have a date picker.
      // So it will save it to the selectedDate (which was the day it was clicked on).
      let dateString = `${year}-${month}-${day}`;
      
      if (editingEvent && editingEvent.tanggal) {
          // Keep the original date string year and month if we want, or allow it to move
          // If the user wants to change date, they can do so by recreating, but let's stick to the current date they clicked.
          // Or we can use a date picker, but to keep it simple we use the existing structure.
          dateString = `${year}-${month}-${day}`; 
      }

      const payload = {
        tanggal: dateString,
        judul: newTitle,
        deskripsi: newDescription,
        label: newType
      };

      const url = editingEvent 
        ? `${API_URL}/calendar-events/${editingEvent.id}` 
        : `${API_URL}/calendar-events`;
        
      const method = editingEvent ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setShowModal(false);
        setNewTitle('');
        setNewDescription('');
        setNewType('Feed');
        setEditingEvent(null);
        fetchEvents(); // Refresh data
      }
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!editingEvent) return;
    
    try {
      const res = await fetch(`${API_URL}/calendar-events/${editingEvent.id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        setShowConfirmDelete(false);
        setShowModal(false);
        setEditingEvent(null);
        fetchEvents(); // Refresh data
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = String(day).padStart(2, '0');
      const targetDate = `${year}-${month}-${dayStr}`;
      
      // Filter events matching YYYY-MM-DD format
      const dayEvents = events.filter(e => {
        // e.tanggal format should be YYYY-MM-DD
        return e.tanggal === targetDate;
      });
      
      days.push(
        <div 
          key={day} 
          className="calendar-day glass-panel" 
          onClick={() => handleDayClick(day)}
        >
          <span className="day-number">{day}</span>
          <div className="events-container">
            {dayEvents.map(evt => (
              <div 
                key={evt.id} 
                className={`event-badge type-${(evt.label || 'feed').toLowerCase()}`} 
                title={evt.deskripsi}
                onClick={(e) => handleEventClick(e, evt, day)}
              >
                {evt.judul}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="calendar-view">
      <div className="view-header">
        <div>
          <h1 className="view-title">Kalender Konten</h1>
          <p className="view-subtitle">Rencanakan dan atur konten Anda yang akan datang.</p>
        </div>
        <button className="btn-primary" onClick={() => { setSelectedDate(new Date().getDate()); setShowModal(true); }}>
          <Plus size={18} /> Tambah Ide
        </button>
      </div>

      <div className="calendar-container glass-panel">
        <div className="calendar-header">
          <button className="btn-icon" onClick={handlePrevMonth}>
            <ChevronLeft size={20} />
          </button>
          <h2 className="current-month">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            {isLoading && <span style={{fontSize: '12px', marginLeft: '10px', color: 'var(--text-secondary)'}}>Syncing...</span>}
          </h2>
          <button className="btn-icon" onClick={handleNextMonth}>
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="calendar-grid">
          {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
            <div key={day} className="weekday-header">{day}</div>
          ))}
          {renderDays()}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animate-fade-in">
            <h3>
              {editingEvent 
                ? 'Edit Jadwal Konten' 
                : (selectedDate ? `Tambah Ide untuk ${selectedDate} ${monthNames[currentDate.getMonth()]}` : 'Tambah Ide Baru')}
            </h3>
            
            {editingEvent && (
              <div className="form-group">
                <label>Tanggal</label>
                <input 
                  type="date" 
                  value={`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`}
                  onChange={(e) => {
                    const dateParts = e.target.value.split('-');
                    if (dateParts.length === 3) {
                      const newDay = parseInt(dateParts[2], 10);
                      const newMonth = parseInt(dateParts[1], 10) - 1;
                      const newYear = parseInt(dateParts[0], 10);
                      
                      // If month or year changes, update currentDate. Otherwise just selectedDate
                      if (newMonth !== currentDate.getMonth() || newYear !== currentDate.getFullYear()) {
                         setCurrentDate(new Date(newYear, newMonth));
                      }
                      setSelectedDate(newDay);
                    }
                  }}
                />
              </div>
            )}
            
            <div className="form-group">
              <label>Judul Ide *</label>
              <input 
                type="text" 
                placeholder="Contoh: Tools AI untuk Produktivitas" 
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Jenis Konten</label>
              <select value={newType} onChange={e => setNewType(e.target.value)}>
                <option value="Poster Edukasi">Poster Edukasi</option>
                <option value="Feed">Feed</option>
                <option value="Carousel">Carousel</option>
                <option value="Reels">Reels</option>
                <option value="Stories">Stories</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Deskripsi</label>
              <textarea 
                rows="4" 
                placeholder="Penjelasan singkat tentang konten..."
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
              ></textarea>
            </div>
            
            <div className="modal-actions" style={{ justifyContent: editingEvent ? 'space-between' : 'flex-end' }}>
              {editingEvent && (
                <button className="btn-danger" onClick={() => setShowConfirmDelete(true)} disabled={isSaving}>
                  Hapus
                </button>
              )}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-secondary" onClick={() => setShowModal(false)} disabled={isSaving}>Batal</button>
                <button className="btn-primary" onClick={handleSaveEvent} disabled={isSaving || !newTitle}>
                  {isSaving ? 'Menyimpan...' : (editingEvent ? 'Simpan Perubahan' : 'Simpan Ide')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Delete Modal */}
      {showConfirmDelete && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content glass-panel animate-fade-in" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <h3 style={{ color: '#ef4444', marginBottom: '16px' }}>Konfirmasi Hapus</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>
              Apakah Anda yakin ingin menghapus jadwal <strong>"{editingEvent?.judul}"</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={() => setShowConfirmDelete(false)}>Batal</button>
              <button className="btn-danger" onClick={handleDeleteEvent}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
