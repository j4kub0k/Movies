# Images

Drop the dog photos here as `dog1.jpg`, `dog2.jpg`, `dog3.jpg` ... as many as you like (`dog9.jpg`, `dog10.jpg`, ... `dog40.jpg`).
Keep the numbers going up; a few missing numbers are fine, but after 8 missing in a row the page stops looking.
The name must be exactly `dogN.jpg` (lower case, `.jpg`, not `.jpeg`/`.JPG`/`.png`).

Uploading from a phone: on GitHub open the `images` folder -> **Add file -> Upload files**, rename the photo to the next number
before uploading (or upload, then open it -> pencil -> rename), and **Commit changes**. It shows up on the site after about a minute.
The page finds them by itself, so adding a photo needs no code change (just commit and push the file).

Tip: resize to about 640px wide (the gallery never shows them bigger) so the page loads fast on mobile.

Tip: photos straight from a phone carry hidden camera, date and sometimes GPS data. Resizing or exporting them
(for example with an image editor's "export for web") removes it, which matters because the page can be public.

## Avatar

`avatar/` holds a pixel-art portrait of Tara (1024 x 1024 PNG) in three colours (black, blue, lime) for a profile
picture. `favicon.png` and `apple-touch-icon.png` are the same portrait used as the site's tab and home-screen icon.
