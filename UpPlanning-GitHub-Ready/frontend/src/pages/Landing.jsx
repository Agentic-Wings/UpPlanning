import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Moon, Sun, Terminal, Database,
  Cloud, MessageSquare, BrainCircuit, LayoutGrid, Copy, Check
} from 'lucide-react';
import UpMascot from '../components/UpMascot';

import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Landing.css';

gsap.registerPlugin(ScrollTrigger);

const Landing = ({ theme, toggleTheme }) => {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [isMascotHovered, setIsMascotHovered] = useState(false);
  const [activeOS, setActiveOS] = useState('windows');
  const [activeTab, setActiveTab] = useState('oneliner');
  const [copied, setCopied] = useState(false);
  
  const [typewriterText, setTypewriterText] = useState('');
  const fullText = "UpPlanning";

  useEffect(() => {
    let timeout;
    let isDeleting = false;
    let currentText = '';
    const typingSpeed = 150;
    const deletingSpeed = 100;
    const pauseTime = 2000;
    
    const type = () => {
      if (!isDeleting) {
        currentText = fullText.substring(0, currentText.length + 1);
        setTypewriterText(currentText);
        if (currentText === fullText) {
          isDeleting = true;
          timeout = setTimeout(type, pauseTime);
        } else {
          timeout = setTimeout(type, typingSpeed);
        }
      } else {
        currentText = fullText.substring(0, currentText.length - 1);
        setTypewriterText(currentText);
        if (currentText === '') {
          isDeleting = false;
          timeout = setTimeout(type, pauseTime);
        } else {
          timeout = setTimeout(type, deletingSpeed);
        }
      }
    };
    
    timeout = setTimeout(type, typingSpeed);
    return () => clearTimeout(timeout);
  }, []);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // Hero Animations
      gsap.from('.hero-title', { opacity: 0, y: 50, duration: 1, ease: 'power3.out' });
      gsap.from('.hero-subtitle', { opacity: 0, y: 30, duration: 1, delay: 0.2, ease: 'power3.out' });
      
      // Quick Start Terminal
      gsap.from('.quick-start-section', {
        scrollTrigger: {
          trigger: '.quick-start-section',
          start: 'top 85%',
        },
        opacity: 0,
        y: 50,
        duration: 0.8
      });

      // Feature Cards staggered
      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: '.features-grid',
          start: 'top 85%',
        },
        opacity: 0,
        y: 40,
        stagger: 0.1,
        duration: 0.8
      });

      // Ecosystem Pills staggered
      gsap.from('.stack-pill', {
        scrollTrigger: {
          trigger: '.ecosystem-stack',
          start: 'top 85%',
        },
        opacity: 0,
        scale: 0.8,
        stagger: 0.05,
        duration: 0.5,
        ease: 'back.out(1.7)'
      });
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  const terminalContent = {
    oneliner: {
      windows: 'powershell -c "irm https://get.upplanning.ai/install.ps1 | iex"',
      macos: 'curl -fsSL https://get.upplanning.ai/install.sh | bash',
    },
    npm: {
      windows: 'npm install -g upplanning && upplanning init',
      macos: 'npm install -g upplanning && upplanning init',
    },
  };

  const handleCopy = () => {
    const cmd = terminalContent[activeTab]?.[activeOS] ?? '';
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      ref={containerRef}
      className="landing-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <nav className="navbar">
        <div className="logo">
        </div>
        <div className="nav-actions">
          <button className="btn-secondary glow-btn-hover" onClick={() => navigate('/dashboard')}>
            Get Started
          </button>
          <button className="btn-icon glow-btn-hover" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="hero-section">
        <div className="hero-content">
          <div
            className="big-hero-icon"
            onMouseEnter={() => setIsMascotHovered(true)}
            onMouseLeave={() => setIsMascotHovered(false)}
          >
            <UpMascot size={120} className="no-shadow" />
          </div>
          <h1 className="hero-title">
            {typewriterText}
            <span className="typewriter-cursor">|</span>
          </h1>
          <div className="hero-tagline-wrapper">
            {isMascotHovered ? (
              <h2 className="hero-tagline-explore shake-animation">EXPLORE! EXPLORE!</h2>
            ) : (
              <h2 className="hero-tagline slide-up-animation">THE ULTIMATE PLANNING ECOSYSTEM.</h2>
            )}
          </div>
          <p className="hero-subtitle">
            Schedules content, syncs Google Drive assets, and automates AI prompts. <br />
            All from the ultimate workspace built for creators.
          </p>
        </div>

        {/* Quick Start Section */}
        <div className="quick-start-section">
          <h3 className="section-title"><span className="red-arrow">⟩</span> Quick Start</h3>
          <div className="terminal-box">
            <div className="terminal-header">
              {/* Window controls */}
              <div className="window-controls">
                <div className="dot red"></div>
                <div className="dot yellow"></div>
                <div className="dot green"></div>
              </div>

              {/* Tab switcher */}
              <div className="tabs">
                <span
                  className={`tab ${activeTab === 'oneliner' ? 'active' : ''}`}
                  onClick={() => setActiveTab('oneliner')}
                >One-liner</span>
                <span
                  className={`tab ${activeTab === 'npm' ? 'active' : ''}`}
                  onClick={() => setActiveTab('npm')}
                >npm</span>
              </div>

              {/* OS switcher + beta */}
              <div className="os-tags">
                <span
                  className={`os-tag ${activeOS === 'macos' ? 'active' : ''}`}
                  onClick={() => setActiveOS('macos')}
                >macOS &amp; Linux</span>
                <span
                  className={`os-tag ${activeOS === 'windows' ? 'active' : ''}`}
                  onClick={() => setActiveOS('windows')}
                >Windows</span>
              </div>
            </div>

            <div className="terminal-body">
              <p className="comment"># Welcome. Setup the ultimate planning ecosystem for your workspace 🤖</p>
              <div className="terminal-command-row">
                <p className="command">
                  <span className="prompt">$</span>
                  {' '}{terminalContent[activeTab]?.[activeOS]}
                </p>
                <button
                  className={`copy-btn ${copied ? 'copied' : ''}`}
                  onClick={handleCopy}
                  title="Copy to clipboard"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
          <p className="terminal-caption">
            Available on macOS, Linux, and Windows. The one-liner installs the local app core and everything else you need to start planning. <br /> Update later with upplanning update --channel stable.
          </p>
        </div>


        {/* Features Section */}
        <div className="features-section">
          <h3 className="section-title"><span className="red-arrow">⟩</span> Key Features</h3>
          <div className="features-grid">
            {[
              { id: 'f1', icon: <LayoutGrid size={24} />, title: 'Calendar Planning', desc: 'Plan, organize, and schedule your content ideas in an intuitive calendar view.' },
              { id: 'f2', icon: <Cloud size={24} />, title: 'Google Drive Sync', desc: 'Upload visual assets with drag-and-drop. Automatically synced to your Google Drive.' },
              { id: 'f3', icon: <Database size={24} />, title: 'Persistent Memory', desc: 'Firebase integration ensures your ideas and prompt metadata are safely stored and synced.' },
              { id: 'f4', icon: <MessageSquare size={24} />, title: 'Prompt Hub', desc: 'Organize your ChatGPT prompts with quick copy-to-clipboard functionality.' },
              { id: 'f5', icon: <Terminal size={24} />, title: 'Full System Access', desc: 'Lightweight and modifiable. Built with React and Vite for blazing fast performance.' },
              { id: 'f6', icon: <BrainCircuit size={24} />, title: 'AI-Ready', desc: 'Specifically designed to complement your generative AI workflow for social media.' },
            ].map(({ id, icon, title, desc }) => (
              <div key={id} className="feature-card">
                <div className="f-icon">{icon}</div>
                <h4>{title}</h4>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Integrations Section */}
        <div className="integrations-section">
          <h3 className="stack-title"><span className="red-arrow">{'⟩'}</span> Works With Your Apps</h3>
          <div className="stack-grid">
            {/* Row 1 — Messaging & Social (7 items) */}
            <div className="stack-row">
              <div className="stack-pill">
                <img src="https://svgl.app/library/whatsapp-icon.svg" className="svgl-logo" alt="WhatsApp" /> WhatsApp
              </div>
              <div className="stack-pill">
                <img src="https://svgl.app/library/telegram.svg" className="svgl-logo" alt="Telegram" /> Telegram
              </div>
              <div className="stack-pill">
                <img src="https://svgl.app/library/discord.svg" className="svgl-logo" alt="Discord" /> Discord
              </div>
              <div className="stack-pill">
                <img src="https://svgl.app/library/instagram-icon.svg" className="svgl-logo svgl-logo-lg" alt="Instagram" /> Instagram
              </div>
              <div className="stack-pill">
                <img src="https://svgl.app/library/tiktok-icon-light.svg" className="svgl-logo svgl-logo-lg" alt="TikTok" style={{ filter: theme === 'dark' ? 'invert(1)' : 'none' }} /> TikTok
              </div>
              <div className="stack-pill">
                <img src="https://svgl.app/library/gmail.svg" className="svgl-logo svgl-logo-lg" alt="Gmail" /> Gmail
              </div>
              <div className="stack-pill">
                <img src="https://svgl.app/library/chrome.svg" className="svgl-logo" alt="Chrome" /> Chrome
              </div>
            </div>
            
            {/* Row 2 — AI & Productivity (7 items) */}
            <div className="stack-row">
              <div className="stack-pill">
                <img src="https://svgl.app/library/anthropic_black.svg" className="svgl-logo" alt="Anthropic" style={{ filter: theme === 'dark' ? 'invert(1)' : 'none' }} /> Anthropic
              </div>
              <div className="stack-pill">
                <img src="https://svgl.app/library/gemini.svg" className="svgl-logo" alt="Gemini" /> Gemini
              </div>
              <div className="stack-pill">
                <img src="https://svgl.app/library/grok-light.svg" className="svgl-logo" alt="Grok" style={{ filter: theme === 'dark' ? 'invert(1)' : 'none' }} /> Grok
              </div>
              <div className="stack-pill">
                <img src="https://svgl.app/library/netlify.svg" className="svgl-logo" alt="Netlify" /> Netlify
              </div>
              <div className="stack-pill">
                <img src="https://svgl.app/library/github_light.svg" className="svgl-logo svgl-logo-lg" alt="GitHub" style={{ filter: theme === 'dark' ? 'invert(1)' : 'none' }} /> GitHub
              </div>
              <div className="stack-pill">
                <img src="https://svgl.app/library/openai.svg" className="svgl-logo" alt="ChatGPT" style={{ filter: theme === 'dark' ? 'invert(1)' : 'none' }} /> ChatGPT
              </div>
              <div className="stack-pill">
                <img src="https://svgl.app/library/deepseek.svg" className="svgl-logo" alt="DeepSeek" /> DeepSeek
              </div>
            </div>

            {/* Row 3 — Dev & Tools (6 items) */}
            <div className="stack-row">
              <div className="stack-pill">
                <img src="https://svgl.app/library/firebase.svg" className="svgl-logo" alt="Firebase" /> Firebase
              </div>
              <div className="stack-pill">
                <img src="https://svgl.app/library/figma.svg" className="svgl-logo" alt="Figma" /> Figma
              </div>
              <div className="stack-pill">
                <img src="https://svgl.app/library/notion.svg" className="svgl-logo" alt="Notion" /> Notion
              </div>
              <div className="stack-pill">
                <img src="https://svgl.app/library/vercel.svg" className="svgl-logo" alt="Vercel" style={{ filter: theme === 'dark' ? 'invert(1)' : 'none' }} /> Vercel
              </div>
              <div className="stack-pill">
                <img src="https://svgl.app/library/obsidian.svg" className="svgl-logo" alt="Obsidian" /> Obsidian
              </div>
              <div className="stack-pill">
                <img src="https://svgl.app/library/nextjs_icon_dark.svg" className="svgl-logo" alt="Next.js" style={{ filter: theme === 'dark' ? 'invert(1)' : 'none' }} /> Next.js
              </div>
            </div>
          </div>
        </div>

      </main>
    </motion.div>
  );
};

export default Landing;
