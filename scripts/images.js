- export async function resolveOgImage(link){
-   if (!link) return null;
-   const key = `img:${link}`;
-   const cached = lsGet(key);
-   if (cached) return cached;
-
-   try {
-     const url = `/api/og?url=${encodeURIComponent(link)}`;
-     const ctl = new AbortController();
-     const timer = setTimeout(()=>ctl.abort(), 6000);
-     const res = await fetch(url, { signal: ctl.signal, mode: 'cors', credentials: 'omit' });
-     clearTimeout(timer);
-     if (!res.ok) return null;
-     const data = await res.json();
-     if (data && data.image) {
-       lsSet(key, data.image, IMG_TTL_MS);
-       return data.image;
-     }
-   } catch {}
-   return null;
- }
+ // Sin proxy /api/og en producción: usa solo fallback por color
+ export async function resolveOgImage(_link){
+   return null;
+ }
