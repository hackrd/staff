/*
EVENTMAN (EVN)
-COPYRIGHT NOTICE-
Eventman Copyright (c) 2017 Sean Kee - All Rights Reserved.

Unauthorized copying or reproduction of this file is strictly prohibited.

Visit https://mrskee.github.io/ for more information.
Sean Kee <skee66499@gmail.com>
*/

/* Firebase User for Eventman */
var EVN_User = function () {
    this.mData = {};
    this.mUid = "";
    this.mUsername = "";
    this.mType = "";
    this.mEmail = "";
    this.mFirstName = "";
    this.mLastName = "";
    this.mPhoneNumber = "";
    this.mSize = "";
    this.mAvailability = "";
    this.mDiscordAccount = "";
    this.mPermissions = {};
    this.mActionLog = "";

    this.mStatus = "";

    this.mVersion = "";
}

EVN_User.prototype.IsSystemUpdate = function () {
    var ModalHtml = "<div id='system-update-modal' class=\"modal\"><div class=\"modal-content\"><h4><i class=\"material-icons small\">new_releases</i>   Version Update</h4><p>A new system update has been released! Please refresh your page to get the latest content.</p></div><div class=\"modal-footer\"><a href=\"#!\" class=\"modal-action modal-close waves-effect waves-grey btn-flat \">Cancel</a><a id=\"\" href=\"#!\" class=\"modal-action modal-close waves-effect waves-green btn-flat \" onclick=\"location.reload();\">Update</a></div></div>";
    $('#content').html($('#content').html() + ModalHtml);
    $('#system-update-modal').modal({
        dismissible: false, // Modal can be dismissed by clicking outside of the modal
        opacity: .5, // Opacity of modal background
        inDuration: 300, // Transition in duration
        outDuration: 200, // Transition out duration
        startingTop: '4%', // Starting top style attribute
        endingTop: '10%', // Ending top style attribute
        ready: function (modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
        },
        complete: function () {

        } // Callback for Modal close
    }
    );
    $('#system-update-modal').modal('open');
}

EVN_User.prototype.GetUsername = function () {
    var Username = firebase.auth().currentUser.email;
    Username = Username.split('.');
    Username = Username.join('');
    return Username;
}

// Returns true if user has pPermission
EVN_User.prototype.HasPermission = function (pPermission) {
    var USER = this;
    if (typeof USER.mPermissions[pPermission] != 'undefined') {
        if (USER.mPermissions[pPermission] == true) {
            return true;
        }
        else {
            return false;
        }
    }
    else {
        return false;
    }
}

EVN_User.prototype.ModifyPermission = function (pUid, pPermission, pValue) {
    var USER = this;
    if (USER.HasPermission('EditPermissions') || USER.HasPermission('All')) {

        firebase.database().ref().child('APPDATA').child('Users').child(pUid).child('Permissions').update({
            [pPermission]: pValue
        });
        if (pUid == USER.mUid) {
            USER.mPermissions[pPermission] = pValue;
        }

    }
}

EVN_User.prototype.ModifyAccountType = function (pUid, pType) {
    var USER = this;
    if (USER.HasPermission('ChangeAccountType') || USER.HasPermission('All')) {
        firebase.database().ref().child('Permissions').once('value').then(function (snap) {
            var PermissionIndex = Object.keys(snap.val().INDEX);
            firebase.database().ref().child('APPDATA').child('Users').child(pUid).update({
                Type: pType,
                Permissions: null
            });
            if (pUid == USER.mUid) {
                USER.mType = pType;
            }
            for (var i = 0; i < PermissionIndex.length; i++) {
                if (snap.val()[pType][PermissionIndex[i]] == true) {
                    $('#permission-toggle-' + PermissionIndex[i] + ' input').prop('checked', true);
                }
                else {
                    $('#permission-toggle-' + PermissionIndex[i] + ' input').prop('checked', false);
                }
            }
        });
    }
}

