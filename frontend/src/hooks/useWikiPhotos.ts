import { useCallback, useEffect, useRef, useState } from "react";
import { PLANTS } from "@/data/plants";

const wikiTitle = (name: string) => encodeURIComponent(name.replace(/ /g, "_"));

/**
 * Photos of plants by Latin name, fetched from Wikipedia and Wikimedia Commons.
 * `photos` holds one main photo per name; `media` holds extra photos, loaded on demand with `loadMedia`.
 */
export function useWikiPhotos() {
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [media, setMedia] = useState<Record<string, string[]>>({});
  const requested = useRef(new Set<string>());

  const loadSummary = useCallback((name: string) => {
    if (requested.current.has("s:" + name)) return;
    requested.current.add("s:" + name);
    fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + wikiTitle(name))
      .then((r) => r.json())
      .then((d) => {
        const u = d.originalimage?.source || d.thumbnail?.source;
        if (u) setPhotos((p) => ({ ...p, [name]: u }));
      })
      .catch(() => {});
  }, []);

  const loadMediaList = useCallback((name: string) => {
    fetch("https://en.wikipedia.org/api/rest_v1/page/media-list/" + wikiTitle(name))
      .then((r) => r.json())
      .then((d) => {
        const urls = ((d.items || []) as { type: string; srcset?: { src: string }[] }[])
          .filter((i) => i.type === "image" && i.srcset && i.srcset.length)
          .map((i) => "https:" + i.srcset![i.srcset!.length - 1].src)
          .filter((u) => /\.(jpe?g)$/i.test(u) || /\.jpe?g\//i.test(u));
        setMedia((m) => ({ ...m, [name]: urls }));
      })
      .catch(() => {});
  }, []);

  const loadMedia = useCallback((name: string) => {
    if (requested.current.has("m:" + name)) return;
    requested.current.add("m:" + name);
    const cat = "https://commons.wikimedia.org/w/api.php?action=query&generator=categorymembers&gcmtitle=" + encodeURIComponent("Category:" + name) + "&gcmtype=file&gcmlimit=20&prop=imageinfo&iiprop=url|mime&iiurlwidth=1600&format=json&origin=*";
    fetch(cat)
      .then((r) => r.json())
      .then((d) => {
        const pages = Object.values(d.query?.pages || {}) as { imageinfo?: { mime: string; url: string; thumburl?: string }[] }[];
        const urls = pages.map((p) => p.imageinfo?.[0]).filter((i) => i && i.mime === "image/jpeg").map((i) => i!.thumburl || i!.url);
        if (urls.length) setMedia((m) => ({ ...m, [name]: urls }));
        else loadMediaList(name);
      })
      .catch(() => loadMediaList(name));
  }, [loadMediaList]);

  // Every species card on the main page needs its photo straight away.
  useEffect(() => {
    PLANTS.forEach((p) => loadSummary(p.latin));
  }, [loadSummary]);

  return { photos, media, loadSummary, loadMedia };
}
