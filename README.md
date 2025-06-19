## 🎮KUIS KATA MULTIPLAYER

## 👩🏻‍🤝‍👩🏻Nama Anggota Kelompok :
1. Museyena
2. Siti Nur Faizah
3. Putri Nur Alisyah
4. Zaqiatus Sholihah

## 🎨About Game :
Game edukatif multiplayer berbasis jaringan yang menggunakan TCP secara real-time, di mana pemain harus menebak kata dari huruf yang diacak dalam waktu terbatas

## 🎯Jumlah Pemain :
1-4  orang (bisa ditambah sesuai kapasitas server) 

## ✨Aturan Main :
1. Pemain memasukkan nama dan bergabung di waiting room.
2. Host (first player) yang memulai permainan.
3. Di setiap ronde, huruf-huruf acak ditampilkan.
4. Pemain tercepat yang menjawab benar mendapat poin.
5. Satu pertanyaan hanya bisa dijawab oleh salah satu pemain.
6. Game berjalan dalam 10 ronde dan diakhiri dengan leaderboard.
7. Durasi pertanyaan muncul menyesuaikan tiap huruf 1 detik, dan durasi menjawab selama  10 detik. 
8. Skor +10 jika pemain menjawab jawaban benar dan -5 jika jawaban salah

## ✍Pembagian Tugas :
1. Museyena : Pembuatan efek suara dan UI dari semua broser
2. Siti Nur Faizah : Logika user meliputi gabung game, input nama, update UI ketika game dimulai, input jawaban dan menampilkan skor/ronde, serta menghubungkan event dari tombol dan input ke server
3. Putri Nur Alisyah : Mengelola sesi meliputi pemain, ID socket, room, mengatur host, ronde, dan validasi jawaban serta memastikan sinkronisasi semua client berjalan lancar
4. Zaqiatus Sholihah : Membangun layout setiap screen (home, waiting room, game screen, leaderboard), membuat style.css agar tampilan menarik dan responsif, serta  mengatur warna, font, ukuran elemen dan efek interaktif

## Tampilan Game
1. Player melakukan login dengan menginputkan IP localhost:3000
   ![IP_login](https://github.com/user-attachments/assets/476389c7-30e5-43ed-b7e1-d7d3874964c8)
3. Player memasukkan nama kemudian klik "Join" (Player utama yang join akan menjadi Host)
4. Player akan masuk ke "Waiting Room" sembari menunggu Host memulai game
5. Setelah host memulai game, akan muncul tampilan "gameplay"
6. Durasi dan player yang menjawab akan muncul pada setiap pertanyaan
7. Skor game muncul di akhir permainan berdasarkan tampilan leaderboard 