EVN_User.prototype.CreateFirebaseEntry = function (pData, pCallback) {
    var USER = this;
    firebase.database().ref().child('APPDATA').child('Users').child(pData.Uid).set({
        Uid: pData.Uid,
        Username: pData.Username,
        Type: pData.Type,
        Email: pData.Email,
        FirstName: pData.FirstName,
        LastName: pData.LastName,
        PhoneNumber: pData.PhoneNumber,
        Size: pData.Size,
        Availability: pData.Availability,
        DiscordAccount: pData.DiscordAccount,
        FirstLogin: false,
        LastUpdated: SK.GetESTTimestamp(),
        LastSeen: SK.GetESTTimestamp()
    });

    USER.mUid = pData.Uid;
    USER.mUsername = pData.Username;
    USER.mType = pData.Type;
    USER.mEmail = pData.Email;
    USER.mFirstName = pData.FirstName;
    USER.mLastName = pData.LastName;
    USER.mPhoneNumber = pData.PhoneNumber;
    USER.mSize = pData.Size;
    USER.mAvailability = pData.Availability;
    USER.mAvailability = USER.mAvailability.split('%');
    USER.mAvailability.pop();
    USER.mDiscordAccount = pData.DiscordAccount;
    USER.mActionLog = "";

    firebase.database().ref().child('Permissions').once('value').then(function (snap) {
        USER.mPermissions = snap.val()[USER.mType];
        //console.log(USER);

        pCallback();
    });
}

EVN_User.prototype.UpdateFirebaseEntry = function (pData, pCallback) {
    var USER = this;
    firebase.database().ref().child('APPDATA').child('Users').child(USER.mUid).update({
        FirstName: pData.FirstName,
        LastName: pData.LastName,
        PhoneNumber: pData.PhoneNumber,
        Size: pData.Size,
        Availability: pData.Availability,
        DiscordAccount: pData.DiscordAccount,
        LastUpdated: SK.GetESTTimestamp(),
    });

    USER.mFirstName = pData.FirstName;
    USER.mLastName = pData.LastName;
    USER.mPhoneNumber = pData.PhoneNumber;
    USER.mSize = pData.Size;
    USER.mAvailability = pData.Availability;
    USER.mAvailability = USER.mAvailability.split('%');
    USER.mAvailability.pop();
    USER.mDiscordAccount = pData.DiscordAccount;

    pCallback();
}

EVN_User.prototype.AppendActionLog = function (pEntry, pCallback) {
    var USER = this;
    firebase.database().ref().child('APPDATA').child('Users').child(USER.mUid).once('value').then(function (snap) {
        var Log = "";
        if (typeof snap.val().ActionLog != 'undefined') {
            Log = snap.val().ActionLog + ' ' + pEntry;
        }
        else {
            Log = pEntry;
        }
        firebase.database().ref().child('APPDATA').child('Users').child(USER.mUid).update({
            ActionLog: Log
        });

        pEntry += '%' + USER.mUsername;
        (typeof pCallback === 'function') ? USER.AppendAuditLog('StaffAction', pEntry, pCallback) : USER.AppendAuditLog('StaffAction', pEntry);
    });
}

EVN_User.prototype.AppendAuditLog = function (pLog, pEntry, pCallback) {
    firebase.database().ref().child('APPDATA').child('AuditLogs').child(pLog).once('value').then(function (snap) {
        var Log = "";
        if (typeof snap.val().Log != 'undefined') {
            Log = snap.val().Log + ' ' + pEntry;
        }
        else {
            Log = pEntry;
        }
        firebase.database().ref().child('APPDATA').child('AuditLogs').child(pLog).update({
            Log: Log
        });

        typeof pCallback === 'function' && pCallback();
    });
}

