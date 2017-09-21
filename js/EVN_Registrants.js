/*
EVENTMAN (EVN)
-COPYRIGHT NOTICE-
Eventman Copyright (c) 2017 Sean Kee - All Rights Reserved.

Unauthorized copying or reproduction of this file is strictly prohibited.

Visit https://mrskee.github.io/ for more information.
Sean Kee <skee66499@gmail.com>
*/
// "use strict";
/* Dashboard using MyMLH API */
var EVN_Registrants = function () {
    this.mData = {};
    this.mStatus = {};
    this.mSizes = {};
    this.mDietary = {};
    this.mSchools = {};
    this.mDateRegistered = {};

    this.mMyMLHReference = {};
    this.mTotalRegistrants = null;
    this.mTotalAttended = null;
    this.mTotalBanned = null;

    this.mUser = new EVN_User();
}

// Open SK_ctx-menu when profile-flags is right clicked
//$(document).bind("contextmenu", function (event) {
$('#profile-flags').bind("contextmenu", function (event) {   
    // Avoid the real one
    event.preventDefault();
    
    // Show contextmenu
    $(".SK_ctx-menu").finish().toggle(100).
    
    // In the right position (the mouse)
    css({
        top: event.pageY + "px",
        left: event.pageX + "px"
    });
});


// If the document is clicked somewhere
$(document).bind("mousedown", function (e) {
    
    // If the clicked element is not the menu
    if (!$(e.target).parents(".SK_ctx-menu").length > 0) {
        
        // Hide it
        $(".SK_ctx-menu").hide(100);
    }
});


/*// If the menu element is clicked
$(".SK_ctx-menu li").click(function(){
    
    // This is the triggered action name
    switch($(this).attr("data-action")) {

        case "first": alert("first"); break;
    }
  
    // Hide it AFTER the action was triggered
    $(".SK_ctx-menu").hide(100);
});*/


EVN_Registrants.prototype.CreateRaffle = function (pRaffleName) {
    
}

EVN_Registrants.prototype.DrawRaffle = function (pRaffleName) {
    var rand = myArray[Math.floor(Math.random() * myArray.length)];
}

EVN_Registrants.prototype.JSONToCSV = function (pData) {
    if (pData.length == 0) {
        return '';
    }
    
    var Keys = Object.keys(pData[0]);
    
    for (var i = 0; i < Keys.length; i++) {
        //if pData[i]
    }

    var ColumnDelimiter = ',';
    var LineDelimiter = '\n';
    
    var CSVColumnHeader = Keys.join(ColumnDelimiter);
    var CSVString = CSVColumnHeader + LineDelimiter;
    
    for (var i = 0; i < pData.length; i++) {
        for (var j = 0; j < Keys.length; j++) {
            if (pData[i][Keys[j]] != null) {
                for (var k = 0; k < pData[i][Keys[j]].length; k++) {
                    if (pData[i][Keys[j]][k] == ',' || pData[i][Keys[j]][k] == '\n') {
                        pData[i][Keys[j]] = pData[i][Keys[j]].substr(0, k) + ' ' + pData[i][Keys[j]].substr(k + 1);
                    }
                }
            }
            CSVString += pData[i][Keys[j]] + ColumnDelimiter;
        }
        CSVString += LineDelimiter;
    }
    
    return encodeURIComponent(CSVString);
}

EVN_Registrants.prototype.ExportRegistrants = function (pFileType) {
    var EVN = this;
    // check for permissions
    if (EVN.mUser.HasPermission('ExportRegistrants') || EVN.mUser.HasPermission('All')) {
        Materialize.toast('Preparing file for download...', 4000, 'toast-fix');
        
        firebase.database().ref().child('APPDATA').child('Registrants').once('value').then(function (snap) {
            // Prepare data
            var JSONData = [];
            var JSONDataCounter = 0;
            for (var i = 0; i < EVN.mData.length; i++) {
                if (typeof snap.val()['ID_' + EVN.mData[i].id] != undefined) {
                    if (snap.val()['ID_' + EVN.mData[i].id].Status != 'BANNED') {
                        JSONData.push($.extend(true, {}, EVN.mData[i]));
                        JSONData[JSONDataCounter].school_id = JSONData[JSONDataCounter].school.id.toString();
                        JSONData[JSONDataCounter].school_name = JSONData[JSONDataCounter].school.name;
                        JSONData[JSONDataCounter].last_updated = JSONData[JSONDataCounter].updated_at;
                        delete JSONData[JSONDataCounter].school;
                        delete JSONData[JSONDataCounter].scopes;
                        delete JSONData[JSONDataCounter].updated_at;
                        JSONDataCounter++;
                    }
                }
            }

            var Timestamp = SK.GetDate();
            var FileName = Timestamp + "_Hack River Dell Registrants";
            
            var DataURI = "";
            
            // Created proper download
            if (pFileType == 'CSV') {
                FileName += ".csv";
                var CSVString = EVN.JSONToCSV(JSONData);
                DataURI = "data:text/csv;charset=utf-8," + CSVString;
            } else {
                if (pFileType = 'JSON') {
                    FileName += ".json";
                    var JSONString = JSON.stringify(JSONData);
                    DataURI = "data:application/json;charset=utf-8," + encodeURIComponent(JSONString);
                } else {
                    console.log('Invalid file type');
                    return;
                }
            }
            
            var TempLinkElement = document.createElement('a');
            TempLinkElement.setAttribute('href', DataURI);
            TempLinkElement.setAttribute('download', FileName);
            TempLinkElement.click();
        });
    }
}

