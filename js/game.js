/**
 * 窓3 — browser text prototype
 * Core: hand 3 + next 1 visible; no discard; AP resets, MP does not.
 */
(function () {
  "use strict";

  const MAX_HP = 70;
  const BASE_AP = 3;
  const HAND_SIZE = 3;
  const REMOVE_COST = 20;
  function removeCostNow() {
    const n = state.player && state.player.deck ? state.player.deck.length : 12;
    if (n >= 16) return 12;
    if (n >= 14) return 15;
    return REMOVE_COST;
  }

  /** Map: short 1-act with one branch */
  /** 1-act map with 2–3 branches; ~10–12 nodes possible per path */
  const MAP = [
    { id: "c1", type: "combat", label: "戦闘：スライム", enemy: "slime", layer: 0, next: ["c2a", "ev1"] },
    { id: "c2a", type: "combat", label: "戦闘：殻虫", enemy: "shellbug", layer: 1, next: ["c3", "rest1"] },
    { id: "ev1", type: "event", label: "出来事", layer: 1, next: ["c2b", "c2c"] },
    { id: "c2b", type: "combat", label: "戦闘：ネズミの群れ", enemy: "dual_rats", layer: 2, next: ["rest1"] },
    { id: "c2c", type: "combat", label: "戦闘：見習い騎士", enemy: "knight", layer: 2, next: ["rest1"] },
    { id: "c3", type: "combat", label: "戦闘：影とネズミ", enemy: "rat_shade", layer: 2, next: ["rest1"] },
    { id: "rest1", type: "rest", label: "休憩所", layer: 3, next: ["shop1", "ev2"] },
    { id: "shop1", type: "shop", label: "店", layer: 4, next: ["elite"] },
    { id: "ev2", type: "event", label: "出来事", layer: 4, next: ["elite"] },
    { id: "elite", type: "elite", label: "エリート：窓守り", enemy: "elite", layer: 5, next: ["rest2", "shop2"] },
    { id: "rest2", type: "rest", label: "最後の篝火", layer: 6, next: ["boss"] },
    { id: "shop2", type: "shop", label: "隠し商会", layer: 6, next: ["boss"] },
    { id: "boss", type: "boss", label: "ボス：三窓の主", enemy: "boss", layer: 7, next: [] },
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
      gold: 55,
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

  function makeEnemyInst(def) {
    return {
      id: def.id,
      name: def.name,
      emoji: def.emoji || "👹",
      hp: def.hp,
      hpMax: def.hp,
      block: 0,
      strength: 0,
      weak: 0,
      pattern: def.pattern,
      turn: 0,
      intent: null,
    };
  }

  function flashHurt() {
    const panel = document.querySelector && document.querySelector("#screen-combat .actor.player");
    if (!panel || !panel.classList) return;
    panel.classList.remove("hurt-flash");
    void panel.offsetWidth;
    panel.classList.add("hurt-flash");
  }

  function applyEliteMod(mod) {
    const c = state.combat;
    if (!c) return;
    if (mod === "thick") {
      c.enemies.forEach((e) => { if (e.hp > 0) e.block += 10; });
      logCombat("厚殻：敵の初期ブロック +10");
    } else if (mod === "fog") {
      // Force a free redraw of next — window is unreliable at open
      if (c.next) {
        api.redrawNext({ noRead: true });
        if (c.windowResonance > 0) c.windowResonance -= 1;
      }
      logCombat("窓曇り：開幕の次が霞んだ");
    } else if (mod === "drain") {
      c.drainMpOnHit = true;
      logCombat("気奪い：攻撃を受けると MP -1");
    }
  }

  function startCombat(enemyId) {
    const pack = (typeof ENEMY_PACKS !== "undefined" && ENEMY_PACKS[enemyId]) || null;
    let enemies;
    let gold;
    let packName;
    if (pack) {
      enemies = pack.members.map((id) => makeEnemyInst(ENEMIES[id]));
      // Distinguish duplicate names
      if (enemies.length > 1 && enemies[0].id === enemies[1].id) {
        enemies[0].name = enemies[0].name + " A";
        enemies[1].name = enemies[1].name + " B";
      }
      gold = pack.gold;
      packName = pack.name;
    } else {
      const def = ENEMIES[enemyId];
      enemies = [makeEnemyInst(def)];
      gold = def.gold;
      packName = def.name;
    }
    const pile = shuffle(state.player.deck.map((c) => ({ ...c })));
    const hand = [];
    for (let i = 0; i < HAND_SIZE && pile.length; i++) hand.push(pile.pop());
    const next = pile.length ? pile.pop() : null;

    state.pendingSwapSelect = false;
    state.combat = {
      enemies,
      targetIndex: 0,
      get enemy() { return this.enemies[this.targetIndex] || this.enemies.find((e) => e.hp > 0) || this.enemies[0]; },
      encounterGold: gold,
      encounterName: packName,
      encounterRank: "normal",
      player: {
        hp: state.player.hp,
        hpMax: state.player.hpMax,
        block: 0,
        ap: BASE_AP,
        mp: (state.flags && state.flags.meditate && state.flags.meditate.mp) || 0,
        stance: null,
      },
      hand,
      next,
      pile,
      over: false,
      isBoss: enemyId === "boss",
      windowResonance: 0,
      eliteMod: null,
      isPack: !!pack,
      readAttackBonus: 0,
      readMpGranted: false,
      readBlockBonus: 0,
    };
    // Ensure target is living
    retargetIfNeeded();
    $("combat-log").innerHTML = "";
    setAllIntents();
    // Elite modifiers
    const primaryDef = pack ? null : ENEMIES[enemyId];
    const mod = (primaryDef && primaryDef.mod) || null;
    if (mod) {
      state.combat.eliteMod = mod;
      applyEliteMod(mod);
    } else if (enemyId === "elite") {
      // base elite: random light mod for variety
      const mods = ["thick", "drain", null];
      const m = mods[Math.floor(Math.random() * mods.length)];
      if (m) {
        state.combat.eliteMod = m;
        applyEliteMod(m);
      }
    }
    // Rank for UI (紬): boss > elite (mod / pool / node) > normal
    if (enemyId === "boss") state.combat.encounterRank = "boss";
    else if (state.combat.eliteMod || enemyId === "elite" || (typeof ELITE_POOL !== "undefined" && ELITE_POOL.indexOf(enemyId) >= 0))
      state.combat.encounterRank = "elite";
    else state.combat.encounterRank = "normal";
    show("combat");
    try {
      const hdr = document.querySelector && document.querySelector("#screen-combat .combat-header");
      if (hdr && hdr.classList) hdr.classList.toggle("pack-fight", !!pack);
    } catch (e) { /* headless */ }
    renderCombat();
    logCombat(packName + " が現れた！", true);
    if (state.combat.eliteMod) {
      const labels = { fog: "特性：窓曇り（開始時に次を強制引き直し）", drain: "特性：気奪い（攻撃がMPを1奪う）", thick: "特性：厚殻（開始時に追加ブロック）" };
      logCombat(labels[state.combat.eliteMod] || ("特性：" + state.combat.eliteMod), true);
    }
    logCombat("ヒント: 次を見て、今切るか蓄気（MP）するか。大攻撃の前は防御を窓から引き込め。");
    if (enemyId === "slime") {
      logCombat("初戦: 膜のターンは斬撃が弱い。蓄気／気吸いでMPを貯め、大殴りの前は次を読め。", true);
    }
    if (enemies.length > 1) logCombat("複数体：カードは選択中の敵へ。クリックでターゲット変更。");
    if (state.flags && state.flags.meditate) {
      if (state.combat.player.mp > 0) logCombat("窓瞑想の余波：初期 MP " + state.combat.player.mp, true);
      if (state.flags.meditate.redrawNext) {
        api.redrawNext({ noRead: true });
        logCombat("窓瞑想：戦闘開始の次を引き直した", true);
      }
      state.flags.meditate = null; // consume
      renderCombat();
    }
  }

  function livingEnemies() {
    return state.combat.enemies.filter((e) => e.hp > 0);
  }

  function retargetIfNeeded() {
    const c = state.combat;
    if (!c.enemies[c.targetIndex] || c.enemies[c.targetIndex].hp <= 0) {
      const i = c.enemies.findIndex((e) => e.hp > 0);
      c.targetIndex = i >= 0 ? i : 0;
    }
  }

  function setIntentFor(e) {
    const step = e.pattern[e.turn % e.pattern.length];
    e.intent = { ...step };
    if (step.kind === "attack") {
      let dmg = step.value + e.strength;
      if (e.weak > 0) dmg = Math.floor(dmg * 0.75);
      const big = dmg >= 14 ? "⚠" : "";
      e.intent.label = "⚔ " + big + "攻撃 " + dmg + (e.weak > 0 ? "（弱体）" : "");
    } else if (step.kind === "block") {
      e.intent.label = "🛡 " + (step.label || ("防御 " + step.value));
    } else if (step.kind === "buff") {
      e.intent.label = "⬆ " + (step.label || ("強化 " + step.value));
    }
  }

  function setAllIntents() {
    state.combat.enemies.forEach((e) => { if (e.hp > 0) setIntentFor(e); });
  }

  function setIntent() { setAllIntents(); }

  function attackBonus() {
    return state.combat.player.stance === "offense" ? 3 : 0;
  }
  function blockBonus() {
    return state.combat.player.stance === "defense" ? 2 : 0;
  }


  function enemyIntentNeeds() {
    const e = state.combat && state.combat.enemy;
    if (!e || !e.intent) return null;
    if (e.intent.kind === "attack") return "block";
    if (e.intent.kind === "block") return "attack";
    if (e.block >= 8) return "attack";
    return null;
  }

  function cardFillsNeed(card, need) {
    if (!card || !need) return false;
    if (need === "block") return card.type === "block" || card.defId === "guard" || card.defId === "iron";
    if (need === "attack") return card.type === "attack" || card.defId === "pierce" || card.defId === "finisher" || card.defId === "burst";
    return false;
  }

  function readWindowFeedback(card, source) {
    const need = enemyIntentNeeds();
    if (!card) { logCombat(source + "：次なし"); return false; }
    if (!need) {
      logCombat(source + "：次は『" + card.name + "』（意図と中立）");
      return false;
    }
    const ok = cardFillsNeed(card, need);
    if (ok) {
      if (need === "block") {
        state.combat.player.block += 2;
        state.combat.readBlockBonus = (state.combat.readBlockBonus || 0) + 2;
        logCombat(source + "：読めた！ 次『" + card.name + "』は大攻撃に合う → ブロック+2", true);
      } else {
        state.combat.readAttackBonus = (state.combat.readAttackBonus || 0) + 2;
        logCombat(source + "：読めた！ 次『" + card.name + "』は殻向き → 次の攻撃+2", true);
      }
      // Core amplify (R14): first clean read each combat also stores MP
      if (!state.combat.readMpGranted) {
        state.combat.player.mp += 1;
        state.combat.readMpGranted = true;
        logCombat("窓の余韻：MP +1（この戦闘で最初の「読めた」）", true);
      }
      renderCombat();
      return true;
    }
    // Consolation: dig still teaches without feeling like pure AP tax
    state.combat.player.block += 1;
    logCombat(source + "：次『" + card.name + "』は不一致 — 探りブロック+1", true);
    return false;
  }

  const api = {
    dealDamageToEnemy(n, opts) {
      opts = opts || {};
      const e = state.combat.enemy;
      let dmg = n;
      let note = "";
      if (state.combat.readAttackBonus) {
        dmg += state.combat.readAttackBonus;
        note += "（読み+" + state.combat.readAttackBonus + "）";
        state.combat.readAttackBonus = 0;
      }
      if (!opts.ignoreBlock && e.block > 0) {
        const soaked = Math.min(e.block, dmg);
        e.block -= soaked;
        dmg -= soaked;
      } else if (opts.ignoreBlock) {
        note += "（貫通）";
      }
      e.hp = Math.max(0, e.hp - dmg);
      logCombat(e.name + " に " + dmg + " ダメージ" + note + (e.hp <= 0 ? " — 撃破！" : ""));
      if (e.hp <= 0) retargetIfNeeded();
    },
    applyWeak(turns) {
      const e = state.combat.enemy;
      e.weak = (e.weak || 0) + turns;
      logCombat(e.name + " に弱体 +" + turns + "（計 " + e.weak + "）");
    },
    gainBlock(n) {
      state.combat.player.block += n;
      logCombat("ブロック +" + n);
    },
    redrawNext(opts) {
      opts = opts || {};
      const c = state.combat;
      if (!c.next) { logCombat("次がない"); return; }
      c.pile.push(c.next);
      shuffle(c.pile);
      c.next = c.pile.length ? c.pile.pop() : null;
      if (!opts.noRead) readWindowFeedback(c.next, "先読み");
      else logCombat("次を入れ替えた");
      if (c.windowResonance != null) c.windowResonance += 1;
    },
    swapNextWithHand(index) {
      const c = state.combat;
      if (!c.next || !c.hand[index]) { logCombat("入れ替えできない"); return; }
      const tmp = c.hand[index];
      c.hand[index] = c.next;
      c.next = tmp;
      logCombat("次と手札を入れ替えた → 手札に『" + c.hand[index].name + "』、次は『" + c.next.name + "』");
      readWindowFeedback(c.next, "窓入替");
      if (c.windowResonance != null) c.windowResonance += 1;
    },
    beginSwapPick() {
      const c = state.combat;
      if (!c.next || !c.hand.length) { logCombat("入れ替えできない"); return; }
      state.pendingSwapSelect = true;
      logCombat("入れ替える手札をクリック", true);
      renderCombat();
    },
    buryNext() {
      const c = state.combat;
      if (!c.next) { logCombat("次がない"); return; }
      // send next to bottom of pile, draw new next
      c.pile.unshift(c.next);
      c.next = c.pile.length ? c.pile.pop() : null;
      logCombat("次を山の底へ埋めた");
      if (c.windowResonance != null) c.windowResonance += 1;
    },
    log: logCombat,
    readWindowFeedback,
    enemyIntentNeeds,
    _nextCard() { return state.combat && state.combat.next; },
    redrawNextIfMismatch() {
      const need = enemyIntentNeeds();
      const n = state.combat && state.combat.next;
      if (!n) { logCombat("集中：次なし"); return; }
      if (need && cardFillsNeed(n, need)) {
        readWindowFeedback(n, "集中");
      } else {
        logCombat("集中：次が合わないので引き直し");
        this.redrawNext();
      }
    },
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

    // 窓選替: pause until player picks a hand card to swap with next
    if (state.pendingSwapSelect) {
      checkCombatEnd();
      renderCombat();
      return;
    }

    finishPlayRefill();
  }

  function finishPlayRefill() {
    const c = state.combat;
    if (!c || c.over) return;
    // Visible next enters hand
    if (c.next) {
      c.hand.push(c.next);
      c.next = null;
    }
    while (c.hand.length < HAND_SIZE && c.pile.length > 0) {
      shuffle(c.pile);
      c.hand.push(c.pile.pop());
    }
    if (!c.next && c.pile.length > 0) {
      shuffle(c.pile);
      c.next = c.pile.pop();
    }
    checkCombatEnd();
    renderCombat();
  }

  function completeSwapPick(handIndex) {
    if (!state.pendingSwapSelect || !state.combat) return;
    api.swapNextWithHand(handIndex);
    state.pendingSwapSelect = false;
    logCombat("窓選替完了", true);
    // After pick: refill without forcing the (new) next into hand — keep window readable
    const c = state.combat;
    while (c.hand.length < HAND_SIZE && c.pile.length > 0) {
      shuffle(c.pile);
      c.hand.push(c.pile.pop());
    }
    if (!c.next && c.pile.length > 0) {
      shuffle(c.pile);
      c.next = c.pile.pop();
    }
    checkCombatEnd();
    renderCombat();
  }

  function resolveEnemyAct(e) {
    e.block = 0; // clear previous block at start of their act
    const intent = e.intent;
    if (!intent) return;
    if (intent.kind === "attack") {
      let dmg = intent.value + e.strength;
      if (e.weak > 0) {
        dmg = Math.floor(dmg * 0.75);
        logCombat(e.name + "：弱体で攻撃減衰");
      }
      const p = state.combat.player;
      if (p.block > 0) {
        const soaked = Math.min(p.block, dmg);
        p.block -= soaked;
        dmg -= soaked;
        logCombat("ブロックで " + soaked + " 防いだ");
      }
      if (dmg > 0) {
        p.hp = Math.max(0, p.hp - dmg);
        logCombat(e.name + " の攻撃！ " + dmg + " ダメージ", true);
        flashHurt();
        if (state.combat.drainMpOnHit && p.mp > 0) {
          p.mp -= 1;
          logCombat("気奪い！ MP -1（残り " + p.mp + "）", true);
        }
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
  }

  function endTurn() {
    const c = state.combat;
    if (c.over) return;
    logCombat("—— ターン終了 ——");

    livingEnemies().forEach(resolveEnemyAct);

    // Player block clears after all enemy acts
    c.player.block = 0;

    if (checkCombatEnd()) {
      renderCombat();
      return;
    }

    livingEnemies().forEach((e) => {
      if (e.weak > 0) {
        e.weak -= 1;
        if (e.weak > 0) logCombat(e.name + " 弱体残り " + e.weak);
        else logCombat(e.name + " の弱体が切れた");
      }
      e.turn += 1;
    });
    setAllIntents();
    c.player.ap = BASE_AP;
    logCombat("—— あなたのターン（AP " + BASE_AP + "）——");
    renderCombat();
  }

  function checkCombatEnd() {
    const c = state.combat;
    retargetIfNeeded();
    if (livingEnemies().length === 0) {
      c.over = true;
      state.player.hp = c.player.hp;
      if (c.isBoss) {
        showEnd(true, "三窓の主を打ち破った。窓の先は、まだ見えない。", {
          cause: "boss",
          tip: "先読みとMPの割り振りが通った。",
        });
      } else {
        offerReward(c.encounterGold || 0);
      }
      return true;
    }
    if (c.player.hp <= 0) {
      c.over = true;
      state.player.hp = 0;
      const killer = c.enemies.find((e) => e.intent && e.intent.kind === "attack") || c.enemy;
      const intent = killer && killer.intent ? killer.intent.label : "攻撃";
      showEnd(false, "HPが尽きた。最後の意図は「" + intent + "」。", {
        cause: "hp0",
        tip: "大攻撃の前に次を読め。膜のターンは蓄気／先読み。店に頼らず報酬のMP路線を拾え。",
      });
      return true;
    }
    return false;
  }

  function renderCombat() {
    const c = state.combat;
    if (!c) return;
    retargetIfNeeded();
    const p = c.player;
    const e = c.enemy;
    $("p-hp").textContent = p.hp;
    $("p-hpmax").textContent = p.hpMax;
    $("p-block").textContent = p.block;
    $("p-ap").textContent = p.ap;
    $("p-mp").textContent = p.mp;
    const pbar = $("p-hpbar");
    if (pbar) pbar.style.width = Math.max(0, Math.min(100, (p.hp / p.hpMax) * 100)) + "%";
    $("p-stance").textContent = p.stance === "offense" ? "構え：攻め（攻撃+3）"
      : p.stance === "defense" ? "構え：守り（ブロック+2）" : "";
    // Review3: board-visible 「読めた」 buffs (not log-only)
    let buffEl = $("window-buffs");
    if (!buffEl) {
      const host = document.querySelector && document.querySelector("#screen-combat .actor.player");
      if (host) {
        buffEl = document.createElement("div");
        buffEl.id = "window-buffs";
        buffEl.className = "window-buffs";
        host.appendChild(buffEl);
      }
    }
    if (buffEl) {
      const parts = [];
      if (c.readAttackBonus > 0) parts.push('<span class="wbuff atk">次攻撃 +' + c.readAttackBonus + "</span>");
      if (c.readMpGranted) parts.push('<span class="wbuff mp">余韻 MP済</span>');
      else parts.push('<span class="wbuff mp-pending">余韻まだ</span>');
      if (c.readBlockBonus > 0) parts.push('<span class="wbuff blk">読了ブロック +' + c.readBlockBonus + "</span>");
      buffEl.innerHTML = parts.length ? parts.join(" ") : '<span class="wbuff muted">窓：未読</span>';
    }
    // Multi-enemy panel
    const list = $("enemy-list");
    if (list) {
      list.innerHTML = "";
      c.enemies.forEach((en, idx) => {
        const card = document.createElement("div");
        const dead = en.hp <= 0;
        const targeted = idx === c.targetIndex && !dead;
        const rank = c.encounterRank || "normal";
        const packCls = c.isPack ? " pack-member" : "";
        card.className = "enemy-card rank-" + rank + packCls + (targeted ? " targeted" : "") + (dead ? " dead" : "");
        const intentLabel = dead ? "撃破" : (en.intent ? en.intent.label : "？");
        const heavy = !dead && en.intent && en.intent.kind === "attack" && (en.intent.value + (en.strength || 0)) >= 14;
        const weakTxt = en.weak > 0 ? "弱体" + en.weak : "";
        const pct = Math.max(0, Math.min(100, (en.hp / en.hpMax) * 100));
        const rankLabel = rank === "boss" ? "BOSS" : rank === "elite" ? "ELITE" : "";
        card.innerHTML =
          '<div class="ename">' + escapeHtml((en.emoji ? en.emoji + " " : "") + en.name) + "</div>" +
          (rankLabel ? '<div class="rank-tag">' + rankLabel + "</div>" : "") +
          '<div class="ehp">HP <strong>' + en.hp + "</strong>/" + en.hpMax +
          " 🛡 <strong>" + en.block + "</strong></div>" +
          '<div class="ehpbar"><div class="hp-bar-fill enemy" style="width:' + pct + '%"></div></div>' +
          '<div class="eintent' + (heavy ? " heavy" : "") + '">' + escapeHtml(intentLabel) + "</div>" +
          (weakTxt ? '<div class="weak-status">' + weakTxt + "</div>" : "") +
          (targeted ? '<div class="target-tag">ターゲット</div>' : "");
        if (!dead) {
          card.addEventListener("click", () => {
            c.targetIndex = idx;
            renderCombat();
          });
        }
        list.appendChild(card);
      });
    }
    // Legacy single fields (keep in sync with target)
    $("e-name").textContent = (e.emoji ? e.emoji + " " : "") + e.name;
    $("e-hp").textContent = e.hp;
    $("e-hpmax").textContent = e.hpMax;
    $("e-block").textContent = e.block;
    $("e-intent").textContent = e.intent ? e.intent.label : "？";
    const weakEl = $("e-weak");
    if (weakEl) weakEl.textContent = e.weak > 0 ? "弱体 " + e.weak : "";

    const handEl = $("hand");
    handEl.innerHTML = "";
    c.hand.forEach((card, i) => {
      if (state.pendingSwapSelect) {
        handEl.appendChild(renderCardEl(card, {
          onClick: () => completeSwapPick(i),
        }));
      } else {
        handEl.appendChild(renderCardEl(card, {
          disabled: !canPlay(card),
          onClick: () => playCard(i),
        }));
      }
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
  /** Cards that complete store→spend (MP sinks / strong window spends) */
  const MP_SPEND_IDS = ["finisher", "burst", "pierce", "weaken", "scry_deep", "swap_pick", "bury_next", "redraw_next_mp", "swap_window"];

  function deckHasMpSpend() {
    return state.player.deck.some((c) => MP_SPEND_IDS.includes(c.defId));
  }

  function offerReward(gold) {
    state.player.gold += gold;
    // Guarantee ≥1 MP-payoff until the run owns a store→spend piece (not shop-gated)
    let ids;
    if (!state.flags) state.flags = {};
    const needSpend = !deckHasMpSpend();
    const deckLen = state.player.deck.length;
    // Review3#1 anti-bloat: fat decks get 2 picks + skip pressure (window dies at ~16)
    const fat = deckLen >= 14;
    const pickCount = fat ? 2 : 3;
    const spendPool = (typeof SPEND_REWARD_POOL !== "undefined" && SPEND_REWARD_POOL.length)
      ? SPEND_REWARD_POOL : (typeof EARLY_REWARD_MP !== "undefined" ? EARLY_REWARD_MP : ["pierce", "finisher"]);
    // True spends only for the forced slot (no channel/siphon generators)
    const trueSpend = spendPool.filter((id) => MP_SPEND_IDS.includes(id));
    if (needSpend) {
      const forcePool = trueSpend.length ? trueSpend : spendPool;
      const mpPick = pickRandom(forcePool, 1)[0];
      const restPool = REWARD_POOL.filter((id) => id !== mpPick && (fat ? MP_SPEND_IDS.includes(id) || id === "channel" : true));
      ids = [mpPick].concat(pickRandom(restPool, Math.max(0, pickCount - 1)));
      shuffle(ids);
      state.flags.firstRewardDone = true;
      state.flags.mpPayoffGuaranteed = true;
    } else {
      // Prefer window/spend over pure bulk when fat
      const pool = fat ? REWARD_POOL.filter((id) => MP_SPEND_IDS.includes(id) || id === "redraw_next" || id === "channel") : REWARD_POOL;
      ids = pickRandom(pool.length ? pool : REWARD_POOL, pickCount);
    }
    const picks = ids.map((id, i) => makeCard(id, "rw" + Date.now() + i));
    state.reward = picks;
    let tip = needSpend ? "　※MPの使い道を1枚は拾え（店不要）" : "";
    if (fat) tip += "　※山が厚い（" + deckLen + "枚）— スキップ／削除で窓を守れ";
    $("reward-gold").textContent = "金 +" + gold + "（所持 " + state.player.gold + "）" + tip;
    const box = $("reward-cards");
    box.innerHTML = "";
    picks.forEach((card) => {
      const isSpend = MP_SPEND_IDS.includes(card.defId);
      box.appendChild(renderCardEl(card, {
        onClick: () => {
          state.player.deck.push(card);
          state.reward = null;
          goMap();
        },
      }));
      if (isSpend && box.lastChild) {
        const tag = document.createElement("div");
        tag.className = "price";
        tag.textContent = needSpend ? "MP路線" : "MP消費";
        box.lastChild.appendChild(tag);
        if (box.lastChild.classList) box.lastChild.classList.add("mp-route");
      }
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
    state.flags = { firstRewardDone: false, seenEvents: [], meditate: null };
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
    const maxLayer = MAP.reduce((m, n) => Math.max(m, n.layer || 0), 0);
    for (let layer = 0; layer <= maxLayer; layer++) {
      const row = document.createElement("div");
      let depthCls = "depth-mid";
      if (layer <= 1) depthCls = "depth-near";
      else if (layer >= maxLayer) depthCls = "depth-boss";
      else if (layer >= maxLayer - 2) depthCls = "depth-far";
      row.className = "map-layer " + depthCls;
      const nodes = MAP.filter((n) => (n.layer || 0) === layer);
      nodes.forEach((node) => {
        const el = document.createElement("div");
        const done = state.visited.includes(node.id);
        const avail = state.available.includes(node.id);
        const locked = !done && !avail;
        el.className = "map-node type-" + node.type + (done ? " done" : "") + (avail ? " current" : "") + (locked ? " locked" : "");
        const icon = { combat: "⚔", elite: "⚔", boss: "☠", rest: "⛺", shop: "🏪", event: "❓" }[node.type] || "·";
        el.innerHTML = '<span class="icon">' + icon + '</span><span class="mlabel">' + escapeHtml(node.label) +
          (done ? " ✓" : avail ? " ←" : "") + '</span>';
        if (avail && !done) {
          el.addEventListener("click", () => enterNode(node));
        }
        row.appendChild(el);
      });
      box.appendChild(row);
    }
  }

  function enterNode(node) {
    state.visited.push(node.id);
    state.available = node.next.slice();
    state.mapPos = node.id;
    if (node.type === "combat" || node.type === "elite" || node.type === "boss") {
      let enemyId = node.enemy;
      if (node.type === "elite" && typeof ELITE_POOL !== "undefined" && ELITE_POOL.length) {
        enemyId = ELITE_POOL[Math.floor(Math.random() * ELITE_POOL.length)];
      }
      startCombat(enemyId);
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
    const gift = $("btn-rest-gift");
    if (gift) {
      const showGift = !deckHasMpSpend();
      gift.classList.toggle("hidden", !showGift);
      gift.disabled = !showGift;
    }
    show("rest");
  }

  function restGiftMp() {
    // Guaranteed mid-run store→spend without shop: pick channel or pierce or finisher
    const picks = ["pierce", "finisher", "redraw_next_mp", "swap_window", "weaken"];
    const id = picks[Math.floor(Math.random() * picks.length)];
    state.player.deck.push(makeCard(id, "gift" + Date.now()));
    if (!state.flags) state.flags = {};
    state.flags.restGiftTaken = true;
    goMap();
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

  function restMeditate() {
    if (state.player.hp <= 8) {
      // still allow but leave at 1
      state.player.hp = 1;
    } else {
      state.player.hp -= 8;
    }
    if (!state.flags) state.flags = {};
    state.flags.meditate = { mp: 2, redrawNext: true };
    goMap();
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
    const fat = state.player.deck.length >= 14;
    logShop(fat
      ? "店主：「山が厚いな。削除で『次』を信じやすくしろ。」"
      : "店主：「買うより、まず要らない1枚を削るのも手だ。」");
  }

  function shopPrice(card) {
    // Review3/R21: MP spends affordable; avoid filler traps priced like payoffs
    if (card.defId === "finisher" || card.defId === "burst") return 48;
    if (card.defId === "pierce" || card.defId === "weaken") return 36;
    if (card.defId === "channel") return 28;
    if (card.defId === "scry_deep") return 34;
    if (card.defId === "swap_pick" || card.defId === "bury_next") return 34;
    if (card.defId === "redraw_next_mp" || card.defId === "swap_window") return 30;
    if (card.defId === "redraw_next" || card.defId === "focus") return 22;
    if (card.type === "stance") return 36;
    if (card.type === "tech") return 30;
    if (card.ap >= 2) return 36;
    return 26;
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
    const rc = removeCostNow();
    if (!state.shop.removed) {
      const teach = document.createElement("p");
      teach.className = "hint";
      teach.textContent = "削除 " + rc + "金（山が厚いほど安い）。薄い山＝『次』が読める。";
      rem.appendChild(teach);
      state.player.deck.forEach((card, i) => {
        rem.appendChild(renderCardEl(card, {
          price: rc,
          disabled: state.player.gold < rc || state.player.deck.length <= 5,
          onClick: () => {
            const cost = removeCostNow();
            if (state.player.gold < cost || state.player.deck.length <= 5) return;
            state.player.gold -= cost;
            const gone = state.player.deck.splice(i, 1)[0];
            state.shop.removed = true;
            logShop("削除: " + gone.name + "（-" + cost + "金）— 窓が澄んだ");
            renderShop();
          },
        }));
      });
    } else {
      rem.innerHTML = "<p class='hint'>この店での削除は済みです。</p>";
    }
  }

  // ——— Event ———
  const EVENT_DEFS = [
    {
      id: "shrine",
      title: "古い祠",
      body: "苔むした石に窓が彫られている。触れると冷たい気配が走る。",
      choices: [
        {
          label: "祈る（HP +10、金 -10）— 生存を買う",
          run: (st) => {
            if (st.player.gold >= 10) st.player.gold -= 10;
            else st.player.gold = 0;
            st.player.hp = Math.min(st.player.hpMax, st.player.hp + 10);
          },
        },
        {
          label: "気を凝らす（導気を追加）— APでMPを貯める道",
          run: (st) => { st.player.deck.push(makeCard("channel", "ev" + Date.now())); },
        },
        {
          label: "窓に手を入れる（HP -8、深読みを得る）— MPで窓を読む",
          run: (st) => {
            st.player.hp = Math.max(1, st.player.hp - 8);
            st.player.deck.push(makeCard("redraw_next_mp", "ev" + Date.now()));
          },
        },
        {
          label: "斬撃を1枚捧げ、先読みを得る（山を薄く）",
          run: (st) => {
            const i = st.player.deck.findIndex((c) => c.defId === "slash");
            if (i >= 0) st.player.deck.splice(i, 1);
            st.player.deck.push(makeCard("redraw_next", "ev" + Date.now()));
          },
        },
      ],
    },
    {
      id: "merchant_ghost",
      title: "行商人の亡霊",
      body: "「金か、決め手か、荷物か——窓を濁らせるな。」影が笑う。",
      choices: [
        {
          label: "金を掴む（+35金）— 店の削除用",
          run: (st) => { st.player.gold += 35; },
        },
        {
          label: "気を貰う（決壊を追加、金 -15）— MP決め手",
          run: (st) => {
            if (st.player.gold >= 15) st.player.gold -= 15;
            else st.player.gold = 0;
            st.player.deck.push(makeCard("finisher", "ev" + Date.now()));
          },
        },
        {
          label: "荷物を減らす（無料で山から1枚削除）— 反肥大",
          run: (st) => { st.pendingEventRemove = true; },
        },
        {
          label: "窓札を乞う（窓入替を得る、HP -6）",
          run: (st) => {
            st.player.hp = Math.max(1, st.player.hp - 6);
            st.player.deck.push(makeCard("swap_window", "ev" + Date.now()));
          },
        },
      ],
    },
    {
      id: "mirror_well",
      title: "鏡の井戸",
      body: "水面に次の一手だけが映る。代償を払えば、割く先を書き換えられる。",
      choices: [
        {
          label: "映す（HP -5、貫通を得る）— 殻向けMP消費",
          run: (st) => {
            st.player.hp = Math.max(1, st.player.hp - 5);
            st.player.deck.push(makeCard("pierce", "ev" + Date.now()));
          },
        },
        {
          label: "汲む（最大HP -4、金 +30）— 経済",
          run: (st) => {
            st.player.hpMax = Math.max(40, st.player.hpMax - 4);
            if (st.player.hp > st.player.hpMax) st.player.hp = st.player.hpMax;
            st.player.gold += 30;
          },
        },
        {
          label: "砕く（弱体の印＋斬撃1枚削除）— MP路線＋間引き",
          run: (st) => {
            st.player.deck.push(makeCard("weaken", "ev" + Date.now()));
            const i = st.player.deck.findIndex((c) => c.defId === "slash");
            if (i >= 0) st.player.deck.splice(i, 1);
          },
        },
        {
          label: "二度映す（二度先読みを得る、金 -25）",
          run: (st) => {
            if (st.player.gold >= 25) st.player.gold -= 25;
            else st.player.gold = 0;
            st.player.deck.push(makeCard("scry_deep", "ev" + Date.now()));
          },
        },
      ],
    },
    {
      id: "camp_thief",
      title: "盗賊の残り火",
      body: "誰かが急いで逃げた跡。袋と、刺さった札が残っている。",
      choices: [
        {
          label: "袋を漁る（金 +28、HP -8）",
          run: (st) => {
            st.player.gold += 28;
            st.player.hp = Math.max(1, st.player.hp - 8);
          },
        },
        {
          label: "札を読む（窓選替を得る）— AP+MPで窓を選ぶ",
          run: (st) => { st.player.deck.push(makeCard("swap_pick", "ev" + Date.now())); },
        },
        {
          label: "火で暖まる（HP +16）",
          run: (st) => {
            st.player.hp = Math.min(st.player.hpMax, st.player.hp + 16);
          },
        },
        {
          label: "札を燃やす（気爆を得る、デッキから防御1枚削除）",
          run: (st) => {
            st.player.deck.push(makeCard("burst", "ev" + Date.now()));
            const i = st.player.deck.findIndex((c) => c.defId === "guard");
            if (i >= 0) st.player.deck.splice(i, 1);
          },
        },
      ],
    },
  ];

  function openEvent(forcedId) {
    const pool = EVENT_DEFS.slice();
    let ev;
    if (forcedId) ev = pool.find((e) => e.id === forcedId) || pool[0];
    else {
      // Prefer unseen events within a run
      if (!state.flags) state.flags = {};
      if (!state.flags.seenEvents) state.flags.seenEvents = [];
      const unseen = pool.filter((e) => !state.flags.seenEvents.includes(e.id));
      const pickFrom = unseen.length ? unseen : pool;
      ev = pickFrom[Math.floor(Math.random() * pickFrom.length)];
      state.flags.seenEvents.push(ev.id);
    }
    state.currentEvent = ev;
    $("event-title").textContent = ev.title;
    $("event-body").textContent = ev.body;
    const box = $("event-choices");
    box.innerHTML = "";
    ev.choices.forEach((ch) => {
      const b = document.createElement("button");
      b.className = "btn";
      b.textContent = ch.label;
      b.addEventListener("click", () => {
        state.pendingEventRemove = false;
        ch.run(state);
        if (state.pendingEventRemove) {
          openEventRemove();
        } else {
          goMap();
        }
      });
      box.appendChild(b);
    });
    show("event");
  }

  function openEventRemove() {
    $("event-title").textContent = "山札から1枚削除";
    $("event-body").textContent = "行商人の亡霊が指差す——どれを捨てる？";
    const box = $("event-choices");
    box.innerHTML = "";
    state.player.deck.forEach((card, i) => {
      const b = document.createElement("button");
      b.className = "btn";
      b.textContent = card.name + "（" + costLabel(card) + "）";
      b.addEventListener("click", () => {
        state.player.deck.splice(i, 1);
        state.pendingEventRemove = false;
        goMap();
      });
      box.appendChild(b);
    });
  }

  function showEnd(won, body, meta) {
    meta = meta || {};
    const title = $("end-title");
    title.textContent = won ? "勝利" : "敗北";
    title.className = "end-title " + (won ? "win" : "lose");
    $("end-body").textContent = body;
    const stats = $("end-stats");
    if (stats && state.player) {
      const tip = meta.tip || (won ? "もう一回、別ルートで窓を試せる。" : "次は蓄気と窓操作を早めに。");
      stats.textContent = "HP " + state.player.hp + "/" + state.player.hpMax +
        "　金 " + state.player.gold + "　デッキ " + state.player.deck.length + "枚" +
        "　— " + tip;
    }
    const endPanel = $("screen-end");
    if (endPanel) {
      endPanel.classList.remove("juice-win", "juice-lose");
      endPanel.classList.add(won ? "juice-win" : "juice-lose");
    }
    show("end");
  }

  // ——— Wire buttons ———
  function bind() {
    $("btn-start").addEventListener("click", startRun);
    $("btn-end-turn").addEventListener("click", endTurn);
    $("btn-skip-reward").addEventListener("click", () => { state.reward = null; goMap(); });
    $("btn-rest-heal").addEventListener("click", restHeal);
    $("btn-rest-remove").addEventListener("click", restRemoveMode);
    const med = $("btn-rest-meditate");
    if (med) med.addEventListener("click", restMeditate);
    const gift = $("btn-rest-gift");
    if (gift) gift.addEventListener("click", restGiftMp);
    $("btn-leave-shop").addEventListener("click", goMap);
    $("btn-restart").addEventListener("click", () => show("title"));
    const helpBtn = $("btn-help");
    if (helpBtn) {
      helpBtn.addEventListener("click", () => {
        const panel = $("help-panel");
        if (!panel) return;
        panel.classList.toggle("hidden");
      });
    }
    if (typeof document.addEventListener === "function") {
      document.addEventListener("keydown", (ev) => {
        if (state.screen === "combat" && state.combat && !state.combat.over) {
          if (ev.key === "e" || ev.key === "E") { endTurn(); ev.preventDefault(); }
          if (ev.key >= "1" && ev.key <= "3") {
            const idx = parseInt(ev.key, 10) - 1;
            if (state.combat.hand[idx]) playCard(idx);
            ev.preventDefault();
          }
        } else if (state.screen === "reward" && (ev.key === "s" || ev.key === "S" || ev.key === "Escape")) {
          state.reward = null; goMap(); ev.preventDefault();
        }
      });
    }
  }

  // Expose for smoke tests
  window.Mado3 = {
    state,
    startRun,
    playCard,
    endTurn,
    enterNode,
    HAND_SIZE,
    BASE_AP,
    MAP,
    EVENT_DEFS,
    ELITE_POOL: typeof ELITE_POOL !== "undefined" ? ELITE_POOL : ["elite"],
    openEvent,
    deckHasMpSpend,
    MP_SPEND_IDS,
    api,
    _forceCombat(enemyId) {
      if (!state.player) startRun();
      startCombat(enemyId);
    },
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
      const inPile = after.pile.some((x) => x.uid === playedUid);
      const isNext = after.next && after.next.uid === playedUid;
      const inHand = after.hand.some((x) => x.uid === playedUid);
      // Played card returns to pile; shuffle may immediately promote it to "next"
      const playedBackInSystem = inPile || isNext;
      return {
        ok:
          after.hand.length === HAND_SIZE &&
          after.next != null &&
          after.next.uid !== beforeNext &&
          playedBackInSystem &&
          !inHand,
        hand: after.hand.length,
        next: !!after.next,
        playedBackInPile: inPile,
        playedBackInSystem,
        beforeHand,
      };
    },
  };

  bind();
  show("title");
})();
