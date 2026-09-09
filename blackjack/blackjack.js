// Blackjack (21) - simple realistic rules
(function () {
  // DOM
  const chipsEl = document.getElementById('chips');
  const betEl = document.getElementById('bet');
  const dealBtn = document.getElementById('dealBtn');
  const hitBtn = document.getElementById('hitBtn');
  const standBtn = document.getElementById('standBtn');
  const newRoundBtn = document.getElementById('newRoundBtn');
  const dealerEl = document.getElementById('dealer');
  const playerEl = document.getElementById('player');
  const playerValueEl = document.getElementById('player-value');
  const dealerValueEl = document.getElementById('dealer-value');
  const messageEl = document.getElementById('message');

  let chips = 100;
  let bet = 10;
  let deck = [];
  let player = [];
  let dealer = [];
  let inRound = false;

  function createDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const d = [];
    for (const suit of suits) {
      for (const rank of ranks) {
        d.push({ suit, rank });
      }
    }
    return d;
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

    playerValueEl.textContent = playerTotal ? `Value: ${playerTotal}` : '';
    dealerValueEl.textContent = revealDealer && dealerTotal ? `Value: ${dealerTotal}` : '';
  }

  function setMessage(text) {
    messageEl.textContent = text;
  }

  function updateChips() {
    chipsEl.textContent = chips;
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
        chips += 0;
        setMessage('Push — both have Blackjack.');
      } else {
        const payout = Math.round(bet * 1.5);
        chips += payout;
        setMessage(`Blackjack! You win ${payout} chips.`);
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
      setMessage('Your bet exceeds your available chips.');
      return;
    }

    chips -= bet;
    updateChips();
    inRound = true;
    resetBoard();

    player.push(drawCard());
    dealer.push(drawCard());
    player.push(drawCard());
    dealer.push(drawCard());

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
    renderHands(false);

    const playerTotal = handValue(player);
    if (playerTotal > 21) {
      setMessage('Busted! Dealer wins.');
      updateChips();
      endRound();
    }
  }

  function dealerPlay() {
    while (handValue(dealer) < 17) {
      dealer.push(drawCard());
      renderHands(true);
    }
  }

  function settle() {
    const playerTotal = handValue(player);
    const dealerTotal = handValue(dealer);

    if (playerTotal > 21) {
      setMessage('Busted! Dealer wins.');
      return;
    }

    if (dealerTotal > 21) {
      chips += bet * 2;
      setMessage('Dealer busted — you win!');
      updateChips();
      return;
    }

    if (playerTotal > dealerTotal) {
      chips += bet * 2;
      setMessage('You win!');
    } else if (playerTotal < dealerTotal) {
      setMessage('Dealer wins.');
    } else {
      chips += bet;
      setMessage('Push.');
    }

    updateChips();
  }

  function playerStand() {
    if (!inRound) return;

    dealerPlay();
    settle();
    endRound();
  }

  // events
  dealBtn.addEventListener('click', startRound);
  hitBtn.addEventListener('click', playerHit);
  standBtn.addEventListener('click', playerStand);
  newRoundBtn.addEventListener('click', () => {
    setMessage('Place your bet and deal.');
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
