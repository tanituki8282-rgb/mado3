/** 窓3 card definitions — text only */
const CARD_DEFS = {
  slash: {
    id: "slash", name: "斬撃", type: "attack",
    ap: 1, mp: 0,
    text: "敵に 6 ダメージ。",
    effect: (g) => g.dealDamageToEnemy(6 + g.attackBonus()),
  },
  heavy: {
    id: "heavy", name: "強撃", type: "attack",
    ap: 2, mp: 0,
    text: "敵に 11 ダメージ。",
    effect: (g) => g.dealDamageToEnemy(11 + g.attackBonus()),
  },
  poke: {
    id: "poke", name: "突き", type: "attack",
    ap: 1, mp: 0,
    text: "敵に 5 ダメージ。攻めの構え中は +3。",
    effect: (g) => {
      const bonus = g.player.stance === "offense" ? 3 : 0;
      g.dealDamageToEnemy(5 + g.attackBonus() + bonus);
    },
  },
  guard: {
    id: "guard", name: "防御", type: "block",
    ap: 1, mp: 0,
    text: "ブロック 5 を得る。",
    effect: (g) => g.gainBlock(5 + g.blockBonus()),
  },
  iron: {
    id: "iron", name: "鉄壁", type: "block",
    ap: 2, mp: 0,
    text: "ブロック 9 を得る。",
    effect: (g) => g.gainBlock(9 + g.blockBonus()),
  },
  store: {
    id: "store", name: "蓄気", type: "tech",
    ap: 1, mp: 0,
    text: "MP を 1 得る。",
    effect: (g) => { g.player.mp += 1; g.log("MP +1"); },
  },
  redraw_next: {
    id: "redraw_next", name: "先読み破棄", type: "tech",
    ap: 0, mp: 1,
    text: "次を山に戻し、別の次を見る。",
    effect: (g) => g.redrawNext(),
  },
  swap_window: {
    id: "swap_window", name: "窓入替", type: "tech",
    ap: 0, mp: 1,
    text: "次と手札の左端を入れ替える。",
    effect: (g) => g.swapNextWithHand(0),
  },
  finisher: {
    id: "finisher", name: "決壊", type: "attack",
    ap: 2, mp: 2,
    text: "敵に 22 ダメージ。MPを要する決め手。",
    effect: (g) => g.dealDamageToEnemy(22 + g.attackBonus()),
  },
  stance_off: {
    id: "stance_off", name: "攻めの構え", type: "stance",
    ap: 1, mp: 0,
    text: "戦闘中、攻撃 +3（上書き）。",
    effect: (g) => {
      g.player.stance = "offense";
      g.log("攻めの構え！ 攻撃+3");
    },
  },
  stance_def: {
    id: "stance_def", name: "守りの構え", type: "stance",
    ap: 1, mp: 0,
    text: "戦闘中、ブロック効果 +2（上書き）。",
    effect: (g) => {
      g.player.stance = "defense";
      g.log("守りの構え！ ブロック+2");
    },
  },
  siphon: {
    id: "siphon", name: "気吸い", type: "tech",
    ap: 1, mp: 0,
    text: "3 ダメージ。MP +1。",
    effect: (g) => {
      g.dealDamageToEnemy(3 + g.attackBonus());
      g.player.mp += 1;
      g.log("MP +1");
    },
  },
  focus: {
    id: "focus", name: "集中", type: "tech",
    ap: 0, mp: 0,
    text: "このターン AP +1。",
    effect: (g) => { g.player.ap += 1; g.log("AP +1"); },
  },
};

/** Starter: attack×6, block×4, tech×2 ≈ 12 */
function makeStarterDeck() {
  const ids = [
    "slash", "slash", "slash", "slash",
    "heavy", "poke",
    "guard", "guard", "guard", "iron",
    "store", "redraw_next",
  ];
  return ids.map((id, i) => makeCard(id, `s${i}`));
}

function makeCard(defId, uid) {
  const d = CARD_DEFS[defId];
  if (!d) throw new Error("unknown card " + defId);
  return {
    uid: uid || defId + "_" + Math.random().toString(36).slice(2, 8),
    defId: defId,
    name: d.name,
    type: d.type,
    ap: d.ap,
    mp: d.mp,
    text: d.text,
  };
}

const SHOP_POOL = ["heavy", "iron", "finisher", "stance_off", "stance_def", "siphon", "swap_window", "focus", "poke"];
const REWARD_POOL = ["slash", "heavy", "guard", "iron", "store", "poke", "siphon", "stance_off", "focus", "swap_window"];

const ENEMIES = {
  slime: {
    id: "slime", name: "スライム", hp: 28,
    pattern: [
      { kind: "attack", value: 7, label: "攻撃 7" },
      { kind: "attack", value: 5, label: "攻撃 5" },
      { kind: "block", value: 6, label: "防御 6" },
    ],
    gold: 18,
  },
  bat: {
    id: "bat", name: "コウモリ", hp: 22,
    pattern: [
      { kind: "attack", value: 9, label: "攻撃 9" },
      { kind: "attack", value: 6, label: "攻撃 6" },
      { kind: "buff", value: 2, label: "力+2（次攻撃強化）" },
    ],
    gold: 20,
  },
  knight: {
    id: "knight", name: "見習い騎士", hp: 36,
    pattern: [
      { kind: "attack", value: 10, label: "攻撃 10" },
      { kind: "block", value: 8, label: "防御 8" },
      { kind: "attack", value: 12, label: "攻撃 12" },
    ],
    gold: 25,
  },
  elite: {
    id: "elite", name: "窓守りの精鋭", hp: 55,
    pattern: [
      { kind: "attack", value: 14, label: "攻撃 14" },
      { kind: "block", value: 10, label: "防御 10" },
      { kind: "attack", value: 18, label: "強撃 18" },
      { kind: "buff", value: 3, label: "力+3" },
    ],
    gold: 45,
  },
  boss: {
    id: "boss", name: "三窓の主", hp: 80,
    pattern: [
      { kind: "attack", value: 16, label: "攻撃 16" },
      { kind: "block", value: 12, label: "防御 12" },
      { kind: "attack", value: 22, label: "大破 22" },
      { kind: "buff", value: 4, label: "力+4" },
      { kind: "attack", value: 12, label: "連撃 12" },
    ],
    gold: 0,
  },
};