EVN_Registrants.prototype.SetFlags = function (pID, pFlags) {
    firebase.database().ref().child('APPDATA').child('Registrants').child(pID).update({
        Flags: pFlags
    });
}

// Creates user account default to staff upon first login
EVN_Registrants.prototype.CreateUser = function (pUid, pUsername, pType) {
    firebase.database().ref().child('APPDATA').child('Users').child(pUid).set({
        Uid: pUid,
        Username: pUsername,
        Type: pType
    });
    this.mUserType = pType;
}

EVN_Registrants.prototype.ClearRegistrantLog = function (pID) {
    var EVN = this;
    if (EVN.mUser.HasPermission('ClearRegistrantLog') || EVN.mUser.HasPermission('All')) {
        firebase.database().ref().child('APPDATA').child('Registrants').child(pID).once('value').then(function (snap) {
            if (snap.val().Status == 'CHECKED_IN') {
                EVN.mTotalAttended--;
                $('.totals-checked-in').each(function () {
                    $(this).html('Checked In: ' + EVN.mTotalAttended);
                });
            }
            
            if (typeof snap.val().Log != 'undefined') {
                var ClearEntries = snap.val().Log;
                var Temp = "";
                ClearEntries = ClearEntries.split(' ');
                if (ClearEntries.constructor !== Array) {
                    ClearEntries[0] = ClearEntries;
                }
                for (var i = 0; i < ClearEntries.length; i++) {
                    Temp = ClearEntries[i].split('%');
                    Temp.splice(1, 0, pID);
                    ClearEntries[i] = Temp.join('%');
                }
                ClearEntries = ClearEntries.join(' ');
                EVN.mUser.RemoveAuditLogEntries('Registrants', ClearEntries);
                EVN.mUser.RemoveAuditLogEntries('Master', ClearEntries);
            }
            
            var ActionLog = 'CLRREGISTRANTLOG%' + pID + '%' + SK.GetESTTimestamp();
            EVN.mUser.AppendActionLog(ActionLog);
            ActionLog += '%' + EVN.mUser.mUsername;
            EVN.mUser.AppendAuditLog('Registrants', ActionLog);
            EVN.mUser.AppendAuditLog('Master', ActionLog);
            
            firebase.database().ref().child('APPDATA').child('Registrants').child(pID).set({
                Status: "NOT_ATTENDED",
            });
            $('#profile-check-in-out-log-table-body').html('');
            $('#profile-status').html('NOT_ATTENDED');
            Materialize.toast("Successfully cleared log for " + pID, 4000, "toast-fix");
            console.log("Successfully cleared log for " + pID);
            $('#clear-log-btn').hide();
        });
    }
}

