import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "./supabase";

/* ── LIFF CONFIG ── */
const LIFF_ID = "2009451264-q3ueO8ay";
import {
  User, MapPin, Trophy, ShieldCheck, ChevronRight, Zap,
  ArrowLeft, Flame, Clock, CheckCircle2, Medal, Bell,
  Search, Hexagon, Wind, Target, Shield, Activity,
  Send, MessageCircle, Users, Copy, Hash, Camera,
  Upload, Edit3, Star
} from "lucide-react";

/* ═══════════════ DESIGN TOKENS ═══════════════ */
const C = {
  bg:"#050f0a", bg2:"#091510", surface:"rgba(16,185,129,0.04)",
  border:"rgba(16,185,129,0.14)", borderHi:"rgba(16,185,129,0.35)",
  green:"#10d484", greenBr:"#34d399", greenDim:"rgba(16,185,129,0.08)",
  greenGlow:"rgba(16,185,129,0.15)",
  text:"#e8fff4", sub:"#6b9e85", muted:"#3d6b52",
  red:"#ef4444", blue:"#60a5fa", amber:"#fbbf24", purple:"#a78bfa",
  cardBg:"rgba(5,15,10,0.92)",
};
const CARD_STYLE = {
  background:"rgba(5,15,10,0.92)",
  border:"1px solid rgba(16,185,129,0.14)",
  borderRadius:16,
  boxShadow:"0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(16,185,129,0.06)",
};

/* Tier gradient stops */
const TIER_CFG = {
  Bronze:  { label:"Bronze",  stops:["#92400e","#d97706","#92400e"], glow:"#d97706" },
  Silver:  { label:"Silver",  stops:["#64748b","#cbd5e1","#64748b"], glow:"#cbd5e1" },
  Gold:    { label:"Gold",    stops:["#a16207","#fde047","#a16207"], glow:"#fde047" },
  Platinum:{ label:"Platinum",stops:["#94a3b8","#f1f5f9","#94a3b8"], glow:"#f1f5f9" },
  Diamond: { label:"Diamond", stops:["#0891b2","#67e8f9","#a78bfa"], glow:"#67e8f9" },
};

/* Position / style data */
const PC = { FW:"#ef4444", MF:"#10b981", DF:"#60a5fa", GK:"#fbbf24" };
const TC = { A:"#ef4444", B:"#60a5fa", C:"#10b981", D:"#fbbf24" };

const SM = {
  FW:{ Speedster:{pace:90,shooting:80,passing:65,dribbling:82,defending:40,physical:70}, Finisher:{pace:72,shooting:93,passing:60,dribbling:76,defending:38,physical:74}, Playmaker:{pace:68,shooting:72,passing:89,dribbling:79,defending:45,physical:65} },
  MF:{ Speedster:{pace:84,shooting:65,passing:78,dribbling:80,defending:55,physical:72}, Finisher:{pace:70,shooting:78,passing:76,dribbling:72,defending:58,physical:75}, Playmaker:{pace:66,shooting:60,passing:93,dribbling:83,defending:63,physical:65} },
  DF:{ Speedster:{pace:86,shooting:44,passing:68,dribbling:65,defending:83,physical:79}, "The Wall":{pace:58,shooting:40,passing:64,dribbling:54,defending:93,physical:89}, Playmaker:{pace:64,shooting:47,passing:81,dribbling:68,defending:86,physical:74} },
  GK:{ "The Wall":{pace:54,shooting:28,passing:62,dribbling:42,defending:93,physical:86}, Speedster:{pace:70,shooting:30,passing:64,dribbling:50,defending:89,physical:80}, Playmaker:{pace:57,shooting:33,passing:76,dribbling:48,defending:90,physical:78} },
};
const PLS = { FW:["Speedster","Finisher","Playmaker"], MF:["Speedster","Finisher","Playmaker"], DF:["Speedster","The Wall","Playmaker"], GK:["The Wall","Speedster","Playmaker"] };
const OVR = s => Math.round(s.pace*.18+s.shooting*.18+s.passing*.16+s.dribbling*.16+s.defending*.16+s.physical*.16);
const KEY_STATS = { FW:["shooting","pace","dribbling"], MF:["passing","dribbling","pace"], DF:["defending","physical","pace"], GK:["defending","physical","passing"] };
const NICKS = {
  FW:{ Speedster:{nick:"สายฟ้า ⚡",tags:["#SpeedDemon","#ปีกไฟ","#เร็วกว่าเงา"]}, Finisher:{nick:"เครื่องทำประตู 🎯",tags:["#GoalMachine","#หน้าเป้า","#ไม่มีพลาด"]}, Playmaker:{nick:"จอมวางเกม 🧠",tags:["#CreativeFW","#ตัวจี๊ด","#จ่ายแล้วบุก"]} },
  MF:{ Speedster:{nick:"ม้าใช้ทีม 🐎",tags:["#BoxToBox","#วิ่งไม่หยุด","#ปอดเหล็ก"]}, Finisher:{nick:"MF หน้าเป้า 💥",tags:["#GoalMidfield","#ยิงจากนอก","#ไม่ใช่แค่ส่ง"]}, Playmaker:{nick:"ปรมาจารย์จ่าย 🎼",tags:["#KingAssist","#VisionGod","#จ่ายทะลุแนว"]} },
  DF:{ Speedster:{nick:"กำแพงเคลื่อนที่ 🏃",tags:["#SweepKeeper","#ดักบุก","#ไล่ไม่ทัน"]}, "The Wall":{nick:"กำแพงเหล็ก 🧱",tags:["#TheWall","#ผ่านไม่ได้","#หัวโขก"]}, Playmaker:{nick:"ลิเบโร่ 🎯",tags:["#Libero","#บิ้วจากหลัง","#กองหลังจ่ายได้"]} },
  GK:{ "The Wall":{nick:"เทพเจ้าประตู 🧤",tags:["#WallGK","#เซฟไม่ยั้ง","#ผ่านไม่ผ่าน"]}, Speedster:{nick:"GK ปีกเร็ว ⚡",tags:["#SweepingGK","#ออกมาเลย","#ปอดเหล็ก"]}, Playmaker:{nick:"สร้างเกมจากหลัง 🎼",tags:["#PlaymakingGK","#เริ่มเกมจากประตู","#จ่ายทะลุ"]} },
};

const VENUES = [
  { id:1, name:"S-One Football Club", area:"ลาดพร้าว", distance:"2.5 km", rating:4.8, slots:[
    {id:101,time:"16:00",end:"18:00",type:"7v7",price:150,fee:20,status:"Open",  filled:8, total:28},
    {id:102,time:"18:00",end:"20:00",type:"7v7",price:150,fee:20,status:"Hot",   filled:24,total:28},
    {id:103,time:"20:00",end:"22:00",type:"5v5",price:120,fee:20,status:"Open",  filled:4, total:20},
  ]},
  { id:2, name:"Grand Soccer Pro",    area:"รามคำแหง", distance:"5.1 km", rating:4.5, slots:[
    {id:201,time:"17:00",end:"19:00",type:"7v7",price:140,fee:20,status:"Full",  filled:28,total:28},
  ]},
  { id:3, name:"Polo Football Park",  area:"บางนา",    distance:"7.8 km", rating:4.7, slots:[
    {id:301,time:"19:00",end:"21:00",type:"5v5",price:110,fee:20,status:"Open",  filled:4, total:20},
  ]},
];

const SEED_TEAMS = () => ([
  { id:"A", name:"ทีม A", color:TC.A, max:7, code:"A4X9",
    players:[
      {name:"กัปตัน",pos:"MF",ovr:92,nick:"ปรมาจารย์จ่าย 🎼",tags:["#KingAssist","#VisionGod"],form:[5,4,5,5,4],isCaptain:true,stats:SM.MF.Playmaker},
      {name:"อาร์ม",  pos:"FW",ovr:85,nick:"เครื่องทำประตู 🎯",tags:["#GoalMachine","#หน้าเป้า"],form:[4,5,3,5,5],stats:SM.FW.Finisher},
      {name:"บิ๊ก",  pos:"GK",ovr:82,nick:"เทพเจ้าประตู 🧤",tags:["#WallGK"],form:[5,5,4,3,5],stats:SM.GK["The Wall"]},
      {name:"ปอ",    pos:"DF",ovr:74,nick:"กำแพงเหล็ก 🧱",tags:["#TheWall"],form:[3,4,4,5,4],stats:SM.DF["The Wall"]},
    ]},
  { id:"B", name:"ทีม B", color:TC.B, max:7, code:"B7K2",
    players:[
      {name:"นิว",pos:"FW",ovr:80,nick:"สายฟ้า ⚡",tags:["#SpeedDemon"],form:[4,3,5,4,4],isCaptain:true,stats:SM.FW.Speedster},
      {name:"โจ้",pos:"MF",ovr:76,nick:"ม้าใช้ทีม 🐎",tags:["#BoxToBox"],form:[3,4,4,3,5],stats:SM.MF.Speedster},
      {name:"บอม",pos:"DF",ovr:78,nick:"กำแพงเคลื่อนที่ 🏃",tags:["#SweepKeeper"],form:[4,4,3,4,4],stats:SM.DF.Speedster},
    ]},
  { id:"C", name:"ทีม C", color:TC.C, max:7, code:"C2M5", players:[] },
  { id:"D", name:"ทีม D", color:TC.D, max:7, code:"D8P1", players:[] },
]);

const SEED_CHAT = [
  {id:1,team:"match",sender:"กัปตัน",msg:"ใครอยู่ทีม C บ้าง? มาเจอกันก่อนนะ",time:"17:42",pos:"MF"},
  {id:2,team:"match",sender:"นิว",msg:"ทีม B พร้อมแล้ว! 🔥",time:"17:43",pos:"FW"},
  {id:3,team:"A",sender:"อาร์ม",msg:"โค้ดทีม A4X9 ส่งให้เพื่อนด้วยนะ",time:"17:44",pos:"FW"},
  {id:4,team:"match",sender:"ระบบ",msg:"🟢 ทีม C เปิดรับ 7 ผู้เล่น",time:"17:45",isSystem:true},
  {id:5,team:"B",sender:"นิว",msg:"ทีม B จัดหนัก! 💪",time:"17:46",pos:"FW"},
];

