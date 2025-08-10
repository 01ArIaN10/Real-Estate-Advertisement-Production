import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1/real-estate'

// Cookie helper functions
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

const setCookie = (name, value, days = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function useToast() {
  const [msg, setMsg] = useState(null)
  const [statusCode, setStatusCode] = useState(null)
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => {
      setMsg(null)
      setStatusCode(null)
    }, 2400)
    return () => clearTimeout(t)
  }, [msg])
  return { 
    msg, 
    statusCode,
    show: (message, code = null) => {
      setMsg(message)
      setStatusCode(code)
    }
  }
}

const ownershipOptions = [
  { value: 'sale', label: 'Sale' },
  { value: 'rent', label: 'Rent' },
]
const propertyOptions = [
  { value: 'land', label: 'Land' },
  { value: 'office', label: 'Office' },
  { value: 'shop', label: 'Shop' },
  { value: 'villa', label: 'Villa' },
  { value: 'apartment', label: 'Apartment' },
]

const propertyTypeGroupOptions = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land', label: 'Land' },
]

export default function App(){
  const [themeLight, setThemeLight] = useState(() => {
    const saved = getCookie('theme');
    return saved === 'light';
  })
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [ownership, setOwnership] = useState('sale')
  const [propertyType, setPropertyType] = useState('apartment')
  const [openOwnership, setOpenOwnership] = useState(false)
  const [openProperty, setOpenProperty] = useState(false)
  const [openGroup, setOpenGroup] = useState(false)
  const [propertyGroup, setPropertyGroup] = useState('residential')
  const [previewItem, setPreviewItem] = useState(null)
  
  const toast = useToast()

  useEffect(() => {
    document.body.classList.toggle('light', themeLight)
    setCookie('theme', themeLight ? 'light' : 'dark')
  }, [themeLight])

  const allowedTypesForGroup = (group) => {
    if (group === 'land') return ['land']
    if (group === 'commercial') return ['office', 'shop']
    return ['villa', 'apartment']
  }

  useEffect(() => {
    const allowed = allowedTypesForGroup(propertyGroup)
    if (!allowed.includes(propertyType)) {
      setPropertyType(allowed[0])
    }
  }, [propertyGroup])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const res = await axios.get(API_BASE)
      setData(res.data)
    } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to load data'
      const statusCode = e?.response?.status
      toast.show(msg, statusCode)
    } finally { setLoading(false) }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  

  const [confirmDeleteId, setConfirmDeleteId] = useState(null)
  const handleDelete = async (id) => {
    setConfirmDeleteId(id)
  }
  const doConfirmDelete = async () => {
    if (!confirmDeleteId) return
    setLoading(true)
    try {
      await axios.delete(`${API_BASE}/${ownership}/${propertyType}/${confirmDeleteId}`)
      toast.show('Deleted successfully', 200)
      await fetchAll()
          } catch (e) {
        const msg = e?.response?.data?.message || 'Delete failed'
        const statusCode = e?.response?.status
        toast.show(msg, statusCode)
      } finally { setLoading(false); setConfirmDeleteId(null) }
  }

  const [form, setForm] = useState({
    // common
    address: '', email: '', area: '', ownerFullName: '',
    // sale
    fullPrice: '',
    // rent
    rentPrice: '', mortgagePrice: '',
    // specifics
    whatUse: '', roomCount: '', yardArea: '', floorCount: ''
  })

  const isSale = ownership === 'sale'

  const submitCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
      try {
      let payload
      const common = isSale
        ? { address: form.address, email: form.email, area: Number(form.area), fullPrice: Number(form.fullPrice), ownerFullName: form.ownerFullName }
        : { address: form.address, email: form.email, area: Number(form.area), rentPrice: Number(form.rentPrice), mortgagePrice: Number(form.mortgagePrice), ownerFullName: form.ownerFullName }
      switch (propertyType) {
        case 'land': payload = isSale
          ? { whatUse: form.whatUse, data: common }
          : { whatUse: form.whatUse, data: common }; break
        case 'office': payload = isSale
          ? { roomCount: Number(form.roomCount), data: common }
          : { roomCount: Number(form.roomCount), data: common }; break
        case 'villa': payload = isSale
          ? { yardArea: Number(form.yardArea), data: common }
          : { yardArea: Number(form.yardArea), data: common }; break
        case 'apartment': payload = isSale
          ? { floorCount: Number(form.floorCount), roomCount: Number(form.roomCount), data: common }
          : { floorCount: Number(form.floorCount), roomCount: Number(form.roomCount), data: common }; break
        default: break
      }

      const endpoint = isSale
        ? propertyType === 'land' ? '/sale/land'
          : propertyType === 'office' ? '/sale/commercial/office'
          : propertyType === 'shop' ? '/sale/commercial/shop'
          : propertyType === 'villa' ? '/sale/residential/villa'
          : '/sale/residential/apartment'
        : propertyType === 'land' ? '/rent/land'
          : propertyType === 'office' ? '/rent/commercial/office'
          : propertyType === 'shop' ? '/rent/commercial/shop'
          : propertyType === 'villa' ? '/rent/residential/villa'
          : '/rent/residential/apartment'

      await axios.post(`${API_BASE}${endpoint}`, payload)
      toast.show('Created successfully', 200)
      setForm({ address:'', email:'', area:'', ownerFullName:'', fullPrice:'', rentPrice:'', mortgagePrice:'', whatUse:'', roomCount:'', yardArea:'', floorCount:'' })
       await fetchAll()
    } catch (e) {
      const msg = e?.response?.data?.message || 'Create failed'
      const statusCode = e?.response?.status
      toast.show(msg, statusCode)
    } finally { setLoading(false) }
  }

  const listFor = (d, own, type) => {
    if (!d) return []
    if (own === 'sale') {
      if (type === 'land') return d.sale.land
      if (type === 'office') return d.sale.commercial.office
      if (type === 'shop') return d.sale.commercial.shop
      if (type === 'villa') return d.sale.residential.villa
      if (type === 'apartment') return d.sale.residential.apartment
    } else {
      if (type === 'land') return d.rent.land
      if (type === 'office') return d.rent.commercial.office
      if (type === 'shop') return d.rent.commercial.shop
      if (type === 'villa') return d.rent.residential.villa
      if (type === 'apartment') return d.rent.residential.apartment
    }
    return []
  }

  const currentList = useMemo(() => listFor(data, ownership, propertyType), [data, ownership, propertyType])

  const [page, setPage] = useState(0)
  const [size, setSize] = useState(5)
  const totalItems = currentList || []
  const paginated = totalItems.slice(page * size, page * size + size)

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ fontSize:18, fontWeight:800 }}>Real Estate Dashboard</div>
            <span className="badge">{loading ? 'Loading…' : 'Ready'}</span>
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
            <button className="btn btn-muted" onClick={fetchAll}>Refresh</button>
            <a className="btn btn-muted" href="/all">View All Ads</a>
          </div>
        </div>
        <div className="card-body">
          <div className="grid">
            <div className="col-12">
              <div className="toolbar" style={{ gap: 12 }}>
                <div className="select" onBlur={(e)=>{ if(!e.currentTarget.contains(e.relatedTarget)) setOpenOwnership(false) }} tabIndex={0}>
                  <div className="select-btn" onClick={()=>setOpenOwnership(v=>!v)}>
                    <span>Ownership:</span>
                    <b>{ownershipOptions.find(o=>o.value===ownership)?.label}</b>
                  </div>
                  {openOwnership && (
                    <div className="select-menu">
                      {ownershipOptions.map(o => (
                        <button key={o.value} className={`select-item ${ownership===o.value ? 'active':''}`} onClick={()=>{ setOwnership(o.value); setOpenOwnership(false) }}>
                          <span>{o.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="select" onBlur={(e)=>{ if(!e.currentTarget.contains(e.relatedTarget)) setOpenGroup(false) }} tabIndex={0}>
                  <div className="select-btn" onClick={()=>setOpenGroup(v=>!v)}>
                    <span>Property Type:</span>
                    <b>{propertyTypeGroupOptions.find(o=>o.value===propertyGroup)?.label}</b>
                  </div>
                  {openGroup && (
                    <div className="select-menu">
                      {propertyTypeGroupOptions.map(o => (
                        <button key={o.value} className={`select-item ${propertyGroup===o.value ? 'active':''}`} onClick={()=>{ setPropertyGroup(o.value); setOpenGroup(false); if(o.value==='land'){ setPropertyType('land') } else if(o.value==='commercial'){ setPropertyType('office') } else { setPropertyType('apartment') } }}>
                          <span>{o.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="select" onBlur={(e)=>{ if(!e.currentTarget.contains(e.relatedTarget)) setOpenProperty(false) }} tabIndex={0}>
                  <div className="select-btn" onClick={()=>setOpenProperty(v=>!v)}>
                    <span>Property:</span>
                    <b>{propertyOptions.find(o=>o.value===propertyType)?.label}</b>
                  </div>
                  {openProperty && (
                    <div className="select-menu">
                      {propertyOptions
                        .filter(o=> propertyGroup==='land' ? o.value==='land' : propertyGroup==='commercial' ? (o.value==='office'||o.value==='shop') : (o.value==='villa'||o.value==='apartment'))
                        .map(o => (
                          <button key={o.value} className={`select-item ${propertyType===o.value ? 'active':''}`} onClick={()=>{ setPropertyType(o.value); setOpenProperty(false) }}>
                            <span>{o.label}</span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                <div className="spacer" />
              </div>
            </div>

            {/* Create form */}
            <div className="col-12">
              <div className="card">
                <div className="card-header"><b>Add {ownership} / {propertyType}</b></div>
                <div className="card-body">
                  <form className="grid" onSubmit={submitCreate}>
                    <div className="col-4">
                      <label className="label">Owner Full Name</label>
                      <input className="input" value={form.ownerFullName} onChange={e=>setForm({...form, ownerFullName:e.target.value})} required />
                    </div>
                    <div className="col-4">
                      <label className="label">Email</label>
                      <input className="input" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required />
                    </div>
                    <div className="col-4">
                      <label className="label">Address</label>
                      <input className="input" value={form.address} onChange={e=>setForm({...form, address:e.target.value})} required />
                    </div>
                    <div className="col-4">
                      <label className="label">Area (m²)</label>
                      <input className="input" type="number" step="0.01" value={form.area} onChange={e=>setForm({...form, area:e.target.value})} required />
                    </div>

                    {isSale ? (
                      <div className="col-4">
                        <label className="label">Full Price</label>
                        <input className="input" type="number" step="0.01" value={form.fullPrice} onChange={e=>setForm({...form, fullPrice:e.target.value})} required />
                      </div>
                    ) : (
                      <>
                        <div className="col-4">
                          <label className="label">Rent Price</label>
                          <input className="input" type="number" step="0.01" value={form.rentPrice} onChange={e=>setForm({...form, rentPrice:e.target.value})} required />
                        </div>
                        <div className="col-4">
                          <label className="label">Mortgage Price</label>
                          <input className="input" type="number" step="0.01" value={form.mortgagePrice} onChange={e=>setForm({...form, mortgagePrice:e.target.value})} required />
                        </div>
                      </>
                    )}

                    {propertyType === 'land' && (
                      <div className="col-4">
                        <label className="label">Usage</label>
                        <div className="select" tabIndex={0}>
                          <div className="select-btn" onClick={()=>setForm({...form, openUsage: !form.openUsage})}>
                            <span>Type:</span>
                            <b>{(form.whatUse||'').toString() || 'Select...'}</b>
                          </div>
                          {form.openUsage && (
                            <div className="select-menu">
                              {['residential','commercial'].map(u => (
                                <button type="button" key={u} className={`select-item ${form.whatUse===u ? 'active':''}`} onClick={()=>setForm({...form, whatUse:u, openUsage:false})}>
                                  <span style={{ textTransform:'capitalize' }}>{u}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {propertyType === 'office' && (
                      <div className="col-4">
                        <label className="label">Room Count</label>
                        <input className="input" type="number" value={form.roomCount} onChange={e=>setForm({...form, roomCount:e.target.value})} required />
                      </div>
                    )}
                    {propertyType === 'villa' && (
                      <div className="col-4">
                        <label className="label">Yard Area</label>
                        <input className="input" type="number" step="0.01" value={form.yardArea} onChange={e=>setForm({...form, yardArea:e.target.value})} required />
                      </div>
                    )}
                    {propertyType === 'apartment' && (
                      <>
                        <div className="col-4">
                          <label className="label">Floor Count</label>
                          <input className="input" type="number" value={form.floorCount} onChange={e=>setForm({...form, floorCount:e.target.value})} required />
                        </div>
                        <div className="col-4">
                          <label className="label">Room Count</label>
                          <input className="input" type="number" value={form.roomCount} onChange={e=>setForm({...form, roomCount:e.target.value})} required />
                        </div>
                      </>
                    )}

                    <div className="col-12" style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                      <button type="submit" className="btn btn-muted">Create</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Lists */}
            <div className="col-12">
              <div className="card">
                <div className="card-header"><b>Current list</b> <span className="badge">{ownership} / {propertyType}</span></div>
                <div className="card-body list">
                  {paginated && paginated.length > 0 ? paginated.map((item) => (
                    <div className="list-item" key={item.id}>
                      <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                        <div style={{ fontWeight:700 }}>{item.data?.address}</div>
                        <div style={{ color:'var(--muted)', fontSize:13 }}>
                          <a href={`mailto:${item.data?.email}`} className="link">{item.data?.email}</a>
                           · {item.data?.area} m²
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <span className="badge">{item.id?.slice(0,8)}</span>
                        <button className="icon-btn" onClick={()=>setPreviewItem(item)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 12s4.5-7.5 10.5-7.5S22.5 12 22.5 12 18 19.5 12 19.5 1.5 12 1.5 12Z" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8"/></svg>
                          View
                        </button>
                        <button className="btn btn-danger" onClick={()=>handleDelete(item.id)}>Delete</button>
                      </div>
                    </div>
                  )) : <div style={{ color:'var(--muted)' }}>No items</div>}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop: 12 }}>
                    <div style={{ color:'var(--muted)' }}>Page {page + 1} · Size
                      <select className="input" style={{ width:90, marginLeft:8 }} value={size} onChange={e=>{ setPage(0); setSize(parseInt(e.target.value)||10) }}>
                        {[5,10,20,50].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="btn btn-muted" disabled={page===0} onClick={()=>setPage(p=>Math.max(0,p-1))}>Previous</button>
                      <button className="btn btn-muted" disabled={(page+1)*size >= totalItems.length} onClick={()=>setPage(p=>p+1)}>Next</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            

          </div>
        </div>
      </div>

      {toast.msg && (
        <div className="toast">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {(() => {
              const m = (toast.msg||'').toString().toLowerCase();
              const statusCode = toast.statusCode;
              
              // Show error icon for 400 status codes (client errors)
              if (statusCode >= 400 && statusCode < 500) {
                return (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--danger)' }} aria-hidden>
                    <path d="M12 2 1.8 20.2a1 1 0 0 0 .9 1.5h18.6a1 1 0 0 0 .9-1.5L12 2Z" stroke="currentColor" strokeWidth="1.6"/>
                    <path d="M12 8v6M12 17.5h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                )
              }
              
              // Show error icon for messages containing 'fail' or 'error'
              if (m.includes('fail') || m.includes('error')) {
                return (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--danger)' }} aria-hidden>
                    <path d="M12 2 1.8 20.2a1 1 0 0 0 .9 1.5h18.6a1 1 0 0 0 .9-1.5L12 2Z" stroke="currentColor" strokeWidth="1.6"/>
                    <path d="M12 8v6M12 17.5h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                )
              }
              
              // Show success icon for 200 status codes or messages containing 'success'
              if (statusCode === 200 || m.includes('success')) {
                return (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--success)' }} aria-hidden>
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                    <path d="m8.5 12.5 2.5 2.5 4.5-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )
              }
              
              // Default info icon
              return (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--accent)' }} aria-hidden>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M12 8.2v.01M12 11v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              )
            })()}
            <div>{toast.msg}</div>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="modal-backdrop" onClick={()=>setConfirmDeleteId(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <b>Confirm Delete</b>
            </div>
            <div className="modal-body">
              <div className="kv"><div className="k">Are you sure?</div><div className="v">This action cannot be undone.</div></div>
              <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                <button className="btn btn-muted" onClick={()=>setConfirmDeleteId(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={doConfirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewItem && (
        <div className="modal-backdrop" onClick={()=>setPreviewItem(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <b>Property Details</b>
              <button className="btn btn-muted" onClick={()=>setPreviewItem(null)}>Close</button>
            </div>
            <div className="modal-body">
              <div className="kv"><div className="k">ID</div><div className="v">{previewItem.id}</div></div>
              <div className="kv"><div className="k">Type</div><div className="v">{propertyType}</div></div>
              <div className="kv"><div className="k">Address</div><div className="v">{previewItem.data?.address}</div></div>
              <div className="kv"><div className="k">Owner</div><div className="v">{previewItem.data?.ownerFullName || '—'}</div></div>
              <div className="kv"><div className="k">Email</div><div className="v"><a className="link" href={`mailto:${previewItem.data?.email}`}>{previewItem.data?.email}</a></div></div>
              <div className="kv"><div className="k">Area</div><div className="v">{previewItem.data?.area} m²</div></div>
              {previewItem.data?.fullPrice !== undefined && (
                <div className="kv"><div className="k">Full Price</div><div className="v">{previewItem.data?.fullPrice}</div></div>
              )}
              {previewItem.data?.rentPrice !== undefined && (
                <div className="kv"><div className="k">Rent Price</div><div className="v">{previewItem.data?.rentPrice}</div></div>
              )}
              {previewItem.data?.mortgagePrice !== undefined && (
                <div className="kv"><div className="k">Mortgage</div><div className="v">{previewItem.data?.mortgagePrice}</div></div>
              )}
              {previewItem.whatUse && (
                <div className="kv"><div className="k">Usage</div><div className="v" style={{ textTransform:'capitalize' }}>{previewItem.whatUse}</div></div>
              )}
              {previewItem.roomCount !== undefined && (
                <div className="kv"><div className="k">Room Count</div><div className="v">{previewItem.roomCount}</div></div>
              )}
              {previewItem.yardArea !== undefined && (
                <div className="kv"><div className="k">Yard Area</div><div className="v">{previewItem.yardArea}</div></div>
              )}
              {previewItem.floorCount !== undefined && (
                <div className="kv"><div className="k">Floor Count</div><div className="v">{previewItem.floorCount}</div></div>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ textAlign:'center', color:'var(--muted)', marginTop: 20 }}>
        Developed By Arian
      </div>
    </div>
  )
}


