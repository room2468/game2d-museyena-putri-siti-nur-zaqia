const socket = new WebSocket("ws://localhost:3000");

let playerName = "";
let isHost = false;
let hasBuzzed = false;
//

// UI Elements
const screens = {
  home: document.getElementById("home-screen"),
  waiting: document.getElementById("waiting-room"),
  game: document.getElementById("game-screen"),
  leaderboard: document.getElementById("leaderboard-screen"),
};
const nameInput = document.getElementById("name");
const joinBtn = document.getElementById("join-btn");
const playerList = document.getElementById("player-list");
const startBtn = document.getElementById("start-btn");
const shuffledWordDisplay = document.getElementById("shuffled-word");
const buzzStatus = document.getElementById("buzz-status");
const answerInput = document.getElementById("answer-input");
const answerForm = document.getElementById("answer-form");
const roundDisplay = document.getElementById("round-display");

// Sound helper
function playSound(id) {
  const audio = document.getElementById(id);
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch((e) => console.warn("Sound blocked:", e));
  }
}

// Join game
joinBtn.onclick = () => {
  playerName = nameInput.value.trim();
  if (playerName !== "") {
    socket.send(JSON.stringify({ type: "join", name: playerName }));
    switchScreen("waiting");
  }
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch (data.type) {
    case "players_update":
      updatePlayerList(data.players);
      break;
    case "round_start":
      startRound(data);
      break;
    case "buzz_winner":
      showBuzzResult(data);
      break;
    case "answer_result":
      showAnswerResult(data);
      break;
    case "game_over":
      showLeaderboard(data.scores);
      break;
  }
};

function switchScreen(screenName) {
  Object.values(screens).forEach((s) => (s.style.display = "none"));
  screens[screenName].style.display = "block";
}

function updatePlayerList(players) {
  playerList.innerHTML = "";
  players.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = p.name + (p.isHost ? " (Host)" : "");
    playerList.appendChild(li);
    if (p.name === playerName) {
      isHost = p.isHost;
      startBtn.style.display = isHost ? "block" : "none";
    }
  });
}

startBtn.onclick = () => {
  socket.send(JSON.stringify({ type: "start_game" }));
  startBtn.disabled = true;
};

// Start round
function startRound(data) {
  switchScreen("game");
  roundDisplay.textContent = `Ronde ${data.round}/10`;
  shuffledWordDisplay.innerHTML = "";
  buzzStatus.textContent = "";
  hasBuzzed = false;
  answerForm.style.display = "none";

  // Validasi kata
  if (
    !data.word ||
    typeof data.word !== "string" ||
    data.word.trim() === "" ||
    data.word.includes(" ")
  ) {
    buzzStatus.textContent = "Terjadi kesalahan: soal tidak valid.";
    return;
  }

  // Mulai backsound saat game mulai
  const bgMusic = document.getElementById("bg-music");
  if (bgMusic && bgMusic.paused) {
    bgMusic.volume = 0.3;
    bgMusic.play().catch(() => {});
  }

  const letters = data.word.trim().split("");
  let index = 0;

  const interval = setInterval(() => {
    if (index < letters.length) {
      const span = document.createElement("span");
      span.textContent = letters[index++];
      span.style.fontSize = "2.5rem";
      span.style.margin = "0 8px";
      span.style.fontWeight = "500";
      span.style.display = "inline-block";
      span.style.color = "#333";
      shuffledWordDisplay.appendChild(span);
    } else {
      clearInterval(interval);
      setTimeout(() => {
        enableBuzz(data.original, data.answerTime);
      }, data.thinkingTime * 1000);
    }
  }, 400);
}

function enableBuzz(correctWord, answerTime) {
  buzzStatus.textContent = "Tekan [SPASI] untuk BUZZ!";
  const buzzListener = (e) => {
    if (e.code === "Space" && !hasBuzzed) {
      playSound("buzz-sound");
      socket.send(JSON.stringify({ type: "buzz" }));
      hasBuzzed = true;
    }
  };
  window.addEventListener("keydown", buzzListener, { once: true });
}

function showBuzzResult(data) {
  buzzStatus.textContent = `${data.name} berhasil buzz!`;

  if (data.name === playerName) {
    buzzStatus.textContent = "Kamu berhasil buzz! Jawab sekarang!";
    answerForm.style.display = "block";
    answerInput.disabled = false;
    answerInput.value = "";
    answerInput.focus();

    setTimeout(() => {
      if (!answerInput.disabled) {
        answerInput.disabled = true;
        buzzStatus.textContent = "Waktu habis!";
        socket.send(JSON.stringify({ type: "answer", answer: "" }));
      }
    }, data.answerTime * 1000);
  } else {
    answerForm.style.display = "none";
    answerInput.disabled = true;

    let countdown = data.answerTime;
    const interval = setInterval(() => {
      buzzStatus.textContent = `${data.name} sedang menjawab... (${countdown}s)`;

      if (countdown >= 1 && countdown <= 10) {
        playSound(`countdown-${countdown}`);
      }

      if (--countdown < 0) clearInterval(interval);
    }, 1000);
  }
}

function showAnswerResult(data) {
  if (data.correct) {
    buzzStatus.textContent = `${data.name} menjawab BENAR! (+10)`;
    playSound("correct-sound");
  } else {
    buzzStatus.textContent = `${data.name} menjawab SALAH (-5) | Jawaban benar: ${data.correctWord}`;
    playSound("wrong-sound");
  }

  answerForm.style.display = "none";
  answerInput.disabled = true;

  setTimeout(() => {
    buzzStatus.textContent = "Ronde berikutnya dimulai...";
  }, 3000);
}

answerForm.onsubmit = (e) => {
  e.preventDefault();
  const jawaban = answerInput.value.trim();
  playSound("submit-sound");
  socket.send(JSON.stringify({ type: "answer", answer: jawaban }));
  answerInput.disabled = true;
};

function showLeaderboard(scores) {
  switchScreen("leaderboard");

  playSound("leaderboard-sound");

  const bgMusic = document.getElementById("bg-music");
  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }

  const list = document.getElementById("score-list");
  list.innerHTML = "";

  scores
    .sort((a, b) => b.score - a.score)
    .forEach((s) => {
      const li = document.createElement("li");
      li.textContent = `${s.name}: ${s.score}`;
      list.appendChild(li);
    });
}
