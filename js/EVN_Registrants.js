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

    this.mTotalRegistrants = null;
    this.mTotalAttended = null;

    this.mUserType = "NULL";
    this.mUserPermissions = "NULL";
    this.mUid = "NULL";

    this.mUser = new EVN_User();
}

EVN_Registrants.prototype.FormatESTTimestamp = function (pTimestamp) {
    var Timestamp = pTimestamp;
    Timestamp = Timestamp.split(' ');
    //console.log(Timestamp);
    Timestamp.pop();
    Timestamp.pop();
    Timestamp.pop();
    Timestamp.pop();
    Timestamp.push('EST');
    Timestamp = Timestamp.join('-');
    return Timestamp;
}

EVN_Registrants.prototype.CreateRaffle = function (pRaffleName) {

}

EVN_Registrants.prototype.DrawRaffle = function (pRaffleName) {
    var rand = myArray[Math.floor(Math.random() * myArray.length)];
}

EVN_Registrants.prototype.CreateUser = function (pUid, pUsername, pType) {
    firebase.database().ref().child('APPDATA').child('Users').child(pUid).set({
        Uid: pUid,
        Username: pUsername,
        Type: pType
    });
    this.mUserType = pType;
}

EVN_Registrants.prototype.ClearRegistrantHistory = function (pID) {
    if (EVN.mUser.HasPermission('ManageRegistrants') || EVN.mUser.HasPermission('All')) {
        var ID = "ID_" + pID;
        firebase.database().ref().child('APPDATA').child('Registrants').child(ID).set({
            Status: false,
        });
        EVN.mTotalAttended--;
        $("#totals-checked-in").html("Checked In: " + EVN.mTotalAttended);
        console.log("Successfully Reset User " + ID);
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
        Update = OldLog + " CHECKIN@ " + Timestamp + "#" + EVN.mUser.mUsername;
        }
        else {
            Update = "CHECKIN@" + Timestamp;
        }

        //formatDate(Timestamp);
        //console.log(CurrentDate);
        firebase.database().ref().child('APPDATA').child('Registrants').child(ID).update({
            Status: true,
            Log: Update
        });
    });


    // Materialize.toast(message, displayLength, className, completeCallback);
    Materialize.toast(ID + " was successfully checked in", 4000, "toast-fix");
}

EVN_Registrants.prototype.CheckOut = function (pID) {
    var EVN = this;
    if (EVN.mStatus[pID].Status != false) {
        $("#check-out-warning-modal-confirm").unbind("click");
        $("#check-out-warning-modal-confirm").one("click", function () {
            var ID = pID;
            var Timestamp = new Date();
            Timestamp = Timestamp.toString();
            Timestamp = EVN.FormatESTTimestamp(Timestamp);

            var OldLog = "";
            var Update = "";
            firebase.database().ref().child('APPDATA').child('Registrants').child(ID).once('value').then(function (snap) {
                if (typeof snap.val().Log != 'undefined') {
                    OldLog = snap.val().Log;
                    Update = OldLog + " CHECKOUT@" + Timestamp + "#" + EVN.mUser.mUsername;
                }
                else {
                    Update = "CHECKOUT@" + Timestamp;
                }
        
                //formatDate(Timestamp);
                //console.log(CurrentDate);
                firebase.database().ref().child('APPDATA').child('Registrants').child(ID).update({
                    Status: false,
                    Log: Update
                });
            });
            Materialize.toast(pID + " was successfully checked out", 4000, "toast-fix");
            console.log("Successfully Checked Out " + pID);
        });
        $("#check-out-warning-modal-span").html(pID);
        $("#check-out-warning-modal").modal('open');
        EVN.mTotalAttended--;
        $("#totals-checked-in").html("Checked In: " + EVN.mTotalAttended);
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
        console.log(ID + " Successfully Checked In");
    });
    $("#more-check-out-" + ID).click(function (event) {
        ID = event.target.id;
        ID = ID.split('-');
        ID = ID.pop();
        EVN.CheckOut(ID);
    });
    firebase.database().ref().child('APPDATA').child('Registrants').child(pID).set({
        Status: false,
    });
    EVN.mStatus[ID] = {
        "Status": false
    };
}

