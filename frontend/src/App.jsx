import { useEffect, useMemo, useState } from "react";
import { Link, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { Home, Package, PlusCircle, ClipboardList, Repeat2, Search, MapPin, UserRound, ArrowLeft, SlidersHorizontal, CheckCircle2, Clock3, XCircle, Boxes, ChevronRight, Inbox, Check, X, LogOut, Star, AlertTriangle, Pencil, Wrench } from "lucide-react";
import { api } from "./api";

const DEMO_USERS=[{user_id:1,name:"Arjun Kumar",email:"arjun@gmail.com",role:"Borrower",initials:"A",password:"password123"},{user_id:10,name:"Divya Krishnan",email:"divya@gmail.com",role:"Owner",initials:"D",password:"password123"}];
const currentId=()=>Number(localStorage.getItem("sharesphere_user_id"))||0;
function userFromLocal(){const saved=localStorage.getItem("sharesphere_user"); if(saved){try{return JSON.parse(saved)}catch{}} const id=currentId(); return DEMO_USERS.find(u=>u.user_id===id)||null;}
function useCurrentUser(){const [user,setUser]=useState(userFromLocal); useEffect(()=>{const s=()=>setUser(userFromLocal());window.addEventListener("sharesphere-user-changed",s);return()=>window.removeEventListener("sharesphere-user-changed",s)},[]);return user;}
function setSession(user){localStorage.setItem("sharesphere_user_id",String(user.user_id));localStorage.setItem("sharesphere_user",JSON.stringify(user));window.dispatchEvent(new Event("sharesphere-user-changed"));}
function clearSession(){localStorage.removeItem("sharesphere_user_id");localStorage.removeItem("sharesphere_user");window.dispatchEvent(new Event("sharesphere-user-changed"));}
function formatDate(v){if(!v)return "—";const raw=String(v).slice(0,10);const [y,m,d]=raw.split("-");if(!d)return String(v);return new Date(+y,+m-1,+d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});}
function todayISO(){const d=new Date();const offset=d.getTimezoneOffset();const local=new Date(d.getTime()-offset*60000);return local.toISOString().slice(0,10);}
function Flash({flash}){if(!flash?.text)return null;return <div className={`flash ${flash.type==='error'?'flash-error':'flash-success'}`}>{flash.type==='error'?'✕':'✓'}<span>{flash.text}</span></div>}
function iconFor(c){return c==="Books"?"📚":c==="Electronics"?"💻":c==="Sports Equipment"?"🏸":c==="Musical Instruments"?"🎸":c==="Photography"?"📷":c==="Tools"?"🛠️":c==="Travel Equipment"?"🎒":"✏️";}
function ResourceIcon({category}){return <div className="resource-icon">{iconFor(category)}</div>}
function Guard({children}){const u=useCurrentUser();const nav=useNavigate();if(!u)return <Login onLogin={()=>nav("/")}/>;return children;}

