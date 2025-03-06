// Supabase configuration
// Using a more secure approach for API keys
const SUPABASE_URL = 'https://mybqjefgjmcbybjqsgyg.supabase.co';
// Store key in a way that's slightly more obscured (though still not fully secure for production)
const SUPABASE_KEY = atob('ZXlKaGJHY2lPaUpJVXpJMU5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnBjM01pT2lKemRYQmhZbUZ6WlNJc0luSmxaaUk2SW0xNVluRnFaV1puYW0xalluVmlhbkZ6WjNsbklpd2ljbTlzWlNJNkltRnViMjRpTENKcFlYUWlPakUzTkRBNU5URTJOeklzSW1WNGNDSTZNakExTmpVeU56WTNNbjAudkNoRGpacVVMalFnRHJqZVpOX0ZFVDk1Y2ZiczNTb0hkTE91Qy14YVhHUQ==');
let supabaseInstance;

// Game variables
let player;
let enemies = [];
let bullets = [];
let explosions = [];
let powerUps = [];
let score = 0;
let gameState = "start"; // "start", "playing", "gameOver", "leaderboard", "submitScore"
let enemySpawnRate = 60; // Spawn an enemy every 60 frames (1 second)
let enemySpawnCounter = 0;
let shootCooldown = 15; // Cooldown between shots (15 frames)
let shootCounter = 0;
let level = 1;
let enemiesKilled = 0;
let levelThreshold = 10; // Number of enemies to kill to advance to next level
let backgroundStars = [];
let leaderboardData = [];
let playerEmail = '';
let inputField;
let submitButton;
let viewLeaderboardButton;
let backButton;
let errorMessage = '';

// Sound variables
let soundEnabled = true;
let volumeLevel = 0.5; // Default volume level (0.0 to 1.0)
let volumeSlider;
let shootSound;
let explosionSound;
let powerUpSound;
let gameOverSound;
let backgroundMusic;
let levelUpSound;

// Mobile detection
let isMobile = false;
let leftButton, rightButton, fireButton, startButton;

// Create HTML buttons for mobile
function createHTMLButtons() {
  console.log("Creating HTML buttons for mobile");
  
  // Remove any existing buttons first
  let existingStart = document.getElementById('html-start-button');
  if (existingStart) existingStart.remove();
  
  let existingLeaderboard = document.getElementById('html-leaderboard-button');
  if (existingLeaderboard) existingLeaderboard.remove();
  
  let existingSubmitScore = document.getElementById('html-submit-score-button');
  if (existingSubmitScore) existingSubmitScore.remove();
  
  // Create START button
  let startBtn = document.createElement('button');
  startBtn.id = 'html-start-button';
  startBtn.innerHTML = 'START';
  startBtn.style.position = 'fixed';
  startBtn.style.top = '10px';
  startBtn.style.right = '10px';
  startBtn.style.width = '80px';
  startBtn.style.backgroundColor = 'rgba(0, 191, 255, 0.7)';
  startBtn.style.color = 'white';
  startBtn.style.border = '2px solid #00BFFF';
  startBtn.style.borderRadius = '5px';
  startBtn.style.fontWeight = 'bold';
  startBtn.style.fontSize = '14px';
  startBtn.style.padding = '8px';
  startBtn.style.zIndex = '1000';
  
  // Add event listener
  startBtn.addEventListener('click', function() {
    console.log("HTML Start button clicked");
    if (gameState === "start" || gameState === "gameOver") {
      resetGame();
      gameState = "playing";
      if (soundEnabled) {
        backgroundMusic.amp(0.05 * volumeLevel, 0.5);
      }
      updateHTMLButtons();
    }
  });
  
  // Create Leaderboard button
  let leaderboardBtn = document.createElement('button');
  leaderboardBtn.id = 'html-leaderboard-button';
  leaderboardBtn.innerHTML = 'SCORES';
  leaderboardBtn.style.position = 'fixed';
  leaderboardBtn.style.top = '10px';
  leaderboardBtn.style.left = '10px';
  leaderboardBtn.style.width = '80px';
  leaderboardBtn.style.backgroundColor = 'rgba(0, 191, 255, 0.7)';
  leaderboardBtn.style.color = 'white';
  leaderboardBtn.style.border = '2px solid #00BFFF';
  leaderboardBtn.style.borderRadius = '5px';
  leaderboardBtn.style.fontWeight = 'bold';
  leaderboardBtn.style.fontSize = '14px';
  leaderboardBtn.style.padding = '8px';
  leaderboardBtn.style.zIndex = '1000';
  
  // Add event listener
  leaderboardBtn.addEventListener('click', function() {
    console.log("HTML Leaderboard button clicked");
    fetchLeaderboard();
    gameState = "leaderboard";
    updateHTMLButtons();
  });
  
  // Create Submit Score button
  let submitScoreBtn = document.createElement('button');
  submitScoreBtn.id = 'html-submit-score-button';
  submitScoreBtn.innerHTML = 'SUBMIT SCORE';
  submitScoreBtn.style.position = 'fixed';
  submitScoreBtn.style.bottom = '60px';
  submitScoreBtn.style.left = '50%';
  submitScoreBtn.style.transform = 'translateX(-50%)';
  submitScoreBtn.style.width = '160px';
  submitScoreBtn.style.backgroundColor = 'rgba(0, 255, 255, 0.7)';
  submitScoreBtn.style.color = 'white';
  submitScoreBtn.style.border = '2px solid #00FFFF';
  submitScoreBtn.style.borderRadius = '5px';
  submitScoreBtn.style.fontWeight = 'bold';
  submitScoreBtn.style.fontSize = '16px';
  submitScoreBtn.style.padding = '10px';
  submitScoreBtn.style.zIndex = '1000';
  submitScoreBtn.style.display = 'none'; // Hidden by default
  
  // Add event listener
  submitScoreBtn.addEventListener('click', function() {
    console.log("HTML Submit Score button clicked");
    if (gameState === "gameOver") {
      gameState = "submitScore";
      createHTMLEmailInput();
      updateHTMLButtons();
    }
  });
  
  // Add buttons to the document body
  document.body.appendChild(startBtn);
  document.body.appendChild(leaderboardBtn);
  document.body.appendChild(submitScoreBtn);
  
  // Also create back button
  createHTMLBackButton();
}

// Create HTML back button
function createHTMLBackButton() {
  // Remove any existing button first
  let existingBackBtn = document.getElementById('html-back-button');
  if (existingBackBtn) existingBackBtn.remove();
  
  // Create Back button
  let backBtn = document.createElement('button');
  backBtn.id = 'html-back-button';
  backBtn.innerHTML = 'BACK';
  backBtn.style.position = 'fixed';
  backBtn.style.bottom = '10px';
  backBtn.style.left = '50%';
  backBtn.style.transform = 'translateX(-50%)';
  backBtn.style.width = '120px';
  backBtn.style.backgroundColor = 'rgba(200, 200, 200, 0.7)';
  backBtn.style.color = 'black';
  backBtn.style.border = '2px solid #CCCCCC';
  backBtn.style.borderRadius = '5px';
  backBtn.style.fontWeight = 'bold';
  backBtn.style.fontSize = '16px';
  backBtn.style.padding = '10px';
  backBtn.style.zIndex = '1000';
  backBtn.style.display = 'none'; // Hidden by default
  
  // Add event listener
  backBtn.addEventListener('click', function() {
    console.log("HTML Back button clicked");
    if (gameState === "submitScore" || gameState === "leaderboard") {
      gameState = "gameOver";
      updateHTMLButtons();
    }
  });
  
  // Add button to the document body
  document.body.appendChild(backBtn);
}

