// Blackjack (21) - simple realistic rules
(function(){
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
  let dealerHidden = null;
  let inRound = false;

  function createDeck(){
    const suits = ['♠','♥','♦','♣'];
    const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    const d=[];
    for(const s of suits){
      for(const r of ranks){ d.push({suit:s,rank:r}); }
    }
    return d;
  }

  function shuffle(a){
    for(let i=a.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }

  function cardValue(card){
    if(!card) return 0;
    const r = card.rank;
    if(r==='A') return 1;
    if(['J','Q','K'].includes(r)) return 10;
    return parseInt(r,10);
  }

  // best value <=21 or minimal otherwise
  function handValue(hand){
    let sum=0, aces=0;
    for(const c of hand){ sum += cardValue(c); if(c.rank==='A') aces++; }
    // try to upgrade some aces from 1 -> 11 by adding 10 each
    let best = sum;
    for(let k=0;k<=aces;k++){
      const v = sum + k*10;
      if(v<=21) best = Math.max(best,v);
    }
    // if none <=21, return minimal sum (aces counted as 1)
    return best;
  }

  function renderCard(c){
    const span = document.createElement('div');
    span.className='card'+((c.suit==='♥'||c.suit==='♦')?' red':'');
    span.innerHTML = `<div style="font-size:14px">${c.rank}</div><div style="font-size:18px">${c.suit}</div>`;
    return span;
  }

  function renderHands(revealDealer=false){
    dealerEl.innerHTML=''; playerEl.innerHTML='';
    // dealer
    dealer.forEach((c,i)=>{
      if(i===1 && !revealDealer){
        const back = document.createElement('div'); back.className='card'; back.style.background='#0b1220'; back.style.color='#fff'; back.textContent='🂠'; dealerEl.appendChild(back);
      } else dealerEl.appendChild(renderCard(c));
    });
    player.forEach(c=>playerEl.appendChild(renderCard(c)));
    playerValueEl.textContent = 'Value: ' + handValue(player);
    dealerValueEl.textContent = revealDealer ? ('Value: ' + handValue(dealer)) : '';
  }

  function resetBoard(){
    deck = shuffle(createDeck());
    player = []; dealer = []; dealerHidden = null; messageEl.textContent='';
    renderHands(false);
  }

  function drawCard(){ return deck.pop(); }

  function startRound(){
    bet = Math.max(1, Math.floor(Number(betEl.value) || 1));
    if(bet > chips){ messageEl.textContent = 'Bet exceeds available chips'; return; }
    inRound = true;
    resetBoard();
    // deal
    player.push(drawCard());
    dealer.push(drawCard());
    player.push(drawCard());
    dealer.push(drawCard());
    renderHands(false);
    dealBtn.disabled = true; hitBtn.disabled = false; standBtn.disabled = false; newRoundBtn.disabled=true;
    // check natural blackjack
    const pval = handValue(player), dval = handValue(dealer);
    if(pval===21){
      // reveal dealer to check push or blackjack
      renderHands(true);
      if(dval===21){ messageEl.textContent='Push (both have Blackjack)'; }
      else { const win = Math.floor(bet*1.5); chips += win; messageEl.textContent = `Blackjack! You win ${win} chips.`; }
      chipsEl.textContent = chips; endRound();
    }
  }

  function playerHit(){
    if(!inRound) return;
    player.push(drawCard()); renderHands(false);
    const val = handValue(player);
    if(val>21){ messageEl.textContent='Busted! You lose.'; chips -= bet; chipsEl.textContent = chips; endRound(); }
  }

  function dealerPlay(){
    // reveal dealer and draw to 17 or more; dealer stands on soft 17
    renderHands(true);
    // while dealer best value < 17 -> hit
    while(true){
      const val = handValue(dealer);
      if(val < 17) { dealer.push(drawCard()); renderHands(true); }
      else break;
    }
  }

  function settle(){
    const p = handValue(player), d = handValue(dealer);
    if(p>21){ messageEl.textContent='You busted — dealer wins.'; chips -= bet; }
    else if(d>21){ messageEl.textContent='Dealer busted — you win!'; chips += bet; }
    else if(p> d){ messageEl.textContent='You win!'; chips += bet; }
    else if(p===d){ messageEl.textContent='Push.'; }
    else { messageEl.textContent='You lose.'; chips -= bet; }
    chipsEl.textContent = chips;
  }

  function playerStand(){
    if(!inRound) return;
    dealerPlay();
    settle();
    endRound();
  }

  function endRound(){
    inRound=false; dealBtn.disabled=false; hitBtn.disabled=true; standBtn.disabled=true; newRoundBtn.disabled=false; renderHands(true);
  }

  // events
  dealBtn.addEventListener('click', startRound);
  hitBtn.addEventListener('click', playerHit);
  standBtn.addEventListener('click', playerStand);
  newRoundBtn.addEventListener('click', ()=>{ messageEl.textContent=''; resetBoard(); newRoundBtn.disabled=true; });

  // init
  chipsEl.textContent = chips; resetBoard();
})();