EVN_Registrants.prototype.ViewProfile = function (pID) {
    var EVN = this;

    if (EVN.mUser.HasPermission('ViewRegistrants') || EVN.mUser.HasPermission('All')) {
        // Convert ID
        var ID = pID.split('_');
        ID = ID.pop();
        // Fill modal with information
        var Data = EVN.mData[EVN.mMyMLHReference[pID]];
        var ProfileInfo = "";
        var CheckInOutLog = "";
        var CheckInOutLogData = "";
        
        firebase.database().ref().child('APPDATA').child('Registrants').child(pID).once('value').then(function (snap) {
            ProfileInfo = "<span class='bold'>ID: </span>" + ID + "<br /><span class='bold'>Status: </span><span id='profile-status'>" + snap.val().Status + "</span><br /><span class='bold'>First Name: </span>" + Data.first_name + "<br /><span class='bold'>Last Name: </span>" + Data.last_name + "<br /><span class='bold'>DOB: </span>" + Data.date_of_birth + "<br /><span class='bold'>Gender: </span>" + Data.gender + "<br /><span class='bold'>Email: </span>" + Data.email + "<br /><span class='bold'>Phone #: </span>" + Data.phone_number + "<br /><span class='bold'>Shirt Size: </span>" + Data.shirt_size + "<br /><span class='bold'>School: </span>" + Data.school.name + "<br /><span class='bold'>Level of Study: </span>" + Data.level_of_study + "<br /><span class='bold'>Dietary Restrictions: </span>" + Data.dietary_restrictions + "<br /><span class='bold'>Special Needs: </span>" + Data.special_needs + "<br /><span class='bold'>Last Updated: </span>" + Data.updated_at;
            
            // Flags
            $('#profile-flags').html('');
            if (typeof snap.val().Flags != 'undefined') {
                if (snap.val().Flags == 'INELIGIBLE') {
                    $('#profile-flags').html('<div class="profile-redflag">INELIGIBLE</div>');
                }
            }
            
            if (EVN.mUser.HasPermission('EditRegistrantFlags') || EVN.mUser.HasPermission('All')) {
                // If the menu element is clicked
                $('.SK_ctx-menu li').unbind('click');
                $(".SK_ctx-menu li").click(function () {

                    // This is the triggered action name
                    switch ($(this).attr("data-action")) {

                        case "make-eligible":
                            EVN.SetFlags(pID, 'ELIGIBLE');
                            location.reload();
                            break;
                    }

                    // Hide it AFTER the action was triggered
                    $(".SK_ctx-menu").hide(100);
                });
            }
            
            // Ban/Unban button
            
            if (snap.val().Status == "BANNED" && (EVN.mUser.HasPermission('UnbanRegistrants') || EVN.mUser.HasPermission('All'))) {
                $('#ban-btn').hide();
                $('#unban-btn').show();
                $('#unban-btn').unbind('click');
                $('#unban-btn').click(function () {
                    EVN.Unban(pID);
                })
            } else {
                if (EVN.mUser.HasPermission('BanRegistrants') || EVN.mUser.HasPermission('All')) {
                    $('#unban-btn').hide();
                    $('#ban-btn').show();
                    $('#ban-btn').unbind('click');
                    $('#ban-btn').click(function () {
                        EVN.Ban(pID);
                    });
                } else {
                    $('#ban-btn').unbind('click');
                    $('#unban-btn').unbind('click');
                    $('#ban-btn').hide();
                    $('#unban-btn').hide();
                }
            }

            if (typeof snap.val().Log != 'undefined') {
                CheckInOutLogData = snap.val().Log;
                CheckInOutLogData = CheckInOutLogData.split(' ');
                var TotalEntries = Object.keys(CheckInOutLogData).length;
                var CheckInOutLogEntry = "";
                for (var i = 0; i < TotalEntries; i++) {
                    CheckInOutLogEntry = CheckInOutLogData[i];
                    CheckInOutLogEntry = CheckInOutLogEntry.split('%');
                    CheckInOutLog += "<tr><td>" + CheckInOutLogEntry[0] + "</td><td>" + CheckInOutLogEntry[1] + "</td><td>" + CheckInOutLogEntry[2] + "</td></tr>";
                }
                $('#profile-check-in-out-log-table-body').html(CheckInOutLog);

                // Warning Modals
                if (snap.val().Status != "BANNED" && (EVN.mUser.HasPermission('ClearRegistrantLog') || EVN.mUser.HasPermission('All'))) {
                    $('#clear-log-btn').unbind('click');
                    $('#clear-log-btn').click(function () {
                        $('#warning-modal').modal('open');
                    });

                    $("#warning-modal-confirm").unbind("click");
                    $("#warning-modal-confirm").one("click", function () {
                        EVN.ClearRegistrantLog(pID);
                    });
                    $('#warning-modal-title').html('Clear Log');
                    $("#warning-modal-span").html('clear the log for ' + pID);
                    $('#warning-modal-confirm').html('CLEAR LOG');
                    $('#clear-log-btn').show();
                } else {
                    $('#clear-log-btn').unbind('click');
                    $('#clear-log-btn').hide();
                }
            } else {
                $('#profile-check-in-out-log-table-body').html('');
                $('#clear-log-btn').unbind('click');
                $('#clear-log-btn').hide();
            }

            $('#profile-content').html(ProfileInfo)

            // Open Modal
            $('#profile-modal').modal('open');
        });
    }
}

EVN_Registrants.prototype.Ban = function (pID) {
    var EVN = this;
    if (EVN.mUser.HasPermission('BanRegistrants') || EVN.mUser.HasPermission('All')) {
        if (EVN.mStatus[pID].Status != "BANNED") {
            $("#warning-modal-confirm").unbind("click");
            $("#warning-modal-confirm").one("click", function () {
                var ID = pID;
                var Timestamp = SK.GetESTTimestamp();

                var OldLog = "";
                var Update = "";
                var ActionLog = "";
                firebase.database().ref().child('APPDATA').child('Registrants').child(ID).once('value').then(function (snap) {
                    if (snap.val().Status == 'CHECKED_IN') {
                        EVN.mTotalAttended--;
                        $('.totals-checked-in').each(function () {
                            $(this).html('Checked In: ' + EVN.mTotalAttended);
                        });
                    }

                    if (typeof snap.val().Log != 'undefined') {
                        OldLog = snap.val().Log;
                        Update = OldLog + " " + "BANNED%" + Timestamp + "%" + EVN.mUser.mUsername;
                    } else {
                        Update = "BANNED%" + Timestamp + "%" + EVN.mUser.mUsername;
                    }

                    ActionLog = "BANNED%" + pID + "%" + Timestamp;
                    EVN.mUser.AppendActionLog(ActionLog, function() {
                        ActionLog += '%' + EVN.mUser.mUsername;
                        EVN.mUser.AppendAuditLog('Registrants', ActionLog, EVN.mUser.AppendAuditLog('Master', ActionLog, function () {
                            //formatDate(Timestamp);
                            //console.log(CurrentDate);
                            firebase.database().ref().child('APPDATA').child('Registrants').child(ID).update({
                                Status: "BANNED",
                                Log: Update
                            });
    
                            Materialize.toast(pID + " was successfully banned", 4000, "toast-fix");
                            console.log("Successfully banned " + pID);
                            location.reload();
                        }));
                    });
                });
            });
            $('#warning-modal-title').html('Ban Warning');
            $("#warning-modal-span").html('ban ' + pID);
            $('#warning-modal-confirm').html('BAN');
            $("#warning-modal").modal('open');
        }
    }
}

