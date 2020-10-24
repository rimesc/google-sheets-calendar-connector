import * as fs from 'fs';

const CONFIG_DIR = process.env.CONFIG_DIR || 'config';

export const config: Config = JSON.parse(fs.readFileSync(CONFIG_DIR + '/config.json').toString());
export const credentials = JSON.parse(fs.readFileSync(CONFIG_DIR + '/client_secret.json').toString());

export interface Config {
  spreadsheet: {
    id: string,
    dateRange: string,
    volunteerRanges: string[]
  },
  calendar: {
    id: string,
    events: {
      title: string,
      location: string,
      createdBy: string,
      start: any,
      duration: any
    }
  },
  emails: {
    [ initials: string ] : string
  },
  sendNotifications: boolean
}
