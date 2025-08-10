import React, { useEffect, useState } from 'react'
import Slider from '@mui/material/Slider'
import axios from 'axios'
import { Link } from 'react-router-dom'

// Toast hook
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

export default function AllAds(){
  const [themeLight, setThemeLight] = useState(() => {
    const saved = getCookie('theme');
    return saved === 'light';
  })
  const toast = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [previewItem, setPreviewItem] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null) // {own,type,id}
  const [searchResults, setSearchResults] = useState([])
  const [showSearch, setShowSearch] = useState(false)
  const [ownership, setOwnership] = useState('sale')
  const [propertyType, setPropertyType] = useState('apartment')
  const [propertyGroup, setPropertyGroup] = useState('residential')
  const [openOwnership, setOpenOwnership] = useState(false)
  const [openProperty, setOpenProperty] = useState(false)
  const [openGroup, setOpenGroup] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [filterResults, setFilterResults] = useState([])
  const [showFilterResults, setShowFilterResults] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
    minRoomCount: '',
    maxRoomCount: '',
    minYardArea: '',
    maxYardArea: '',
    minFloorCount: '',
    maxFloorCount: '',
    minMortgagePrice: '',
    maxMortgagePrice: ''
  })

  const [bounds, setBounds] = useState(null)

  const toPair = (min, max, fmin, fmax) => {
    const normalize = (v, fb) => {
      const n = Number(v)
      if (v === '' || v === null || v === undefined || Number.isNaN(n)) return Number(fb ?? 0)
      return n
    }
    const loRaw = normalize(fmin, min)
    const hiRaw = normalize(fmax, max ?? loRaw)
    const minN = Number(min ?? loRaw)
    const maxN = Number(max ?? hiRaw)
    const lo = Math.max(minN, Math.min(loRaw, maxN))
    const hi = Math.max(lo, Math.min(hiRaw, maxN))
    return [lo, hi]
  }

  const [page, setPage] = useState(0)
  const [size, setSize] = useState(5)

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
    try { const res = await axios.get(API_BASE); setData(res.data) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  useEffect(() => {
    // Fetch bounds for current selection
    const loadBounds = async () => {
      try {
        const res = await axios.get(`${API_BASE}/stats`, { params: { ownership, propertyType } })
        setBounds(res.data)
        // Initialize sliders if empty
        setFilters(f => ({
          ...f,
          minArea: f.minArea || res.data.minArea || '',
          maxArea: f.maxArea || res.data.maxArea || '',
          minPrice: f.minPrice || res.data.minPrice || '',
          maxPrice: f.maxPrice || res.data.maxPrice || '',
          minRoomCount: f.minRoomCount || res.data.minRoomCount || '',
          maxRoomCount: f.maxRoomCount || res.data.maxRoomCount || '',
          minYardArea: f.minYardArea || res.data.minYardArea || '',
          maxYardArea: f.maxYardArea || res.data.maxYardArea || '',
          minFloorCount: f.minFloorCount || res.data.minFloorCount || '',
          maxFloorCount: f.maxFloorCount || res.data.maxFloorCount || '',
          minMortgagePrice: f.minMortgagePrice || res.data.minMortgagePrice || '',
          maxMortgagePrice: f.maxMortgagePrice || res.data.maxMortgagePrice || '',
        }))
      } catch (e) {
      const msg = e?.response?.data?.message || 'Failed to load bounds'
      const statusCode = e?.response?.status
      toast.show(msg, statusCode)
    }
    }
    loadBounds()
  }, [ownership, propertyType])

  const search = async () => {
    setLoading(true)
    try {
      let res;
      if (keyword && keyword.trim()) {
        // Use keyword search endpoint
        res = await axios.get(`${API_BASE}/search/keyword`, { params: { keyword: keyword.trim(), page, size }})
      } else {
        // Use regular search endpoint
        res = await axios.get(`${API_BASE}/search`, { params: { ownership, propertyType, page, size }})
      }
      setSearchResults(res.data)
      setShowSearch(true)
      setShowFilterResults(false)
    } catch (e) {
      const msg = e?.response?.data?.message || 'Search failed'
      const statusCode = e?.response?.status
      toast.show(msg, statusCode)
    } finally { setLoading(false) }
  }

  const applyFilters = async () => {
    setLoading(true)
    try {
      const params = { ownership, propertyType, page, size }
      
      // Add filter parameters if they have values
      if (filters.minPrice) params.minPrice = parseFloat(filters.minPrice)
      if (filters.maxPrice) params.maxPrice = parseFloat(filters.maxPrice)
      if (filters.minArea) params.minArea = parseFloat(filters.minArea)
      if (filters.maxArea) params.maxArea = parseFloat(filters.maxArea)
      if (filters.minRoomCount) params.minRoomCount = parseInt(filters.minRoomCount)
      if (filters.maxRoomCount) params.maxRoomCount = parseInt(filters.maxRoomCount)
      if (filters.minYardArea) params.minYardArea = parseFloat(filters.minYardArea)
      if (filters.maxYardArea) params.maxYardArea = parseFloat(filters.maxYardArea)
      if (filters.minFloorCount) params.minFloorCount = parseInt(filters.minFloorCount)
      if (filters.maxFloorCount) params.maxFloorCount = parseInt(filters.maxFloorCount)
      if (filters.minMortgagePrice) params.minMortgagePrice = parseFloat(filters.minMortgagePrice)
      if (filters.maxMortgagePrice) params.maxMortgagePrice = parseFloat(filters.maxMortgagePrice)
      
      const res = await axios.get(`${API_BASE}/filter`, { params })
      setFilterResults(res.data)
      setShowFilterResults(true)
      setShowSearch(false)
      setShowFilter(false)
    } catch (e) {
      const msg = e?.response?.data?.message || 'Filter failed'
      const statusCode = e?.response?.status
      toast.show(msg, statusCode)
    } finally { setLoading(false) }
  }

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: '',
      minRoomCount: '',
      maxRoomCount: ''
    })
  }

  // Build a flat list with metadata so we can delete by correct route
  const allItems = [
    ...((data?.sale?.land || []).map(i => ({ item: i, own: 'sale', type: 'land' }))),
    ...((data?.sale?.commercial?.office || []).map(i => ({ item: i, own: 'sale', type: 'office' }))),
    ...((data?.sale?.commercial?.shop || []).map(i => ({ item: i, own: 'sale', type: 'shop' }))),
    ...((data?.sale?.residential?.villa || []).map(i => ({ item: i, own: 'sale', type: 'villa' }))),
    ...((data?.sale?.residential?.apartment || []).map(i => ({ item: i, own: 'sale', type: 'apartment' }))),
    ...((data?.rent?.land || []).map(i => ({ item: i, own: 'rent', type: 'land' }))),
    ...((data?.rent?.commercial?.office || []).map(i => ({ item: i, own: 'rent', type: 'office' }))),
    ...((data?.rent?.commercial?.shop || []).map(i => ({ item: i, own: 'rent', type: 'shop' }))),
    ...((data?.rent?.residential?.villa || []).map(i => ({ item: i, own: 'rent', type: 'villa' }))),
    ...((data?.rent?.residential?.apartment || []).map(i => ({ item: i, own: 'rent', type: 'apartment' }))),
  ]

  const searchItems = searchResults.map(item => {
    // Find the ownership and type for each search result item
    const found = allItems.find(ai => ai.item.id === item.id)
    return found || { item, own: 'unknown', type: 'unknown' }
  })

  const filterItems = filterResults.map(item => {
    // Find the ownership and type for each filter result item
    const found = allItems.find(ai => ai.item.id === item.id)
    return found || { item, own: 'unknown', type: 'unknown' }
  })

  const items = showFilterResults ? filterItems : showSearch ? searchItems : allItems

  const keywordMatches = ({ item, own, type }) => {
    const q = (keyword || '').toString().trim().toLowerCase()
    if (!q) return true
    const data = item?.data || {}
    const haystack = [
      item?.id,
      own,
      type,
      data?.ownerFullName,
      data?.address,
      data?.email,
      (item?.whatUse || ''),
      (item?.roomCount ?? ''),
      (item?.floorCount ?? ''),
      (item?.yardArea ?? ''),
      (data?.area ?? ''),
      (data?.fullPrice ?? data?.rentPrice ?? ''),
    ]
      .map(v => (v ?? '').toString().toLowerCase())
      .join(' ')
    return haystack.includes(q)
  }

  const totalVisible = items.filter(keywordMatches)
  const paginatedVisible = totalVisible.slice(page * size, page * size + size)
  const visibleItems = paginatedVisible

  const askDelete = (own, type, id) => setConfirmDelete({ own, type, id })
  const doDelete = async () => {
    if (!confirmDelete) return
    setLoading(true)
    try {
      await axios.delete(`${API_BASE}/${confirmDelete.own}/${confirmDelete.type}/${confirmDelete.id}`)
      await fetchAll()
    } finally {
      setLoading(false)
      setConfirmDelete(null)
    }
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ fontSize:18, fontWeight:800 }}>All Advertisements</div>
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
            <button className="btn btn-muted" onClick={()=>{setShowSearch(false); setShowFilterResults(false); setKeyword('')}}>Show All</button>
            <Link to="/create" className="btn btn-muted">Create Ads</Link>
          </div>
        </div>
        <div className="card-body">
          <div className="grid">
            <div className="col-12">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* First row - Selectors */}
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
                </div>

                {/* Second row - Search input and buttons */}
                <div className="toolbar" style={{ gap: 12 }}>
                  <input
                    className="input"
                    style={{ maxWidth: 280 }}
                    placeholder="Search by id, owner, address, email..."
                    value={keyword}
                    onChange={e=>setKeyword(e.target.value)}
                    onKeyPress={e=>e.key==='Enter' && search()}
                  />
                  <button className="btn btn-muted" onClick={search}>Search</button>
                  <button className="btn btn-magic" onClick={()=>setShowFilter(true)} title="Try our advanced magic filters!">Filter</button>
                  <div className="spacer" />
                </div>
              </div>
            </div>
          </div>

          {loading ? 'Loading…' : (
            <div className="list" style={{ marginTop: 20 }}>
              {showSearch && (
                <div style={{ color:'var(--muted)', fontSize:14, marginBottom:12 }}>
                  {keyword && keyword.trim() ? 
                    `Search results for "${keyword}" (${searchResults.length} found)` :
                    `Search results for ${ownership} / ${propertyType} (${searchResults.length} found)`
                  }
                </div>
              )}
              {showFilterResults && (
                <div style={{ color:'var(--muted)', fontSize:14, marginBottom:12 }}>
                  Filter results for {ownership} / {propertyType} ({filterResults.length} found)
                </div>
              )}
              {visibleItems.map(({ item, own, type }) => (
                <div key={item.id} className="list-item">
                  <div>
                    <div style={{ fontWeight:700 }}>{item.data?.address}</div>
                    <div style={{ color:'var(--muted)', fontSize:13 }}>
                      <a href={`mailto:${item.data?.email}`} className="link">{item.data?.email}</a> · {item.data?.area} m²
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <span className="badge">{item.id?.slice(0,8)}</span>
                    <button className="icon-btn" onClick={()=>setPreviewItem(item)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 12s4.5-7.5 10.5-7.5S22.5 12 22.5 12 18 19.5 12 19.5 1.5 12 1.5 12Z" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8"/></svg>
                      View
                    </button>
                    <button className="btn btn-danger" onClick={()=>askDelete(own, type, item.id)}>Delete</button>
                  </div>
                </div>
              ))}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop: 12 }}>
                <div style={{ color:'var(--muted)' }}>Page {page + 1} · Size
                  <select className="input" style={{ width:90, marginLeft:8 }} value={size} onChange={e=>{ setPage(0); setSize(parseInt(e.target.value)||10) }}>
                    {[5,10,20,50].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-muted" disabled={page===0} onClick={()=>setPage(p=>Math.max(0,p-1))}>Previous</button>
                  <button className="btn btn-muted" disabled={(page+1)*size >= totalVisible.length} onClick={()=>setPage(p=>p+1)}>Next</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {previewItem && (
        <div className="modal-backdrop" onClick={()=>setPreviewItem(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <b>Property Details</b>
              <button className="btn btn-muted" onClick={()=>setPreviewItem(null)}>Close</button>
            </div>
            <div className="modal-body">
              <div className="kv"><div className="k">ID</div><div className="v">{previewItem.id}</div></div>
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

      {/* Toast via window events (reuse global styles if needed). Here, we keep native to App.jsx */}

      {confirmDelete && (
        <div className="modal-backdrop" onClick={()=>setConfirmDelete(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <b>Confirm Delete</b>
            </div>
            <div className="modal-body">
              <div className="kv"><div className="k">Are you sure?</div><div className="v">This action cannot be undone.</div></div>
              <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                <button className="btn btn-muted" onClick={()=>setConfirmDelete(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={doDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilter && (
        <div className="modal-backdrop" onClick={()=>setShowFilter(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>Advanced Filters</h3>
              <button className="close-btn" aria-label="Close" onClick={()=>setShowFilter(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="grid" style={{ gap: 16 }}>
                <div className="col-12">
                  <label className="label">Price range ({ownership==='rent' ? 'Rent Price' : 'Full Price'})</label>
                  <Slider
                    getAriaLabel={() => 'Price range'}
                    value={toPair(bounds?.minPrice, bounds?.maxPrice, filters.minPrice, filters.maxPrice)}
                    valueLabelDisplay="auto"
                    min={Number(bounds?.minPrice ?? 0)}
                    max={Number(bounds?.maxPrice ?? 1000000)}
                    onChange={(_, v) => setFilters(f => ({...f, minPrice: v[0], maxPrice: v[1]}))}
                  />
                </div>
                {ownership==='rent' && (
                  <div className="col-12">
                    <label className="label">Mortgage Price</label>
                    <Slider
                      getAriaLabel={() => 'Mortgage Price'}
                      value={toPair(bounds?.minMortgagePrice, bounds?.maxMortgagePrice, filters.minMortgagePrice, filters.maxMortgagePrice)}
                      valueLabelDisplay="auto"
                      min={Number(bounds?.minMortgagePrice ?? 0)}
                      max={Number(bounds?.maxMortgagePrice ?? 1000000)}
                      onChange={(_, v) => setFilters({...filters, minMortgagePrice: v[0], maxMortgagePrice: v[1]})}
                    />
                  </div>
                )}
                <div className="col-12">
                  <label className="label">Area range (m²)</label>
                  <Slider
                    getAriaLabel={() => 'Area range'}
                    value={toPair(bounds?.minArea, bounds?.maxArea, filters.minArea, filters.maxArea)}
                    valueLabelDisplay="auto"
                    min={Number(bounds?.minArea ?? 0)}
                    max={Number(bounds?.maxArea ?? 2000)}
                    onChange={(_, v) => setFilters(f => ({...f, minArea: v[0], maxArea: v[1]}))}
                  />
                </div>
                {/* Conditional filters */}
                {(propertyType === 'office' || propertyType === 'apartment' || propertyType === 'shop') && (
                  <div className="col-12">
                    <label className="label">Room count</label>
                    <Slider
                      getAriaLabel={() => 'Room count'}
                      value={toPair(bounds?.minRoomCount, bounds?.maxRoomCount, filters.minRoomCount, filters.maxRoomCount)}
                      valueLabelDisplay="auto"
                      min={Number(bounds?.minRoomCount ?? 0)}
                      max={Number(bounds?.maxRoomCount ?? 10)}
                      onChange={(_, v) => setFilters(f => ({...f, minRoomCount: v[0], maxRoomCount: v[1]}))}
                    />
                  </div>
                )}
                {propertyType === 'villa' && (
                  <div className="col-12">
                    <label className="label">Yard Area</label>
                    <Slider
                      getAriaLabel={() => 'Yard area'}
                      value={toPair(bounds?.minYardArea, bounds?.maxYardArea, filters.minYardArea, filters.maxYardArea)}
                      valueLabelDisplay="auto"
                      min={Number(bounds?.minYardArea ?? 0)}
                      max={Number(bounds?.maxYardArea ?? 1000)}
                      onChange={(_, v) => setFilters(f => ({...f, minYardArea: v[0], maxYardArea: v[1]}))}
                    />
                  </div>
                )}
                {propertyType === 'apartment' && (
                  <div className="col-12">
                    <label className="label">Floor Count</label>
                    <Slider
                      getAriaLabel={() => 'Floor count'}
                      value={toPair(bounds?.minFloorCount, bounds?.maxFloorCount, filters.minFloorCount, filters.maxFloorCount)}
                      valueLabelDisplay="auto"
                      min={Number(bounds?.minFloorCount ?? 0)}
                      max={Number(bounds?.maxFloorCount ?? 50)}
                      onChange={(_, v) => setFilters(f => ({...f, minFloorCount: v[0], maxFloorCount: v[1]}))}
                    />
                  </div>
                )}
                <div className="col-12" style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop: 16 }}>
                  <button className="btn btn-muted" onClick={clearFilters}>Clear</button>
                  <button className="btn btn-muted" onClick={()=>setShowFilter(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={applyFilters}>Apply Filters</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Messages */}
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

      <div style={{ textAlign:'center', color:'var(--muted)', marginTop: 20 }}>
        Developed By Arian
      </div>
    </div>
  )
}


