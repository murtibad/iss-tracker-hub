/**
 * Türkçe yorum: UI metinleri tek dosyada. i18n yok, TR-only.
 */
export const COPY = {
  landing: {
    title: "Konum Gerekli",
    desc: "ISS'in tam senin üzerinden ne zaman geçeceğini hesaplamak için konumuna ihtiyacımız var.",
    note: "Konum verisi cihazında işlenir, sunucuya kaydedilmez.",
    btnGrant: "Konumu Aç",
    btnSelectCity: "Şehir Seç",
    btnContinue: "Devam Et",
    citySelectTitle: "Şehir Seçimi",
    citySelectDesc: "Geçişleri hesaplamak için listeden bir şehir seç.",
    cityPlaceholder: "Şehir seç...",
    permissionDeniedNote: "İzin vermedin, manuel seçimle devam edebilirsin.",
  },

  status: {
    locating: "Konum alınıyor...",
    fetchingISS: "Telemetri alınıyor...",
    calculating: "Geçiş hesaplanıyor...",
    updatingTLE: "Yörünge verisi (TLE) güncelleniyor...",
    slowConnection: "Bağlantı yavaş, bekleniyor...",
    offline: "Çevrimdışı. Tekrar deneniyor...",
    reconnecting: "Yeniden bağlanılıyor...",
  },

  passCard: {
    title: "Sıradaki Geçiş",
    label: {
      visible: "✅ GÖRÜNÜR",
      unsure: "🟡 BELİRSİZ",
      invisibleDay: "🔴 GÖRÜNMEZ (Gündüz)",
      poorAngle: "🔴 ZOR (Düşük Açı: {deg}°)",
      noPass: "⚪ YAKINDA GEÇİŞ YOK",
    },
    metrics: {
      aos: "AOS",
      los: "LOS",
      max: "MAX",
    },
    template: "AOS {aos} • LOS {los} • MAX {max}°",
  },

  errors: {
    locationPermission: "Konum izni reddedildi. Şehir seçerek devam et.",
    locationFetch: "GPS verisi alınamadı. Açık alanda mısın?",
    apiFail: "ISS verisine ulaşılamıyor. İnternetini kontrol et.",
    calculationFail: "Geçiş hesaplanamadı. Yörünge verisi eski olabilir.",
    general: "Bir hata oluştu. Sayfayı yenile.",
  },

  ui: {
    followMode: "Takip Et",
    freeMode: "Serbest",
    changeCity: "Şehri Değiştir",
    refresh: "Yenile",
    details: "Detaylar",
    version: "v0.1-alpha",
  },
};