/* ═══════════════ SHARED UI ═══════════════ */
const Tag = ({children,color=C.green,sm}) => (
  <span style={{fontSize:sm?8:9,fontWeight:800,letterSpacing:1,padding:sm?"2px 8px":"3px 11px",borderRadius:4,background:`${color}18`,color,textTransform:"uppercase",display:"inline-flex",alignItems:"center",gap:3,border:`1px solid ${color}40`,boxShadow:`0 0 8px ${color}20`}}>{children}</span>
);
const Btn = ({children,onClick,ghost,disabled,style={}}) => (
  <button
    onClick={disabled?undefined:onClick}
    onTouchStart={disabled?(e=>e.preventDefault()):undefined}
    disabled={disabled}
    style={{width:"100%",padding:"14px 20px",borderRadius:8,fontSize:13,fontWeight:900,letterSpacing:1,border:ghost?`1.5px solid ${C.border}`:`1px solid ${C.green}`,cursor:disabled?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:ghost?"transparent":`linear-gradient(135deg,#00c96b,${C.green})`,color:ghost?C.sub:"#001a0d",boxShadow:ghost?"none":`0 0 20px rgba(0,255,135,0.3), 0 4px 15px rgba(0,255,135,0.2)`,opacity:disabled?.4:1,transition:"all .2s",textTransform:"uppercase",pointerEvents:disabled?"none":"auto",...style}}
  >{children}</button>
);
const BackBtn = ({onClick}) => (
  <button onClick={onClick} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,fontWeight:800,color:C.sub,background:"none",border:"none",cursor:"pointer",padding:"0 0 16px",letterSpacing:1,textTransform:"uppercase"}}><ArrowLeft size={13}/>Back</button>
);
const Av = ({name,size=36,isCaptain,photo}) => {
  const pal=[C.green,"#3b82f6","#8b5cf6",C.amber,C.red,"#06b6d4"];
  const bg=pal[name.charCodeAt(0)%pal.length];
  return (
    <div style={{position:"relative",flexShrink:0}}>
      <div style={{width:size,height:size,borderRadius:"50%",overflow:"hidden",border:"2px solid rgba(255,255,255,0.1)",background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.38,fontWeight:900,color:"#fff"}}>
        {photo?<img src={photo} alt={name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:name[0].toUpperCase()}
      </div>
      {isCaptain&&<div style={{position:"absolute",bottom:-2,right:-2,background:C.amber,borderRadius:"50%",width:13,height:13,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:900,color:"#000",border:`1.5px solid ${C.bg}`}}>C</div>}
    </div>
  );
};

/* ═══════════════ TIER FRAME CARD ═══════════════ */
/* SQUAD HUB original shape: portrait with angled bottom corners */
const TierPhotoCard = ({photo,name,tier,position,onUpload,size=160}) => {
  const tc = TIER_CFG[tier]||TIER_CFG.Bronze;
  const [s0,s1] = tc.stops;
  const gradId = `tg-${tier}`;
  const glowId = `tglow-${tier}`;
  const W = size;
  const H = Math.round(size * 1.05); // สั้น เกือบ square

  return (
    <div style={{position:"relative",width:W,height:H,flexShrink:0,cursor:"pointer"}} onClick={onUpload}>
      {/* Ambient glow */}
      <div style={{position:"absolute",inset:-8,background:`radial-gradient(ellipse,${tc.glow}22 0%,transparent 70%)`,zIndex:0,borderRadius:16}}/>

      {/* SVG frame — gaming corner style */}
      <svg width={W} height={H} style={{position:"absolute",inset:0,zIndex:3,overflow:"visible"}} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={s0}/>
            <stop offset="100%" stopColor={s1}/>
          </linearGradient>
          <filter id={glowId}>
            <feGaussianBlur stdDeviation="1.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {/* Subtle full border */}
        <rect x="1" y="1" width={W-2} height={H-2} rx="8"
          fill="none" stroke={`url(#${gradId})`} strokeWidth="1" opacity="0.5"/>
        {/* Corner L — top left */}
        <path d={`M1 ${H*0.28} L1 1 L${W*0.28} 1`} fill="none" stroke={s1} strokeWidth="2.5" filter={`url(#${glowId})`}/>
        {/* Corner L — top right */}
        <path d={`M${W-W*0.28} 1 L${W-1} 1 L${W-1} ${H*0.28}`} fill="none" stroke={s1} strokeWidth="2.5" filter={`url(#${glowId})`}/>
        {/* Corner L — bottom left */}
        <path d={`M1 ${H-H*0.28} L1 ${H-1} L${W*0.28} ${H-1}`} fill="none" stroke={s1} strokeWidth="2.5" filter={`url(#${glowId})`}/>
        {/* Corner L — bottom right */}
        <path d={`M${W-W*0.28} ${H-1} L${W-1} ${H-1} L${W-1} ${H-H*0.28}`} fill="none" stroke={s1} strokeWidth="2.5" filter={`url(#${glowId})`}/>
        {/* Tier pill — bottom center */}
        <rect x={W/2-24} y={H-13} width="48" height="12" rx="2" fill="rgba(0,0,0,0.82)" stroke={s1} strokeWidth="0.5" strokeOpacity="0.6"/>
        <text x={W/2} y={H-5} textAnchor="middle" fontSize="6" fontWeight="900" fill={s1} fontFamily="system-ui" letterSpacing="2">{tc.label.toUpperCase()}</text>
      </svg>

      {/* Photo — full bleed */}
      <div style={{position:"absolute",inset:3,borderRadius:6,overflow:"hidden",zIndex:1}}>
        {photo
          ? <img src={photo} alt={name} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
          : <div style={{width:"100%",height:"100%",background:`linear-gradient(145deg,${PC[position]||C.green}15,rgba(5,12,8,0.97))`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5}}>
              <span style={{fontSize:size*0.35,fontWeight:900,color:PC[position]||C.green,lineHeight:1,opacity:.9}}>{name[0]?.toUpperCase()}</span>
              <span style={{fontSize:7,color:C.sub,letterSpacing:2,textTransform:"uppercase"}}>tap to upload</span>
            </div>
        }
        {/* POS badge */}
        <div style={{position:"absolute",top:5,left:5,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(4px)",borderRadius:3,padding:"2px 6px",border:`1px solid ${PC[position]||C.green}45`}}>
          <span style={{fontSize:7.5,fontWeight:900,color:PC[position]||C.green,letterSpacing:.8}}>{position}</span>
        </div>
        {/* Camera dot */}
        <div style={{position:"absolute",bottom:16,right:4,width:18,height:18,borderRadius:"50%",background:`linear-gradient(135deg,${s0},${s1})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 1px 6px ${tc.glow}50`}}>
          <Camera size={8} color="#fff"/>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════ STAT COMPONENTS ═══════════════ */
const MiniStat = ({label,value}) => {
  const col=value>=85?C.greenBr:value>=70?C.green:value>=55?"#94a3b8":C.sub;
  return (
    <div style={{textAlign:"center"}}>
      <div style={{fontSize:17,fontWeight:900,color:col,lineHeight:1}}>{value}</div>
      <div style={{fontSize:8,color:C.sub,fontWeight:700,letterSpacing:.8,textTransform:"uppercase",marginTop:2}}>{label}</div>
    </div>
  );
};
const FormDots = ({form=[]}) => (
  <div style={{display:"flex",gap:4}}>
    {form.map((v,i)=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:v>=4?C.green:v===3?C.amber:C.red,boxShadow:v>=4?`0 0 5px ${C.green}66`:"none"}}/>)}
  </div>
);

/* Key stats grid for profile */
const StatGrid = ({goals,assists,matches,wins}) => {
  const wr = matches>0?Math.round((wins/matches)*100):0;
  const items = [
    {label:"Goals",value:goals,  color:C.red,   icon:"⚽"},
    {label:"Assist",value:assists,color:C.blue,  icon:"🎯"},
    {label:"Matches",value:matches,color:C.text, icon:"🏟️"},
    {label:"Win Rate",value:`${wr}%`,color:C.green,icon:"🏆"},
  ];
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:7}}>
      {items.map(it=>(
        <div key={it.label} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"10px 6px",textAlign:"center"}}>
          <div style={{fontSize:14,marginBottom:3}}>{it.icon}</div>
          <div style={{fontSize:18,fontWeight:900,color:it.color,lineHeight:1}}>{it.value}</div>
          <div style={{fontSize:8,color:C.sub,fontWeight:700,marginTop:2,letterSpacing:.5}}>{it.label}</div>
        </div>
      ))}
    </div>
  );
};

