export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
export function formatMapLink(input) {
  if (!input) return '';
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
}
export function getTransportIcon(text = '') {
  const t = text.toLowerCase();
  if (t.includes('bus') || t.includes('van') || t.includes('transfert')) return '🚌';
  if (t.includes('train')) return '🚆';
  if (t.includes('bateau') || t.includes('croisière') || t.includes('ferry')) return '🚤';
  if (t.includes('voiture') || t.includes('taxi') || t.includes('grab')) return '🚗';
  if (t.includes('scooter') || t.includes('moto')) return '🛵';
  if (t.includes('vélo') || t.includes('velo')) return '🚲';
  return '✈️';
}
