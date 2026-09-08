(function () {
  const provider = window.ANALYTICS_PROVIDER || null;

  // Google Analytics (gtag) loader
  if (provider === "ga" && window.GA_MEASUREMENT_ID) {
    const id = window.GA_MEASUREMENT_ID;
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", id);
    return;
  }

  // Plausible loader
  if (provider === "plausible" && window.PLAUSIBLE_DOMAIN) {
    const s = document.createElement("script");
    s.async = true;
    s.defer = true;
    s.setAttribute("data-domain", window.PLAUSIBLE_DOMAIN);
    s.src = "https://plausible.io/js/plausible.js";
    document.head.appendChild(s);
    return;
  }

  // Fallback: localStorage-based per-browser counter + small badge
  try {
    const key = "site_local_analytics_v1";
    const path = location.pathname;
    const now = Date.now();
    const raw = localStorage.getItem(key);
    const data = raw ? JSON.parse(raw) : { counts: {}, last: now };
    data.counts[path] = (data.counts[path] || 0) + 1;
    data.last = now;
    localStorage.setItem(key, JSON.stringify(data));

    const style = document.createElement("style");
    style.textContent = 
      ".analytics-badge{position:fixed;right:12px;bottom:12px;background:rgba(0,0,0,0.6);color:#fff;padding:8px 10px;border-radius:8px;font-family:Inter,system-ui,-apple-system,\"Segoe UI\",Roboto,\"Helvetica Neue\",Arial;font-size:13px;z-index:9999;backdrop-filter:blur(6px)} .analytics-badge small{display:block;color:#ddd;font-size:11px}";
    document.head.appendChild(style);

    const badge = document.createElement("div");
    badge.className = "analytics-badge";
    badge.innerHTML = `<strong>访问 (本地)</strong><small>${path} · ${data.counts[path]} 次</small>`;
    badge.title = "本地仅在此浏览器统计，跨设备不可见。";
    document.body.appendChild(badge);
  } catch (e) {
    // silent
    console.error("analytics fallback error", e);
  }
})();
