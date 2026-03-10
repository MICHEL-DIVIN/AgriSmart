export const CROPS_FR: Record<string, string> = {
  'rice': 'Riz',
  'maize': 'Maïs',
  'chickpea': 'Pois chiche',
  'kidneybeans': 'Haricots rouges',
  'pigeonpeas': 'Pois d\'angole',
  'mothbeans': 'Haricots moth',
  'mungbean': 'Haricot mungo',
  'blackgram': 'Haricot noir',
  'lentil': 'Lentille',
  'pomegranate': 'Grenade',
  'banana': 'Banane',
  'mango': 'Mangue',
  'grapes': 'Raisin',
  'watermelon': 'Pastèque',
  'muskmelon': 'Melon',
  'apple': 'Pomme',
  'orange': 'Orange',
  'papaya': 'Papaye',
  'coconut': 'Noix de coco',
  'cotton': 'Coton',
  'jute': 'Jute',
  'coffee': 'Café'
}

export function getCropFr(crop: string): string {
  return CROPS_FR[crop.toLowerCase()] ?? crop
}
