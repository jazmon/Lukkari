# Lukkari
Timetable for students of Tampere University of Applied Sciences (TAMK).

## Description
The product provides the user a timetable for TAMK. The software fetches the
timetable data from TAMK Lukkarikone and then displays it to the user. The 
user can also view other group's timetables. 

The ability to export the timetable in ical format is also provided. User can
also set if they want to get a notification n minutes before the lesson starts.
(Exporting ical is currently only available if the user is logged in and actually
finds the feature from the menus.) This product is also mobile friendly, unlike 
Lukkarikone's interface.

The product will also feature a lunch list at least for Campusravita.

## Features:

* One day view of lessons
* A week view of lessons
* Campusravita lunch list
* Notification possibility for lessons
* Adding lessons to your own Google Calendar
* Searching courses and realizations
* Available in Finnish and English

## Contributing
Feel free to contribute any improvements you have, or list issues in the issue tracker.

### To build the app yourself
* You must have `node`, `bower` and `gulp` installed globally.
* Run `npm install` inside the main folder to install required dependencies.
* Run `bower install` inside the main folder to install required dependencies.
After these steps, you can run the browser version with either running the `run_browser.sh` file or by manually running the gulp commands:
* `gulp clean`
* `gulp add-proxy` (this adds a proxy so that `localhost://` can get data from the API.
* `gulp release`
* `gulp serve` (starts a server)
If you want to use livereload, run these after that as well (in a separate command window).
* `gulp watch`
* enable [Livereload](http://livereload.com/) on your browser

## Licence
The code is licenced under the [MIT licence](https://tldrlegal.com/license/mit-license). 
