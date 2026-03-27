import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const STATUS_OPTIONS = ["started", "in-progress", "pending", "completed"];

const statusMeta = {
  started: { label: "Started", bg: "#ede9fe", color: "#6d28d9", icon: "▶" },
  "in-progress": { label: "In Progress", bg: "#dbeafe", color: "#1d4ed8", icon: "↻" },
  pending: { label: "Pending", bg: "#ffedd5", color: "#c2410c", icon: "!" },
  completed: { label: "Completed", bg: "#dcfce7", color: "#15803d", icon: "✓" },
};

function card(extra = {}) {
  return {
    background: "rgba(255,255,255,0.96)",
    borderRadius: 26,
    boxShadow: "0 16px 40px rgba(15,23,42,0.10)",
    ...extra,
  };
}

function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  style = {},
  disabled = false,
}) {
  const styles = {
    primary: { background: "#2563eb", color: "white", border: "none" },
    secondary: { background: "white", color: "#1e293b", border: "1px solid #cbd5e1" },
    danger: { background: "#dc2626", color: "white", border: "none" },
    success: { background: "#16a34a", color: "white", border: "none" },
    warning: { background: "#f59e0b", color: "white", border: "none" },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "11px 16px",
        borderRadius: 14,
        fontWeight: 800,
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: 14,
        opacity: disabled ? 0.6 : 1,
        ...styles[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: 8,
          fontWeight: 700,
          color: "#334155",
          fontSize: 14,
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: 14,
          border: "1px solid #cbd5e1",
          boxSizing: "border-box",
          fontSize: 14,
          outline: "none",
        }}
      />
    </div>
  );
}

function TextareaField({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: 8,
          fontWeight: 700,
          color: "#334155",
          fontSize: 14,
        }}
      >
        {label}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: 14,
          border: "1px solid #cbd5e1",
          boxSizing: "border-box",
          resize: "vertical",
          fontSize: 14,
          outline: "none",
        }}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, children }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: 8,
          fontWeight: 700,
          color: "#334155",
          fontSize: 14,
        }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: 14,
          border: "1px solid #cbd5e1",
          boxSizing: "border-box",
          fontSize: 14,
          background: "white",
          outline: "none",
        }}
      >
        {children}
      </select>
    </div>
  );
}

function StatCard({ label, value, subtitle }) {
  return (
    <div style={card({ padding: 18 })}>
      <div style={{ color: "#64748b", fontSize: 14 }}>{label}</div>
      <div style={{ color: "#0f172a", fontWeight: 900, fontSize: 30, marginTop: 6 }}>
        {value}
      </div>
      {subtitle ? (
        <div style={{ marginTop: 6, color: "#64748b", fontSize: 12 }}>{subtitle}</div>
      ) : null}
    </div>
  );
}

function DashboardCard({ title, children }) {
  return (
    <div style={card({ padding: 18, height: "100%" })}>
      <div style={{ fontWeight: 900, fontSize: 18, color: "#0f172a", marginBottom: 12 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function MiniRow({ left, right, color }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid #e2e8f0",
        gap: 10,
      }}
    >
      <div style={{ color: "#334155", fontWeight: 700 }}>{left}</div>
      <div style={{ color: color || "#0f172a", fontWeight: 900, textAlign: "right" }}>
        {right}
      </div>
    </div>
  );
}

function Chip({ children, outlined = false, style = {} }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "8px 12px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        background: outlined ? "white" : "#e2e8f0",
        border: outlined ? "1px solid #cbd5e1" : "1px solid transparent",
        color: "#0f172a",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

function StatusBadge({ status }) {
  const meta = statusMeta[status] || statusMeta.pending;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 12px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 900,
        background: meta.bg,
        color: meta.color,
      }}
    >
      <span>{meta.icon}</span>
      <span>{meta.label}</span>
    </span>
  );
}

