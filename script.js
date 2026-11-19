const SAVE_KEY = 'tabQuestSharedRealm';
const MAX_HP = 100;
const TILE = 40;
const HERBS = [
  'Sunleaf', 'Moonmint', 'Redclover', 'Bluebell', 'Frostfern', 'Emberbloom',
  'Dewdrop Sage', 'Whisperroot', 'Goldpetal', 'Thornberry', 'Silverthyme',
  'Cloudcap', 'Starflower', 'Mossheart', 'Riverlily', 'Brambleleaf',
  'Dreamwort', 'Wild Basil', 'Duskmallow', 'Ambergrass', 'Snowdrop',
  'Stormseed', 'Glowcap', 'Kingsfoil'
];

const places = [
  { id: 'ruins', name: 'Oldstone Ruins', icon: '🏛️', biome: 'ruins', description: 'Broken pillars rise from the grass. Something glimmers beneath the stones.' },
  { id: 'highlands', name: 'Windward Highlands', icon: '⛰️', biome: 'mountain', description: 'A winding trail climbs above the clouds.' },
  { id: 'cave', name: 'Moonlit Cavern', icon: '🕯️', biome: 'cave', description: 'Blue crystals glow in the dark.' },
  { id: 'woods', name: 'Whispering Woods', icon: '🌲', biome: 'forest', description: 'Ancient trees hide herbs, sprites, and forest beasts.' },
  { id: 'meadow', name: 'Sunmeadow', icon: '🌾', biome: 'plains', description: 'Golden grass rolls beneath the sun.' },
  { id: 'lake', name: 'Crystal Lake', icon: '🏞️', biome: 'lake', description: 'Clear water laps at the shore.' },
  { id: 'harbor', name: 'Seabreeze Harbor', icon: '⛵', biome: 'harbor', description: 'Sailors trade stories beside the bright blue sea.' },
  { id: 'village', name: 'Willowbrook', icon: '🏘️', biome: 'village', description: 'A friendly village with a warm and welcoming inn.' },
  { id: 'volcano', name: 'Emberpeak', icon: '🌋', biome: 'volcano', description: 'Rare treasure is said to lie near the summit.' }
];
const views = {
  map: { label: 'The frontier', title: 'World map', tabName: 'Realm Map', icon: '🗺️' },
  inventory: { label: 'Your pack', title: 'Inventory', tabName: 'Inventory', icon: '🎒' },
  fight: { label: 'Danger nearby', title: 'Battle Arena', tabName: 'Battle Arena', icon: '⚔️' },
  shop: { label: 'Trade & supplies', title: 'Village Shop', tabName: 'Village Shop', icon: '🛒' },
  crafting: { label: 'Workshop', title: 'Crafting', tabName: 'Crafting', icon: '⚒️' },
  hero: { label: 'Your adventurer', title: 'Hero Profile', tabName: 'Hero Profile', icon: '🧙' }
};
const enemies = [
  { name: 'Forest wolf', icon: '🐺', hp: 42, rewardXp: 20, rewardGold: 11, color: '#72a85e' },
  { name: 'Cave goblin', icon: '👹', hp: 50, rewardXp: 25, rewardGold: 14, color: '#9a78c7' },
  { name: 'Young dragon', icon: '🐉', hp: 68, rewardXp: 36, rewardGold: 21, color: '#e07854' },
  { name: 'Slime blob', icon: '🟢', hp: 34, rewardXp: 16, rewardGold: 8, color: '#68c98a' },
  { name: 'Skeleton guard', icon: '💀', hp: 48, rewardXp: 23, rewardGold: 13, color: '#c5c4b6' },
  { name: 'Mischievous imp', icon: '👿', hp: 46, rewardXp: 23, rewardGold: 12, color: '#e47b69' },
  { name: 'Wild boar', icon: '🐗', hp: 58, rewardXp: 29, rewardGold: 16, color: '#c18b5f' },
  { name: 'Stone golem', icon: '🗿', hp: 78, rewardXp: 42, rewardGold: 25, color: '#9ca79e' }
];
const regionGrid = [['ruins', 'highlands', 'cave'], ['woods', 'village', 'meadow'], ['lake', 'harbor', 'volcano']];
const towns = [
  { id: 'oakheart', name: 'Oakheart Crossing', x: 5, y: 0, icon: '🏘️' },
  { id: 'brambleford', name: 'Brambleford', x: -7, y: 5, icon: '🏠' },
  { id: 'rivermill', name: 'Rivermill', x: 11, y: -7, icon: '🏡' }
];
const requestedView = new URLSearchParams(window.location.search).get('view');
const view = Object.hasOwn(views, requestedView) ? requestedView : 'map';

