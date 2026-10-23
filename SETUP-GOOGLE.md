# Google setup for the Movie Night Planner

No server needed: two Google Forms collect entries, one Google Sheet stores them, and the site reads the sheet.

## 1. Movies form
1. Go to forms.google.com and create a form named "Movies".
2. Questions, in this order: **Movie** (short answer, required), **Who suggested it?** (short answer), **Vibe** (short answer or dropdown, optional).
3. Responses tab -> **Link to Sheets** -> create a new spreadsheet, e.g. "Movie night".
4. Send -> link icon -> copy the link into `moviesFormUrl` in `config.js`.

## 2. Dates form
1. Create another form named "Free dates", questions in this order: **Date** (question type **Date**, so the site can sort the dates and hide the ones that have passed), **Who?** (short answer), **Note** (optional).
2. Responses -> **Link to Sheets** -> choose **Select existing spreadsheet** -> the same "Movie night" sheet (it gets its own tab).
3. Copy its link into `datesFormUrl`.

## 3. Show the lists on the site
For each of the two response tabs in the sheet:
1. File -> Share -> **Publish to web**.
2. Choose that tab (not "Entire document") and **Comma-separated values (.csv)**.
3. Publish, copy the link into `moviesCsvUrl` / `datesCsvUrl`.

## 4. Watched movies (optional)
1. Open the response tab for the **Movies** form in the Google Sheet.
2. In the first empty column to the right of the answers, type the header **Watched**.
3. Select the cells below it (for example D2:D1000) and choose **Insert -> Checkbox**.
4. Tick a movie's box when you have watched it. The site moves it to "Already watched".
5. Paste the sheet's normal link (the address bar while it is open, `https://docs.google.com/spreadsheets/d/.../edit`) into `sheetUrl` in `config.js`. The site then shows a "Tick watched in the sheet" button that opens it. The person must be allowed to edit the sheet (Share -> add her email, or "anyone with the link can edit", which means anyone with the link can change it).
6. Open the free-dates tab, copy the address bar (it ends in `#gid=...` for that tab) and paste it into `datesSheetUrl`. The "✓ I'm free too" button opens it so the other person can tick their name on a date that's already there.
6. If there is no column with "watched" in its header, the watched list stays hidden.

