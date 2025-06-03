import React, { useState } from 'react';

export default function LogSection({ logs }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{position:'fixed',bottom:30,right:30,zIndex:1000,background:'#3949ab',color:'#fff',border:'none',borderRadius:'50%',width:56,height:56,fontSize:28,boxShadow:'0 2px 12px #3949ab55',cursor:'pointer'}}
        title="Show Error Logs"
      >
        📝
      </button>
      {open && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(20,22,30,0.92)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#23272f',borderRadius:16,padding:'2.5rem 2rem',maxWidth:700,width:'90vw',maxHeight:'80vh',overflowY:'auto',boxShadow:'0 2px 32px #3949ab88',color:'#fff'}}>
            <h2 style={{marginBottom:24}}>Error Logs</h2>
            {logs.length === 0 ? (
              <div style={{color:'#b3c0ff'}}>No errors logged.</div>
            ) : (
              <ul style={{listStyle:'none',padding:0}}>
                {logs.map((log, i) => (
                  <li key={i} style={{marginBottom:18,paddingBottom:12,borderBottom:'1px solid #3949ab33'}}>
                    <div style={{fontWeight:700,color:'#ffb300'}}>{log.type} ({log.time})</div>
                    <div style={{marginTop:4,whiteSpace:'pre-wrap',wordBreak:'break-all'}}>{log.message}</div>
                    {log.details && <div style={{marginTop:4,fontSize:'0.98em',color:'#b3c0ff'}}>{log.details}</div>}
                  </li>
                ))}
              </ul>
            )}
            <button onClick={()=>setOpen(false)} style={{marginTop:24,background:'#3949ab',color:'#fff',border:'none',borderRadius:8,padding:'0.7rem 1.5rem',fontWeight:'bold',fontSize:'1.1rem',cursor:'pointer'}}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
