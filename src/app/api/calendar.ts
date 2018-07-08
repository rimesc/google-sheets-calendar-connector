/**
 * Async wrappers for Google Calendar API.
 * 
 * Portions of this code taken from https://developers.google.com/google-apps/calendar/quickstart/nodejs,
 * licensed under the Apache 2.0 License (http://www.apache.org/licenses/LICENSE-2.0).
 */

import { google, calendar_v3 } from 'googleapis';
import { doCall } from './common';

import ListEventsParams = calendar_v3.Params$Resource$Events$List;
import UpdateEventParams = calendar_v3.Params$Resource$Events$Patch;
import InsertEventParams = calendar_v3.Params$Resource$Events$Insert;
import DeleteEventParams = calendar_v3.Params$Resource$Events$Delete;

export namespace calendar {
  
  export import Event = calendar_v3.Schema$Event;
  export import Events = calendar_v3.Schema$Events;
  export import Attendee = calendar_v3.Schema$EventAttendee;

  const calendar = google.calendar('v3');

  /**
   * Wraps Calendar.list(params, callback) in an async function.
   */
  export async function list(request: ListEventsParams): Promise<Events> {
    return doCall(responseHandler => calendar.events.list(request, responseHandler));
  }

  /**
   * Wraps Calendar.patch(params, callback) in an async function.
   */
  export async function update(request: UpdateEventParams): Promise<Event> {
    return doCall(responseHandler => calendar.events.patch(request, responseHandler));
  }

  /**
   * Wraps Calendar.insert(params, callback) in an async function.
   */
  export async function insert(params: InsertEventParams): Promise<Event> {
    return doCall(responseHandler => calendar.events.insert(params, responseHandler));
  }

  /**
   * Wraps Calendar.delete(params, callback) in an async function.
   */
  export async function remove(params: DeleteEventParams): Promise<void> {
    const foo = doCall(responseHandler => calendar.events.delete(params, responseHandler));
  }

}
