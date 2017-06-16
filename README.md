# google-spreadsheet-search
Search in your Google spreadsheets from a simple website.

## About

This is a sample tool of how you can search in your Google Spreadsheets
from a simple website.

## Setup

Clone this repo and create a `config.json` file at root level.

Sample config:
```
{
  "search": {
    "key": "YOUR GOOGLE SEARCH KEY",
    "cx": "YOUR GOOGLE SEARCH CX"
  },
  "client": {
    "id": "YOUR GOOGLE APP ID WITH SPREADSHEETS API ENABLED",
    "secret": "THE APP SECRET"
  },
  "spreadsheet": {
    "id": "ID FOR THE SPREADSHEET YOU WANT TO ACCESS",
    "range": "SHEET NAME!A1:Z100"
  }
}

```
