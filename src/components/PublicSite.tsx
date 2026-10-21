import React, {useState, type ReactNode} from 'react';
import {ArrowRight, ArrowUpRight, CalendarDays, Car, Check, ChevronDown, ChevronRight, Clock, Code2, Fuel, Gauge, KeyRound, LoaderCircle, Menu, Navigation, Phone, Search, ShieldCheck, Sparkles, Users, Wrench, X} from 'lucide-react';
import {money, type Vehicle} from '../data';
import {viewPaths} from '../lib/routes';
import '../styles/public.css';

function HighwayVisual({onExplore}:{onExplore:()=>void}){
 return (
  <div className="highway-hero-viewport" aria-label="Visualización de autopista y vehículo en tiempo real">
   <div className="highway-frost-trees" aria-hidden="true">
    <svg viewBox="0 0 200 400" className="highway-trees-svg" preserveAspectRatio="none">
     <defs>
      <linearGradient id="snowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
       <stop offset="0%" stopColor="rgba(240, 244, 248, 0)" />
       <stop offset="40%" stopColor="rgba(240, 244, 248, 0.6)" />
       <stop offset="100%" stopColor="rgba(255, 255, 255, 0.95)" />
      </linearGradient>
      <filter id="frostBlur">
       <feGaussianBlur stdDeviation="4" />
      </filter>
     </defs>
     <rect width="200" height="400" fill="url(#snowGrad)" />
     <g opacity="0.65" fill="#dbe3ea">
      <circle cx="160" cy="60" r="42" filter="url(#frostBlur)" />
      <circle cx="175" cy="140" r="50" filter="url(#frostBlur)" />
      <circle cx="150" cy="230" r="46" filter="url(#frostBlur)" />
      <circle cx="180" cy="320" r="54" filter="url(#frostBlur)" />
      <circle cx="165" cy="380" r="48" filter="url(#frostBlur)" />
     </g>
     <g opacity="0.85" fill="#edf2f7">
      <circle cx="170" cy="70" r="32" />
      <circle cx="185" cy="150" r="38" />
      <circle cx="160" cy="240" r="35" />
      <circle cx="190" cy="330" r="40" />
     </g>
    </svg>
   </div>
   <div className="highway-road" aria-hidden="true">
    <div className="highway-lanes-anim" />
    <div className="highway-gps-track">
     <div className="highway-gps-glow" />
    </div>
    <div className="highway-waypoint" title="Navegación Popayán">
     <div className="waypoint-radar" />
     <div className="waypoint-badge">
      <Navigation size={14} className="waypoint-arrow" />
     </div>
    </div>
    <div className="highway-car-anim" title="Auto en circulación">
     <svg viewBox="0 0 160 300" className="highway-car-svg" role="img" aria-label="Auto blanco en marcha">
      <defs>
       <filter id="carRealisticShadow" x="-35%" y="-25%" width="180%" height="170%">
        <feDropShadow dx="16" dy="20" stdDeviation="14" floodColor="rgba(15, 23, 42, 0.28)" />
        <feDropShadow dx="4" dy="6" stdDeviation="5" floodColor="rgba(15, 23, 42, 0.16)" />
       </filter>
       <linearGradient id="carBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="20%" stopColor="#ffffff" />
        <stop offset="80%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#e2e8f0" />
       </linearGradient>
       <linearGradient id="carGlassRoof" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e2430" />
        <stop offset="50%" stopColor="#0b0e14" />
        <stop offset="100%" stopColor="#141923" />
       </linearGradient>
       <linearGradient id="glassGlare" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
        <stop offset="35%" stopColor="rgba(255,255,255,0.08)" />
        <stop offset="100%" stopColor="transparent" />
       </linearGradient>
       <linearGradient id="headlightBeam" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="rgba(147, 197, 253, 0.45)" />
        <stop offset="100%" stopColor="rgba(147, 197, 253, 0)" />
       </linearGradient>
      </defs>
      <path d="M 46 16 L 16 -120 L 144 -120 L 114 16 Z" fill="url(#headlightBeam)" />
      <g filter="url(#carRealisticShadow)">
       <rect x="29" y="52" width="8" height="26" rx="3" fill="#1e293b" />
       <rect x="123" y="52" width="8" height="26" rx="3" fill="#1e293b" />
       <rect x="29" y="210" width="8" height="26" rx="3" fill="#1e293b" />
       <rect x="123" y="210" width="8" height="26" rx="3" fill="#1e293b" />
       <path d="M 36 90 C 24 90 22 102 31 106 C 36 107 38 100 38 95 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
       <path d="M 124 90 C 136 90 138 102 129 106 C 124 107 122 100 122 95 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
       <path d="M 46 38 C 46 16, 62 8, 80 8 C 98 8, 114 16, 114 38 C 117 62, 119 95, 119 125 C 119 168, 118 215, 115 256 C 113 282, 98 292, 80 292 C 62 292, 47 282, 45 256 C 42 215, 41 168, 41 125 C 41 95, 43 62, 46 38 Z" fill="url(#carBodyGrad)" stroke="#e2e8f0" strokeWidth="1.2" />
       <path d="M 52 24 C 54 44, 56 60, 57 72" stroke="#e2e8f0" strokeWidth="1.2" fill="none" />
       <path d="M 108 24 C 106 44, 104 60, 103 72" stroke="#e2e8f0" strokeWidth="1.2" fill="none" />
       <path d="M 48 76 C 54 73, 70 71, 80 71 C 90 71, 106 73, 112 76 C 115 82, 116 106, 116 116 L 44 116 C 44 106, 45 82, 48 76 Z" fill="url(#carGlassRoof)" />
       <rect x="44" y="118" width="72" height="66" rx="2" fill="url(#carGlassRoof)" />
       <path d="M 45 186 L 115 186 C 114 202, 111 220, 107 228 C 98 233, 89 235, 80 235 C 71 235, 62 233, 53 228 C 49 220, 46 202, 45 186 Z" fill="url(#carGlassRoof)" />
       <path d="M 52 78 L 74 74 L 66 226 L 47 220 Z" fill="url(#glassGlare)" />
       <path d="M 48 20 C 53 16, 61 14, 67 15" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" fill="none" />
       <path d="M 112 20 C 107 16, 99 14, 93 15" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" fill="none" />
       <path d="M 49 284 C 62 288, 98 288, 111 284" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </g>
     </svg>
    </div>
   </div>
   <aside className="highway-hud-card" aria-label="Información de sede y servicio">
    <div className="hud-badge-row">
     <span className="hud-rating-pill">4.4/5</span>
    </div>
    <h3 className="hud-title">1 Infinite Loop</h3>
    <p className="hud-address">Popayán, Cauca 190001, COL</p>
    <p className="hud-stat">324 conductores han solicitado vehículos en los últimos 7 días.</p>
    <div className="hud-metrics">
     <div className="hud-metric-row">
      <div className="hud-metric-label"><Car size={13}/><span>Avg. daily traffic</span></div>
      <span className="hud-status-dots"><i/><i/><i/> ALTO</span>
     </div>
     <div className="hud-substat">72,738 vehículos</div>
     <div className="hud-metric-row">
      <div className="hud-metric-label"><ShieldCheck size={13}/><span>Nearby amenities</span></div>
      <span className="hud-status-dots"><i/><i/><i/> ALTO</span>
     </div>
     <div className="hud-substat">En menos de 10 minutos</div>
    </div>
    <button type="button" className="hud-action-link" onClick={onExplore}>
     <span>Más info</span>
     <ChevronRight size={14}/>
    </button>
   </aside>
  </div>
 );
}

