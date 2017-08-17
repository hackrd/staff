/*
EVENTMAN (EVN)
-COPYRIGHT NOTICE-
Eventman Copyright (c) 2017 Sean Kee - All Rights Reserved.

Unauthorized copying or reproduction of this file is strictly prohibited.

Visit https://mrskee.github.io/ for more information.
Sean Kee <skee66499@gmail.com>
*/

/* Dashboard using MyMLH API */
var EVN_Settings = function () {
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

EVN_Settings.prototype.FormatESTTimestamp = function (pTimestamp) {
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

EVN_Settings.prototype.CreateUser = function (pUid, pUsername, pType) {
    firebase.database().ref().child('APPDATA').child('Users').child(pUid).set({
        Uid: pUid,
        Username: pUsername,
        Type: pType
    });
    this.mUserType = pType;
}

EVN_Settings.prototype.ClearAllRegistrantsHistory = function () {
    var EVN = this;

    if (EVN.mUser.HasPermission('ManageRegistrants') || EVN.mUser.HasPermission('All')) {
        var ID = "";
        var IDs = Object.keys(EVN.mStatus);
        var ButtonID = $("#status-" + ID);

        for (var i = 0; i < IDs.length; i++) {
            ID = IDs[i];
            firebase.database().ref().child('APPDATA').child('Registrants').child(ID).set({
                Status: false,
            });
        }
        EVN.mTotalAttended = 0;
        $("#totals-checked-in").html("Checked In: " + EVN.mTotalAttended);
        console.log("Successfully Reset All Users");
    }
}

EVN_Settings.prototype.HandleData = function (pData) {

}

EVN_Settings.prototype.LoadContent = function () {
    var EVN = this;
    var Hash = window.location.hash;
    Hash = Hash.toLowerCase();

    if (EVN.mUser.HasPermission('ManageUsers') || EVN.mUser.HasPermission('All')) {
        // View Staff panel
    }
    else {
        $(".nav-dropdown-staff").remove();
    }

    $('#UpdatePasswordForm').keypress(function (e) {
        if (e.which == 13) {
            UserUpdatePassword(e);
            return false;
        }
    });

    $("#eventman-version").html(EVN_Version);

    $("#loading-bar-wrapper").hide();
    $("#account").show();
    $(".about-tab").removeClass('disabled');
}

EVN_Settings.prototype.Load = function () {
    $("#account").hide();
    $("#manage").hide();
    $("#about").hide();
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
        EVN.LoadContent();
    });

}