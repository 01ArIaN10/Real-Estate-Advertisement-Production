import React, { useEffect, useState } from 'react'

export default function Home(){
  const [loading, setLoading] = useState(true)
  const [themeLight, setThemeLight] = useState(() => document.body.classList.contains('light'))

  useEffect(() => {
    const t = setTimeout(()=> setLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('light', themeLight)
  }, [themeLight])

  const info = {
    message: 'Welcome to the Real Estate App',
    developedBy: 'Arian',
    officialName: 'Amirmohammad Parchami',
    studentNumber: '4030711313',
    description: 'This project was developed for the Persian Gulf University Java course.'
  }

  const syntaxHighlightJson = (obj) => {
    const json = JSON.stringify(obj, null, 2)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g,'&gt;')
      .replace(/("[^"]+"\s*:)/g, '<span class="json-key">$1</span>')
      .replace(/: \"([^\"]*)\"/g, ': <span class="json-string">"$1"</span>')
      .replace(/: (\d+(?:\.\d+)?)/g, ': <span class="json-number">$1</span>')
      .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>')
      .replace(/: null/g, ': <span class="json-null">null</span>')
    return json
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ fontSize:18, fontWeight:800 }}>Welcome</div>
            <span className="badge">Home</span>
          </div>
          <div className="toolbar">
            <div className="switch" title={themeLight ? 'Light theme' : 'Dark theme'}>
              <label style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
                {themeLight ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Light">
                    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.8"/>
                    <path d="M12 1.5v3M12 19.5v3M4.5 12h-3M22.5 12h-3M5.6 5.6l-2.1-2.1M20.5 20.5l-2.1-2.1M18.4 5.6l2.1-2.1M3.5 20.5l2.1-2.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Dark">
                    <path d="M21 12.8a8.5 8.5 0 1 1-9.8-9.3 7 7 0 0 0 9.1 9.1c.2.07.4.13.7.2Z" stroke="currentColor" strokeWidth="1.8"/>
                  </svg>
                )}
              </label>
              <input type="checkbox" checked={themeLight} onChange={e=>setThemeLight(e.target.checked)} aria-label="Toggle theme" />
            </div>
          </div>
        </div>
        <div className="card-body">
          {loading ? (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:120 }}>
              <div className="spinner" />
            </div>
          ) : (
            <div className="grid">
              <div className="col-12 fade-in-up">
                <pre className="code-block" dangerouslySetInnerHTML={{ __html: syntaxHighlightJson(info) }} />
              </div>
              <div className="col-12" style={{ display:'flex', gap:10, justifyContent:'center', marginTop:12 }}>
                <a href="/create" className="btn btn-muted">Create Ads</a>
                <a href="/api/" className="btn btn-primary float">Connect to the API</a>
                <a href="/all" className="btn btn-muted">View Ads</a>
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={{ textAlign:'center', color:'var(--muted)', marginTop: 20 }}>
        Developed By Arian
      </div>
    </div>
  )
}


