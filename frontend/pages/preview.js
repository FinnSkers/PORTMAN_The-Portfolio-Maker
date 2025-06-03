import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Preview() {
  const router = useRouter();
  const { name, email, phone, education, experience, skills } = router.query;
  return (
    <div>
      <Head>
        <title>PORTMAN: Website Preview</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main style={{maxWidth:900,margin:'2rem auto',background:'rgba(35,39,47,0.98)',borderRadius:'12px',boxShadow:'0 4px 32px #3949ab22',padding:'2.5rem 2rem',color:'#e3e6f0',fontFamily:'Roboto,Arial,sans-serif'}}>
        <section style={{textAlign:'center',marginBottom:'2rem'}}>
          <h1 style={{fontSize:'2.2rem',color:'#ffb300'}}>{name || 'Your Name'}</h1>
          <p style={{fontSize:'1.1rem',color:'#b3c0ff'}}><strong>Email:</strong> {email}</p>
          <p style={{fontSize:'1.1rem',color:'#b3c0ff'}}><strong>Phone:</strong> {phone}</p>
        </section>
        <section style={{marginBottom:'2rem'}}>
          <h2 style={{color:'#43e97b'}}>Education</h2>
          <p>{education}</p>
        </section>
        <section style={{marginBottom:'2rem'}}>
          <h2 style={{color:'#43e97b'}}>Experience</h2>
          <p>{experience}</p>
        </section>
        <section style={{marginBottom:'2rem'}}>
          <h2 style={{color:'#43e97b'}}>Skills</h2>
          <div style={{display:'flex',flexWrap:'wrap',gap:'0.7rem'}}>
            {(skills||'').split(/,|\n/).map((skill,i) => skill.trim() && <span key={i} style={{background:'#23272f',color:'#b3c0ff',padding:'0.5rem 1.1rem',borderRadius:'20px',fontWeight:500,boxShadow:'0 1px 4px #3949ab22'}}>{skill}</span>)}
          </div>
        </section>
        <div style={{textAlign:'center',marginTop:'2rem'}}>
          <button onClick={() => router.back()} style={{background:'linear-gradient(90deg,#ffb300 0%,#43e97b 100%)',color:'#222',fontWeight:'bold',border:'none',borderRadius:'12px',padding:'0.8rem 2rem',fontSize:'1.1rem',boxShadow:'0 2px 12px #3949ab22',cursor:'pointer'}}>Back to Edit</button>
        </div>
      </main>
    </div>
  );
}
