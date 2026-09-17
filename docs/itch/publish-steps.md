# Publishing Say Yes to Soup on itch.io, step by step

Everything you need is in this folder:

- `say-yes-to-soup-web.zip` (the build, index.html at the zip root, verified to boot under a nested path like itch's iframe)
- `page.md` (all copy and settings, paste-ready)
- `shots/` (cover, thumbnail, six 1280x720 screenshots)

Budget: about ten minutes.

## 1. Create the project

1. Log in at itch.io, click your avatar (top right), then **Upload new project**.
2. **Title:** `Say Yes to Soup`. The URL auto-fills to `say-yes-to-soup`; keep it.
3. **Short description or tagline:** paste the tagline from `page.md`.
4. **Classification:** Games.
5. **Kind of project:** select **HTML**. This is the switch that makes itch play the zip in the browser instead of offering it as a download.
6. **Release status:** Released. **Pricing:** select **$0 or donate**.

## 2. Upload the build

1. Scroll to **Uploads**, click **Upload files**, choose `say-yes-to-soup-web.zip`.
2. When it finishes, check the box **"This file will be played in the browser"** on that upload row. This is easy to miss and nothing works without it.

## 3. Embed options

These appear once a playable upload exists:

1. **Embed in page**, with **Manually set size**: width `1280`, height `720`.
2. Check **Fullscreen button**.
3. Leave **Automatically start on page load** unchecked (audio wants a click first anyway).
4. Check **Mobile friendly** and allow both orientations (the game has touch controls).
5. Leave scrollbars off.

## 4. Details and copy

1. **Description:** paste the description block from `page.md` (itch's editor accepts the formatting; the bold and lists paste through).
2. **Genre:** Role Playing. **Tags:** add the ten from `page.md`, typing each and picking the suggestion so they match itch's canonical tags.
3. **Community:** Comments. **AI disclosure** (under Details): select "No" / none.

## 5. Images

1. Right column, **Cover image:** upload `shots/cover-630x500.png` (already exactly 630x500).
2. **Screenshots:** upload the six from `shots/` in the order listed in `page.md` (title first). You can drag to reorder after upload.

## 6. Draft, preview, publish

1. At the bottom, keep visibility on **Draft** and click **Save**.
2. Click **View page**, then actually play it for a minute in the embedded frame: title loads, "Begin the journey" works, sound comes on after a click, fullscreen button works.
3. If the frame looks cramped on your monitor, bump the embed height, but do not go below 1280x720.
4. Back in the editor, set visibility to **Public** and save. The page is live.

## Updating the game later

The manual way (fine at this cadence):

1. In the repo: `npm run build`, then from `dist/`: `zip -r ../docs/itch/say-yes-to-soup-web.zip . -x "*.DS_Store"` (contents at zip root, never a `dist/` folder inside the zip).
2. On the project's **Edit** page, under Uploads, **Delete** the old zip and upload the new one. Recheck **"This file will be played in the browser"** (a fresh upload needs the checkbox again).
3. Save. Players get the new build on next page load.

The nicer way once updates become routine: [butler](https://itch.io/docs/butler/), itch's CLI. One-time `butler login`, then each release is:

```
butler push docs/itch/say-yes-to-soup-web.zip <your-itch-username>/say-yes-to-soup:html
```

butler keeps the browser-playable flag and embed settings, versions every push, and only uploads the diff. It slots naturally into the existing GitHub Actions deploy if you ever want itch updated on every push to main.

## Gotchas worth knowing

- itch serves HTML games from a sandboxed iframe on a CDN subpath. The build already uses relative asset paths (`base: './'` in vite.config.ts) and was boot-tested under a deep subpath, so no changes needed there.
- The zip must have `index.html` at its top level. If you ever rebuild the zip by right-clicking the dist folder in Finder, you will get a nested folder and a black page on itch. Zip the folder's contents, not the folder.
- SharedArrayBuffer options in itch's frame settings are irrelevant here; leave them off.
