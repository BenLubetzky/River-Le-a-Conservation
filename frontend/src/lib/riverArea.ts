import type { Report } from "@/types/report";

// The area the map covers: OpenStreetMap's bounding box of the Rio Leça (41.178–41.322 N,
// 8.398–8.707 W, source near Santo Tirso to the mouth at Matosinhos), plus a margin of about
// 2 km on every side, so sightings on the banks and nearby tributaries aren't left out.
export const RIVER_AREA = { south: 41.158, north: 41.342, west: -8.735, east: -8.373 };

// Width ÷ height of the area as drawn on the map (Web Mercator), so the map can be given the
// same shape and show exactly the area, with nothing around it.
const mercatorY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
export const RIVER_AREA_ASPECT =
  ((RIVER_AREA.east - RIVER_AREA.west) * Math.PI) / 180 / (mercatorY(RIVER_AREA.north) - mercatorY(RIVER_AREA.south));

/** The report's coordinates if it has them and they fall inside the river area; otherwise null. */
export function riverPoint(r: Report): [number, number] | null {
  if (r.latitude == null || r.longitude == null) return null;
  const { south, north, west, east } = RIVER_AREA;
  const inside = r.latitude >= south && r.latitude <= north && r.longitude >= west && r.longitude <= east;
  return inside ? [r.latitude, r.longitude] : null;
}
