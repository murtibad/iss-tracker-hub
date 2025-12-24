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
const gltfLoader = new GLTFLoader();

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

            // 🌌 YILDIZLAR
            const starsGeo = new THREE.BufferGeometry();
            const starCount = 4000;
            const pos = [];
            for (let i = 0; i < starCount; i++) {
              const r = 400 + Math.random() * 200;
              const u = Math.random() * 2 - 1;
              const t = Math.random() * Math.PI * 2;
              pos.push(
                r * Math.sqrt(1 - u * u) * Math.cos(t),
                r * Math.sqrt(1 - u * u) * Math.sin(t),
                r * u
              );
            }
            starsGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
            const starsMat = new THREE.PointsMaterial({
              color: 0xffffff,
              size: 0.7,
              sizeAttenuation: false
            });
            const stars = new THREE.Points(starsGeo, starsMat);

            // ☀️ IŞIKLANDIRMA
            const amb = new THREE.AmbientLight(0xffffff, 0.5);
            const sun = new THREE.DirectionalLight(0xffffff, 1.8);
            sun.position.set(150, 150, 150);

            group.add(stars, amb, sun);
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
        const bearing = getBearing(renderPos.lat, renderPos.lng, targetPos.lat, targetPos.lng);
        issMesh.rotation.y = -bearing + Math.PI;
      }

      // 2. CAMERA FOLLOW (Sadece takip modu açıksa)
      if (followEnabled) {
        // Takip modunda manuel kontrolleri devre dışı bırak
        if (globe.controls().enabled) {
          globe.controls().enabled = false;
        }

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
      } else {
        // Takip kapalıyken manuel kontrolleri etkinleştir
        if (!globe.controls().enabled) {
          globe.controls().enabled = true;
        }
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
    if (!globe) return;

    console.log('[Globe] updateTrajectory called - Past:', past?.length, 'Future:', future?.length);

    const paths = [];

    // PAST TRAJECTORY (mavi) - ISS'in arkasındaki çizgi
    if (past?.length > 1) {
      const coords = past.map(p => ({ lat: p.lat, lng: p.lng }));
      // Son noktayı ISS'in şu anki konumuna bağla
      coords.push({ lat: renderPos.lat, lng: renderPos.lng });
      paths.push({ coords, type: 'past' });
      console.log('[Globe] Past trajectory:', coords.length, 'points');
    }

    // FUTURE TRAJECTORY (turuncu) - ISS'in önündeki çizgi
    if (future?.length > 1) {
      // İlk noktayı ISS'in şu anki konumuna bağla
      const coords = [
        { lat: renderPos.lat, lng: renderPos.lng },
        ...future.map(p => ({ lat: p.lat, lng: p.lng }))
      ];
      paths.push({ coords, type: 'future' });
      console.log('[Globe] Future trajectory:', coords.length, 'points');
    }

    // YENİ PATHS'İ SET ET - Tek işlemde hem paths hem de tüm config
    console.log('[Globe] Setting', paths.length, 'path(s)');

    // ÖNCE TAMAMEN TEMİZLE
    globe.pathsData([]);

    // Sonra yeniden set et - Globe.gl'in internal state'inin güncellenmesi için micro-delay
    setTimeout(() => {
      if (!globe) return;
      globe.pathsData(paths)
        .pathPoints('coords')
        .pathPointLat(p => p.lat)
        .pathPointLng(p => p.lng)
        .pathColor(p => p.type === 'past' ? '#00d4ff' : '#FF8800')
        .pathStroke(p => p.type === 'past' ? 3 : 2.5)
        .pathDashLength(p => p.type === 'past' ? 0 : 0.4)
        .pathDashGap(p => p.type === 'past' ? 0 : 0.2)
        .pathPointAlt(ISS_ORBIT_ALTITUDE);
    }, 0);
  }
};
