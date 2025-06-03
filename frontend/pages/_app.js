import React, { useState, useCallback } from 'react';
import LogSection from '../components/LogSection';
import '../styles/globals.css';

function Layout({ children, logs, addLog }) {
  return (
    <div className="portman-root">
      <header className="portman-header">
        <div className="header-content">
          <span className="logo">PORTMAN</span>
          <nav>
            <a href="/" className="nav-link">Home</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#how" className="nav-link">How it Works</a>
            <a href="#faq" className="nav-link">FAQ</a>
            <a href="#contact" className="nav-link">Contact</a>
            <a href="#" className="nav-link" onClick={e=>{e.preventDefault();addLog({type:'Manual',message:'Manual log entry',time:new Date().toLocaleString()});}}>Test Log</a>
          </nav>
        </div>
      </header>
      <main className="portman-main">{children}</main>
      <footer className="portman-footer">
        <div className="footer-content">
          <div>
            <span className="logo">PORTMAN</span> &copy; {new Date().getFullYear()}<br/>
            <span style={{fontSize:'0.95em',color:'#b3c0ff'}}>The Portfolio Maker</span>
          </div>
          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#how">How it Works</a>
            <a href="#faq">FAQ</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer-social">
            <a href="https://github.com/" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="mailto:support@portman.com">Email</a>
          </div>
        </div>
      </footer>
      <LogSection logs={logs} />
    </div>
  );
}

function MyApp({ Component, pageProps }) {
  const [logs, setLogs] = useState([]);
  const addLog = useCallback((log) => {
    setLogs(lgs => [
      { ...log, time: log.time || new Date().toLocaleString() },
      ...lgs
    ]);
  }, []);
  return <Layout logs={logs} addLog={addLog}><Component {...pageProps} addLog={addLog} logs={logs} /></Layout>;
}

export default MyApp;
