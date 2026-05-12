import { useState, useEffect, useRef } from "react";

const SUBJECTS = [
  { id: "math",    label: "Mathematics",  icon: "📐", color: "#F59E0B" },
  { id: "science", label: "Science",      icon: "🔬", color: "#10B981" },
  { id: "english", label: "English",      icon: "📖", color: "#3B82F6" },
  { id: "arabic",  label: "Arabic عربي",  icon: "✍️", color: "#EC4899" },
];

const GRADES = ["Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9"];

const MOUTHS = {
  idle:     "M 35 55 Q 50 60 65 55",
  talking:  "M 35 52 Q 50 65 65 52",
  thinking: "M 38 57 Q 50 55 62 57",
  happy:    "M 33 52 Q 50 68 67 52",
};

function Avatar({ state, color }) {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(id);
  }, []);

  const eyeH = blink ? 1 : state === "thinking" ? 4 : 5;
  const eyeY = blink ? 37 : state === "happy" ? 38 : 35;
  const mouth = MOUTHS[state] || MOUTHS.idle;

  return (
    <div style={{ position:"relative", width:150, height:150, margin:"0 auto" }}>
      <div style={{
        position:"absolute", inset:-8, borderRadius:"50%",
        background:`radial-gradient(circle, ${color}30 0%, transparent 70%)`,
        animation:"pulse 2s infinite alternate",
      }}/>
      <svg viewBox="0 0 100 100" width="150" height="150">
        <circle cx="50" cy="50" r="42" fill="#1E293B" stroke={color} strokeWidth="2.5"/>
        <rect x="22" y="22" width="56" height="6" rx="2" fill={color} opacity=".9"/>
        <rect x="38" y="14" width="24" height="10" rx="2" fill={color} opacity=".9"/>
        <line x1="70" y1="25" x2="74" y2="35" stroke={color} strokeWidth="2"/>
        <circle cx="74" cy="37" r="3" fill={color}/>
        <ellipse cx="35" cy={eyeY} rx="6" ry={eyeH} fill="white"/>
        <ellipse cx="65" cy={eyeY} rx="6" ry={eyeH} fill="white"/>
        <circle cx="36" cy={eyeY} r="3" fill="#1E293B"/>
        <circle cx="66" cy={eyeY} r="3" fill="#1E293B"/>
        <circle cx="37" cy={eyeY-1} r="1" fill="white"/>
        <circle cx="67" cy={eyeY-1} r="1" fill="white"/>
        <path d="M 28 29 Q 35 26 42 29" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M 58 29 Q 65 26 72 29" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d={mouth} stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M 42 88 L 50 95 L 58 88 L 54 78 L 50 82 L 46 78 Z" fill={color} opacity=".8"/>
      </svg>
      {state === "talking" && (
        <div style={{ position:"absolute", right:-18, top:"40%", display:"flex", flexDirection:"column", gap:3 }}>
          {[12,20,14].map((h,i) => (
            <div key={i} style={{
              width:3, height:h, borderRadius:2, background:color, opacity:.7,
              animation:`soundWave 0.4s ${i*.1}s infinite alternate`,
            }}/>
          ))}
        </div>
      )}
    </div>
  );
}

const CSS = `
  @keyframes pulse     { from{opacity:.4;transform:scale(.97)} to{opacity:1;transform:scale(1.03)} }
  @keyframes bounce    { from{transform:translateY(0)} to{transform:translateY(-6px)} }
  @keyframes soundWave { from{transform:scaleY(.5)} to{transform:scaleY(1.2)} }
  @keyframes fadeIn    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  *{box-sizing:border-box}
  body{margin:0;background:#070B14}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-track{background:#0F172A}
  ::-webkit-scrollbar-thumb{background:#1E293B;border-radius:4px}
  input::placeholder{color:#475569}
`;

