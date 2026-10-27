# CUE PASS — Matchday Vision

An original football decision game created, designed and developed by **Cornelius Aurelius**.
Official game: https://cornelius-aurelius.github.io/CUE-PASS/
Original creator: https://corneliusaurelius.com/

## How to play
Select a position and kit matchup, then choose Matchday, Blitz or Practice. Read the passing instruction, scan the illustrated football field and tap a receiving player or use the corresponding number key (1–3). The only valid receiver matches the requested role, number, pattern, boots or armband. The most challenging rounds combine two clues. After a correct or incorrect answer, a short feedback explanation is shown before the next play begins automatically.

- **Matchday:** 24 plays, three shields, fair stage-specific time windows, ranking.
- **75-second Blitz:** Chase a high score against a cumulative game clock and three shields.
- **Practice:** Unlimited mistakes and no timer.
- `H`: optional correct-recipient hint (reduces points on a successful pass by 35).
- `P` / `Esc`: pause. Touch, mouse and keyboard are supported. Sound is off by default. Records are held in localStorage only.

## Validation
`node --test tests/*.test.mjs`

All 24 stages are validated against all 12 player positions, three kit palettes and repeated generation seeds to ensure exactly one correct receiving player. A separate test verifies combined-cue decoys. Progression, lives, points, hints, timer expiration and site metadata are also checked.

No build tools, external scripts, external fonts, analytics or account required. GitHub Pages serves the root `index.html` from main. After publishing, verify real browser performance on Chromebook, iPhone, Android and tablet. Search/AI indexing is not automatic.

## Educational disclaimer
The game is designed to introduce accessible decision cues, not diagnose colour blindness, simulate any particular observer's vision or judge actual match tactics. Useful reference: https://www.thefa.com/news/2017/jun/19/colour-blindness-guidance-190617 and UEFA's 2021 colour-blind awareness guidance.