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

SKJS.prototype.YYYYMMDDToMMDDYYYY = function (pDate) {
    pDate = pDate.split('-');
    var Year = pDate[0];
    var Month = pDate[1];
    var Day = pDate[2];
    return Month + '/' + Day + '/' + Year;
}