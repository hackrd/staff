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