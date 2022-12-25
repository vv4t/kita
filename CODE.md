# CODE

## File organisation

- src: main game code
  - src/main.js: entry point
  - src/game: game logic
  - src/gfx: all things graphics related (renderer, gui, sprite map)
  - src/util: utility scripts (math, file loading)
- tools: (for now) map and sprite map parsing tools
  - tools/tmx: convert tiled .tmx to .map
  - tools/tsx: convert tiled .tsx to .spr
- assets: resources the game uses (pictures, sound, maps)
  - assets/map: maps
  - assets/spr: sprite maps
  - assets/sky: sky panorama images

## Architecture

### Input

The game does not directly poll for input. Rather, main.js polls for input and
transforms them into "UserCommands" which are structs containing all the
player's continuous inputs such as forward, left, right, back, attack, etc.

I plan for single key presses for things such as opening menu or inventory to be
accessed in the Game class through a "binding system" like in source games, e.g:

> bindKey(KEY\_E, openMenu)

bindKey being a function called which maps "openMenu" (a callback function) to
be triggered whenever the key is pressed.

I'm probably gonna replace this with a command system like in source engine.

### Game

I haven't implemented it yet but I'm deciding between distinct classes vs an
entity system. Probably should go with the entity system?

From the outside, the game has an "update" function which advances the game
state given how much time has passed, "delta", and the userCommand for the
frame.

Haven't worked on this too much yet so not much to say.

### Rendering

No rendering should take place in the Game class (except for maybe debugging?).
Instead, ther renderer takes in a game object as input then renders its
properties.

Definitions:

RenderWall: walls go down the middle of the tile, not blocks (for windows or
doors)

At the moment, the renderer has the following functions:

- mapLoad(): load the map for the renderer to draw
- renderWalls(): render all the RenderWalls
- renderSprite(): draw a sprite at a certain position (sprites always face the camera)
- renderWall(): draw a wall (this is not used in renderMap)
- renderMap(): draw the map

I should probably label these better lol

## Tiled and custom file formats

The Tiled Editor is used currently to edit both maps and sprite maps. However,
tiled editor maps are parsed to a custom format specific to the game.

The justification for this is that tiled map formats may contain extra
information unecessary to the engine or they can be organised into a way easier
to parse for the game itself. Features specific to the game, such as "walls" in
this case, are more explicitly described in the .map format. Furthermore, in the
future, tools other than Tiled may be used to generate maps such as procedural
map generation.

## Map system

(src/map.js)

Maps are stored in a .map file in (assets/map/\*.map) in JSON format. Loading it
is simply loading the file then parsing it as a JSON.

Maps can be generated using the "tmx2map" tool found in "tools/tmx". This can be
used with eg.

(in tools/tmx)
"node . saves/\<MY MAP\>.tmx ../../assets/map/\<MY MAP\>.map"

### Tiled tile encoding and format

In each sprite map, its sprite ID is its chronological position starting from
the top left, left to right, top to bottom.

Map data is essentially an array of these sprite IDs as a Uint32Array. Further
data is encoded in the last 3 bits. These bits are flags for how the tiled
should be transformed. Bits for horizontal, vertical and diagonal flipping allow
for the tile to be orientated in any way.

To retrieve the original sprite ID a bit mask can be used:

> spriteID = tile & 255