EVN_Registrants.prototype.Unban = function (pID) {
    var EVN = this;
    if (EVN.mUser.HasPermission('UnbanRegistrants') || EVN.mUser.HasPermission('All')) {
        if (EVN.mStatus[pID].Status == "BANNED") {
            $("#warning-modal-confirm").unbind("click");
            $("#warning-modal-confirm").one("click", function () {
                var ID = pID;
                var Timestamp = SK.GetESTTimestamp();

                var OldLog = "";
                var Update = "";
                var ActionLog = "";
                firebase.database().ref().child('APPDATA').child('Registrants').child(ID).once('value').then(function (snap) {
                    if (typeof snap.val().Log != 'undefined') {
                        OldLog = snap.val().Log;
                        Update = OldLog + " UNBANNNED%" + Timestamp + "%" + EVN.mUser.mUsername;
                    } else {
                        Update = "UNBANNED%" + Timestamp + "%" + EVN.mUser.mUsername;
                    }

                    ActionLog = "UNBANNED%" + pID + "%" + Timestamp;
                    EVN.mUser.AppendActionLog(ActionLog, function () {
                        ActionLog += '%' + EVN.mUser.mUsername;
                        EVN.mUser.AppendAuditLog('Registrants', ActionLog, EVN.mUser.AppendAuditLog('Master', ActionLog, function () {
                            //formatDate(Timestamp);
                            //console.log(CurrentDate);
                            firebase.database().ref().child('APPDATA').child('Registrants').child(ID).update({
                                Status: "NOT_ATTENDED",
                                Log: Update
                            });
    
                            Materialize.toast(pID + " was successfully unbanned", 4000, "toast-fix");
                            console.log("Successfully unbanned " + pID);
                            location.reload();
                        }));
                    });
                });
            });
            $('#warning-modal-title').html('Unban Warning');
            $("#warning-modal-span").html('unban ' + pID);
            $('#warning-modal-confirm').html('UNBAN');
            $("#warning-modal").modal('open');
        }
    }
}

EVN_Registrants.prototype.CheckIn = function (pID) {
    var EVN = this;
    if (EVN.mUser.HasPermission('CheckInRegistrants') || EVN.mUser.HasPermission('All')) {
        var ID = pID;
        var Timestamp = SK.GetESTTimestamp();

        var OldLog = "";
        var Update = "";
        var ActionLog = "";
        firebase.database().ref().child('APPDATA').child('Registrants').child(pID).once('value').then(function (snap) {
            if (typeof snap.val().Log != 'undefined') {
                OldLog = snap.val().Log;
                Update = OldLog + " CHECKIN%" + Timestamp + "%" + EVN.mUser.mUsername;
            } else {
                Update = "CHECKIN%" + Timestamp + "%" + EVN.mUser.mUsername;
            }

            ActionLog = "CHECKIN%" + pID + "%" + Timestamp;
            EVN.mUser.AppendActionLog(ActionLog);
            ActionLog += '%' + EVN.mUser.mUsername;
            EVN.mUser.AppendAuditLog('Registrants', ActionLog);
            EVN.mUser.AppendAuditLog('Master', ActionLog);

            //formatDate(Timestamp);
            //console.log(CurrentDate);
            firebase.database().ref().child('APPDATA').child('Registrants').child(ID).update({
                Status: "CHECKED_IN",
                Log: Update
            });
        });


        // Materialize.toast(message, displayLength, className, completeCallback);
        Materialize.toast(ID + " was successfully checked in", 4000, "toast-fix");
    }
}

EVN_Registrants.prototype.CheckOut = function (pID) {
    var EVN = this;
    if (EVN.mUser.HasPermission('CheckOutRegistrants') || EVN.mUser.HasPermission('All')) {
        if (EVN.mStatus[pID].Status == "CHECKED_IN") {
            $("#warning-modal-confirm").unbind("click");
            $("#warning-modal-confirm").one("click", function () {
                var ID = pID;
                var Timestamp = SK.GetESTTimestamp();

                var OldLog = "";
                var Update = "";
                var ActionLog = "";
                firebase.database().ref().child('APPDATA').child('Registrants').child(ID).once('value').then(function (snap) {
                    if (typeof snap.val().Log != 'undefined') {
                        OldLog = snap.val().Log;
                        Update = OldLog + " CHECKOUT%" + Timestamp + "%" + EVN.mUser.mUsername;
                    } else {
                        Update = "CHECKOUT%" + Timestamp + "%" + EVN.mUser.mUsername;
                    }

                    ActionLog = "CHECKOUT%" + pID + "%" + Timestamp;
                    EVN.mUser.AppendActionLog(ActionLog);
                    ActionLog += '%' + EVN.mUser.mUsername;
                    EVN.mUser.AppendAuditLog('Registrants', ActionLog);
                    EVN.mUser.AppendAuditLog('Master', ActionLog);

                    //formatDate(Timestamp);
                    //console.log(CurrentDate);
                    firebase.database().ref().child('APPDATA').child('Registrants').child(ID).update({
                        Status: "CHECKED_OUT",
                        Log: Update
                    });
                });
                EVN.mTotalAttended--;
                $('.totals-checked-in').each(function () {
                    $(this).html('Checked In: ' + EVN.mTotalAttended);
                });
                Materialize.toast(pID + " was successfully checked out", 4000, "toast-fix");
                console.log("Successfully checked out " + pID);
            });
            $('#warning-modal-title').html('Check Out Warning');
            $("#warning-modal-span").html('check out ' + pID);
            $('#warning-modal-confirm').html('CHECK OUT');
            $("#warning-modal").modal('open');
        }
    }
}

