/*
EVENTMAN (EVN)
-COPYRIGHT NOTICE-
Eventman Copyright (c) 2017 Sean Kee - All Rights Reserved.

Unauthorized copying or reproduction of this file is strictly prohibited.

Visit https://mrskee.github.io/ for more information.
Sean Kee <skee66499@gmail.com>
*/

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

EVN_Registrants.prototype.FormatESTTimestamp = function (pTimestamp) {
    var Timestamp = pTimestamp;
    Timestamp = Timestamp.split(' ');
    //console.log(Timestamp);
    Timestamp.push('EST');
    var DatePart = [Timestamp[0], Timestamp[1], Timestamp[2], Timestamp[3]];
    DatePart = DatePart.join('-');
    var TimePart = [Timestamp[4], Timestamp[9]];
    TimePart = TimePart.join('-');
    Timestamp = DatePart + '@' + TimePart;
    console.log(Timestamp);
    return Timestamp;
}

EVN_Registrants.prototype.CreateRaffle = function (pRaffleName) {

}

EVN_Registrants.prototype.DrawRaffle = function (pRaffleName) {
    var rand = myArray[Math.floor(Math.random() * myArray.length)];
}

EVN_Registrants.prototype.SetFlags = function (pID, pFlags) {
    firebase.database().ref().child('APPDATA').child('Registrants').child(pID).update({
        Flags: pFlags
    });
}

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
        firebase.database().ref().child('APPDATA').child('Registrants').child(pID).set({
            Status: "NOT_ATTENDED",
        });
        $('#profile-check-in-out-log-table-body').html('');
        $('#profile-status').html('NOT_ATTENDED');
        EVN.mTotalAttended--;
        $("#totals-checked-in").html("Checked In: " + EVN.mTotalAttended);
        Materialize.toast("Successfully cleared log for " + pID, 4000, "toast-fix");
        console.log("Successfully cleared log for " + pID);
        $('#clear-log-btn').hide();
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

            // Ban/Unban button

            if (snap.val().Status == "BANNED" && (EVN.mUser.HasPermission('UnbanRegistrants') || EVN.mUser.HasPermission('All'))) {
                $('#ban-btn').hide();
                $('#unban-btn').show();
                $('#unban-btn').unbind('click');
                $('#unban-btn').click(function () {
                    EVN.Unban(pID);
                })
            }
            else {
                if (EVN.mUser.HasPermission('BanRegistrants') || EVN.mUser.HasPermission('All')) {
                    $('#unban-btn').hide();
                    $('#ban-btn').show();
                    $('#ban-btn').unbind('click');
                    $('#ban-btn').click(function () {
                        EVN.Ban(pID);
                    });
                }
                else {
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
                }
                else {
                    $('#clear-log-btn').unbind('click');
                    $('#clear-log-btn').hide();
                }
            }
            else {
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
    if (EVN.mStatus[pID].Status != "BANNED") {
        $("#warning-modal-confirm").unbind("click");
        $("#warning-modal-confirm").one("click", function () {
            var ID = pID;
            var Timestamp = new Date();
            Timestamp = Timestamp.toString();
            Timestamp = EVN.FormatESTTimestamp(Timestamp);

            var OldLog = "";
            var Update = "";
            firebase.database().ref().child('APPDATA').child('Registrants').child(ID).once('value').then(function (snap) {
                if (typeof snap.val().Log != 'undefined') {
                    OldLog = snap.val().Log;
                    Update = OldLog + " BANNED%" + Timestamp + "%" + EVN.mUser.mUsername;
                } else {
                    Update = "BANNED%" + Timestamp + "%" + EVN.mUser.mUsername;
                }

                //formatDate(Timestamp);
                //console.log(CurrentDate);
                firebase.database().ref().child('APPDATA').child('Registrants').child(ID).update({
                    Status: "BANNED",
                    Log: Update
                });
            });
            EVN.mTotalAttended--;
            $("#totals-checked-in").html("Checked In: " + EVN.mTotalAttended);
            Materialize.toast(pID + " was successfully banned", 4000, "toast-fix");
            console.log("Successfully checked out " + pID);
            location.reload();
        });
        $('#warning-modal-title').html('Ban Warning');
        $("#warning-modal-span").html('ban ' + pID);
        $('#warning-modal-confirm').html('BAN');
        $("#warning-modal").modal('open');
    }
}

