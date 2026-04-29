import { useState, useEffect } from "react";

const initialTasks = [
  { id: 1, title: "포트폴리오 PDF 최종 검토", project: "포트폴리오", status: "진행중", priority: "높음", due: "2026-05-02", tags: ["디자인", "문서"] },
  { id: 2, title: "클라이언트 미팅 준비 자료", project: "업무", status: "할일", priority: "높음", due: "2026-05-01", tags: ["미팅"] },
  { id: 3, title: "비트코인 콜드월렛 백업 확인", project: "개인", status: "할일", priority: "중간", due: "2026-05-05", tags: ["보안"] },
  { id: 4, title: "오키나와 여행 사진 정리", project: "개인", status: "완료", priority: "낮음", due: "2026-04-28", tags: ["여행"] },
  { id: 5, title: "HABIT OS 스트릭 버그 수정", project: "개발", status: "진행중", priority: "중간", due: "2026-05-03", tags: ["개발", "React"] },
  { id: 6, title: "노션 템플릿 레퍼런스 수집", project: "포트폴리오", status: "완료", priority: "낮음", due: "2026-04-29", tags: ["리서치"] },
  { id: 7, title: "OpenClaw 설정 업데이트", project: "개발", status: "할일", priority: "낮음", due: "2026-05-07", tags: ["AI", "개발"] },
  { id: 8, title: "건축 CAD 파일 정리", project: "업무", status: "진행중", priority: "높음", due: "2026-05-04", tags: ["CAD"] },
];

const PROJECTS = ["전체", "포트폴리오", "업무", "개인", "개발"];
const STATUSES = ["전체", "할일", "진행중", "완료"];

const STATUS_CONFIG = {
  "할일":   { color: "#64748b", bg: "rgba(100,116,139,0.15)", dot: "#64748b" },
  "진행중": { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  dot: "#f59e0b" },
  "완료":   { color: "#10b981", bg: "rgba(16,185,129,0.12)",  dot: "#10b981" },
};

const PRIORITY_CONFIG = {
  "높음": { color: "#ef4444", label: "↑ 높음" },
  "중간": { color: "#f59e0b", label: "→ 중간" },
  "낮음": { color: "#64748b", label: "↓ 낮음" },
};

