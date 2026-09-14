import { FOOD_TYPES, defaultName, foodLabel } from './food-types.js';
import { buildDishRecord, detectPhotoRegions, guessType } from './layout.js';

const config = JSON.parse(document.getElementById('compile-config').textContent);
const errorBox = document.getElementById('form-error');
const okBox = document.getElementById('form-ok');
const progress = document.getElementById('progress');
const progressBar = document.getElementById('progress-bar');
const progressLabel = document.getElementById('progress-label');
const list = document.getElementById('marker-list');
const layer = document.getElementById('marker-layer');
const poster = document.getElementById('poster');
const stage = document.getElementById('stage');
const chipMarkers = document.getElementById('chip-markers');

let dishes = [];
let selectedId = null;
let drag = null;
let suppressClick = false;
let idSeed = 1;

function showError(message) {
    okBox.hidden = true;
    errorBox.hidden = !message;
    errorBox.textContent = message || '';
}

function showOk(message) {
    errorBox.hidden = true;
    okBox.hidden = !message;
    okBox.textContent = message || '';
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function nextId() {
    let id = `dish-${idSeed++}`;
    while (dishes.some((dish) => dish.id === id)) id = `dish-${idSeed++}`;
    return id;
}

function suggestType(index, found) {
    return guessType(index, found.length);
}

async function loadLayout() {
    const response = await fetch(config.layoutUrl, { cache: 'no-store' });
    const data = await response.json();
    dishes = Array.isArray(data.dishes) ? data.dishes.map((dish) => ({
        id: dish.id,
        type: dish.type || 'burger',
        name: dish.name || defaultName(dish.type || 'burger'),
        nx: Number(dish.nx) || 0.5,
        ny: Number(dish.ny) || 0.5,
        z: Number(dish.z ?? 0.02),
        rotation: Number(dish.rotation ?? 0),
        radius: Number(dish.radius) || 0.1,
        scale: Number(dish.scale) || 0.18
    })) : [];
    render();
}

function render() {
    if (chipMarkers) chipMarkers.textContent = `${dishes.length} marker${dishes.length === 1 ? '' : 's'}`;
    renderMarkers();
    renderList();
}

function renderMarkers() {
    if (!layer || !poster) return;
    layer.innerHTML = '';
    const aspect = poster.naturalWidth && poster.naturalHeight
        ? poster.naturalWidth / poster.naturalHeight
        : 0.65;
    dishes.forEach((dish, index) => {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'marker' + (dish.id === selectedId ? ' is-selected' : '') + (dish.type === 'ignore' ? ' is-ignore' : '');
        el.style.left = `${dish.nx * 100}%`;
        el.style.top = `${dish.ny * 100}%`;
        el.style.width = `${dish.radius * 200}%`;
        el.style.height = `${dish.radius * 200 * aspect}%`;
        el.innerHTML = `<b>${index + 1}</b>`;
        el.setAttribute('aria-label', `Marker ${index + 1}, ${foodLabel(dish.type)}`);
        el.addEventListener('pointerdown', (event) => startDrag(event, dish, el));
        el.addEventListener('click', (event) => {
            event.stopPropagation();
            selectedId = dish.id;
            render();
        });
        layer.appendChild(el);
    });
}

function renderList() {
    if (!list) return;
    list.innerHTML = '';
    if (!dishes.length) {
        list.innerHTML = '<p class="note">No markers yet. Detect photos, or click the poster.</p>';
        return;
    }
    dishes.forEach((dish, index) => {
        const card = document.createElement('article');
        card.className = 'marker-card' + (dish.id === selectedId ? ' is-selected' : '');
        const options = FOOD_TYPES.map((type) => {
            const selected = type.id === dish.type ? ' selected' : '';
            return `<option value="${type.id}"${selected}>${type.label}</option>`;
        }).join('');
        card.innerHTML = `
            <header>
                <strong>Photo ${index + 1}</strong>
                <button type="button" class="btn btn-danger" data-remove>Remove</button>
            </header>
            <label class="field-wide">Food type
                <select data-type>${options}</select>
            </label>
            <label class="field-wide">Name
                <input type="text" maxlength="40" value="${escapeAttr(dish.name)}" data-name>
            </label>
            <div class="fields">
                <label>Radius
                    <input type="number" min="0.04" max="0.3" step="0.005" value="${dish.radius}" data-radius>
                </label>
                <label>Scale
                    <input type="number" min="0.08" max="0.6" step="0.01" value="${dish.scale}" data-scale>
                </label>
            </div>`;
        card.querySelector('[data-remove]').addEventListener('click', () => {
            dishes = dishes.filter((item) => item.id !== dish.id);
            if (selectedId === dish.id) selectedId = null;
            render();
        });
        card.querySelector('[data-type]').addEventListener('change', (event) => {
            const previous = defaultName(dish.type);
            dish.type = event.target.value;
            if (!dish.name || dish.name === previous) dish.name = defaultName(dish.type);
            render();
        });
        card.querySelector('[data-name]').addEventListener('input', (event) => {
            dish.name = event.target.value;
        });
        card.querySelector('[data-radius]').addEventListener('change', (event) => {
            dish.radius = clamp(Number(event.target.value) || 0.1, 0.04, 0.3);
            render();
        });
        card.querySelector('[data-scale]').addEventListener('change', (event) => {
            dish.scale = clamp(Number(event.target.value) || 0.18, 0.08, 0.6);
        });
        card.addEventListener('click', () => {
            selectedId = dish.id;
            renderMarkers();
            list.querySelectorAll('.marker-card').forEach((item) => item.classList.remove('is-selected'));
            card.classList.add('is-selected');
        });
        list.appendChild(card);
    });
}

function escapeAttr(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
}

function startDrag(event, dish, el) {
    event.preventDefault();
    event.stopPropagation();
    selectedId = dish.id;
    drag = { id: dish.id, moved: false, el };
    el.setPointerCapture(event.pointerId);
    el.addEventListener('pointermove', onDrag);
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);
    renderList();
}

