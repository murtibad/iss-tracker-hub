// src/ui/globeView.js
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { t } from "../i18n/i18n.js";

let globe = null;
let followEnabled = false;
let animationFrameId = null;
let issMesh = null;
let issModelLoaded = null;
let focusMode = 'earth';
let globeContainer = null;

const ISS_ORBIT_ALTITUDE = 0.01; // Lowered to align with trajectory visualizat ion

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

      // 1. Background Color - Space-like dark blue-gray for light, BLACK for dark
      globe.backgroundColor(isLight ? '#f5f5f7' : '#000005');

      // 2. Atmosphere glow - accent color
      globe.atmosphereColor(accentColor);

      // 3. Update all celestial objects via stored references
      const env = window._globeEnv;
      if (env) {
        // Stars - darker and more visible in light mode
        env.starsMat.color.set(isLight ? 0x555566 : 0xffffff);
        env.starsMat.opacity = isLight ? 0.7 : 0.9;

        // Moon and glow
        env.moonMat.color.set(isLight ? 0xd0d0d0 : 0xb0b0b0);
        env.moonMat.emissive.set(isLight ? 0x333333 : 0x111111);
        if (env.moonGlowMat) {
          env.moonGlowMat.color.set(isLight ? 0xaaaacc : 0x6666aa);
          env.moonGlowMat.opacity = isLight ? 0.15 : 0.1;
        }

        // Sun and corona layers
        env.sunMat.color.set(isLight ? 0xffcc00 : 0xffee44);
        if (env.innerCoronaMat) {
          env.innerCoronaMat.color.set(isLight ? 0xffdd00 : 0xffff88);
        }
        env.coronaMat.color.set(isLight ? 0xffaa00 : 0xffdd66);
        if (env.outerGlowMat) {
          env.outerGlowMat.color.set(isLight ? 0xff8800 : 0xffcc44);
        }

        // Ambient light - brighter for light mode
        env.amb.intensity = isLight ? 0.7 : 0.4;
      }

      // 4. Trajectory Colors
      window._currentThemeAccent = accentColor;
      if (window._updateTrajectoryColors) window._updateTrajectoryColors();

      // 5. Update HUD card styling for theme consistency
      const hudCard = document.querySelector('.floating-hud');
      if (hudCard) {
        if (isLight) {
          hudCard.style.setProperty('background', 'rgba(255, 255, 255, 0.95)', 'important');
          hudCard.style.setProperty('border-color', 'rgba(0, 0, 0, 0.15)', 'important');
          hudCard.style.setProperty('box-shadow', '0 4px 20px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)', 'important');
        } else {
          hudCard.style.setProperty('background', 'rgba(10, 10, 16, 0.95)', 'important');
          hudCard.style.setProperty('border-color', '', '');
          hudCard.style.setProperty('box-shadow', '', '');
        }
        console.log('[HUD] Theme updated:', isLight ? 'LIGHT' : 'DARK', 'bg:', hudCard.style.background);
      }
    });

    // Initial theme sync
    const initialAccent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    if (initialAccent) globe.atmosphereColor(initialAccent);

    // Apply initial theme to HUD immediately
    const initialTheme = document.documentElement.getAttribute('data-theme');
    const isLightInitial = initialTheme === 'light';
    const initialHudCard = document.querySelector('.floating-hud');
    if (initialHudCard) {
      if (isLightInitial) {
        initialHudCard.style.setProperty('background', 'rgba(255, 255, 255, 0.95)', 'important');
        initialHudCard.style.setProperty('border-color', 'rgba(0, 0, 0, 0.15)', 'important');
        initialHudCard.style.setProperty('box-shadow', '0 4px 20px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)', 'important');
      }
      console.log('[HUD] Initial theme applied:', isLightInitial ? 'LIGHT' : 'DARK');
    }

    // Language change listener - update trajectory legend
    window.addEventListener('language-change', () => {
      createOrUpdateLegend();
      console.log('[Globe] Language changed, legend updated');
    });

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
              color: isLightInit ? 0x555566 : 0xffffff, // Darker, more visible stars for light mode
              size: 1.5,
              sizeAttenuation: false,
              transparent: true,
              opacity: isLightInit ? 0.7 : 0.9 // Higher opacity in light mode for visibility
            });
            const stars = new THREE.Points(starsGeo, starsMat);
            stars.name = 'starfield';

            // 🌙 AY (Moon) - Realistic detailed sphere with crater texture
            const moonGeo = new THREE.SphereGeometry(18, 64, 64);

            // Create procedural moon texture with craters
            const moonCanvas = document.createElement('canvas');
            moonCanvas.width = 512;
            moonCanvas.height = 256;
            const moonCtx = moonCanvas.getContext('2d');

            // Base moon color
            const moonBaseColor = isLightInit ? '#b8b8b8' : '#a0a0a0';
            moonCtx.fillStyle = moonBaseColor;
            moonCtx.fillRect(0, 0, 512, 256);

            // Add crater-like spots
            for (let i = 0; i < 80; i++) {
              const x = Math.random() * 512;
              const y = Math.random() * 256;
              const r = 3 + Math.random() * 15;
              const darkness = 0.7 + Math.random() * 0.3;

              const gradient = moonCtx.createRadialGradient(x, y, 0, x, y, r);
              gradient.addColorStop(0, `rgba(60, 60, 65, ${darkness})`);
              gradient.addColorStop(0.6, `rgba(80, 80, 85, ${darkness * 0.6})`);
              gradient.addColorStop(1, 'rgba(100, 100, 105, 0)');

              moonCtx.fillStyle = gradient;
              moonCtx.beginPath();
              moonCtx.arc(x, y, r, 0, Math.PI * 2);
              moonCtx.fill();
            }

            // Add mare (dark patches)
            for (let i = 0; i < 8; i++) {
              const x = Math.random() * 512;
              const y = Math.random() * 256;
              const r = 30 + Math.random() * 50;

              const gradient = moonCtx.createRadialGradient(x, y, 0, x, y, r);
              gradient.addColorStop(0, 'rgba(70, 70, 75, 0.4)');
              gradient.addColorStop(1, 'rgba(90, 90, 95, 0)');

              moonCtx.fillStyle = gradient;
              moonCtx.beginPath();
              moonCtx.arc(x, y, r, 0, Math.PI * 2);
              moonCtx.fill();
            }

            const moonTexture = new THREE.CanvasTexture(moonCanvas);
            moonTexture.wrapS = THREE.RepeatWrapping;
            moonTexture.wrapT = THREE.RepeatWrapping;

            const moonMat = new THREE.MeshStandardMaterial({
              map: moonTexture,
              color: isLightInit ? 0xd0d0d0 : 0xb0b0b0,
              roughness: 0.95,
              metalness: 0.0,
              emissive: isLightInit ? 0x333333 : 0x111111,
              emissiveIntensity: 0.2,
              bumpScale: 0.02
            });
            const moon = new THREE.Mesh(moonGeo, moonMat);
            moon.position.set(-400, 180, -350);
            moon.name = 'moon';

            // Moon glow (subtle atmospheric effect)
            const moonGlowGeo = new THREE.SphereGeometry(22, 32, 32);
            const moonGlowMat = new THREE.MeshBasicMaterial({
              color: isLightInit ? 0xaaaacc : 0x6666aa,
              transparent: true,
              opacity: isLightInit ? 0.15 : 0.1,
              side: THREE.BackSide
            });
            const moonGlow = new THREE.Mesh(moonGlowGeo, moonGlowMat);
            moonGlow.position.copy(moon.position);
            moonGlow.name = 'moonGlow';

            moon.castShadow = true;
            moon.receiveShadow = true;

            // ☀️ GÜNEŞ (Sun) - Realistic glowing sun with animated corona
            const sunGeo = new THREE.SphereGeometry(55, 64, 64);

            // Create procedural sun texture with surface activity
            const sunCanvas = document.createElement('canvas');
            sunCanvas.width = 512;
            sunCanvas.height = 256;
            const sunCtx = sunCanvas.getContext('2d');

            // Base sun gradient
            const sunGradient = sunCtx.createLinearGradient(0, 0, 512, 256);
            sunGradient.addColorStop(0, '#fff5d0');
            sunGradient.addColorStop(0.5, '#ffdd00');
            sunGradient.addColorStop(1, '#ffaa00');
            sunCtx.fillStyle = sunGradient;
            sunCtx.fillRect(0, 0, 512, 256);

            // Add solar activity spots
            for (let i = 0; i < 40; i++) {
              const x = Math.random() * 512;
              const y = Math.random() * 256;
              const r = 5 + Math.random() * 20;

              const gradient = sunCtx.createRadialGradient(x, y, 0, x, y, r);
              gradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
              gradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.4)');
              gradient.addColorStop(1, 'rgba(255, 150, 50, 0)');

              sunCtx.fillStyle = gradient;
              sunCtx.beginPath();
              sunCtx.arc(x, y, r, 0, Math.PI * 2);
              sunCtx.fill();
            }

            const sunTexture = new THREE.CanvasTexture(sunCanvas);

            const sunMat = new THREE.MeshBasicMaterial({
              map: sunTexture,
              color: isLightInit ? 0xffcc00 : 0xffee44,
              transparent: true,
              opacity: 1
            });
            const sunMesh = new THREE.Mesh(sunGeo, sunMat);
            sunMesh.position.set(850, 350, 550);
            sunMesh.name = 'sunMesh';

            // Inner corona (bright glow)
            const innerCoronaGeo = new THREE.SphereGeometry(75, 32, 32);
            const innerCoronaMat = new THREE.MeshBasicMaterial({
              color: isLightInit ? 0xffdd00 : 0xffff88,
              transparent: true,
              opacity: 0.4,
              side: THREE.BackSide
            });
            const innerCorona = new THREE.Mesh(innerCoronaGeo, innerCoronaMat);
            innerCorona.position.copy(sunMesh.position);
            innerCorona.name = 'innerCorona';

            // Outer corona (diffuse glow)
            const coronaGeo = new THREE.SphereGeometry(100, 32, 32);
            const coronaMat = new THREE.MeshBasicMaterial({
              color: isLightInit ? 0xffaa00 : 0xffdd66,
              transparent: true,
              opacity: 0.2,
              side: THREE.BackSide
            });
            const corona = new THREE.Mesh(coronaGeo, coronaMat);
            corona.position.copy(sunMesh.position);
            corona.name = 'sunCorona';

            // Sun rays/flare effect (sprite-based)
            const outerGlowGeo = new THREE.SphereGeometry(130, 16, 16);
            const outerGlowMat = new THREE.MeshBasicMaterial({
              color: isLightInit ? 0xff8800 : 0xffcc44,
              transparent: true,
              opacity: 0.08,
              side: THREE.BackSide
            });
            const outerGlow = new THREE.Mesh(outerGlowGeo, outerGlowMat);
            outerGlow.position.copy(sunMesh.position);
            outerGlow.name = 'sunOuterGlow';

            // Animate sun corona pulsation
            const animateSun = () => {
              const time = Date.now() * 0.001;
              if (innerCorona && innerCoronaMat) {
                innerCoronaMat.opacity = 0.35 + Math.sin(time * 2) * 0.1;
              }
              if (corona && coronaMat) {
                coronaMat.opacity = 0.18 + Math.sin(time * 1.5 + 1) * 0.05;
              }
              if (outerGlow && outerGlowMat) {
                outerGlowMat.opacity = 0.06 + Math.sin(time + 2) * 0.03;
              }
              // Slow rotation for sun surface
              if (sunMesh) {
                sunMesh.rotation.y += 0.0003;
              }
              requestAnimationFrame(animateSun);
            };
            animateSun();

            // ☀️ IŞIKLANDIRMA
            const amb = new THREE.AmbientLight(0xffffff, isLightInit ? 0.6 : 0.4);
            const sun = new THREE.DirectionalLight(isLightInit ? 0xfffaf0 : 0xffffff, 1.6);
            sun.position.set(150, 100, 150);
            sun.name = 'sunLight';
            amb.name = 'ambientLight';

            group.add(stars, moon, moonGlow, sunMesh, innerCorona, corona, outerGlow, amb, sun);
            group.name = 'envGroup';

            // Store references for theme updates
            window._globeEnv = {
              stars, starsMat,
              moon, moonMat, moonGlow, moonGlowMat,
              sunMesh, sunMat,
              innerCorona, innerCoronaMat,
              corona, coronaMat,
              outerGlow, outerGlowMat,
              amb, sun
            };

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

