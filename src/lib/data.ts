// Reference data for crops and crop comparison
// These are static agronomic reference data, not user-specific data

export const crops = [
  "rice", "maize", "chickpea", "kidneybeans", "pigeonpeas", "mothbeans", "mungbean", "blackgram",
  "lentil", "pomegranate", "banana", "mango", "grapes", "watermelon", "muskmelon", "apple",
  "orange", "papaya", "coconut", "cotton", "jute", "coffee"
].map(crop => ({
  value: crop,
  label: crop.charAt(0).toUpperCase() + crop.slice(1),
}));

export const cropComparisonData = {
  rice: {
    compatibility: 87,
    conditions: [
      { param: "Nitrogen", ideal: "80-100 mg/kg", current: 85, compatible: true },
      { param: "Phosphorus", ideal: "40-60 mg/kg", current: 42, compatible: true },
      { param: "Potassium", ideal: "40-50 mg/kg", current: 210, compatible: false },
      { param: "Temperature", ideal: "20-30 °C", current: 24.5, compatible: true },
      { param: "Humidity", ideal: "70-85 %", current: 72, compatible: true },
      { param: "pH", ideal: "6.0-7.0", current: 6.4, compatible: true },
      { param: "Rainfall", ideal: "200-300 mm", current: 180, compatible: false },
    ]
  },
  maize: {
    compatibility: 72,
    conditions: [
      { param: "Nitrogen", ideal: "70-90 mg/kg", current: 85, compatible: true },
      { param: "Phosphorus", ideal: "30-60 mg/kg", current: 42, compatible: true },
      { param: "Potassium", ideal: "35-45 mg/kg", current: 210, compatible: false },
      { param: "Temperature", ideal: "21-27 °C", current: 24.5, compatible: true },
      { param: "Humidity", ideal: "65-75 %", current: 72, compatible: true },
      { param: "pH", ideal: "6.5-7.5", current: 6.4, compatible: false },
      { param: "Rainfall", ideal: "80-120 mm", current: 180, compatible: false },
    ]
  }
};

export const radarChartData = [
    { subject: 'N', rice: 90, maize: 80, current: 85 },
    { subject: 'P', rice: 50, maize: 45, current: 42 },
    { subject: 'K', rice: 45, maize: 40, current: 210 },
    { subject: 'Temp', rice: 25, maize: 24, current: 24.5 },
    { subject: 'Humidity', rice: 78, maize: 70, current: 72 },
    { subject: 'pH', rice: 6.5, maize: 7, current: 6.4 },
    { subject: 'Rainfall', rice: 250, maize: 100, current: 180 },
];
