import { useState, useEffect } from "react";

const TODAY = new Date().toISOString().split("T")[0];

const initialTasks = [
  { id: 1, title: "포트폴리오 PDF 최종 검토", project: "포트폴리오", status: "진행중", priority: "높음", due: TODAY, tags: ["디자인", "문서"], log: "" },
  { id: 2, title: "클라이언트 미팅 준비 자료", project: "업무", status: "할일", priority: "높음", due: TODAY, tags: ["미팅"], log: "" },
  { id: 3, title: "비트코인 콜드월렛 백업 확인", project: "개인", status: "할일", priority: "중간", due: TODAY, tags: ["보안"], log: "" },
  { id: 4, title: "오키나와 여행 사진 정리", project: "개인", status: "완료", priority: "낮음", due: TODAY, tags: ["여행"], log: "앨범 정리 완료, 구글포토 업로드함" },
  { id: 5, title: "HABIT OS 스트릭 버그 수정", project: "개발", status: "진행중", priority: "중간", due: TODAY, tags: ["개발", "React"], log: "useEffect 의존성 배열 수정 중" },
  { id: 6, title: "노션 템플릿 레퍼런스 수집", project: "포트폴리오", status: "완료", priority: "낮음", due: TODAY, tags: ["리서치"], log: "노시언, Notion Market 10개 수집" },
  { id: 7, title: "OpenClaw 설정 업데이트", project: "개발", status: "할일", priority: "낮음", due: TODAY, tags: ["AI", "개발"], log: "" },
  { id: 8, title: "건축 CAD 파일 정리", project: "업무", status: "진행중", priority: "높음", due: TODAY, tags: ["CAD"], log: "레이어 정리 중, 절반 완료" },
];

const PROJECTS = ["전체", "포트폴리오", "업무", "개인", "개발"];
const STATUSES = ["전체", "할일", "진행중", "완료"];
const PROJECT_COLORS = { "포트폴리오": "#818cf8", "업무": "#f59e0b", "개인": "#10b981", "개발": "#38bdf8" };
const STATUS_CONFIG = {
  "할일":   { dot: "#64748b" },
  "진행중": { dot: "#f59e0b" },
  "완료":   { dot: "#10b981" },
};
const PRIORITY_CONFIG = {
  "높음": { color: "#ef4444", label: "↑ 높음" },
  "중간": { color: "#f59e0b", label: "→ 중간" },
  "낮음": { color: "#64748b", label: "↓ 낮음" },
};

function addDays(dateStr, n) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

function formatDate(d) {
  const date = new Date(d);
  const today = new Date(TODAY);
  const diff = Math.round((date - today) / 86400000);
  if (diff === 0) return "오늘";
  if (diff === 1) return "내일";
  if (diff === -1) return "어제";
  if (diff > 0) return `+${diff}일`;
  return `${Math.abs(diff)}일 지남`;
}

function isOverdue(due, status) {
  return status !== "완료" && due < TODAY;
}

// 날짜가 지난 미완료 태스크 자동 완료
function autoComplete(tasks) {
  return tasks.map(t => {
    if (t.status !== "완료" && t.due < TODAY && t.log && t.log.trim()) {
      return { ...t, status: "완료" };
    }
    return t;
  });
}