// Create HTML email input field
function createHTMLEmailInput() {
  // Remove any existing elements first
  let existingInput = document.getElementById('html-email-input');
  if (existingInput) existingInput.remove();
  
  let existingSubmit = document.getElementById('html-email-submit');
  if (existingSubmit) existingSubmit.remove();
  
  // Create email input
  let emailInput = document.createElement('input');
  emailInput.id = 'html-email-input';
  emailInput.type = 'email';
  emailInput.placeholder = 'Enter your email';
  emailInput.style.position = 'fixed';
  emailInput.style.top = '50%';
  emailInput.style.left = '50%';
  emailInput.style.transform = 'translate(-50%, -50%)';
  emailInput.style.width = '80%';
  emailInput.style.maxWidth = '300px';
  emailInput.style.padding = '10px';
  emailInput.style.fontSize = '16px';
  emailInput.style.borderRadius = '5px';
  emailInput.style.border = '2px solid #00BFFF';
  emailInput.style.zIndex = '1000';
  emailInput.style.display = 'none'; // Hidden by default
  emailInput.style.backgroundColor = 'white'; // Ensure visible background
  
  // Create submit button
  let submitBtn = document.createElement('button');
  submitBtn.id = 'html-email-submit';
  submitBtn.innerHTML = 'SUBMIT';
  submitBtn.style.position = 'fixed';
  submitBtn.style.top = 'calc(50% + 60px)';
  submitBtn.style.left = '50%';
  submitBtn.style.transform = 'translateX(-50%)';
  submitBtn.style.width = '80%';
  submitBtn.style.maxWidth = '300px';
  submitBtn.style.backgroundColor = 'rgba(0, 255, 255, 0.7)';
  submitBtn.style.color = 'white';
  submitBtn.style.border = '2px solid #00FFFF';
  submitBtn.style.borderRadius = '5px';
  submitBtn.style.fontWeight = 'bold';
  submitBtn.style.fontSize = '16px';
  submitBtn.style.padding = '10px';
  submitBtn.style.zIndex = '1000';
  submitBtn.style.display = 'none'; // Hidden by default
  
  // Add event listener
  submitBtn.addEventListener('click', function() {
    console.log("HTML Email Submit button clicked");
    // Get email from HTML input
    const email = document.getElementById('html-email-input').value.trim();
    submitScoreWithEmail(email);
  });
  
  // Add elements to the document body
  document.body.appendChild(emailInput);
  document.body.appendChild(submitBtn);
}

// Function to submit score with email input
function submitScoreWithEmail(email) {
  console.log("Submitting score with email:", email);
  playerEmail = email;
  
  // Basic email validation
  if (!email || !email.includes('@') || !email.includes('.')) {
    errorMessage = 'Please enter a valid email address';
    return;
  }
  
  // Check if Supabase is available
  if (!supabaseInstance) {
    console.warn("Supabase client not initialized, using local storage instead");
    
    // Store in local storage as a fallback
    try {
      // Get existing scores
      let scores = [];
      const storedScores = localStorage.getItem('leaderboardScores');
      if (storedScores) {
        scores = JSON.parse(storedScores);
      }
      
      // Add new score
      scores.push({
        email,
        score,
        level,
        created_at: new Date().toISOString()
      });
      
      // Sort by score (descending)
      scores.sort((a, b) => b.score - a.score);
      
      // Keep only top 10
      scores = scores.slice(0, 10);
      
      // Save back to local storage
      localStorage.setItem('leaderboardScores', JSON.stringify(scores));
      
      // Use these scores for the leaderboard
      leaderboardData = scores;
      
      // Success - show leaderboard
      console.log("Score saved to local storage");
      errorMessage = '';
      gameState = "leaderboard";
      updateHTMLButtons();
      hideHTMLInputElements();
    } catch (err) {
      console.error('Failed to save score to local storage:', err);
      errorMessage = 'Failed to save score. Please try again.';
    }
    return;
  }
  
  // If Supabase is available, submit score to the database
  try {
    supabaseInstance
      .from('leaderboard')
      .insert([
        { email, score, level, created_at: new Date().toISOString() }
      ])
      .then(response => {
        const { data, error } = response;
        
        if (error) {
          console.error('Error submitting score:', error);
          errorMessage = 'Failed to submit score. Please try again.';
          return;
        }
        
        // Success - show leaderboard
        console.log("Score submitted successfully to Supabase");
        errorMessage = '';
        fetchLeaderboard();
        gameState = "leaderboard";
        updateHTMLButtons();
        hideHTMLInputElements();
      });
  } catch (err) {
    console.error('Failed to submit score:', err);
    errorMessage = 'Failed to submit score. Please try again.';
  }
}

// Hide email input elements
function hideHTMLInputElements() {
  const emailInput = document.getElementById('html-email-input');
  if (emailInput) emailInput.style.display = 'none';
  
  const submitBtn = document.getElementById('html-email-submit');
  if (submitBtn) submitBtn.style.display = 'none';
}

// Update HTML buttons based on game state
function updateHTMLButtons() {
  const startBtn = document.getElementById('html-start-button');
  const leaderboardBtn = document.getElementById('html-leaderboard-button');
  const submitScoreBtn = document.getElementById('html-submit-score-button');
  const backBtn = document.getElementById('html-back-button');
  const emailInput = document.getElementById('html-email-input');
  const emailSubmit = document.getElementById('html-email-submit');
  
  if (startBtn) startBtn.style.display = (gameState === "start" || gameState === "gameOver") ? 'block' : 'none';
  if (leaderboardBtn) leaderboardBtn.style.display = (gameState === "start" || gameState === "gameOver") ? 'block' : 'none';
  if (submitScoreBtn) submitScoreBtn.style.display = (gameState === "gameOver") ? 'block' : 'none';
  if (backBtn) backBtn.style.display = (gameState === "submitScore" || gameState === "leaderboard") ? 'block' : 'none';
  
  if (emailInput) emailInput.style.display = (gameState === "submitScore") ? 'block' : 'none';
  if (emailSubmit) emailSubmit.style.display = (gameState === "submitScore") ? 'block' : 'none';
}

