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

YouTube music sync
------------------

The channel video sync tool automatically adds videos that are not already in `music/music.json`:

```bash
pip install -r requirements.txt
python scripts/sync_youtube_music.py
```

A GitHub Actions workflow checks the channel every day at 03:17 UTC. It can also be run manually from the repository's **Actions > Sync YouTube music > Run workflow** page. The workflow updates and commits `music/music.json` only when a new video is found.
