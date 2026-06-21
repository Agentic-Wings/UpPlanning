import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Eye, EyeOff, Brain, Zap, Laptop, Calendar, AlertCircle, ShieldCheck, Star, Command, ArrowLeft } from 'lucide-react';
import UpMascot from '../../components/UpMascot';
import './Login.css';

const TypewriterText = ({ texts }) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer;
    const currentFullText = texts[currentTextIndex];

    if (isDeleting) {
      if (displayText === '') {
        setIsDeleting(false);
        setCurrentTextIndex((prev) => (prev + 1) % texts.length);
      } else {
        timer = setTimeout(() => {
          setDisplayText(currentFullText.substring(0, displayText.length - 1));
        }, 40);
      }
    } else {
      if (displayText === currentFullText) {
        timer = setTimeout(() => setIsDeleting(true), 2000);
      } else {
        timer = setTimeout(() => {
          setDisplayText(currentFullText.substring(0, displayText.length + 1));
        }, 100);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentTextIndex, texts]);

  return (
    <div className="typewriter-text">
      {displayText}
      <span className="typewriter-cursor"></span>
    </div>
  );
};

const Login = () => {
  const [step, setStep] = useState(1);
  const [masterId, setMasterId] = useState('');
  const [password, setPassword] = useState('');
  const [answer, setAnswer] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [error, setError] = useState('');

  // Annoying Lockout System States
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Hardcoded Credentials as requested by user
  const CREDENTIALS = {
    MASTER_ID: '290307',
    PASSWORD: '120806',
    ANSWER: '2007'
  };

  useEffect(() => {
    let timer;
    if (lockoutTimeLeft > 0) {
      timer = setInterval(() => {
        setLockoutTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutTimeLeft]);

  const handleFailedAttempt = () => {
    const newFails = failedAttempts + 1;
    setFailedAttempts(newFails);
    
    if (newFails % 3 === 0) {
      const multiplier = Math.floor(newFails / 3) - 1;
      const timeoutSeconds = 30 + (multiplier * 15);
      setLockoutTimeLeft(timeoutSeconds);
      setError(`Too many failed attempts. Please wait ${timeoutSeconds} seconds.`);
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (lockoutTimeLeft > 0) return;

    if (masterId === CREDENTIALS.MASTER_ID && password === CREDENTIALS.PASSWORD) {
      setError('');
      setStep(2);
    } else {
      handleFailedAttempt();
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 15) return 'Good Afternoon';
    if (hour >= 15 && hour < 18) return 'Good Evening';
    return 'Good Night';
  };

  const handleStep2Submit = (e) => {
    e.preventDefault();
    if (lockoutTimeLeft > 0) return;

    if (answer === CREDENTIALS.ANSWER) {
      setError('');
      setFailedAttempts(0); // Reset on success
      setStep(3); // Show greeting overlay
      
      // Wait 3 seconds then navigate
      setTimeout(() => {
        login(rememberMe);
        navigate('/dashboard');
      }, 3000);
    } else {
      handleFailedAttempt();
    }
  };

  const handleBack = () => {
    if (step === 1) {
      navigate('/');
    } else if (step === 2) {
      setStep(1);
    }
  };

  if (step === 3) {
    return (
      <div className="login-container">
        <div className="greeting-overlay">
          <div className="greeting-icon-wrapper">
            <ShieldCheck size={60} color="var(--color-green)" style={{ filter: 'drop-shadow(0 0 10px rgba(46, 204, 113, 0.4))' }} />
          </div>
          <h1>{getGreeting()} Tuan Muda</h1>
          <p>Preparing your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      {/* Left Panel: Aesthetic Robot */}
      <div className="login-left">
        <div className="login-aesthetic-box">
          <div className="floating-icons">
            <div className="float-icon icon-1"><Lock size={20} /></div>
            <div className="float-icon icon-2"><Brain size={20} /></div>
            <div className="float-icon icon-3"><Zap size={20} /></div>
            <div className="float-icon icon-4"><Laptop size={20} /></div>
            <div className="float-icon icon-5"><Calendar size={20} /></div>
            <div className="float-icon icon-6"><Star size={20} /></div>
          </div>
          
          <div className="center-content">
            <div className="exclusive-badge">
              <Lock size={14} className="badge-icon" />
              <span>Exclusive Access</span>
            </div>
            
            <div className="robot-container">
              <div className="robot-glow"></div>
              <UpMascot size={150} style={{ zIndex: 1 }} />
            </div>
            
            <div className="login-greeting">
              <h2>UpPlanning</h2>
              <TypewriterText texts={[
                "Welcome back,",
                "System ready to access.",
                "Let's plan the future."
              ]} />
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="login-right">
        {step === 1 ? (
          <div className="login-form-container">
            <button className="back-btn" onClick={handleBack} disabled={lockoutTimeLeft > 0}>
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
            <h1>Login Access</h1>
            <p className="login-subtitle">Enter your exclusive credentials to continue.</p>
            
            <div className="progress-bar">
              <div className="dot active"></div>
              <div className="line"></div>
              <div className="dot inactive"></div>
            </div>

            <form onSubmit={handleStep1Submit} className="login-form" autoComplete="off">
              <div className="form-group">
                <label>MASTER ID</label>
                <div className="input-wrapper">
                  <input 
                    type="text" 
                    placeholder="Enter Master ID" 
                    value={masterId}
                    onChange={(e) => setMasterId(e.target.value)}
                    disabled={lockoutTimeLeft > 0}
                    autoComplete="off"
                    data-lpignore="true"
                    name="master-id-unique"
                  />
                  <span className="input-icon">#</span>
                </div>
              </div>

              <div className="form-group">
                <label>PASSWORD</label>
                <div className="input-wrapper">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={lockoutTimeLeft > 0}
                    autoComplete="off"
                    data-lpignore="true"
                    name="secret-key-unique"
                  />
                  <button 
                    type="button" 
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="checkbox-group">
                <input 
                  type="checkbox" 
                  id="remember" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={lockoutTimeLeft > 0}
                />
                <label htmlFor="remember">Remember me (do not ask for login again)</label>
              </div>

              <button 
                type="submit" 
                className={`submit-btn ${lockoutTimeLeft > 0 ? 'disabled' : ''}`}
                disabled={lockoutTimeLeft > 0 || !masterId || !password}
              >
                {lockoutTimeLeft > 0 ? `Locked (${lockoutTimeLeft}s)` : 'Verify Identity →'}
              </button>
            </form>
          </div>
        ) : (
          <div className="login-form-container">
            <button className="back-btn" onClick={handleBack} disabled={lockoutTimeLeft > 0}>
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
            <h1>Verification</h1>
            <p className="login-subtitle">One more step to access your workspace.</p>
            
            <div className="progress-bar">
              <div className="dot completed"></div>
              <div className="line completed"></div>
              <div className="dot active-red"></div>
            </div>

            <div className="trap-question-box">
              <span className="question-mark">?</span>
              <p>What year was the owner of UpPlanning born?</p>
            </div>

            <form onSubmit={handleStep2Submit} className="login-form" autoComplete="off">
              <div className="form-group">
                <label>YOUR ANSWER</label>
                <div className="input-wrapper">
                  <input 
                    type={showAnswer ? "text" : "password"} 
                    placeholder="Type answer..." 
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={lockoutTimeLeft > 0}
                    autoComplete="off"
                    data-lpignore="true"
                    name="trap-answer-unique"
                  />
                  <button 
                    type="button" 
                    className="toggle-password"
                    onClick={() => setShowAnswer(!showAnswer)}
                  >
                    {showAnswer ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button 
                type="submit" 
                className={`submit-btn final-btn ${lockoutTimeLeft > 0 ? 'disabled' : ''}`}
                disabled={lockoutTimeLeft > 0 || !answer}
              >
                {lockoutTimeLeft > 0 ? `Locked (${lockoutTimeLeft}s)` : 'Confirm Access'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