function preload() {
  // Load sound effects with error handling
  try {
    shootSound = loadSound('sounds/shoot.mp3', 
      () => console.log("Shoot sound loaded"), 
      (err) => console.error("Error loading shoot sound:", err));
    
    explosionSound = loadSound('sounds/explosion.mp3', 
      () => console.log("Explosion sound loaded"), 
      (err) => console.error("Error loading explosion sound:", err));
    
    powerUpSound = loadSound('sounds/powerup.mp3', 
      () => console.log("Power-up sound loaded"), 
      (err) => console.error("Error loading power-up sound:", err));
    
    gameOverSound = loadSound('sounds/gameover.mp3', 
      () => console.log("Game over sound loaded"), 
      (err) => console.error("Error loading game over sound:", err));
    
    backgroundMusic = loadSound('sounds/background.mp3', 
      () => console.log("Background music loaded"), 
      (err) => console.error("Error loading background music:", err));
    
    console.log("Attempted to load all sounds");
  } catch (e) {
    console.error("Error in preload:", e);
    // Set soundEnabled to false to prevent further errors
    soundEnabled = false;
  }
}

// Add these callback functions after preload
function soundLoaded(sound) {
  console.log("Sound loaded successfully:", sound.url);
}

function soundError(err) {
  console.error("Error loading sound:", err);
}

// Add this diagnostic function after the preload function
function diagnoseSoundIssues() {
  console.log("===== SOUND DIAGNOSTIC =====");
  console.log("soundEnabled:", soundEnabled);
  
  // Check if sound objects exist
  console.log("shootSound exists:", shootSound !== undefined);
  console.log("explosionSound exists:", explosionSound !== undefined);
  console.log("powerUpSound exists:", powerUpSound !== undefined);
  console.log("gameOverSound exists:", gameOverSound !== undefined);
  console.log("backgroundMusic exists:", backgroundMusic !== undefined);
  
  // Check audio context state
  if (typeof getAudioContext === 'function') {
    const audioContext = getAudioContext();
    console.log("AudioContext state:", audioContext.state);
    console.log("AudioContext sampleRate:", audioContext.sampleRate);
  } else {
    console.log("getAudioContext function not found");
  }
  
  // DO NOT try to play sounds here - that can cause freezing
  console.log("===== END DIAGNOSTIC =====");
}

function setup() {
  createCanvas(600, 800);
  player = new Player(width/2, height - 100);
  
  // Check if device is mobile
  isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  console.log("Mobile device detected:", isMobile);
  
  // Initialize sound
  initializeSound();
  
  // Add diagnostic after a delay to check sound initialization
  setTimeout(diagnoseSoundIssues, 2000);
  
  // Initialize Supabase client
  try {
    if (typeof window.initializeSupabase === 'function') {
      supabaseInstance = window.initializeSupabase(SUPABASE_URL, SUPABASE_KEY);
    } else if (typeof supabase !== 'undefined') {
      supabaseInstance = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } else {
      supabaseInstance = null;
    }
  } catch (error) {
    supabaseInstance = null;
  }
  
  // Create UI elements
  inputField = createInput('');
  inputField.position(width/2 - 100, height/2);
  inputField.size(200, 30);
  inputField.attribute('placeholder', 'Enter your email');
  inputField.hide();
  
  submitButton = createButton('Submit Score');
  submitButton.position(width/2 - 100, height/2 + 40);
  submitButton.size(200, 30);
  submitButton.mousePressed(submitScore);
  submitButton.hide();
  
  viewLeaderboardButton = createButton('View Leaderboard');
  viewLeaderboardButton.position(width/2 - 100, height/2 + 120);
  viewLeaderboardButton.size(200, 30);
  viewLeaderboardButton.mousePressed(() => {
    fetchLeaderboard();
    gameState = "leaderboard";
  });
  viewLeaderboardButton.hide();
  
  backButton = createButton('Back');
  backButton.position(width/2 - 100, height - 100);
  backButton.size(200, 30);
  backButton.mousePressed(() => {
    gameState = "start";
  });
  backButton.hide();
  
  // Create sound toggle button
  soundToggleButton = createButton('🔊');
  soundToggleButton.position(width - 50, 20);
  soundToggleButton.size(40, 40);
  soundToggleButton.mousePressed(toggleSound);
  
  // Create volume slider
  volumeSlider = createSlider(0, 100, volumeLevel * 100);
  volumeSlider.position(width - 160, 30);
  volumeSlider.size(100, 20);
  volumeSlider.input(updateVolume);
  
  // Create mobile controls if on mobile device
  if (isMobile) {
    // Create HTML buttons for mobile
    createHTMLButtons();
    
    // Simple mobile controls
    leftButton = createButton('←');
    leftButton.position(50, height - 100);
    leftButton.size(80, 80);
    leftButton.class('touch-button');
    
    rightButton = createButton('→');
    rightButton.position(width - 130, height - 100);
    rightButton.size(80, 80);
    rightButton.class('touch-button');
    
    fireButton = createButton('🔫');
    fireButton.position(width/2 - 40, height - 100);
    fireButton.size(80, 80);
    fireButton.class('touch-button');
    
    // Hide mobile controls initially
    leftButton.hide();
    rightButton.hide();
    fireButton.hide();
  }
  
  // Create background stars
  for (let i = 0; i < 100; i++) {
    backgroundStars.push({
      x: random(width),
      y: random(height),
      size: random(1, 3),
      speed: random(0.5, 2)
    });
  }
}