type Props = {view:string; vehicles:Vehicle[]; services:any[]; sample:boolean; settings:any; session:any; user:any; authReady:boolean; authError:string; loadError:string; gate?:'loading'|'signin'|'forbidden'; onNavigate:(view:string)=>void; onAuth:(mode:'signin'|'signup')=>void; onModal:(value:any)=>void; onRetry:()=>void; userButton:ReactNode; portalContent:ReactNode};
export default function PublicSite(p:Props) {
 const [menu,setMenu]=useState(false),[search,setSearch]=useState(''),[category,setCategory]=useState('Todos'),[devPopup,setDevPopup]=useState(true);
 const navigate=(view:string)=>{setMenu(false);p.onNavigate(view);};
 const link=(view:string,label:string)=> <a href={viewPaths[view]} aria-current={p.view===view?'page':undefined} onClick={e=>{e.preventDefault();navigate(view);}}>{label}</a>;
 const sale=p.view==='marketplace';
 const list=p.vehicles.filter(v=>(!sale||v.sale_price)&&(category==='Todos'||v.category===category)&&`${v.name} ${v.brand}`.toLowerCase().includes(search.toLowerCase()));
 const cars=(items:Vehicle[],forSale=false)=><div className="public-cars">{items.map(v=><button className="public-car" key={v.id} onClick={()=>p.onModal({type:'vehicle',vehicle:v,sale:forSale})}><div className="public-car-photo"><img src={v.image} alt={v.name} loading="lazy"/><span>{v.status==='available'?'Disponible':'En taller'}</span></div><div className="public-car-info"><span>{v.category} / {v.year}</span><h3>{v.name}</h3><div className="public-car-specs"><span><Users size={14}/>{v.seats} plazas</span><span><Gauge size={14}/>{v.transmission}</span><span><Fuel size={14}/>{v.fuel}</span></div><div className="public-car-price"><span><b>{money(forSale?v.sale_price||0:v.daily_rate)}</b>{!forSale&&<small> / día</small>}</span><ArrowUpRight size={21}/></div></div></button>)}</div>;
 const sampleNote=p.sample&&<p className="public-sample"><ShieldCheck size={15}/> Catálogo de ejemplo. Las solicitudes requieren confirmación del negocio.</p>;
 return <div className="public-site">
  <a className="public-skip" href="#public-content">Saltar al contenido</a>
  <header className="public-header"><div className="public-nav-wrap"><a className="public-brand" href="/" aria-label="PopayanLink, inicio" onClick={e=>{e.preventDefault();navigate('landing');}}><span>p</span>popayanlink<b>.</b></a><nav className={menu?'public-nav is-open':'public-nav'} aria-label="Navegación principal">{link('website','Alquilar un auto')}{link('workshop','Taller')}{link('marketplace','Comprar un auto')}</nav><div className="public-account">{p.user?<>{p.session?.admin&&link('dashboard','Mi panel')}{link('portal','Mi portal')}{p.userButton}</>:<><button className="public-login" onClick={()=>p.onAuth('signin')} disabled={!!p.session?.clerkKey&&!p.authReady&&!p.authError}>Iniciar sesión</button><button className="public-btn public-btn-dark public-signup" onClick={()=>p.onAuth('signup')} disabled={!!p.session?.clerkKey&&!p.authReady&&!p.authError}>Crear cuenta</button></>}<button className="public-menu" aria-label={menu?'Cerrar menú':'Abrir menú'} aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></div></div></header>
  <main id="public-content" className="public-main">
   {p.session?.clerkKey?.startsWith('pk_test_')&&<div className="public-test"><span/>Entorno de prueba. Puedes explorar y enviar solicitudes; no se realizan cargos automáticos.</div>}
   {(p.authError||p.loadError)&&<div className="public-error" role="alert">{p.authError||p.loadError}<button onClick={p.onRetry}>Reintentar</button></div>}
   {(p.gate||p.view==='signin')?<section className="public-access"><span className="public-access-icon">{p.gate==='loading'?<LoaderCircle className="spin" size={30}/>:<KeyRound size={30}/>}</span><p>Área privada de PopayanLink</p><h1>{p.gate==='loading'?'Comprobando tu acceso':p.gate==='forbidden'?'Esta cuenta no tiene acceso al panel.':'Tu negocio empieza aquí.'}</h1><p>{p.gate==='loading'?'Estamos verificando tu sesión de forma segura.':p.gate==='forbidden'?'El panel está reservado al equipo autorizado. Puedes gestionar tus solicitudes desde tu portal.':'Inicia sesión con una cuenta autorizada para entrar al panel de administración.'}</p>{p.gate!=='loading'&&<div className="public-access-actions">{p.gate==='forbidden'?<button className="public-btn public-btn-orange" onClick={()=>navigate('portal')}>Ir a mi portal <ArrowRight size={17}/></button>:<button className="public-btn public-btn-orange" onClick={()=>p.onAuth('signin')} disabled={!!p.session?.clerkKey&&!p.authReady&&!p.authError}>Iniciar sesión <ArrowRight size={17}/></button>}<button className="public-btn public-btn-outline" onClick={()=>navigate('landing')}>Volver al inicio</button></div>}<small><ShieldCheck size={14}/> Tus datos se verifican en el servidor.</small></section>:p.view==='landing'?<>
    <section className="public-hero-new">
     <div className="public-hero-copy">
      <h1>El camino empieza con un buen auto.</h1>
      <p>Identifica y reserva tu vehículo o agenda servicio de taller cerca de ti para que nunca detengas tu camino.</p>
      <div className="public-hero-actions">
       <a className="public-btn-dark-pill" href="/catalogo" onClick={e=>{e.preventDefault();navigate('website');}}>
        Comenzar gratis <ArrowRight size={16}/>
       </a>
      </div>
      <ul className="public-hero-checklist" aria-label="Beneficios principales">
       <li><Check size={14} className="hero-check-icon"/> Cotización y reserva en minutos</li>
       <li><Check size={14} className="hero-check-icon"/> Flota garantizada y revisada</li>
       <li><Check size={14} className="hero-check-icon"/> Taller con citas en tiempo real</li>
       <li><Check size={14} className="hero-check-icon"/> Asistencia en carretera 24/7</li>
      </ul>
     </div>
     <HighwayVisual onExplore={()=>navigate('website')}/>
    </section>
    <section className="public-service-strip" aria-label="Nuestros servicios">{[{view:'website',title:'Alquila a tu ritmo',text:'Elige el auto, las fechas y cómo quieres viajar.',Icon:Car},{view:'workshop',title:'Cuida tu auto',text:'Consulta servicios y solicita tu cita de taller.',Icon:Wrench},{view:'marketplace',title:'Encuentra tu próximo auto',text:'Explora opciones y agenda una prueba de manejo.',Icon:KeyRound}].map(s=><a href={viewPaths[s.view]} key={s.view} onClick={e=>{e.preventDefault();navigate(s.view);}}><s.Icon size={25}/><div><h2>{s.title}</h2><p>{s.text}</p></div><ArrowUpRight size={20}/></a>)}</section>
    <section className="public-section"><div className="public-section-heading"><div><p>Elige tu compañero de viaje</p><h2>Listos para tu próximo destino.</h2></div><a className="public-text-link" href="/catalogo" onClick={e=>{e.preventDefault();navigate('website');}}>Ver todos los vehículos <ArrowRight size={17}/></a></div>{sampleNote}{cars(p.vehicles.filter(v=>v.status==='available').slice(0,3))}{!p.vehicles.length&&<div className="public-empty">Estamos preparando el catálogo. Déjanos tu consulta y te ayudamos a encontrar un auto.<button className="public-text-link" onClick={()=>p.onModal({type:'callback'})}>Solicitar información <ArrowRight size={16}/></button></div>}</section>
    <section className="public-care"><div className="public-care-art"><Wrench size={64} strokeWidth={1}/><span>Un poco de cuidado.<br/>Muchos kilómetros por delante.</span></div><div className="public-care-copy"><p>También estamos para cuidar de él</p><h2>Tu auto en buenas manos.</h2><p>Del cambio de aceite al diagnóstico electrónico. Consulta los servicios, conoce el presupuesto y solicita el horario que mejor te venga.</p><a className="public-btn public-btn-dark" href="/taller" onClick={e=>{e.preventDefault();navigate('workshop');}}>Ver servicios de taller <ArrowUpRight size={18}/></a><small><Clock size={14}/> Lunes a sábado, de 8:00 a 18:00 · Bogotá</small></div></section>
    <section className="public-section public-faq"><div><p>Antes de salir</p><h2>Resolvemos tus dudas.</h2><button className="public-text-link" onClick={()=>p.onModal({type:'callback'})}>Quiero que me contacten <ArrowRight size={17}/></button></div><div>{[{q:'¿Puedo alquilar con conductor?',a:'Sí. Puedes elegir con o sin conductor al solicitar el presupuesto. El formulario muestra el costo del conductor antes de confirmar.'},{q:'¿Cómo se confirma mi reserva?',a:'Primero recibes el presupuesto y envías tu solicitud. El equipo revisa la disponibilidad y confirma los detalles del servicio y el pago. Enviar una solicitud no realiza ningún cargo.'},{q:'¿Puedo probar un auto antes de comprarlo?',a:'Puedes solicitar una prueba de manejo desde la ficha de un vehículo en venta. El equipo confirmará el horario contigo.'},{q:'¿Puedo publicar mi propio auto?',a:'Sí. Envía los datos y una fotografía desde “Publicar mi auto”. Tu vehículo se revisará antes de aparecer en el catálogo.'}].map(f=><details key={f.q}><summary>{f.q}<ChevronDown size={18}/></summary><p>{f.a}</p></details>)}</div></section>
    <section className="public-owner"><div><h2>Tu auto también tiene planes.</h2><p>Publícalo para alquilar y abre la puerta a nuevas oportunidades.</p></div><button className="public-btn public-btn-orange" onClick={()=>p.onModal({type:'listing'})}>Publicar mi auto <ArrowUpRight size={18}/></button></section>
   </>:p.view==='website'||sale?<section className="public-section public-page"><div className="public-page-heading"><p>{sale?'Tu próximo auto te espera':'Un auto para cada plan'}</p><h1>{sale?'Encuentra el que va contigo.':'¿A dónde quieres ir?'}</h1><p>{sale?'Consulta los precios y solicita una visita o prueba de manejo.':'Elige un vehículo y calcula tu presupuesto antes de reservar.'}</p></div><div className="public-catalog-tools"><label><Search size={18}/><input aria-label="Buscar vehículo" placeholder="Busca una marca o modelo" value={search} onChange={e=>setSearch(e.target.value)}/></label><div className="public-categories">{['Todos','SUV','Sedán','Deportivo'].map(c=><button aria-pressed={category===c} className={category===c?'active':''} key={c} onClick={()=>setCategory(c)}>{c}</button>)}</div><button className="public-btn public-btn-outline" onClick={()=>p.onModal({type:'availability'})}><CalendarDays size={17}/> Buscar por fechas</button></div>{sampleNote}{cars(list,sale)}{!list.length&&<p className="public-empty">No hay vehículos con estos filtros. Prueba otra búsqueda.</p>}</section>:p.view==='workshop'?<section className="public-section public-page"><div className="public-page-heading"><p>Taller y mantenimiento</p><h1>Que nada detenga tu camino.</h1><p>Consulta precios y solicita una cita. Lunes a sábado, de 8:00 a 18:00 en Bogotá.</p></div><div className="public-services">{p.services.map(s=><article key={s.id}><Wrench size={26}/><h2>{s.name}</h2><p>{s.description}</p><small><Clock size={14}/>{s.duration} minutos</small><div><b>{money(s.price)}</b><button className="public-text-link" onClick={()=>p.onModal({type:'booking',kind:'repair',service:s})}>{p.settings.repair===false?'Recibir novedades':'Agendar cita'} <ArrowRight size={17}/></button></div></article>)}</div>{!p.services.length&&<p className="public-empty">El taller está preparando sus servicios. Solicita información y te contactamos.</p>}</section>:p.view==='portal'?<section className="public-section public-page"><div className="public-page-heading"><p>Tu espacio en PopayanLink</p><h1>Mis reservas.</h1><p>{p.session?.guest?'Estas solicitudes están vinculadas a este navegador. Las reservas de invitado no se transfieren al iniciar sesión.':'Consulta tus solicitudes y los detalles de cada servicio.'}</p></div>{p.portalContent}</section>:null}
  </main>
  <footer className="public-footer"><div className="public-footer-top"><div><a href="/" className="public-brand" onClick={e=>{e.preventDefault();navigate('landing');}}><span>p</span>popayanlink<b>.</b></a><p>Tu próximo camino, en un solo lugar.</p></div><div><h2>Encuentra tu camino</h2>{link('website','Alquiler de vehículos')}{link('workshop','Taller y mantenimiento')}{link('marketplace','Autos en venta')}</div><div><h2>Vamos contigo</h2>{link('portal','Mis reservas')}<button onClick={()=>p.onModal({type:'callback'})}>Solicitar una llamada</button><button onClick={()=>p.onModal({type:'listing'})}>Publicar mi auto</button></div></div><div className="public-footer-bottom"><span>© {new Date().getFullYear()} PopayanLink · <button type="button" className="dev-footer-link" onClick={()=>p.onModal({type:'developer'})}>Desarrollado por ALEJANDRO LOPEZ MURILLO</button></span><a href="/dashboard" onClick={e=>{e.preventDefault();navigate('dashboard');}}><ShieldCheck size={14}/> Acceso del equipo</a></div></footer>
  {devPopup?(<aside className="dev-credit-popup" role="dialog" aria-label="Créditos del desarrollador"><div className="dev-credit-content" onClick={()=>p.onModal({type:'developer'})} style={{cursor:'pointer'}}><div className="dev-credit-badge"><Sparkles size={12}/><span>Desarrollador</span></div><p className="dev-credit-title">Desarrollado por</p><h4 className="dev-credit-name">ALEJANDRO LOPEZ MURILLO</h4><p className="dev-credit-desc">Ingeniería & arquitectura de software · PopayanLink</p></div><button type="button" className="dev-credit-close" onClick={()=>setDevPopup(false)} aria-label="Cerrar aviso"><X size={15}/></button></aside>):(<button type="button" className="dev-credit-pill-btn" onClick={()=>setDevPopup(true)} title="Ver desarrollador"><Code2 size={13}/><span>Desarrollado por ALEJANDRO LOPEZ MURILLO</span></button>)}
 </div>;
}
