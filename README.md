# Campus Maintenance Request System

**Campus Maintenance Request System** adalah aplikasi berbasis web yang dikembangkan untuk membantu Universitas Klabat (UNKLAB) dalam mengelola laporan kerusakan fasilitas kampus. Sistem ini memudahkan mahasiswa dan dosen melaporkan kerusakan, membantu Admin mengelola laporan dan memberikan tugas kepada Teknisi, serta membantu Teknisi memperbarui proses perbaikan.

## Latar Belakang

Pelaporan kerusakan fasilitas kampus membutuhkan proses yang teratur agar setiap laporan dapat ditangani dengan baik. Tanpa sistem yang terpusat, pengguna dapat kesulitan melaporkan kerusakan dan mengetahui perkembangan perbaikannya.

Oleh karena itu, Campus Maintenance Request System dikembangkan untuk mempermudah proses pelaporan, pengelolaan, penugasan, dan pemantauan perbaikan fasilitas kampus. Sistem ini juga dilengkapi dengan teknologi AI Gemini untuk membantu menganalisis laporan dan memberikan rekomendasi penanganan.

## Tujuan Sistem

- Mempermudah mahasiswa dan dosen dalam melaporkan kerusakan fasilitas kampus.
- Membantu Admin memverifikasi laporan dan menentukan prioritas perbaikan.
- Mempermudah Admin dalam membagikan tugas kepada Teknisi.
- Membantu Teknisi melihat dan memperbarui status pekerjaan.
- Memudahkan pengguna memantau perkembangan laporan hingga selesai.
- Memanfaatkan AI untuk membantu analisis laporan kerusakan.

## Fitur Utama

### 1. Student / Lecturer (Reporter)
- Login ke dalam sistem.
- Melihat dashboard laporan.
- Membuat laporan kerusakan fasilitas kampus.
- Mengunggah foto kerusakan.
- Melihat daftar laporan yang telah dibuat.
- Memantau status laporan.
- Melihat bukti foto hasil perbaikan.

### 2. Admin
- Melihat dashboard dan statistik laporan.
- Melihat seluruh laporan kerusakan.
- Memverifikasi laporan yang masuk.
- Menentukan prioritas perbaikan.
- Melihat rekomendasi analisis AI.
- Mengelola dan menugaskan Teknisi.
- Memantau proses pengerjaan laporan.

### 3. Technician
- Melihat dashboard pekerjaan.
- Melihat tugas yang diberikan oleh Admin.
- Melihat detail laporan kerusakan.
- Memperbarui status pekerjaan.
- Mengunggah foto bukti perbaikan.
- Menambahkan catatan pekerjaan.
- Melihat riwayat pekerjaan yang telah diselesaikan.

## Integrasi Artificial Intelligence (AI)

Sistem menggunakan **Google Gemini API** untuk membantu menganalisis laporan kerusakan fasilitas kampus.

Fitur AI meliputi:
- **Automatic Classification:** Membantu menentukan kategori kerusakan.
- **Urgency Recommendation:** Memberikan rekomendasi tingkat urgensi.
- **Problem Summary:** Membuat ringkasan masalah dari laporan.
- **Maintenance Recommendation:** Memberikan saran tindakan awal perbaikan.
- **Insufficient Information:** Membantu mengidentifikasi informasi laporan yang masih kurang.

**Catatan:** Hasil analisis AI merupakan rekomendasi. Keputusan akhir mengenai prioritas perbaikan tetap berada di tangan Admin.

## Alur Kerja Sistem

1. Mahasiswa atau dosen membuat laporan kerusakan.
2. Sistem menggunakan AI Gemini untuk membantu menganalisis laporan.
3. Admin memeriksa dan memverifikasi laporan.
4. Admin menentukan prioritas dan menugaskan Teknisi.
5. Teknisi menerima tugas dan melakukan perbaikan.
6. Teknisi memperbarui status serta mengunggah foto bukti perbaikan.
7. Pelapor dapat melihat perkembangan hingga laporan selesai.

## Teknologi yang Digunakan

| Teknologi | Kegunaan |
|---|---|
| React.js | Pengembangan antarmuka aplikasi |
| Vite | Development server dan build frontend |
| Tailwind CSS | Styling antarmuka |
| React Router DOM | Navigasi antarhalaman |
| Lucide React | Ikon antarmuka |
| JSON Server | REST API dan penyimpanan data pengembangan |
| Node.js & Express | Menjalankan layanan AI Proxy |
| Google Gemini API | Analisis laporan menggunakan AI |
| Git & GitHub | Version control dan penyimpanan source code |

## Persyaratan Instalasi

Pastikan perangkat telah memiliki:
- Node.js dan npm.
- Git.
- Browser seperti Google Chrome.
- API Key Google Gemini untuk menggunakan fitur AI.

## Cara Menjalankan Project

### 1. Clone Repository

```bash
git clone https://github.com/12410374-collab/Campus-Maintenance-System.git
```

Masuk ke folder project:

```bash
cd Campus-Maintenance-System
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi Environment

Buat file `.env` berdasarkan `.env.example`.

Isi API Key Gemini sesuai nama variabel yang tersedia di `.env.example`.

**Penting:** Jangan membagikan atau mengunggah file `.env` karena berisi informasi rahasia.

### 4. Jalankan JSON Server

Buka terminal pertama:

```bash
npx json-server --watch db.json --port 3001
```

JSON Server berjalan pada:

`http://localhost:3001`

### 5. Jalankan AI Proxy Server

Buka terminal kedua:

```bash
npm run ai-server
```

AI Proxy berjalan pada port `3002`.

### 6. Jalankan Frontend

Buka terminal ketiga:

```bash
npm run dev
```

Buka alamat yang ditampilkan oleh Vite di terminal, biasanya:

`http://localhost:5173`

**Catatan:** Jalankan ketiga layanan tersebut secara bersamaan agar fitur aplikasi dapat digunakan dengan baik. Jika port frontend berbeda, gunakan alamat yang ditampilkan oleh Vite.

## Struktur Project

```text
Campus-Maintenance-System/
│
├── public/
├── server/
├── src/
│   ├── context/
│   ├── pages/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── reporter/
│   │   └── technician/
│   ├── routes/
│   ├── services/
│   └── utils/
│
├── .env.example
├── .gitignore
├── db.json
├── index.html
├── package.json
└── README.md
```

## Project Information

- **Project Name:** Campus Maintenance Request System
- **Institution:** Universitas Klabat (UNKLAB)
- **Project Type:** Web-Based Application
- **Main Purpose:** Campus Facility Maintenance Management
- **AI Integration:** Google Gemini API

---

**Campus Maintenance Request System**  
Membantu proses pelaporan dan perbaikan fasilitas kampus menjadi lebih mudah, teratur, dan terpantau.