function Layout({children}){const location=useLocation(),nav=useNavigate(),user=useCurrentUser();if(!user)return <Login onLogin={()=>nav("/")}/>;const links=[{to:"/",label:"Dashboard",icon:Home},{to:"/resources",label:"Browse Resources",icon:Package},{to:"/requests",label:"My Requests",icon:ClipboardList},{to:"/owner-requests",label:"Owner Requests",icon:Inbox},{to:"/transactions",label:"Transactions",icon:Repeat2},{to:"/my-resources",label:"My Resources",icon:Boxes},{to:"/add-resource",label:"List Resource",icon:PlusCircle}];const logout=()=>{clearSession();nav("/login")};return <div className="app-shell"><aside className="sidebar"><div className="brand"><div className="brand-mark">S</div><div><h1>ShareSphere</h1><span>Community sharing</span></div></div><nav>{links.map(({to,label,icon:Icon})=><Link key={to} to={to} className={location.pathname===to?"nav-link active":"nav-link"}><Icon size={18}/>{label}</Link>)}</nav><button className="logout-btn" onClick={logout}><LogOut size={17}/> Sign out</button></aside><main className="main-content"><header className="topbar"><div><p className="eyebrow">COMMUNITY RESOURCE PLATFORM</p><h2>Welcome back, {user.name.split(" ")[0]} 👋</h2></div><div className="user-chip"><div className="avatar">{user.name[0]}</div><div className="user-info"><strong>{user.name}</strong><span>Member #{user.user_id}</span></div></div></header>{children}</main></div>}

function Login({onLogin}){
  const nav=useNavigate();
  const [mode,setMode]=useState("login");
  const [form,setForm]=useState({name:"",email:"",phone:"",password:"",address:""});
  const [showPassword,setShowPassword]=useState(false);
  const [flash,setFlash]=useState(null);
  const [loading,setLoading]=useState(false);

  const submit=async e=>{
    e.preventDefault();
    setLoading(true);
    setFlash(null);
    try{
      let r;
      if(mode==="login"){
        r=await api.login({email:form.email,password:form.password});
      }else{
        r=await api.register(form);
      }
      setSession(r.user);
      onLogin?.();
      nav("/");
    }catch(e){
      setFlash({type:"error",text:e.message});
    }finally{
      setLoading(false);
    }
  };

  return <div className="auth-page"><div className="auth-card">
    <div className="auth-brand"><div className="brand-mark">S</div><div><h1>ShareSphere</h1><p>Community resource sharing</p></div></div>
    <div className="auth-tabs"><button type="button" className={mode==="login"?"active":""} onClick={()=>{setMode("login");setFlash(null)}}>Login</button><button type="button" className={mode==="register"?"active":""} onClick={()=>{setMode("register");setFlash(null)}}>Register</button></div>
    <form onSubmit={submit}>
      {mode==="register"&&<><label>Full name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Phone<input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label><label>Address<input value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></label></>}
      <label>Email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
      <label>Password<input type={showPassword?"text":"password"} required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>
      <label className="checkbox-row"><input type="checkbox" checked={showPassword} onChange={e=>setShowPassword(e.target.checked)}/><span>Show password</span></label>
      <button className="primary-btn" disabled={loading}>{loading?"Please wait...":mode==="login"?"Login":"Create account"}</button>
    </form>
    <Flash flash={flash}/>
    {mode==="login"&&<div className="demo-login"><strong>Quick demo</strong><p>Arjun: arjun@gmail.com / password123</p><p>Divya: divya@gmail.com / password123</p></div>}
    <p className="security-note">Passwords are securely hashed before being stored.</p>
  </div></div>
}

function Dashboard(){const u=useCurrentUser(),[resources,setResources]=useState([]),[requests,setRequests]=useState([]),[tx,setTx]=useState([]);useEffect(()=>{Promise.all([api.resources(),api.myRequests(u.user_id),api.transactions(u.user_id)]).then(([r,q,t])=>{setResources(r.data);setRequests(q.data);setTx(t.data)}).catch(console.error)},[u.user_id]);const available=resources.filter(r=>r.availability_status==="AVAILABLE").length;const pending=requests.filter(r=>r.status==="PENDING").length;const active=tx.filter(t=>t.status==="ACTIVE").length;return <section><div className="hero"><div><span className="pill">SHARE • BORROW • RETURN</span><h3>Share what you have.<br/>Borrow what you need.</h3><p>Discover useful resources from your community and make everyday items easier to access.</p><Link to="/resources" className="primary-btn">Explore resources <ChevronRight size={16}/></Link></div><div className="hero-art"><div className="floating-card">📚 Books</div><div className="floating-card second">🎸 Instruments</div><div className="floating-card third">📷 Equipment</div></div></div><div className="section-head"><div><p className="eyebrow">YOUR ACTIVITY</p><h3>Community at a glance</h3></div></div><div className="stats-grid"><div className="stat-card"><span>Total resources</span><strong>{resources.length}</strong><small>in the community</small></div><div className="stat-card"><span>Available now</span><strong>{available}</strong><small>ready to borrow</small></div><div className="stat-card"><span>Pending requests</span><strong>{pending}</strong><small>waiting for approval</small></div><div className="stat-card"><span>Active loans</span><strong>{active}</strong><small>currently borrowed</small></div></div><div className="quick-actions"><Link to="/resources" className="quick-card"><Package size={22}/><div><strong>Find something to borrow</strong><span>Browse the resource library</span></div><ChevronRight size={17}/></Link><Link to="/add-resource" className="quick-card"><PlusCircle size={22}/><div><strong>Share something you own</strong><span>List a resource for others</span></div><ChevronRight size={17}/></Link></div></section>}

function ResourceCard({resource}){const available=resource.availability_status==="AVAILABLE";return <article className="resource-card"><ResourceIcon category={resource.category_name}/><div className="resource-body"><div className="card-top"><span className="category">{resource.category_name}</span><span className={`status ${available?"available":"borrowed"}`}>{resource.availability_status}</span></div><h4>{resource.title}</h4><p>{resource.description||"No description provided."}</p><div className="resource-meta"><span><MapPin size={13}/> {resource.location}</span><span><UserRound size={13}/> {resource.owner_name}</span></div><Link to={`/resources/${resource.resource_id}`} className="secondary-btn">View details <ChevronRight size={15}/></Link></div></article>}
function Resources(){const [resources,setResources]=useState([]),[cats,setCats]=useState([]),[search,setSearch]=useState(""),[category,setCategory]=useState(""),[status,setStatus]=useState(""),[loading,setLoading]=useState(true),[error,setError]=useState("");useEffect(()=>{api.categories().then(r=>setCats(r.data)).catch(e=>setError(e.message))},[]);useEffect(()=>{const t=setTimeout(()=>{const p=new URLSearchParams();if(search.trim())p.set("search",search.trim());if(category)p.set("category",category);if(status)p.set("status",status);setLoading(true);api.resources(p.toString()?`?${p}`:"").then(r=>setResources(r.data)).catch(e=>setError(e.message)).finally(()=>setLoading(false))},200);return()=>clearTimeout(t)},[search,category,status]);const reset=()=>{setSearch("");setCategory("");setStatus("")};return <section><div className="page-heading"><div><p className="eyebrow">RESOURCE LIBRARY</p><h3>Browse resources</h3><p>Find something useful from your community.</p></div><Link to="/add-resource" className="primary-btn"><PlusCircle size={16}/> List a resource</Link></div><div className="filter-panel"><div className="search-wrap"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search books, electronics, sports equipment..."/></div><div className="filter-row"><div className="select-wrap"><SlidersHorizontal size={15}/><select value={category} onChange={e=>setCategory(e.target.value)}><option value="">All categories</option>{cats.map(c=><option key={c.category_id} value={c.category_name}>{c.category_name}</option>)}</select></div><div className="select-wrap"><select value={status} onChange={e=>setStatus(e.target.value)}><option value="">All availability</option><option>AVAILABLE</option><option>BORROWED</option><option>MAINTENANCE</option></select></div>{(search||category||status)&&<button className="clear-btn" onClick={reset}>Clear filters</button>}</div></div><div className="results-row"><span>{loading?"Loading...":`${resources.length} resource${resources.length===1?"":"s"} found`}</span></div>{error&&<div className="error-box">{error}</div>}{loading?<div className="empty-state">Loading resources...</div>:resources.length?<div className="resource-grid">{resources.map(r=><ResourceCard key={r.resource_id} resource={r}/>)}</div>:<div className="empty-state"><Boxes size={34}/><h4>No resources found</h4><p>Try changing your filters.</p></div>}</section>}

function ResourceDetails(){
  const {id}=useParams(),u=useCurrentUser();
  const [r,setR]=useState(null),[form,setForm]=useState({start_date:"",end_date:"",message:""}),[flash,setFlash]=useState(null);
  const today=todayISO();
  useEffect(()=>{api.resource(id).then(x=>setR(x.data)).catch(e=>setFlash({type:"error",text:e.message}))},[id]);
  if(!r)return <div className="empty-state"><Flash flash={flash}/>{!flash&&"Loading resource..."}</div>;
  const submit=async e=>{
    e.preventDefault();
    if(!form.start_date||!form.end_date){setFlash({type:"error",text:"Please select both start and end dates."});return;}
    if(form.start_date<today){setFlash({type:"error",text:"Start date cannot be before today."});return;}
    if(form.end_date<form.start_date){setFlash({type:"error",text:"End date cannot be before the start date."});return;}
    try{
      await api.createRequest({borrower_id:u.user_id,resource_id:r.resource_id,...form});
      setFlash({type:"success",text:"Borrow request submitted successfully. You can track it from My Requests."});
      setForm({start_date:"",end_date:"",message:""});
    }catch(e){setFlash({type:"error",text:e.message})}
  };
  const changeStart=e=>{const start=e.target.value;setForm({...form,start_date:start,end_date:form.end_date&&form.end_date<start?"":form.end_date})};
  return <section><Link to="/resources" className="back-link"><ArrowLeft size={15}/> Back to resources</Link><div className="detail-layout">
    <div className="detail-card"><ResourceIcon category={r.category_name}/><span className="category">{r.category_name}</span><h3>{r.title}</h3><p>{r.description||"No description provided."}</p><div className="detail-list"><div><span>Condition</span><strong>{r.item_condition}</strong></div><div><span>Availability</span><strong>{r.availability_status}</strong></div><div><span>Location</span><strong>{r.location}</strong></div><div><span>Owner</span><strong>{r.owner_name}</strong></div></div></div>
    <form className="form-card" onSubmit={submit}><p className="eyebrow">BORROW REQUEST</p><h3>Request this resource</h3>
      <label>Start date<input type="date" min={today} required value={form.start_date} onChange={changeStart}/><small className="field-help">Choose today or a future date.</small></label>
      <label>End date<input type="date" min={form.start_date||today} required value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})}/></label>
      <label>Message<textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} placeholder="Add a short message to the owner..."/></label>
      <button className="primary-btn" disabled={r.availability_status!=="AVAILABLE"}>{r.availability_status!=="AVAILABLE"?"Currently unavailable":"Send borrow request"}</button>
      <Flash flash={flash}/>
    </form>
  </div></section>
}