function freshGame() {
  return {
    xp: 0, gold: 25, hp: MAX_HP, location: 'village', visited: ['village'],
    playerX: 0, playerY: 0, facingX: 0, facingY: 1, weapon: false, axe: false,
    inventory: { potion: 2, herb: 0, herbTypes: {}, stone: 0, relic: 0, nuke: 0, wood: 0 },
    armor: false,
    battle: null, lastNuke: 0, treeHp: {}, cutTrees: [], openedChests: [], foundTowns: [], gatheredStones: [], gatheredHerbs: [],
    message: 'Welcome to the realm! Explore the frontier, gather supplies, and seek out the little towns.'
  };
}
function loadGame() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!saved || typeof saved !== 'object') return freshGame();
    const base = freshGame();
    return {
      ...base, ...saved,
      hp: Math.max(0, Math.min(MAX_HP, Number(saved.hp) || 0)),
      xp: Math.max(0, Number(saved.xp) || 0), gold: Math.max(0, Number(saved.gold) || 0),
      visited: Array.isArray(saved.visited) ? saved.visited : base.visited,
      playerX: Number.isFinite(Number(saved.playerX)) ? Number(saved.playerX) : 0,
      playerY: Number.isFinite(Number(saved.playerY)) ? Number(saved.playerY) : 0,
      facingX: Number(saved.facingX) || 0, facingY: Number(saved.facingY) || 1,
      weapon: Boolean(saved.weapon), axe: Boolean(saved.axe),
      inventory: { ...base.inventory, ...(saved.inventory || {}), herbTypes: { ...(saved.inventory?.herbTypes || {}) } },
      armor: Boolean(saved.armor),
      gatheredStones: Array.isArray(saved.gatheredStones) ? saved.gatheredStones : [],
      gatheredHerbs: Array.isArray(saved.gatheredHerbs) ? saved.gatheredHerbs : [],
      treeHp: saved.treeHp && typeof saved.treeHp === 'object' ? saved.treeHp : {},
      cutTrees: Array.isArray(saved.cutTrees) ? saved.cutTrees : [],
      openedChests: Array.isArray(saved.openedChests) ? saved.openedChests : [],
      foundTowns: Array.isArray(saved.foundTowns) ? saved.foundTowns : [],
      lastNuke: Number(saved.lastNuke) || 0
    };
  } catch { return freshGame(); }
}
let game = loadGame();
const content = document.getElementById('viewContent');
const message = document.getElementById('gameMessage');
let alertPhase = false;
let chopTimer;