// =====================================================================
// ISS YÖRÜNGE ÇİZGİSİ (TRAJECTORY) RENDER SİSTEMİ
// =====================================================================
// Amaç: ISS'nin geçmiş ve gelecek yörüngesini 3D dünya üzerinde çizmek
// 
// VERİ FORMATI:
// - Trajectory verisi {lat, lng, alt?, time?} objelerinden oluşur
// - Antimeridian (180°/-180°) geçişinde çizgi düzgün şekilde bölünür
//
// RENK AYARLARI (SABİT - tema bağımsız):
// - Geçmiş çizgi: TURUNCU (#ff6b35)
// - Gelecek çizgi: YEŞİL (#00ff88)
// - Bu renkler asla değişmez, her zaman ayırt edilebilir olmalı
//
// ÖZELLİKLER:
// - Ok işaretleri: gelecek yörünge yönünü gösterir
// - Legend: sağ alt köşede çizgi açıklamaları
// =====================================================================

// Sabit renkler
const TRAJECTORY_COLORS = {
  past: '#ff6b35',       // Turuncu - geçmiş yörünge (SABİT, değişmez)
  futureDefault: '#00d4ff' // Fallback renk (site accent yoksa)
};

/**
 * Gelecek yörünge rengini al (site accent rengine göre)
 * @returns {string} CSS color değeri
 */