function MyRequests(){const u=useCurrentUser(),[rows,setRows]=useState([]);useEffect(()=>{api.myRequests(u.user_id).then(r=>setRows(r.data)).catch(console.error)},[u.user_id]);return <section><div className="page-heading"><div><p className="eyebrow">BORROWING</p><h3>My requests</h3><p>Requests submitted by {u.name}.</p></div></div><div className="table-card"><table><thead><tr><th>Resource</th><th>Owner</th><th>Period</th><th>Status</th></tr></thead><tbody>{rows.map(r=><tr key={r.request_id}><td><strong>{r.title}</strong></td><td>{r.owner_name}</td><td>{formatDate(r.start_date)} → {formatDate(r.end_date)}</td><td><RequestStatus status={r.status}/></td></tr>)}</tbody></table>{!rows.length&&<div className="empty-state">No requests yet.</div>}</div></section>}
function RequestStatus({status}){const I=status==="APPROVED"?CheckCircle2:status==="REJECTED"?XCircle:Clock3;return <span className={`request-status ${status.toLowerCase()}`}><I size={13}/>{status}</span>}

function OwnerRequests(){
  const u=useCurrentUser(),[rows,setRows]=useState([]),[flash,setFlash]=useState(null);
  const load=()=>api.ownerRequests(u.user_id).then(r=>setRows(r.data)).catch(e=>setFlash({type:"error",text:e.message}));
  useEffect(()=>{load()},[u.user_id]);
  const update=async(id,status)=>{try{const r=await api.updateRequestStatus(id,status);setFlash({type:"success",text:r.message});load()}catch(e){setFlash({type:"error",text:e.message})}};
  const pending=rows.filter(r=>r.status==="PENDING").length;
  return <section><div className="page-heading"><div><p className="eyebrow">OWNER CONTROL CENTER</p><h3>Borrow requests</h3><p>Requests for resources owned by {u.name}.</p></div><div className="request-count"><strong>{pending}</strong><span>pending</span></div></div><Flash flash={flash}/><div className="owner-request-list">{rows.map(r=><article className="owner-request-card" key={r.request_id}><div className="request-resource-icon">📦</div><div className="owner-request-main"><div className="card-top"><span className="category">{r.title}</span><RequestStatus status={r.status}/></div><h4>Request from {r.borrower_name}</h4><div className="request-details"><span>📅 {formatDate(r.start_date)} → {formatDate(r.end_date)}</span><span>📍 {r.location}</span><span>✉ {r.borrower_email}</span></div>{r.message&&<div className="request-message">“{r.message}”</div>}</div>{r.status==="PENDING"&&<div className="request-actions"><button className="approve-btn" onClick={()=>update(r.request_id,"APPROVED")}><Check size={16}/>Approve</button><button className="reject-btn" onClick={()=>update(r.request_id,"REJECTED")}><X size={16}/>Reject</button></div>}</article>)}{!rows.length&&<div className="empty-state">No requests for your resources.</div>}</div></section>
}

