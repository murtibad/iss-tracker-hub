// src/ui/globeView.js
import * as THREE from "three";

let globe = null;
let followTimer = null;
let followEnabled = false;
let animationFrameId = null;

const issData = { lat: 0, lng: 0, alt: 0.06, type: "iss" };
let userData = null;
const trail = [];

function clampLat(lat) {
  return Math.max(-89.9, Math.min(89.9, lat));
}
function normLng(lng) {
  while (lng > 180) lng -= 360;
  while (lng < -180) lng += 360;
  return lng;
}

function createISSModel() {
  const group = new THREE.Group();

  // Ana modül (gövde) - 2x DAHA BÜYÜK
  const mainModule = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 2.4, 16),
    new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      metalness: 0.7,
      roughness: 0.3,
      emissive: 0xffffff,
      emissiveIntensity: 0.4
    })
  );
  mainModule.rotation.z = Math.PI / 2;
  group.add(mainModule);

  // Güneş panelleri - 2x DAHA BÜYÜK
  const panelGeo = new THREE.BoxGeometry(2, 0.1, 6);
  const panelMat = new THREE.MeshStandardMaterial({
    color: 0x2266ff,
    metalness: 0.9,
    roughness: 0.1,
    emissive: 0x1144aa,
    emissiveIntensity: 0.7
  });

  // Sol panel set
  const leftPanelGroup = new THREE.Group();
  const lp1 = new THREE.Mesh(panelGeo, panelMat);
  const lp2 = new THREE.Mesh(panelGeo, panelMat);
  lp2.position.z = 6.4;
  leftPanelGroup.add(lp1, lp2);
  leftPanelGroup.position.x = -2.4;
  group.add(leftPanelGroup);

  // Sağ panel set
  const rightPanelGroup = new THREE.Group();
  const rp1 = new THREE.Mesh(panelGeo, panelMat);
  const rp2 = new THREE.Mesh(panelGeo, panelMat);
  rp2.position.z = 6.4;
  rightPanelGroup.add(rp1, rp2);
  rightPanelGroup.position.x = 2.4;
  group.add(rightPanelGroup);

  // Parlak anten
  const antennaMat = new THREE.MeshStandardMaterial({
    color: 0xffaa00,
    emissive: 0xff6600,
    emissiveIntensity: 0.8
  });
  const antenna1 = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8),
    antennaMat
  );
  antenna1.position.set(0, 0.4, 0);
  group.add(antenna1);

  // PARLAK BEACON - Uzaktan da görünsün!
  const beacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 16, 16),
    new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.9
    })
  );
  beacon.position.set(0, 0, 0);
  group.add(beacon);

  // ISS'i biraz döndürelim
  group.rotation.y = Math.PI / 6;
  group.rotation.x = Math.PI / 12;

  return group;
}

function createUserPin() {
  return new THREE.Mesh(
    new THREE.SphereGeometry(0.008, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0xaa0000 })
  );
}

export async function initGlobe(container) {
  if (globe) return globe;

  const [{ default: Globe }] = await Promise.all([import("globe.gl")]);

  globe = Globe()(container)
    .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
    .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
    .backgroundColor("#000")
    .customLayerData([])
    .customThreeObject(d => {
      if (d.type === "iss") {
        return createISSModel();
      }
      if (d.type === "user") return createUserPin();

      // yıldızlar + ışık + atmosfer
      if (d.type === "env") {
        const group = new THREE.Group();

        const starsGeo = new THREE.BufferGeometry();
        const starCount = 1200;
        const pos = [];
        for (let i = 0; i < starCount; i++) {
          const r = 250;
          const u = Math.random() * 2 - 1;
          const t = Math.random() * Math.PI * 2;
          pos.push(
            r * Math.sqrt(1 - u * u) * Math.cos(t),
            r * Math.sqrt(1 - u * u) * Math.sin(t),
            r * u
          );
        }
        starsGeo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1 });
        const stars = new THREE.Points(starsGeo, starsMat);

        const ambient = new THREE.AmbientLight(0xffffff, 0.25);
        const sun = new THREE.DirectionalLight(0xffffff, 0.6);
        sun.position.set(1, 0.5, 0.2);

        const atmosphere = new THREE.Mesh(
          new THREE.SphereGeometry(102, 32, 32),
          new THREE.MeshLambertMaterial({
            color: 0x3399ff,
            transparent: true,
            opacity: 0.08
          })
        );

        group.add(stars, ambient, sun, atmosphere);
        window.issLights = { ambient, sun, starsMat };
        return group;
      }
    })
    .customThreeObjectUpdate((obj, d) => {
      if (!d.lat) return;
      const c = globe.getCoords(d.lat, d.lng, d.alt || 0);
      obj.position.set(c.x, c.y, c.z);

      // ISS modeli için hafif rotasyon animasyonu
      if (d.type === "iss") {
        obj.rotation.y += 0.005; // Yavaş yavaş dönsün
      }
    });

  globe.customLayerData([
    issData,
    { type: "env", lat: 0, lng: 0 }
  ]);

  globe.pointOfView({ lat: 20, lng: 0, altitude: 2.2 });

  setInterval(updateISS, 10000); // 10 saniye - Rate limit'i önlemek için
  updateISS();

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(p => {
      userData = {
        lat: p.coords.latitude,
        lng: p.coords.longitude,
        alt: 0.01,
        type: "user"
      };
      globe.customLayerData([issData, userData, { type: "env" }]);
    });
  }

  window.startFollow = () => {
    followEnabled = true;
    if (followTimer) clearInterval(followTimer);
    followTimer = setInterval(() => {
      if (!followEnabled) return;
      const pov = globe.pointOfView();
      pov.lat += (issData.lat - pov.lat) * 0.1;
      pov.lng += (issData.lng - pov.lng) * 0.1;
      pov.altitude += (1.5 - pov.altitude) * 0.05;
      globe.pointOfView(pov);
    }, 50);
  };

  window.stopFollow = () => {
    followEnabled = false;
    clearInterval(followTimer);
  };

  return globe;
}

