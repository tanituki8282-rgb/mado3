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

## Round 16.5 / Review3（哀ちゃん・HEAD 080a966）
- Prior Top3（fight1 / MP guarantee / window-read）mostly improved — do not reopen unless regression.
- **New Top3** (highest first):
  1. Stop deck bloat drowning the window — 蓄気/集中 etc → ~16 cards kills next-1 info. Thinning, tighter rewards, anti-bloat.
  2. Show 「読めた」rewards on the board — next-atk+2 / 余韻 currently log-only; make UI-visible.
  3. Shift「割く」weight toward MP — less shield-timing + AP-read bias; AP↔MP allocation should be the main verb.
- Notes: fight1 better but true MP spend still thin there; spend rewards skippable/generator-heavy; miss costs AP feel bad; next-atk+2 not shown.
- North star for R17–24: Review3 Top3 + 紬 visual pass (policy A). **Not Done.**

## Round 17
- Target gap: Harden fight1 under varied draws + slash-only fail regression smoke
- What changed:
  - Headless slash-only policy sim locked into smoke (N=20, allow ≤2 wins)
  - Fight1 hint copy nudges MP store before big hit (not only shield-dig)
- Evaluation: **better** (stability / regression lock)
  - Evidence: sim 48 seeds — slash_only 0/48; block_no_window 2/48; window_read 48/48 avgHP~56; smoke r17-fight1-slash-fail wins 0
- Decision: continue → visual + Review3

## Round 17.5 / Visual（紬・policy A・カードイラストなし）
- Target gap: Night-window visual hierarchy (紬 Top3)
- What changed:
  1. Color tokens: `--bg #0e0f14` / panel / `--accent #8ec4d4` / `--danger #d96b6b` / `--elite #c4895a`; glow on edges + one accent
  2. Enemy card ranking: `rank-normal` / `rank-elite`(+✦) / `rank-boss`(soft red glow); enlarged intent pills; heavy-attack `.eintent.heavy`
  3. Map atmosphere: `depth-near|mid|far|boss` layers; selectable-only accent frame+1px glow; emoji icons 1.35rem
  - Also: `#app` 920px; window-area frame `#4a6d5c` inset glow; cards 4px type stripe / `#232636` / next soft green; primary btn flat `#3d5f82`; AP/MP tabular-nums; title letter-spacing 0.22em
- Evaluation: **better** (readability / faction-danger-window hierarchy; no gameplay regression; smoke visual tokens green)
- Decision: continue → Review3#1

## Round 18
- Target gap: Review3#1 — deck bloat drowning the window
- What changed:
  - Starter thinned to 11 (cut poke; denser focus/window); REWARD_POOL cut fillers (no bulk guard/heavy/store)
  - Fat deck (≥14): reward offers **2** not 3 + skip tip; forced spend uses true MP_SPEND only (no generator-as-force)
  - Shop remove cheaper when fat (16→12金 / 14→15金); teaching copy
- Evaluation: **better**
  - Evidence: smoke review3-anti-bloat offers=2 at deck20; starter length 11
- Decision: continue → Review3#2

## Round 19
- Target gap: Review3#2 — 「読めた」rewards on the board
- What changed:
  - `#window-buffs` strip on player panel: 次攻撃+N / 余韻MP済|まだ / 読了ブロック+N / 窓：未読
  - readAttackBonus / readBlockBonus / readMpGranted drive pills (not log-only)
- Evaluation: **better**
  - Evidence: smoke review3-read-board atk=2 mp=true; CSS `.wbuff.atk`
- Decision: continue → Review3#3

## Round 20
- Target gap: Review3#3 — shift 割く toward MP + miss-tax feel
- What changed:
  - 決壊: AP2/MP2 → **AP1/MP2** (22 dmg) — MP is the scarce verb
  - Mismatch on window-read: consolation 探りブロック+1 (AP dig less pure tax)
  - EARLY_REWARD_MP lead with true spends (pierce/finisher/weaken/window) before channel
- Evaluation: **better**
  - Evidence: smoke finisherAp=1; consolBlock=1; early pool spend-first
- Decision: continue

## Round 21
- Target gap: Shop economy (prices, remove teaching, avoid traps) + anti-bloat ally
- What changed:
  - Spend prices down (finisher/burst 48, pierce 36, channel 28, window tools ~30–34)
  - Remove cost scales with deck thickness; shopkeeper lines teach delete-before-buy
- Evaluation: **better**
  - Evidence: smoke shop opens, wares=5; pierce not trap-priced when offered
- Decision: continue