function getFutureColor() {
  return window._currentThemeAccent ||
    getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() ||
    TRAJECTORY_COLORS.futureDefault;
}

// Yükseklik - ISS ile AYNI OLMALI
const TRAJECTORY_ALTITUDE = 0.005; // Yüzeye yakın çizim (Ground track)

/**
 * Antimeridian (180°/-180°) longitude değerini normalize eder
 */
function normalizeLng(lng) {
  while (lng > 180) lng -= 360;
  while (lng < -180) lng += 360;
  return lng;
}

/**
 * İki nokta arasında antimeridian geçişi var mı kontrol et
 * @param {number} lng1 - İlk longitude
 * @param {number} lng2 - İkinci longitude
 * @returns {boolean}
 */
function crossesAntimeridian(lng1, lng2) {
  // 180 derece farkı geçiyorsa antimeridian crossing var
  return Math.abs(lng2 - lng1) > 180;
}

/**
 * Antimeridian geçiş noktasını hesapla (interpolasyon)
 * @param {{lat: number, lng: number}} p1 - Başlangıç noktası
 * @param {{lat: number, lng: number}} p2 - Bitiş noktası
 * @returns {{crossLat: number, side1Lng: number, side2Lng: number}}
 */
function getAntimeridianCrossing(p1, p2) {
  // Normalize longitudes for calculation
  let lng1 = p1.lng;
  let lng2 = p2.lng;

  // Adjust for crossing
  if (lng2 - lng1 > 180) lng2 -= 360;
  if (lng1 - lng2 > 180) lng1 -= 360;

  // Find where the line crosses 180 or -180
  const targetLng = lng1 > 0 ? 180 : -180;
  const t = (targetLng - lng1) / (lng2 - lng1);
  const crossLat = p1.lat + t * (p2.lat - p1.lat);

  return {
    crossLat,
    side1Lng: lng1 > 0 ? 180 : -180,
    side2Lng: lng1 > 0 ? -180 : 180
  };
}

