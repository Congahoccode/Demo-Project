// Khởi tạo bản đồ
var map = L.map('map').setView([21.0285, 105.8542], 6); // Hà Nội

// // Thêm layer bản đồ cơ bản
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   maxZoom: 18,
// }).addTo(map);

var lightMap = L.tileLayer('https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/">OSM</a> contributors &copy; <a href="https://www.carto.com/">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19
});

var darkMap = L.tileLayer('https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OSM & CARTO',
  subdomains: 'abcd',
  maxZoom: 19
});

var map = L.map('map', {
  center: [21.0285, 105.8542],
  zoom: 6,
  layers: [lightMap] // Mặc định là Light
});

function updatePanel(lat, lon, t2m, prec) {
  document.getElementById('data-output').innerHTML = `
    <div class="card">
      <h3>📍 Vị trí: ${lat}, ${lon}</h3>
      <p>🌡️ <strong>Nhiệt độ TB:</strong> ${t2m} °C</p>
      <p>💧 <strong>Lượng mưa:</strong> ${prec} mm</p>
    </div>
  `;
}

// Sự kiện click để lấy dữ liệu NASA
map.on('click', function (e) {
  let lat = e.latlng.lat.toFixed(2);
  let lon = e.latlng.lng.toFixed(2);
  
  getNasaData(lat, lon);
});

// Hàm lấy dữ liệu NASA POWER API
function getNasaData(lat, lon) {
  const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,PRECTOT&start=20250101&end=20250102&latitude=${lat}&longitude=${lon}&format=JSON`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      let t2m = data.properties.parameter.T2M["20250101"]; // Nhiệt độ trung bình (°C)
      let prec = data.properties.parameter.PRECTOT["20250101"]; // Lượng mưa (mm)

      document.getElementById('data-output').innerHTML = `
        <p><strong>Vĩ độ:</strong> ${lat}, <strong>Kinh độ:</strong> ${lon}</p>
        <p><strong>Nhiệt độ TB:</strong> ${t2m} °C</p>
        <p><strong>Lượng mưa:</strong> ${prec} mm</p>
      `;
    })
    .catch(err => {
      document.getElementById('data-output').innerHTML = "<p>Lỗi khi lấy dữ liệu NASA.</p>";
      console.error(err);
    });
}

// Layer nhiệt độ bề mặt ban ngày MODIS
var tempLayer = L.tileLayer(
  'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MOD_LSTD_D/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png',
  { attribution: 'NASA GIBS', maxZoom: 9 }
);

// Layer cháy rừng VIIRS
var fireLayer = L.tileLayer(
  'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/FIRMS_VIIRS_NRT/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png',
  { attribution: 'NASA GIBS', maxZoom: 9, opacity: 0.7 }
);

// Cho phép bật/tắt các layer
var baseMaps = {
  "Light Mode": lightMap,
  "Dark Mode": darkMap
};

var overlayMaps = {
  "Nhiệt độ bề mặt": tempLayer,
  "Điểm cháy rừng": fireLayer
};

L.control.layers(baseMaps, overlayMaps).addTo(map);
