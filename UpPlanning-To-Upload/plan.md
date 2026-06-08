# Product Requirement Document (PRD) - Final Implementation

## Project Name: UpPlanning (Internal Content & Prompt Hub for LearnUp)

---

## 1. Executive Summary & Problem Statement

### 1.1 Overview

Sebagai *founder* startup **LearnUp** yang mengelola promosi di media sosial, tantangannya tidak hanya menjadwalkan konten harian dan merapikan aset visual, tetapi juga mengelola *prompt-prompt* AI (seperti untuk ChatGPT, Midjourney, dll) yang digunakan dalam proses pembuatan konten tersebut. Saat ini, sistem penyimpan *prompt* masih berada di lingkungan *localhost* dan perlu disatukan ke platform utama.

### 1.2 Objective

Membangun platform internal berbasis web bernama **UpPlanning** yang mengintegrasikan **Landing Page Pembuka**, **Kalender Ide Konten**, **Repositori Penyimpanan Aset Otomatis (Google Drive)**, dan **Pustaka Penyimpanan Prompt AI**. Proyek ini berjalan di atas ekosistem *free-tier* Netlify dan Firebase demi mencapai biaya **Rp 0 (Gratis)**.

---

## 2. Core Features & Functional Requirements

### 2.1 Feature 1: Welcome / Landing Page (Halaman Utama)

Halaman depan profesional sebagai gerbang pembuka sebelum masuk ke aplikasi utama.

* **FR-01.1:** Menampilkan judul/logo **UpPlanning** dengan desain minimalis, rapi, dan bersih.
* **FR-01.2:** Menyediakan tombol Call-to-Action (CTA) utama untuk masuk ke halaman Dashboard Utama.

### 2.2 Feature 2: Content Planning Calendar (Dashboard - Menu 1)

Kalender interaktif untuk mencatat ide dan rencana penayangan konten harian hingga bulanan.

* **FR-02.1:** Menampilkan visual kalender dalam *view* bulanan dan mingguan.
* **FR-02.2:** User dapat mengklik tanggal untuk menambahkan **Judul Ide** dan **Deskripsi Penjelas** konten yang tersimpan ke Firebase.
* **FR-02.3:** **Pengecualian:** Fitur kalender berdiri sendiri (tidak otomatis membuat folder di Google Drive jika hanya menulis ide) dan tidak memiliki sistem notifikasi otomatis.

### 2.3 Feature 3: Automated Asset Storage (Dashboard - Menu 2)

Halaman khusus untuk mengunggah aset visual jadi yang langsung tersinkronisasi ke Google Drive.

* **FR-03.1:** Form unggah file (*drag-and-drop*/klik) untuk gambar dan video pendek berdasarkan **Kategori Konten** (Poster Edukasi, Feed, Carousel, Reels, Stories).
* **FR-03.2:** Integrasi Google Drive API menggunakan tautan akses (*Access Link*) "Siapa saja yang memiliki link".
* **FR-03.3:** Kolom input catatan tambahan untuk file yang diunggah yang akan disimpan sebagai metadata teks di Firebase.

### 2.4 Feature 4: Prompt Storage System (Dashboard - Menu 3 - *NEW*)

Halaman khusus hasil migrasi proyek *localhost* untuk mengelola kumpulan *prompt* AI pembuat konten.

* **FR-04.1:** Form untuk menyimpan *prompt* baru yang berisi kolom: **Judul Prompt**, **Kategori/Tag** (misal: Copywriting, Ide Konten, Image Generation), dan **Isi Teks Prompt**.
* **FR-04.2:** Data *prompt* otomatis tersimpan dan ditarik dari database Firebase secara *real-time*.
* **FR-04.3:** Fitur tombol "Copy to Clipboard" (Salin) sekali klik di setiap kartu *prompt* agar user bisa langsung menempelkannya ke platform AI eksternal dengan cepat.
* **FR-04.4:** Fitur pencarian atau filter berdasarkan kategori untuk memudahkan pencarian teks *prompt* lama agar tetap rapi.

### 2.5 Feature 5: Global Dark/Light Mode Toggle

* **FR-05.1:** Tombol *toggle* di bagian *header/navbar* untuk mengubah skema warna website secara instan dan menyimpan preferensi terakhir di *Local Storage* browser.

---

## 3. Data Structure & Architecture

### 3.1 Google Drive (Asset Repository)

```text
LearnUp (Root Folder)
  ├── Poster Edukasi ──> [DD-MM-YYYY] ──> image.png
  ├── Feed           ──> [DD-MM-YYYY]
  └── [Kategori Lainnya]

```

### 3.2 Firebase (Database Text Center)

Firebase akan bertindak sebagai pusat penyimpanan seluruh data teks yang terbagi menjadi 3 rumpun data:

1. **Collection `calendar_events`:** Menyimpan id, tanggal, judul ide, deskripsi penjelas, dan label tema konten.
2. **Collection `prompts`:** Menyimpan id, judul prompt, kategori/tag, isi teks prompt, dan tanggal dibuat.
3. **Collection `asset_metadata`:** Menyimpan catatan tambahan dari aset gambar yang diunggah ke Google Drive (opsional).

---

## 4. Non-Functional Requirements & Tech Stack Constraints

* **Hosting:** Netlify (Free Tier).
* **Database (Teks Kalender & Prompt):** Firebase Firestore / Realtime Database (Free Tier).
* **Storage (File Visual):** Google Drive API via Public Access Link.
* **UI/UX Aesthetic:** Layout *dashboard* harus menggunakan sistem tab/navigasi samping (*sidebar*) yang rapi agar perpindahan antara menu Kalender, Storage, dan Prompt Storage terasa halus dan tidak membingungkan.