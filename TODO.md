# To do (your side)

Things only you can do in Google. Details are in `SETUP-GOOGLE.md`.

## Movie planner

- [ ] **Locked column**: in the free-dates tab add a column header **Locked**. Type the movie title (or "yes") there on the night you settle on, so you both see it. See `SETUP-GOOGLE.md` -> "Locking a movie night for both of you".
- [ ] *(Optional)* **What time? question** in the free-dates form: type **Checkboxes**, options **Afternoon** and **Evening** (and **All day** if you like), not required. See `SETUP-GOOGLE.md` -> "Evening or afternoon".

- [ ] *(Optional)* **Delete past dates automatically** so the sheet never fills up: in the sheet open **Extensions -> Apps Script**, paste in all of `cleanup-old-dates.gs`, save, pick the function **installDailyCleanup** and press **Run** (allow the permissions when Google asks). It cleans now and then every night around 3 am. Steps in `SETUP-GOOGLE.md` -> "Automatic cleanup of past dates".

## Birthday surprise

- [ ] Build the birthday experience in Unity (WebGL) and upload it to itch.io (Restricted / password, "mobile friendly", "click to launch fullscreen").