EVN_Registrants.prototype.Unban = function (pID) {
    var EVN = this;
    if (EVN.mStatus[pID].Status == "BANNED") {
        $("#warning-modal-confirm").unbind("click");
        $("#warning-modal-confirm").one("click", function () {
            var ID = pID;
            var Timestamp = new Date();
            Timestamp = Timestamp.toString();
            Timestamp = EVN.FormatESTTimestamp(Timestamp);

            var OldLog = "";
            var Update = "";
            firebase.database().ref().child('APPDATA').child('Registrants').child(ID).once('value').then(function (snap) {
                if (typeof snap.val().Log != 'undefined') {
                    OldLog = snap.val().Log;
                    Update = OldLog + " UNBANNNED%" + Timestamp + "%" + EVN.mUser.mUsername;
                } else {
                    Update = "UNBANNED%" + Timestamp + "%" + EVN.mUser.mUsername;
                }

                //formatDate(Timestamp);
                //console.log(CurrentDate);
                firebase.database().ref().child('APPDATA').child('Registrants').child(ID).update({
                    Status: "NOT_ATTENDED",
                    Log: Update
                });
            });
            EVN.mTotalAttended--;
            $("#totals-checked-in").html("Checked In: " + EVN.mTotalAttended);
            Materialize.toast(pID + " was successfully unbanned", 4000, "toast-fix");
            console.log("Successfully checked out " + pID);
            location.reload();
        });
        $('#warning-modal-title').html('Unban Warning');
        $("#warning-modal-span").html('unban ' + pID);
        $('#warning-modal-confirm').html('UNBAN');
        $("#warning-modal").modal('open');
    }
}

