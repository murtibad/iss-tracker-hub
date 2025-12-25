// src/ui/globeView.js
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

let globe = null;
let followEnabled = false;
let animationFrameId = null;
let issMesh = null;
let issModelLoaded = null;
let focusMode = 'earth';
let globeContainer = null;

const ISS_ORBIT_ALTITUDE = 0.15;

// State
const issData = { lat: 0, lng: 0, alt: ISS_ORBIT_ALTITUDE, type: "iss" };
let targetPos = { lat: 0, lng: 0 };
let renderPos = { lat: 0, lng: 0 };

let userData = null;
let rawTrajectory = { past: [], future: [] };
let lastPathUpdate = 0;
const gltfLoader = new GLTFLoader();

// User interaction state for temporary follow pause
let userInteracting = false;
let followPauseTimer = null;
const FOLLOW_RESUME_DELAY = 5000; // 5 seconds before auto-resuming follow

function clampLat(lat) { return Math.max(-89.9, Math.min(89.9, lat)); }
function normLng(lng) {
  while (lng > 180) lng -= 360;
  while (lng < -180) lng += 360;
  return lng;
}

function getBearing(lat1, lon1, lat2, lon2) {
  const y = Math.sin((lon2 - lon1) * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
    Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos((lon2 - lon1) * Math.PI / 180);
  return Math.atan2(y, x);
}

// Model Yükleme
async function loadRealisticISS() {
  if (issModelLoaded) return issModelLoaded.clone();
  return new Promise((resolve) => {
    const modelUrl = import.meta.env.BASE_URL + "models/ISS.glb";
    gltfLoader.load(modelUrl, (gltf) => {
      const model = gltf.scene;
      model.scale.set(0.08, 0.08, 0.08);
      model.traverse(c => {
        if (c.isMesh && c.material) {
          c.material.metalness = 0.8;
          c.material.roughness = 0.3;
        }
      });
      const wrapper = new THREE.Group();
      wrapper.add(model);
      wrapper.rotation.x = Math.PI / 2;
      issModelLoaded = wrapper;
      resolve(wrapper.clone());
    }, undefined, () => resolve(createFallbackISSModel()));
  });
}

function createFallbackISSModel() {
  const g = new THREE.Group();
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 2, 8),
    new THREE.MeshStandardMaterial({ color: 0xcccccc })
  );
  m.rotation.z = Math.PI / 2;
  g.add(m);
  return g;
}