function formatDate(d) {
  const date = new Date(d);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function isOverdue(due, status) {
  return status !== "완료" && new Date(due) < new Date();
}

export default function TaskOS() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("taskos-tasks");
      return saved ? JSON.parse(saved) : initialTasks;
    } catch {
      return initialTasks;
    }
  });

  useEffect(() => {
    localStorage.setItem("taskos-tasks", JSON.stringify(tasks));
  }, [tasks]);
  const [selectedProject, setSelectedProject] = useState("전체");
  const [selectedStatus, setSelectedStatus] = useState("전체");
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [view, setView] = useState("list"); // list | board
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

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

  const doneRate = Math.round((stats.done / stats.total) * 100);

  function cycleStatus(id) {
    const order = ["할일", "진행중", "완료"];
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, status: order[(order.indexOf(t.status) + 1) % 3] } : t
    ));
  }

  function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  function saveTask(data) {
    if (editTask) {
      setTasks(prev => prev.map(t => t.id === editTask.id ? { ...t, ...data } : t));
    } else {
      setTasks(prev => [...prev, { id: Date.now(), ...data }]);
    }
    setShowModal(false);
    setEditTask(null);
  }

  const boardGroups = ["할일", "진행중", "완료"].map(s => ({
    status: s,
    tasks: filtered.filter(t => t.status === s),
  }));

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d0d0f",
      fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
      color: "#e2e8f0",
      opacity: mounted ? 1 : 0,
      transition: "opacity 0.4s ease",
    }}>
      {/* Subtle grid background */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "0 24px 60px" }}>

        {/* Header */}
        <header style={{ padding: "40px 0 32px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#4a5568", marginBottom: 6, textTransform: "uppercase", fontWeight: 600 }}>
                TASK OS
              </div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", color: "#f1f5f9" }}>
                나의 작업공간
              </h1>
            </div>
            <button
              onClick={() => { setEditTask(null); setShowModal(true); }}
              style={{
                background: "#f1f5f9", color: "#0d0d0f", border: "none", cursor: "pointer",
                padding: "10px 20px", borderRadius: 8, fontWeight: 700, fontSize: 13,
                letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 6,
                transition: "transform 0.15s, opacity 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              <span style={{ fontSize: 16 }}>+</span> 새 태스크
            </button>
          </div>
        </header>

        {/* Stats Bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, padding: "28px 0 24px" }}>
          {[
            { label: "전체", value: stats.total, accent: "#94a3b8" },
            { label: "할 일", value: stats.todo, accent: "#64748b" },
            { label: "진행 중", value: stats.inProgress, accent: "#f59e0b" },
            { label: "완료", value: stats.done, accent: "#10b981" },
          ].map((s, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12, padding: "16px 20px",
              transition: "border-color 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = `${s.accent}40`}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}
            >
              <div style={{ fontSize: 11, color: "#4a5568", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8, fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.accent, letterSpacing: "-0.04em" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${doneRate}%`, background: "linear-gradient(90deg, #10b981, #34d399)",
              borderRadius: 2, transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
            }} />
          </div>
          <span style={{ fontSize: 12, color: "#4a5568", fontWeight: 700, minWidth: 36 }}>{doneRate}%</span>
        </div>

        {/* Filters & View Toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PROJECTS.map(p => (
              <button key={p} onClick={() => setSelectedProject(p)} style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: selectedProject === p ? "none" : "1px solid rgba(255,255,255,0.1)",
                background: selectedProject === p ? "#f1f5f9" : "transparent",
                color: selectedProject === p ? "#0d0d0f" : "#64748b",
                cursor: "pointer", transition: "all 0.15s", letterSpacing: "-0.01em",
              }}>{p}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {STATUSES.map(s => (
              <button key={s} onClick={() => setSelectedStatus(s)} style={{
                padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                border: "1px solid",
                borderColor: selectedStatus === s ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.07)",
                background: selectedStatus === s ? "rgba(255,255,255,0.08)" : "transparent",
                color: selectedStatus === s ? "#e2e8f0" : "#4a5568",
                cursor: "pointer", transition: "all 0.15s",
              }}>{s}</button>
            ))}
            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />
            {["list", "board"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                border: "1px solid",
                borderColor: view === v ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.07)",
                background: view === v ? "rgba(255,255,255,0.08)" : "transparent",
                color: view === v ? "#e2e8f0" : "#4a5568",
                cursor: "pointer", transition: "all 0.15s",
              }}>
                {v === "list" ? "≡ 리스트" : "⊞ 보드"}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div style={{ fontSize: 11, color: "#374151", marginBottom: 14, letterSpacing: "0.05em", fontWeight: 600 }}>
          {filtered.length}개 태스크
        </div>

        {/* List View */}
        {view === "list" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#374151", fontSize: 14 }}>
                태스크가 없습니다
              </div>
            ) : filtered.map((task, i) => (
              <TaskRow key={task.id} task={task} index={i}
                onCycle={() => cycleStatus(task.id)}
                onDelete={() => deleteTask(task.id)}
                onEdit={() => { setEditTask(task); setShowModal(true); }}
              />
            ))}
          </div>
        )}

        {/* Board View */}
        {view === "board" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {boardGroups.map(group => (
              <div key={group.status} style={{
                background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14, padding: 16, minHeight: 200,
              }}>
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
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <TaskModal
          task={editTask}
          onSave={saveTask}
          onClose={() => { setShowModal(false); setEditTask(null); }}
        />
      )}
    </div>
  );
}

function TaskRow({ task, index, onCycle, onDelete, onEdit }) {
  const [hovered, setHovered] = useState(false);
  const sc = STATUS_CONFIG[task.status];
  const pc = PRIORITY_CONFIG[task.priority];
  const overdue = isOverdue(task.due, task.status);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid", gridTemplateColumns: "32px 1fr auto auto auto auto",
        alignItems: "center", gap: 12,
        padding: "12px 16px", borderRadius: 10,
        background: hovered ? "rgba(255,255,255,0.04)" : "transparent",
        border: "1px solid", borderColor: hovered ? "rgba(255,255,255,0.08)" : "transparent",
        transition: "all 0.15s",
        opacity: task.status === "완료" ? 0.55 : 1,
        animation: `fadeSlideIn 0.3s ease ${index * 0.04}s both`,
      }}
    >
      {/* Status toggle */}
      <button onClick={onCycle} style={{
        width: 20, height: 20, borderRadius: 6,
        border: `1.5px solid ${sc.dot}`,
        background: task.status === "완료" ? sc.dot : "transparent",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s", flexShrink: 0,
      }}>
        {task.status === "완료" && <span style={{ color: "#0d0d0f", fontSize: 11, fontWeight: 900 }}>✓</span>}
        {task.status === "진행중" && <span style={{ width: 6, height: 6, background: sc.dot, borderRadius: 2, display: "block" }} />}
      </button>

      {/* Title + tags */}
      <div style={{ minWidth: 0 }}>
        <span style={{
          fontSize: 14, fontWeight: 500, letterSpacing: "-0.02em",
          color: task.status === "완료" ? "#4a5568" : "#e2e8f0",
          textDecoration: task.status === "완료" ? "line-through" : "none",
        }}>{task.title}</span>
        <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
          {task.tags.map(tag => (
            <span key={tag} style={{
              fontSize: 10, padding: "2px 7px", borderRadius: 4,
              background: "rgba(255,255,255,0.06)", color: "#64748b",
              fontWeight: 600, letterSpacing: "0.02em",
            }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Project */}
      <span style={{ fontSize: 11, color: "#374151", fontWeight: 600, whiteSpace: "nowrap" }}>{task.project}</span>

      {/* Priority */}
      <span style={{ fontSize: 11, color: pc.color, fontWeight: 700, whiteSpace: "nowrap" }}>{pc.label}</span>

      {/* Due date */}
      <span style={{
        fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
        color: overdue ? "#ef4444" : "#4a5568",
      }}>{formatDate(task.due)}{overdue ? " ⚠" : ""}</span>

      {/* Actions */}
      <div style={{ display: "flex", gap: 4, opacity: hovered ? 1 : 0, transition: "opacity 0.15s" }}>
        <button onClick={onEdit} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: 13, padding: "2px 6px" }}>✎</button>
        <button onClick={onDelete} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: 13, padding: "2px 6px" }}>✕</button>
      </div>
    </div>
  );
}

