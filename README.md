# Chordlings: Island Orchestra — Orchestra Rebuild v2.0

An original musical-creature collection game inspired by the island-breeding genre. The creatures, names, drawings, audio engine, islands, UI, and progression are original rather than copied game assets.

## Rebuild contents
- 7 playable islands: Verdant, Ember, Tidal, Astral, Tempest, Fungal, and Glacial
- 103 total species in the Chordex
  - 82 permanent species
  - 7 breedable Titans, one per island
  - 21 Halloween seasonal species, exactly 3 per island
- Common, Rare, Epic, and Legendary forms: 412 Chordex rarity entries
- One additional permanent non-Titan monster added to every island
- Maximum 3 copies of any species
- Duplicate copies are phase-locked: every copy of one species performs on the exact same musical instant instead of creating delayed echoes
- Premium results upgrade exactly one eligible copy and can never downgrade a stronger copy
- Hard 60-minute maximum for the complete Breed -> Hatch journey

## Music rebuild
- 8 synchronized song tracks: drums, percussion, bass, chords, lead, vocals, world FX, and Titan layer
- 32-step arrangements with island-specific tempo, root, progression, vocal phrase, and environmental effect
- Original spoken phrase drops followed by FX and chord hits
- Creature timbres use their physical designs and elements; duplicate monsters thicken one synchronized sound instead of replaying it late
- Example: Grovegrand performs synchronized hoof stomps, antler knocks, and foliage rustle, while its visible legs, antlers, and leaf mane animate with the hit
- 8-track mixer lets tracks be muted individually

## Creature visuals
- No emoji monster balls
- Monsters are drawn in-game as original SVG creatures with bodies, limbs, faces, instruments, horns, wings, foliage, shells, crystals, machinery, and other anatomy
- Sound-role animations change the relevant body parts: mouths sing, hooves stomp, wings snap, drums compress, horns move, Titan cores pulse, rings expand, and foliage shakes
- Islands have custom illustrated SVG scenery rather than a flat emoji backdrop
- Currency, navigation, buildings, quests, and games use custom CSS/SVG UI symbols rather than emoji

## Titans
- Every breeding attempt has a flat 2% Titan roll for the current island
- Titan Shards provide a guaranteed second route
- 12 Titan Shards can summon the island's Titan through the Titan Resonator
- Shards come from 2-hour quest-board clears, daily streak rewards, mini-game milestones, and strong arcade runs

## Halloween: Night of Echoes
- Event currency: Hex Candy
- 3 seasonal monsters on every island, 21 total
- Hex Candy comes from breeding, hatching, repeatable quests, daily rewards, and mini-games during the event
- Halloween acquisition automatically closes at **12:00 AM on November 2** according to the device clock
- After the cutoff, Hex Candy stops dropping and event monsters cannot be bought or rolled from breeding
- Seasonal monsters already owned remain usable forever

## Economy and progression balance
- Daily Resonance rewards scale with the player's total orchestra income, with much larger Day 7 rewards
- Monster income rises 22% per level
- Storage grows quadratically with level instead of barely changing
- Titans receive a very large storage multiplier so high-income Titans do not fill their banks in seconds
- Stars can be spent on Rare/Epic/Legendary eggs, permanent island income amplifiers, cosmetics, and timer finishes
- 20 permanent quests
- Exactly 10 repeatable quests refresh together every 2 hours
- Clearing all 10 repeatables grants a board bonus including Titan Shards
- Arcade rewards scale with progression and contribute toward guaranteed Titan Shards

## iPhone / iPad
- Touch-first controls
- Safe-area support for modern iPhone/iPad screens
- Apple touch icon and PWA manifest
- Offline service-worker cache
- Local browser saving plus save-code export/import

## GitHub Pages
Every file belongs directly in the repository root. There are no folders inside the release ZIP.

1. Extract the ZIP.
2. Upload all 7 files directly to the GitHub repository root.
3. Open **Settings -> Pages**.
4. Choose **Deploy from a branch**.
5. Select the main branch and `/ (root)`.
6. Save and open the Pages URL after deployment.

## Files
- `index.html`
- `style.css`
- `game.js`
- `manifest.json`
- `sw.js`
- `icon.png`
- `README.md`

Progress is stored with browser `localStorage`. Clearing Safari website data can remove it, so export a save code from Settings before clearing browser data or moving devices.
