import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Moon, Sun, Terminal, Database,
  Cloud, MessageSquare, BrainCircuit, LayoutGrid, Copy, Check
} from 'lucide-react';
import UpMascot from '../components/UpMascot';
import {
  SiWhatsapp, SiTelegram, SiDiscord, SiSlack, SiSignal, SiApple,
  SiOpenai, SiSpotify, SiObsidian, SiX, SiGooglechrome, SiGmail, SiGithub,
  SiInstagram, SiTiktok, SiGoogledrive, SiFirebase, SiYoutube, SiFigma, SiNotion
} from 'react-icons/si';
import './Landing.css';

const Landing = ({ theme, toggleTheme }) => {
  const navigate = useNavigate();
  const [isMascotHovered, setIsMascotHovered] = useState(false);
  const [activeOS, setActiveOS] = useState('windows');
  const [activeTab, setActiveTab] = useState('oneliner');
  const [copied, setCopied] = useState(false);

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
    <div className="landing-container">
      <nav className="navbar">
        <div className="logo">
          <UpMascot size={28} />
          <span style={{ color: '#ff4a4a', fontWeight: 800 }}>UpPlanning</span>
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
          <h1 className="hero-title">UpPlanning</h1>
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
              { id: 'f1', icon: <LayoutGrid size={24} />, title: 'Content Calendar', desc: 'Plan, organize, and schedule your content ideas in an intuitive calendar view.' },
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
            {/* Row 1 — Messaging & AI (8 items) */}
            <div className="stack-row">
              <div className="stack-pill">
                <span className="pill-icon" style={{ color: '#25D366' }}><SiWhatsapp /></span> WhatsApp
              </div>
              <div className="stack-pill">
                <span className="pill-icon" style={{ color: '#2AABEE' }}><SiTelegram /></span> Telegram
              </div>
              <div className="stack-pill">
                <span className="pill-icon" style={{ color: '#5865F2' }}><SiDiscord /></span> Discord
              </div>
              <div className="stack-pill">
                <span className="pill-icon" style={{ color: '#E01E5A' }}><SiSlack /></span> Slack
              </div>
              <div className="stack-pill">
                <span className="pill-icon" style={{ color: '#34C759' }}><SiApple /></span> iMessage
              </div>
              <div className="stack-pill">
                <span className="pill-icon pill-claude-icon">A\</span> Claude
              </div>
              <div className="stack-pill">
                <span className="pill-icon" style={{ color: '#74AA9C' }}><SiOpenai /></span> ChatGPT
              </div>
            </div>
            {/* Row 2 — Social & Content (7 items) */}
            <div className="stack-row">
              <div className="stack-pill">
                <span className="pill-icon" style={{ color: '#E1306C' }}><SiInstagram /></span> Instagram
              </div>
              <div className="stack-pill pill-tiktok">
                <span className="pill-icon"><SiTiktok /></span> TikTok
              </div>
              <div className="stack-pill">
                <span className="pill-icon" style={{ color: '#FF0000' }}><SiYoutube /></span> YouTube
              </div>
              <div className="stack-pill pill-twitter">
                <span className="pill-icon"><SiX /></span> Twitter
              </div>
              <div className="stack-pill">
                <span className="pill-icon" style={{ color: '#EA4335' }}><SiGmail /></span> Gmail
              </div>
              <div className="stack-pill pill-github">
                <span className="pill-icon"><SiGithub /></span> GitHub
              </div>
              <div className="stack-pill">
                <span className="pill-icon" style={{ color: '#4285F4' }}><SiGoogledrive /></span> Google Drive
              </div>
            </div>
            {/* Row 3 — Productivity & Tools (7 items) */}
            <div className="stack-row">
              <div className="stack-pill">
                <span className="pill-icon" style={{ color: '#FFCA28' }}><SiFirebase /></span> Firebase
              </div>
              <div className="stack-pill">
                <span className="pill-icon" style={{ color: '#F24E1E' }}><SiFigma /></span> Figma
              </div>
              <div className="stack-pill pill-notion">
                <span className="pill-icon"><SiNotion /></span> Notion
              </div>
              <div className="stack-pill">
                <span className="pill-icon" style={{ color: '#1DB954' }}><SiSpotify /></span> Spotify
              </div>
              <div className="stack-pill">
                <span className="pill-icon pill-hue-icon">hue</span> Hue
              </div>
              <div className="stack-pill">
                <span className="pill-icon" style={{ color: '#7C3AED' }}><SiObsidian /></span> Obsidian
              </div>
              <div className="stack-pill">
                <span className="pill-icon" style={{ color: '#4285F4' }}><SiGooglechrome /></span> Browser
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Landing;
