# Google Sheets → Calendar Connector

A simple Node.JS application that uses REST APIs to update a Google calendar based on data from a Google sheet.

It was written for a very specific use case (that of a spreadsheet used to track availability of volunteers for a code club) so it's unlikely to be generally useful, but it can hopefully serve as a reference or starting-point for anyone looking to do something similar.

## Developing

### Setup

Run `npm install` to install dependencies.

Follow the linked instructions to enable both the [Google Calendar](https://developers.google.com/google-apps/calendar/quickstart/nodejs) and [Google Sheets](https://developers.google.com/sheets/api/quickstart/nodejs) APIs.
Put the downloaded credentials in a file called `client_secret.json` in the `config` folder.

Edit [config.json](config/config.json) to configure the locations of your Google calendar and spreadsheet and other aspects of the application (see below).

Tested on node 10.15.3.

### Running

- `npm run start` - update the calendar with data from the spreadsheet
- `npm run dry-run` - log the updates that would have been made, without actually making them

The first time you run the application it will prompt you to visit a web site to authenticate - simply follow the instructions
in the console. The credentials are save to disk and re-used for future runs.

## Installation

Run `npm install -g $(npm pack | tail -1)` to install the application globally. This will add a `google-sheets-calendar-connector` executable to the path.

You can use the `CONFIG_DIR` environment variable to change where the configuration files are read from and the `TOKEN_DIR` environment variable to control where the API token is stored.

### Running on a schedule

The application does not provide support for scheduling - use an OS provided system such as `cron` (linux) or `launchd` (MacOS).

## Configuration

The application reads the following properties from the configuration file. See [config.json](config/config.json) for examples.

| Property                      | Notes                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| `spreadsheet.id`              | ID of source spreadsheet                                                              |
| `spreadsheet.dateRange`       | single-column data range containing event dates in the spreadsheet                    |
| `spreadsheet.volunteerRanges` | array of single-column data ranges containing event attendees in the spreadsheet      |
| `calendar.id`                 | ID of target calendar                                                                 |
| `calendar.events.title`       | event title                                                                           |
| `calendar.events.location`    | location of events                                                                    |
| `calendar.events.createdBy`   | arbitrary string used to identify calendar events created by this application         |
| `calendar.events.start`       | start time of events (in format used by moment.js)                                    |
| `calendar.events.duration`    | duration of events (in format used by moment.js)                                      |
| `emails`                      | dictionary mapping names of attendees (as used in the spreadsheet) to email addresses |
| `sendNotifications`           | whether or not to send email notifications to attendees                               |

## Docker

#### Build

    docker build -t google-sheets-calendar-connector .
    docker volume create google-api-token
    docker create -i -v google-api-token:/var/token --name google-sheets-calendar-connector google-sheets-calendar-connector

#### First run

    docker start -i google-sheets-calendar-connector

Follow the instructions to authenticate and then press `Ctrl+D` to stop the container.

#### Subsequent runs

    docker start google-sheets-calendar-connector

The application will run once and the container will stop on completion.

## Licensing

Portions of this code were taken from https://developers.google.com/google-apps/calendar/quickstart/nodejs,
licensed under the Apache 2.0 License (http://www.apache.org/licenses/LICENSE-2.0).
