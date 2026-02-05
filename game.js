// DOMINO DE POUCHON POUCHON VILLE - Complete Game Logic
class DominoGame {
    constructor() {
        this.playerName = 'Jouè';
        this.selectedPlayers = 1;
        this.aiDifficulty = 'medium';
        this.gameState = null;
        this.playerHand = [];
        this.selectedDomino = null;
        this.aiPlayers = [];
        this.isGameActive = false;
        
        this.initializeEventListeners();
        this.loadGameData();
        this.setCurrentDate();
    }
    
    initializeEventListeners() {
        // Player count selection
        document.querySelectorAll('.player-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectPlayerCount(e.currentTarget);
            });
        });
        
        // Difficulty selection
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectDifficulty(e.currentTarget);
            });
        });
        
        // Start game button
        document.getElementById('start-game').addEventListener('click', () => {
            this.startGame();
        });
        
        // Game controls
        document.getElementById('draw-btn').addEventListener('click', () => {
            this.drawDomino();
        });
        
        document.getElementById('pass-btn').addEventListener('click', () => {
            this.passTurn();
        });
        
        document.getElementById('hint-btn').addEventListener('click', () => {
            this.showHint();
        });
        
        document.getElementById('menu-btn').addEventListener('click', () => {
            this.returnToMenu();
        });
        
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.playAgain();
        });
        
        document.getElementById('main-menu-btn').addEventListener('click', () => {
            this.returnToMenu();
        });
        
        document.getElementById('clear-log').addEventListener('click', () => {
            this.clearGameLog();
        });
        
        // Player name input
        document.getElementById('player-name').addEventListener('input', (e) => {
            this.playerName = e.target.value.trim() || 'Jouè';
            localStorage.setItem('dominoPlayerName', this.playerName);
        });
        
        // Special code check
        document.getElementById('special-code').addEventListener('change', (e) => {
            const code = e.target.value.toUpperCase();
            if (code === 'DARBOUZE123' || code === 'POUCHON2024') {
                setTimeout(() => {
                    showDiplome();
                    this.showToast("🎉 Ou jwenn kòd espesyal Mr Darbouze a!");
                }, 500);
                e.target.value = '';
            }
        });
        
        // Auto-diplome checkbox
        document.getElementById('auto-diplome').addEventListener('change', (e) => {
            localStorage.setItem('autoDiplome', e.target.checked);
        });
    }
    
    loadGameData() {
        // Load player name
        this.playerName = localStorage.getItem('dominoPlayerName') || 'Jouè';
        document.getElementById('player-name').value = this.playerName;
        
        // Load stats
        const gamesPlayed = parseInt(localStorage.getItem('gamesPlayed')) || 0;
        const winsCount = parseInt(localStorage.getItem('winsCount')) || 0;
        const diplomeCount = parseInt(localStorage.getItem('diplomeCount')) || 0;
        
        document.getElementById('games-played').textContent = gamesPlayed;
        document.getElementById('wins-count').textContent = winsCount;
        document.getElementById('diplome-count').textContent = diplomeCount;
        
        // Load auto-diplome preference
        const autoDiplome = localStorage.getItem('autoDiplome') !== 'false';
        document.getElementById('auto-diplome').checked = autoDiplome;
    }
    
    setCurrentDate() {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('current-date').textContent = 
            now.toLocaleDateString('ht-HT', options);
    }
    
    selectPlayerCount(optionElement) {
        // Update UI
        document.querySelectorAll('.player-option').forEach(opt => {
            opt.classList.remove('active');
        });
        optionElement.classList.add('active');
        
        // Store selection
        this.selectedPlayers = parseInt(optionElement.dataset.players);
        
        // Show/hide AI settings
        const aiSettings = document.getElementById('ai-settings');
        if (this.selectedPlayers < 4) {
            aiSettings.style.display = 'block';
        } else {
            aiSettings.style.display = 'none';
        }
        
        // Update game mode display
        const modeText = this.selectedPlayers === 1 ? 'SOLO' :
                        this.selectedPlayers === 2 ? '2 JOUE' :
                        this.selectedPlayers === 3 ? '3 JOUE' : '4 JOUE';
        document.getElementById('game-mode').textContent = modeText;
    }
    
    selectDifficulty(buttonElement) {
        // Update UI
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        buttonElement.classList.add('active');
        
        // Store selection
        this.aiDifficulty = buttonElement.dataset.difficulty;
    }
    
    startGame() {
        // Get player name
        this.playerName = document.getElementById('player-name').value.trim() || 'Jouè';
        if (!this.playerName) {
            this.showToast("Antre non ou anvan ou kòmanse!");
            return;
        }
        
        // Initialize game
        this.initializeGame();
        
        // Show game screen
        this.showScreen('game-screen');
        
        // Start the game
        this.startTurn();
        
        // Log game start
        this.addGameLog("🎲 Jwèt la kòmanse! Bon chans!", 'system');
        
        // Update games played
        const gamesPlayed = parseInt(document.getElementById('games-played').textContent) + 1;
        document.getElementById('games-played').textContent = gamesPlayed;
        localStorage.setItem('gamesPlayed', gamesPlayed);
    }
    
    initializeGame() {
        // Reset game state
        this.gameState = {
            players: [],
            dominoLine: [],
            remainingDominoes: this.generateDominoSet(),
            currentPlayerIndex: 0,
            scores: [0, 0, 0, 0],
            round: 1,
            gameStarted: true,
            lineEnds: { left: null, right: null }
        };
        
        // Create players
        this.createPlayers();
        
        // Shuffle and deal dominoes
        this.shuffleArray(this.gameState.remainingDominoes);
        this.dealDominoes();
        
        // Find starting player (who has double-six)
        this.findStartingPlayer();
        
        // Update UI
        this.updateGameDisplay();
    }
    
    createPlayers() {
        const playerNames = [
            this.playerName,
            "Bot Jean",
            "Bot Marie", 
            "Bot Pierre"
        ];
        
        // Clear existing players
        this.gameState.players = [];
        this.aiPlayers = [];
        
        // Add human player
        this.gameState.players.push({
            id: 0,
            name: playerNames[0],
            hand: [],
            isAI: false,
            score: 0
        });
        
        // Add AI players based on selected count
        const totalPlayers = 4;
        for (let i = 1; i < totalPlayers; i++) {
            const isAI = i >= this.selectedPlayers; // Players beyond selected count are AI
            this.gameState.players.push({
                id: i,
                name: playerNames[i] + (isAI ? " (AI)" : ""),
                hand: [],
                isAI: isAI,
                difficulty: this.aiDifficulty,
                score: 0
            });
            
            if (isAI) {
                this.aiPlayers.push(i);
            }
        }
    }
    
    generateDominoSet() {
        const dominoes = [];
        for (let i = 0; i <= 6; i++) {
            for (let j = i; j <= 6; j++) {
                dominoes.push([i, j]);
            }
        }
        return dominoes;
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    dealDominoes() {
        // Each player gets 7 dominoes
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 7; j++) {
                if (this.gameState.remainingDominoes.length > 0) {
                    this.gameState.players[i].hand.push(this.gameState.remainingDominoes.pop());
                }
            }
        }
    }
    
    findStartingPlayer() {
        // Find player with double-six
        for (let i = 0; i < 4; i++) {
            if (this.gameState.players[i].hand.some(d => d[0] === 6 && d[1] === 6)) {
                this.gameState.currentPlayerIndex = i;
                return;
            }
        }
        
        // If no one has double-six, player with highest double starts
        let maxDouble = -1;
        let startingPlayer = 0;
        
        for (let i = 0; i < 4; i++) {
            this.gameState.players[i].hand.forEach(domino => {
                if (domino[0] === domino[1] && domino[0] > maxDouble) {
                    maxDouble = domino[0];
                    startingPlayer = i;
                }
            });
        }
        
        this.gameState.currentPlayerIndex = startingPlayer;
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
    
    updateGameDisplay() {
        if (!this.gameState) return;
        
        const currentPlayer = this.gameState.players[this.gameState.currentPlayerIndex];
        const isPlayerTurn = currentPlayer.id === 0;
        
        // Update turn indicator
        const turnIndicator = document.getElementById('turn-indicator');
        if (isPlayerTurn) {
            turnIndicator.innerHTML = '<span class="turn-icon">🎯</span><span class="turn-text">SE TOU PA OU!</span>';
            turnIndicator.style.background = 'var(--accent-gold)';
        } else {
            turnIndicator.innerHTML = `<span class="turn-icon">⏳</span><span class="turn-text">SE TOU PA ${currentPlayer.name}</span>`;
            turnIndicator.style.background = '#ddd';
        }
        
        // Update player score
        document.getElementById('player-score').textContent = this.gameState.scores[0];
        
        // Update boneyard count
        document.getElementById('boneyard-count').textContent = 
            this.gameState.remainingDominoes.length;
        
        // Update player hand count
        document.getElementById('player-hand-count').textContent = 
            this.gameState.players[0].hand.length;
        
        // Update opponent info
        this.updateOpponentInfo();
        
        // Update domino line
        this.updateDominoLine();
        
        // Update player hand
        this.updatePlayerHand();
        
        // Enable/disable controls
        document.getElementById('draw-btn').disabled = !isPlayerTurn;
        document.getElementById('pass-btn').disabled = !isPlayerTurn;
        
        // Update game status
        const gameStatus = document.getElementById('game-status');
        if (isPlayerTurn) {
            gameStatus.textContent = "Chwazi yon domino pou jwe";
        } else {
            gameStatus.textContent = `${currentPlayer.name} ap reflechi...`;
        }
    }
    
    updateOpponentInfo() {
        // Update top player (index 2)
        const topPlayer = this.gameState.players[2];
        const topElement = document.getElementById('top-player');
        topElement.querySelector('.player-name').textContent = topPlayer.name;
        topElement.querySelector('.player-hand-count').textContent = `${topPlayer.hand.length} domino`;
        
        // Update top player hand display
        const topHand = document.getElementById('top-hand');
        topHand.innerHTML = '';
        topPlayer.hand.forEach((domino, index) => {
            const dominoEl = this.createDominoElement(domino, index, false, 'tiny');
            topHand.appendChild(dominoEl);
        });
        
        // Update left player (index 1)
        const leftPlayer = this.gameState.players[1];
        const leftElement = document.getElementById('left-player');
        leftElement.querySelector('.player-name').textContent = leftPlayer.name;
        leftElement.querySelector('.player-hand-count').textContent = `${leftPlayer.hand.length} domino`;
        
        // Update left player hand display
        const leftHand = document.getElementById('left-hand');
        leftHand.innerHTML = '';
        leftPlayer.hand.forEach((domino, index) => {
            const dominoEl = this.createDominoElement(domino, index, false, 'tiny');
            leftHand.appendChild(dominoEl);
        });
        
        // Update right player (index 3)
        const rightPlayer = this.gameState.players[3];
        const rightElement = document.getElementById('right-player');
        rightElement.querySelector('.player-name').textContent = rightPlayer.name;
        rightElement.querySelector('.player-hand-count').textContent = `${rightPlayer.hand.length} domino`;
        
        // Update right player hand display
        const rightHand = document.getElementById('right-hand');
        rightHand.innerHTML = '';
        rightPlayer.hand.forEach((domino, index) => {
            const dominoEl = this.createDominoElement(domino, index, false, 'tiny');
            rightHand.appendChild(dominoEl);
        });
        
        // Highlight active player
        const activeIndex = this.gameState.currentPlayerIndex;
        document.querySelectorAll('.opponent-area').forEach(el => el.classList.remove('active-turn'));
        
        if (activeIndex === 2) topElement.classList.add('active-turn');
        if (activeIndex === 1) leftElement.classList.add('active-turn');
        if (activeIndex === 3) rightElement.classList.add('active-turn');
    }
    
    updateDominoLine() {
        const lineContainer = document.getElementById('domino-line');
        lineContainer.innerHTML = '';
        
        // Update line ends
        if (this.gameState.dominoLine.length > 0) {
            const first = this.gameState.dominoLine[0];
            const last = this.gameState.dominoLine[this.gameState.dominoLine.length - 1];
            
            document.getElementById('left-end').textContent = first[0];
            document.getElementById('right-end').textContent = last[1];
            
            this.gameState.lineEnds = { left: first[0], right: last[1] };
        } else {
            document.getElementById('left-end').textContent = '0';
            document.getElementById('right-end').textContent = '0';
            this.gameState.lineEnds = { left: null, right: null };
        }
        
        // Create domino elements for the line
        this.gameState.dominoLine.forEach((domino, index) => {
            const dominoEl = this.createDominoElement(domino, index, false, 'normal');
            dominoEl.classList.add('played');
            lineContainer.appendChild(dominoEl);
        });
    }
    
    updatePlayerHand() {
        const player = this.gameState.players[0];
        const handContainer = document.getElementById('player-hand');
        handContainer.innerHTML = '';
        
        player.hand.forEach((domino, index) => {
            const dominoEl = this.createDominoElement(domino, index, true, 'normal');
            handContainer.appendChild(dominoEl);
        });
    }
    
    createDominoElement(domino, index, isSelectable = false, size = 'normal') {
        const div = document.createElement('div');
        div.className = 'domino-piece';
        if (domino[0] === domino[1]) {
            div.classList.add('double');
        }
        
        if (size === 'small') {
            div.classList.add('small');
        } else if (size === 'tiny') {
            div.classList.add('tiny');
        }
        
        div.dataset.index = index;
        div.dataset.value = `${domino[0]}-${domino[1]}`;
        
        // Create the two halves
        const half1 = document.createElement('div');
        half1.className = `domino-half dots-${domino[0]}`;
        
        const half2 = document.createElement('div');
        half2.className = `domino-half dots-${domino[1]}`;
        
        // Create divider
        const divider = document.createElement('div');
        divider.className = 'domino-divider';
        
        // Create dots containers
        const dots1 = document.createElement('div');
        dots1.className = 'dots-container';
        
        const dots2 = document.createElement('div');
        dots2.className = 'dots-container';
        
        // Add 9 dots to each container
        for (let i = 0; i < 9; i++) {
            const dot1 = document.createElement('div');
            dot1.className = 'dot';
            dots1.appendChild(dot1);
            
            const dot2 = document.createElement('div');
            dot2.className = 'dot';
            dots2.appendChild(dot2);
        }
        
        // Assemble the domino
        half1.appendChild(dots1);
        half2.appendChild(dots2);
        
        if (domino[0] === domino[1]) {
            // Double: stack vertically
            div.appendChild(half1);
            div.appendChild(divider);
            div.appendChild(half2);
        } else {
            // Regular: side by side
            div.appendChild(half1);
            div.appendChild(divider);
            div.appendChild(half2);
        }
        
        // Add selection behavior
        if (isSelectable) {
            div.addEventListener('click', () => this.selectDomino(index));
        }
        
        return div;
    }
    
    selectDomino(index) {
        const player = this.gameState.players[0];
        if (this.gameState.currentPlayerIndex !== 0) {
            this.showToast("Se pa tou pa ou!");
            return;
        }
        
        const domino = player.hand[index];
        
        // Check if domino can be played
        if (this.canPlayDomino(domino)) {
            // Highlight selection
            document.querySelectorAll('.domino-piece').forEach(el => {
                el.classList.remove('selected');
            });
            event.currentTarget.classList.add('selected');
            
            // Play the domino
            this.playDomino(index, domino);
        } else {
            this.showToast("Domino sa a pa kapab jwe kounye a!");
        }
    }
    
    canPlayDomino(domino) {
        // If line is empty, only double-six can start
        if (this.gameState.dominoLine.length === 0) {
            return domino[0] === 6 && domino[1] === 6;
        }
        
        // Check if domino matches either end
        const ends = this.gameState.lineEnds;
        return domino[0] === ends.left || domino[1] === ends.left ||
               domino[0] === ends.right || domino[1] === ends.right;
    }
    
    playDomino(index, domino) {
        const player = this.gameState.players[0];
        
        // Remove from hand
        player.hand.splice(index, 1);
        
        // Add to domino line with correct orientation
        const ends = this.gameState.lineEnds;
        let orientedDomino = domino;
        
        if (this.gameState.dominoLine.length === 0) {
            // First domino
            this.gameState.dominoLine.push(domino);
        } else if (domino[0] === ends.left || domino[1] === ends.left) {
            // Play on left end
            if (domino[1] === ends.left) {
                orientedDomino = [domino[1], domino[0]]; // Flip if needed
            }
            this.gameState.dominoLine.unshift(orientedDomino);
        } else {
            // Play on right end
            if (domino[0] === ends.right) {
                orientedDomino = [domino[1], domino[0]]; // Flip if needed
            }
            this.gameState.dominoLine.push(orientedDomino);
        }
        
        // Update scores
        player.score += domino[0] + domino[1];
        
        // Move to next player
        this.gameState.currentPlayerIndex = (this.gameState.currentPlayerIndex + 1) % 4;
        
        // Update display
        this.updateGameDisplay();
        
        // Add to game log
        this.addGameLog(`${player.name} te jwe [${domino[0]}|${domino[1]}]`, 'player');
        
        // Check for game end
        if (this.checkGameEnd()) {
            setTimeout(() => this.endGame(), 1000);
        } else {
            // Start next turn
            setTimeout(() => this.startTurn(), 500);
        }
    }
    
    drawDomino() {
        const player = this.gameState.players[0];
        
        if (this.gameState.currentPlayerIndex !== 0) {
            this.showToast("Se pa tou pa ou!");
            return;
        }
        
        if (this.gameState.remainingDominoes.length === 0) {
            this.showToast("Pa gen domino ki rete nan pil la!");
            this.passTurn();
            return;
        }
        
        // Draw domino
        const drawnDomino = this.gameState.remainingDominoes.pop();
        player.hand.push(drawnDomino);
        
        // Move to next player
        this.gameState.currentPlayerIndex = (this.gameState.currentPlayerIndex + 1) % 4;
        
        // Update display
        this.updateGameDisplay();
        
        // Add to game log
        this.addGameLog(`${player.name} te pran yon domino nan pil la`, 'player');
        
        // Start next turn
        setTimeout(() => this.startTurn(), 500);
    }
    
    passTurn() {
        const player = this.gameState.players[0];
        
        if (this.gameState.currentPlayerIndex !== 0) {
            this.showToast("Se pa tou pa ou!");
            return;
        }
        
        // Move to next player
        this.gameState.currentPlayerIndex = (this.gameState.currentPlayerIndex + 1) % 4;
        
        // Update display
        this.updateGameDisplay();
        
        // Add to game log
        this.addGameLog(`${player.name} pa t kapab jwe`, 'player');
        
        // Start next turn
        setTimeout(() => this.startTurn(), 500);
    }
    
    startTurn() {
        if (!this.gameState || !this.gameState.gameStarted) return;
        
        const currentPlayer = this.gameState.players[this.gameState.currentPlayerIndex];
        
        // Update UI
        this.updateGameDisplay();
        
        // If it's AI's turn
        if (currentPlayer.isAI) {
            this.playAITurn(currentPlayer);
        }
    }
    
    playAITurn(aiPlayer) {
        // AI thinking delay
        const delays = { easy: 2000, medium: 1500, hard: 1000 };
        const delay = delays[this.aiDifficulty] || 1500;
        
        this.addGameLog(`${aiPlayer.name} ap reflechi...`, 'ai');
        
        setTimeout(() => {
            this.executeAITurn(aiPlayer);
        }, delay);
    }
    
    executeAITurn(aiPlayer) {
        const aiIndex = this.gameState.players.findIndex(p => p.id === aiPlayer.id);
        const validMoves = this.getValidMovesForPlayer(aiIndex);
        
        if (validMoves.length > 0) {
            // AI plays a domino
            const selectedMove = this.selectAIMove(validMoves, aiPlayer);
            this.playDominoForAI(aiIndex, selectedMove.domino, selectedMove.position);
        } else if (this.gameState.remainingDominoes.length > 0) {
            // AI draws from boneyard
            this.drawDominoForAI(aiIndex);
        } else {
            // AI passes
            this.passTurnForAI(aiIndex);
        }
    }
    
    getValidMovesForPlayer(playerIndex) {
        const player = this.gameState.players[playerIndex];
        const validMoves = [];
        
        if (this.gameState.dominoLine.length === 0) {
            // First move must be double-six
            const doubleSix = player.hand.find(d => d[0] === 6 && d[1] === 6);
            if (doubleSix) {
                validMoves.push({ domino: doubleSix, position: 'center' });
            }
        } else {
            const ends = this.gameState.lineEnds;
            
            player.hand.forEach(domino => {
                // Check left side
                if (domino[0] === ends.left || domino[1] === ends.left) {
                    validMoves.push({
                        domino: domino,
                        position: domino[0] === ends.left ? 'left' : 'left-flipped'
                    });
                }
                
                // Check right side
                if (domino[0] === ends.right || domino[1] === ends.right) {
                    validMoves.push({
                        domino: domino,
                        position: domino[1] === ends.right ? 'right' : 'right-flipped'
                    });
                }
            });
        }
        
        return validMoves;
    }
    
    selectAIMove(validMoves, aiPlayer) {
        // Simple AI strategy based on difficulty
        if (this.aiDifficulty === 'easy') {
            // Easy: random move
            return validMoves[Math.floor(Math.random() * validMoves.length)];
        } else if (this.aiDifficulty === 'medium') {
            // Medium: prefer doubles and higher points
            validMoves.sort((a, b) => {
                const aScore = (a.domino[0] === a.domino[1] ? 10 : 0) + a.domino[0] + a.domino[1];
                const bScore = (b.domino[0] === b.domino[1] ? 10 : 0) + b.domino[0] + b.domino[1];
                return bScore - aScore;
            });
            return validMoves[0];
        } else {
            // Hard: strategic play
            validMoves.sort((a, b) => {
                const aIsDouble = a.domino[0] === a.domino[1] ? 1 : 0;
                const bIsDouble = b.domino[0] === b.domino[1] ? 1 : 0;
                
                // Prefer doubles
                if (aIsDouble !== bIsDouble) return bIsDouble - aIsDouble;
                
                // Prefer lower points to save high ones
                const aPoints = a.domino[0] + a.domino[1];
                const bPoints = b.domino[0] + b.domino[1];
                return aPoints - bPoints;
            });
            return validMoves[0];
        }
    }
    
    playDominoForAI(playerIndex, domino, position) {
        const player = this.gameState.players[playerIndex];
        
        // Find domino in hand
        const handIndex = player.hand.findIndex(d => 
            d[0] === domino[0] && d[1] === domino[1]
        );
        
        if (handIndex === -1) return;
        
        // Remove from hand
        player.hand.splice(handIndex, 1);
        
        // Add to domino line with correct orientation
        let orientedDomino = domino;
        if (position.includes('flipped')) {
            orientedDomino = [domino[1], domino[0]];
        }
        
        if (position.includes('left')) {
            this.gameState.dominoLine.unshift(orientedDomino);
        } else if (position.includes('right')) {
            this.gameState.dominoLine.push(orientedDomino);
        } else {
            this.gameState.dominoLine.push(orientedDomino);
        }
        
        // Update scores
        player.score += domino[0] + domino[1];
        
        // Move to next player
        this.gameState.currentPlayerIndex = (this.gameState.currentPlayerIndex + 1) % 4;
        
        // Update display
        this.updateGameDisplay();
        
        // Add to game log
        this.addGameLog(`${player.name} te jwe [${domino[0]}|${domino[1]}]`, 'ai');
        
        // Check for game end
        if (this.checkGameEnd()) {
            setTimeout(() => this.endGame(), 1000);
        } else {
            // Start next turn
            setTimeout(() => this.startTurn(), 500);
        }
    }
    
    drawDominoForAI(playerIndex) {
        if (this.gameState.remainingDominoes.length === 0) return;
        
        const player = this.gameState.players[playerIndex];
        const drawnDomino = this.gameState.remainingDominoes.pop();
        
        player.hand.push(drawnDomino);
        this.gameState.currentPlayerIndex = (this.gameState.currentPlayerIndex + 1) % 4;
        
        this.updateGameDisplay();
        this.addGameLog(`${player.name} te pran yon domino`, 'ai');
        
        setTimeout(() => this.startTurn(), 500);
    }
    
    passTurnForAI(playerIndex) {
        const player = this.gameState.players[playerIndex];
        this.gameState.currentPlayerIndex = (this.gameState.currentPlayerIndex + 1) % 4;
        
        this.updateGameDisplay();
        this.addGameLog(`${player.name} pa t kapab jwe`, 'ai');
        
        setTimeout(() => this.startTurn(), 500);
    }
    
    checkGameEnd() {
        // Game ends when a player has no dominoes
        return this.gameState.players.some(p => p.hand.length === 0) ||
               (this.gameState.remainingDominoes.length === 0 && 
                this.gameState.players.every(p => !this.hasValidMove(p)));
    }
    
    hasValidMove(player) {
        if (this.gameState.dominoLine.length === 0) {
            return player.hand.some(d => d[0] === 6 && d[1] === 6);
        }
        
        const ends = this.gameState.lineEnds;
        return player.hand.some(d => 
            d[0] === ends.left || d[1] === ends.left ||
            d[0] === ends.right || d[1] === ends.right
        );
    }
    
    endGame() {
        // Calculate final scores
        this.calculateFinalScores();
        
        // Determine winner
        let winnerIndex = 0;
        let highestScore = -1;
        
        this.gameState.players.forEach((player, index) => {
            if (player.score > highestScore) {
                highestScore = player.score;
                winnerIndex = index;
            }
        });
        
        const winner = this.gameState.players[winnerIndex];
        
        // Update winner announcement
        const announcement = document.getElementById('winner-announcement');
        if (winnerIndex === 0) {
            announcement.textContent = `🏆 OU GENYEN! 🏆`;
            announcement.style.color = 'var(--success)';
            
            // Update wins count
            const winsCount = parseInt(document.getElementById('wins-count').textContent) + 1;
            document.getElementById('wins-count').textContent = winsCount;
            localStorage.setItem('winsCount', winsCount);
            
            // Show diplome if enabled
            const autoDiplome = document.getElementById('auto-diplome').checked;
            if (autoDiplome) {
                setTimeout(() => showDiplome(), 1000);
                
                // Update diplome count
                const diplomeCount = parseInt(document.getElementById('diplome-count').textContent) + 1;
                document.getElementById('diplome-count').textContent = diplomeCount;
                localStorage.setItem('diplomeCount', diplomeCount);
            }
        } else {
            announcement.textContent = `🏆 ${winner.name} GENYEN! 🏆`;
            announcement.style.color = 'var(--danger)';
        }
        
        // Update scores table
        const scoresTable = document.getElementById('final-scores');
        scoresTable.innerHTML = '';
        
        this.gameState.players.forEach((player, index) => {
            const row = document.createElement('tr');
            if (index === winnerIndex) {
                row.className = 'winner-row';
            }
            
            const handPoints = player.hand.reduce((sum, domino) => sum + domino[0] + domino[1], 0);
            const totalScore = player.score - handPoints;
            
            row.innerHTML = `
                <td>${player.name} ${index === 0 ? '(Ou)' : ''}</td>
                <td>${player.score}</td>
                <td>${handPoints}</td>
                <td><strong>${totalScore}</strong></td>
            `;
            scoresTable.appendChild(row);
        });
        
        // Show game over screen
        this.showScreen('game-over-screen');
        
        // Play win sound
        this.playSound('win');
    }
    
    calculateFinalScores() {
        // For each player, subtract points in hand from score
        this.gameState.players.forEach((player, index) => {
            const handPoints = player.hand.reduce((sum, domino) => sum + domino[0] + domino[1], 0);
            this.gameState.scores[index] = player.score - handPoints;
        });
    }
    
    showHint() {
        const player = this.gameState.players[0];
        const validMoves = this.getValidMovesForPlayer(0);
        
        if (validMoves.length > 0) {
            this.showToast(`💡 Ou gen ${validMoves.length} domino kapab jwe`);
        } else {
            this.showToast("💡 Ou dwe pran domino nan pil la");
        }
    }
    
    addGameLog(message, type = 'system') {
        const logContainer = document.getElementById('game-log');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}-turn`;
        
        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        entry.textContent = `[${time}] ${message}`;
        
        logContainer.appendChild(entry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }
    
    clearGameLog() {
        document.getElementById('game-log').innerHTML = '';
    }
    
    playAgain() {
        // Reset and start new game
        this.initializeGame();
        this.showScreen('game-screen');
        this.startTurn();
        this.addGameLog("🎲 Nouvo jwèt kòmanse!", 'system');
    }
    
    returnToMenu() {
        if (this.isGameActive) {
            if (confirm("Èske ou vle soti nan jwèt la? Pwen ou pèdi.")) {
                this.showScreen('main-menu');
                this.isGameActive = false;
            }
        } else {
            this.showScreen('main-menu');
        }
    }
    
    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    playSound(type) {
        try {
            const audio = document.getElementById(`sound-${type}`);
            if (audio) {
                audio.currentTime = 0;
                audio.play().catch(e => console.log("Sound error:", e));
            }
        } catch (e) {
            console.log("Audio error:", e);
        }
    }
}

// Global functions
function showDiplome() {
    const overlay = document.getElementById('diplome-overlay');
    overlay.style.display = 'flex';
    
    // Play sound if available
    try {
        const audio = document.getElementById('sound-win');
        if (audio) audio.play();
    } catch (e) {}
}

function closeDiplome() {
    document.getElementById('diplome-overlay').style.display = 'none';
}

// Initialize game
let game;

window.addEventListener('DOMContentLoaded', () => {
    game = new DominoGame();
    
    // Set default selections
    document.querySelector('.player-option[data-players="1"]').click();
    document.querySelector('.difficulty-btn[data-difficulty="medium"]').click();
    
    // Check URL for special code
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && (code.toUpperCase() === 'DARBOUZE123' || code.toUpperCase() === 'POUCHON2024')) {
        setTimeout(() => {
            showDiplome();
            game.showToast("🎉 Ou jwenn kòd espesyal Mr Darbouze a!");
        }, 1000);
    }
});
