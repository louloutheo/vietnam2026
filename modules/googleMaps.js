export function googleMapsSearchUrl(queryOrLat, maybeLng) {
  if (typeof maybeLng === "number") {
    return `https://www.google.com/maps/search/?api=1&query=${queryOrLat},${maybeLng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryOrLat)}`;
}

export function googleMapsDirectionsUrl(queryOrLat, maybeLng) {
  if (typeof maybeLng === "number") {
    return `https://www.google.com/maps/dir/?api=1&destination=${queryOrLat},${maybeLng}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(queryOrLat)}`;
}