// Initialize sound effects
function initializeSound() {
  soundEnabled = true;
  volumeLevel = 0.5;
  
  // Remove any existing sound buttons first
  let existingBtn = document.getElementById('start-sound-button');
  if (existingBtn) existingBtn.remove();
  
  console.log("Initializing sound...");
  
  // First check if any sounds failed to load
  if (!backgroundMusic || !shootSound || !explosionSound || !powerUpSound || !gameOverSound) {
    console.warn("Some sound files failed to load, using fallback mode");
  }
  
  // Create a very prominent button for enabling sound
  let startSoundBtn = document.createElement('button');
  startSoundBtn.id = 'start-sound-button';
  startSoundBtn.innerHTML = '🔊 CLICK HERE TO ENABLE SOUND';
  startSoundBtn.style.position = 'fixed';
  startSoundBtn.style.top = '50%';
  startSoundBtn.style.left = '50%';
  startSoundBtn.style.transform = 'translate(-50%, -50%)';
  startSoundBtn.style.padding = '20px 40px';
  startSoundBtn.style.backgroundColor = '#FF3366';
  startSoundBtn.style.color = 'white';
  startSoundBtn.style.border = 'none';
  startSoundBtn.style.borderRadius = '5px';
  startSoundBtn.style.fontSize = '24px';
  startSoundBtn.style.fontWeight = 'bold';
  startSoundBtn.style.cursor = 'pointer';
  startSoundBtn.style.zIndex = '9999';
  startSoundBtn.style.boxShadow = '0 0 20px rgba(255,255,255,0.5)';
  
  // Add a failsafe timeout to prevent the button from being stuck if something goes wrong
  let soundInitializationTimeout;
  
  startSoundBtn.addEventListener('click', function() {
    console.log("Sound button clicked!");
    
    // Add a loading indicator to the button
    this.innerHTML = '🔊 INITIALIZING SOUND...';
    this.style.backgroundColor = '#666666';
    
    // Set a timeout to prevent hanging
    soundInitializationTimeout = setTimeout(() => {
      console.warn("Sound initialization took too long - enabling failsafe mode");
      document.getElementById('sound-status').innerHTML = "Sound initialization failed - game will continue without sound";
      document.getElementById('sound-status').style.backgroundColor = "rgba(255,165,0,0.7)"; // Orange
      soundEnabled = false;
      this.remove();
    }, 5000); // 5 second timeout
    
    // Step 1: Resume audio context - this is the most essential part
    if (typeof getAudioContext === 'function') {
      let context = getAudioContext();
      context.resume().then(() => {
        console.log("AudioContext resumed successfully");
        
        // Step 2: Mark the button as successful and remove it
        clearTimeout(soundInitializationTimeout);
        this.remove();
        
        // Step 3: Try to play a test sound in a safe way
        if (shootSound && shootSound.isLoaded() && typeof shootSound.play === 'function') {
          try {
            shootSound.setVolume(0.01);
            shootSound.play();
            setTimeout(() => {
              if (shootSound.isPlaying && shootSound.isPlaying()) {
                shootSound.stop();
              }
            }, 100);
            console.log("Test sound played successfully");
          } catch (e) {
            console.error("Error playing test sound:", e);
            // Don't disable sound yet, maybe other sounds will work
          }
        } else {
          console.warn("Shoot sound not available for testing");
        }
        
        // Step 4: Diagnostic in a non-blocking way
        setTimeout(() => {
          try {
            console.log("Running non-blocking sound checks...");
            let statusDiv = document.getElementById('sound-status');
            
            // Display sound state
            if (shootSound && shootSound.isLoaded()) {
              statusDiv.innerHTML = "Sound initialized - Game ready!";
              statusDiv.style.backgroundColor = "rgba(0,128,0,0.7)"; // Green
              // Auto-hide after 5 seconds
              setTimeout(() => {
                statusDiv.style.opacity = "0.5";
              }, 5000);
            } else {
              statusDiv.innerHTML = "Sound partially initialized";
              statusDiv.style.backgroundColor = "rgba(255,165,0,0.7)"; // Orange
            }
          } catch (e) {
            console.error("Error in sound diagnostics:", e);
          }
        }, 1000);
      }).catch(err => {
        // Handle audio context resume failure
        console.error("Failed to resume AudioContext:", err);
        clearTimeout(soundInitializationTimeout);
        soundEnabled = false;
        this.innerHTML = '❌ SOUND DISABLED';
        this.style.backgroundColor = '#FF3333';
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
          this.remove();
        }, 3000);
      });
    } else {
      // Browser doesn't support AudioContext
      console.error("getAudioContext function not found");
      clearTimeout(soundInitializationTimeout);
      soundEnabled = false;
      this.innerHTML = '❌ SOUND NOT SUPPORTED';
      this.style.backgroundColor = '#FF3333';
      
      // Auto-remove after 3 seconds
      setTimeout(() => {
        this.remove();
      }, 3000);
    }
  });
  
  document.body.appendChild(startSoundBtn);
}

// Update volume based on slider
function updateVolume() {
  volumeLevel = volumeSlider.value() / 100;
  
  // Update background music volume immediately if it's playing
  if (soundEnabled) {
    backgroundMusic.amp(0.05 * volumeLevel, 0.1);
  }
}

// Play a sound with attack and release
function playSound(sound, frequency = 440, amp = 0.5, duration = 0.5) {
  if (!soundEnabled) {
    return false;
  }
  
  if (!sound) {
    // console.warn("Attempted to play undefined sound"); // Commented out to reduce console spam
    return false;
  }
  
  try {
    // Check if the sound is ready to play
    if (!sound.isLoaded()) {
      // console.warn("Sound not loaded yet"); // Commented out to reduce console spam
      return false;
    }
    
    if (sound.isPlaying()) {
      sound.stop();
    }
    sound.setVolume(amp * volumeLevel);
    sound.play();
    return true; // Successfully played
  } catch (e) {
    console.error("Error playing sound:", e);
    
    // If there's an error playing sound, disable it to prevent further errors
    if (e.toString().includes("play() failed")) {
      console.warn("Disabling sound due to playback issues");
      soundEnabled = false;
      if (soundToggleButton) {
        soundToggleButton.html('🔇');
      }
    }
    
    return false;
  }
}

// Toggle sound on/off
function toggleSound() {
  soundEnabled = !soundEnabled;
  
  console.log("Sound toggled:", soundEnabled ? "ON" : "OFF");
  
  if (soundEnabled) {
    soundToggleButton.html('🔊');
    if (gameState === "playing" && backgroundMusic) {
      try {
        backgroundMusic.loop();
        backgroundMusic.setVolume(0.05 * volumeLevel);
        console.log("Background music started");
      } catch (e) {
        console.error("Error starting background music:", e);
      }
    }
  } else {
    soundToggleButton.html('🔇');
    if (backgroundMusic && backgroundMusic.isPlaying()) {
      try {
        backgroundMusic.pause();
        console.log("Background music paused");
      } catch (e) {
        console.error("Error pausing background music:", e);
      }
    }
  }
}

function draw() {
  background(0);
  
  // Draw background stars
  drawBackgroundStars();
  
  // Handle mobile controls
  if (isMobile && gameState === "playing") {
    if (mouseIsPressed) {
      // Left side of screen - move left
      if (mouseX < width/3) {
        player.move("left");
      }
      // Right side of screen - move right
      else if (mouseX > width*2/3) {
        player.move("right");
      }
      // Middle of screen - shoot
      else if (shootCounter >= (player.rapidFireActive ? shootCooldown / 2 : shootCooldown)) {
        let newBullets = player.shoot();
        bullets = bullets.concat(newBullets);
        shootCounter = 0;
        playSound(shootSound, 880, 0.1, 0.1);
      }
    }
  }
  
  // Game state handling
  if (gameState === "start") {
    drawStartScreen();
    hideAllUI();
    if (!isMobile) viewLeaderboardButton.show();
    if (isMobile) updateHTMLButtons();
  } else if (gameState === "playing") {
    drawPlayingScreen();
    hideAllUI();
    if (isMobile) {
      leftButton.show();
      rightButton.show();
      fireButton.show();
      updateHTMLButtons();
    }
  } else if (gameState === "gameOver") {
    drawGameOverScreen();
    hideAllUI();
    if (!isMobile) viewLeaderboardButton.show();
    if (isMobile) updateHTMLButtons();
  } else if (gameState === "submitScore") {
    drawSubmitScoreScreen();
    if (!isMobile) {
      inputField.show();
      submitButton.show();
      backButton.show();
    }
    if (isMobile) updateHTMLButtons();
  } else if (gameState === "leaderboard") {
    drawLeaderboardScreen();
    hideAllUI();
    if (!isMobile) backButton.show();
    if (isMobile) updateHTMLButtons();
  }
  
  // Always show sound controls
  soundToggleButton.show();
  volumeSlider.show();
  
  // Draw volume label
  fill(255);
  textSize(12);
  textAlign(RIGHT);
  text("Volume:", width - 165, 42);
}

function hideAllUI() {
  if (inputField) inputField.hide();
  if (submitButton) submitButton.hide();
  if (viewLeaderboardButton) viewLeaderboardButton.hide();
  if (backButton) backButton.hide();
  
  // Hide mobile controls
  if (isMobile) {
    leftButton.hide();
    rightButton.hide();
    fireButton.hide();
  }
}