EVN_Registrants.prototype.CheckIn = function (pID) {
    var EVN = this;
    var ID = pID;
    var Timestamp = new Date();
    Timestamp = Timestamp.toString();
    Timestamp = this.FormatESTTimestamp(Timestamp);

    var OldLog = "";
    var Update = "";
    firebase.database().ref().child('APPDATA').child('Registrants').child(pID).once('value').then(function (snap) {
        if (typeof snap.val().Log != 'undefined') {
            OldLog = snap.val().Log;
            Update = OldLog + " CHECKIN%" + Timestamp + "%" + EVN.mUser.mUsername;
        } else {
            Update = "CHECKIN%" + Timestamp + "%" + EVN.mUser.mUsername;
        }

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

EVN_Registrants.prototype.CheckOut = function (pID) {
    var EVN = this;
    if (EVN.mStatus[pID].Status == "CHECKED_IN") {
        $("#warning-modal-confirm").unbind("click");
        $("#warning-modal-confirm").one("click", function () {
            var ID = pID;
            var Timestamp = new Date();
            Timestamp = Timestamp.toString();
            Timestamp = EVN.FormatESTTimestamp(Timestamp);

            var OldLog = "";
            var Update = "";
            firebase.database().ref().child('APPDATA').child('Registrants').child(ID).once('value').then(function (snap) {
                if (typeof snap.val().Log != 'undefined') {
                    OldLog = snap.val().Log;
                    Update = OldLog + " CHECKOUT%" + Timestamp + "%" + EVN.mUser.mUsername;
                } else {
                    Update = "CHECKOUT%" + Timestamp + "%" + EVN.mUser.mUsername;
                }

                //formatDate(Timestamp);
                //console.log(CurrentDate);
                firebase.database().ref().child('APPDATA').child('Registrants').child(ID).update({
                    Status: "CHECKED_OUT",
                    Log: Update
                });
            });
            EVN.mTotalAttended--;
            $("#totals-checked-in").html("Checked In: " + EVN.mTotalAttended);
            Materialize.toast(pID + " was successfully checked out", 4000, "toast-fix");
            console.log("Successfully checked out " + pID);
        });
        $('#warning-modal-title').html('Check Out Warning');
        $("#warning-modal-span").html('check out ' + pID);
        $('#warning-modal-confirm').html('CHECK OUT');
        $("#warning-modal").modal('open');
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
    var TotalRegistrants = $("#total-registrants");
    var BannedTable = $('#banned-table-body');
    var TotalBanned = $('#total-banned');
    var SizesTable = $("#shirt-sizes-table-body");
    var DietaryTable = $("#dietary-restrictions-table-body");
    var SchoolsTable = $("#schools-table-body");

    var TotalsRegistrants = $("#totals-registrants");
    var TotalsCheckedIn = $("#totals-checked-in");

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
            Data.shirt_size = Data.shirt_size.replace(/\s/g, "");
            Data.school.name = Data.school.name.toUpperCase().replace(/\s/g, "");

            ID = "ID_" + Data.id;
            // Check for ineligiblity
            if (EVN.mData[i].level_of_study != 'High School / Secondary School') {
                IsEligible = false;
                EVN.SetFlags(ID, 'INELIGIBLE');
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
                }
                else {
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
                More = "<a class=\"waves-effect waves-grey btn-flat more-btn dropdown-button\" href=\'#\' data-activates=\"more-" + ID + "\"><i class=\"material-icons\">more_vert</i></a><ul id=\"more-" + ID + "\" class=\'dropdown-content\'><li><a id=\"more-profile-" + ID + "\" class=\"more-profile-btn\" href=\"#!\">Profile</a></li><li class=\"divider\"></li><li><a id=\"more-unban-" + ID + "\" class=\"more-unban-btn\" href=\"#!\">Unban</a></li></ul>";
            } else {
                More = "<a class=\"waves-effect waves-grey btn-flat more-btn dropdown-button\" href=\'#\' data-activates=\"more-" + ID + "\"><i class=\"material-icons\">more_vert</i></a><ul id=\"more-" + ID + "\" class=\'dropdown-content\'><li><a id=\"more-profile-" + ID + "\" class=\"more-profile-btn\" href=\"#!\">Profile</a></li><li class=\"divider\"></li><li><a id=\"more-check-out-" + ID + "\" class=\"more-check-out-btn\" href=\"#!\">Check Out</a></li></ul>";
            }

            if (IsEligible) {
                Entry = "<tr id=\"registrant_" + ID + "\"><td>" + Data.id + "</td><td>" + Data.last_name + "</td><td>" + Data.first_name + "</td><td>" + Data.email + "</td><td>" + Data.phone_number + "</td><td>" + Data.shirt_size + "</td><td>" + Data.dietary_restrictions + "</td><td>" + Data.updated_at + "</td><td class=\"status-column center\">" + Status + "</td><td>" + More + "</td></tr>";
            }
            else {
                Entry = "<tr id=\"registrant_" + ID + "\" class='redflag'><td>" + Data.id + "</td><td>" + Data.last_name + "</td><td>" + Data.first_name + "</td><td>" + Data.email + "</td><td>" + Data.phone_number + "</td><td>" + Data.shirt_size + "</td><td>" + Data.dietary_restrictions + "</td><td>" + Data.updated_at + "</td><td class=\"status-column center\">" + Status + "</td><td>" + More + "</td></tr>";
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
        TotalRegistrants.html(TotalRegistrants.html() + EVN.mTotalRegistrants);
        BannedTable.html(BannedTableContent);
        TotalBanned.html(TotalBanned.html() + EVN.mTotalBanned);
        SizesTable.html(SizesTableContent);
        DietaryTable.html(DietaryTableContent);
        SchoolsTable.html(SchoolsTableContent);

        if (EVN.mTotalAttended == null) {
            EVN.mTotalAttended = 0;
        }
        TotalsRegistrants.html(TotalsRegistrants.html() + EVN.mTotalRegistrants);
        TotalsCheckedIn.html(TotalsCheckedIn.html() + EVN.mTotalAttended);

        EVN.LoadCharts();

        EVN.mStatus = snap.val();

        var IDs = Object.keys(EVN.mStatus);

        for (var i = 0; i < IDs.length; i++) {
            ID = IDs[i];

            if (snap.val()[ID].Status == "NOT_ATTENDED" || snap.val()[ID].Status == "CHECKED_OUT") {
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

        // jQuery Plugin Initialization
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

        for (var i = 0; i < IsCreateNewFirebaseEntry.length; i++) {
            EVN.CreateFirebaseRegistrantEntry(IsCreateNewFirebaseEntry[i]);
        }
    });
}

EVN_Registrants.prototype.LoadContent = function (pAPP_ID, pSECRET) {
    var EVN = this;
    var Hash = window.location.hash;
    Hash = Hash.toLowerCase();

    if (!EVN.mUser.HasPermission('ClearRegistrantLog') && !EVN.mUser.HasPermission('All')) {
        $('#clear-log-btn').remove();
    }

    if (EVN.mUser.HasPermission('ManageUsers') || EVN.mUser.HasPermission('All')) {
        // View Staff panel
    } else {
        $(".nav-dropdown-staff").remove();
    }

    if (EVN.mUser.HasPermission('ViewRegistrants') || EVN.mUser.HasPermission('All')) {
        $.get("https://my.mlh.io/api/v2/users?client_id=" + pAPP_ID + "&secret=" + pSECRET + "&page=1", function (pData) {
            EVN.mData = pData.data;

            if (EVN.mUser.HasPermission('CheckInOutRegistrants') || EVN.mUser.HasPermission('All')) {
                EVN.HandleData(EVN.mData);
            }

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
                                $("#totals-checked-in").html("Checked In: " + EVN.mTotalAttended);
                                //console.log(ID + " Successfully Checked In");
                            }
                            if (snap.val()[ID].Status == "CHECKED_OUT" || snap.val()[ID].Status == "NOT_ATTENDED") {
                                ButtonID.addClass('waves-effect waves-teal check-in');
                                ButtonID.removeClass('checked-in disabled');
                                ButtonID.html("CHECK-IN");
                                EVN.mStatus[ID].Status = snap.val()[ID].Status;
                                ButtonID.click(function () {
                                    ID = event.target.id;
                                    ID = ID.split('-');
                                    ID = ID.pop();
                                    EVN.CheckIn(ID);
                                    console.log("Successfully checked in " + ID);
                                });
                            }
                        }
                    }
                }
            });
        });
    }
}

EVN_Registrants.prototype.Load = function (pAPP_ID, pSECRET) {
    $("#registrants").hide();
    $("#statistics").hide();
    $("#tools").hide();
    $("#loading-bar-wrapper").show();

    var EVN = this;

    // Check user account type
    var EVN = this;
    var User = firebase.auth().currentUser;
    EVN.Uid = User.uid;
    var Username = User.email;
    Username = Username.split('.');
    Username = Username.join('');
    EVN.mUser.Load(EVN.Uid, function () {
        EVN.LoadContent(pAPP_ID, pSECRET);
    });
}