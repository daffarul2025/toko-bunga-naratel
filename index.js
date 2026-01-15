const express = require('express');
const { Pool } = require('pg');
const app = express();

// 1. Database Pool Configuration
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'db_toko_bunga',
    password: 'kamucantik12',
    port: 5432,
});

// Test koneksi database saat startup
pool.connect()
    .then(client => {
        console.log('✅ Database connected successfully');
        client.release();
        
        // Cek apakah tabel flowers ada
        return pool.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'flowers')");
    })
    .then(result => {
        if (result.rows[0].exists) {
            console.log('✅ Tabel "flowers" ditemukan');
            
            // Hitung jumlah data
            return pool.query('SELECT COUNT(*) FROM flowers');
        } else {
            console.log('❌ Tabel "flowers" TIDAK ditemukan!');
            console.log('💡 Buat tabel dengan SQL berikut:');
            console.log(`
                CREATE TABLE flowers (
                    id SERIAL PRIMARY KEY,
                    nama_bunga VARCHAR(100) NOT NULL,
                    kategori VARCHAR(50),
                    harga INTEGER NOT NULL,
                    stok INTEGER DEFAULT 0,
                    deskripsi TEXT,
                    gambar TEXT
                );
                
                -- Insert sample data
                INSERT INTO flowers (nama_bunga, kategori, harga, stok, gambar) VALUES
                ('Mawar Merah', 'Mawar', 50000, 10, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=300&fit=crop'),
                ('Melati Putih', 'Melati', 35000, 15, 'https://images.unsplash.com/photo-159603903067-bf0942abc837?w=400&h=300&fit=crop'),
                ('Anggrek Bulan', 'Anggrek', 125000, 5, 'https://images.unsplash.com/photo-1566996694954-90b052c413c4?w=400&h=300&fit=crop');
            `);
        }
    })
    .then(result => {
        if (result) {
            console.log(`📊 Total data bunga: ${result.rows[0].count}`);
        }
    })
    .catch(err => {
        console.error('❌ Database connection error:', err.message);
        console.log('💡 Troubleshooting:');
        console.log('   1. Pastikan PostgreSQL service sedang berjalan');
        console.log('   2. Cek password: "kamucantik12"');
        console.log('   3. Cek database name: "db_toko_bunga"');
        console.log('   4. Cek port: 5432 (default)');
    });

app.use(express.json());

// 2. API Endpoint dengan fallback data
app.get('/api/flowers', async (req, res) => {
    try {
        console.log('🔍 Fetching data from database...');
        const result = await pool.query('SELECT * FROM flowers ORDER BY id ASC');
        
        if (result.rows.length === 0) {
            console.log('⚠️ Database kosong, memberikan data fallback');
            
            // Fallback data jika database kosong
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
        
        console.log(`✅ Data ditemukan: ${result.rows.length} item`);
        res.json(result.rows);
        
    } catch (err) {
        console.error('❌ Database query error:', err.message);
        
        // Tetap berikan data fallback meski error
        res.json([
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
            }
        ]);
    }
});

