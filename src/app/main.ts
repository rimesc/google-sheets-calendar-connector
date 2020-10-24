// Portions of this code taken from https://developers.google.com/google-apps/calendar/quickstart/nodejs,
// licensed under the Apache 2.0 License (http://www.apache.org/licenses/LICENSE-2.0).

import * as moment from 'moment-timezone';

import { authorize, calendar, sheets } from './api';
import { config } from "./config";

interface TableRow {
  date: moment.Moment;
  volunteers: string[];
}

export async function run(force: boolean, dryRun: boolean): Promise<void> {
  console.log(moment().toLocaleString());
  await authorize();
  const rows = await loadTable();
  const events = await loadEvents();
  await Promise.all(rows.map(row => processRow(row, events, force, dryRun)));
  await Promise.all(events.map(event => removeEvent(event, dryRun)));
}

export async function clear(dryRun: boolean): Promise<void> {
  console.log(moment().toLocaleString());
  await authorize();
  await clearEvents();
}

async function loadTable(): Promise<TableRow[]> {
  const request = {
    spreadsheetId: config.spreadsheet.id,
    ranges: [ config.spreadsheet.dateRange, ...config.spreadsheet.volunteerRanges ] as any,
    majorDimension: 'COLUMNS'
  };
  const data = await sheets.get(request);
  const dates = data.valueRanges[0].values[0];
  const volunteers = data.valueRanges.slice(1).map(cols => cols.values[0]);
  const events = dates.map((date, i) => ({
    date: moment(date),
    volunteers: volunteers.map(col => col[i]).sort(), // sort to avoid spurious changes due to ordering
  }));
  return events;
}

async function loadEvents(): Promise<calendar.Event[]> {
  return calendar.list({
    calendarId: config.calendar.id,
    privateExtendedProperty: [`createdBy=${config.calendar.events.createdBy}`],
    orderBy: 'startTime',
    singleEvents: true,
  }).then(events => events.items);
}

async function clearEvents(): Promise<void[]> {
  const request = {
    calendarId: config.calendar.id,
    privateExtendedProperty: [`createdBy=${config.calendar.events.createdBy}`],
    singleEvents: true,
  };
  const events = await calendar.list(request);
  return Promise.all(events.items.map(e => calendar.remove({calendarId: config.calendar.id, eventId: e.id})));
}

async function processRow(row: TableRow, events: calendar.Event[], force: boolean, dryRun: boolean): Promise<void> {
  const event = findMatchingEvent(events, row);
  if (event) {
    if (force || !sameVolunteers(row, event)) {
      if (!dryRun) await updateEvent(event, row.volunteers);
      console.debug('Updated event on ' + row.date.format('YYYY-MM-DD') + ' with ' + row.volunteers);
    }
  }
  else {
    if (!dryRun) await addEvent(row.date, row.volunteers);
    console.debug('Added event on ' + row.date.format('YYYY-MM-DD') + ' with ' + row.volunteers);
  }
}

function findMatchingEvent(events: calendar.Event[], row: TableRow): calendar.Event | undefined {
  const i = events.findIndex(event => moment(event.start.dateTime).set({h: 0, m: 0, s: 0, ms: 0}).isSame(row.date));
  return i >= 0 ? events.splice(i, 1)[0] : undefined;
}

function sameVolunteers(row: TableRow, event: calendar.Event): boolean {
  const eventVolunteers = JSON.parse(event.extendedProperties.private.volunteers) as string[];
  return eventVolunteers.length === row.volunteers.length && eventVolunteers.every((v, i) => v === row.volunteers[i]);
}

async function addEvent(date: moment.Moment, volunteers: string[]): Promise<calendar.Event> {
  return calendar.insert({
    calendarId: config.calendar.id,
    requestBody: newEvent(date, volunteers),
    sendNotifications: config.sendNotifications,
  });
}

async function updateEvent(event: calendar.Event, volunteers: string[]): Promise<calendar.Event> {
  return calendar.update({
    calendarId: config.calendar.id, 
    eventId: event.id, 
    requestBody: patchEvent(event, volunteers),
    sendNotifications: config.sendNotifications,
  });
}

async function removeEvent(event: calendar.Event, dryRun: boolean): Promise<void> {
  if (!dryRun) await calendar.update({
    calendarId: config.calendar.id,
    eventId: event.id,
    requestBody: {status: 'cancelled'},
    sendNotifications: config.sendNotifications,
  });
  console.debug('Cancelled event on ' + moment(event.start.dateTime).format('YYYY-MM-DD'));
}      

function newEvent(date: moment.Moment, volunteers: string[]): calendar.Event {
  const partial = patchEvent({}, volunteers);
  return {
    ...partial,
    location: config.calendar.events.location,
    start: {
      dateTime: startTime(date).toISOString()
    },
    end: {
      dateTime: startTime(date).add(config.calendar.events.duration).toISOString()
    },
    extendedProperties: {
      private: {
        ...partial.extendedProperties.private,
        createdBy: config.calendar.events.createdBy,
      },
    },
  }
}

function patchEvent(event: calendar.Event, volunteers: string[]): calendar.Event {
  const summary = `${config.calendar.events.title} (${volunteers.join(' | ')})`;
  const attendees = volunteers.filter(v => !!config.emails[v])
                              .map(v => event.attendees && event.attendees.find(a => a.email === config.emails[v]) || attendee(v));
  const extendedProperties = {
    private: {
      volunteers: JSON.stringify(volunteers),
    },
  };
  return { summary, attendees, extendedProperties };
}

function startTime(date: moment.Moment): moment.Moment {
  return moment.tz(date, 'Europe/London').set(config.calendar.events.start);
}

function attendee(initials: string): calendar.Attendee | undefined {
  return config.emails[initials] && { displayName: initials, email: config.emails[initials] };
}

