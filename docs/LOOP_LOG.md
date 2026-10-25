# 窓3 Improvement Loop Log

Charter: LOOP_CHARTER.md — max 60 rounds. This log starts at Round 1.

## Round 1
- Target gap: Core tension weak — AP-only slash spam clears fights; few MP sinks/windows that matter
- What changed:
  - Cards: `channel`(MP+2), `pierce`(ignore block), `burst`(MP3 finisher), `weaken`(弱体1種); starter swaps 1 slash→siphon
  - Enemy `殻虫` on map path; elite/boss patterns lead with block shells
  - Fixed enemy block timing (persists into next player turn; clears at start of enemy act) — previously shells never protected
  - Smoke extended: pierce/weak/starter MP path
- Evaluation: **better**
  - Evidence: headless sim vs 殻虫 ×8 — AP-only win 2/8 (avg HP~14); MP-invest win 8/8 (avg turns 4.8, HP~57); pierce deck faster still
  - Play checklist: MP investment matters vs armored; next-tech still available; defeat explainable (bled by chip through long fights)
- Still open: events thin; map short; UI plain; multi-enemy; balance polish; playability aids
- Decision: continue

## Round 0 review note (哀ちゃん・外部レビュー)
- Cited Top3 (highest first):
  1. Fire core promise in fight 1: early dead cards / pure-attack wins; force ≥1「次を見てAP/MPを割る」in first combat
  2. Enemy block/intent must matter (both clearing made guard fake) — fix or remove fake block intents
  3. MP payoff earlier/clearer before elite; audit 集中(0/0) and 突き×攻め double-dip
- Also: slime free; redraw_next dead at MP0; run short/one branch; MP-as-stored-resource onboarding weak
- Scoring north star for R1–8: these Top3. Do not restart finished work; fold into current/next.
- R1 already landed Top3#2 (enemy block persists into player turn; clears at start of enemy act) + MP sinks vs 殻虫. Remaining Top3#1/#3 → prioritize next rounds over pure event/map expansion order.

## Round 2
- Target gap: Top3#1+#3 — fight1 core promise (次を見て割る) + MP payoff before elite; audit 集中/突き
- What changed:
  - スライム: HP34、大殴り13ターン＋粘液の膜（次=防御が意味を持つ）、戦闘ヒントログ
  - `先読み破棄` → AP1/MP0（戦闘1から窓操作可能）。MP版 `深読み破棄` を店/報酬に追加
  - `集中`: AP+1の代わりに次を引き直す（無料攻撃燃料を窓代償に）
  - `突き`: 攻め構えの二重加算を削除（attackBonusのみ）
  - 初回戦闘報酬に MP-payoff（channel/pierce/finisher等）を必ず1枚混ぜる
- Evaluation: **better**
  - Evidence: smoke — poke+offense=8 (not 11); redraw AP1; slime big-attack pattern; EARLY_REWARD_MP present
  - Play checklist: fight1 can use 先読み破棄 without MP; big attack turn makes next-guard decision real; first reward surfaces store→finisher path; enemy block still matters (R1)
- Still open: events thin; map short/1 branch; UI; multi-enemy; balance numbers; playability chrome
- Decision: continue (events next; keep Top3 as north star)
## Round 3
- Target gap: Events too thin for STS-like run fantasy (Top3 adjacent: MP/deck/gold onboarding via choices)
- What changed:
  - 4 events × 3–4 choices each: 古い祠 / 行商人の亡霊 / 鏡の井戸 / 盗賊の残り火
  - Effects hit gold, HP, maxHP, deck add (channel/finisher/pierce/weaken/swap/redraw_mp), free remove, slash remove
  - Unseen-event preference within a run; event-remove subflow for ghost
- Evaluation: **better**
  - Evidence: smoke — 4 events, deck/gold mutations verified; choices explicitly trade AP/MP-path resources before elite
- Still open: map still short (1 event node); multi-enemy; UI; balance; playability
- Decision: continue → map depth next (reviewer: run too short / one branch)
## Round 4
- Target gap: Map too short / one thin branch (reviewer + charter run fantasy)
- What changed:
  - 13 nodes, layers 0–7; branch points at c1, c2a, ev1, rest1, elite (≥3)
  - Paths: slime → (殻虫|出来事) → (bat/knight/追加knight) → rest → (shop|event) → elite → (rest|shop) → boss
  - Shortest c1→boss ≥6 hops; map UI by layer rows + type colors
