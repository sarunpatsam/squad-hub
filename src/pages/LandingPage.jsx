import { useState, useEffect } from "react";

const SOCIAL = {
  line:      "https://line.me/R/ti/p/@671qaibj",
  tiktok:    "https://www.tiktok.com/@squadhub.th",
  facebook:  "https://www.facebook.com/profile.php?id=61589260946023",
  instagram: "https://www.instagram.com/squadhub.th",
  app:       "https://liff.line.me/2009451264-q3ueO8ay",
};

const C = {
  bg:"#050f0a", bg2:"#071209", bg3:"#0c1a11",
  surface:"rgba(16,212,132,0.05)", s2:"rgba(255,255,255,0.03)",
  border:"rgba(16,212,132,0.12)", borderHi:"rgba(16,212,132,0.28)",
  green:"#10d484", greenBr:"#34eba0",
  text:"#f0fff8", sub:"#6b9e85", muted:"#3a6350",
  amber:"#fbbf24", red:"#f87171",
};

const TIERS = [
  { name:"Bronze",   color:"#d97706", stops:["#92400e","#d97706"], ovr:65, pos:"MF", initial:"บ" },
  { name:"Silver",   color:"#94a3b8", stops:["#64748b","#cbd5e1"], ovr:72, pos:"FW", initial:"ส" },
  { name:"Gold",     color:"#fde047", stops:["#a16207","#fde047"], ovr:81, pos:"GK", initial:"อ" },
  { name:"Platinum", color:"#e2e8f0", stops:["#94a3b8","#f1f5f9"], ovr:89, pos:"DF", initial:"ก" },
  { name:"Diamond",  color:"#67e8f9", stops:["#0891b2","#67e8f9"], ovr:96, pos:"MF", initial:"ป" },
];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800;900&family=Sarabun:wght@700;800;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  html{scroll-behavior:smooth;}
  body{background:#050f0a;color:#f0fff8;font-family:'DM Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}
  a{text-decoration:none;color:inherit;}
  @keyframes float {0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
  @keyframes floatB{0%,100%{transform:translateY(0) rotate(-8deg)}50%{transform:translateY(-10px) rotate(-8deg)}}
  @keyframes floatC{0%,100%{transform:translateY(0) rotate(5deg)} 50%{transform:translateY(-14px) rotate(5deg)}}
  @keyframes glow  {0%,100%{opacity:.2}50%{opacity:.55}}
  @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
  @keyframes fu    {from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
  @keyframes xpbar {from{width:0}to{width:72%}}
  .float {animation:float  5s ease-in-out infinite;}
  .floatB{animation:floatB 7s ease-in-out infinite;}
  .floatC{animation:floatC 6s ease-in-out infinite;}
  .gl    {animation:glow   3.5s ease-in-out infinite;}
  .fu    {animation:fu     .7s cubic-bezier(.22,1,.36,1) both;}
  .xpbar {animation:xpbar 1.8s cubic-bezier(.22,1,.36,1) .4s both;}
  a:hover{opacity:.85;}
  ::-webkit-scrollbar{width:4px;}
  ::-webkit-scrollbar-thumb{background:rgba(16,212,132,0.18);border-radius:99px;}
  @media(max-width:768px){
    .hero-grid {flex-direction:column!important;}
    .hero-h1   {font-size:46px!important;letter-spacing:-1.5px!important;}
    .card-col  {display:none!important;}
    .hide-mob  {display:none!important;}
    .g3{grid-template-columns:1fr!important;}
    .g2{grid-template-columns:1fr!important;}
    .steps-row {flex-direction:column!important;gap:28px!important;}
    .step-line {display:none!important;}
    .tier-row  {overflow-x:auto!important;flex-wrap:nowrap!important;justify-content:flex-start!important;padding-bottom:12px;}
    .tier-row::-webkit-scrollbar{height:3px;}
    .foot-row  {flex-direction:column!important;align-items:center!important;text-align:center;}
  }
`;

/* ─── SVG Logo Icon (always crisp) ─── */
const LogoIcon = ({ size=36 }) => {
  const c = size/2, r = size/2 - 1.8;
  const pts = [...Array(6)].map((_,i)=>{
    const a=(i*60-90)*Math.PI/180;
    return `${c+r*Math.cos(a)},${c+r*Math.sin(a)}`;
  });
  const corners = [...Array(6)].map((_,i)=>{
    const a=(i*60-90)*Math.PI/180;
    return {x:c+r*Math.cos(a), y:c+r*Math.sin(a)};
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" style={{flexShrink:0}}>
      <defs>
        <filter id={`gs${size}`}>
          <feGaussianBlur stdDeviation="1.2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <polygon points={pts.join(" ")} fill="#071209" stroke="#10d484" strokeWidth="1.5"/>
      {corners.map((d,i)=><circle key={i} cx={d.x} cy={d.y} r={size*0.044} fill="#10d484" opacity=".5"/>)}
      <line x1={c} y1={c-r*0.55} x2={c} y2={c+r*0.55} stroke="#10d484" strokeWidth="0.6" opacity=".25"/>
      <line x1={c-r*0.55} y1={c} x2={c+r*0.55} y2={c} stroke="#10d484" strokeWidth="0.6" opacity=".25"/>
      <text x={c} y={c+size*0.18} textAnchor="middle" fill="#10d484"
        fontSize={size*0.42} fontWeight="900" fontFamily="'DM Sans',system-ui"
        filter={`url(#gs${size})`}>S</text>
    </svg>
  );
};

/* ─── Logo Wordmark ─── */
const Logo = ({ sm }) => (
  <div style={{display:"flex",alignItems:"center",gap:sm?7:10,flexShrink:0}}>
    <LogoIcon size={sm?28:36}/>
    <div>
      <div style={{display:"flex",alignItems:"center",gap:4,lineHeight:1}}>
        <span style={{fontSize:sm?13:16,fontWeight:900,letterSpacing:1.5,color:C.text}}>SQUAD</span>
        <div style={{padding:"1px 6px",border:`1.5px solid ${C.green}`,borderRadius:3}}>
          <span style={{fontSize:sm?13:16,fontWeight:900,letterSpacing:1.5,color:C.green}}>HUB</span>
        </div>
      </div>
      {!sm&&<div style={{fontSize:6.5,fontWeight:700,letterSpacing:3,color:C.muted,textTransform:"uppercase",marginTop:3}}>Football Community</div>}
    </div>
  </div>
);

/* ─── Buttons ─── */
const PrimaryBtn = ({children,href,style={}}) => (
  <a href={href} target="_blank" rel="noopener noreferrer" style={{
    display:"inline-flex",alignItems:"center",gap:8,padding:"14px 30px",borderRadius:12,
    fontSize:15,fontWeight:800,background:`linear-gradient(135deg,#00c96b,${C.green})`,
    color:"#001a0d",border:"none",cursor:"pointer",
    boxShadow:`0 0 28px rgba(16,212,132,0.3),0 4px 16px rgba(16,212,132,0.15)`,
    transition:"all .2s",...style,
  }}>{children}</a>
);

const GhostBtn = ({children,href,style={}}) => (
  <a href={href} target="_blank" rel="noopener noreferrer" style={{
    display:"inline-flex",alignItems:"center",gap:8,padding:"14px 22px",borderRadius:12,
    fontSize:14,fontWeight:700,background:"transparent",color:C.green,
    border:`1.5px solid ${C.borderHi}`,cursor:"pointer",transition:"all .2s",...style,
  }}>{children}</a>
);

const SLabel = ({children}) => (
  <div style={{display:"inline-block",fontSize:11,fontWeight:800,letterSpacing:3,color:C.green,
    textTransform:"uppercase",padding:"4px 14px",borderRadius:99,marginBottom:16,
    background:"rgba(16,212,132,0.07)",border:`1px solid rgba(16,212,132,0.2)`}}>
    {children}
  </div>
);

/* ─── Player Card ─── */
const PlayerCard = ({name,color,stops,ovr,pos,initial,size=1}) => {
  const W=160*size, H=220*size, f=n=>Math.round(n*size);
  return (
    <div style={{width:W,height:H,borderRadius:f(14),position:"relative",overflow:"hidden",flexShrink:0,
      background:`linear-gradient(150deg,${stops[0]}cc,#060f0a)`,
      border:`1px solid ${color}35`,
      boxShadow:`0 0 28px ${color}25,0 10px 36px rgba(0,0,0,0.6)`}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:f(3),
        background:`linear-gradient(90deg,transparent,${color},transparent)`}}/>
      <div style={{position:"absolute",inset:0,
        background:`radial-gradient(ellipse at 50% 20%,${color}18,transparent 65%)`,pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:f(11),left:f(11)}}>
        <div style={{fontSize:f(6.5),fontWeight:900,letterSpacing:2,color:`${color}80`,textTransform:"uppercase"}}>{name}</div>
      </div>
      <div style={{position:"absolute",top:f(9),right:f(11),textAlign:"right"}}>
        <div style={{fontSize:f(28),fontWeight:900,color,lineHeight:1,textShadow:`0 0 14px ${color}90`}}>{ovr}</div>
        <div style={{fontSize:f(7),fontWeight:700,color:`${color}80`,letterSpacing:1}}>{pos}</div>
      </div>
      <div style={{position:"absolute",top:f(46),left:"50%",transform:"translateX(-50%)",
        width:f(72),height:f(72),borderRadius:"50%",
        background:`radial-gradient(circle at 35% 35%,${color}28,${color}06)`,
        border:`1.5px solid ${color}45`,
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:f(28),fontWeight:900,color,fontFamily:"'Sarabun',system-ui",
        boxShadow:`0 0 22px ${color}28`}}>{initial}</div>
      <div style={{position:"absolute",top:f(46),right:f(9),opacity:.3}}>
        <LogoIcon size={f(18)}/>
      </div>
      <div style={{position:"absolute",top:f(126),left:f(10),right:f(10),height:1,
        background:`linear-gradient(90deg,transparent,${color}40,transparent)`}}/>
      <div style={{position:"absolute",top:f(134),left:f(8),right:f(8),
        display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:f(3)}}>
        {[["PAC",Math.round(ovr*.97)],["PAS",Math.round(ovr*.94)],["SHO",Math.round(ovr*.91)]].map(([k,v])=>(
          <div key={k} style={{textAlign:"center"}}>
            <div style={{fontSize:f(15),fontWeight:900,color,lineHeight:1}}>{v}</div>
            <div style={{fontSize:f(6),fontWeight:700,color:`${color}60`,letterSpacing:.5,marginTop:f(2)}}>{k}</div>
          </div>
        ))}
      </div>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:f(18),
        background:`linear-gradient(0deg,${color}20,transparent)`,borderTop:`1px solid ${color}15`,
        display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:f(6),fontWeight:800,color:`${color}60`,letterSpacing:3,textTransform:"uppercase"}}>
        SQUAD HUB
      </div>
    </div>
  );
};

