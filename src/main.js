import './style.css';
import './game-entities.js';
import './game-systems.js';
import './effects-manager.js';
import './ui-manager.js';
import GameConfig from './game-config.js';
import DefaultMap from './maps/default-map.js';
import ZigZagMap from './maps/zigzag-map.js';
import { createGame } from './tower_defense_game.js';

const STORAGE_KEYS = {
  selectedMap: 'td_selected_map_id',
  customMap: 'td_custom_map'
};

const loadCustomMap = () => {
  const raw = localStorage.getItem(STORAGE_KEYS.customMap);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.path) || parsed.path.length < 2) {
      return null;
    }
    if (!parsed.id) {
      parsed.id = 'custom';
    }
    if (!parsed.name) {
      parsed.name = 'Custom Map';
    }
    return parsed;
  } catch (err) {
    console.warn('Failed to parse custom map data', err);
    return null;
  }
};

const saveCustomMap = (mapConfig) => {
  localStorage.setItem(STORAGE_KEYS.customMap, JSON.stringify(mapConfig));
};

const deleteCustomMap = () => {
  localStorage.removeItem(STORAGE_KEYS.customMap);
};

const loadSelectedMapId = (availableMaps) => {
  const stored = localStorage.getItem(STORAGE_KEYS.selectedMap);
  if (stored && availableMaps.some((map) => map.id === stored)) {
    return stored;
  }
  return availableMaps[0]?.id || 'default';
};

const saveSelectedMapId = (mapId) => {
  localStorage.setItem(STORAGE_KEYS.selectedMap, mapId);
};

const buildMapList = () => {
  const maps = [DefaultMap, ZigZagMap];
  const custom = loadCustomMap();
  if (custom) {
    maps.push(custom);
  }
  return maps;
};

const createMapSelectorUI = () => {
  const app = document.querySelector('#app');
  if (!app) return;

  const mapSelector = document.createElement('div');
  mapSelector.id = 'mapSelector';

  const header = document.createElement('h2');
  header.textContent = 'Choose Your Map';

  const description = document.createElement('p');
  description.className = 'map-description';

  const mapSelect = document.createElement('select');
  mapSelect.id = 'mapSelect';

  const buttonRow = document.createElement('div');
  buttonRow.className = 'map-actions';

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.id = 'editMapButton';
  editButton.textContent = 'Edit Custom Map';

  const startButton = document.createElement('button');
  startButton.type = 'button';
  startButton.className = 'primary';
  startButton.textContent = 'Start Game';

  const hint = document.createElement('p');
  hint.className = 'map-hint';
  hint.textContent = 'Tip: Create your own path with the map editor.';

  buttonRow.append(editButton, startButton);
  mapSelector.append(header, mapSelect, description, buttonRow, hint);
  app.append(mapSelector);

  const editorOverlay = createMapEditorOverlay();
  app.append(editorOverlay.overlay);

  const updateMapOptions = () => {
    const maps = buildMapList();
    const selectedId = loadSelectedMapId(maps);
    mapSelect.innerHTML = '';
    maps.forEach((map) => {
      const option = document.createElement('option');
      option.value = map.id;
      option.textContent = map.name;
      mapSelect.append(option);
    });
    mapSelect.value = selectedId;
    const selectedMap = maps.find((map) => map.id === selectedId) || maps[0];
    description.textContent = selectedMap?.description || '';
    editButton.textContent = maps.some((map) => map.id === 'custom') ? 'Edit Custom Map' : 'Create Custom Map';
  };

  updateMapOptions();
  window.addEventListener('td:mapsUpdated', updateMapOptions);

  mapSelect.addEventListener('change', () => {
    const maps = buildMapList();
    const selectedMap = maps.find((map) => map.id === mapSelect.value) || maps[0];
    description.textContent = selectedMap?.description || '';
    saveSelectedMapId(mapSelect.value);
  });

  startButton.addEventListener('click', () => {
    const maps = buildMapList();
    const selectedMap = maps.find((map) => map.id === mapSelect.value) || maps[0];
    saveSelectedMapId(selectedMap.id);
    mapSelector.classList.add('is-hidden');
    editorOverlay.overlay.classList.remove('is-visible');
    createGame(selectedMap);
  });

  editButton.addEventListener('click', () => {
    editorOverlay.open(updateMapOptions);
  });
};

