// ====== Casino Platform Core Engine ======

// -- Audio Context (Web Audio API for beeps instead of external files to ensure it works standalone) --
let audioCtx;
function playSound(type) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'deal') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'chips') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
        osc.frequency.setValueAtTime(1400, audioCtx.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'win') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.setValueAtTime(600, audioCtx.currentTime + 0.1);
        osc.frequency.setValueAtTime(800, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
    } else if (type === 'lose') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.4);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
    }
}

// -- State Management & Models --
let userProfile = {
    username: '',
    money: 1000.00,
    chips: 0,
    history: []
};

let currentChipSelection = 10;
let bets = {
    player: 0,
    banker: 0,
    tie: 0,
    pokdeng: 0,
    poker: 0,
    blackjack: 0
};

let gameState = 'IDLE'; // IDLE, DEALING, RESULT

// -- UI Elements --
const screens = {
    login: document.getElementById('login-screen'),
    main: document.getElementById('main-screen')
};

const ui = {
    usernameInput: document.getElementById('username-input'),
    loginBtn: document.getElementById('login-btn'),
    displayUsername: document.getElementById('display-username'),
    displayMoney: document.getElementById('display-money'),
    displayChips: document.getElementById('display-chips'),
    bankModal: document.getElementById('bank-modal'),
    addMoneyBtn: document.getElementById('add-money-btn'),
    manageChipsBtn: document.getElementById('manage-chips-btn'),
    closeBankBtn: document.getElementById('close-bank-btn'),
    buyChipsInput: document.getElementById('buy-chips-input'),
    buyChipsBtn: document.getElementById('buy-chips-btn'),
    sellChipsInput: document.getElementById('sell-chips-input'),
    sellChipsBtn: document.getElementById('sell-chips-btn'),
    betZones: document.querySelectorAll('.bet-zone'),
    // Baccarat
    baccaratBetInput: document.getElementById('baccarat-bet-input'),
    clearBetsBtn: document.getElementById('clear-bets-btn'),
    dealBtn: document.getElementById('deal-btn'),
    playerScore: document.getElementById('player-score'),
    bankerScore: document.getElementById('banker-score'),
    playerCards: document.getElementById('player-cards'),
    bankerCards: document.getElementById('banker-cards'),
    gameMessage: document.getElementById('game-message'),
    // Pok Deng
    pokdengBetInput: document.getElementById('pokdeng-bet-input'),
    pokdengClearBtn: document.getElementById('pokdeng-clear-btn'),
    pokdengDealBtn: document.getElementById('pokdeng-deal-btn'),
    pokdengHitBtn: document.getElementById('pokdeng-hit-btn'),
    pokdengStandBtn: document.getElementById('pokdeng-stand-btn'),
    pokdengPlayerScore: document.getElementById('pokdeng-player-score'),
    pokdengDealerScore: document.getElementById('pokdeng-dealer-score'),
    pokdengPlayerCards: document.getElementById('pokdeng-player-cards'),
    pokdengDealerCards: document.getElementById('pokdeng-dealer-cards'),
    pokdengMessage: document.getElementById('pokdeng-message'),
    pokdengStartControls: document.getElementById('pokdeng-start-controls'),
    pokdengIngameControls: document.getElementById('pokdeng-ingame-controls'),
    // Poker
    pokerBetInput: document.getElementById('poker-bet-input'),
    pokerClearBtn: document.getElementById('poker-clear-btn'),
    pokerDealBtn: document.getElementById('poker-deal-btn'),
    pokerFoldBtn: document.getElementById('poker-fold-btn'),
    pokerCallBtn: document.getElementById('poker-call-btn'),
    pokerRaiseBtn: document.getElementById('poker-raise-btn'),
    pokerAiAction: document.getElementById('poker-ai-action'),
    pokerPlayerEval: document.getElementById('poker-player-eval'),
    pokerAiCards: document.getElementById('poker-ai-cards'),
    pokerPlayerCards: document.getElementById('poker-player-cards'),
    pokerCommunityCards: document.getElementById('poker-community-cards'),
    pokerPot: document.getElementById('poker-pot'),
    pokerMessage: document.getElementById('poker-message'),
    pokerPregameControls: document.getElementById('poker-pregame-controls'),
    pokerIngameControls: document.getElementById('poker-ingame-controls'),
    pokerStartControls: document.getElementById('poker-start-controls'),
    pokerRaiseAmt: document.getElementById('poker-raise-amt'),
    // Blackjack
    blackjackBetInput: document.getElementById('blackjack-bet-input'),
    blackjackClearBtn: document.getElementById('blackjack-clear-btn'),
    blackjackDealBtn: document.getElementById('blackjack-deal-btn'),
    blackjackHitBtn: document.getElementById('blackjack-hit-btn'),
    blackjackStandBtn: document.getElementById('blackjack-stand-btn'),
    blackjackDoubleBtn: document.getElementById('blackjack-double-btn'),
    blackjackPlayerScore: document.getElementById('blackjack-player-score'),
    blackjackDealerScore: document.getElementById('blackjack-dealer-score'),
    blackjackPlayerCards: document.getElementById('blackjack-player-cards'),
    blackjackDealerCards: document.getElementById('blackjack-dealer-cards'),
    blackjackMessage: document.getElementById('blackjack-message'),
    blackjackIngameControls: document.getElementById('blackjack-ingame-controls'),
    blackjackStartControls: document.getElementById('blackjack-start-controls'),
    historyList: document.getElementById('history-list'),
    navBtns: document.querySelectorAll('.nav-btn'),
    gameBoards: document.querySelectorAll('.game-board'),
    // Carrot Mine
    carrotBtn: document.getElementById('carrot-btn'),
    carrotMinedTotal: document.getElementById('carrot-mined-total')
};

// -- Carrot Mining --
let baseMinedSession = 0;
let lastClickTime = 0;

