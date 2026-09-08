# UpGr0undXD.github.io
web.

Analytics
---------

This site includes a lightweight `analytics.js` loader that supports:

- Google Analytics (`window.ANALYTICS_PROVIDER = 'ga'` and `window.GA_MEASUREMENT_ID`)
- Plausible (`window.ANALYTICS_PROVIDER = 'plausible'` and `window.PLAUSIBLE_DOMAIN`)
- A local per-browser fallback counter shown as a small badge when no provider configured.

To enable Google Analytics, add this to `index.html` before `analytics.js`:

```html
<script>
	window.ANALYTICS_PROVIDER = 'ga';
	window.GA_MEASUREMENT_ID = 'G-XXXXXXX';
</script>
```

To enable Plausible, set:

```html
<script>
	window.ANALYTICS_PROVIDER = 'plausible';
	window.PLAUSIBLE_DOMAIN = 'yourdomain.com';
</script>
```

If you leave `ANALYTICS_PROVIDER` unset, the site will show a local-only counter badge.
