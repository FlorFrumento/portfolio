import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        bannerNubecommerce: resolve(__dirname, "casos/banner-nubecommerce.html"),
        ristretto: resolve(__dirname, "casos/ristretto.html"),
        ctaMigrarTienda: resolve(__dirname, "casos/cta-migrar-tienda.html"),
        recursosDescargables: resolve(__dirname, "casos/recursos-descargables.html")
      }
    }
  }
});