ui.carrotBtn.addEventListener('click', (e) => {
    const now = Date.now();
    if (now - lastClickTime < 50) return; // Basic rate limit (prevent auto clickers)
    lastClickTime = now;

    playSound('chips');

    // Add 1 dollar
    userProfile.money += 1;
    baseMinedSession += 1;
    ui.carrotMinedTotal.textContent = `$${baseMinedSession}`;
    saveProfile();

    // Spawn floating text
    const rect = ui.carrotBtn.getBoundingClientRect();
    const floating = document.createElement('div');
    floating.className = 'floating-money';
    floating.textContent = '+$1';
    
    // Add random offset
    const offsetX = (Math.random() - 0.5) * 100;
    const offsetY = (Math.random() - 0.5) * 50;
    
    floating.style.left = `${e.clientX + offsetX}px`;
    floating.style.top = `${e.clientY + offsetY}px`;
    
    document.body.appendChild(floating);
    
    ui.carrotBtn.style.transform = 'scale(0.8)';
    setTimeout(() => {
        ui.carrotBtn.style.transform = 'scale(1)';
    }, 100);

    setTimeout(() => {
        floating.remove();
    }, 1000);
});

// Navigation
ui.navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        ui.navBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const gameId = e.currentTarget.dataset.game;
        
        ui.gameBoards.forEach(board => {
            board.classList.remove('active');
            if(board.id === `${gameId}-board`) board.classList.add('active');
        });
    });
});

// -- Initialization & Auth --
function init() {
    const saved = localStorage.getItem('casinoProfile');
    if (saved) {
        userProfile = JSON.parse(saved);
        if(userProfile.username) {
            showMainScreen();
        }
    }
}

function saveProfile() {
    localStorage.setItem('casinoProfile', JSON.stringify(userProfile));
    updateTopBar();
}

function showMainScreen() {
    screens.login.classList.remove('active');
    screens.main.classList.add('active');
    updateTopBar();
    updateHistoryUI();
}

ui.loginBtn.addEventListener('click', () => {
    const name = ui.usernameInput.value.trim();
    if (name) {
        userProfile.username = name;
        if(userProfile.money === undefined) userProfile.money = 1000.00;
        if(userProfile.chips === undefined) userProfile.chips = 0;
        saveProfile();
        showMainScreen();
        
        // initialize audio on user gesture
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
    }
});

function updateTopBar() {
    ui.displayUsername.textContent = userProfile.username;
    ui.displayMoney.textContent = `$${userProfile.money.toFixed(2)}`;
    ui.displayChips.textContent = userProfile.chips;
}

// -- Bank / Conversion System --
function toggleBank() {
    ui.bankModal.classList.toggle('hidden');
}

ui.addMoneyBtn.addEventListener('click', toggleBank);
ui.manageChipsBtn.addEventListener('click', toggleBank);
ui.closeBankBtn.addEventListener('click', toggleBank);

ui.buyChipsBtn.addEventListener('click', () => {
    const cost = parseFloat(ui.buyChipsInput.value);
    if (!isNaN(cost) && cost > 0 && userProfile.money >= cost) {
        playSound('chips');
        userProfile.money -= cost;
        userProfile.chips += cost * 10;
        ui.buyChipsInput.value = '';
        saveProfile();
    } else {
        alert("Invalid amount or insufficient funds.");
    }
});

ui.sellChipsBtn.addEventListener('click', () => {
    const chipsToSell = parseInt(ui.sellChipsInput.value);
    if (!isNaN(chipsToSell) && chipsToSell > 0 && chipsToSell % 10 === 0 && userProfile.chips >= chipsToSell) {
        playSound('chips');
        userProfile.chips -= chipsToSell;
        userProfile.money += chipsToSell / 10;
        ui.sellChipsInput.value = '';
        saveProfile();
    } else {
        alert("Invalid amount or insufficient chips (must be multiple of 10).");
    }
});

// -- Betting System --

ui.betZones.forEach(zone => {
    zone.addEventListener('click', (e) => {
        if (gameState !== 'IDLE') return;
        const type = e.currentTarget.dataset.betType;
        let amount = 0;
        
        // Determine which input field to read from based on game mode
        if (type === 'player' || type === 'banker' || type === 'tie') {
            amount = parseInt(ui.baccaratBetInput.value);
            if(isNaN(amount) || amount <= 0) {
                alert("Please enter a valid bet amount for Baccarat.");
                return;
            }
        } else if (type === 'pokdeng') {
            amount = parseInt(ui.pokdengBetInput.value);
            if(isNaN(amount) || amount <= 0) {
                alert("Please enter a valid bet amount for Pok Deng.");
                return;
            }
        } else if (type === 'poker') {
            amount = parseInt(ui.pokerBetInput.value);
            if(isNaN(amount) || amount <= 0) {
                alert("Please enter a valid ante amount for Poker.");
                return;
            }
        } else if (type === 'blackjack') {
            amount = parseInt(ui.blackjackBetInput.value);
             if(isNaN(amount) || amount <= 0) {
                alert("Please enter a valid bet amount for Blackjack.");
                return;
            }
        }

        if (userProfile.chips >= amount) {
            playSound('chips');
            userProfile.chips -= amount;
            bets[type] += amount;
            updateBetsUI();
            saveProfile();
        } else {
            alert("Not enough chips! Please buy more.");
        }
    });
});

function updateBetsUI() {
    let totalBet = 0;
    Object.keys(bets).forEach(key => {
        const betEl = document.getElementById(`bet-amt-${key}`);
        if (bets[key] > 0) {
            betEl.textContent = bets[key];
        } else {
            betEl.textContent = '';
        }
        totalBet += bets[key];
    });
    ui.dealBtn.disabled = (bets.player + bets.banker + bets.tie) === 0;
    ui.pokdengDealBtn.disabled = bets.pokdeng === 0;
    ui.pokerDealBtn.disabled = bets.poker === 0;
    ui.blackjackDealBtn.disabled = bets.blackjack === 0;
}

