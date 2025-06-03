import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import ServiceStatus from '../components/ServiceStatus';

export default function Home({ addLog }) {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [editData, setEditData] = useState(null);
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [authMode, setAuthMode] = useState('login');
  const [token, setToken] = useState('');
  const [comparison, setComparison] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const router = useRouter ? useRouter() : null;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploadStatus('Uploading...');
    const formData = new FormData();
    formData.append('cv', file);
    try {
      const res = await fetch('http://localhost:5000/api/upload-cv', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setUploadStatus(data);
      setEditData(data.advancedInfo);
      if (data.extractedText) {
        await handleAdvancedExtract(data.extractedText);
      }
    } catch (err) {
      setUploadStatus('Upload failed.');
      addLog && addLog({ type: 'Frontend', message: 'Upload failed', details: err.message });
    }
  };

  // New: Advanced NLP extraction (DeepSeek-R1)
  const handleAdvancedExtract = async (rawText) => {
    try {
      const res = await axios.post('http://localhost:5000/api/advanced-parse', { text: rawText });
      setEditData(res.data);
    } catch (err) {
      alert('Advanced extraction failed.');
      addLog && addLog({ type: 'Frontend', message: 'Advanced extraction failed', details: err.message });
    }
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handlePreview = (e) => {
    e.preventDefault();
    if (editData && router) {
      const params = new URLSearchParams(editData).toString();
      router.push(`/preview?${params}`);
    }
  };

  // Auth handlers
  const handleAuthChange = (e) => setAuthForm({ ...authForm, [e.target.name]: e.target.value });
  const handleAuth = async (e) => {
    e.preventDefault();
    const url = authMode === 'login' ? '/api/login' : '/api/register';
    try {
      const res = await axios.post(`http://localhost:5000${url}`, authForm);
      if (authMode === 'login') {
        setUser(res.data.user);
        setToken(res.data.token);
      } else {
        alert('Registration successful! Please log in.');
        setAuthMode('login');
      }
    } catch (err) {
      alert('Auth failed: ' + (err.response?.data?.error || err.message));
    }
  };

  // Compare CV with related professionals using backend
  const handleCompare = async () => {
    if (!editData) return;
    setIsComparing(true);
    setComparison(null);
    try {
      const res = await axios.post('http://localhost:6060/compare-cv', { cv_data: editData });
      setComparison(res.data);
      if (res.data && res.data.error) {
        addLog && addLog({ type: 'Backend', message: 'Comparison error', details: res.data.details || res.data.error });
      }
    } catch (err) {
      setComparison({ error: 'Comparison failed', details: err.message });
      addLog && addLog({ type: 'Backend', message: 'Comparison failed', details: err.message });
    }
    setIsComparing(false);
  };

  // Icon map for CV sections
const sectionIcons = {
  name: '👤',
  email: '✉️',
  phone: '📞',
  linkedin: '🔗',
  github: '🐙',
  website: '🌐',
  summary: '📝',
  education: '🎓',
  experience: '💼',
  skills: '🛠️',
  projects: '🚀',
  certifications: '📜',
  languages: '🌍'
};

function SectionCard({ icon, title, children }) {
  return (
    <div style={{background:'#23272f',borderRadius:10,padding:'1.2rem',marginBottom:'1.2rem',boxShadow:'0 2px 8px #3949ab22'}}>
      <div style={{display:'flex',alignItems:'center',marginBottom:8}}>
        <span style={{fontSize:'1.5rem',marginRight:10}}>{icon}</span>
        <span style={{fontWeight:700,fontSize:'1.15rem',color:'#b3c0ff'}}>{title}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function RenderCvData({ data }) {
  if (!data) return null;
  // Helper for empty fields
  const show = (val, fallback='Not provided') => {
    if (Array.isArray(val)) return val.length ? val : <span style={{color:'#b3c0ff'}}>{fallback}</span>;
    if (typeof val === 'object' && val !== null) return Object.keys(val).length ? val : <span style={{color:'#b3c0ff'}}>{fallback}</span>;
    return val && String(val).trim() ? val : <span style={{color:'#b3c0ff'}}>{fallback}</span>;
  };
  return (
    <>
      <SectionCard icon={sectionIcons.name} title="Name">{show(data.name)}</SectionCard>
      <SectionCard icon={sectionIcons.summary} title="Summary">{show(data.summary)}</SectionCard>
      <SectionCard icon={sectionIcons.email} title="Email">{show(data.email)}</SectionCard>
      <SectionCard icon={sectionIcons.phone} title="Phone">{show(data.phone)}</SectionCard>
      <SectionCard icon={sectionIcons.linkedin} title="LinkedIn">{show(data.linkedin)}</SectionCard>
      <SectionCard icon={sectionIcons.github} title="GitHub">{show(data.github)}</SectionCard>
      <SectionCard icon={sectionIcons.website} title="Website">{show(data.website)}</SectionCard>
      <SectionCard icon={sectionIcons.education} title="Education">
        {Array.isArray(data.education) && data.education.length ? (
          <ul style={{margin:0,paddingLeft:18}}>
            {data.education.map((ed,i) => (
              <li key={i} style={{marginBottom:6}}>
                <strong>{ed.degree || ''}</strong>{ed.field ? `, ${ed.field}` : ''} {ed.institution ? `@ ${ed.institution}` : ''} {ed.year ? `(${ed.year})` : ''} {ed.gpa ? `GPA: ${ed.gpa}` : ''}
              </li>
            ))}
          </ul>
        ) : show(data.education)}
      </SectionCard>
      <SectionCard icon={sectionIcons.experience} title="Experience">
        {Array.isArray(data.experience) && data.experience.length ? (
          <ul style={{margin:0,paddingLeft:18}}>
            {data.experience.map((ex,i) => (
              <li key={i} style={{marginBottom:6}}>
                <strong>{ex.title || ''}</strong>{ex.company ? ` @ ${ex.company}` : ''} {ex.duration ? `(${ex.duration})` : ''} {ex.location ? `- ${ex.location}` : ''}
                <div style={{fontSize:'0.98em',color:'#b3c0ff'}}>{ex.description}</div>
                {ex.technologies && ex.technologies.length ? <div style={{fontSize:'0.95em',color:'#ffb300'}}>Tech: {ex.technologies.join(', ')}</div> : null}
              </li>
            ))}
          </ul>
        ) : show(data.experience)}
      </SectionCard>
      <SectionCard icon={sectionIcons.skills} title="Skills">
        {data.skills && typeof data.skills === 'object' ? (
          <>
            <div><strong>Technical:</strong> {show(data.skills.technical)}</div>
            <div><strong>Soft:</strong> {show(data.skills.soft)}</div>
            <div><strong>Tools:</strong> {show(data.skills.tools)}</div>
          </>
        ) : show(data.skills)}
      </SectionCard>
      <SectionCard icon={sectionIcons.projects} title="Projects">
        {Array.isArray(data.projects) && data.projects.length ? (
          <ul style={{margin:0,paddingLeft:18}}>
            {data.projects.map((pr,i) => (
              <li key={i} style={{marginBottom:6}}>
                <strong>{pr.name || ''}</strong>{pr.link ? <> (<a href={pr.link} target="_blank" rel="noopener noreferrer" style={{color:'#ffb300'}}>{pr.link}</a>)</> : ''}
                <div style={{fontSize:'0.98em',color:'#b3c0ff'}}>{pr.description}</div>
                {pr.technologies && pr.technologies.length ? <div style={{fontSize:'0.95em',color:'#ffb300'}}>Tech: {pr.technologies.join(', ')}</div> : null}
              </li>
            ))}
          </ul>
        ) : show(data.projects)}
      </SectionCard>
      <SectionCard icon={sectionIcons.certifications} title="Certifications">{show(data.certifications)}</SectionCard>
      <SectionCard icon={sectionIcons.languages} title="Languages">
        {data.languages && typeof data.languages === 'object' ? (
          <>
            <div><strong>Programming:</strong> {show(data.languages.programming)}</div>
            <div><strong>Spoken:</strong> {show(data.languages.spoken)}</div>
          </>
        ) : show(data.languages)}
      </SectionCard>
    </>
  );
}

  // Add auth UI at the top
  return (
    <div>
      <Head>
        <title>PORTMAN: CV-to-Dynamic-Website Generator</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="portman-main">
        {!user ? (
          <section style={{marginBottom:'2rem',textAlign:'center',width:'100%'}}>
            <div style={{padding:'2.5rem 0 1.5rem 0'}}>
              <h1 style={{fontSize:'2.7rem',marginBottom:'0.7rem',color:'#ffb300',fontWeight:900,letterSpacing:2}}>PORTMAN</h1>
              <h2 style={{fontSize:'2rem',marginBottom:'1.2rem',color:'#b3c0ff'}}>CV-to-Dynamic-Website Generator</h2>
              <p style={{fontSize:'1.25rem',color:'#e3e6f0',marginBottom:'2.2rem',maxWidth:600,margin:'0 auto'}}>Transform your CV into a beautiful, dynamic website in minutes. AI-powered, modern, and fully customizable.</p>
            </div>
            <form onSubmit={handleAuth} style={{display:'grid',gap:'1rem',maxWidth:400,margin:'0 auto'}}>
              {authMode === 'register' && (
                <label>Name: <input name="name" value={authForm.name} onChange={handleAuthChange} /></label>
              )}
              <label>Email: <input name="email" value={authForm.email} onChange={handleAuthChange} /></label>
              <label>Password: <input type="password" name="password" value={authForm.password} onChange={handleAuthChange} /></label>
              <button type="submit">{authMode === 'login' ? 'Login' : 'Register'}</button>
            </form>
            <button onClick={()=>setAuthMode(authMode==='login'?'register':'login')} style={{marginTop:'1rem',background:'none',color:'#b3c0ff',border:'none',textDecoration:'underline',cursor:'pointer'}}>
              {authMode==='login'?'Need an account? Register':'Already have an account? Login'}
            </button>
            <div style={{marginTop: '3rem'}}>
              <ServiceStatus />
            </div>
          </section>
        ) : (
          <>
            <section style={{textAlign:'center',width:'100%'}}>
              <h1 style={{fontSize:'2.2rem',marginBottom:'1rem'}}>Hi, {user.name || user.email}!</h1>
              <p style={{fontSize:'1.1rem',color:'#b3c0ff',marginBottom:'2rem'}}>Upload your CV and generate a modern, dynamic website!</p>
              <form onSubmit={handleUpload} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'1rem',marginBottom:'2rem'}}>
                <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileChange} style={{maxWidth:300}} />
                <button type="submit">Upload CV</button>
              </form>
              <p>{typeof uploadStatus === 'string' ? uploadStatus : uploadStatus?.message}</p>
            </section>
            {/* Two-column extracted/comparison UI remains here */}
            {editData && (
              <div style={{marginTop: '2rem',background:'#23272f',borderRadius:'12px',padding:'2rem',boxShadow:'0 2px 12px #3949ab22',maxWidth:700,marginLeft:'auto',marginRight:'auto'}}>
                <h2 style={{marginBottom:'1.2rem'}}>Extracted Data</h2>
                
                {/* New two-column layout for extracted data and comparison */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'2rem'}}>
                  <div style={{borderRight:'1px solid #3949ab',paddingRight:'1rem'}}>
                    <RenderCvData data={editData} />
                  </div>
                  <div style={{paddingLeft:'1rem'}}>
                    <button onClick={handleCompare} style={{marginTop:'1.5rem',padding:'0.7rem 1.5rem',background:'#3949ab',color:'#fff',border:'none',borderRadius:'6px',fontWeight:'bold',fontSize:'1.1rem',cursor:'pointer'}}>Compare with Top Professionals</button>
                    {isComparing && <div style={{marginTop:'1rem',color:'#b3c0ff'}}>Comparing...</div>}
                    {comparison && (
                      <div style={{marginTop:'2rem',background:'#1a1d23',borderRadius:'8px',padding:'1.5rem',color:'#fff'}}>
                        <h3 style={{color:'#b3ffb3'}}>Comparison & Suggestions</h3>
                        {comparison.error ? (
                          <div style={{color:'salmon'}}>{comparison.error}: {comparison.details}</div>
                        ) : (
                          <>
                            {comparison.display_format && (
                              <div style={{marginBottom:'1rem',color:'#b3c0ff'}}><em>AI Display Suggestion: {comparison.display_format}</em></div>
                            )}
                            {comparison.comparison && <SmartJsonRenderer data={comparison.comparison} sectionTitle="Detailed Comparison" />}
                            {comparison.suggestions && <SmartJsonRenderer data={comparison.suggestions} sectionTitle="Suggestions" />}
                            {comparison.related_profiles && <SmartJsonRenderer data={comparison.related_profiles} sectionTitle="Related Profiles" />}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {/* Anchor sections for navigation */}
        <section id="features" style={{marginTop:'4rem',width:'100%'}}>
          <h2>Features</h2>
          <ul style={{fontSize:'1.1rem',lineHeight:1.7,maxWidth:700,margin:'0 auto',color:'#e3e6f0'}}>
            <li>AI-powered CV parsing and website generation</li>
            <li>PDF/DOCX/TXT upload, instant preview</li>
            <li>Comparison with top professionals in your field</li>
            <li>Personalized suggestions and improvement links</li>
            <li>Modern, responsive, and accessible design</li>
            <li>Secure user accounts and data storage</li>
          </ul>
        </section>
        <section id="how" style={{marginTop:'4rem',width:'100%'}}>
          <h2>How it Works</h2>
          <ol style={{fontSize:'1.1rem',lineHeight:1.7,maxWidth:700,margin:'0 auto',color:'#e3e6f0'}}>
            <li>Register or log in to your PORTMAN account</li>
            <li>Upload your CV (PDF, DOCX, or TXT)</li>
            <li>Review and edit the extracted data</li>
            <li>Compare your CV with top professionals</li>
            <li>Get actionable suggestions and links</li>
            <li>Generate and customize your personal website</li>
          </ol>
        </section>
        <section id="faq" style={{marginTop:'4rem',width:'100%'}}>
          <h2>FAQ</h2>
          <div style={{maxWidth:700,margin:'0 auto',color:'#e3e6f0',fontSize:'1.1rem'}}>
            <p><strong>Is my data secure?</strong> Yes, your data is encrypted and never shared.</p>
            <p><strong>Can I edit my website after generation?</strong> Absolutely! You can update your info anytime.</p>
            <p><strong>What file types are supported?</strong> PDF, DOCX, and TXT.</p>
            <p><strong>How is my CV compared?</strong> We use advanced AI and RAG to benchmark your CV against top professionals in your field.</p>
          </div>
        </section>
        <section id="contact" style={{marginTop:'4rem',width:'100%'}}>
          <h2>Contact</h2>
          <div style={{maxWidth:700,margin:'0 auto',color:'#e3e6f0',fontSize:'1.1rem'}}>
            <p>Email: <a href="mailto:support@portman.com" style={{color:'#ffb300'}}>support@portman.com</a></p>
            <p>GitHub: <a href="https://github.com/" target="_blank" rel="noopener noreferrer" style={{color:'#ffb300'}}>github.com/</a></p>
            <p>LinkedIn: <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" style={{color:'#ffb300'}}>linkedin.com/</a></p>
          </div>
        </section>
      </main>
    </div>
  );
}