## Round 22
- Target gap: Mid-act pressure curve (knight/elite/boss) after longer paths + meditation
- What changed:
  - Knight HP40 + shell→14 spike; elite 66 + longer pattern; boss 98 + extra shell; elite variants +4 HP
- Evaluation: **better**
  - Evidence: smoke r18-midact-pressure; MP kits still required vs shells (prior elite sim logic holds; numbers up)
- Still open: external Review4 on whether meditation makes elite too soft — watch next review
- Decision: continue

## Round 23
- Target gap: Dual-enemy readability + cut dilution / event quality
- What changed:
  - Pack `rat_shade` (rat+shade_pup) on c3; dual rats HP/dmg up slightly; pack-fight header class
  - Events: filler「離れる」removed; every choice hits MP/window/deck/gold meaningfully; 深読み rename
  - Shop pool drops stance_off (dilution)
- Evaluation: **better**
  - Evidence: smoke pack spawn 2; r20-event-quality no leave fillers; SHOP without stance_off
- Decision: continue → stabilize

## Round 24
- Target gap: Stabilize, docs, smoke, Review3 package notes (no Done claim)
- What changed:
  - Smoke covers R17–R23 + Review3 Top3 checks; CORE/README/LOOP_LOG synced (repo + workspace charter log)
  - Ready for external Review4 on Review3 Top3 + 紬 visual
- Evaluation: **better** (stability/docs) — smoke ALL GREEN
- Still open for 25+:
  - External re-review of Review3 Top3 (bloat / board-read / MP verb) on live Pages
  - Fight1 true MP-spend density (siphon path vs spend card in combat 1)
  - Whether fat-deck soft-cap needs hard remove prompt / rest auto-hint
  - Optional juice only if Top3 stays green
- Decision: pause for external review — **not Done** (min rounds goal 30+ continues after Review4)

## Round 25
- Target gap: Fight1 true in-combat MP spend (one guaranteed path) without breaking window / deck bloat
- What changed:
  - Combat-only card `膜裂き` (AP0/MP1・貫通9) injected into slime fight pile; never shop/reward/starter; never leaks to `player.deck`
  - Fight1 log teaches store→spend on the tear
- Evaluation: **better**
  - Evidence: smoke r25-fight1-mp-spend inject+spend through block; permanent deck clean
- Decision: continue

## Round 25.x / Visual（紬 follow-up・policy A・カードイラストなし）
- Target gap: Intent/target/player-frame signal split
- What changed:
  1. Intent pills: 🛡 `kind-block` blue-gray; ⬆ `kind-buff` quiet purple; ⚔ stays danger red (+ heavy)
  2. Target ring = `--target-warm` soft warm; map selectable-only keeps accent cyan
  3. `.actor.player` thin `--window-frame` green so player isn’t flatter than ranked enemies
- Evaluation: **better** (readability hierarchy; smoke r25.x-tsumugi-visual)
- Decision: continue → R26

## Round 26
- Target gap: Meditation vs elite softness
- What changed:
  - 窓瞑想 HP cost 8→10
  - Elite HP bumps (72 / variants +4); patterns slightly sharper
  - If meditate pending on elite: force drain / thicken+6 / HP+6 depending on mod
- Evaluation: **better**
  - Evidence: smoke r26-meditate-elite; HTML HP-10; elite hp≥70
- Decision: continue

## Round 27
- Target gap: Boss/finale clarity + juice (no card art)
- What changed:
  - Boss HP 102; phase labels 【I殻】【II破】【III】 on intents + open log + mid-fight callouts for 大破/力
  - Win copy richer; CSS bossPulse on rank-boss
- Evaluation: **better**
  - Evidence: smoke r27-boss-phases
- Decision: continue

## Round 28
- Target gap: Harder anti-bloat / reward pool hygiene
- What changed:
  - REWARD_POOL drops `iron`; shop deprioritizes heavy (iron last)
  - Deck ≥16 → reward offers **1** + stronger skip tip (14–15 still 2)
- Evaluation: **better**
  - Evidence: smoke r28-veryfat-hygiene offers=1
- Decision: continue

## Round 29
- Target gap: Playability — first-run teach remove/window in one tip
- What changed:
  - Map one-shot `.teach-tip` (read next + delete when fat)
  - Help panel: 膜裂き / 往復 / 初回の要点 / intent colors / meditate cost
- Evaluation: **better**
  - Evidence: smoke r29-teach-tip flag; help copy
- Decision: continue

## Round 30
- Target gap: Full smoke + regression suite expansion
- What changed:
  - Smoke covers R25–R29 + R25.x visual + R31 hooks; prior suite still green
- Evaluation: **better** (stability) — smoke ALL GREEN
- Decision: continue