export async function initGlobe(parentContainer) {
  if (globe) return globe;

  globeContainer = document.createElement('div');
  globeContainer.id = 'globe-3d-canvas-container';
  globeContainer.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; z-index:0; overflow:hidden; pointer-events:auto;';
  parentContainer.prepend(globeContainer);

  try {
    const globeModule = await import("globe.gl");
    const Globe = globeModule.default || globeModule;
    globe = Globe()(globeContainer)
      .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
      .backgroundColor("#000005")
      .showAtmosphere(true)
      .atmosphereColor("#3a8bff")
      .atmosphereAltitude(0.2);

    // Serbest kamera kontrolleri
    globe.controls().autoRotate = false;
    globe.controls().enableZoom = true;
    globe.controls().enableDamping = true;
    globe.controls().dampingFactor = 0.05;
    globe.controls().rotateSpeed = 0.5;

    // User interaction detection for temporary follow pause
    const handleUserInteraction = () => {
      if (followEnabled) {
        userInteracting = true;

        // Clear existing timer
        if (followPauseTimer) {
          clearTimeout(followPauseTimer);
        }

        // Resume follow after delay
        followPauseTimer = setTimeout(() => {
          userInteracting = false;
          console.log('[Globe] Follow resumed after user interaction');
        }, FOLLOW_RESUME_DELAY);

        console.log('[Globe] Follow paused - user interacting');
      }
    };

    // Listen for user interaction on globe container
    globeContainer.addEventListener('mousedown', handleUserInteraction);
    globeContainer.addEventListener('touchstart', handleUserInteraction);
    globeContainer.addEventListener('wheel', handleUserInteraction);

    // Listen for Theme Changes - Update entire 3D scene
    window.addEventListener('themeChanged', (e) => {
      const { color, theme } = e.detail;
      const isLight = theme === 'light' || document.documentElement.getAttribute('data-theme') === 'light';
      const accentColor = typeof color === 'string' ? color : getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();

      // 1. Background Color - WHITE for light, BLACK for dark
      globe.backgroundColor(isLight ? '#f8fafc' : '#000005');

      // 2. Atmosphere glow - accent color
      globe.atmosphereColor(accentColor);

      // 3. Update all celestial objects via stored references
      const env = window._globeEnv;
      if (env) {
        // Stars - black on white, white on black
        env.starsMat.color.set(isLight ? 0x333333 : 0xffffff);
        env.starsMat.opacity = isLight ? 0.6 : 0.9;

        // Moon
        env.moonMat.emissive.set(isLight ? 0x444444 : 0x111111);

        // Sun
        env.sunMat.color.set(isLight ? 0xffaa00 : 0xffdd44);
        env.coronaMat.color.set(isLight ? 0xffcc00 : 0xffff88);

        // Ambient light - brighter for light mode
        env.amb.intensity = isLight ? 0.7 : 0.4;
      }

      // 4. Trajectory Colors
      window._currentThemeAccent = accentColor;
      if (window._updateTrajectoryColors) window._updateTrajectoryColors();
    });

    // Initial theme sync
    const initialAccent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    if (initialAccent) globe.atmosphereColor(initialAccent);

    globe.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });

    setTimeout(() => {
      globe.customLayerData([issData, { type: "env" }])
        .customThreeObject(d => {
          if (d.type === "iss") {
            const model = issModelLoaded ? issModelLoaded.clone() : createFallbackISSModel();
            issMesh = model;
            return model;
          }
          if (d.type === "env") {
            const group = new THREE.Group();

            // Theme detection
            const isLightInit = document.documentElement.getAttribute('data-theme') === 'light';

            // 🌌 YILDIZLAR - Large sphere for realistic starfield
            const starsGeo = new THREE.BufferGeometry();
            const starCount = 6000;
            const pos = [];
            const sizes = [];
            const STAR_RADIUS = 5000;
            for (let i = 0; i < starCount; i++) {
              const u = Math.random() * 2 - 1;
              const t = Math.random() * Math.PI * 2;
              const r = STAR_RADIUS + Math.random() * 500;
              pos.push(
                r * Math.sqrt(1 - u * u) * Math.cos(t),
                r * Math.sqrt(1 - u * u) * Math.sin(t),
                r * u
              );
              sizes.push(0.5 + Math.random() * 1.5);
            }
            starsGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
            starsGeo.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));

            const starsMat = new THREE.PointsMaterial({
              color: isLightInit ? 0x222222 : 0xffffff, // Dark stars on light, white on dark
              size: 1.5,
              sizeAttenuation: false,
              transparent: true,
              opacity: isLightInit ? 0.7 : 0.9
            });
            const stars = new THREE.Points(starsGeo, starsMat);
            stars.name = 'starfield';

            // 🌙 AY (Moon) - Realistic textured sphere
            const moonGeo = new THREE.SphereGeometry(15, 32, 32);
            const moonMat = new THREE.MeshStandardMaterial({
              color: 0xcccccc,
              roughness: 0.8,
              metalness: 0.1,
              emissive: isLightInit ? 0x222222 : 0x111111,
              emissiveIntensity: 0.3
            });
            const moon = new THREE.Mesh(moonGeo, moonMat);
            moon.position.set(-400, 150, -300); // Far left-upper
            moon.name = 'moon';

            // Moon craters (simple bump simulation via geometry)
            moon.castShadow = true;
            moon.receiveShadow = true;

            // ☀️ GÜNEŞ (Sun) - Glowing sphere with corona
            const sunGeo = new THREE.SphereGeometry(50, 32, 32);
            const sunMat = new THREE.MeshBasicMaterial({
              color: isLightInit ? 0xffaa00 : 0xffdd44,
              transparent: true,
              opacity: 1
            });
            const sunMesh = new THREE.Mesh(sunGeo, sunMat);
            sunMesh.position.set(800, 300, 500); // Far right-upper
            sunMesh.name = 'sunMesh';

            // Sun Corona (glow effect)
            const coronaGeo = new THREE.SphereGeometry(70, 32, 32);
            const coronaMat = new THREE.MeshBasicMaterial({
              color: isLightInit ? 0xffcc00 : 0xffff88,
              transparent: true,
              opacity: 0.3,
              side: THREE.BackSide
            });
            const corona = new THREE.Mesh(coronaGeo, coronaMat);
            corona.position.copy(sunMesh.position);
            corona.name = 'sunCorona';

            // ☀️ IŞIKLANDIRMA
            const amb = new THREE.AmbientLight(0xffffff, isLightInit ? 0.6 : 0.4);
            const sun = new THREE.DirectionalLight(isLightInit ? 0xfffaf0 : 0xffffff, 1.6);
            sun.position.set(150, 100, 150);
            sun.name = 'sunLight';
            amb.name = 'ambientLight';

            group.add(stars, moon, sunMesh, corona, amb, sun);
            group.name = 'envGroup';

            // Store references for theme updates
            window._globeEnv = { stars, starsMat, moon, moonMat, sunMesh, sunMat, corona, coronaMat, amb, sun };

            return group;
          }
          return null;
        });

      loadRealisticISS().then(model => {
        if (issMesh && issMesh.parent) {
          const p = issMesh.parent;
          const pos = issMesh.position.clone();
          p.remove(issMesh);
          model.position.copy(pos);
          p.add(model);
          issMesh = model;
        }
      });

      startMasterLoop();
    }, 500);
    return globe;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