function drawBackgroundStars() {
  fill(255);
  noStroke();
  for (let star of backgroundStars) {
    ellipse(star.x, star.y, star.size);
    star.y += star.speed;
    if (star.y > height) {
      star.y = 0;
      star.x = random(width);
    }
  }
}

function drawStartScreen() {
  // Debug info
  fill(255);
  textSize(12);
  textAlign(LEFT);
  text(`Game Version: 1.1.0`, 10, 20);
  
  // Title
  fill(0, 255, 255);
  textSize(50);
  textAlign(CENTER);
  text("SPACE SHOOTER", width/2, height/3);
  
  // Instructions
  fill(255);
  textSize(20);
  
  if (isMobile) {
    text("Touch controls:", width/2, height/2);
    text("Left side: Move left", width/2, height/2 + 30);
    text("Right side: Move right", width/2, height/2 + 60);
    text("Center: Shoot", width/2, height/2 + 90);
  } else {
    text("Arrow Keys: Move", width/2, height/2);
    text("Space: Shoot", width/2, height/2 + 30);
    text("M: Toggle Sound", width/2, height/2 + 60);
  }
  
  // Power-up instructions
  textSize(18);
  fill(255, 0, 255);
  text("Purple Power-up: Rapid Fire", width/2, height/2 + 130);
  fill(0, 255, 255);
  text("Cyan Power-up: Multi Shot", width/2, height/2 + 160);
  fill(0, 255, 0);
  text("Green Power-up: Shield", width/2, height/2 + 190);
  
  // Start prompt
  fill(255);
  textSize(25);
  if (isMobile) {
    text("Tap START button", width/2, height/2 + 240);
  } else {
    text("Press ENTER to start", width/2, height/2 + 240);
  }
  
  // Draw animated ship
  let shipX = width/2;
  let shipY = height/2 - 100;
  let shipSize = 50;
  
  // Ship body
  fill(0, 255, 255);
  rectMode(CENTER);
  rect(shipX, shipY, shipSize, shipSize);
  
  // Ship nose
  fill(0, 200, 200);
  triangle(
    shipX - shipSize/2, shipY,
    shipX + shipSize/2, shipY,
    shipX, shipY - shipSize/2
  );
  
  // Animated thrusters
  let thrusterSize = map(sin(frameCount * 0.1), -1, 1, 10, 20);
  fill(255, 100, 0);
  triangle(
    shipX - shipSize/4, shipY + shipSize/2,
    shipX, shipY + shipSize/2 + thrusterSize,
    shipX + shipSize/4, shipY + shipSize/2
  );
  
  // Now we'll simply play the background music if it's not already playing
  if (soundEnabled && backgroundMusic && !backgroundMusic.isPlaying() && frameCount % 60 === 0) {
    try {
      backgroundMusic.setVolume(0.05 * volumeLevel);
      backgroundMusic.loop();
    } catch (e) {
      console.error("Error starting background music:", e);
    }
  }
}

// Draw the main gameplay screen
function drawPlayingScreen() {
  // Update player power-ups
  player.updatePowerUps();
  
  // Spawn enemies
  enemySpawnCounter++;
  if (enemySpawnCounter >= enemySpawnRate) {
    enemies.push(new Enemy(random(50, width - 50), -20));
    enemySpawnCounter = 0;
    
    // Increase difficulty as level increases
    enemySpawnRate = max(10, 60 - (level * 5));
  }
  
  // Player shooting
  shootCounter++;
  if (keyIsDown(32) && shootCounter >= (player.rapidFireActive ? shootCooldown / 2 : shootCooldown)) { // Space key
    let newBullets = player.shoot();
    bullets = bullets.concat(newBullets);
    shootCounter = 0;
    
    // Play shoot sound
    playSound(shootSound, 880, 0.1, 0.1);
  }
  
  // Move and draw player
  if (keyIsDown(LEFT_ARROW)) {
    player.move("left");
  }
  if (keyIsDown(RIGHT_ARROW)) {
    player.move("right");
  }
  player.draw();
  
  // Move and draw bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].move();
    bullets[i].draw();
    
    // Remove bullets that go off screen
    if (bullets[i].y < 0) {
      bullets.splice(i, 1);
    }
  }
  
  // Move and draw enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].move();
    enemies[i].draw();
    
    // Check for collision with player
    if (collideRectRect(
      player.x, player.y, player.width, player.height,
      enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height
    )) {
      if (player.shieldActive) {
        // Shield absorbs the hit
        explosions.push(new Explosion(enemies[i].x, enemies[i].y, enemies[i].type));
        enemies.splice(i, 1);
        continue;
      } else {
        // Player loses a life
        player.lives--;
        explosions.push(new Explosion(enemies[i].x, enemies[i].y, enemies[i].type));
        enemies.splice(i, 1);
        
        if (player.lives <= 0) {
          gameState = "gameOver";
        }
        continue;
      }
    }
    
    // Remove enemies that go off screen
    if (enemies[i].y > height) {
      enemies.splice(i, 1);
    }
  }
  
  // Move and draw power-ups
  for (let i = powerUps.length - 1; i >= 0; i--) {
    powerUps[i].move();
    powerUps[i].draw();
    
    // Check for collision with player
    if (collideRectRect(
      player.x, player.y, player.width, player.height,
      powerUps[i].x, powerUps[i].y, powerUps[i].width, powerUps[i].height
    )) {
      player.activatePowerUp(powerUps[i].type);
      
      // Play power-up sound
      playSound(powerUpSound, 660, 0.3, 0.2);
      
      powerUps.splice(i, 1);
      continue;
    }
    
    // Remove power-ups that go off screen
    if (powerUps[i].y > height) {
      powerUps.splice(i, 1);
    }
  }
  
  // Check for bullet-enemy collisions
  for (let i = bullets.length - 1; i >= 0; i--) {
    for (let j = enemies.length - 1; j >= 0; j--) {
      if (collideRectRect(
        bullets[i].x, bullets[i].y, bullets[i].width, bullets[i].height,
        enemies[j].x, enemies[j].y, enemies[j].width, enemies[j].height
      )) {
        // Check if enemy is destroyed
        if (enemies[j].takeDamage()) {
          // Create explosion
          explosions.push(new Explosion(enemies[j].x, enemies[j].y, enemies[j].type));
          
          // Play explosion sound
          playSound(explosionSound, 150 + random(100), 0.3, 0.2);
          
          // Increase score
          score += 10 * (enemies[j].type + 1); // More points for harder enemies
          
          // Randomly spawn power-up (15% chance, higher for special enemies)
          let powerUpChance = 0.15;
          if (enemies[j].type === 1) powerUpChance = 0.2;
          if (enemies[j].type === 2) powerUpChance = 0.25;
          
          if (random() < powerUpChance) {
            const powerUpTypes = ['rapidFire', 'multiShot', 'shield'];
            const randomType = powerUpTypes[floor(random(powerUpTypes.length))];
            powerUps.push(new PowerUp(enemies[j].x, enemies[j].y, randomType));
          }
          
          // Remove enemy
          enemies.splice(j, 1);
          
          // Increment enemies killed counter
          enemiesKilled++;
          
          // Check for level up
          if (enemiesKilled >= levelThreshold) {
            level++;
            enemiesKilled = 0;
            levelThreshold += 5; // Increase threshold for next level
            
            // Play level up sound
            playSound(levelUpSound, 440, 0.5, 0.2);
          }
        } else {
          // Enemy was hit but not destroyed
          // Create small hit effect
          explosions.push(new Explosion(bullets[i].x, bullets[i].y, -1)); // -1 for small hit effect
        }
        
        // Remove bullet
        bullets.splice(i, 1);
        break;
      }
    }
  }
  
  // Update and draw explosions
  for (let i = explosions.length - 1; i >= 0; i--) {
    explosions[i].update();
    explosions[i].draw();
    
    // Remove completed explosions
    if (explosions[i].radius >= explosions[i].maxRadius) {
      explosions.splice(i, 1);
    }
  }
  
  // Display game info
  fill(255);
  textSize(20);
  textAlign(LEFT);
  text(`Score: ${score}`, 20, 30);
  text(`Lives: ${player.lives}`, 20, 60);
  text(`Level: ${level}`, 20, 90);
  
  // Display active power-ups
  textAlign(RIGHT);
  if (player.rapidFireActive) {
    fill(255, 0, 255);
    text("Rapid Fire", width - 20, 30);
  }
  if (player.multiShotActive) {
    fill(0, 255, 255);
    text("Multi Shot", width - 20, 60);
  }
  if (player.shieldActive) {
    fill(0, 255, 0);
    text("Shield", width - 20, 90);
  }
}