// ── 도넛 차트 ──
function DonutChart({ tasks }) {
  const done = tasks.filter(t => t.status === "완료").length;
  const inProg = tasks.filter(t => t.status === "진행중").length;
  const todo = tasks.filter(t => t.status === "할일").length;
  const total = tasks.length || 1;
  const rate = Math.round((done / total) * 100);
  const cx = 60, cy = 60, r = 48, sw = 10;
  const circ = 2 * Math.PI * r;
  const segs = [{ val: done, color: "#10b981" }, { val: inProg, color: "#f59e0b" }, { val: todo, color: "#334155" }];
  let offset = 0;
  const arcs = segs.map(s => { const dash = (s.val / total) * circ; const arc = { ...s, dash, offset }; offset += dash; return arc; });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
        <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw} />
          {arcs.map((a, i) => <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={a.color} strokeWidth={sw} strokeDasharray={`${a.dash} ${circ - a.dash}`} strokeDashoffset={-a.offset} />)}
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>{rate}%</span>
          <span style={{ fontSize: 9, color: "#4a5568", fontWeight: 600 }}>완료율</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[{ label: "완료", val: done, color: "#10b981" }, { label: "진행중", val: inProg, color: "#f59e0b" }, { label: "할일", val: todo, color: "#334155" }].map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, minWidth: 36 }}>{s.label}</span>
            <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 700 }}>{s.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 프로젝트별 ──
function ProjectBar({ tasks }) {
  const projects = ["포트폴리오", "업무", "개인", "개발"];
  const max = Math.max(...projects.map(p => tasks.filter(t => t.project === p).length), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
      {projects.map(p => {
        const total = tasks.filter(t => t.project === p).length;
        const done = tasks.filter(t => t.project === p && t.status === "완료").length;
        return (
          <div key={p}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{p}</span>
              <span style={{ fontSize: 11, color: "#4a5568", fontWeight: 600 }}>{done}/{total}</span>
            </div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(total / max) * 100}%`, background: PROJECT_COLORS[p], borderRadius: 3, opacity: 0.8 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── 우선순위 분포 ──
function PriorityDist({ tasks }) {
  const items = [
    { label: "높음", color: "#ef4444", val: tasks.filter(t => t.priority === "높음").length },
    { label: "중간", color: "#f59e0b", val: tasks.filter(t => t.priority === "중간").length },
    { label: "낮음", color: "#64748b", val: tasks.filter(t => t.priority === "낮음").length },
  ];
  const total = tasks.length || 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
      <div style={{ display: "flex", height: 12, borderRadius: 6, overflow: "hidden", gap: 2 }}>
        {items.map(i => <div key={i.label} style={{ flex: i.val || 0.1, background: i.color, opacity: 0.85 }} />)}
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {items.map(i => (
          <div key={i.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: i.color }} />
            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{i.label}</span>
            <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 700 }}>{i.val}</span>
            <span style={{ fontSize: 10, color: "#374151" }}>({Math.round(i.val / total * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 오늘의 과업 로그 현황 ──
function TodayLog({ tasks }) {
  const todayTasks = tasks.filter(t => t.due === TODAY);
  const logged = todayTasks.filter(t => t.log && t.log.trim());
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>오늘 기록 완료</span>
        <span style={{ fontSize: 11, color: "#10b981", fontWeight: 700 }}>{logged.length}/{todayTasks.length}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {todayTasks.slice(0, 5).map(t => (
          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.log?.trim() ? "#10b981" : "#334155", flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: t.log?.trim() ? "#94a3b8" : "#4a5568", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {t.title}
            </span>
          </div>
        ))}
        {todayTasks.length === 0 && <span style={{ fontSize: 11, color: "#374151" }}>오늘 마감 태스크 없음</span>}
      </div>
    </div>
  );
}

function Dashboard({ tasks }) {
  const cardStyle = { background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "18px 20px" };
  const titleStyle = { fontSize: 10, color: "#4a5568", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, marginBottom: 16 };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, padding: "24px 0 8px" }}>
      <div style={cardStyle}><div style={titleStyle}>완료율</div><DonutChart tasks={tasks} /></div>
      <div style={cardStyle}><div style={titleStyle}>프로젝트별</div><ProjectBar tasks={tasks} /></div>
      <div style={cardStyle}><div style={titleStyle}>우선순위 분포</div><PriorityDist tasks={tasks} /></div>
      <div style={cardStyle}><div style={titleStyle}>오늘의 기록 현황</div><TodayLog tasks={tasks} /></div>
    </div>
  );
}

export default function TaskOS() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("taskos-tasks");
      const parsed = saved ? JSON.parse(saved) : initialTasks;
      return autoComplete(parsed);
    } catch { return initialTasks; }
  });
  useEffect(() => { localStorage.setItem("taskos-tasks", JSON.stringify(tasks)); }, [tasks]);

  const [selectedProject, setSelectedProject] = useState("전체");
  const [selectedStatus, setSelectedStatus] = useState("전체");
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [view, setView] = useState("list");
  const [showDash, setShowDash] = useState(true);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const filtered = tasks.filter(t =>
    (selectedProject === "전체" || t.project === selectedProject) &&
    (selectedStatus === "전체" || t.status === selectedStatus)
  );
  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === "완료").length,
    inProgress: tasks.filter(t => t.status === "진행중").length,
    todo: tasks.filter(t => t.status === "할일").length,
  };
  const doneRate = Math.round((stats.done / (stats.total || 1)) * 100);

  function cycleStatus(id) {
    const order = ["할일", "진행중", "완료"];
    setTasks(prev => prev.map(t => t.id !== id ? t : { ...t, status: order[(order.indexOf(t.status) + 1) % 3] }));
  }
  function updateLog(id, log) {
    setTasks(prev => prev.map(t => t.id !== id ? t : { ...t, log }));
  }
  function extendTask(id, days) {
    setTasks(prev => prev.map(t => t.id !== id ? t : { ...t, due: addDays(t.due, days), status: t.status === "완료" ? "진행중" : t.status }));
  }
  function deleteTask(id) { setTasks(prev => prev.filter(t => t.id !== id)); }
  function saveTask(data) {
    if (editTask) { setTasks(prev => prev.map(t => t.id === editTask.id ? { ...t, ...data } : t)); }
    else { setTasks(prev => [...prev, { id: Date.now(), log: "", ...data }]); }
    setShowModal(false); setEditTask(null);
  }

  const boardGroups = ["할일", "진행중", "완료"].map(s => ({ status: s, tasks: filtered.filter(t => t.status === s) }));

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0f", fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif", color: "#e2e8f0", opacity: mounted ? 1 : 0, transition: "opacity 0.4s ease" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "0 24px 60px" }}>

        <header style={{ padding: "40px 0 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#4a5568", marginBottom: 6, textTransform: "uppercase", fontWeight: 600 }}>TASK OS</div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", color: "#f1f5f9" }}>나의 작업공간</h1>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowDash(v => !v)} style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", padding: "10px 16px", borderRadius: 8, fontWeight: 600, fontSize: 12 }}>
                {showDash ? "대시보드 숨기기" : "대시보드 보기"}
              </button>
              <button onClick={() => { setEditTask(null); setShowModal(true); }}
                style={{ background: "#f1f5f9", color: "#0d0d0f", border: "none", cursor: "pointer", padding: "10px 20px", borderRadius: 8, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.85"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                <span style={{ fontSize: 16 }}>+</span> 새 태스크
              </button>
            </div>
          </div>
        </header>

        {showDash && <Dashboard tasks={tasks} />}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, padding: "20px 0 16px" }}>
          {[{ label: "전체", value: stats.total, accent: "#94a3b8" }, { label: "할 일", value: stats.todo, accent: "#64748b" }, { label: "진행 중", value: stats.inProgress, accent: "#f59e0b" }, { label: "완료", value: stats.done, accent: "#10b981" }].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 18px", transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = `${s.accent}40`}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}>
              <div style={{ fontSize: 11, color: "#4a5568", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6, fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.accent }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${doneRate}%`, background: "linear-gradient(90deg, #10b981, #34d399)", borderRadius: 2, transition: "width 0.8s ease" }} />
          </div>
          <span style={{ fontSize: 12, color: "#4a5568", fontWeight: 700, minWidth: 36 }}>{doneRate}%</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PROJECTS.map(p => (
              <button key={p} onClick={() => setSelectedProject(p)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: selectedProject === p ? "none" : "1px solid rgba(255,255,255,0.1)", background: selectedProject === p ? "#f1f5f9" : "transparent", color: selectedProject === p ? "#0d0d0f" : "#64748b", cursor: "pointer" }}>{p}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {STATUSES.map(s => (
              <button key={s} onClick={() => setSelectedStatus(s)} style={{ padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, border: "1px solid", borderColor: selectedStatus === s ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.07)", background: selectedStatus === s ? "rgba(255,255,255,0.08)" : "transparent", color: selectedStatus === s ? "#e2e8f0" : "#4a5568", cursor: "pointer" }}>{s}</button>
            ))}
            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />
            {["list", "board"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, border: "1px solid", borderColor: view === v ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.07)", background: view === v ? "rgba(255,255,255,0.08)" : "transparent", color: view === v ? "#e2e8f0" : "#4a5568", cursor: "pointer" }}>
                {v === "list" ? "≡ 리스트" : "⊞ 보드"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 11, color: "#374151", marginBottom: 14, fontWeight: 600 }}>{filtered.length}개 태스크</div>

        {view === "list" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.length === 0
              ? <div style={{ textAlign: "center", padding: "60px 0", color: "#374151", fontSize: 14 }}>태스크가 없습니다</div>
              : filtered.map((task, i) => (
                <TaskRow key={task.id} task={task} index={i}
                  onCycle={() => cycleStatus(task.id)}
                  onDelete={() => deleteTask(task.id)}
                  onEdit={() => { setEditTask(task); setShowModal(true); }}
                  onLog={v => updateLog(task.id, v)}
                  onExtend={d => extendTask(task.id, d)}
                  onComplete={() => { setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: "완료" } : t)); }}
                />
              ))}
          </div>
        )}

        {view === "board" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {boardGroups.map(group => (
              <div key={group.status} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 16, minHeight: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS_CONFIG[group.status].dot }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>{group.status}</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "#374151", fontWeight: 700 }}>{group.tasks.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {group.tasks.map(task => (
                    <BoardCard key={task.id} task={task}
                      onCycle={() => cycleStatus(task.id)}
                      onDelete={() => deleteTask(task.id)}
                      onEdit={() => { setEditTask(task); setShowModal(true); }}
                      onLog={v => updateLog(task.id, v)}
                      onExtend={d => extendTask(task.id, d)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && <TaskModal task={editTask} onSave={saveTask} onClose={() => { setShowModal(false); setEditTask(null); }} />}
    </div>
  );
}

function TaskRow({ task, index, onCycle, onDelete, onEdit, onLog, onExtend, onComplete }) {
  const [hovered, setHovered] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const sc = STATUS_CONFIG[task.status];
  const pc = PRIORITY_CONFIG[task.priority];
  const overdue = isOverdue(task.due, task.status);
  const hasLog = task.log && task.log.trim();

  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ borderRadius: 12, background: hovered ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)", border: "1px solid", borderColor: hovered ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.05)", transition: "all 0.15s", overflow: "hidden", opacity: task.status === "완료" ? 0.6 : 1, animation: `fadeSlideIn 0.3s ease ${index * 0.04}s both` }}>
      <div style={{ display: "grid", gridTemplateColumns: "28px 1fr auto auto", alignItems: "center", gap: 12, padding: "14px 16px" }}>
        {/* 상태 버튼 */}
        <button onClick={onCycle} style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${sc.dot}`, background: task.status === "완료" ? sc.dot : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {task.status === "완료" && <span style={{ color: "#0d0d0f", fontSize: 11, fontWeight: 900 }}>✓</span>}
          {task.status === "진행중" && <span style={{ width: 6, height: 6, background: sc.dot, borderRadius: 2, display: "block" }} />}
        </button>

        {/* 제목 + 태그 */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: task.status === "완료" ? "#4a5568" : "#e2e8f0", textDecoration: task.status === "완료" ? "line-through" : "none" }}>{task.title}</span>
            <span style={{ fontSize: 10, color: pc.color, fontWeight: 700 }}>{pc.label}</span>
            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: "rgba(255,255,255,0.06)", color: "#64748b", fontWeight: 600 }}>{task.project}</span>
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap" }}>
            {task.tags.map(tag => <span key={tag} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "rgba(255,255,255,0.05)", color: "#64748b", fontWeight: 600 }}>{tag}</span>)}
          </div>
        </div>

        {/* 마감일 + 연장 */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: overdue ? "#ef4444" : task.due === TODAY ? "#f59e0b" : "#4a5568", whiteSpace: "nowrap" }}>
            {overdue ? "⚠ " : ""}{formatDate(task.due)}
          </span>
          {task.status !== "완료" && (
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => onExtend(1)} title="+1일 연장" style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#818cf8", cursor: "pointer", fontWeight: 700 }}>+1일</button>
              <button onClick={() => onExtend(2)} title="+2일 연장" style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", color: "#6366f1", cursor: "pointer", fontWeight: 700 }}>+2일</button>
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <button onClick={() => setLogOpen(v => !v)} title="오늘 기록" style={{ fontSize: 13, padding: "4px 6px", background: hasLog ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)", border: "none", borderRadius: 6, cursor: "pointer", color: hasLog ? "#10b981" : "#4a5568" }}>✏️</button>
          <button onClick={onEdit} style={{ background: "none", border: "none", cursor: "pointer", color: "#4a5568", fontSize: 13, padding: "2px 4px", opacity: hovered ? 1 : 0, transition: "opacity 0.15s" }}>✎</button>
          <button onClick={onDelete} style={{ background: "none", border: "none", cursor: "pointer", color: "#4a5568", fontSize: 13, padding: "2px 4px", opacity: hovered ? 1 : 0, transition: "opacity 0.15s" }}>✕</button>
        </div>
      </div>

      {/* 로그 입력 영역 */}
      {logOpen && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ fontSize: 10, color: "#4a5568", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8, marginTop: 14 }}>
            오늘 한 일 메모
          </div>
          <textarea
            value={task.log || ""}
            onChange={e => onLog(e.target.value)}
            placeholder="오늘 무엇을 했나요? (예: API 연동 완료, 디자인 수정 3건)"
            rows={2}
            style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8, padding: "10px 12px", color: "#e2e8f0", fontSize: 13, outline: "none", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", lineHeight: 1.5 }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button
              onClick={() => { if (task.log && task.log.trim()) { onComplete(); setLogOpen(false); } }}
              style={{ flex: 1, padding: "9px", borderRadius: 8, background: task.log?.trim() ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.04)", border: "1px solid " + (task.log?.trim() ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.08)"), color: task.log?.trim() ? "#10b981" : "#374151", cursor: task.log?.trim() ? "pointer" : "default", fontWeight: 700, fontSize: 13 }}
            >
              ✓ 기록 완료
            </button>
            <button
              onClick={() => setLogOpen(false)}
              style={{ padding: "9px 16px", borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "#4a5568", cursor: "pointer", fontWeight: 600, fontSize: 12 }}
            >
              닫기
            </button>
          </div>
        </div>
      )}
      <style>{`@keyframes fadeSlideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}

function BoardCard({ task, onCycle, onDelete, onEdit, onLog, onExtend }) {
  const [logOpen, setLogOpen] = useState(false);
  const pc = PRIORITY_CONFIG[task.priority];
  const overdue = isOverdue(task.due, task.status);
  const hasLog = task.log && task.log.trim();

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0", lineHeight: 1.4, flex: 1 }}>{task.title}</span>
          <div style={{ display: "flex", gap: 2, marginLeft: 8 }}>
            <button onClick={onEdit} style={{ background: "none", border: "none", cursor: "pointer", color: "#4a5568", fontSize: 12 }}>✎</button>
            <button onClick={onDelete} style={{ background: "none", border: "none", cursor: "pointer", color: "#4a5568", fontSize: 12 }}>✕</button>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 10, color: pc.color, fontWeight: 700 }}>{pc.label}</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: overdue ? "#ef4444" : task.due === TODAY ? "#f59e0b" : "#374151" }}>{formatDate(task.due)}</span>
        </div>
        {task.status !== "완료" && (
          <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
            <button onClick={() => onExtend(1)} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#818cf8", cursor: "pointer", fontWeight: 700 }}>+1일</button>
            <button onClick={() => onExtend(2)} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", color: "#6366f1", cursor: "pointer", fontWeight: 700 }}>+2일</button>
            <button onClick={() => setLogOpen(v => !v)} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: hasLog ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)", border: "none", color: hasLog ? "#10b981" : "#4a5568", cursor: "pointer", marginLeft: "auto" }}>✏️ 기록</button>
          </div>
        )}
        {hasLog && !logOpen && (
          <div style={{ fontSize: 11, color: "#4a5568", background: "rgba(16,185,129,0.07)", borderRadius: 6, padding: "6px 8px", lineHeight: 1.5 }}>{task.log}</div>
        )}
      </div>
      {logOpen && (
        <div style={{ padding: "0 14px 12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <textarea value={task.log || ""} onChange={e => onLog(e.target.value)}
            placeholder="오늘 무엇을 했나요?"
            rows={2}
            style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 8, padding: "8px 10px", color: "#e2e8f0", fontSize: 12, outline: "none", fontFamily: "inherit", resize: "none", boxSizing: "border-box", marginTop: 10 }}
          />
        </div>
      )}
    </div>
  );
}

