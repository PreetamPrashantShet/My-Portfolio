/**
 * Preetam Prashant Shet — Gaming Portfolio Engine
 * Features:
 * - Dynamic Matrix/Cyber Particle Canvas
 * - Web Audio API 8-bit Synth FX (No external audio files needed)
 * - "Bug Buster 2077" Interactive Coding Arcade Game
 * - Project Filter System
 * - Holographic Resume Modal & Download
 * - Resilient Contact Form with Formspree & WhatsApp/Mailto fallback
 */

(function () {
  "use strict";

  /* ==========================================================================
     1. Sound FX System (Web Audio API Synthesizer)
     ========================================================================== */
  class SoundManager {
    constructor() {
      this.ctx = null;
      this.muted = true; // Default muted for smooth user experience, toggleable
      this.init();
    }

    init() {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    ensureContext() {
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
    }

    playTone(freq, type, duration, startVol = 0.15, endVol = 0) {
      if (this.muted || !this.ctx) return;
      this.ensureContext();
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(startVol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          Math.max(endVol, 0.0001),
          this.ctx.currentTime + duration,
        );
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        // Audio policy or context error fallback
      }
    }

    click() {
      this.playTone(600, "sine", 0.06, 0.08);
    }

    hover() {
      this.playTone(320, "triangle", 0.04, 0.03);
    }

    zap() {
      if (this.muted || !this.ctx) return;
      this.ensureContext();
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(850, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(
          120,
          this.ctx.currentTime + 0.15,
        );
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.16);
      } catch (e) {}
    }

    powerUp() {
      if (this.muted || !this.ctx) return;
      const notes = [300, 450, 600, 900];
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, "sine", 0.08, 0.12), idx * 60);
      });
    }

    damage() {
      if (this.muted || !this.ctx) return;
      this.playTone(110, "sawtooth", 0.25, 0.25);
    }

    gameOver() {
      if (this.muted || !this.ctx) return;
      const notes = [400, 320, 240, 160];
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playTone(freq, "sawtooth", 0.2, 0.18), idx * 120);
      });
    }
  }

  const sound = new SoundManager();

  // Wire sound toggle
  const sfxToggleBtn = document.getElementById("sfxToggle");
  if (sfxToggleBtn) {
    sfxToggleBtn.addEventListener("click", () => {
      sound.muted = !sound.muted;
      sfxToggleBtn.classList.toggle("active", !sound.muted);
      sfxToggleBtn.innerHTML = sound.muted
        ? '<span class="icon">🔇</span> SFX OFF'
        : '<span class="icon">🔊</span> SFX ON';
      if (!sound.muted) {
        sound.click();
      }
    });
  }

  // Add click sound to interactive buttons
  document
    .querySelectorAll("button, .btn, .nav-link, .game-btn, .filter-btn")
    .forEach((btn) => {
      btn.addEventListener("click", () => sound.click());
      btn.addEventListener("mouseenter", () => sound.hover());
    });

  /* ==========================================================================
     2. Cyberpunk Background Particle Matrix Canvas
     ========================================================================== */
  const canvas = document.getElementById("cyberCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = Math.min(Math.floor(window.innerWidth / 22), 55);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2,
        color: Math.random() > 0.4 ? "#00f0ff" : "#b026ff",
      });
    }

    function drawGrid() {
      ctx.clearRect(0, 0, width, height);

      // Connect near particles
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        p1.x += p1.vx;
        p1.y += p1.vy;

        if (p1.x < 0) p1.x = width;
        if (p1.x > width) p1.x = 0;
        if (p1.y < 0) p1.y = height;
        if (p1.y > height) p1.y = 0;

        ctx.fillStyle = p1.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p1.color;
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.size, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 130) {
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.18 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      ctx.shadowBlur = 0;
      requestAnimationFrame(drawGrid);
    }
    drawGrid();
  }

  /* ==========================================================================
     3. "Bug Buster 2077" Interactive Coding Arcade Game
     ========================================================================== */
  const gameCanvas = document.getElementById("gameCanvas");
  if (gameCanvas) {
    const gCtx = gameCanvas.getContext("2d");
    const startBtn = document.getElementById("gameStartBtn");
    const resetBtn = document.getElementById("gameResetBtn");
    const scoreVal = document.getElementById("gameScoreVal");
    const highScoreVal = document.getElementById("gameHighScoreVal");
    const livesVal = document.getElementById("gameLivesVal");
    const levelVal = document.getElementById("gameLevelVal");
    const gameOverlay = document.getElementById("gameOverlay");
    const overlayTitle = document.getElementById("overlayTitle");
    const overlayMsg = document.getElementById("overlayMsg");

    let isPlaying = false;
    let score = 0;
    let highScore = parseInt(
      localStorage.getItem("preetam_high_score") || "0",
      10,
    );
    if (highScoreVal) highScoreVal.textContent = highScore;
    let lives = 3;
    let level = 1;
    let bugs = [];
    let lasers = [];
    let particles = [];
    let spawnTimer = 0;
    let animFrame = null;

    function resizeGameCanvas() {
      const rect = gameCanvas.getBoundingClientRect();
      gameCanvas.width = rect.width;
      gameCanvas.height = Math.max(
        380,
        Math.min(window.innerHeight * 0.45, 460),
      );
    }
    resizeGameCanvas();
    window.addEventListener("resize", resizeGameCanvas);

    const BUG_TYPES = [
      { text: "NullPointer", color: "#ff3366", speed: 1.2, pts: 100 },
      { text: "SyntaxError", color: "#ff9900", speed: 1.4, pts: 120 },
      { text: "404 Not Found", color: "#00f0ff", speed: 1.6, pts: 150 },
      { text: "MemoryLeak", color: "#b026ff", speed: 1.1, pts: 200 },
      { text: "InfiniteLoop", color: "#00ff66", speed: 1.8, pts: 250 },
      { text: "SegFault", color: "#ff2222", speed: 2.1, pts: 300 },
    ];

    function spawnBug() {
      const type = BUG_TYPES[Math.floor(Math.random() * BUG_TYPES.length)];
      const bugW = 120;
      const x = Math.random() * (gameCanvas.width - bugW - 20) + 10;
      bugs.push({
        x: x,
        y: -30,
        w: bugW,
        h: 32,
        text: `</> ${type.text}`,
        color: type.color,
        speed: (type.speed + (level - 1) * 0.25) * (gameCanvas.height / 400),
        pts: type.pts,
      });
    }

    function createExplosion(x, y, color) {
      for (let i = 0; i < 15; i++) {
        particles.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          size: Math.random() * 4 + 2,
          alpha: 1,
          color: color,
        });
      }
    }

    function handleShoot(clientX, clientY) {
      if (!isPlaying) return;
      const rect = gameCanvas.getBoundingClientRect();
      const clickX = clientX - rect.x;
      const clickY = clientY - rect.y;

      sound.zap();

      lasers.push({
        startX: gameCanvas.width / 2,
        startY: gameCanvas.height - 10,
        targetX: clickX,
        targetY: clickY,
        life: 0.15,
      });

      let hit = false;
      for (let i = bugs.length - 1; i >= 0; i--) {
        const b = bugs[i];
        if (
          clickX >= b.x &&
          clickX <= b.x + b.w &&
          clickY >= b.y &&
          clickY <= b.y + b.h
        ) {
          createExplosion(clickX, clickY, b.color);
          score += b.pts;
          if (scoreVal) scoreVal.textContent = score;

          if (score > highScore) {
            highScore = score;
            if (highScoreVal) highScoreVal.textContent = highScore;
            localStorage.setItem("preetam_high_score", highScore);
          }

          if (score >= level * 800) {
            level++;
            if (levelVal) levelVal.textContent = level;
            sound.powerUp();
          }

          bugs.splice(i, 1);
          hit = true;
          break;
        }
      }

      if (!hit) {
        createExplosion(clickX, clickY, "#00f0ff");
      }
    }

    gameCanvas.addEventListener("mousedown", (e) => {
      handleShoot(e.clientX, e.clientY);
    });

    gameCanvas.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length > 0) {
          e.preventDefault();
          handleShoot(e.touches[0].clientX, e.touches[0].clientY);
        }
      },
      { passive: false },
    );

    function updateGame() {
      if (!isPlaying) return;

      gCtx.fillStyle = "#060b14";
      gCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

      // Cyber Grid lines
      gCtx.strokeStyle = "rgba(0, 240, 255, 0.08)";
      gCtx.lineWidth = 1;
      for (let x = 0; x < gameCanvas.width; x += 30) {
        gCtx.beginPath();
        gCtx.moveTo(x, 0);
        gCtx.lineTo(x, gameCanvas.height);
        gCtx.stroke();
      }
      for (let y = 0; y < gameCanvas.height; y += 30) {
        gCtx.beginPath();
        gCtx.moveTo(0, y);
        gCtx.lineTo(gameCanvas.width, y);
        gCtx.stroke();
      }

      // Draw Lasers
      for (let i = lasers.length - 1; i >= 0; i--) {
        const l = lasers[i];
        gCtx.strokeStyle = "#00f0ff";
        gCtx.shadowColor = "#00f0ff";
        gCtx.shadowBlur = 12;
        gCtx.lineWidth = 3;
        gCtx.beginPath();
        gCtx.moveTo(l.startX, l.startY);
        gCtx.lineTo(l.targetX, l.targetY);
        gCtx.stroke();
        gCtx.shadowBlur = 0;
        l.life -= 0.03;
        if (l.life <= 0) lasers.splice(i, 1);
      }

      // Spawn bugs
      spawnTimer++;
      const currentSpawnRate = Math.max(35, 75 - level * 6);
      if (spawnTimer >= currentSpawnRate) {
        spawnBug();
        spawnTimer = 0;
      }

      // Update & Draw Bugs
      for (let i = bugs.length - 1; i >= 0; i--) {
        const b = bugs[i];
        b.y += b.speed;

        gCtx.fillStyle = "rgba(15, 23, 42, 0.88)";
        gCtx.strokeStyle = b.color;
        gCtx.lineWidth = 2;
        gCtx.shadowBlur = 8;
        gCtx.shadowColor = b.color;

        gCtx.beginPath();
        if (gCtx.roundRect) {
          gCtx.roundRect(b.x, b.y, b.w, b.h, 6);
        } else {
          gCtx.rect(b.x, b.y, b.w, b.h);
        }
        gCtx.fill();
        gCtx.stroke();

        gCtx.shadowBlur = 0;
        gCtx.fillStyle = b.color;
        gCtx.font = 'bold 12px "Fira Code", monospace';
        gCtx.textAlign = "center";
        gCtx.textBaseline = "middle";
        gCtx.fillText(b.text, b.x + b.w / 2, b.y + b.h / 2);

        if (b.y > gameCanvas.height - b.h) {
          bugs.splice(i, 1);
          lives--;
          sound.damage();
          updateLivesDisplay();
          createExplosion(b.x + b.w / 2, gameCanvas.height - 10, "#ff3366");

          if (lives <= 0) {
            endGame();
            return;
          }
        }
      }

      // Draw particle explosions
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.03;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        gCtx.fillStyle = p.color;
        gCtx.globalAlpha = Math.max(0, p.alpha);
        gCtx.beginPath();
        gCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        gCtx.fill();
        gCtx.globalAlpha = 1;
      }

      // Bottom Player Turret
      const turretX = gameCanvas.width / 2;
      const turretY = gameCanvas.height - 8;
      gCtx.fillStyle = "#00f0ff";
      gCtx.shadowColor = "#00f0ff";
      gCtx.shadowBlur = 10;
      gCtx.beginPath();
      gCtx.arc(turretX, turretY, 14, Math.PI, 0, false);
      gCtx.fill();
      gCtx.shadowBlur = 0;

      animFrame = requestAnimationFrame(updateGame);
    }

    function updateLivesDisplay() {
      if (!livesVal) return;
      let hearts = "";
      for (let i = 0; i < 3; i++) {
        hearts += i < lives ? "❤️" : "🖤";
      }
      livesVal.textContent = hearts;
    }

    function startGame() {
      score = 0;
      level = 1;
      lives = 3;
      bugs = [];
      lasers = [];
      particles = [];
      spawnTimer = 0;

      if (scoreVal) scoreVal.textContent = "0";
      if (levelVal) levelVal.textContent = "1";
      updateLivesDisplay();

      isPlaying = true;
      if (gameOverlay) gameOverlay.classList.add("hidden");
      if (startBtn) startBtn.textContent = "⏸ Pause";
      sound.powerUp();
      cancelAnimationFrame(animFrame);
      animFrame = requestAnimationFrame(updateGame);
    }

    function pauseGame() {
      isPlaying = false;
      cancelAnimationFrame(animFrame);
      if (startBtn) startBtn.textContent = "▶ Resume";
      if (gameOverlay) {
        gameOverlay.classList.remove("hidden");
        if (overlayTitle) overlayTitle.textContent = "GAME PAUSED";
        if (overlayMsg)
          overlayMsg.textContent = "Click Resume to continue debugging!";
      }
    }

    function endGame() {
      isPlaying = false;
      cancelAnimationFrame(animFrame);
      sound.gameOver();
      if (startBtn) startBtn.textContent = "▶ Play Again";
      if (gameOverlay) {
        gameOverlay.classList.remove("hidden");
        if (overlayTitle) overlayTitle.textContent = "SYSTEM CRASHED!";
        if (overlayMsg) {
          overlayMsg.innerHTML = `Bugs crashed the server!<br><strong style="color:#00f0ff;font-size:1.3rem;">Final Score: ${score}</strong> (Level ${level})`;
        }
      }
    }

    if (startBtn) {
      startBtn.addEventListener("click", () => {
        if (
          !isPlaying &&
          lives > 0 &&
          startBtn.textContent.includes("Resume")
        ) {
          isPlaying = true;
          if (gameOverlay) gameOverlay.classList.add("hidden");
          startBtn.textContent = "⏸ Pause";
          animFrame = requestAnimationFrame(updateGame);
        } else if (isPlaying) {
          pauseGame();
        } else {
          startGame();
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        startGame();
      });
    }

    if (gameOverlay) {
      gameOverlay.addEventListener("click", () => {
        if (!isPlaying) {
          startGame();
        }
      });
    }
  }

  /* ==========================================================================
     4. Project Category Filtering & Interactive Tags
     ========================================================================== */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".quest-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const category = btn.getAttribute("data-filter");

      projectCards.forEach((card) => {
        const cardCat = card.getAttribute("data-category") || "";
        if (category === "all" || cardCat.includes(category)) {
          card.style.display = "flex";
          setTimeout(() => (card.style.opacity = "1"), 50);
        } else {
          card.style.opacity = "0";
          setTimeout(() => (card.style.display = "none"), 200);
        }
      });
    });
  });

  /* ==========================================================================
     5. Holographic Resume Modal System
     ========================================================================== */
  const resumeModal = document.getElementById("resumeModal");
  const openResumeBtns = document.querySelectorAll(".open-resume-btn");
  const closeResumeBtn = document.getElementById("closeResumeBtn");
  const printResumeBtn = document.getElementById("printResumeBtn");

  function openResume() {
    if (resumeModal) {
      resumeModal.classList.add("active");
      document.body.style.overflow = "hidden";
      sound.click();
    }
  }

  function closeResume() {
    if (resumeModal) {
      resumeModal.classList.remove("active");
      document.body.style.overflow = "";
      sound.click();
    }
  }

  openResumeBtns.forEach((btn) => btn.addEventListener("click", openResume));
  if (closeResumeBtn) closeResumeBtn.addEventListener("click", closeResume);
  if (printResumeBtn) {
    printResumeBtn.addEventListener("click", () => {
      window.print();
    });
  }

  if (resumeModal) {
    resumeModal.addEventListener("click", (e) => {
      if (e.target === resumeModal) {
        closeResume();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      resumeModal &&
      resumeModal.classList.contains("active")
    ) {
      closeResume();
    }
  });

  /* ==========================================================================
     6. Enhanced Comms Terminal & Contact Form Handling
     ========================================================================== */
  const contactForm = document.getElementById("contactForm");
  const statusEl = document.getElementById("status");
  const copyMsgBtn = document.getElementById("copyMsgBtn");
  const submitWhatsAppBtn = document.getElementById("submitWhatsAppBtn");
  const submitGmailBtn = document.getElementById("submitGmailBtn");
  const submitFormBtn = document.getElementById("submitFormBtn");

  if (contactForm && statusEl) {
    function getFormData() {
      const nameVal = document.getElementById("contactName")?.value || "";
      const emailVal = document.getElementById("contactEmail")?.value || "";
      const messageVal = document.getElementById("contactMsg")?.value || "";
      return { nameVal, emailVal, messageVal };
    }

    // 1. WhatsApp Instant Transmission
    if (submitWhatsAppBtn) {
      submitWhatsAppBtn.addEventListener("click", () => {
        const { nameVal, emailVal, messageVal } = getFormData();
        if (!nameVal.trim() || !messageVal.trim()) {
          statusEl.className = "status-msg warning";
          statusEl.innerHTML =
            "⚠️ Please enter your Name and Message to send via WhatsApp.";
          sound.damage();
          return;
        }

        sound.powerUp();
        const textPayload = `⚡ *Portfolio Contact from Website*\n👤 *Name:* ${nameVal}\n📧 *Email:* ${emailVal || "Not provided"}\n\n💬 *Message:*\n${messageVal}`;
        const waUrl = `https://wa.me/918660786561?text=${encodeURIComponent(textPayload)}`;
        window.open(waUrl, "_blank", "noopener,noreferrer");

        statusEl.className = "status-msg success";
        statusEl.innerHTML =
          "✅ <strong>WHATSAPP DISPATCHED!</strong> Opening chat window with Preetam (+91 8660786561). Click Send in WhatsApp!";
      });
    }

    // 2. Direct Web Gmail Compose Transmission
    if (submitGmailBtn) {
      submitGmailBtn.addEventListener("click", () => {
        const { nameVal, emailVal, messageVal } = getFormData();
        if (!nameVal.trim() || !messageVal.trim()) {
          statusEl.className = "status-msg warning";
          statusEl.innerHTML =
            "⚠️ Please enter your Name and Message to open Gmail compose.";
          sound.damage();
          return;
        }

        sound.powerUp();
        const emailBody = `Hi Preetam,\n\nName: ${nameVal}\nEmail: ${emailVal}\n\nMessage:\n${messageVal}`;
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=preetam.prashant866@gmail.com&su=${encodeURIComponent(`Portfolio Message from ${nameVal}`)}&body=${encodeURIComponent(emailBody)}`;

        // Also copy text to clipboard as guaranteed backup
        if (navigator.clipboard) {
          navigator.clipboard.writeText(emailBody).catch(() => {});
        }

        window.open(gmailUrl, "_blank", "noopener,noreferrer");

        statusEl.className = "status-msg success";
        statusEl.innerHTML =
          "✅ <strong>GMAIL COMPOSE OPENED!</strong> Addressed directly to <strong>preetam.prashant866@gmail.com</strong>. Click Send in Gmail to deliver!";
      });
    }

    // 3. Direct Form Submit (FormSubmit.co / Mailto fallback)
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const { nameVal, emailVal, messageVal } = getFormData();

      if (!nameVal.trim() || !messageVal.trim()) {
        statusEl.className = "status-msg warning";
        statusEl.innerHTML = "⚠️ Please complete all required fields.";
        return;
      }

      sound.powerUp();
      const emailBody = `From: ${nameVal} (${emailVal})\n\nMessage:\n${messageVal}`;
      const mailtoLink = `mailto:preetam.prashant866@gmail.com?subject=${encodeURIComponent(`Portfolio Contact from ${nameVal}`)}&body=${encodeURIComponent(emailBody)}`;
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=preetam.prashant866@gmail.com&su=${encodeURIComponent(`Portfolio Message from ${nameVal}`)}&body=${encodeURIComponent(emailBody)}`;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(emailBody).catch(() => {});
      }

      // If browsing local file://, external APIs reject CORS, so open Gmail / mailto immediately
      if (window.location.protocol === "file:") {
        window.open(gmailUrl, "_blank", "noopener,noreferrer");
        statusEl.className = "status-msg success";
        statusEl.innerHTML =
          "✅ <strong>GMAIL READY!</strong> Opened web Gmail to deliver straight to <strong>preetam.prashant866@gmail.com</strong>. (Once hosted on GitHub Pages, form delivers silently in background).";
        return;
      }

      // Hosted on Web (GitHub Pages) -> Submit via FormSubmit AJAX
      const submitBtn =
        submitFormBtn || contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = "⚡ TRANSMITTING...";
      }

      fetch("https://formsubmit.co/ajax/preetam.prashant866@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: nameVal,
          email: emailVal,
          message: messageVal,
          _subject: `⚡ Portfolio Contact from ${nameVal}!`,
        }),
      })
        .then((res) => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }
          if (res.ok) {
            statusEl.className = "status-msg success";
            statusEl.innerHTML =
              "✅ <strong>TRANSMISSION DELIVERED!</strong> Message forwarded directly to Preetam's inbox (preetam.prashant866@gmail.com).";
            contactForm.reset();
          } else {
            throw new Error("FormSubmit response not OK");
          }
        })
        .catch(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }
          window.open(gmailUrl, "_blank", "noopener,noreferrer");
          statusEl.className = "status-msg success";
          statusEl.innerHTML =
            "✅ <strong>GMAIL COMPOSE OPENED!</strong> Message addressed to <strong>preetam.prashant866@gmail.com</strong>. Click Send to complete transmission!";
        });
    });

    // 4. Copy Message to Clipboard
    if (copyMsgBtn) {
      copyMsgBtn.addEventListener("click", () => {
        const { nameVal, emailVal, messageVal } = getFormData();
        if (!nameVal && !messageVal) {
          statusEl.className = "status-msg warning";
          statusEl.innerHTML = "⚠️ Type a message first to copy to clipboard.";
          return;
        }
        const fullText = `From: ${nameVal} (${emailVal})\nMessage: ${messageVal}`;
        navigator.clipboard.writeText(fullText).then(() => {
          sound.click();
          copyMsgBtn.textContent = "✅ Copied to Clipboard!";
          setTimeout(() => (copyMsgBtn.textContent = "📋 COPY MESSAGE"), 3000);
        });
      });
    }
  }

  /* ==========================================================================
     7. Theme Toggle & Scroll Reveal
     ========================================================================== */
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isLight = document.documentElement.classList.toggle("light");
      localStorage.setItem("preetam_theme", isLight ? "light" : "dark");
      themeToggle.innerHTML = isLight
        ? '<span class="icon">☀️</span> SYNTH LIGHT'
        : '<span class="icon">🌙</span> CYBER DARK';
      sound.click();
    });

    if (localStorage.getItem("preetam_theme") === "light") {
      document.documentElement.classList.add("light");
      themeToggle.innerHTML = '<span class="icon">☀️</span> SYNTH LIGHT';
    }
  }

  // Smooth scroll reveals
  const revealElements = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        }
      });
    },
    { threshold: 0.1 },
  );
  revealElements.forEach((el) => observer.observe(el));

  // Dynamic typing animation in Hero
  const dynamicRole = document.getElementById("dynamicRole");
  if (dynamicRole) {
    const titles = [
      "Full-Stack Developer",
      "AI & Machine Learning Explorer",
      "C++ Systems Engineer",
      "Competitive Coder (LeetCode)",
    ];
    let titleIdx = 0;
    let charIdx = 0;
    let isDeleting = false;

    function typeEffect() {
      const current = titles[titleIdx];
      if (isDeleting) {
        dynamicRole.textContent = current.substring(0, charIdx - 1);
        charIdx--;
      } else {
        dynamicRole.textContent = current.substring(0, charIdx + 1);
        charIdx++;
      }

      let speed = isDeleting ? 40 : 80;
      if (!isDeleting && charIdx === current.length) {
        speed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        titleIdx = (titleIdx + 1) % titles.length;
        speed = 500;
      }
      setTimeout(typeEffect, speed);
    }
    typeEffect();
  }
})();