// Draw the game over screen
function drawGameOverScreen() {
  // Play game over sound once when entering this screen
  if (frameCount % 60 === 0 && frameCount < 120) {
    playSound(gameOverSound, 220, 0.5, 0.2);
    
    // Stop background music
    if (soundEnabled) {
      backgroundMusic.amp(0, 1);
    }
  }
  
  // Game Over text
  fill(255, 0, 0);
  textSize(60);
  textAlign(CENTER);
  text("GAME OVER", width/2, height/3);
  
  // Final score
  fill(255);
  textSize(30);
  text(`Final Score: ${score}`, width/2, height/2);
  text(`Level Reached: ${level}`, width/2, height/2 + 40);
  
  // High score (could be expanded to save high scores)
  let highScore = getHighScore();
  if (score > highScore) {
    setHighScore(score);
    highScore = score;
    fill(255, 255, 0);
    textSize(25);
    text("NEW HIGH SCORE!", width/2, height/2 + 80);
  }
  
  fill(255);
  textSize(25);
  text(`High Score: ${highScore}`, width/2, height/2 + 120);
  
  // Restart prompt - different for mobile vs desktop
  fill(255);
  textSize(25);
  if (!isMobile) {
    text("Press ENTER to play again", width/2, height/2 + 180);
    
    // Submit score prompt
    fill(0, 255, 255);
    textSize(25);
    text("Press S to submit your score", width/2, height/2 + 220);
    
    // Sound controls reminder
    fill(200);
    textSize(16);
    text("Press M to toggle sound", width/2, height/2 + 260);
  } else {
    text("Tap START button to play again", width/2, height/2 + 180);
    
    // Submit score prompt for mobile
    fill(0, 255, 255);
    textSize(25);
    text("Tap SUBMIT SCORE button", width/2, height/2 + 220);
  }
  
  // Draw explosion effects
  if (frameCount % 20 === 0) {
    explosions.push(new Explosion(random(width), random(height), floor(random(3))));
  }
}

// Handle key presses
function keyPressed() {
  if (keyCode === ENTER) {
    if (gameState === "start") {
      // Start the game
      resetGame();
      gameState = "playing";
      
      // Start background music
      if (soundEnabled) {
        backgroundMusic.amp(0.05 * volumeLevel, 0.5);
      }
    } else if (gameState === "gameOver") {
      // Restart the game
      resetGame();
      gameState = "playing";
      
      // Start background music
      if (soundEnabled) {
        backgroundMusic.amp(0.05 * volumeLevel, 0.5);
      }
    }
  } else if (keyCode === 83) { // 'S' key
    if (gameState === "gameOver") {
      // Go to submit score screen
      gameState = "submitScore";
    }
  } else if (keyCode === 27) { // ESC key
    if (gameState === "submitScore" || gameState === "leaderboard") {
      // Go back to game over screen
      gameState = "gameOver";
    }
  } else if (keyCode === 77) { // 'M' key for mute/unmute
    toggleSound();
  }
}

function resetGame() {
  // Reset game variables
  player = new Player(width/2, height - 100);
  enemies = [];
  bullets = [];
  explosions = [];
  powerUps = [];
  score = 0;
  level = 1;
  enemiesKilled = 0;
  levelThreshold = 10;
  enemySpawnRate = 60;
}

// Collision detection function for rectangles
function collideRectRect(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

// Player class (spaceship)
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.speed = 5;
    this.lives = 3;
    // Power-up properties
    this.rapidFireActive = false;
    this.rapidFireTimer = 0;
    this.multiShotActive = false;
    this.multiShotTimer = 0;
    this.shieldActive = false;
    this.shieldTimer = 0;
  }
  
  draw() {
    // Draw shield if active
    if (this.shieldActive) {
      fill(0, 255, 0, 100); // Semi-transparent green
      ellipse(this.x, this.y, this.width * 1.5, this.height * 1.5);
    }
    
    // Draw player ship
    fill(0, 255, 255); // Cyan player
    rectMode(CENTER);
    rect(this.x, this.y, this.width, this.height);
    
    // Draw a triangle on top to make it look like a ship
    fill(0, 200, 200);
    triangle(
      this.x - this.width/2, this.y,
      this.x + this.width/2, this.y,
      this.x, this.y - this.height/2
    );
  }
  
  move(direction) {
    if (direction === "left") {
      this.x -= this.speed;
    } else if (direction === "right") {
      this.x += this.speed;
    }
    
    // Keep player within canvas bounds
    this.x = constrain(this.x, this.width/2, width - this.width/2);
  }
  
  shoot() {
    if (this.multiShotActive) {
      // Create 3 bullets in a spread pattern
      return [
        new Bullet(this.x - 10, this.y - this.height/2),
        new Bullet(this.x, this.y - this.height/2),
        new Bullet(this.x + 10, this.y - this.height/2)
      ];
    } else {
      // Create a single bullet
      return [new Bullet(this.x, this.y - this.height/2)];
    }
  }
  
  updatePowerUps() {
    // Update rapid fire timer
    if (this.rapidFireActive) {
      this.rapidFireTimer--;
      if (this.rapidFireTimer <= 0) {
        this.rapidFireActive = false;
      }
    }
    
    // Update multi-shot timer
    if (this.multiShotActive) {
      this.multiShotTimer--;
      if (this.multiShotTimer <= 0) {
        this.multiShotActive = false;
      }
    }
    
    // Update shield timer
    if (this.shieldActive) {
      this.shieldTimer--;
      if (this.shieldTimer <= 0) {
        this.shieldActive = false;
      }
    }
  }
  
  activatePowerUp(type) {
    const powerUpDuration = 300; // 5 seconds at 60 FPS
    
    if (type === 'rapidFire') {
      this.rapidFireActive = true;
      this.rapidFireTimer = powerUpDuration;
    } else if (type === 'multiShot') {
      this.multiShotActive = true;
      this.multiShotTimer = powerUpDuration;
    } else if (type === 'shield') {
      this.shieldActive = true;
      this.shieldTimer = powerUpDuration;
    }
  }
}