function TaskModal({ task, onSave, onClose }) {
  const [form, setForm] = useState({
    title: task?.title || "",
    project: task?.project || "업무",
    status: task?.status || "할일",
    priority: task?.priority || "중간",
    due: task?.due || TODAY,
    tags: task?.tags?.join(", ") || "",
    log: task?.log || "",
  });
  function handle(field, val) { setForm(p => ({ ...p, [field]: val })); }
  function submit() {
    if (!form.title.trim()) return;
    onSave({ ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) });
  }
  const inputStyle = { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 12px", color: "#e2e8f0", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
  const labelStyle = { display: "block", fontSize: 11, color: "#4a5568", marginBottom: 6, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#111113", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 28, width: "100%", maxWidth: 460, animation: "fadeSlideIn 0.2s ease both", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>{task ? "태스크 수정" : "새 태스크"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#4a5568", fontSize: 20 }}>✕</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div><label style={labelStyle}>제목</label><input value={form.title} onChange={e => handle("title", e.target.value)} placeholder="태스크 제목 입력..." style={inputStyle} onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.3)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>프로젝트</label><select value={form.project} onChange={e => handle("project", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>{["포트폴리오","업무","개인","개발"].map(p => <option key={p} value={p}>{p}</option>)}</select></div>
            <div><label style={labelStyle}>상태</label><select value={form.status} onChange={e => handle("status", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>{["할일","진행중","완료"].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label style={labelStyle}>우선순위</label><select value={form.priority} onChange={e => handle("priority", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>{["높음","중간","낮음"].map(p => <option key={p} value={p}>{p}</option>)}</select></div>
            <div><label style={labelStyle}>마감일</label><input type="date" value={form.due} onChange={e => handle("due", e.target.value)} style={{ ...inputStyle, colorScheme: "dark" }} /></div>
          </div>
          <div><label style={labelStyle}>태그 (쉼표로 구분)</label><input value={form.tags} onChange={e => handle("tags", e.target.value)} placeholder="개발, 디자인, 미팅..." style={inputStyle} onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.3)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} /></div>
          <div>
            <label style={labelStyle}>오늘 기록</label>
            <textarea value={form.log} onChange={e => handle("log", e.target.value)} placeholder="오늘 무엇을 했나요?" rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
              onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.3)"} onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"} />
          </div>
          <button onClick={submit} style={{ width: "100%", padding: "12px", borderRadius: 8, background: "#f1f5f9", border: "none", cursor: "pointer", color: "#0d0d0f", fontSize: 14, fontWeight: 700 }} onMouseEnter={e => e.currentTarget.style.opacity = "0.85"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>{task ? "저장" : "태스크 추가"}</button>
        </div>
      </div>
      <style>{`@keyframes fadeSlideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
