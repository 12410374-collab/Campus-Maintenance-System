import { useState } from 'react';
import {
  X,
  UserPlus,
  Pencil,
  Lock,
  Mail,
  Phone,
  Wrench,
  CheckCircle2,
  ClipboardList,
  Calendar,
  MapPin,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import {
  TECHNICIAN_AVAILABILITY_OPTIONS,
  TECHNICIAN_SPECIALIZATION_OPTIONS,
  getWorkloadMetrics,
} from '../../data/mockTechnicians';

const AVAILABILITY_LABELS = {
  Available: 'Tersedia',
  'On Duty': 'Sedang Bertugas',
  Unavailable: 'Tidak Tersedia',
};

const HISTORY_STATUS_LABELS = {
  Assigned: 'Ditugaskan',
  'In Progress': 'Sedang Dikerjakan',
  Completed: 'Selesai',
};

function getAvailabilityBadgeStyle(status) {
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

export function TechnicianFormModal({
  mode,
  initialTechnician,
  existingIds,
  onClose,
  onSave,
}) {
  const isEdit = mode === 'edit';

  const [formData, setFormData] = useState(() => ({
    id: initialTechnician?.id || '',
    name: initialTechnician?.name || '',
    email: initialTechnician?.email || '',
    phone: initialTechnician?.phone || '',
    specialization:
      initialTechnician?.specialization || TECHNICIAN_SPECIALIZATION_OPTIONS[0],
    availability: initialTechnician?.availability || 'Available',
  }));

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};

    const cleanId = formData.id.trim().toUpperCase();
    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim();
    const cleanPhone = formData.phone.trim();

    if (!isEdit) {
      if (!cleanId) {
        nextErrors.id = 'ID Teknisi wajib diisi (contoh: TECH-007).';
      } else if (existingIds.some((id) => id.toUpperCase() === cleanId)) {
        nextErrors.id = `ID Teknisi "${cleanId}" sudah digunakan oleh teknisi lain.`;
      }
    }

    if (!cleanName) {
      nextErrors.name = 'Nama lengkap wajib diisi.';
    }

    if (!cleanEmail) {
      nextErrors.email = 'Email wajib diisi.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      nextErrors.email = 'Format email tidak valid.';
    }

    if (!cleanPhone) {
      nextErrors.phone = 'Nomor telepon wajib diisi.';
    }

    if (!formData.specialization.trim()) {
      nextErrors.specialization = 'Spesialisasi wajib dipilih.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSave({
      id: isEdit ? initialTechnician.id : cleanId,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      specialization: formData.specialization.trim(),
      availability: formData.availability,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        noValidate
        className="w-full max-w-lg bg-white rounded-3xl border-[1.5px] border-slate-300 shadow-2xl overflow-hidden animate-fadeInUp"
      >
        {/* Command Modal Header */}
        <div className="bg-gradient-to-r from-[#080D1B] via-[#101A30] to-[#1A1446] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2563EB]/25 border border-[#06B6D4]/40 text-[#06B6D4] flex items-center justify-center">
              {isEdit ? <Pencil className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {isEdit ? 'Ubah Data Teknisi' : 'Tambah Teknisi Baru'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Technician ID */}
            <div>
              <label
                htmlFor="tech-id"
                className="flex items-center justify-between font-bold text-slate-800 mb-1.5"
              >
                <span>
                  ID Teknisi <span className="text-rose-500">*</span>
                </span>
                {isEdit && (
                  <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-slate-400">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Terkunci</span>
                  </span>
                )}
              </label>
              <input
                id="tech-id"
                type="text"
                disabled={isEdit}
                value={formData.id}
                onChange={(e) => handleChange('id', e.target.value)}
                placeholder="Contoh: TECH-007"
                className={`w-full px-3.5 py-2.5 rounded-xl border-[1.5px] font-mono text-xs transition-all ${
                  isEdit
                    ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                    : errors.id
                    ? 'bg-white border-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-500/15'
                    : 'bg-[#F8FAFC] focus:bg-white border-slate-300 focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-blue-500/15'
                }`}
              />
              {errors.id && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.id}</span>
                </p>
              )}
            </div>

            {/* Availability Status */}
            <div>
              <label htmlFor="tech-availability" className="block font-bold text-slate-800 mb-1.5">
                Status Ketersediaan <span className="text-rose-500">*</span>
              </label>
              <select
                id="tech-availability"
                value={formData.availability}
                onChange={(e) => handleChange('availability', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-slate-300 bg-[#F8FAFC] focus:bg-white font-semibold text-slate-800 focus:outline-none focus:border-[#2563EB] cursor-pointer"
              >
                {TECHNICIAN_AVAILABILITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {AVAILABILITY_LABELS[opt] || opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Nama Lengkap */}
          <div>
            <label htmlFor="tech-name" className="block font-bold text-slate-800 mb-1.5">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              id="tech-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Nama lengkap teknisi"
              className={`w-full px-3.5 py-2.5 rounded-xl border-[1.5px] font-medium transition-all ${
                errors.name
                  ? 'bg-white border-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-500/15'
                  : 'bg-[#F8FAFC] focus:bg-white border-slate-300 focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-blue-500/15'
              }`}
            />
            {errors.name && (
              <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label htmlFor="tech-email" className="block font-bold text-slate-800 mb-1.5">
                Email <span className="text-rose-500">*</span>
              </label>
              <input
                id="tech-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="nama@unklab.ac.id"
                className={`w-full px-3.5 py-2.5 rounded-xl border-[1.5px] font-medium transition-all ${
                  errors.email
                    ? 'bg-white border-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-500/15'
                    : 'bg-[#F8FAFC] focus:bg-white border-slate-300 focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-blue-500/15'
                }`}
              />
              {errors.email && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.email}</p>
              )}
            </div>

            {/* Nomor Telepon */}
            <div>
              <label htmlFor="tech-phone" className="block font-bold text-slate-800 mb-1.5">
                Nomor Telepon <span className="text-rose-500">*</span>
              </label>
              <input
                id="tech-phone"
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="08xx-xxxx-xxxx"
                className={`w-full px-3.5 py-2.5 rounded-xl border-[1.5px] font-medium transition-all ${
                  errors.phone
                    ? 'bg-white border-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-500/15'
                    : 'bg-[#F8FAFC] focus:bg-white border-slate-300 focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-blue-500/15'
                }`}
              />
              {errors.phone && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Spesialisasi */}
          <div>
            <label htmlFor="tech-spec" className="block font-bold text-slate-800 mb-1.5">
              Spesialisasi <span className="text-rose-500">*</span>
            </label>
            <select
              id="tech-spec"
              value={formData.specialization}
              onChange={(e) => handleChange('specialization', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-slate-300 bg-[#F8FAFC] focus:bg-white font-semibold text-slate-800 focus:outline-none focus:border-[#2563EB] cursor-pointer"
            >
              {Array.from(
                new Set([
                  ...TECHNICIAN_SPECIALIZATION_OPTIONS,
                  ...(formData.specialization ? [formData.specialization] : []),
                ])
              ).map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
            {errors.specialization && (
              <p className="text-[11px] text-rose-600 font-semibold mt-1">
                {errors.specialization}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#8B5CF6] hover:from-blue-500 hover:to-violet-500 shadow-sm cursor-pointer"
          >
            {isEdit ? 'Simpan Perubahan' : 'Tambah Teknisi'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function TechnicianDetailModal({ technician, onClose, onEdit }) {
  if (!technician) return null;

  const workload = getWorkloadMetrics(technician.activeTasks);
  const initials = technician.name
    .split(' ')
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('');

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white rounded-3xl border-[1.5px] border-slate-300 shadow-2xl overflow-hidden animate-fadeInUp"
      >
        {/* Top Dark Profile Header */}
        <div className="bg-gradient-to-r from-[#080D1B] via-[#101A30] to-[#1A1446] px-6 py-5 text-white flex items-start justify-between gap-4">
          <div className="flex items-center space-x-3.5 min-w-0">
            <div
              className={`w-13 h-13 rounded-2xl bg-gradient-to-tr ${
                technician.avatarColor || 'from-[#2563EB] to-[#8B5CF6]'
              } text-white font-extrabold text-base flex items-center justify-center shrink-0 border border-white/20 shadow-lg`}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/35">
                  {technician.id}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getAvailabilityBadgeStyle(
                    technician.availability
                  )}`}
                >
                  {AVAILABILITY_LABELS[technician.availability] || technician.availability}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-white mt-1 truncate">
                {technician.name}
              </h2>
              <p className="text-xs text-indigo-200/85 truncate">{technician.specialization}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label="Tutup detail"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Contact & Profile Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 flex items-center space-x-1">
                <Mail className="w-3 h-3 text-[#2563EB]" />
                <span>Email</span>
              </p>
              <p className="font-semibold text-slate-800 mt-0.5 truncate">{technician.email}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 flex items-center space-x-1">
                <Phone className="w-3 h-3 text-[#06B6D4]" />
                <span>Telepon</span>
              </p>
              <p className="font-semibold text-slate-800 mt-0.5">{technician.phone}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-[#8B5CF6]" />
                <span>Bergabung</span>
              </p>
              <p className="font-semibold text-slate-800 mt-0.5">{technician.joinedAt || '2024'}</p>
            </div>
          </div>

          {/* Tasks & Workload Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#101A30] text-white border border-[#2563EB]/40">
              <p className="text-[10px] font-bold uppercase text-blue-300 flex items-center space-x-1">
                <ClipboardList className="w-3 h-3" />
                <span>Tugas Aktif</span>
              </p>
              <p className="text-2xl font-extrabold mt-1 tabular-nums">{technician.activeTasks}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#101A30] text-white border border-emerald-500/40">
              <p className="text-[10px] font-bold uppercase text-emerald-300 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Tugas Selesai</span>
              </p>
              <p className="text-2xl font-extrabold mt-1 tabular-nums">{technician.completedTasks}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border-[1.5px] border-slate-200 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-500">Beban Kerja</span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${workload.badgeClass}`}
                >
                  {workload.level}
                </span>
              </div>
              <div className="space-y-1 mt-2">
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    style={{ width: `${Math.max(workload.percent, 8)}%` }}
                    className={`h-full rounded-full bg-gradient-to-r ${workload.barClass}`}
                  />
                </div>
                <p className="text-[10px] font-mono text-slate-500 text-right">
                  {workload.percent}%
                </p>
              </div>
            </div>
          </div>

          {/* Work History */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
              <Wrench className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Riwayat Pekerjaan</span>
            </h3>

            {technician.workHistory && technician.workHistory.length > 0 ? (
              <div className="space-y-2.5">
                {technician.workHistory.map((item) => (
                  <div
                    key={item.reportId}
                    className="p-3 rounded-2xl border-[1.5px] border-slate-200 bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[10px] font-bold text-[#101A30] bg-slate-200/80 px-2 py-0.5 rounded">
                          {item.reportId}
                        </span>
                        <span className="text-[11px] font-bold text-slate-900 truncate">
                          {item.title}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-500">
                        <span className="inline-flex items-center space-x-1 truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </span>
                        <span className="inline-flex items-center space-x-1 shrink-0">
                          <Calendar className="w-3 h-3" />
                          <span>{item.date}</span>
                        </span>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold border self-start sm:self-center ${
                        item.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.status === 'In Progress'
                          ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      {HISTORY_STATUS_LABELS[item.status] || item.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
                Belum ada riwayat penugasan perbaikan untuk teknisi ini.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(technician);
            }}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#2563EB] bg-blue-50 hover:bg-blue-100 border border-blue-200 cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Ubah Profil</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#080D1B] hover:bg-[#101A30] cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
