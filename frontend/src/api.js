const currentIdForApi=()=>Number(localStorage.getItem("sharesphere_user_id"))||0;
const API_BASE=(import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/,"");
async function request(path,options={}){const r=await fetch(`${API_BASE}${path}`,{headers:{"Content-Type":"application/json",...(options.headers||{})},...options});let d;try{d=await r.json();}catch{d={message:`Request failed (${r.status})`};}if(!r.ok)throw new Error(d.message||"Request failed");return d;}
export const api={
  register:b=>request("/auth/register",{method:"POST",body:JSON.stringify(b)}),
  login:b=>request("/auth/login",{method:"POST",body:JSON.stringify(b)}),
  user:id=>request(`/auth/users/${id}`),resources:(q="")=>request(`/resources${q}`),resource:id=>request(`/resources/${id}`),categories:()=>request("/resources/categories"),createResource:b=>request("/resources",{method:"POST",body:JSON.stringify(b)}),createRequest:b=>request("/requests",{method:"POST",body:JSON.stringify(b)}),myRequests:id=>request(`/requests/my?borrower_id=${id}`),ownerRequests:id=>request(`/requests/owner?owner_id=${id}`),updateRequestStatus:(id,status)=>request(`/requests/${id}/status`,{method:"PUT",body:JSON.stringify({status})}),borrow:b=>request("/transactions/borrow",{method:"POST",body:JSON.stringify(b)}),returnResource:(id,date)=>request(`/transactions/${id}/return`,{method:"POST",body:JSON.stringify({return_date:date})}),transactions:id=>request(`/transactions?user_id=${id}`),feedback:b=>request("/feedback",{method:"POST",body:JSON.stringify(b)}),feedbackForTransaction:id=>request(`/feedback/${id}`),damageReport:b=>request("/damage-reports",{method:"POST",body:JSON.stringify(b)}),damageForTransaction:id=>request(`/damage-reports/${id}`),
  myResources:id=>request(`/resources?owner_id=${id}`),
  setResourceStatus:(id,status)=>request(`/resources/${id}/status`,{method:"PUT",body:JSON.stringify({status,owner_id:currentIdForApi()})})
};
