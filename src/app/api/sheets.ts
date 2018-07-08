/**
 * Async wrappers for Google Sheets API.
 * 
 * Portions of this code taken from https://developers.google.com/google-apps/calendar/quickstart/nodejs,
 * licensed under the Apache 2.0 License (http://www.apache.org/licenses/LICENSE-2.0).
 */

import { google, sheets_v4 } from 'googleapis';
import { doCall } from './common';

import BatchGetParams = sheets_v4.Params$Resource$Spreadsheets$Values$Batchget;

export namespace sheets {
  
  export import GetValuesResponse = sheets_v4.Schema$BatchGetValuesResponse;
  
  const sheets = google.sheets('v4');
  
  /**
   * Wraps Sheets.batchGet(params, callback) in an async function.
   */
  export async function get(request: BatchGetParams): Promise<GetValuesResponse> {
    return doCall(responseHandler => sheets.spreadsheets.values.batchGet(request, responseHandler));
  }
  
}
