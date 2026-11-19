import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  ClipboardList,
  Clock,
  CheckCircle2,
  MapPin,
  Calendar,
  Tag,
  ArrowRight,
  Eye,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { sortReportsNewestFirst } from '../../utils/dateFormat';

export default function TechnicianTasks() {
  const { tasks } = useTasks();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');

  // Filter calculation (terurut terbaru di atas)
  const filteredTasks = useMemo(() => {
    return sortReportsNewestFirst(tasks).filter((task) => {
      // Search match
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        task.id.toLowerCase().includes(query) ||
        task.title.toLowerCase().includes(query) ||
        task.location.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query) ||
        task.reporterName.toLowerCase().includes(query);

      // Status match
      const matchesStatus =
        selectedStatus === 'ALL' || task.status === selectedStatus;

      // Priority match
      const matchesPriority =
        selectedPriority === 'ALL' || task.priority === selectedPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, selectedStatus, selectedPriority]);

  // Statistics for quick status tabs
  const statusCounts = useMemo(() => {
    return {
      ALL: tasks.length,
      Assigned: tasks.filter((t) => t.status === 'Assigned').length,
      'In Progress': tasks.filter((t) => t.status === 'In Progress').length,
      Completed: tasks.filter((t) => t.status === 'Completed').length,
    };
  }, [tasks]);

  // Priority Badge Renderer
  const renderPriorityBadge = (priority) => {
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

  // Status Badge Renderer
  const renderStatusBadge = (status) => {
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

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedPriority('ALL');
  };

  const isFiltered = searchQuery || selectedStatus !== 'ALL' || selectedPriority !== 'ALL';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Daftar Tugas Perbaikan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola dan perbarui seluruh laporan kerusakan fasilitas kampus yang ditugaskan kepada Anda.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm shrink-0">
          <ClipboardList className="w-4 h-4 text-indigo-600" />
          <span>Menampilkan <strong>{filteredTasks.length}</strong> dari <strong>{tasks.length}</strong> tugas</span>
        </div>
      </div>

      {/* Status Quick Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'ALL', label: 'Semua Tugas' },
          { key: 'Assigned', label: 'Menunggu Pengerjaan' },
          { key: 'In Progress', label: 'Sedang Dikerjakan' },
          { key: 'Completed', label: 'Telah Selesai' },
        ].map((tab) => {
          const isActive = selectedStatus === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedStatus(tab.key)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-2 ring-indigo-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? 'bg-white/25 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {statusCounts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan ID laporan, judul, lokasi, atau kategori..."
              className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Priority Dropdown */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </div>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="pl-9 pr-8 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all"
              >
                <option value="ALL">Semua Prioritas</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Reset Filter Button */}
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center space-x-1 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-4">
            <Filter className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Tidak ada tugas ditemukan</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Tidak ada tugas yang cocok dengan kata kunci pencarian atau kombinasi filter status dan prioritas saat ini.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all cursor-pointer shadow-sm"
          >
            <span>Hapus Semua Filter</span>
          </button>
        </div>
      ) : (
        /* Task Cards Grid */
        <div className="space-y-3.5">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Left Section: Info */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                      {task.id}
                    </span>

                    <span className="inline-flex items-center text-xs text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                      <Tag className="w-3 h-3 mr-1 text-slate-400" />
                      {task.category}
                    </span>

                    {renderPriorityBadge(task.priority)}
                    {renderStatusBadge(task.status)}
                  </div>

                  <h2 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {task.title}
                  </h2>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    {task.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 pt-1 text-xs text-slate-500">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <strong className="text-slate-700">{task.location}</strong>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{task.reportedDate}</span>
                    </span>
                    <span className="text-slate-400">
                      Pelapor: <span className="text-slate-600">{task.reporterName}</span>
                    </span>
                  </div>
                </div>

                {/* Right Section: Action Button */}
                <div className="flex items-center lg:flex-col lg:items-end justify-between border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 gap-2 shrink-0">
                  <Link
                    to={`/technician/tasks/${task.id}`}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-600/20 group-hover:bg-indigo-600"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Lihat Detail</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
