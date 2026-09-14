import * as THREE from 'three';
import { MindARThree } from '../vendor/mindar-image-three.prod.js';
import { createFoodModel } from './foods.js';
import { TYPE_POSE, scaleFromRadius } from './layout.js';

const config = JSON.parse(document.getElementById('ar-config').textContent);
const statusEl = document.getElementById('ar-status');
const readyEl = document.getElementById('ar-ready');
const instructionEl = document.getElementById('ar-instruction');
const foodBox = document.getElementById('ar-food');
const foodNameEl = document.getElementById('ar-food-name');
const frame = document.getElementById('scan-frame');
const aimLock = document.getElementById('aim-lock');
const startPanel = document.getElementById('ar-start');
const startCopy = document.getElementById('ar-start-copy');
const errorEl = document.getElementById('ar-error');
const startButton = document.getElementById('start-camera');
const progressEl = document.getElementById('ar-progress');
const progressBar = document.getElementById('ar-progress-bar');
const progressLabel = document.getElementById('ar-progress-label');

let dishes = [];
let tracking = false;
let started = false;
let mindarThree = null;
let focused = null;
let hudKey = '';

const screenPoint = new THREE.Vector3();
const edgePoint = new THREE.Vector3();
const SCREEN_MIN = 0.54;
const PHOTO_MULTIPLE = 2.35;
const SCREEN_MAX = 0.9;

function setStatus(status, instruction) {
    statusEl.textContent = status;
    if (instruction) instructionEl.textContent = instruction;
}

function setReady(on) {
    readyEl.hidden = !on;
}

function closeStartScreen() {
    startPanel.hidden = true;
    startPanel.classList.add('is-closed');
}

function openStartScreen() {
    startPanel.hidden = false;
    startPanel.classList.remove('is-closed');
}

function showError(message) {
    errorEl.hidden = false;
    errorEl.textContent = message;
    startCopy.textContent = message;
    startButton.hidden = message === 'Please use HTTPS';
}

function showAim(on) {
    aimLock.hidden = !on;
    if (!on) aimLock.classList.remove('is-on');
}

function showFood(name) {
    if (!name) {
        foodBox.hidden = true;
        foodNameEl.textContent = '—';
        return;
    }
    foodBox.hidden = false;
    foodNameEl.textContent = name;
}

function setProgress(percent, label) {
    progressEl.hidden = false;
    progressBar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
    progressLabel.textContent = label;
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Could not load menu image.'));
        image.src = src;
    });
}

