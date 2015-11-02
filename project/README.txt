README

    File       : README.txt
    Time-stamp : 2015-11-02T14:01 Atte Huhtakangas
    Description: Contains general information about the product and
                 releases.

GENERAL INFO

    Product name     : Lukkari
    Developer        : Atte Huhtakangas, atte.huhtakangas@cs.tamk.fi
                       Elias Ylanen,     elias.ylanen@cs.tamk.fi  
    Device target(s) : android
    Price            : TBD/free
    Url(s)           : TBD

DESCRIPTION OF THE PRODUCT

    The product provides the user a timetable for TAMK. The software fetches the
    timetable data from TAMK Lukkarikone and then displays it to the user. The 
    user can also view other group's timetables. 

    The ability to export the timetable in ical format is also provided. User can
    also set if they want to get a notification n minutes before the lesson starts.
    (Exporting ical is currently only available if the user is logged in and actually
    finds the feature from the menus.) This product is also mobile friendly, unlike 
    Lukkarikone's interface.

    The product will also feature a lunch list at least for Campusravita.

FILES

    Every release<n> folder contains same folder hierarchy (see release-4/)
    <modify the following dir structure if necessary!>

    projectwork/
    |
    +-- README.txt            // This file.
    |
    +-- PRODUCTBACKLOG.txt    // List of features for each release.
    |
    +-- <iso-standard-date>-release-1/    // Release 1 of the product.
    |
    +-- <iso-standard-date>-release-2/    // Release 2 of the product.
    |
    +-- <iso-standard-date>-release-3/    // Release 3 of the product.
        |
        +--RELEASENOTES.txt   // Notes about this release. Changes to 
        |                     // product backlog.
        +--bin/               // Application package (for example .apk in android)
        |
        +--src/<course-code>-lastname-firstname.zip   // whole project

End of file.