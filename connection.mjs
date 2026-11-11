import {changes} from './sync.mjs';
const url='https://nasdgjalsfxnwymqicio.supabase.co';
const key='sb_publishable_b2pGQWqC4OtByq_l8r86oA_ZxLWZty3';
const tables={qrs:'tocaqui_admin_qr_cards',clients:'tocaqui_admin_qr_clients',templates:'tocaqui_admin_qr_templates'};
let db, user, stored={}, queues={};
const notice=document.createElement('div');
notice.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:9999;padding:10px;background:#991b1b;color:white;font:14px sans-serif;text-align:center;display:none';
document.body.appendChild(notice);
function errorMessage(text){notice.textContent=text;notice.style.display='block';}
window.storageSync=(kind,values)=>{
  const snapshot=structuredClone(values);
  queues[kind]=(queues[kind]||Promise.resolve()).catch(()=>{}).then(async()=>{
    const d=changes(stored[kind]||[],snapshot);
    if(d.upserts.length){const {error}=await db.from(tables[kind]).upsert(d.upserts.map(x=>({id:x.id,owner_id:user.id,data:x})));if(error)throw error;}
    if(d.deletes.length){const {error}=await db.from(tables[kind]).delete().in('id',d.deletes);if(error)throw error;}
    stored[kind]=snapshot;
  }).catch(e=>{errorMessage('No se pudo guardar en la base de datos. No cierres el panel: '+e.message);throw e;});
  queues[kind].catch(()=>{});
};
window.loadPlaces=()=>window.mapsReady ||= new Promise(async(resolve,reject)=>{
 try{
  const config={mapsKey:localStorage.getItem('google_places_api_key_v6') || ''};
  if(!config.mapsKey) throw Error('missing key');
  window.gm_authFailure=()=>reject(Error('Google Maps no autorizó este dominio'));
  window.onTocaquiMapsReady=()=>resolve();
  const script=document.createElement('script');script.onerror=()=>reject(Error('No se pudo cargar Google Maps'));
  script.src='https://maps.googleapis.com/maps/api/js?key='+encodeURIComponent(config.mapsKey)+'&libraries=places&callback=onTocaquiMapsReady&loading=async';document.head.appendChild(script);
 }catch(e){reject(e)}
});
function login(){
 document.getElementById('root').innerHTML=`<main style="min-height:100vh;display:grid;place-items:center;background:#020617;color:white;font-family:Inter,sans-serif"><form id="login" style="width:min(360px,90vw);padding:28px;background:#0b1427;border-radius:20px"><h2>TOCAQUI · Acceso</h2><p>Ingresa con tu cuenta autorizada.</p><input name="email" type="email" placeholder="Correo electrónico" required style="width:100%;padding:12px;margin:8px 0;color:#111"><input name="password" type="password" placeholder="Contraseña" required style="width:100%;padding:12px;margin:8px 0;color:#111"><button style="width:100%;padding:12px;background:#2563eb;color:white;border:0;border-radius:8px">Ingresar</button><p id="login-error" role="alert"></p></form></main>`;
 document.getElementById('login').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);const {error}=await db.auth.signInWithPassword({email:f.get('email'),password:f.get('password')});if(error)document.getElementById('login-error').textContent='No se pudo ingresar. Revisa tu correo y contraseña.';else await start();};
}
async function start(){
 const result=await db.auth.getUser();user=result.data.user;if(!user){login();return;}
 try{
  const values=await Promise.all(Object.entries(tables).map(async ([name,table])=>{const {data,error}=await db.from(table).select('data');if(error)throw error;return [name,data.map(r=>r.data)];}));
  const initial=Object.fromEntries(values);stored=structuredClone(initial);
  if(!initial.templates.length)stored.templates=[];
  for(let i=0;i<100 && !window.startPanel;i++)await new Promise(r=>setTimeout(r,100));
  if(!window.startPanel)throw Error('El panel no pudo iniciar');
  window.startPanel(initial);
 }catch(e){errorMessage('No se pudo cargar la base de datos: '+e.message);}
}
async function boot(){for(let i=0;i<100&&!window.supabase;i++)await new Promise(r=>setTimeout(r,100));if(!window.supabase)throw Error('No se pudo cargar el acceso seguro');db=window.supabase.createClient(url,key);window.db=db;await start();}
boot().catch(e=>errorMessage('No se pudo iniciar el panel: '+e.message));