/**
 * Koordinatları antimeridian geçişlerinde böler.
 * Her segment [lat, lng, alt] formatında array'ler içerir.
 * 
 * @param {Array<{lat: number, lng: number}>} coords - Koordinat noktaları
 * @returns {Array<Array<[number, number, number]>>} - Bölünmüş segmentler
 */
function splitAtAntimeridian(coords) {
  if (!coords || coords.length < 2) return [];

  const segments = [];
  let currentSegment = [];

  for (let i = 0; i < coords.length; i++) {
    const curr = coords[i];

    // Geçersiz koordinat kontrolü
    if (curr == null || typeof curr.lat !== 'number' || typeof curr.lng !== 'number' ||
      isNaN(curr.lat) || isNaN(curr.lng)) {
      continue;
    }

    if (currentSegment.length === 0) {
      currentSegment.push([curr.lat, normalizeLng(curr.lng), TRAJECTORY_ALTITUDE]);
      continue;
    }

    const prevPoint = coords[i - 1];
    if (!prevPoint) {
      currentSegment.push([curr.lat, normalizeLng(curr.lng), TRAJECTORY_ALTITUDE]);
      continue;
    }

    // Antimeridian geçişi kontrolü
    if (crossesAntimeridian(prevPoint.lng, curr.lng)) {
      // Geçiş noktasını hesapla
      const crossing = getAntimeridianCrossing(prevPoint, curr);

      // Mevcut segment'e kenar noktası ekle
      currentSegment.push([crossing.crossLat, crossing.side1Lng, TRAJECTORY_ALTITUDE]);

      // Segment'i kaydet (en az 2 nokta varsa)
      if (currentSegment.length >= 2) {
        segments.push(currentSegment);
      }

      // Yeni segment başlat (diğer taraftan)
      currentSegment = [[crossing.crossLat, crossing.side2Lng, TRAJECTORY_ALTITUDE]];
    }

    // Normal nokta ekle
    currentSegment.push([curr.lat, normalizeLng(curr.lng), TRAJECTORY_ALTITUDE]);
  }

  // Son segment'i ekle
  if (currentSegment.length >= 2) {
    segments.push(currentSegment);
  }

  return segments;
}

