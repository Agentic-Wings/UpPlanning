import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Save, Trash2, Eraser, PenTool, RefreshCcw, CheckCircle2, AlertTriangle } from 'lucide-react';
import './DrawingBoard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DrawingBoard = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [lineWidth, setLineWidth] = useState(3);
  const [mode, setMode] = useState('draw'); // draw, erase
  const [elements, setElements] = useState([]);
  const [currentPath, setCurrentPath] = useState(null);
  const [drawingId, setDrawingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  // Theme aware default color
  useEffect(() => {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    setColor(isDark ? '#ffffff' : '#0f172a');
  }, []);

  useEffect(() => {
    fetchDrawing();
  }, []);

  useEffect(() => {
    redrawCanvas();
  }, [elements, currentPath]);

  const fetchDrawing = async () => {
    try {
      const res = await fetch(`${API_URL}/drawings`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        // Load the most recent drawing
        setDrawingId(data[0].id);
        setElements(data[0].elements || []);
      }
    } catch (error) {
      console.error('Error fetching drawing:', error);
    }
  };

  const triggerActivity = () => {
    fetch(`${API_URL}/streaks/record`, { method: 'POST' }).catch(() => {});
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        title: 'My Canvas',
        elements: elements
      };
      
      const url = drawingId ? `${API_URL}/drawings/${drawingId}` : `${API_URL}/drawings`;
      const method = drawingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (res.ok) {
        if (!drawingId) setDrawingId(data.id);
        setSaveSuccess(true);
        triggerActivity();
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (error) {
      console.error('Error saving drawing:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw saved elements
    elements.forEach(element => {
      drawPath(ctx, element);
    });
    
    // Draw current path
    if (currentPath) {
      drawPath(ctx, currentPath);
    }
  };

  const drawPath = (ctx, pathObj) => {
    if (!pathObj.points || pathObj.points.length < 2) return;
    
    ctx.beginPath();
    ctx.strokeStyle = pathObj.color;
    ctx.lineWidth = pathObj.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (pathObj.mode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 20; // Thicker eraser
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }
    
    ctx.moveTo(pathObj.points[0].x, pathObj.points[0].y);
    for (let i = 1; i < pathObj.points.length; i++) {
      ctx.lineTo(pathObj.points[i].x, pathObj.points[i].y);
    }
    ctx.stroke();
    
    // Reset comp operation
    ctx.globalCompositeOperation = 'source-over';
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Scale coordinates if canvas style width != internal width
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const coords = getCoordinates(e);
    setCurrentPath({
      mode,
      color,
      width: lineWidth,
      points: [coords]
    });
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing || !currentPath) return;
    
    const coords = getCoordinates(e);
    setCurrentPath({
      ...currentPath,
      points: [...currentPath.points, coords]
    });
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPath && currentPath.points.length > 1) {
      setElements([...elements, currentPath]);
    }
    setCurrentPath(null);
  };

  const clearCanvas = () => {
    setShowClearConfirm(true);
  };

  const confirmClear = () => {
    setElements([]);
    setShowClearConfirm(false);
  };

  // Adjust canvas resolution based on container
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const parent = canvas.parentElement;
      // Set internal resolution higher for sharpness, but CSS keeps it responsive
      canvas.width = parent.clientWidth * 1.5;
      canvas.height = parent.clientHeight * 1.5;
      redrawCanvas();
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <div className="drawing-board-container">
      <div className="view-header">
        <div>
          <h1 className="view-title">Drawing Board</h1>
          <p className="view-subtitle">Sketch your ideas freely. Auto-saved as lightweight vectors.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={clearCanvas}>
            <Trash2 size={16} /> Clear
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
            {saveSuccess ? <><CheckCircle2 size={16} /> Saved!</> : <><Save size={16} /> {isSaving ? 'Saving...' : 'Save'}</>}
          </button>
        </div>
      </div>

      <div className="drawing-toolbar glass-panel">
        <div className="tools-group">
          <button 
            className={`tool-btn ${mode === 'draw' ? 'active' : ''}`} 
            onClick={() => setMode('draw')}
            title="Pen"
          >
            <PenTool size={18} />
          </button>
          <button 
            className={`tool-btn ${mode === 'erase' ? 'active' : ''}`} 
            onClick={() => setMode('erase')}
            title="Eraser"
          >
            <Eraser size={18} />
          </button>
        </div>
        
        <div className="divider"></div>
        
        <div className="tools-group">
          <input 
            type="color" 
            value={color} 
            onChange={(e) => { setColor(e.target.value); setMode('draw'); }} 
            className="color-picker"
            title="Brush Color"
          />
        </div>
        
        <div className="divider"></div>
        
        <div className="tools-group size-group">
          <label>Size:</label>
          <input 
            type="range" 
            min="1" 
            max="20" 
            value={lineWidth} 
            onChange={(e) => setLineWidth(parseInt(e.target.value))} 
            className="size-slider"
          />
        </div>
      </div>

      <div className="canvas-wrapper glass-panel">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      {showClearConfirm && createPortal(
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-content glass-panel animate-fade-in" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <AlertTriangle size={48} color="#ff4a4a" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ marginBottom: '8px' }}>Clear Canvas</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Are you sure you want to clear the entire canvas? This cannot be undone.
            </p>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={() => setShowClearConfirm(false)}>Cancel</button>
              <button className="btn-primary" style={{ backgroundColor: '#ff4a4a', borderColor: '#ff4a4a' }} onClick={confirmClear}>
                Yes, Clear
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default DrawingBoard;
