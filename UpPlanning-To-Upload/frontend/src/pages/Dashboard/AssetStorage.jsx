import React, { useState } from 'react';
import { UploadCloud, FileImage, FolderOpen, CheckCircle2, AlertCircle } from 'lucide-react';
import './AssetStorage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AssetStorage = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [category, setCategory] = useState('Poster Edukasi');
  const [notes, setNotes] = useState('');
  
  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success' or 'error'
  
  // Recent uploads
  const [recentUploads, setRecentUploads] = useState([]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Append new files to existing selection
      setSelectedFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
      setUploadStatus(null);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      // Append new files to existing selection
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files)]);
      setUploadStatus(null);
    }
  };

  const handleRemoveFile = (indexToRemove, e) => {
    e.stopPropagation(); // Prevent triggering the hidden file input
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadStatus(null);
    let hasError = false;

    const formData = new FormData();
    formData.append('kategori', category);
    formData.append('catatan', notes);
    
    // Append all files to the same request under 'assetFiles'
    selectedFiles.forEach((file) => {
      formData.append('assetFiles', file);
    });

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        // Add to recent list locally
        setRecentUploads(prev => [
          {
            id: data.dbId || Math.random(),
            name: `${selectedFiles.length} file (${category})`,
            category: category,
            date: 'Baru saja'
          },
          ...prev
        ].slice(0, 5));
      } else {
        hasError = true;
        console.error('Upload failed:', data.error);
      }
    } catch (error) {
      hasError = true;
      console.error('Error during upload:', error);
    }

    if (!hasError) {
      setUploadStatus('success');
      setSelectedFiles([]); // Clear list on success
      setNotes('');
    } else {
      setUploadStatus('error');
    }
    
    setIsUploading(false);
  };

  return (
    <div className="asset-storage">
      <div className="view-header">
        <div>
          <h1 className="view-title">Storage</h1>
          <p className="view-subtitle">Unggah dan sinkronisasi aset visual ke Google Drive.</p>
        </div>
        <button className="btn-secondary" onClick={() => window.open('https://drive.google.com/drive/folders/1Wa0UXQHjcACO1soCD96IUOq61up_i4fN', '_blank')}>
          <FolderOpen size={18} /> Buka Drive
        </button>
      </div>

      <div className="storage-content grid-2 glass-panel">
        <div className="upload-section">
          <h3>Unggah Aset Baru</h3>
          
          <div 
            className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('hidden-file-input').click()}
          >
            <UploadCloud size={48} className="drop-icon" />
            <p className="drop-text">Seret file lebih dari satu ke sini, atau klik untuk memilih</p>
            <input 
              id="hidden-file-input"
              type="file" 
              multiple
              className="file-input" 
              onChange={handleChange} 
              accept="image/*,video/*"
              style={{ display: 'none' }}
            />
            
            {selectedFiles.length > 0 && (
              <div className="selected-files-list" style={{ marginTop: '16px', width: '100%', textAlign: 'left' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', textAlign: 'center' }}>
                  {selectedFiles.length} File terpilih
                </p>
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="selected-file" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <FileImage size={16} color="#ff4a4a" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span>
                    </div>
                    <button 
                      onClick={(e) => handleRemoveFile(idx, e)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '16px', padding: '0 4px' }}
                      title="Hapus file ini"
                    >×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="form-group mt-4">
            <label>Kategori Konten</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="Poster Edukasi">Poster Edukasi</option>
              <option value="Feed">Feed</option>
              <option value="Carousel">Carousel</option>
              <option value="Reels">Reels</option>
              <option value="Stories">Stories</option>
            </select>
          </div>
          
          <div className="form-group mt-3">
            <label>Catatan Tambahan (Metadata)</label>
            <textarea 
              rows="3" 
              placeholder="Tambahkan deskripsi, tag, atau tautan..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            ></textarea>
          </div>
          
          {uploadStatus === 'success' && (
            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <CheckCircle2 size={16} /> Semua file berhasil diunggah ke Google Drive!
            </div>
          )}

          {uploadStatus === 'error' && (
            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <AlertCircle size={16} /> Gagal mengunggah satu atau beberapa file.
            </div>
          )}

          <button 
            className="btn-primary mt-4 w-100" 
            disabled={selectedFiles.length === 0 || isUploading}
            onClick={handleUpload}
          >
            {isUploading ? `Mengunggah (${selectedFiles.length} file)...` : `Sinkronisasi ${selectedFiles.length > 0 ? selectedFiles.length : ''} File ke Google Drive`}
          </button>
        </div>
        
        <div className="recent-assets">
          <h3>Unggahan Terbaru Sesi Ini</h3>
          {recentUploads.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '16px' }}>Belum ada file yang diunggah.</p>
          ) : (
            <div className="assets-list">
              {recentUploads.map((item, idx) => (
                <div key={idx} className="asset-card">
                  <div className="asset-thumbnail">
                    <FileImage size={32} color="var(--text-secondary)" />
                  </div>
                  <div className="asset-info">
                    <h4 style={{ wordBreak: 'break-all' }}>{item.name}</h4>
                    <span>{item.date} • {item.category}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetStorage;
