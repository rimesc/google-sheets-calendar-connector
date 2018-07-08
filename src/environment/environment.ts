// ID of target calendar
export const CALENDAR_ID = 'example1234567890abcdefghi@group.calendar.google.com';
// ID of source spreadsheet
export const SPREADSHEET_ID = 'eXaMplE1aBC-aBcdefGHIjklm1nOpQrsTUvwxYZAbcDe';

// single-column data range containing event dates in the spreadsheet
export const DATE_RANGE = 'Sheet1!A2:A100';
// array of single-column data ranges containing event attendees in the spreadsheet
export const VOLUNTEER_RANGES = ['Sheet1!AA2:AA100', 'Sheet1!AB2:AB100'];

// arbitrary string used to identify calendar events created by this application
export const CREATED_BY = 'My Organisation';

// dictionary mapping names of attendees (as used in the spreadsheet) to email addresses
export const EMAILS = {
  me: 'me@example.com',
  // ...
};

// whether or not to send email notifications to attendees
export const SEND_NOTIFICATIONS = true;

// event title
export const EVENT_TITLE = 'My Event'
// location of events
export const EVENT_LOCATION = `Event Centre
Some Street, Any Town, ANY1 1SS`;
// start time of events (in format used by moment.js)
export const EVENT_START = {h: 10, m: 0};
// duration of events (in format used by moment.js)
export const EVENT_DURATION = {h: 1};

