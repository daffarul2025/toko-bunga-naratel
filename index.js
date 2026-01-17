const express = require('express');
const { Pool } = require('pg');
const app = express();

// 1. Database Configuration
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'db_toko_bunga',
    password: 'kamucantik12',
    port: 5432,
});

app.use(express.json());

// 2. API Endpoint
app.get('/api/flowers', async (req, res) => {
    const { kategori } = req.query;
    try {
        let query = 'SELECT * FROM flowers';
        let params = [];

        if (kategori && kategori !== 'Semua') {
            query += ' WHERE kategori = $1';
            params.push(kategori);
        }
        
        query += ' ORDER BY id ASC';
        const result = await pool.query(query, params);
        
        // Jika DB kosong, pakai fallback data dengan gambar yang benar
        if (result.rows.length === 0 && (!kategori || kategori === 'Semua')) {
            const fallbackData = [
                { 
                    id: 1, 
                    nama_bunga: 'Mawar Merah', 
                    kategori: 'Mawar', 
                    harga: 50000, 
                    stok: 10, 
                    gambar: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=300&fit=crop' 
                },
                { 
                    id: 2, 
                    nama_bunga: 'Melati Putih', 
                    kategori: 'Melati', 
                    harga: 35000, 
                    stok: 15, 
                    gambar: 'https://images.unsplash.com/photo-159603903067-bf0942abc837?w=400&h=300&fit=crop' 
                },
                { 
                    id: 3, 
                    nama_bunga: 'Anggrek Bulan', 
                    kategori: 'Anggrek', 
                    harga: 125000, 
                    stok: 5, 
                    gambar: 'https://images.unsplash.com/photo-1566996694954-90b052c413c4?w=400&h=300&fit=crop' 
                }
            ];
            return res.json(fallbackData);
        }
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Halaman Utama dengan Sidebar SIMPLE
app.get('/toko', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Toko Bunga Naratel</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }

            body {
                background: #fdf2f8;
                color: #333;
                min-height: 100vh;
                position: relative;
            }

            /* OVERLAY untuk tutup sidebar */
            .overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.3);
                z-index: 998;
            }

            .overlay.active {
                display: block;
            }

            /* HAMBURGER BUTTON SIMPLE */
            .hamburger-btn {
                position: fixed;
                top: 20px;
                left: 20px;
                background: #db2777;
                color: white;
                border: none;
                width: 50px;
                height: 50px;
                border-radius: 10px;
                font-size: 1.5rem;
                cursor: pointer;
                z-index: 1001;
                box-shadow: 0 4px 10px rgba(219, 39, 119, 0.3);
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .hamburger-btn:hover {
                background: #be185d;
            }

            /* SIDEBAR SEDERHANA */
            .sidebar {
                width: 250px;
                background: white;
                color: #333;
                position: fixed;
                height: 100vh;
                left: -250px;
                top: 0;
                transition: left 0.3s ease;
                z-index: 999;
                box-shadow: 5px 0 20px rgba(0, 0, 0, 0.1);
                overflow-y: auto;
            }

            .sidebar.open {
                left: 0;
            }

            .logo-section {
                padding: 30px 20px;
                background: linear-gradient(135deg, #db2777, #be185d);
                color: white;
                text-align: center;
                border-bottom: 3px solid #fce7f3;
            }

            .logo-section h1 {
                font-size: 1.8rem;
                margin-bottom: 5px;
            }

            .logo-section p {
                font-size: 0.9rem;
                opacity: 0.9;
            }

            /* MENU SIMPLE */
            .menu {
                padding: 20px 0;
            }

            .menu-title {
                padding: 10px 20px;
                color: #6b7280;
                font-size: 0.9rem;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 10px;
            }

            .menu-item {
                padding: 15px 25px;
                display: flex;
                align-items: center;
                cursor: pointer;
                transition: all 0.2s;
                border-left: 4px solid transparent;
            }

            .menu-item:hover {
                background: #fdf2f8;
                color: #db2777;
            }

            .menu-item.active {
                background: #fce7f3;
                color: #db2777;
                border-left: 4px solid #db2777;
                font-weight: 600;
            }

            .menu-item i {
                margin-right: 12px;
                width: 20px;
                text-align: center;
            }

            /* MAIN CONTENT */
            .main-content {
                padding: 20px;
                transition: margin-left 0.3s ease;
                min-height: 100vh;
            }

            .header {
                text-align: center;
                margin-bottom: 40px;
                padding: 30px 20px;
                background: white;
                border-radius: 20px;
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
                max-width: 1000px;
                margin-left: auto;
                margin-right: auto;
            }

            .header h2 {
                color: #db2777;
                font-size: 2.2rem;
                margin-bottom: 10px;
            }

            .header p {
                color: #6b7280;
                font-size: 1.1rem;
            }

            /* FLOWER CARDS */
            .flowers-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 25px;
                max-width: 1000px;
                margin: 0 auto;
            }

            .card {
                background: white;
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
                transition: transform 0.3s;
                border: 1px solid #fce7f3;
            }

            .card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
            }

            .card-img {
                width: 100%;
                height: 200px;
                object-fit: cover;
                background: #f3f4f6; /* Fallback jika gambar error */
                display: block;
            }

            .card-info {
                padding: 20px;
                text-align: center;
            }

            .card-info h3 {
                color: #1f2937;
                font-size: 1.3rem;
                margin-bottom: 10px;
                min-height: 40px;
            }

            .card-price {
                color: #db2777;
                font-weight: bold;
                font-size: 1.3rem;
                margin-bottom: 10px;
            }

            .card-stock {
                color: #6b7280;
                font-size: 0.95rem;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 5px;
            }

            .buy-btn {
                width: 100%;
                padding: 12px;
                border: none;
                background: #db2777;
                color: white;
                font-weight: bold;
                font-size: 1rem;
                cursor: pointer;
                transition: background 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }

            .buy-btn:hover {
                background: #be185d;
            }

            /* LOADING STATE */
            .loading {
                text-align: center;
                padding: 50px;
                font-size: 1.2rem;
                color: #6b7280;
                grid-column: 1 / -1;
            }

            .spinner {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #db2777;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* RESPONSIVE */
            @media (max-width: 768px) {
                .sidebar {
                    width: 220px;
                    left: -220px;
                }
                
                .hamburger-btn {
                    left: 15px;
                    top: 15px;
                    width: 45px;
                    height: 45px;
                }
                
                .header {
                    padding: 20px;
                    margin-top: 60px;
                }
                
                .header h2 {
                    font-size: 1.8rem;
                }
                
                .flowers-grid {
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 20px;
                }
            }

            @media (max-width: 480px) {
                .flowers-grid {
                    grid-template-columns: 1fr;
                }
                
                .header {
                    margin-top: 70px;
                    padding: 15px;
                }
            }
        </style>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </head>
    <body>
        <!-- OVERLAY untuk tutup sidebar -->
        <div class="overlay" id="overlay" onclick="closeSidebar()"></div>

        <!-- HAMBURGER BUTTON -->
        <button class="hamburger-btn" onclick="toggleSidebar()">
            <i class="fas fa-bars"></i>
        </button>

        <!-- SIDEBAR MENU SIMPLE -->
        <div class="sidebar" id="sidebar">
            <div class="logo-section">
                <h1>Naratel</h1>
                <p>Toko Bunga Premium</p>
            </div>
            
            <div class="menu">
                <div class="menu-title">KATEGORI</div>
                <div class="menu-item active" onclick="loadFlowers('Semua', this)">
                    <i class="fas fa-th-large"></i>
                    <span>Semua Bunga</span>
                </div>
                <div class="menu-item" onclick="loadFlowers('Mawar', this)">
                    <i class="fas fa-heart"></i>
                    <span>Mawar</span>
                </div>
                <div class="menu-item" onclick="loadFlowers('Melati', this)">
                    <i class="fas fa-star"></i>
                    <span>Melati</span>
                </div>
                <div class="menu-item" onclick="loadFlowers('Anggrek', this)">
                    <i class="fas fa-leaf"></i>
                    <span>Anggrek</span>
                </div>
            </div>
        </div>

        <!-- MAIN CONTENT -->
        <div class="main-content">
            <div class="header">
                <h2>🌸 Toko Bunga Naratel 🌸</h2>
                <p>Koleksi Bunga Segar & Cantik untuk Setiap Momen</p>
            </div>

            <div id="flowers-list" class="flowers-grid">
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Memuat bunga...</p>
                </div>
            </div>
        </div>

        <script>
            // Fungsi toggle sidebar
            function toggleSidebar() {
                const sidebar = document.getElementById('sidebar');
                const overlay = document.getElementById('overlay');
                const hamburgerIcon = document.querySelector('.hamburger-btn i');
                
                sidebar.classList.toggle('open');
                overlay.classList.toggle('active');
                
                // Ganti icon hamburger
                if (sidebar.classList.contains('open')) {
                    hamburgerIcon.className = 'fas fa-bars';
                }
            }

            // Fungsi tutup sidebar
            function closeSidebar() {
                const sidebar = document.getElementById('sidebar');
                const overlay = document.getElementById('overlay');
                
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            }

            // Tutup sidebar jika klik ESC
            document.addEventListener('keydown', function(event) {
                if (event.key === 'Escape') {
                    closeSidebar();
                }
            });

            // Fungsi load flowers dengan filter
            async function loadFlowers(kategori = 'Semua', element = null) {
                // Update menu aktif
                if(element) {
                    document.querySelectorAll('.menu-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    element.classList.add('active');
                }

                const list = document.getElementById('flowers-list');
                list.innerHTML = '<div class="loading"><div class="spinner"></div><p>Mencari bunga cantik...</p></div>';

                // Tutup sidebar setelah pilih menu
                closeSidebar();

                try {
                    const response = await fetch('/api/flowers?kategori=' + kategori);
                    
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    
                    const flowers = await response.json();
                    console.log('Data bunga:', flowers); // Debug log

                    if (!flowers || flowers.length === 0) {
                        list.innerHTML = '<div class="loading"><p>😢 Tidak ada bunga dalam kategori ini</p></div>';
                        return;
                    }

                    list.innerHTML = '';
                    flowers.forEach(f => {
                        // Pastikan URL gambar valid
                        let imageUrl = f.gambar;
                        if (!imageUrl || imageUrl.includes('null')) {
                            // Gambar default berdasarkan kategori
                            if (f.kategori === 'Mawar') {
                                imageUrl = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=300&fit=crop';
                            } else if (f.kategori === 'Melati') {
                                imageUrl = 'https://images.unsplash.com/photo-159603903067-bf0942abc837?w=400&h=300&fit=crop';
                            } else if (f.kategori === 'Anggrek') {
                                imageUrl = 'https://images.unsplash.com/photo-1566996694954-90b052c413c4?w=400&h=300&fit=crop';
                            } else {
                                imageUrl = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=300&fit=crop';
                            }
                        }

                        // Pastikan URL memiliki http/https
                        if (!imageUrl.startsWith('http')) {
                            imageUrl = 'https://' + imageUrl;
                        }

                        const card = document.createElement('div');
                        card.className = 'card';
                        card.innerHTML = \`
                            <img 
                                src="\${imageUrl}" 
                                alt="\${f.nama_bunga}" 
                                class="card-img"
                                onerror="this.src='https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=300&fit=crop'"
                            >
                            <div class="card-info">
                                <h3>\${f.nama_bunga || 'Bunga Cantik'}</h3>
                                <p class="card-price">Rp \${(f.harga || 0).toLocaleString('id-ID')}</p>
                                <p class="card-stock">
                                    <i class="fas fa-box"></i> Stok: \${f.stok || 0} tersedia
                                </p>
                            </div>
                            <button class="buy-btn" onclick="beliBunga(\${f.id}, '\${f.nama_bunga}')">
                                <i class="fas fa-shopping-cart"></i> Beli Sekarang
                            </button>
                        \`;
                        list.appendChild(card);
                    });
                } catch (error) {
                    console.error('Error loading flowers:', error);
                    list.innerHTML = '<div class="loading"><p>❌ Gagal memuat data bunga</p><p style="font-size:0.9rem;color:#9ca3af;">' + error.message + '</p></div>';
                }
            }

            // Fungsi beli bunga
            function beliBunga(id, nama) {
                alert(\`🌸 Pesanan Berhasil!\\n\\n✿ Anda telah memilih: \${nama}\\n✿ ID Produk: \${id}\\n\\nSilakan lanjut ke pembayaran.\`);
            }

            // Load semua bunga saat pertama kali buka
            document.addEventListener('DOMContentLoaded', function() {
                loadFlowers();
            });
        </script>
    </body>
    </html>
    `;
    res.send(html);
});

// Port & Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log('🚀 Server Toko Bunga Naratel berjalan di:');
    console.log('   🌸 http://localhost:' + PORT + '/toko');
    console.log('   📊 http://localhost:' + PORT + '/api/flowers');
    console.log('\n💡 Tips: Jika gambar tidak muncul:');
    console.log('   1. Buka http://localhost:' + PORT + '/api/flowers');
    console.log('   2. Cek field "gambar" di data JSON');
    console.log('   3. Pastikan URL gambar valid');
});