const createMapEditorOverlay = () => {
  const overlay = document.createElement('div');
  overlay.id = 'mapEditorOverlay';

  const panel = document.createElement('div');
  panel.className = 'editor-panel';

  const title = document.createElement('h2');
  title.textContent = 'Map Editor';

  const instructions = document.createElement('p');
  instructions.className = 'editor-instructions';
  instructions.textContent = 'Click to add path points. The first point is the enemy spawn; the last point is the exit.';

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'Map name';

  const descriptionInput = document.createElement('input');
  descriptionInput.type = 'text';
  descriptionInput.placeholder = 'Short description';

  const canvas = document.createElement('canvas');
  canvas.width = GameConfig.GAME_WIDTH;
  canvas.height = GameConfig.GAME_AREA_BOTTOM - GameConfig.GAME_AREA_TOP;
  canvas.className = 'editor-canvas';

  const status = document.createElement('p');
  status.className = 'editor-status';

  const controls = document.createElement('div');
  controls.className = 'editor-controls';

  const undoButton = document.createElement('button');
  undoButton.type = 'button';
  undoButton.textContent = 'Undo';

  const clearButton = document.createElement('button');
  clearButton.type = 'button';
  clearButton.textContent = 'Clear';

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.textContent = 'Delete Saved Map';

  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.textContent = 'Cancel';

  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.className = 'primary';
  saveButton.textContent = 'Save Map';

  controls.append(undoButton, clearButton, deleteButton, cancelButton, saveButton);
  panel.append(title, instructions, nameInput, descriptionInput, canvas, status, controls);
  overlay.append(panel);

  const state = {
    points: []
  };

  const ctx = canvas.getContext('2d');

  const render = () => {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1b1f24';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += 80) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    if (state.points.length === 0) {
      status.textContent = 'Add at least two points to create a path.';
      return;
    }

    ctx.strokeStyle = '#4fc3f7';
    ctx.lineWidth = 4;
    ctx.beginPath();
    const first = state.points[0];
    ctx.moveTo(first.x, first.y - GameConfig.GAME_AREA_TOP);
    state.points.forEach((point) => {
      ctx.lineTo(point.x, point.y - GameConfig.GAME_AREA_TOP);
    });
    ctx.stroke();

    state.points.forEach((point, index) => {
      const canvasY = point.y - GameConfig.GAME_AREA_TOP;
      ctx.fillStyle = index === 0 ? '#2ecc71' : index === state.points.length - 1 ? '#e74c3c' : '#f1c40f';
      ctx.beginPath();
      ctx.arc(point.x, canvasY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(index + 1), point.x, canvasY);
    });

    status.textContent = `${state.points.length} point${state.points.length === 1 ? '' : 's'} placed.`;
  };

  const loadExisting = () => {
    const custom = loadCustomMap();
    if (custom) {
      nameInput.value = custom.name || 'Custom Map';
      descriptionInput.value = custom.description || '';
      state.points = custom.path.map((point) => ({ x: point.x, y: point.y }));
    } else {
      nameInput.value = 'Custom Map';
      descriptionInput.value = 'Hand-crafted path';
      state.points = [];
    }
    render();
  };

  const toGamePoint = (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.max(0, Math.min(canvas.width, (event.clientX - rect.left) * scaleX));
    const y = Math.max(0, Math.min(canvas.height, (event.clientY - rect.top) * scaleY));
    const gameY = y + GameConfig.GAME_AREA_TOP;
    return { x: Math.round(x), y: Math.round(gameY) };
  };

  canvas.addEventListener('click', (event) => {
    const point = toGamePoint(event);
    state.points.push(point);
    render();
  });

  undoButton.addEventListener('click', () => {
    state.points.pop();
    render();
  });

  clearButton.addEventListener('click', () => {
    state.points = [];
    render();
  });

  deleteButton.addEventListener('click', () => {
    deleteCustomMap();
    state.points = [];
    status.textContent = 'Custom map deleted.';
    render();
    window.dispatchEvent(new Event('td:mapsUpdated'));
  });

  const closeOverlay = () => {
    overlay.classList.remove('is-visible');
  };

  cancelButton.addEventListener('click', () => {
    closeOverlay();
  });

  saveButton.addEventListener('click', () => {
    if (state.points.length < 2) {
      status.textContent = 'Add at least two points before saving.';
      return;
    }
    const mapConfig = {
      id: 'custom',
      name: nameInput.value || 'Custom Map',
      description: descriptionInput.value || 'Custom path',
      pathImage: null,
      path: state.points.slice(),
      settings: {}
    };
    saveCustomMap(mapConfig);
    saveSelectedMapId('custom');
    status.textContent = 'Custom map saved.';
    window.dispatchEvent(new Event('td:mapsUpdated'));
    closeOverlay();
  });

  return {
    overlay,
    open: (refreshMaps) => {
      overlay.classList.add('is-visible');
      loadExisting();
      if (typeof refreshMaps === 'function') {
        refreshMaps();
      }
    }
  };
};

createMapSelectorUI();