// boot.js tarafından beklenen API wrapper
let globeWrapper = null;

export async function createGlobe(container) {
  // Eğer zaten oluşturulmuşsa mevcut wrapper'ı döndür
  if (globeWrapper) return globeWrapper;

  // Globe container oluştur
  const globeContainer = document.createElement("div");
  globeContainer.id = "globe-container";
  globeContainer.style.cssText = `
    position: absolute !important;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    display: none;
  `;
  container.appendChild(globeContainer);

  // Globe'u başlat
  const globeInstance = await initGlobe(globeContainer);

  // API wrapper oluştur ve kaydet
  globeWrapper = {
    setVisible(visible) {
      globeContainer.style.display = visible ? "block" : "none";
      if (visible && globeInstance) {
        // Resize triggered when shown
        setTimeout(() => {
          try {
            if (globeInstance.width) globeInstance.width(globeContainer.clientWidth);
            if (globeInstance.height) globeInstance.height(globeContainer.clientHeight);
          } catch (e) {
            console.warn("Globe resize error:", e);
          }
        }, 100);
      }
    },
    setIssPosition(lat, lng) {
      issData.lat = clampLat(lat);
      issData.lng = normLng(lng);
      if (globeInstance) {
        try {
          const layerData = userData ? [issData, userData, { type: "env" }] : [issData, { type: "env" }];
          globeInstance.customLayerData(layerData);
        } catch (e) {
          console.warn("ISS position update error:", e);
        }
      } else {
      }
    },
    startFollow() {
      followEnabled = true;

      // requestAnimationFrame kullanarak smooth hareket
      const animate = () => {
        if (!followEnabled || !globeInstance) {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
          return;
        }

        try {
          const pov = globeInstance.pointOfView();
          // Daha yavaş interpolasyon - smooth hareket için
          const lerp = 0.02; // 0.1'den 0.02'ye düşürdük
          pov.lat += (issData.lat - pov.lat) * lerp;
          pov.lng += (issData.lng - pov.lng) * lerp;
          pov.altitude += (1.8 - pov.altitude) * lerp; // Biraz daha uzak
          globeInstance.pointOfView(pov, 0); // 0 = animasyon yok, manuel kontrol
        } catch (e) {
          console.warn("Globe follow error:", e);
        }

        animationFrameId = requestAnimationFrame(animate);
      };

      animate();
    },
    stopFollow() {
      followEnabled = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    },

    /**
     * Update trajectory lines on 3D globe
     * @param {Array} pastPoints - Array of {lat, lng} for past trajectory
     * @param {Array} futurePoints - Array of {lat, lng} for future trajectory
     */
    updateTrajectory(pastPoints, futurePoints) {
      if (!globeInstance) {
        console.warn('[Globe] Not initialized yet');
        return;
      }

      try {
        // Combine past and future as separate path objects
        const trajectoryPaths = [];

        // Past trajectory (cyan, solid)
        if (pastPoints && pastPoints.length > 1) {
          trajectoryPaths.push({
            coords: pastPoints.map(p => ({ lat: p.lat, lng: p.lng })),
            type: 'past'
          });
        }

        // Future trajectory (orange)
        if (futurePoints && futurePoints.length > 1) {
          trajectoryPaths.push({
            coords: futurePoints.map(p => ({ lat: p.lat, lng: p.lng })),
            type: 'future'
          });
        }

        // Update globe paths
        globeInstance.pathsData(trajectoryPaths)
          .pathPoints('coords')
          .pathPointLat(p => p.lat)
          .pathPointLng(p => p.lng)
          .pathColor(path => {
            if (path.type === 'past') {
              return ['rgba(0, 212, 255, 0.9)', 'rgba(0, 180, 220, 0.6)']; // Cyan gradient
            }
            return ['rgba(255, 165, 0, 0.6)', 'rgba(255, 140, 0, 0.3)']; // Orange gradient
          })
          .pathStroke(path => path.type === 'past' ? 2.5 : 1.5)
          .pathDashLength(path => path.type === 'past' ? 0 : 0.3)  // Dashed for future
          .pathDashGap(path => path.type === 'past' ? 0 : 0.15)
          .pathPointAlt(() => 0.08); // ~ISS orbit altitude for depth perception

        console.log(`[Globe] 🛤️ Trajectory updated: ${pastPoints?.length || 0} past, ${futurePoints?.length || 0} future`);
      } catch (e) {
        console.error('[Globe] Trajectory update error:', e);
      }
    },

    get instance() {
      return globeInstance;
    }
  };

  return globeWrapper;
}

async function updateISS() {
  try {
    const r = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
    const j = await r.json();
    issData.lat = clampLat(j.latitude);
    issData.lng = normLng(j.longitude);
    issData.alt = 0.06; // Daha yüksek - daha görünür

    // ISS ve diğer objeleri güncelle
    globe.customLayerData(
      userData ? [issData, userData, { type: "env" }] : [issData, { type: "env" }]
    );

    // Note: Old trail pathsData removed - trajectory now handled by boot.js
  } catch (e) {
    console.error("ISS update error", e);
  }
}