function startMasterLoop() {
  const update = () => {
    if (!globe) return;
    try {
      // 1. ISS SMOOTH MOVEMENT
      let dLat = targetPos.lat - renderPos.lat;
      let dLng = targetPos.lng - renderPos.lng;
      if (dLng > 180) dLng -= 360;
      if (dLng < -180) dLng += 360;

      const dynamicLerp = 0.05;
      renderPos.lat += dLat * dynamicLerp;
      renderPos.lng += dLng * dynamicLerp;
      renderPos.lng = normLng(renderPos.lng);

      if (issMesh) {
        const c = globe.getCoords(renderPos.lat, renderPos.lng, ISS_ORBIT_ALTITUDE);
        issMesh.position.set(c.x, c.y, c.z);

        // Flight path alignment
        const bearing = getBearing(renderPos.lat, renderPos.lng, targetPos.lat, targetPos.lng);
        issMesh.rotation.y = -bearing + Math.PI;

        // Added: Subtle floating rotation ("serbest dönüş" effect)
        // Rotate slowly on Z axis (roll) and X axis (pitch)
        const time = Date.now() * 0.0005;
        issMesh.rotation.z = Math.sin(time) * 0.05; // Gentle roll
        issMesh.rotation.x = Math.PI / 2 + Math.cos(time * 0.7) * 0.05; // Gentle pitch
      }

      // 2. CAMERA FOLLOW (with temporary pause for user interaction)
      // Controls always enabled for user interaction
      if (!globe.controls().enabled) {
        globe.controls().enabled = true;
      }

      if (followEnabled && !userInteracting) {
        const pov = globe.pointOfView();
        const fLerp = focusMode === 'iss' ? 0.06 : 0.03;
        pov.lat += (renderPos.lat - pov.lat) * fLerp;

        let pDLng = renderPos.lng - pov.lng;
        if (pDLng > 180) pDLng -= 360;
        if (pDLng < -180) pDLng += 360;
        pov.lng += pDLng * fLerp;

        if (focusMode === 'iss' && pov.altitude > 0.35) {
          pov.altitude += (0.25 - pov.altitude) * 0.04;
        }

        globe.pointOfView(pov, 0);
      }

      // NOT: Trajectory güncellemesi burada YAPILMAMALI
      // updateTrajectory fonksiyonu çağrıldığında trajectory güncellenir

    } catch (e) { }


    animationFrameId = requestAnimationFrame(update);
  };
  update();
}