// 3. Halaman utama
app.get('/toko', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Toko Bunga Naratel</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: 'Segoe UI', Arial, sans-serif;
                background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
                margin: 0;
                padding: 20px;
                min-height: 100vh;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
            }
            
            header {
                text-align: center;
                padding: 30px;
                background: white;
                border-radius: 20px;
                margin-bottom: 30px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            
            h1 {
                color: #db2777;
                margin: 0;
                font-size: 2.5rem;
            }
            
            .subtitle {
                color: #666;
                font-size: 1.1rem;
                margin-top: 10px;
            }
            
            .status-bar {
                background: white;
                padding: 15px 25px;
                border-radius: 10px;
                margin-bottom: 25px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: 0 3px 10px rgba(0,0,0,0.05);
            }
            
            .status {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .status-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #10b981;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
            
            .flowers-container {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 25px;
                padding: 20px 0;
            }
            
            .flower-card {
                background: white;
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 8px 20px rgba(0,0,0,0.1);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            
            .flower-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 30px rgba(0,0,0,0.15);
            }
            
            .flower-image {
                width: 100%;
                height: 200px;
                object-fit: cover;
                background: #f3f4f6;
            }
            
            .flower-details {
                padding: 20px;
            }
            
            .flower-name {
                font-size: 1.4rem;
                color: #333;
                margin: 0 0 10px 0;
            }
            
            .flower-price {
                font-size: 1.3rem;
                color: #dc2626;
                font-weight: bold;
                margin: 10px 0;
            }
            
            .flower-stock {
                color: #666;
                margin: 10px 0;
            }
            
            .buy-btn {
                width: 100%;
                padding: 12px;
                background: linear-gradient(to right, #ec4899, #db2777);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: bold;
                cursor: pointer;
                margin-top: 15px;
                transition: all 0.3s ease;
            }
            
            .buy-btn:hover {
                background: linear-gradient(to right, #db2777, #be185d);
                transform: scale(1.02);
            }
            
            .loading {
                text-align: center;
                padding: 40px;
                font-size: 1.2rem;
                color: #666;
            }
            
            .spinner {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #ec4899;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px auto;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .error-box {
                background: #fee2e2;
                color: #dc2626;
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                margin: 20px;
            }
            
            footer {
                text-align: center;
                padding: 30px;
                color: #666;
                margin-top: 40px;
                border-top: 1px solid #eee;
            }
            
            .debug-info {
                background: #f8fafc;
                padding: 15px;
                border-radius: 10px;
                margin-top: 20px;
                font-size: 0.9rem;
                color: #64748b;
                font-family: monospace;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <h1>🌸 Toko Bunga Naratel 🌸</h1>
                <p class="subtitle">Bunga terbaik untuk momen spesial Anda</p>
            </header>
            
            <div class="status-bar">
                <div class="status">
                    <div class="status-dot"></div>
                    <span>Status: <strong>Online</strong></span>
                </div>
                <div id="data-count">Memuat data...</div>
            </div>
            
            <div id="flowers-list" class="flowers-container">
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Memuat katalog bunga...</p>
                </div>
            </div>
            
            <div class="debug-info">
                <p><strong>Debug Info:</strong></p>
                <p id="debug-status">Status: Loading...</p>
                <p id="debug-data">Data: Waiting...</p>
            </div>
            
            <footer>
                <p>© 2024 Toko Bunga Naratel | Dibuat dengan ❤️</p>
            </footer>
        </div>
        
        <script>
            console.log('🔄 Script mulai berjalan...');
            
            async function loadFlowers() {
                const flowersList = document.getElementById('flowers-list');
                const dataCount = document.getElementById('data-count');
                const debugStatus = document.getElementById('debug-status');
                const debugData = document.getElementById('debug-data');
                
                try {
                    debugStatus.textContent = 'Status: Fetching data from /api/flowers...';
                    console.log('📡 Mengambil data dari API...');
                    
                    const response = await fetch('/api/flowers');
                    
                    debugStatus.textContent = 'Status: Response received - ' + response.status;
                    console.log('📥 Response:', response.status, response.statusText);
                    
                    if (!response.ok) {
                        throw new Error('HTTP ' + response.status + ': ' + response.statusText);
                    }
                    
                    const flowers = await response.json();
                    
                    debugStatus.textContent = 'Status: Data parsed successfully';
                    debugData.textContent = 'Data: ' + flowers.length + ' items found';
                    console.log('✅ Data diterima:', flowers);
                    
                    // Update count
                    dataCount.textContent = 'Total: ' + flowers.length + ' bunga tersedia';
                    
                    if (flowers.length === 0) {
                        flowersList.innerHTML = '<div class="error-box">⚠️ Tidak ada data bunga tersedia</div>';
                        return;
                    }
                    
                    // Clear loading
                    flowersList.innerHTML = '';
                    
                    // Render each flower
                    flowers.forEach(flower => {
                        const card = document.createElement('div');
                        card.className = 'flower-card';
                        
                        const imageUrl = flower.gambar || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=300&fit=crop';
                        const name = flower.nama_bunga || 'Bunga';
                        const price = flower.harga ? 'Rp ' + flower.harga.toLocaleString('id-ID') : 'Rp 0';
                        const stock = flower.stok || 0;
                        
                        card.innerHTML = \`
                            <img src="\${imageUrl}" alt="\${name}" class="flower-image"
                                 onerror="this.src='https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=300&fit=crop'">
                            <div class="flower-details">
                                <h3 class="flower-name">\${name}</h3>
                                <p class="flower-price">\${price}</p>
                                <p class="flower-stock">📦 Stok: \${stock} tersedia</p>
                                <button class="buy-btn" onclick="buyFlower(\${flower.id}, '\${name.replace(/'/g, "\\'")}')">
                                    🛒 Beli Sekarang
                                </button>
                            </div>
                        \`;
                        
                        flowersList.appendChild(card);
                    });
                    
                    console.log('🎨 UI berhasil dirender');
                    
                } catch (error) {
                    console.error('❌ Error:', error);
                    
                    debugStatus.textContent = 'Status: ERROR - ' + error.message;
                    debugData.textContent = 'Data: Failed to load';
                    
                    flowersList.innerHTML = \`
                        <div class="error-box">
                            <h3>❌ Gagal memuat data</h3>
                            <p>\${error.message}</p>
                            <p>Silakan coba beberapa cara:</p>
                            <ol style="text-align: left; margin: 15px 0;">
                                <li>Refresh halaman ini (F5)</li>
                                <li>Cek koneksi database</li>
                                <li>Buka <a href="/api/flowers" target="_blank">/api/flowers</a> untuk test API</li>
                            </ol>
                            <button class="buy-btn" onclick="location.reload()" style="background: #3b82f6; margin-top: 10px;">
                                🔄 Coba Lagi
                            </button>
                        </div>
                    \`;
                    
                    dataCount.textContent = 'Error loading data';
                }
            }
            
            function buyFlower(id, name) {
                alert('🎉 Terima kasih! Anda membeli: ' + name + '\\nID: ' + id + '\\n\\nFitur pembelian akan segera tersedia!');
            }
            
            // Load when page is ready
            document.addEventListener('DOMContentLoaded', function() {
                console.log('📄 DOM siap, mulai load data...');
                loadFlowers();
            });
            
            // Manual refresh button (optional)
            window.refreshData = function() {
                console.log('🔄 Manual refresh...');
                loadFlowers();
            };
        </script>
    </body>
    </html>
    `;
    
    res.send(html);
});

// 4. Health check endpoint
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({
            status: 'OK',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({
            status: 'ERROR',
            database: 'disconnected',
            error: err.message
        });
    }
});

// 5. Root redirect
app.get('/', (req, res) => {
    res.redirect('/toko');
});

// 6. Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 SERVER TOKO BUNGA NARATEL DIMULAI');
    console.log('='.repeat(60));
    console.log('🌐 Server: http://localhost:' + PORT);
    console.log('🛒 Toko:   http://localhost:' + PORT + '/toko');
    console.log('📊 API:    http://localhost:' + PORT + '/api/flowers');
    console.log('🩺 Health: http://localhost:' + PORT + '/health');
    console.log('='.repeat(60) + '\n');
});