// URL Deploy Apps Script Terbaru
const API_URL = 'https://script.google.com/macros/s/AKfycbztLUTKiUt4by4zK5Nr-AZylVr2TW8gCr8YVCWkbC5dWjnyaIf8Ig-UFRJ_FmN6Ay4/exec'; 

const timeSpan = document.getElementById('current-time');
const statusIndicator = document.querySelector('.status-indicator');
const statusText = document.getElementById('status-text');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const loadingDiv = document.getElementById('loading');
const resultsSection = document.getElementById('results');
const errorMsg = document.getElementById('error-msg');
const searchBtn = document.getElementById('search-btn');

// Waktu Real-time
function updateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' };
    timeSpan.innerText = now.toLocaleDateString('id-ID', options);
}
setInterval(updateTime, 1000);
updateTime();

// Cek Koneksi Database Langsung
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

// Handle Pencarian
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nama = searchInput.value.trim();
    if(!nama) return;

    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mencari...';
    searchBtn.disabled = true;
    loadingDiv.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    errorMsg.classList.add('hidden');

    try {
        const response = await fetch(`${API_URL}?action=search&name=${encodeURIComponent(nama)}`);
        const result = await response.json();

        loadingDiv.classList.add('hidden');

        if(result.success && result.data.history.length > 0) {
            resultsSection.style.opacity = '0';
            resultsSection.classList.remove('hidden');
            
            // Set Identitas Nama dan Jumlah Riwayat
            document.getElementById('res-nama').innerText = result.data.nama;
            document.getElementById('res-count').innerHTML = `<i class="fas fa-list-ol"></i> Ditemukan ${result.data.history.length} Riwayat Asesmen`;

            // Set Data Profil Tambahan (Diambil dari baris data pertama/terakhir anak tersebut)
            // Karena datanya sama untuk setiap baris anak, kita cukup ambil index [0]
            const firstData = result.data.history[0];
            document.getElementById('res-minat').innerText = firstData.minatBakat || '-';
            document.getElementById('res-catatan').innerText = firstData.catatanKriminogenik || '-';

            // Render Table History (Hanya fokus pada Tanggal dan Nilai)
            const tbody = document.getElementById('res-history-body');
            tbody.innerHTML = ''; 

            result.data.history.forEach((item, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td data-label="No.">${index + 1}</td>
                    <td data-label="Tgl Asesmen"><span class="badge badge-date"><i class="far fa-calendar-alt"></i> ${item.tanggalAsesmen}</span></td>
                    <td data-label="RRI & Krim"><span class="badge badge-score">${item.nilaiRRI}</span></td>
                    <td data-label="Hasil IPPA"><span class="badge badge-ippa">${item.hasilIPPA}</span></td>
                `;
                tbody.appendChild(tr);
            });
            
            // Animasi masuk
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
        errorMsg.innerHTML = '<i class="fas fa-wifi"></i> Terjadi kesalahan jaringan. Pastikan URL Apps Script sudah benar dan internet stabil.';
        errorMsg.classList.remove('hidden');
    } finally {
        searchBtn.innerHTML = '<i class="fas fa-search"></i> Cari Data';
        searchBtn.disabled = false;
    }
});