// Enemy class (square enemies)
class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = random(30, 50);
    this.height = random(30, 50);
    this.speed = random(2, 3 + level * 0.5); // Speed increases with level
    this.type = floor(random(3)); // 0: normal, 1: zigzag, 2: fast
    this.zigzagDirection = 1;
    this.zigzagCounter = 0;
    this.health = this.type === 2 ? 2 : 1; // Fast enemies have more health
  }
  
  draw() {
    rectMode(CENTER);
    
    // Different colors for different enemy types
    if (this.type === 0) {
      fill(255, 0, 0); // Red for normal enemies
    } else if (this.type === 1) {
      fill(255, 165, 0); // Orange for zigzag enemies
    } else if (this.type === 2) {
      fill(255, 0, 255); // Magenta for fast enemies
    }
    
    // Draw enemy body
    rect(this.x, this.y, this.width, this.height);
    
    // Draw enemy details based on type
    if (this.type === 0) {
      // Normal enemy - X pattern
      stroke(255);
      strokeWeight(2);
      line(this.x - this.width/3, this.y - this.height/3, this.x + this.width/3, this.y + this.height/3);
      line(this.x + this.width/3, this.y - this.height/3, this.x - this.width/3, this.y + this.height/3);
      noStroke();
    } else if (this.type === 1) {
      // Zigzag enemy - Z pattern
      stroke(255);
      strokeWeight(2);
      line(this.x - this.width/3, this.y - this.height/3, this.x + this.width/3, this.y - this.height/3);
      line(this.x + this.width/3, this.y - this.height/3, this.x - this.width/3, this.y + this.height/3);
      line(this.x - this.width/3, this.y + this.height/3, this.x + this.width/3, this.y + this.height/3);
      noStroke();
    } else if (this.type === 2) {
      // Fast enemy - Circle pattern
      stroke(255);
      strokeWeight(2);
      noFill();
      ellipse(this.x, this.y, this.width/2, this.height/2);
      noStroke();
    }
  }
  
  move() {
    // Different movement patterns based on enemy type
    if (this.type === 0) {
      // Normal enemy - moves straight down
      this.y += this.speed;
    } else if (this.type === 1) {
      // Zigzag enemy - moves in a zigzag pattern
      this.y += this.speed;
      this.zigzagCounter += 1;
      
      if (this.zigzagCounter >= 20) {
        this.zigzagDirection *= -1;
        this.zigzagCounter = 0;
      }
      
      this.x += this.zigzagDirection * 2;
      
      // Keep within screen bounds
      if (this.x < this.width/2) {
        this.x = this.width/2;
        this.zigzagDirection = 1;
      } else if (this.x > width - this.width/2) {
        this.x = width - this.width/2;
        this.zigzagDirection = -1;
      }
    } else if (this.type === 2) {
      // Fast enemy - moves faster
      this.y += this.speed * 1.5;
    }
  }
  
  takeDamage() {
    this.health--;
    return this.health <= 0;
  }
}

// Bullet class
class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 5;
    this.height = 10;
    this.speed = -10; // Move upward
    this.power = 1; // Default bullet power
  }
  
  draw() {
    fill(255, 255, 0); // Yellow bullet
    rectMode(CENTER);
    rect(this.x, this.y, this.width, this.height);
  }
  
  move() {
    this.y += this.speed;
  }
}

// Explosion class
class Explosion {
  constructor(x, y, type = 0) {
    this.x = x;
    this.y = y;
    this.radius = 5;
    this.maxRadius = type === -1 ? 15 : 30; // Smaller for hit effects
    this.type = type; // Enemy type or -1 for hit effect
    this.particles = [];
    
    // Create particles for the explosion
    if (type !== -1) {
      const particleCount = type === 2 ? 15 : 10; // More particles for stronger enemies
      for (let i = 0; i < particleCount; i++) {
        this.particles.push({
          x: this.x,
          y: this.y,
          vx: random(-3, 3),
          vy: random(-3, 3),
          size: random(2, 5),
          life: 30
        });
      }
    }
  }
  
  draw() {
    if (this.type === -1) {
      // Hit effect (small white circle)
      fill(255, 255, 255, map(this.radius, 5, this.maxRadius, 255, 0));
      noStroke();
      ellipse(this.x, this.y, this.radius * 2);
    } else {
      // Main explosion circle
      let explosionColor;
      if (this.type === 0) {
        explosionColor = color(255, 100, 0, map(this.radius, 5, this.maxRadius, 255, 0));
      } else if (this.type === 1) {
        explosionColor = color(255, 165, 0, map(this.radius, 5, this.maxRadius, 255, 0));
      } else if (this.type === 2) {
        explosionColor = color(255, 0, 255, map(this.radius, 5, this.maxRadius, 255, 0));
      }
      
      fill(explosionColor);
      noStroke();
      ellipse(this.x, this.y, this.radius * 2);
      
      // Draw particles
      for (let particle of this.particles) {
        if (particle.life > 0) {
          fill(255, 255, 0, map(particle.life, 30, 0, 255, 0));
          ellipse(particle.x, particle.y, particle.size);
          
          // Update particle position
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.life--;
        }
      }
    }
  }
  
  update() {
    this.radius += 2;
  }
}

// PowerUp class
class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 20;
    this.speed = 3;
    this.type = type; // 'rapidFire', 'multiShot', 'shield'
    this.active = true;
  }
  
  draw() {
    rectMode(CENTER);
    if (this.type === 'rapidFire') {
      fill(255, 0, 255); // Magenta for rapid fire
    } else if (this.type === 'multiShot') {
      fill(0, 255, 255); // Cyan for multi-shot
    } else if (this.type === 'shield') {
      fill(0, 255, 0); // Green for shield
    }
    rect(this.x, this.y, this.width, this.height);
  }
  
  move() {
    this.y += this.speed;
  }
}

// Functions to handle high score
function getHighScore() {
  let highScore = localStorage.getItem('spaceShooterHighScore');
  return highScore ? parseInt(highScore) : 0;
}

function setHighScore(score) {
  localStorage.setItem('spaceShooterHighScore', score.toString());
}

function drawSubmitScoreScreen() {
  // Title
  fill(0, 255, 255);
  textSize(40);
  textAlign(CENTER);
  text("SUBMIT YOUR SCORE", width/2, height/4);
  
  // Score display
  fill(255);
  textSize(30);
  text(`Your Score: ${score}`, width/2, height/3);
  text(`Level Reached: ${level}`, width/2, height/3 + 40);
  
  // Instructions
  fill(255);
  textSize(20);
  text("Enter your email to submit your score", width/2, height/2 - 30);
  
  // Error message if any
  if (errorMessage) {
    fill(255, 0, 0);
    textSize(16);
    text(errorMessage, width/2, height/2 + 90);
  }
}