function Transactions(){
  const u=useCurrentUser(),[tx,setTx]=useState([]),[req,setReq]=useState([]),[flash,setFlash]=useState(null),[returning,setReturning]=useState(null),[date,setDate]=useState("");
  const load=async()=>{try{const [a,b]=await Promise.all([api.transactions(u.user_id),api.myRequests(u.user_id)]);setTx(a.data);setReq(b.data)}catch(e){setFlash({type:"error",text:e.message})}};
  useEffect(()=>{load()},[u.user_id]);
  const existing=new Set(tx.map(x=>x.request_id));
  const approved=req.filter(r=>r.status==="APPROVED"&&!existing.has(r.request_id));
  const borrow=async r=>{try{const x=await api.borrow({request_id:r.request_id,issue_date:String(r.start_date).slice(0,10),due_date:String(r.end_date).slice(0,10)});setFlash({type:"success",text:x.message});load()}catch(e){setFlash({type:"error",text:e.message})}};
  const ret=async t=>{
    if(!date){setFlash({type:"error",text:"Please select a return date."});return}
    if(date<String(t.issue_date).slice(0,10)){setFlash({type:"error",text:"Return date cannot be before the issue date."});return}
    try{const x=await api.returnResource(t.transaction_id,date);setFlash({type:"success",text:x.message});setReturning(null);setDate("");load()}catch(e){setFlash({type:"error",text:e.message})}
  };
  return <section><div className="page-heading"><div><p className="eyebrow">ACTIVITY</p><h3>Transactions</h3><p>Borrow, return and review your transactions.</p></div></div><Flash flash={flash}/>
    {approved.length>0&&<><div className="subsection-heading"><div><p className="eyebrow">READY TO BORROW</p><h4>Approved requests</h4></div></div><div className="approved-borrow-list">{approved.map(r=><article className="approved-borrow-card" key={r.request_id}><div><span className="category">{r.title}</span><h4>Approved by {r.owner_name}</h4><p>{formatDate(r.start_date)} → {formatDate(r.end_date)} · {r.location}</p></div><button className="approve-btn" onClick={()=>borrow(r)}>Borrow resource</button></article>)}</div></>}
    <div className="subsection-heading"><div><p className="eyebrow">TRANSACTION HISTORY</p><h4>Your transactions</h4></div></div>
    <div className="table-card"><table><thead><tr><th>Resource</th><th>Issue</th><th>Due</th><th>Return</th><th>Status</th><th>Actions</th></tr></thead><tbody>{tx.map(t=><tr key={t.transaction_id}><td><strong>{t.title}</strong></td><td>{formatDate(t.issue_date)}</td><td>{formatDate(t.due_date)}</td><td>{formatDate(t.return_date)}</td><td><RequestStatus status={t.status}/></td><td><div className="action-stack">{t.status==="ACTIVE"&&(returning===t.transaction_id?<div className="return-editor"><label>Return date<input type="date" min={String(t.issue_date).slice(0,10)} max={todayISO()} value={date} onChange={e=>setDate(e.target.value)}/></label><div className="return-editor-actions"><button className="return-btn" onClick={()=>ret(t)}>Confirm</button><button className="cancel-btn" onClick={()=>{setReturning(null);setDate("")}}>Cancel</button></div></div>:<button className="return-btn" onClick={()=>{setReturning(t.transaction_id);setDate("");setFlash(null)}}>Return</button>)}{t.status==="RETURNED"&&<ReviewActions transaction={t}/>}</div></td></tr>)}</tbody></table>{!tx.length&&<div className="empty-state">No transactions yet.</div>}</div>
  </section>
}

