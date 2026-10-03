# Actual local before/after examples

Generated with v0.1.0 local mode, balanced profile. No model or network was used. Guidance is conditional and lower priority than explicit requirements. Estimates cover instruction text, not the complete structured MCP response.

## Coding

Before:

```text
fix auth
```

After:

```text
fix auth

Execution guidance (recommendations only; explicit user, project, developer, and system instructions take precedence):
- Inspect the relevant implementation, reproduce the failure, and identify its root cause before changing code.
- Make the smallest change that meets the request; avoid unrelated refactoring.
- Inspect project instructions and existing patterns; reuse the current stack and components where suitable.
- Run relevant checks and report what changed, what passed, and any verification limits.
- Add or update a focused regression test when the existing test setup supports it.
```

Intent: debugging. Applied passes: debugging, minimal-change, repository-awareness, verification, regression-testing. Estimated tokens: 2 → 151.

## UI

Before:

```text
buat dashboard ai keren pake nextjs
```

After:

```text
buat dashboard ai keren pake nextjs

Panduan pelaksanaan (rekomendasi saja; instruksi eksplisit pengguna, proyek, developer, dan sistem tetap diutamakan):
- Buat perubahan terkecil yang memenuhi permintaan; hindari refaktor yang tidak terkait.
- Periksa instruksi proyek dan pola yang ada; gunakan kembali stack dan komponen yang sesuai.
- Jaga implementasi tetap proporsional; tambah abstraksi atau dependensi hanya bila dibutuhkan tugas.
- Jalankan pemeriksaan terkait dan laporkan perubahan, hasil, serta batas verifikasi.
- Buat antarmuka yang diminta nyaman digunakan di seluler dan desktop sesuai desainnya.
- Gunakan kontrol semantik, label jelas, akses keyboard, dan kontras yang terbaca.
- Tangani status loading, error, dan kosong yang relevan; tandai data contoh dengan jelas.
```

Intent: coding. Applied passes: minimal-change, repository-awareness, anti-overengineering, verification, responsive-design, accessibility, interaction-states. Estimated tokens: 9 → 197.

## Research

Before:

```text
cari database terbaik buat saas gw
```

After:

```text
cari database terbaik buat saas gw

Panduan pelaksanaan (rekomendasi saja; instruksi eksplisit pengguna, proyek, developer, dan sistem tetap diutamakan):
- Gunakan sumber primer yang relevan, cantumkan bukti, bedakan fakta dari inferensi, dan periksa tanggal untuk klaim yang berubah.
- Bandingkan pilihan berdasarkan kebutuhan, batasan, dan kompromi; identifikasi kriteria keputusan yang belum ada tanpa mengarangnya.
```

Intent: research. Applied passes: research-sources, comparison-framework. Estimated tokens: 9 → 105.

## Agent

Before:

```text
rapihin project ini dan fix semuanya
```

After:

```text
rapihin project ini dan fix semuanya

Panduan pelaksanaan (rekomendasi saja; instruksi eksplisit pengguna, proyek, developer, dan sistem tetap diutamakan):
- Periksa implementasi terkait, reproduksi kegagalan, dan temukan akar masalah sebelum mengubah kode.
- Buat perubahan terkecil yang memenuhi permintaan; hindari refaktor yang tidak terkait.
- Periksa instruksi proyek dan pola yang ada; gunakan kembali stack dan komponen yang sesuai.
- Jaga implementasi tetap proporsional; tambah abstraksi atau dependensi hanya bila dibutuhkan tugas.
- Jalankan pemeriksaan terkait dan laporkan perubahan, hasil, serta batas verifikasi.
- Tambah atau perbarui tes regresi terfokus jika didukung konfigurasi tes yang ada.
- Prioritaskan langkah yang terbatas, gunakan alat yang tersedia, dan verifikasi hasil; laporkan hambatan tanpa memperluas izin.
```

Intent: debugging. Applied passes: debugging, minimal-change, repository-awareness, anti-overengineering, verification, regression-testing, agent-workflow. Estimated tokens: 9 → 211.

## Skip

Before:

```text
What is 2 + 2?
```

After:

```text
What is 2 + 2?
```

Intent: general. Applied passes: none. Estimated tokens: 4 → 4.
