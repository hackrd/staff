/*
EVENTMAN (EVN)
-COPYRIGHT NOTICE-
Eventman Copyright (c) 2017 Sean Kee - All Rights Reserved.

Unauthorized copying or reproduction of this file is strictly prohibited.

Visit https://mrskee.github.io/ for more information.
Sean Kee <skee66499@gmail.com>
*/

/* Load jQuery before loading SK.js */

"use strict";

// SK Namespace
var SKJS = function () {
    /*About: function () {
        console.log('SK Prototype');
    },
    SearchTable: function(pTableID) {
        var Table = $('#' + pTableID);
        var Input = event.target.id;
        console.log(Input);
    }*/
};

var SK = new SKJS();

/* Search a table */
SKJS.prototype.SearchTable = function (pTableID, pIndexColumns) {
    var Table = $('#' + pTableID);
    var Input = $('#' + event.target.id).val().toLowerCase();
    var Rows = Table.find('tr');
    var Data;

    var Match = false;

    for (var i = 0; i < Rows.length; i++) {
        Match = false;
        // Only search rows that have not been ruled out
        //if (Rows[i].style['display'] != 'none') {
        for (var j = 0; j < pIndexColumns.length; j++) {
            if (!Match) {
                Data = Rows[i].getElementsByTagName('td')[pIndexColumns[j]];
                if (Data) {
                    if (Data.innerHTML.toLowerCase().indexOf(Input) > -1) {
                        Rows[i].style['display'] = '';
                        Match = true;
                    }
                    else {
                        Rows[i].style['display'] = 'none';
                        Match = false;
                    }
                }
            }
        }
        //}
    }
}

SKJS.prototype.GetESTTimestamp = function () {
    var Timestamp = new Date();
    var Month = ('0' + (Timestamp.getMonth() + 1)).slice(-2);
    var Day = ('0' + Timestamp.getDate()).slice(-2);
    var Year = Timestamp.getFullYear();
    var Hours = ('0' + Timestamp.getHours()).slice(-2);
    var Minutes = ('0' + Timestamp.getMinutes()).slice(-2);
    var Seconds = ('0' + Timestamp.getSeconds()).slice(-2);
    return Month + '/' + Day + '/' + Year + '@' + Hours + ':' + Minutes + ':' + Seconds + '-EST';
}

SKJS.prototype.GetDate = function () {
    var Timestamp = new Date();
    var Month = ('0' + (Timestamp.getMonth() + 1)).slice(-2);
    var Day = ('0' + Timestamp.getDate()).slice(-2);
    var Year = Timestamp.getFullYear();
    return Month + '/' + Day + '/' + Year;
}

SKJS.prototype.GetTime = function () {
    var Timestamp = new Date();
    var Hours = ('0' + Timestamp.getHours()).slice(-2);
    var Minutes = ('0' + Timestamp.getMinutes()).slice(-2);
    var Seconds = ('0' + Timestamp.getSeconds()).slice(-2);
    return Hours + ':' + Minutes + ':' + Seconds + '-EST';
}

SKJS.prototype.GetElapsedEpoch = function () {
    var Timestamp = new Date();
    return Timestamp.getTime();
}

SKJS.prototype.YYYYMMDDToMMDDYYYY = function (pDate) {
    pDate = pDate.split('-');
    var Year = pDate[0];
    var Month = pDate[1];
    var Day = pDate[2];
    return Month + '/' + Day + '/' + Year;
}

// Takes two Elapsed Epoch milliseconds and returns duration in seconds
SKJS.prototype.CalculateDuration = function (pStart, pEnd) {
    /*var ElapsedSeconds = 0;

    pStart = pStart.split('-');
    pStart.pop();
    pStart = pStart[0].split('@');
    pStart[0] = pStart[0].split('/');
    pStart[1] = pStart[1].split(':');
    pEnd = pEnd.split('-');
    pEnd.pop();
    pEnd = pEnd[0].split('@');
    pEnd[0] = pEnd[0].split('/');
    pEnd[1] = pEnd[1].split(':');
    var FirstMonth = parseInt(pStart[0][0]);
    var FirstDay = parseInt(pStart[0][1]);
    var FirstYear = parseInt(pStart[0][2]);
    var FirstHours = parseInt(pStart[1][0]);
    var FirstMinutes = parseInt(pStart[1][1]);
    var FirstSeconds = parseInt(pStart[1][2]);
    var SecondMonth = parseInt(pEnd[0][0]);
    var SecondDay = parseInt(pEnd[0][1]);
    var SecondYear = parseInt(pEnd[0][2]);
    var SecondHours = parseInt(pEnd[1][0]);
    var SecondMinutes = parseInt(pEnd[1][1]);
    var SecondSeconds = parseInt(pEnd[1][2]);
    if (SecondYear > FirstYear) {
        // NEED TO CHECK FOR LEAP YEARS
        ElapsedSeconds += (SecondYear - FirstYear) * 365 * 24 * 60 * 60;
    }
    if (SecondMonth > FirstMonth) {
        for (var i = FirstMonth; i < SecondMonth; i++) {
            ElapsedSeconds += SK.DaysInMonth(i) * 24 * 60 * 60;
        }
        ElapsedSeconds -= FirstDay * 24 * 60 * 60;
        ElapsedSeconds += SecondDay * 24 * 60 * 60;
    }
    else {
        if (FirstMonth < SecondMonth) {
            ElapsedSeconds -= 364 * 24 * 60 * 60;
            for (var i = SecondMonth; i <= 13; i++) {
                ElapsedSeconds += SK.DaysInMonth(i) * 24 * 60 * 60;
            }
            for (var i = 1; i <= FirstMonth; i++) {
                ElapsedSeconds += SK.DaysInMonth(i) * 24 * 60 * 60;
            }
            ElapsedSeconds -= FirstDay * 24 * 60 * 60;
            ElapsedSeconds += SecondDay * 24 * 60 * 60;
        } else {
            if (SecondDay > FirstDay) {
                ElapsedSeconds += (SecondDay - FirstDay) * 24 * 60 * 60;
            }
            else {
            }
        }
    }
    if (SecondHours > FirstHours) {
        ElapsedSeconds += (SecondHours - FirstHours) * 60 * 60;
    }
    else {
        if (FirstHours > SecondHours) {
            ElapsedSeconds += (24 - FirstHours + SecondHours) * 60 * 60;
        }
    }
    if (SecondMinutes > FirstMinutes) {
        ElapsedSeconds += (SecondMinutes - FirstMinutes) * 60;
    }
    else {
        if (SecondSeconds > FirstSeconds) {
            ElapsedSeconds += (SecondSeconds - FirstSeconds);
        }
    }*/
    return Math.round((pEnd - pStart) / 1000);
}

SKJS.prototype.IsLeapYear = function (pYear) {
    return (((pYear % 4 == 0) && (pYear % 100 != 0)) || (pYear % 400 == 0));
}

// Takes in month number and returns # of days
SKJS.prototype.DaysInMonth == function (pMonth) {
    switch (pMonth) {
        case 1:
            return 31;
            break;
        case 2:
            return 28;
            break;
        case 3:
            return 31;
            break;
        case 4:
            return 30;
            break;
        case 5:
            return 31;
            break;
        case 6:
            return 30;
            break;
        case 7:
            return 31;
            break;
        case 8:
            return 31;
            break;
        case 9:
            return 30;
            break;
        case 10:
            return 31;
            break;
        case 11:
            return 30;
            break;
        case 12:
            return 31;
            break;
    }
}