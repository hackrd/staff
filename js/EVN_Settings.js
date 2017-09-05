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
    this.mUser = new EVN_User();
    this.mUid
}

EVN_Settings.prototype.ClearAllRegistrantsLog = function () {
    var EVN = this;

    if (EVN.mUser.HasPermission('ClearAllRegistrantsLog') || EVN.mUser.HasPermission('All')) {
        firebase.database().ref().child('APPDATA').child('Registrants').once('value').then(function (snap) {
            var ID = "";
            var IDs = Object.keys(snap.val());

            for (var i = 0; i < IDs.length; i++) {
                ID = IDs[i];
                firebase.database().ref().child('APPDATA').child('Registrants').child(ID).set({
                    Status: "NOT_ATTENDED",
                });
            }
            Materialize.toast("Successfully cleared logs for all registrants", 4000, "toast-fix");
            console.log('Successfully cleared logs for all registrants');
        });
    }
}

EVN_Settings.prototype.LoadAccountTab = function () {
    var EVN = this;
    $('#UpdateFirstNameField').val(EVN.mUser.mFirstName);
    $('#UpdateLastNameField').val(EVN.mUser.mLastName);
    $('#UpdateEmailField').val(EVN.mUser.mEmail);
    $('#UpdatePhoneNumberField').val(EVN.mUser.mPhoneNumber);
    $('#UpdateSizeEmpty').attr('selected', false);
    $('#UpdateSize' + EVN.mUser.mSize).attr('selected', true);
    $('select').material_select();
    for (var i = 0; i < EVN.mUser.mAvailability.length; i++) {
        if (EVN.mUser.mAvailability[i] == '1') {
            $('#UpdateShiftOne').prop('checked', true);
        }
        if (EVN.mUser.mAvailability[i] == '2') {
            $('#UpdateShiftTwo').prop('checked', true);
        }
        if (EVN.mUser.mAvailability[i] == '3') {
            $('#UpdateShiftThree').prop('checked', true);
        }
        if (EVN.mUser.mAvailability[i] == '4') {
            $('#UpdateShiftFour').prop('checked', true);
        }
    }
    $('#UpdateDiscordAccountField').val(EVN.mUser.mDiscordAccount);
    Materialize.updateTextFields();

    $('#ButtonUpdateInformation').click(function (e) {
        EVN.mUser.UpdateUserInformation();
    });

    $('#UpdateInformationForm').keypress(function (e) {
        if (e.which == 13) {
            EVN.mUser.UpdateUserInformation();
            return false;
        }
    });

    $('#ButtonUpdatePassword').click(function (e) {
        UserUpdatePassword(e);
    });

    $('#UpdatePasswordForm').keypress(function (e) {
        if (e.which == 13) {
            UserUpdatePassword(e);
            return false;
        }
    });
}

EVN_Settings.prototype.LoadContent = function () {
    var EVN = this;
    var Hash = window.location.hash;
    Hash = Hash.toLowerCase();

    if (EVN.mUser.mStatus == 'CHECKED_IN' || EVN.mUser.HasPermission('CheckInAccessOverride') || EVN.mUser.HasPermission('All')) {
        $('.nav-dropdown-registrants').show();
    }
    else {
        $('.nav-dropdown-registrants').remove();
    }

    if (EVN.mUser.HasPermission('ViewStaff') || EVN.mUser.HasPermission('All')) {
        $('.nav-dropdown-staff').show();
    }
    else {
        $('.nav-dropdown-staff').remove();
    }
    
    EVN.LoadAccountTab();

    if (EVN.mUser.HasPermission('ClearAllRegistrantsLog') || EVN.mUser.HasPermission('All')) {
        $('.manage-tab').removeClass('disabled');
        $('#clear-registrants-warning-modal-confirm').click(function () {
            EVN.ClearAllRegistrantsLog();
        });
    }
    else {
        $('#manage').remove();
    }

    $("#eventman-version").html(EVN_Version);

    $(".about-tab").removeClass('disabled');
    $("#loading-bar-wrapper").hide();
    if (Hash == '#about') {
        $('#about').show();
    }
    else {
        if (Hash == '#manage') {
            $('#manage').show();
        }
        else {
            $('#account').show();
        }
    }
}

EVN_Settings.prototype.Load = function () {
    $("#account").hide();
    $("#manage").hide();
    $("#about").hide();
    $("#loading-bar-wrapper").show();
    $('.nav-dropdown-staff').hide();
    $('.nav-dropdown-registrants').hide();

    var EVN = this;

    EVN.mUser.Load(function () {
        EVN.LoadContent();
    });

}