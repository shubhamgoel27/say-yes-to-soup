# Publishing Say Yes to Soup on itch.io, step by step

Everything you need is in this folder:

- `say-yes-to-soup-web.zip` (the build, index.html at the zip root, verified to boot under a nested path like itch's iframe). **The committed zip is only as new as the last time someone rebuilt it: rebuild it before every upload, the first one included** (see "Rebuilding the zip" below).
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

1. Rebuild the zip first (see "Rebuilding the zip" below), then scroll to **Uploads**, click **Upload files**, choose `say-yes-to-soup-web.zip`.
2. When it finishes, check the box **"This file will be played in the browser"** on that upload row. This is easy to miss and nothing works without it.

## 3. Embed options

These appear once a playable upload exists:

1. **Embed in page**, with **Manually set size**: width `1024`, height `576`. A 1366x768 laptop, still a very common screen, shows only about 650px of page under the browser's bars; at 720 tall the frame ran past the bottom and Carmen's first line opened below the fold, until the player thought to scroll the itch page. The game already lays itself out for short windows, so the smaller frame costs nothing. Do not go back up to 1280x720.
2. Check **Fullscreen button**. This is how a big screen gets the big picture.
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
3. If you can, look once at a laptop-sized window too (about 1366x768): the dialogue box should be on screen without scrolling the itch page. On a big monitor the frame will look modest; that is what the Fullscreen button is for.
4. Back in the editor, set visibility to **Public** and save. The page is live.

## Rebuilding the zip

Every upload, from a fresh build, into a fresh archive. From the repo root, as one command (the `&&`s stop it at the first failure, so a broken build never gets zipped from an old `dist/`):

```
npm run build &&
rm -f docs/itch/say-yes-to-soup-web.zip &&
(cd dist && zip -r -X ../docs/itch/say-yes-to-soup-web.zip . -x '*.DS_Store') &&
unzip -l docs/itch/say-yes-to-soup-web.zip | grep -E ' index\.html$'
```

- `npm run build` typechecks and empties `dist/` before writing it, so the zip holds exactly this build.
- The `rm -f` matters: `zip -r` into an archive that already exists only adds and replaces files, it never removes them, so every older build's hashed bundles would ride along in the zip forever. (`zip -FS` instead of `rm -f` also works: it syncs the archive to the folder and drops what is gone.)
- The last line should print exactly one `index.html` with no folder in front of it. Contents at the zip root, never a `dist/` folder inside the zip.
- Commit the rebuilt zip with the change it ships, so the zip in the repo matches the game in the repo.

## Updating the game later

The manual way (fine at this cadence):

1. Rebuild the zip (above).
2. On the project's **Edit** page, under Uploads, **Delete** the old zip and upload the new one. Recheck **"This file will be played in the browser"** (a fresh upload needs the checkbox again).
3. Save. Players get the new build on next page load.

The nicer way once updates become routine: [butler](https://itch.io/docs/butler/), itch's CLI. One-time `butler login`, then each release is a rebuild (above) and:

```
butler push docs/itch/say-yes-to-soup-web.zip <your-itch-username>/say-yes-to-soup:html
```

butler keeps the browser-playable flag and embed settings, versions every push, and only uploads the diff. It slots naturally into the existing GitHub Actions deploy if you ever want itch updated on every push to main.

## Gotchas worth knowing

- itch serves HTML games from a sandboxed iframe on a CDN subpath. The build already uses relative asset paths (`base: './'` in vite.config.ts) and was boot-tested under a deep subpath, so no changes needed there.
- The zip must have `index.html` at its top level. If you ever rebuild the zip by right-clicking the dist folder in Finder, you will get a nested folder and a black page on itch. Zip the folder's contents, not the folder, and always into a fresh archive (see "Rebuilding the zip").
- SharedArrayBuffer options in itch's frame settings are irrelevant here; leave them off.
