// ResQNet — offline district lookup (nearest district centroid)
// No geocoding API needed: good enough at district granularity for aggregation.
const CENTROIDS = {
  Ampara: [7.28, 81.67], Anuradhapura: [8.31, 80.40], Badulla: [6.99, 81.05],
  Batticaloa: [7.71, 81.69], Colombo: [6.93, 79.86], Galle: [6.05, 80.22],
  Gampaha: [7.09, 80.00], Hambantota: [6.12, 81.12], Jaffna: [9.66, 80.01],
  Kalutara: [6.58, 79.96], Kandy: [7.29, 80.64], Kegalle: [7.25, 80.35],
  Kilinochchi: [9.38, 80.40], Kurunegala: [7.48, 80.36], Mannar: [8.98, 79.90],
  Matale: [7.47, 80.62], Matara: [5.95, 80.54], Monaragala: [6.87, 81.35],
  "Nuwara Eliya": [6.97, 80.78], Polonnaruwa: [7.94, 81.00], Puttalam: [8.03, 79.83],
  Ratnapura: [6.68, 80.40], Trincomalee: [8.57, 81.23], Vavuniya: [8.75, 80.50],
  Mullaitivu: [9.27, 80.81],
};

function districtFor(lat, lng) {
  let best = null, bestD = Infinity;
  for (const [name, [clat, clng]] of Object.entries(CENTROIDS)) {
    const d = (lat - clat) ** 2 + (lng - clng) ** 2;
    if (d < bestD) { bestD = d; best = name; }
  }
  return best;
}

module.exports = { districtFor, DISTRICT_NAMES: Object.keys(CENTROIDS).sort() };