EVN_User.prototype.RemoveAuditLogEntries = function (pLog, pEntry, pCallback) {
    var USER = this;
    if (USER.HasPermission('Clear' + pLog + 'Log') || USER.HasPermission('All')) {
        firebase.database().ref().child('APPDATA').child('AuditLogs').child(pLog).once('value').then(function (snap) {
            var Data = [];
            if (typeof snap.val().Log != 'undefined') {
                Data = snap.val().Log.split(' ');
            } else {
                return;
            }
            var OldLog = [];
            var NewLog = "";
            var Entries = [];
            pEntry = pEntry.split(' ');
            if (pEntry.constructor !== Array) {
                Entries[0] = pEntry;
            }
            else {
                Entries = pEntry;
            }
            if (Data.constructor !== Array) {
                OldLog[0] = Data;
            }
            else {
                OldLog = Data;
            }

            /*for (var i = 0; i < Entries.length; i++) {
                for (var j = 0; j < OldLog.length; j++) {
                    if (Entries[i] == OldLog[j]) {
                        OldLog[j] = undefined;
                    }
                }
            }*/

            for (var i = 0; i < OldLog.length; i++) {
                for (var j = 0; j < Entries.length; j++) {
                    if (Entries[j] == OldLog[i]) {
                        OldLog[i] = undefined;
                    }
                }
                if (typeof OldLog[i] != 'undefined') {
                    NewLog += OldLog[i] + ' ';
                }
            }

            if (NewLog[NewLog.length - 1] == ' ') {
                NewLog = NewLog.slice(0, -1);
            }

            if (NewLog == ' ' || NewLog == '') {
                NewLog = null;
            }

            firebase.database().ref().child('APPDATA').child('AuditLogs').child(pLog).update({
                Log: NewLog
            });

            typeof pCallback === 'function' && pCallback();
        });
    }
};

EVN_User.prototype.ClearAuditLog = function (pLog, pCallback) {
    var USER = this;
    if (USER.HasPermission('ClearAll' + pLog + 'Log') || USER.HasPermission('All')) {
        firebase.database().ref().child('APPDATA').child('AuditLogs').child(pLog).once('value').then(function (snap) {
            if (typeof snap.val().Log != 'undefined') {
                var Data = snap.val().Log.split(' ');
                USER.RemoveAuditLogEntries('Master', Data);
                firebase.database().ref().child('APPDATA').child('AuditLogs').child(pLog).update({
                    Log: null
                });
            }
            typeof pCallback === 'function' && pCallback();
        });
    }
}

EVN_User.prototype.UpdateLastSeen = function () {
    var USER = this;
    firebase.database().ref().child('APPDATA').child('Users').child(USER.mUid).update({
        LastSeen: SK.GetESTTimestamp()
    });
}

EVN_User.prototype.UpdateLastUpdated = function () {
    var USER = this;
    firebase.database().ref().child('APPDATA').child('Users').child(USER.mUid).update({
        LastUpdated: SK.GetESTTimestamp()
    });
}

EVN_User.prototype.UpdateUserInformation = function () {
    var USER = this;

    const Form = $('#UpdateInformationForm');
    const FirstNameInput = $('#UpdateFirstNameField');
    const LastNameInput = $('#UpdateLastNameField');
    const PhoneNumberInput = $('#UpdatePhoneNumberField');
    const SizeInput = $('#UpdateSizeField');
    const ShiftOneInput = $('#UpdateShiftOne');
    const ShiftTwoInput = $('#UpdateShiftTwo');
    const ShiftThreeInput = $('#UpdateShiftThree');
    const ShiftFourInput = $('#UpdateShiftFour');
    const DiscordAccountInput = $('#UpdateDiscordAccountField');

    var UserData = {};

    UserData.FirstName = FirstNameInput.val() != '' ? FirstNameInput.val() : undefined;
    UserData.LastName = LastNameInput.val() != '' ? LastNameInput.val() : undefined;
    UserData.PhoneNumber = PhoneNumberInput.val() != '' ? PhoneNumberInput.val() : undefined;
    UserData.Size = SizeInput.val() != '' ? SizeInput.val() : undefined;
    UserData.Availability = '';
    UserData.Availability += ShiftOneInput.is(':checked') ? '1%' : '';
    UserData.Availability += ShiftTwoInput.is(':checked') ? '2%' : '';
    UserData.Availability += ShiftThreeInput.is(':checked') ? '3%' : '';
    UserData.Availability += ShiftFourInput.is(':checked') ? '4%' : '';
    UserData.DiscordAccount = DiscordAccountInput.val() ? DiscordAccountInput.val() : undefined;

    var Keys = Object.keys(UserData);
    for (var i = 0; i < Keys.length; i++) {
        if (typeof UserData[Keys[i]] == 'undefined' || UserData[Keys[i]] == null) {
            Materialize.toast("Error! Invalid " + Keys[i], 4000, "toast-fix");
            return false;
        }
    }

    USER.UpdateFirebaseEntry(UserData, function () {
        FirstNameInput.val(USER.mFirstName);
        LastNameInput.val(USER.mLastName);
        PhoneNumberInput.val(USER.mPhoneNumber);
        SizeInput.val(USER.mSize);
        DiscordAccountInput.val(USER.mDiscordAccount);
        Materialize.updateTextFields();
        Materialize.toast("Successfully updated profile!", 4000, "toast-fix");
    });
}