- Evaluation: **better**
  - Evidence: smoke — 13 nodes, 8 layers, 5 branch points, minHops≥6; run can take combat-heavy or event-heavy routes
- Still open: multi-enemy; UI polish; balance; playability; stronger window feature
- Decision: continue
## Round 5
- Target gap: Enemy roster/patterns shallow; always 1 enemy — optional dual trash without breaking UI
- What changed:
  - New singles: 窓ネズミ, 影法師; pack `dual_rats` (2 weak)
  - Combat refactored to `enemies[]` + targetIndex; all living act each turn; click to retarget
  - Map: c2b → ネズミの群れ, c3 → 影法師
  - Enemy cards in combat panel (targeted / dead states)
- Evaluation: **better**
  - Evidence: smoke dual spawn 2; roster keys present; UI lists both with intents; killing one retargets
- Still open: UI hierarchy/HP bars; balance numbers; playability; window-core feature
- Decision: continue → UI policy A
## Round 6
- Target gap: UX/readability — combat/map/shop hierarchy, intent badge, HP bars, typography (policy A, no card art)
- What changed:
  - Full CSS refresh: depth background, AP/MP pills, window inset, card hover, map type colors
  - Player + enemy HP bars; intent as pill badge; shop remove copy clarifies「次」value
  - Title「遊び方」panel; end screen win/lose color + run stats tip
- Evaluation: **better**
  - Evidence: hierarchy readable without art — resources, intents, targets, map layers differentiated by color/shape; smoke still green
- Still open: number balance after content; keyboard/reward UX; window-core feature amplify
- Decision: continue
## Round 7
- Target gap: Balance curve after content existed (economy, elite/boss, remove cost, payoff)
- What changed:
  - Start gold 40→55; shop remove 25→20; channel price 38→34
  - Finisher 22→24; shellbug 42→40; slime spike 13→12; bat/elite/boss tuned; elite gold 50
- Evaluation: **better**
  - Evidence: sim elite AP-only 2/6 (avgHP~10) vs MP+pierce/finisher 6/6 (avgHP~34); boss with MP kit 5/6; dual_rats trivial 6/6 — curve teaches MP before elite
- Still open: rest/window amplify feature; keyboard/reward chrome
- Decision: continue → R8 feature + playability
## Round 8
- Target gap: Amplify window core (rest HP→MP foresight) + playability polish
- What changed:
  - Rest「窓瞑想」: HP-8 → next combat starts MP+2 and free redraw of 次 once (consumed)
  - Keyboard: 1/2/3 play hand, E end turn, S/Esc skip reward
  - Reward/skip copy clearer; help panel documents meditate + keys
