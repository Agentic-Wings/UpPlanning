import React, { useEffect, useRef } from 'react';
import './StarBackground.css';

const StarBackground = ({ theme }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear existing stars
    container.innerHTML = '';

    const numStars = 100;
    
    for (let i = 0; i < numStars; i++) {
      const star = document.createElement('div');
      star.classList.add('star');
      
      // Random position
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      
      // Random size
      const size = Math.random() * 2 + 1;
      
      // Random animation delay and duration
      const delay = Math.random() * 5;
      const duration = Math.random() * 3 + 2;
      
      star.style.left = `${x}vw`;
      star.style.top = `${y}vh`;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.animationDelay = `${delay}s`;
      star.style.animationDuration = `${duration}s`;
      
      // Adapt color based on theme
      if (theme === 'light') {
        star.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
      } else {
        star.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        
        // Add some random colored stars (like the reference image)
        const randomColor = Math.random();
        if (randomColor > 0.9) {
          star.style.backgroundColor = '#ff4a4a';
          star.style.boxShadow = '0 0 4px #ff4a4a';
        } else if (randomColor > 0.8) {
          star.style.backgroundColor = '#00d2ff';
          star.style.boxShadow = '0 0 4px #00d2ff';
        }
      }
      
      container.appendChild(star);
    }
  }, [theme]);

  return <div className="star-bg" ref={containerRef}></div>;
};

export default StarBackground;