EVN_User.prototype.SubmitFirstLogin = function (pUid, pCallback) {
    var USER = this;
    const Form = $('#FirstLoginForm');
    const FirstNameInput = $('#FirstNameField').val();
    const LastNameInput = $('#LastNameField').val();
    const EmailInput = $('#EmailField').val();
    const PhoneNumberInput = $('#PhoneNumberField').val();
    const SizeInput = $('#SizeField').val();
    const ShiftOneInput = $('#ShiftOne').is(':checked');
    const ShiftTwoInput = $('#ShiftTwo').is(':checked');
    const ShiftThreeInput = $('#ShiftThree').is(':checked');
    const ShiftFourInput = $('#ShiftFour').is(':checked');
    const DiscordAccountInput = $('#DiscordAccountField').val();
    const NewPasswordInput = $('#NewPasswordField');
    const ConfirmNewPasswordInput = $('#ConfirmNewPasswordField');

    var UserData = {};

    UserData.Uid = pUid;
    UserData.Username = USER.GetUsername(pUid);
    UserData.Type = 'STAFF';

    UserData.FirstName = FirstNameInput != '' ? FirstNameInput : undefined;
    UserData.LastName = LastNameInput != '' ? LastNameInput : undefined;
    UserData.Email = EmailInput != '' ? EmailInput : undefined;
    UserData.PhoneNumber = PhoneNumberInput != '' ? PhoneNumberInput : undefined;
    UserData.Size = SizeInput != '' ? SizeInput : undefined;
    UserData.Availability = '';
    UserData.Availability += ShiftOneInput ? '1%' : '';
    UserData.Availability += ShiftTwoInput ? '2%' : '';
    UserData.Availability += ShiftThreeInput ? '3%' : '';
    UserData.Availability += ShiftFourInput ? '4%' : '';
    UserData.DiscordAccount = DiscordAccountInput ? DiscordAccountInput : undefined;

    var Keys = Object.keys(UserData);
    for (var i = 0; i < Keys.length; i++) {
        if (typeof UserData[Keys[i]] == 'undefined' || UserData[Keys[i]] == null) {
            Materialize.toast("Error! Invalid " + Keys[i], 4000, "toast-fix");
            return false;
        }
    }

    // Check Passwords
    /*if (NewPasswordInput.val() == ConfirmNewPasswordInput.val()) {
        if (NewPasswordInput.val().length < 8) {
            Materialize.toast("Error! Password is too short", 4000, "toast-fix");
            return false;
        }
        else {
            AUTH.currentUser.updatePassword(NewPasswordInput.val()).then(function () {
                Materialize.toast("Password change successful", 4000, "toast-fix");
            }).catch(pError => (function() {
                console.log(pError.message);
                if (pError.type == 'auth/requires-recent-login') {
                    Materialize.toast("Error! Please relog", 4000, "toast-fix");
                }
            }));
        }
    }
    else {
        Materialize.toast("Error! Passwords don't match", 4000, "toast-fix");
        return false;
    }*/

    USER.CreateFirebaseEntry(UserData, pCallback);

    Form[0].reset();
    $('#first-login-modal').modal('close');
}