/* ═══════════════ PITCH ═══════════════ */
const FullPitch = ({teams,onJoin,onPreview,myTeam}) => {
  const corners = [{id:"A",cx:80,cy:108},{id:"B",cx:240,cy:108},{id:"C",cx:80,cy:326},{id:"D",cx:240,cy:326}];
  const posColor = {FW:"#ef4444",MF:"#10b981",DF:"#60a5fa",GK:"#f59e0b"};
  return (
    <div style={{borderRadius:20,overflow:"hidden",border:"2px solid rgba(255,255,255,0.08)"}}>
      <svg viewBox="0 0 320 434" style={{width:"100%",display:"block",background:"linear-gradient(180deg,#0c3822 0%,#0f4a2a 20%,#0d3f25 50%,#0f4a2a 80%,#0c3822 100%)"}}>
        {[0,44,88,132,176,220,264,308,352,396].map(y=><rect key={y} x="12" y={y} width="296" height="22" fill="rgba(255,255,255,0.018)"/>)}
        <rect x="12" y="12" width="296" height="410" rx="3" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
        <line x1="12" y1="217" x2="308" y2="217" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
        <circle cx="160" cy="217" r="44" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5"/>
        <circle cx="160" cy="217" r="3" fill="rgba(255,255,255,0.3)"/>
        <rect x="76" y="12" width="168" height="64" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
        <rect x="110" y="12" width="100" height="28" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
        <rect x="76" y="358" width="168" height="64" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
        <rect x="110" y="394" width="100" height="28" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
        <line x1="160" y1="12" x2="160" y2="205" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="5,5"/>
        <line x1="160" y1="229" x2="160" y2="422" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="5,5"/>
        {corners.map(corner=>{
          const team=teams.find(t=>t.id===corner.id);
          if(!team)return null;
          const filled=team.players.length, isFull=filled>=team.max, isMyT=myTeam===corner.id;
          const dotSpacing=14, totalDots=team.max, startX=corner.cx-(totalDots/2)*dotSpacing+7;
          return (
            <g key={team.id} style={{cursor:isFull&&!isMyT?"default":"pointer"}}
              onClick={()=>{ if(isFull&&!isMyT)return; onPreview&&onPreview(team); }}>
              <circle cx={corner.cx} cy={corner.cy} r="58"
                fill={isMyT?`${team.color}14`:`${team.color}07`}
                stroke={isMyT?team.color:isFull?"rgba(255,255,255,0.06)":`${team.color}40`}
                strokeWidth={isMyT?2:1}/>
              {/* ชื่อทีม + status */}
              <text x={corner.cx} y={corner.cy-36} textAnchor="middle" fontSize="10" fontWeight="800"
                fill={isMyT?team.color:isFull?"#4b5563":"rgba(255,255,255,0.75)"} fontFamily="sans-serif">
                {team.name}{isMyT?" · ✓ คุณ":""}
              </text>
              {/* ตัวเลข */}
              <text x={corner.cx} y={corner.cy-8} textAnchor="middle" fontSize="28" fontWeight="900"
                fill={isFull?"#4b5563":"white"} fontFamily="sans-serif">{filled}/{team.max}</text>
              {/* mini dot row */}
              {Array.from({length:team.max}).map((_,di)=>{
                const p=team.players[di];
                const dx=startX+di*dotSpacing;
                const dy=corner.cy+16;
                const pc=p?posColor[p.pos]||team.color:null;
                return p?(
                  <g key={di}>
                    <circle cx={dx} cy={dy} r="7" fill={`${pc}25`} stroke={pc} strokeWidth="1.2"/>
                    <text x={dx} y={dy+2.5} textAnchor="middle" fontSize="6" fontWeight="900" fill="white" fontFamily="sans-serif">{p.name[0]}</text>
                  </g>
                ):(
                  <circle key={di} cx={dx} cy={dy} r="7" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="2,2"/>
                );
              })}
              {/* JOIN / FULL badge */}
              {!isMyT&&(
                <>
                  <rect x={corner.cx-22} y={corner.cy+28} width="44" height="13" rx="6"
                    fill={isFull?"rgba(255,255,255,0.03)":`${team.color}20`}/>
                  <text x={corner.cx} y={corner.cy+37.5} textAnchor="middle" fontSize="7.5" fontWeight="800"
                    fill={isFull?"#4b5563":team.color} fontFamily="sans-serif">
                    {isFull?"FULL":"+ JOIN"}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* ═══════════════ LOBBY PLAYER CARD ═══════════════ */
const HexAvatar = ({name, color, size=44, isCaptain, photo}) => {
  const initials = name[0]?.toUpperCase();
  return (
    <div style={{position:"relative", flexShrink:0, width:size, height:size}}>
      <svg width={size} height={size} viewBox="0 0 44 44" style={{position:"absolute",top:0,left:0}}>
        <defs>
          <linearGradient id={`hg-${name}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={color} stopOpacity="0.1"/>
          </linearGradient>
        </defs>
        <polygon points="22,2 40,12 40,32 22,42 4,32 4,12"
          fill={`url(#hg-${name})`} stroke={color} strokeWidth="1.5"
          style={{filter:`drop-shadow(0 0 6px ${color}60)`}}/>
      </svg>
      {photo
        ? <img src={photo} alt={name} style={{position:"absolute",top:"15%",left:"15%",width:"70%",height:"70%",objectFit:"cover",clipPath:"polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"}}/>
        : <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.38,fontWeight:900,color,textShadow:`0 0 10px ${color}`}}>{initials}</div>
      }
      {isCaptain && <div style={{position:"absolute",bottom:-2,right:-2,width:14,height:14,background:C.amber,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:900,color:"#000",border:`1.5px solid ${C.bg}`,boxShadow:`0 0 6px ${C.amber}`}}>C</div>}
    </div>
  );
};

const LobbyCard = ({player,teamColor,isMe}) => {
  const ks=KEY_STATS[player.pos]||["pace","shooting","passing"];
  const st=player.stats||{pace:70,shooting:70,passing:70,dribbling:70,defending:70,physical:70};
  const color = isMe ? C.green : teamColor;
  return (
    <div style={{...CARD_STYLE, padding:"14px", position:"relative", overflow:"hidden", marginBottom:8}}>
      {/* Corner accents */}
      <div style={{position:"absolute",top:0,left:0,width:16,height:16,borderTop:`2px solid ${color}`,borderLeft:`2px solid ${color}`,borderRadius:"4px 0 0 0"}}/>
      <div style={{position:"absolute",top:0,right:0,width:16,height:16,borderTop:`2px solid ${color}`,borderRight:`2px solid ${color}`,borderRadius:"0 4px 0 0"}}/>
      <div style={{position:"absolute",bottom:0,left:0,width:16,height:16,borderBottom:`2px solid ${color}`,borderLeft:`2px solid ${color}`,borderRadius:"0 0 0 4px"}}/>
      <div style={{position:"absolute",bottom:0,right:0,width:16,height:16,borderBottom:`2px solid ${color}`,borderRight:`2px solid ${color}`,borderRadius:"0 0 4px 0"}}/>

      {/* Glow bg */}
      {isMe && <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 30% 50%,${C.green}08 0%,transparent 70%)`}}/>}

      <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:10,position:"relative"}}>
        <HexAvatar name={player.name} color={color} size={46} isCaptain={player.isCaptain} photo={player.photo}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
            <span style={{fontSize:14,fontWeight:900,color:isMe?C.green:C.text,letterSpacing:.5}}>{player.name}</span>
            {isMe && <span style={{fontSize:8,color:C.green,fontWeight:800,letterSpacing:1,background:"rgba(0,255,135,0.1)",padding:"1px 6px",borderRadius:3,border:`1px solid ${C.green}40`}}>YOU</span>}
            {player.isCaptain && <span style={{fontSize:8,fontWeight:900,color:C.amber,background:"rgba(255,211,42,0.1)",border:`1px solid ${C.amber}40`,borderRadius:3,padding:"1px 6px",letterSpacing:.5}}>🎖️ C</span>}
          </div>
          {player.nick && <div style={{fontSize:10,color:C.sub,marginBottom:5,letterSpacing:.3}}>{player.nick}</div>}
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            <Tag color={PC[player.pos]||teamColor} sm>{player.pos}</Tag>
            <Tag color={C.sub} sm>OVR {player.ovr}</Tag>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:28,fontWeight:900,color,lineHeight:1,textShadow:`0 0 12px ${color}80`}}>{player.ovr}</div>
          <div style={{fontSize:8,color:C.sub,fontWeight:700,letterSpacing:1}}>RATING</div>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,position:"relative"}}>
        {ks.map(k=>{
          const val=st[k]||70;
          const pct=val;
          return (
            <div key={k} style={{background:"rgba(0,0,0,0.3)",borderRadius:6,padding:"8px 8px 6px",border:`1px solid rgba(0,255,135,0.08)`}}>
              <div style={{fontSize:20,fontWeight:900,color,lineHeight:1,marginBottom:3,textShadow:`0 0 8px ${color}60`}}>{val}</div>
              <div style={{height:2,background:"rgba(255,255,255,0.06)",borderRadius:99,marginBottom:3}}>
                <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:99,boxShadow:`0 0 4px ${color}`}}/>
              </div>
              <div style={{fontSize:7,color:C.sub,fontWeight:800,letterSpacing:1,textTransform:"uppercase"}}>{k}</div>
            </div>
          );
        })}
      </div>

      {/* Form dots */}
      {player.form?.length>0 && (
        <div style={{display:"flex",gap:4,marginTop:8,paddingTop:8,borderTop:`1px solid rgba(0,255,135,0.08)`}}>
          {player.form.map((v,i)=>(
            <div key={i} style={{width:7,height:7,borderRadius:"50%",background:v>=4?C.green:v===3?C.amber:C.red,boxShadow:v>=4?`0 0 5px ${C.green}`:"none"}}/>
          ))}
          <div style={{flex:1,textAlign:"right",display:"flex",gap:4,justifyContent:"flex-end",flexWrap:"wrap"}}>
            {player.tags?.slice(0,2).map(t=><span key={t} style={{fontSize:8,color:teamColor,fontWeight:700,opacity:.8}}>{t}</span>)}
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════ CHAT ═══════════════ */
const ChatPanel = ({messages,myName,onSend,teams}) => {
  const [msg,setMsg]=useState("");
  const [chatTab,setChatTab]=useState("match");
  const endRef=useRef(null);
  const tabs=[{id:"match",label:"⚽ Match",color:C.green},...teams.map(t=>({id:t.id,label:t.name,color:t.color}))];
  const filtered=messages.filter(m=>m.team===chatTab);
  const send=()=>{if(!msg.trim())return;onSend(msg.trim(),chatTab);setMsg("");};
  return (
    <div style={{display:"flex",flexDirection:"column",height:360,background:C.bg2,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden"}}>
      <div style={{display:"flex",overflowX:"auto",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setChatTab(t.id)}
            style={{flexShrink:0,padding:"9px 12px",background:"none",border:"none",cursor:"pointer",fontSize:10,fontWeight:800,color:chatTab===t.id?t.color:C.sub,borderBottom:`2px solid ${chatTab===t.id?t.color:"transparent"}`,transition:"all .2s",letterSpacing:.5}}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"10px 12px",display:"flex",flexDirection:"column",gap:8}}>
        {filtered.map(m=>{
          const isMe=m.sender===myName;
          if(m.isSystem) return <div key={m.id} style={{textAlign:"center",fontSize:10,color:C.sub,padding:"2px 0"}}>{m.msg}</div>;
          return (
            <div key={m.id} style={{display:"flex",gap:7,flexDirection:isMe?"row-reverse":"row",alignItems:"flex-end"}}>
              {!isMe&&<Av name={m.sender} size={24}/>}
              <div style={{maxWidth:"72%"}}>
                {!isMe&&<div style={{fontSize:9,color:C.sub,marginBottom:2,fontWeight:700}}>{m.sender} · {m.pos}</div>}
                <div style={{background:isMe?`linear-gradient(135deg,#059669,${C.green})`:"rgba(255,255,255,0.07)",borderRadius:isMe?"12px 12px 2px 12px":"12px 12px 12px 2px",padding:"8px 12px",fontSize:12,color:isMe?"#fff":C.text,lineHeight:1.5}}>
                  {m.msg}
                </div>
                <div style={{fontSize:8,color:C.sub,marginTop:2,textAlign:isMe?"right":"left"}}>{m.time}</div>
              </div>
            </div>
          );
        })}
        <div ref={endRef}/>
      </div>
      <div style={{display:"flex",gap:8,padding:"8px 10px",borderTop:`1px solid ${C.border}`,flexShrink:0}}>
        <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
          placeholder={`พิมพ์ใน ${chatTab==="match"?"Match":chatTab}...`}
          style={{flex:1,background:"rgba(255,255,255,0.05)",border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 12px",fontSize:12,color:C.text,outline:"none",fontFamily:"inherit"}}
          onFocus={e=>e.target.style.borderColor=C.green} onBlur={e=>e.target.style.borderColor=C.border}/>
        <button onClick={send} style={{width:36,height:36,borderRadius:10,background:msg.trim()?`linear-gradient(135deg,#059669,${C.green})`:"rgba(255,255,255,0.05)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <Send size={14} color={msg.trim()?"#fff":C.sub}/>
        </button>
      </div>
    </div>
  );
};

/* ═══════════════ JOIN MODAL ═══════════════ */
const JoinModal = ({teams,onJoin,onClose}) => {
  const [mode,setMode]=useState("choose");
  const [code,setCode]=useState("");
  const [err,setErr]=useState("");
  const tryCode=()=>{
    const t=teams.find(t=>t.code===code.toUpperCase());
    if(t){t.players.length>=t.max?setErr("ทีมนี้เต็มแล้วครับ"):onJoin(t.id);}
    else setErr("โค้ดไม่ถูกต้อง ลองใหม่นะครับ");
  };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:100}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:"20px 20px 0 0",padding:"20px 20px 36px",width:"100%",maxWidth:430}}>
        <div style={{width:40,height:4,borderRadius:99,background:"rgba(255,255,255,0.12)",margin:"0 auto 20px"}}/>
        {mode==="choose"&&(
          <>
            <div style={{fontSize:16,fontWeight:900,color:C.text,marginBottom:3}}>เข้าร่วมทีม</div>
            <div style={{fontSize:12,color:C.sub,marginBottom:18}}>เลือกทีมเองหรือใส่โค้ดจากเพื่อน</div>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
              {teams.map(t=>{
                const full=t.players.length>=t.max;
                return (
                  <button key={t.id} disabled={full} onClick={()=>onJoin(t.id)}
                    style={{padding:"12px 16px",borderRadius:14,border:`1.5px solid ${full?"rgba(255,255,255,0.05)":t.color+"40"}`,background:full?"rgba(255,255,255,0.02)":`${t.color}0e`,cursor:full?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:12,opacity:full?.5:1}}>
                    <div style={{width:10,height:10,borderRadius:2,background:t.color,flexShrink:0}}/>
                    <div style={{flex:1,textAlign:"left"}}>
                      <span style={{fontSize:13,fontWeight:800,color:C.text}}>{t.name}</span>
                      <span style={{fontSize:10,color:C.sub,marginLeft:8}}>{t.players.length}/{t.max} คน</span>
                    </div>
                    {full?<Tag color={C.sub} sm>FULL</Tag>:<ChevronRight size={14} color={t.color}/>}
                  </button>
                );
              })}
            </div>
            <button onClick={()=>setMode("code")} style={{width:"100%",padding:"12px 16px",borderRadius:14,border:`1.5px dashed ${C.borderHi}`,background:C.greenDim,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
              <Hash size={16} color={C.green}/>
              <div style={{textAlign:"left"}}>
                <div style={{fontSize:13,fontWeight:800,color:C.green}}>ใส่โค้ดทีม</div>
                <div style={{fontSize:10,color:C.sub}}>เพื่อนส่งโค้ดมาให้? ใส่ตรงนี้</div>
              </div>
            </button>
          </>
        )}
        {mode==="code"&&(
          <>
            <button onClick={()=>{setMode("choose");setCode("");setErr("");}} style={{display:"flex",alignItems:"center",gap:5,background:"none",border:"none",cursor:"pointer",color:C.sub,fontSize:12,fontWeight:700,marginBottom:16,padding:0}}><ArrowLeft size={13}/>กลับ</button>
            <div style={{fontSize:16,fontWeight:900,color:C.text,marginBottom:3}}>โค้ดทีม</div>
            <div style={{fontSize:12,color:C.sub,marginBottom:14}}>ใส่โค้ด 4 ตัวที่เพื่อนส่งให้</div>
            <input value={code} onChange={e=>setCode(e.target.value.toUpperCase().slice(0,4))} placeholder="A4X9"
              style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1.5px solid ${err?C.red:C.border}`,borderRadius:12,padding:"16px",fontSize:26,fontWeight:900,color:C.text,outline:"none",textAlign:"center",letterSpacing:8,boxSizing:"border-box",fontFamily:"monospace"}}/>
            {err&&<div style={{fontSize:11,color:C.red,marginTop:6,textAlign:"center"}}>{err}</div>}
            <div style={{marginTop:12}}><Btn disabled={code.length<4} onClick={tryCode}>เข้าร่วมทีม <ChevronRight size={15}/></Btn></div>
          </>
        )}
      </div>
    </div>
  );
};

/* ═══════════════ SQUAD LOGO ═══════════════ */
const LOGO_URL = "/logo.png";
const SquadLogo = ({ size = 32 }) => (
  <img
    src={LOGO_URL}
    alt="SQUAD HUB"
    width={size}
    height={size}
    style={{
      objectFit:"contain",
      objectPosition:"left center",
      borderRadius: size > 36 ? 12 : 8,
      display:"block",
      flexShrink:0,
    }}
  />
);

/* ═══════════════ MAIN APP ═══════════════ */
export default function SquadHub() {
  const [tab,setTab]         = useState("register");
  const [showQR,setShowQR] = useState(false);
  const [regStep,setRegStep] = useState(1);
  const [regData,setRegData] = useState({nickname:"",position:"",playstyle:""});
  const [payStep,setPayStep] = useState("summary");
  const [lang,setLang]       = useState("th");
  const T = (th,en) => lang==="th" ? th : en;
  const [appLoading,setAppLoading] = useState(true);
  const [player,setPlayer]   = useState(null);
  const [profilePhoto,setProfilePhoto] = useState(null);
  const [venue,setVenue]     = useState(null);
  const [slot,setSlot]       = useState(null);
  const [teams,setTeams]     = useState(SEED_TEAMS());
  const [myTeam,setMyTeam]   = useState(null);
  const [activeTeam,setActiveTeam] = useState(0);
  const [showJoin,setShowJoin] = useState(false);
  const [pitchPopup,setPitchPopup] = useState(null);
  const [lobbyTab,setLobbyTab] = useState("pitch");
  const [chatMsgs,setChatMsgs] = useState(SEED_CHAT);
  const [chatId,setChatId]   = useState(6);
  const [captainToast,setCaptainToast] = useState(null);
  const [venues,setVenues]   = useState(VENUES); // เริ่มจาก mock ก่อน แล้ว override ด้วย DB
  const [venuesLoading,setVenuesLoading] = useState(false);
  const fileRef = useRef(null);

  /* ── LIFF INIT + AUTO-LOGIN ── */
  useEffect(()=>{
    (async()=>{
      try {
        // โหลด LIFF SDK
        await new Promise((resolve, reject) => {
          if(window.liff) return resolve();
          const script = document.createElement("script");
          script.src = "https://static.line-scdn.net/liff/edge/versions/2.22.3/sdk.js";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });

        // Init LIFF
        await window.liff.init({ liffId: LIFF_ID });

        // ถ้าอยู่ใน LINE browser แต่ยังไม่ login → login เลย
        if(!window.liff.isLoggedIn()) {
          // ถ้าเปิดใน LINE app ให้ login อัตโนมัติ
          if(window.liff.isInClient()) {
            window.liff.login();
            return;
          }
          // ถ้าเปิดใน browser ปกติ → fallback localStorage
          const DEMO_ID = "5";
          const savedId = localStorage.getItem("squad_player_id") || DEMO_ID;
          const { data } = await supabase.from("players").select("*").eq("id", savedId).single();
          if(data) {
            const stats = SM[data.position]?.[data.playstyle]||{pace:70,shooting:70,passing:70,dribbling:70,defending:70,physical:70};
            const ni = NICKS[data.position]?.[data.playstyle];
            setPlayer({
              name:data.display_name,id:`SQ-${data.id}`,dbId:data.id,
              position:data.position||"MF",playstyle:data.playstyle||"Playmaker",
              nick:data.nickname||ni?.nick||"",tags:ni?.tags||[],
              tier:data.tier||"Bronze",reliability:data.reliability_score||100,
              level:data.level||1,xp:data.xp||0,stats,ovr:OVR(stats),
              matchStats:{matches:data.matches_played||0,wins:data.wins||0,losses:data.losses||0,mvp:data.mvp_count||0,goals:data.goals||0,assists:data.assists||0},
              form:[],
            });
            if(data.avatar_url) setProfilePhoto(data.avatar_url);
            setAppLoading(false); setTab("home");
          } else {
            setAppLoading(false); setTab("register");
          }
          return;
        }

        // Login แล้ว → ดึง profile
        const profile = await window.liff.getProfile();
        const lineUserId = profile.userId;

        // เช็คว่ามีใน DB ไหม — ใช้ line_user_id เป็น key หลัก
        const { data } = await supabase
          .from("players")
          .select("*")
          .eq("line_user_id", lineUserId)
          .single();

        if(data) {
          // มีแล้ว → auto-login ไม่ต้อง register ซ้ำ
          localStorage.setItem("squad_player_id", data.id);
          localStorage.setItem("squad_line_uid", lineUserId);
          const stats = SM[data.position]?.[data.playstyle] || {pace:70,shooting:70,passing:70,dribbling:70,defending:70,physical:70};
          const ni = NICKS[data.position]?.[data.playstyle];
          setPlayer({
            name:      data.display_name,
            id:        `SQ-${data.id}`,
            dbId:      data.id,
            lineUserId,
            lineAvatar: profile.pictureUrl,
            position:  data.position || "MF",
            playstyle: data.playstyle || "Playmaker",
            nick:      data.nickname || ni?.nick || "",
            tags:      ni?.tags || [],
            tier:      data.tier || "Bronze",
            reliability: data.reliability_score || 100,
            level:     data.level || 1,
            xp:        data.xp || 0,
            stats,
            ovr:       OVR(stats),
            matchStats:{
              matches: data.matches_played || 0,
              wins:    data.wins || 0,
              losses:  data.losses || 0,
              mvp:     data.mvp_count || 0,
              goals:   data.goals || 0,
              assists: data.assists || 0,
            },
            form: [],
          });
          if(data.avatar_url) setProfilePhoto(data.avatar_url);
          setAppLoading(false); setTab("home");
        } else {
          // ยังไม่มี → register พร้อม LINE profile
          setAppLoading(false);
          localStorage.setItem("squad_line_uid", lineUserId);
          localStorage.setItem("squad_line_name", profile.displayName);
          localStorage.setItem("squad_line_avatar", profile.pictureUrl || "");
        }
      } catch(e) {
  console.error("LIFF error:", e);
  const savedId = localStorage.getItem("squad_player_id") || "YOUR_DB_ID_HERE";
  if(!savedId || player) { setAppLoading(false); return; }
  const { data } = await supabase.from("players").select("*").eq("id", savedId).single();
  if(data) {
    if(data.avatar_url) setProfilePhoto(data.avatar_url);
    setAppLoading(false); setTab("home");
  } else { setAppLoading(false); setTab("register"); }
}
    })();
  },[]);

  /* ── FETCH VENUES จาก Supabase ── */
  useEffect(()=>{
    (async()=>{
      setVenuesLoading(true);
      const { data, error } = await supabase
        .from("venues")
        .select(`*, slots(*)`)
        .eq("is_active", true)
        .order("id");
      if(!error && data && data.length > 0){
        /* แปลง format ให้ตรงกับ VENUES mock */
        const mapped = data.map(v=>({
          id:       v.id,
          name:     v.name,
          area:     v.area || "",
          distance: "— km",
          rating:   v.rating || 5.0,
          slots:    (v.slots||[]).map(s=>({
            id:     s.id,
            time:   s.start_time?.slice(0,5) || "—",
            end:    s.end_time?.slice(0,5) || "—",
            type:   s.match_type || "7v7",
            price:  s.price_per_player || 150,
            fee:    s.platform_fee || 20,
            status: s.status === "open" ? "Open" : s.status === "full" ? "Full" : "Hot",
            filled: 0,
            total:  s.max_players || 14,
          })),
        }));
        setVenues(mapped);
      }
      setVenuesLoading(false);
    })();
  },[]);

const handlePhotoUpload = async (e) => {
  const file = e.target.files?.[0];
  if(!file || !player?.dbId) return;
  const reader = new FileReader();
  reader.onload = ev => setProfilePhoto(ev.target.result);
  reader.readAsDataURL(file);
  try {
    const path = `avatars/${player.dbId}`;
    const { error: upErr } = await supabase.storage
      .from('player-avatars')
      .upload(path, file, { upsert: true });
    if(upErr){ console.error("Upload error:", upErr); return; }
    const { data: urlData } = supabase.storage
      .from('player-avatars')
      .getPublicUrl(path);
    const publicUrl = urlData?.publicUrl;
    await supabase.from('players')
      .update({ avatar_url: publicUrl })
      .eq('id', player.dbId);
    setProfilePhoto(publicUrl);
  } catch(err){
    console.error("Photo upload failed:", err);
  }
};

  const finishRegister = async () => {
    const stats = SM[regData.position]?.[regData.playstyle]||{pace:70,shooting:70,passing:70,dribbling:70,defending:70,physical:70};
    const ni = NICKS[regData.position]?.[regData.playstyle];

    /* ดึง LINE ID จาก LIFF โดยตรง — ไม่พึ่ง localStorage */
    let lineUserId = localStorage.getItem("squad_line_uid");
    let lineAvatar = localStorage.getItem("squad_line_avatar") || null;
    let lineName   = localStorage.getItem("squad_line_name") || regData.nickname;

    // ถ้ายังไม่มี LINE ID ใน localStorage → ดึงจาก LIFF ตรงๆ เลย
    try {
      if(!lineUserId && window.liff && window.liff.isLoggedIn()) {
        const profile = await window.liff.getProfile();
        lineUserId = profile.userId;
        lineAvatar = profile.pictureUrl || null;
        lineName   = profile.displayName || regData.nickname;
        localStorage.setItem("squad_line_uid", lineUserId);
        localStorage.setItem("squad_line_name", lineName);
        localStorage.setItem("squad_line_avatar", lineAvatar || "");
      }
    } catch(e) {
      console.error("LIFF getProfile error:", e);
    }

    // fallback สุดท้าย — ถ้าไม่มี LINE ID จริงๆ
    if(!lineUserId) { setAppLoading(false); setTab("register"); return; }

    /* บันทึกลง Supabase */
    let dbId = null;
    try {
      const { data, error } = await supabase.from("players").insert({
        line_user_id:      lineUserId,
        display_name:      regData.nickname,
        avatar_url:        lineAvatar,
        position:          regData.position,
        playstyle:         regData.playstyle,
        tier:              "Bronze",
        nickname:          ni?.nick || "",
        level:             1,
        xp:                0,
        reliability_score: 100,
        matches_played:    0,
        wins:              0,
        losses:            0,
        goals:             0,
        assists:           0,
        mvp_count:         0,
      }).select("id").single();

      if(error) console.error("Supabase insert error:", error);
      else dbId = data?.id;

      if(dbId) localStorage.setItem("squad_player_id", dbId);

    } catch(e) {
      console.error("Supabase error:", e);
    }

    const newPlayer = {
      name:      regData.nickname,
      id:        dbId ? `SQ-${dbId}` : `SQ-${Math.floor(Math.random()*900)+100}`,
      dbId:      dbId,
      position:  regData.position,
      playstyle: regData.playstyle,
      nick:      ni?.nick || "",
      tags:      ni?.tags || [],
      tier:      "Bronze",
      reliability: 100,
      level:     1,
      xp:        0,
      stats,
      ovr:       OVR(stats),
      matchStats: { matches:0, wins:0, losses:0, mvp:0, goals:0, assists:0 },
      form:      [],
    };

    setPlayer(newPlayer);
    setTab("home");
  };

  const doJoin = (teamId) => {
    if(!player||myTeam)return;
    const me = {...player,pos:player.position,isMe:true,form:[4,3,5,4,4],photo:profilePhoto,isCaptain:false};
    setTeams(prev=>{
      const updated = prev.map(t=>t.id===teamId?{...t,players:[...t.players,me]}:t);
      // Auto-assign captain if team is now full and has no captain
      const team = updated.find(t=>t.id===teamId);
      if(team && team.players.length >= team.max) {
        const hasCaptain = team.players.some(p=>p.isCaptain);
        if(!hasCaptain) {
          const idx = Math.floor(Math.random()*team.players.length);
          const chosenName = team.players[idx].name;
          const isMe = team.players[idx].isMe;
          const assigned = updated.map(t=>t.id===teamId?{
            ...t,
            players:t.players.map((p,i)=>i===idx?{...p,isCaptain:true}:p)
          }:t);
          // Show toast after state settles
          setTimeout(()=>{
            setCaptainToast({teamId,name:chosenName,isMe});
            setTimeout(()=>setCaptainToast(null),5000);
          },200);
          const now2 = new Date().toLocaleTimeString("th",{hour:"2-digit",minute:"2-digit"});
          setChatMsgs(prev=>[...prev,
            {id:Date.now(),team:"match",sender:"ระบบ",msg:`🎖️ ${chosenName} ถูกเลือกเป็นกัปตัน${isMe?" (คุณ)":""} — ทีม ${teamId} พร้อมแล้ว!`,time:now2,isSystem:true}
          ]);
          return assigned;
        }
      }
      return updated;
    });
    setMyTeam(teamId);
    setActiveTeam(["A","B","C","D"].indexOf(teamId));
    setShowJoin(false);
    const now = new Date().toLocaleTimeString("th",{hour:"2-digit",minute:"2-digit"});
    setChatMsgs(prev=>[...prev,{id:chatId+1,team:"match",sender:"ระบบ",msg:`🟢 ${player.name} เข้าร่วม ${teams.find(t=>t.id===teamId)?.name}`,time:now,isSystem:true}]);
    setChatId(p=>p+1);
  };

  // Player voluntarily claims captain for their own team
  const claimCaptain = useCallback(() => {
    if(!myTeam||!player)return;
    setTeams(prev=>prev.map(t=>{
      if(t.id!==myTeam)return t;
      const hasCaptain = t.players.some(p=>p.isCaptain);
      if(hasCaptain)return t; // already assigned
      return {...t,players:t.players.map(p=>p.isMe?{...p,isCaptain:true}:p)};
    }));
    const now = new Date().toLocaleTimeString("th",{hour:"2-digit",minute:"2-digit"});
    setChatMsgs(prev=>[...prev,
      {id:Date.now(),team:"match",sender:"ระบบ",msg:`🎖️ ${player.name} ขอเป็นกัปตัน${myTeam ? ` ทีม ${myTeam}`:""} · +30 XP รอหลังแมตช์จบ!`,time:now,isSystem:true}
    ]);
    setCaptainToast({teamId:myTeam,name:player.name,isMe:true});
    setTimeout(()=>setCaptainToast(null),5000);
  },[myTeam,player]);

  const sendChat = (msg,chatTeam) => {
    if(!player)return;
    const now = new Date().toLocaleTimeString("th",{hour:"2-digit",minute:"2-digit"});
    setChatMsgs(prev=>[...prev,{id:chatId+1,team:chatTeam,sender:player.name,msg,time:now,pos:player.position}]);
    setChatId(p=>p+1);
  };

  /* ── LOGOUT ── */
  const handleLogout = () => {
    localStorage.removeItem("squad_player_id");
    setPlayer(null);
    setMyTeam(null);
    setTab("register");
  };

  const myTeamData = teams.find(t=>t.id===myTeam);

  /* ── REGISTER ── */
  const renderRegister = () => (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",padding:"24px 20px 48px"}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",marginBottom:32}}>
        <div style={{width:180,borderRadius:16,marginBottom:10,overflow:"hidden",background:"#091510",minHeight:180,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <img
            src={LOGO_URL}
            alt="SQUAD HUB"
            fetchpriority="high"
            loading="eager"
            decoding="sync"
            style={{width:180,objectFit:"contain",display:"block"}}
          />
        </div>
        <div style={{fontSize:9,color:C.sub,letterSpacing:2,textTransform:"uppercase"}}>Football Community</div>
      </div>
      <div style={{display:"flex",gap:6,justifyContent:"center",marginBottom:24}}>
        {[1,2,3].map(i=><div key={i} style={{height:3,borderRadius:99,background:i<=regStep?C.green:"rgba(255,255,255,0.08)",width:i===regStep?28:10,transition:"all .3s"}}/>)}
      </div>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,padding:"22px 20px"}}>
        {regStep===1&&(
          <div>
            <div style={{fontSize:10,color:C.green,fontWeight:800,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Step 1 · Nickname</div>
            <div style={{fontSize:19,fontWeight:900,color:C.text,marginBottom:16}}>ชื่อในสนาม</div>
            <input value={regData.nickname} onChange={e=>setRegData({...regData,nickname:e.target.value})} placeholder="เช่น นิว, กัปตัน, โจ้..."
              style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1.5px solid ${C.border}`,borderRadius:12,padding:"13px 16px",fontSize:15,color:C.text,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}
              onFocus={e=>e.target.style.borderColor=C.green} onBlur={e=>e.target.style.borderColor=C.border}/>
            <div style={{marginTop:14}}><Btn disabled={!regData.nickname.trim()} onClick={()=>setRegStep(2)}>ถัดไป <ChevronRight size={15}/></Btn></div>
          </div>
        )}
        {regStep===2&&(
          <div>
            <div style={{fontSize:10,color:C.green,fontWeight:800,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Step 2 · Position</div>
            <div style={{fontSize:19,fontWeight:900,color:C.text,marginBottom:16}}>ตำแหน่งหลัก</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
              {[{p:"FW",e:"⚽",d:"Forward"},{p:"MF",e:"🎯",d:"Midfielder"},{p:"DF",e:"🛡️",d:"Defender"},{p:"GK",e:"🧤",d:"Goalkeeper"}].map(({p,e,d})=>{
                const sel=regData.position===p;
                return <button key={p} onClick={()=>setRegData({...regData,position:p,playstyle:""})} style={{padding:"15px 10px",borderRadius:13,border:`2px solid ${sel?PC[p]:C.border}`,background:sel?`${PC[p]}14`:"transparent",cursor:"pointer",textAlign:"center",transition:"all .2s"}}>
                  <div style={{fontSize:22,marginBottom:4}}>{e}</div>
                  <div style={{fontSize:13,fontWeight:900,color:sel?PC[p]:C.text}}>{p}</div>
                  <div style={{fontSize:9,color:C.sub}}>{d}</div>
                </button>;
              })}
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn ghost onClick={()=>setRegStep(1)} style={{width:"auto",padding:"14px 16px"}}><ArrowLeft size={14}/></Btn>
              <Btn disabled={!regData.position} onClick={()=>setRegStep(3)} style={{flex:1}}>ถัดไป <ChevronRight size={15}/></Btn>
            </div>
          </div>
        )}
        {regStep===3&&(
          <div>
            <div style={{fontSize:10,color:C.green,fontWeight:800,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>Step 3 · Playstyle</div>
            <div style={{fontSize:19,fontWeight:900,color:C.text,marginBottom:4}}>สไตล์การเล่น</div>
            <div style={{fontSize:11,color:C.sub,marginBottom:16}}>ระบบคำนวณ Stats + ฉายาอัตโนมัติ</div>
            {(PLS[regData.position]||[]).map(style=>{
              const icons={Speedster:<Wind size={14}/>,Finisher:<Target size={14}/>,Playmaker:<Activity size={14}/>,"The Wall":<Shield size={14}/>};
              const sel=regData.playstyle===style;
              const ni=NICKS[regData.position]?.[style];
              return <button key={style} onClick={()=>setRegData({...regData,playstyle:style})} style={{width:"100%",padding:"12px 14px",borderRadius:12,border:`2px solid ${sel?C.green:C.border}`,background:sel?C.greenDim:"transparent",cursor:"pointer",display:"flex",alignItems:"center",gap:10,marginBottom:8,transition:"all .2s"}}>
                <div style={{color:sel?C.green:C.sub}}>{icons[style]}</div>
                <div style={{flex:1,textAlign:"left"}}>
                  <div style={{fontSize:13,fontWeight:800,color:sel?C.green:C.text}}>{style}</div>
                  {ni&&<div style={{fontSize:10,color:C.sub}}>ฉายา: {ni.nick}</div>}
                </div>
                {sel&&<CheckCircle2 size={14} color={C.green}/>}
              </button>;
            })}
            {regData.playstyle&&(
              <div style={{background:C.greenDim,border:"1px solid rgba(16,185,129,0.22)",borderRadius:13,padding:"12px 14px",margin:"10px 0"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <span style={{fontSize:9,fontWeight:800,color:C.green,letterSpacing:1.5,textTransform:"uppercase"}}>Predicted Stats</span>
                  <span style={{fontSize:24,fontWeight:900,color:C.text}}>{OVR(SM[regData.position]?.[regData.playstyle])} <span style={{fontSize:9,color:C.sub}}>OVR</span></span>
                </div>
                <div style={{display:"flex",justifyContent:"space-around"}}>
                  {(KEY_STATS[regData.position]||[]).map(k=><MiniStat key={k} label={k} value={SM[regData.position]?.[regData.playstyle]?.[k]}/>)}
                </div>
              </div>
            )}
            <div style={{display:"flex",gap:8,marginTop:4}}>
              <Btn ghost onClick={()=>setRegStep(2)} style={{width:"auto",padding:"14px 16px"}}><ArrowLeft size={14}/></Btn>
              <Btn disabled={!regData.playstyle} onClick={finishRegister} style={{flex:1}}>เข้าสู่ SQUAD HUB ⚡</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  /* ── PROFILE ── */
  const renderProfile = () => {
    if(!player)return null;
    const tc=TIER_CFG[player.tier];
    const ks=KEY_STATS[player.position]||["pace","shooting","passing"];
    const ms=player.matchStats;
    return (
      <div>
        <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePhotoUpload}/>
        <div style={{background:"linear-gradient(160deg,#091d12 0%,#0d1a2a 100%)",borderRadius:"0 0 28px 28px",paddingBottom:24,marginBottom:14,position:"relative",overflow:"hidden",borderBottom:`1px solid rgba(16,185,129,0.1)`}}>
          <div style={{position:"absolute",top:-40,right:-30,width:220,height:220,background:`radial-gradient(circle,${PC[player.position]}12 0%,transparent 70%)`}}/>
          <div style={{position:"absolute",bottom:-30,left:-20,width:160,height:160,background:"radial-gradient(circle,rgba(16,185,129,0.07) 0%,transparent 70%)"}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"16px 20px 0",position:"relative",zIndex:2}}>
            <div>
              <div style={{fontSize:9,fontWeight:800,color:C.green,letterSpacing:2.5,textTransform:"uppercase",marginBottom:4}}>Player Profile</div>
              <div style={{fontSize:24,fontWeight:900,color:C.text,letterSpacing:-.5,lineHeight:1}}>{player.name}</div>
              <div style={{fontSize:11,color:C.sub,marginTop:4}}>ID: {player.id}</div>
            </div>
            <div style={{textAlign:"right",paddingTop:4}}>
              <div style={{fontSize:46,fontWeight:900,color:C.green,fontStyle:"italic",lineHeight:1}}>{player.ovr}</div>
              <div style={{fontSize:8,color:C.sub,fontWeight:700,letterSpacing:2}}>OVERALL</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"flex-end",gap:14,padding:"16px 20px 0",position:"relative",zIndex:2}}>
            <TierPhotoCard photo={profilePhoto} name={player.name} tier={player.tier} position={player.position} onUpload={()=>fileRef.current?.click()} size={110}/>
            <div style={{flex:1,paddingBottom:6}}>
              <div style={{fontSize:13,fontWeight:900,color:C.text,marginBottom:5,lineHeight:1.3}}>{player.nick}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:10}}>
                {player.tags?.map(t=><span key={t} style={{fontSize:9,color:C.green,fontWeight:700,opacity:.85}}>{t}</span>)}
              </div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
                <Tag color={tc.glow} sm><Medal size={8}/>{player.tier}</Tag>
                <Tag color={PC[player.position]||C.green} sm>{player.position}</Tag>
                <Tag color={C.sub} sm>LV.{player.level}</Tag>
              </div>
              <div style={{display:"flex",gap:12}}>
                {ks.map(k=><MiniStat key={k} label={k} value={player.stats[k]}/>)}
              </div>
            </div>
          </div>
<div style={{padding:"8px 20px 0",position:"relative",zIndex:2}}>
            <button onClick={()=>setShowQR(true)}
              style={{width:"100%",padding:"10px 14px",borderRadius:10,background:"rgba(16,185,129,0.08)",border:`1px solid rgba(16,185,129,0.35)`,color:C.green,fontSize:13,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              🔲 QR ของฉัน — ให้สนาม Scan
            </button>
          </div>
        </div>
              <span style={{fontSize:9,fontWeight:800,color:C.green}}>{player.xp}%</span>
            </div>
            <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:99}}>
              <div style={{height:"100%",width:`${player.xp}%`,background:`linear-gradient(90deg,#059669,${C.greenBr})`,borderRadius:99}}/>
            </div>
          </div>
        </div>
        <div style={{padding:"0 16px"}}>
          <div style={{fontSize:10,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:C.sub,marginBottom:10}}>Match Stats</div>
          <div style={{marginBottom:12}}><StatGrid goals={ms.goals||0} assists={ms.assists||0} matches={ms.matches||0} wins={ms.wins||0}/></div>
          {ms.matches>0&&(
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"12px 16px",marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:10,fontWeight:800,color:C.green}}>ชนะ {ms.wins}</span>
                <span style={{fontSize:10,fontWeight:800,color:C.red}}>แพ้ {ms.losses}</span>
              </div>
              <div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:99,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${(ms.wins/ms.matches)*100}%`,background:`linear-gradient(90deg,#059669,${C.green})`,borderRadius:99}}/>
              </div>
            </div>
          )}
          <div style={{fontSize:10,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:C.sub,marginBottom:10}}>Key Info</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"14px"}}>
              <div style={{fontSize:9,color:C.sub,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Reliability</div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:`conic-gradient(${C.green} ${player.reliability*3.6}deg,rgba(255,255,255,0.05) 0deg)`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><ShieldCheck size={12} color={C.green}/></div>
                </div>
                <div>
                  <div style={{fontSize:20,fontWeight:900,color:C.green,lineHeight:1}}>{player.reliability}%</div>
                  <div style={{fontSize:9,color:C.sub,marginTop:2}}>No-Show: 0</div>
                </div>
              </div>
            </div>
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"14px"}}>
              <div style={{fontSize:9,color:C.sub,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>MVP Awards</div>
              <div style={{fontSize:28,fontWeight:900,color:C.amber,lineHeight:1}}>{ms.mvp||0}</div>
              <div style={{fontSize:9,color:C.sub,marginTop:4}}>ซีซั่น 1</div>
            </div>
          </div>
          <div style={{background:C.greenDim,border:`1px solid ${C.borderHi}`,borderRadius:14,padding:"12px 16px",marginBottom:10}}>
            <div style={{fontSize:9,fontWeight:800,color:C.green,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>ฉายา</div>
            <div style={{fontSize:15,fontWeight:900,color:C.text,marginBottom:6}}>{player.nick||"—"}</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {player.tags?.map(t=><span key={t} style={{fontSize:10,color:C.green,fontWeight:700}}>{t}</span>)}
            </div>
          </div>
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"12px 16px"}}>
            <div style={{fontSize:9,fontWeight:800,color:C.sub,letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>ฟอร์มล่าสุด</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <FormDots form={player.form?.length?player.form:[0,0,0,0,0]}/>
              <span style={{fontSize:10,color:C.sub}}>ยังไม่มีแมทช์</span>
            </div>
          </div>
        </div>
                {showQR&&(
  <div onClick={()=>setShowQR(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16}}>
    <div onClick={e=>e.stopPropagation()} style={{background:"#091510",border:`1px solid rgba(16,185,129,0.35)`,borderRadius:20,padding:24,width:"100%",maxWidth:340}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div style={{fontSize:16,fontWeight:900,color:C.text}}>🔲 QR ของฉัน</div>
        <button onClick={()=>setShowQR(false)} style={{background:"rgba(255,255,255,0.06)",border:"none",color:C.sub,fontSize:13,padding:"4px 10px",borderRadius:6,cursor:"pointer"}}>✕</button>
      </div>
      {/* QR Code */}
      <div style={{background:"#fff",borderRadius:16,padding:16,width:200,height:200,margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <svg viewBox="0 0 100 100" width="168" height="168" xmlns="http://www.w3.org/2000/svg">
          <text x="50" y="54" textAnchor="middle" fontSize="9" fontFamily="monospace" fill="#000">{`SQ:${player.dbId||player.id}`}</text>
          <rect x="2" y="2" width="30" height="30" rx="3" fill="none" stroke="#000" strokeWidth="4"/>
          <rect x="8" y="8" width="18" height="18" rx="1" fill="#000"/>
          <rect x="68" y="2" width="30" height="30" rx="3" fill="none" stroke="#000" strokeWidth="4"/>
          <rect x="74" y="8" width="18" height="18" rx="1" fill="#000"/>
          <rect x="2" y="68" width="30" height="30" rx="3" fill="none" stroke="#000" strokeWidth="4"/>
          <rect x="8" y="74" width="18" height="18" rx="1" fill="#000"/>
          {[38,48,58,38,58,38,48,58,68,78,88,68,88,68,78,88].map((x,i)=>(
            <rect key={i} x={x} y={[2,2,2,14,14,26,26,26,38,38,38,50,50,62,62,62][i]} width="8" height="8" fill="#000"/>
          ))}
          {[2,12,22,32,2,22,2,12,22,32].map((x,i)=>(
            <rect key={`b${i}`} x={x} y={[38,38,38,38,50,50,62,62,62,62][i]} width="8" height="8" fill="#000"/>
          ))}
        </svg>
      </div>
      <div style={{textAlign:"center",marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:800,color:C.sub,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>Player ID</div>
        <div style={{fontSize:14,fontWeight:900,color:C.green,fontFamily:"monospace",letterSpacing:2}}>SQ-{String(player.dbId||player.id).padStart(4,"0")}</div>
      </div>
      {/* Player info */}
      <div style={{display:"flex",alignItems:"center",gap:12,background:"rgba(16,185,129,0.06)",border:`1px solid rgba(16,185,129,0.2)`,borderRadius:14,padding:14}}>
        <div style={{width:44,height:44,clipPath:"polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",background:"rgba(139,92,246,0.2)",border:"2px solid #8b5cf6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color:"#8b5cf6",flexShrink:0}}>
          {player.name?.[0]?.toUpperCase()}
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:900,color:C.text}}>{player.name}</div>
          <div style={{fontSize:11,color:C.sub,marginTop:2}}>{player.position} · {player.tier}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:26,fontWeight:900,color:C.green,lineHeight:1}}>{player.ovr}</div>
          <div style={{fontSize:9,color:C.muted,fontWeight:700,letterSpacing:1}}>OVR</div>
        </div>
      </div>
      <div style={{fontSize:11,color:C.muted,textAlign:"center",marginTop:12,lineHeight:1.6}}>
        กดที่ไหนก็ได้เพื่อปิด
      </div>
    </div>
  </div>
)}
      </div>
    );
  };

    /* ── HOME ── */
  const renderHome = () => (
    <div style={{paddingTop:16}}>
      <div style={{display:"flex",alignItems:"center",gap:10,background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"11px 16px",marginBottom:20}}>
        <Search size={15} color={C.sub}/>
        <span style={{fontSize:13,color:C.sub}}>{T("ค้นหาสนาม, แมทช์...","Search venues, matches...")}</span>
      </div>
      <div onClick={()=>{setVenue(venues[0]);setSlot(venues[0]?.slots[1]||venues[0]?.slots[0]);setTeams(SEED_TEAMS());setMyTeam(null);setLobbyTab("pitch");setTab("room");}}
        style={{background:"linear-gradient(135deg,#0b1f14,#0d1824)",border:"1px solid rgba(239,68,68,0.22)",borderRadius:18,padding:"16px 18px",marginBottom:20,cursor:"pointer",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-20,right:-20,width:100,height:100,background:"radial-gradient(circle,rgba(239,68,68,0.07) 0%,transparent 70%)"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <Tag color={C.red}><Flame size={9}/> {T("แมทช์ยอดนิยม","HOT MATCH")}</Tag>
          <span style={{fontSize:10,color:C.sub}}>{T("เหลือ 4 slot","4 slots left")}</span>
        </div>
        <div style={{fontSize:17,fontWeight:900,color:C.text,marginBottom:2}}>S-One Football Club</div>
        <div style={{fontSize:12,color:C.green,fontWeight:700,marginBottom:10}}>18:00–20:00 · 7v7 · ฿170/คน</div>
        <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:99,marginBottom:8}}>
          <div style={{height:"100%",width:"86%",background:"linear-gradient(90deg,#dc2626,#ef4444)",borderRadius:99}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:10,color:C.sub}}>24/28 ผู้เล่น · 4 ทีม</span>
          <div style={{display:"flex",alignItems:"center",gap:3,fontSize:12,fontWeight:700,color:C.green}}>Join <ChevronRight size={13}/></div>
        </div>
      </div>
      <div style={{fontSize:10,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:C.sub,marginBottom:12}}>{T("สนามใกล้คุณ","Nearby Venues")}</div>
      {venuesLoading && <div style={{textAlign:"center",padding:"20px 0",fontSize:12,color:C.sub}}>กำลังโหลดสนาม...</div>}
      {venues.map(v=>(
        <div key={v.id} onClick={()=>{setVenue(v);setTab("venue");}}
          style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"13px 15px",marginBottom:10,cursor:"pointer",display:"flex",alignItems:"center",gap:13}}>
          <div style={{width:42,height:42,background:C.greenDim,border:`1px solid ${C.borderHi}`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><MapPin size={17} color={C.green}/></div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:800,color:C.text,marginBottom:3}}>{v.name}</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:10,color:C.sub}}>{v.area} · {v.distance}</span>
              <span style={{fontSize:10,color:C.amber,fontWeight:700}}>★ {v.rating}</span>
            </div>
          </div>
          <div style={{textAlign:"center"}}><div style={{fontSize:15,fontWeight:900,color:C.green}}>{v.slots.filter(s=>s.status!=="Full").length}</div><div style={{fontSize:8,color:C.sub,fontWeight:700}}>OPEN</div></div>
          <ChevronRight size={14} color={C.sub}/>
        </div>
      ))}
    </div>
  );

  /* ── VENUE ── */
  const renderVenue = () => (
    <div style={{paddingTop:16}}>
      <BackBtn onClick={()=>setTab("home")}/>
      <div style={{fontSize:21,fontWeight:900,color:C.text,marginBottom:3}}>{venue?.name}</div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
        <span style={{fontSize:11,color:C.sub}}>{venue?.area} · {venue?.distance}</span>
        <span style={{fontSize:11,color:C.amber,fontWeight:700}}>★ {venue?.rating}</span>
      </div>
      <div style={{fontSize:10,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:C.sub,marginBottom:10}}>ตารางแมทช์วันนี้</div>
      {venue?.slots.map(s=>{
        const sc=s.status==="Full"?C.sub:s.status==="Hot"?C.red:C.green;
        const pct=Math.round((s.filled/s.total)*100);
        return (
          <div key={s.id} onClick={()=>{if(s.status!=="Full"){setSlot(s);setTeams(SEED_TEAMS());setMyTeam(null);setLobbyTab("pitch");setTab("room");}}}
            style={{background:C.surface,border:`1px solid ${s.status==="Hot"?"rgba(239,68,68,0.22)":C.border}`,borderRadius:15,padding:"15px 17px",marginBottom:10,cursor:s.status==="Full"?"default":"pointer",opacity:s.status==="Full"?.5:1}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div>
                <div style={{fontSize:17,fontWeight:900,color:C.text}}>{s.time} <span style={{fontSize:12,color:C.sub}}>– {s.end}</span></div>
                <div style={{fontSize:11,color:C.sub,marginTop:2}}>{s.type} · 4 ทีม · ฿{s.price+s.fee}/คน</div>
              </div>
              <Tag color={sc}>{s.status}</Tag>
            </div>
            <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:99,marginBottom:7}}>
              <div style={{height:"100%",width:`${pct}%`,background:s.status==="Full"?"#374151":s.status==="Hot"?C.red:C.green,borderRadius:99}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:10,color:C.sub}}>{s.filled}/{s.total} ผู้เล่น</span>
              <span style={{fontSize:10,color:sc,fontWeight:700}}>{pct}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  /* ── ROOM ── */
  const renderRoom = () => {
    const curTeam=teams[activeTeam];
    return (
      <div style={{paddingTop:16}}>
        <BackBtn onClick={()=>{setMyTeam(null);setTeams(SEED_TEAMS());setTab("venue");}}/>
        <div style={{marginBottom:14,padding:"14px 16px",background:"rgba(0,255,135,0.04)",border:`1px solid rgba(0,255,135,0.15)`,borderRadius:12,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,background:"radial-gradient(circle,rgba(0,255,135,0.08) 0%,transparent 70%)"}}/>
          <div style={{fontSize:9,color:C.green,fontWeight:900,letterSpacing:3,textTransform:"uppercase",marginBottom:3,display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:C.green,boxShadow:`0 0 6px ${C.green}`,animation:"pulse 2s infinite"}}/>
            Match Lobby · Live
          </div>
          <div style={{fontSize:20,fontWeight:900,color:C.text,letterSpacing:.5}}>{venue?.name}</div>
          <div style={{fontSize:11,color:C.sub,marginTop:2,letterSpacing:.5}}>{slot?.time}–{slot?.end} · {slot?.type} · 4 Teams</div>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {[{id:"pitch",label:"🏟️ Stadium"},{id:"team",label:"👥 Team"},{id:"chat",label:"💬 Chat"}].map(lt=>(
            <button key={lt.id} onClick={()=>setLobbyTab(lt.id)}
              style={{flex:1,padding:"10px 6px",borderRadius:6,border:`1.5px solid ${lobbyTab===lt.id?C.green:"rgba(0,255,135,0.15)"}`,background:lobbyTab===lt.id?"rgba(0,255,135,0.1)":"rgba(0,0,0,0.3)",color:lobbyTab===lt.id?C.green:C.sub,fontSize:11,fontWeight:900,cursor:"pointer",transition:"all .2s",letterSpacing:.5,boxShadow:lobbyTab===lt.id?`0 0 12px rgba(0,255,135,0.2)`:"none",textTransform:"uppercase"}}>
              {lt.label}
            </button>
          ))}
        </div>

        {lobbyTab==="pitch"&&(
          <div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:8}}>
              {[{pos:"FW",color:"#ef4444"},{pos:"MF",color:"#10b981"},{pos:"DF",color:"#60a5fa"},{pos:"GK",color:"#f59e0b"}].map(({pos,color})=>(
                <div key={pos} style={{display:"flex",alignItems:"center",gap:4}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:color}}/>
                  <span style={{fontSize:9,fontWeight:700,color:C.sub}}>{pos}</span>
                </div>
              ))}
            </div>
            <FullPitch teams={teams} onJoin={()=>setShowJoin(true)} onPreview={t=>setPitchPopup(t)} myTeam={myTeam}/>
            <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap",justifyContent:"center"}}>
              {teams.map(t=><div key={t.id} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:2,background:t.color}}/><span style={{fontSize:9,fontWeight:700,color:myTeam===t.id?t.color:C.sub}}>{t.name} {t.players.length}/{t.max}</span></div>)}
            </div>
            {!myTeam&&<div style={{marginTop:14}}><Btn onClick={()=>setShowJoin(true)}>เลือกทีม / ใส่โค้ด <ChevronRight size={15}/></Btn></div>}
            {myTeam&&(
  <div style={{marginTop:12,background:"#0a1a0f",borderTop:`1px solid rgba(16,185,129,0.2)`,borderRadius:12,padding:"14px 16px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:10,height:10,borderRadius:2,background:myTeamData?.color}}/>
        <span style={{fontSize:14,fontWeight:900,color:C.text}}>{myTeamData?.name}</span>
        <span style={{fontSize:11,color:C.sub}}>{myTeamData?.players.length}/{myTeamData?.max} คน</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,fontWeight:700,color:C.green}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:C.green}}/>
        เข้าร่วมแล้ว
      </div>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
      <div style={{fontSize:10,color:C.sub}}>โค้ด:</div>
      <span style={{fontSize:12,fontWeight:900,color:myTeamData?.color,fontFamily:"monospace",letterSpacing:2}}>{myTeamData?.code}</span>
      <button onClick={()=>navigator.clipboard?.writeText(myTeamData?.code)} style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${C.border}`,borderRadius:6,padding:"2px 8px",cursor:"pointer",display:"flex",alignItems:"center",gap:4,color:C.sub,fontSize:10,fontWeight:700}}>
        <Copy size={11}/>Copy
      </button>
    </div>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
      <div style={{width:14,height:14,borderRadius:"50%",background:"rgba(251,191,36,0.15)",border:"1px solid rgba(251,191,36,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:C.amber,flexShrink:0}}>!</div>
      <span style={{fontSize:10,color:C.sub}}>กดยืนยันเพื่อล็อคที่นั่งและชำระเงิน · ยังไม่หักเงินจนกว่าจะยืนยัน</span>
    </div>
    <Btn onClick={()=>setTab("checkout")}>ยืนยันและชำระเงิน <ChevronRight size={15}/></Btn>
  </div>
)}
            {pitchPopup&&(
              <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:99,display:"flex",alignItems:"flex-end",justifyContent:"center"}}
                onClick={e=>{if(e.target===e.currentTarget)setPitchPopup(null)}}>
                <div style={{background:"#0f1f14",border:`1px solid ${pitchPopup.color}40`,borderRadius:"20px 20px 0 0",padding:"20px 16px 32px",width:"100%",maxWidth:480}}>
                  <div style={{width:36,height:4,borderRadius:99,background:"rgba(255,255,255,0.1)",margin:"0 auto 16px"}}/>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                    <div>
                      <div style={{fontSize:16,fontWeight:900,color:pitchPopup.color}}>{pitchPopup.name}</div>
                      <div style={{fontSize:10,color:C.sub,marginTop:2}}>{pitchPopup.players.length}/{pitchPopup.max} ผู้เล่น · ว่างอีก {pitchPopup.max-pitchPopup.players.length} ที่</div>
                    </div>
                    <button onClick={()=>setPitchPopup(null)} style={{background:"rgba(255,255,255,0.06)",border:"none",color:C.sub,fontSize:13,padding:"4px 10px",borderRadius:6,cursor:"pointer"}}>✕</button>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16,maxHeight:220,overflowY:"auto"}}>
                    {pitchPopup.players.map((p,i)=>{
                      const pc={FW:"#ef4444",MF:"#10b981",DF:"#60a5fa",GK:"#f59e0b"}[p.pos]||pitchPopup.color;
                      return (
                        <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:"rgba(0,0,0,0.3)",borderRadius:10,border:`1px solid ${C.border}`}}>
                          <div style={{width:30,height:30,borderRadius:"50%",border:`1.5px solid ${pc}`,overflow:"hidden",flexShrink:0,background:`${pc}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:pc}}>
  {p.photo
    ? <img src={p.photo} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
    : p.name[0]
  }
</div>
                          <div style={{flex:1,fontSize:12,fontWeight:700,color:C.text}}>{p.name}</div>
                          <div style={{fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:4,border:`1px solid ${pc}50`,background:`${pc}15`,color:pc}}>{p.pos}</div>
                          {p.isCaptain&&<span style={{fontSize:12}}>🎖️</span>}
                        </div>
                      );
                    })}
                    {Array.from({length:pitchPopup.max-pitchPopup.players.length}).map((_,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",border:`1px dashed ${C.border}`,borderRadius:10}}>
                        <div style={{width:30,height:30,borderRadius:"50%",border:`1px dashed ${C.border}`,flexShrink:0}}/>
                        <div style={{fontSize:11,color:C.muted}}>รอผู้เล่น...</div>
                      </div>
                    ))}
                  </div>
  {myTeam===pitchPopup.id ? (
  pitchPopup.players.find(p=>p.isMe)?.isCaptain ? (
    <div style={{padding:"12px 14px",borderRadius:12,background:C.greenDim,border:`1px solid ${C.borderHi}`,display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontSize:16}}>🎖️</span>
      <div>
        <div style={{fontSize:12,fontWeight:900,color:C.green}}>คุณเป็นกัปตันทีม!</div>
        <div style={{fontSize:10,color:C.sub}}>หลังแมตช์จบ บอทจะส่งฟอร์มสรุปทาง LINE</div>
      </div>
    </div>
  ) : !pitchPopup.players.some(p=>p.isCaptain) ? (
    <button onClick={()=>{claimCaptain();setPitchPopup(null);}}
      style={{width:"100%",padding:"12px 16px",borderRadius:12,border:`1.5px dashed ${C.amber}55`,background:`rgba(251,191,36,0.06)`,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
      <span style={{fontSize:16}}>🎖️</span>
      <div style={{textAlign:"left",flex:1}}>
        <div style={{fontSize:13,fontWeight:800,color:C.amber}}>ขอเป็นกัปตันทีม</div>
        <div style={{fontSize:10,color:C.sub}}>+30 XP bonus หลังแมตช์จบ</div>
      </div>
      <ChevronRight size={14} color={C.amber}/>
    </button>
  ) : (
    <div style={{padding:"10px 14px",borderRadius:12,background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:7}}>
      <span style={{fontSize:13}}>🎖️</span>
      <div style={{fontSize:11,color:C.sub}}>กัปตัน: <span style={{color:C.amber,fontWeight:800}}>{pitchPopup.players.find(p=>p.isCaptain)?.name}</span></div>
    </div>
  )
) : (
  <button onClick={()=>{doJoin(pitchPopup.id);setPitchPopup(null);}}
    style={{width:"100%",padding:13,borderRadius:12,border:"none",background:pitchPopup.color,color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",letterSpacing:.3}}>
    เข้าร่วม {pitchPopup.name}
  </button>
)}
                </div>
              </div>
            )}
          </div>
        )}

        {lobbyTab==="team"&&(
          <div>
            <div style={{display:"flex",gap:6,marginBottom:12,overflowX:"auto",paddingBottom:2}}>
              {teams.map((t,i)=>(
                <button key={t.id} onClick={()=>setActiveTeam(i)}
                  style={{flexShrink:0,padding:"7px 12px",borderRadius:99,border:`1.5px solid ${activeTeam===i?t.color:C.border}`,background:activeTeam===i?`${t.color}14`:"transparent",color:activeTeam===i?t.color:C.sub,fontSize:11,fontWeight:800,cursor:"pointer",transition:"all .2s",display:"flex",alignItems:"center",gap:4}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:activeTeam===i?t.color:C.sub}}/>
                  {t.name}{myTeam===t.id&&" ✓"}
                </button>
              ))}
            </div>
            <div style={{background:C.surface,border:`1px solid ${curTeam?.color}28`,borderRadius:16,padding:"12px 12px",marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:10,height:10,borderRadius:2,background:curTeam?.color}}/>
                  <span style={{fontSize:14,fontWeight:900,color:C.text}}>{curTeam?.name}</span>
                  <span style={{fontSize:10,color:C.sub}}>· <span style={{color:curTeam?.color,fontWeight:800,fontFamily:"monospace"}}>{curTeam?.code}</span></span>
                </div>
                <span style={{fontSize:11,color:curTeam?.color,fontWeight:700}}>{curTeam?.players.length}/{curTeam?.max}</span>
              </div>
              {curTeam?.players.length===0
                ?<div style={{textAlign:"center",padding:"20px 0",color:C.sub,fontSize:12}}>ยังไม่มีผู้เล่น</div>
                :<div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {curTeam.players.map((p,i)=><LobbyCard key={i} player={p} teamColor={curTeam.color} isMe={p.isMe}/>)}
                </div>
              }
            </div>
            {myTeam&&<Btn onClick={()=>setTab("checkout")}>ยืนยัน {myTeamData?.name} <ChevronRight size={15}/></Btn>}

            {/* 🎖️ Captain claim button */}
            {myTeam===curTeam?.id&&(
              curTeam?.players.find(p=>p.isMe)?.isCaptain ? (
                <div style={{marginTop:8,background:C.greenDim,border:`1px solid ${C.borderHi}`,borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:16}}>🎖️</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:900,color:C.green}}>คุณเป็นกัปตันทีม!</div>
                    <div style={{fontSize:10,color:C.sub}}>หลังแมตช์จบ บอทจะส่งฟอร์มสรุปให้ทาง LINE · +30 XP รอคุณ</div>
                  </div>
                </div>
              ) : !curTeam?.players.some(p=>p.isCaptain) ? (
                <button onClick={claimCaptain}
                  style={{marginTop:8,width:"100%",padding:"11px 16px",borderRadius:13,border:`1.5px dashed ${C.amber}55`,background:`rgba(251,191,36,0.06)`,cursor:"pointer",display:"flex",alignItems:"center",gap:10,transition:"all .2s"}}>
                  <span style={{fontSize:16}}>🎖️</span>
                  <div style={{textAlign:"left",flex:1}}>
                    <div style={{fontSize:13,fontWeight:800,color:C.amber}}>ขอเป็นกัปตันทีม</div>
                    <div style={{fontSize:10,color:C.sub}}>กัปตันสรุปผลแมตช์ให้ทีม · ได้ +30 XP bonus</div>
                  </div>
                  <ChevronRight size={14} color={C.amber}/>
                </button>
              ) : (
                <div style={{marginTop:8,background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`,borderRadius:12,padding:"9px 14px",display:"flex",alignItems:"center",gap:7}}>
                  <span style={{fontSize:13}}>🎖️</span>
                  <div style={{fontSize:11,color:C.sub}}>
                    กัปตัน: <span style={{color:C.amber,fontWeight:800}}>{curTeam?.players.find(p=>p.isCaptain)?.name}</span>
                    {curTeam?.players.find(p=>p.isCaptain)?.isMe&&<span style={{color:C.green}}> · คุณ</span>}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {lobbyTab==="chat"&&<ChatPanel messages={chatMsgs} myName={player?.name||"Guest"} onSend={sendChat} teams={teams}/>}
      </div>
    );
  };

  /* ── CHECKOUT ── */
  const PROMPTPAY_ID = "0800706187"; // ← เปลี่ยนเป็นเบอร์จริงของนาย

  const generatePromptPayQR = (phoneNumber, amount) => {
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const formattedPhone = "0066" + cleanPhone.slice(1);
    const payload = [
      "000201","010212",
      "2937"+"0016A000000677010111"+"01"+String(formattedPhone.length).padStart(2,"0")+formattedPhone,
      "5303764",
      "54"+String(amount.toFixed(2).length).padStart(2,"0")+amount.toFixed(2),
      "5802TH","6304",
    ].join("");
    let crc = 0xFFFF;
    for(let i=0;i<payload.length;i++){
      crc ^= payload.charCodeAt(i)<<8;
      for(let j=0;j<8;j++) crc=(crc&0x8000)?((crc<<1)^0x1021)&0xFFFF:(crc<<1)&0xFFFF;
    }
    return payload + crc.toString(16).toUpperCase().padStart(4,"0");
  };

  const renderCheckout = () => {
    const total = (slot?.price||0)+(slot?.fee||0);
    const qrData = generatePromptPayQR(PROMPTPAY_ID, total);
    const qrURL  = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrData)}`;

    /* ── Step 1: สรุปยอด ── */
    if(payStep==="summary") return (
      <div style={{paddingTop:16}}>
        <BackBtn onClick={()=>setTab("room")}/>
        <div style={{fontSize:22,fontWeight:900,fontStyle:"italic",textTransform:"uppercase",marginBottom:20,color:C.text}}>Checkout</div>
        <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:18,padding:"18px 20px",marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingBottom:14,borderBottom:"1px dashed rgba(255,255,255,0.07)",marginBottom:14}}>
            <div><div style={{fontSize:14,fontWeight:800,color:C.text,marginBottom:2}}>{venue?.name}</div><div style={{fontSize:11,color:C.sub}}>{slot?.time}–{slot?.end} · {slot?.type}</div></div>
            {myTeamData&&<Tag color={myTeamData.color}>{myTeamData.name}</Tag>}
          </div>
          {[{l:"ค่าแมทช์",v:`฿${slot?.price}`},{l:"Platform Fee",v:`฿${slot?.fee}`}].map(r=>(
            <div key={r.l} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.sub,marginBottom:9}}>
              <span>{r.l}</span><span style={{color:C.text,fontWeight:700}}>{r.v}</span>
            </div>
          ))}
          <div style={{borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:13,fontWeight:800,color:C.text}}>Total</span>
            <span style={{fontSize:30,fontWeight:900,color:C.green,fontStyle:"italic"}}>฿{total}</span>
          </div>
        </div>
        <div style={{background:"rgba(251,191,36,0.07)",border:"1px solid rgba(251,191,36,0.18)",borderRadius:12,padding:"10px 14px",marginBottom:20}}>
          <span style={{fontSize:11,color:C.amber,lineHeight:1.6}}>⚠️ {T("การยกเลิกหลัง 30 นาทีก่อนแมทช์จะส่งผลต่อ Reliability Score","Cancellation within 30 min of match affects your Reliability Score")}</span>
        </div>
        <Btn onClick={()=>setPayStep("qr")}>{T("ชำระด้วย PromptPay","Pay with PromptPay")} ⚡</Btn>
      </div>
    );

    /* ── Step 2: QR Code ── */
    if(payStep==="qr") return (
      <div style={{paddingTop:16}}>
        <button onClick={()=>setPayStep("summary")} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,fontWeight:700,color:C.sub,background:"none",border:"none",cursor:"pointer",padding:"0 0 16px",letterSpacing:.2}}>
          <ArrowLeft size={14}/>กลับ
        </button>
        <div style={{fontSize:22,fontWeight:900,fontStyle:"italic",textTransform:"uppercase",marginBottom:4,color:C.text}}>PromptPay QR</div>
        <div style={{fontSize:12,color:C.sub,marginBottom:20}}>สแกน QR เพื่อชำระเงิน</div>

        {/* QR Card — Premium Style */}
        <div style={{position:"relative",borderRadius:24,overflow:"hidden",marginBottom:16,background:"linear-gradient(160deg,#0d1f14,#091824)",border:`1.5px solid ${C.borderHi}`,boxShadow:`0 0 40px rgba(16,185,129,0.12)`}}>

          {/* Top glow */}
          <div style={{position:"absolute",top:-40,left:"50%",transform:"translateX(-50%)",width:200,height:200,background:`radial-gradient(circle,rgba(16,185,129,0.15) 0%,transparent 70%)`,pointerEvents:"none"}}/>

          {/* Header */}
          <div style={{padding:"20px 20px 0",textAlign:"center",position:"relative"}}>
            <div style={{fontSize:9,fontWeight:800,letterSpacing:3,textTransform:"uppercase",color:C.green,marginBottom:4}}>ยอดที่ต้องชำระ</div>
            <div style={{fontSize:44,fontWeight:900,color:C.green,fontStyle:"italic",lineHeight:1,marginBottom:20}}>฿{total}</div>
          </div>

          {/* QR Frame */}
          <div style={{display:"flex",justifyContent:"center",padding:"0 24px",marginBottom:24}}>
            <div style={{position:"relative",padding:3,borderRadius:20,background:`linear-gradient(135deg,${C.green},#059669,${C.green})`,boxShadow:`0 8px 32px rgba(16,185,129,0.25)`}}>
              <div style={{background:"#fff",borderRadius:17,padding:14}}>
                <img src={qrURL} alt="PromptPay QR" width={190} height={190} style={{display:"block",borderRadius:8}}/>
              </div>
            </div>
          </div>
        </div>

        <Btn onClick={()=>{setPayStep("verifying");setTimeout(()=>{setPayStep("summary");setTab("success");},2000);}}>
          โอนแล้ว · ยืนยันการชำระ ✓
        </Btn>
      </div>
    );

    /* ── Step 3: Verifying ── */
    if(payStep==="verifying") return (
      <div style={{paddingTop:80,textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:16}}>⏳</div>
        <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:8}}>กำลังตรวจสอบ...</div>
        <div style={{fontSize:12,color:C.sub}}>รอสักครู่ ระบบกำลังยืนยันการชำระเงิน</div>
      </div>
    );

    return null;
  };

  /* ── SUCCESS ── */
  const renderSuccess = () => (
    <div style={{textAlign:"center",padding:"56px 20px 40px"}}>
      <div style={{width:68,height:68,background:C.greenDim,border:`2px solid ${C.borderHi}`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><CheckCircle2 size={30} color={C.green}/></div>
      <div style={{fontSize:22,fontWeight:900,fontStyle:"italic",textTransform:"uppercase",marginBottom:6,color:C.text}}>{T("เข้าร่วมแล้ว!","You're In!")}</div>
      <div style={{fontSize:13,color:C.sub,marginBottom:3}}>{myTeamData?.name} · {venue?.name}</div>
      <div style={{fontSize:12,color:C.green,fontWeight:700,marginBottom:28}}>{slot?.time}–{slot?.end}</div>
      <div style={{background:C.greenDim,border:`1px solid ${C.borderHi}`,borderRadius:14,padding:"14px 18px",marginBottom:20,textAlign:"left"}}>
        <div style={{fontSize:9,fontWeight:800,color:C.green,letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>Reminder</div>
        <div style={{fontSize:12,color:C.sub,lineHeight:1.8}}>📍 {venue?.name}<br/>⏰ {T("เริ่ม","Starts")} {slot?.time} · {T("มาก่อน 15 นาที","arrive 15 min early")}<br/>🔑 {T("โค้ดทีม","Team Code")}: <span style={{color:myTeamData?.color,fontWeight:900,fontFamily:"monospace"}}>{myTeamData?.code}</span></div>
      </div>
      <Btn ghost onClick={()=>setTab("profile")}>{T("ดู Player Profile","View Player Profile")}</Btn>
    </div>
  );

  /* ── LEADERBOARD ── */
  const renderLeaderboard = () => {
    const board=[
      {rank:1,name:"กัปตัน",ovr:92,tier:"Diamond",matches:48,wins:36,change:0,nick:"ปรมาจารย์จ่าย 🎼"},
      {rank:2,name:"อาร์ม", ovr:85,tier:"Platinum",matches:41,wins:29,change:1,nick:"เครื่องทำประตู 🎯"},
      {rank:3,name:"บอม",   ovr:78,tier:"Platinum",matches:39,wins:22,change:-1,nick:"กำแพงเคลื่อนที่ 🏃"},
      {rank:4,name:"นิว",   ovr:80,tier:"Gold",matches:35,wins:20,change:2,nick:"สายฟ้า ⚡"},
      {rank:5,name:"โจ้",   ovr:76,tier:"Gold",matches:32,wins:16,change:0,nick:"ม้าใช้ทีม 🐎"},
    ];
    if(player) board.push({rank:board.length+1,name:player.name,ovr:player.ovr,tier:player.tier,matches:0,wins:0,change:0,nick:player.nick,isMe:true,photo:profilePhoto});
    return (
      <div style={{paddingTop:16}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:9,fontWeight:800,letterSpacing:2.5,color:C.green,textTransform:"uppercase",marginBottom:4}}>Season 1 · 2026</div>
          <div style={{fontSize:22,fontWeight:900,color:C.text}}>Leaderboard</div>
        </div>
        {board.map(p=>{
          const tc2=TIER_CFG[p.tier];
          const wr=p.matches>0?Math.round((p.wins/p.matches)*100):0;
          return (
            <div key={p.rank} style={{background:p.isMe?"rgba(16,185,129,0.05)":C.surface,border:`1px solid ${p.isMe?C.borderHi:C.border}`,borderRadius:14,padding:"12px 15px",marginBottom:8,display:"flex",alignItems:"center",gap:11}}>
              <div style={{width:24,fontSize:13,fontWeight:900,color:p.rank<=3?C.amber:C.sub,textAlign:"center"}}>#{p.rank}</div>
              <Av name={p.name} size={36} photo={p.isMe?profilePhoto:null}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:800,color:C.text}}>{p.name}{p.isMe&&<span style={{fontSize:9,color:C.green}}> · คุณ</span>}</div>
                <div style={{fontSize:10,color:C.sub,marginTop:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.nick}</div>
                <div style={{marginTop:3}}><Tag color={tc2.glow} sm>{tc2.label}</Tag></div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:17,fontWeight:900,color:C.text}}>{p.ovr}</div>
                <div style={{fontSize:9,fontWeight:700,color:C.sub}}>{wr}% WR</div>
                <div style={{fontSize:9,fontWeight:700,color:p.change>0?C.green:p.change<0?C.red:C.sub}}>{p.change>0?`↑${p.change}`:p.change<0?`↓${Math.abs(p.change)}`:"—"}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /* ═══ LAYOUT ═══ */
  const mainTabs=["home","profile","leaderboard"];

  /* ── SPLASH SCREEN V3 ── */
  if(appLoading) return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',system-ui,sans-serif",maxWidth:430,margin:"0 auto"}}>
      <style dangerouslySetInnerHTML={{__html:`
        @keyframes sq-pulse{0%,100%{opacity:0.35}50%{opacity:1}}
        @keyframes sq-progress{0%{width:5%}60%{width:80%}85%{width:93%}100%{width:97%}}
        @keyframes sq-fadein{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      `}}/>

      {/* Logo */}
      <div style={{marginBottom:20}}>
        <div style={{width:140,borderRadius:14,overflow:"hidden",background:"#091510"}}>
          <img src="https://i.postimg.cc/jSkNCWxY/squadhub003.png" alt="SQUAD HUB"
            fetchpriority="high" loading="eager"
            style={{width:140,display:"block",objectFit:"contain"}}/>
        </div>
      </div>

      {/* Wordmark */}
      <div style={{fontSize:22,fontWeight:900,letterSpacing:1,color:C.text,fontStyle:"italic",marginBottom:3}}>
        SQUAD<span style={{color:C.green}}>HUB</span>
      </div>
      <div style={{fontSize:8,color:"#2e5940",letterSpacing:3.5,textTransform:"uppercase",marginBottom:44}}>
        Football Community
      </div>

      {/* Welcome dot + text */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,animation:"sq-fadein 0.5s ease 0.3s both"}}>
        <div style={{width:5,height:5,borderRadius:"50%",background:C.green,animation:"sq-pulse 1.5s ease infinite"}}/>
        <div style={{fontSize:11,fontWeight:700,color:C.green,letterSpacing:2,textTransform:"uppercase"}}>
          Welcome Back
        </div>
      </div>

      {/* Progress bar */}
      <div style={{width:160,height:2.5,background:"#0d1e14",borderRadius:99,overflow:"hidden",marginBottom:10}}>
        <div style={{height:"100%",background:`linear-gradient(90deg,${C.green2||"#059669"},${C.green})`,borderRadius:99,animation:"sq-progress 2.5s ease forwards"}}/>
      </div>
      <div style={{fontSize:10,color:"#2e5940",letterSpacing:1.5,textTransform:"uppercase"}}>
        Loading Player Profile
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'DM Sans',system-ui,sans-serif",maxWidth:430,margin:"0 auto",position:"relative",backgroundImage:`radial-gradient(ellipse at 20% 20%,rgba(0,255,135,0.03) 0%,transparent 50%),radial-gradient(ellipse at 80% 80%,rgba(0,255,135,0.02) 0%,transparent 50%)`}}>
      {tab!=="register"&&(
        <header style={{padding:"10px 18px",background:"rgba(5,10,8,0.97)",backdropFilter:"blur(24px)",borderBottom:`1px solid rgba(16,185,129,0.14)`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:50,boxShadow:"0 2px 16px rgba(0,0,0,0.3)"}}>
          {/* Wordmark — style 2: gradient line + SQUAD + HUB box */}
          <div style={{display:"flex",alignItems:"center",gap:11,flexShrink:0}}>
            <div style={{width:1.5,height:30,background:"linear-gradient(180deg,#10d484 0%,rgba(16,212,132,0.05) 100%)",borderRadius:2,flexShrink:0}}/>
            <div style={{display:"flex",flexDirection:"column",gap:3}}>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <span style={{fontSize:17,fontWeight:900,letterSpacing:1.5,color:"#e8fff4",lineHeight:1}}>SQUAD</span>
                <div style={{padding:"2px 8px",border:"1px solid rgba(16,212,132,0.55)",borderRadius:3}}>
                  <span style={{fontSize:17,fontWeight:900,letterSpacing:1.5,color:"#10d484",lineHeight:1}}>HUB</span>
                </div>
              </div>
              <div style={{fontSize:6.5,fontWeight:600,letterSpacing:4,color:"#2e5940",textTransform:"uppercase"}}>Football Community</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {/* Lang Toggle */}
            <button onClick={()=>setLang(l=>l==="th"?"en":"th")}
              style={{padding:"4px 10px",borderRadius:6,border:`1px solid rgba(0,255,135,0.3)`,background:"rgba(0,255,135,0.07)",cursor:"pointer",fontSize:10,fontWeight:900,color:C.green,letterSpacing:1}}>
              {lang==="th"?"EN":"TH"}
            </button>
            {player&&<Tag color={C.green} sm>LV.{player.level}</Tag>}
            <button style={{position:"relative",background:"rgba(0,255,135,0.06)",border:`1px solid rgba(0,255,135,0.2)`,borderRadius:8,cursor:"pointer",padding:"6px 8px",color:C.green}}>
              <Bell size={16}/>
              <div style={{position:"absolute",top:4,right:4,width:5,height:5,background:C.green,borderRadius:"50%",border:`1.5px solid ${C.bg}`,boxShadow:`0 0 4px ${C.green}`}}/>
            </button>
          </div>
        </header>
      )}

      <main style={{padding:`0 ${tab==="profile"?"0":"16px"} 96px`}}>
        {tab==="register"    && renderRegister()}
        {tab==="home"        && renderHome()}
        {tab==="venue"       && renderVenue()}
        {tab==="room"        && renderRoom()}
        {tab==="checkout"    && renderCheckout()}
        {tab==="success"     && renderSuccess()}
        {tab==="profile"     && renderProfile()}
        {tab==="leaderboard" && renderLeaderboard()}
      </main>

      {mainTabs.includes(tab)&&(
        <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"rgba(4,12,8,0.97)",backdropFilter:"blur(24px)",borderTop:`1px solid rgba(0,255,135,0.2)`,padding:"10px 32px 22px",display:"flex",justifyContent:"space-around",alignItems:"center",zIndex:50,boxShadow:"0 -4px 20px rgba(0,255,135,0.08)"}}>
          <button onClick={()=>setTab("profile")} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer"}}>
            <User size={20} color={tab==="profile"?C.green:C.sub} style={tab==="profile"?{filter:`drop-shadow(0 0 4px ${C.green})`}:{}}/>
            <span style={{fontSize:8,fontWeight:800,letterSpacing:1.5,textTransform:"uppercase",color:tab==="profile"?C.green:C.sub}}>{tab==="profile"&&<span style={{marginRight:2}}>▶</span>}Profile</span>
          </button>
          <button onClick={()=>setTab("home")} style={{width:50,height:50,borderRadius:10,background:`linear-gradient(135deg,#00c96b,${C.green})`,border:`1px solid ${C.green}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 20px rgba(0,255,135,0.4), 0 4px 15px rgba(0,255,135,0.3)`,marginBottom:6}}>
            <Search size={20} color="#001a0d"/>
          </button>
          <button onClick={()=>setTab("leaderboard")} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer"}}>
            <Trophy size={20} color={tab==="leaderboard"?C.green:C.sub} style={tab==="leaderboard"?{filter:`drop-shadow(0 0 4px ${C.green})`}:{}}/>
            <span style={{fontSize:8,fontWeight:800,letterSpacing:1.5,textTransform:"uppercase",color:tab==="leaderboard"?C.green:C.sub}}>{tab==="leaderboard"&&<span style={{marginRight:2}}>▶</span>}Rank</span>
          </button>
        </nav>
      )}

      {showJoin&&<JoinModal teams={teams} onJoin={doJoin} onClose={()=>setShowJoin(false)}/>}

      {/* 🎖️ Captain Toast Notification */}
      {captainToast&&(
        <div style={{position:"fixed",bottom:100,left:"50%",transform:"translateX(-50%)",zIndex:200,width:"calc(100% - 32px)",maxWidth:398,animation:"slideUp .3s ease"}}>
          <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
          {captainToast.isMe ? (
            <div style={{background:`linear-gradient(135deg,rgba(251,191,36,0.15),rgba(251,191,36,0.08))`,border:`1px solid rgba(251,191,36,0.4)`,borderRadius:18,padding:"14px 18px",backdropFilter:"blur(20px)"}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                <div style={{fontSize:28,lineHeight:1}}>🎖️</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:900,color:C.amber,marginBottom:3}}>คุณเป็นกัปตันทีม {captainToast.teamId}!</div>
                  <div style={{fontSize:11,color:C.sub,lineHeight:1.6}}>หลังแมตช์จบ LINE Bot จะส่งฟอร์มสรุปให้คุณ บอกแค่ตัวเลขแล้วระบบจัดการเอง</div>
                  <div style={{marginTop:10,background:"rgba(0,0,0,0.3)",borderRadius:11,padding:"10px 12px",border:`1px solid rgba(255,255,255,0.07)`}}>
                    <div style={{fontSize:9,fontWeight:800,color:C.green,letterSpacing:1.2,textTransform:"uppercase",marginBottom:6}}>ตัวอย่างหลังแมตช์จบ</div>
                    <div style={{fontSize:11,color:C.sub,lineHeight:1.9}}>
                      <span style={{color:C.green,fontWeight:800}}>LINE Bot:</span> ⚽ แมตช์จบแล้ว! สรุปให้หน่อยนะกัปตัน<br/>
                      <span style={{fontSize:10,color:C.muted}}>รูปแบบ: A:ยิง2ส่ง1, B:ยิง1ส่ง2, MVP:A</span><br/>
                      <span style={{color:C.amber,fontWeight:800}}>คุณ:</span> A:2,1 B:1,2 MVP:A<br/>
                      <span style={{color:C.green,fontWeight:800}}>AI:</span> ✅ บันทึกแล้ว! 🏅 +30 XP Captain Bonus!
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{background:`linear-gradient(135deg,rgba(16,185,129,0.12),rgba(16,185,129,0.06))`,border:`1px solid ${C.borderHi}`,borderRadius:18,padding:"13px 18px",backdropFilter:"blur(20px)"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:24}}>🎖️</span>
                <div>
                  <div style={{fontSize:13,fontWeight:900,color:C.green}}><span style={{color:C.greenBr}}>{captainToast.name}</span> เป็นกัปตันทีม {captainToast.teamId}!</div>
                  <div style={{fontSize:11,color:C.sub,marginTop:2}}>กัปตันจะสรุปผลแมตช์ให้ทีมหลังเกมจบ</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