## Round 31
- Target gap: Amplify AP↔MP verb + polish weak event
- What changed:
  - Combat once: 「気の往復」AP→MP or MP→AP (locks for that fight)
  - 盗賊の残り火「火で暖まる」→ HP+10 + 蓄気 (was heal-only)
- Evaluation: **better**
  - Evidence: smoke r31-convert-event
- Decision: continue → stabilize

## Round 32
- Target gap: Stabilize docs; write near-Done checklist for Review4/5 — **do NOT mark Done**
- What changed:
  - CORE/README/LOOP_LOG/charter synced (repo + `/workspace/sts-like-spec`)
  - Near-Done checklist below (for external reviewers)
- Evaluation: **better** (docs/stability)
- Still open for 33+:
  - External **Review4** (哀ちゃん) Top3 on live Pages — prefer over implementer judgment
  - Whether membrane_tear teaches without feeling like a tutorial tax
  - Convert button discoverability vs clutter
  - Post-meditate elite feel after HP+10 trade
  - Optional second-act / relics only if Review4 says core is green
- Decision: pause for Review4 — **not Done** (crossed 30+ round minimum; continue after review)

### Near-Done checklist（Review4/5 用・実装者は Done にしない）
- [ ] 核「手札3＋次1でAP/MPを割く」が戦闘ごとに発火（膜裂き／往復／読めた報酬含む）
- [ ] Fight1: 純粋斬撃ではほぼ勝てず、窓読み＋何らかのMP消費が自然に出る
- [ ] MP消費が店RNG頼みでない（報酬保証／気の欠片／初戦膜裂き）
- [ ] 山肥大で窓が死なない（14枚2択・16枚1択・削除が安い・初回ヒント）
- [ ] 「読めた」がボードに見える（次攻撃+/余韻MP）
- [ ] 瞑想→エリートが甘すぎない（HPコストと余波硬化）
- [ ] ボス相（殻→大破→力）が意図ラベルで読める
- [ ] 紬 visual: 意図色分け・ターゲット暖色・マップ選択はアクセント・プレイヤー窓枠
- [ ] カードイラストなし維持
- [ ] smoke ALL GREEN / Pages 更新済み
- [ ] レビュー側「もう一回やりたい」「大きな穴なし」が連続2ラウンドで重大ギャップなし → そのとき初めて Done 候補

## Review4（哀ちゃん・~78b0850 play／実装は 2e8e50f+）
- Prior: anti-bloat partial; 読めた pills felt unfired; 決壊/往復 improved. Conditional another-run IF 先読み can reward.
- Top3 then: (1) teach/guarantee 読めた early (2) dead-hand escape (3) harden thin-deck motive both extremes
- Gate on 2e8e50f: NOT hole-free. Core 先読み better; 往復 helps; 膜裂き leans tax. Another-run desire exists.
- Gate Top3: (1) elite grind pace (2) MP store→spend still optional in-combat (3) 膜裂き tax + 読めた pills missable

## Round 33
- Target gap: Review4#1 — teach 先読み match / guarantee one「読めた」early
- What changed:
  - Match rules clarified on card text + always-on「合う次：攻撃札/防御札」pill
  - Buff intents now need attack (was always 中立 → pills never fired)
  - siphon/membrane_tear count as attack fills; stance_def as block
  - Until first run `everReadOk`, first window read force-pulls a matching next from pile once（教示）
  - Mismatch log names the required type
- Evaluation: **better** — smoke r33-early-yometa
- Decision: continue

## Round 34
- Target gap: Review4#2 — dead-hand when all cards gray
- What changed:
  - `isDeadHand` + end-turn pulse label「詰み → E」
  - Once/combat「詰み脱出：次を無料入替」; if still dead grants AP+1
  - Convert UI collapsed to one contextual button (declutter)
- Evaluation: **better** — smoke r34-dead-hand
- Decision: continue

## Round 35
- Target gap: Review4#3 — thin-deck motive both skip-too-much and take-too-much
- What changed:
  - Fat skip (≥14) gold+6 / veryFat +10; thin skip no gold
  - Thin take (≤11) gold+3; veryFat take HP-3 + map warn
  - Steeper remove discounts when fat; skip button copy reflects motive
- Evaluation: **better** — smoke r35-thin-motive
- Decision: continue → gate Top3

## Round 36
- Target gap: Gate#1 — elite too long / grind
- What changed:
  - Base elite HP 72→54, pattern 6→4 sharper beats (殻→強撃→再殻→決壊打ち)
  - Variants shortened (~48–50 HP, ≤4 beats)
- Evaluation: **better** — smoke r36-elite-pace; fight ends before promise taste dies
- Decision: continue

