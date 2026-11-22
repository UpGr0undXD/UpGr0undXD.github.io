#!/usr/bin/env python3
"""Add newly uploaded videos from a YouTube channel to music/music.json."""

import json
import re
import sys
from pathlib import Path

try:
    import yt_dlp
except ImportError:
    print("Missing dependency: yt-dlp. Run: pip install -r requirements.txt")
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
MUSIC_FILE = ROOT / "music" / "music.json"
CHANNEL_URL = "https://www.youtube.com/@WillDu123/videos"


def video_id(url: str) -> str:
    match = re.search(r"(?:/embed/|[?&]v=)([A-Za-z0-9_-]+)", url)
    return match.group(1) if match else ""


def clean_title(title: str) -> str:
    title = re.sub(r"^Will\s+Du\s*[-–—]\s*", "", title.strip(), flags=re.I)
    title = re.sub(r"\s+$", "", title)
    return title


def infer_tags(title: str) -> list[str]:
    lower = title.lower()
    tags = []
    for word, tag in (
        ("impromptu", "Impromptu"),
        ("sonata", "Sonata"),
        ("concerto", "Concerto"),
        ("symphony", "Symphony"),
        ("trio", "Trio"),
        ("fantasia", "Fantasy"),
        ("fantasy", "Fantasy"),
    ):
        if word in lower:
            tags.append(tag)
    if any(word in lower for word in ("impromptu", "improvis")):
        tags.append("Improvisation")
    tags.append("Piano")
    return list(dict.fromkeys(tags))


def fetch_channel_videos() -> list[dict]:
    options = {
        "extract_flat": "in_playlist",
        "skip_download": True,
        "quiet": True,
        "no_warnings": True,
    }
    with yt_dlp.YoutubeDL(options) as youtube:
        playlist = youtube.extract_info(CHANNEL_URL, download=False)
    entries = playlist.get("entries", []) if playlist else []
    return [entry for entry in entries if entry and entry.get("id")]


def main() -> int:
    if not MUSIC_FILE.exists():
        print(f"Missing {MUSIC_FILE}")
        return 1

    with MUSIC_FILE.open("r", encoding="utf-8") as file:
        music = json.load(file)

    existing_ids = {video_id(item.get("video", "")) for item in music}
    uploaded = fetch_channel_videos()
    newly_added = []

    # The channel's newest-first result is prepended so fresh uploads appear first.
    for entry in reversed(uploaded):
        entry_id = entry["id"]
        if entry_id in existing_ids:
            continue

        title = clean_title(entry.get("title", "Untitled"))
        item = {
            "title": title,
            "description": "",
            "tags": infer_tags(title),
            "video": f"https://www.youtube.com/embed/{entry_id}",
            "pdf": "#",
        }
        music.insert(0, item)
        existing_ids.add(entry_id)
        newly_added.append(title)

    if newly_added:
        with MUSIC_FILE.open("w", encoding="utf-8") as file:
            json.dump(music, file, ensure_ascii=False, indent=2)
            file.write("\n")

    if newly_added:
        print(f"Added {len(newly_added)} new video(s):")
        for title in newly_added:
            print(f"- {title}")
    else:
        print("No new videos found.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
