const state = {
  view: {
    squares: document.querySelectorAll(".square"),
    timeLeft: document.querySelector("#time-left"),
    score: document.querySelector("#score"),
    listaPontos: document.querySelector("#lista-pontos"),
    highScore: document.querySelector("#high-score"),
    ranking: document.querySelector("#ranking tbody"),
    playerNameInput: document.querySelector("#player-name"),
    painelMensagem: document.getElementById("painel-mensagem"),
    toggleMusicBtn: document.getElementById("toggle-music"),
  },
  values: {
    gameVelocity: 1000,
    hitPosition: null,
    result: 0,
    currentTime: 120,
    scoreList: JSON.parse(localStorage.getItem("scoreList")) || [],
    highScore: JSON.parse(localStorage.getItem("highScore")) || 0,
    gameOver: false,
  },
  actions: {
    timerId: null,
    countDownTimerId: null,
  },
};

let backgroundMusic = new Audio("BackgroundMusic.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3;
/* 🎵 Música */
function startBackgroundMusic() {
  backgroundMusic.play().then(() => {
    musicPlaying = true;
    state.view.toggleMusicBtn.textContent = "🎵 Música";
  }).catch(() => {console.log("O navegador bloqueou a reprodução automática. Clique para iniciar a música.")});
}
function stopBackgroundMusic() {
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
  musicPlaying = false;
  state.view.toggleMusicBtn.textContent = "🔇 Música";
}
function toggleMusic() {
  musicPlaying ? stopBackgroundMusic() : startBackgroundMusic();
}
function startGame() {
  novoJogo(); // inicia o jogo
  if (!musicPlaying) startBackgroundMusic(); // toca música após clique

  // mensagem inicial
  const msg = document.createElement("div");
  msg.classList.add("mensagem");
  msg.textContent = "🚀 Jogo iniciado!";
  state.view.painelMensagem.innerHTML = "";
  state.view.painelMensagem.appendChild(msg);
  setTimeout(() => {
    msg.classList.add("fadeout");
    setTimeout(() => msg.remove(), 1000); // remove após animação
  }, 4000);

  // ✅ Esconde o botão Start após o clique
  document.getElementById("start-game").style.display = "none";
}

document.getElementById("start-game").addEventListener("click", startGame);

/* 🎮 Jogo */
function randomSquare() {
  state.view.squares.forEach(sq => sq.classList.remove("enemy"));
  const randomSquare = state.view.squares[Math.floor(Math.random() * 9)];
  randomSquare.classList.add("enemy");
  state.values.hitPosition = randomSquare.id;
}
function moveEnemy() {
  clearInterval(state.actions.timerId);
  state.actions.timerId = setInterval(randomSquare, state.values.gameVelocity);
}
function addListenerHitBox() {
  state.view.squares.forEach(square => {
    square.addEventListener("mousedown", () => {
      if (square.id === state.values.hitPosition) {
        state.values.result++;
        atualizarPlacar();
        state.values.hitPosition = null;
        playSound();
      }
    });
  });
}
function atualizarPlacar() {
  state.view.score.textContent = state.values.result;
}
function countDown() {
  state.values.currentTime--;
  state.view.timeLeft.textContent = state.values.currentTime;
  if (state.values.currentTime <= 0) endGame();
}

/* 🏆 Fim de jogo */
function endGame() {
  clearInterval(state.actions.countDownTimerId);
  clearInterval(state.actions.timerId);
  stopBackgroundMusic();

  // ✅ Limpa painel de mensagem
  state.view.painelMensagem.className = "";
  state.view.painelMensagem.textContent = "";

  if (!state.values.gameOver) {
    state.values.gameOver = true;
    const playerName = state.view.playerNameInput.value || "Anônimo";
    const dataPartida = new Date().toLocaleString("pt-BR");
    const resultado = { nome: playerName, pontos: state.values.result, data: dataPartida };
    state.values.scoreList.push(resultado);

    if (state.values.result > state.values.highScore) {
      state.values.highScore = state.values.result;
      localStorage.setItem("highScore", JSON.stringify(state.values.highScore));
    }
    localStorage.setItem("scoreList", JSON.stringify(state.values.scoreList));

    playGameOverSound();
   
    mostrarListaPontos();
    mostrarHighScore();
    mostrarRanking();
  }
}

/* 🔊 Sons */
function playSound() {
  let audio = new Audio("audio_hit.m4a");
  audio.volume = 0.2;
  audio.play();
   }
function playGameOverSound() {
  let audio = new Audio("gameOver.mp3");
  audio.volume = 0.5;
  audio.play();
}

function playMedalSound(position) {
  const files = ["ouro.mp3", "prata.mp3", "bronze.mp3"];
  if (files[position]) {
    let audio = new Audio(files[position]);
    audio.volume = 0.4;
    audio.play();
  }
}

/* 📊 Placar */
function mostrarListaPontos() {
  const lista = state.values.scoreList.map(item => `${item.nome}: ${item.pontos} (${item.data})`);
  state.view.listaPontos.textContent = "Histórico: " + lista.join(" | ");
}
function mostrarHighScore() {
  state.view.highScore.textContent = "Maior Pontuação: " + state.values.highScore;
}
function mostrarRanking() {
  let ranking = [...state.values.scoreList].sort((a, b) => b.pontos - a.pontos).slice(0, 3);
  state.view.ranking.innerHTML = "";
  ranking.forEach((item, index) => {
    const row = document.createElement("tr");
    const medalhas = ["🥇", "🥈", "🥉"];
    row.classList.add(["ouro", "prata", "bronze"][index]);
    
    row.classList.add("ranking-update");

  
    row.innerHTML = `<td>${index + 1}</td><td>${medalhas[index]} ${item.nome}</td><td>${item.pontos} (${item.data})</td>`;
    state.view.ranking.appendChild(row);
    playMedalSound(index);
  });
}

/* ⚙️ Configurações */
function setDifficulty(level) {
  const configs = { facil: [1000, 150], medio: [700, 120], dificil: [400, 90] };
  [state.values.gameVelocity, state.values.currentTime] = configs[level];
  state.view.painelMensagem.className = "";
  state.view.painelMensagem.classList.add(level);
  state.view.painelMensagem.textContent = `🔧 Nível escolhido: ${level.toUpperCase()}`;
}
function limparHistorico() {
  const rows = state.view.ranking.querySelectorAll("tr");
  rows.forEach(row => row.classList.add("ranking-fadeout"));

  setTimeout(() => {
    state.values.scoreList = [];
    state.values.highScore = 0;
    localStorage.removeItem("scoreList");
    localStorage.removeItem("highScore");
    mostrarListaPontos();
    mostrarHighScore();
    state.view.ranking.innerHTML = "";
  }, 800);
}
function novoJogo() {
  const playerName = state.view.playerNameInput.value || "Jogador";
  Object.assign(state.values, { result: 0, currentTime: 120, gameOver: false });
  atualizarPlacar();
  state.view.timeLeft.textContent = state.values.currentTime;

  clearInterval(state.actions.timerId);
  clearInterval(state.actions.countDownTimerId);

  moveEnemy();
  state.actions.countDownTimerId = setInterval(countDown, 1000);

  // ✅ Sempre inicia a música ao clicar em Novo Jogo
  startBackgroundMusic();

  const msg = document.createElement("div");
  msg.classList.add("mensagem");
  msg.textContent = `🎮 Novo Jogo Iniciado por ${playerName}`;
  state.view.painelMensagem.innerHTML = "";
  state.view.painelMensagem.appendChild(msg);
  setTimeout(() => msg.remove(), 4000);
}

function gameOver() {
  state.values.gameOver = true;
  clearInterval(state.actions.countDownTimerId);

  const msg = document.createElement("div");
  msg.classList.add("gameover");
  msg.textContent = "💀 GAME OVER 💀";
  state.view.painelMensagem.innerHTML = "";
  state.view.painelMensagem.appendChild(msg);
  playGameOverSound();

  // fade-out após alguns segundos
  setTimeout(() => {
    msg.classList.add("fadeout");
    setTimeout(() => msg.remove(), 1200);
  }, 4000);
}

/* 🚀 Inicialização */
function initialize() {
  addListenerHitBox();
  mostrarListaPontos();
  mostrarHighScore();
  mostrarRanking();
}

document.getElementById("limpar-historico").addEventListener("click", limparHistorico);
document.getElementById("novo-jogo").addEventListener("click", () => {
  novoJogo();
  backgroundMusic.play().then(() => {
    musicPlaying = true;
    state.view.toggleMusicBtn.textContent = "🎵 Música";
  }).catch(() => {
    console.log("Clique necessário para iniciar a música.");
  });
});
state.view.toggleMusicBtn.addEventListener("click", toggleMusic);
document.getElementById("facil").addEventListener("click", () => setDifficulty("facil"));
document.getElementById("medio").addEventListener("click", () => setDifficulty("medio"));
document.getElementById("dificil").addEventListener("click", () => setDifficulty("dificil"));

initialize();
