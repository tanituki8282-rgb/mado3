/** 窓3 card definitions — text only (no card art) */
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
    text: "敵に 5 ダメージ（構えの攻撃補正あり）。",
    effect: (g) => g.dealDamageToEnemy(5 + g.attackBonus()),
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
  channel: {
    id: "channel", name: "導気", type: "tech",
    ap: 1, mp: 0,
    text: "MP を 2 得る。APで蓄える技術。",
    effect: (g) => { g.player.mp += 2; g.log("MP +2"); },
  },
  redraw_next: {
    id: "redraw_next", name: "先読み", type: "tech",
    ap: 1, mp: 0,
    text: "次を入れ替え、意図と合うなら報酬（ブロック+2／次攻撃+2）。窓を読む。",
    effect: (g) => g.redrawNext(),
  },
  redraw_next_mp: {
    id: "redraw_next_mp", name: "深読み破棄", type: "tech",
    ap: 0, mp: 1,
    text: "次を山に戻し、別の次を見る（AP不要・MP1）。",
    effect: (g) => g.redrawNext(),
  },
  swap_window: {
    id: "swap_window", name: "窓入替", type: "tech",
    ap: 0, mp: 1,
    text: "次と手札の左端を入れ替え、新しい次を読む（合いで報酬）。",
    effect: (g) => g.swapNextWithHand(0),
  },
  pierce: {
    id: "pierce", name: "貫通", type: "attack",
    ap: 1, mp: 1,
    text: "敵に 9 ダメージ（ブロック無視）。殻に刺さる。",
    effect: (g) => g.dealDamageToEnemy(9 + g.attackBonus(), { ignoreBlock: true }),
  },
  finisher: {
    id: "finisher", name: "決壊", type: "attack",
    ap: 2, mp: 2,
    text: "敵に 24 ダメージ。MPを要する決め手。",
    effect: (g) => g.dealDamageToEnemy(24 + g.attackBonus()),
  },
  burst: {
    id: "burst", name: "気爆", type: "attack",
    ap: 0, mp: 3,
    text: "敵に 28 ダメージ。MPだけを燃やす決め手。",
    effect: (g) => g.dealDamageToEnemy(28 + g.attackBonus()),
  },
  weaken: {
    id: "weaken", name: "弱体の印", type: "tech",
    ap: 1, mp: 1,
    text: "敵に弱体2付与（攻撃ダメージ25%減）。",
    effect: (g) => g.applyWeak(2),
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
    text: "AP +1。次を読む：合っていれば報酬、外れなら一度だけ引き直し。",
    effect: (g) => {
      g.player.ap += 1;
      g.log("AP +1");
      g.redrawNextIfMismatch();
    },
  },
  scry_deep: {
    id: "scry_deep", name: "二度先読み", type: "tech",
    ap: 0, mp: 2,
    text: "次を2回入れ替える。MPを窓に全振りする。",
    effect: (g) => { g.redrawNext(); g.redrawNext(); },
  },
  swap_pick: {
    id: "swap_pick", name: "窓選替", type: "tech",
    ap: 1, mp: 1,
    text: "次と手札の好きな1枚を入れ替える（AP+MP）。",
    effect: (g) => g.beginSwapPick(),
  },
  bury_next: {
    id: "bury_next", name: "次を埋める", type: "tech",
    ap: 1, mp: 1,
    text: "次を山の底へ送り、別の次を見る。悪い次を捨てる。",
    effect: (g) => g.buryNext(),
  },
};