function onDrag(event) {
    if (!drag || !poster) return;
    drag.moved = true;
    const dish = dishes.find((item) => item.id === drag.id);
    if (!dish) return;
    const rect = poster.getBoundingClientRect();
    dish.nx = clamp((event.clientX - rect.left) / rect.width, 0.03, 0.97);
    dish.ny = clamp((event.clientY - rect.top) / rect.height, 0.03, 0.97);
    drag.el.style.left = `${dish.nx * 100}%`;
    drag.el.style.top = `${dish.ny * 100}%`;
}

function endDrag(event) {
    if (!drag) return;
    if (drag.moved) suppressClick = true;
    drag.el.removeEventListener('pointermove', onDrag);
    drag.el.removeEventListener('pointerup', endDrag);
    drag.el.removeEventListener('pointercancel', endDrag);
    drag = null;
    render();
}

function addMarker(nx, ny) {
    const dish = {
        id: nextId(),
        type: 'ignore',
        name: 'Ignore',
        nx: clamp(nx, 0.03, 0.97),
        ny: clamp(ny, 0.03, 0.97),
        z: 0,
        rotation: 0,
        radius: 0.12,
        scale: 0.18
    };
    dishes.push(dish);
    selectedId = dish.id;
    render();
}

stage?.addEventListener('click', (event) => {
    if (suppressClick) {
        suppressClick = false;
        return;
    }
    if (event.target.closest('.marker') || !poster) return;
    const rect = poster.getBoundingClientRect();
    addMarker((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
});

document.getElementById('detect-btn')?.addEventListener('click', () => {
    if (!poster || !poster.complete) {
        showError('Wait for the menu image to finish loading.');
        return;
    }
    if (dishes.length && !window.confirm('Replace the current markers with automatically detected photos?')) return;
    const found = detectPhotoRegions(poster);
    if (!found.length) {
        showError('No photos found automatically. Click the poster to add dish markers.');
        return;
    }
    dishes = found.map((item, index) => {
        const type = suggestType(index, found);
        const record = buildDishRecord({
            id: nextId(),
            type,
            name: defaultName(type),
            nx: item.nx,
            ny: item.ny,
            radius: item.radius
        }, poster.naturalWidth, poster.naturalHeight);
        return record;
    });
    selectedId = dishes[0]?.id || null;
    showOk(`Found ${dishes.length} photo(s). Check the labels, then compile.`);
    render();
});

document.getElementById('save-btn')?.addEventListener('click', () => saveLayout(true));

document.getElementById('menu-file')?.addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    showError('');
    showOk('');
    if (file.size > 8 * 1024 * 1024) {
        showError('Image must be 8 MB or smaller.');
        return;
    }
    const body = new FormData();
    body.append('menu', file);
    try {
        const response = await fetch('api/upload.php', { method: 'POST', body });
        const data = await response.json();
        if (!data.ok) throw new Error(data.error || 'Upload failed.');
        config.menuUrl = data.menuUrl || config.menuUrl;
        config.imageWidth = data.imageWidth;
        config.imageHeight = data.imageHeight;
        if (poster) {
            poster.src = `${config.menuUrl}${String(config.menuUrl).includes('?') ? '&' : '?'}v=${Date.now()}`;
            await new Promise((resolve, reject) => {
                poster.onload = resolve;
                poster.onerror = reject;
            });
            const found = detectPhotoRegions(poster);
            dishes = found.map((item, index) => buildDishRecord({
                id: nextId(),
                type: suggestType(index, found),
                nx: item.nx,
                ny: item.ny,
                radius: item.radius
            }, poster.naturalWidth, poster.naturalHeight));
            selectedId = dishes[0]?.id || null;
            render();
            if (!found.length) {
                showError('No photos found automatically. Click the poster to add dish markers.');
            } else {
                showOk('Poster replaced. Label the photos, then compile so the phone can recognize the new menu.');
            }
        } else {
            window.location.reload();
        }
    } catch (error) {
        showError(error.message || 'Upload failed.');
    } finally {
        event.target.value = '';
    }
});

