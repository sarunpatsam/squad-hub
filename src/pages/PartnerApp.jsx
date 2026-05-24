import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase";

/* ═══ TOKENS ═══ */
const C = {
  bg:"#050f0a", bg2:"#091510", bg3:"#0d1a12",
  surface:"rgba(16,185,129,0.04)", surface2:"rgba(255,255,255,0.05)",
  border:"rgba(16,185,129,0.14)", borderHi:"rgba(16,185,129,0.35)",
  green:"#10d484", greenBr:"#34d399", greenDim:"rgba(16,185,129,0.08)",
  text:"#e8fff4", sub:"#6b9e85", muted:"#3d6b52",
  red:"#ef4444", amber:"#fbbf24",
};
const OWNER_PIN = "198400";

/* ═══ SHARED ═══ */
const Wordmark = ({sm}) => (
  <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
    <div style={{width:1.5,height:sm?22:28,background:`linear-gradient(180deg,${C.green},rgba(16,212,132,0.05))`,borderRadius:2}}/>
    <div style={{display:"flex",flexDirection:"column",gap:2}}>
      <div style={{display:"flex",alignItems:"center",gap:5}}>
        <span style={{fontSize:sm?14:16,fontWeight:900,letterSpacing:1.5,color:C.text,lineHeight:1}}>SQUAD</span>
        <div style={{padding:"2px 7px",border:`1px solid rgba(16,212,132,0.55)`,borderRadius:3}}>
          <span style={{fontSize:sm?14:16,fontWeight:900,letterSpacing:1.5,color:C.green,lineHeight:1}}>HUB</span>
        </div>
      </div>
      <div style={{fontSize:6,fontWeight:600,letterSpacing:3,color:C.muted,textTransform:"uppercase"}}>Partner Portal</div>
    </div>
  </div>
);

const Tag = ({children,color=C.green}) => (
  <span style={{fontSize:11,fontWeight:800,padding:"2px 8px",borderRadius:4,background:`${color}18`,color,border:`1px solid ${color}40`}}>{children}</span>
);

/* ── fade-in image wrapper ── */
const ImgLoad = ({src, alt="", style={}, ...rest}) => {
  const r = useRef(null);
  return (
    <img
      ref={r}
      src={src}
      alt={alt}
      style={{...style, opacity:0, transition:"opacity .35s ease"}}
      onLoad={()=>{ if(r.current) r.current.style.opacity=1; }}
      onError={()=>{ if(r.current) r.current.style.opacity=1; }}
      {...rest}
    />
  );
};

const Btn = ({children,onClick,ghost,disabled,style={}}) => (
  <button onClick={disabled?undefined:onClick} disabled={disabled}
    style={{padding:"11px 18px",borderRadius:8,fontSize:14,fontWeight:800,border:ghost?`1px solid ${C.border}`:`1px solid ${C.green}`,cursor:disabled?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:ghost?"transparent":`linear-gradient(135deg,#059669,${C.green})`,color:ghost?C.sub:"#001a0d",opacity:disabled?.4:1,transition:"all .2s",...style}}>{children}</button>
);

const MetricCard = ({icon,value,label,foot,footColor,hi}) => (
  <div style={{background:hi?C.greenDim:C.surface,border:`1px solid ${hi?C.borderHi:C.border}`,borderRadius:14,padding:"16px 18px"}}>
    <div style={{fontSize:20,marginBottom:8}}>{icon}</div>
    <div style={{fontSize:24,fontWeight:900,color:hi?C.greenBr:C.text,lineHeight:1}}>{value}</div>
    <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,color:C.sub,marginTop:5,textTransform:"uppercase"}}>{label}</div>
    {foot&&<div style={{fontSize:12,color:footColor||C.sub,marginTop:3,fontWeight:700}}>{foot}</div>}
  </div>
);

/* ═══ LOGIN ═══ */
const LOGO_URL = "/logo.png";

const SplashScreen = ({onDone}) => {
  useEffect(()=>{setTimeout(onDone,2200);},[]);
  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',system-ui,sans-serif",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(16,185,129,0.07) 0%,transparent 70%)",top:"50%",left:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none"}}/>
      <div style={{width:140,height:140,borderRadius:28,overflow:"hidden",marginBottom:24,boxShadow:"0 0 60px rgba(16,185,129,0.2)",border:"1px solid rgba(16,185,129,0.15)"}}>
        <ImgLoad src={LOGO_URL} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
      </div>
      <div style={{fontSize:28,fontWeight:900,color:C.text,letterSpacing:-.5}}>SQUAD <span style={{color:C.green}}>HUB</span></div>
      <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:3,textTransform:"uppercase",marginTop:6,marginBottom:36}}>Partner Portal</div>
      <div style={{display:"flex",gap:7}}>
        <div style={{width:20,height:6,borderRadius:3,background:C.green}}/>
        <div style={{width:6,height:6,borderRadius:"50%",background:"rgba(16,185,129,0.3)"}}/>
        <div style={{width:6,height:6,borderRadius:"50%",background:"rgba(16,185,129,0.3)"}}/>
      </div>
    </div>
  );
};

const VenueLogin = ({onSuccess}) => {
  const [email,setEmail]=useState(()=>localStorage.getItem("sq_partner_email")||"");
  const [password,setPassword]=useState(()=>localStorage.getItem("sq_partner_pw")||"");
  const [showPw,setShowPw]=useState(false);
  const [remember,setRemember]=useState(()=>!!localStorage.getItem("sq_partner_email"));
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  const handle = async () => {
    if(!email.trim()||!password.trim())return;
    setLoading(true);setError("");
    try {
      const {error:e}=await supabase.auth.signInWithPassword({
        email:email.trim().toLowerCase(),password
      });
      if(e){setError("Email หรือ Password ไม่ถูกต้อง");setLoading(false);return;}
      if(remember){
        localStorage.setItem("sq_partner_email",email.trim().toLowerCase());
        localStorage.setItem("sq_partner_pw",password);
      } else {
        localStorage.removeItem("sq_partner_email");
        localStorage.removeItem("sq_partner_pw");
      }
      const {data:v}=await supabase.from("venues").select("*")
        .eq("owner_email",email.trim().toLowerCase()).single();
      onSuccess(v);
    } catch{setError("เกิดข้อผิดพลาด");setLoading(false);}
  };
  const inp={width:"100%",background:C.surface2,border:`1px solid ${error?C.red:C.border}`,borderRadius:10,padding:"12px 14px",fontSize:15,color:C.text,outline:"none",fontFamily:"inherit",boxSizing:"border-box"};
  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',system-ui,sans-serif",padding:16}}>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:28}}>
          <div style={{width:64,height:64,borderRadius:14,overflow:"hidden",marginBottom:14,border:"1px solid rgba(16,185,129,0.2)",boxShadow:"0 0 30px rgba(16,185,129,0.1)"}}>
            <ImgLoad src={LOGO_URL} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          </div>
          <div style={{fontSize:20,fontWeight:900,color:C.text}}>SQUAD <span style={{color:C.green}}>HUB</span></div>
          <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:2.5,textTransform:"uppercase",marginTop:4}}>Partner Portal</div>
        </div>
        <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:20,padding:28}}>
          <div style={{fontSize:16,fontWeight:900,color:C.text,marginBottom:4}}>เข้าสู่ระบบ</div>
          <div style={{fontSize:13,color:C.sub,marginBottom:22}}>Venue Admin Portal</div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:800,color:C.sub,letterSpacing:1.5,textTransform:"uppercase",marginBottom:6}}>Email</div>
            <input value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()} placeholder="sone@squadhub.ai" type="email" style={inp}/>
          </div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:800,color:C.sub,letterSpacing:1.5,textTransform:"uppercase",marginBottom:6}}>Password</div>
            <div style={{position:"relative"}}>
              <input value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()} placeholder="••••••••" type={showPw?"text":"password"} style={{...inp,paddingRight:44}}/>
              <button onClick={()=>setShowPw(p=>!p)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.sub,fontSize:16,padding:4,lineHeight:1}}>
                {showPw?"🙈":"👁"}
              </button>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20,cursor:"pointer"}} onClick={()=>setRemember(r=>!r)}>
            <div style={{width:18,height:18,borderRadius:5,border:`1.5px solid ${remember?C.green:C.border}`,background:remember?C.greenDim:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .15s"}}>
              {remember&&<span style={{fontSize:11,color:C.green,fontWeight:900}}>✓</span>}
            </div>
            <span style={{fontSize:13,color:C.sub,fontWeight:600,userSelect:"none"}}>จำ Email ไว้ในเครื่องนี้</span>
          </div>
          {error&&<div style={{fontSize:13,color:C.red,fontWeight:700,marginBottom:14,textAlign:"center"}}>{error}</div>}
          <Btn onClick={handle} disabled={loading||!email.trim()||!password.trim()} style={{width:"100%",padding:14,fontSize:15}}>
            {loading?"กำลังเข้าสู่ระบบ...":"เข้าสู่ระบบ →"}
          </Btn>
        </div>
      </div>
    </div>
  );
};

/* ═══ OWNER PIN ═══ */
const OwnerPin = ({onSuccess,onCancel}) => {
  const [pin,setPin]=useState("");
  const [err,setErr]=useState(false);
  const [shake,setShake]=useState(false);
  const tap = v => {
    if(v==="del"){setPin(p=>p.slice(0,-1));setErr(false);return;}
    if(pin.length>=6)return;
    const n=pin+v;setPin(n);
    if(n.length===6){
      if(n===OWNER_PIN)onSuccess();
      else{setShake(true);setErr(true);setTimeout(()=>{setPin("");setShake(false);setErr(false);},800);}
    }
  };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:16}}>
      <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:20,padding:"32px 28px",width:320,textAlign:"center",animation:shake?"shake .4s":"none"}}>
        <div style={{fontSize:22,marginBottom:8}}>👑</div>
        <div style={{fontSize:16,fontWeight:900,color:C.text,marginBottom:4}}>Owner Access</div>
        <div style={{fontSize:13,color:C.sub,marginBottom:24}}>ใส่ PIN เพื่อดูข้อมูลการเงิน</div>
        <div style={{display:"flex",justifyContent:"center",gap:10,marginBottom:28}}>
          {Array.from({length:6}).map((_,i)=>(
            <div key={i} style={{width:14,height:14,borderRadius:"50%",background:i<pin.length?(err?C.red:C.green):"rgba(255,255,255,0.12)",transition:"background .15s"}}/>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
          {["1","2","3","4","5","6","7","8","9","","0","del"].map((k,i)=>(
            <button key={i} onClick={()=>k&&tap(k)}
              style={{height:56,borderRadius:12,fontSize:k==="del"?18:22,fontWeight:800,fontFamily:"inherit",background:k===""?"transparent":k==="del"?"rgba(255,255,255,0.04)":C.surface2,border:k===""?"none":`1px solid ${C.border}`,color:k==="del"?C.sub:C.text,cursor:k===""?"default":"pointer"}}>
              {k==="del"?"⌫":k}
            </button>
          ))}
        </div>
        {err&&<div style={{fontSize:13,color:C.red,fontWeight:700,marginBottom:12}}>PIN ไม่ถูกต้อง</div>}
        <button onClick={onCancel} style={{fontSize:13,color:C.sub,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit"}}>ยกเลิก</button>
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}`}</style>
    </div>
  );
};

/* ═══ QR SCANNER ═══ */
const QRScanner = ({onResult,onClose}) => {
  const videoRef=useRef(null);
  const canvasRef=useRef(null);
  const streamRef=useRef(null);
  const rafRef=useRef(null);
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    let active=true;
    const loadAndStart = async()=>{
      try {
        // Load jsQR
       await new Promise((res,rej)=>{
  if(window.jsQR){res();return;}
  const existing=document.querySelector('script[src*="jsqr"]');
  if(existing){
    existing.addEventListener("load",res);
    existing.addEventListener("error",rej);
    return;
  }
  const s=document.createElement("script");
  s.src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js";
  s.onload=res; s.onerror=rej;
  document.head.appendChild(s);
});
        if(!active)return;
        // Start camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video:{facingMode:"environment",width:{ideal:1280},height:{ideal:720}}
        });
        if(!active){stream.getTracks().forEach(t=>t.stop());return;}
        streamRef.current=stream;
        if(videoRef.current){
          videoRef.current.srcObject=stream;
          await videoRef.current.play();
        }
        setLoading(false);
        // Scan loop
        const tick=()=>{
          if(!active)return;
          const video=videoRef.current;
          const canvas=canvasRef.current;
          if(video&&canvas&&video.readyState===video.HAVE_ENOUGH_DATA){
            canvas.width=video.videoWidth;
            canvas.height=video.videoHeight;
            const ctx=canvas.getContext("2d");
            ctx.drawImage(video,0,0,canvas.width,canvas.height);
            const img=ctx.getImageData(0,0,canvas.width,canvas.height);
            const code=window.jsQR(img.data,img.width,img.height,{inversionAttempts:"dontInvert"});
            if(code){
              active=false;
              streamRef.current?.getTracks().forEach(t=>t.stop());
              onResult(code.data);
              return;
            }
          }
          rafRef.current=requestAnimationFrame(tick);
        };
        rafRef.current=requestAnimationFrame(tick);
      } catch(e){
        if(active)setErr("ไม่สามารถเปิดกล้องได้ กรุณาอนุญาต permission");
      }
    };
    loadAndStart();
    return ()=>{
      active=false;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach(t=>t.stop());
    };
  },[]);

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:16}}>
      <div style={{background:C.bg2,border:`1px solid ${C.borderHi}`,borderRadius:20,padding:20,width:"100%",maxWidth:380}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div>
            <div style={{fontSize:16,fontWeight:900,color:C.text}}>🔲 Scan Player QR</div>
            <div style={{fontSize:12,color:C.sub,marginTop:2}}>ให้ผู้เล่นเปิด SQUAD HUB → กด "Player QR"</div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.06)",border:"none",color:C.sub,fontSize:13,padding:"4px 10px",borderRadius:6,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{width:"100%",borderRadius:12,overflow:"hidden",background:C.bg,minHeight:240,position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
          {loading&&!err&&<div style={{fontSize:13,color:C.muted,position:"absolute"}}>กำลังเปิดกล้อง...</div>}
          {err&&<div style={{fontSize:13,color:C.red,padding:20,textAlign:"center"}}>{err}</div>}
          <video ref={videoRef} style={{width:"100%",display:err?"none":"block",borderRadius:12}} muted playsInline/>
          <canvas ref={canvasRef} style={{display:"none"}}/>
        </div>
        <div style={{marginTop:12,fontSize:12,color:C.muted,textAlign:"center"}}>ส่องกล้องไปที่ QR code บนหน้าจอผู้เล่น</div>
      </div>
    </div>
  );
};

/* ═══ SCAN RESULT ═══ */
const ScanResult = ({playerId,onClose,onScanNext}) => {
  const [player,setPlayer]=useState(null);
  const [loading,setLoading]=useState(true);
  const [done,setDone]=useState(false);
  const alreadyCheckedIn = (()=>{
  try{
    const map=JSON.parse(sessionStorage.getItem("sq_ci")||"{}");
    const ts=map[String(playerId)];
    if(!ts)return false;
    return (Date.now()-ts) < 60*60*1000; // block ใน 1 ชั่วโมง
  }catch{return false;}
})();

  useEffect(()=>{
    if(!playerId){setLoading(false);return;}
    supabase.from("players").select("*").eq("id",playerId).single()
      .then(({data,error})=>{
        console.log("ScanResult:",playerId,data,error);
        setPlayer(data||null);
        setLoading(false);
      });
  },[playerId]);

  const handleCheckin = ()=>{
    try{
      const map=JSON.parse(sessionStorage.getItem("sq_ci")||"{}");
map[String(playerId)]=Date.now();
sessionStorage.setItem("sq_ci",JSON.stringify(map));
    }catch{}
    setDone(true);
  };
  if(loading)return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999}}>
      <div style={{fontSize:14,color:C.sub}}>กำลังโหลดข้อมูล...</div>
    </div>
  );
  if(!player)return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:16}}>
      <div style={{background:C.bg2,border:`1px solid ${C.red}40`,borderRadius:20,padding:24,width:"100%",maxWidth:360,textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:12}}>❌</div>
        <div style={{fontSize:15,fontWeight:900,color:C.red,marginBottom:8}}>ไม่พบผู้เล่น</div>
        <Btn ghost onClick={onClose} style={{width:"100%"}}>กลับหน้าหลัก</Btn>
      </div>
    </div>
  );
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:16}}>
      <div style={{background:C.bg2,border:`1px solid ${done?C.borderHi:C.border}`,borderRadius:20,padding:24,width:"100%",maxWidth:380}}>
        {done?(
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:52,marginBottom:12}}>✅</div>
            <div style={{fontSize:18,fontWeight:900,color:C.green,marginBottom:6}}>Check-in สำเร็จ!</div>
            <div style={{fontSize:13,color:C.sub,marginBottom:20}}>{player.display_name} เข้าสนามแล้ว</div>
            <Btn onClick={onScanNext} style={{width:"100%",marginBottom:10}}>🔲 สแกนคนต่อไป</Btn>
            <Btn ghost onClick={onClose} style={{width:"100%"}}>กลับหน้าหลัก</Btn>
          </div>
        ):(
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontSize:13,fontWeight:800,color:C.green,letterSpacing:1.5,textTransform:"uppercase"}}>ผลการสแกน</div>
              <button onClick={onClose} style={{background:"rgba(255,255,255,0.06)",border:"none",color:C.sub,fontSize:12,padding:"3px 9px",borderRadius:6,cursor:"pointer"}}>✕</button>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:14,padding:14,background:C.greenDim,border:`1px solid ${C.borderHi}`,borderRadius:14,marginBottom:14}}>
              <div style={{width:52,height:52,borderRadius:10,border:"1.5px solid rgba(16,185,129,0.4)",overflow:"hidden",flexShrink:0,background:"rgba(16,185,129,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,color:"#10d484"}}>
  {player.avatar_url
    ? <ImgLoad src={player.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
    : player.display_name?.[0]?.toUpperCase()||"?"
  }
</div>
              <div style={{flex:1}}>
                <div style={{fontSize:18,fontWeight:900,color:C.text}}>{player.display_name}</div>
                <div style={{fontSize:12,color:C.sub,marginTop:3}}>{player.position} · {player.tier} · SQ-{player.id}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:28,fontWeight:900,color:C.green,lineHeight:1}}>{player.ovr||71}</div>
                <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1}}>OVR</div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
              {[{v:"✓",l:"จองแล้ว",c:C.green},{v:"✓",l:"ชำระแล้ว",c:C.green},{v:player.tier,l:"Tier",c:C.amber}].map((x,i)=>(
                <div key={i} style={{background:"rgba(255,255,255,0.03)",border:`1px solid rgba(255,255,255,0.06)`,borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                  <div style={{fontSize:15,fontWeight:900,color:x.c}}>{x.v}</div>
                  <div style={{fontSize:9,color:C.muted,fontWeight:800,letterSpacing:1,textTransform:"uppercase",marginTop:3}}>{x.l}</div>
                </div>
              ))}
            </div>
            {alreadyCheckedIn?(
              <div style={{textAlign:"center",padding:16,background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:12,marginBottom:10}}>
                <div style={{fontSize:32,marginBottom:6}}>❌</div>
                <div style={{fontSize:15,fontWeight:900,color:C.red,marginBottom:4}}>Check-in ไปแล้ว</div>
                <div style={{fontSize:12,color:C.sub}}>{player.display_name} check-in ในรอบนี้แล้ว</div>
              </div>
            ):(
              <button onClick={handleCheckin} style={{width:"100%",padding:14,borderRadius:12,border:"none",background:`linear-gradient(135deg,#059669,${C.green})`,color:"#001a0d",fontSize:15,fontWeight:900,cursor:"pointer",marginBottom:10}}>
                ✅ Check-in เข้าสนาม
              </button>
            )}
            <Btn ghost onClick={onClose} style={{width:"100%"}}>กลับหน้าหลัก</Btn>
          </>
        )}
      </div>
    </div>
  );
};

