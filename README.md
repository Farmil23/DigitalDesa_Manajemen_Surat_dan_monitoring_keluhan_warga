# Desa Digital (Digital Village Hub)

Aplikasi *full-stack* berbasis **Spring Boot** (Backend) dan **React + Vite** (Frontend) untuk manajemen data dan layanan Desa Digital.

## Prasyarat (Prerequisites)

Sebelum menjalankan aplikasi, pastikan komputer Anda sudah terinstal:
1. **Java Development Kit (JDK)** versi 21 atau terbaru.
2. **Node.js** (direkomendasikan versi 20+ atau LTS) beserta **npm**.
3. **MySQL Server** (versi 8.0+).
4. IDE atau Text Editor (seperti IntelliJ IDEA, Eclipse, atau Visual Studio Code).

---

## 1. Persiapan Database

1. Buka MySQL client Anda (misalnya MySQL Workbench, phpMyAdmin, atau via terminal).
2. Buat sebuah database baru dengan nama `desa_digital`:
   ```sql
   CREATE DATABASE desa_digital;
   ```
3. (Opsional) Jika konfigurasi *username*, *password*, atau *port* MySQL Anda berbeda, silakan ubah pada file `src/main/resources/application.properties` di bagian ini:
   ```properties
   spring.datasource.url=jdbc:mysql://127.0.0.1:3307/desa_digital?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Jakarta
   spring.datasource.username=root
   spring.datasource.password=123
   ```
   *Catatan: Pastikan port MySQL sesuai (bawaan biasanya `3306`, di konfigurasi saat ini tertulis `3307`).*

---

## 2. Menjalankan Backend (Spring Boot API)

Aplikasi Spring Boot akan berjalan di `http://localhost:5000`.

### Melalui IDE (Rekomendasi)
1. Buka folder utama proyek (`DesaDigital`) di IDE pilihan Anda (IntelliJ / VS Code / Eclipse).
2. Tunggu hingga Maven selesai melakukan sinkronisasi dependensi.
3. Cari file utama `DemoApplication.java` (di `src/main/java/com/DigitalVillageHub/demo/`).
4. Klik **Run** atau jalankan fungsi `main`.

### Melalui Terminal (Menggunakan Maven Wrapper)
1. Buka terminal dan pastikan Anda berada di direktori *root* proyek (`DesaDigital`).
2. Jalankan perintah berikut:
   - **Di Windows:**
     ```bash
     .\mvnw.cmd spring-boot:run
     ```
   - **Di Mac/Linux:**
     ```bash
     ./mvnw spring-boot:run
     ```
3. Tunggu hingga muncul tulisan `✅ Digital Village Hub API Server started` dan `📍 API Server ready at http://localhost:5000`.

---

## 3. Menjalankan Frontend (React + Vite)

Aplikasi *frontend* berada di dalam folder `frontend/` dan secara bawaan berjalan di `http://localhost:5173`.

1. Buka **tab/jendela terminal baru** (biarkan terminal Backend tetap menyala).
2. Pindah ke direktori frontend:
   ```bash
   cd frontend
   ```
3. Lakukan instalasi semua dependensi *package*:
   ```bash
   npm install
   ```
   *(Tips: Jika Anda menemukan error `Cannot find native binding` di Windows, jalankan perintah `Remove-Item -Recurse -Force node_modules`, lalu `Remove-Item -Force package-lock.json`, dan jalankan `npm install` kembali).*
4. Nyalakan server *development* Vite:
   ```bash
   npm run dev
   ```
5. Buka tautan lokal yang muncul (biasanya `http://localhost:5173`) di *browser* favorit Anda untuk mulai mencoba aplikasi!

---

## Troubleshooting

- **Error saat instalasi NPM**: Hapus folder `node_modules` dan file `package-lock.json`, lalu lakukan instalasi ulang `npm install`.
- **Database Connection Refused**: Pastikan *service* MySQL sudah berjalan, dan sesuaikan *port/password* pada `application.properties` dengan yang ada di sistem Anda.
- **Port In Use (5000 atau 5173)**: Tutup aplikasi atau *service* lain yang menggunakan port tersebut.
