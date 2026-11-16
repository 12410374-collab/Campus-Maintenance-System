/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

// Predefined registered demo accounts for Universitas Klabat (UNKLAB) roles
export const DEMO_ACCOUNTS = [
  {
    role: 'Student',
    label: 'Mahasiswa',
    name: 'Bryan Sompotan',
    identifier: '105021234',
    email: 'bryan@student.unklab.ac.id',
    password: 'password123',
    department: 'Fakultas Ilmu Komputer (Informatika)',
    description: 'Akses pelapor mahasiswa',
  },
  {
    role: 'Lecturer',
    label: 'Dosen',
    name: 'Dr. Jerry Rogi, S.Kom., M.T.',
    identifier: '091234567',
    email: 'jerry.rogi@unklab.ac.id',
    password: 'password123',
    department: 'Fakultas Ilmu Komputer',
    description: 'Akses pelapor dosen',
  },
  {
    role: 'Staff',
    label: 'Staf Kampus',
    name: 'Maria Pangkey, S.E.',
    identifier: '19850412',
    email: 'maria.pangkey@unklab.ac.id',
    password: 'password123',
    department: 'Biro Administrasi Akademik',
    description: 'Akses pelapor staf UNKLAB',
  },
  {
    role: 'Admin',
    label: 'Administrator',
    name: 'Admin Sarana & Fasilitas',
    identifier: 'admin',
    email: 'facilities@unklab.ac.id',
    password: 'password123',
    department: 'Unit Sarana & Prasarana Kampus',
    description: 'Verifikasi, prioritas, dan penugasan teknisi',
  },
  {
    role: 'Technician',
    label: 'Teknisi',
    name: 'Rudi Hartono',
    identifier: 'TECH-001',
    email: 'rudi.tech@unklab.ac.id',
    password: 'password123',
    department: 'Divisi Pemeliharaan Fasilitas',
    specialization: 'Electrical & AC Specialist',
    description: 'Pelaksana perbaikan dan pembaruan progres',
  },
];

const STORAGE_KEY = 'campus_maintenance_user';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage to persist session on reload
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Gagal membaca data sesi dari localStorage:', error);
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Sync to localStorage whenever user state changes
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Gagal menyimpan sesi ke localStorage:', error);
    }
  }, [user]);

  /**
   * Validated Login Authentication
   * @param {Object} credentials - { identifier, password, role }
   * @returns {Promise<{ success: boolean, message?: string, user?: Object }>}
   */
  const login = async ({ identifier, password, role }) => {
    setLoading(true);

    const cleanIdentifier = identifier?.trim();
    const cleanPassword = password?.trim();
    const cleanRole = role?.trim();

    // 1. Validasi peran tidak boleh kosong
    if (!cleanRole) {
      setLoading(false);
      return { success: false, message: 'Silakan pilih peran (role) Anda terlebih dahulu.' };
    }

    // 2. Validasi nama pengguna / identifier tidak boleh kosong
    if (!cleanIdentifier) {
      setLoading(false);
      return { success: false, message: 'Nama pengguna atau ID tidak boleh kosong.' };
    }

    // 3. Validasi kata sandi tidak boleh kosong
    if (!cleanPassword) {
      setLoading(false);
      return { success: false, message: 'Kata sandi tidak boleh kosong.' };
    }

    // 4. Periksa apakah akun terdaftar dalam database akun demo
    const registeredAccount = DEMO_ACCOUNTS.find(
      (acc) =>
        acc.identifier.toLowerCase() === cleanIdentifier.toLowerCase() ||
        acc.email.toLowerCase() === cleanIdentifier.toLowerCase()
    );

    // Jika username / ID tidak ditemukan di seluruh daftar akun terdaftar
    if (!registeredAccount) {
      setLoading(false);
      return {
        success: false,
        message: 'Nama pengguna atau ID tidak terdaftar dalam sistem.',
      };
    }

    // 5. Validasi kesesuaian peran yang dipilih dengan peran akun terdaftar
    if (registeredAccount.role !== cleanRole) {
      const roleLabels = {
        Student: 'Mahasiswa',
        Lecturer: 'Dosen',
        Staff: 'Staf',
        Admin: 'Admin',
        Technician: 'Teknisi',
      };
      const registeredRoleLabel = roleLabels[registeredAccount.role] || registeredAccount.role;
      setLoading(false);
      return {
        success: false,
        message: `Peran yang Anda pilih tidak sesuai. Akun "${cleanIdentifier}" terdaftar sebagai ${registeredRoleLabel}. Silakan pilih peran ${registeredRoleLabel}.`,
      };
    }

    // 6. Validasi kata sandi akun
    const validPassword = registeredAccount.password || 'password123';
    if (cleanPassword !== validPassword) {
      setLoading(false);
      return {
        success: false,
        message: 'Kata sandi yang Anda masukkan salah. Silakan coba lagi.',
      };
    }

    // Seluruh validasi berhasil -> Buat sesi pengguna
    const userSession = {
      id: registeredAccount.identifier,
      name: registeredAccount.name,
      identifier: registeredAccount.identifier,
      email: registeredAccount.email,
      role: registeredAccount.role,
      department: registeredAccount.department,
      specialization: registeredAccount.specialization || null,
      loginAt: new Date().toISOString(),
    };

    setUser(userSession);
    setLoading(false);

    return {
      success: true,
      message: `Selamat datang, ${userSession.name}!`,
      user: userSession,
    };
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
