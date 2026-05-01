import { useEffect, useState } from "react";
import { DEFAULT_FEATURES } from "../lib/features-seed";

/**
 * Loads the feature catalog from GET /api/features after mount.
 * Avoids dev-only 500s from getStaticProps racing the first webpack compile.
 */
export function useFeaturesCatalog() {
  const [features, setFeatures] = useState(DEFAULT_FEATURES);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/features");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !Array.isArray(data.features) || !data.features.length) return;
        setFeatures(data.features);
      } catch {
        /* keep DEFAULT_FEATURES */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return features;
}