function updateTabIdentity() {
  const battleActive = Boolean(game.battle);
  const titleAlert = battleActive && alertPhase;
  const alertText = view === 'fight' ? '⚔️ FIGHT NOW! — ' : '⚔️ GO TO BATTLE! — ';
  document.title = `${titleAlert ? alertText : ''}${views[view].tabName} | Tab Quest`;
  const icon = views[view].icon;
  const bg = titleAlert && view === 'fight' ? '#a84435' : '#26372d';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${bg}"/><text x="32" y="47" text-anchor="middle" font-size="44">${icon}</text></svg>`;
  document.getElementById('appFavicon').href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  document.querySelector('.tab-nav a[data-view="fight"]').classList.toggle('battle-alert', battleActive);
}
function saveGame() { localStorage.setItem(SAVE_KEY, JSON.stringify(game)); render(); }
function placeById(id) { return places.find((p) => p.id === id) || places.find((p) => p.id === 'village'); }
function updateHeroCard() {
  const level = Math.floor(game.xp / 100) + 1;
  document.getElementById('heroName').textContent = `Wayfarer · Lv. ${level}`;
  document.getElementById('heroLevel').textContent = level;
  document.getElementById('heroXp').textContent = `${game.xp} XP`;
  document.getElementById('heroGold').textContent = game.gold;
  document.getElementById('heroLocation').textContent = placeById(game.location).name;
  document.getElementById('heroHp').textContent = `${game.hp} / ${MAX_HP}`;
  document.getElementById('healthFill').style.width = `${game.hp}%`;
  document.querySelector('.health-track').setAttribute('aria-valuenow', game.hp);
}
function regionAt(x, y) {
  const wrap = (n) => ((n % 3) + 3) % 3;
  return placeById(regionGrid[wrap(Math.floor((y + 15) / 30) + 1)][wrap(Math.floor((x + 15) / 30) + 1)]);
}
function hashAt(x, y, salt = 0) {
  const value = Math.sin((x + 37 + salt) * 127.1 + (y - 19 - salt) * 311.7) * 43758.5453;
  return value - Math.floor(value);
}
function coordKey(x, y) { return `${x},${y}`; }
function townAt(x, y) { return towns.find((town) => town.x === x && town.y === y); }
function terrainAt(x, y) {
  if (townAt(x, y)) return 'town';
  if (game.cutTrees.includes(coordKey(x, y))) return 'grass';
  if (x === 0 && y === 0) return 'grass';
  const roll = hashAt(x, y);
  if (roll < 0.055) return 'water';
  if (roll < 0.19) return 'tree';
  if (roll < 0.235) return 'stone';
  if (roll < 0.31) return 'flowers';
  return 'grass';
}
function biomePalette(place) {
  const palettes = {
    forest: ['#456f45', '#527f4d', '#345c3d'], plains: ['#988b4e', '#a69a58', '#777942'],
    lake: ['#397c8a', '#4a8990', '#315c72'], harbor: ['#547b8d', '#6a8990', '#3f6877'],
    mountain: ['#777d70', '#8a8974', '#5f695f'], ruins: ['#77766a', '#8c866f', '#635f58'],
    cave: ['#514d70', '#635c82', '#403c60'], volcano: ['#8e513d', '#a85d3d', '#633c35'],
    village: ['#65814b', '#789153', '#536d43']
  };
  return palettes[place.biome] || palettes.forest;
}
function drawTree(ctx, x, y, damaged = false) {
  ctx.fillStyle = '#60452f'; ctx.fillRect(x + 17, y + 23, 7, 14);
  ctx.fillStyle = '#244b37'; ctx.fillRect(x + 9, y + 12, 22, 15);
  ctx.fillStyle = '#326545'; ctx.fillRect(x + 5, y + 8, 16, 13);
  ctx.fillStyle = '#40774a'; ctx.fillRect(x + 15, y + 4, 17, 15);
  if (damaged) { ctx.fillStyle = '#e6d39b'; ctx.fillRect(x + 14, y + 26, 5, 3); }
}
function drawTown(ctx, x, y) {
  ctx.fillStyle = '#6d4c34'; ctx.fillRect(x + 8, y + 20, 24, 16);
  ctx.fillStyle = '#bc7650'; ctx.fillRect(x + 5, y + 14, 30, 9);
  ctx.fillStyle = '#f1d18c'; ctx.fillRect(x + 12, y + 25, 6, 6); ctx.fillRect(x + 23, y + 25, 6, 6);
  ctx.fillStyle = '#694239'; ctx.fillRect(x + 19, y + 28, 5, 8);
  ctx.fillStyle = '#9bc06d'; ctx.fillRect(x + 4, y + 35, 32, 3);
}
function drawWorld() {
  const canvas = document.getElementById('worldMap');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const columns = canvas.width / TILE, rows = canvas.height / TILE;
  const startX = game.playerX - Math.floor(columns / 2), startY = game.playerY - Math.floor(rows / 2);
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < columns; col += 1) {
      const wx = startX + col, wy = startY + row;
      const x = col * TILE, y = row * TILE;
      const biome = biomePalette(regionAt(wx, wy));
      const terrain = terrainAt(wx, wy);
      ctx.fillStyle = terrain === 'water' ? '#377d91' : biome[hashAt(wx, wy, 4) > .55 ? 1 : 0];
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = 'rgba(20,35,28,.15)'; ctx.fillRect(x, y + TILE - 2, TILE, 2); ctx.fillRect(x + TILE - 2, y, 2, TILE);
      if (terrain === 'water') {
        ctx.fillStyle = '#6db3b8'; ctx.fillRect(x + 7, y + 12, 17, 2); ctx.fillRect(x + 18, y + 27, 14, 2);
      } else if (terrain === 'tree') {
        const hp = Number(game.treeHp[coordKey(wx, wy)] ?? 12);
        drawTree(ctx, x, y, hp < 12);
        if (hp < 12) { ctx.fillStyle = '#4b201c'; ctx.fillRect(x + 10, y + 5, 20, 3); ctx.fillStyle = '#82dc78'; ctx.fillRect(x + 10, y + 5, 20 * hp / 12, 3); }
      } else if (terrain === 'stone') {
        ctx.fillStyle = '#555d58'; ctx.fillRect(x + 9, y + 20, 22, 13);
        ctx.fillStyle = '#9da59a'; ctx.fillRect(x + 13, y + 15, 14, 12);
        ctx.fillStyle = '#c2c5b3'; ctx.fillRect(x + 16, y + 17, 6, 3);
      } else if (terrain === 'flowers') {
        ctx.fillStyle = '#f4d881'; ctx.fillRect(x + 9, y + 13, 4, 4); ctx.fillRect(x + 27, y + 26, 4, 4);
      }
      if (terrain !== 'water' && hashAt(wx, wy, 17) < .023 && !townAt(wx, wy)) {
        ctx.fillStyle = '#d4b16a'; ctx.fillRect(x + 10, y + 9, 20, 19);
        ctx.fillStyle = '#765338'; ctx.fillRect(x + 8, y + 7, 24, 7);
        ctx.fillStyle = '#ffdf84'; ctx.fillRect(x + 17, y + 15, 5, 5);
      }
      if (terrain !== 'water' && hashAt(wx, wy, 39) < .035) {
        ctx.fillStyle = '#39572e'; ctx.fillRect(x + 18, y + 23, 5, 9);
        ctx.fillStyle = '#86bf57'; ctx.fillRect(x + 11, y + 15, 8, 8); ctx.fillRect(x + 22, y + 13, 9, 10);
      }
      if (townAt(wx, wy)) drawTown(ctx, x, y);
    }
  }
  const px = Math.floor(columns / 2) * TILE, py = Math.floor(rows / 2) * TILE;
  // Small, crisp adventurer sprite with a hood, face, cloak and walking-step detail.
  ctx.fillStyle = 'rgba(15,24,20,.35)'; ctx.fillRect(px + 10, py + 31, 20, 5);
  ctx.fillStyle = '#5a3d2e'; ctx.fillRect(px + 12, py + 19, 16, 15);
  ctx.fillStyle = '#5278b5'; ctx.fillRect(px + 10, py + 20, 20, 12);
  ctx.fillStyle = '#e9bc8b'; ctx.fillRect(px + 15, py + 10, 12, 12);
  ctx.fillStyle = '#5a392d'; ctx.fillRect(px + 13, py + 7, 16, 7); ctx.fillRect(px + 11, py + 12, 4, 6);
  ctx.fillStyle = '#322d28'; ctx.fillRect(px + 22, py + 15, 2, 2);
  ctx.fillStyle = '#d8b467'; ctx.fillRect(px + 14, py + 31, 6, 5); ctx.fillRect(px + 23, py + 31, 6, 5);
  if (game.weapon) { ctx.fillStyle = '#deddd0'; ctx.fillRect(px + 30, py + 12, 3, 17); ctx.fillStyle = '#8c6741'; ctx.fillRect(px + 29, py + 26, 5, 3); }
  ctx.fillStyle = 'rgba(16,28,26,.82)'; ctx.fillRect(8, 8, 238, 27);
  ctx.fillStyle = '#fff2cf'; ctx.font = 'bold 13px system-ui';
  const town = townAt(game.playerX, game.playerY);
  ctx.fillText(`${town ? town.name : placeById(game.location).name} · ${game.playerX}, ${game.playerY}`, 15, 26);
}
function targetTree() {
  const x = game.playerX + game.facingX, y = game.playerY + game.facingY;
  return terrainAt(x, y) === 'tree' ? { x, y, hp: Number(game.treeHp[coordKey(x, y)] ?? 12) } : null;
}
function renderMap() {
  const place = placeById(game.location);
  const town = townAt(game.playerX, game.playerY);
  const target = targetTree();
  content.innerHTML = `<p class="muted">Explore a pixel-art wilderness. Move with <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrows. Forests, lakes, highlands and other biomes have their own look. Find the little towns, herbs and hidden chests!</p><div class="map-frame"><canvas id="worldMap" class="world-map" width="720" height="440" role="img" aria-label="Pixel art wilderness map. Use WASD or arrow keys to explore and face a tree, then press Space to chop it."></canvas><div class="chop-smear" aria-hidden="true"></div></div><p class="world-hint">🌲 Forest · 🌼 Meadow · 🌊 Water · 🌿 Herbs · 🧰 Rare chest · 🏘️ Town</p>${target ? `<div class="tree-status"><span>🌳 Tree health</span><div class="tree-health-track"><div style="width:${Math.max(0, target.hp / 12 * 100)}%"></div></div><strong>${target.hp} / 12</strong></div>` : ''}<div class="location-banner"><span class="big-icon">${town ? town.icon : place.icon}</span><div><h3>${town ? town.name : place.name}</h3><p class="place-description">${town ? `You found ${town.name}! A safe stop on the road. Towns are excellent places to sell your gathered goods.` : place.description}</p></div></div><div class="action-row"><button class="action-button" type="button" data-action="explore" ${game.hp <= 0 ? 'disabled' : ''}>🔎 Explore this area</button>${game.location === 'village' ? `<button class="action-button secondary" type="button" data-action="rest" ${game.hp >= MAX_HP || game.gold < 5 ? 'disabled' : ''}>🛏️ Rest at the inn (5 gold)</button>` : ''}<a class="action-button secondary" href="?view=shop" target="_blank">🛒 Trade supplies</a><a class="action-button secondary" href="?view=fight" target="_blank">⚔️ Battle tab</a></div><div class="quest-box"><strong>Realm quest: Chart the frontier</strong><br>Visit 3 different biomes · ${Math.min(game.visited.length, 3)} / 3 discovered · Towns found ${game.foundTowns.length} / ${towns.length}</div>`;
  drawWorld();
}
function walk(dx, dy) {
  if (game.hp <= 0) return;
  game.facingX = dx; game.facingY = dy;
  const nx = game.playerX + dx, ny = game.playerY + dy;
  if (['water', 'tree'].includes(terrainAt(nx, ny))) { game.message = 'The terrain blocks your way. Face a tree and press Space to chop it with your axe.'; render(); return; }
  game.playerX = nx; game.playerY = ny;
  const destination = regionAt(nx, ny);
  if (destination.id !== game.location) {
    game.location = destination.id;
    if (!game.visited.includes(destination.id)) { game.visited.push(destination.id); game.message = `You discovered the ${destination.name} biome!`; }
    else game.message = `You travel through the ${destination.name} biome.`;
  }
  const town = townAt(nx, ny);
  if (town && !game.foundTowns.includes(town.id)) {
    game.foundTowns.push(town.id); game.message = `You discovered ${town.name}! You can trade gathered goods in the shop.`;
  }
  const tileKey = coordKey(nx, ny);
  if (terrainAt(nx, ny) === 'stone' && !game.gatheredStones.includes(tileKey)) {
    game.gatheredStones.push(tileKey);
    game.inventory.stone = (Number(game.inventory.stone) || 0) + 1;
    game.message = 'You collect a sturdy stone. (+1 stone)';
  }
  if (terrainAt(nx, ny) !== 'water' && hashAt(nx, ny, 39) < .035 && !game.gatheredHerbs.includes(tileKey)) {
    game.gatheredHerbs.push(tileKey);
    const herb = HERBS[Math.floor(hashAt(nx, ny, 51) * HERBS.length)];
    game.inventory.herb = (Number(game.inventory.herb) || 0) + 1;
    game.inventory.herbTypes[herb] = (Number(game.inventory.herbTypes[herb]) || 0) + 1;
    game.message = `You gather ${herb}. (+1 herb)`;
  }
  const chestKey = coordKey(nx, ny);
  if (terrainAt(nx, ny) !== 'water' && hashAt(nx, ny, 17) < .023 && !game.openedChests.includes(chestKey)) {
    game.openedChests.push(chestKey);
    const roll = Math.random();
    if (roll < .45) { game.gold += 18; game.message = 'A rare chest! You find 18 gold inside.'; }
    else if (roll < .75) { game.inventory.potion += 1; game.message = 'A rare chest! You find a health potion inside.'; }
    else { game.inventory.relic += 1; game.message = 'A rare chest! You uncover an ancient relic.'; }
  }
  saveGame();
}
function chopTree() {
  if (!game.axe) { game.message = 'You need an axe to chop trees. You can buy one at the Village Shop.'; render(); return; }
  const tree = targetTree();
  if (!tree) { game.message = 'Face a nearby tree with a movement key, then press Space to chop.'; render(); return; }
  const key = coordKey(tree.x, tree.y);
  const hp = Math.max(0, tree.hp - 3);
  game.treeHp[key] = hp;
  const frame = document.querySelector('.chop-smear');
  if (frame) { frame.classList.remove('swing'); void frame.offsetWidth; frame.classList.add('swing'); }
  clearTimeout(chopTimer);
  chopTimer = window.setTimeout(() => document.querySelector('.chop-smear')?.classList.remove('swing'), 300);
  if (hp <= 0) {
    game.cutTrees.push(key); delete game.treeHp[key];
    game.inventory.wood = (Number(game.inventory.wood) || 0) + 3;
    game.message = 'Timber! The tree falls and you collect 3 wood.';
  } else game.message = `Chop! Your axe deals 3 damage. The tree has ${hp} / 12 health.`;
  saveGame();
}
function renderInventory() {
  const items = [
    { id: 'potion', icon: '🧪', name: 'Health potion', detail: 'Restore up to 40 health. Use from your pack.' },
    { id: 'herb', icon: '🌿', name: 'Herbs', detail: `${HERBS.length} varieties discovered in the wild. Visit Crafting to see your collection.` },
    { id: 'stone', icon: '🪨', name: 'Stones', detail: 'Gather the gray stone deposits scattered across the map. Used for crafting.' },
    { id: 'wood', icon: '🪵', name: 'Wood', detail: 'Chop trees with an axe. Useful for crafting and worth 3 gold each.' },
    { id: 'relic', icon: '💎', name: 'Ancient relic', detail: 'A rare find from hidden chests and old places.' },
    { id: 'nuke', icon: '☢️', name: 'Totally harmless joke nuke', detail: 'A one-use battle item. It costs a ridiculous 10,000 gold.' }
  ];
  content.innerHTML = `<p class="muted">Everything you gather is shared with your other game tabs. Craft useful supplies or sell your surplus wood and herbs.</p><div class="inventory-list">${items.map((item) => `<div class="inventory-item"><div><strong>${item.icon} ${item.name}</strong><p>${item.detail}</p></div><span class="item-count">×${Number(game.inventory[item.id]) || 0}</span>${item.id === 'potion' ? `<button class="action-button secondary" type="button" data-action="use-potion" ${game.inventory.potion < 1 || game.hp >= MAX_HP ? 'disabled' : ''}>Use</button>` : item.id === 'nuke' ? `<button class="action-button danger" type="button" data-action="use-nuke" ${game.inventory.nuke < 1 || !game.battle ? 'disabled' : ''}>Use in battle</button>` : ''}</div>`).join('')}</div><div class="action-row"><button class="action-button secondary" type="button" data-action="craft-potion" ${game.inventory.herb < 2 || game.inventory.wood < 1 ? 'disabled' : ''}>🧪 Craft potion (2 herbs + 1 wood)</button><a class="action-button secondary" href="?view=crafting" target="_blank">⚒️ Crafting & herb collection</a><a class="action-button secondary" href="?view=shop" target="_blank">🛒 Sell goods / shop</a></div>`;
}
function renderFight() {
  if (game.battle) {
    const enemy = game.battle;
    content.innerHTML = `<p class="muted">Turn ${enemy.turn || 1} · Your turn. Choose one move, then the enemy responds. Watch its intent and use Brace to soften an incoming hit.</p><div class="battle-scene" style="--enemy-glow:${enemy.color || '#e5bd68'}"><div class="battle-sparkles" aria-hidden="true">✦　✧　✦</div><span class="enemy-icon" aria-hidden="true">${enemy.icon}</span><h3>${enemy.name}</h3><p class="enemy-health">${enemy.hp} / ${enemy.maxHp} HP</p><div class="health-track"><div style="width:${Math.max(0, enemy.hp / enemy.maxHp * 100)}%;height:100%;background:linear-gradient(90deg,#b95148,#ef9570)"></div></div><p class="enemy-intent">${enemy.intent === 'heavy' ? '⚠️ Winding up a heavy attack!' : '👀 Watching for an opening…'}</p></div><div class="action-row"><button class="action-button danger" type="button" data-action="attack" ${game.hp <= 0 ? 'disabled' : ''}>🗡️ Quick strike</button><button class="action-button" type="button" data-action="heavy-attack" ${game.hp <= 0 ? 'disabled' : ''}>💥 Heavy strike</button><button class="action-button secondary" type="button" data-action="guard" ${game.hp <= 0 ? 'disabled' : ''}>🛡️ Brace</button><button class="action-button secondary" type="button" data-action="use-potion" ${game.inventory.potion < 1 || game.hp >= MAX_HP ? 'disabled' : ''}>🧪 Potion (${game.inventory.potion})</button><button class="action-button danger" type="button" data-action="use-nuke" ${game.inventory.nuke < 1 ? 'disabled' : ''}>☢️ Nuke (${game.inventory.nuke || 0})</button><button class="action-button secondary" type="button" data-action="flee">🏃 Flee</button></div>`;
    return;
  }
  content.innerHTML = `<p class="muted">Explore to trigger an encounter, or start a fight here. Your attacks, gear and healing are shared between tabs.</p><div class="enemy-card"><span class="enemy-icon" aria-hidden="true">🐉</span><h3>No active battle</h3><p class="place-description">A creature may be lurking near ${placeById(game.location).name}.</p></div><div class="action-row"><button class="action-button danger" type="button" data-action="encounter" ${game.hp <= 0 ? 'disabled' : ''}>⚔️ Find an opponent</button><a class="action-button secondary" href="?view=inventory" target="_blank">🎒 Open inventory</a><a class="action-button secondary" href="?view=shop" target="_blank">🛒 Visit shop</a></div>${game.hp <= 0 ? '<p class="quest-box">Your health is empty. Travel to Willowbrook and rest at the inn before fighting again.</p>' : ''}`;
}
function renderShop() {
  content.innerHTML = `<p class="muted">Trade in the towns you discover. This shop stocks tools and supplies; gathered wood and herbs can be sold for gold.</p><div class="inventory-list"><div class="inventory-item"><div><strong>🪓 Woodcutter's axe</strong><p>${game.axe ? 'Owned — press Space on the map while facing a tree to chop it (3 damage per swing).' : 'Required for chopping trees. Trees have 12 HP; each swing deals 3 damage and gives 3 wood.'}</p></div><strong>${game.axe ? 'Owned' : '30 gold'}</strong><button class="action-button secondary" type="button" data-action="buy-axe" ${game.axe || game.gold < 30 ? 'disabled' : ''}>${game.axe ? 'Owned' : 'Buy'}</button></div><div class="inventory-item"><div><strong>🧪 Health potion</strong><p>Restore up to 40 health. You have ${game.inventory.potion}.</p></div><strong>12 gold</strong><button class="action-button secondary" type="button" data-action="buy-potion" ${game.gold < 12 ? 'disabled' : ''}>Buy</button></div><div class="inventory-item"><div><strong>🗡️ Iron sword</strong><p>${game.weapon ? 'Owned — attacks deal extra damage.' : 'A sturdy blade that increases your battle damage.'}</p></div><strong>${game.weapon ? 'Owned' : '35 gold'}</strong><button class="action-button secondary" type="button" data-action="buy-sword" ${game.weapon || game.gold < 35 ? 'disabled' : ''}>${game.weapon ? 'Owned' : 'Buy'}</button></div><div class="inventory-item"><div><strong>🪵 Sell wood</strong><p>You have ${game.inventory.wood} wood · 3 gold each.</p></div><strong>+${(Number(game.inventory.wood) || 0) * 3} gold</strong><button class="action-button secondary" type="button" data-action="sell-wood" ${game.inventory.wood < 1 ? 'disabled' : ''}>Sell all</button></div><div class="inventory-item"><div><strong>🌿 Sell herbs</strong><p>You have ${game.inventory.herb} herbs · 5 gold each.</p></div><strong>+${(Number(game.inventory.herb) || 0) * 5} gold</strong><button class="action-button secondary" type="button" data-action="sell-herbs" ${game.inventory.herb < 1 ? 'disabled' : ''}>Sell all</button></div><div class="inventory-item"><div><strong>☢️ Totally harmless joke nuke</strong><p>One-use item that instantly ends your current battle.</p></div><strong>10,000 gold</strong><button class="action-button danger" type="button" data-action="buy-nuke" ${game.gold < 10000 ? 'disabled' : ''}>Buy</button></div></div><div class="quest-box"><strong>Crafting</strong><br>Make a health potion in your inventory using 2 herbs and 1 wood.</div>`;
}
function renderCrafting() {
  const ownedHerbs = HERBS.filter((herb) => Number(game.inventory.herbTypes[herb]) > 0);
  content.innerHTML = `<p class="muted">Turn gathered herbs, wood, and stones into useful gear. There are ${HERBS.length} herb varieties to discover; find herb patches while exploring, and collect stone deposits by walking over them.</p><div class="crafting-recipe"><div><strong>🛡️ Woodland armor</strong><p>Wearable armor reduces incoming battle damage by 30%.</p><small>Requires 8 wood · 8 stones · 5 herbs</small></div><button class="action-button secondary" type="button" data-action="craft-armor" ${game.armor || game.inventory.wood < 8 || game.inventory.stone < 8 || game.inventory.herb < 5 ? 'disabled' : ''}>${game.armor ? 'Crafted' : 'Craft armor'}</button></div><div class="crafting-recipe"><div><strong>🧪 Healing potion</strong><p>Restore up to 40 health; usable from your pack or during your turn in battle.</p><small>Requires 2 herbs · 1 wood</small></div><button class="action-button secondary" type="button" data-action="craft-potion" ${game.inventory.herb < 2 || game.inventory.wood < 1 ? 'disabled' : ''}>Craft potion</button></div><div class="quest-box"><strong>Materials on hand</strong><br>🪵 ${game.inventory.wood} wood · 🪨 ${game.inventory.stone} stones · 🌿 ${game.inventory.herb} herbs</div><h3 class="herb-heading">Herb field guide · ${ownedHerbs.length} / ${HERBS.length} found</h3><div class="herb-grid">${HERBS.map((herb) => `<div class="herb-entry ${game.inventory.herbTypes[herb] ? 'discovered' : ''}"><span>🌿</span><strong>${game.inventory.herbTypes[herb] ? herb : 'Unknown herb'}</strong><small>×${Number(game.inventory.herbTypes[herb]) || 0}</small></div>`).join('')}</div>`;
}
function renderHero() {
  const level = Math.floor(game.xp / 100) + 1;
  content.innerHTML = `<p class="muted">Your pixel adventurer and gathered resources are shared across every game tab.</p><div class="hero-detail hero-profile"><div class="profile-sprite" aria-hidden="true">🧙</div><div><h3>Wayfarer · Level ${level}</h3><p>${game.xp} / ${level * 100} XP to next level · ${game.hp} / ${MAX_HP} health</p><p>Home biome: ${placeById(game.location).name} · Gold: ${game.gold}</p></div></div><div class="inventory-list"><div class="inventory-item"><strong>🗡️ Iron sword</strong><span>${game.weapon ? 'Equipped' : 'Not owned'}</span></div><div class="inventory-item"><strong>🪓 Woodcutter's axe</strong><span>${game.axe ? 'Owned' : 'Not owned'}</span></div><div class="inventory-item"><strong>🛡️ Woodland armor</strong><span>${game.armor ? 'Equipped · 30% damage reduction' : 'Not crafted'}</span></div><div class="inventory-item"><strong>🎒 Pack</strong><span>🪵 ${game.inventory.wood} · 🪨 ${game.inventory.stone} · 🌿 ${game.inventory.herb} · 🧪 ${game.inventory.potion}</span></div></div><div class="quest-box"><strong>Frontier explorer</strong><br>Biomes discovered: ${game.visited.length} / ${places.length} · Towns found: ${game.foundTowns.length} / ${towns.length} · Rare chests opened: ${game.openedChests.length}</div><div class="action-row"><a class="action-button secondary" href="?view=map" target="_blank">🗺️ Open map</a><a class="action-button secondary" href="?view=inventory" target="_blank">🎒 Open inventory</a><a class="action-button secondary" href="?view=crafting" target="_blank">⚒️ Crafting</a></div>`;
}
function render() {
  game = loadGame(); updateHeroCard();
  document.getElementById('viewLabel').textContent = views[view].label;
  document.getElementById('viewTitle').textContent = views[view].title;
  document.getElementById('viewIcon').textContent = views[view].icon;
  document.querySelectorAll('.tab-nav a').forEach((link) => {
    link.classList.toggle('active', link.dataset.view === view);
    if (link.dataset.view === view) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
  });
  if (view === 'map') renderMap(); else if (view === 'inventory') renderInventory(); else if (view === 'fight') renderFight(); else if (view === 'shop') renderShop(); else if (view === 'crafting') renderCrafting(); else renderHero();
  if (game.lastNuke && Date.now() - game.lastNuke < 10000) content.insertAdjacentHTML('afterbegin', '<div class="nuke-effect" role="img" aria-label="Nuke explosion animation"><div class="pixel-blast">✹</div><strong>BOOM!</strong></div>');
  message.textContent = game.message || ''; updateTabIdentity();
}
function makeBattle() {
  const foe = enemies[Math.floor(Math.random() * enemies.length)];
  game.battle = { ...foe, maxHp: foe.hp, turn: 1, intent: Math.random() < .28 ? 'heavy' : 'normal' };
  game.message = `A ${foe.name.toLowerCase()} appears! Watch its moves and choose your action.`;
}
function enemyTurn(guarding = false) {
  if (!game.battle) return;
  const heavy = game.battle.intent === 'heavy';
  const raw = (heavy ? 12 : 5) + Math.floor(Math.random() * (heavy ? 9 : 10));
  const armoredDamage = game.armor ? Math.ceil(raw * .7) : raw;
  const damage = guarding ? Math.max(1, Math.floor(armoredDamage * .25)) : armoredDamage;
  game.hp = Math.max(0, game.hp - damage);
  if (game.hp <= 0) {
    const lost = Math.ceil(game.gold * .2);
    game.gold = Math.max(0, game.gold - lost); game.battle = null; game.location = 'village';
    game.message = `You were defeated and woke in Willowbrook. You lost ${lost} gold. Rest at the inn to recover.`;
  } else {
    game.battle.turn = (Number(game.battle.turn) || 1) + 1;
    game.battle.intent = Math.random() < .3 ? 'heavy' : 'normal';
    game.message += ` The ${game.battle.name.toLowerCase()} ${heavy ? 'slams' : 'strikes'} for ${damage} damage${game.armor ? ' (armor absorbs some damage)' : ''}${guarding ? ' (your guard softened the blow)' : ''}. Your turn!`;
  }
}
function act(action) {
  if (action === 'explore') {
    if (game.hp <= 0) return;
    const xp = 8 + Math.floor(Math.random() * 8), gold = 2 + Math.floor(Math.random() * 8);
    game.xp += xp; game.gold += gold;
    if (Math.random() < .28) { makeBattle(); game.message += ` Your discoveries earn ${xp} XP and ${gold} gold!`; }
    else if (Math.random() < .35) { game.inventory.herb += 1; game.message = `You find a healing herb while exploring. (+${xp} XP, +${gold} gold)`; }
    else game.message = `You explore ${placeById(game.location).name} and earn ${xp} XP and ${gold} gold.`;
  } else if (action === 'encounter') { if (game.hp <= 0) return; makeBattle(); }
  else if (action === 'buy-axe') {
    if (game.axe || game.gold < 30) return;
    game.gold -= 30; game.axe = true; game.message = 'You bought a woodcutter’s axe! Face a tree on the map and press Space to chop.';
  } else if (action === 'buy-nuke') {
    if (game.gold < 10000) return;
    game.gold -= 10000; game.inventory.nuke = (Number(game.inventory.nuke) || 0) + 1; game.message = 'You bought a totally harmless joke nuke. Handle with dramatic caution.';
  } else if (action === 'use-nuke') {
    if (!game.battle || game.inventory.nuke < 1) return;
    const { name, rewardXp, rewardGold } = game.battle;
    game.inventory.nuke -= 1; game.xp += rewardXp; game.gold += rewardGold; game.battle = null; game.lastNuke = Date.now();
    game.message = `BOOM! The joke nuke defeated the ${name.toLowerCase()}! You earn ${rewardXp} XP and ${rewardGold} gold.`;
  } else if (action === 'attack' || action === 'heavy-attack') {
    if (!game.battle || game.hp <= 0) return;
    const heavy = action === 'heavy-attack';
    const critical = Math.random() < (heavy ? .35 : .18);
    const damage = heavy ? 19 + Math.floor(Math.random() * 12) : 12 + Math.floor(Math.random() * 10);
    const dealt = (damage + (game.weapon ? 8 : 0)) * (critical ? 2 : 1);
    game.battle.hp = Math.max(0, game.battle.hp - dealt);
    game.message = `${critical ? 'Critical hit! ' : ''}You ${heavy ? 'slam' : 'strike'} for ${dealt} damage.`;
    if (game.battle.hp <= 0) {
      const { name, rewardXp, rewardGold } = game.battle;
      game.xp += rewardXp; game.gold += rewardGold; game.battle = null;
      if (Math.random() < .3) game.inventory.potion += 1;
      game.message += ` You defeated the ${name.toLowerCase()} and earned ${rewardXp} XP and ${rewardGold} gold!`;
    } else enemyTurn(false);
  } else if (action === 'guard') {
    if (!game.battle || game.hp <= 0) return;
    game.message = 'You brace behind your guard.'; enemyTurn(true);
  } else if (action === 'buy-potion') {
    if (game.gold < 12) return; game.gold -= 12; game.inventory.potion += 1; game.message = 'You bought a health potion for 12 gold.';
  } else if (action === 'buy-sword') {
    if (game.weapon || game.gold < 35) return; game.gold -= 35; game.weapon = true; game.message = 'You bought an iron sword. Your attacks now deal extra damage!';
  } else if (action === 'use-potion') {
    if (game.inventory.potion < 1 || game.hp >= MAX_HP) return;
    const restored = Math.min(40, MAX_HP - game.hp); game.hp += restored; game.inventory.potion -= 1;
    game.message = `You drink a health potion and recover ${restored} health.`;
    if (game.battle && game.hp > 0) enemyTurn(false);
  } else if (action === 'craft-potion') {
    if (game.inventory.herb < 2 || game.inventory.wood < 1) return;
    game.inventory.herb -= 2; game.inventory.wood -= 1; game.inventory.potion += 1; game.message = 'Crafted a health potion from 2 herbs and 1 wood.';
  } else if (action === 'craft-armor') {
    if (game.armor || game.inventory.wood < 8 || game.inventory.stone < 8 || game.inventory.herb < 5) return;
    game.inventory.wood -= 8; game.inventory.stone -= 8; game.inventory.herb -= 5; game.armor = true;
    game.message = 'You crafted woodland armor! Incoming battle damage is reduced by 30%.';
  } else if (action === 'sell-wood') {
    const amount = Number(game.inventory.wood) || 0; if (!amount) return;
    game.gold += amount * 3; game.inventory.wood = 0; game.message = `Sold ${amount} wood for ${amount * 3} gold.`;
  } else if (action === 'sell-herbs') {
    const amount = Number(game.inventory.herb) || 0; if (!amount) return;
    game.gold += amount * 5; game.inventory.herb = 0; game.message = `Sold ${amount} herbs for ${amount * 5} gold.`;
  } else if (action === 'flee') { game.battle = null; game.message = 'You escaped the fight and returned to safety.'; }
  else if (action === 'rest') {
    if (game.location !== 'village' || game.gold < 5 || game.hp >= MAX_HP) return;
    game.hp = Math.min(MAX_HP, game.hp + 40); game.gold -= 5; game.battle = null; game.message = 'You rest at the Willowbrook inn and recover your strength.';
  }
  saveGame();
}
content.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (button && !button.disabled) act(button.dataset.action);
});
window.addEventListener('keydown', (event) => {
  if (view !== 'map' || event.altKey || event.ctrlKey || event.metaKey) return;
  const directions = { w: [0, -1], ArrowUp: [0, -1], a: [-1, 0], ArrowLeft: [-1, 0], s: [0, 1], ArrowDown: [0, 1], d: [1, 0], ArrowRight: [1, 0] };
  const direction = directions[event.key.length === 1 ? event.key.toLowerCase() : event.key];
  if (direction) { event.preventDefault(); walk(direction[0], direction[1]); return; }
  if (event.code === 'Space') { event.preventDefault(); chopTree(); }
});
document.getElementById('openTabsButton').addEventListener('click', () => {
  const gameViews = ['map', 'inventory', 'fight', 'shop', 'crafting', 'hero']; let opened = 0;
  for (const gameView of gameViews) { const url = new URL(window.location.href); url.searchParams.set('view', gameView); if (window.open(url, '_blank')) opened += 1; }
  message.textContent = opened === gameViews.length ? 'All game tabs opened. Your progress is shared between them.' : 'Some tabs were blocked by your browser. Allow pop-ups for this page, then try again.';
});
document.getElementById('resetButton').addEventListener('click', () => {
  if (!window.confirm('Reset the shared hero, inventory, and world progress in every tab?')) return;
  game = freshGame(); saveGame();
});
window.addEventListener('storage', (event) => { if (event.key === SAVE_KEY || event.key === null) render(); });
render();
window.setInterval(() => { alertPhase = Boolean(game.battle) ? !alertPhase : false; updateTabIdentity(); }, 900);