function ProgressBar({ value }) {
  return (
    <div
      style={{
        width: "100%",
        height: 12,
        background: "#e2e8f0",
        borderRadius: 999,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${value}%`,
          height: "100%",
          background: "linear-gradient(90deg, #22c55e, #16a34a)",
          borderRadius: 999,
          transition: "width 0.2s ease",
        }}
      />
    </div>
  );
}

function Ribbon({ title, tone = "blue" }) {
  const backgrounds = {
    blue: "linear-gradient(90deg, #1d4ed8, #38bdf8)",
    orange: "linear-gradient(90deg, #d97706, #fb923c)",
    green: "linear-gradient(90deg, #15803d, #4ade80)",
    purple: "linear-gradient(90deg, #6d28d9, #a78bfa)",
  };

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        background: backgrounds[tone],
        color: "white",
        padding: "14px 22px",
        borderTopRightRadius: 999,
        borderBottomRightRadius: 999,
        fontWeight: 900,
        fontSize: 20,
        boxShadow: "0 10px 22px rgba(0,0,0,0.14)",
      }}
    >
      {title}
    </div>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.45)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        zIndex: 60,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={card({
          width: "100%",
          maxWidth: 860,
          padding: 24,
          maxHeight: "92vh",
          overflowY: "auto",
        })}
      >
        <h2 style={{ marginTop: 0, marginBottom: 18, fontSize: 28, color: "#0f172a" }}>
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}

function ConfirmModal({ open, onCancel, onConfirm, title, message }) {
  if (!open) return null;

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.45)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        zIndex: 70,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={card({ width: "100%", maxWidth: 520, padding: 24 })}
      >
        <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: 26, color: "#0f172a" }}>
          {title}
        </h2>
        <p style={{ marginTop: 0, color: "#475569", fontSize: 15 }}>{message}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  attendees,
  onDelete,
  onEdit,
  onProgressChange,
  onStatusChange,
  readOnly = false,
}) {
  const meta = statusMeta[task.status] || statusMeta.pending;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isOverdue =
    task.due_date &&
    task.status !== "completed" &&
    !Number.isNaN(new Date(task.due_date).getTime()) &&
    new Date(task.due_date) < today;

  return (
    <div
      style={card({
        padding: 20,
        border: isOverdue ? "2px solid #dc2626" : "1px solid #e2e8f0",
        background: isOverdue
          ? "linear-gradient(135deg, #fff1f2, #ffffff)"
          : "rgba(255,255,255,0.96)",
        boxShadow: isOverdue
          ? "0 16px 40px rgba(220,38,38,0.18)"
          : "0 16px 40px rgba(15,23,42,0.10)",
      })}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                display: "grid",
                placeItems: "center",
                background: meta.color,
                color: "white",
                fontWeight: 900,
                flexShrink: 0,
              }}
            >
              {meta.icon}
            </div>
            <div>
              <div style={{ fontSize: 22, color: "#0f172a", fontWeight: 900, lineHeight: 1.3 }}>
                {task.title}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                <Chip>Assigned: {task.owner || "Unassigned"}</Chip>
                <Chip outlined>Due: {task.due_date || "No due date"}</Chip>
                <StatusBadge status={task.status} />
                {isOverdue ? (
                  <Chip style={{ background: "#fee2e2", color: "#b91c1c" }}>Overdue</Chip>
                ) : null}
              </div>
              <div style={{ marginTop: 12, color: "#475569", fontSize: 14 }}>
                {task.notes || "No notes"}
              </div>
            </div>
          </div>
        </div>

        <div style={{ width: 420, minWidth: 280 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
              marginBottom: 8,
              color: "#475569",
            }}
          >
            <span>Progress</span>
            <span>{task.progress || 0}%</span>
          </div>
          <ProgressBar value={Number(task.progress) || 0} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
            {readOnly ? (
              <>
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #cbd5e1",
                    background: "#f8fafc",
                    fontWeight: 700,
                  }}
                >
                  {meta.label}
                </div>
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #cbd5e1",
                    background: "#f8fafc",
                    fontWeight: 700,
                  }}
                >
                  {task.owner || "Unassigned"}
                </div>
              </>
            ) : (
              <>
                <select
                  value={task.status}
                  onChange={(e) => onStatusChange(task.id, e.target.value)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #cbd5e1",
                    background: "white",
                  }}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {statusMeta[status].label}
                    </option>
                  ))}
                </select>

                <select
                  value={task.owner || ""}
                  onChange={(e) => onStatusChange(task.id, task.status, { owner: e.target.value })}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #cbd5e1",
                    background: "white",
                  }}
                >
                  {(attendees.length ? attendees : ["Unassigned"]).map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
            {readOnly ? (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  fontWeight: 800,
                }}
              >
                Previous meeting task
              </div>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={() =>
                    onProgressChange(task.id, Math.max(0, (Number(task.progress) || 0) - 10))
                  }
                >
                  -10%
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    onProgressChange(task.id, Math.min(100, (Number(task.progress) || 0) + 10))
                  }
                >
                  +10%
                </Button>
                <Button variant="warning" onClick={() => onEdit(task)}>
                  Edit
                </Button>
                <Button variant="danger" onClick={() => onDelete(task.id)}>
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [meetings, setMeetings] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showMeeting, setShowMeeting] = useState(false);
  const [showTask, setShowTask] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState(null);
  const [editingMeetingId, setEditingMeetingId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [filterOwner, setFilterOwner] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [meetingForm, setMeetingForm] = useState({
    title: "",
    conductedBy: "",
    dateRange: "",
    attendeesText: "",
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    owner: "",
    dueDate: "",
    notes: "",
    status: "pending",
    progress: 0,
  });

  useEffect(() => {
    loadMeetings();
  }, []);

  async function loadMeetings() {
    setLoading(true);

    const { data: meetingsData, error: meetingsError } = await supabase
      .from("meetings")
      .select("*")
      .order("created_at", { ascending: false });

    if (meetingsError) {
      console.error(meetingsError);
      setLoading(false);
      return;
    }

    const builtMeetings = [];

    for (const meeting of meetingsData || []) {
      const { data: linkedAttendees } = await supabase
        .from("meeting_attendees")
        .select("attendee_id, attendees(name)")
        .eq("meeting_id", meeting.id);

      const { data: taskRows } = await supabase
        .from("tasks")
        .select("*")
        .eq("meeting_id", meeting.id)
        .order("created_at", { ascending: false });

      builtMeetings.push({
        id: meeting.id,
        title: meeting.title,
        conductedBy: meeting.conducted_by,
        dateRange: meeting.date_range || "",
        attendees: (linkedAttendees || []).map((row) => row.attendees?.name).filter(Boolean),
        tasks: taskRows || [],
      });
    }

    setMeetings(builtMeetings);
    setActiveId((prev) => prev || builtMeetings[0]?.id || null);
    setLoading(false);
  }

  const activeMeeting = useMemo(
    () => meetings.find((m) => m.id === activeId) || null,
    [meetings, activeId]
  );

  const activeIndex = useMemo(
    () => meetings.findIndex((m) => m.id === activeId),
    [meetings, activeId]
  );

  const previousMeeting = activeIndex >= 0 ? meetings[activeIndex + 1] || null : null;

  const attendees = activeMeeting?.attendees || [];
  const rawTasks = activeMeeting?.tasks || [];
  const allTasks = useMemo(() => meetings.flatMap((m) => m.tasks || []), [meetings]);

  const tasks = useMemo(() => {
    return rawTasks.filter((task) => {
      const matchSearch = task.title.toLowerCase().includes(searchText.toLowerCase());
      const matchOwner = filterOwner ? task.owner === filterOwner : true;
      const matchStatus = filterStatus ? task.status === filterStatus : true;
      return matchSearch && matchOwner && matchStatus;
    });
  }, [rawTasks, searchText, filterOwner, filterStatus]);

  const groupedTasks = useMemo(
    () => ({
      started: tasks.filter((t) => t.status === "started"),
      inProgress: tasks.filter((t) => t.status === "in-progress"),
      pending: tasks.filter((t) => t.status === "pending"),
      completed: tasks.filter((t) => t.status === "completed"),
    }),
    [tasks]
  );

  const previousGrouped = useMemo(
    () => ({
      started: (previousMeeting?.tasks || []).filter((t) => t.status === "started"),
      inProgress: (previousMeeting?.tasks || []).filter((t) => t.status === "in-progress"),
      pending: (previousMeeting?.tasks || []).filter((t) => t.status === "pending"),
      completed: (previousMeeting?.tasks || []).filter((t) => t.status === "completed"),
    }),
    [previousMeeting]
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueTasks = useMemo(() => {
    return allTasks.filter((task) => {
      if (!task.due_date) return false;
      if (task.status === "completed") return false;
      const due = new Date(task.due_date);
      if (Number.isNaN(due.getTime())) return false;
      due.setHours(0, 0, 0, 0);
      return due < today;
    });
  }, [allTasks]);

  const attendeeStats = useMemo(() => {
    const map = {};

    for (const task of allTasks) {
      const owner = task.owner || "Unassigned";
      if (!map[owner]) {
        map[owner] = {
          owner,
          total: 0,
          completed: 0,
          progressSum: 0,
          overdue: 0,
        };
      }

      map[owner].total += 1;
      map[owner].progressSum += Number(task.progress) || 0;
      if (task.status === "completed") map[owner].completed += 1;

      if (task.due_date && task.status !== "completed") {
        const due = new Date(task.due_date);
        if (!Number.isNaN(due.getTime())) {
          due.setHours(0, 0, 0, 0);
          if (due < today) map[owner].overdue += 1;
        }
      }
    }

    return Object.values(map)
      .map((item) => ({
        ...item,
        averageProgress: item.total ? Math.round(item.progressSum / item.total) : 0,
        completionRate: item.total ? Math.round((item.completed / item.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [allTasks]);

  const topAssignee = attendeeStats[0] || null;

  const chartData = {
    labels: attendeeStats.map((item) => item.owner),
    datasets: [
      {
        label: "Tasks",
        data: attendeeStats.map((item) => item.total),
      },
      {
        label: "Completed",
        data: attendeeStats.map((item) => item.completed),
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
    },
  };

  const totalTasks = rawTasks.length;
  const completedCount = rawTasks.filter((t) => t.status === "completed").length;
  const avgProgress = totalTasks
    ? Math.round(rawTasks.reduce((sum, t) => sum + (Number(t.progress) || 0), 0) / totalTasks)
    : 0;

  const exportPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;

      const element = document.getElementById("mom-export-area");
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`MoM_${activeMeeting?.title || "Report"}.pdf`);
    } catch (error) {
      console.error(error);
      alert("PDF export failed. Make sure jspdf and html2canvas are installed.");
    }
  };

  const resetMeetingForm = () => {
    setMeetingForm({
      title: "",
      conductedBy: "",
      dateRange: "",
      attendeesText: "",
    });
    setEditingMeetingId(null);
  };

  const resetTaskForm = () => {
    setTaskForm({
      title: "",
      owner: "",
      dueDate: "",
      notes: "",
      status: "pending",
      progress: 0,
    });
    setEditingTaskId(null);
  };

  const openCreateMeeting = () => {
    resetMeetingForm();
    setShowMeeting(true);
  };

  const openEditMeeting = (meeting) => {
    setEditingMeetingId(meeting.id);
    setMeetingForm({
      title: meeting.title || "",
      conductedBy: meeting.conductedBy || "",
      dateRange: meeting.dateRange || "",
      attendeesText: (meeting.attendees || []).join(", "),
    });
    setShowMeeting(true);
  };

  async function ensureAttendees(attendeeNames) {
    const cleanNames = attendeeNames.map((a) => a.trim()).filter(Boolean);
    const attendeeIds = [];

    for (const name of cleanNames) {
      let { data: existing } = await supabase
        .from("attendees")
        .select("id,name")
        .eq("name", name)
        .maybeSingle();

      if (!existing) {
        const { data: inserted, error } = await supabase
          .from("attendees")
          .insert({ name })
          .select("id,name")
          .single();

        if (error) throw error;
        attendeeIds.push(inserted.id);
      } else {
        attendeeIds.push(existing.id);
      }
    }

    return attendeeIds;
  }

  async function replaceMeetingAttendees(meetingId, attendeeIds) {
    await supabase.from("meeting_attendees").delete().eq("meeting_id", meetingId);

    if (attendeeIds.length) {
      const rows = attendeeIds.map((attendeeId) => ({
        meeting_id: meetingId,
        attendee_id: attendeeId,
      }));
      const { error } = await supabase.from("meeting_attendees").insert(rows);
      if (error) throw error;
    }
  }

  const saveMeeting = async () => {
    const attendeesList = meetingForm.attendeesText
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    if (!meetingForm.title.trim() || !meetingForm.conductedBy.trim()) return;

    try {
      if (editingMeetingId) {
        const { error: updateError } = await supabase
          .from("meetings")
          .update({
            title: meetingForm.title,
            conducted_by: meetingForm.conductedBy,
            date_range: meetingForm.dateRange || "New Meeting",
          })
          .eq("id", editingMeetingId);

        if (updateError) throw updateError;

        const attendeeIds = await ensureAttendees(attendeesList);
        await replaceMeetingAttendees(editingMeetingId, attendeeIds);
      } else {
        const { data: insertedMeeting, error: insertError } = await supabase
          .from("meetings")
          .insert({
            title: meetingForm.title,
            conducted_by: meetingForm.conductedBy,
            date_range: meetingForm.dateRange || "New Meeting",
          })
          .select("*")
          .single();

        if (insertError) throw insertError;

        const attendeeIds = await ensureAttendees(attendeesList);
        await replaceMeetingAttendees(insertedMeeting.id, attendeeIds);

        const carrySource = meetings[0] || null;
        const carriedTasks = carrySource
          ? (carrySource.tasks || []).filter(
              (t) => t.status === "in-progress" || t.status === "pending"
            )
          : [];

        if (carriedTasks.length) {
          const rows = carriedTasks.map((t) => ({
            meeting_id: insertedMeeting.id,
            title: t.title,
            owner: t.owner || "Unassigned",
            due_date: t.due_date || "",
            notes: `${t.notes || ""}${t.notes ? " | " : ""}Carried Forward`.trim(),
            status: t.status,
            progress: t.progress || 0,
          }));
          const { error: taskInsertError } = await supabase.from("tasks").insert(rows);
          if (taskInsertError) throw taskInsertError;
        }

        setActiveId(insertedMeeting.id);
      }

      resetMeetingForm();
      setShowMeeting(false);
      await loadMeetings();
    } catch (error) {
      console.error(error);
      alert("Could not save meeting.");
    }
  };

  const openCreateTask = () => {
    resetTaskForm();
    setShowTask(true);
  };

  const openEditTask = (task) => {
    setEditingTaskId(task.id);
    setTaskForm({
      title: task.title || "",
      owner: task.owner || "",
      dueDate: task.due_date || "",
      notes: task.notes || "",
      status: task.status || "pending",
      progress: task.progress ?? 0,
    });
    setShowTask(true);
  };

  const saveTask = async () => {
    if (!taskForm.title.trim() || !activeMeeting) return;

    const status = taskForm.status;
    const derivedProgress =
      taskForm.progress !== "" && taskForm.progress !== null
        ? Number(taskForm.progress)
        : status === "completed"
        ? 100
        : status === "in-progress"
        ? 50
        : status === "started"
        ? 10
        : 0;

    try {
      if (editingTaskId) {
        const { error } = await supabase
          .from("tasks")
          .update({
            title: taskForm.title,
            owner: taskForm.owner || attendees[0] || "Unassigned",
            due_date: taskForm.dueDate || "No due date",
            notes: taskForm.notes || "",
            status,
            progress: derivedProgress,
          })
          .eq("id", editingTaskId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("tasks").insert({
          meeting_id: activeId,
          title: taskForm.title,
          owner: taskForm.owner || attendees[0] || "Unassigned",
          due_date: taskForm.dueDate || "No due date",
          notes: taskForm.notes || "",
          status,
          progress: derivedProgress,
        });

        if (error) throw error;
      }

      resetTaskForm();
      setShowTask(false);
      await loadMeetings();
    } catch (error) {
      console.error(error);
      alert("Could not save task.");
    }
  };

  const handleProgressChange = async (taskId, progress) => {
    let nextStatus = "pending";
    if (progress === 100) nextStatus = "completed";
    else if (progress > 30) nextStatus = "in-progress";
    else if (progress > 0) nextStatus = "started";

    const { error } = await supabase
      .from("tasks")
      .update({ progress, status: nextStatus })
      .eq("id", taskId);

    if (!error) loadMeetings();
  };

  const handleStatusChange = async (taskId, status, extra = {}) => {
    const task = rawTasks.find((t) => t.id === taskId);
    let nextProgress = Number(task?.progress) || 0;

    if (status === "pending") nextProgress = 0;
    if (status === "started" && nextProgress === 0) nextProgress = 10;
    if (status === "in-progress" && nextProgress < 40) nextProgress = 40;
    if (status === "completed") nextProgress = 100;

    const payload = {
      status,
      progress: nextProgress,
      ...extra,
    };

    const { error } = await supabase.from("tasks").update(payload).eq("id", taskId);
    if (!error) loadMeetings();
  };

  const handleDeleteTask = async (taskId) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (!error) loadMeetings();
  };

  const confirmDeleteMeeting = (meetingId) => {
    setMeetingToDelete(meetingId);
  };

  const deleteMeeting = async () => {
    if (!meetingToDelete) return;

    const { error } = await supabase.from("meetings").delete().eq("id", meetingToDelete);
    if (error) {
      console.error(error);
      alert("Could not delete meeting.");
      return;
    }

    setMeetingToDelete(null);
    await loadMeetings();
  };

  const renderTaskSection = (title, tone, items, options = {}) => (
    <div style={{ marginTop: 20 }}>
      <div style={{ marginBottom: 14 }}>
        <Ribbon title={title} tone={tone} />
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {items.length ? (
          items.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              attendees={options.attendees || attendees}
              onDelete={handleDeleteTask}
              onEdit={openEditTask}
              onProgressChange={handleProgressChange}
              onStatusChange={handleStatusChange}
              readOnly={options.readOnly}
            />
          ))
        ) : (
          <div
            style={card({
              padding: 28,
              border: "1px dashed #cbd5e1",
              textAlign: "center",
              color: "#64748b",
            })}
          >
            No tasks in this section.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      id="mom-export-area"
      style={{
        minHeight: "100vh",
        padding: 16,
        background: "linear-gradient(135deg, #dbeafe 0%, #ffffff 45%, #dbeafe 100%)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div
          style={{
            overflow: "hidden",
            borderRadius: 30,
            border: "1px solid #bfdbfe",
            background: "white",
            boxShadow: "0 24px 60px rgba(15,23,42,0.15)",
          }}
        >
          <div
            style={{
              background: "linear-gradient(90deg, #075985, #2563eb)",
              padding: "30px 18px",
              textAlign: "center",
              color: "white",
            }}
          >
            <h1 style={{ margin: 0, fontSize: 44, fontWeight: 900, letterSpacing: 1 }}>
              <span>MoM — </span>
              <span style={{ color: "#fde68a" }}>WORK UPDATE</span>
            </h1>
          </div>

          <div style={{ padding: 20 }}>
            <div style={card({ padding: 16, marginBottom: 18, border: "1px solid #dbeafe" })}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {meetings.map((meeting) => (
                    <div key={meeting.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button
                        onClick={() => setActiveId(meeting.id)}
                        style={{
                          border: meeting.id === activeId ? "none" : "1px solid #cbd5e1",
                          background:
                            meeting.id === activeId
                              ? "linear-gradient(90deg, #1d4ed8, #38bdf8)"
                              : "white",
                          color: meeting.id === activeId ? "white" : "#1e293b",
                          borderRadius: 999,
                          padding: "10px 16px",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        {meeting.title}
                      </button>

                      <button
                        onClick={() => openEditMeeting(meeting)}
                        title="Edit meeting"
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 999,
                          border: "none",
                          background: "#f59e0b",
                          color: "white",
                          fontWeight: 900,
                          cursor: "pointer",
                        }}
                      >
                        ✎
                      </button>

                      <button
                        onClick={() => confirmDeleteMeeting(meeting.id)}
                        title="Delete meeting"
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 999,
                          border: "none",
                          background: "#dc2626",
                          color: "white",
                          fontWeight: 900,
                          cursor: "pointer",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <Button onClick={openCreateMeeting} disabled={loading}>
                    + New Meeting
                  </Button>
                  <Button variant="secondary" onClick={exportPDF} disabled={!activeMeeting}>
                    Export PDF
                  </Button>
                </div>
              </div>
            </div>

            {loading ? (
              <div style={card({ padding: 40, textAlign: "center", color: "#64748b" })}>
                Loading cloud data...
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                    gap: 16,
                    marginBottom: 20,
                  }}
                >
                  <StatCard label="All Cloud Meetings" value={meetings.length} />
                  <StatCard label="All Tasks" value={allTasks.length} />
                  <StatCard
                    label="Overdue Tasks"
                    value={overdueTasks.length}
                    subtitle="Incomplete + past due date"
                  />
                  <StatCard
                    label="Top Assignee"
                    value={topAssignee ? topAssignee.owner : "—"}
                    subtitle={topAssignee ? `${topAssignee.total} tasks assigned` : "No task data yet"}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1fr 1fr",
                    gap: 16,
                    marginBottom: 24,
                  }}
                >
                  <DashboardCard title="Who Has Most Tasks">
                    {attendeeStats.length ? (
                      attendeeStats.slice(0, 6).map((item) => (
                        <MiniRow
                          key={item.owner}
                          left={item.owner}
                          right={`${item.total} tasks`}
                          color="#2563eb"
                        />
                      ))
                    ) : (
                      <div style={{ color: "#64748b" }}>No task data yet.</div>
                    )}
                  </DashboardCard>

                  <DashboardCard title="Overdue Tasks">
                    {overdueTasks.length ? (
                      overdueTasks.slice(0, 6).map((task) => (
                        <MiniRow
                          key={task.id}
                          left={task.title}
                          right={task.owner || "Unassigned"}
                          color="#dc2626"
                        />
                      ))
                    ) : (
                      <div style={{ color: "#15803d", fontWeight: 800 }}>No overdue tasks</div>
                    )}
                  </DashboardCard>

                  <DashboardCard title="Team Performance">
                    {attendeeStats.length ? (
                      attendeeStats.slice(0, 6).map((item) => (
                        <MiniRow
                          key={item.owner}
                          left={item.owner}
                          right={`${item.completionRate}% complete / ${item.averageProgress}% avg`}
                          color="#16a34a"
                        />
                      ))
                    ) : (
                      <div style={{ color: "#64748b" }}>No performance data yet.</div>
                    )}
                  </DashboardCard>
                </div>

                <div style={card({ padding: 20, marginBottom: 24 })}>
                  <div style={{ fontWeight: 900, fontSize: 20, color: "#0f172a", marginBottom: 14 }}>
                    Task Analytics
                  </div>
                  <Bar data={chartData} options={chartOptions} />
                </div>

                {activeMeeting ? (
                  <>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(0, 1.6fr) minmax(280px, 0.9fr)",
                        gap: 16,
                        marginBottom: 24,
                      }}
                    >
                      <div style={card({ padding: 20, background: "linear-gradient(135deg, #ffffff, #eff6ff)" })}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                            flexWrap: "wrap",
                            marginBottom: 16,
                          }}
                        >
                          <Ribbon title="Meeting Details" tone="blue" />
                          <Button variant="warning" onClick={() => openEditMeeting(activeMeeting)}>
                            Edit Meeting
                          </Button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                          <InputField
                            label="Conducted by"
                            value={activeMeeting.conductedBy || ""}
                            onChange={() => {}}
                          />
                          <InputField
                            label="Meeting Title"
                            value={activeMeeting.title || ""}
                            onChange={() => {}}
                          />
                          <InputField
                            label="Date range"
                            value={activeMeeting.dateRange || ""}
                            onChange={() => {}}
                          />
                          <TextareaField
                            label="Attendees"
                            value={(activeMeeting.attendees || []).join(", ")}
                            onChange={() => {}}
                            rows={3}
                          />
                        </div>

                        <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {(activeMeeting.attendees || []).map((person) => (
                            <Chip key={person}>{person}</Chip>
                          ))}
                        </div>

                        <div style={{ marginTop: 14 }}>
                          <Button variant="danger" onClick={() => confirmDeleteMeeting(activeMeeting.id)}>
                            Delete Meeting
                          </Button>
                        </div>
                      </div>

                      <div
                        style={card({
                          padding: 20,
                          background: "linear-gradient(135deg, #eff6ff, #ffffff)",
                          display: "grid",
                          gap: 12,
                        })}
                      >
                        <StatCard label="Meeting Tasks" value={totalTasks} />
                        <StatCard label="Average Progress" value={`${avgProgress}%`} />
                        <StatCard label="Completed" value={completedCount} />
                      </div>
                    </div>

                    <div style={{ display: "grid", gap: 12, marginBottom: 18 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 16,
                          flexWrap: "wrap",
                        }}
                      >
                        <Ribbon title="Assign New Tasks" tone="blue" />
                        <Button onClick={openCreateTask}>+ Add Task To This Meeting</Button>
                      </div>

                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <input
                          placeholder="Search task..."
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          style={{
                            padding: "10px 12px",
                            borderRadius: 10,
                            border: "1px solid #cbd5e1",
                            minWidth: 220,
                          }}
                        />

                        <select
                          value={filterOwner}
                          onChange={(e) => setFilterOwner(e.target.value)}
                          style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1" }}
                        >
                          <option value="">All Attendees</option>
                          {[...new Set(rawTasks.map((t) => t.owner).filter(Boolean))].map((a) => (
                            <option key={a} value={a}>
                              {a}
                            </option>
                          ))}
                        </select>

                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1" }}
                        >
                          <option value="">All Status</option>
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>

                        <Button
                          variant="secondary"
                          onClick={() => {
                            setSearchText("");
                            setFilterOwner("");
                            setFilterStatus("");
                          }}
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </div>

                    {previousMeeting ? (
                      <div
                        style={{
                          marginTop: 10,
                          marginBottom: 28,
                          padding: 16,
                          borderRadius: 24,
                          background: "linear-gradient(135deg, #f8fafc, #eff6ff)",
                          border: "1px solid #dbeafe",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                            flexWrap: "wrap",
                            marginBottom: 8,
                          }}
                        >
                          <Ribbon title={`Previous Meeting Tasks — ${previousMeeting.title}`} tone="purple" />
                          <div style={{ color: "#475569", fontWeight: 700 }}>
                            Showing last meeting task status
                          </div>
                        </div>

                        {renderTaskSection("Last Meeting Started Tasks", "purple", previousGrouped.started, {
                          readOnly: true,
                          attendees: previousMeeting.attendees || ["Unassigned"],
                        })}
                        {renderTaskSection("Last Meeting In Progress Tasks", "blue", previousGrouped.inProgress, {
                          readOnly: true,
                          attendees: previousMeeting.attendees || ["Unassigned"],
                        })}
                        {renderTaskSection("Last Meeting Pending Tasks", "orange", previousGrouped.pending, {
                          readOnly: true,
                          attendees: previousMeeting.attendees || ["Unassigned"],
                        })}
                        {renderTaskSection("Last Meeting Completed Tasks", "green", previousGrouped.completed, {
                          readOnly: true,
                          attendees: previousMeeting.attendees || ["Unassigned"],
                        })}
                      </div>
                    ) : null}

                    {renderTaskSection("Started Tasks", "purple", groupedTasks.started)}
                    {renderTaskSection("In Progress Tasks", "blue", groupedTasks.inProgress)}
                    {renderTaskSection("Pending Tasks", "orange", groupedTasks.pending)}
                    {renderTaskSection("Completed Tasks", "green", groupedTasks.completed)}
                  </>
                ) : (
                  <div style={card({ padding: 40, textAlign: "center", color: "#64748b" })}>
                    No cloud meetings yet. Click <strong>+ New Meeting</strong> to create your first MoM.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={showMeeting}
        onClose={() => {
          setShowMeeting(false);
          resetMeetingForm();
        }}
        title={editingMeetingId ? "Edit Meeting" : "Create New Meeting"}
      >
        <div style={{ display: "grid", gap: 14 }}>
          <InputField
            label="Meeting Title"
            value={meetingForm.title}
            onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
            placeholder="Weekly Product Review"
          />
          <InputField
            label="Conducted by"
            value={meetingForm.conductedBy}
            onChange={(e) => setMeetingForm({ ...meetingForm, conductedBy: e.target.value })}
            placeholder="Manager or Team Lead"
          />
          <InputField
            label="Date range"
            value={meetingForm.dateRange}
            onChange={(e) => setMeetingForm({ ...meetingForm, dateRange: e.target.value })}
            placeholder="01 Apr – 07 Apr, 2026"
          />
          <TextareaField
            label="Attendees Names"
            value={meetingForm.attendeesText}
            onChange={(e) => setMeetingForm({ ...meetingForm, attendeesText: e.target.value })}
            placeholder="Enter attendees separated by commas"
            rows={4}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button
              variant="secondary"
              onClick={() => {
                setShowMeeting(false);
                resetMeetingForm();
              }}
            >
              Cancel
            </Button>
            <Button variant="success" onClick={saveMeeting}>
              {editingMeetingId ? "Save Meeting" : "Create Meeting"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showTask}
        onClose={() => {
          setShowTask(false);
          resetTaskForm();
        }}
        title={editingTaskId ? "Edit Task" : "Assign Task In Current Meeting"}
      >
        <div style={{ display: "grid", gap: 14 }}>
          <InputField
            label="Task title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            placeholder="Enter task name"
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <SelectField
              label="Assign to attendee"
              value={taskForm.owner}
              onChange={(e) => setTaskForm({ ...taskForm, owner: e.target.value })}
            >
              <option value="">Select attendee</option>
              {(attendees.length ? attendees : ["Unassigned"]).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </SelectField>

            <InputField
              label="Due date"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              placeholder="2026-04-05"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <SelectField
              label="Status"
              value={taskForm.status}
              onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {statusMeta[status].label}
                </option>
              ))}
            </SelectField>

            <InputField
              label="Progress %"
              type="number"
              value={taskForm.progress}
              onChange={(e) => setTaskForm({ ...taskForm, progress: e.target.value })}
              placeholder="0 to 100"
            />
          </div>

          <TextareaField
            label="Notes"
            value={taskForm.notes}
            onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
            rows={4}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button
              variant="secondary"
              onClick={() => {
                setShowTask(false);
                resetTaskForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveTask}>
              {editingTaskId ? "Save Task" : "Assign Task"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!meetingToDelete}
        onCancel={() => setMeetingToDelete(null)}
        onConfirm={deleteMeeting}
        title="Delete Meeting"
        message="Are you sure you want to delete this meeting? This action cannot be undone."
      />
    </div>
  );
}