/* ═══ CALENDAR ═══ */
const TIMES_DAY = ["06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];
const TIMES_NIGHT = ["18:00","19:00","20:00","21:00","22:00","23:00","00:00"];
const TIMES = [...TIMES_DAY,...TIMES_NIGHT];

const SlotBlock = ({slot,onClick}) => {
  if(!slot) return (
    <div onClick={onClick} style={{height:"100%",borderRadius:8,padding:"7px 9px",cursor:"pointer",border:`1px dashed rgba(255,255,255,0.08)`,background:"transparent",transition:"all .15s",display:"flex",alignItems:"center",justifyContent:"center"}}
      onMouseEnter={e=>{e.currentTarget.style.background="rgba(16,185,129,0.06)";e.currentTarget.style.borderColor="rgba(16,185,129,0.3)";}}
      onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="rgba(255,255,255,0.08)";}}>
      <span style={{fontSize:12,color:C.muted,fontWeight:700}}>+ ว่าง</span>
    </div>
  );
  const colors = {live:{bg:"rgba(16,185,129,0.16)",border:"rgba(16,185,129,0.55)",name:C.greenBr},platform:{bg:"rgba(16,185,129,0.08)",border:"rgba(16,185,129,0.28)",name:C.text},offline:{bg:"rgba(255,255,255,0.04)",border:"rgba(255,255,255,0.12)",name:C.text},full:{bg:"rgba(239,68,68,0.07)",border:"rgba(239,68,68,0.25)",name:C.text}};
  const s = colors[slot.status]||colors.platform;
  return (
    <div onClick={onClick} style={{height:"100%",borderRadius:8,padding:"7px 9px",cursor:"pointer",background:s.bg,border:`1px solid ${s.border}`,transition:"all .15s"}}>
      <div style={{fontSize:11,fontWeight:800,color:s.name,lineHeight:1.3,marginBottom:2}}>{slot.name}</div>
      <div style={{fontSize:9,color:C.sub}}>{slot.source==="platform"?"Platform":"Offline"} · {slot.players||0}/{slot.total||14}</div>
      {slot.status!=="full"&&(
        <div style={{display:"flex",gap:2,marginTop:4,flexWrap:"wrap"}}>
          {Array.from({length:Math.min(slot.total||14,14)}).map((_,i)=>(
            <div key={i} style={{width:5,height:5,borderRadius:"50%",background:i<(slot.players||0)?C.green:"rgba(255,255,255,0.1)"}}/>
          ))}
        </div>
      )}
      {slot.status==="live"&&<div style={{fontSize:8,fontWeight:900,padding:"1px 5px",borderRadius:99,background:"rgba(16,185,129,0.2)",color:C.greenBr,border:`1px solid rgba(16,185,129,0.4)`,display:"inline-block",marginTop:3}}>● LIVE</div>}
    </div>
  );
};

const MOCK_SLOTS = [
  {id:1,date:"TODAY",time:"14:00",field:1,name:"ทีมออฟฟิศ",players:6,total:6,source:"offline",status:"offline",amount:1200},
  {id:2,date:"TODAY",time:"16:00",field:1,name:"MATCH #SQ-0824",players:12,total:14,source:"platform",status:"live",amount:1800},
  {id:3,date:"TODAY",time:"16:00",field:2,name:"MATCH #SQ-0825",players:8,total:14,source:"platform",status:"platform",amount:1400},
  {id:4,date:"TODAY",time:"18:00",field:1,name:"MATCH #SQ-0826",players:4,total:14,source:"platform",status:"platform",amount:600},
  {id:5,date:"TODAY",time:"20:00",field:1,name:"คุณบอย · เหมา",players:0,total:0,source:"offline",status:"offline",amount:1500},
  {id:6,date:"TODAY",time:"20:00",field:2,name:"MATCH #SQ-0827",players:14,total:14,source:"platform",status:"full",amount:2100},
];

const ROW_HEIGHT = 72;

