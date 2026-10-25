/**
 * 窓3 — browser text prototype
 * Core: hand 3 + next 1 visible; no discard; AP resets, MP does not.
 */
(function () {
  "use strict";

  const MAX_HP = 70;
  const BASE_AP = 3;
  const HAND_SIZE = 3;
  const REMOVE_COST = 25;

  /** Map: short 1-act with one branch */
  const MAP = [
    { id: "c1", type: "combat", label: "戦闘：スライム", enemy: "slime", next: ["c2a", "ev1"] },
    { id: "c2a", type: "combat", label: "戦闘：コウモリ", enemy: "bat", next: ["rest"] },
    { id: "ev1", type: "event", label: "出来事：古い祠", next: ["rest"] },
    { id: "rest", type: "rest", label: "休憩所", next: ["shop"] },
    { id: "shop", type: "shop", label: "店", next: ["elite"] },
    { id: "elite", type: "elite", label: "エリート：窓守り", enemy: "elite", next: ["boss"] },
    { id: "boss", type: "boss", label: "ボス：三窓の主", enemy: "boss", next: [] },
  ];

  const state = {
    screen: "title",
    player: null,
    combat: null,
    mapPos: null,
    available: [],
    visited: [],
    shop: null,
    reward: null,
    pendingSwapSelect: null,
  };

  function freshPlayer() {
    return {
      hp: MAX_HP,
      hpMax: MAX_HP,
      gold: 40,
      deck: makeStarterDeck(),
    };
  }

  // ——— UI helpers ———
  function $(id) { return document.getElementById(id); }
  function show(screen) {
    state.screen = screen;
    document.querySelectorAll(".screen").forEach((el) => el.classList.add("hidden"));
    const s = $("screen-" + screen);
    if (s) s.classList.remove("hidden");
  }
  function logCombat(msg, important) {
    const box = $("combat-log");
    if (!box) return;
    const line = document.createElement("div");
    line.className = "line" + (important ? " important" : "");
    line.textContent = msg;
    box.prepend(line);
  }
  function logShop(msg) {
    const box = $("shop-log");
    if (!box) return;
    const line = document.createElement("div");
    line.className = "line";
    line.textContent = msg;
    box.prepend(line);
  }

  function costLabel(card) {
    const parts = [];
    if (card.ap > 0) parts.push("AP " + card.ap);
    if (card.mp > 0) parts.push("MP " + card.mp);
    if (parts.length === 0) parts.push("無料");
    return parts.join(" / ");
  }

  function renderCardEl(card, opts) {
    opts = opts || {};
    const el = document.createElement("div");
    el.className = "card type-" + card.type + (opts.disabled ? " disabled" : "") + (opts.static ? " static" : "") + (opts.next ? " next" : "");
    el.innerHTML =
      '<div class="cname">' + escapeHtml(card.name) + "</div>" +
      '<div class="ccost">' + costLabel(card).replace("MP", '<span class="mp">MP</span>') + "</div>" +
      '<div class="ctext">' + escapeHtml(card.text) + "</div>" +
      (opts.price != null ? '<div class="price">' + opts.price + " 金</div>" : "");
    if (opts.onClick && !opts.disabled) {
      el.addEventListener("click", opts.onClick);
    }
    return el;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // ——— Deck / window rules ———
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function startCombat(enemyId) {
    const def = ENEMIES[enemyId];
    const pile = shuffle(state.player.deck.map((c) => ({ ...c })));
    const hand = [];
    for (let i = 0; i < HAND_SIZE && pile.length; i++) hand.push(pile.pop());
    const next = pile.length ? pile.pop() : null;

    state.combat = {
      enemy: {
        id: def.id,
        name: def.name,
        hp: def.hp,
        hpMax: def.hp,
        block: 0,
        strength: 0,
        pattern: def.pattern,
        turn: 0,
        gold: def.gold,
        intent: null,
      },
      player: {
        hp: state.player.hp,
        hpMax: state.player.hpMax,
        block: 0,
        ap: BASE_AP,
        mp: 0,
        stance: null,
      },
      hand,
      next,
      pile,
      over: false,
      isBoss: enemyId === "boss",
    };
    $("combat-log").innerHTML = "";
    setIntent();
    show("combat");
    renderCombat();
    logCombat(def.name + " が現れた！", true);
  }

  function setIntent() {
    const e = state.combat.enemy;
    const step = e.pattern[e.turn % e.pattern.length];
    e.intent = { ...step };
    if (step.kind === "attack") {
      e.intent.label = "攻撃 " + (step.value + e.strength);
    }
  }

  function attackBonus() {
    return state.combat.player.stance === "offense" ? 3 : 0;
  }
  function blockBonus() {
    return state.combat.player.stance === "defense" ? 2 : 0;
  }

  const api = {
    dealDamageToEnemy(n) {
      const e = state.combat.enemy;
      let dmg = n;
      if (e.block > 0) {
        const soaked = Math.min(e.block, dmg);
        e.block -= soaked;
        dmg -= soaked;
      }
      e.hp = Math.max(0, e.hp - dmg);
      logCombat(e.name + " に " + n + " ダメージ" + (e.hp <= 0 ? " — 撃破！" : ""));
    },
    gainBlock(n) {
      state.combat.player.block += n;
      logCombat("ブロック +" + n);
    },
    redrawNext() {
      const c = state.combat;
      if (!c.next) { logCombat("次がない"); return; }
      c.pile.push(c.next);
      shuffle(c.pile);
      c.next = c.pile.length ? c.pile.pop() : null;
      logCombat("次を入れ替えた");
    },
    swapNextWithHand(index) {
      const c = state.combat;
      if (!c.next || !c.hand[index]) { logCombat("入れ替えできない"); return; }
      const tmp = c.hand[index];
      c.hand[index] = c.next;
      c.next = tmp;
      logCombat("次と手札を入れ替えた");
    },
    log: logCombat,
    attackBonus,
    blockBonus,
    get player() { return state.combat.player; },
  };

  function canPlay(card) {
    const p = state.combat.player;
    return p.ap >= card.ap && p.mp >= card.mp && !state.combat.over;
  }

  /**
   * Play card from hand index:
   * 1) pay cost 2) effect 3) card → pile 4) next → hand 5) new next from shuffled pile
   */
  function playCard(handIndex) {
    const c = state.combat;
    if (c.over) return;
    const card = c.hand[handIndex];
    if (!card || !canPlay(card)) return;

    c.player.ap -= card.ap;
    c.player.mp -= card.mp;
    logCombat("『" + card.name + "』を使用", true);

    // Remove from hand first
    c.hand.splice(handIndex, 1);

    // Effect (may inspect hand/next)
    const def = CARD_DEFS[card.defId];
    def.effect(api);

    // Return played card to pile
    c.pile.push(card);

    // Visible next enters hand
    if (c.next) {
      c.hand.push(c.next);
      c.next = null;
    }

    // Refill hand to 3 from pile if short (safety; normally next fills one slot)
    while (c.hand.length < HAND_SIZE && c.pile.length > 0) {
      shuffle(c.pile);
      c.hand.push(c.pile.pop());
    }

    // New next from shuffled pile
    if (c.pile.length > 0) {
      shuffle(c.pile);
      c.next = c.pile.pop();
    } else {
      c.next = null;
    }

    checkCombatEnd();
    renderCombat();
  }

  function endTurn() {
    const c = state.combat;
    if (c.over) return;
    logCombat("—— ターン終了 ——");

    // Enemy acts
    const e = c.enemy;
    const intent = e.intent;
    if (intent.kind === "attack") {
      let dmg = intent.value + e.strength;
      const p = c.player;
      if (p.block > 0) {
        const soaked = Math.min(p.block, dmg);
        p.block -= soaked;
        dmg -= soaked;
        logCombat("ブロックで " + soaked + " 防いだ");
      }
      if (dmg > 0) {
        p.hp = Math.max(0, p.hp - dmg);
        logCombat(e.name + " の攻撃！ " + dmg + " ダメージ", true);
      } else {
        logCombat(e.name + " の攻撃を完全に防いだ");
      }
    } else if (intent.kind === "block") {
      e.block += intent.value;
      logCombat(e.name + " は防御 +" + intent.value);
    } else if (intent.kind === "buff") {
      e.strength += intent.value;
      logCombat(e.name + " の力 +" + intent.value + "（現在 " + e.strength + "）");
    }

    // Block clears after enemy acts (per 正本)
    c.player.block = 0;
    e.block = 0;

    if (checkCombatEnd()) {
      renderCombat();
      return;
    }

    // Next player turn
    e.turn += 1;
    setIntent();
    c.player.ap = BASE_AP;
    // MP does NOT regen
    logCombat("—— あなたのターン（AP " + BASE_AP + "）——");
    renderCombat();
  }

  function checkCombatEnd() {
    const c = state.combat;
    if (c.enemy.hp <= 0) {
      c.over = true;
      state.player.hp = c.player.hp;
      if (c.isBoss) {
        showEnd(true, "三窓の主を打ち破った。窓の先は、まだ見えない。");
      } else {
        offerReward(c.enemy.gold);
      }
      return true;
    }
    if (c.player.hp <= 0) {
      c.over = true;
      state.player.hp = 0;
      showEnd(false, "HPが尽きた。窓は閉じた。");
      return true;
    }
    return false;
  }

  function renderCombat() {
    const c = state.combat;
    if (!c) return;
    const p = c.player;
    const e = c.enemy;
    $("p-hp").textContent = p.hp;
    $("p-hpmax").textContent = p.hpMax;
    $("p-block").textContent = p.block;
    $("p-ap").textContent = p.ap;
    $("p-mp").textContent = p.mp;
    $("p-stance").textContent = p.stance === "offense" ? "構え：攻め（攻撃+3）"
      : p.stance === "defense" ? "構え：守り（ブロック+2）" : "";
    $("e-name").textContent = e.name;
    $("e-hp").textContent = e.hp;
    $("e-hpmax").textContent = e.hpMax;
    $("e-block").textContent = e.block;
    $("e-intent").textContent = e.intent ? e.intent.label : "？";

    const handEl = $("hand");
    handEl.innerHTML = "";
    c.hand.forEach((card, i) => {
      handEl.appendChild(renderCardEl(card, {
        disabled: !canPlay(card),
        onClick: () => playCard(i),
      }));
    });

    const nextEl = $("next-card");
    nextEl.innerHTML = "";
    if (c.next) {
      nextEl.appendChild(renderCardEl(c.next, { next: true, static: true }));
    } else {
      const empty = document.createElement("div");
      empty.className = "card next static";
      empty.innerHTML = '<div class="cname">（なし）</div>';
      nextEl.appendChild(empty);
    }
    $("deck-count").textContent = c.pile.length;
    $("btn-end-turn").disabled = !!c.over;
  }

  // ——— Rewards ———
  function offerReward(gold) {
    state.player.gold += gold;
    const picks = pickRandom(REWARD_POOL, 3).map((id, i) => makeCard(id, "rw" + Date.now() + i));
    state.reward = picks;
    $("reward-gold").textContent = "金 +" + gold + "（所持 " + state.player.gold + "）";
    const box = $("reward-cards");
    box.innerHTML = "";
    picks.forEach((card) => {
      box.appendChild(renderCardEl(card, {
        onClick: () => {
          state.player.deck.push(card);
          state.reward = null;
          goMap();
        },
      }));
    });
    show("reward");
  }

  function pickRandom(pool, n) {
    const copy = pool.slice();
    shuffle(copy);
    return copy.slice(0, n);
  }

  // ——— Map ———
  function startRun() {
    state.player = freshPlayer();
    state.visited = [];
    state.available = ["c1"];
    state.mapPos = null;
    goMap();
  }

  function goMap() {
    show("map");
    $("map-hp").textContent = state.player.hp;
    $("map-hpmax").textContent = state.player.hpMax;
    $("map-gold").textContent = state.player.gold;
    $("map-decksize").textContent = state.player.deck.length;
    const box = $("map-nodes");
    box.innerHTML = "";
    MAP.forEach((node) => {
      const el = document.createElement("div");
      const done = state.visited.includes(node.id);
      const avail = state.available.includes(node.id);
      el.className = "map-node" + (done ? " done" : "") + (avail ? " current" : "");
      const icon = { combat: "⚔", elite: "⚔", boss: "☠", rest: "⛺", shop: "🏪", event: "?" }[node.type] || "·";
      el.innerHTML = '<span class="icon">' + icon + "</span><span>" + escapeHtml(node.label) +
        (done ? "（済）" : avail ? " ← 選択可" : "") + "</span>";
      if (avail && !done) {
        el.addEventListener("click", () => enterNode(node));
      }
      box.appendChild(el);
    });
  }

  function enterNode(node) {
    state.visited.push(node.id);
    state.available = node.next.slice();
    state.mapPos = node.id;
    if (node.type === "combat" || node.type === "elite" || node.type === "boss") {
      startCombat(node.enemy);
    } else if (node.type === "rest") {
      openRest();
    } else if (node.type === "shop") {
      openShop();
    } else if (node.type === "event") {
      openEvent();
    }
  }

  // ——— Rest ———
  function openRest() {
    $("rest-remove-list").classList.add("hidden");
    $("rest-remove-list").innerHTML = "";
    show("rest");
  }

  function restHeal() {
    const heal = Math.floor(state.player.hpMax * 0.3);
    state.player.hp = Math.min(state.player.hpMax, state.player.hp + heal);
    goMap();
  }

  function restRemoveMode() {
    const box = $("rest-remove-list");
    box.classList.remove("hidden");
    box.innerHTML = "";
    state.player.deck.forEach((card, i) => {
      box.appendChild(renderCardEl(card, {
        onClick: () => {
          state.player.deck.splice(i, 1);
          goMap();
        },
      }));
    });
  }

  // ——— Shop ———
  function openShop() {
    const wares = pickRandom(SHOP_POOL, 5).map((id, i) => {
      const card = makeCard(id, "sh" + Date.now() + i);
      const price = shopPrice(card);
      return { card, price, sold: false };
    });
    state.shop = { wares, removed: false };
    renderShop();
    show("shop");
    $("shop-log").innerHTML = "";
  }

  function shopPrice(card) {
    if (card.defId === "finisher") return 55;
    if (card.type === "stance") return 40;
    if (card.type === "tech") return 35;
    if (card.ap >= 2) return 40;
    return 28;
  }

  function renderShop() {
    $("shop-gold").textContent = state.player.gold;
    $("shop-hp").textContent = state.player.hp;
    const wares = $("shop-wares");
    wares.innerHTML = "";
    state.shop.wares.forEach((w, i) => {
      if (w.sold) return;
      wares.appendChild(renderCardEl(w.card, {
        price: w.price,
        disabled: state.player.gold < w.price,
        onClick: () => {
          if (state.player.gold < w.price) return;
          state.player.gold -= w.price;
          state.player.deck.push({ ...w.card, uid: "bought_" + Date.now() });
          w.sold = true;
          logShop("購入: " + w.card.name);
          renderShop();
        },
      }));
    });
    const rem = $("shop-remove");
    rem.innerHTML = "";
    if (!state.shop.removed) {
      state.player.deck.forEach((card, i) => {
        rem.appendChild(renderCardEl(card, {
          price: REMOVE_COST,
          disabled: state.player.gold < REMOVE_COST || state.player.deck.length <= 5,
          onClick: () => {
            if (state.player.gold < REMOVE_COST || state.player.deck.length <= 5) return;
            state.player.gold -= REMOVE_COST;
            const gone = state.player.deck.splice(i, 1)[0];
            state.shop.removed = true;
            logShop("削除: " + gone.name);
            renderShop();
          },
        }));
      });
    } else {
      rem.innerHTML = "<p class='hint'>この店での削除は済みです。</p>";
    }
  }

  // ——— Event ———
  function openEvent() {
    $("event-title").textContent = "古い祠";
    $("event-body").textContent = "苔むした石に窓が彫られている。触れると冷たい気配が走る。";
    const box = $("event-choices");
    box.innerHTML = "";
    const choices = [
      {
        label: "祈る（HP +10、金 -10）",
        run: () => {
          if (state.player.gold >= 10) state.player.gold -= 10;
          state.player.hp = Math.min(state.player.hpMax, state.player.hp + 10);
          goMap();
        },
      },
      {
        label: "気を凝らす（MPの種：蓄気を得る）",
        run: () => {
          state.player.deck.push(makeCard("store", "ev" + Date.now()));
          goMap();
        },
      },
      {
        label: "離れる",
        run: () => goMap(),
      },
    ];
    choices.forEach((ch) => {
      const b = document.createElement("button");
      b.className = "btn";
      b.textContent = ch.label;
      b.addEventListener("click", ch.run);
      box.appendChild(b);
    });
    show("event");
  }

  function showEnd(won, body) {
    $("end-title").textContent = won ? "勝利" : "敗北";
    $("end-body").textContent = body;
    show("end");
  }

  // ——— Wire buttons ———
  function bind() {
    $("btn-start").addEventListener("click", startRun);
    $("btn-end-turn").addEventListener("click", endTurn);
    $("btn-skip-reward").addEventListener("click", () => { state.reward = null; goMap(); });
    $("btn-rest-heal").addEventListener("click", restHeal);
    $("btn-rest-remove").addEventListener("click", restRemoveMode);
    $("btn-leave-shop").addEventListener("click", goMap);
    $("btn-restart").addEventListener("click", () => show("title"));
  }

  // Expose for smoke tests
  window.Mado3 = {
    state,
    startRun,
    playCard,
    endTurn,
    HAND_SIZE,
    BASE_AP,
    api,
    _testDealAndPlay() {
      startRun();
      enterNode(MAP[0]);
      const c = state.combat;
      const beforeHand = c.hand.length;
      const beforeNext = c.next && c.next.uid;
      const playable = c.hand.findIndex((card) => canPlay(card));
      if (playable < 0) return { ok: false, reason: "no playable" };
      const playedUid = c.hand[playable].uid;
      playCard(playable);
      const after = state.combat;
      return {
        ok:
          after.hand.length === HAND_SIZE &&
          after.next != null &&
          after.next.uid !== beforeNext &&
          after.pile.some((x) => x.uid === playedUid) &&
          !after.hand.some((x) => x.uid === playedUid),
        hand: after.hand.length,
        next: !!after.next,
        playedBackInPile: after.pile.some((x) => x.uid === playedUid),
        beforeHand,
      };
    },
  };

  bind();
  show("title");
})();
