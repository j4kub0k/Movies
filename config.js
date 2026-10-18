// Movie Night Planner settings. Paste your Google links here (see SETUP-GOOGLE.md).
window.PLANNER = {
  // "Send form" -> link icon -> the form's public link
  moviesFormUrl: 'https://forms.gle/Hor4xibK7cZXWb4u6',
  datesFormUrl: 'https://forms.gle/M4Y27TwRvHTfVAcUA',
  // Sheet -> File -> Share -> Publish to web -> pick the tab -> "Comma-separated values (.csv)" -> Publish -> copy link
  moviesCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT7egcKE-RwZMf3oVBOfqCdDOk8E344-ux2uZ1tZTLkwp27OhIgkqva6Cz0kOYR5lgOTawkuee1kAcY/pub?gid=232171872&single=true&output=csv',
  datesCsvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT7egcKE-RwZMf3oVBOfqCdDOk8E344-ux2uZ1tZTLkwp27OhIgkqva6Cz0kOYR5lgOTawkuee1kAcY/pub?gid=1440545244&single=true&output=csv',
  // The Google Sheet's own link (open it in the browser and copy the address bar, ends in /edit...).
  // Shows a "Tick watched in the sheet" button under the movie list. Leave empty to hide the button.
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1-PAB5xC_cbaK7Uq_JHguQt2GyoEufsphERUM84tVbzQ/edit?gid=232171872#gid=232171872',
  // The same sheet opened on the free-dates tab, so "I'm free too" can tick your name on a date someone already added.
  datesSheetUrl: 'https://docs.google.com/spreadsheets/d/1-PAB5xC_cbaK7Uq_JHguQt2GyoEufsphERUM84tVbzQ/edit?gid=1440545244#gid=1440545244',
  // Title of the calendar event created by the "Add to calendar" buttons on upcoming dates.
  eventTitle: 'Movie night \uD83C\uDFAC',
  // Address of this site, put into the calendar reminders so they link back here. Leave empty to use the address the page is opened on.
  siteUrl: 'https://j4kub0k.github.io/Movies/',
  // Title of the monthly "Plan a movie night" reminder.
  reminderTitle: 'Plan a movie night \uD83C\uDFAC',
  // "Free days" tab (Date | Jakub | Her checkboxes): its published CSV link, and its normal sheet link (opens the tab
  // to tick days). When availabilityCsvUrl is set it replaces the free-dates form. Leave empty to keep using the form.
  availabilityCsvUrl: '',
  availabilitySheetUrl: '',
  // Only used when a slash date like 3/4/2026 is ambiguous: 'dmy' = day first, 'mdy' = month first.
  dateOrder: 'dmy',
};
