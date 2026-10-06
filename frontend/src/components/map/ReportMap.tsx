"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import { fmtCoords, fmtDate } from "@/lib/format";
import { RIVER_AREA } from "@/lib/riverArea";

export type MapPoint = { id: number; at: [number, number]; title: string; observedAt: string };

const { south, north, west, east } = RIVER_AREA;
const AREA: [[number, number], [number, number]] = [[south, west], [north, east]];

/**
 * OpenStreetMap of the river area, which fills the map and can't be panned or zoomed out of. A marker per point;
 * clicking one calls onOpen. Clicking anywhere else in the area offers to report a sighting there.
 */
export default function ReportMap({ points, onOpen, onPick }: {
  points: MapPoint[];
  onOpen: (id: number) => void;
  onPick: (lat: number, lng: number) => void;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const markers = useRef<LayerGroup | null>(null);
  const draw = useRef<() => void>(() => {});
  // The latest callbacks, for Leaflet's handlers, which are set up once.
  const handlers = useRef({ onOpen, onPick });
  useEffect(() => {
    handlers.current = { onOpen, onPick };
  }, [onOpen, onPick]);

  // Leaflet needs `window`, so it's loaded in the browser only, once the map's element exists.
  useEffect(() => {
    let cancelled = false;
    let resize: ResizeObserver | undefined;
    import("leaflet").then((L) => {
      if (cancelled || !el.current) return;
      const area = L.latLngBounds(AREA);
      // zoomSnap 0 allows in-between zoom levels, so the area can fill the map exactly.
      const m = L.map(el.current, { maxBounds: area, maxBoundsViscosity: 1, zoomSnap: 0, zoomDelta: 1 });
      // The furthest zoom-out is the one where the area still covers the whole map, so there's
      // never anything outside it to see; panning stops at its edges.
      const fit = () => m.setMinZoom(m.getBoundsZoom(area, true));
      fit();
      m.setView(area.getCenter(), m.getMinZoom());
      resize = new ResizeObserver(() => {
        m.invalidateSize();
        fit();
      });
      resize.observe(el.current);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        bounds: area,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(m);
      L.rectangle(area, { color: "#728157", weight: 2, dashArray: "6 6", fill: false, interactive: false }).addTo(m);

      // A click (not a drag) on the map: offer to report there. A popup first, so a stray click
      // doesn't throw a form at people.
      m.on("click", (e) => {
        if (!area.contains(e.latlng)) return;
        const { lat, lng } = e.latlng;
        const box = document.createElement("div");
        box.className = "map-pick";
        const where = document.createElement("span");
        where.textContent = fmtCoords(lat, lng);
        const button = document.createElement("button");
        button.className = "btn btn-primary";
        button.textContent = "Report a sighting here";
        button.addEventListener("click", () => {
          m.closePopup();
          handlers.current.onPick(lat, lng);
        });
        box.append(where, button);
        L.popup({ closeButton: false, offset: [0, -4] }).setLatLng(e.latlng).setContent(box).openOn(m);
      });

      map.current = m;
      markers.current = L.layerGroup().addTo(m);
      draw.current();
    });
    return () => {
      cancelled = true;
      resize?.disconnect();
      map.current?.remove();
      map.current = null;
      markers.current = null;
    };
  }, []);

  // Redraw the markers whenever the points change (and once Leaflet has loaded).
  useEffect(() => {
    draw.current = () => {
      const group = markers.current;
      if (!group) return;
      import("leaflet").then((L) => {
        group.clearLayers();
        for (const p of points) {
          // bubblingMouseEvents: false, so clicking a marker doesn't also count as a click on the map.
          L.circleMarker(p.at, { radius: 9, color: "#fff2eb", weight: 2.5, fillColor: "#c67139", fillOpacity: 0.95, bubblingMouseEvents: false })
            .bindTooltip(`${p.title} · ${fmtDate(p.observedAt)}`, { direction: "top", offset: [0, -8] })
            .on("click", () => handlers.current.onOpen(p.id))
            .addTo(group);
        }
      });
    };
    draw.current();
  }, [points]);

  // `isolation` keeps Leaflet's own z-indexes (up to 1000) from covering the header and dialogs.
  return <div ref={el} className="report-map" role="region" aria-label="Map of report locations along the Rio Leça" style={{ height: "100%", width: "100%", isolation: "isolate" }} />;
}