// ========== ARROW ANIMATION SYSTEM ==========
// Animation state for 3D globe arrows
let arrowAnimationId = null;
const ARROW_SPACING_3D = 35.0; // Degrees between arrows - increased for cleaner look
const ARROW_SPEED_3D = 0.008; // Animation speed (degrees per ms) - slower for smoother motion
let trajectoryCoords = { past: [], future: [] }; // Store coords for animation

/**
 * Create SVG triangle arrow
 * @param {string} color - Arrow color
 * @param {number} size - Arrow size in pixels
 * @returns {string} SVG string
 */
function createArrowSvg(color, size = 16) {
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="opacity: 0.75;">
      <path d="M12 2l-8 14h16z" fill="${color}" stroke="rgba(0,0,0,0.3)" stroke-width="1" stroke-linejoin="round"/>
    </svg>
  `;
}

/**
 * Calculate distance between two [lat, lng] or [lng, lat] points (simple Euclidean for arrow spacing)
 * @param {Array} p1 - [x, y] point
 * @param {Array} p2 - [x, y] point
 * @returns {number} Distance
 */
function getDist(p1, p2) {
  return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
}

/**
 * Calculate bearing (direction) between two lat/lng points
 * @param {Array} p1 - [lat, lng] point
 * @param {Array} p2 - [lat, lng] point
 * @returns {number} Bearing in degrees
 */
function getBearingFromPoints(p1, p2) {
  const lat1 = p1[0];
  const lng1 = p1[1];
  const lat2 = p2[0];
  const lng2 = p2[1];

  const dLon = (lng2 - lng1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;

  const y = Math.sin(dLon) * Math.cos(lat2Rad);
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);

  return Math.atan2(y, x) * 180 / Math.PI;
}

/**
 * Generate arrow points along a path with interpolation
 * Generate arrow points along a path with interpolation and target look-ahead
 * @param {Array<Array>} path - Array of [lat, lng, alt] coordinates
 * @param {number} startOffset - Starting offset for animation phase
 * @param {string} color - Arrow color
 * @returns {Array} Array of arrow point objects
 */
function generateArrowPoints(path, startOffset, color) {
  if (!path || path.length < 2) return [];

  const points = [];
  const segLens = [];

  // Calculate segment lengths
  for (let i = 0; i < path.length - 1; i++) {
    // Check for antimeridian jump
    const dLng = Math.abs(path[i][1] - path[i + 1][1]);
    if (dLng > 180) {
      segLens.push(0); // Skip world wrap segments
    } else {
      const d = getDist([path[i][0], path[i][1]], [path[i + 1][0], path[i + 1][1]]);
      segLens.push(d);
    }
  }

  // Calculate total path length
  const totalPathLength = segLens.reduce((sum, len) => sum + len, 0);

  // Walk the path and place arrows
  let pathDist = 0;
  let nextArrowDist = startOffset % totalPathLength; // Wrap within path length

  for (let i = 0; i < segLens.length; i++) {
    const segLen = segLens[i];
    if (segLen === 0) {
      pathDist += segLen;
      continue;
    }

    const segStartDist = pathDist;
    const segEndDist = pathDist + segLen;

    // Place arrows within this segment
    while (nextArrowDist < segEndDist && nextArrowDist < totalPathLength) {
      const fraction = (nextArrowDist - segStartDist) / segLen;
      const p1 = path[i];
      const p2 = path[i + 1];

      // Current position
      const lat = p1[0] + (p2[0] - p1[0]) * fraction;
      const lng = p1[1] + (p2[1] - p1[1]) * fraction;

      // Target position (slightly ahead) for orientation
      // Use a small epsilon ahead to calculate tangent
      const epsilon = 0.01;
      const fractionTarget = Math.min(1, fraction + epsilon);
      const targetLat = p1[0] + (p2[0] - p1[0]) * fractionTarget;
      const targetLng = p1[1] + (p2[1] - p1[1]) * fractionTarget;

      const alt = p1[2] || TRAJECTORY_ALTITUDE;

      points.push({
        lat,
        lng,
        alt,
        targetLat,
        targetLng,
        color
      });

      nextArrowDist += ARROW_SPACING_3D;
    }
    pathDist += segLen;
  }

  return points;
}

// ThreeJS rendering group for arrows
let arrowsGroup = new THREE.Group();

/**
 * Start arrow animation loop
 * Uses direct ThreeJS meshes for correct 3D orientation
 */
function startArrowAnimation() {
  if (arrowAnimationId) cancelAnimationFrame(arrowAnimationId);
  if (!globe) return;

  // Ensure group is in scene
  if (!globe.scene().children.includes(arrowsGroup)) {
    globe.scene().add(arrowsGroup);
  }

  // MUCH LARGER ARROWS
  // Radius: 1.5, Height: 4.0 (Relative to Sphere R=100)
  // This ensures they are visible even when zoomed out
  const arrowGeometry = new THREE.ConeGeometry(1.5, 4.0, 8);
  // Rotate geometry so Tip points to +Z (for lookAt)
  arrowGeometry.rotateX(Math.PI / 2);

  const animate = () => {
    const now = Date.now();
    const phase = (now * ARROW_SPEED_3D) % ARROW_SPACING_3D;

    // Combine past and future arrow points
    const allArrows = [];

    // Past arrows: ANIMATED (backward loop now fixed in generateArrowPoints)
    if (trajectoryCoords.past && trajectoryCoords.past.length > 0) {
      const pastArrows = generateArrowPoints(trajectoryCoords.past, phase, TRAJECTORY_COLORS.past);
      allArrows.push(...pastArrows);
    }

    // Future arrows: ANIMATED
    if (trajectoryCoords.future && trajectoryCoords.future.length > 0) {
      const futureArrows = generateArrowPoints(trajectoryCoords.future, phase, getFutureColor());
      allArrows.push(...futureArrows);
    }

    // Rebuild arrows mesh
    // Note: Recreating meshes every frame is not ideal for performance but simplified for correctness.
    // Optimization: Pool meshes if needed. For ~20 arrows it's fine.

    // Clear old arrows
    arrowsGroup.clear(); // ThreeJS r123+ clear()

    allArrows.forEach(d => {
      const material = new THREE.MeshLambertMaterial({
        color: d.color,
        transparent: false, // Solid visibility
        opacity: 1.0,
        emissive: d.color,
        emissiveIntensity: 0.8, // Bright glow
        flatShading: true
      });

      const mesh = new THREE.Mesh(arrowGeometry, material);

      // Position
      const pos = globe.getCoords(d.lat, d.lng, d.alt);
      mesh.position.set(pos.x, pos.y, pos.z);

      // Orientation
      const target = globe.getCoords(d.targetLat, d.targetLng, d.alt);
      mesh.lookAt(target.x, target.y, target.z);

      arrowsGroup.add(mesh);
    });

    arrowAnimationId = requestAnimationFrame(animate);
  };

  animate();
  console.log('[Trajectory] Arrow animation started (ThreeJS Mode)');
}

/**
 * Legend (açıklama kutusu) oluştur/güncelle
 */
function createOrUpdateLegend() {
  let legend = document.getElementById('trajectory-legend');

  if (!legend) {
    legend = document.createElement('div');
    legend.id = 'trajectory-legend';
    legend.style.cssText = `
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: rgba(0, 0, 0, 0.85);
  backdrop - filter: blur(10px);
  border - radius: 8px;
  padding: 8px 12px;
  z - index: 90;
  font - family: 'Inter', system - ui, sans - serif;
  font - size: 10px;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box - shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  pointer - events: none;
  `;

    legend.innerHTML = `
    < div style = "font-weight: 600; margin-bottom: 8px; opacity: 0.7; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;" >
        🛰️ ${t('trajectoryLegend')}
      </div >
      <div style="display: flex; align-items: center; margin-bottom: 6px;">
        <div style="width: 24px; height: 3px; background: ${TRAJECTORY_COLORS.past}; border-radius: 2px; margin-right: 10px;"></div>
        <span>${t('trajectoryPast')}</span>
      </div>
      <div style="display: flex; align-items: center;">
        <div id="legend-future-line" style="width: 24px; height: 3px; background: ${getFutureColor()}; border-radius: 2px; margin-right: 10px; position: relative;">
          <span style="position: absolute; right: -6px; top: -4px; font-size: 10px;">▸</span>
        </div>
        <span>${t('trajectoryFuture')} →</span>
      </div>
  `;

    // Globe container'ın parent'ına ekle
    const container = document.querySelector('#globe-3d-canvas-container')?.parentElement || document.body;
    container.appendChild(legend);
  }

  // Tema kontrolü
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  legend.style.background = isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)';
  legend.style.color = isLight ? '#1a1a2e' : 'white';
  legend.style.borderColor = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';

  // Gelecek çizgisi rengini güncelle (tema accent'e göre)
  const futureLine = legend.querySelector('#legend-future-line');
  if (futureLine) {
    futureLine.style.background = getFutureColor();
  }
}

/**
 * Yörünge çizgilerini 3D dünya üzerinde render eder.
 * Bu fonksiyon tema değişikliklerinde otomatik çağrılır.
 */
function renderTrajectoryLines() {
  if (!globe) return;

  const { past, future } = rawTrajectory;

  // Veri yoksa boş render ve legend gizle
  if ((!past || past.length === 0) && (!future || future.length === 0)) {
    globe.pathsData([]);
    const legend = document.getElementById('trajectory-legend');
    if (legend) legend.style.display = 'none';
    return;
  }

  // Legend'ı göster/oluştur
  createOrUpdateLegend();
  const legend = document.getElementById('trajectory-legend');
  if (legend) legend.style.display = 'block';

  const allPaths = [];

  // ========== GEÇMİŞ YÖRÜNGE (TURUNCU) ==========
  if (past && past.length > 1) {
    const pastWithCurrent = [
      ...past,
      { lat: renderPos.lat, lng: renderPos.lng }
    ];

    const segments = splitAtAntimeridian(pastWithCurrent);
    // splitAtAntimeridian already returns [[lat, lng, alt], ...] format
    segments.forEach(segment => {
      allPaths.push({
        coords: segment,
        color: TRAJECTORY_COLORS.past,
        type: 'past'
      });
    });

    // Store flattened coords for arrow animation
    trajectoryCoords.past = segments.flat();
  }

  // ========== GELECEK YÖRÜNGE (CYAN) ==========
  if (future && future.length > 1) {
    let futureWithCurrent;

    // Check distance to first future point to prevent glitches (e.g. crossing antimeridian or bad data)
    // getDist returns Euclidean distance in degrees. If > 10 degrees, don't connect.
    const distToFirst = future[0] ? getDist([renderPos.lat, renderPos.lng], [future[0].lat, future[0].lng]) : 0;

    if (distToFirst < 10) {
      futureWithCurrent = [
        { lat: renderPos.lat, lng: renderPos.lng },
        ...future
      ];
    } else {
      futureWithCurrent = [...future];
    }

    const segments = splitAtAntimeridian(futureWithCurrent);

    // ========== CREATE DASHED EFFECT ==========
    // Globe.gl's pathDash doesn't work reliably, so we manually create gaps
    // by only rendering every other small segment
    const renderedChunks = []; // Track rendered segments for arrow placement

    segments.forEach(segment => {
      // Split each long segment into small chunks
      const chunkSize = 3; // Smaller chunks for tighter dash pattern
      for (let i = 0; i < segment.length; i += chunkSize) {
        const chunkIndex = Math.floor(i / chunkSize);
        // Render only odd chunks (creates dash-gap-dash pattern)
        if (chunkIndex % 2 === 1) {
          const chunk = segment.slice(i, i + chunkSize);
          if (chunk.length >= 2) { // Need at least 2 points for a line
            allPaths.push({
              coords: chunk,
              color: getFutureColor() + '99', // Semi-transparent
              type: 'future'
            });
            renderedChunks.push(...chunk); // Add to rendered list for arrows
          }
        }
      }
    });

    // Store ONLY rendered chunks for arrow animation (prevents floating arrows in gaps)
    trajectoryCoords.future = renderedChunks;
  }

  // ========== ÇİZGİLERİ RENDER ET ==========
  // Accessors'ları ayarla - 2D modundaki görünüme benzer stil
  globe
    .pathPoints(d => d.coords)
    .pathPointLat(p => p[0])
    .pathPointLng(p => p[1])
    .pathPointAlt(p => p[2] || TRAJECTORY_ALTITUDE)
    .pathColor(d => d.color) // Color already includes alpha where needed
    .pathStroke(d => d.type === 'past' ? 3 : 2)
    .pathDashLength(1) // Not using dash API, manual segments instead
    .pathDashGap(0)
    .pathDashAnimateTime(0)
    .pathResolution(512); // Maximum resolution for smooth curves

  // Veriyi ayarla - requestAnimationFrame ile globe'un hazır olmasını garantiliyoruz
  requestAnimationFrame(() => {
    if (globe && globe.pathsData) {
      globe.pathsData(allPaths);
      console.log('[Trajectory] Rendered', allPaths.length, 'path segments. Past color:', TRAJECTORY_COLORS.past, 'Future color:', getFutureColor());

      // Start arrow animation with trajectory data
      startArrowAnimation();
    }
  });
}

// Global hook for theme change updates
// Tema değiştiğinde çağrılır - zorla yeniden render yapar
window._updateTrajectoryColors = () => {
  console.log('[Trajectory] Theme changed, forcing re-render with new accent:', getFutureColor());

  if (globe) {
    // Path'leri tamamen temizle
    globe.pathsData([]);

    // Bir sonraki frame'de yeniden render yap
    requestAnimationFrame(() => {
      renderTrajectoryLines();
      createOrUpdateLegend();
    });
  } else {
    createOrUpdateLegend();
  }
};