## Round 37
- Target gap: Gate#2 — MP store→spend optional in combat
- What changed:
  - 気滞: on elite/boss/shell turns, ending turn 2+ without MP spend → enemy block +4 into your next turn
  - First MP spend each combat: block +2（気を割いた）
  - Meditate→elite backfire lightened (+3 HP / +4 thick) so meditation is not a trap
  - Elite open log pushes MP spend
- Evaluation: **better** — smoke r37-mp-necessity
- Decision: continue

## Round 38
- Target gap: Gate#3 — 膜裂き tax + 読めた pills missable
- What changed:
  - 膜裂き: hand/next gift (swap slash), start MP≥1, explicit「任意・使わなくてもよい」— no pile-fish
  - 読めた: buff-flash animation + 「読めた！」toast near window; need/spent pills
- Evaluation: **better** — smoke r38-membrane-pills
- Decision: continue

## Round 39
- Target gap: Smoke + balance micro regression
- What changed:
  - Smoke extended R33–R38; prior suite green; elite/r18/r26 expectations updated for short elite
- Evaluation: **better** (stability) — smoke ALL GREEN
- Decision: continue

## Round 40
- Target gap: Docs; candidate Done rationale — do **not** claim ship alone
- What changed:
  - CORE/README/LOOP_LOG/charter synced for R33–40 + Review4/gate Top3
- Evaluation: **better** (docs)
- Still open for Review5:
  - External play on Pages after deploy (cache)
  - Whether 気滞 feels fair on non-elite shells
  - Whether short elite is still a skill check with MP path
  - Another-run confirmation from reviewer (implementer must not Done alone)
- Decision: pause for Review5 — **not Done**

### Candidate Done rationale（実装者メモ・レビュー待ち）
Rounds 33–40 closed Review4 Top3 and gate Top3 on elite pace / in-combat MP necessity / 膜裂き+pills. Core window teach now shows match condition, guarantees one early 読めた, and dead-hand/thin-deck edges are handled. Smoke green. **Candidate Done only if Review5** saysもう一回やりたい・大きな穴なし for 2 consecutive looks — implementer does not ship alone.

## Round 41
- Target gap: Review5#1 — MP store→spend still shallow vs elite/boss after short elite
- What changed:
  - `mpSpentThisTurn` (per-turn); 気滞 only on elite/boss; +5 from turn1 (+6 from turn3) if no MP spend
  - MP→AP 往復 counts as spend this turn
  - Elite shells thickened (16/15; breaker 17/18) — AP chip alone is slow
  - UI pill「気滞リスク」on elite/boss when unspent this turn
- Evaluation: **better** — smoke r41-mp-per-turn
- Decision: continue

## Round 42
- Target gap: Review5#2 — 膜裂き teach muddy / pile-mix feel
- What changed:
  - Gift overlay: displaced slash held in `giftHeld` (not pile); restore on combat end
  - Copy「贈与」+ card badge + CSS gold frame; text says プレゼント
  - Logs never describe pile-fish
- Evaluation: **better** — smoke r38/r42 giftHeld
- Decision: continue

## Round 43
- Target gap: Review5#3 — 気滞 fairness on normals + dead-hand escape never fired
- What changed:
  - Confirmed 気滞 elite/boss only (no normal shellbug tax)
  - Escape pulls next into hand + AP/MP soft-unlock until a card is playable
  - Announce log + pulse on escape button + key X
- Evaluation: **better** — smoke r43-fairness-escape
- Decision: continue

## Round 44
- Target gap: Micro polish for gift recirculation
- What changed:
  - 膜裂き is one-shot（山に戻さない）when played
- Evaluation: **better** — smoke r44-tear-exhaust; suite green
- Decision: continue

## Round 45
- Target gap: Docs + Review6 note — do **not** claim Done
- What changed:
  - CORE/README/LOOP_LOG/charter synced for R41–45 + Review5 Top3
- Evaluation: **better** (docs)
- Still open for Review6:
  - External play: does per-turn 気滞 make elite feel like store→spend without early misery?
  - Is 膜裂き gift unmistakable (badge/log) vs pile-tax?
  - Does 詰み脱出 fire and unlock in real play (X / button)?
  - Another-run desire from reviewer (implementer must not Done alone)
- Decision: pause for Review6 — **not Done**

### Review6 handoff（実装者メモ・レビュー待ち）
Rounds 41–45 closed Review5 Top3 on per-turn elite/boss MP pressure, 膜裂き gift teach, and 気滞 fairness + dead-hand unlock. Smoke green. **Not Done** — Review6 must confirmもう一回／核が遊べる／大きな穴なし before any ship claim.