function BoardCard({ task, onCycle, onDelete, onEdit }) {
  const [hovered, setHovered] = useState(false);
  const sc = STATUS_CONFIG[task.status];
  const pc = PRIORITY_CONFIG[task.priority];
  const overdue = isOverdue(task.due, task.status);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 14,
        transition: "all 0.15s", cursor: "default",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-0.02em", color: "#e2e8f0", lineHeight: 1.4, flex: 1 }}>
          {task.title}
        </span>
        <div style={{ display: "flex", gap: 2, marginLeft: 8, opacity: hovered ? 1 : 0, transition: "opacity 0.15s" }}>
          <button onClick={onEdit} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: 12 }}>✎</button>
          <button onClick={onDelete} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: 12 }}>✕</button>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, color: "#374151", fontWeight: 600 }}>{task.project}</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: overdue ? "#ef4444" : "#374151", fontWeight: 600 }}>{formatDate(task.due)}</span>
          <span style={{ fontSize: 10, color: pc.color, fontWeight: 700 }}>{task.priority}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
        {task.tags.map(tag => (
          <span key={tag} style={{
            fontSize: 10, padding: "2px 6px", borderRadius: 4,
            background: "rgba(255,255,255,0.06)", color: "#64748b", fontWeight: 600,
          }}>{tag}</span>
        ))}
      </div>
    </div>
  );
}

function TaskModal({ task, onSave, onClose }) {
  const [form, setForm] = useState({
    title: task?.title || "",
    project: task?.project || "업무",
    status: task?.status || "할일",
    priority: task?.priority || "중간",
    due: task?.due || new Date().toISOString().split("T")[0],
    tags: task?.tags?.join(", ") || "",
  });

  function handle(field, val) {
    setForm(p => ({ ...p, [field]: val }));
  }

  function submit() {
    if (!form.title.trim()) return;
    onSave({
      ...form,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
    });
  }

  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8, padding: "10px 12px", color: "#e2e8f0", fontSize: 13,
    outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  };

  const labelStyle = { display: "block", fontSize: 11, color: "#4a5568", marginBottom: 6, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#111113", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 16, padding: 28, width: "100%", maxWidth: 460,
        animation: "fadeSlideIn 0.2s ease both",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>
            {task ? "태스크 수정" : "새 태스크"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#4a5568", fontSize: 20 }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>제목</label>
            <input value={form.title} onChange={e => handle("title", e.target.value)}
              placeholder="태스크 제목 입력..." style={inputStyle}
              onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.3)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>프로젝트</label>
              <select value={form.project} onChange={e => handle("project", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {["포트폴리오","업무","개인","개발"].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>상태</label>
              <select value={form.status} onChange={e => handle("status", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {["할일","진행중","완료"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>우선순위</label>
              <select value={form.priority} onChange={e => handle("priority", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {["높음","중간","낮음"].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>마감일</label>
              <input type="date" value={form.due} onChange={e => handle("due", e.target.value)}
                style={{ ...inputStyle, colorScheme: "dark" }} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>태그 (쉼표로 구분)</label>
            <input value={form.tags} onChange={e => handle("tags", e.target.value)}
              placeholder="개발, 디자인, 미팅..." style={inputStyle}
              onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.3)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>

          <button onClick={submit} style={{
            width: "100%", padding: "12px", borderRadius: 8,
            background: "#f1f5f9", border: "none", cursor: "pointer",
            color: "#0d0d0f", fontSize: 14, fontWeight: 700, marginTop: 4,
            transition: "opacity 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            {task ? "저장" : "태스크 추가"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
