/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { findUserByIdentifierOrEmail } from '../services/authService';

// Daftar metadata akun demo Universitas Klabat untuk tombol pengisian cepat pada halaman Login
// (Autentikasi aktual memverifikasi kredensial langsung ke backend JSON Server via authService)
export const DEMO_ACCOUNTS = [
  {
    role: 'Student',
    label: 'Mahasiswa',
    name: 'Bryan Sompotan',
    identifier: '105021234',
    email: 'bryan@student.unklab.ac.id',
    department: 'Fakultas Ilmu Komputer (Informatika)',
    description: 'Akses pelapor mahasiswa',
  },
  {
    role: 'Lecturer',
    label: 'Dosen',
    name: 'Dr. Jerry Rogi, S.Kom., M.T.',
    identifier: '091234567',
    email: 'jerry.rogi@unklab.ac.id',
    department: 'Fakultas Ilmu Komputer',
    description: 'Akses pelapor dosen',
  },
  {
    role: 'Staff',
    label: 'Staf Kampus',
    name: 'Maria Pangkey, S.E.',
    identifier: '19850412',
    email: 'maria.pangkey@unklab.ac.id',
    department: 'Biro Administrasi Akademik',
    description: 'Akses pelapor staf UNKLAB',
  },
  {
    role: 'Admin',
    label: 'Administrator',
    name: 'Admin Sarana & Fasilitas',
    identifier: 'admin',
    email: 'facilities@unklab.ac.id',
    department: 'Unit Sarana & Prasarana Kampus',
    description: 'Verifikasi, prioritas, dan penugasan teknisi',
  },
  {
    role: 'Technician',
    label: 'Teknisi',
    name: 'Rudi Hartono',
    identifier: 'TECH-001',
    email: 'rudi.tech@unklab.ac.id',
    department: 'Divisi Pemeliharaan Fasilitas',
    specialization: 'Electrical & AC Specialist',
    description: 'Pelaksana perbaikan dan pembaruan progres',
  },
];

const STORAGE_KEY = 'campus_maintenance_user';

const ROLE_LABELS_ID = {
  Student: 'Mahasiswa',
  Lecturer: 'Dosen',
  Staff: 'Staf',
  Admin: 'Admin',
  Technician: 'Teknisi',
};

function sanitizeUserSession(rawUser) {
  if (!rawUser || typeof rawUser !== 'object') return null;
  const safeFields = { ...rawUser };
  delete safeFields.password;
  return safeFields;
}

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage to persist session on reload (never expose password)
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY);
      return savedUser ? sanitizeUserSession(JSON.parse(savedUser)) : null;
    } catch (error) {
      console.error('Gagal membaca data sesi dari localStorage:', error);
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Sync sanitized session to localStorage whenever user state changes
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeUserSession(user)));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Gagal menyimpan sesi ke localStorage:', error);
    }
  }, [user]);

  /**
   * Validated Login Authentication via Backend API (authService -> JSON Server /users)
   * @param {Object} credentials - { identifier, password, role }
   * @returns {Promise<{ success: boolean, message?: string, user?: Object }>}
   */
  const login = async ({ identifier, password, role }) => {
    const cleanIdentifier = identifier?.trim();
    const cleanPassword = password?.trim();
    const cleanRole = role?.trim();

    // 1. Validasi peran tidak boleh kosong
    if (!cleanRole) {
      return { success: false, message: 'Silakan pilih peran (role) Anda terlebih dahulu.' };
    }

    // 2. Validasi nama pengguna / identifier tidak boleh kosong
    if (!cleanIdentifier) {
      return { success: false, message: 'Nama pengguna atau ID tidak boleh kosong.' };
    }

    // 3. Validasi kata sandi tidak boleh kosong
    if (!cleanPassword) {
      return { success: false, message: 'Kata sandi tidak boleh kosong.' };
    }

    setLoading(true);

    try {
      // 4. Ambil data akun terdaftar dari backend JSON Server melalui authService
      const registeredAccount = await findUserByIdentifierOrEmail(cleanIdentifier);

      if (!registeredAccount) {
        return {
          success: false,
          message: 'Nama pengguna atau ID tidak terdaftar dalam sistem.',
        };
      }

      // 5. Validasi kesesuaian peran yang dipilih dengan peran akun terdaftar
      if (registeredAccount.role !== cleanRole) {
        const registeredRoleLabel =
          ROLE_LABELS_ID[registeredAccount.role] || registeredAccount.role;
        return {
          success: false,
          message: `Peran yang Anda pilih tidak sesuai. Akun "${cleanIdentifier}" terdaftar sebagai ${registeredRoleLabel}. Silakan pilih peran ${registeredRoleLabel}.`,
        };
      }

      // 6. Validasi kata sandi akun terhadap data backend
      if (!registeredAccount.password || cleanPassword !== registeredAccount.password) {
        return {
          success: false,
          message: 'Kata sandi yang Anda masukkan salah. Silakan coba lagi.',
        };
      }

      // 7. Buat objek sesi aman (tanpa menyertakan field password)
      const userSession = {
        id: registeredAccount.id || registeredAccount.identifier,
        name: registeredAccount.name,
        identifier: registeredAccount.identifier,
        email: registeredAccount.email,
        role: registeredAccount.role,
        department: registeredAccount.department,
        specialization: registeredAccount.specialization || null,
        loginAt: new Date().toISOString(),
      };

      setUser(userSession);

      return {
        success: true,
        message: `Selamat datang, ${userSession.name}!`,
        user: userSession,
      };
    } catch (error) {
      const errorMessage = error?.isNetworkError
        ? 'Tidak dapat terhubung ke server backend (http://localhost:3001). Pastikan JSON Server sedang berjalan.'
        : error?.message || 'Terjadi kesalahan saat memverifikasi akun ke server.';
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user and clear session
   */
  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Gagal menghapus sesi localStorage:', error);
    }
  };

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: Boolean(user),
    loading,
    login,
    logout,
    demoAccounts: DEMO_ACCOUNTS,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to easily consume the AuthContext
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