function ReviewActions({transaction}){
  const u=useCurrentUser();
  const [mode,setMode]=useState(null),[rating,setRating]=useState(5),[comment,setComment]=useState(""),[damage,setDamage]=useState({type:"Physical damage",description:"",cost:""}),[flash,setFlash]=useState(null),[feedback,setFeedback]=useState([]),[reports,setReports]=useState([]);
  const loadReviews=async()=>{try{const [f,d]=await Promise.all([api.feedbackForTransaction(transaction.transaction_id),api.damageForTransaction(transaction.transaction_id)]);setFeedback(f.data);setReports(d.data)}catch(e){setFlash({type:"error",text:e.message})}};
  useEffect(()=>{loadReviews()},[transaction.transaction_id]);
  const submitFeedback=async e=>{e.preventDefault();try{const r=await api.feedback({transaction_id:transaction.transaction_id,user_id:u.user_id,rating,comments:comment});setFlash({type:"success",text:r.message});setComment("");setMode(null);await loadReviews()}catch(e){setFlash({type:"error",text:e.message})}};
  const submitDamage=async e=>{e.preventDefault();try{const r=await api.damageReport({transaction_id:transaction.transaction_id,reported_by:u.user_id,damage_type:damage.type,description:damage.description,estimated_cost:Number(damage.cost)||0});setFlash({type:"success",text:r.message});setDamage({type:"Physical damage",description:"",cost:""});setMode(null);await loadReviews()}catch(e){setFlash({type:"error",text:e.message})}};
  return <div className="review-panel"><div className="review-buttons"><button className="mini-btn" onClick={()=>setMode(mode==="feedback"?null:"feedback")}><Star size={14}/> Feedback</button><button className="mini-btn" onClick={()=>setMode(mode==="damage"?null:"damage")}><AlertTriangle size={14}/> Damage</button></div>
    {mode==="feedback"&&<form className="mini-form" onSubmit={submitFeedback}><strong>Rate this transaction</strong><div className="stars">{[1,2,3,4,5].map(n=><button type="button" className={n<=rating?"star active":"star"} key={n} onClick={()=>setRating(n)} aria-label={`${n} star`}>★</button>)}</div><textarea required value={comment} onChange={e=>setComment(e.target.value)} placeholder="Write a comment..."/><button className="mini-submit">Submit feedback</button></form>}
    {mode==="damage"&&<form className="mini-form" onSubmit={submitDamage}><strong>Report damage</strong><select value={damage.type} onChange={e=>setDamage({...damage,type:e.target.value})}><option>Physical damage</option><option>Missing part</option><option>Functional issue</option><option>Other</option></select><textarea required value={damage.description} onChange={e=>setDamage({...damage,description:e.target.value})} placeholder="Describe the damage..."/><input type="number" min="0" value={damage.cost} onChange={e=>setDamage({...damage,cost:e.target.value})} placeholder="Estimated cost"/><button className="mini-submit">Submit report</button></form>}
    <Flash flash={flash}/>
    {feedback.length>0&&<div className="submitted-review"><strong>Feedback submitted</strong>{feedback.map(f=><div className="review-item" key={f.feedback_id}><span className="review-stars">{"★".repeat(f.rating)}{"☆".repeat(5-f.rating)}</span><span>{f.comments||"No comment"}</span><small>{f.user_name} · {formatDate(f.feedback_date)}</small></div>)}</div>}
    {reports.length>0&&<div className="submitted-review"><strong>Damage reports</strong>{reports.map(d=><div className="review-item" key={d.report_id}><span><b>{d.damage_type}</b> · ₹{Number(d.estimated_cost||0).toFixed(2)}</span><span>{d.description}</span><small>{d.reporter_name} · {formatDate(d.reported_date)} · {d.status}</small></div>)}</div>}
  </div>
}

