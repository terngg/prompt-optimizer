import type { IntentName, TaskIR } from '../../shared/src/index.js';
export interface OptimizationPass {
  id: string;
  domains: IntentName[];
  reason: string;
  confidence: number;
  benefit: number;
  en: string;
  idText: string;
  covered?: RegExp;
  blocked?: RegExp;
}
const coding: IntentName[] = [
  'coding',
  'debugging',
  'frontend',
  'backend',
  'refactoring',
  'devops',
];
export const passRegistry: readonly OptimizationPass[] = [
  {
    id: 'debugging',
    domains: ['debugging'],
    reason: 'A failure needs evidence before a fix.',
    confidence: 0.9,
    benefit: 10,
    en: 'Inspect the relevant implementation, reproduce the failure, and identify its root cause before changing code.',
    idText:
      'Periksa implementasi terkait, reproduksi kegagalan, dan temukan akar masalah sebelum mengubah kode.',
    covered: /reproduce|root cause|reproduksi/i,
  },
  {
    id: 'minimal-change',
    domains: ['debugging', 'refactoring', 'ui_ux'],
    reason: 'Keep a targeted change within the requested scope.',
    confidence: 0.9,
    benefit: 9,
    en: 'Make the smallest change that meets the request; avoid unrelated refactoring.',
    idText:
      'Buat perubahan terkecil yang memenuhi permintaan; hindari refaktor yang tidak terkait.',
    covered: /smallest|minimal change|unrelated|terkecil/i,
  },
  {
    id: 'repository-awareness',
    domains: coding,
    reason:
      'Existing conventions are stronger evidence than invented architecture.',
    confidence: 0.85,
    benefit: 8,
    en: 'Inspect project instructions and existing patterns; reuse the current stack and components where suitable.',
    idText:
      'Periksa instruksi proyek dan pola yang ada; gunakan kembali stack dan komponen yang sesuai.',
    covered:
      /existing patterns|project instructions|repository conventions|pola yang ada/i,
  },
  {
    id: 'anti-overengineering',
    domains: ['coding', 'frontend', 'backend', 'agent'],
    reason: 'No evidence justifies extra architecture.',
    confidence: 0.8,
    benefit: 7,
    en: 'Keep the implementation proportional; add abstractions or dependencies only when the task needs them.',
    idText:
      'Jaga implementasi tetap proporsional; tambah abstraksi atau dependensi hanya bila dibutuhkan tugas.',
    covered:
      /overengineer|abstractions|dependenc|abstraksi|dependensi|smallest|minimal change|unrelated/i,
  },
  {
    id: 'verification',
    domains: [...coding, 'testing'],
    reason: 'A code change needs a relevant observable check.',
    confidence: 0.85,
    benefit: 8,
    en: 'Run relevant checks and report what changed, what passed, and any verification limits.',
    idText:
      'Jalankan pemeriksaan terkait dan laporkan perubahan, hasil, serta batas verifikasi.',
    covered:
      /run (?:the |relevant |all )?(?:tests|checks)|verification|jalankan pemeriksaan/i,
    blocked:
      /\b(?:no|skip|without) (?:tests|testing|checks)|do not (?:run|add|write) (?:tests|checks)/i,
  },
  {
    id: 'regression-testing',
    domains: ['debugging', 'testing'],
    reason: 'A reproducible defect benefits from a regression check.',
    confidence: 0.8,
    benefit: 8,
    en: 'Add or update a focused regression test when the existing test setup supports it.',
    idText:
      'Tambah atau perbarui tes regresi terfokus jika didukung konfigurasi tes yang ada.',
    covered: /regression|regresi/i,
    blocked:
      /\b(?:no|skip|without) (?:tests|testing)|do not (?:add|write|run) (?:any )?tests|jangan.*tes/i,
  },
  {
    id: 'responsive-design',
    domains: ['frontend'],
    reason: 'A page-level UI should work across available viewport sizes.',
    confidence: 0.8,
    benefit: 8,
    en: 'Make the requested interface usable on mobile and desktop within its existing design.',
    idText:
      'Buat antarmuka yang diminta nyaman digunakan di seluler dan desktop sesuai desainnya.',
    covered: /responsive|mobile|viewport|seluler/i,
    blocked:
      /desktop.only|mobile.only|do not.*responsive|\b(?:this|the|one|single) button\b/i,
  },
  {
    id: 'accessibility',
    domains: ['frontend', 'ui_ux'],
    reason: 'Interactive UI needs usable controls.',
    confidence: 0.85,
    benefit: 8,
    en: 'Use semantic controls, clear labels, keyboard access, and readable contrast.',
    idText:
      'Gunakan kontrol semantik, label jelas, akses keyboard, dan kontras yang terbaca.',
    covered: /accessibility|accessible|keyboard|semantic|aksesibilitas/i,
  },
  {
    id: 'interaction-states',
    domains: ['frontend'],
    reason: 'Data-driven interfaces need meaningful states.',
    confidence: 0.8,
    benefit: 8,
    en: 'Handle relevant loading, error, and empty states; label any mock data clearly.',
    idText:
      'Tangani status loading, error, dan kosong yang relevan; tandai data contoh dengan jelas.',
    covered: /loading.*(?:error|empty)|status.*kosong/i,
    blocked: /static only|no data|\b(?:this|the|one|single) button\b/i,
  },
  {
    id: 'visual-consistency',
    domains: ['frontend', 'ui_ux'],
    reason: 'Visual changes should fit the product context.',
    confidence: 0.8,
    benefit: 6,
    en: 'Use a clear visual hierarchy and consistent spacing, typography, and existing design tokens.',
    idText:
      'Gunakan hierarki visual yang jelas serta spasi, tipografi, dan token desain yang konsisten.',
    covered: /typography|design tokens|visual hierarchy|tipografi/i,
  },
  {
    id: 'research-sources',
    domains: ['research'],
    reason: 'Research conclusions need traceable evidence.',
    confidence: 0.9,
    benefit: 10,
    en: 'Use relevant primary sources, cite the evidence, and distinguish facts from inference; check dates for changing claims.',
    idText:
      'Gunakan sumber primer yang relevan, cantumkan bukti, bedakan fakta dari inferensi, dan periksa tanggal untuk klaim yang berubah.',
    covered: /primary sources|cite.*sources|sumber primer/i,
    blocked: /no (?:browsing|network)|offline only|do not (?:browse|search)/i,
  },
  {
    id: 'comparison-framework',
    domains: ['research'],
    reason: 'A recommendation depends on the user’s criteria.',
    confidence: 0.8,
    benefit: 8,
    en: 'Compare options against the stated use case, constraints, and trade-offs; identify missing decision criteria instead of inventing them.',
    idText:
      'Bandingkan pilihan berdasarkan kebutuhan, batasan, dan kompromi; identifikasi kriteria keputusan yang belum ada tanpa mengarangnya.',
    covered: /trade.offs|comparison criteria|kriteria/i,
  },
  {
    id: 'audience-awareness',
    domains: ['writing', 'marketing', 'education'],
    reason: 'Wording depends on audience and purpose.',
    confidence: 0.75,
    benefit: 7,
    en: 'Match the audience, purpose, and requested tone; flag missing audience details only when they materially affect the result.',
    idText:
      'Sesuaikan audiens, tujuan, dan nada yang diminta; tandai detail audiens yang hilang bila berdampak penting.',
    covered: /audience|tone|audiens|nada/i,
  },
  {
    id: 'seo',
    domains: ['seo'],
    reason: 'Discoverability is explicitly part of the task.',
    confidence: 0.85,
    benefit: 8,
    en: 'Align content with search intent and useful page structure; avoid keyword stuffing and unsupported ranking promises.',
    idText:
      'Sesuaikan konten dengan maksud pencarian dan struktur halaman; hindari penjejalan kata kunci serta janji peringkat tanpa dasar.',
    covered: /search intent|keyword stuffing|maksud pencarian/i,
  },
  {
    id: 'brand-consistency',
    domains: ['marketing'],
    reason: 'Marketing claims need product and brand grounding.',
    confidence: 0.8,
    benefit: 7,
    en: 'Use supplied product facts and brand guidance; do not invent testimonials, metrics, or guarantees.',
    idText:
      'Gunakan fakta produk dan panduan merek yang tersedia; jangan mengarang testimoni, metrik, atau jaminan.',
    covered: /brand guidance|testimonials|panduan merek/i,
  },
  {
    id: 'data-validation',
    domains: ['data_analysis'],
    reason: 'Analysis depends on data quality and assumptions.',
    confidence: 0.85,
    benefit: 9,
    en: 'Check schema, missing values, and units; state assumptions and use reproducible calculations without inventing data.',
    idText:
      'Periksa skema, nilai kosong, dan satuan; nyatakan asumsi dan gunakan perhitungan yang dapat direproduksi tanpa mengarang data.',
    covered: /missing values|data quality|nilai kosong/i,
  },
  {
    id: 'agent-workflow',
    domains: ['agent', 'planning'],
    reason: 'A broad task benefits from bounded steps and stopping conditions.',
    confidence: 0.8,
    benefit: 8,
    en: 'Prioritize a bounded set of steps, use only available tools, and verify each outcome; surface blockers without expanding authorization.',
    idText:
      'Prioritaskan langkah yang terbatas, gunakan alat yang tersedia, dan verifikasi hasil; laporkan hambatan tanpa memperluas izin.',
    covered: /stopping conditions|bounded|authorization|batas izin/i,
  },
  {
    id: 'security-review',
    domains: ['security'],
    reason: 'A security task needs evidence and a defined boundary.',
    confidence: 0.85,
    benefit: 9,
    en: 'Stay within the authorized scope, document reproducible findings and impact, and verify proposed mitigations.',
    idText:
      'Tetap dalam lingkup yang diizinkan, dokumentasikan temuan beserta dampaknya, dan verifikasi mitigasi.',
    covered: /authorized scope|mitigations|lingkup yang diizinkan/i,
  },
  {
    id: 'code-review',
    domains: ['code_review'],
    reason: 'A review should prioritize actionable defects.',
    confidence: 0.85,
    benefit: 9,
    en: 'Prioritize concrete defects and regressions with file references and evidence; distinguish findings from optional style suggestions.',
    idText:
      'Prioritaskan cacat dan regresi konkret dengan referensi file serta bukti; bedakan temuan dari saran gaya opsional.',
    covered: /concrete defects|file references|regressions/i,
  },
  {
    id: 'output-contract',
    domains: ['documentation', 'writing'],
    reason: 'The requested deliverable should be clear.',
    confidence: 0.7,
    benefit: 5,
    en: 'Follow the requested output format and length; do not add a new format requirement if none is needed.',
    idText:
      'Ikuti format dan panjang keluaran yang diminta; jangan tambah kewajiban format bila tidak dibutuhkan.',
    covered: /format|length|panjang/i,
  },
  {
    id: 'media-brief',
    domains: ['image_generation', 'video_generation'],
    reason: 'Media generation needs the supplied visual intent.',
    confidence: 0.8,
    benefit: 8,
    en: 'Preserve the requested subject, composition, style, and medium; identify missing visual constraints without inventing a new concept.',
    idText:
      'Pertahankan subjek, komposisi, gaya, dan medium yang diminta; identifikasi batasan visual yang hilang tanpa mengarang konsep baru.',
    covered: /composition|aspect ratio|komposisi/i,
  },
];
export function passApplies(pass: OptimizationPass, ir: TaskIR): boolean {
  const domain = ir.intent.primary;
  // Research about software is not authorization to implement it.
  const active =
    domain === 'research' || domain === 'code_review' || domain === 'education'
      ? [domain]
      : [domain, ...ir.intent.secondary];
  return pass.domains.some((d) => active.includes(d));
}