document.getElementById('compile-btn')?.addEventListener('click', compileTarget);

async function saveLayout(announce) {
    const response = await fetch('api/save-layout.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            imageWidth: poster?.naturalWidth || config.imageWidth,
            imageHeight: poster?.naturalHeight || config.imageHeight,
            dishes: dishes.map((dish) => buildDishRecord(dish, poster?.naturalWidth || config.imageWidth || 1, poster?.naturalHeight || config.imageHeight || 1))
        })
    });
    const data = await response.json();
    if (!data.ok) throw new Error(data.error || 'Could not save the layout.');
    if (data.layout?.dishes) dishes = data.layout.dishes;
    if (announce) showOk(data.message);
    render();
    return data;
}

function setProgress(percent, label) {
    progress.hidden = false;
    const value = Math.max(0, Math.min(100, percent));
    progressBar.style.width = `${value}%`;
    progressLabel.textContent = label;
}

async function compileTarget() {
    const button = document.getElementById('compile-btn');
    button.disabled = true;
    showError('');
    showOk('');
    try {
        setProgress(2, 'Saving markers…');
        await saveLayout(false);
        setProgress(8, 'Loading the AR compiler…');
        const { Compiler } = await import('../vendor/mindar-image.prod.js');
        const image = await loadCompileImage(config.menuUrl || poster.src);
        const compiler = new Compiler();
        setProgress(12, 'Compiling tracking target. Keep this tab open…');
        const compiled = compiler.compileImageTargets([image], (value) => {
            const percent = value <= 1 ? value * 100 : value;
            setProgress(12 + percent * 0.78, `Compiling tracking target… ${Math.round(percent)}%`);
        });
        const timeout = new Promise((_, reject) => {
            window.setTimeout(() => reject(new Error('Compiling took too long. Use Chrome or Edge with hardware acceleration on, and keep this tab open.')), 180000);
        });
        await Promise.race([compiled, timeout]);
        const buffer = await compiler.exportData();
        setProgress(92, 'Saving tracking file…');
        const body = new FormData();
        body.append('target', new Blob([buffer]), 'menu.mind');
        const response = await fetch('api/save-target.php', { method: 'POST', body });
        const data = await response.json();
        if (!data.ok) throw new Error(data.error || 'Could not save the tracking file.');
        setProgress(100, 'Tracking target ready.');
        showOk(data.message);
        const chip = document.getElementById('chip-target');
        if (chip) {
            chip.textContent = 'Tracking compiled';
            chip.classList.add('chip-ok');
        }
    } catch (error) {
        const raw = error?.message || 'Compiling failed.';
        const friendly = /webgl|backend|binomial/i.test(raw)
            ? 'Compiling needs WebGL. Open this page in Chrome or Edge on the computer, with hardware acceleration enabled.'
            : raw;
        showError(friendly);
        progressLabel.textContent = '';
    } finally {
        button.disabled = false;
    }
}

function loadCompileImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Could not load the menu image for compiling.'));
        image.src = src;
    });
}

if (poster && !poster.complete) {
    poster.addEventListener('load', () => renderMarkers());
}

boot();

async function boot() {
    try {
        if (config.hasMenu) await loadLayout();
        if (new URLSearchParams(window.location.search).get('autocompile') === '1') {
            await compileTarget();
        }
    } catch (error) {
        showError(error.message || 'Could not load the dish layout.');
    }
}