export const globeActions = {
  createGlobe: initGlobe,

  setVisible(visible) {
    if (globeContainer) {
      globeContainer.style.display = visible ? 'block' : 'none';
      if (visible && globe) {
        setTimeout(() => {
          globe.width(globeContainer.clientWidth);
          globe.height(globeContainer.clientHeight);
        }, 100);
      }
    }
  },

  setUserData(lat, lng) {
    userData = { lat: clampLat(lat), lng: normLng(lng), alt: 0.01, type: "user" };
    if (globe) globe.customLayerData([issData, userData, { type: "env" }]);
  },

  setIssPosition(lat, lng) {
    targetPos.lat = clampLat(lat);
    targetPos.lng = normLng(lng);
    if (renderPos.lat === 0) {
      renderPos.lat = targetPos.lat;
      renderPos.lng = targetPos.lng;
    }
  },

  setFocusMode(mode) {
    focusMode = mode;
    if (mode === 'iss') {
      globe.pointOfView({ lat: renderPos.lat, lng: renderPos.lng, altitude: 0.3 }, 1000);
      setTimeout(() => followEnabled = true, 1000);
    } else {
      followEnabled = false;
      globe.pointOfView({ lat: 20, lng: renderPos.lng, altitude: 2.5 }, 1200);
    }
  },

  getFocusMode() {
    return focusMode;
  },

  startFollow() {
    followEnabled = true;
  },

  stopFollow() {
    followEnabled = false;
  },

  updateTrajectory(past, future) {
    console.log('[Globe] updateTrajectory called - Past:', past?.length, 'Future:', future?.length);
    rawTrajectory.past = past || [];
    rawTrajectory.future = future || [];

    // Immediate render
    renderTrajectoryLines();
  }
};

/**
 * Split trajectory into chunks to handle antimeridian (180/-180) crossing.
 * This prevents lines from cutting through the globe.
 */
function chunkTrajectory(coords) {
  const chunks = [];
  let currentChunk = [];

  for (let i = 0; i < coords.length; i++) {
    const curr = coords[i];
    if (currentChunk.length > 0) {
      const prev = currentChunk[currentChunk.length - 1];
      // Check for longitude wrap (> 100 deg jump is suspicious for contiguous orbit)
      if (Math.abs(curr.lng - prev.lng) > 100) {
        if (currentChunk.length > 1) chunks.push(currentChunk);
        currentChunk = [];
      }
    }
    // Store as [lat, lng, alt] for simpler pathPoints usage
    currentChunk.push([curr.lat, curr.lng, 0.08]); // Hardcoded safe altitude (approx 500km relative to radius 1)
  }
  if (currentChunk.length > 1) chunks.push(currentChunk);
  return chunks;
}

function renderTrajectoryLines() {
  if (!globe) return;
  const { past, future } = rawTrajectory;
  const allPaths = [];

  // Dynamic Theme Colors
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const accent = window._currentThemeAccent || getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();

  // Colors based on theme
  const pastColor = isLight ? 'rgba(0,0,0,0.4)' : 'rgba(0, 212, 255, 0.5)'; // Black/Cyan
  const futureColor = accent; // Uses current theme accent

  // 1. Process Past Path
  if (past?.length > 1) {
    const pastFull = [...past, { lat: renderPos.lat, lng: renderPos.lng }];
    const chunks = chunkTrajectory(pastFull);
    chunks.forEach(chunk => {
      allPaths.push({ coords: chunk, color: pastColor, type: 'past' });
    });
  }

  // 2. Process Future Path
  if (future?.length > 1) {
    const futureFull = [{ lat: renderPos.lat, lng: renderPos.lng }, ...future];
    const chunks = chunkTrajectory(futureFull);
    chunks.forEach(chunk => {
      allPaths.push({ coords: chunk, color: futureColor, type: 'future' });
    });
  }

  // Render Paths
  globe.pathsData(allPaths)
    .pathPoints(d => d.coords)
    .pathPointLat(p => p[0])
    .pathPointLng(p => p[1])
    .pathPointAlt(p => p[2]) // Use the altitude stored in point
    .pathColor(d => d.color)
    .pathStroke(2)
    .pathDashLength(d => d.type === 'future' ? 0.2 : 0) // Dash future
    .pathDashGap(d => d.type === 'future' ? 0.1 : 0)
    .pathDashAnimateTime(d => d.type === 'future' ? 1500 : 0)
    .pathResolution(2); // Reduced resolution for performance, Globe.gl handles interpolation
}

// Global hook for theme change updates
window._updateTrajectoryColors = () => renderTrajectoryLines();
