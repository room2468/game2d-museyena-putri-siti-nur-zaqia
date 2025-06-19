// server.js
const http = require("http");
const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");

const server = http.createServer((req, res) => {
  // Serving static files (HTML, CSS, JS, images, sounds)
  let filePath = "./public" + (req.url === "/" ? "/index.html" : req.url);
  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".jpg": "image/jpg",
    ".jpeg": "image/jpeg",
    ".jfif": "image/jpeg",
    ".png": "image/png",
    ".wav": "audio/wav",
    ".mp3": "audio/mpeg",
  };

  const contentType = mimeTypes[extname] || "application/octet-stream";

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(500);
      res.end("Internal Server Error");
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content, "utf-8");
    }
  });
});

const wss = new WebSocket.Server({ server });

let players = [];
let host = null;
let currentRound = 0;
let maxRounds = 10;
let usedWords = [];
let wordList = [
  "pisang",
  "jeruk",
  "nangka",
  "manggis",
  "alpukat",
  "semangka",
  "durian",
  "jambu",
  "markisa",
  "mangga",
]; // Contoh
let currentWord = "";
let currentShuffled = "";
let buzzedPlayer = null;
let answerTimeout = null;

// Broadcast to all
function broadcast(data) {
  players.forEach((p) => p.ws.send(JSON.stringify(data)));
}

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (msg) => {
    let data = JSON.parse(msg);

    switch (data.type) {
      case "join":
        let newPlayer = {
          id: Date.now(),
          name: data.name,
          ws: ws,
          score: 0,
          isHost: players.length === 0,
        };

        players.push(newPlayer);
        if (newPlayer.isHost) host = newPlayer;

        // Update semua client
        broadcast({
          type: "players_update",
          players: players.map((p) => ({ name: p.name, isHost: p.isHost })),
        });
        break;

      case "start_game":
        if (host && ws === host.ws) {
          currentRound = 1;
          usedWords = [];
          startRound();
        }
        break;

      // Tambahkan case lain nanti: buzz, answer, next_round, dll
      case "buzz":
        if (!buzzedPlayer) {
          buzzedPlayer = players.find((p) => p.ws === ws);
          console.log(`${buzzedPlayer.name} buzzed!`);

          // Beri tahu semua siapa yang buzz duluan
          broadcast({
            type: "buzz_winner",
            name: buzzedPlayer.name,
            answerTime: 10,
          });

          // Timer untuk menjawab
          answerTimeout = setTimeout(() => {
            evaluateAnswer(""); // Tidak menjawab = salah
          }, 10000);
        }
        break;

      case "answer":
        if (buzzedPlayer && ws === buzzedPlayer.ws) {
          clearTimeout(answerTimeout);
          evaluateAnswer(data.answer);
        }
        break;
    }
  });

  ws.on("close", () => {
    // Jika player yang keluar sedang buzz, batalkan
    if (buzzedPlayer && buzzedPlayer.ws === ws) {
      buzzedPlayer = null;
      clearTimeout(answerTimeout);
    }

    players = players.filter((p) => p.ws !== ws);

    if (host && host.ws === ws) {
      host = players[0] || null;
      if (host) host.isHost = true;
    }

    broadcast({
      type: "players_update",
      players: players.map((p) => ({ name: p.name, isHost: p.isHost })),
    });
  });
});

function startRound() {
  if (currentRound > maxRounds) {
    broadcast({
      type: "game_over",
      scores: players.map((p) => ({ name: p.name, score: p.score })),
    });
    return;
  }

  let remainingWords = wordList.filter(
    (w) => !usedWords.includes(w) && typeof w === "string" && w.trim() !== ""
  );

  if (remainingWords.length === 0) {
    broadcast({
      type: "game_over",
      scores: players.map((p) => ({ name: p.name, score: p.score })),
    });
    return;
  }

  currentWord =
    remainingWords[Math.floor(Math.random() * remainingWords.length)];
  usedWords.push(currentWord);

  // Shuffle sampai hasilnya tidak sama dengan aslinya
  do {
    currentShuffled = currentWord
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");
  } while (currentShuffled === currentWord && currentWord.length > 1);

  broadcast({
    type: "round_start",
    round: currentRound,
    word: currentShuffled,
    original: currentWord,
    thinkingTime: 5,
    answerTime: 10,
  });
}

function evaluateAnswer(answer) {
  if (!currentWord || currentWord.trim() === "") return;

  let correct = answer.trim().toLowerCase() === currentWord.toLowerCase();

  if (buzzedPlayer) {
    if (correct) {
      buzzedPlayer.score += 10;
    } else {
      buzzedPlayer.score -= 5;
    }

    broadcast({
      type: "answer_result",
      name: buzzedPlayer.name,
      correct: correct,
      correctWord: currentWord,
    });
  }

  setTimeout(() => {
    buzzedPlayer = null;
    currentRound++;
    startRound();
  }, 3000);
}

server.listen(3000, () => {
  console.log("Server listening on http://localhost:3000");
});
