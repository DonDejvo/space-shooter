# Space Shooter

A 2D top-down space shooter built on the provided engine.

## Controls

| Input | Action |
|-------|--------|
| WASD / Arrow Keys | Move ship |
| Mouse click + drag | Aim and shoot |
| Left touch half | Virtual joystick (move) |
| Right touch half | Aim and shoot |

## Game Flow

1. **Loading Screen** — Wallpaper + "LOADING…" button → turns green "START" once assets load
2. **Level 1–3** — 3 waves per level. Wave starts after a 3-second countdown.
   - Next wave triggers when 2/3 of current wave enemies are defeated
   - After all 3 waves: teleport gate spawns at center
   - Walk into the gate to advance to the next level
3. **After Level 3** — Victory, restarts from level 1

## Mechanics

- **Shield** (blue bar) — regenerates slowly for all ships
- **HP** (green bar) — enemies don't regen; player regenerates after 5s out of combat
- **Damage numbers** — red floats up when hit, green when healing
- **Enemies** — spawn in a ring at 0.4× map height radius, move toward player, shoot if in range (shorter range than player)
- **Minimap** — bottom-right; green dot = player, red dots = enemies, cyan diamond = teleport

## Asset Paths

```
assets/
  wallpaper.png     512×512 loading screen background
  playership.png    256×256 sprites, 4×4 sheet, 16 rotation frames (0 = up, CCW)
  enemyship.png     256×256 sprites, 4×4 sheet, 16 rotation frames
  lasers.png        256×256 sprites, 4×4 sheet; frames 0–7 blue (player), 8–15 red (enemy)
  explosion.png     256×256 sprites, 4×4 sheet, 16-frame animation
  teleport.png      256×256 sprites, 4×6 sheet (24 frames), activation animation
```

## Engine Changes Made

1. **`Scene.js`** — Added `_pending` removal guard; fixed `destroy()` to clear `_nodes`/`_layers`; used `shift()` instead of `pop()` for correct FIFO pending order; iterate with `[...nodes]` copy to allow mid-update removal.

2. **`Camera.js`** — Rewrote `computeMatrix()` so `camera.position` is the **center** of the view (not top-left). Added `screenToWorld()` helper. Updated `getBounds()` to be centered.

3. **`SceneNode.js`** — Added `this.scene = null` to constructor (was implicitly set but not initialized).

4. **`Drawable.js`** — Fixed `getBounds()` to correctly compute max from worldScale.

5. **`Animator.js`** — Added `onComplete` callback support to `play()`.