EVN_Registrants.prototype.CreateFirebaseRegistrantEntry = function (pID) {
    var EVN = this;
    var ID = pID;
    $("#status-" + ID).click(function (event) {
        ID = event.target.id;
        ID = ID.split('-');
        ID = ID.pop();
        EVN.CheckIn(ID);
        console.log("Successfully checked in " + ID);
    });
    $("#more-check-out-" + ID).click(function (event) {
        ID = event.target.id;
        ID = ID.split('-');
        ID = ID.pop();
        EVN.CheckOut(ID);
    });
    firebase.database().ref().child('APPDATA').child('Registrants').child(pID).set({
        Status: "NOT_ATTENDED",
    });
    EVN.mStatus[ID] = {
        "Status": "NOT_ATTENDED"
    };
    if (EVN.mData[EVN.mMyMLHReference[pID]].level_of_study != 'High School / Secondary School') {
        EVN.SetFlags(ID, 'INELIGIBLE');
    }
}

EVN_Registrants.prototype.GenerateBarChart = function (pCTX, pLabels, pData) {
    var NewChart = new Chart(pCTX, {
        type: 'bar',
        data: {
            labels: pLabels,
            datasets: [{
                label: '',
                data: pData,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

EVN_Registrants.prototype.GenerateLineChart = function (pCTX, pLabels, pData) {
    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: pData,
        options: options
    });
}

EVN_Registrants.prototype.LoadCharts = function () {
    var DateJoinedLabels = [];
    var DateJoinedData = [];
    var SizesLabels = [];
    var SizesData = [];
    var DietaryLabels = [];
    var DietaryData = [];
    var SchoolsLabels = [];
    var SchoolsData = [];

    // FINISH THIS
    DateJoinedLabels = Object.keys(this.mDateRegistered);
    for (var i = 0; i < DateJoinedLabels.length; i++) {
        this.mDateRegistered = this.mDateRegistered.updated_at[DateJoinedLabels[i]].split('-');
    }
    //this.mDateRegistered.sort();
    console.log(this.mDateRegistered);

    SizesLabels = Object.keys(this.mSizes);
    for (var i = 0; i < SizesLabels.length; i++) {
        SizesData[i] = this.mSizes[SizesLabels[i]];
    }
    var SizesCTX = document.getElementById("shirt-sizes-chart-canvas").getContext('2d');
    this.GenerateBarChart(SizesCTX, SizesLabels, SizesData);

    DietaryLabels = Object.keys(this.mDietary);
    DietaryLabels.shift();
    for (var i = 0; i < DietaryLabels.length; i++) {
        DietaryData[i] = this.mDietary[DietaryLabels[i]];
    }
    var DietaryCTX = document.getElementById("dietary-restrictions-chart-canvas").getContext('2d');
    this.GenerateBarChart(DietaryCTX, DietaryLabels, DietaryData);

    SchoolsLabels = Object.keys(this.mSchools);
    for (var i = 0; i < SchoolsLabels.length; i++) {
        SchoolsData[i] = this.mSchools[SchoolsLabels[i]];
    }
    var SchoolsCTX = document.getElementById("schools-chart-canvas").getContext('2d');
    this.GenerateBarChart(SchoolsCTX, SchoolsLabels, SchoolsData);
}

EVN_Registrants.prototype.HandleData = function (pData) {
    var RegistrantsTable = $("#registrants-table-body");
    var BannedTable = $('#banned-table-body');
    var TotalBanned = $('#total-banned');
    var SizesTable = $("#shirt-sizes-table-body");
    var DietaryTable = $("#dietary-restrictions-table-body");
    var SchoolsTable = $("#schools-table-body");

    var TotalsRegistrants = $(".totals-registrants");
    var TotalsCheckedIn = $(".totals-checked-in");

    // Process Data
    var RegistrantsTableContent = [];
    var BannedTableContent = [];
    var SizesTableContent = [];
    var DietaryTableContent = [];
    var SchoolsTableContent = [];
    var Data = pData[0];
    var Status = "";
    var More = "";
    var Entry = "";
    var Keys = [];

    this.mTotalRegistrants = 0;
    this.mTotalBanned = 0;

    var ID = "";

    var EVN = this;

    var IsEligible = true;

    // Status
    firebase.database().ref().child('APPDATA').child('Registrants').once('value').then(function (snap) {
        var IsCreateNewFirebaseEntry = [];

        for (var i = 0; i < pData.length; i++) {
            IsEligible = true;
            Data = pData[i];
            Data.updated_at = Data.updated_at.split('T');
            Data.updated_at.pop();
            Data.updated_at = Data.updated_at[0];
            Data.updated_at = SK.YYYYMMDDToMMDDYYYY(Data.updated_at);
            Data.date_of_birth = SK.YYYYMMDDToMMDDYYYY(Data.date_of_birth);
            Data.shirt_size = Data.shirt_size.replace(/\s/g, "");
            var ComparisonSchoolName = Data.school.name.toUpperCase().replace(/\s/g, "");

            ID = "ID_" + Data.id;
            // Check for ineligiblity
            if (EVN.mData[i].level_of_study != 'High School / Secondary School') {
                if (typeof snap.val()[ID] != 'undefined') {
                    if (snap.val()[ID].Flags != 'ELIGIBLE') {
                        IsEligible = false;
                        EVN.SetFlags(ID, 'INELIGIBLE');
                    }
                }
                else {
                    IsEligible = false;
                    EVN.SetFlags(ID, 'INELIGIBLE');
                }
            }

            EVN.mMyMLHReference[ID] = i;
            //console.log(ID);
            //console.log(snap.val()[ID]);
            //console.log(snap.val().ID_16893);
            if (typeof snap.val()[ID] != 'undefined') {
                // Check if a person is banned or not
                if (snap.val()[ID].Status == "BANNED") {
                    Status = "<a id=\"status-" + ID + "\" class=\"btn-flat banned disabled\">BANNED</a>";
                    EVN.mTotalBanned++;
                } else {
                    if (snap.val()[ID].Status == "CHECKED_IN") {
                        Status = "<a id=\"status-" + ID + "\" class=\"btn-flat checked-in disabled\">CHECKED IN</a>";
                        EVN.mTotalAttended++;
                    } else {
                        Status = "<a id=\"status-" + ID + "\" class=\"waves-effect waves-teal btn-flat check-in\">CHECK IN</a>";
                    }
                }
            } else {
                Status = "<a id=\"status-" + ID + "\" class=\"waves-effect waves-teal btn-flat check-in\">CHECK IN</a>";
                IsCreateNewFirebaseEntry.push(ID);
            }

            // Dropdown
            if (typeof snap.val()[ID] != 'undefined' && snap.val()[ID].Status == "BANNED") {
                if (EVN.mUser.HasPermission('UnbanRegistrants') || EVN.mUser.HasPermission('All')) {
                    More = "<a class=\"waves-effect waves-grey btn-flat more-btn dropdown-button\" href=\'#\' data-activates=\"more-" + ID + "\"><i class=\"material-icons\">more_vert</i></a><ul id=\"more-" + ID + "\" class=\'dropdown-content\'><li><a id=\"more-profile-" + ID + "\" class=\"more-profile-btn\" href=\"#!\">Profile</a></li><li class=\"divider\"></li><li><a id=\"more-unban-" + ID + "\" class=\"more-unban-btn\" href=\"#!\">Unban</a></li></ul>";
                } else {
                    More = "<a class=\"waves-effect waves-grey btn-flat more-btn dropdown-button\" href=\'#\' data-activates=\"more-" + ID + "\"><i class=\"material-icons\">more_vert</i></a><ul id=\"more-" + ID + "\" class=\'dropdown-content\'><li><a id=\"more-profile-" + ID + "\" class=\"more-profile-btn\" href=\"#!\">Profile</a></li><li class=\"divider\"></li></ul>";
                }
            } else {
                More = "<a class=\"waves-effect waves-grey btn-flat more-btn dropdown-button\" href=\'#\' data-activates=\"more-" + ID + "\"><i class=\"material-icons\">more_vert</i></a><ul id=\"more-" + ID + "\" class=\'dropdown-content\'><li><a id=\"more-profile-" + ID + "\" class=\"more-profile-btn\" href=\"#!\">Profile</a></li><li class=\"divider\"></li><li><a id=\"more-check-out-" + ID + "\" class=\"more-check-out-btn\" href=\"#!\">Check Out</a></li></ul>";
            }

            if (IsEligible) {
                Entry = "<tr id=\"registrant_" + ID + "\"><td>" + Data.id + "</td><td>" + Data.last_name + "</td><td>" + Data.first_name + "</td><td class='hide-on-med-and-down'>" + Data.email + "</td><td class='hide-on-med-and-down'>" + Data.phone_number + "</td><td class='hide-on-med-and-down'>" + Data.shirt_size + "</td><td class='hide-on-med-and-down'>" + Data.dietary_restrictions + "</td><td class='hide-on-med-and-down'>" + Data.updated_at + "</td><td class=\"status-column center\">" + Status + "</td><td>" + More + "</td></tr>";
            } else {
                Entry = "<tr id=\"registrant_" + ID + "\" class='redflag'><td>" + Data.id + "</td><td>" + Data.last_name + "</td><td>" + Data.first_name + "</td><td class='hide-on-med-and-down'>" + Data.email + "</td><td class='hide-on-med-and-down'>" + Data.phone_number + "</td><td class='hide-on-med-and-down'>" + Data.shirt_size + "</td><td class='hide-on-med-and-down'>" + Data.dietary_restrictions + "</td><td class='hide-on-med-and-down'>" + Data.updated_at + "</td><td class=\"status-column center\">" + Status + "</td><td>" + More + "</td></tr>";
            }
            if (typeof snap.val()[ID] != 'undefined' && snap.val()[ID].Status == "BANNED") {
                BannedTableContent.push(Entry);
            } else {
                RegistrantsTableContent.push(Entry);

                // Count Totals
                if (!EVN.mDateRegistered[Data.updated_at]) {
                    EVN.mDateRegistered[Data.updated_at] = 0;
                }
                if (!EVN.mSizes[Data.shirt_size]) {
                    EVN.mSizes[Data.shirt_size] = 0;
                }
                if (!EVN.mDietary[Data.dietary_restrictions]) {
                    EVN.mDietary[Data.dietary_restrictions] = 0;
                }
                if (!EVN.mSchools[Data.school.name]) {
                    EVN.mSchools[Data.school.name] = 0;
                }
                EVN.mDateRegistered++;
                EVN.mSizes[Data.shirt_size]++;
                EVN.mDietary[Data.dietary_restrictions]++;
                EVN.mSchools[Data.school.name]++;
                EVN.mTotalRegistrants++;
                //console.log(Entry);
            }
        }

        Keys = Object.keys(EVN.mSizes);
        for (var i = 0; i < Keys.length; i++) {
            Entry = "<tr><td>" + Keys[i] + "</td><td>" + EVN.mSizes[Keys[i]] + "</td></tr>";
            SizesTableContent.push(Entry);
        }

        Keys.length = 0;
        Keys = Object.keys(EVN.mDietary);
        for (var i = 0; i < Keys.length; i++) {
            Entry = "<tr><td>" + Keys[i] + "</td><td>" + EVN.mDietary[Keys[i]] + "</td></tr>";
            DietaryTableContent.push(Entry);
        }

        Keys.length = 0;
        Keys = Object.keys(EVN.mSchools);
        for (var i = 0; i < Keys.length; i++) {
            Entry = "<tr><td>" + Keys[i] + "</td><td>" + EVN.mSchools[Keys[i]] + "</td></tr>";
            SchoolsTableContent.push(Entry);
        }


        // Push Content to HTML
        RegistrantsTable.html(RegistrantsTableContent);
        BannedTable.html(BannedTableContent);
        TotalBanned.html(TotalBanned.html() + EVN.mTotalBanned);
        SizesTable.html(SizesTableContent);
        DietaryTable.html(DietaryTableContent);
        SchoolsTable.html(SchoolsTableContent);

        if (EVN.mTotalAttended == null) {
            EVN.mTotalAttended = 0;
        }
        TotalsRegistrants.each(function () {
            $(this).html($(this).html() + EVN.mTotalRegistrants);
        });
        TotalsCheckedIn.each(function () {
            $(this).html($(this).html() + EVN.mTotalAttended);
        });

        EVN.LoadCharts();

        EVN.mStatus = snap.val();
        for (var i = 0; i < IsCreateNewFirebaseEntry.length; i++) {
            EVN.CreateFirebaseRegistrantEntry(IsCreateNewFirebaseEntry[i]);
            if (typeof EVN.mStatus['ID_' + IsCreateNewFirebaseEntry[i].id] == 'undefined') {
                EVN.mStatus['ID_' + IsCreateNewFirebaseEntry[i].id] = { 'Status': 'NOT_ATTENDED' };
            }
        }

        // jQuery Plugin Initialization

        var IDs = Object.keys(EVN.mStatus);

        for (var i = 0; i < IDs.length; i++) {
            ID = IDs[i];

            if (EVN.mStatus[ID].Status == "NOT_ATTENDED" || EVN.mStatus[ID].Status == "CHECKED_OUT") {
                $("#status-" + ID).click(function (event) {
                    ID = event.target.id;
                    ID = ID.split('-');
                    ID = ID.pop();
                    EVN.CheckIn(ID);
                    console.log("Successfully checked in " + ID);
                });
            }

            $("#more-check-out-" + ID).click(function (event) {
                ID = event.target.id;
                ID = ID.split('-');
                ID = ID.pop();
                EVN.CheckOut(ID);
            });

            $('#more-profile-' + ID).click(function (event) {
                ID = event.target.id;
                ID = ID.split('-');
                ID = ID.pop();
                EVN.ViewProfile(ID);
            });

            $("#more-unban-" + ID).click(function (event) {
                ID = event.target.id;
                ID = ID.split('-');
                ID = ID.pop();
                EVN.Unban(ID);
            });
        }

        $('.dropdown-button').dropdown({
            inDuration: 300,
            outDuration: 225,
            constrainWidth: false, // Does not change width of dropdown to that of the activator
            hover: false, // Activate on hover
            gutter: 0, // Spacing from edge
            belowOrigin: false, // Displays dropdown below the button
            alignment: 'right', // Displays dropdown with edge aligned to the left of button
            stopPropagation: false // Stops event propagation
        });

        $('#registrants-table').tablesorter();
        $('#banned-table').tablesorter();
    });
}

EVN_Registrants.prototype.LoadLogsTab = function (pCallback) {
    var EVN = this;

    firebase.database().ref().child('APPDATA').child('AuditLogs').once('value').then(function (snap) {
    var Data = snap.val().Registrants.Log;
    var RegistrantsLog = "";
    var RegistrantsLogData = "";

    if (typeof Data != 'undefined') {
        RegistrantsLogData = Data;
        RegistrantsLogData = RegistrantsLogData.split(' ');
        var TotalEntries = Object.keys(RegistrantsLogData).length;
        var RegistrantsLogEntry = "";
        for (var i = 0; i < TotalEntries; i++) {
            RegistrantsLogEntry = RegistrantsLogData[i];
            RegistrantsLogEntry = RegistrantsLogEntry.split('%');
            RegistrantsLog += "<tr><td>" + RegistrantsLogEntry[0] + "</td><td>" + RegistrantsLogEntry[1] + "</td><td>" + RegistrantsLogEntry[2] + "</td><td>" + RegistrantsLogEntry[3] + "</td></tr>";
        }
    }
    $('#check-in-out-logs-table-body').html(RegistrantsLog);
    typeof pCallback === 'function' && pCallback();
    });
}

EVN_Registrants.prototype.LoadContent = function (pAPP_ID, pSECRET) {
    var EVN = this;
    var Hash = window.location.hash;
    Hash = Hash.toLowerCase();

    if (!EVN.mUser.HasPermission('ClearRegistrantLog') && !EVN.mUser.HasPermission('All')) {
        $('#clear-log-btn').remove();
    }

    if (EVN.mUser.HasPermission('ViewStaff') || EVN.mUser.HasPermission('All')) {
        $('.nav-dropdown-staff').show();
    } else {
        $(".nav-dropdown-staff").remove();
    }

    $.get("https://my.mlh.io/api/v2/users?client_id=" + pAPP_ID + "&secret=" + pSECRET + "&page=1", function (pData) {
        EVN.mData = pData.data;

        EVN.HandleData(EVN.mData);

        EVN.LoadLogsTab($('.logs-tab').removeClass('disabled'));
        if (EVN.mUser.HasPermission('ViewStatistics') || EVN.mUser.HasPermission('All')) {
            // Stats panel
            $('.statistics-tab').removeClass('disabled');
        } else {
            $('#statistics').remove();
        }

        if (EVN.mUser.HasPermission('CreateRegistrantRaffle') || EVN.mUser.HasPermission('DrawRegistrantRaffle') || EVN.mUser.HasPermission('All')) {
            // Load tools tab
            $('.tools-tab').removeClass('disabled');
        } else {
            $('#tools').remove();
        }

        $("#loading-bar-wrapper").hide();
        if (Hash == "#statistics") {
            $("#statistics").show();
        } else {
            $("#registrants").show();
        }

        // Database Realtime Update
        const dbRefObject = firebase.database().ref().child('APPDATA').child('Registrants');
        dbRefObject.on('value', snap => {
            var ID = "";
            //console.log(snap.val()[ID].Status);
            var IDs = Object.keys(EVN.mStatus);
            var ButtonID = $("#status-" + ID);

            for (var i = 0; i < IDs.length; i++) {
                ID = IDs[i];
                ButtonID = $("#status-" + ID);
                if (typeof snap.val()[ID] != 'undefined') {
                    if (EVN.mStatus[ID].Status != snap.val()[ID].Status) {
                        if (snap.val()[ID].Status == "CHECKED_IN") {
                            ButtonID.addClass('checked-in disabled');
                            ButtonID.removeClass('waves-effect waves-teal check-in');
                            ButtonID.html("CHECKED IN");
                            EVN.mStatus[ID].Status = snap.val()[ID].Status;
                            ButtonID.unbind("click");

                            EVN.mTotalAttended++;
                            $('.totals-checked-in').each(function () {
                                $(this).html('Checked In: ' + EVN.mTotalAttended);
                            });
                            //console.log(ID + " Successfully Checked In");
                        }
                        if (snap.val()[ID].Status == "CHECKED_OUT" || snap.val()[ID].Status == "NOT_ATTENDED") {
                            ButtonID.addClass('waves-effect waves-teal check-in');
                            ButtonID.removeClass('checked-in disabled');
                            ButtonID.html("CHECK IN");
                            EVN.mStatus[ID].Status = snap.val()[ID].Status;
                            ButtonID.click(function () {
                                ID = event.target.id;
                                ID = ID.split('-');
                                ID = ID.pop();
                                EVN.CheckIn(ID);
                                console.log("Successfully checked in " + ID);
                            });
                        }
                        /*if (snap.val()[ID].Status == 'BANNED') {
                            ButtonID.addclass('banned disabled');
                            ButtonID.removeClass('check-in checked-in waves-effect waves-teal');
                            ButtonID.html('BANNED');
                            if (EVN.mStatus[ID].Status == 'CHECKED_IN') {
                                EVN.mTotalAttended--;
                                $('.totals-checked-in').each(function () {
                                    $(this).html('Checked In: ' + EVN.mTotalAttended);
                                });
                            }
                            EVN.mStatus[ID].Status = snap.val()[ID].Status;
                            ButtonID.unbind("click");
                            EVN.mTotalRegistrants++;
                            $('.totals-registrants').each(function () {
                                $(this).html('Registrants: ' + EVN.mTotalAttended);
                            });
                            EVN.mTotalBanned++;

                            
                        }*/
                    }
                }
            }
        });
    });
}

EVN_Registrants.prototype.Load = function (pAPP_ID, pSECRET) {
    $("#registrants").hide();
    $("#statistics").hide();
    $("#tools").hide();
    $("#loading-bar-wrapper").show();
    $('.nav-dropdown-staff').hide();

    var EVN = this;

    // Check user account type
    var EVN = this;
    EVN.mUser.Load(function () {
        if (EVN.mUser.mStatus == 'CHECKED_IN' || EVN.mUser.HasPermission('CheckInAccessOverride') || EVN.mUser.HasPermission('All')) {
            if (EVN.mUser.HasPermission('ViewRegistrants') || EVN.mUser.HasPermission('All')) {
                EVN.LoadContent(pAPP_ID, pSECRET);
            }
        } else {
            window.location = "settings.html";
        }
    });
}