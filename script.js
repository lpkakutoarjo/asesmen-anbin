// PENTING: Ganti URL di bawah ini dengan URL Web App dari Deploy TERBARU Anda!
const API_URL = 'https://script.google.com/macros/s/AKfycbxmsUK-5lXaZAG9CtRMTjATcfWCIJoZ3kENexE6Ix3dRvU5yZKdEQ4QxhDxpFAuEDfu/exec'; 

const timeSpan = document.getElementById('current-time');
const statusIndicator = document.querySelector('.status-indicator');
const statusText = document.getElementById('status-text');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const loadingDiv = document.getElementById('loading');
const resultsSection = document.getElementById('results');
const errorMsg = document.getElementById('error-msg');
const searchBtn = document.getElementById('search-btn');

// 1. Waktu Real-time Indonesia
function updateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' };
    timeSpan.innerText = now.toLocaleDateString('id-ID', options);
}
setInterval(updateTime, 1000);
updateTime();

// 2. Cek Koneksi Database (Ping Action)
async function checkConnection() {
    try {
        const response = await fetch(`${API_URL}?action=ping`);
        const data = await response.json();
        if(data.status === 'connected') {
            statusIndicator.classList.add('connected');
            statusText.innerText = 'Database Terhubung';
        } else {
            throw new Error('Gagal');
        }
    } catch (error) {
        statusIndicator.classList.remove('connected');
        statusText.innerText = 'Koneksi Terputus / Setup URL Belum Selesai';
    }
}
checkConnection();

// 3. Handle Pencarian & Sinkronisasi Struktur Database Baru (Kolom A-H)
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nama = searchInput.value.trim();
    if(!nama) return;

    // Reset UI State
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mencari...';
    searchBtn.disabled = true;
    loadingDiv.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    resultsSection.style.opacity = '0';
    errorMsg.classList.add('hidden');

    try {
        const response = await fetch(`${API_URL}?action=search&name=${encodeURIComponent(nama)}`);
        const result = await response.json();

        loadingDiv.classList.add('hidden');

        if(result.success && result.data.history.length > 0) {
            resultsSection.classList.remove('hidden');
            
            // --- UPDATE SIDEBAR PROFIL (KIRI) ---
            document.getElementById('res-nama').innerText = result.data.nama;
            
            // Gabungkan Minat & Bakat Unik dari Kolom G
            const minatUnik = [...new Set(result.data.history.map(h => h.minatBakat))].filter(m => m && m !== '-');
            document.getElementById('res-minat').innerText = minatUnik.length > 0 ? minatUnik.join(", ") : "-";

            // --- UPDATE TABEL RIWAYAT (KANAN) ---
            document.getElementById('res-count').innerHTML = `<i class="fas fa-list-ol"></i> Ditemukan ${result.data.history.length} Data`;
            
            const tbody = document.getElementById('res-history-body');
            tbody.innerHTML = ''; 

            result.data.history.forEach((item, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="col-center" style="font-size: 0.9rem; color: #64748b;">${index + 1}</td>
<td class="col-center">
        <span class="badge badge-date">
            <i class="far fa-calendar-alt"></i> ${item.tanggalAsesmen}
        </span>
    </td>
                    <td class="col-center">
                        <span class="badge badge-score" style="font-weight: 600;">${item.nilaiRRIDanKrim}</span>
                    </td>
                    <td class="col-center">
                        <span class="badge badge-ippa" style="font-weight: 600;">${item.hasilIPPA}</span>
                    </td>
                    <td style="font-size: 0.85rem; line-height: 1.6; color: #334155; min-width: 250px; text-align: left;">
                        ${item.catatanKriminogenik || '-'}
                    </td>
                    <td style="font-size: 0.85rem; line-height: 1.6; color: #dc3545; font-weight: 500; min-width: 250px; text-align: left;">
                        ${item.catatanPelanggaran || '-'}
                    </td>
                `;
                tbody.appendChild(tr);
            });
            
            // Animasi Fade-In
            setTimeout(() => {
                resultsSection.style.transition = 'opacity 0.5s ease';
                resultsSection.style.opacity = '1';
            }, 50);

        } else {
            errorMsg.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${result.message || 'Data Anak Binaan tidak ditemukan'}`;
            errorMsg.classList.remove('hidden');
        }
    } catch (error) {
        loadingDiv.classList.add('hidden');
        errorMsg.innerHTML = '<i class="fas fa-wifi"></i> Terjadi kesalahan jaringan. Pastikan URL Apps Script benar dan internet stabil.';
        errorMsg.classList.remove('hidden');
    } finally {
        searchBtn.innerHTML = '<i class="fas fa-search"></i> Cari Data';
        searchBtn.disabled = false;
    }
});
