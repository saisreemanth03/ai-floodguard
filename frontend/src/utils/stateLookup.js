export const STATE_OPTIONS = [
  'All India',
  'Andhra Pradesh',
  'Telangana',
  'Tamil Nadu',
  'Karnataka',
  'Kerala',
  'Maharashtra',
  'Odisha',
  'West Bengal',
  'Bihar',
  'Uttar Pradesh',
  'Assam',
  'Gujarat',
  'Rajasthan',
  'Madhya Pradesh',
  'Chhattisgarh',
  'Jharkhand',
  'Punjab',
  'Haryana',
  'Delhi',
  'Uttarakhand',
  'Himachal Pradesh',
  'Jammu & Kashmir'
];

export const STATE_CENTERS = {
  'All India': [22.5, 82.5],
  'Andhra Pradesh': [15.9129, 79.7400],
  'Telangana': [17.3850, 78.4867],
  'Tamil Nadu': [11.1271, 78.6569],
  'Karnataka': [15.3173, 75.7139],
  'Kerala': [10.8505, 76.2711],
  'Maharashtra': [19.7515, 75.7139],
  'Odisha': [20.9517, 85.0985],
  'West Bengal': [22.9868, 87.8550],
  'Bihar': [25.0961, 85.3131],
  'Uttar Pradesh': [26.8467, 80.9462],
  'Assam': [26.2006, 92.9376],
  'Gujarat': [22.2587, 71.1924],
  'Rajasthan': [27.0238, 74.2179],
  'Madhya Pradesh': [22.9734, 78.6569],
  'Chhattisgarh': [21.2787, 81.8661],
  'Jharkhand': [23.6102, 85.2799],
  'Punjab': [31.1471, 75.3412],
  'Haryana': [29.0588, 76.0856],
  'Delhi': [28.6139, 77.2090],
  'Uttarakhand': [30.3165, 78.0322],
  'Himachal Pradesh': [31.1048, 77.1734],
  'Jammu & Kashmir': [33.7782, 76.5762]
};

const STATE_BOUNDS = {
  'Andhra Pradesh': { minLat: 12.5, maxLat: 19.8, minLon: 76.5, maxLon: 84.8 },
  'Telangana': { minLat: 15.8, maxLat: 19.9, minLon: 77.2, maxLon: 81.9 },
  'Tamil Nadu': { minLat: 8.1, maxLat: 13.5, minLon: 76.2, maxLon: 80.3 },
  'Karnataka': { minLat: 11.5, maxLat: 18.5, minLon: 74.0, maxLon: 78.8 },
  'Kerala': { minLat: 8.2, maxLat: 12.8, minLon: 74.8, maxLon: 77.5 },
  'Maharashtra': { minLat: 15.6, maxLat: 22.2, minLon: 72.6, maxLon: 80.9 },
  'Odisha': { minLat: 17.3, maxLat: 22.7, minLon: 81.0, maxLon: 87.5 },
  'West Bengal': { minLat: 21.5, maxLat: 27.1, minLon: 85.8, maxLon: 89.8 },
  'Bihar': { minLat: 24.0, maxLat: 27.7, minLon: 83.0, maxLon: 88.5 },
  'Uttar Pradesh': { minLat: 23.9, maxLat: 30.3, minLon: 77.0, maxLon: 84.7 },
  'Assam': { minLat: 24.1, maxLat: 28.3, minLon: 89.5, maxLon: 96.2 },
  'Gujarat': { minLat: 20.1, maxLat: 24.7, minLon: 68.1, maxLon: 74.8 },
  'Rajasthan': { minLat: 23.1, maxLat: 30.1, minLon: 69.0, maxLon: 78.2 },
  'Madhya Pradesh': { minLat: 21.0, maxLat: 26.8, minLon: 74.0, maxLon: 82.8 },
  'Chhattisgarh': { minLat: 17.8, maxLat: 24.2, minLon: 80.7, maxLon: 84.6 },
  'Jharkhand': { minLat: 22.0, maxLat: 25.5, minLon: 83.3, maxLon: 87.9 },
  'Punjab': { minLat: 29.3, maxLat: 32.6, minLon: 73.8, maxLon: 76.7 },
  'Haryana': { minLat: 27.7, maxLat: 30.9, minLon: 74.5, maxLon: 77.5 },
  'Delhi': { minLat: 28.4, maxLat: 28.9, minLon: 77.0, maxLon: 77.3 },
  'Uttarakhand': { minLat: 28.7, maxLat: 31.5, minLon: 77.7, maxLon: 81.0 },
  'Himachal Pradesh': { minLat: 30.4, maxLat: 33.6, minLon: 75.8, maxLon: 79.1 },
  'Jammu & Kashmir': { minLat: 32.2, maxLat: 37.1, minLon: 72.7, maxLon: 80.3 }
};

export function deriveStateFromCoordinates(latitude, longitude) {
  if (latitude == null || longitude == null) return 'All India';

  for (const [state, bounds] of Object.entries(STATE_BOUNDS)) {
    if (
      latitude >= bounds.minLat &&
      latitude <= bounds.maxLat &&
      longitude >= bounds.minLon &&
      longitude <= bounds.maxLon
    ) {
      return state;
    }
  }

  return 'All India';
}

export function getFilteredPointsByState(points = [], selectedState = 'All India') {
  if (!selectedState || selectedState === 'All India') return points;
  return points.filter((point) => {
    const derived = deriveStateFromCoordinates(point.latitude, point.longitude);
    return derived === selectedState;
  });
}
