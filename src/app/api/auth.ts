// Portions of this code taken from https://developers.google.com/google-apps/calendar/quickstart/nodejs,
// licensed under the Apache 2.0 License (http://www.apache.org/licenses/LICENSE-2.0).

import { google } from 'googleapis';
import * as googleAuth from 'google-auth-library';
import * as readline from 'readline';
import * as fs from 'fs';

import { credentials } from '../config'

// If modifying these scopes, delete your previously saved credentials
const SCOPES = ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/spreadsheets.readonly'];
const TOKEN_DIR = process.env.TOKEN_DIR ||
  ((process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/');
const TOKEN_PATH = TOKEN_DIR + 'google-apis.json';

/**
 * Initialize an OAuth2 client, either using stored credentials or prompting
 * the user to interactively get new ones.
 */
export async function authorize(): Promise<void> {
  const clientSecret = credentials.installed.client_secret;
  const clientId = credentials.installed.client_id;
  const redirectUrl = credentials.installed.redirect_uris[0];
  const oauth2Client = new googleAuth.OAuth2Client(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  try {
    oauth2Client.credentials = JSON.parse(fs.readFileSync(TOKEN_PATH).toString());
  } catch (error) {
    oauth2Client.credentials = await getNewToken(oauth2Client);
  }
  google.options({ auth: oauth2Client });
  return Promise.resolve();
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param oauth2Client The OAuth2 client to get token for.
 */
async function getNewToken(oauth2Client: googleAuth.OAuth2Client): Promise<any> {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve, reject) => {
    rl.question('Enter the code from that page here: ', code =>  {
      rl.close();
      oauth2Client.getToken(code, (err, token) => {
        if (err) {
          console.error('Error while trying to retrieve access token', err);
          return;
        }
        storeToken(token);
        resolve(token);
      });
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}
