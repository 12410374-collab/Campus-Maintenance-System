import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Wrench,
  UserX,
  UserPlus,
  Search,
  X,
  ArrowLeft,
  ArrowUpDown,
  Phone,
  Eye,
  Pencil,
  CheckCircle2,
  RotateCcw,
  Filter,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import {
  TECHNICIAN_AVAILABILITY_OPTIONS,
  getWorkloadMetrics,
} from '../../data/mockTechnicians';
import {
  TechnicianFormModal,
  TechnicianDetailModal,
} from '../../components/admin/TechnicianModals';

const AVAILABILITY_LABELS = {
  Available: 'Tersedia',
  'On Duty': 'Sedang Bertugas',
  Unavailable: 'Tidak Tersedia',
};

function getAvailabilityBadge(status) {
  switch (status) {
    case 'Available':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'On Duty':
      return 'bg-cyan-50 text-cyan-800 border-cyan-200';
    case 'Unavailable':
    default:
      return 'bg-slate-100 text-slate-600 border-slate-300';
  }
}

export default function AdminTechnicians() {
  const { technicians, addTechnician, updateTechnician } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('name-asc');

  // Modal states
  const [formModalState, setFormModalState] = useState(null); // { mode: 'add' | 'edit', technician?: Object }
  const [detailTechnician, setDetailTechnician] = useState(null);
  const [feedback, setFeedback] = useState('');

  // Overview counts konsisten 100% dengan state teknisi
  const overview = useMemo(() => {
    return {
      total: technicians.length,
      available: technicians.filter((t) => t.availability === 'Available').length,
      onDuty: technicians.filter((t) => t.availability === 'On Duty').length,
      unavailable: technicians.filter((t) => t.availability === 'Unavailable').length,
    };
  }, [technicians]);

  // Daftar spesialisasi unik untuk dropdown filter
  const specializationOptions = useMemo(() => {
    return Array.from(new Set(technicians.map((t) => t.specialization))).sort();
  }, [technicians]);

  // Filtering & Sorting
  const visibleTechnicians = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = technicians.filter((tech) => {
      const matchesSearch =
        !q ||
        tech.name.toLowerCase().includes(q) ||
        tech.id.toLowerCase().includes(q);

      const matchesSpec =
        specializationFilter === 'ALL' || tech.specialization === specializationFilter;

      const matchesAvailability =
        availabilityFilter === 'ALL' || tech.availability === availabilityFilter;

      return matchesSearch && matchesSpec && matchesAvailability;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'active-desc':
          return b.activeTasks - a.activeTasks;
        case 'active-asc':
          return a.activeTasks - b.activeTasks;
        case 'name-asc':
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [technicians, searchQuery, specializationFilter, availabilityFilter, sortBy]);

  const hasActiveFilter =
    Boolean(searchQuery.trim()) ||
    specializationFilter !== 'ALL' ||
    availabilityFilter !== 'ALL' ||
    sortBy !== 'name-asc';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSpecializationFilter('ALL');
    setAvailabilityFilter('ALL');
    setSortBy('name-asc');
  };

  const handleSaveTechnician = async (payload) => {
    const isEdit = formModalState?.mode === 'edit';
    const result = isEdit
      ? await updateTechnician(payload)
      : await addTechnician(payload);

    if (!result?.success) {
      setFeedback(
        result?.message || 'Gagal menyimpan data teknisi ke server backend.'
      );
      setFormModalState(null);
      return;
    }

    setFeedback(
      result.message ||
        (isEdit
          ? `Data teknisi ${payload.name} (${payload.id}) berhasil diperbarui.`
          : `Teknisi ${payload.name} (${payload.id}) berhasil ditambahkan.`)
    );
    setFormModalState(null);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. COMMAND HEADER BAR */}
      <section className="relative overflow-hidden rounded-3xl bg-[#080D1B] border border-cyan-500/25 text-[#F8FAFC] p-5 sm:p-6 shadow-xl">
        <div
          className="absolute -top-20 -right-16 w-60 h-60 rounded-full bg-[#06B6D4]/20 blur-[95px] pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-widest text-[#06B6D4]">
              <Users className="w-3.5 h-3.5" />
              <span>PENGELOLAAN PERSONEL • DAFTAR TEKNISI</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Manajemen Teknisi
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <Link
              to="/admin"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#F8FAFC] bg-[#101A30] hover:bg-white/10 border border-white/15 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>Dasbor Admin</span>
            </Link>

            <button
              type="button"
              onClick={() => setFormModalState({ mode: 'add' })}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#8B5CF6] hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-950/40 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Teknisi</span>
            </button>
          </div>
        </div>
      </section>

      {/* Feedback Banner */}
      {feedback && (
        <div
          role="status"
          className="p-3.5 rounded-2xl bg-emerald-50 border-[1.5px] border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between gap-3 animate-fadeIn"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback('')}
            className="p-1 rounded-lg hover:bg-emerald-100 cursor-pointer"
            aria-label="Tutup pesan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. TECHNICIAN OVERVIEW (4 KPI Modules) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            key: 'ALL',
            label: 'Total Teknisi',
            count: overview.total,
            icon: Users,
            bar: 'from-[#2563EB] to-[#06B6D4]',
            border: 'border-[#2563EB]/40',
            iconBox: 'bg-[#2563EB]/20 border-[#2563EB]/40 text-[#60A5FA]',
            labelColor: 'text-blue-300',
          },
          {
            key: 'Available',
            label: 'Tersedia',
            count: overview.available,
            icon: UserCheck,
            bar: 'from-emerald-400 to-teal-500',
            border: 'border-emerald-500/40',
            iconBox: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300',
            labelColor: 'text-emerald-300',
          },
          {
            key: 'On Duty',
            label: 'Sedang Bertugas',
            count: overview.onDuty,
            icon: Wrench,
            bar: 'from-[#06B6D4] to-[#2563EB]',
            border: 'border-[#06B6D4]/40',
            iconBox: 'bg-[#06B6D4]/20 border-[#06B6D4]/40 text-[#06B6D4]',
            labelColor: 'text-cyan-300',
          },
          {
            key: 'Unavailable',
            label: 'Tidak Tersedia',
            count: overview.unavailable,
            icon: UserX,
            bar: 'from-[#F59E0B] to-rose-500',
            border: 'border-[#F59E0B]/40',
            iconBox: 'bg-[#F59E0B]/20 border-[#F59E0B]/40 text-[#F59E0B]',
            labelColor: 'text-amber-300',
          },
        ].map((card) => {
          const Icon = card.icon;
          const isActive = availabilityFilter === card.key;
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => setAvailabilityFilter(card.key)}
              className={`relative overflow-hidden text-left rounded-2xl bg-[#101A30] border p-5 text-[#F8FAFC] shadow-lg shadow-slate-950/15 transition-all cursor-pointer ${
                isActive
                  ? 'border-[#06B6D4] ring-2 ring-[#06B6D4]/30 -translate-y-0.5'
                  : `${card.border} hover:border-white/30`
              }`}
            >
              <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${card.bar}`} />
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-[11px] font-bold uppercase tracking-wider ${card.labelColor}`}>
                    {card.label}
                  </p>
                  <p className="text-3xl font-extrabold text-white mt-2 tabular-nums">
                    {card.count}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center ${card.iconBox}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </button>
          );
        })}
      </section>

      {/* 3. SEARCH, FILTER & SORT TOOLBAR */}
      <section className="rounded-3xl bg-[#F8FAFC] border-[1.5px] border-slate-300/90 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search by Name or Technician ID */}
          <div className="md:col-span-5 relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#2563EB] transition-colors">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama teknisi atau ID Teknisi (contoh: TECH-001)..."
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border-[1.5px] border-slate-300 bg-white placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-[#2563EB] transition-all font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Hapus pencarian"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Specialization */}
          <div className="md:col-span-3">
            <select
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              aria-label="Saring spesialisasi"
              className="w-full px-3 py-2.5 text-xs rounded-xl border-[1.5px] border-slate-300 bg-white font-semibold text-slate-700 focus:outline-none focus:border-[#2563EB] cursor-pointer"
            >
              <option value="ALL">Semua Spesialisasi</option>
              {specializationOptions.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Availability */}
          <div className="md:col-span-2">
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              aria-label="Saring ketersediaan"
              className="w-full px-3 py-2.5 text-xs rounded-xl border-[1.5px] border-slate-300 bg-white font-semibold text-slate-700 focus:outline-none focus:border-[#2563EB] cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              {TECHNICIAN_AVAILABILITY_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {AVAILABILITY_LABELS[st] || st}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="md:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <ArrowUpDown className="w-3.5 h-3.5" />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Urutkan teknisi"
              className="w-full pl-8 pr-3 py-2.5 text-xs rounded-xl border-[1.5px] border-slate-300 bg-white font-semibold text-slate-700 focus:outline-none focus:border-[#2563EB] cursor-pointer"
            >
              <option value="name-asc">Nama (A–Z)</option>
              <option value="name-desc">Nama (Z–A)</option>
              <option value="active-desc">Tugas Aktif (Tertinggi)</option>
              <option value="active-asc">Tugas Aktif (Terendah)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-xs">
          <span className="text-slate-500 font-medium">
            Menampilkan <strong className="text-slate-900">{visibleTechnicians.length}</strong> dari{' '}
            <strong className="text-slate-900">{technicians.length}</strong> teknisi
          </span>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Atur Ulang</span>
            </button>
          )}
        </div>
      </section>

      {/* 4. TECHNICIAN LIST (Table on Desktop + Cards on Tablet/Mobile) */}
      <section className="rounded-3xl bg-white border-[1.5px] border-slate-300/90 shadow-sm overflow-hidden">
        {visibleTechnicians.length === 0 ? (
          <div className="py-14 px-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
              <Filter className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Tidak Ada Teknisi yang Ditemukan</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Tidak ada teknisi yang sesuai dengan kata kunci atau penyaringan yang dipilih.
            </p>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#101A30] hover:bg-[#2563EB] cursor-pointer"
              >
                Atur Ulang Penyaringan
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table: colgroup + table-fixed menjamin judul kolom sejajar tepat di atas data & overflow-x-auto mencegah tombol terpotong */}
            <div className="hidden xl:block overflow-x-auto">
              <table className="w-full min-w-[1080px] table-fixed text-left border-collapse">
                <colgroup>
                  <col className="w-[8%]" />
                  <col className="w-[15.5%]" />
                  <col className="w-[13.5%]" />
                  <col className="w-[10.5%]" />
                  <col className="w-[11%]" />
                  <col className="w-[7.5%]" />
                  <col className="w-[8.5%]" />
                  <col className="w-[9.5%]" />
                  <col className="w-[16%]" />
                </colgroup>
                <thead>
                  <tr className="bg-[#080D1B] text-[#F8FAFC] text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-2.5 whitespace-nowrap">ID Teknisi</th>
                    <th className="py-3.5 px-2.5 whitespace-nowrap">Teknisi</th>
                    <th className="py-3.5 px-2.5 whitespace-nowrap">Spesialisasi</th>
                    <th className="py-3.5 px-2 whitespace-nowrap">Kontak</th>
                    <th className="py-3.5 px-2 whitespace-nowrap">Ketersediaan</th>
                    <th className="py-3.5 px-2 whitespace-nowrap text-center">Tugas Aktif</th>
                    <th className="py-3.5 px-2 whitespace-nowrap text-center">Tugas Selesai</th>
                    <th className="py-3.5 px-2.5 whitespace-nowrap">Beban Kerja</th>
                    <th className="py-3.5 px-3 whitespace-nowrap text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y-[1.5px] divide-slate-200/80 text-xs">
                  {visibleTechnicians.map((tech) => {
                    const workload = getWorkloadMetrics(tech.activeTasks);
                    const initials = tech.name
                      .split(' ')
                      .slice(0, 2)
                      .map((p) => p.charAt(0).toUpperCase())
                      .join('');

                    return (
                      <tr key={tech.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3.5 px-2.5 font-mono text-[11px] font-bold text-[#101A30] whitespace-nowrap">
                          {tech.id}
                        </td>
                        <td className="py-3.5 px-2.5">
                          <div className="flex items-center space-x-2 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${
                                tech.avatarColor || 'from-[#2563EB] to-[#8B5CF6]'
                              } text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-xs`}
                            >
                              {initials}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-slate-900 truncate" title={tech.name}>
                                {tech.name}
                              </p>
                              <p className="text-[10.5px] text-slate-400 truncate" title={tech.email}>
                                {tech.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-2.5 text-slate-700 font-medium">
                          <p className="truncate text-[11.5px]" title={tech.specialization}>
                            {tech.specialization}
                          </p>
                        </td>
                        <td className="py-3.5 px-2 font-mono text-[11px] text-slate-600">
                          <div className="inline-flex items-center space-x-1 max-w-full min-w-0">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate" title={tech.phone}>
                              {tech.phone}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-2 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10.5px] font-bold border ${getAvailabilityBadge(
                              tech.availability
                            )}`}
                          >
                            {AVAILABILITY_LABELS[tech.availability] || tech.availability}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-center font-mono font-extrabold text-slate-900 tabular-nums">
                          {tech.activeTasks}
                        </td>
                        <td className="py-3.5 px-2 text-center font-mono font-bold text-emerald-700 tabular-nums">
                          {tech.completedTasks}
                        </td>
                        <td className="py-3.5 px-2.5">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span
                                className={`px-1.5 py-0.2 rounded border ${workload.badgeClass}`}
                              >
                                {workload.level}
                              </span>
                              <span className="font-mono text-slate-500">{workload.percent}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                              <div
                                style={{ width: `${Math.max(workload.percent, 8)}%` }}
                                className={`h-full rounded-full bg-gradient-to-r ${workload.barClass} transition-all duration-300`}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setDetailTechnician(tech)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-white bg-[#101A30] hover:bg-[#2563EB] transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Lihat Detail</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setFormModalState({ mode: 'edit', technician: tech })
                              }
                              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Ubah</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Tablet & Mobile Cards */}
            <div className="xl:hidden p-4 space-y-3.5 bg-[#eef2f9]/55">
              {visibleTechnicians.map((tech) => {
                const workload = getWorkloadMetrics(tech.activeTasks);
                const initials = tech.name
                  .split(' ')
                  .slice(0, 2)
                  .map((p) => p.charAt(0).toUpperCase())
                  .join('');

                return (
                  <article
                    key={tech.id}
                    className="p-4 rounded-2xl bg-white border-[1.5px] border-slate-300/85 space-y-3 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${
                            tech.avatarColor || 'from-[#2563EB] to-[#8B5CF6]'
                          } text-white font-bold text-xs flex items-center justify-center shrink-0`}
                        >
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-[11px] font-bold text-[#101A30] bg-slate-200/75 px-2 py-0.5 rounded">
                              {tech.id}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getAvailabilityBadge(
                                tech.availability
                              )}`}
                            >
                              {AVAILABILITY_LABELS[tech.availability] || tech.availability}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 mt-1 truncate">
                            {tech.name}
                          </h3>
                          <p className="text-xs text-slate-500 truncate">{tech.specialization}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-[#F8FAFC] border border-slate-200">
                        <p className="text-[10px] text-slate-400 font-bold">Kontak</p>
                        <p className="font-mono text-[11px] font-semibold text-slate-700 truncate">
                          {tech.phone}
                        </p>
                      </div>
                      <div className="p-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-center">
                        <p className="text-[10px] text-slate-400 font-bold">Tugas Aktif</p>
                        <p className="font-mono font-extrabold text-slate-900">
                          {tech.activeTasks}
                        </p>
                      </div>
                      <div className="p-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-center">
                        <p className="text-[10px] text-slate-400 font-bold">Tugas Selesai</p>
                        <p className="font-mono font-extrabold text-emerald-700">
                          {tech.completedTasks}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className={`px-2 py-0.5 rounded border ${workload.badgeClass}`}>
                          Beban Kerja: {workload.level}
                        </span>
                        <span className="font-mono text-slate-500">{workload.percent}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          style={{ width: `${Math.max(workload.percent, 8)}%` }}
                          className={`h-full rounded-full bg-gradient-to-r ${workload.barClass}`}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/80">
                      <button
                        type="button"
                        onClick={() => setDetailTechnician(tech)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#101A30] hover:bg-[#2563EB] cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Detail</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormModalState({ mode: 'edit', technician: tech })
                        }
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Ubah</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* ADD / EDIT TECHNICIAN MODAL */}
      {formModalState && (
        <TechnicianFormModal
          key={`${formModalState.mode}-${formModalState.technician?.id || 'new'}`}
          mode={formModalState.mode}
          initialTechnician={formModalState.technician || null}
          existingIds={technicians.map((t) => t.id)}
          onClose={() => setFormModalState(null)}
          onSave={handleSaveTechnician}
        />
      )}

      {/* DETAIL TECHNICIAN MODAL */}
      {detailTechnician && (
        <TechnicianDetailModal
          technician={detailTechnician}
          onClose={() => setDetailTechnician(null)}
          onEdit={(tech) => setFormModalState({ mode: 'edit', technician: tech })}
        />
      )}
    </div>
  );
}