export default function App() {
  const [screen, setScreen]      = useState("home");
  const [subject, setSubject]    = useState("math");
  const [grade, setGrade]        = useState("Grade 6");
  const [messages, setMessages]  = useState([]);
  const [input, setInput]        = useState("");
  const [loading, setLoading]    = useState(false);
  const [avatarState, setAvatar] = useState("idle");
  const [error, setError]        = useState("");
  const endRef = useRef(null);

  const sub   = SUBJECTS.find(s => s.id === subject);
  const color = sub?.color || "#F59E0B";

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);

  const callAPI = async (history) => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history, subject: sub?.label, grade }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Server error");
    }
    const data = await res.json();
    return data.message;
  };

  const startLesson = async () => {
    setScreen("lesson");
    setMessages([]);
    setError("");
    setLoading(true);
    setAvatar("thinking");
    try {
      const text = await callAPI([{
        role: "user",
        content: `Hi! I'm a ${grade} student. Please greet me and ask what topic I want to learn in ${sub?.label} today.`
      }]);
      setMessages([{ role:"assistant", content:text }]);
      setAvatar("happy");
      setTimeout(() => setAvatar("idle"), 2000);
    } catch(e) {
      setError(e.message);
      setAvatar("idle");
    }
    setLoading(false);
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setError("");
    const next = [...messages, { role:"user", content:msg }];
    setMessages(next);
    setLoading(true);
    setAvatar("thinking");
    try {
      const text = await callAPI(next);
      setAvatar("talking");
      setTimeout(() => {
        setMessages(p => [...p, { role:"assistant", content:text }]);
        setAvatar("idle");
        setLoading(false);
      }, 600);
    } catch(e) {
      setError(e.message);
      setAvatar("idle");
      setLoading(false);
    }
  };

  if (screen === "home") return (
    <div style={{ minHeight:"100vh", background:"#070B14", fontFamily:"Georgia,serif",
      display:"flex", flexDirection:"column", alignItems:"center", padding:"32px 16px", color:"white" }}>
      <style>{CSS}</style>
      <div style={{ textAlign:"center", marginBottom:28, animation:"fadeIn .6s ease" }}>
        <div style={{ fontSize:11, letterSpacing:6, color:"#64748B", marginBottom:6 }}>UAE AI EDUCATION</div>
        <h1 style={{ fontSize:34, fontWeight:900, margin:0, letterSpacing:-1 }}>
          <span style={{ color }}>Nova</span>
          <span style={{ color:"#94A3B8", fontWeight:300 }}> Teacher</span>
        </h1>
        <p style={{ color:"#475569", fontSize:13, marginTop:6 }}>Personal AI tutor · Arabic & English</p>
      </div>
      <div style={{ animation:"float 3s ease infinite", marginBottom:28 }}>
        <Avatar state="happy" color={color}/>
      </div>
      <div style={{ width:"100%", maxWidth:400, marginBottom:20 }}>
        <div style={{ fontSize:11, letterSpacing:3, color:"#475569", marginBottom:10, textAlign:"center" }}>CHOOSE SUBJECT</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {SUBJECTS.map(s => (
            <button key={s.id} onClick={() => setSubject(s.id)} style={{
              background: subject===s.id ? `${s.color}20` : "#0F172A",
              border: `2px solid ${subject===s.id ? s.color : "#1E293B"}`,
              borderRadius:12, padding:"14px 12px", cursor:"pointer", color:"white",
              display:"flex", alignItems:"center", gap:10, transition:"all .2s",
            }}>
              <span style={{ fontSize:20 }}>{s.icon}</span>
              <span style={{ fontSize:13, fontWeight:subject===s.id?700:400, color:subject===s.id?s.color:"#94A3B8" }}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div style={{ width:"100%", maxWidth:400, marginBottom:28 }}>
        <div style={{ fontSize:11, letterSpacing:3, color:"#475569", marginBottom:10, textAlign:"center" }}>SELECT GRADE</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
          {GRADES.map(g => (
            <button key={g} onClick={() => setGrade(g)} style={{
              background: grade===g ? `${color}20` : "#0F172A",
              border: `1.5px solid ${grade===g ? color : "#1E293B"}`,
              borderRadius:20, padding:"8px 16px", cursor:"pointer",
              fontSize:12, color:grade===g?color:"#64748B", fontWeight:grade===g?700:400,
              transition:"all .2s",
            }}>{g}</button>
          ))}
        </div>
      </div>
      <button onClick={startLesson} style={{
        background:`linear-gradient(135deg,${color},${color}99)`,
        border:"none", borderRadius:16, padding:"16px 48px",
        fontSize:16, fontWeight:700, color:"white", cursor:"pointer",
        boxShadow:`0 8px 32px ${color}40`, fontFamily:"Georgia,serif",
      }}>Start Learning 🚀</button>
      <div style={{ marginTop:24, fontSize:11, color:"#334155" }}>🔒 API key secured · Never exposed to browser</div>
    </div>
  );

  return (
    <div style={{ height:"100vh", background:"#070B14", fontFamily:"Georgia,serif",
      display:"flex", flexDirection:"column", color:"white", overflow:"hidden" }}>
      <style>{CSS}</style>
      <div style={{ background:"#0F172A", borderBottom:`1px solid ${color}30`,
        padding:"12px 16px", display:"flex", alignItems:"center", gap:12 }}>
        <button onClick={() => setScreen("home")}
          style={{ background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:20, padding:0 }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:700 }}>
            <span style={{ color }}>Nova</span>
            <span style={{ color:"#475569" }}> · {sub?.icon} {sub?.label}</span>
          </div>
          <div style={{ fontSize:11, color:"#475569" }}>{grade} · UAE MOE</div>
        </div>
        <div style={{ background:`${color}20`, border:`1px solid ${color}40`,
          borderRadius:20, padding:"4px 12px", fontSize:11, color }}>🟢 Live</div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"16px" }}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:16, animation:"float 3s ease infinite" }}>
          <Avatar state={loading?"thinking":avatarState} color={color}/>
        </div>
        {error && (
          <div style={{ background:"#EF444420", border:"1px solid #EF4444", borderRadius:12,
            padding:"10px 16px", fontSize:13, color:"#FCA5A5", marginBottom:12, textAlign:"center" }}>
            ⚠️ {error}
          </div>
        )}
        {messages.map((m,i) => (
          <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start",
            marginBottom:12, animation:"fadeIn .3s ease" }}>
            <div style={{
              maxWidth:"82%",
              background: m.role==="user"?`${color}25`:"#0F172A",
              border:`1px solid ${m.role==="user"?color+"50":"#1E293B"}`,
              borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",
              padding:"12px 16px", fontSize:14, lineHeight:1.65,
              color:m.role==="user"?"#F1F5F9":"#CBD5E1",
            }}>
              {m.role==="assistant" && (
                <div style={{ fontSize:10, color, letterSpacing:2, marginBottom:6 }}>NOVA {sub?.icon}</div>
              )}
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display:"flex", justifyContent:"flex-start", marginBottom:12 }}>
            <div style={{ background:"#0F172A", border:"1px solid #1E293B",
              borderRadius:"16px 16px 16px 4px", padding:"12px 16px", display:"flex", gap:5 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:color, opacity:.7,
                  animation:`bounce .8s ${i*.15}s infinite alternate` }}/>
              ))}
            </div>
          </div>
        )}
        <div ref={endRef}/>
      </div>
      <div style={{ background:"#0F172A", borderTop:`1px solid ${color}20`,
        padding:"12px 16px", display:"flex", gap:10, alignItems:"center" }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==="Enter" && send()}
          placeholder="Ask Nova anything..."
          style={{ flex:1, background:"#070B14", border:`1.5px solid ${input?color+"60":"#1E293B"}`,
            borderRadius:12, padding:"12px 16px", color:"white", fontSize:14, outline:"none",
            fontFamily:"Georgia,serif" }}
        />
        <button onClick={send} disabled={!input.trim()||loading} style={{
          background:input.trim()&&!loading?`linear-gradient(135deg,${color},${color}99)`:"#1E293B",
          border:"none", borderRadius:12, width:46, height:46,
          cursor:input.trim()&&!loading?"pointer":"default",
          fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", color:"white",
        }}>➤</button>
      </div>
    </div>
  );
}
