# Future Enhancements

This document captures implementation ideas we may add later. Each item includes a brief rationale and a high-level implementation outline.

## 1) Runtime-toggleable Services Layout (Grid ↔ Rows) without Rebuild

Goal: Switch the Services page layout between the default grid and the horizontal rows (by format) at runtime in K3s, without rebuilding the app.

Why
- Allows quick A/B testing and operational toggling.
- Avoids rebuilds for simple layout preference changes.

Approach: runtime config file served by Nginx
1. Add a small JS config file (served statically):
   - File: `/config.js`
   - Example content:
     ```js
     window.RUNTIME_CONFIG = {
       SERVICES_LAYOUT: 'rows' // or 'grid'
     };
     ```
2. Include in `index.html` before the app bundle:
   ```html
   <script src="/config.js"></script>
   ```
3. Read it in the app (e.g., `src/pages/Services.tsx`):
   ```ts
   const runtimeLayout = (window as any)?.RUNTIME_CONFIG?.SERVICES_LAYOUT;
   const layoutMode: 'grid' | 'rows' =
     runtimeLayout === 'rows' || runtimeLayout === 'grid'
       ? runtimeLayout
       : ((import.meta as any).env?.VITE_SERVICES_LAYOUT === 'rows' ? 'rows' : 'grid');
   ```

K3s Deployment (one time)
- Create a ConfigMap with `config.js` and mount into Nginx at `/usr/share/nginx/html/config.js`.
- Example ConfigMap command:
  ```bash
  kubectl -n ai-focus create configmap ai-focus-config \
    --from-literal=config.js="window.RUNTIME_CONFIG = { SERVICES_LAYOUT: 'rows' };"
  ```
- Deployment additions:
  - volume:
    ```yaml
    volumes:
      - name: app-config
        configMap:
          name: ai-focus-config
          items:
            - key: config.js
              path: config.js
    ```
  - volumeMount:
    ```yaml
    volumeMounts:
      - name: app-config
        mountPath: /usr/share/nginx/html/config.js
        subPath: config.js
        readOnly: true
    ```

Toggling at runtime (no rebuild)
- Switch to grid:
  ```bash
  kubectl -n ai-focus create configmap ai-focus-config \
    --from-literal=config.js="window.RUNTIME_CONFIG = { SERVICES_LAYOUT: 'grid' };" \
    --dry-run=client -o yaml | kubectl apply -f -
  kubectl -n ai-focus rollout restart deployment ai-focus-nginx
  ```
- Switch back to rows: change `grid` → `rows` above.

Notes
- This pattern can host additional runtime flags (feature toggles) under `window.RUNTIME_CONFIG`.

---

## Backlog Candidates
- Services admin: change icon field from free-text to searchable dropdown of Lucide icons.
- Service thumbnails/banners with responsive, optimized images.
- Virtualized lists for very large catalogs.
- Persisted filters via URL query params.

