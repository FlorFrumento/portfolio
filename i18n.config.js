export const siteOrigin = "https://florencia-frumento.web.app";

export const i18nConfig = {
  defaultLocale: "es",
  locales: ["es", "en"],
  localeMeta: {
    es: {
      htmlLang: "es",
      ogLocale: "es_AR"
    },
    en: {
      htmlLang: "en",
      ogLocale: "en_US"
    }
  },
  pages: [
    {
      id: "home",
      pageKey: "home",
      source: "index.html",
      route: "/",
      scriptSrc: "/script.js"
    },
    {
      id: "about",
      pageKey: "about",
      source: "sobre-mi/index.html",
      route: "/sobre-mi/",
      scriptSrc: "/script.js"
    },
    {
      id: "banner-nubecommerce",
      pageKey: "cases.bannerNubecommerce",
      source: "casos/banner-nubecommerce.html",
      route: "/casos/banner-nubecommerce/",
      scriptSrc: "/script.js"
    },
    {
      id: "carrito-amazon",
      pageKey: "cases.carritoAmazon",
      source: "casos/carrito-amazon.html",
      route: "/casos/carrito-amazon/",
      scriptSrc: "/script.js"
    },
    {
      id: "ristretto",
      pageKey: "cases.ristretto",
      source: "casos/ristretto.html",
      route: "/casos/ristretto/",
      scriptSrc: "/script.js"
    },
    {
      id: "cta-migrar-tienda",
      pageKey: "cases.ctaMigrarTienda",
      source: "casos/cta-migrar-tienda.html",
      route: "/casos/cta-migrar-tienda/",
      scriptSrc: "/script.js"
    },
    {
      id: "recursos-descargables",
      pageKey: "cases.recursosDescargables",
      source: "casos/recursos-descargables.html",
      route: "/casos/recursos-descargables/",
      scriptSrc: "/script.js"
    }
  ]
};