EVN_User.prototype.IsFirstLogin = function (pUid, pCallback) {
    var USER = this;
    $('#first-login-modal').modal({
        dismissible: false, // Modal can be dismissed by clicking outside of the modal
        opacity: .5, // Opacity of modal background
        inDuration: 300, // Transition in duration
        outDuration: 200, // Transition out duration
        startingTop: '4%', // Starting top style attribute
        endingTop: '10%', // Ending top style attribute
        ready: function (modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
        },
        complete: function () {

        } // Callback for Modal close
    }
    );

    $('#first-login-submit').click(function () {
        USER.SubmitFirstLogin(pUid, pCallback);
    });

    $('#FirstLoginForm').keypress(function (e) {
        if (e.which == 13) {
            USER.SubmitFirstLogin(pUid, pCallback);
            return false;
        }
    });

    $('#EmailField').val(firebase.auth().currentUser.email);
    Materialize.updateTextFields();

    $('#first-login-modal').modal('open');

    //USERf.CreateFirebaseEntry(UserData, 'STAFF', pCallback);
}

EVN_User.prototype.Load = function (pCallback) {
    var USER = this;
    var Uid = firebase.auth().currentUser.uid;
    firebase.database().ref().child('APPDATA').child('Misc').child('Version').once('value').then(function (snap) {
        if (snap.val().Version != EVN_Version) {
            firebase.database().ref().child('APPDATA').child('Misc').update({
                Version: EVN_Version
            });
            USER.mVersion = EVN_Version;
        } else {
            USER.mVersion = snap.val().Version;
        }

        firebase.database().ref().child('APPDATA').child('Misc').child('Version').on('value', snap => {
            if (snap.val() != USER.mVersion) {
                USER.IsSystemUpdate();
            }
        });

        firebase.database().ref().child('APPDATA').child('Users').once('value').then(function (snap) {
            if (typeof snap.val()[Uid] != 'undefined' && typeof snap.val()[Uid].FirstLogin != 'undefined' && snap.val()[Uid].FirstLogin == false) {
                $('#first-login-modal').remove();
                var UserData = snap.val()[Uid];
                USER.mUid = UserData.Uid;
                USER.mUsername = UserData.Username;
                USER.mType = UserData.Type;
                USER.mEmail = UserData.Email;
                USER.mFirstName = UserData.FirstName;
                USER.mLastName = UserData.LastName;
                USER.mPhoneNumber = UserData.PhoneNumber;
                USER.mSize = UserData.Size;
                USER.mAvailability = UserData.Availability;
                USER.mAvailability = USER.mAvailability.split('%');
                USER.mAvailability.pop();
                USER.mDiscordAccount = UserData.DiscordAccount;
                if (typeof UserData.ActionLog != 'undefined') {
                    USER.mActionLog = UserData.ActionLog;
                }
                else {
                    User.mActionLog = "";
                }
                if (typeof UserData.Status != 'undefined') {
                    USER.mStatus = UserData.Status;
                }
                else {
                    USER.mStatus = 'NOT_ATTENDED';
                }
                // Load permissions
                firebase.database().ref().child('Permissions').once('value').then(function (snap) {
                    // Load predefined permissions
                    USER.mPermissions = snap.val()[USER.mType];
                    // Load user-specific permissions
                    if (typeof UserData.Permissions != 'undefined') {
                        var Keys = Object.keys(UserData.Permissions);
                        for (var i = 0; i < Keys.length; i++) {
                            USER.mPermissions[Keys[i]] = UserData.Permissions[Keys[i]];
                        }
                    }
                    USER.UpdateLastSeen();
                    pCallback();
                    //console.log(USER);
                });

                if (USER.mType == 'DISABLED') {
                    LogOutUser();
                }
            }
            else {
                USER.IsFirstLogin(Uid, pCallback);
            }
        });
    });
}