function AddResource(){
  const u=useCurrentUser(),[cats,setCats]=useState([]),[form,setForm]=useState({category_id:"",title:"",description:"",item_condition:"GOOD",location:""}),[flash,setFlash]=useState(null);
  useEffect(()=>{api.categories().then(r=>setCats(r.data)).catch(e=>setFlash({type:"error",text:e.message}))},[]);
  const submit=async e=>{e.preventDefault();try{await api.createResource({owner_id:u.user_id,...form});setFlash({type:"success",text:"Resource listed successfully!"});setForm({category_id:"",title:"",description:"",item_condition:"GOOD",location:""})}catch(e){setFlash({type:"error",text:e.message})}};
  return <section><div className="page-heading"><div><p className="eyebrow">CONTRIBUTE</p><h3>List a resource</h3><p>Add something you own to the community.</p></div></div><form className="form-card wide" onSubmit={submit}><div className="form-grid"><label>Resource title<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>Category<select required value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})}><option value="">Select category</option>{cats.map(c=><option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}</select></label><label>Condition<select value={form.item_condition} onChange={e=>setForm({...form,item_condition:e.target.value})}><option>EXCELLENT</option><option>GOOD</option><option>FAIR</option><option>POOR</option></select></label><label>Location<input required value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/></label></div><label>Description<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><button className="primary-btn">List resource</button><Flash flash={flash}/></form></section>
}