## Dates
- Dates that have passed disappear from the site on their own (today's date stays until the day is over). The rows stay in the sheet.
- Upcoming dates are sorted soonest first, and each has **Add to calendar** (downloads a calendar file with alerts at 18:00 the evening before and 09:00 on the day) and **Google** (opens Google Calendar with the event filled in) buttons. The event title can be changed with `eventTitle` in `config.js`.
- Entries typed as free text (for example "Fri 14 Nov evening", or older answers from before the question became a Date) cannot be checked, so they always stay visible. Delete those rows in the sheet when they are done.
- Slash dates such as 3/4/2026 are ambiguous. The site works out day-first or month-first from your other dates; if it can't tell, it uses `dateOrder` in `config.js` ('dmy' or 'mdy').

## Monthly reminder
- The page has a **Remind me monthly** button (and a **Google** one). It adds a repeating calendar event, "Plan a movie night", on the first Saturday of every month at 17:00, with an alert and a link back to the site. The first one is next month (or this month if the first Saturday is still more than a day away).
- It only works if the person taps it once. After that, his own calendar keeps reminding him.
- Change the title with `reminderTitle` and the link with `siteUrl` in `config.js`. The day and time are in `planner.js` (search for `BYDAY=1SA`).

## Free days tab (recommended way to mark free days)
Instead of the free-dates form, keep one tab where each of you ticks the days you're free.

1. In the "Movie night" spreadsheet, add a tab (the + at the bottom) and name it **Free days**.
2. Row 1 headers: **Date**, then one column per person, e.g. **Jakub** and **Her** (use your real names). Optional: a **Note** column.
   - Want evenings and afternoons separately? Use **Jakub (evening)**, **Jakub (afternoon)**, **Her (evening)**, **Her (afternoon)** instead. "Both free" then means you share the same part of the day.
3. Fill column A with dates: type today's date in A2, select A2, drag the little square at its corner down ~90 rows. Use real dates, **not** a formula like =TODAY(), or the ticks would slide onto other days. Add more rows every few months.
4. Select the person columns from row 2 down and choose **Insert -> Checkbox**.
5. Optional "usually free" rows: below the dates, add rows with a weekday instead of a date (e.g. **Friday**, or Czech **pátek**) and tick them. The site shows those days as "usually free" and suggests the next one. A real date row for that day always wins (an unticked row means not free that day).
6. File -> Share -> **Publish to web** -> choose the **Free days** tab -> **CSV** -> Publish. Paste the link into `availabilityCsvUrl` in `config.js`.
7. Open the Free days tab, copy the browser address (ends with `#gid=...`) into `availabilitySheetUrl`. The "Tick your free days" buttons open it.
8. Both of you need edit access to the spreadsheet to tick boxes.

When `availabilityCsvUrl` is set the site uses this tab and ignores the free-dates form. Leave it empty to keep using the form.

## Finding when you're both free (free-dates form)
Who is free on a date can come from the form, from the sheet, or both:
- **In the form:** add a question **Who is free?** of type **Checkboxes** with the options **Jakub** and **Adela** (exactly as in the sheet). When adding a date you tick yourself, or both of you. The sheet gets a column like "Jakub, Adela".
- **In the sheet:** checkbox columns named after each person (**Jakub**, **Adela**) in the responses tab. Tick them later, e.g. when Adela is also free on a date Jakub added. Select the columns from row 2 down and **Insert -> Checkbox** so new rows get checkboxes too.
- The same date from both of you (in one row or in two rows) becomes one showtime marked **BOTH FREE**; those sort first, light up lime in the **Who's free** board, and the header banner shows the next movie night with **Lock it in**.
- The banner at the top only shows the closest date where you are **both** free. If there is none yet it says so.
- Every date where only one of you is free has a **✓ I'm free too** button that opens the sheet's free-dates tab, so the other person can tick their name.
- Every date (and the banner) also has a **✕ Can't make it** button for when plans change: it opens the same tab so you can untick your name, or delete the row if neither of you is free any more. The site only reads the sheet, so the change happens there and shows up on the page about a minute later.

## Ratings and stats
- In the movies tab, give each of you a rating column next to Watched: **Jakub's rating** and **Adela's rating** (any header containing "rating" works, and the text before it is shown as the name). Type a score from 1 to 10 (7.5 and 8/10 work too). A single shared **Rating** column still works.
- Watched movies show each score, e.g. "Jakub ★ 8/10  Adela ★ 9/10". If someone hasn't rated yet, the movie gets a "★ Adela: rate it" button (or "★ Rate it" when nobody has) that opens the sheet. The header shows "N watched together · N waiting · N both-free dates · avg ★ x/10", the average over all scores.
- Every movie has a **ČSFD** button that searches for it on csfd.cz.

## Notes
- The first column of each tab is the automatic timestamp; the site shows the 2nd column as the title and the others as details, newest first.
- Published sheets and form links are readable by anyone who has the link. Don't put anything private in them.
- New answers show up on the site after about a minute (Google refreshes published sheets on its own).
- To remove an entry, delete its row in the sheet.
- Past dates are hidden on the site but stay in the sheet. To clear them automatically, see "Automatic cleanup of past dates".

## Automatic cleanup of past dates (optional)
The site already hides dates that have passed; this also deletes their rows so the free-dates tab never fills up. It only removes rows with a readable date before today. Weekday rows ("Friday"), notes, empty cells and the header row are kept, and the movies tab is never touched.
1. In the sheet: **Extensions -> Apps Script**.
2. Delete the sample code and paste in the whole of `cleanup-old-dates.gs` from this repo. Save.
3. If your free-dates tab's address does not end in `gid=1440545244`, change `DATES_TAB_GID` at the top to the number after `gid=`. Change `DATE_COLUMN` if the date is not in column B.
4. In the toolbar pick the function **installDailyCleanup** and press **Run**. Allow the permissions when Google asks (it is your own script, working on this sheet only; "Advanced -> Go to ... (unsafe)" is the usual wording for scripts you wrote yourself).
5. Done: it cleans now, then every night around 3 am. To stop it, open **Triggers** (clock icon) and delete the trigger.