/* ─── Phone Mockup wrapper ─── */
const Phone = ({children,style={}}) => (
  <div style={{
    width:220,flexShrink:0,borderRadius:28,overflow:"hidden",
    background:"#060f08",border:`1.5px solid rgba(16,212,132,0.2)`,
    boxShadow:`0 24px 60px rgba(0,0,0,0.7),0 0 0 1px rgba(16,212,132,0.08)`,
    ...style,
  }}>
    <div style={{height:10,background:"#040c06",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:40,height:3,borderRadius:99,background:"rgba(16,212,132,0.15)"}}/>
    </div>
    {children}
  </div>
);

/* ═══ MAIN ═══════════════════════════════════════ */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>50);
    window.addEventListener("scroll",fn); return ()=>window.removeEventListener("scroll",fn);
  },[]);

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,overflowX:"hidden"}}>
      <style>{STYLES}</style>

      {/* ══ NAV ══ */}
      <nav style={{
        position:"fixed",top:0,left:0,right:0,zIndex:100,height:62,
        padding:"0 28px",display:"flex",alignItems:"center",justifyContent:"space-between",
        background:scrolled?"rgba(5,15,10,0.93)":"transparent",
        backdropFilter:scrolled?"blur(18px)":"none",
        borderBottom:scrolled?`1px solid ${C.border}`:"1px solid transparent",
        transition:"all .3s",
      }}>
        <Logo/>
        <div className="hide-mob" style={{display:"flex",gap:32}}>
          {[["#features","ฟีเจอร์"],["#identity","Player Card"],["#how","วิธีใช้"],["#partner","พาร์ทเนอร์"]].map(([h,l])=>(
            <a key={h} href={h} style={{fontSize:13,fontWeight:700,color:C.sub,transition:"color .2s"}}
              onMouseEnter={e=>e.target.style.color=C.green}
              onMouseLeave={e=>e.target.style.color=C.sub}>{l}</a>
          ))}
        </div>
        <PrimaryBtn href={SOCIAL.app} style={{padding:"9px 20px",fontSize:12}}>เริ่มเลย →</PrimaryBtn>
      </nav>

      {/* ══ HERO ══ */}
      <section style={{minHeight:"100vh",display:"flex",alignItems:"center",padding:"100px 28px 60px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,zIndex:0,pointerEvents:"none",
          backgroundImage:`linear-gradient(rgba(16,212,132,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(16,212,132,0.04) 1px,transparent 1px)`,
          backgroundSize:"60px 60px",
          maskImage:"radial-gradient(ellipse 85% 80% at 45% 50%,black 20%,transparent 72%)",
          WebkitMaskImage:"radial-gradient(ellipse 85% 80% at 45% 50%,black 20%,transparent 72%)"}}/>
        <div className="gl" style={{position:"absolute",width:900,height:900,borderRadius:"50%",
          background:"radial-gradient(circle,rgba(16,212,132,0.055) 0%,transparent 60%)",
          top:"50%",left:"40%",transform:"translate(-50%,-50%)",pointerEvents:"none",zIndex:0}}/>

        <div style={{maxWidth:1160,margin:"0 auto",width:"100%",position:"relative",zIndex:1}}>
          <div className="hero-grid" style={{display:"flex",gap:72,alignItems:"center",width:"100%"}}>
            <div style={{flex:1,minWidth:0}}>
              <div className="fu" style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:26,
                padding:"5px 14px 5px 8px",borderRadius:99,
                background:"rgba(16,212,132,0.07)",border:`1px solid rgba(16,212,132,0.22)`}}>
                <LogoIcon size={18}/>
                <span style={{fontSize:11,fontWeight:800,color:C.green,letterSpacing:.8}}>Football Community · Bangkok</span>
              </div>

              <div className="fu" style={{animationDelay:"70ms"}}>
                <h1 className="hero-h1" style={{fontSize:68,fontWeight:900,lineHeight:1.02,letterSpacing:-2.5,fontFamily:"'Sarabun','DM Sans',system-ui",color:C.text}}>เมืองนี้</h1>
                <h1 className="hero-h1" style={{fontSize:68,fontWeight:900,lineHeight:1.02,letterSpacing:-2.5,fontFamily:"'Sarabun','DM Sans',system-ui",color:C.text}}>มีนักเตะ</h1>
                <h1 className="hero-h1" style={{fontSize:68,fontWeight:900,lineHeight:1.06,letterSpacing:-2.5,fontFamily:"'Sarabun','DM Sans',system-ui",
                  background:`linear-gradient(120deg,${C.green} 0%,${C.greenBr} 55%,${C.green} 100%)`,
                  WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>รออยู่</h1>
              </div>

              <div className="fu" style={{animationDelay:"140ms",margin:"20px 0"}}>
                <div style={{width:52,height:3,borderRadius:99,background:`linear-gradient(90deg,${C.green},transparent)`}}/>
              </div>

              <p className="fu" style={{animationDelay:"190ms",fontSize:17,color:C.sub,lineHeight:1.85,marginBottom:36,maxWidth:440,fontFamily:"'Sarabun','DM Sans',system-ui"}}>
                สร้าง <strong style={{color:C.text}}>Player Card</strong> ของคุณ<br/>
                เจอทีม จองสนาม เก็บ XP และ Stats ทุกแมทช์
              </p>

              <div className="fu" style={{animationDelay:"250ms",display:"flex",flexWrap:"wrap",gap:12,marginBottom:40}}>
                <PrimaryBtn href={SOCIAL.app} style={{padding:"16px 36px",fontSize:16,borderRadius:14}}>⚽ เริ่มเลย — ฟรี</PrimaryBtn>
                <GhostBtn href={SOCIAL.line} style={{padding:"16px 22px",fontSize:14,borderRadius:14}}>💬 LINE OA</GhostBtn>
              </div>

              <div className="fu" style={{animationDelay:"310ms",display:"flex",flexWrap:"wrap",gap:10}}>
                {[["🎯","Matching System"],["📊","XP & Stats"],["🃏","Player Card"],["🔓","ฟรีตลอด"]].map(([ic,tx])=>(
                  <div key={tx} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:99,
                    fontSize:12,fontWeight:700,background:C.surface,border:`1px solid ${C.border}`,color:C.sub}}>
                    <span>{ic}</span>{tx}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — cards */}
            <div className="card-col" style={{flexShrink:0,position:"relative",width:240,height:380}}>
              <div className="gl" style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
                width:340,height:340,borderRadius:"50%",
                background:`radial-gradient(circle,${TIERS[4].color}14,transparent 65%)`,pointerEvents:"none"}}/>
              <div className="floatB" style={{position:"absolute",top:65,left:-38,opacity:.2,zIndex:1}}>
                <PlayerCard {...TIERS[1]} size={1.06}/>
              </div>
              <div className="floatC" style={{position:"absolute",top:20,right:-28,opacity:.42,zIndex:2}}>
                <PlayerCard {...TIERS[2]} size={1.06}/>
              </div>
              <div className="float" style={{position:"absolute",top:38,left:14,zIndex:3,filter:`drop-shadow(0 20px 48px ${TIERS[4].color}40)`}}>
                <PlayerCard {...TIERS[4]} size={1.24}/>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TICKER ══ */}
      <div style={{borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`,background:C.bg2,padding:"12px 0",overflow:"hidden"}}>
        <div style={{display:"flex",animation:"ticker 26s linear infinite",width:"max-content"}}>
          {[...Array(2)].map((_,ri)=>(
            <div key={ri} style={{display:"flex",alignItems:"center"}}>
              {["⚽ Football Community","🎯 Matching System","📊 XP & Stats","🃏 Player Card","🏙️ Bangkok","🙌 ทุก Level","🔓 ฟรี ไม่มีค่าสมัคร","⭐ Bronze → Diamond"].map(tx=>(
                <div key={tx+ri} style={{display:"flex",alignItems:"center",padding:"0 30px",whiteSpace:"nowrap"}}>
                  <span style={{fontSize:12,fontWeight:700,color:C.muted}}>{tx}</span>
                  <div style={{width:3,height:3,borderRadius:"50%",background:C.border,marginLeft:30}}/>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══ PAIN POINTS ══ */}
      <section style={{padding:"90px 28px",maxWidth:1100,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:56}}>
          <SLabel>ปัญหาที่นักเตะทุกคนเจอ</SLabel>
          <h2 style={{fontSize:38,fontWeight:900,lineHeight:1.2,fontFamily:"'Sarabun','DM Sans',system-ui",marginBottom:16}}>
            เคยรู้สึกแบบนี้ไหม?
          </h2>
          <p style={{fontSize:15,color:C.sub,maxWidth:460,margin:"0 auto",lineHeight:1.8}}>
            ปัญหาพวกนี้คือเหตุผลที่ SQUAD HUB ถูกสร้างขึ้นมา
          </p>
        </div>
        <div className="g2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          {[
            { pain:"หาคนเตะยากมาก",   fix:"Matching System จับคู่ให้ตรง Level และโซนในไม่กี่วินาที",   icon:"😩" },
            { pain:"ไม่รู้ว่าตัวเองเก่งแค่ไหน", fix:"XP + Stats บอกระดับฝีมือจริงจากทุกแมทช์ที่เล่น",  icon:"🤔" },
            { pain:"จองสนามยุ่งยาก ต้องโทรหลายที่", fix:"เช็ค slot จองและจ่ายได้ในแอปเดียว", icon:"😤" },
            { pain:"ไม่มีทีมประจำ เล่นแล้วก็หายไป", fix:"Room & Community ให้เล่นด้วยกันซ้ำได้ทุกสัปดาห์", icon:"😔" },
          ].map((p,i)=>(
            <div key={i} style={{padding:"24px",borderRadius:16,border:`1px solid ${C.border}`,background:C.surface,display:"flex",flexDirection:"column",gap:16}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
                <div style={{width:44,height:44,borderRadius:12,background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{p.icon}</div>
                <div>
                  <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:6,lineHeight:1.3}}>{p.pain}</div>
                  <div style={{fontSize:12,color:C.red,fontWeight:600,lineHeight:1.5}}>ปัญหาที่เจอบ่อย</div>
                </div>
              </div>
              <div style={{height:1,background:C.border}}/>
              <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                <div style={{width:20,height:20,borderRadius:"50%",background:`${C.green}15`,border:`1px solid ${C.green}35`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:C.green,flexShrink:0,marginTop:1}}>✓</div>
                <div style={{fontSize:13,color:C.sub,lineHeight:1.7}}>{p.fix}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section id="features" style={{background:C.bg2,borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`,padding:"90px 28px"}}>
        <div style={{maxWidth:1160,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:64}}>
            <SLabel>ฟีเจอร์ใน App</SLabel>
            <h2 style={{fontSize:38,fontWeight:900,lineHeight:1.2,fontFamily:"'Sarabun','DM Sans',system-ui",marginBottom:16}}>
              ครบในที่เดียว<br/><span style={{color:C.green}}>ไม่ต้องใช้หลายแอป</span>
            </h2>
          </div>

          {/* Feature 1 — Matching */}
          <div className="g2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:60,alignItems:"center",marginBottom:80}}>
            <div>
              <SLabel>Matching System</SLabel>
              <h3 style={{fontSize:30,fontWeight:900,lineHeight:1.25,fontFamily:"'Sarabun','DM Sans',system-ui",marginBottom:16}}>
                จับคู่ทีม<br/><span style={{color:C.green}}>ตรง Level ตรงโซน</span>
              </h3>
              <p style={{fontSize:14,color:C.sub,lineHeight:1.85,marginBottom:28}}>
                ระบบ Matching ดูจาก Tier, ตำแหน่งที่ต้องการ และพื้นที่ใกล้บ้าน หาแมทช์ที่ใช่ให้คุณโดยอัตโนมัติ ไม่ต้องโพสต์หาคน ไม่ต้องรอนาน
              </p>
              {["จับคู่ตาม Tier Level","เลือก Position ที่ต้องการ","แมทช์ใกล้บ้าน ไม่ต้องเดินทางไกล","แจ้งเตือนเมื่อมีแมทช์ใหม่"].map(f=>(
                <div key={f} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:C.green,flexShrink:0}}/>
                  <span style={{fontSize:13,color:C.sub}}>{f}</span>
                </div>
              ))}
            </div>
            {/* Match room mockup */}
            <Phone>
              <div style={{padding:"14px 14px 18px"}}>
                <div style={{fontSize:11,fontWeight:800,color:C.green,marginBottom:12,letterSpacing:.5}}>🎯 แมทช์สำหรับคุณ</div>
                {[
                  {name:"S-One FC",area:"ลาดพร้าว",time:"18:00",slots:5,tier:"Gold"},
                  {name:"Bangkok United",area:"รามคำแหง",time:"19:30",slots:2,tier:"Silver"},
                  {name:"The Pitch",area:"พระราม 9",time:"20:00",slots:7,tier:"Platinum"},
                ].map((m,i)=>(
                  <div key={i} style={{padding:"10px 12px",borderRadius:10,background:i===0?"rgba(16,212,132,0.08)":C.s2,border:`1px solid ${i===0?C.borderHi:C.border}`,marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <div style={{fontSize:12,fontWeight:800,color:C.text}}>⚽ {m.name}</div>
                      <div style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:99,background:i===0?`${C.green}20`:"rgba(255,255,255,0.04)",color:i===0?C.green:C.muted,border:`1px solid ${i===0?C.green+"30":C.border}`}}>{m.tier}</div>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:11,color:C.muted}}>📍 {m.area} · {m.time}</span>
                      <span style={{fontSize:11,fontWeight:700,color:C.green}}>เหลือ {m.slots} ที่</span>
                    </div>
                  </div>
                ))}
                <div style={{marginTop:12,background:`linear-gradient(135deg,#00c96b,${C.green})`,borderRadius:10,padding:"10px",textAlign:"center",fontSize:12,fontWeight:900,color:"#001a0d"}}>เข้าร่วมแมทช์ →</div>
              </div>
            </Phone>
          </div>

          {/* Feature 2 — XP & Stats */}
          <div className="g2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:60,alignItems:"center",marginBottom:80}}>
            {/* XP mockup */}
            <Phone>
              <div style={{padding:"14px 14px 18px"}}>
                <div style={{fontSize:11,fontWeight:800,color:C.green,marginBottom:14,letterSpacing:.5}}>📊 Player Stats</div>
                {/* XP bar */}
                <div style={{marginBottom:18}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontSize:12,fontWeight:800,color:C.text}}>Gold Tier</span>
                    <span style={{fontSize:11,fontWeight:700,color:C.amber}}>1,240 / 2,000 XP</span>
                  </div>
                  <div style={{height:8,background:"rgba(255,255,255,0.06)",borderRadius:99,overflow:"hidden"}}>
                    <div className="xpbar" style={{height:"100%",background:`linear-gradient(90deg,${C.amber},#fde047)`,borderRadius:99,boxShadow:`0 0 10px #fbbf2460`}}/>
                  </div>
                  <div style={{fontSize:10,color:C.muted,marginTop:4}}>อีก 760 XP → Platinum</div>
                </div>
                {/* Stats grid */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
                  {[["PAC","87"],["SHO","79"],["PAS","83"],["DRI","81"],["DEF","52"],["PHY","76"]].map(([k,v])=>(
                    <div key={k} style={{textAlign:"center",padding:"8px 4px",borderRadius:8,background:C.surface,border:`1px solid ${C.border}`}}>
                      <div style={{fontSize:16,fontWeight:900,color:C.amber}}>{v}</div>
                      <div style={{fontSize:8,fontWeight:700,color:C.muted,letterSpacing:.5,marginTop:2}}>{k}</div>
                    </div>
                  ))}
                </div>
                {/* Match history mini */}
                <div style={{fontSize:10,fontWeight:800,color:C.muted,marginBottom:8,letterSpacing:.5}}>แมทช์ล่าสุด</div>
                {[["S-One FC","ชนะ","+ 120 XP"],["Bangkok Utd","เสมอ","+ 60 XP"]].map(([n,r,xp])=>(
                  <div key={n} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",borderRadius:8,background:C.s2,border:`1px solid ${C.border}`,marginBottom:6}}>
                    <span style={{fontSize:11,color:C.sub}}>⚽ {n}</span>
                    <span style={{fontSize:11,fontWeight:700,color:r==="ชนะ"?C.green:C.amber}}>{r}</span>
                    <span style={{fontSize:11,fontWeight:800,color:C.green}}>{xp}</span>
                  </div>
                ))}
              </div>
            </Phone>
            <div>
              <SLabel>XP & Stats System</SLabel>
              <h3 style={{fontSize:30,fontWeight:900,lineHeight:1.25,fontFamily:"'Sarabun','DM Sans',system-ui",marginBottom:16}}>
                ทุกแมทช์มีความหมาย<br/><span style={{color:C.green}}>วัดผลได้จริง</span>
              </h3>
              <p style={{fontSize:14,color:C.sub,lineHeight:1.85,marginBottom:28}}>
                ไม่ใช่แค่เตะแล้วก็จบ — ทุกเกมสะสม XP เพิ่ม Stats และโต Tier ไปเรื่อยๆ เห็นพัฒนาการของตัวเองชัดเจนในทุกด้าน
              </p>
              {[
                {stat:"XP", desc:"สะสมจากแมทช์ทุกครั้ง ยิ่งเล่นมาก ยิ่งโต"},
                {stat:"6 Stats", desc:"PAC · SHO · PAS · DRI · DEF · PHY"},
                {stat:"Tier", desc:"Bronze → Silver → Gold → Platinum → Diamond"},
                {stat:"Match History", desc:"บันทึกทุกเกม ดูย้อนหลังได้ตลอด"},
              ].map(({stat,desc})=>(
                <div key={stat} style={{display:"flex",gap:14,marginBottom:16,alignItems:"flex-start"}}>
                  <div style={{padding:"3px 10px",borderRadius:99,background:`${C.green}12`,border:`1px solid ${C.green}30`,fontSize:11,fontWeight:800,color:C.green,flexShrink:0,marginTop:1}}>{stat}</div>
                  <span style={{fontSize:13,color:C.sub,lineHeight:1.7}}>{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feature 3 — Venue + Room */}
          <div className="g2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:60,alignItems:"center"}}>
            <div>
              <SLabel>Venue & Room</SLabel>
              <h3 style={{fontSize:30,fontWeight:900,lineHeight:1.25,fontFamily:"'Sarabun','DM Sans',system-ui",marginBottom:16}}>
                จองสนาม เปิด Room<br/><span style={{color:C.green}}>ในขั้นตอนเดียว</span>
              </h3>
              <p style={{fontSize:14,color:C.sub,lineHeight:1.85,marginBottom:28}}>
                เลือกสนาม เช็ค slot ว่าง จ่ายค่าสนาม แล้วเปิด Room รับสมัครผู้เล่นได้ทันที ไม่ต้องโทรหาสนาม ไม่ต้องสร้าง LINE group ใหม่ทุกครั้ง
              </p>
              {["เช็ค slot real-time","จ่ายค่าสนามผ่านแอป","Chat กับทีมใน Room","QR Check-in เมื่อถึงสนาม"].map(f=>(
                <div key={f} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:C.green,flexShrink:0}}/>
                  <span style={{fontSize:13,color:C.sub}}>{f}</span>
                </div>
              ))}
            </div>
            {/* Room mockup */}
            <Phone>
              <div style={{padding:"14px 14px 18px"}}>
                <div style={{fontSize:11,fontWeight:800,color:C.green,marginBottom:12,letterSpacing:.5}}>⚽ Match Room</div>
                <div style={{padding:"12px",borderRadius:10,background:`rgba(16,212,132,0.06)`,border:`1px solid ${C.borderHi}`,marginBottom:12}}>
                  <div style={{fontSize:12,fontWeight:800,color:C.text,marginBottom:4}}>S-One Football Club</div>
                  <div style={{fontSize:11,color:C.sub,marginBottom:10}}>ลาดพร้าว · วันนี้ 18:00 · 7v7</div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontSize:10,color:C.sub}}>ผู้เล่น</span>
                    <span style={{fontSize:10,fontWeight:700,color:C.green}}>9/14 คน</span>
                  </div>
                  <div style={{height:5,background:"rgba(255,255,255,0.05)",borderRadius:99,overflow:"hidden",marginBottom:10}}>
                    <div style={{width:"64%",height:"100%",background:`linear-gradient(90deg,#059669,${C.green})`,borderRadius:99}}/>
                  </div>
                  <div style={{display:"flex",gap:-6}}>
                    {["ส","อ","ก","บ","น","ป","ต","ม","ร"].map((n,i)=>{
                      const cols=[C.green,"#3b82f6","#8b5cf6",C.amber,"#ef4444","#06b6d4","#ec4899",C.green,"#f97316"];
                      return <div key={i} style={{width:26,height:26,borderRadius:"50%",background:cols[i%cols.length],border:`2px solid ${C.bg}`,marginLeft:i>0?-8:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900,color:"#fff",flexShrink:0}}>{n}</div>;
                    })}
                    <div style={{width:26,height:26,borderRadius:"50%",background:"rgba(255,255,255,0.04)",border:`2px dashed ${C.border}`,marginLeft:-8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:C.muted}}>+5</div>
                  </div>
                </div>
                <div style={{fontSize:10,fontWeight:800,color:C.muted,marginBottom:8,letterSpacing:.5}}>Chat ในทีม</div>
                {[["ก","ใครมาถึงก่อนจอง spot ไว้นะ"],["ส","โอเคครับ มาแน่นอน"]].map(([n,m],i)=>(
                  <div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"flex-start"}}>
                    <div style={{width:24,height:24,borderRadius:"50%",background:C.green,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:"#001a0d",flexShrink:0}}>{n}</div>
                    <div style={{padding:"7px 10px",borderRadius:8,background:C.s2,border:`1px solid ${C.border}`,fontSize:11,color:C.sub,lineHeight:1.5,flex:1}}>{m}</div>
                  </div>
                ))}
              </div>
            </Phone>
          </div>
        </div>
      </section>

      {/* ══ PLAYER IDENTITY ══ */}
      <section id="identity" style={{padding:"90px 28px",maxWidth:1160,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:56}}>
          <SLabel>Player Identity</SLabel>
          <h2 style={{fontSize:38,fontWeight:900,lineHeight:1.2,fontFamily:"'Sarabun','DM Sans',system-ui",marginBottom:16}}>
            Card ที่โตได้<br/><span style={{color:C.green}}>ตามฝีมือจริง</span>
          </h2>
          <p style={{fontSize:15,color:C.sub,maxWidth:480,margin:"0 auto",lineHeight:1.85}}>
            ทุกแมทช์สะสม XP และ Stats Tier ขึ้นเมื่อถึงเกณฑ์ — Bronze → Diamond
          </p>
        </div>
        <div className="tier-row" style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap",marginBottom:48}}>
          {TIERS.map((t,i)=>(
            <div key={t.name} className="fu" style={{animationDelay:`${i*70}ms`,display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
              <PlayerCard {...t} size={1}/>
              <div style={{fontSize:9,fontWeight:800,letterSpacing:2.5,color:t.color,textTransform:"uppercase",padding:"3px 10px",borderRadius:99,background:`${t.color}10`,border:`1px solid ${t.color}22`}}>{t.name}</div>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1,background:C.border,borderRadius:16,overflow:"hidden",maxWidth:680,margin:"0 auto"}} className="g3">
          {[["⚡","XP ทุกแมทช์","เล่นทุกเกมได้ XP สะสมโต Tier อัตโนมัติ"],
            ["📊","6 Stats","PAC · SHO · PAS · DRI · DEF · PHY"],
            ["🃏","Card ของคุณ","Identity ที่ unique สะท้อนฝีมือจริง"]].map(([ic,t,d])=>(
            <div key={t} style={{padding:"24px 18px",background:C.bg,textAlign:"center"}}>
              <div style={{fontSize:26,marginBottom:10}}>{ic}</div>
              <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:6}}>{t}</div>
              <div style={{fontSize:11,color:C.sub,lineHeight:1.7}}>{d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how" style={{background:C.bg2,borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`,padding:"90px 28px"}}>
        <div style={{maxWidth:900,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:56}}>
            <SLabel>วิธีใช้งาน</SLabel>
            <h2 style={{fontSize:38,fontWeight:900,lineHeight:1.2,fontFamily:"'Sarabun','DM Sans',system-ui"}}>
              ง่าย <span style={{color:C.green}}>3 ขั้นตอน</span>
            </h2>
          </div>
          <div className="steps-row" style={{display:"flex",alignItems:"flex-start",gap:0}}>
            {[
              {emoji:"📲",num:"01",title:"สมัครฟรีผ่าน LINE",desc:"เปิด LINE ค้นหา @squadhub กด Add Friend ไม่ต้องโหลดแอปเพิ่ม"},
              {emoji:"🎯",num:"02",title:"Matching หาทีมให้",desc:"ระบบหาแมทช์ที่ตรง Level และพื้นที่ของคุณ เลือก slot แล้วเข้าร่วมได้เลย"},
              {emoji:"⚽",num:"03",title:"เตะ เก็บ XP โตขึ้น",desc:"เล่นทุกเกมได้ XP Stats เพิ่ม Tier โต เห็นพัฒนาการชัดเจน"},
            ].map((s,i)=>(
              <div key={s.num} style={{display:"flex",alignItems:"flex-start",flex:1}}>
                <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",padding:"0 16px"}}>
                  <div style={{width:60,height:60,borderRadius:"50%",marginBottom:16,background:`linear-gradient(135deg,#00c96b,${C.green})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,boxShadow:`0 0 24px rgba(16,212,132,0.25)`}}>{s.emoji}</div>
                  <div style={{fontSize:11,fontWeight:800,color:C.muted,letterSpacing:2,marginBottom:8}}>{s.num}</div>
                  <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:8,lineHeight:1.3}}>{s.title}</div>
                  <div style={{fontSize:12,color:C.sub,lineHeight:1.8}}>{s.desc}</div>
                </div>
                {i<2&&<div className="step-line" style={{paddingTop:30,flexShrink:0}}>
                  <div style={{width:40,height:1,background:C.border}}/>
                </div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PARTNER ══ */}
      <section id="partner" style={{padding:"90px 28px"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          <div className="g2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:64,alignItems:"center"}}>
            <div>
              <div style={{fontSize:11,fontWeight:800,letterSpacing:3,color:C.amber,textTransform:"uppercase",marginBottom:14}}>สำหรับเจ้าของสนาม</div>
              <h2 style={{fontSize:32,fontWeight:900,marginBottom:14,lineHeight:1.2,fontFamily:"'Sarabun','DM Sans',system-ui"}}>
                Partner Portal<br/><span style={{color:C.amber}}>บริหารสนามจากมือถือ</span>
              </h2>
              <p style={{fontSize:14,color:C.sub,lineHeight:1.85,marginBottom:24,maxWidth:380}}>
                เชื่อมสนามกับนักเตะในระบบ จัดการ slot real-time ดู dashboard รายได้ และ QR check-in
              </p>
              {[["📅","Booking real-time"],["💰","Dashboard รายได้"],["📊","สถิติการใช้สนาม"],["📱","QR Check-in"]].map(([ic,tx])=>(
                <div key={tx} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <span style={{fontSize:16}}>{ic}</span>
                  <span style={{fontSize:13,fontWeight:700,color:C.sub}}>{tx}</span>
                </div>
              ))}
              <div style={{marginTop:24}}>
                <GhostBtn href={SOCIAL.line} style={{borderColor:`${C.amber}50`,color:C.amber}}>ติดต่อเป็นพาร์ทเนอร์ →</GhostBtn>
              </div>
            </div>
            <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:20,padding:24}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                <div style={{fontSize:13,fontWeight:800,color:C.text}}>📊 Dashboard วันนี้</div>
                <div style={{fontSize:11,color:C.green,fontWeight:700}}>● Live</div>
              </div>
              {[["แมทช์วันนี้","8 แมทช์","↑12%"],["รายได้","฿12,400","↑8%"],["ผู้เล่น","96 คน","↑22%"]].map(([l,v,c])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${C.border}`}}>
                  <span style={{fontSize:13,color:C.sub}}>{l}</span>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:14,fontWeight:800,color:C.text}}>{v}</span>
                    <span style={{fontSize:11,fontWeight:700,color:C.green}}>{c}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{background:C.bg2,borderTop:`1px solid ${C.border}`,padding:"100px 28px",textAlign:"center"}}>
        <div style={{maxWidth:620,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:28}}>
            <div style={{filter:`drop-shadow(0 0 20px rgba(16,212,132,0.4))`}}>
              <LogoIcon size={72}/>
            </div>
          </div>
          <SLabel>เริ่มต้นวันนี้</SLabel>
          <h2 style={{fontSize:44,fontWeight:900,lineHeight:1.12,fontFamily:"'Sarabun','DM Sans',system-ui",marginBottom:16,marginTop:16}}>
            ออกไปเตะ<br/><span style={{color:C.green}}>กับคนที่ใช่</span>
          </h2>
          <p style={{fontSize:16,color:C.sub,lineHeight:1.85,marginBottom:40}}>
            ฟรี ไม่มีค่าสมัคร เปิดผ่าน LINE ได้เลยทันที
          </p>
          <PrimaryBtn href={SOCIAL.app} style={{padding:"17px 48px",fontSize:16,borderRadius:14}}>⚽ เริ่มเลย ฟรี</PrimaryBtn>
          <div style={{display:"flex",gap:14,justifyContent:"center",marginTop:40,flexWrap:"wrap"}}>
            {[["💬","LINE OA",SOCIAL.line],["📘","Facebook",SOCIAL.facebook],["📷","Instagram",SOCIAL.instagram],["🎵","TikTok",SOCIAL.tiktok]].map(([ic,l,h])=>(
              <a key={l} href={h} target="_blank" rel="noopener noreferrer"
                style={{display:"flex",alignItems:"center",gap:7,padding:"10px 18px",borderRadius:99,
                  background:C.surface,border:`1px solid ${C.border}`,fontSize:13,fontWeight:700,color:C.sub,transition:"all .2s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=C.borderHi;e.currentTarget.style.color=C.green;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.sub;}}>
                <span>{ic}</span>{l}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{background:C.bg,borderTop:`1px solid ${C.border}`,padding:"24px 28px"}}>
        <div className="foot-row" style={{maxWidth:1160,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
          <Logo sm/>
          <div style={{fontSize:12,color:C.muted}}>© 2025 SQUAD HUB · Football Community · Bangkok</div>
          <div style={{display:"flex",gap:20}}>
            {[["LINE",SOCIAL.line],["Facebook",SOCIAL.facebook],["Instagram",SOCIAL.instagram],["TikTok",SOCIAL.tiktok]].map(([l,h])=>(
              <a key={l} href={h} target="_blank" rel="noopener noreferrer" style={{fontSize:12,fontWeight:700,color:C.muted}}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