/** Starter: attacks, blocks, MP path (siphon+store), next-tech */
function makeStarterDeck() {
  const ids = [
    "slash", "slash",
    "heavy", "poke",
    "guard", "guard", "guard", "iron",
    "store", "siphon", "redraw_next", "redraw_next",
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

const SHOP_POOL = [
  "heavy", "iron", "finisher", "burst", "pierce", "channel",
  "stance_off", "siphon", "swap_window", "focus",
  "weaken", "redraw_next", "redraw_next_mp", "scry_deep", "swap_pick", "bury_next",
];
const REWARD_POOL = [
  "heavy", "guard", "iron", "store", "channel",
  "siphon", "focus", "swap_window", "pierce", "weaken",
  "finisher", "redraw_next_mp", "scry_deep", "swap_pick", "bury_next",
  "redraw_next",
];
/** First combat reward: always include at least one MP-payoff option */
const EARLY_REWARD_MP = ["channel", "pierce", "finisher", "siphon", "weaken", "swap_window", "swap_pick", "bury_next"];
/** Guaranteed until deck owns a true MP-spend (not mere generators) */
const SPEND_REWARD_POOL = ["pierce", "finisher", "weaken", "burst", "swap_window", "swap_pick", "bury_next", "redraw_next_mp", "scry_deep"];

const ENEMIES = {
  slime: {
    id: "slime", name: "スライム", hp: 36, emoji: "🟢",
    pattern: [
      { kind: "block", value: 10, label: "粘液の膜 10" },
      { kind: "attack", value: 15, label: "大殴り 15" },
      { kind: "attack", value: 7, label: "攻撃 7" },
      { kind: "block", value: 8, label: "膜再生 8" },
      { kind: "attack", value: 11, label: "強撃 11" },
    ],
    gold: 18,
  },
  bat: {
    id: "bat", name: "コウモリ", hp: 24, emoji: "🦇",
    pattern: [
      { kind: "attack", value: 9, label: "攻撃 9" },
      { kind: "attack", value: 7, label: "攻撃 7" },
      { kind: "buff", value: 2, label: "力+2（次攻撃強化）" },
    ],
    gold: 22,
  },
  /** AP-only slash spam is inefficient: heavy block shells */
  shellbug: {
    id: "shellbug", name: "殻虫", hp: 40, emoji: "🪲",
    pattern: [
      { kind: "block", value: 12, label: "殻張り 12" },
      { kind: "attack", value: 10, label: "攻撃 10" },
      { kind: "block", value: 14, label: "厚殻 14" },
      { kind: "attack", value: 8, label: "攻撃 8" },
      { kind: "buff", value: 2, label: "力+2" },
    ],
    gold: 28,
  },
  knight: {
    id: "knight", name: "見習い騎士", hp: 36, emoji: "🗡️",
    pattern: [
      { kind: "attack", value: 10, label: "攻撃 10" },
      { kind: "block", value: 8, label: "防御 8" },
      { kind: "attack", value: 12, label: "攻撃 12" },
    ],
    gold: 25,
  },
  elite: {
    id: "elite", name: "窓守りの精鋭", hp: 62, emoji: "⚔️",
    pattern: [
      { kind: "block", value: 14, label: "窓殻 14" },
      { kind: "attack", value: 14, label: "攻撃 14" },
      { kind: "block", value: 10, label: "防御 10" },
      { kind: "attack", value: 18, label: "強撃 18" },
      { kind: "buff", value: 3, label: "力+3" },
    ],
    gold: 50,
  },
  /** Alternate elites — same map node may roll these */
  elite_wraith: {
    id: "elite_wraith", name: "霧の精鋭", hp: 54, emoji: "👻",
    pattern: [
      { kind: "attack", value: 11, label: "霧打ち 11" },
      { kind: "buff", value: 2, label: "力+2" },
      { kind: "attack", value: 15, label: "霧切り 15" },
      { kind: "block", value: 8, label: "霧膜 8" },
      { kind: "attack", value: 13, label: "連霧 13" },
    ],
    gold: 50,
    mod: "fog",
  },
  elite_breaker: {
    id: "elite_breaker", name: "殻砕きの精鋭", hp: 58, emoji: "🪨",
    pattern: [
      { kind: "block", value: 16, label: "岩殻 16" },
      { kind: "attack", value: 12, label: "攻撃 12" },
      { kind: "block", value: 18, label: "大岩殻 18" },
      { kind: "attack", value: 16, label: "強撃 16" },
      { kind: "buff", value: 2, label: "力+2" },
    ],
    gold: 52,
    mod: "thick",
  },
  elite_drain: {
    id: "elite_drain", name: "気奪いの精鋭", hp: 56, emoji: "🟣",
    pattern: [
      { kind: "attack", value: 10, label: "気奪い 10" },
      { kind: "block", value: 9, label: "防御 9" },
      { kind: "attack", value: 14, label: "強気奪い 14" },
      { kind: "buff", value: 2, label: "力+2" },
      { kind: "attack", value: 12, label: "攻撃 12" },
    ],
    gold: 50,
    mod: "drain",
  },
  boss: {
    id: "boss", name: "三窓の主", hp: 92, emoji: "👁️",
    pattern: [
      { kind: "block", value: 12, label: "三窓の殻 12" },
      { kind: "attack", value: 16, label: "攻撃 16" },
      { kind: "block", value: 10, label: "防御 10" },
      { kind: "attack", value: 22, label: "大破 22" },
      { kind: "buff", value: 4, label: "力+4" },
      { kind: "attack", value: 12, label: "連撃 12" },
    ],
    gold: 0,
  },
  rat: {
    id: "rat", name: "窓ネズミ", hp: 14, emoji: "🐀",
    pattern: [
      { kind: "attack", value: 5, label: "噛みつき 5" },
      { kind: "attack", value: 4, label: "かじる 4" },
      { kind: "buff", value: 1, label: "力+1" },
    ],
    gold: 10,
  },
  shade: {
    id: "shade", name: "影法師", hp: 30, emoji: "👤",
    pattern: [
      { kind: "attack", value: 8, label: "影打ち 8" },
      { kind: "block", value: 7, label: "影の膜 7" },
      { kind: "buff", value: 2, label: "力+2" },
      { kind: "attack", value: 12, label: "切り込み 12" },
    ],
    gold: 26,
  },
};

/** Multi-enemy light packs (2 weak). Key used as map enemy id. */
const ELITE_POOL = ["elite", "elite_wraith", "elite_breaker", "elite_drain"];

const ENEMY_PACKS = {
  dual_rats: {
    id: "dual_rats",
    name: "ネズミの群れ",
    members: ["rat", "rat"],
    gold: 22,
  },
};
