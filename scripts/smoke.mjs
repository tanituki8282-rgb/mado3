/**
 * Headless smoke: hand 3, next visible, play returns to pile, next enters hand.
 * Uses a minimal DOM stub + vm to load browser scripts.
 */
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

class El {
  constructor(id, tag = "div") {
    this.id = id;
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.style = {};
    this.className = "";
    this._listeners = {};
    this._html = "";
    this.disabled = false;
    this.textContent = "";
  }
  get innerHTML() { return this._html; }
  set innerHTML(v) { this._html = String(v); this.children = []; }
  appendChild(c) { this.children.push(c); this._html += "[child]"; return c; }
  prepend(c) { this.children.unshift(c); }
  replaceWith() {}
  addEventListener(type, fn) {
    (this._listeners[type] ||= []).push(fn);
  }
  click() { (this._listeners.click || []).forEach((f) => f()); }
  classList = {
    _s: new Set(),
    add: function (c) { this._s.add(c); },
    remove: function (c) { this._s.delete(c); },
    contains: function (c) { return this._s.has(c); },
  };
}

const els = {};
function el(id) {
  if (!els[id]) els[id] = new El(id);
  return els[id];
}
[
  "screen-title","screen-map","screen-combat","screen-reward","screen-rest",
  "screen-shop","screen-event","screen-end",
  "btn-start","btn-end-turn","btn-skip-reward","btn-rest-heal","btn-rest-remove",
  "btn-leave-shop","btn-restart",
  "map-hp","map-hpmax","map-gold","map-decksize","map-nodes","map-log",
  "p-hp","p-hpmax","p-block","p-ap","p-mp","p-stance",
  "e-name","e-hp","e-hpmax","e-block","e-intent",
  "hand","next-card","deck-count","combat-log",
  "reward-gold","reward-cards","rest-remove-list",
  "shop-gold","shop-hp","shop-wares","shop-remove","shop-log",
  "event-title","event-body","event-choices","end-title","end-body",
].forEach(el);

const document = {
  getElementById: (id) => el(id),
  querySelectorAll: (sel) => {
    if (sel === ".screen") {
      return ["title","map","combat","reward","rest","shop","event","end"].map((s) => el("screen-" + s));
    }
    return [];
  },
  createElement: (tag) => new El(null, tag),
};

const context = { console, Math, Date, document, window: {}, CARD_DEFS: undefined };
context.window = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, "js/cards.js"), "utf8"), context);
vm.runInContext(fs.readFileSync(path.join(root, "js/game.js"), "utf8"), context);

const r = context.window.Mado3._testDealAndPlay();
if (!r.ok) {
  console.error("SMOKE FAIL", r);
  process.exit(1);
}
console.log("SMOKE OK", r);

// Extra: AP reset / MP no regen
const M = context.window.Mado3;
M.state.combat.player.mp = 2;
M.state.combat.player.ap = 0;
M.endTurn();
if (M.state.combat.over) {
  console.log("combat ended during enemy turn (ok if kill/death)");
} else {
  if (M.state.combat.player.ap !== 3) {
    console.error("AP should reset to 3, got", M.state.combat.player.ap);
    process.exit(1);
  }
  if (M.state.combat.player.mp !== 2) {
    console.error("MP should stay 2, got", M.state.combat.player.mp);
    process.exit(1);
  }
  console.log("SMOKE OK ap-reset mp-persist");
}