async function loadDishes() {
    const response = await fetch(config.layoutUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load the dish layout.');
    const layout = await response.json();
    dishes = (layout.dishes || []).filter((dish) => dish.type && dish.type !== 'ignore');
    if (layout.imageWidth && layout.imageHeight) {
        config.imageWidth = layout.imageWidth;
        config.imageHeight = layout.imageHeight;
    }
}

async function resolveTargetUrl() {
    if (config.targetReady && config.targetUrl) {
        const probe = await fetch(config.targetUrl, { method: 'HEAD' });
        if (probe.ok) return config.targetUrl;
    }
    if (!config.menuUrl) throw new Error('Upload a menu image in Prepare AR Tracking first.');
    openStartScreen();
    startCopy.textContent = 'Menu tracking will be prepared on first start.';
    setProgress(1, 'Preparing menu tracking 1%');
    const { Compiler } = await import('../vendor/mindar-image.prod.js');
    const compiler = new Compiler();
    const image = await loadImage(config.menuUrl);
    await compiler.compileImageTargets([image], (progress) => {
        const pct = Math.max(0, Math.min(100, progress <= 1 ? progress * 100 : progress));
        setProgress(pct, `Preparing menu tracking ${pct.toFixed(0)}%`);
    });
    const buffer = await compiler.exportData();
    const body = new FormData();
    body.append('target', new Blob([buffer]), 'menu.mind');
    const saved = await fetch(config.saveTargetUrl, { method: 'POST', body });
    const json = await saved.json().catch(() => ({}));
    if (!saved.ok || json.ok === false) {
        console.warn(json.error || 'Could not save compiled target');
    }
    setProgress(100, 'Tracking ready');
    return URL.createObjectURL(new Blob([buffer]));
}

function poseFor(dish) {
    const meta = TYPE_POSE[dish.type] || TYPE_POSE.burger;
    const aspect = (config.imageHeight || 1600) / (config.imageWidth || 1035);
    return {
        name: dish.name || meta.name,
        x: Number.isFinite(dish.x) ? dish.x : (Number.isFinite(dish.arx) ? dish.arx : dish.nx - 0.5),
        y: Number.isFinite(dish.y) ? dish.y : (Number.isFinite(dish.ary) ? dish.ary : (0.5 - dish.ny) * aspect),
        z: Number.isFinite(dish.rx) && Number.isFinite(dish.z) ? dish.z : meta.z,
        rx: Number.isFinite(dish.rx) ? dish.rx : meta.rx,
        ry: Number.isFinite(dish.ry) ? dish.ry : (Number.isFinite(dish.rotation) ? dish.rotation : meta.ry),
        radius: dish.radius || 0.13,
        scale: dish.scale || scaleFromRadius(dish.radius || 0.13)
    };
}

function mountDishes(anchor) {
    return dishes.map((dish) => {
        const pose = poseFor(dish);
        const model = createFoodModel(dish.type) || createFoodModel('burger');
        const holder = new THREE.Group();
        holder.position.set(pose.x, pose.y, pose.z);
        holder.rotation.x = pose.rx;
        holder.rotation.y = pose.ry;
        model.scale.setScalar(1);
        model.updateMatrixWorld(true);
        const bounds = new THREE.Sphere();
        new THREE.Box3().setFromObject(model).getBoundingSphere(bounds);
        model.scale.setScalar(0.001);
        holder.position.z += 0.16;
        holder.add(model);
        holder.visible = false;
        anchor.group.add(holder);
        return {
            name: pose.name,
            radius: pose.radius,
            holder,
            model,
            modelRadius: Math.max(bounds.radius, 0.35),
            displayScale: 0.001
        };
    });
}

function projectedRadius(holder, localRadius, camera) {
    holder.updateWorldMatrix(true, false);
    screenPoint.set(0, 0, 0).applyMatrix4(holder.matrixWorld).project(camera);
    edgePoint.set(localRadius, 0, 0).applyMatrix4(holder.matrixWorld).project(camera);
    if (screenPoint.z < -1 || screenPoint.z > 1) return 0;
    return Math.hypot(edgePoint.x - screenPoint.x, edgePoint.y - screenPoint.y);
}

function screenLockedScale(dish, camera) {
    const unit = projectedRadius(dish.holder, 1, camera);
    if (unit < 0.0008) return dish.displayScale || 1;
    const photo = projectedRadius(dish.holder, dish.radius || 0.13, camera);
    const wanted = Math.min(SCREEN_MAX, Math.max(SCREEN_MIN, photo * PHOTO_MULTIPLE));
    return Math.min(12, wanted / (unit * dish.modelRadius));
}

function scoreDish(dish, camera) {
    dish.holder.updateWorldMatrix(true, false);
    screenPoint.set(0, 0, 0).applyMatrix4(dish.holder.matrixWorld).project(camera);
    if (screenPoint.z < -1 || screenPoint.z > 1) return -Infinity;
    const toCenter = Math.hypot(screenPoint.x, screenPoint.y);
    edgePoint.set(dish.radius || 0.14, 0, 0).applyMatrix4(dish.holder.matrixWorld).project(camera);
    const apparent = Math.hypot(edgePoint.x - screenPoint.x, edgePoint.y - screenPoint.y);
    if (apparent < 0.04) return -Infinity;
    return apparent * 1.15 - toCenter;
}

function pickFocusedDish(records, camera) {
    let best = null;
    let bestScore = 0.015;
    records.forEach((dish) => {
        const score = scoreDish(dish, camera);
        if (score > bestScore) {
            bestScore = score;
            best = dish;
        }
    });
    return best;
}

async function startCamera() {
    if (started) return;
    errorEl.hidden = true;
    if (!window.isSecureContext) {
        showError('Please use HTTPS');
        setStatus('Please use HTTPS', 'Please use HTTPS');
        return;
    }
    if (!dishes.length) {
        showError('No dish markers yet. Add them in Prepare AR Tracking.');
        return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showError('Camera access is required');
        setStatus('Camera access is required', 'Camera access is required');
        return;
    }

    startButton.disabled = true;
    setStatus('Starting camera…', 'Starting camera…');

    try {
        const targetUrl = await resolveTargetUrl();
        closeStartScreen();

        mindarThree = new MindARThree({
            container: document.getElementById('ar-view'),
            imageTargetSrc: targetUrl,
            uiLoading: 'no',
            uiScanning: 'no',
            uiError: 'no',
            filterMinCF: 0.0001,
            filterBeta: 10
        });
        const renderer = mindarThree.renderer;
        const scene = mindarThree.scene;
        const camera = mindarThree.camera;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        if (THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setClearColor(0x000000, 0);
        renderer.setClearAlpha(0);
        renderer.domElement.style.background = 'transparent';
        if (mindarThree.cssRenderer) {
            mindarThree.cssRenderer.domElement.style.background = 'transparent';
            mindarThree.cssRenderer.domElement.style.pointerEvents = 'none';
        }

        scene.add(new THREE.AmbientLight(0xffffff, 0.85));
        const key = new THREE.DirectionalLight(0xfff1d6, 1.2);
        key.position.set(1, 2, 4);
        scene.add(key);
        scene.add(new THREE.HemisphereLight(0xffffff, 0x333333, 0.5));

        const imageAnchor = mindarThree.addAnchor(0);
        const records = mountDishes(imageAnchor);

        imageAnchor.onTargetFound = () => {
            tracking = true;
            frame.hidden = true;
            showAim(true);
            setReady(true);
            setStatus('Aim at a dish', 'Put the center mark on a food photo');
        };
        imageAnchor.onTargetLost = () => {
            tracking = false;
            focused = null;
            records.forEach((dish) => {
                dish.target = 0.001;
                dish.holder.visible = false;
            });
            showFood(null);
            aimLock.classList.remove('is-on');
            frame.hidden = false;
            showAim(true);
            setStatus('Point at the food menu', 'Point at the food menu');
            hudKey = 'scan';
        };

        await mindarThree.start();
        if (mindarThree.video) {
            mindarThree.video.style.zIndex = '0';
            mindarThree.video.muted = true;
            mindarThree.video.playsInline = true;
        }
        renderer.domElement.style.zIndex = '1';
        if (typeof mindarThree.resize === 'function') mindarThree.resize();
        started = true;
        closeStartScreen();
        frame.hidden = false;
        showAim(true);
        setReady(true);
        setStatus('AR Ready', 'Put the center mark on a food photo');
        hudKey = 'ready';

        renderer.setAnimationLoop(() => {
            let nextFocus = null;
            if (tracking) {
                nextFocus = pickFocusedDish(records, camera);
                if (focused && nextFocus && focused !== nextFocus) {
                    if (scoreDish(nextFocus, camera) < scoreDish(focused, camera) + 0.18) nextFocus = focused;
                } else if (focused && !nextFocus && scoreDish(focused, camera) > -0.05) {
                    nextFocus = focused;
                }
            }
            focused = nextFocus;

            records.forEach((dish) => {
                const active = tracking && dish === focused;
                const wanted = active ? screenLockedScale(dish, camera) : 0.001;
                dish.displayScale += (wanted - dish.displayScale) * (active ? 0.22 : 0.28);
                dish.model.scale.setScalar(Math.max(0.001, dish.displayScale));
                dish.holder.visible = dish.displayScale > 0.01;
                if (active) dish.model.rotation.y += 0.01;
            });

            let nextHud = 'scan';
            if (tracking && focused) nextHud = focused.name;
            else if (tracking) nextHud = 'aim';
            if (nextHud !== hudKey) {
                hudKey = nextHud;
                if (nextHud === 'scan') {
                    setStatus('Point at the food menu', 'Point at the food menu');
                    showFood(null);
                    aimLock.classList.remove('is-on');
                } else if (nextHud === 'aim') {
                    setStatus('Aim at a dish', 'Put the center mark on a food photo');
                    showFood(null);
                    aimLock.classList.remove('is-on');
                } else {
                    setStatus(`3D ${focused.name} is on the photo`, `3D ${focused.name} is on the photo`);
                    showFood(focused.name);
                    aimLock.classList.add('is-on');
                }
            }
            renderer.render(scene, camera);
        });
    } catch (error) {
        console.error(error);
        started = false;
        startButton.disabled = false;
        setReady(false);
        showAim(false);
        openStartScreen();
        progressEl.hidden = true;
        if (!window.isSecureContext || error?.name === 'SecurityError') {
            showError('Please use HTTPS');
            setStatus('Please use HTTPS', 'Please use HTTPS');
        } else if (error?.name === 'NotAllowedError' || error?.name === 'NotFoundError') {
            showError('Camera access is required');
            setStatus('Camera access is required', 'Camera access is required');
        } else if (/webgl|binomial|backend/i.test(error?.message || '')) {
            showError('Compiling needs WebGL. Open Prepare AR Tracking in Chrome or Edge on the computer, then scan again.');
            setStatus('Could not start AR', 'Compile the menu on a computer first.');
        } else {
            showError(error?.message || 'Could not start the camera. Use HTTPS or localhost, then allow camera access.');
            setStatus('Camera access is required', 'Camera access is required');
        }
    }
}

startButton.addEventListener('click', startCamera);

loadDishes().then(() => {
    if (!dishes.length) {
        showError('No dish markers yet. Add them in Prepare AR Tracking.');
    } else if (!window.isSecureContext) {
        showError('Please use HTTPS');
        setStatus('Please use HTTPS', 'Please use HTTPS');
    } else if (!config.targetUrl) {
        setStatus('Tap to start camera', 'Tracking will be prepared when you start the camera.');
    } else {
        setStatus('Tap to start camera', 'Tap to start camera');
    }
}).catch((error) => {
    showError(error.message || 'Could not load the menu layout.');
});
