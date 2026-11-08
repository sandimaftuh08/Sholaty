import { garisLengkung, KAABA } from '../services/qiblaService';

// HTML peta (Leaflet) — dipakai oleh WebView di Android dan iframe di web
export function buatHtmlPeta(lat: number, lng: number): string {
  const path = garisLengkung(lat, lng, KAABA.latitude, KAABA.longitude, 64);
  const user = path[0];
  const kaaba = path[path.length - 1];

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html, body, #map { height: 100%; margin: 0; background: #E6F0EA; }
  .pin { display:flex; align-items:center; justify-content:center; border-radius:50%;
         border:3px solid #fff; box-shadow:0 2px 8px rgba(0,0,0,.4); }
</style>
</head>
<body>
<div id="map"></div>
<script>
  var path = ${JSON.stringify(path)};
  var user = ${JSON.stringify(user)};
  var kaaba = ${JSON.stringify(kaaba)};

  var map = L.map('map');
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd', maxZoom: 18,
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  }).addTo(map);

  function pin(html, bg, size) {
    return L.divIcon({
      className: '',
      html: '<div class="pin" style="width:' + size + 'px;height:' + size + 'px;background:' + bg + ';font-size:' + (size * 0.5) + 'px">' + html + '</div>',
      iconSize: [size, size], iconAnchor: [size / 2, size / 2]
    });
  }

  L.polyline(path, { color: '#C9A24B', weight: 4, dashArray: '10 8' }).addTo(map);
  L.marker(user, { icon: pin('📍', '#14573F', 34) }).addTo(map)
    .bindTooltip('Lokasi Anda', { permanent: true, direction: 'top', offset: [0, -16] });
  L.marker(kaaba, { icon: pin('🕋', '#C9A24B', 38) }).addTo(map)
    .bindTooltip("Ka'bah", { permanent: true, direction: 'top', offset: [0, -18] });

  map.fitBounds(L.latLngBounds(path), { padding: [40, 40] });
</script>
</body>
</html>`;
}