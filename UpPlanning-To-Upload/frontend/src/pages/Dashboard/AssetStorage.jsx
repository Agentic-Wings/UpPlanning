import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { UploadCloud, FileImage, FolderOpen, CheckCircle2, AlertCircle, Trash2, AlertTriangle } from 'lucide-react';
import './AssetStorage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const GAS_URL = import.meta.env.VITE_GAS_URL || '';

const AssetStorage = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [category, setCategory] = useState('Poster Edukasi');
  const [notes, setNotes] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success' or 'error'
  
  // History
  const [uploadHistory, setUploadHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  
  // Deletion state
  const [historyToDelete, setHistoryToDelete] = useState(null);
  const [isDeletingHistory, setIsDeletingHistory] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/upload/metadata`);
      if (res.ok) {
        const data = await res.json();
        setUploadHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

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

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve({
      name: file.name,
      mimeType: file.type,
      base64: reader.result
    });
    reader.onerror = error => reject(error);
  });

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    if (!GAS_URL) {
      alert("VITE_GAS_URL belum dikonfigurasi di Frontend!");
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);
    let hasError = false;

    try {
      // 1. Convert files to Base64
      const base64Files = await Promise.all(selectedFiles.map(file => toBase64(file)));
      
      const payload = {
        kategori: category,
        files: base64Files
      };

      // 2. Upload to GAS
      const gasRes = await fetch(GAS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload)
      });
      
      const gasData = await gasRes.json();
      
      if (gasData.status === 'success') {
        // 3. Save metadata to Vercel Backend
        const metadataPayload = {
          kategori: category,
          catatan: notes,
          batchFolderId: gasData.batchFolderId,
          batchFolderName: gasData.batchFolderName,
          fileCount: selectedFiles.length,
          results: gasData.results
        };

        const backendRes = await fetch(`${API_URL}/upload/metadata`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(metadataPayload)
        });

        const backendData = await backendRes.json();

        try {
          const backendRes = await fetch(`${API_URL}/upload/metadata`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(metadataPayload)
          });

          if (!backendRes.ok) {
            const backendData = await backendRes.json();
            console.error('Metadata save failed:', backendData.error);
            hasError = true;
          }
        } catch (err) {
          console.error('Error saving metadata:', err);
          hasError = true;
        }
      } else {
        console.error('GAS Upload failed:', gasData.message);
        hasError = true;
      }

      setUploadStatus(hasError ? 'error' : 'success');
      if (!hasError) {
        setSelectedFiles([]);
        setNotes('');
      }
    } catch (err) {
      console.error('Global Error during upload:', err);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const confirmDeleteHistory = async () => {
    if (!historyToDelete) return;
    setIsDeletingHistory(true);
    
    try {
      // 1. Delete from Firebase via Vercel Backend
      const backendRes = await fetch(`${API_URL}/upload/metadata/${historyToDelete.id}`, {
        method: 'DELETE'
      });
      
      if (backendRes.ok) {
        // 2. Delete from Google Drive via GAS (send POST with action=delete)
        if (historyToDelete.driveFolderId && GAS_URL) {
          try {
            await fetch(GAS_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'text/plain;charset=utf-8',
              },
              body: JSON.stringify({
                action: 'delete',
                folderId: historyToDelete.driveFolderId
              })
            });
          } catch (gasErr) {
            console.error('GAS Delete Error:', gasErr);
            // Even if GAS fails (e.g., CORS opacity), if it sent the request, GAS might process it.
          }
        }
        
        // Refresh history
        setHistoryToDelete(null);
        fetchHistory();
      }
    } catch (error) {
      console.error('Error deleting history:', error);
    } finally {
      setIsDeletingHistory(false);
    }
  };

  return (
    <div className="asset-storage">
      <div className="view-header">
        <div>
          <h1 className="view-title">Storage</h1>
          <p className="view-subtitle">Upload and sync visual assets to Google Drive.</p>
        </div>
        <button className="btn-secondary" onClick={() => window.open('https://drive.google.com/drive/folders/1Wa0UXQHjcACO1soCD96IUOq61up_i4fN', '_blank')}>
          <FolderOpen size={18} /> Open Drive
        </button>
      </div>

      <div className="storage-content grid-2 glass-panel">
        <div className="upload-section">
          <h3>Upload New Assets</h3>
          
          <div 
            className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('hidden-file-input').click()}
          >
            <UploadCloud size={48} className="drop-icon" />
            <p className="drop-text">Drag and drop multiple files here, or click to browse</p>
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
                  {selectedFiles.length} files selected
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
                      title="Remove this file"
                    >×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="form-group mt-4">
            <label>Content Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="Poster Edukasi">Educational Poster</option>
              <option value="Feed">Feed</option>
              <option value="Carousel">Carousel</option>
              <option value="Reels">Reels</option>
              <option value="Stories">Stories</option>
            </select>
          </div>
          
          <div className="form-group mt-3">
            <label>Additional Notes (Metadata)</label>
            <textarea 
              rows="3" 
              placeholder="Add description, tags, or links..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            ></textarea>
          </div>
          
          {uploadStatus === 'success' && (
            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <CheckCircle2 size={16} /> All files successfully uploaded to Google Drive!
            </div>
          )}

          {uploadStatus === 'error' && (
            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <AlertCircle size={16} /> Failed to upload one or more files.
            </div>
          )}

          <button 
            className="btn-primary mt-4 w-100" 
            disabled={selectedFiles.length === 0 || isUploading}
            onClick={handleUpload}
          >
            {isUploading ? `Uploading (${selectedFiles.length} files)...` : `Sync ${selectedFiles.length > 0 ? selectedFiles.length : ''} Files to Google Drive`}
          </button>
        </div>
        
        <div className="recent-assets">
          <h3>Upload History</h3>
          {isLoadingHistory ? (
             <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '16px' }}>Loading history...</p>
          ) : uploadHistory.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '16px' }}>No files uploaded yet.</p>
          ) : (
            <div className="assets-list">
              {uploadHistory.map((item, idx) => {
                const date = new Date(item.createdAt).toLocaleDateString();
                const time = new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <div 
                    key={idx} 
                    className="asset-card" 
                    style={{ cursor: 'pointer', position: 'relative' }}
                    onClick={() => window.open(`https://drive.google.com/drive/folders/${item.driveFolderId}`, '_blank')}
                  >
                    <div className="asset-thumbnail">
                      <FileImage size={32} color="var(--text-secondary)" />
                    </div>
                    <div className="asset-info" style={{ paddingRight: '40px' }}>
                      <h4 style={{ wordBreak: 'break-all' }}>{item.folderName}</h4>
                      <span>{date} {time} • {item.kategori} • {item.fileCount} files</span>
                    </div>
                    <button 
                      className="btn-icon"
                      style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#ff4a4a', borderColor: 'transparent' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setHistoryToDelete(item);
                      }}
                      title="Delete from History and Google Drive"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Delete Modal */}
      {historyToDelete && createPortal(
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content glass-panel animate-fade-in" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <AlertTriangle size={48} color="#ff4a4a" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ color: '#ef4444', marginBottom: '16px' }}>Confirm Delete</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>
              Are you sure you want to delete <strong>"{historyToDelete.folderName}"</strong>? This will permanently remove the record from Firebase and move the folder to Trash in Google Drive.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={() => setHistoryToDelete(null)} disabled={isDeletingHistory}>Cancel</button>
              <button className="btn-danger" onClick={confirmDeleteHistory} disabled={isDeletingHistory}>
                {isDeletingHistory ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AssetStorage;