const DayView = ({fields,slots,date,onSelectSlot}) => {
  const [period,setPeriod]=useState("night");
  const times = period==="day" ? TIMES_DAY : TIMES_NIGHT;
  const displaySlots = slots.length===0 ? MOCK_SLOTS.map(s=>({...s,date:date.toISOString().split("T")[0]})) : slots;
  const fieldNames = fields.map((_,i)=>`สนาม ${i+1}`);
  const [dragStart,setDragStart]=useState(null); // {fi, timeIdx}
  const [dragEnd,setDragEnd]=useState(null);     // {fi, timeIdx}

  const getSlotDuration = (slot) => {
    if(!slot?.endTime&&!slot?.end_time) return 1;
    const start = slot.time||slot.start_time||"00:00";
    const end = slot.endTime||slot.end_time||"00:00";
    const [sh,sm]=start.split(":").map(Number);
    const [eh,em]=end.split(":").map(Number);
    const diff = ((eh*60+em)-(sh*60+sm))/60;
    return diff>0?diff:1;
  };

  const renderedCells = new Set();

  return (
    <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",borderBottom:`1px solid rgba(255,255,255,0.06)`}}>
        <div style={{display:"flex",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
          <button onClick={()=>setPeriod("day")} style={{padding:"6px 16px",fontSize:12,fontWeight:800,border:"none",cursor:"pointer",background:period==="day"?"rgba(251,191,36,0.15)":"transparent",color:period==="day"?C.amber:C.sub,transition:"all .15s"}}>☀️ กลางวัน</button>
          <button onClick={()=>setPeriod("night")} style={{padding:"6px 16px",fontSize:12,fontWeight:800,border:"none",cursor:"pointer",background:period==="night"?C.greenDim:"transparent",color:period==="night"?C.green:C.sub,transition:"all .15s"}}>🌙 กลางคืน</button>
        </div>
        <div style={{fontSize:11,color:C.muted}}>{period==="day"?"06:00 – 17:00":"18:00 – 00:00"}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:`56px ${fieldNames.map(()=>"1fr").join(" ")}`,borderBottom:`1px solid rgba(255,255,255,0.06)`}}>
        <div style={{padding:"10px 8px"}}/>
        {fieldNames.map((f,i)=>(
          <div key={i} style={{padding:"10px 12px",fontSize:11,fontWeight:800,letterSpacing:1.5,color:C.muted,textTransform:"uppercase",borderLeft:`1px solid rgba(255,255,255,0.04)`}}>⚽ {f}</div>
        ))}
      </div>
      {times.map((time,timeIdx)=>(
        <div key={time} style={{display:"grid",gridTemplateColumns:`56px ${fieldNames.map(()=>"1fr").join(" ")}`,borderBottom:`1px solid rgba(255,255,255,0.04)`,minHeight:ROW_HEIGHT}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:C.muted,fontStyle:"italic"}}>{time}</div>
          {fieldNames.map((_,fi)=>{
            const cellKey = `${fi}-${timeIdx}`;
            if(renderedCells.has(cellKey)) return <div key={fi} style={{borderLeft:`1px solid rgba(255,255,255,0.04)`}}/>;
            const slot = displaySlots.find(s=>s.time===time&&s.field===fi+1);
            const dur = slot ? Math.max(1,Math.round(getSlotDuration(slot))) : 1;
            if(slot && dur>1){
              for(let d=1;d<dur;d++) renderedCells.add(`${fi}-${timeIdx+d}`);
            }
            const isDragging = dragStart&&dragEnd&&dragStart.fi===fi&&
              timeIdx>=Math.min(dragStart.timeIdx,dragEnd.timeIdx)&&
              timeIdx<=Math.max(dragStart.timeIdx,dragEnd.timeIdx);
            const isDragStart = dragStart&&dragStart.fi===fi&&dragStart.timeIdx===timeIdx;
            const dragDur = dragStart&&dragEnd&&dragStart.fi===fi ? Math.abs(dragEnd.timeIdx-dragStart.timeIdx)+1 : 1;

            return (
              <div key={fi}
                style={{borderLeft:`1px solid rgba(255,255,255,0.04)`,padding:6,position:"relative",minHeight:ROW_HEIGHT,userSelect:"none"}}
                onMouseDown={()=>{if(!slot){setDragStart({fi,timeIdx});setDragEnd({fi,timeIdx});}}}
                onMouseEnter={()=>{if(dragStart&&dragStart.fi===fi)setDragEnd({fi,timeIdx});}}
                onMouseUp={()=>{
                  if(dragStart&&dragStart.fi===fi){
                    const startIdx=Math.min(dragStart.timeIdx,dragEnd?.timeIdx??dragStart.timeIdx);
                    const endIdx=Math.max(dragStart.timeIdx,dragEnd?.timeIdx??dragStart.timeIdx);
                    const startTime=times[startIdx];
                    const endTime=times[endIdx+1]||"00:00";
                    onSelectSlot({field:`สนาม ${fi+1}`,time:startTime,endTime,slot:null,fieldNum:fi+1});
                    setDragStart(null);setDragEnd(null);
                  }
                }}
              >
                {slot?(
                  <div onClick={()=>onSelectSlot({field:`สนาม ${fi+1}`,time,slot,fieldNum:fi+1})}
                    style={{
                      position:"absolute",top:4,left:4,right:4,
                      height:`calc(${dur*ROW_HEIGHT}px - 8px)`,
                      zIndex:2,
                      borderRadius:8,padding:"7px 9px",cursor:"pointer",
                      background:slot.status==="live"?"rgba(16,185,129,0.18)":slot.status==="blocked"?"rgba(239,68,68,0.12)":slot.status==="cancelled"?"rgba(239,68,68,0.06)":slot.source==="platform"?"rgba(16,185,129,0.1)":"rgba(255,255,255,0.04)",
                      border:`1px solid ${slot.status==="live"?"rgba(16,185,129,0.55)":slot.status==="blocked"?"rgba(239,68,68,0.45)":slot.status==="cancelled"?"rgba(239,68,68,0.2)":slot.source==="platform"?"rgba(16,185,129,0.3)":"rgba(255,255,255,0.12)"}`,
                    }}>
                    <div style={{fontSize:11,fontWeight:800,color:slot.status==="blocked"?"#ef4444":slot.status==="live"?C.greenBr:C.text,lineHeight:1.3,marginBottom:2}}>
                      {slot.status==="blocked"?"🚫 บล็อก":slot.status==="cancelled"?"❌ ยกเลิก":slot.name||"—"}
                    </div>
                    <div style={{fontSize:9,color:C.sub}}>{slot.source==="platform"?"Platform":"Offline"} · {slot.players||0}/{slot.total||14}</div>
                    {slot.status==="live"&&<div style={{fontSize:8,fontWeight:900,padding:"1px 5px",borderRadius:99,background:"rgba(16,185,129,0.2)",color:C.greenBr,border:`1px solid rgba(16,185,129,0.4)`,display:"inline-block",marginTop:3}}>● LIVE</div>}
                    {slot.status==="blocked"&&<div style={{fontSize:8,fontWeight:900,padding:"1px 5px",borderRadius:99,background:"rgba(239,68,68,0.15)",color:"#ef4444",border:`1px solid rgba(239,68,68,0.35)`,display:"inline-block",marginTop:3}}>● BLOCKED</div>}
                    {dur>1&&<div style={{position:"absolute",bottom:5,right:8,fontSize:9,color:C.muted}}>{slot.time}–{slot.endTime||"—"}</div>}
                  </div>
                ):isDragging?(
                  isDragStart&&(
                    <div style={{position:"absolute",top:4,left:4,right:4,height:`calc(${dragDur*ROW_HEIGHT}px - 8px)`,zIndex:3,borderRadius:8,background:"rgba(16,185,129,0.12)",border:`2px dashed rgba(16,185,129,0.5)`,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
                      <div style={{fontSize:11,fontWeight:800,color:C.green,textAlign:"center"}}>
                        + {times[Math.min(dragStart.timeIdx,dragEnd?.timeIdx??dragStart.timeIdx)]} – {times[Math.max(dragStart.timeIdx,dragEnd?.timeIdx??dragStart.timeIdx)+1]||"00:00"}<br/>
                        <span style={{fontSize:9,color:C.sub}}>สนาม {fi+1}</span>
                      </div>
                    </div>
                  )
                ):(
                  <div style={{height:"100%",borderRadius:8,border:`1px dashed rgba(255,255,255,0.07)`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"crosshair",minHeight:60}}
                    onMouseEnter={e=>{if(!dragStart){e.currentTarget.style.background="rgba(16,185,129,0.04)";e.currentTarget.style.borderColor="rgba(16,185,129,0.25)";}}}
                    onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="rgba(255,255,255,0.07)";}}>
                    <span style={{fontSize:11,color:C.muted,fontWeight:700,pointerEvents:"none"}}>+ ว่าง</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const WeekView = ({slots,weekStart,onSelectSlot}) => {
  const days = Array.from({length:7},(_,i)=>{const d=new Date(weekStart);d.setDate(d.getDate()+i);return d;});
  const today = new Date();
  const SHOW_TIMES = ["10:00","12:00","14:00","16:00","18:00","20:00","22:00"];
  return (
    <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",minHeight:400}}>
      <div style={{display:"grid",gridTemplateColumns:`56px repeat(7,1fr)`,borderBottom:`1px solid rgba(255,255,255,0.06)`}}>
        <div/>
        {days.map((d,i)=>{
          const isToday = d.toDateString()===today.toDateString();
          return (
            <div key={i} style={{padding:"9px 6px",fontSize:10,fontWeight:800,letterSpacing:1,color:isToday?C.green:C.muted,textTransform:"uppercase",textAlign:"center",borderLeft:`1px solid rgba(255,255,255,0.04)`,background:isToday?"rgba(16,185,129,0.05)":undefined}}>
              {DAYS_TH[i]}<br/>
              <span style={{fontSize:15,fontWeight:900,color:isToday?C.green:C.sub}}>{d.getDate()}</span>
            </div>
          );
        })}
      </div>
      {SHOW_TIMES.map(time=>(
        <div key={time} style={{display:"grid",gridTemplateColumns:`56px repeat(7,1fr)`,borderBottom:`1px solid rgba(255,255,255,0.04)`,minHeight:52}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:C.muted,fontStyle:"italic"}}>{time}</div>
          {days.map((d,di)=>{
            const dateStr = d.toISOString().split("T")[0];
            const slot = slots.find(s=>s.date===dateStr&&s.time===time);
            return (
              <div key={di} style={{borderLeft:`1px solid rgba(255,255,255,0.04)`,padding:4}}>
                {slot?(
                  <div style={{height:"100%",borderRadius:6,padding:"5px 7px",cursor:"pointer",background:slot.status==="live"?"rgba(16,185,129,0.2)":slot.source==="platform"?"rgba(16,185,129,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${slot.status==="live"?"rgba(16,185,129,0.6)":slot.source==="platform"?"rgba(16,185,129,0.3)":"rgba(255,255,255,0.1)"}`,fontSize:10,fontWeight:800,color:slot.status==="live"?C.greenBr:C.text}}>
                    <div style={{lineHeight:1.2}}>{slot.name}</div>
                    <div style={{fontSize:9,color:C.sub,marginTop:2}}>{slot.players}/{slot.total}</div>
                    {slot.status==="live"&&<div style={{fontSize:8,color:C.greenBr}}>● LIVE</div>}
                  </div>
                ):(
                  <div onClick={()=>onSelectSlot({field:"สนาม 1",time,date:dateStr})} style={{height:"100%",borderRadius:6,cursor:"pointer",border:`1px dashed rgba(255,255,255,0.06)`,minHeight:40}}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(16,185,129,0.04)"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}/>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const MonthView = ({slots,monthDate,onSelectDay}) => {
  const year=monthDate.getFullYear(), month=monthDate.getMonth();
  const firstDay=(new Date(year,month,1).getDay()+6)%7;
  const daysInMonth=new Date(year,month+1,0).getDate();
  const cells=[];
  for(let i=0;i<firstDay;i++) cells.push(null);
  for(let d=1;d<=daysInMonth;d++) cells.push(d);
  while(cells.length%7!==0) cells.push(null);
  const today=new Date();
  const slotsByDay={};
  slots.forEach(s=>{const d=new Date(s.date);if(d.getFullYear()===year&&d.getMonth()===month){const k=d.getDate();if(!slotsByDay[k])slotsByDay[k]=[];slotsByDay[k].push(s);}});
  return (
    <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",minHeight:400}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",borderBottom:`1px solid rgba(255,255,255,0.06)`}}>
        {DAYS_TH.map(d=><div key={d} style={{padding:"9px 8px",fontSize:10,fontWeight:800,letterSpacing:1.5,color:C.muted,textTransform:"uppercase",textAlign:"center"}}>{d}</div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
        {cells.map((d,i)=>{
          if(!d) return <div key={i} style={{borderRight:`1px solid rgba(255,255,255,0.04)`,borderBottom:`1px solid rgba(255,255,255,0.04)`,minHeight:72}}/>;
          const isToday=today.getFullYear()===year&&today.getMonth()===month&&today.getDate()===d;
          const daySlots=slotsByDay[d]||[];
          const liveCount=daySlots.filter(s=>s.status==="live").length;
          return (
            <div key={i} onClick={()=>onSelectDay(new Date(year,month,d))}
              style={{borderRight:`1px solid rgba(255,255,255,0.04)`,borderBottom:`1px solid rgba(255,255,255,0.04)`,padding:6,minHeight:72,cursor:"pointer",background:isToday?"rgba(16,185,129,0.05)":undefined,transition:"background .15s"}}
              onMouseEnter={e=>!isToday&&(e.currentTarget.style.background="rgba(255,255,255,0.02)")}
              onMouseLeave={e=>!isToday&&(e.currentTarget.style.background="transparent")}>
              <div style={{fontSize:13,fontWeight:800,color:isToday?C.green:C.sub,marginBottom:4}}>{d}</div>
              {daySlots.length>0&&(
                <div style={{fontSize:10,fontWeight:800,padding:"2px 6px",borderRadius:4,background:liveCount>0?"rgba(16,185,129,0.2)":"rgba(16,185,129,0.08)",color:liveCount>0?C.greenBr:C.green,border:`1px solid ${liveCount>0?"rgba(16,185,129,0.5)":"rgba(16,185,129,0.2)"}`}}>
                  {daySlots.length} slot{liveCount>0?` · ${liveCount} Live`:""}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ═══ SHOP TAB ═══ */
const SHOP_ITEMS=[
  {id:1,name:"น้ำเปล่า",price:15,icon:"💧",cat:"drink"},
  {id:2,name:"เกเตอเรด",price:35,icon:"⚡",cat:"drink"},
  {id:3,name:"โค้ก",price:25,icon:"🥤",cat:"drink"},
  {id:4,name:"ขนมปัง",price:20,icon:"🍞",cat:"food"},
  {id:5,name:"กล้วยหอม",price:15,icon:"🍌",cat:"food"},
  {id:6,name:"โปรตีนบาร์",price:60,icon:"💪",cat:"food"},
  {id:7,name:"ถุงเท้า SQUAD HUB",price:120,icon:"🧦",cat:"gear"},
  {id:8,name:"ผ้าเช็ดตัว",price:150,icon:"🏊",cat:"gear"},
  {id:9,name:"เสื้อ SQUAD HUB",price:490,icon:"👕",cat:"merch"},
];
const ShopTab = ({venueId,ownerUnlocked}) => {
  const [items,setItems]=useState([]);
  const [cart,setCart]=useState({});
  const [cat,setCat]=useState("all");
  const [payMode,setPayMode]=useState(null);
  const [done,setDone]=useState(false);
  const [view,setView]=useState("pos"); // pos | inventory
  const [editItem,setEditItem]=useState(null);
  const [saving,setSaving]=useState(false);
  const [salesTotal,setSalesTotal]=useState(0);

  useEffect(()=>{
    if(!venueId)return;
    supabase.from("shop_items").select("*").eq("venue_id",venueId).order("category").order("name")
      .then(({data})=>{
        if(data&&data.length>0) setItems(data);
        else setItems(SHOP_ITEMS.map(i=>({...i,venue_id:venueId,category:i.cat,stock:-1})));
      });
    supabase.from("shop_sales").select("total").eq("venue_id",venueId)
      .gte("created_at",new Date().toISOString().split("T")[0])
      .then(({data})=>{
        if(data) setSalesTotal(data.reduce((a,s)=>a+(s.total||0),0));
      });
  },[venueId]);

  const add=(id)=>setCart(c=>({...c,[id]:(c[id]||0)+1}));
  const rem=(id)=>setCart(c=>{const n={...c};n[id]>1?n[id]--:delete n[id];return n;});
  const filteredItems=cat==="all"?items:items.filter(i=>i.category===cat||i.cat===cat);
  const total=Object.entries(cart).reduce((s,[id,q])=>{const it=items.find(i=>String(i.id)===String(id));return s+(it?.price||0)*q;},0);
  const cartCount=Object.values(cart).reduce((a,b)=>a+b,0);

  const handleCheckout = async(method) => {
    setSaving(true);
    try {
      const cartItems=Object.entries(cart).map(([id,qty])=>{
        const it=items.find(i=>String(i.id)===String(id));
        return {id,name:it?.name,price:it?.price,qty};
      });
      await supabase.from("shop_sales").insert({
        venue_id:venueId,items:cartItems,total,payment_method:method,
      });
      setSalesTotal(p=>p+total);
      setDone(true);setSaving(false);
    } catch(e){console.error(e);setSaving(false);}
  };

  const handleSaveItem = async() => {
    if(!editItem)return;setSaving(true);
    try {
      if(editItem.id&&!String(editItem.id).startsWith("mock")){
        await supabase.from("shop_items").update({
          name:editItem.name,price:editItem.price,stock:editItem.stock,category:editItem.category
        }).eq("id",editItem.id);
        setItems(prev=>prev.map(i=>String(i.id)===String(editItem.id)?{...i,...editItem}:i));
      } else {
        const {data}=await supabase.from("shop_items").insert({
          venue_id:venueId,name:editItem.name,price:editItem.price,
          stock:editItem.stock||0,category:editItem.category||"general",
        }).select().single();
        if(data) setItems(prev=>[...prev.filter(i=>String(i.id)!==String(editItem.id)),data]);
      }
      setEditItem(null);setSaving(false);
    } catch(e){console.error(e);setSaving(false);}
  };

  const cats=[{id:"all",l:"ทั้งหมด"},{id:"drink",l:"🥤 เครื่องดื่ม"},{id:"food",l:"🍌 อาหาร"},{id:"gear",l:"⚽ อุปกรณ์"},{id:"merch",l:"👕 Merchandise"},{id:"general",l:"📦 ทั่วไป"}];

  if(done)return(
    <div style={{maxWidth:500,background:C.bg2,border:`1px solid ${C.borderHi}`,borderRadius:16,padding:28,textAlign:"center"}}>
      <div style={{fontSize:52,marginBottom:12}}>✅</div>
      <div style={{fontSize:18,fontWeight:900,color:C.green,marginBottom:6}}>รับเงินแล้ว ฿{total.toLocaleString()}</div>
      <div style={{fontSize:13,color:C.sub,marginBottom:22}}>บันทึก transaction เรียบร้อย</div>
      <Btn ghost onClick={()=>{setCart({});setPayMode(null);setDone(false);}} style={{width:"100%"}}>ขายต่อ</Btn>
    </div>
  );

  return(
    <div>
      {/* Header + Sales today */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>setView("pos")} style={{padding:"8px 16px",borderRadius:8,fontSize:13,fontWeight:800,border:`1px solid ${view==="pos"?C.borderHi:C.border}`,background:view==="pos"?C.greenDim:"transparent",color:view==="pos"?C.green:C.sub,cursor:"pointer"}}>🛒 POS</button>
          <button onClick={()=>setView("inventory")} style={{padding:"8px 16px",borderRadius:8,fontSize:13,fontWeight:800,border:`1px solid ${view==="inventory"?C.borderHi:C.border}`,background:view==="inventory"?C.greenDim:"transparent",color:view==="inventory"?C.green:C.sub,cursor:"pointer"}}>📦 จัดการสินค้า</button>
        </div>
        <div style={{background:C.greenDim,border:`1px solid ${C.borderHi}`,borderRadius:10,padding:"8px 16px",textAlign:"right"}}>
          <div style={{fontSize:9,color:C.sub,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>รายได้ร้านค้าวันนี้</div>
          <div style={{fontSize:18,fontWeight:900,color:C.green}}>฿{salesTotal.toLocaleString()}</div>
        </div>
      </div>

      {view==="pos"&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:16}}>
          <div>
            <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
              {cats.map(c=>(
                <button key={c.id} onClick={()=>setCat(c.id)}
                  style={{padding:"7px 14px",borderRadius:8,fontSize:12,fontWeight:800,border:`1px solid ${cat===c.id?C.borderHi:C.border}`,background:cat===c.id?C.greenDim:"transparent",color:cat===c.id?C.green:C.sub,cursor:"pointer"}}>
                  {c.l}
                </button>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:10}}>
              {filteredItems.map(item=>(
                <div key={item.id} onClick={()=>add(item.id)}
                  style={{background:C.bg2,border:`1px solid ${cart[item.id]?C.borderHi:C.border}`,borderRadius:14,padding:"16px 12px",textAlign:"center",cursor:"pointer",transition:"all .15s"}}>
                  <div style={{fontSize:32,marginBottom:8}}>{item.icon||"📦"}</div>
                  <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:4}}>{item.name}</div>
                  <div style={{fontSize:14,fontWeight:900,color:C.green}}>฿{item.price}</div>
                  {item.stock>=0&&<div style={{fontSize:10,color:item.stock<5?C.amber:C.muted,marginTop:2}}>คงเหลือ {item.stock}</div>}
                  {cart[item.id]>0&&(
                    <div style={{marginTop:8,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
                      <button onClick={e=>{e.stopPropagation();rem(item.id);}} style={{width:24,height:24,borderRadius:"50%",background:"rgba(255,255,255,0.08)",border:`1px solid ${C.border}`,color:C.text,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                      <span style={{fontSize:15,fontWeight:900,color:C.greenBr}}>{cart[item.id]}</span>
                      <button onClick={e=>{e.stopPropagation();add(item.id);}} style={{width:24,height:24,borderRadius:"50%",background:C.greenDim,border:`1px solid ${C.borderHi}`,color:C.green,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:16,padding:18,position:"sticky",top:20}}>
            <div style={{fontSize:15,fontWeight:900,color:C.text,marginBottom:14}}>
              🛒 ตะกร้า {cartCount>0&&<span style={{fontSize:12,color:C.green}}>({cartCount} รายการ)</span>}
            </div>
            {cartCount===0?(
              <div style={{textAlign:"center",padding:"24px 0",color:C.muted,fontSize:13}}>ยังไม่มีสินค้า<br/>กดสินค้าเพื่อเพิ่ม</div>
            ):(
              <div style={{marginBottom:14}}>
                {Object.entries(cart).map(([id,q])=>{
                  const it=items.find(i=>String(i.id)===String(id));
                  if(!it)return null;
                  return(
                    <div key={id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid rgba(255,255,255,0.04)`}}>
                      <div>
                        <div style={{fontSize:13,color:C.text}}>{it.icon||"📦"} {it.name}</div>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}>
                          <button onClick={()=>rem(id)} style={{width:20,height:20,borderRadius:"50%",background:"rgba(255,255,255,0.08)",border:`1px solid ${C.border}`,color:C.text,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                          <span style={{fontSize:12,fontWeight:800,color:C.greenBr}}>×{q}</span>
                          <button onClick={()=>add(id)} style={{width:20,height:20,borderRadius:"50%",background:C.greenDim,border:`1px solid ${C.borderHi}`,color:C.green,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                        </div>
                      </div>
                      <div style={{fontSize:13,fontWeight:800,color:C.green}}>฿{(it.price*q).toLocaleString()}</div>
                    </div>
                  );
                })}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:12,marginTop:4,borderTop:`1px solid rgba(16,185,129,0.15)`}}>
                  <div style={{fontSize:14,fontWeight:800,color:C.text}}>รวม</div>
                  <div style={{fontSize:22,fontWeight:900,color:C.green}}>฿{total.toLocaleString()}</div>
                </div>
              </div>
            )}
            {cartCount>0&&!payMode&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <button onClick={()=>handleCheckout("cash")} disabled={saving}
                  style={{padding:"11px",borderRadius:9,border:`1px solid ${C.borderHi}`,background:C.greenDim,color:C.green,fontSize:13,fontWeight:800,cursor:"pointer"}}>
                  💵 Cash
                </button>
                <button onClick={()=>setPayMode("qr")} disabled={saving}
                  style={{padding:"11px",borderRadius:9,border:`1px solid rgba(96,165,250,0.4)`,background:"rgba(96,165,250,0.08)",color:"#60a5fa",fontSize:13,fontWeight:800,cursor:"pointer"}}>
                  📱 QR
                </button>
              </div>
            )}
            {payMode==="qr"&&(
              <div style={{textAlign:"center"}}>
                <div style={{background:"#fff",borderRadius:12,padding:12,width:140,height:140,margin:"0 auto 10px",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg viewBox="0 0 40 40" width="116" height="116">
                    <rect x="1" y="1" width="12" height="12" rx="1.5" fill="none" stroke="#000" strokeWidth="2"/>
                    <rect x="3.5" y="3.5" width="7" height="7" rx=".5" fill="#000"/>
                    <rect x="27" y="1" width="12" height="12" rx="1.5" fill="none" stroke="#000" strokeWidth="2"/>
                    <rect x="29.5" y="3.5" width="7" height="7" rx=".5" fill="#000"/>
                    <rect x="1" y="27" width="12" height="12" rx="1.5" fill="none" stroke="#000" strokeWidth="2"/>
                    <rect x="3.5" y="29.5" width="7" height="7" rx=".5" fill="#000"/>
                    <rect x="16" y="2" width="3" height="3" fill="#000"/><rect x="20" y="2" width="3" height="3" fill="#000"/>
                    <rect x="16" y="6" width="3" height="3" fill="#000"/><rect x="21" y="10" width="3" height="3" fill="#000"/>
                    <rect x="2" y="16" width="3" height="3" fill="#000"/><rect x="8" y="16" width="3" height="3" fill="#000"/>
                    <rect x="16" y="16" width="3" height="3" fill="#000"/><rect x="22" y="16" width="3" height="3" fill="#000"/>
                    <rect x="30" y="16" width="3" height="3" fill="#000"/><rect x="2" y="21" width="3" height="3" fill="#000"/>
                    <rect x="16" y="21" width="3" height="3" fill="#000"/><rect x="27" y="21" width="3" height="3" fill="#000"/>
                    <rect x="16" y="27" width="3" height="3" fill="#000"/><rect x="22" y="27" width="3" height="3" fill="#000"/>
                    <rect x="30" y="30" width="3" height="3" fill="#000"/><rect x="22" y="35" width="3" height="3" fill="#000"/>
                  </svg>
                </div>
                <div style={{fontSize:12,color:C.sub,marginBottom:10}}>PromptPay · ฿{total.toLocaleString()}</div>
                <button onClick={()=>handleCheckout("qr")} disabled={saving}
                  style={{width:"100%",padding:11,borderRadius:9,border:`1px solid ${C.borderHi}`,background:C.greenDim,color:C.green,fontSize:13,fontWeight:800,cursor:"pointer",marginBottom:6}}>
                  ✅ รับเงินแล้ว
                </button>
                <Btn ghost onClick={()=>setPayMode(null)} style={{width:"100%",fontSize:12}}>ยกเลิก</Btn>
              </div>
            )}
          </div>
        </div>
      )}

      {view==="inventory"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:14,fontWeight:900,color:C.text}}>รายการสินค้าทั้งหมด</div>
            <button onClick={()=>setEditItem({id:`mock-${Date.now()}`,name:"",price:0,stock:0,category:"general",icon:"📦"})}
              style={{padding:"8px 16px",borderRadius:8,border:`1px solid ${C.borderHi}`,background:C.greenDim,color:C.green,fontSize:12,fontWeight:800,cursor:"pointer"}}>
              + เพิ่มสินค้าใหม่
            </button>
          </div>
          <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden"}}>
            {items.map((item,i)=>(
              <div key={item.id} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",borderBottom:i<items.length-1?`1px solid rgba(255,255,255,0.04)`:"none"}}>
                <div style={{fontSize:24,flexShrink:0}}>{item.icon||"📦"}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:800,color:C.text}}>{item.name}</div>
                  <div style={{fontSize:11,color:C.sub,marginTop:2}}>{item.category||item.cat} · stock: {item.stock<0?"ไม่จำกัด":item.stock}</div>
                </div>
                <div style={{fontSize:16,fontWeight:900,color:C.green,marginRight:12}}>฿{item.price}</div>
                <button onClick={()=>setEditItem({...item})}
                  style={{padding:"6px 12px",borderRadius:7,border:`1px solid ${C.border}`,background:"transparent",color:C.sub,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                  แก้ไข
                </button>
              </div>
            ))}
          </div>

          {editItem&&(
            <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16}}>
              <div style={{background:C.bg2,border:`1px solid ${C.borderHi}`,borderRadius:20,padding:24,width:"100%",maxWidth:360}}>
                <div style={{fontSize:15,fontWeight:900,color:C.text,marginBottom:16}}>{editItem.id?.toString().startsWith("mock")?"เพิ่มสินค้าใหม่":"แก้ไขสินค้า"}</div>
                {[{k:"name",l:"ชื่อสินค้า",t:"text"},{k:"price",l:"ราคา ฿",t:"number"},{k:"stock",l:"จำนวน stock (-1 = ไม่จำกัด)",t:"number"}].map(f=>(
                  <div key={f.k} style={{marginBottom:12}}>
                    <div style={{fontSize:10,fontWeight:800,color:C.sub,letterSpacing:1.5,textTransform:"uppercase",marginBottom:5}}>{f.l}</div>
                    <input type={f.t} value={editItem[f.k]||""} onChange={e=>setEditItem(p=>({...p,[f.k]:f.t==="number"?parseInt(e.target.value)||0:e.target.value}))}
                      style={{width:"100%",background:"#091510",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",fontSize:14,color:C.text,outline:"none",fontFamily:"inherit"}}/>
                  </div>
                ))}
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:10,fontWeight:800,color:C.sub,letterSpacing:1.5,textTransform:"uppercase",marginBottom:5}}>หมวดหมู่</div>
                  <select value={editItem.category||editItem.cat||"general"} onChange={e=>setEditItem(p=>({...p,category:e.target.value}))}
                    style={{width:"100%",background:"#091510",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",fontSize:14,color:C.text,outline:"none"}}>
                    <option value="drink">🥤 เครื่องดื่ม</option>
                    <option value="food">🍌 อาหาร</option>
                    <option value="gear">⚽ อุปกรณ์</option>
                    <option value="merch">👕 Merchandise</option>
                    <option value="general">📦 ทั่วไป</option>
                  </select>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <Btn ghost onClick={()=>setEditItem(null)} style={{width:"100%"}}>ยกเลิก</Btn>
                  <Btn onClick={handleSaveItem} disabled={saving||!editItem.name} style={{width:"100%"}}>{saving?"กำลังบันทึก...":"บันทึก"}</Btn>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ═══ BOOKING PANEL ═══ */
const MOCK_PLAYERS = [
  {id:4,name:"นิว",position:"MF",tier:"Gold",ovr:80},
  {id:1,name:"กัปตัน",position:"FW",tier:"Diamond",ovr:92},
  {id:2,name:"อาร์ม",position:"FW",tier:"Platinum",ovr:85},
  {id:5,name:"โจ้",position:"DF",tier:"Gold",ovr:76},
  {id:6,name:"Sarun Jr.",position:"MF",tier:"Bronze",ovr:71},
];

const BookingPanel = ({selected,venueId,calDate,onSave,onRefresh}) => {
  const [mode,setMode]=useState("create");
  const [type,setType]=useState("platform");
  const [name,setName]=useState("");
  const [time,setTime]=useState(selected?.time||"18:00");
  const [endTime,setEndTime]=useState(selected?.endTime||"20:00");
  const [price,setPrice]=useState("150");
  const [matchType,setMatchType]=useState("7v7_2t");
  const [playerName,setPlayerName]=useState("");
  const [addedPlayers,setAddedPlayers]=useState([]);
  const [blockReason,setBlockReason]=useState("");
  const [blockType,setBlockType]=useState("slot");
  const [loading,setLoading]=useState(false);
  const [done,setDone]=useState(null);
  const [confirm,setConfirm]=useState(false);
  const [fieldNum,setFieldNum]=useState(selected?.fieldNum||1);

  useEffect(()=>{
    if(!selected) return;
    if(selected.time) setTime(selected.time);
    if(selected.endTime) setEndTime(selected.endTime);
    if(selected.fieldNum) setFieldNum(selected.fieldNum);
    if(selected.slot) setMode("manage");
    else setMode("create");
  },[selected]);

  const inp={width:"100%",background:"#091510",border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 12px",fontSize:14,color:C.text,outline:"none",fontFamily:"inherit",boxSizing:"border-box",marginBottom:12};
  const filtered=playerName.trim().length>0?MOCK_PLAYERS.filter(p=>p.name.includes(playerName.trim())):[];

  const maxPlayers = {
    "7v7_2t":14,"7v7_3t":21,"7v7_4t":28,
    "6v6_2t":12,"6v6_3t":18,"6v6_4t":24,
    "5v5_2t":10,"5v5_3t":15,
  };

  // สร้าง slot ใหม่
  const handleCreate = async () => {
    setLoading(true);
    try {
      const slotDate = selected?.date || calDate?.toISOString().split("T")[0] || new Date().toISOString().split("T")[0];
      const fn = fieldNum||parseInt(String(selected?.field||"1").replace(/[^0-9]/g,""))||1;
      const roomName = type==="platform"
        ? `MATCH #SQ-${slotDate.replace(/-/g,"")}-F${fn}`
        : (name?.trim()||"Offline Booking");
      const {error} = await supabase.from("slots").insert({
        venue_id: venueId,
        date: slotDate,
        start_time: time+":00",
        end_time: endTime+":00",
        price_per_player: parseInt(price)||0,
        max_players: maxPlayers[matchType]||14,
        match_type: matchType,
        status: type==="platform"?"open":"offline",
        field_number: fn,
        notes: roomName,
      });
      if(error) throw error;
      setDone("success");
      onRefresh?.();
    } catch(e) {
      console.error(e);
      setDone("error");
    }
    setLoading(false);
  };

  // แก้ไข slot
  const handleEdit = async () => {
    if(!selected?.slot?.id) return;
    setLoading(true);
    try {
      const {error} = await supabase.from("slots").update({
        start_time: time+":00",
        price_per_player: parseInt(price)||0,
        max_players: maxPlayers[matchType]||14,
        match_type: matchType,
      }).eq("id", selected.slot.id);
      if(error) throw error;
      setDone("success");
      onRefresh?.();
    } catch(e) {
      setDone("error");
    }
    setLoading(false);
  };

  // บล็อก slot / ทั้งวัน
  const handleBlock = async () => {
    setLoading(true);
    try {
      if(blockType==="slot"&&selected?.slot?.id) {
        const {error} = await supabase.from("slots").update({
          status:"blocked",
          block_reason: blockReason||"ปิดชั่วคราว",
        }).eq("id", selected.slot.id);
        if(error) throw error;
      } else {
        // ปิดทั้งวัน — update ทุก slot ของ venue วันนี้
        const today = new Date().toISOString().split("T")[0];
        const {error} = await supabase.from("slots").update({
          status:"blocked",
          block_reason: blockReason||"ปิดสนามชั่วคราว",
        }).eq("venue_id", venueId).eq("date", today).eq("status","open");
        if(error) throw error;
      }
      setDone("success");
      onRefresh?.();
    } catch(e) {
      setDone("error");
    }
    setLoading(false);
    setConfirm(false);
  };

  // ยกเลิก slot
  const handleCancel = async () => {
    if(!selected?.slot?.id) return;
    setLoading(true);
    try {
      const {error} = await supabase.from("slots").update({
        status:"cancelled",
        block_reason: blockReason||"ยกเลิก slot",
      }).eq("id", selected.slot.id);
      if(error) throw error;
      setDone("success");
      onRefresh?.();
    } catch(e) {
      setDone("error");
    }
    setLoading(false);
    setConfirm(false);
  };

  // Success / Error state
  if(done) return (
    <div style={{background:C.bg2,border:`1px solid ${done==="success"?C.borderHi:"rgba(239,68,68,0.3)"}`,borderRadius:16,padding:20,position:"sticky",top:20,textAlign:"center"}}>
      <div style={{fontSize:36,marginBottom:12}}>{done==="success"?"✅":"❌"}</div>
      <div style={{fontSize:15,fontWeight:900,color:done==="success"?C.green:C.red,marginBottom:8}}>
        {done==="success"?"บันทึกสำเร็จ!":"เกิดข้อผิดพลาด"}
      </div>
      <div style={{fontSize:12,color:C.sub,marginBottom:20}}>
        {done==="success"?"ข้อมูลอัพเดตใน User App แล้ว":"ลองใหม่อีกครั้ง"}
      </div>
      <Btn ghost onClick={()=>{setDone(null);setConfirm(false);}} style={{width:"100%"}}>
        {done==="success"?"จัดการ slot อื่น":"ลองใหม่"}
      </Btn>
    </div>
  );

  // Confirm dialog
  if(confirm) return (
    <div style={{background:C.bg2,border:`1px solid rgba(239,68,68,0.35)`,borderRadius:16,padding:20,position:"sticky",top:20}}>
      <div style={{fontSize:14,fontWeight:900,color:C.red,marginBottom:8}}>
        ⚠ ยืนยันการ{mode==="block"?"บล็อก":"ยกเลิก"} slot
      </div>
      <div style={{fontSize:12,color:C.sub,marginBottom:6,lineHeight:1.7}}>
        {mode==="block"&&blockType==="day"
          ?"ต้องการปิดสนามทั้งวันใช่ไหม? slot ที่มีคนจองแล้วจะได้รับ LINE notify อัตโนมัติ"
          :"ต้องการบล็อก/ยกเลิก slot นี้ใช่ไหม? ถ้ามีคนจองแล้วจะได้รับ LINE notify อัตโนมัติ"
        }
      </div>
      <div style={{background:"rgba(251,191,36,0.06)",border:`1px solid rgba(251,191,36,0.2)`,borderRadius:8,padding:"9px 12px",fontSize:11,color:C.amber,marginBottom:16,lineHeight:1.6}}>
        📱 LINE notify จะถูกส่งให้ผู้เล่นที่จองแล้วทุกคนอัตโนมัติ
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        <Btn ghost onClick={()=>setConfirm(false)} style={{width:"100%"}}>ยกเลิก</Btn>
        <button onClick={mode==="block"?handleBlock:handleCancel} disabled={loading}
          style={{padding:"11px",borderRadius:8,border:`1px solid rgba(239,68,68,0.4)`,background:`rgba(239,68,68,0.1)`,color:C.red,fontSize:14,fontWeight:800,cursor:"pointer"}}>
          {loading?"กำลังดำเนินการ...":"ยืนยัน"}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{background:C.bg2,border:`1px solid ${C.borderHi}`,borderRadius:16,padding:20,position:"sticky",top:20,maxHeight:"80vh",overflowY:"auto"}}>

      {/* Header */}
      <div style={{fontSize:15,fontWeight:900,color:C.text,marginBottom:3}}>
        {mode==="create"?"+ สร้าง slot ใหม่":mode==="manage"?"✏️ แก้ไข slot":"🚫 บล็อก slot"}
      </div>
      <div style={{fontSize:12,color:C.sub,marginBottom:14}}>
        {selected?.slot
          ? `${selected.field} · ${selected.time} · ${selected.slot.name||"ว่าง"}`
          : selected
          ? `${selected.field} · ${selected.time}`
          : "เลือก slot จาก calendar"}
      </div>

      {/* Mode tabs */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginBottom:16}}>
        {[
          {id:"create",l:"➕ สร้าง"},
          {id:"manage",l:"✏️ แก้ไข",disabled:!selected?.slot},
          {id:"block",l:"🚫 บล็อก",disabled:!selected?.slot},
        ].map(m=>(
          <button key={m.id} onClick={()=>!m.disabled&&setMode(m.id)}
            style={{padding:"7px 4px",borderRadius:8,fontSize:11,fontWeight:800,cursor:m.disabled?"not-allowed":"pointer",textAlign:"center",border:`1px solid ${mode===m.id?C.borderHi:C.border}`,background:mode===m.id?C.greenDim:"transparent",color:mode===m.id?C.green:m.disabled?C.muted:C.sub,opacity:m.disabled?.4:1,transition:"all .15s"}}>
            {m.l}
          </button>
        ))}
      </div>

      {/* ── CREATE MODE ── */}
      {mode==="create"&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:14}}>
            {["platform","offline"].map(t=>(
              <button key={t} onClick={()=>setType(t)}
                style={{padding:"9px",borderRadius:8,fontSize:12,fontWeight:800,cursor:"pointer",textAlign:"center",border:`1px solid ${type===t?t==="platform"?"rgba(16,185,129,0.5)":"rgba(255,255,255,0.2)":C.border}`,background:type===t?t==="platform"?C.greenDim:"rgba(255,255,255,0.03)":"transparent",color:type===t?t==="platform"?C.green:C.text:C.sub,transition:"all .15s"}}>
                {t==="platform"?"⚡ Platform":"📋 Offline"}
              </button>
            ))}
          </div>
          {type==="offline"&&(
            <div style={{background:"rgba(251,191,36,0.06)",border:`1px solid rgba(251,191,36,0.2)`,borderRadius:8,padding:"9px 12px",fontSize:11,color:C.amber,marginBottom:14,lineHeight:1.6}}>
              ⚠ Offline ไม่ได้ Stats Card, XP หรือสิทธิ์บน Platform
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:4}}>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:C.sub,letterSpacing:1.5,textTransform:"uppercase",marginBottom:5}}>เวลาเริ่ม</div>
              <select value={time} onChange={e=>setTime(e.target.value)} style={{...inp,marginBottom:0,background:"#091510",color:C.text}}>
                {TIMES.map(t=><option key={t} value={t} style={{background:"#091510"}}>{t}</option>)}
              </select>
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:C.sub,letterSpacing:1.5,textTransform:"uppercase",marginBottom:5}}>เวลาสิ้นสุด</div>
              <select value={endTime} onChange={e=>setEndTime(e.target.value)} style={{...inp,marginBottom:0,background:"#091510",color:C.text}}>
                {TIMES.map(t=><option key={t} value={t} style={{background:"#091510"}}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:4}}>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:C.sub,letterSpacing:1.5,textTransform:"uppercase",marginBottom:5}}>ราคา/คน ฿</div>
              <input value={price} onChange={e=>setPrice(e.target.value)} placeholder="150" style={{...inp,marginBottom:0}}/>
            </div>
            <div>
              <div style={{fontSize:11,fontWeight:800,color:C.sub,letterSpacing:1.5,textTransform:"uppercase",marginBottom:5}}>ประเภท</div>
              <select value={matchType} onChange={e=>setMatchType(e.target.value)} style={{...inp,color:C.text,marginBottom:0,background:"#091510"}}>
  <optgroup label="7v7" style={{background:"#091510",color:"#6b9e85"}}>
    <option style={{background:"#091510"}} value="7v7_2t">7v7 · 2 ทีม · 14 คน</option>
    <option style={{background:"#091510"}} value="7v7_3t">7v7 · 3 ทีม · 21 คน</option>
    <option style={{background:"#091510"}} value="7v7_4t">7v7 · 4 ทีม · 28 คน</option>
  </optgroup>
  <optgroup label="6v6" style={{background:"#091510",color:"#6b9e85"}}>
    <option style={{background:"#091510"}} value="6v6_2t">6v6 · 2 ทีม · 12 คน</option>
    <option style={{background:"#091510"}} value="6v6_3t">6v6 · 3 ทีม · 18 คน</option>
    <option style={{background:"#091510"}} value="6v6_4t">6v6 · 4 ทีม · 24 คน</option>
  </optgroup>
  <optgroup label="5v5" style={{background:"#091510",color:"#6b9e85"}}>
    <option style={{background:"#091510"}} value="5v5_2t">5v5 · 2 ทีม · 10 คน</option>
    <option style={{background:"#091510"}} value="5v5_3t">5v5 · 3 ทีม · 15 คน</option>
  </optgroup>
</select>
            </div>
          </div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:800,color:C.sub,letterSpacing:1.5,textTransform:"uppercase",marginBottom:5}}>สนามที่</div>
            <select value={fieldNum} onChange={e=>setFieldNum(parseInt(e.target.value))} style={{...inp,color:C.text,marginBottom:0,background:"#091510"}}>
              {[1,2,3,4,5].map(n=>(
                <option key={n} style={{background:"#091510"}} value={n}>สนาม {n}</option>
              ))}
            </select>
          </div>
          <Btn onClick={handleCreate} disabled={loading} style={{width:"100%",padding:13}}>
            {loading?"กำลังสร้าง...":"สร้าง slot → ผู้เล่นเห็นทันที"}
          </Btn>
        </>
      )}

      {/* ── MANAGE MODE ── */}
{mode==="manage"&&selected?.slot&&(
  <>
    <div style={{background:C.greenDim,border:`1px solid ${C.borderHi}`,borderRadius:8,padding:"10px 12px",marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:800,color:C.green,marginBottom:4}}>แก้ไขได้ทันที</div>
      <div style={{fontSize:11,color:C.sub,lineHeight:1.7}}>
        ⚠ ราคาที่แก้จะใช้กับคนจองใหม่เท่านั้น<br/>คนที่จองแล้วได้ราคาเดิม (Price lock)
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:4}}>
      <div>
        <div style={{fontSize:11,fontWeight:800,color:C.sub,letterSpacing:1.5,textTransform:"uppercase",marginBottom:5}}>เวลาเริ่ม</div>
        <select value={time} onChange={e=>setTime(e.target.value)} style={{...inp,marginBottom:0,background:"#091510",color:C.text}}>
          {TIMES.map(t=><option key={t} value={t} style={{background:"#091510"}}>{t}</option>)}
        </select>
      </div>
      <div>
        <div style={{fontSize:11,fontWeight:800,color:C.sub,letterSpacing:1.5,textTransform:"uppercase",marginBottom:5}}>ราคา/คน ฿</div>
        <input value={price} onChange={e=>setPrice(e.target.value)} placeholder="150" style={{...inp,marginBottom:0}}/>
      </div>
    </div>
    <div style={{marginBottom:16}}>
      <div style={{fontSize:11,fontWeight:800,color:C.sub,letterSpacing:1.5,textTransform:"uppercase",marginBottom:5}}>ประเภท</div>
      <select value={matchType} onChange={e=>setMatchType(e.target.value)} style={{...inp,color:C.text,marginBottom:0,background:"#091510"}}>
        <optgroup label="7v7" style={{background:"#091510",color:"#6b9e85"}}>
          <option style={{background:"#091510"}} value="7v7_3t">7v7 · 3 ทีม · 21 คน</option>
          <option style={{background:"#091510"}} value="7v7_4t">7v7 · 4 ทีม · 28 คน</option>
        </optgroup>
        <optgroup label="6v6" style={{background:"#091510",color:"#6b9e85"}}>
          <option style={{background:"#091510"}} value="6v6_3t">6v6 · 3 ทีม · 18 คน</option>
        </optgroup>
        <optgroup label="5v5" style={{background:"#091510",color:"#6b9e85"}}>
          <option style={{background:"#091510"}} value="5v5_2t">5v5 · 2 ทีม · 10 คน</option>
          <option style={{background:"#091510"}} value="5v5_3t">5v5 · 3 ทีม · 15 คน</option>
        </optgroup>
      </select>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
      <Btn ghost onClick={()=>setConfirm(true)} style={{width:"100%",color:C.red,borderColor:"rgba(239,68,68,0.3)"}}>
        🗑 ยกเลิก slot
      </Btn>
      <Btn onClick={handleEdit} disabled={loading} style={{width:"100%"}}>
        {loading?"กำลังบันทึก...":"บันทึก ✓"}
      </Btn>
    </div>
  </>
)}

      {/* ── BLOCK MODE ── */}
      {mode==="block"&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:14}}>
            {[{id:"slot",l:"🚫 ทีละ slot"},{id:"day",l:"🔒 ทั้งวัน"}].map(b=>(
              <button key={b.id} onClick={()=>setBlockType(b.id)}
                style={{padding:"9px",borderRadius:8,fontSize:12,fontWeight:800,cursor:"pointer",textAlign:"center",border:`1px solid ${blockType===b.id?"rgba(239,68,68,0.5)":C.border}`,background:blockType===b.id?"rgba(239,68,68,0.08)":"transparent",color:blockType===b.id?C.red:C.sub,transition:"all .15s"}}>
                {b.l}
              </button>
            ))}
          </div>
          {blockType==="day"&&(
            <div style={{background:"rgba(239,68,68,0.06)",border:`1px solid rgba(239,68,68,0.2)`,borderRadius:8,padding:"9px 12px",fontSize:11,color:C.red,marginBottom:14,lineHeight:1.6}}>
              ⚠ จะบล็อก slot ที่ยังว่างทั้งหมดในวันนี้ slot ที่มีคนจองแล้วจะไม่ถูกกระทบ
            </div>
          )}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:11,fontWeight:800,color:C.sub,letterSpacing:1.5,textTransform:"uppercase",marginBottom:5}}>เหตุผล (optional)</div>
            <input value={blockReason} onChange={e=>setBlockReason(e.target.value)}
              placeholder="เช่น สนามซ่อมบำรุง, ฝนตก..."
              style={{...inp,marginBottom:0}}/>
          </div>
          <div style={{background:"rgba(251,191,36,0.06)",border:`1px solid rgba(251,191,36,0.2)`,borderRadius:8,padding:"9px 12px",fontSize:11,color:C.amber,marginBottom:16,lineHeight:1.6}}>
            📱 LINE notify จะส่งให้ผู้เล่นที่จองไว้แล้วอัตโนมัติ
          </div>
          <button onClick={()=>setConfirm(true)}
            style={{width:"100%",padding:13,borderRadius:10,border:`1px solid rgba(239,68,68,0.4)`,background:`rgba(239,68,68,0.08)`,color:C.red,fontSize:14,fontWeight:900,cursor:"pointer"}}>
            🚫 {blockType==="day"?"ปิดสนามทั้งวัน":"บล็อก slot นี้"}
          </button>
        </>
      )}

    </div>
  );
};

/* ═══ BOOKING CONFIRM TAB ═══ */
const N8N_BOOKING_CONFIRMED = "https://primary-production-e855.up.railway.app/webhook/booking-confirmed";
const N8N_MATCH_END = "https://primary-production-e855.up.railway.app/webhook/match-end";

/* สร้าง matches row สำหรับ slot นี้ (ถ้ายังไม่มี) แล้วเพิ่ม player เข้า match_players */
const ensureMatch = async (bk) => {
  const {data:existing} = await supabase.from("matches").select("id").eq("slot_id",bk.slot_id).maybeSingle();
  let matchId = existing?.id;
  if(!matchId){
    const code = `SQ-${bk.slot_id}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
    const {data:nm} = await supabase.from("matches").insert({
      slot_id:bk.slot_id, venue_id:bk.venue_id,
      match_code:code, status:"confirmed",
    }).select("id").single();
    matchId = nm?.id;
  }
  if(matchId){
    await supabase.from("match_players").upsert({
      match_id:matchId, player_id:bk.player_id, venue_id:bk.venue_id,
      payment_status:"paid", amount_paid:bk.amount,
      joined_at:new Date().toISOString(),
    },{onConflict:"match_id,player_id"});
  }
  return matchId;
};

const BookingConfirmTab = ({venueId, slots=[]}) => {
  const [bookings,setBookings]=useState([]);
  const [loading,setLoading]=useState(true);
  const [confirming,setConfirming]=useState(null);
  const [selected,setSelected]=useState(new Set());
  const [bulkLoading,setBulkLoading]=useState(false);
  const [slipPreview,setSlipPreview]=useState(null);
  // Add Player form
  const [showAddPlayer,setShowAddPlayer]=useState(false);
  const [addLineId,setAddLineId]=useState("");
  const [addName,setAddName]=useState("");
  const [addAmount,setAddAmount]=useState("");
  const [addSlotId,setAddSlotId]=useState("");
  const [addSaving,setAddSaving]=useState(false);
  // Group Booking form
  const [showGroup,setShowGroup]=useState(false);
  const [groupSlotId,setGroupSlotId]=useState("");
  const [groupPlayers,setGroupPlayers]=useState("");
  const [groupAmount,setGroupAmount]=useState("");
  const [groupTeamName,setGroupTeamName]=useState("");
  const [groupSaving,setGroupSaving]=useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const {data:bks} = await supabase
        .from("bookings")
        .select("id,player_id,slot_id,venue_id,amount,status,created_at,slip_url,booked_for_name")
        .eq("venue_id",venueId)
        .eq("status","pending")
        .order("created_at",{ascending:false});
      if(!bks||bks.length===0){setBookings([]);setLoading(false);return;}

      const playerIds=[...new Set(bks.map(b=>b.player_id).filter(Boolean))];
      const slotIds=[...new Set(bks.map(b=>b.slot_id).filter(Boolean))];

      const [{data:players},{data:slots}] = await Promise.all([
        playerIds.length ? supabase.from("players").select("id,display_name,tier").in("id",playerIds) : {data:[]},
        slotIds.length   ? supabase.from("slots").select("id,start_time,end_time,date,match_type").in("id",slotIds) : {data:[]},
      ]);

      const pm=Object.fromEntries((players||[]).map(p=>[p.id,p]));
      const sm=Object.fromEntries((slots||[]).map(s=>[s.id,s]));

      setBookings(bks.map(b=>({...b,playerData:pm[b.player_id]||null,slotData:sm[b.slot_id]||null})));
    } catch(e){console.error("BookingConfirmTab load error:",e);}
    setLoading(false);
  };

  useEffect(()=>{load();},[venueId]);

  const confirmOne = async (bk) => {
    setConfirming(bk.id);
    try {
      await supabase.from("bookings").update({status:"confirmed",confirmed_at:new Date().toISOString(),confirmed_by:"partner"}).eq("id",bk.id);
      await ensureMatch(bk);
      await fetch(N8N_BOOKING_CONFIRMED,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({record:{id:bk.id,status:"confirmed"}})});
      setBookings(prev=>prev.filter(b=>b.id!==bk.id));
    } catch(e){console.error(e);}
    setConfirming(null);
  };

  const confirmBulk = async () => {
    if(!selected.size)return;
    setBulkLoading(true);
    const ids=[...selected];
    try {
      await supabase.from("bookings").update({status:"confirmed",confirmed_at:new Date().toISOString(),confirmed_by:"partner"}).in("id",ids);
      for(const bk of bookings.filter(b=>ids.includes(b.id))){
        try { await ensureMatch(bk); } catch{}
        try { await fetch(N8N_BOOKING_CONFIRMED,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({record:{id:bk.id,status:"confirmed"}})}); } catch{}
      }
      setBookings(prev=>prev.filter(b=>!ids.includes(b.id)));
      setSelected(new Set());
    } catch(e){console.error(e);}
    setBulkLoading(false);
  };

  const toggleSel = (id) => setSelected(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;});

  const addPlayerBooking = async () => {
    if(!addSlotId||!addLineId.trim()||!addName.trim()) return;
    setAddSaving(true);
    try {
      // ค้นหา player_id จาก LINE ID — ถ้าไม่มี auto-create ก่อน
      let {data:pl} = await supabase.from("players").select("id").eq("line_user_id",addLineId.trim()).maybeSingle();
      if(!pl?.id) {
        const {data:newPl,error:plErr} = await supabase.from("players").upsert({
          line_user_id: addLineId.trim(),
          display_name: addName.trim(),
          tier: "Bronze", level: 1, xp: 0,
        },{onConflict:"line_user_id"}).select("id").single();
        if(plErr) console.warn("auto-create player error:", plErr);
        else pl = newPl;
      }
      const {data:bk,error:bkErr} = await supabase.from("bookings").insert({
        player_id: pl?.id||null,
        slot_id: addSlotId,
        venue_id: venueId,
        amount: parseFloat(addAmount)||0,
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        confirmed_by: "partner",
        booked_for_line_id: addLineId.trim(),
        booked_for_name: addName.trim(),
      }).select().single();
      if(bkErr){console.error("addPlayer booking error:",bkErr);setAddSaving(false);return;}
      // สร้าง match_players row ถ้า player_id มี
      if(pl?.id && bk?.id){
        const fakeBooking={...bk,player_id:pl.id,venue_id:venueId,slot_id:addSlotId};
        try{ await ensureMatch(fakeBooking); }catch{}
      }
      // แจ้ง LINE ผ่าน n8n
      try{ await fetch(N8N_BOOKING_CONFIRMED,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({record:{id:bk.id,status:"confirmed",booked_for_line_id:addLineId.trim(),booked_for_name:addName.trim()}})}); }catch{}
      setAddLineId(""); setAddName(""); setAddAmount(""); setAddSlotId(""); setShowAddPlayer(false);
      alert(`✅ จองให้ ${addName} เรียบร้อย — LINE แจ้งเตือนส่งแล้ว`);
    } catch(e){console.error(e);}
    setAddSaving(false);
  };

  if(loading) return <div style={{padding:40,textAlign:"center",color:C.sub,fontSize:13}}>กำลังโหลด...</div>;

  return (
    <div style={{maxWidth:600}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div>
          <div style={{fontSize:11,fontWeight:800,letterSpacing:2,color:C.green,textTransform:"uppercase"}}>รายการจองรอยืนยัน</div>
          <div style={{fontSize:12,color:C.sub,marginTop:2}}>{bookings.length} รายการ</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          {selected.size>0&&(
            <Btn onClick={confirmBulk} disabled={bulkLoading} style={{padding:"8px 14px",fontSize:12}}>
              {bulkLoading?"กำลังยืนยัน...":"✅ ยืนยัน "+selected.size+" รายการ"}
            </Btn>
          )}
          <Btn ghost onClick={load} style={{padding:"8px 12px",fontSize:12}}>รีเฟรช</Btn>
        </div>
      </div>

      {bookings.length===0?(
        <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:16,padding:40,textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:12}}>✅</div>
          <div style={{fontSize:14,fontWeight:700,color:C.green}}>ไม่มีรายการรอยืนยัน</div>
          <div style={{fontSize:12,color:C.sub,marginTop:6}}>รายการจองทั้งหมดได้รับการยืนยันแล้ว</div>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {bookings.map(bk=>{
            const sel=selected.has(bk.id);
            const pl=bk.playerData;
            const sl=bk.slotData;
            const timeStr=sl?`${sl.start_time?.slice(0,5)}–${sl.end_time?.slice(0,5)}`:"—";
            return (
              <div key={bk.id} style={{background:C.bg2,border:`1px solid ${sel?C.borderHi:C.border}`,borderRadius:14,padding:16,cursor:"pointer"}} onClick={()=>toggleSel(bk.id)}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:20,height:20,borderRadius:4,border:`2px solid ${sel?C.green:C.muted}`,background:sel?C.green:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {sel&&<span style={{fontSize:11,color:"#001a0d",fontWeight:900}}>✓</span>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                      <span style={{fontSize:14,fontWeight:900,color:C.text}}>{pl?.display_name||"ผู้เล่น"}{bk.booked_for_name&&<span style={{fontSize:10,color:C.sub}}> → {bk.booked_for_name}</span>}</span>
                      {bk.slip_url&&(
                        <span onClick={e=>{e.stopPropagation();setSlipPreview(bk.slip_url);}}
                          style={{fontSize:10,fontWeight:800,background:"rgba(251,191,36,0.12)",color:"#fbbf24",border:"1px solid rgba(251,191,36,0.3)",borderRadius:6,padding:"1px 7px",cursor:"pointer"}}>📎 ดูสลิป</span>
                      )}
                    </div>
                    <div style={{fontSize:11,color:C.sub,marginTop:2}}>{timeStr} · {sl?.match_type||"—"}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:15,fontWeight:900,color:C.green}}>฿{bk.amount}</div>
                    <div style={{fontSize:10,color:C.muted,marginTop:2}}>{pl?.tier||""}</div>
                  </div>
                  <Btn onClick={e=>{e.stopPropagation();confirmOne(bk);}} disabled={confirming===bk.id} style={{padding:"8px 12px",fontSize:11,width:"auto",flexShrink:0}}>
                    {confirming===bk.id?"...":"✅ ยืนยัน"}
                  </Btn>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add Player (Book on behalf) ── */}
      <div style={{marginTop:24,background:C.bg2,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden"}}>
        <div onClick={()=>setShowAddPlayer(p=>!p)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",cursor:"pointer"}}>
          <div>
            <div style={{fontSize:12,fontWeight:800,color:C.green}}>➕ จองให้ผู้เล่น (Walk-in)</div>
            <div style={{fontSize:10,color:C.sub,marginTop:1}}>สำหรับลูกค้า offline — ส่ง LINE แจ้งเตือนอัตโนมัติ</div>
          </div>
          <div style={{color:C.sub,fontSize:16}}>{showAddPlayer?"▲":"▼"}</div>
        </div>
        {showAddPlayer&&(
          <div style={{padding:"0 16px 16px",display:"flex",flexDirection:"column",gap:8,borderTop:`1px solid ${C.border}`}}>
            <div style={{marginTop:12}}>
              <div style={{fontSize:10,color:C.sub,marginBottom:4}}>เลือกสล็อต</div>
              <select value={addSlotId} onChange={e=>setAddSlotId(e.target.value)}
                style={{width:"100%",background:"#0d1a0f",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",color:C.text,fontSize:13}}>
                <option value="">-- เลือกสล็อตวันนี้ --</option>
                {slots.map(s=>(
                  <option key={s.id} value={s.id}>{s.start_time?.slice(0,5)}–{s.end_time?.slice(0,5)} · {s.match_type||""}</option>
                ))}
              </select>
            </div>
            <div>
              <div style={{fontSize:10,color:C.sub,marginBottom:4}}>LINE User ID ของผู้เล่น</div>
              <input value={addLineId} onChange={e=>setAddLineId(e.target.value)} placeholder="Uid1234abc..."
                style={{width:"100%",background:"#0d1a0f",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",color:C.text,fontSize:13,boxSizing:"border-box"}}/>
            </div>
            <div>
              <div style={{fontSize:10,color:C.sub,marginBottom:4}}>ชื่อผู้เล่น (แสดงใน LINE)</div>
              <input value={addName} onChange={e=>setAddName(e.target.value)} placeholder="ชื่อ-นามสกุล"
                style={{width:"100%",background:"#0d1a0f",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",color:C.text,fontSize:13,boxSizing:"border-box"}}/>
            </div>
            <div>
              <div style={{fontSize:10,color:C.sub,marginBottom:4}}>ยอดชำระ (฿)</div>
              <input value={addAmount} onChange={e=>setAddAmount(e.target.value)} placeholder="0" type="number"
                style={{width:"100%",background:"#0d1a0f",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",color:C.text,fontSize:13,boxSizing:"border-box"}}/>
            </div>
            <Btn onClick={addPlayerBooking} disabled={addSaving||!addSlotId||!addLineId.trim()||!addName.trim()} style={{marginTop:4}}>
              {addSaving?"กำลังบันทึก...":"✅ สร้างการจอง + แจ้ง LINE"}
            </Btn>
          </div>
        )}
      </div>

      {/* ── Group Booking (จองแทนทีม) ── */}
      <div style={{marginTop:14,background:C.bg2,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden"}}>
        <div onClick={()=>setShowGroup(p=>!p)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",cursor:"pointer"}}>
          <div>
            <div style={{fontSize:12,fontWeight:800,color:"#fbbf24"}}>🏆 จองให้ทีมลูกค้า (ฐานเดิม)</div>
            <div style={{fontSize:10,color:C.sub,marginTop:1}}>ลูกค้าจองเป็นทีม — ไม่ต้องใช้ LINE ID, แค่ check-in ตอนมาถึง</div>
          </div>
          <div style={{color:C.sub,fontSize:16}}>{showGroup?"▲":"▼"}</div>
        </div>
        {showGroup&&(
          <div style={{padding:"0 16px 16px",display:"flex",flexDirection:"column",gap:8,borderTop:`1px solid ${C.border}`}}>
            <div style={{marginTop:12}}>
              <div style={{fontSize:10,color:C.sub,marginBottom:4}}>เลือกสล็อต</div>
              <select value={groupSlotId} onChange={e=>setGroupSlotId(e.target.value)}
                style={{width:"100%",background:"#0d1a0f",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",color:C.text,fontSize:13}}>
                <option value="">-- เลือกสล็อต --</option>
                {slots.map(s=>(
                  <option key={s.id} value={s.id}>{s.start_time?.slice(0,5)}–{s.end_time?.slice(0,5)} · {s.match_type||""}</option>
                ))}
              </select>
            </div>
            <div>
              <div style={{fontSize:10,color:C.sub,marginBottom:4}}>ชื่อทีม / กลุ่ม</div>
              <input value={groupTeamName} onChange={e=>setGroupTeamName(e.target.value)} placeholder="เช่น ทีม FC ลุงสมชาย"
                style={{width:"100%",background:"#0d1a0f",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",color:C.text,fontSize:13,boxSizing:"border-box"}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div>
                <div style={{fontSize:10,color:C.sub,marginBottom:4}}>จำนวนคน</div>
                <input value={groupPlayers} onChange={e=>setGroupPlayers(e.target.value)} placeholder="14" type="number" min={1}
                  style={{width:"100%",background:"#0d1a0f",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",color:C.text,fontSize:13,boxSizing:"border-box"}}/>
              </div>
              <div>
                <div style={{fontSize:10,color:C.sub,marginBottom:4}}>ยอดรวม (฿)</div>
                <input value={groupAmount} onChange={e=>setGroupAmount(e.target.value)} placeholder="0" type="number"
                  style={{width:"100%",background:"#0d1a0f",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",color:C.text,fontSize:13,boxSizing:"border-box"}}/>
              </div>
            </div>
            <Btn onClick={async()=>{
              const count = parseInt(groupPlayers)||0;
              if(!groupSlotId || count < 1) return;
              setGroupSaving(true);
              try {
                const teamName = groupTeamName.trim() || "ทีมลูกค้า";
                const perAmount = count>0 ? (parseFloat(groupAmount)||0)/count : 0;
                const rows = Array.from({length:count}).map(()=>({
                  player_id: null, slot_id: groupSlotId, venue_id: venueId,
                  amount: perAmount, status: "confirmed",
                  confirmed_at: new Date().toISOString(), confirmed_by: "partner",
                  booked_for_name: teamName,
                }));
                const {error} = await supabase.from("bookings").insert(rows);
                if(error){ console.error(error); alert("❌ บันทึกไม่สำเร็จ"); }
                else {
                  alert(`✅ จองให้ทีม "${teamName}" จำนวน ${count} คน — ตอนมาถึงให้ใช้ QR check-in`);
                  setGroupTeamName(""); setGroupPlayers(""); setGroupAmount(""); setGroupSlotId(""); setShowGroup(false);
                }
              } catch(e){ console.error(e); }
              setGroupSaving(false);
            }} disabled={groupSaving||!groupSlotId||!(parseInt(groupPlayers)>0)} style={{marginTop:4}}>
              {groupSaving?"กำลังบันทึก...":"🏆 สร้าง Group Booking"}
            </Btn>
          </div>
        )}
      </div>

      {/* ── Slip Preview Modal ── */}
      {slipPreview&&(
        <div onClick={()=>setSlipPreview(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:500,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}}>
          <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:500,position:"relative"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:800,color:"#fbbf24"}}>📎 สลิปการโอน</div>
              <div onClick={()=>setSlipPreview(null)} style={{color:C.sub,fontSize:24,cursor:"pointer",lineHeight:1}}>×</div>
            </div>
            <img src={slipPreview} alt="slip" style={{width:"100%",borderRadius:12,maxHeight:"75vh",objectFit:"contain"}}/>
            <div onClick={()=>window.open(slipPreview,"_blank")} style={{marginTop:10,textAlign:"center",fontSize:11,color:C.sub,cursor:"pointer",textDecoration:"underline"}}>เปิดรูปขนาดเต็ม ↗</div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══ MATCH END ═══ */
const MatchEndTab = ({onDone,slots}) => {
  // per-slot state maps: {slotId: bool}
  const [sent,setSent]       = useState({});
  const [loading,setLoading] = useState({});
  const [capCount,setCapCount]= useState({});

  const liveSlots  = (slots||[]).filter(s=>s.status==="live"||s.status==="captain_signaled");
  const endedToday = (slots||[]).filter(s=>s.status==="ended");

  const confirmSlot = async(s) => {
    const sid = s.id;
    setLoading(p=>({...p,[sid]:true}));
    try {
      // 1. Find matches row
      const {data:mRow} = await supabase.from("matches").select("id").eq("slot_id",sid).maybeSingle();
      const matchId = mRow?.id||null;
      let captainLineIds = [];
      if(matchId){
        // 2. Fetch captains
        const {data:caps} = await supabase.from("captain_lookup")
          .select("line_user_id").eq("match_id",matchId).eq("is_captain",true);
        captainLineIds = (caps||[]).map(c=>c.line_user_id).filter(Boolean);
        setCapCount(p=>({...p,[sid]:captainLineIds.length}));
        // 3. Mark ended in DB
        await supabase.from("matches").update({status:"ended"}).eq("id",matchId);
      }
      await supabase.from("slots").update({status:"ended"}).eq("id",sid);
      // 4. Notify via n8n
      await fetch(N8N_MATCH_END,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({match_id:matchId||0,venue_id:s.venue_id||0,captain_line_ids:captainLineIds})
      });
      setSent(p=>({...p,[sid]:true}));
    } catch(e){console.error("confirmSlot:",e);}
    setLoading(p=>({...p,[sid]:false}));
  };

  return(
    <div style={{maxWidth:600}}>
      {/* Stats row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:22}}>
        <div style={{background:"rgba(16,185,129,0.08)",border:`1px solid ${C.borderHi}`,borderRadius:14,padding:"14px 16px"}}>
          <div style={{fontSize:20,marginBottom:6}}>⏱️</div>
          <div style={{fontSize:22,fontWeight:900,color:C.greenBr,lineHeight:1}}>{liveSlots.length}</div>
          <div style={{fontSize:10,fontWeight:800,color:C.sub,letterSpacing:1.5,textTransform:"uppercase",marginTop:4}}>กำลัง Live</div>
          <div style={{fontSize:11,color:C.green,marginTop:3,fontWeight:700}}>รอยืนยันจบ</div>
        </div>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 16px"}}>
          <div style={{fontSize:20,marginBottom:6}}>✅</div>
          <div style={{fontSize:22,fontWeight:900,color:C.text,lineHeight:1}}>{endedToday.length}</div>
          <div style={{fontSize:10,fontWeight:800,color:C.sub,letterSpacing:1.5,textTransform:"uppercase",marginTop:4}}>จบแล้ววันนี้</div>
          <div style={{fontSize:11,color:C.sub,marginTop:3,fontWeight:700}}>Stats บันทึกแล้ว</div>
        </div>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 16px"}}>
          <div style={{fontSize:20,marginBottom:6}}>👥</div>
          <div style={{fontSize:22,fontWeight:900,color:C.text,lineHeight:1}}>{liveSlots.reduce((a,s)=>a+(s.players||0),0)}</div>
          <div style={{fontSize:10,fontWeight:800,color:C.sub,letterSpacing:1.5,textTransform:"uppercase",marginTop:4}}>ผู้เล่น Live</div>
          <div style={{fontSize:11,color:C.sub,marginTop:3,fontWeight:700}}>รอรับ XP + Stats</div>
        </div>
      </div>

      {/* Flow reminder */}
      <div style={{background:C.greenDim,border:`1px solid ${C.borderHi}`,borderRadius:12,padding:"12px 16px",marginBottom:18,fontSize:12,color:C.greenBr,lineHeight:1.8}}>
        <span style={{fontWeight:900}}>Flow:</span>{" "}
        <span style={{color:C.sub}}>กัปตันกด "แจ้งสนาม" → เห็น badge 🏁 → กด "ยืนยันจบ" → LINE ส่งลิงก์กรอกผลให้กัปตัน → XP + Stats อัพเดต</span>
      </div>

      {/* Live / captain_signaled slots list — each with its own End button */}
      {liveSlots.length===0 ? (
        <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:14,padding:"32px 24px",textAlign:"center",marginBottom:16}}>
          <div style={{fontSize:32,marginBottom:12}}>🏁</div>
          <div style={{fontSize:14,fontWeight:700,color:C.sub}}>ไม่มีแมตช์ที่กำลัง Live</div>
          <div style={{fontSize:12,color:C.muted,marginTop:6}}>เมื่อกัปตันกด "แจ้งสนาม" จะแสดง badge 🏁 ที่นี่</div>
        </div>
      ) : (
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:800,color:C.sub,letterSpacing:1.5,textTransform:"uppercase",marginBottom:10}}>แมตช์ที่รอยืนยัน</div>
          {liveSlots.map((s,i)=>{
            const isCaptainReady = s.status==="captain_signaled";
            const isDone   = !!sent[s.id];
            const isLoading= !!loading[s.id];
            const nCap     = capCount[s.id];
            return(
              <div key={s.id||i} style={{
                background:C.bg2,
                border:`1px solid ${isCaptainReady?C.amber:C.borderHi}`,
                borderRadius:14,padding:"16px",marginBottom:10,
                boxShadow: isCaptainReady?"0 0 14px rgba(251,191,36,0.12)":"none",
              }}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:isCaptainReady?C.amber:C.green,flexShrink:0,boxShadow:`0 0 6px ${isCaptainReady?C.amber:C.green}`}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:900,color:isCaptainReady?C.amber:C.green}}>
                      {s.name||`สนาม ${s.field||1} — ${s.time}`}
                    </div>
                    <div style={{fontSize:11,color:C.sub,marginTop:2}}>{s.time} · สนาม {s.field||1} · {s.players||0}/{s.total||14} คน</div>
                  </div>
                  {isCaptainReady
                    ? <span style={{fontSize:11,fontWeight:900,padding:"3px 10px",borderRadius:99,background:"rgba(251,191,36,0.12)",color:C.amber,border:`1px solid rgba(251,191,36,0.3)`}}>🏁 กัปตันพร้อม</span>
                    : <span style={{fontSize:11,fontWeight:900,padding:"3px 10px",borderRadius:99,background:"rgba(16,185,129,0.1)",color:C.green,border:`1px solid rgba(16,185,129,0.3)`}}>● LIVE</span>
                  }
                </div>
                {isDone ? (
                  <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:10,background:"rgba(16,185,129,0.08)",border:`1px solid ${C.borderHi}`}}>
                    <span style={{fontSize:16}}>✅</span>
                    <div>
                      <div style={{fontSize:13,fontWeight:800,color:C.green}}>ส่งแจ้งกัปตันแล้ว!</div>
                      <div style={{fontSize:11,color:C.sub}}>{nCap!=null?`แจ้ง ${nCap} กัปตัน · `:""}LINE กำลังส่งลิงก์กรอกผล</div>
                    </div>
                  </div>
                ) : (
                  <button onClick={()=>confirmSlot(s)} disabled={isLoading}
                    style={{width:"100%",padding:"12px 16px",borderRadius:10,border:`1px solid ${isCaptainReady?"rgba(251,191,36,0.5)":"rgba(16,185,129,0.4)"}`,background:isCaptainReady?"rgba(251,191,36,0.1)":"rgba(16,185,129,0.08)",color:isCaptainReady?C.amber:C.green,fontSize:14,fontWeight:900,cursor:isLoading?"not-allowed":"pointer",opacity:isLoading?.6:1}}>
                    {isLoading?"กำลังส่ง...":"⏱ ยืนยันแมตช์จบ →"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ═══ FINANCE ═══ */
const FinanceTab = ({venue,todaySlots=[]}) => {
  const [shopSales,setShopSales]=useState(0);
  const [shopHistory,setShopHistory]=useState([]);
  const [weeklyShop,setWeeklyShop]=useState([0,0,0,0,0,0,0]);
  const [monthlyShop,setMonthlyShop]=useState(Array(4).fill(0));
  const [activeTab,setActiveTab]=useState("overview");
  const [chartRange,setChartRange]=useState("week"); // week | month

  useEffect(()=>{
    if(!venue?.id)return;
    const today=new Date().toISOString().split("T")[0];
    const monthStart=today.slice(0,7)+"-01";
    supabase.from("shop_sales").select("*").eq("venue_id",venue.id)
      .gte("created_at",monthStart).order("created_at",{ascending:false})
      .then(({data})=>{
        if(!data)return;
        const todayData=data.filter(s=>s.created_at.startsWith(today));
        setShopSales(todayData.reduce((a,s)=>a+(s.total||0),0));
        setShopHistory(todayData);
        // Weekly: last 7 days
        const w=Array(7).fill(0);
        data.forEach(s=>{
          const d=new Date(s.created_at);
          const diff=Math.floor((new Date()-d)/86400000);
          if(diff<7)w[6-diff]=(w[6-diff]||0)+(s.total||0);
        });
        setWeeklyShop(w);
        // Monthly: 4 weeks
        const m=Array(4).fill(0);
        data.forEach(s=>{
          const d=new Date(s.created_at);
          const week=Math.floor((new Date().getDate()-d.getDate())/7);
          if(week>=0&&week<4)m[3-week]=(m[3-week]||0)+(s.total||0);
        });
        setMonthlyShop(m);
      });
  },[venue]);

  const slotRevenue=0; // รอ booking จริง Season 2
  const totalToday=shopSales+slotRevenue;
  const totalWeek=weeklyShop.reduce((a,b)=>a+b,0);
  const totalMonth=monthlyShop.reduce((a,b)=>a+b,0);
  const commissionSaved=Math.round(totalMonth*0.05);

  const chartData=chartRange==="week"?weeklyShop:monthlyShop;
  const chartMax=Math.max(...chartData,1);
  const chartLabels=chartRange==="week"
    ?["จ","อ","พ","พฤ","ศ","ส","วันนี้"]
    :["สัปดาห์ 1","สัปดาห์ 2","สัปดาห์ 3","สัปดาห์ 4"];

  const inp2={background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 12px",fontSize:11,color:C.text,outline:"none",cursor:"pointer"};

  return(
    <div>
      {/* S1 Banner */}
      <div style={{background:"rgba(16,185,129,0.06)",border:`1px solid rgba(16,185,129,0.22)`,borderRadius:14,padding:"12px 18px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontSize:24}}>🎉</div>
          <div>
            <div style={{fontSize:13,fontWeight:900,color:C.green}}>Season 1 — Founding Partner</div>
            <div style={{fontSize:10,color:C.sub,marginTop:2}}>Early Access · ฟรี commission ตลอด Season 1</div>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>Commission ปกติ</div>
          <div style={{display:"flex",alignItems:"baseline",gap:6,justifyContent:"flex-end"}}>
            <span style={{fontSize:22,fontWeight:900,color:C.green}}>ฟรี</span>
            <span style={{fontSize:12,color:C.muted,textDecoration:"line-through"}}>5%</span>
          </div>
        </div>
      </div>

      {/* Top metrics */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
        <MetricCard icon="📅" value={`฿${totalToday.toLocaleString()}`} label="รายได้วันนี้" foot="รวมทุกช่องทาง" footColor={C.green} hi/>
        <MetricCard icon="📊" value={`฿${totalWeek.toLocaleString()}`} label="อาทิตย์นี้" foot="7 วันล่าสุด" footColor={C.amber}/>
        <MetricCard icon="📈" value={`฿${totalMonth.toLocaleString()}`} label="เดือนนี้" foot={new Date().toLocaleDateString("th-TH",{month:"long"})}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:18}}>
        <MetricCard icon="🏟️" value={todaySlots.length||0} label="Slot วันนี้" foot={`${todaySlots.filter(s=>s.status==="live").length} LIVE`}/>
        <MetricCard icon="👥" value={todaySlots.reduce((a,s)=>a+(s.players||0),0)} label="ผู้เล่นวันนี้" foot="รวมทุก slot"/>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:6,marginBottom:14}}>
        {[{id:"overview",l:"📊 Overview"},{id:"shop",l:"🛒 ร้านค้า"},{id:"slot",l:"🏟️ Slot"}].map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)}
            style={{padding:"7px 16px",borderRadius:8,fontSize:12,fontWeight:800,cursor:"pointer",border:`1px solid ${activeTab===t.id?C.borderHi:C.border}`,background:activeTab===t.id?C.greenDim:"transparent",color:activeTab===t.id?C.green:C.sub,transition:"all .15s"}}>
            {t.l}
          </button>
        ))}
      </div>

      {/* Chart (shop + slot) with range selector */}
      {(activeTab==="shop"||activeTab==="slot")&&(
        <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:14,padding:18,marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:10,fontWeight:800,color:C.sub,letterSpacing:1.5,textTransform:"uppercase"}}>
              {activeTab==="shop"?"รายได้ร้านค้า":"รายได้ Slot"}
            </div>
            <select value={chartRange} onChange={e=>setChartRange(e.target.value)} style={inp2}>
              <option value="week">รายอาทิตย์</option>
              <option value="month">รายเดือน</option>
            </select>
          </div>
          <div style={{display:"flex",alignItems:"flex-end",gap:5,height:80,marginBottom:6}}>
            {chartData.map((v,i)=>(
              <div key={i} style={{flex:1,borderRadius:"3px 3px 0 0",background:i===chartData.length-1?C.green:C.greenBr,opacity:i===chartData.length-1?1:0.3+(v/chartMax)*0.5,height:`${Math.max((v/chartMax)*100,4)}%`,transition:"height .3s"}}/>
            ))}
          </div>
          <div style={{display:"flex",gap:5}}>
            {chartLabels.map((l,i)=>(
              <div key={i} style={{flex:1,fontSize:8,color:i===chartLabels.length-1?C.green:C.muted,textAlign:"center",fontWeight:i===chartLabels.length-1?800:400}}>{l}</div>
            ))}
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab==="overview"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            {[
              {l:"Utilization",v:todaySlots.length>0?`${Math.round(todaySlots.filter(s=>s.status!=="available").length/todaySlots.length*100)}%`:"—",sub:`${venue?.field_count||3} สนาม`,pct:todaySlots.length>0?Math.round(todaySlots.filter(s=>s.status!=="available").length/todaySlots.length*100):0},
              {l:"Active Players",v:todaySlots.reduce((a,s)=>a+(s.players||0),0),sub:"วันนี้",pct:Math.min(todaySlots.reduce((a,s)=>a+(s.players||0),0)/100*100,100)},
              {l:"Slot เดือนนี้",v:todaySlots.length,sub:"Platform + Offline",pct:50},
              {l:"Commission Saved",v:`฿${commissionSaved.toLocaleString()}`,sub:"S1 ประหยัดได้",pct:100},
            ].map((item,i)=>(
              <div key={i} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px"}}>
                <div style={{fontSize:9,fontWeight:700,color:C.muted,letterSpacing:1.5,textTransform:"uppercase",marginBottom:6}}>{item.l}</div>
                <div style={{fontSize:20,fontWeight:900,color:C.text,marginBottom:3}}>{item.v}</div>
                <div style={{fontSize:10,color:C.sub,marginBottom:6}}>{item.sub}</div>
                <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:99,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${item.pct}%`,background:`linear-gradient(90deg,#059669,${C.green})`,borderRadius:99}}/>
                </div>
              </div>
            ))}
          </div>
          <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:14,padding:18}}>
            <div style={{fontSize:10,fontWeight:800,color:C.sub,letterSpacing:1.5,textTransform:"uppercase",marginBottom:12}}>Commission Tracker — Season 1</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div><div style={{fontSize:13,fontWeight:800,color:C.text}}>ประหยัดได้เดือนนี้</div><div style={{fontSize:10,color:C.sub,marginTop:2}}>5% จาก ฿{totalMonth.toLocaleString()}</div></div>
              <div style={{fontSize:22,fontWeight:900,color:C.green}}>฿{commissionSaved.toLocaleString()}</div>
            </div>
            <div style={{fontSize:10,color:C.muted,lineHeight:1.7,padding:"10px",background:"rgba(16,185,129,0.04)",borderRadius:8}}>Founding Partner rate 5% จะถูก lock ไว้เมื่อ Season 2 เริ่มต้น · สนามที่เข้าร่วมตอนนี้ได้ rate พิเศษตลอดไป</div>
          </div>
        </div>
      )}

      {/* Shop Tab */}
      {activeTab==="shop"&&(
        <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:14,padding:18}}>
          <div style={{fontSize:10,fontWeight:800,color:C.sub,letterSpacing:1.5,textTransform:"uppercase",marginBottom:14}}>ประวัติร้านค้าวันนี้</div>
          {shopHistory.length===0?(
            <div style={{textAlign:"center",color:C.muted,fontSize:13,padding:"16px 0"}}>ยังไม่มี transaction วันนี้</div>
          ):shopHistory.map((s,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<shopHistory.length-1?`1px solid rgba(255,255,255,0.04)`:"none"}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:C.text}}>{s.items?.map(i=>`${i.name}×${i.qty}`).join(", ")||"—"}</div>
                <div style={{fontSize:10,color:C.sub,marginTop:2}}>{s.payment_method==="cash"?"💵 Cash":"📱 QR PromptPay"} · {new Date(s.created_at).toLocaleTimeString("th-TH",{hour:"2-digit",minute:"2-digit"})}</div>
              </div>
              <div style={{fontSize:15,fontWeight:900,color:C.green}}>฿{(s.total||0).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}

      {/* Slot Tab */}
      {activeTab==="slot"&&(
        <div>
          <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:14,padding:18,marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:800,color:C.sub,letterSpacing:1.5,textTransform:"uppercase",marginBottom:14}}>Slot วันนี้</div>
            {todaySlots.length===0?(
              <div style={{textAlign:"center",color:C.muted,fontSize:13,padding:"16px 0"}}>ยังไม่มี slot วันนี้</div>
            ):todaySlots.map((s,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<todaySlots.length-1?`1px solid rgba(255,255,255,0.04)`:"none"}}>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:s.status==="live"?C.green:C.text}}>{s.name||"ว่าง"}</div>
                  <div style={{fontSize:10,color:C.sub,marginTop:2}}>{s.time} · สนาม {s.field} · {s.players||0}/{s.total||14} คน</div>
                </div>
                <div style={{fontSize:11,fontWeight:800,color:s.status==="live"?C.green:s.source==="platform"?C.greenBr:C.sub}}>
                  {s.status==="live"?"● LIVE":s.source==="platform"?"Platform":"Offline"}
                </div>
              </div>
            ))}
          </div>
          <div style={{background:"rgba(16,185,129,0.04)",border:`1px solid rgba(16,185,129,0.1)`,borderRadius:12,padding:"12px 16px",fontSize:11,color:C.muted,lineHeight:1.7}}>
            รายได้ slot จะแสดงเมื่อ booking ผ่าน platform จริง · Season 2
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══ MOBILE ═══ */
const MobileApp = ({venue,slots,ownerUnlocked,onLogout}) => {
  const [mTab,setMTab]=useState("scan");
  const [showScanner,setShowScanner]=useState(false);
  const [scanId,setScanId]=useState(null);
  const [scanKey,setScanKey]=useState(0);
  const [activeMatch,setActiveMatch]=useState(null);
  const [showOwnerPin,setShowOwnerPin]=useState(false);
  const [mOwner,setMOwner]=useState(ownerUnlocked||false);
  const liveSlots=slots.filter(s=>s.status==="live"||s.status==="captain_signaled");

  const mNavItems=[
  {id:"scan",icon:"🔲",label:"Scan"},
  {id:"schedule",icon:"📅",label:"ตาราง"},
  {id:"matchend",icon:"⏱️",label:"จบแมตช์",badge:liveSlots.length||null},
  {id:"finance",icon:"💰",label:"รายได้",ownerOnly:true},
];

  const displaySlots = slots.length===0 ? MOCK_SLOTS : slots;

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'DM Sans',system-ui,sans-serif",position:"relative"}}>
      <header style={{padding:"12px 16px",background:"rgba(5,10,8,0.97)",backdropFilter:"blur(24px)",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:50}}>
        <Wordmark sm/>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:13,fontWeight:800,color:C.text}}>{venue?.name}</div>
          <div style={{display:"flex",alignItems:"center",gap:4,justifyContent:"flex-end",marginTop:2}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:C.green}}/>
            <span style={{fontSize:10,color:C.green}}>ออนไลน์</span>
          </div>
        </div>
      </header>

      <div style={{padding:"16px 16px 80px"}}>

        {/* ── SCAN ── */}
        {mTab==="scan"&&(
          <div>
            <div style={{background:C.bg2,border:`1px solid ${C.borderHi}`,borderRadius:16,padding:20,textAlign:"center",marginBottom:16}}>
              <div style={{fontSize:48,marginBottom:12}}>🔲</div>
              <div style={{fontSize:17,fontWeight:900,color:C.text,marginBottom:6}}>Scan Player QR</div>
              <div style={{fontSize:13,color:C.sub,marginBottom:20,lineHeight:1.7}}>ให้ผู้เล่นเปิด SQUAD HUB<br/>แล้วโชว์ "Player QR"</div>
              <Btn onClick={()=>setShowScanner(true)} style={{width:"100%",padding:14,fontSize:15}}>🔲 เปิดกล้องสแกน</Btn>
            </div>
            {liveSlots.length>0&&(
              <div>
                <div style={{fontSize:10,fontWeight:800,color:C.sub,letterSpacing:1.5,textTransform:"uppercase",marginBottom:10}}>แมตช์ที่ต้องยืนยัน</div>
                {liveSlots.map(s=>(
                  <div key={s.id} style={{background:C.bg2,border:`1px solid ${C.borderHi}`,borderRadius:14,padding:"14px 16px",marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <div style={{width:6,height:6,borderRadius:"50%",background:s.status==="captain_signaled"?C.amber:C.green}}/>
                          <span style={{fontSize:14,fontWeight:900,color:s.status==="captain_signaled"?C.amber:C.green}}>{s.name}</span>
                        </div>
                        <div style={{fontSize:11,color:C.sub,marginTop:3}}>{s.time} · {s.players||0}/{s.total||14} คน</div>
                      </div>
                      <Tag color={s.status==="captain_signaled"?C.amber:C.green}>{s.status==="captain_signaled"?"🏁 กัปตันพร้อม":"LIVE"}</Tag>
                    </div>
                    <button onClick={()=>{setActiveMatch(s);setMTab("matchend");}}
                      style={{width:"100%",padding:11,borderRadius:9,border:`1px solid rgba(251,191,36,0.4)`,background:`rgba(251,191,36,0.08)`,color:C.amber,fontSize:13,fontWeight:800,cursor:"pointer"}}>
                      ⏱ ยืนยันแมตช์จบ
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SCHEDULE ── */}
{mTab==="schedule"&&(
  <div>
    {/* Dashboard metrics */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
      <div style={{background:C.greenDim,border:`1px solid ${C.borderHi}`,borderRadius:12,padding:"12px 14px"}}>
        <div style={{fontSize:9,fontWeight:800,color:C.sub,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>Slot วันนี้</div>
        <div style={{fontSize:22,fontWeight:900,color:C.greenBr,lineHeight:1}}>{displaySlots.length}</div>
        <div style={{fontSize:10,color:liveSlots.length>0?C.green:C.sub,marginTop:3,fontWeight:700}}>{liveSlots.length} กำลัง live</div>
      </div>
      <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px"}}>
        <div style={{fontSize:9,fontWeight:800,color:C.sub,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>ผู้เล่นวันนี้</div>
        <div style={{fontSize:22,fontWeight:900,color:C.text,lineHeight:1}}>{displaySlots.reduce((a,s)=>a+(s.players||0),0)}</div>
        <div style={{fontSize:10,color:C.sub,marginTop:3,fontWeight:700}}>จากทุก slot</div>
      </div>
      <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px"}}>
        <div style={{fontSize:9,fontWeight:800,color:C.sub,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>รายได้วันนี้</div>
        <div style={{fontSize:22,fontWeight:900,color:C.text,lineHeight:1}}>฿{displaySlots.reduce((a,s)=>a+(s.amount||0),0).toLocaleString()}</div>
        <div style={{fontSize:10,color:C.sub,marginTop:3,fontWeight:700}}>รวมทุกช่องทาง</div>
      </div>
      <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px"}}>
        <div style={{fontSize:9,fontWeight:800,color:C.sub,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>Utilization</div>
        <div style={{fontSize:22,fontWeight:900,color:C.text,lineHeight:1}}>{displaySlots.length>0?`${Math.round(displaySlots.filter(s=>s.status!=="available").length/displaySlots.length*100)}%`:"—"}</div>
        <div style={{fontSize:10,color:C.sub,marginTop:3,fontWeight:700}}>{displaySlots.filter(s=>s.status!=="available").length}/{displaySlots.length} slot</div>
      </div>
    </div>

    {/* Calendar Grid */}
    <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",marginBottom:20}}>
      <div style={{minWidth:380}}>
        <div style={{display:"grid",gridTemplateColumns:`52px repeat(3,1fr)`,marginBottom:4}}>
          <div/>
          {[1,2,3].map(i=>(
            <div key={i} style={{padding:"6px 8px",fontSize:10,fontWeight:800,letterSpacing:1,color:C.muted,textTransform:"uppercase",textAlign:"center"}}>⚽ {i}</div>
          ))}
        </div>
        {TIMES_NIGHT.map(time=>(
          <div key={time} style={{display:"grid",gridTemplateColumns:`52px repeat(3,1fr)`,marginBottom:4,minHeight:64}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:C.muted,fontStyle:"italic",flexShrink:0}}>{time}</div>
            {[1,2,3].map(fi=>{
              const slot=displaySlots.find(s=>s.time===time&&s.field===fi);
              return(
                <div key={fi} style={{padding:3}}>
                  {slot?(
                    <div onClick={()=>{if(slot.status==="live"){setActiveMatch(slot);setMTab("matchend");}}}
                      style={{height:"100%",borderRadius:8,padding:"7px 8px",background:slot.status==="live"?"rgba(16,185,129,0.18)":slot.source==="platform"?"rgba(16,185,129,0.08)":slot.status==="full"?"rgba(239,68,68,0.08)":"rgba(255,255,255,0.04)",border:`1px solid ${slot.status==="live"?"rgba(16,185,129,0.6)":slot.source==="platform"?"rgba(16,185,129,0.28)":slot.status==="full"?"rgba(239,68,68,0.25)":"rgba(255,255,255,0.1)"}`,cursor:"pointer"}}>
                      <div style={{fontSize:10,fontWeight:800,color:slot.status==="live"?C.greenBr:C.text,lineHeight:1.3,marginBottom:2}}>{slot.name||"—"}</div>
                      <div style={{fontSize:8,color:C.sub}}>{slot.source==="platform"?"Platform":"Offline"}</div>
                      {slot.total>0&&(
                        <div style={{display:"flex",gap:2,marginTop:4,flexWrap:"wrap"}}>
                          {Array.from({length:Math.min(slot.total,10)}).map((_,pi)=>(
                            <div key={pi} style={{width:5,height:5,borderRadius:"50%",background:pi<(slot.players||0)?C.green:"rgba(255,255,255,0.15)"}}/>
                          ))}
                        </div>
                      )}
                      {slot.status==="live"&&<div style={{fontSize:8,fontWeight:900,padding:"1px 5px",borderRadius:99,background:"rgba(16,185,129,0.2)",color:C.greenBr,border:`1px solid rgba(16,185,129,0.4)`,display:"inline-block",marginTop:3}}>● LIVE</div>}
                    </div>
                  ):(
                    <div style={{height:"100%",borderRadius:8,border:`1px dashed rgba(255,255,255,0.07)`,display:"flex",alignItems:"center",justifyContent:"center",minHeight:58}}>
                      <span style={{fontSize:10,color:C.muted}}>ว่าง</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>

    {/* Booking list ด้านล่าง */}
    <div style={{fontSize:10,fontWeight:800,color:C.sub,letterSpacing:1.5,textTransform:"uppercase",marginBottom:10}}>รายการจองทั้งหมด</div>
    <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
      <Tag color={C.green}>Platform {displaySlots.filter(s=>s.source==="platform").length}</Tag>
      <Tag color={C.sub}>Offline {displaySlots.filter(s=>s.source==="offline").length}</Tag>
      {liveSlots.length>0&&<Tag color={C.greenBr}>Live {liveSlots.length}</Tag>}
    </div>
    {displaySlots.map((s,i)=>(
      <div key={s.id||i} style={{background:C.bg2,border:`1px solid ${s.status==="live"?C.borderHi:C.border}`,borderRadius:12,padding:"12px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:14,fontWeight:900,color:s.status==="live"?C.green:C.text}}>{s.time}</span>
            <span style={{fontSize:10,color:C.muted}}>สนาม {s.field}</span>
            {s.status==="live"&&<div style={{width:5,height:5,borderRadius:"50%",background:C.green}}/>}
          </div>
          <div style={{fontSize:11,color:C.sub,marginTop:2}}>{s.name||"ว่าง"} · {s.players||0}/{s.total||0} คน</div>
        </div>
        <div style={{textAlign:"right"}}>
          {s.amount>0&&<div style={{fontSize:13,fontWeight:900,color:C.text,marginBottom:3}}>฿{s.amount.toLocaleString()}</div>}
          <Tag color={s.source==="platform"?C.green:C.sub}>{s.source==="platform"?"Platform":"Offline"}</Tag>
        </div>
      </div>
    ))}
  </div>
)}

        {/* ── MATCH END ── */}
        {mTab==="matchend"&&(
          <MatchEndTab onDone={()=>setMTab("scan")} slots={displaySlots}/>
        )}

        {/* ── FINANCE (owner only) ── */}
        {mTab==="finance"&&(
          mOwner ? (
            <div>
              <div style={{fontSize:11,fontWeight:800,color:C.amber,letterSpacing:1.5,textTransform:"uppercase",marginBottom:14}}>👑 รายได้ & กระเป๋า</div>
              <div style={{background:"rgba(16,185,129,0.06)",border:`1px solid rgba(16,185,129,0.25)`,borderRadius:12,padding:"12px 14px",marginBottom:14}}>
                <div style={{fontSize:13,fontWeight:900,color:C.green,marginBottom:3}}>🎉 Season 1 — ฟรี Commission</div>
                <div style={{fontSize:11,color:C.sub,lineHeight:1.5}}>ช่วง Early Access ไม่เก็บ commission ใดๆ รายได้เต็มๆ ของสนาม</div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px 14px"}}>
                  <div style={{fontSize:10,fontWeight:800,color:C.sub,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Commission rate</div>
                  <div style={{fontSize:22,fontWeight:900,color:C.green}}>ฟรี</div>
                  <div style={{fontSize:11,color:C.sub,marginTop:4}}>Founding Partner S1</div>
                </div>
              </div>
              <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px 14px",marginBottom:12}}>
                <div style={{fontSize:10,fontWeight:800,color:C.sub,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>รายได้วันนี้</div>
                <div style={{fontSize:26,fontWeight:900,color:C.text,marginBottom:4}}>฿{displaySlots.reduce((a,s)=>a+(s.amount||0),0).toLocaleString()}</div>
                <div style={{fontSize:11,color:C.sub}}>รวมทุกช่องทาง</div>
              </div>
              <Btn ghost onClick={handleLogout} style={{width:"100%",fontSize:13}}>↩ ออกจากระบบ</Btn>
            </div>
          ) : (
            <div style={{textAlign:"center",paddingTop:40}}>
              <div style={{fontSize:36,marginBottom:16}}>🔒</div>
              <div style={{fontSize:16,fontWeight:900,color:C.text,marginBottom:8}}>Owner Access</div>
              <div style={{fontSize:13,color:C.sub,marginBottom:24}}>ใส่ PIN เพื่อดูข้อมูลการเงิน</div>
              <Btn onClick={()=>setShowOwnerPin(true)} style={{width:"100%",maxWidth:280,margin:"0 auto"}}>ใส่ Owner PIN</Btn>
            </div>
          )
        )}

      </div>

      {/* Bottom Nav */}
      <nav style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(5,10,8,0.97)",backdropFilter:"blur(24px)",borderTop:`1px solid ${C.border}`,padding:"8px 0 18px",display:"flex",justifyContent:"space-around"}}>
        {mNavItems.map(n=>{
          const locked=n.ownerOnly&&!mOwner;
          return(
            <button key={n.id} onClick={()=>{if(locked){setShowOwnerPin(true);return;}setMTab(n.id);}}
              style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",padding:"4px 8px",position:"relative"}}>
              <span style={{fontSize:18}}>{n.icon}</span>
              <span style={{fontSize:8,fontWeight:800,letterSpacing:.5,textTransform:"uppercase",color:mTab===n.id?C.green:locked?C.muted:C.sub}}>{n.label}</span>
              {n.badge>0&&(
                <div style={{position:"absolute",top:0,right:4,width:14,height:14,borderRadius:"50%",background:C.amber,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:900,color:"#000"}}>{n.badge}</div>
              )}
              {locked&&<span style={{fontSize:8,color:C.muted}}>🔒</span>}
            </button>
          );
        })}
      </nav>

      {showOwnerPin&&<OwnerPin onSuccess={()=>{setShowOwnerPin(false);setTimeout(()=>{setMOwner(true);setMTab("finance");},50);}} onCancel={()=>setShowOwnerPin(false)}/>}
      {showScanner&&<QRScanner key={scanKey} onResult={id=>{
        const parsed=id.startsWith("SQ:")?id.replace("SQ:",""):id;
        setShowScanner(false);
        setScanId(parsed);
      }} onClose={()=>setShowScanner(false)}/>}
      {!showScanner&&scanId&&<ScanResult playerId={scanId}
        onClose={()=>setScanId(null)}
        onScanNext={()=>{setScanId(null);setScanKey(k=>k+1);setShowScanner(true);}}
      />}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}*{box-sizing:border-box}`}</style>
    </div>
  );
};
/* ═══ MAIN ═══ */
export default function SquadPartner() {
  const [unlocked,setUnlocked]=useState(false);
  const [venue,setVenue]=useState(null);
  const [tab,setTab]=useState("calendar");
  const [calView,setCalView]=useState("day");
  const [slots,setSlots]=useState([]);
  const [selectedSlot,setSelectedSlot]=useState(null);
  const [activeMatch,setActiveMatch]=useState(null);
  const [showPin,setShowPin]=useState(false);
  const [ownerUnlocked,setOwnerUnlocked]=useState(false);
  const [showScanner,setShowScanner]=useState(false);
  const [scanId,setScanId]=useState(null);
  const [isMobile,setIsMobile]=useState(window.innerWidth<768);
  const [calDate,setCalDate]=useState(new Date());
  const [restoring,setRestoring]=useState(true);
  const [showSplash,setShowSplash]=useState(true);

  useEffect(()=>{
    const fn=()=>setIsMobile(window.innerWidth<768);
    window.addEventListener("resize",fn);return()=>window.removeEventListener("resize",fn);
  },[]);

  // Auto-restore session on refresh
  useEffect(()=>{
    (async()=>{
      try {
        const {data:{session}}=await supabase.auth.getSession();
        if(session?.user?.email){
          const {data:v}=await supabase.from("venues").select("*")
            .eq("owner_email",session.user.email).single();
          if(v){setVenue(v);setUnlocked(true);}
        }
      } catch(e){console.error(e);}
      setRestoring(false);
    })();
  },[]);

  const fetchSlots = async(venueId)=>{
    const today=new Date().toISOString().split("T")[0];
    const {data}=await supabase.from("slots").select("*").eq("venue_id",venueId).gte("date",today).order("date").order("start_time");
    if(data)setSlots(data.map(s=>({
      id:s.id,date:s.date,time:s.start_time?.slice(0,5)||"—",
      endTime:s.end_time?.slice(0,5)||null,
      field:s.field_number||1,
      name:s.notes||(s.match_id?`MATCH #SQ-${s.match_id}`:""),
      players:0,total:s.max_players||14,
      source:s.status==="offline"?"offline":s.match_id?"platform":"platform",
      status:s.status==="open"?"available":s.status==="full"?"full":s.status==="live"?"live":s.status==="captain_signaled"?"captain_signaled":s.status==="ended"?"ended":s.status==="blocked"?"blocked":s.status==="cancelled"?"cancelled":"available",
      venue_id:venueId,amount:0,
    })));
  };

  useEffect(()=>{
    if(!venue)return;
    fetchSlots(venue.id);
  },[venue]);

  /* ── REALTIME: refresh slots when any slot for this venue changes ── */
  useEffect(()=>{
    if(!venue?.id) return;
    const ch = supabase
      .channel(`partner-slots-${venue.id}`)
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"slots",filter:`venue_id=eq.${venue.id}`},()=>{
        fetchSlots(venue.id);
      })
      .subscribe();
    return ()=>{ supabase.removeChannel(ch); };
  },[venue?.id]);

  const handleLogout=async()=>{await supabase.auth.signOut();setUnlocked(false);setVenue(null);setSlots([]);setOwnerUnlocked(false);};
  const calDateStr=calDate.toISOString().split("T")[0];
  const todaySlots=slots.filter(s=>s.date===calDateStr);
  const todayStr=new Date().toISOString().split("T")[0];
  const todaySlotsReal=slots.filter(s=>s.date===todayStr);
  const liveCount=todaySlotsReal.filter(s=>s.status==="live"||s.status==="captain_signaled").length;

  // คำนวณ field_count จาก slots จริง ถ้าไม่มีใช้ venue.field_count
  const maxFieldFromSlots=slots.length>0?Math.max(...slots.map(s=>s.field||1)):0;
  const fieldCount=Math.max(maxFieldFromSlots,venue?.field_count||3);
  const fields=Array.from({length:fieldCount});

  // Utilization คำนวณจาก slot วันที่เลือก
  const activeSlots=todaySlots.filter(s=>s.status!=="available"&&s.status!=="blocked"&&s.status!=="cancelled");
  const totalPossibleSlots=fieldCount*(todaySlots.length>0?Math.ceil(todaySlots.length/fieldCount):1);
  const utilPct=todaySlots.length>0?Math.round(activeSlots.length/todaySlots.length*100):0;

  // week start (Monday)
  const weekStart=new Date(calDate);
  weekStart.setDate(calDate.getDate()-((calDate.getDay()+6)%7));

  const navDate = () => {
    if(calView==="day") return calDate.toLocaleDateString("th-TH",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
    if(calView==="week"){const e=new Date(weekStart);e.setDate(e.getDate()+6);return `${weekStart.getDate()} – ${e.getDate()} ${e.toLocaleDateString("th-TH",{month:"long",year:"numeric"})}`;}
    return calDate.toLocaleDateString("th-TH",{month:"long",year:"numeric"});
  };
  const navPrev=()=>{const d=new Date(calDate);calView==="day"?d.setDate(d.getDate()-1):calView==="week"?d.setDate(d.getDate()-7):d.setMonth(d.getMonth()-1);setCalDate(d);};
  const navNext=()=>{const d=new Date(calDate);calView==="day"?d.setDate(d.getDate()+1):calView==="week"?d.setDate(d.getDate()+7):d.setMonth(d.getMonth()+1);setCalDate(d);};

  if(showSplash)return<SplashScreen onDone={()=>setShowSplash(false)}/>;
  if(restoring)return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:56,height:56,borderRadius:12,overflow:"hidden",margin:"0 auto 16px",border:"1px solid rgba(16,185,129,0.2)"}}>
          <ImgLoad src={LOGO_URL} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        </div>
        <div style={{fontSize:12,color:"#3d6b52",fontWeight:700,letterSpacing:2,textTransform:"uppercase"}}>กำลังโหลด...</div>
      </div>
    </div>
  );
  if(!unlocked)return<VenueLogin onSuccess={v=>{setVenue(v);setUnlocked(true);}}/>;
  if(isMobile)return<MobileApp venue={venue} slots={todaySlots} ownerUnlocked={ownerUnlocked} onLogout={handleLogout}/>;

  const navItems=[
    {id:"calendar",icon:"📅",label:"ตารางสนาม"},
    {id:"matchend",icon:"⏱️",label:"ยืนยันแมตช์จบ",badge:liveCount||null},
    {id:"booking",icon:"📋",label:"การจองทั้งหมด"},
    {id:"shop",icon:"🛒",label:"ร้านค้าสนาม"},
    {id:"finance",icon:"💰",label:"รายได้ & กระเป๋า",ownerOnly:true},
  ];

  return(
    <div style={{display:"flex",minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <aside style={{width:220,background:C.bg2,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",position:"fixed",top:0,left:0,height:"100vh",zIndex:100}}>
        <div style={{padding:"16px 18px 14px",borderBottom:`1px solid ${C.border}`}}><Wordmark/></div>
        <div style={{padding:"12px 18px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{fontSize:14,fontWeight:800,color:C.text,marginBottom:5}}>{venue?.name||"—"}</div>
          <div style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:10,fontWeight:800,letterSpacing:1,textTransform:"uppercase",color:C.green,background:C.greenDim,border:`1px solid ${C.borderHi}`,padding:"3px 9px",borderRadius:99}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:C.green,animation:"pulse 2s infinite"}}/>
            ออนไลน์
          </div>
        </div>
        <nav style={{flex:1,padding:"10px 8px",overflowY:"auto"}}>
          <div style={{padding:"8px 10px 4px",fontSize:9,fontWeight:800,letterSpacing:1.8,color:C.muted,textTransform:"uppercase"}}>จัดการ</div>
          {navItems.map(n=>{
            const locked=n.ownerOnly&&!ownerUnlocked;
            return(
              <button key={n.id} onClick={()=>{if(locked){setShowPin(true);return;}setTab(n.id);}}
                style={{display:"flex",alignItems:"center",gap:9,padding:"10px 12px",borderRadius:10,fontSize:14,fontWeight:700,color:tab===n.id?C.green:locked?C.muted:C.sub,background:tab===n.id?C.greenDim:"none",border:tab===n.id?`1px solid ${C.borderHi}`:"1px solid transparent",cursor:"pointer",width:"100%",textAlign:"left",transition:"all .15s",marginBottom:2,opacity:locked?.6:1}}>
                <span style={{opacity:tab===n.id?1:.7}}>{n.icon}</span>
                <span style={{flex:1}}>{n.label}</span>
                {n.badge>0&&<span style={{fontSize:11,fontWeight:900,padding:"1px 7px",borderRadius:99,background:"rgba(251,191,36,.15)",color:C.amber,border:"1px solid rgba(251,191,36,.25)"}}>{n.badge}</span>}
                {locked&&<span style={{fontSize:11}}>🔒</span>}
              </button>
            );
          })}
        </nav>
        <div style={{padding:"10px 12px 8px",margin:"0 8px 8px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10}}>
          <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:2}}>เข้าสู่ระบบในฐานะ</div>
          <div style={{fontSize:13,fontWeight:800,color:ownerUnlocked?C.amber:C.sub}}>{ownerUnlocked?"👑 เจ้าของ":"👤 Staff"}</div>
        </div>
        <div style={{padding:"12px 8px",borderTop:`1px solid ${C.border}`}}>
          <button onClick={handleLogout} style={{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:10,fontSize:13,fontWeight:700,color:C.muted,background:"none",border:"1px solid transparent",cursor:"pointer",width:"100%",textAlign:"left"}}>↩ ออกจากระบบ</button>
        </div>
      </aside>

      <div style={{marginLeft:220,flex:1,display:"flex",flexDirection:"column",background:"#050f0a"}}>
        <header style={{position:"sticky",top:0,height:56,background:"rgba(5,10,8,0.96)",backdropFilter:"blur(24px)",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 26px",zIndex:90}}>
          <div>
            <div style={{fontSize:16,fontWeight:900,color:C.text,textTransform:"uppercase",letterSpacing:.3}}>{navItems.find(n=>n.id===tab)?.label||"Dashboard"}</div>
            <div style={{fontSize:12,color:C.sub,marginTop:1}}>{new Date().toLocaleDateString("th-TH",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>setShowScanner(true)} style={{display:"flex",alignItems:"center",gap:7,padding:"9px 16px",borderRadius:10,background:`linear-gradient(135deg,#059669,${C.green})`,border:"none",color:"#001a0d",fontSize:14,fontWeight:900,cursor:"pointer"}}>🔲 Scan Player</button>
          </div>
        </header>

        <main style={{padding:26,background:"#050f0a"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:12,marginBottom:22}}>
            <MetricCard icon="🏟️" value={todaySlots.length||0} label="Slot วันนี้" foot={`${liveCount} กำลัง live`} footColor={liveCount>0?C.green:C.sub} hi/>
            <MetricCard icon="👥" value={todaySlots.reduce((a,s)=>a+(s.players||0),0)} label="ผู้เล่นวันนี้" foot="จากทุก slot"/>
            <MetricCard icon="💰" value={`฿${todaySlots.reduce((a,s)=>a+(s.amount||0),0).toLocaleString()}`} label="รายได้วันนี้" foot="รวมทุกช่องทาง"/>
            <MetricCard icon="📊" value={todaySlots.length>0?`${utilPct}%`:"—"} label="Utilization" foot={`${fieldCount} สนาม`}/>
          </div>

          {tab==="calendar"&&(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{fontSize:14,fontWeight:900,color:C.text}}>📅 ตารางรายวัน</div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <button onClick={navPrev} style={{width:32,height:32,borderRadius:7,background:C.bg2,border:`1px solid ${C.border}`,color:C.sub,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
<input type="date" value={calDate.toISOString().split("T")[0]} onChange={e=>setCalDate(new Date(e.target.value))}
  style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 12px",fontSize:13,fontWeight:800,color:C.text,cursor:"pointer",colorScheme:"dark"}}/>
<button onClick={navNext} style={{width:32,height:32,borderRadius:7,background:C.bg2,border:`1px solid ${C.border}`,color:C.sub,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
<button onClick={()=>setCalDate(new Date())} style={{padding:"6px 12px",borderRadius:7,background:C.greenDim,border:`1px solid ${C.borderHi}`,color:C.green,fontSize:12,fontWeight:800,cursor:"pointer"}}>วันนี้</button>
                </div>
              </div>

              <div style={{display:"grid",gridTemplateColumns:calView==="day"?"1fr 340px":"1fr",gap:16}}>
                <div>
                  {calView==="day"&&<DayView fields={fields} slots={todaySlots} date={calDate} onSelectSlot={setSelectedSlot}/>}
                </div>
                {calView==="day"&&<BookingPanel selected={selectedSlot} venueId={venue?.id} calDate={calDate} onSave={data=>console.log("save",data)} onRefresh={()=>fetchSlots(venue.id)}/>}
              </div>
            </div>
          )}
          {tab==="matchend"&&<MatchEndTab onDone={()=>setTab("calendar")} slots={todaySlotsReal}/>}
          {tab==="shop"&&<ShopTab venueId={venue?.id} ownerUnlocked={ownerUnlocked}/>}
          {tab==="finance"&&<FinanceTab venue={venue} todaySlots={todaySlots}/>}
          {tab==="booking"&&venue?.id&&<BookingConfirmTab venueId={venue.id} slots={todaySlotsReal}/>}
        </main>
      </div>

      {showPin&&<OwnerPin onSuccess={()=>{setOwnerUnlocked(true);setShowPin(false);setTab("finance");}} onCancel={()=>setShowPin(false)}/>}
      {showScanner&&<QRScanner onResult={id=>{
  const parsed=id.startsWith("SQ:")?id.replace("SQ:",""):id;
  setScanId(parsed);
  setShowScanner(false);
}} onClose={()=>setShowScanner(false)}/>}
      {scanId&&<ScanResult playerId={scanId}
        onClose={()=>setScanId(null)}
        onScanNext={()=>{setScanId(null);setShowScanner(true);}}
      />}
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}*{box-sizing:border-box}input[type="time"]::-webkit-calendar-picker-indicator{filter:invert(1);opacity:0.6;cursor:pointer}input[type="time"]{color-scheme:dark}`}</style>
    </div>
  );
}