- Evaluation: **better**
  - Evidence: smoke rest-meditate-mp2; feature directly feeds「次を見て割る」and early MP payoff (Top3#1/#3); playability without breaking text-only cards
- Still open (for rounds 9+):
  - More next-manipulation suite depth; elite modifiers; relics-lite?; juice/animations; second act decision later; AI/fun-review pass on full run feel; remove-from-deck mid-run tutorial moments
- Decision: continue (rounds 1–8 task complete; hand off for 9+)

## Round 8.5 / Review2（哀ちゃん再レビュー・HEAD caa9344）
- External re-review of post-R8 build. Enemy block = mostly done — do not reopen unless regression.
- **New Top3** (highest first):
  1. Fight 1 must make「割く」hard to avoid — pure attack/block still clears; fights too long/soft; slash spam survives. Fix first-combat pressure/design so window+AP/MP choice appears early.
  2. MP payoff must not depend on shop RNG — guarantee mid-run ≥1 store→spend (finisher/window) without shop luck.
  3. Window-card feel: 先読み破棄 still feels dead; reshape discard/swap/focus toward *reading* the window, not tax/junk.
- Summary: core still mid-heavy; remaining is first-fight split, MP whiff, window cards as annoyance.
- North star for R9+: these three before other polish (elite variety / juice / help chrome are secondary).
- Decision: continue — reprioritize remaining rounds at Top3; keep R1–8 gains; do not claim Done.

## Round 9
- Target gap: (pre-Review2 plan) Next-manipulation suite depth — kept as partial Top3#3 adjacent
- What changed:
  - Cards: `二度先読み`(AP0/MP2)、`窓選替`(AP1/MP1 pick-swap)、`次を埋める`(AP1/MP1 bury)
  - playCard pauses for 窓選替 pick; shop/reward pools include them
- Evaluation: **better** on window-tool count / AP↔MP cost menu; **same** on Review2 Top3#3 (先読み破棄/集中 still unreshaped) and no touch on fight1 / MP guarantee
- Still open: Top3#1 fight1 soft; Top3#2 shop-gated MP; Top3#3 reshape existing window cards
- Decision: continue — next rounds lock to Review2 Top3

## Round 10
- Target gap: (pre-Review2) Elite modifiers/variety — secondary to Top3; already in flight so landed, not expanded further
- What changed:
  - ELITE_POOL: elite / 霧の精鋭(fog) / 殻砕き(thick) / 気奪い(drain)
  - Mods: fog redraws open next; thick +10 block; drain steals MP on hit
- Evaluation: **better** for elite variety; **same** vs Review2 Top3 (does not fix fight1/MP guarantee/window feel)
- Decision: continue → R11 Top3#1 fight1 pressure (method: north star = Review2 Top3)

## Round 11
- Target gap: Review2 Top3#1 — fight1 soft; slash spam clears; 「割く」avoidable
- What changed:
  - スライム: open 膜10 → 大殴り15 → … HP36; starter slash 3→2, redraw_next×2
  - Fight1 hint log
- Evaluation: **better**
  - Evidence: headless 24 runs — slash-only 0/24; block-no-window 3/24; window-read policy 18/24 (avgHP~19)
  - Pure attack/block no longer clears; window dig before big hit is the split
- Decision: continue → Top3#2

## Round 12
- Target gap: Review2 Top3#2 — MP payoff shop-RNG gated
- What changed:
  - `MP_SPEND_IDS` / `SPEND_REWARD_POOL`; rewards keep offering a true spend until deck owns one
  - Rest「気の欠片」free spend card when still missing (shop not required)
  - Reward tip +「MP路線」tag
- Evaluation: **better**
  - Evidence: smoke — mid-run reward includes spend (e.g. pierce/finisher/weaken) after siphon-only; rest gift completes path
- Decision: continue → Top3#3

## Round 13
- Target gap: Review2 Top3#3 — 先読み破棄/集中 feel like tax/junk
- What changed:
  - Rename 先読み破棄→先読み; redraw/swap/focus call `readWindowFeedback` (match → block+2 or next-atk+2)
  - 集中: AP+1; keep next if match (reward), else redraw once
  - Help line on reading the window
- Evaluation: **better**
  - Evidence: smoke focus-keep-on-match (+2 block); redraw into guard grants +2; cards text teach reading not discard-tax
- Decision: continue

## Round 14
- Target gap: Amplify core / cut dilution (post-Top3)
- What changed:
  - First successful「読めた」each combat also MP+1（窓の余韻）
  - Cut poke + stance_def from reward/shop pools (less noise vs window/MP toys)
- Evaluation: **better**
  - Evidence: smoke first read MP1, second read no double; pools cleaned
- Decision: continue

## Round 15
- Target gap: Playability — intent readability + defeat clarity + light juice
- What changed:
  - Intent icons ⚔/🛡/⬆ + ⚠ on heavy attacks
  - Defeat body cites last intent; tip points to window/MP/reward path
  - hurt-flash CSS; end juice classes; help/map tips
- Evaluation: **better** (readability/feedback; not a balance delta)
  - Evidence: smoke slime open intent has 🛡; end meta tip wired
- Decision: continue → stabilize

## Round 16
- Target gap: Stabilize + smoke + docs; prepare external re-review (no Done claim)
- What changed:
  - Smoke covers R9–R15; CORE.md updated for read-rewards + spend guarantee
  - LOOP_LOG synced; ready for 哀ちゃん Review3 on Top3
- Evaluation: **better** (stability/docs) — smoke ALL GREEN
- Still open for 17+:
  - External re-review of Top3 (fight1/MP guarantee/window feel) on live Pages
  - Second-pass numbers if Review3 finds soft/hard edges after meditation+longer paths
  - Optional further elite/juice only if Top3 stays green
- Decision: pause for external review — **not Done**

