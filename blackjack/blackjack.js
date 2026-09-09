// Blackjack (21) - simple realistic rules
(function () {
  // DOM
  const chipsEl = document.getElementById('chips');
  const betEl = document.getElementById('bet');
  const dealBtn = document.getElementById('dealBtn');
  const hitBtn = document.getElementById('hitBtn');
  const standBtn = document.getElementById('standBtn');
  const rulesBtn = document.getElementById('rulesBtn');
  const newRoundBtn = document.getElementById('newRoundBtn');
  const dealerEl = document.getElementById('dealer');
  const playerEl = document.getElementById('player');
  const playerValueEl = document.getElementById('player-value');
  const dealerValueEl = document.getElementById('dealer-value');
  const messageEl = document.getElementById('message');
  const rulesModal = document.getElementById('rules-modal');
  const resultModal = document.getElementById('result-modal');
  const resultTitle = document.getElementById('result-title');
  const resultText = document.getElementById('result-text');
  const closeRulesBtn = document.getElementById('closeRulesBtn');
  const closeResultBtn = document.getElementById('closeResultBtn');
  const continueBtn = document.getElementById('continueBtn');

  let chips = 100;
  let bet = 10;
  let deck = [];
  let player = [];
  let dealer = [];
  let inRound = false;
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtx = AudioCtx ? new AudioCtx() : null;
    }
    return audioCtx;
  }

  function playTone(frequency, duration, volume, type = 'sine') {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.stop(ctx.currentTime + duration);
  }

  function playDealSound() {
    playTone(520, 0.12, 0.02, 'triangle');
    setTimeout(() => playTone(680, 0.08, 0.02, 'triangle'), 70);
  }

  function playWinSound() {
    playTone(440, 0.12, 0.04, 'sine');
    setTimeout(() => playTone(660, 0.12, 0.04, 'sine'), 90);
    setTimeout(() => playTone(880, 0.18, 0.04, 'triangle'), 180);
  }

  function playLoseSound() {
    playTone(260, 0.12, 0.04, 'sawtooth');
    setTimeout(() => playTone(200, 0.18, 0.04, 'sawtooth'), 80);
  }

  function createDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck = [];

    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ suit, rank });
      }
    }
    return deck;
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function cardValue(card) {
    if (!card) return 0;
    if (card.rank === 'A') return 1;
    if (['J', 'Q', 'K'].includes(card.rank)) return 10;
    return Number(card.rank);
  }

  function handValue(hand) {
    let total = 0;
    let aces = 0;

    for (const card of hand) {
      total += cardValue(card);
      if (card.rank === 'A') aces += 1;
    }

    while (aces > 0 && total + 10 <= 21) {
      total += 10;
      aces -= 1;
    }

    return total;
  }

  function renderCard(card, hidden = false) {
    const el = document.createElement('div');

    if (hidden) {
      el.className = 'card card-back';
      return el;
    }

    const isRed = card.suit === '♥' || card.suit === '♦';
    el.className = 'card' + (isRed ? ' red' : '');

    const rank = document.createElement('div');
    rank.className = 'card-value';
    rank.textContent = card.rank;

    const suit = document.createElement('div');
    suit.className = 'card-suit';
    suit.textContent = card.suit;

    el.append(rank, suit);
    return el;
  }

  function renderHands(revealDealer = false) {
    dealerEl.innerHTML = '';
    playerEl.innerHTML = '';

    dealer.forEach((card, index) => {
      const shouldHide = index === 1 && !revealDealer;
      dealerEl.appendChild(renderCard(shouldHide ? null : card, shouldHide));
    });

    player.forEach((card) => {
      playerEl.appendChild(renderCard(card));
    });

    const playerTotal = handValue(player);
    const dealerTotal = handValue(dealer);

    playerValueEl.textContent = playerTotal ? `点数: ${playerTotal}` : '';
    dealerValueEl.textContent = revealDealer && dealerTotal ? `点数: ${dealerTotal}` : '';
  }

  function updateChips() {
    chipsEl.textContent = chips;
  }

  function setMessage(text) {
    messageEl.textContent = text;
  }

  function openRulesModal() {
    rulesModal.classList.remove('hidden');
    rulesModal.setAttribute('aria-hidden', 'false');
  }

  function closeRulesModal() {
    rulesModal.classList.add('hidden');
    rulesModal.setAttribute('aria-hidden', 'true');
  }

  function openResultModal(title, text) {
    resultTitle.textContent = title;
    resultText.textContent = text;
    resultModal.classList.remove('hidden');
    resultModal.setAttribute('aria-hidden', 'false');
  }

  function closeResultModal() {
    resultModal.classList.add('hidden');
    resultModal.setAttribute('aria-hidden', 'true');
  }

  function resetBoard() {
    deck = shuffle(createDeck());
    player = [];
    dealer = [];
    setMessage('');
    renderHands(false);
  }

  function drawCard() {
    return deck.pop();
  }

  function endRound() {
    inRound = false;
    dealBtn.disabled = false;
    hitBtn.disabled = true;
    standBtn.disabled = true;
    newRoundBtn.disabled = false;
    renderHands(true);
  }

  function evaluateNaturalBlackjack() {
    const playerTotal = handValue(player);
    const dealerTotal = handValue(dealer);

    if (playerTotal === 21 && player.length === 2) {
      if (dealerTotal === 21 && dealer.length === 2) {
        openResultModal('平局', '双方都是黑杰克！本轮不输不赢。');
        setMessage('平局：双方黑杰克。');
        chips += 0;
      } else {
        const payout = Math.round(bet * 1.5);
        chips += payout;
        openResultModal('黑杰克！', `你拿到黑杰克，赢得 ${payout} 筹码。`);
        setMessage(`黑杰克！你赢得 ${payout} 筹码。`);
        playWinSound();
      }
      updateChips();
      endRound();
      return true;
    }

    return false;
  }

  function startRound() {
    const requestedBet = Number(betEl.value);
    bet = Math.max(1, Math.floor(requestedBet || 1));

    if (bet > chips) {
      setMessage('下注金额超过当前筹码。');
      return;
    }

    chips -= bet;
    updateChips();
    inRound = true;
    closeResultModal();
    resetBoard();

    player.push(drawCard());
    dealer.push(drawCard());
    player.push(drawCard());
    dealer.push(drawCard());

    playDealSound();
    renderHands(false);
    dealBtn.disabled = true;
    hitBtn.disabled = false;
    standBtn.disabled = false;
    newRoundBtn.disabled = true;

    if (evaluateNaturalBlackjack()) {
      return;
    }
  }

  function playerHit() {
    if (!inRound) return;

    player.push(drawCard());
    playDealSound();
    renderHands(false);

    const playerTotal = handValue(player);
    if (playerTotal > 21) {
      setMessage('爆牌！庄家获胜。');
      openResultModal('失败', '你爆牌了，本轮损失 ' + bet + ' 筹码。');
      playLoseSound();
      updateChips();
      endRound();
    }
  }

  function dealerPlay() {
    while (handValue(dealer) < 17) {
      dealer.push(drawCard());
      playDealSound();
      renderHands(true);
    }
  }

  function settle() {
    const playerTotal = handValue(player);
    const dealerTotal = handValue(dealer);

    if (playerTotal > 21) {
      setMessage('爆牌！庄家获胜。');
      openResultModal('失败', '你爆牌了，本轮损失 ' + bet + ' 筹码。');
      playLoseSound();
      return;
    }

    if (dealerTotal > 21) {
      chips += bet * 2;
      setMessage('庄家爆牌，你赢了！');
      openResultModal('胜利', '庄家爆牌，你赢得 ' + (bet * 2) + ' 筹码。');
      playWinSound();
      updateChips();
      return;
    }

    if (playerTotal > dealerTotal) {
      chips += bet * 2;
      setMessage('你赢了！');
      openResultModal('胜利', '你赢得 ' + (bet * 2) + ' 筹码。');
      playWinSound();
    } else if (playerTotal < dealerTotal) {
      setMessage('庄家赢了。');
      openResultModal('失败', '庄家更接近 21 点，本轮损失 ' + bet + ' 筹码。');
      playLoseSound();
    } else {
      chips += bet;
      setMessage('平局，返还本金。');
      openResultModal('平局', '双方点数相同，本轮返还本金。');
    }

    updateChips();
  }

  function playerStand() {
    if (!inRound) return;

    dealerPlay();
    settle();
    endRound();
  }

  document.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const value = Number(chip.dataset.value);
      betEl.value = value;
      bet = value;
      setMessage(`已选择 ${value} 筹码下注。`);
    });
  });

  rulesBtn.addEventListener('click', openRulesModal);
  closeRulesBtn.addEventListener('click', closeRulesModal);
  closeResultBtn.addEventListener('click', closeResultModal);
  continueBtn.addEventListener('click', closeResultModal);

  rulesModal.addEventListener('click', (event) => {
    if (event.target === rulesModal) closeRulesModal();
  });

  resultModal.addEventListener('click', (event) => {
    if (event.target === resultModal) closeResultModal();
  });

  dealBtn.addEventListener('click', startRound);
  hitBtn.addEventListener('click', playerHit);
  standBtn.addEventListener('click', playerStand);
  newRoundBtn.addEventListener('click', () => {
    setMessage('准备就绪，选择下注并发牌。');
    resetBoard();
    newRoundBtn.disabled = true;
    dealBtn.disabled = false;
    hitBtn.disabled = true;
    standBtn.disabled = true;
  });

  // init
  updateChips();
  resetBoard();
})();
