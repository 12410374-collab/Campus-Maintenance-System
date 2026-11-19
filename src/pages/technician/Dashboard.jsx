import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ClipboardList,
  MapPin,
  Calendar,
  ArrowUpRight,
  Activity,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import { compareReportsNewestFirst, parseWitaTimestampMs } from '../../utils/dateFormat';

export default function TechnicianDashboard() {
  const { user } = useAuth();
  const { tasks } = useTasks();

  // Dynamic statistics calculated from TaskContext
  const stats = useMemo(() => {
    return {
      totalTasks: tasks.length,
      pendingTasks: tasks.filter((t) => t.status === 'Assigned').length,
      inProgressTasks: tasks.filter((t) => t.status === 'In Progress').length,
      completedTasks: tasks.filter((t) => t.status === 'Completed').length,
    };
  }, [tasks]);

  // Find any active critical task
  const criticalTask = useMemo(() => {
    return tasks.find((t) => t.priority === 'Critical' && t.status !== 'Completed');
  }, [tasks]);

  // Derived 5 recent tasks (terurut terbaru di atas)
  const recentTasks = useMemo(() => {
    return [...tasks].sort(compareReportsNewestFirst).slice(0, 5);
  }, [tasks]);

  // Derived recent activity feed from task update history
  const recentActivities = useMemo(() => {
    const list = [];
    tasks.forEach((t) => {
      (t.updates || []).forEach((u) => {
        list.push({
          id: u.id || `${t.id}-${u.timestamp}`,
          taskId: t.id,
          title: t.title,
          action:
            u.status === 'Completed'
              ? 'Menyelesaikan perbaikan & upload bukti foto'
              : u.status === 'In Progress'
              ? 'Memperbarui status pengerjaan'
              : 'Penugasan diterima',
          newStatus: u.status,
          timestamp: u.timestamp,
          notes: u.notes,
        });
      });
    });
    return list
      .sort((a, b) => parseWitaTimestampMs(b.timestamp) - parseWitaTimestampMs(a.timestamp))
      .slice(0, 5);
  }, [tasks]);

  // Helper for priority badges
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Critical':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-1.5 animate-pulse"></span>
            Critical
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            Medium
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            Low
          </span>
        );
    }
  };

  // Helper for status badges
  const getStatusBadge = (status) => {
    switch (status) {
      case 'In Progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Clock className="w-3 h-3 mr-1 text-indigo-600" />
            In Progress
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
            Completed
          </span>
        );
      case 'Assigned':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
            <ClipboardList className="w-3 h-3 mr-1 text-sky-600" />
            Assigned
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-medium">
              <Wrench className="w-3.5 h-3.5 text-indigo-400" />
              <span>Divisi Pemeliharaan Fasilitas UNKLAB</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Selamat Bertugas, {user?.name || 'Rudi Hartono'}!
            </h1>
            <p className="text-sm text-indigo-200/80 max-w-2xl">
              Pantau laporan kerusakan kampus yang ditugaskan, perbarui status pekerjaan, dan unggah bukti perbaikan secara berkala.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Link
              to="/technician/tasks"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all shadow-lg shadow-indigo-600/30"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Lihat Semua Tugas</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Critical Task Alert Banner (if any critical tasks in progress/assigned) */}
      {criticalTask && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-start justify-between gap-3 shadow-sm">
          <div className="flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-rose-900">Perhatian: Ada Tugas Prioritas Kritis (Critical)</p>
              <p className="text-xs text-rose-700 mt-0.5">
                {criticalTask.id}: {criticalTask.title} di {criticalTask.location} memerlukan penanganan segera untuk mencegah kerusakan fatal.
              </p>
            </div>
          </div>
          <Link
            to={`/technician/tasks/${criticalTask.id}`}
            className="text-xs font-bold text-rose-800 hover:text-rose-950 underline shrink-0 mt-0.5"
          >
            Tangani Sekarang
          </Link>
        </div>
      )}

      {/* 4 Key Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Tasks */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Tugas
            </p>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats.totalTasks}
            </span>
            <span className="text-xs text-slate-500">laporan ditugaskan</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Seluruh tugas perbaikan akun teknisi ini</p>
        </div>

        {/* Waiting to Start (Assigned) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">
              Menunggu Pengerjaan
            </p>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-sky-900">
              {stats.pendingTasks}
            </span>
            <span className="text-xs text-sky-600 font-medium">status Assigned</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Belum dimulai / menunggu giliran kerja</p>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
              Sedang Dikerjakan
            </p>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-indigo-900">
              {stats.inProgressTasks}
            </span>
            <span className="text-xs text-indigo-600 font-medium">In Progress</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Dalam proses perbaikan di lapangan</p>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Telah Selesai
            </p>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-900">
              {stats.completedTasks}
            </span>
            <span className="text-xs text-emerald-600 font-medium">Completed</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Perbaikan selesai dan bukti telah diunggah</p>
        </div>
      </div>

      {/* Main Grid: Latest Tasks & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Tasks Table / List (2 Columns wide on lg) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Tugas Terbaru</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar tugas perawatan fasilitas yang ditugaskan kepada Anda
              </p>
            </div>
            <Link
              to="/technician/tasks"
              className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <span>Kelola Semua</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {recentTasks.map((task) => (
              <Link
                key={task.id}
                to={`/technician/tasks/${task.id}`}
                className="block p-4 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-sm bg-slate-50/40 hover:bg-white transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {task.id}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      • {task.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getPriorityBadge(task.priority)}
                    {getStatusBadge(task.status)}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {task.title}
                </h3>

                <p className="text-xs text-slate-600 mt-1 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{task.location}</span>
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-500 gap-1.5">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Dilaporkan: {task.reportedDate}</span>
                  </div>
                  <span className="text-slate-400 truncate">
                    Pelapor: {task.reporterName}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-5 text-center">
            <Link
              to="/technician/tasks"
              className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 p-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <span>Buka modul Tugas untuk filter status, catatan, dan upload bukti</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Activity Feed (1 Column wide on lg) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Aktivitas Teknisi</h2>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Log Terbaru</span>
          </div>

          <div className="flex-1 space-y-4">
            {recentActivities.map((act, idx) => (
              <div key={act.id} className="relative pl-6 pb-4 last:pb-0">
                {/* Timeline vertical line */}
                {idx !== recentActivities.length - 1 && (
                  <span
                    className="absolute left-2.5 top-5 -bottom-1 w-0.5 bg-slate-200"
                    aria-hidden="true"
                  ></span>
                )}

                {/* Timeline dot */}
                <span className="absolute left-1 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-indigo-600"></span>

                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
                    <span className="font-mono font-semibold text-slate-700">
                      {act.taskId}
                    </span>
                    <span>{act.timestamp}</span>
                  </div>

                  <p className="text-xs font-bold text-slate-800 leading-snug">
                    {act.title}
                  </p>

                  <p className="text-[11px] text-indigo-700 font-medium mt-0.5">
                    {act.action}
                  </p>

                  <div className="mt-1 p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 italic">
                    "{act.notes}"
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Technician Info Box in Activity Footer */}
          <div className="mt-5 pt-4 border-t border-slate-100 bg-slate-50/70 -mx-5 -mb-5 p-4 rounded-b-2xl text-xs text-slate-600">
            <p className="font-bold text-slate-800">Spesialisasi Teknisi:</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {user?.specialization || 'Electrical & AC Specialist'} — Melayani gedung perkuliahan, laboratorium, asrama, dan fasilitas umum UNKLAB.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