ui.clearBetsBtn.addEventListener('click', () => { clearBets(['player', 'banker', 'tie']); });
ui.pokdengClearBtn.addEventListener('click', () => { clearBets(['pokdeng']); });
ui.pokerClearBtn.addEventListener('click', () => { clearBets(['poker']); });
ui.blackjackClearBtn.addEventListener('click', () => { clearBets(['blackjack']); });

function clearBets(types) {
    if (gameState !== 'IDLE') return;
    let totalRefund = 0;
    types.forEach(t => { totalRefund += bets[t]; bets[t] = 0; });
    if (totalRefund > 0) {
        playSound('chips');
        userProfile.chips += totalRefund;
        updateBetsUI();
        saveProfile();
    }
}

// -- Card Classes --
const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

class Deck {
    constructor() {
        this.cards = [];
        for (let s of SUITS) {
            for (let v of VALUES) {
                this.cards.push({ suit: s, value: v });
            }
        }
        // Shuffle (Fisher-Yates)
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    draw() {
        return this.cards.pop();
    }
}

function createCardHTML(card) {
    const isRed = card.suit === '♥' || card.suit === '♦';
    const colorClass = isRed ? 'red' : 'black';
    return `
        <div class="playing-card ${colorClass}">
            <div class="card-top">${card.value}</div>
            <div class="card-suit">${card.suit}</div>
            <div class="card-bottom">${card.value}</div>
        </div>
    `;
}

// Baccarat Value Calculation
function getBaccaratValue(cardValue) {
    if (['10', 'J', 'Q', 'K'].includes(cardValue)) return 0;
    if (cardValue === 'A') return 1;
    return parseInt(cardValue);
}
function calculateHandValue(cards) {
    let sum = cards.reduce((acc, card) => acc + getBaccaratValue(card.value), 0);
    return sum % 10;
}

// -- Game Engine (Baccarat) --
ui.dealBtn.addEventListener('click', startBaccaratRound);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function startBaccaratRound() {
    gameState = 'DEALING';
    ui.dealBtn.disabled = true;
    ui.clearBetsBtn.disabled = true;
    ui.gameMessage.classList.add('hidden');
    
    // Clear board
    ui.playerCards.innerHTML = '';
    ui.bankerCards.innerHTML = '';
    ui.playerScore.textContent = '0';
    ui.bankerScore.textContent = '0';

    const deck = new Deck();
    let playerHand = [];
    let bankerHand = [];

    // Initial Deal (Alternating)
    for (let i = 0; i < 2; i++) {
        await sleep(400); // Animation delay
        let pCard = deck.draw();
        playerHand.push(pCard);
        ui.playerCards.insertAdjacentHTML('beforeend', createCardHTML(pCard));
        playSound('deal');
        ui.playerScore.textContent = calculateHandValue(playerHand);

        await sleep(400);
        let bCard = deck.draw();
        bankerHand.push(bCard);
        ui.bankerCards.insertAdjacentHTML('beforeend', createCardHTML(bCard));
        playSound('deal');
        ui.bankerScore.textContent = calculateHandValue(bankerHand);
    }

    let pValue = calculateHandValue(playerHand);
    let bValue = calculateHandValue(bankerHand);

    // Natural Check
    let nat = (pValue >= 8 || bValue >= 8);
    let playerDrewThirdCard = false;
    let playerThirdCardValue = -1;

    if (!nat) {
        // Player Third Card Rule
        if (pValue <= 5) {
            await sleep(800);
            let pCard = deck.draw();
            playerHand.push(pCard);
            ui.playerCards.insertAdjacentHTML('beforeend', createCardHTML(pCard));
            playSound('deal');
            pValue = calculateHandValue(playerHand);
            ui.playerScore.textContent = pValue;
            playerDrewThirdCard = true;
            playerThirdCardValue = getBaccaratValue(pCard.value);
        }

        // Banker Third Card Rule
        let bankerDraws = false;
        if (!playerDrewThirdCard) {
            if (bValue <= 5) bankerDraws = true;
        } else {
            // Complex banker rules
            if (bValue <= 2) bankerDraws = true;
            else if (bValue === 3 && playerThirdCardValue !== 8) bankerDraws = true;
            else if (bValue === 4 && playerThirdCardValue >= 2 && playerThirdCardValue <= 7) bankerDraws = true;
            else if (bValue === 5 && playerThirdCardValue >= 4 && playerThirdCardValue <= 7) bankerDraws = true;
            else if (bValue === 6 && (playerThirdCardValue === 6 || playerThirdCardValue === 7)) bankerDraws = true;
        }

        if (bankerDraws) {
            await sleep(800);
            let bCard = deck.draw();
            bankerHand.push(bCard);
            ui.bankerCards.insertAdjacentHTML('beforeend', createCardHTML(bCard));
            playSound('deal');
            bValue = calculateHandValue(bankerHand);
            ui.bankerScore.textContent = bValue;
        }
    }

    await sleep(600);
    evaluateWinner(pValue, bValue);
}

function evaluateWinner(pValue, bValue) {
    gameState = 'RESULT';
    let resultOutcome = '';
    
    if (pValue > bValue) resultOutcome = 'player';
    else if (bValue > pValue) resultOutcome = 'banker';
    else resultOutcome = 'tie';

    // Payout Logic
    let winAmount = 0;
    
    if (resultOutcome === 'player') {
        ui.gameMessage.textContent = 'PLAYER WINS';
        ui.gameMessage.style.borderColor = 'var(--neon-blue)';
        ui.gameMessage.style.textShadow = '0 0 10px var(--neon-blue)';
        if (bets.player > 0) winAmount += bets.player * 2; // 1:1
    } else if (resultOutcome === 'banker') {
        ui.gameMessage.textContent = 'BANKER WINS';
        ui.gameMessage.style.borderColor = 'var(--neon-red)';
        ui.gameMessage.style.textShadow = '0 0 10px var(--neon-red)';
        if (bets.banker > 0) winAmount += Math.floor(bets.banker * 1.95); // 0.95:1 commission
    } else if (resultOutcome === 'tie') {
        ui.gameMessage.textContent = 'TIE';
        ui.gameMessage.style.borderColor = 'var(--neon-green)';
        ui.gameMessage.style.textShadow = '0 0 10px var(--neon-green)';
        if (bets.tie > 0) winAmount += (bets.tie * 8) + bets.tie; // 8:1
        
        // Return player/banker bets on tie
        if (bets.player > 0) winAmount += bets.player;
        if (bets.banker > 0) winAmount += bets.banker;
    }

    if (winAmount > 0) {
        playSound('win');
    } else if (winAmount === 0 && (bets.player > 0 || bets.banker > 0 || bets.tie > 0)) {
        playSound('lose');
    } else if (resultOutcome === 'tie' && bets.tie === 0 && (bets.player > 0 || bets.banker > 0)) {
        // Technically player pushed their bet, no win or lose sound
        playSound('deal');
    }

    ui.gameMessage.classList.remove('hidden');

    // Update Profile
    userProfile.chips += winAmount;
    
    let totalBet = bets.player + bets.banker + bets.tie;
    
    // Save to history. Consider a round a "win" if payout > totalBet.
    addHistory(resultOutcome, winAmount > totalBet ? winAmount - totalBet : 0);
    
    saveProfile();
    
    setTimeout(() => {
        // Reset bets for next round
        bets = { player: 0, banker: 0, tie: 0 };
        updateBetsUI();
        ui.clearBetsBtn.disabled = false;
        ui.gameMessage.classList.add('hidden');
        ui.playerCards.innerHTML = '';
        ui.bankerCards.innerHTML = '';
        ui.playerScore.textContent = '0';
        ui.bankerScore.textContent = '0';
        gameState = 'IDLE';
    }, 3000);
}

// ============================================
// GAME ENGINE: POK DENG
// ============================================

let pokdengDeck, pokdengPlayerHand, pokdengDealerHand;

ui.pokdengDealBtn.addEventListener('click', startPokDengRound);
ui.pokdengHitBtn.addEventListener('click', pokdengHit);
ui.pokdengStandBtn.addEventListener('click', pokdengStand);

async function startPokDengRound() {
    gameState = 'DEALING';
    ui.pokdengDealBtn.disabled = true;
    ui.pokdengClearBtn.disabled = true;
    ui.pokdengMessage.classList.add('hidden');
    ui.pokdengPlayerCards.innerHTML = '';
    ui.pokdengDealerCards.innerHTML = '';
    
    pokdengDeck = new Deck();
    pokdengPlayerHand = [];
    pokdengDealerHand = [];

    // Deal 2 cards each
    for (let i = 0; i < 2; i++) {
        await sleep(400);
        let pCard = pokdengDeck.draw();
        pokdengPlayerHand.push(pCard);
        ui.pokdengPlayerCards.insertAdjacentHTML('beforeend', createCardHTML(pCard));
        playSound('deal');
        ui.pokdengPlayerScore.textContent = getPokDengEval(pokdengPlayerHand).text;

        await sleep(400);
        let dCard = pokdengDeck.draw();
        // Dealer 2nd card is face down initially
        if (i === 1) {
            dCard.hidden = true;
            pokdengDealerHand.push(dCard);
            ui.pokdengDealerCards.insertAdjacentHTML('beforeend', `<div class="playing-card black" id="pokdeng-hidden-card"><div class="card-suit">🂠</div></div>`);
        } else {
            pokdengDealerHand.push(dCard);
            ui.pokdengDealerCards.insertAdjacentHTML('beforeend', createCardHTML(dCard));
        }
        playSound('deal');
    }

    let pEval = getPokDengEval(pokdengPlayerHand);
    let dEval = getPokDengEval(pokdengDealerHand);

    // Reveal hidden card if dealer or player has Pok 8 or Pok 9
    if (pEval.isPok || dEval.isPok) {
        await sleep(800);
        pokdengRevealDealerCard();
        ui.pokdengDealerScore.textContent = getPokDengEval(pokdengDealerHand).text;
        await sleep(1000);
        pokdengEvaluateWinner(pEval, getPokDengEval(pokdengDealerHand));
    } else {
        // Player's turn
        gameState = 'PLAYER_TURN';
        ui.pokdengStartControls.classList.add('hidden');
        ui.pokdengIngameControls.classList.remove('hidden');
    }
}

async function pokdengHit() {
    if (gameState !== 'PLAYER_TURN') return;
    ui.pokdengIngameControls.classList.add('hidden');
    
    let pCard = pokdengDeck.draw();
    pokdengPlayerHand.push(pCard);
    ui.pokdengPlayerCards.insertAdjacentHTML('beforeend', createCardHTML(pCard));
    playSound('deal');
    ui.pokdengPlayerScore.textContent = getPokDengEval(pokdengPlayerHand).text;
    
    await sleep(800);
    pokdengDealerTurn();
}

async function pokdengStand() {
    if (gameState !== 'PLAYER_TURN') return;
    ui.pokdengIngameControls.classList.add('hidden');
    pokdengDealerTurn();
}

async function pokdengDealerTurn() {
    gameState = 'DEALER_TURN';
    pokdengRevealDealerCard();
    
    let dEval = getPokDengEval(pokdengDealerHand);
    ui.pokdengDealerScore.textContent = dEval.text;
    
    // Dealer hits if points < 4
    if (dEval.points < 4) {
        await sleep(800);
        let dCard = pokdengDeck.draw();
        pokdengDealerHand.push(dCard);
        ui.pokdengDealerCards.insertAdjacentHTML('beforeend', createCardHTML(dCard));
        playSound('deal');
        dEval = getPokDengEval(pokdengDealerHand);
        ui.pokdengDealerScore.textContent = dEval.text;
    }
    
    await sleep(1000);
    pokdengEvaluateWinner(getPokDengEval(pokdengPlayerHand), dEval);
}

function pokdengRevealDealerCard() {
    const hidden = document.getElementById('pokdeng-hidden-card');
    if (hidden) {
        pokdengDealerHand[1].hidden = false;
        hidden.outerHTML = createCardHTML(pokdengDealerHand[1]);
    }
}

function getPokDengEval(hand) {
    let points = calculateHandValue(hand);
    let numCards = hand.length;
    let isPok = false;
    let multiplier = 1;
    let desc = `${points} Points`;

    if (numCards === 2 && (points === 8 || points === 9)) {
        isPok = true;
        desc = `Pok ${points}`;
    }

    // Check multipliers
    let allSameSuit = true;
    let suit = hand[0].suit;
    for (let c of hand) if (c.suit !== suit) allSameSuit = false;

    let allSameRank = true;
    let rank = hand[0].value;
    for (let c of hand) if (c.value !== rank) allSameRank = false;

    if (numCards === 2 && (allSameSuit || allSameRank)) {
        multiplier = 2;
        desc += ' (2 Deng)';
    } else if (numCards === 3 && (allSameSuit || allSameRank)) {
        multiplier = 3;
        desc += ' (3 Deng)';
    } else if (numCards === 3) {
      // 3 face cards = 3 Deng
      let allFace = true;
      for (let c of hand) {
        if (!['J','Q','K'].includes(c.value)) allFace = false;
      }
      if(allFace) {
        multiplier = 3;
        desc = "3 Face (3 Deng)";
        points = 10; // High value
      }
    }

    return { points, isPok, multiplier, text: desc, rawHandSize: numCards };
}

function pokdengEvaluateWinner(pEval, dEval) {
    gameState = 'RESULT';
    let bet = bets.pokdeng;
    let winAmount = 0;
    let outcome = '';

    const pScore = pEval.isPok ? pEval.points + 10 : pEval.points;
    const dScore = dEval.isPok ? dEval.points + 10 : dEval.points;

    if (pScore > dScore) {
        outcome = 'player';
        ui.pokdengMessage.textContent = `YOU WIN! (${pEval.multiplier}x)`;
        ui.pokdengMessage.style.borderColor = 'var(--neon-blue)';
        ui.pokdengMessage.style.textShadow = '0 0 10px var(--neon-blue)';
        winAmount = bet + (bet * pEval.multiplier);
    } else if (dScore > pScore) {
        outcome = 'banker'; // dealer
        ui.pokdengMessage.textContent = `DEALER WINS (${dEval.multiplier}x)`;
        ui.pokdengMessage.style.borderColor = 'var(--neon-red)';
        ui.pokdengMessage.style.textShadow = '0 0 10px var(--neon-red)';
        // Subtract multiplier penalty if dealer got 2/3 deng
        let penalty = bet * (dEval.multiplier - 1);
        if (penalty > 0) {
           userProfile.chips -= penalty; // Deduct extra
           winAmount = -penalty; // Note: initial bet is already deducted
        }
    } else {
        outcome = 'tie';
        ui.pokdengMessage.textContent = 'TIE';
        ui.pokdengMessage.style.borderColor = 'var(--neon-green)';
        ui.pokdengMessage.style.textShadow = '0 0 10px var(--neon-green)';
        winAmount = bet; // Return bet
    }

    userProfile.chips += Math.max(0, winAmount);
    
    if (outcome === 'player') playSound('win');
    else if (outcome === 'banker') playSound('lose');
    else playSound('deal');

    ui.pokdengMessage.classList.remove('hidden');
    
    // Profit logic: winAmount includes our returned bet, so profit is winAmount - bet
    let profit = outcome === 'player' ? (winAmount - bet) : (outcome === 'banker' ? -bet + winAmount : 0);
    addHistory(`PokDeng (${outcome})`, profit);
    saveProfile();

    setTimeout(() => {
        ui.pokdengStartControls.classList.remove('hidden');
        bets.pokdeng = 0;
        updateBetsUI();
        ui.pokdengClearBtn.disabled = false;
        ui.pokdengMessage.classList.add('hidden');
        ui.pokdengPlayerScore.textContent = '0';
        ui.pokdengDealerScore.textContent = '0';
        gameState = 'IDLE';
    }, 3500);
}

function addHistory(outcome, profit) {
    // Keep last 5
    if(!userProfile.history) userProfile.history = [];
    userProfile.history.unshift({ outcome, profit });
    if (userProfile.history.length > 5) userProfile.history.pop();
    updateHistoryUI();
}

function updateHistoryUI() {
    if (!userProfile.history || userProfile.history.length === 0) return;
    ui.historyList.innerHTML = '';
    userProfile.history.forEach(item => {
        const li = document.createElement('li');
        li.className = `hist-${item.outcome}`;
        const outcomeText = item.outcome.charAt(0).toUpperCase() + item.outcome.slice(1);
        const winText = item.profit > 0 ? `<span class="neon-text-green">+${item.profit}</span>` : `<span style="color:#666">-</span>`;
        li.innerHTML = `<span>${outcomeText}</span> <span>${winText}</span>`;
        ui.historyList.appendChild(li);
    });
}

// ============================================
// GAME ENGINE: TEXAS HOLD'EM POKER
// ============================================

let pokerDeck, pokerPlayerHand, pokerAiHand, pokerCommunityCards;
let pokerPot = 0;
let currentPokerPhase = 0; // 0: Preflop, 1: Flop, 2: Turn, 3: River

ui.pokerDealBtn.addEventListener('click', startPokerRound);
ui.pokerFoldBtn.addEventListener('click', pokerFold);
ui.pokerCallBtn.addEventListener('click', pokerCall);
ui.pokerRaiseBtn.addEventListener('click', pokerRaise);

async function startPokerRound() {
    gameState = 'DEALING';
    ui.pokerDealBtn.disabled = true;
    ui.pokerClearBtn.disabled = true;
    ui.pokerMessage.classList.add('hidden');
    ui.pokerPlayerCards.innerHTML = '';
    ui.pokerAiCards.innerHTML = '';
    ui.pokerCommunityCards.innerHTML = '';
    ui.pokerPlayerEval.textContent = '';
    ui.pokerAiAction.textContent = 'Waiting...';
    
    // Move ante to pot
    pokerPot = bets.poker;
    bets.poker = 0; // Clear bet zone visually
    updateBetsUI();
    ui.pokerPot.textContent = pokerPot;

    pokerDeck = new Deck();
    pokerPlayerHand = [];
    pokerAiHand = [];
    pokerCommunityCards = [];
    currentPokerPhase = 0;

    // Deal 2 hole cards
    for (let i = 0; i < 2; i++) {
        await sleep(400);
        let pCard = pokerDeck.draw();
        pokerPlayerHand.push(pCard);
        ui.pokerPlayerCards.insertAdjacentHTML('beforeend', createCardHTML(pCard));
        playSound('deal');

        await sleep(400);
        let aCard = pokerDeck.draw();
        aCard.hidden = true;
        pokerAiHand.push(aCard);
        ui.pokerAiCards.insertAdjacentHTML('beforeend', `<div class="playing-card black poker-ai-hidden"><div class="card-suit">🂠</div></div>`);
        playSound('deal');
    }

    evalPokerPlayerHand();
    promptPokerAction();
}

function promptPokerAction() {
    gameState = 'PLAYER_TURN';
    ui.pokerPregameControls.classList.add('hidden');
    ui.pokerStartControls.classList.add('hidden');
    ui.pokerIngameControls.classList.remove('hidden');
    
    // Set raise amount based on pot (e.g., 50% pot)
    let raiseAmt = Math.max(10, Math.floor(pokerPot * 0.5 / 10) * 10);
    ui.pokerRaiseAmt.textContent = raiseAmt;
    ui.pokerRaiseBtn.dataset.amount = raiseAmt;
}

function processAiTurn(playerAction, raiseAmt = 0) {
    ui.pokerIngameControls.classList.add('hidden');
    ui.pokerAiAction.textContent = 'Thinking...';
    
    setTimeout(() => {
        // Very basic AI
        let aiWillFold = false;
        
        if (playerAction === 'raise') {
             // In a real game, analyze cards. Here, % chance to fold based on random.
             if (Math.random() < 0.4) {
                 aiWillFold = true;
             }
        }
        
        if (aiWillFold) {
            ui.pokerAiAction.textContent = 'Folded';
            playSound('win');
            endPokerRound('player'); // Player wins
        } else {
            playSound('chips');
            ui.pokerAiAction.textContent = playerAction === 'raise' ? 'Called' : 'Checked';
            if (playerAction === 'raise') {
                pokerPot += raiseAmt; // AI matches raise
                ui.pokerPot.textContent = pokerPot;
            }
            advancePokerPhase();
        }
    }, 1500);
}

function pokerFold() {
    if (gameState !== 'PLAYER_TURN') return;
    ui.pokerIngameControls.classList.add('hidden');
    endPokerRound('banker'); // AI wins
}

function pokerCall() {
    if (gameState !== 'PLAYER_TURN') return;
    playSound('chips');
    // Call implies check in this heads-up simplified version without rigid blinds
    processAiTurn('call');
}

function pokerRaise() {
    if (gameState !== 'PLAYER_TURN') return;
    let raiseAmt = parseInt(ui.pokerRaiseBtn.dataset.amount);
    if (userProfile.chips >= raiseAmt) {
        playSound('chips');
        userProfile.chips -= raiseAmt;
        pokerPot += raiseAmt;
        ui.pokerPot.textContent = pokerPot;
        saveProfile();
        processAiTurn('raise', raiseAmt);
    } else {
        alert("Not enough chips to raise!");
    }
}

async function advancePokerPhase() {
    gameState = 'DEALING';
    ui.pokerAiAction.textContent = 'Waiting...';
    currentPokerPhase++;
    
    let cardsToDeal = 0;
    if (currentPokerPhase === 1) cardsToDeal = 3; // Flop
    else if (currentPokerPhase === 2 || currentPokerPhase === 3) cardsToDeal = 1; // Turn or River
    
    if (cardsToDeal > 0) {
        for (let i = 0; i < cardsToDeal; i++) {
            await sleep(500);
            let c = pokerDeck.draw();
            pokerCommunityCards.push(c);
            ui.pokerCommunityCards.insertAdjacentHTML('beforeend', createCardHTML(c));
            playSound('deal');
        }
        evalPokerPlayerHand();
        promptPokerAction();
    } else {
        // Showdown
        pokerShowdown();
    }
}

function evalPokerPlayerHand() {
    // Simplified stub: in a full implementation, this uses a robust 7-card evaluator.
    // For now, let's just show how many cards they have
    ui.pokerPlayerEval.textContent = `(${2 + pokerCommunityCards.length} Cards)`;
}

function getPokerHandScore(holeCards, commCards) {
    // Simplified ranker: Just sums values of highest cards for demo purposes
    // A real poker evaluator is massive (checking pairs, straights, flushes, etc.)
    // We will use a mock random value heavily weighted by card ranks
    let sum = 0;
    let all = holeCards.concat(commCards);
    for (let c of all) {
        let v = getBaccaratValue(c.value); // Re-using parser to get int
        if (c.value === 'A') v = 14;
        if (c.value === 'J') v = 11;
        if (c.value === 'Q') v = 12;
        if (c.value === 'K') v = 13;
        sum += v;
    }
    // Add big bonus for pairs
    if (holeCards[0].value === holeCards[1].value) sum += 50; 
    return sum;
}

async function pokerShowdown() {
    gameState = 'RESULT';
    ui.pokerAiAction.textContent = 'Showdown';
    
    // Reveal AI cards
    let hiddenCards = document.querySelectorAll('.poker-ai-hidden');
    hiddenCards.forEach((el, index) => {
        el.outerHTML = createCardHTML(pokerAiHand[index]);
    });
    playSound('deal');
    
    await sleep(1000);
    
    let pScore = getPokerHandScore(pokerPlayerHand, pokerCommunityCards);
    let aScore = getPokerHandScore(pokerAiHand, pokerCommunityCards);
    
    if (pScore > aScore) endPokerRound('player');
    else if (aScore > pScore) endPokerRound('banker');
    else endPokerRound('tie');
}

function endPokerRound(outcome) {
    gameState = 'RESULT';
    ui.pokerPregameControls.classList.remove('hidden');
    ui.pokerStartControls.classList.remove('hidden');
    ui.pokerIngameControls.classList.add('hidden');
    
    let winAmount = 0;
    if (outcome === 'player') {
        ui.pokerMessage.textContent = 'YOU WIN POT!';
        ui.pokerMessage.style.borderColor = 'var(--neon-blue)';
        ui.pokerMessage.style.textShadow = '0 0 10px var(--neon-blue)';
        winAmount = pokerPot;
        playSound('win');
    } else if (outcome === 'banker') {
        ui.pokerMessage.textContent = 'AI WINS POT';
        ui.pokerMessage.style.borderColor = 'var(--neon-red)';
        ui.pokerMessage.style.textShadow = '0 0 10px var(--neon-red)';
        playSound('lose');
    } else {
        ui.pokerMessage.textContent = 'SPLIT POT';
        ui.pokerMessage.style.borderColor = 'var(--neon-green)';
        ui.pokerMessage.style.textShadow = '0 0 10px var(--neon-green)';
        winAmount = Math.floor(pokerPot / 2);
        playSound('deal');
    }
    
    ui.pokerMessage.classList.remove('hidden');
    userProfile.chips += winAmount;
    
    addHistory(`Poker (${outcome})`, outcome === 'player' ? winAmount : (outcome === 'tie' ? 0 : -pokerPot));
    saveProfile();
    
    setTimeout(() => {
        pokerPot = 0;
        ui.pokerPot.textContent = '0';
        ui.pokerClearBtn.disabled = false;
        ui.pokerMessage.classList.add('hidden');
        ui.pokerPlayerCards.innerHTML = '';
        ui.pokerAiCards.innerHTML = '';
        ui.pokerCommunityCards.innerHTML = '';
        ui.pokerPlayerEval.textContent = '';
        ui.pokerAiAction.textContent = 'Waiting...';
        gameState = 'IDLE';
    }, 4000);
}

// ============================================
// GAME ENGINE: BLACKJACK
// ============================================

let bjDeck, bjPlayerHand, bjDealerHand;

ui.blackjackDealBtn.addEventListener('click', startBlackjackRound);
ui.blackjackHitBtn.addEventListener('click', bjHit);
ui.blackjackStandBtn.addEventListener('click', () => bjDealerTurn());
ui.blackjackDoubleBtn.addEventListener('click', bjDoubleDown);

function getBjScore(hand) {
    let score = 0;
    let aces = 0;
    for (let c of hand) {
        if (['J', 'Q', 'K'].includes(c.value)) score += 10;
        else if (c.value === 'A') { score += 11; aces += 1; }
        else score += parseInt(c.value);
    }
    while (score > 21 && aces > 0) {
        score -= 10;
        aces -= 1;
    }
    return score;
}

async function startBlackjackRound() {
    gameState = 'DEALING';
    ui.blackjackDealBtn.disabled = true;
    ui.blackjackClearBtn.disabled = true;
    ui.blackjackMessage.classList.add('hidden');
    ui.blackjackPlayerCards.innerHTML = '';
    ui.blackjackDealerCards.innerHTML = '';
    ui.blackjackDealerScore.textContent = '?';
    
    bjDeck = new Deck();
    bjPlayerHand = [];
    bjDealerHand = [];

    // Deal 2 cards
    for (let i = 0; i < 2; i++) {
        await sleep(400);
        let pCard = bjDeck.draw();
        bjPlayerHand.push(pCard);
        ui.blackjackPlayerCards.insertAdjacentHTML('beforeend', createCardHTML(pCard));
        playSound('deal');
        ui.blackjackPlayerScore.textContent = getBjScore(bjPlayerHand);

        await sleep(400);
        let dCard = bjDeck.draw();
        if (i === 1) {
            dCard.hidden = true;
            bjDealerHand.push(dCard);
            ui.blackjackDealerCards.insertAdjacentHTML('beforeend', `<div class="playing-card black bj-hidden"><div class="card-suit">🂠</div></div>`);
        } else {
            bjDealerHand.push(dCard);
            ui.blackjackDealerCards.insertAdjacentHTML('beforeend', createCardHTML(dCard));
        }
        playSound('deal');
    }

    let pScore = getBjScore(bjPlayerHand);
    
    // Check for natural Blackjack
    if (pScore === 21) {
        await sleep(800);
        bjRevealDealerCard();
        let dScore = getBjScore(bjDealerHand);
        ui.blackjackDealerScore.textContent = dScore;
        await sleep(1000);
        
        if (dScore === 21) endBlackjackRound('push');
        else endBlackjackRound('blackjack');
    } else {
        gameState = 'PLAYER_TURN';
        ui.blackjackStartControls.classList.add('hidden');
        ui.blackjackIngameControls.classList.remove('hidden');
        ui.blackjackDoubleBtn.disabled = (userProfile.chips < bets.blackjack);
    }
}

async function bjHit() {
    if (gameState !== 'PLAYER_TURN') return;
    ui.blackjackDoubleBtn.disabled = true; // Can't double after hitting
    
    let pCard = bjDeck.draw();
    bjPlayerHand.push(pCard);
    ui.blackjackPlayerCards.insertAdjacentHTML('beforeend', createCardHTML(pCard));
    playSound('deal');
    
    let score = getBjScore(bjPlayerHand);
    ui.blackjackPlayerScore.textContent = score;
    
    if (score > 21) {
        gameState = 'RESULT';
        ui.blackjackIngameControls.classList.add('hidden');
        await sleep(1000);
        endBlackjackRound('bust');
    }
}

async function bjDoubleDown() {
    if (gameState !== 'PLAYER_TURN') return;
    if (userProfile.chips >= bets.blackjack) {
        playSound('chips');
        userProfile.chips -= bets.blackjack;
        bets.blackjack *= 2;
        updateBetsUI();
        saveProfile();
        
        ui.blackjackIngameControls.classList.add('hidden');
        
        let pCard = bjDeck.draw();
        bjPlayerHand.push(pCard);
        ui.blackjackPlayerCards.insertAdjacentHTML('beforeend', createCardHTML(pCard));
        playSound('deal');
        ui.blackjackPlayerScore.textContent = getBjScore(bjPlayerHand);
        
        await sleep(1000);
        
        if (getBjScore(bjPlayerHand) > 21) endBlackjackRound('bust');
        else bjDealerTurn();
    }
}

function bjRevealDealerCard() {
    const hidden = document.querySelector('.bj-hidden');
    if (hidden) {
        bjDealerHand[1].hidden = false;
        hidden.outerHTML = createCardHTML(bjDealerHand[1]);
    }
}

async function bjDealerTurn() {
    gameState = 'DEALER_TURN';
    ui.blackjackIngameControls.classList.add('hidden');
    
    bjRevealDealerCard();
    let dScore = getBjScore(bjDealerHand);
    ui.blackjackDealerScore.textContent = dScore;
    
    while (dScore < 17) {
        await sleep(800);
        let dCard = bjDeck.draw();
        bjDealerHand.push(dCard);
        ui.blackjackDealerCards.insertAdjacentHTML('beforeend', createCardHTML(dCard));
        playSound('deal');
        dScore = getBjScore(bjDealerHand);
        ui.blackjackDealerScore.textContent = dScore;
    }
    
    await sleep(1000);
    
    let pScore = getBjScore(bjPlayerHand);
    
    if (dScore > 21) endBlackjackRound('win');
    else if (pScore > dScore) endBlackjackRound('win');
    else if (dScore > pScore) endBlackjackRound('lose');
    else endBlackjackRound('push');
}

function endBlackjackRound(outcome) {
    gameState = 'RESULT';
    ui.blackjackStartControls.classList.remove('hidden');
    
    let bet = bets.blackjack;
    let winAmount = 0;
    let profit = 0;
    
    if (outcome === 'blackjack') {
        ui.blackjackMessage.textContent = 'BLACKJACK! (3:2)';
        ui.blackjackMessage.style.borderColor = 'var(--neon-green)';
        ui.blackjackMessage.style.textShadow = '0 0 10px var(--neon-green)';
        winAmount = bet + (bet * 1.5);
        profit = bet * 1.5;
        playSound('win');
    } else if (outcome === 'win') {
        ui.blackjackMessage.textContent = 'YOU WIN!';
        ui.blackjackMessage.style.borderColor = 'var(--neon-blue)';
        ui.blackjackMessage.style.textShadow = '0 0 10px var(--neon-blue)';
        winAmount = bet * 2;
        profit = bet;
        playSound('win');
    } else if (outcome === 'push') {
        ui.blackjackMessage.textContent = 'PUSH (TIE)';
        ui.blackjackMessage.style.borderColor = '#ccc';
        ui.blackjackMessage.style.textShadow = '0 0 10px #ccc';
        winAmount = bet;
        profit = 0;
        playSound('deal');
    } else if (outcome === 'bust') {
        ui.blackjackMessage.textContent = 'BUST!';
        ui.blackjackMessage.style.borderColor = 'var(--neon-red)';
        ui.blackjackMessage.style.textShadow = '0 0 10px var(--neon-red)';
        winAmount = 0;
        profit = -bet;
        playSound('lose');
    } else if (outcome === 'lose') {
        ui.blackjackMessage.textContent = 'DEALER WINS';
        ui.blackjackMessage.style.borderColor = 'var(--neon-red)';
        ui.blackjackMessage.style.textShadow = '0 0 10px var(--neon-red)';
        winAmount = 0;
        profit = -bet;
        playSound('lose');
    }

    if (winAmount > 0) userProfile.chips += winAmount;
    ui.blackjackMessage.classList.remove('hidden');
    
    addHistory(`Blackjack (${outcome})`, profit);
    saveProfile();

    setTimeout(() => {
        bets.blackjack = 0;
        updateBetsUI();
        ui.blackjackClearBtn.disabled = false;
        ui.blackjackMessage.classList.add('hidden');
        ui.blackjackPlayerCards.innerHTML = '';
        ui.blackjackDealerCards.innerHTML = '';
        ui.blackjackPlayerScore.textContent = '0';
        ui.blackjackDealerScore.textContent = '?';
        gameState = 'IDLE';
    }, 4000);
}

// Kickoff
init();
