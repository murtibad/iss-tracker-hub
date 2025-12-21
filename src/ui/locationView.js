// src/ui/locationView.js
// TR: Konum izni + şehir/ilçe/mahalle seçimi overlay UI (mobil öncelik)
// EN: Location permission + place picker overlay UI (mobile first)

import { COPY } from "../constants/copy.js";
import cities from "../assets/cities.tr.json";

function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

function btn(text, className = "glass-btn") {
  const b = el("button", className);
  b.type = "button";
  b.textContent = text;
  return b;
}

/**
 * @param {{
 *  onRequestGps?: Function,
 *  onSelectPlace?: Function,
 *  startMode?: "landing" | "place"
 * }} opts
 */
export function createLocationOverlay({
  onRequestGps,
  onSelectPlace,
  startMode = "landing",
} = {}) {
  const overlay = el("div", "loc-overlay");
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.background = "rgba(0,0,0,0.55)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.padding = "18px";
  overlay.style.zIndex = "9999";

  const card = el("div", "glass-strong");
  card.style.width = "min(720px, 100%)";
  card.style.borderRadius = "18px";
  card.style.padding = "14px";
  card.style.maxHeight = "min(78vh, 720px)";
  card.style.overflow = "hidden";
  card.style.display = "flex";
  card.style.flexDirection = "column";
  overlay.appendChild(card);

  const top = el("div", "loc-top");
  top.style.display = "flex";
  top.style.alignItems = "center";
  top.style.justifyContent = "space-between";
  top.style.gap = "10px";
  top.style.marginBottom = "10px";
  card.appendChild(top);

  const title = el("div", "loc-title");
  title.style.fontWeight = "900";
  title.style.fontSize = "14px";
  title.textContent = "Konum / Yer Seçimi";
  top.appendChild(title);

  const xBtn = btn("Kapat", "glass-btn");
  top.appendChild(xBtn);

  const body = el("div", "loc-body");
  body.style.overflow = "auto";
  body.style.paddingRight = "6px";
  card.appendChild(body);

  // ---------- Landing page ----------
  const pageLanding = el("div", "loc-page");
  body.appendChild(pageLanding);

  const p1 = el("div", "loc-p");
  p1.style.opacity = "0.9";
  p1.style.fontWeight = "800";
  p1.style.marginBottom = "10px";
  p1.textContent =
    "İstersen cihaz konumunu kullanıp (GPS) otomatik şehir belirleyebiliriz. İzin vermezsen manuel seçersin.";
  pageLanding.appendChild(p1);

  const rowBtns = el("div", "loc-row");
  rowBtns.style.display = "flex";
  rowBtns.style.gap = "10px";
  rowBtns.style.flexWrap = "wrap";
  pageLanding.appendChild(rowBtns);

  const gpsBtn = btn("Konumumu Kullan (GPS)", "glass-btn");
  const manualBtn = btn("Manuel Seç", "glass-btn");
  rowBtns.append(gpsBtn, manualBtn);

  const hint = el("div", "loc-hint");
  hint.style.marginTop = "10px";
  hint.style.opacity = "0.8";
  hint.style.fontWeight = "700";
  hint.style.fontSize = "12px";
  hint.textContent = "Not: İlçe/mahalle için API yoksa manuel yazabileceksin.";
  pageLanding.appendChild(hint);

  // ---------- Place picker page ----------
  const pagePlace = el("div", "loc-page");
  pagePlace.style.display = "none";
  body.appendChild(pagePlace);

  const search = el("input", "loc-search");
  search.type = "search";
  search.placeholder = "Şehir ara… (örn: Sakarya)";
  search.style.width = "100%";
  search.style.padding = "10px 12px";
  search.style.borderRadius = "14px";
  search.style.border = "1px solid rgba(255,255,255,0.14)";
  search.style.background = "rgba(255,255,255,0.08)";
  search.style.color = "inherit";
  search.style.outline = "none";
  search.style.fontWeight = "800";
  pagePlace.appendChild(search);

  const listWrap = el("div", "loc-list");
  listWrap.style.marginTop = "10px";
  listWrap.style.display = "grid";
  listWrap.style.gridTemplateColumns = "1fr";
  listWrap.style.gap = "8px";
  listWrap.style.maxHeight = "220px";
  listWrap.style.overflow = "auto";
  listWrap.style.paddingRight = "6px";
  pagePlace.appendChild(listWrap);

  const sep = el("div", "loc-sep");
  sep.style.height = "1px";
  sep.style.background = "rgba(255,255,255,0.12)";
  sep.style.margin = "12px 0";
  pagePlace.appendChild(sep);

  const form = el("div", "loc-form");
  form.style.display = "grid";
  form.style.gridTemplateColumns = "1fr 1fr";
  form.style.gap = "10px";
  pagePlace.appendChild(form);

  const cityBox = el("div");
  const districtBox = el("div");
  const neighBox = el("div");
  cityBox.style.gridColumn = "1 / -1";
  neighBox.style.gridColumn = "1 / -1";
  form.append(cityBox, districtBox, neighBox);

  const labCity = el("div");
  labCity.style.fontWeight = "900";
  labCity.style.marginBottom = "6px";
  labCity.textContent = "Seçilen Şehir";
  cityBox.appendChild(labCity);

  const pickedCity = el("div", "glass-pill");
  pickedCity.style.padding = "10px 12px";
  pickedCity.style.borderRadius = "999px";
  pickedCity.style.border = "1px solid rgba(255,255,255,0.14)";
  pickedCity.style.background = "rgba(255,255,255,0.08)";
  pickedCity.style.fontWeight = "900";
  pickedCity.textContent = "—";
  cityBox.appendChild(pickedCity);

  const labDist = el("div");
  labDist.style.fontWeight = "900";
  labDist.style.marginBottom = "6px";
  labDist.textContent = "İlçe (opsiyonel)";
  districtBox.appendChild(labDist);

  const districtInput = el("input");
  districtInput.type = "text";
  districtInput.placeholder = "Örn: Serdivan";
  districtInput.style.width = "100%";
  districtInput.style.padding = "10px 12px";
  districtInput.style.borderRadius = "14px";
  districtInput.style.border = "1px solid rgba(255,255,255,0.14)";
  districtInput.style.background = "rgba(255,255,255,0.08)";
  districtInput.style.color = "inherit";
  districtInput.style.outline = "none";
  districtInput.style.fontWeight = "800";
  districtBox.appendChild(districtInput);

  const labNeigh = el("div");
  labNeigh.style.fontWeight = "900";
  labNeigh.style.marginBottom = "6px";
  labNeigh.textContent = "Mahalle (opsiyonel)";
  neighBox.appendChild(labNeigh);

  const neighInput = el("input");
  neighInput.type = "text";
  neighInput.placeholder = "Örn: Kemalpaşa Mah.";
  neighInput.style.width = "100%";
  neighInput.style.padding = "10px 12px";
  neighInput.style.borderRadius = "14px";
  neighInput.style.border = "1px solid rgba(255,255,255,0.14)";
  neighInput.style.background = "rgba(255,255,255,0.08)";
  neighInput.style.color = "inherit";
  neighInput.style.outline = "none";
  neighInput.style.fontWeight = "800";
  neighBox.appendChild(neighInput);

  const actions = el("div", "loc-actions");
  actions.style.display = "flex";
  actions.style.gap = "10px";
  actions.style.flexWrap = "wrap";
  actions.style.marginTop = "12px";
  pagePlace.appendChild(actions);

  const backBtn = btn("Geri", "glass-btn");
  const saveBtn = btn("Kaydet", "glass-btn");
  actions.append(backBtn, saveBtn);

  // ---------- internal state ----------
  let mode = startMode;
  let selectedCity = null; // {name, lat, lon}

  function setMode(next) {
    mode = next;
    pageLanding.style.display = mode === "landing" ? "block" : "none";
    pagePlace.style.display = mode === "place" ? "block" : "none";
  }

  function setOpen(open) {
    overlay.style.display = open ? "flex" : "none";
    if (open) {
      // açılınca varsayılan sayfa
      if (mode !== "landing" && mode !== "place") mode = "landing";
      setMode(mode);
      if (mode === "place") search.focus();
    }
  }

  function setStartPlace(prefill) {
    // prefill: {cityName, districtName, neighborhoodName}
    setMode("place");
    if (prefill?.cityName) {
      const found = cities.find((c) => c.name === prefill.cityName);
      if (found) {
        selectedCity = found;
        pickedCity.textContent = found.name;
      }
    }
    districtInput.value = prefill?.districtName || "";
    neighInput.value = prefill?.neighborhoodName || "";
    renderList();
  }

  function renderList() {
    listWrap.innerHTML = "";
    const q = (search.value || "").trim().toLowerCase();

    const rows = cities
      .filter((c) => (q ? c.name.toLowerCase().includes(q) : true))
      .slice(0, 80);

    for (const c of rows) {
      const item = el("button", "glass-btn");
      item.type = "button";
      item.style.textAlign = "left";
      item.style.padding = "10px 12px";
      item.style.borderRadius = "14px";
      item.textContent = c.name;

      item.addEventListener("click", () => {
        selectedCity = c;
        pickedCity.textContent = c.name;
      });

      listWrap.appendChild(item);
    }
  }

  search.addEventListener("input", renderList);

  xBtn.addEventListener("click", () => setOpen(false));

  gpsBtn.addEventListener("click", async () => {
    if (onRequestGps) await onRequestGps();
  });

  manualBtn.addEventListener("click", () => {
    setMode("place");
    renderList();
    search.focus();
  });

  backBtn.addEventListener("click", () => {
    setMode("landing");
  });

  saveBtn.addEventListener("click", () => {
    if (!selectedCity) {
      pickedCity.textContent = "⚠️ Önce şehir seç";
      return;
    }

    const districtName = (districtInput.value || "").trim() || null;
    const neighborhoodName = (neighInput.value || "").trim() || null;

    if (onSelectPlace) {
      onSelectPlace({
        cityName: selectedCity.name,
        districtName,
        neighborhoodName,
        cityLat: selectedCity.lat,
        cityLon: selectedCity.lon,
      });
    }
    setOpen(false);
  });

  // initial
  setOpen(false);
  setMode(startMode);
  renderList();

  return {
    el: overlay,
    setOpen,
    setMode,
    setStartPlace,
  };
}
