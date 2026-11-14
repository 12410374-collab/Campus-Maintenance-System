
import { useState } from "react";
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Bell,
  User,
  Wrench,
  MapPin,
  Clock,
  CheckCircle,
  Send
} from "lucide-react";
import "./index.css";

function App() {
  const [page, setPage] = useState("Dashboard");

  const [reports, setReports] = useState([
    {
      id: 1,
      title: "AC Ruang Kelas Tidak Berfungsi",
      location: "Gedung A - Ruang 201",
      category: "Elektronik",
      status: "Diproses"
    },
    {
      id: 2,
      title: "Lampu Koridor Rusak",
      location: "Gedung B - Lantai 2",
      category: "Kelistrikan",
      status: "Selesai"
    }
  ]);

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Elektronik");
  const [description, setDescription] = useState("");

  function submitReport(e) {
    e.preventDefault();

    setReports([
      {
        id: Date.now(),
        title,
        location,
        category,
        status: "Menunggu"
      },
      ...reports
    ]);

    setTitle("");
    setLocation("");
    setDescription("");
    setCategory("Elektronik");
    setPage("Riwayat Laporan");

    alert("Laporan berhasil dibuat!");
  }

  const menus = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Buat Laporan", icon: PlusCircle },
    { name: "Riwayat Laporan", icon: ClipboardList },
    { name: "Notifikasi", icon: Bell },
    { name: "Profil", icon: User }
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Wrench size={25} />
          </div>
          <div>
            <h2>CampusFix</h2>
            <small>Maintenance System</small>
          </div>
        </div>

        <p className="menu-label">MENU UTAMA</p>

        <nav>
          {menus.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`nav-item ${page === item.name ? "active" : ""}`}
                onClick={() => setPage(item.name)}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="avatar">S</div>
          <div>
            <strong>Student Reporter</strong>
            <small>Pengguna Kampus</small>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="breadcrumb">CampusFix / Reporter</span>
            <h2>{page}</h2>
          </div>

          <button
            className="notification-button"
            onClick={() => setPage("Notifikasi")}
          >
            <Bell size={20} />
          </button>
        </header>

        {page === "Dashboard" && (
          <section>
            <div className="welcome">
              <div>
                <span className="eyebrow">REPORTER DASHBOARD</span>
                <h1>Halo, Student! 👋</h1>
                <p>Laporkan masalah fasilitas kampus dengan mudah.</p>
              </div>

              <button
                className="primary-button"
                onClick={() => setPage("Buat Laporan")}
              >
                <PlusCircle size={18} />
                Buat Laporan
              </button>
            </div>

            <div className="stats">
              <div className="stat-card">
                <div className="stat-icon blue">
                  <ClipboardList />
                </div>
                <p>Total Laporan</p>
                <h2>{reports.length}</h2>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange">
                  <Clock />
                </div>
                <p>Sedang Diproses</p>
                <h2>
                  {reports.filter(r => r.status === "Diproses").length}
                </h2>
              </div>

              <div className="stat-card">
                <div className="stat-icon green">
                  <CheckCircle />
                </div>
                <p>Selesai</p>
                <h2>
                  {reports.filter(r => r.status === "Selesai").length}
                </h2>
              </div>
            </div>

            <div className="section-heading">
              <div>
                <h3>Laporan Terbaru</h3>
                <p>Pantau perkembangan laporan fasilitas kampus.</p>
              </div>

              <button
                className="text-button"
                onClick={() => setPage("Riwayat Laporan")}
              >
                Lihat Semua
              </button>
            </div>

            <ReportTable reports={reports.slice(0, 4)} />
          </section>
        )}

        {page === "Buat Laporan" && (
          <section className="content-card">
            <h3>Buat Laporan Baru</h3>
            <p className="muted">
              Isi informasi fasilitas kampus yang bermasalah.
            </p>

            <form onSubmit={submitReport} className="report-form">
              <label>Judul Laporan</label>
              <input
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Contoh: AC ruang kelas rusak"
              />

              <label>Lokasi Kerusakan</label>
              <input
                required
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Contoh: Gedung A, Ruang 201"
              />

              <label>Kategori</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option>Elektronik</option>
                <option>Kelistrikan</option>
                <option>Air dan Sanitasi</option>
                <option>Furnitur</option>
                <option>Bangunan</option>
                <option>Lainnya</option>
              </select>

              <label>Deskripsi</label>
              <textarea
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Jelaskan masalah yang ditemukan..."
                rows="5"
              />

              <button className="primary-button" type="submit">
                <Send size={17} />
                Kirim Laporan
              </button>
            </form>
          </section>
        )}

        {page === "Riwayat Laporan" && (
          <section>
            <div className="section-heading">
              <div>
                <h3>Riwayat Laporan</h3>
                <p>Semua laporan yang sudah kamu buat.</p>
              </div>
            </div>

            <ReportTable reports={reports} />
          </section>
        )}

        {page === "Notifikasi" && (
          <section className="content-card">
            <h3>Notifikasi</h3>

            <div className="notice">
              <CheckCircle color="#16a36a" />
              <div>
                <strong>Laporan kamu sudah diperbarui</strong>
                <p>Status Lampu Koridor Rusak telah selesai.</p>
              </div>
            </div>

            <div className="notice">
              <Clock color="#e99a32" />
              <div>
                <strong>Laporan sedang diproses</strong>
                <p>AC Ruang Kelas Tidak Berfungsi sedang ditangani.</p>
              </div>
            </div>
          </section>
        )}

        {page === "Profil" && (
          <section className="content-card profile">
            <div className="profile-avatar">S</div>
            <h3>Student Reporter</h3>
            <p className="muted">Pengguna CampusFix</p>
            <p>Peran: Reporter</p>
            <p>Status: Aktif</p>
          </section>
        )}
      </main>
    </div>
  );
}

function ReportTable({ reports }) {
  return (
    <div className="table-card">
      <table>
        <thead>
          <tr>
            <th>Nama Laporan</th>
            <th>Lokasi</th>
            <th>Kategori</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {reports.map(report => (
            <tr key={report.id}>
              <td><strong>{report.title}</strong></td>
              <td><MapPin size={14} /> {report.location}</td>
              <td>{report.category}</td>
              <td>
                <span className={`status ${report.status.toLowerCase()}`}>
                  {report.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {reports.length === 0 && (
        <p className="empty">Belum ada laporan.</p>
      )}
    </div>
  );
}

export default App;
