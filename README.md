# 🛰️ ISS Tracker HUB

Uluslararası Uzay İstasyonu'nun (ISS) gerçek zamanlı konumunu takip edin. 2D harita ve etkileyici 3D dünya görünümü ile ISS'in nerede olduğunu görün!

## ✨ Özellikler

- 🌍 **2D/3D Görünüm** - Leaflet haritası veya muhteşem 3D dünya
- 🛰️ **Gerçek Zamanlı Takip** - ISS'in anlık konumu ve hızı
- 🎨 **Özelleştirilebilir Tema** - 6 hazır renk + özel renk seçimi
- 🌙 **Karanlık/Açık Mod** - Sistem temasına uyum
- 📍 **Geçiş Tahminleri** - ISS'in bölgenizden ne zaman görüneceğini öğrenin
- 🌤️ **Hava Durumu** - ISS'in altındaki bölgenin hava durumu
- 👨‍🚀 **Mürettebat Bilgisi** - ISS'te kimler var?
- 📱 **Mobil Uyumlu** - Her cihazda mükemmel çalışır

## 🚀 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Production build
npm run build
```

## 🌐 Canlı Demo

[GitHub Pages'te Canlı Görün](https://kullaniciadi.github.io/iss-tracker-hub)

## 🎨 Tema Özelleştirme

Sağ üstteki **🎨 Renk** butonuna tıklayarak cam temasını değiştirebilirsiniz:
- 🔵 Cyan (varsayılan)
- 💜 Purple
- 💗 Pink
- 🟢 Green
- 🟡 Amber
- 🔴 Red
- ⚙️ Özel renk seçici

## 📡 Veri Kaynakları

- **ISS Konumu**: [Where The ISS At API](https://wheretheiss.at/)
- **Hava Durumu**: [Open-Meteo](https://open-meteo.com/)
- **Mürettebat**: [Open Notify API](http://open-notify.org/)
- **Konum Arama**: [Nominatim / OpenStreetMap](https://nominatim.openstreetmap.org/)

## 🛠️ Teknolojiler

- ⚡ **Vite** - Hızlı build tool
- 🗺️ **Leaflet** - 2D harita
- 🌍 **Globe.gl** - 3D dünya görselleştirmesi
- 🎨 **Vanilla JS** - Framework yok, saf JavaScript
- 📐 **satellite.js** - Geçiş tahminleri

## 📂 Proje Yapısı

```
iss-tracker-hub/
├── src/
│   ├── app/
│   │   └── boot.js           # Ana uygulama
│   ├── ui/
│   │   ├── globeView.js      # 3D dünya
│   │   ├── themePickerView.js # Renk seçici
│   │   └── ...
│   ├── services/
│   │   ├── prediction.js     # Geçiş hesaplama
│   │   └── weather.js        # Hava durumu
│   ├── styles/
│   │   └── glass.css         # Glass morphism tema
│   └── constants/
│       └── config.js         # Ayarlar
├── index.html
└── package.json
```

## ⚙️ Yapılandırma

`src/constants/config.js` dosyasından ayarları değiştirebilirsiniz:
- Güncelleme aralıkları
- Minimum geçiş yüksekliği
- Varsayılan tema
- API URL'leri

## 🤝 Katkıda Bulunma

Pull request'ler memnuniyetle karşılanır!

## 📜 Lisans

MIT

## 🙏 Teşekkürler

- NASA ve ISS mürettebatına
- Açık kaynak API sağlayıcılarına
- OSM topluluğuna

---

**Made with ❤️ for space enthusiasts**
