import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Calendar,
  MapPin,
  Tag,
  Eye,
  ArrowRight,
  Camera,
  X,
  SlidersHorizontal,
  History as HistoryIcon,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { sortReportsNewestFirst } from '../../utils/dateFormat';

export default function TechnicianHistory() {
  const { completedTasks } = useTasks();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('ALL');
  const [selectedImageModal, setSelectedImageModal] = useState(null);

  // Dynamically extract unique completion dates from completed tasks
  const availableDates = useMemo(() => {
    const dates = new Set();
    completedTasks.forEach((item) => {
      if (item.completionDay) dates.add(item.completionDay);
    });
    return Array.from(dates).sort().reverse();
  }, [completedTasks]);

  // Filter calculation (terurut terbaru di atas berdasarkan tanggal pembuatan laporan)
  const filteredRepairs = useMemo(() => {
    return sortReportsNewestFirst(completedTasks).filter((item) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.id.toLowerCase().includes(query) ||
        item.title.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        (item.reporterName && item.reporterName.toLowerCase().includes(query)) ||
        (item.repairNotes && item.repairNotes.toLowerCase().includes(query));

      const matchesCategory =
        selectedCategory === 'ALL' || item.category === selectedCategory;

      const matchesDate =
        selectedDate === 'ALL' || item.completionDay === selectedDate;

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [completedTasks, searchQuery, selectedCategory, selectedDate]);

  // Priority Badge Renderer
  const renderPriorityBadge = (priority) => {
    switch (priority) {
      case 'Critical':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-1.5"></span>
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

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedDate('ALL');
  };

  const isFiltered =
    searchQuery || selectedCategory !== 'ALL' || selectedDate !== 'ALL';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
              Modul Teknisi
            </span>
            <span className="text-xs text-slate-400">• Arsip Selesai</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Riwayat Perbaikan Fasilitas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Arsip seluruh pekerjaan perbaikan fasilitas kampus yang telah Anda selesaikan dan diverifikasi.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-600 bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-sm shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Total Selesai: <strong>{completedTasks.length}</strong> pekerjaan</span>
        </div>
      </div>

      {/* Metric Highlights Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Total Tugas Selesai</p>
            <p className="text-lg font-bold text-slate-900">{completedTasks.length} Tugas</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Dengan Bukti Foto</p>
            <p className="text-lg font-bold text-slate-900">
              {completedTasks.filter((r) => r.evidencePhoto).length} Pekerjaan
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Rata-rata Penanganan</p>
            <p className="text-lg font-bold text-slate-900">~1.5 Jam</p>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
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
              placeholder="Cari riwayat berdasarkan ID, judul perbaikan, lokasi, atau catatan..."
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

          {/* Category Filter */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Tag className="w-3.5 h-3.5" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-9 pr-8 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Furniture">Furniture</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Electronics">Electronics</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </div>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-9 pr-8 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-all"
              >
                <option value="ALL">Semua Tanggal</option>
                {availableDates.map((dateStr) => {
                  const parts = dateStr.split('-');
                  const monthNames = [
                    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
                    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
                  ];
                  const label =
                    parts.length === 3
                      ? `${parseInt(parts[2], 10)} ${monthNames[parseInt(parts[1], 10) - 1]} ${parts[0]}`
                      : dateStr;
                  return (
                    <option key={dateStr} value={dateStr}>
                      {label}
                    </option>
                  );
                })}
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

      {/* Completed Tasks List */}
      {filteredRepairs.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-4">
            <HistoryIcon className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Tidak ada riwayat perbaikan ditemukan
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Tidak ada arsip tugas selesai yang cocok dengan kriteria pencarian atau filter yang Anda pilih.
          </p>
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all cursor-pointer shadow-sm"
            >
              <span>Hapus Filter Pencarian</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRepairs.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group"
            >
              <div className="flex flex-col lg:flex-row gap-5">
                {/* Left/Middle Content */}
                <div className="flex-1 space-y-2.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      {item.id}
                    </span>

                    <span className="inline-flex items-center text-xs text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                      <Tag className="w-3 h-3 mr-1 text-slate-400" />
                      {item.category}
                    </span>

                    {renderPriorityBadge(item.priority)}

                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                      Selesai Dikerjakan
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {item.title}
                  </h2>

                  <p className="text-xs text-slate-600 flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Lokasi: <strong className="text-slate-800">{item.location}</strong></span>
                  </p>

                  {/* Technician Notes Box */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-700 space-y-1">
                    <p className="font-bold text-slate-800 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Catatan Pengerjaan Teknisi:</span>
                    </p>
                    <p className="italic text-slate-600 leading-relaxed">
                      "{item.repairNotes || 'Tidak ada catatan pengerjaan tambahan.'}"
                    </p>
                  </div>

                  {/* Footer Meta */}
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 pt-1 text-xs text-slate-400">
                    <span className="flex items-center space-x-1 text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Selesai: <strong className="text-slate-700">{item.completedDate || '-'}</strong></span>
                    </span>
                    <span className="flex items-center space-x-1 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Durasi pengerjaan: {item.duration || '-'}</span>
                    </span>
                    <span>Pelapor: {item.reporterName}</span>
                  </div>
                </div>

                {/* Right: Evidence Photo Thumbnail & Link */}
                <div className="flex flex-col sm:flex-row lg:flex-col justify-between items-start sm:items-center lg:items-end gap-3 shrink-0 lg:w-48 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  {item.evidencePhoto ? (
                    <div className="relative group/img rounded-xl overflow-hidden border border-slate-200 bg-slate-100 w-full sm:w-36 lg:w-full h-28 cursor-pointer shadow-xs">
                      <img
                        src={item.evidencePhoto}
                        alt="Foto Bukti Perbaikan"
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform"
                        onClick={() => setSelectedImageModal(item.evidencePhoto)}
                      />
                      <div
                        onClick={() => setSelectedImageModal(item.evidencePhoto)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-semibold space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Perbesar Foto</span>
                      </div>
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/60 text-white text-[9px] font-medium backdrop-blur-xs">
                        Bukti Perbaikan
                      </span>
                    </div>
                  ) : (
                    <div className="w-full sm:w-36 lg:w-full h-24 rounded-xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center p-2 text-center text-slate-400">
                      <Camera className="w-5 h-5 mb-1 text-slate-300" />
                      <span className="text-[10px] font-medium text-slate-400">Foto bukti belum tersedia</span>
                    </div>
                  )}

                  <Link
                    to={`/technician/tasks/${item.id}`}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 transition-all w-full sm:w-auto lg:w-full justify-center"
                  >
                    <span>Detail Lengkap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Zoom Modal */}
      {selectedImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedImageModal(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between text-white">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Foto Bukti Hasil Perbaikan Fasilitas</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedImageModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Tutup foto"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 bg-black flex items-center justify-center max-h-[75vh]">
              <img
                src={selectedImageModal}
                alt="Foto Bukti Zoom"
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