EVN_Registrants.prototype.GenerateBarChart = function (pCTX, pLabels, pData) {
    var NewChart = new Chart(pCTX, {
        type: 'bar',
        data: {
            labels: pLabels,
            datasets: [{
                label: 'Size',
                data: pData,
                backgroundColor: [
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
        this.mDateRegistered = this.mDateRegistered.created_at[DateJoinedLabels[i]].split('-');
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

    SchoolsLabels = Object.keys(this.mDietary);
    SchoolsLabels.shift();
    for (var i = 0; i < SchoolsLabels.length; i++) {
        SchoolsData[i] = this.mDietary[SchoolsLabels[i]];
    }
    var SchoolsCTX = document.getElementById("schools-chart-canvas").getContext('2d');
    this.GenerateBarChart(SchoolsCTX, SchoolsLabels, SchoolsData);
}

EVN_Registrants.prototype.HandleData = function (pData) {
    var RegistrantsTable = $("#registrants-table-body");
    var TotalRegistrants = $("#total-registrants");
    var SizesTable = $("#shirt-sizes-table-body");
    var DietaryTable = $("#dietary-restrictions-table-body");
    var SchoolsTable = $("#schools-table-body");

    var TotalsRegistrants = $("#totals-registrants");
    var TotalsCheckedIn = $("#totals-checked-in");

    // Process Data
    var RegistrantsTableContent = [];
    var SizesTableContent = [];
    var DietaryTableContent = [];
    var SchoolsTableContent = [];
    var Data = pData[0];
    var Status = "";
    var More = "";
    var Entry = "";
    var Keys = [];

    this.mTotalRegistrants = 0;

    var ID = "";

    var EVN = this;

    // Status
    firebase.database().ref().child('APPDATA').child('Registrants').once('value').then(function (snap) {
        var IsCreateNewFirebaseEntry = [];

        for (var i = 0; i < pData.length; i++) {
            Data = pData[i];
            Data.created_at = Data.created_at.split('T');
            Data.created_at.pop();
            Data.shirt_size = Data.shirt_size.replace(/\s/g, "");
            Data.school.name = Data.school.name.toUpperCase().replace(/\s/g, "");

            ID = "ID_" + Data.id;
            //console.log(ID);
            //console.log(snap.val()[ID]);
            //console.log(snap.val().ID_16893);
            if (typeof snap.val()[ID] != 'undefined') {
                if (snap.val()[ID].Status == true) {
                    Status = "<a id=\"status-" + ID + "\" class=\"btn-flat checked-in disabled\">CHECKED IN</a>";
                    EVN.mTotalAttended++;
                } else {
                    Status = "<a id=\"status-" + ID + "\" class=\"waves-effect waves-teal btn-flat check-in\">CHECK IN</a>";
                }
            } else {
                Status = "<a id=\"status-" + ID + "\" class=\"waves-effect waves-teal btn-flat check-in\">CHECK IN</a>";
                IsCreateNewFirebaseEntry.push(ID);
            }

            // Dropdown
            if (EVN.mUser.mType == "ADMIN") {
                More = "<a class=\"waves-effect waves-grey btn-flat more-btn dropdown-button\" href=\'#\' data-activates=\"more-" + ID + "\"><i class=\"material-icons\">more_vert</i></a><ul id=\"more-" + ID + "\" class=\'dropdown-content\'><li><a id=\"more-profile-" + ID + "\" class=\"more-profile-btn\" href=\"#!\" onclick=\"Materialize.toast('Sorry, this feature is not available yet', 4000, 'toast-fix')\">Profile</a></li><li class=\"divider\"></li><li><a id=\"more-check-out-" + ID + "\" class=\"more-check-out-btn\" href=\"#!\">Check Out</a></li></ul>";
            } else {
                More = "<a class=\"waves-effect waves-grey btn-flat more-btn dropdown-button\" href=\'#\' data-activates=\"more-" + ID + "\"><i class=\"material-icons\">more_vert</i></a><ul id=\"more-" + ID + "\" class=\'dropdown-content\'><li><a id=\"more-profile-" + ID + "\" class=\"more-profile-btn\" href=\"#!\" onclick=\"Materialize.toast('Sorry, this feature is not available yet', 4000, 'toast-fix')\">Profile</a></li><li class=\"divider\"></li></ul>";
            }

            Entry = "<tr id=\"user_" + ID + "\"><td>" + Data.id + "</td><td>" + Data.last_name + "</td><td>" + Data.first_name + "</td><td>" + Data.email + "</td><td>" + Data.phone_number + "</td><td>" + Data.shirt_size + "</td><td>" + Data.dietary_restrictions + "</td><td>" + Data.created_at + "</td><td class=\"status-column center\">" + Status + "</td><td>" + More + "</td></tr>";
            RegistrantsTableContent.push(Entry);

            // Count Totals
            if (!EVN.mDateRegistered[Data.created_at]) {
                EVN.mDateRegistered[Data.created_at] = 0;
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

            if (snap.val()[ID].Status == false) {
                $("#status-" + ID).click(function (event) {
                    ID = event.target.id;
                    ID = ID.split('-');
                    ID = ID.pop();
                    EVN.CheckIn(ID);
                    console.log(ID + " Successfully Checked In");
                });
            }

            $("#more-check-out-" + ID).click(function (event) {
                ID = event.target.id;
                ID = ID.split('-');
                ID = ID.pop();
                EVN.CheckOut(ID);
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

        for (var i = 0; i < IsCreateNewFirebaseEntry.length; i++) {
            EVN.CreateFirebaseRegistrantEntry(IsCreateNewFirebaseEntry[i]);
        }
    });
}

EVN_Registrants.prototype.LoadAdminContent = function (pAPP_ID, pSECRET) {
    var EVN = this;
    if (EVN.mUser.HasPermission('All')) {
    $(".statistics-tab").removeClass('disabled');
    $(".tools-tab").removeClass('disabled');
    }
    var Hash = window.location.hash;
    Hash = Hash.toLowerCase();
    $.get("https://my.mlh.io/api/v2/users?client_id=" + pAPP_ID + "&secret=" + pSECRET + "&page=1", function (pData) {
        EVN.mData = pData.data;

        EVN.HandleData(EVN.mData);
        //console.log(TableContent);
        $("#loading-bar-wrapper").hide();
        if (Hash == "#statistics") {
            $("#statistics").show();
        } else {
            if (Hash == "#tools") {
                $("#tools").show();
            } else {
                $("#registrants").show();
            }
        }

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
                        if (snap.val()[ID].Status == true) {
                            ButtonID.addClass('checked-in disabled');
                            ButtonID.removeClass('waves-effect waves-teal check-in');
                            ButtonID.html("CHECKED IN");
                            EVN.mStatus[ID].Status = snap.val()[ID].Status;
                            ButtonID.unbind("click");

                            EVN.mTotalAttended++;
                            $("#totals-checked-in").html("Checked In: " + EVN.mTotalAttended);
                            //console.log(ID + " Successfully Checked In");
                        }
                        if (snap.val()[ID].Status == false) {
                            ButtonID.addClass('waves-effect waves-teal check-in');
                            ButtonID.removeClass('checked-in disabled');
                            ButtonID.html("CHECK-IN");
                            EVN.mStatus[ID].Status = snap.val()[ID].Status;
                            ButtonID.click(function () {
                                ID = event.target.id;
                                ID = ID.split('-');
                                ID = ID.pop();
                                EVN.CheckIn(ID);
                                console.log(ID + " Successfully Checked In");
                            });
                        }
                    }
                }
            }
        });
    });
}

EVN_Registrants.prototype.LoadStaffContent = function (pAPP_ID, pSECRET) {
    $(".statistics-tab").removeClass('disabled');
    $("#tools").remove();
    $(".nav-dropdown-staff").remove();

    var EVN = this;
    var Hash = window.location.hash;
    Hash = Hash.toLowerCase();
    $.get("https://my.mlh.io/api/v2/users?client_id=" + pAPP_ID + "&secret=" + pSECRET + "&page=1", function (pData) {
        EVN.mData = pData.data;

        EVN.HandleData(EVN.mData);
        //console.log(TableContent);
        $("#loading-bar-wrapper").hide();
        if (Hash == "#statistics") {
            $("#statistics").show();
        } else {
            $("#registrants").show();
        }

        const dbRefObject = firebase.database().ref().child('APPDATA').child('Registrants');
        dbRefObject.on('value', snap => {
            //EVN.mStatus = snap.val();
            var ID = "";
            //console.log(snap.val()[ID].Status);
            var IDs = Object.keys(EVN.mStatus);
            var ButtonID = $("#status-" + ID);

            for (var i = 0; i < IDs.length; i++) {
                ID = IDs[i];
                ButtonID = $("#status-" + ID);
                if (typeof snap.val()[ID] != 'undefined') {
                    if (EVN.mStatus[ID].Status != snap.val()[ID].Status) {
                        if (snap.val()[ID].Status == true) {
                            ButtonID.addClass('checked-in disabled');
                            ButtonID.removeClass('waves-effect waves-teal check-in');
                            ButtonID.html("CHECKED IN");
                            EVN.mStatus[ID].Status = snap.val()[ID].Status;
                            ButtonID.unbind("click");

                            EVN.mTotalAttended++;
                            $("#totals-checked-in").html("Checked In: " + EVN.mTotalAttended);
                            //console.log(ID + " Successfully Checked In");
                        }
                        if (snap.val()[ID].Status == false) {
                            ButtonID.addClass('waves-effect waves-teal check-in');
                            ButtonID.removeClass('checked-in disabled');
                            ButtonID.html("CHECK-IN");
                            EVN.mStatus[ID].Status = snap.val()[ID].Status;
                            ButtonID.click(function () {
                                ID = event.target.id;
                                ID = ID.split('-');
                                ID = ID.pop();
                                EVN.CheckIn(ID);
                                console.log(ID + " Successfully Checked In");
                            });
                        }
                    }
                }
            }
        })
    });
}

EVN_Registrants.prototype.LoadContent = function (pAPP_ID, pSECRET) {
    var EVN = this;
    var Hash = window.location.hash;
    Hash = Hash.toLowerCase();

    if (EVN.mUser.HasPermission('ManageUsers') || EVN.mUser.HasPermission('All')) {
        // View Staff panel
    }
    else {
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
            }
            else {
                $('#statistics').remove();
            }

                        
            if (EVN.mUser.HasPermission('CreateRegistrantRaffle') || EVN.mUser.HasPermission('DrawRegistrantRaffle') || EVN.mUser.HasPermission('All')) {
                // Load tools tab
                $('.tools-tab').removeClass('disabled');
            }
            else {
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
                            if (snap.val()[ID].Status == true) {
                                ButtonID.addClass('checked-in disabled');
                                ButtonID.removeClass('waves-effect waves-teal check-in');
                                ButtonID.html("CHECKED IN");
                                EVN.mStatus[ID].Status = snap.val()[ID].Status;
                                ButtonID.unbind("click");
    
                                EVN.mTotalAttended++;
                                $("#totals-checked-in").html("Checked In: " + EVN.mTotalAttended);
                                //console.log(ID + " Successfully Checked In");
                            }
                            if (snap.val()[ID].Status == false) {
                                ButtonID.addClass('waves-effect waves-teal check-in');
                                ButtonID.removeClass('checked-in disabled');
                                ButtonID.html("CHECK-IN");
                                EVN.mStatus[ID].Status = snap.val()[ID].Status;
                                ButtonID.click(function () {
                                    ID = event.target.id;
                                    ID = ID.split('-');
                                    ID = ID.pop();
                                    EVN.CheckIn(ID);
                                    console.log(ID + " Successfully Checked In");
                                });
                            }
                        }
                    }
                }
            });
        });
    }

    /*var EVN = this;
    if (EVN.mUser.HasPermission('All')) {
    $(".statistics-tab").removeClass('disabled');
    $(".tools-tab").removeClass('disabled');
    }
    var Hash = window.location.hash;
    Hash = Hash.toLowerCase();
    $.get("https://my.mlh.io/api/v2/users?client_id=" + pAPP_ID + "&secret=" + pSECRET + "&page=1", function (pData) {
        EVN.mData = pData.data;

        EVN.HandleData(EVN.mData);
        //console.log(TableContent);
        $("#loading-bar-wrapper").hide();
        if (Hash == "#statistics") {
            $("#statistics").show();
        } else {
            if (Hash == "#tools") {
                $("#tools").show();
            } else {
                $("#registrants").show();
            }
        }

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
                        if (snap.val()[ID].Status == true) {
                            ButtonID.addClass('checked-in disabled');
                            ButtonID.removeClass('waves-effect waves-teal check-in');
                            ButtonID.html("CHECKED IN");
                            EVN.mStatus[ID].Status = snap.val()[ID].Status;
                            ButtonID.unbind("click");

                            EVN.mTotalAttended++;
                            $("#totals-checked-in").html("Checked In: " + EVN.mTotalAttended);
                            //console.log(ID + " Successfully Checked In");
                        }
                        if (snap.val()[ID].Status == false) {
                            ButtonID.addClass('waves-effect waves-teal check-in');
                            ButtonID.removeClass('checked-in disabled');
                            ButtonID.html("CHECK-IN");
                            EVN.mStatus[ID].Status = snap.val()[ID].Status;
                            ButtonID.click(function () {
                                ID = event.target.id;
                                ID = ID.split('-');
                                ID = ID.pop();
                                EVN.CheckIn(ID);
                                console.log(ID + " Successfully Checked In");
                            });
                        }
                    }
                }
            }
        })
    });*/
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
        /*if (EVN.mUser.mType == "ADMIN") {
            EVN.LoadAdminContent(pAPP_ID, pSECRET);
        }
        else {
            if (EVN.mUser.mType == "STAFF") {
                EVN.LoadStaffContent(pAPP_ID, pSECRET);
            }
            else {
                // Load error "invalid account type" page
                alert("Invalid Account Type");
            }
        }*/
        EVN.LoadContent(pAPP_ID, pSECRET);
    });
    /*firebase.database().ref().child('APPDATA').child('Users').once('value').then(function (snap) {
        if (typeof snap.val()[EVN.Uid] != 'undefined') {
            console.log("User Account Type: " + snap.val()[EVN.Uid].Type);
            EVN.mUserType = snap.val()[EVN.Uid].Type;
            if (EVN.mUserType == "ADMIN") {
                EVN.LoadAdminContent(pAPP_ID, pSECRET);
            } else {
                if (EVN.mUserType == "STAFF") {
                    EVN.LoadStaffContent(pAPP_ID, pSECRET);
                } else {
                    // Load error "invalid account type" page
                    alert("Invalid Account Type");
                }
            }
        } else {
            EVN.CreateUser(EVN.Uid, Username, "STAFF");
            EVN.LoadStaffContent(pAPP_ID, pSECRET);
            console.log(EVN.mUserType);
        }
    });*/
}