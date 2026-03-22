import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "./supabase";
import {
  User, MapPin, Trophy, ShieldCheck, ChevronRight, Zap,
  ArrowLeft, Flame, Clock, CheckCircle2, Medal, Bell,
  Search, Hexagon, Wind, Target, Shield, Activity,
  Send, MessageCircle, Users, Copy, Hash, Camera,
  Upload, Edit3, Star
} from "lucide-react";

/* ═══════════════ DESIGN TOKENS ═══════════════ */
const C = {
  bg:"#070e0b", bg2:"#0d1812", surface:"rgba(255,255,255,0.05)",
  border:"rgba(255,255,255,0.09)", borderHi:"rgba(16,185,129,0.32)",
  green:"#10b981", greenBr:"#34d399", greenDim:"rgba(16,185,129,0.1)",
  text:"#edfdf4", sub:"#9ca3af", muted:"#6b7280",
  red:"#ef4444", blue:"#60a5fa", amber:"#fbbf24", purple:"#a78bfa",
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
  <span style={{fontSize:sm?8:9,fontWeight:800,letterSpacing:.6,padding:sm?"2px 7px":"3px 10px",borderRadius:99,background:`${color}1a`,color,textTransform:"uppercase",display:"inline-flex",alignItems:"center",gap:3,border:`1px solid ${color}25`}}>{children}</span>
);
const Btn = ({children,onClick,ghost,disabled,style={}}) => (
  <button onClick={onClick} disabled={disabled} style={{width:"100%",padding:"14px 20px",borderRadius:13,fontSize:13,fontWeight:800,border:ghost?`1.5px solid ${C.border}`:"none",cursor:disabled?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:ghost?"transparent":`linear-gradient(135deg,#059669,${C.green})`,color:ghost?C.sub:"#fff",boxShadow:ghost?"none":"0 6px 24px rgba(16,185,129,0.25)",opacity:disabled?.4:1,transition:"all .2s",...style}}>{children}</button>
);
const BackBtn = ({onClick}) => (
  <button onClick={onClick} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,fontWeight:700,color:C.sub,background:"none",border:"none",cursor:"pointer",padding:"0 0 16px",letterSpacing:.2}}><ArrowLeft size={14}/>Back</button>
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
  const [s0,s1,s2] = tc.stops;
  const gradId = `tier-grad-${tier}`;
  const glowId = `tier-glow-${tier}`;
  const W = size, H = Math.round(size*1.32);
  const r = 10; // corner radius
  const cut = 18; // bottom corner cut size
  /* Custom shape: rect with cut bottom-left and bottom-right corners */
  const clipPath = `polygon(${r}px 0%, ${W-r}px 0%, ${W}px ${r}px, ${W}px ${H-cut}px, ${W-cut}px ${H}px, ${cut}px ${H}px, 0% ${H-cut}px, 0% ${r}px)`;

  return (
    <div style={{position:"relative",width:W,height:H,flexShrink:0}}>
      {/* Glow */}
      <div style={{position:"absolute",inset:-8,background:`radial-gradient(ellipse,${tc.glow}28 0%,transparent 70%)`,borderRadius:16,zIndex:0}}/>

      {/* Tier border frame using SVG */}
      <svg width={W} height={H} style={{position:"absolute",inset:0,zIndex:2}} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={s0}/>
            <stop offset="50%" stopColor={s1}/>
            <stop offset="100%" stopColor={s2}/>
          </linearGradient>
          <filter id={glowId}>
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {/* Outer frame path */}
        <path
          d={`M${r} 2 L${W-r} 2 Q${W-2} 2 ${W-2} ${r} L${W-2} ${H-cut} L${W-cut} ${H-2} L${cut} ${H-2} L2 ${H-cut} L2 ${r} Q2 2 ${r} 2Z`}
          fill="none" stroke={`url(#${gradId})`} strokeWidth="2.5" filter={`url(#${glowId})`}
        />
        {/* Corner accent dots */}
        <circle cx={W/2} cy="2" r="3" fill={s1} opacity=".8"/>
        {/* Logo badge center-top */}
        <rect x={W/2-18} y={-1} width="36" height="14" rx="7" fill={C.bg2}/>
        <text x={W/2} y="10" textAnchor="middle" fontSize="6" fontWeight="900" fill={s1} fontFamily="system-ui" letterSpacing="1">SQUAD HUB</text>
        {/* Tier label bottom */}
        <rect x={W/2-20} y={H-14} width="40" height="12" rx="6" fill={C.bg2}/>
        <text x={W/2} y={H-5} textAnchor="middle" fontSize="6.5" fontWeight="900" fill={s1} fontFamily="system-ui" letterSpacing=".8">{tc.label.toUpperCase()}</text>
      </svg>

      {/* Photo area */}
      <div style={{position:"absolute",inset:4,clipPath,overflow:"hidden",background:`linear-gradient(160deg,rgba(16,185,129,0.12),rgba(7,14,11,0.8))`,zIndex:1}}>
        {photo
          ? <img src={photo} alt={name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          : (
            <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,background:`linear-gradient(160deg,${PC[position]||C.green}18,rgba(7,14,11,0.6))`}}>
              <div style={{fontSize:44,fontWeight:900,color:PC[position]||C.green,opacity:.7}}>{name[0]?.toUpperCase()}</div>
              <div style={{fontSize:9,color:C.sub,letterSpacing:1}}>tap to upload</div>
            </div>
          )
        }
        {/* Position badge overlay */}
        <div style={{position:"absolute",top:8,left:8,background:"rgba(0,0,0,0.65)",backdropFilter:"blur(4px)",borderRadius:6,padding:"3px 7px",border:`1px solid ${PC[position]||C.green}50`}}>
          <span style={{fontSize:8,fontWeight:900,color:PC[position]||C.green,letterSpacing:1}}>{position}</span>
        </div>
      </div>

      {/* Upload button */}
      <button
        onClick={onUpload}
        style={{position:"absolute",bottom:16,right:-8,width:30,height:30,borderRadius:"50%",background:`linear-gradient(135deg,#059669,${C.green})`,border:`2px solid ${C.bg}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3,boxShadow:"0 2px 8px rgba(16,185,129,0.4)"}}
      >
        <Camera size={12} color="#fff"/>
      </button>
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
const FullPitch = ({teams,onJoin,myTeam}) => {
  const corners = [{id:"A",cx:80,cy:108},{id:"B",cx:240,cy:108},{id:"C",cx:80,cy:326},{id:"D",cx:240,cy:326}];
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
          const filled=team.players.length, isFull=filled>=team.max, isMyT=myTeam===team.id;
          const canJoin=!myTeam&&!isFull;
          return (
            <g key={team.id} style={{cursor:canJoin?"pointer":"default"}} onClick={()=>canJoin&&onJoin&&onJoin(team.id)}>
              <circle cx={corner.cx} cy={corner.cy} r="60" fill={isMyT?`${team.color}18`:`${team.color}07`} stroke={isMyT?team.color:isFull?"rgba(255,255,255,0.05)":`${team.color}35`} strokeWidth={isMyT?2:1}/>
              <text x={corner.cx} y={corner.cy-30} textAnchor="middle" fontSize="12" fontWeight="800" fill={isMyT?team.color:isFull?"#4b5563":"rgba(255,255,255,0.85)"} fontFamily="sans-serif">{team.name}</text>
              <text x={corner.cx} y={corner.cy-10} textAnchor="middle" fontSize="20" fontWeight="900" fill={isMyT?team.color:isFull?C.muted:"white"} fontFamily="sans-serif">{filled}/{team.max}</text>
              <rect x={corner.cx-22} y={corner.cy+2} width="44" height="16" rx="8" fill={isMyT?`${team.color}30`:isFull?"rgba(255,255,255,0.05)":`${team.color}20`}/>
              <text x={corner.cx} y={corner.cy+13} textAnchor="middle" fontSize="8" fontWeight="800" fill={isMyT?team.color:isFull?C.sub:team.color} fontFamily="sans-serif">{isMyT?"✓ คุณ":isFull?"FULL":"+ JOIN"}</text>
              {team.players.slice(0,6).map((p,pi)=>{
                const ang=(pi/6)*Math.PI*2-Math.PI/2;
                return (
                  <g key={pi}>
                    <circle cx={corner.cx+Math.cos(ang)*38} cy={corner.cy+24+Math.sin(ang)*20} r="9" fill={PC[p.pos]||team.color} stroke={C.bg} strokeWidth="1.5"/>
                    <text x={corner.cx+Math.cos(ang)*38} y={corner.cy+24+Math.sin(ang)*20+3.5} textAnchor="middle" fontSize="7" fontWeight="900" fill="white" fontFamily="sans-serif">{p.name[0]}</text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* ═══════════════ LOBBY PLAYER CARD ═══════════════ */
const LobbyCard = ({player,teamColor,isMe}) => {
  const ks=KEY_STATS[player.pos]||["pace","shooting","passing"];
  const st=player.stats||{pace:70,shooting:70,passing:70,dribbling:70,defending:70,physical:70};
  return (
    <div style={{background:isMe?`linear-gradient(135deg,${C.bg2},rgba(16,185,129,0.08))`:C.bg2,border:`1.5px solid ${isMe?C.borderHi:C.border}`,borderRadius:16,padding:"13px 14px",position:"relative",overflow:"hidden"}}>
      {isMe&&<div style={{position:"absolute",top:0,right:0,width:60,height:60,background:"radial-gradient(circle,rgba(16,185,129,0.13) 0%,transparent 70%)"}}/>}
      <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}>
        <Av name={player.name} size={40} isCaptain={player.isCaptain} photo={player.photo}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:14,fontWeight:900,color:isMe?C.greenBr:C.text,display:"flex",alignItems:"center",gap:5}}>
            {player.name}{isMe&&<span style={{fontSize:10,color:C.green}}> · คุณ</span>}
            {player.isCaptain&&<span style={{fontSize:10,fontWeight:900,color:C.amber,background:"rgba(251,191,36,0.12)",border:"1px solid rgba(251,191,36,0.25)",borderRadius:99,padding:"1px 7px",letterSpacing:.3}}>🎖️ กัปตัน</span>}
          </div>
          {player.nick&&<div style={{fontSize:10,color:C.sub,marginTop:1}}>{player.nick}</div>}
          <div style={{display:"flex",gap:5,marginTop:5,flexWrap:"wrap"}}>
            <Tag color={PC[player.pos]||teamColor} sm>{player.pos}</Tag>
            <Tag color={C.muted} sm>OVR {player.ovr}</Tag>
          </div>
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"space-around",background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"8px 6px",marginBottom:8}}>
        {ks.map(k=><MiniStat key={k} label={k} value={st[k]||70}/>)}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        {player.form&&<FormDots form={player.form}/>}
        <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"flex-end"}}>
          {player.tags?.slice(0,2).map(t=><span key={t} style={{fontSize:8,color:teamColor,fontWeight:700,opacity:.8}}>{t}</span>)}
        </div>
      </div>
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

/* ═══════════════ MAIN APP ═══════════════ */
export default function SquadHub() {
  const [tab,setTab]         = useState("register");
  const [regStep,setRegStep] = useState(1);
  const [regData,setRegData] = useState({nickname:"",position:"",playstyle:""});
  const [player,setPlayer]   = useState(null);
  const [profilePhoto,setProfilePhoto] = useState(null);
  const [venue,setVenue]     = useState(null);
  const [slot,setSlot]       = useState(null);
  const [teams,setTeams]     = useState(SEED_TEAMS());
  const [myTeam,setMyTeam]   = useState(null);
  const [activeTeam,setActiveTeam] = useState(0);
  const [showJoin,setShowJoin] = useState(false);
  const [lobbyTab,setLobbyTab] = useState("pitch");
  const [chatMsgs,setChatMsgs] = useState(SEED_CHAT);
  const [chatId,setChatId]   = useState(6);
  const [captainToast,setCaptainToast] = useState(null);
  const [venues,setVenues]   = useState(VENUES); // เริ่มจาก mock ก่อน แล้ว override ด้วย DB
  const [venuesLoading,setVenuesLoading] = useState(false);
  const fileRef = useRef(null);

  /* ── AUTO-LOGIN: ถ้าเคย register ไว้แล้ว ดึงข้อมูลกลับมา ── */
  useEffect(()=>{
    const savedId = localStorage.getItem("squad_player_id");
    if(!savedId || player) return;
    (async()=>{
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("id", savedId)
        .single();
      if(error || !data) return;
      const stats = SM[data.position]?.[data.playstyle] || {pace:70,shooting:70,passing:70,dribbling:70,defending:70,physical:70};
      const ni = NICKS[data.position]?.[data.playstyle];
      setPlayer({
        name:      data.display_name,
        id:        `SQ-${data.id}`,
        dbId:      data.id,
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
      setTab("home");
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

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if(!file)return;
    const reader = new FileReader();
    reader.onload = ev => setProfilePhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  const finishRegister = async () => {
    const stats = SM[regData.position]?.[regData.playstyle]||{pace:70,shooting:70,passing:70,dribbling:70,defending:70,physical:70};
    const ni = NICKS[regData.position]?.[regData.playstyle];

    /* บันทึกลง Supabase — ครบทุก field */
    let dbId = null;
    try {
      const lineUserId = `guest_${Date.now()}`; // TODO: เปลี่ยนเป็น LINE UID จริงตอนเชื่อม LIFF
      const { data, error } = await supabase.from("players").insert({
        line_user_id:      lineUserId,
        display_name:      regData.nickname,
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

      /* บันทึก id ลง localStorage เพื่อ login ครั้งถัดไป */
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
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:32}}>
        <div style={{position:"relative",width:38,height:38,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Hexagon size={38} color={C.green} fill="rgba(16,185,129,0.08)" strokeWidth={1.5} style={{position:"absolute"}}/>
          <Zap size={15} color={C.green} fill={C.green} style={{position:"relative",zIndex:1}}/>
        </div>
        <div>
          <div style={{fontSize:20,fontWeight:900,letterSpacing:-.5,fontStyle:"italic",color:C.text}}>SQUAD<span style={{color:C.green}}>HUB</span></div>
          <div style={{fontSize:9,color:C.sub,letterSpacing:2,textTransform:"uppercase"}}>Football Community</div>
        </div>
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
            {regData.playstyle&&(()=>{
              const s=SM[regData.position]?.[regData.playstyle];
              return <div style={{background:C.greenDim,border:"1px solid rgba(16,185,129,0.22)",borderRadius:13,padding:"12px 14px",margin:"10px 0"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <span style={{fontSize:9,fontWeight:800,color:C.green,letterSpacing:1.5,textTransform:"uppercase"}}>Predicted Stats</span>
                  <span style={{fontSize:24,fontWeight:900,color:C.text}}>{OVR(s)} <span style={{fontSize:9,color:C.sub}}>OVR</span></span>
                </div>
                <div style={{display:"flex",justifyContent:"space-around"}}>
                  {(KEY_STATS[regData.position]||[]).map(k=><MiniStat key={k} label={k} value={s[k]}/>)}
                </div>
              </div>;
            })()}
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
        {/* Hidden file input */}
        <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handlePhotoUpload}/>

        {/* Hero banner */}
        <div style={{background:"linear-gradient(160deg,#091d12 0%,#0d1a2a 100%)",borderRadius:"0 0 28px 28px",paddingBottom:24,marginBottom:14,position:"relative",overflow:"hidden",borderBottom:`1px solid rgba(16,185,129,0.1)`}}>
          {/* Ambient glow */}
          <div style={{position:"absolute",top:-40,right:-30,width:220,height:220,background:`radial-gradient(circle,${PC[player.position]}12 0%,transparent 70%)`}}/>
          <div style={{position:"absolute",bottom:-30,left:-20,width:160,height:160,background:"radial-gradient(circle,rgba(16,185,129,0.07) 0%,transparent 70%)"}}/>

          {/* Top: name + OVR */}
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

          {/* Card + Info row */}
          <div style={{display:"flex",alignItems:"flex-end",gap:14,padding:"16px 20px 0",position:"relative",zIndex:2}}>
            <TierPhotoCard
              photo={profilePhoto}
              name={player.name}
              tier={player.tier}
              position={player.position}
              onUpload={()=>fileRef.current?.click()}
              size={110}
            />
            <div style={{flex:1,paddingBottom:6}}>
              {/* Nickname */}
              <div style={{fontSize:13,fontWeight:900,color:C.text,marginBottom:5,lineHeight:1.3}}>{player.nick}</div>
              {/* Tags */}
              <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:10}}>
                {player.tags?.map(t=><span key={t} style={{fontSize:9,color:C.green,fontWeight:700,opacity:.85}}>{t}</span>)}
              </div>
              {/* Badges */}
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
                <Tag color={tc.glow} sm><Medal size={8}/>{player.tier}</Tag>
                <Tag color={PC[player.position]||C.green} sm>{player.position}</Tag>
                <Tag color={C.sub} sm>LV.{player.level}</Tag>
              </div>
              {/* Key ability stats */}
              <div style={{display:"flex",gap:12}}>
                {ks.map(k=><MiniStat key={k} label={k} value={player.stats[k]}/>)}
              </div>
            </div>
          </div>

          {/* Tap to upload hint */}
          <div style={{padding:"8px 20px 0",position:"relative",zIndex:2}}>
            <button onClick={()=>fileRef.current?.click()} style={{display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,0.04)",border:`1px dashed ${C.border}`,borderRadius:8,padding:"6px 10px",cursor:"pointer",color:C.sub,fontSize:10,fontWeight:700}}>
              <Upload size={11} color={C.sub}/> เปลี่ยนรูปโปรไฟล์ (LINE หรืออัปโหลดใหม่)
            </button>
          </div>

          {/* XP bar */}
          <div style={{padding:"10px 20px 0",position:"relative",zIndex:2}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:9,fontWeight:700,color:C.sub,letterSpacing:1,textTransform:"uppercase"}}>XP Progress</span>
              <span style={{fontSize:9,fontWeight:800,color:C.green}}>{player.xp}%</span>
            </div>
            <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:99}}>
              <div style={{height:"100%",width:`${player.xp}%`,background:`linear-gradient(90deg,#059669,${C.greenBr})`,borderRadius:99}}/>
            </div>
          </div>
        </div>

        {/* Info panels */}
        <div style={{padding:"0 16px"}}>

          {/* Match stats */}
          <div style={{fontSize:10,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:C.sub,marginBottom:10}}>Match Stats</div>
          <div style={{marginBottom:12}}>
            <StatGrid goals={ms.goals||0} assists={ms.assists||0} matches={ms.matches||0} wins={ms.wins||0}/>
          </div>

          {/* W/L bar */}
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

          {/* Reliability */}
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

          {/* Nickname */}
          <div style={{background:C.greenDim,border:`1px solid ${C.borderHi}`,borderRadius:14,padding:"12px 16px",marginBottom:10}}>
            <div style={{fontSize:9,fontWeight:800,color:C.green,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>ฉายา</div>
            <div style={{fontSize:15,fontWeight:900,color:C.text,marginBottom:6}}>{player.nick||"—"}</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {player.tags?.map(t=><span key={t} style={{fontSize:10,color:C.green,fontWeight:700}}>{t}</span>)}
            </div>
          </div>

          {/* Form */}
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"12px 16px"}}>
            <div style={{fontSize:9,fontWeight:800,color:C.sub,letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>ฟอร์มล่าสุด</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <FormDots form={player.form?.length?player.form:[0,0,0,0,0]}/>
              <span style={{fontSize:10,color:C.sub}}>ยังไม่มีแมทช์</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ── HOME ── */
  const renderHome = () => (
    <div style={{paddingTop:16}}>
      <div style={{display:"flex",alignItems:"center",gap:10,background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"11px 16px",marginBottom:20}}>
        <Search size={15} color={C.sub}/>
        <span style={{fontSize:13,color:C.sub}}>ค้นหาสนาม, แมทช์...</span>
      </div>
      <div onClick={()=>{setVenue(venues[0]);setSlot(venues[0]?.slots[1]||venues[0]?.slots[0]);setTeams(SEED_TEAMS());setMyTeam(null);setLobbyTab("pitch");setTab("room");}}
        style={{background:"linear-gradient(135deg,#0b1f14,#0d1824)",border:"1px solid rgba(239,68,68,0.22)",borderRadius:18,padding:"16px 18px",marginBottom:20,cursor:"pointer",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-20,right:-20,width:100,height:100,background:"radial-gradient(circle,rgba(239,68,68,0.07) 0%,transparent 70%)"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <Tag color={C.red}><Flame size={9}/> HOT MATCH</Tag>
          <span style={{fontSize:10,color:C.sub}}>เหลือ 4 slot</span>
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
      <div style={{fontSize:10,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:C.sub,marginBottom:12}}>สนามใกล้คุณ</div>
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
        <div style={{marginBottom:14}}>
          <div style={{fontSize:9,color:C.green,fontWeight:800,letterSpacing:2,textTransform:"uppercase",marginBottom:3}}>Match Lobby</div>
          <div style={{fontSize:18,fontWeight:900,color:C.text}}>{venue?.name}</div>
          <div style={{fontSize:11,color:C.sub,marginTop:1}}>{slot?.time}–{slot?.end} · {slot?.type} · 4 ทีม</div>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {[{id:"pitch",label:"🏟️ สนาม"},{id:"team",label:"👥 ทีม"},{id:"chat",label:"💬 Chat"}].map(lt=>(
            <button key={lt.id} onClick={()=>setLobbyTab(lt.id)}
              style={{flex:1,padding:"9px 6px",borderRadius:10,border:`1.5px solid ${lobbyTab===lt.id?C.green:C.border}`,background:lobbyTab===lt.id?C.greenDim:"transparent",color:lobbyTab===lt.id?C.green:C.sub,fontSize:11,fontWeight:800,cursor:"pointer",transition:"all .2s"}}>
              {lt.label}
            </button>
          ))}
        </div>

        {lobbyTab==="pitch"&&(
          <div>
            <FullPitch teams={teams} onJoin={()=>setShowJoin(true)} myTeam={myTeam}/>
            <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap",justifyContent:"center"}}>
              {teams.map(t=><div key={t.id} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:2,background:t.color}}/><span style={{fontSize:9,fontWeight:700,color:myTeam===t.id?t.color:C.sub}}>{t.name} {t.players.length}/{t.max}</span></div>)}
            </div>
            {!myTeam&&<div style={{marginTop:14}}><Btn onClick={()=>setShowJoin(true)}>เลือกทีม / ใส่โค้ด <ChevronRight size={15}/></Btn></div>}
            {myTeam&&(
              <div style={{marginTop:14,display:"flex",gap:8}}>
                <div style={{flex:1,background:C.greenDim,border:`1px solid ${C.borderHi}`,borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:8}}>
                  <CheckCircle2 size={16} color={C.green}/>
                  <div><div style={{fontSize:12,fontWeight:800,color:C.green}}>{myTeamData?.name}</div><div style={{fontSize:10,color:C.sub}}>โค้ด: <span style={{color:myTeamData?.color,fontWeight:900,fontFamily:"monospace"}}>{myTeamData?.code}</span></div></div>
                </div>
                <button onClick={()=>navigator.clipboard?.writeText(myTeamData?.code)} style={{padding:"10px 14px",borderRadius:12,background:"rgba(255,255,255,0.05)",border:`1px solid ${C.border}`,cursor:"pointer",display:"flex",alignItems:"center",gap:5,color:C.sub,fontSize:11,fontWeight:700}}>
                  <Copy size={13}/>Copy
                </button>
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

            {/* 🎖️ Captain claim button — only show if: in this team, no captain yet, I'm not captain */}
            {myTeam===curTeam?.id&&(()=>{
              const hasCaptain = curTeam?.players.some(p=>p.isCaptain);
              const iAmCaptain = curTeam?.players.find(p=>p.isMe)?.isCaptain;
              if(iAmCaptain) return (
                <div style={{marginTop:8,background:C.greenDim,border:`1px solid ${C.borderHi}`,borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:16}}>🎖️</span>
                  <div>
                    <div style={{fontSize:12,fontWeight:900,color:C.green}}>คุณเป็นกัปตันทีม!</div>
                    <div style={{fontSize:10,color:C.sub}}>หลังแมตช์จบ บอทจะส่งฟอร์มสรุปให้ทาง LINE · +30 XP รอคุณ</div>
                  </div>
                </div>
              );
              if(!hasCaptain) return (
                <button onClick={claimCaptain}
                  style={{marginTop:8,width:"100%",padding:"11px 16px",borderRadius:13,border:`1.5px dashed ${C.amber}55`,background:`rgba(251,191,36,0.06)`,cursor:"pointer",display:"flex",alignItems:"center",gap:10,transition:"all .2s"}}>
                  <span style={{fontSize:16}}>🎖️</span>
                  <div style={{textAlign:"left",flex:1}}>
                    <div style={{fontSize:13,fontWeight:800,color:C.amber}}>ขอเป็นกัปตันทีม</div>
                    <div style={{fontSize:10,color:C.sub}}>กัปตันสรุปผลแมตช์ให้ทีม · ได้ +30 XP bonus</div>
                  </div>
                  <ChevronRight size={14} color={C.amber}/>
                </button>
              );
              return (
                <div style={{marginTop:8,background:"rgba(255,255,255,0.03)",border:`1px solid ${C.border}`,borderRadius:12,padding:"9px 14px",display:"flex",alignItems:"center",gap:7}}>
                  <span style={{fontSize:13}}>🎖️</span>
                  <div style={{fontSize:11,color:C.sub}}>
                    กัปตัน: <span style={{color:C.amber,fontWeight:800}}>{curTeam?.players.find(p=>p.isCaptain)?.name}</span>
                    {curTeam?.players.find(p=>p.isCaptain)?.isMe&&<span style={{color:C.green}}> · คุณ</span>}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {lobbyTab==="chat"&&<ChatPanel messages={chatMsgs} myName={player?.name||"Guest"} onSend={sendChat} teams={teams}/>}
      </div>
    );
  };

  /* ── CHECKOUT ── */
  const renderCheckout = () => (
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
          <span style={{fontSize:30,fontWeight:900,color:C.green,fontStyle:"italic"}}>฿{(slot?.price||0)+(slot?.fee||0)}</span>
        </div>
      </div>
      <div style={{background:"rgba(251,191,36,0.07)",border:"1px solid rgba(251,191,36,0.18)",borderRadius:12,padding:"10px 14px",marginBottom:14}}>
        <span style={{fontSize:11,color:C.amber,lineHeight:1.6}}>⚠️ การยกเลิกหลัง 30 นาทีก่อนแมทช์จะส่งผลต่อ Reliability Score</span>
      </div>
      <Btn onClick={()=>setTab("success")}>Pay & Join ⚡</Btn>
    </div>
  );

  /* ── SUCCESS ── */
  const renderSuccess = () => (
    <div style={{textAlign:"center",padding:"56px 20px 40px"}}>
      <div style={{width:68,height:68,background:C.greenDim,border:`2px solid ${C.borderHi}`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}><CheckCircle2 size={30} color={C.green}/></div>
      <div style={{fontSize:22,fontWeight:900,fontStyle:"italic",textTransform:"uppercase",marginBottom:6,color:C.text}}>You're In!</div>
      <div style={{fontSize:13,color:C.sub,marginBottom:3}}>{myTeamData?.name} · {venue?.name}</div>
      <div style={{fontSize:12,color:C.green,fontWeight:700,marginBottom:28}}>{slot?.time}–{slot?.end}</div>
      <div style={{background:C.greenDim,border:`1px solid ${C.borderHi}`,borderRadius:14,padding:"14px 18px",marginBottom:20,textAlign:"left"}}>
        <div style={{fontSize:9,fontWeight:800,color:C.green,letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>Reminder</div>
        <div style={{fontSize:12,color:C.sub,lineHeight:1.8}}>📍 {venue?.name}<br/>⏰ เริ่ม {slot?.time} · มาก่อน 15 นาที<br/>🔑 โค้ดทีม: <span style={{color:myTeamData?.color,fontWeight:900,fontFamily:"monospace"}}>{myTeamData?.code}</span></div>
      </div>
      <Btn ghost onClick={()=>setTab("profile")}>ดู Player Profile</Btn>
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
    if(player) board.push({rank:board.length+1,name:player.name,ovr:player.ovr,tier:player.tier,matches:0,wins:0,change:0,nick:player.nick,isMe:true});
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
              <Av name={p.name} size={36}/>
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
  return (
    <div style={{minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'DM Sans',system-ui,sans-serif",maxWidth:430,margin:"0 auto",position:"relative"}}>
      {tab!=="register"&&(
        <header style={{padding:"12px 18px",background:"rgba(7,14,11,0.96)",backdropFilter:"blur(24px)",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:50}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{position:"relative",width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Hexagon size={26} color={C.green} fill="rgba(16,185,129,0.08)" strokeWidth={1.5} style={{position:"absolute"}}/>
              <Zap size={11} color={C.green} fill={C.green} style={{position:"relative",zIndex:1}}/>
            </div>
            <span style={{fontSize:16,fontWeight:900,letterSpacing:-.3,fontStyle:"italic",color:C.text}}>SQUAD<span style={{color:C.green}}>HUB</span></span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            {player&&<Tag color={C.green} sm>LV.{player.level}</Tag>}
            <button style={{position:"relative",background:"none",border:"none",cursor:"pointer",padding:5,color:C.sub}}>
              <Bell size={17}/>
              <div style={{position:"absolute",top:4,right:4,width:5,height:5,background:C.green,borderRadius:"50%",border:`1.5px solid ${C.bg}`}}/>
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
        <nav style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"rgba(7,14,11,0.97)",backdropFilter:"blur(24px)",borderTop:`1px solid ${C.border}`,padding:"10px 32px 22px",display:"flex",justifyContent:"space-around",alignItems:"center",zIndex:50}}>
          <button onClick={()=>setTab("profile")} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer"}}>
            <User size={20} color={tab==="profile"?C.green:C.sub}/>
            <span style={{fontSize:8,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:tab==="profile"?C.green:C.sub}}>Profile</span>
          </button>
          <button onClick={()=>setTab("home")} style={{width:46,height:46,borderRadius:"50%",background:`linear-gradient(135deg,#059669,${C.green})`,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 6px 20px rgba(16,185,129,0.28)",marginBottom:6}}>
            <Search size={19} color="#fff"/>
          </button>
          <button onClick={()=>setTab("leaderboard")} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer"}}>
            <Trophy size={20} color={tab==="leaderboard"?C.green:C.sub}/>
            <span style={{fontSize:8,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:tab==="leaderboard"?C.green:C.sub}}>Rank</span>
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