function MyResources(){
  const u=useCurrentUser(),[rows,setRows]=useState([]),[flash,setFlash]=useState(null);
  const load=()=>api.myResources(u.user_id).then(r=>setRows(r.data)).catch(e=>setFlash({type:"error",text:e.message}));
  useEffect(()=>{load()},[u.user_id]);
  const change=async(id,status)=>{try{const r=await api.setResourceStatus(id,status);setFlash({type:"success",text:r.message});load()}catch(e){setFlash({type:"error",text:e.message})}};
  return <section><div className="page-heading"><div><p className="eyebrow">OWNER INVENTORY</p><h3>My resources</h3><p>Resources listed by {u.name}.</p></div></div><Flash flash={flash}/><div className="resource-grid">{rows.map(r=><article className="resource-card" key={r.resource_id}><ResourceIcon category={r.category_name}/><div className="resource-body"><div className="card-top"><span className="category">{r.category_name}</span><span className="status">{r.availability_status}</span></div><h4>{r.title}</h4><p>{r.description||"No description."}</p><div className="resource-meta"><span><MapPin size={13}/> {r.location}</span></div><div className="owner-actions">{r.availability_status!=="MAINTENANCE"&&r.availability_status!=="BORROWED"&&<button className="mini-btn" onClick={()=>change(r.resource_id,"MAINTENANCE")}><Wrench size={14}/> Maintenance</button>}{r.availability_status==="MAINTENANCE"&&<button className="mini-btn" onClick={()=>change(r.resource_id,"AVAILABLE")}><Check size={14}/> Available</button>}</div></div></article>)}</div>{!rows.length&&<div className="empty-state">You haven't listed any resources yet.</div>}</section>
}

export default function App(){return <Routes><Route path="/login" element={<Login onLogin={()=>{}}/>}/><Route path="/" element={<Layout><Dashboard/></Layout>}/><Route path="/resources" element={<Layout><Resources/></Layout>}/><Route path="/resources/:id" element={<Layout><ResourceDetails/></Layout>}/><Route path="/requests" element={<Layout><MyRequests/></Layout>}/><Route path="/owner-requests" element={<Layout><OwnerRequests/></Layout>}/><Route path="/transactions" element={<Layout><Transactions/></Layout>}/><Route path="/my-resources" element={<Layout><MyResources/></Layout>}/><Route path="/add-resource" element={<Layout><AddResource/></Layout>}/><Route path="*" element={<Layout><Dashboard/></Layout>}/></Routes>}