function drawLeaderboardScreen() {
  // Title
  fill(0, 255, 255);
  textSize(40);
  textAlign(CENTER);
  text("LEADERBOARD", width/2, 80);
  
  // Check if we have leaderboard data
  if (leaderboardData.length === 0) {
    fill(255);
    textSize(20);
    if (!supabaseInstance) {
      text("No scores available yet", width/2, height/2 - 40);
      text("Play the game and submit your score!", width/2, height/2);
    } else {
      text("Loading leaderboard data...", width/2, height/2);
    }
    return;
  }
  
  // Display leaderboard entries
  fill(255);
  textSize(16);
  textAlign(LEFT);
  text("Rank", width/4 - 80, 130);
  text("Player", width/4, 130);
  text("Score", width/2 + 100, 130);
  text("Level", width/2 + 180, 130);
  
  // Draw horizontal line
  stroke(255);
  line(width/4 - 100, 140, width/2 + 220, 140);
  noStroke();
  
  // Display top 10 scores
  for (let i = 0; i < min(10, leaderboardData.length); i++) {
    const entry = leaderboardData[i];
    const y = 170 + i * 30;
    
    // Highlight the player's score if it matches
    if (entry.email === playerEmail) {
      fill(255, 255, 0);
    } else {
      fill(255);
    }
    
    textAlign(LEFT);
    text(`${i + 1}`, width/4 - 80, y);
    
    // Mask email for privacy
    const maskedEmail = maskEmail(entry.email || "unknown@example.com");
    text(maskedEmail, width/4, y);
    
    textAlign(RIGHT);
    text(entry.score, width/2 + 120, y);
    text(entry.level || 1, width/2 + 200, y);
  }
  
  // Show data source
  fill(150);
  textSize(12);
  textAlign(CENTER);
  if (supabaseInstance) {
    text("Online Leaderboard", width/2, height - 50);
  } else {
    text("Local Leaderboard", width/2, height - 50);
  }
}

// Helper function to mask email for privacy
function maskEmail(email) {
  if (!email) return '';
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  
  let name = parts[0];
  const domain = parts[1];
  
  if (name.length <= 2) {
    return name + '@' + domain;
  }
  
  const visibleChars = Math.min(2, name.length);
  const maskedName = name.substring(0, visibleChars) + '*'.repeat(name.length - visibleChars);
  
  return maskedName + '@' + domain;
}

// Function to fetch leaderboard data from Supabase
async function fetchLeaderboard() {
  // Check if Supabase is available
  if (!supabaseInstance) {
    console.warn("Supabase client not initialized, using local storage instead");
    
    // Get scores from local storage as a fallback
    try {
      const storedScores = localStorage.getItem('leaderboardScores');
      if (storedScores) {
        leaderboardData = JSON.parse(storedScores);
      } else {
        leaderboardData = [];
      }
      console.log("Leaderboard data loaded from local storage:", leaderboardData);
    } catch (err) {
      console.error('Failed to load leaderboard from local storage:', err);
      leaderboardData = [];
    }
    return;
  }
  
  // If Supabase is available, fetch from the database
  try {
    const { data, error } = await supabaseInstance
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error fetching leaderboard:', error);
      return;
    }
    
    leaderboardData = data || [];
    console.log("Leaderboard data fetched from Supabase:", leaderboardData);
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err);
    leaderboardData = []; // Set empty data on error
  }
}

// Function to submit score to Supabase
async function submitScore() {
  const email = inputField.value().trim();
  playerEmail = email;
  
  // Basic email validation
  if (!email || !email.includes('@') || !email.includes('.')) {
    errorMessage = 'Please enter a valid email address';
    return;
  }
  
  // Check if Supabase is available
  if (!supabaseInstance) {
    console.warn("Supabase client not initialized, using local storage instead");
    
    // Store in local storage as a fallback
    try {
      // Get existing scores
      let scores = [];
      const storedScores = localStorage.getItem('leaderboardScores');
      if (storedScores) {
        scores = JSON.parse(storedScores);
      }
      
      // Add new score
      scores.push({
        email,
        score,
        level,
        created_at: new Date().toISOString()
      });
      
      // Sort by score (descending)
      scores.sort((a, b) => b.score - a.score);
      
      // Keep only top 10
      scores = scores.slice(0, 10);
      
      // Save back to local storage
      localStorage.setItem('leaderboardScores', JSON.stringify(scores));
      
      // Use these scores for the leaderboard
      leaderboardData = scores;
      
      // Success - show leaderboard
      console.log("Score saved to local storage");
      errorMessage = '';
      gameState = "leaderboard";
    } catch (err) {
      console.error('Failed to save score to local storage:', err);
      errorMessage = 'Failed to save score. Please try again.';
    }
    return;
  }
  
  // If Supabase is available, submit score to the database
  try {
    const { data, error } = await supabaseInstance
      .from('leaderboard')
      .insert([
        { email, score, level, created_at: new Date().toISOString() }
      ]);
    
    if (error) {
      console.error('Error submitting score:', error);
      errorMessage = 'Failed to submit score. Please try again.';
      return;
    }
    
    // Success - show leaderboard
    console.log("Score submitted successfully to Supabase");
    errorMessage = '';
    fetchLeaderboard();
    gameState = "leaderboard";
  } catch (err) {
    console.error('Failed to submit score:', err);
    errorMessage = 'Failed to submit score. Please try again.';
  }
}

// Handle mobile button clicks
function mousePressed() {
  if (isMobile) {
    // Start button
    if (startButton.elt.style.display !== 'none') {
      if (mouseX > startButton.x && mouseX < startButton.x + startButton.width &&
          mouseY > startButton.y && mouseY < startButton.y + startButton.height) {
        if (gameState === "start" || gameState === "gameOver") {
          resetGame();
          gameState = "playing";
          if (soundEnabled) {
            backgroundMusic.amp(0.05 * volumeLevel, 0.5);
          }
        }
      }
    }
    
    // Game controls
    if (gameState === "playing") {
      // Left button
      if (mouseX > leftButton.x && mouseX < leftButton.x + leftButton.width &&
          mouseY > leftButton.y && mouseY < leftButton.y + leftButton.height) {
        player.move("left");
      }
      
      // Right button
      if (mouseX > rightButton.x && mouseX < rightButton.x + rightButton.width &&
          mouseY > rightButton.y && mouseY < rightButton.y + rightButton.height) {
        player.move("right");
      }
      
      // Fire button
      if (mouseX > fireButton.x && mouseX < fireButton.x + fireButton.width &&
          mouseY > fireButton.y && mouseY < fireButton.y + fireButton.height) {
        if (shootCounter >= (player.rapidFireActive ? shootCooldown / 2 : shootCooldown)) {
          let newBullets = player.shoot();
          bullets = bullets.concat(newBullets);
          shootCounter = 0;
          playSound(shootSound, 880, 0.1, 0.1);
        }
      }
    }
  }
}

// Prevent default touch behavior
function touchMoved() {
  return false;
}
