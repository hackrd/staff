/*
EVENTMAN (EVN)
-COPYRIGHT NOTICE-
Eventman Copyright (c) 2017 Sean Kee - All Rights Reserved.

Unauthorized copying or reproduction of this file is strictly prohibited.

Visit https://mrskee.github.io/ for more information.
Sean Kee <skee66499@gmail.com>
*/

var EVN_Staff = function () {
    this.mData = {};
    this.mShifts = {};

    this.mTotalStaff = 0;
    this.mTotalAttended = 0;

    this.mUser = new EVN_User();
};

var USERDATABASE = firebase.database().ref().child('APPDATA').child('Users');

EVN_Staff.prototype.ClearStaffLog = function (pUid) {
    var EVN = this;
    if (EVN.mUser.HasPermission('ClearStaffLog') || EVN.mUser.HasPermission('All')) {
        USERDATABASE.child(pUid).once('value').then(function (snap) {
            if (EVN.mData[pUid].Status == 'CHECKED_IN') {
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
                    Temp.splice(1, 0, pUid);
                    ClearEntries[i] = Temp.join('%');
                }
                ClearEntries = ClearEntries.join(' ');
                EVN.mUser.RemoveAuditLogEntries('Staff', ClearEntries);
                EVN.mUser.RemoveAuditLogEntries('Master', ClearEntries);
            }

            var ActionLog = 'CLRSTAFFLOG%' + pUid + '%' + SK.GetESTTimestamp();
            EVN.mUser.AppendActionLog(ActionLog);
            ActionLog += '%' + EVN.mUser.mUsername;
            EVN.mUser.AppendAuditLog('Staff', ActionLog);
            EVN.mUser.AppendAuditLog('Master', ActionLog);

            USERDATABASE.child(pUid).update({
                Status: "NOT_ATTENDED",
                Log: null,
                TotalTime: null
            });
            $('#profile-check-in-out-log-table-body').html('');
            $('#profile-status').html('NOT_ATTENDED');
            Materialize.toast("Successfully cleared log for " + '[' + EVN.mData[pUid].Type + '] ' + EVN.mData[pUid].FirstName + ' ' + EVN.mData[pUid].LastName, 4000, "toast-fix");
            console.log("Successfully cleared log for " + pUid);
            $('#clear-log-btn').hide();
        });
    }
}

EVN_Staff.prototype.ClearActionLog = function (pUid) {
    var EVN = this;
    if (EVN.mUser.HasPermission('ClearActionLog') || EVN.mUser.HasPermission('All')) {
        USERDATABASE.child(pUid).once('value').then(function (snap) {
            if (typeof snap.val().ActionLog != 'undefined') {
                var ClearEntries = snap.val().ActionLog;
                var Temp = "";
                ClearEntries = ClearEntries.split(' ');
                if (ClearEntries.constructor !== Array) {
                    ClearEntries[0] = ClearEntries;
                }
                for (var i = 0; i < ClearEntries.length; i++) {
                    Temp = ClearEntries[i].split('%');
                    Temp.push(snap.val().Username);
                    ClearEntries[i] = Temp.join('%');
                }
                ClearEntries = ClearEntries.join(' ');
                EVN.mUser.RemoveAuditLogEntries('StaffAction', ClearEntries);
            }

            var ActionLog = 'CLRSTAFFLOG%' + pUid + '%' + SK.GetESTTimestamp();
            EVN.mUser.AppendActionLog(ActionLog);
            ActionLog += '%' + EVN.mUser.mUsername;
            EVN.mUser.AppendAuditLog('StaffAction', ActionLog);

            USERDATABASE.child(pUid).update({
                ActionLog: null
            });
            $('#action-log-table-body').html('');
            Materialize.toast("Successfully cleared action log for " + '[' + EVN.mData[pUid].Type + '] ' + EVN.mData[pUid].FirstName + ' ' + EVN.mData[pUid].LastName, 4000, "toast-fix");
            console.log("Successfully cleared action log for " + pUid);
            $('#clear-log-btn').hide();
        });
    }
}

EVN_Staff.prototype.CheckIn = function (pUid) {
    var EVN = this;
    if (EVN.mUser.HasPermission('CheckInStaff') || EVN.mUser.HasPermission('All')) {
        var Uid = pUid;
        var Timestamp = SK.GetESTTimestamp();

        var OldLog = "";
        var Update = "";
        var ActionLog = "";
        USERDATABASE.child(pUid).once('value').then(function (snap) {
            if (typeof snap.val().Log != 'undefined') {
                OldLog = snap.val().Log;
                Update = OldLog + " CHECKIN%" + Timestamp + "%" + EVN.mUser.mUsername;
            } else {
                Update = "CHECKIN%" + Timestamp + "%" + EVN.mUser.mUsername;
            }

            ActionLog = "CHECKIN%" + pUid + "%" + Timestamp;
            EVN.mUser.AppendActionLog(ActionLog);
            ActionLog += '%' + EVN.mUser.mUsername;
            EVN.mUser.AppendAuditLog('Staff', ActionLog);
            EVN.mUser.AppendAuditLog('Master', ActionLog);

            //formatDate(Timestamp);
            //console.log(CurrentDate);
            USERDATABASE.child(Uid).update({
                Status: "CHECKED_IN",
                Log: Update
            });
        });


        // Materialize.toast(message, displayLength, className, completeCallback);
        Materialize.toast('[' + EVN.mData[Uid].Type + '] ' + EVN.mData[Uid].FirstName + ' ' + EVN.mData[Uid].LastName + " was successfully checked in", 4000, "toast-fix");
    }
}

EVN_Staff.prototype.CheckOut = function (pUid) {
    var EVN = this;
    if (EVN.mUser.HasPermission('CheckOutStaff') || EVN.mUser.HasPermission('All')) {
        if (EVN.mData[pUid].Status == "CHECKED_IN") {
            $("#warning-modal-confirm").unbind("click");
            $("#warning-modal-confirm").one("click", function () {
                var Uid = pUid;
                var Timestamp = SK.GetESTTimestamp();

                var OldLog = "";
                var Update = "";
                var ActionLog = "";
                USERDATABASE.child(Uid).once('value').then(function (snap) {
                    if (typeof snap.val().Log != 'undefined') {
                        OldLog = snap.val().Log;
                        Update = OldLog + " CHECKOUT%" + Timestamp + "%" + EVN.mUser.mUsername;
                    } else {
                        Update = "CHECKOUT%" + Timestamp + "%" + EVN.mUser.mUsername;
                    }

                    ActionLog = "CHECKOUT%" + pUid + "%" + Timestamp;
                    EVN.mUser.AppendActionLog(ActionLog);
                    ActionLog += '%' + EVN.mUser.mUsername;
                    EVN.mUser.AppendAuditLog('Staff', ActionLog);
                    EVN.mUser.AppendAuditLog('Master', ActionLog);

                    //formatDate(Timestamp);
                    //console.log(CurrentDate);
                    USERDATABASE.child(Uid).update({
                        Status: "CHECKED_OUT",
                        Log: Update
                    });
                });
                EVN.mTotalAttended--;
                $('.totals-checked-in').each(function () {
                    $(this).html('Checked In: ' + EVN.mTotalAttended);
                });
                Materialize.toast('[' + EVN.mData[Uid].Type + '] ' + EVN.mData[Uid].FirstName + ' ' + EVN.mData[Uid].LastName + " was successfully checked out", 4000, "toast-fix");
                console.log("Successfully checked out " + pUid);
            });
            $('#warning-modal-title').html('Check Out Warning');
            $("#warning-modal-span").html('check out ' + '[' + EVN.mData[pUid].Type + '] ' + EVN.mData[pUid].FirstName + ' ' + EVN.mData[pUid].LastName);
            $('#warning-modal-confirm').html('CHECK OUT');
            $("#warning-modal").modal('open');
        }
    }
}

EVN_Staff.prototype.CalculateDuraton = function (pLog) {
    if (typeof pLog != 'undefined') {
        pLog = pLog.split(' ');
        var TotalTime = 0;
        if (pLog.constructor === Array) {
            for (var i = 0; i < pLog.length; i++) {
                pLog[i] = pLog[i].split('%');
                pLog[i][2] = pLog[i][1].split('@')[1];
                pLog[i][2] = pLog[i][2].split('-')[0];
                pLog[i][1] = pLog[i][1].split('@')[0];
                if (pLog[i][0] == 'CHECKIN') {
                    pLog[i][1] = pLog[i][1].split('/');
                    pLog[i][2] = pLog[i][2].split(':');
                    if (typeof pLog[i + 1] != 'undefined') {
                        if (pLog[i + 1].split('%')[0] == 'CHECKOUT' || pLog[i + 1].split('%')[0] == 'BANNED') {
                            pLog[i + 1] = pLog[i + 1].split('%');
                            pLog[i + 1][2] = pLog[i + 1][1].split('@')[1];
                            pLog[i + 1][2] = pLog[i + 1][2].split('-')[0];
                            pLog[i + 1][1] = pLog[i + 1][1].split('@')[0];
                            pLog[i + 1][1] = pLog[i + 1][1].split('/');
                            pLog[i + 1][2] = pLog[i + 1][2].split(':');
                            TotalTime += SK.CalculateDuration(new Date(pLog[i][1][2], pLog[i][1][0] - 1, pLog[i][1][1], pLog[i][2][0], pLog[i][2][1], pLog[i][2][2]).getTime(), new Date(pLog[i + 1][1][2], pLog[i + 1][1][0] - 1, pLog[i + 1][1][1], pLog[i + 1][2][0], pLog[i + 1][2][1], pLog[i + 1][2][2]).getTime());
                            i++;
                        }
                    }
                    else {
                        TotalTime += SK.CalculateDuration(new Date(pLog[i][1][2], pLog[i][1][0] - 1, pLog[i][1][1], pLog[i][2][0], pLog[i][2][1], pLog[i][2][2]).getTime(), new Date().getTime());//SK.GetElapsedEpoch());
                    }
                }
            }
        }
    }

    if (typeof TotalTime == 'undefined') {
        TotalTime = 0;
    }
    // Convert TotalTime from seconds to HH:MM:SS
    var Hours = ('0' + Math.trunc(TotalTime / 60 / 60)).slice(-2);
    var Minutes = ('0' + Math.trunc(TotalTime / 60 % 60)).slice(-2);
    var Seconds = ('0' + Math.trunc(TotalTime % 60)).slice(-2);
    return Hours + ':' + Minutes + ':' + Seconds;

    /*    pLog = pLog.split(' ');
    var FirstTime = [];
    var SecondTime = [];
    var TotalTime = 0;
    for (var i = 0; i < pLog.length; i++) {

        FirstTime = pLog[i].split('%');
        FirstTime[2] = FirstTime[1].split('@')[1];
        FirstTime[2] = FirstTime[2].split('-')[0];
        FirstTime[1] = FirstTime[1].split('@')[0];
        console.log([FirstTime]);
        if(pLog[i][0] == 'CHECKIN') {
            [pLog][i][1] = pLog[i][1].split('/');
            [pLog][i][2] = pLog[i][2].split(':');
            if (pLog[i + 1][0] == 'CHECKOUT' || pLog[i + 1][0] == 'BANNED') {
                [pLog][i + 1][1] = pLog[i + 1][1].split('/');
                [pLog][i + 1][2] = pLog[i + 1][2].split(':');
                TotalTime += SK.CalculateDuration(new Date(pLog[i][1][2], pLog[i][1][0], pLog[i][1][1], pLog[i][2][0], pLog[i][2][1], pLog[i][2][2]).getTime(), new Date(pLog[i + 1][1][2], pLog[i + 1][1][0], pLog[i + 1][1][1], pLog[i + 1][2][0], pLog[i + 1][2][1], pLog[i + 1][2][2]).getTime());
                i++;
            }
            else {
                TotalTime += SK.CalculateDuration(new Date(pLog[i][1][2], pLog[i][1][0], pLog[i][1][1], pLog[i][2][0], pLog[i][2][1], pLog[i][2][2]).getTime(), SK.GetElapsedEpoch());
            }
        }
    }

    console.log(pLog);
    return TotalTime;
    // Convert TotalTime from seconds to HH:MM:SS
    var Hours = Math.trunc(TotalTime / 60 / 60);
    var Minutes = Math.trunc(TotalTime / 60 % 60);
    var Seconds = Math.trunc(TotalTime % 60);
    return Hours + ':' + Minutes + ':' + Seconds;*/
}

EVN_Staff.prototype.ViewProfile = function (pUid) {
    var EVN = this;

    if (EVN.mUser.HasPermission('ViewStaff') || EVN.mUser.HasPermission('All')) {
        // Fill modal with information
        var Data = EVN.mData[pUid];
        var ProfileInfo = "";
        var CheckInOutLog = "";
        var CheckInOutLogData = "";

        var Uid = pUid;
        var Availability = Data.Availability;
        ProfileInfo = "<span class='bold'>Uid: </span>" + Uid + "<br /><span class='bold'>Status: </span><span id='profile-status'>" + Data.Status + "</span><br /><span class='bold'>Logged Time: </span><span>" + EVN.CalculateDuraton(EVN.mData[Uid].Log) + "</span><br /><span class='bold'>Last Seen: </span>" + Data.LastSeen + "<br /><span class='bold'>First Name: </span>" + Data.FirstName + "<br /><span class='bold'>Last Name: </span>" + Data.LastName + "<br /><span class='bold'>Type: </span>" + Data.Type + "<br /><span class='bold'>Email: </span>" + Data.Email + "<br /><span class='bold'>Phone #: </span>" + Data.PhoneNumber + "<br /><span class='bold'>Discord: </span>" + Data.DiscordAccount + "<br /><span class='bold'>Shirt Size: </span>" + Data.Size + "<br /><span class='bold'>Availability: </span>" + Availability + "<br /><span class='bold'>Last Updated: </span>" + Data.LastUpdated;

        // Flags
        $('#profile-flags').html('');
        if (typeof Data.Flags != 'undefined') {
            if (Data.Flags == 'INELIGIBLE') {
                $('#profile-flags').html('<div class="profile-redflag">INELIGIBLE</div>');
            }
        }

        if (typeof Data.Log != 'undefined') {
            CheckInOutLogData = Data.Log;
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
            if (EVN.mUser.HasPermission('ClearStaffLog') || EVN.mUser.HasPermission('All')) {
                $('#clear-log-btn').unbind('click');
                $('#clear-log-btn').click(function () {
                    $('#warning-modal').modal('open');
                });

                $("#warning-modal-confirm").unbind("click");
                $("#warning-modal-confirm").one("click", function () {
                    EVN.ClearStaffLog(pUid);
                });
                $('#warning-modal-title').html('Clear Log');
                $("#warning-modal-span").html('clear the log for ' + '[' + EVN.mData[Uid].Type + '] ' + EVN.mData[Uid].FirstName + ' ' + EVN.mData[Uid].LastName);
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

        $('#profile-content').html(ProfileInfo);

        // Open Modal
        $('#profile-modal').modal('open');
    }
}

EVN_Staff.prototype.ViewActionLog = function (pUid) {
    var EVN = this;
    
        if (EVN.mUser.HasPermission('ViewActionLog') || EVN.mUser.HasPermission('All')) {
            // Fill modal with information
            var Data = EVN.mData[pUid];
            var ProfileInfo = "";
            var ActionLog = "";
            var ActionLogData = "";
    
            var Uid = pUid;

            // Flags
            $('#profile-flags').html('');
            if (typeof Data.Flags != 'undefined') {
                if (Data.Flags == 'INELIGIBLE') {
                    $('#profile-flags').html('<div class="profile-redflag">INELIGIBLE</div>');
                }
            }
    
            if (typeof Data.ActionLog != 'undefined') {
                ActionLogData = Data.ActionLog;
                ActionLogData = ActionLogData.split(' ');
                var TotalEntries = Object.keys(ActionLogData).length;
                var ActionLogEntry = "";
                for (var i = 0; i < TotalEntries; i++) {
                    ActionLogEntry = ActionLogData[i];
                    ActionLogEntry = ActionLogEntry.split('%');
                    ActionLog += "<tr><td>" + ActionLogEntry[0] + "</td><td>" + ActionLogEntry[1] + "</td><td>" + ActionLogEntry[2] + "</td></tr>";
                }
                $('#action-log-table-body').html(ActionLog);
    
                // Warning Modals
                if (EVN.mUser.HasPermission('ClearActionLog') || EVN.mUser.HasPermission('All')) {
                    $('#clear-action-log-btn').unbind('click');
                    $('#clear-action-log-btn').click(function () {
                        $('#warning-modal').modal('open');
                    });
    
                    $("#warning-modal-confirm").unbind("click");
                    $("#warning-modal-confirm").one("click", function () {
                        EVN.ClearActionLog(pUid);
                    });
                    $('#warning-modal-title').html('Clear Log');
                    $("#warning-modal-span").html('clear the action log for ' + '[' + EVN.mData[Uid].Type + '] ' + EVN.mData[Uid].FirstName + ' ' + EVN.mData[Uid].LastName);
                    $('#warning-modal-confirm').html('CLEAR LOG');
                    $('#clear-log-btn').show();
                } else {
                    $('#clear-log-btn').unbind('click');
                    $('#clear-log-btn').hide();
                }
            } else {
                $('#action-log-table-body').html('');
                $('#clear-log-btn').unbind('click');
                $('#clear-log-btn').hide();
            }
    
            // Open Modal
            $('#action-log-modal').modal('open');
        }
}

EVN_Staff.prototype.ViewPermissions = function(pUid) {
    var EVN = this;
    if (EVN.mUser.HasPermission('EditPermissions') || EVN.mUser.HasPermission('All')) {
        USERDATABASE.child(pUid).once('value').then(function (snap) {
            var UserType = snap.val().Type;
            var SpecialPermissions = [];
            if (typeof snap.val().Permissions != 'undefined') {
                SpecialPermissions = snap.val().Permissions;
            }
            var Permission = "";
            firebase.database().ref().child('Permissions').once('value').then(function (snap) {
                var TypeIndex = Object.keys(snap.val());
                for (var i = 0; i < TypeIndex.length; i++) {
                    if (TypeIndex[i] != 'INDEX') {
                        if (TypeIndex[i] == UserType) {
                            $('#permission-type-option-' + TypeIndex[i]).attr('selected', true);
                        } else {
                            $('#permission-type-option-' + TypeIndex[i]).attr('selected', false);
                        }
                    }
                }
    
                $('#permissions-type select').material_select();

                var PermissionIndex = Object.keys(snap.val().INDEX);
                if (EVN.mUser.HasPermission('ChangeAccountType') || EVN.mUser.HasPermission('All')) {
                    $('#permissions-type select').on('change', function() {
                        EVN.mUser.ModifyAccountType(pUid, this.value);
                    });
                }
                else {
                    $('#permissions-type select').off();
                }
                for (var i = 0; i < PermissionIndex.length; i++) {
                    if (typeof SpecialPermissions[PermissionIndex[i]] != 'undefined') {
                        if (SpecialPermissions[PermissionIndex[i]] == true) {
                            $('#permission-toggle-' + PermissionIndex[i] + ' input').prop('checked', true);
                        }
                        else {
                            $('#permission-toggle-' + PermissionIndex[i] + ' input').prop('checked', false);
                        }
                    }
                    else {
                        if (snap.val()[UserType][PermissionIndex[i]] == true) {
                            $('#permission-toggle-' + PermissionIndex[i] + ' input').prop('checked', true);
                        }
                        else {
                            $('#permission-toggle-' + PermissionIndex[i] + ' input').prop('checked', false);
                        }
                    }

                    $('#permission-toggle-' + PermissionIndex[i] + ' input').unbind('click');
                    $('#permission-toggle-' + PermissionIndex[i] + ' input').click(function () {
                        Permission = $(event.target).parents()[2].id;
                        Permission = Permission.split('-');
                        Permission = Permission.pop();
                        EVN.mUser.ModifyPermission(pUid, Permission, $('#permission-toggle-' + Permission + ' input').prop('checked') ? true : false);
                    });
                }
            });
        });
        $('#permissions-modal').modal('open');
    }
}

EVN_Staff.prototype.LoadDatabaseListener = function () {
    var EVN = this;
    USERDATABASE.on('value', snap => {
        var Uid = "";
        var Uids = Object.keys(EVN.mData);
        var ButtonID = $("#status-" + Uid);

        for (var i = 0; i < Uids.length; i++) {
            Uid = Uids[i];
            ButtonID = $("#status-" + Uid);
            if (typeof snap.val()[Uid] != 'undefined') {
                if (EVN.mData[Uid].Status != snap.val()[Uid].Status) {
                    if (snap.val()[Uid].Status == "CHECKED_IN") {
                        ButtonID.addClass('checked-in disabled');
                        ButtonID.removeClass('waves-effect waves-teal check-in');
                        ButtonID.html("CHECKED IN");
                        EVN.mData[Uid].Status = snap.val()[Uid].Status;
                        ButtonID.unbind("click");

                        EVN.mTotalAttended++;
                        $('.totals-checked-in').each(function () {
                            $(this).html('Checked In: ' + EVN.mTotalAttended);
                        });
                    }
                    if (snap.val()[Uid].Status == "CHECKED_OUT" || snap.val()[Uid].Status == "NOT_ATTENDED") {
                        ButtonID.addClass('waves-effect waves-teal check-in');
                        ButtonID.removeClass('checked-in disabled');
                        ButtonID.html("CHECK IN");
                        EVN.mData[Uid].Status = snap.val()[Uid].Status;
                        ButtonID.click(function () {
                            Uid = event.target.id;
                            Uid = Uid.split('-');
                            Uid = Uid.pop();
                            EVN.CheckIn(Uid);
                            console.log("Successfully checked in " + Uid);
                        });
                    }
                }
                if (EVN.mData[Uid].Log != snap.val()[Uid].Log) {
                    EVN.mData[Uid].Log = snap.val()[Uid].Log;
                }
                if (EVN.mData[Uid].ActionLog != snap.val()[Uid].ActionLog) {
                    EVN.mData[Uid].ActionLog = snap.val()[Uid].ActionLog;
                }
                if (EVN.mData[Uid].Permissions != snap.val()[Uid].Permissions) {
                    EVN.mData[Uid].Permissions = snap.val()[Uid].Permissions;
                }
            }
        }
    });
}

EVN_Staff.prototype.FillStaffListTable = function (pCallback) {
    var EVN = this;
    var StaffTable = $('#staff-table');
    var StaffTableBody = $('#staff-table-body');
    var StaffTableContent = [];
    var Entry = "";
    var Status = "";
    var More = "";
    var Uid = "";

    USERDATABASE.once('value').then(function (snap) {
        EVN.mData = snap.val();
        var Keys = Object.keys(EVN.mData);
        var UserData = [];
        var More = "";

        for (var i = 0; i < Keys.length; i++) {
            EVN.mTotalStaff++;
            UserData = EVN.mData[Keys[i]];
            Uid = UserData.Uid;
            if (typeof UserData.Status == 'undefined') {
                UserData.Status = 'NOT_ATTENDED';
                USERDATABASE.child(UserData.Uid).update({
                    Status: 'NOT_ATTENDED'
                });
                Status = "<a id=\"status-" + Uid + "\" class=\"waves-effect waves-teal btn-flat check-in\">CHECK IN</a>";
            } else {
                if (UserData.Status == 'CHECKED_IN') {
                    Status = "<a id=\"status-" + Uid + "\" class=\"btn-flat checked-in disabled\">CHECKED IN</a>";
                    EVN.mTotalAttended++;
                } else {
                    Status = "<a id=\"status-" + Uid + "\" class=\"waves-effect waves-teal btn-flat check-in\">CHECK IN</a>";
                }
            }
            More = "<a class=\"waves-effect waves-grey btn-flat more-btn dropdown-button\" href=\'#\' data-activates=\"more-" + Uid + "\"><i class=\"material-icons\">more_vert</i></a><ul id=\"more-" + Uid + "\" class=\'dropdown-content\'><li><a id=\"more-profile-" + Uid + "\" class=\"more-profile-btn\" href=\"#!\">Profile</a></li><li class=\"divider\"></li>";
            if (EVN.mUser.HasPermission('ViewActionLog') || EVN.mUser.HasPermission('All')) {
                More += "<li><a id=\"more-action-log-" + Uid + "\" class=\"more-action-log-btn\" href=\"#!\">Action Log</a></li>";
            } else {
                $('#clear-action-log-btn').remove();
            }
            if (EVN.mUser.HasPermission('EditPermissions') || EVN.mUser.HasPermission('All')) {
                More += "<li class=\"divider\"></li><li><a id=\"more-permissions-" + Uid + "\" class=\"more-permissions-btn\" href=\"#!\">Permissions</a></li><li class=\"divider\"></li>";
            }
            if (EVN.mUser.HasPermission('CheckOutStaff') || EVN.mUser.HasPermission('All')) {
                More += "<li><a id=\"more-check-out-" + Uid + "\" class=\"more-check-out-btn\" href=\"#!\">Check Out</a></li>";
            }
            More += "</ul>";


            Entry = "<tr id='staff_" + Uid + "'><td>" + UserData.LastName + "</td><td>" + UserData.FirstName + "</td><td>" + UserData.Type + "</td><td>" + UserData.Email + "</td><td>" + UserData.PhoneNumber + "</td><td>" + UserData.DiscordAccount + "</td><td>" + UserData.LastSeen + "</td><td class='status-column center'>" + Status + "</td><td>" + More + "</td></tr>";

            StaffTableContent.push(Entry);
        }

        StaffTableBody.html(StaffTableContent);
        $('.totals-staff').each(function () {
            $(this).html('Staff: ' + EVN.mTotalStaff);
        });
        $('.totals-checked-in').each(function () {
            $(this).html('Checked In: ' + EVN.mTotalAttended);
        });

        // jQuery Plugin Initialization

        var Uids = Object.keys(EVN.mData);

        for (var i = 0; i < Uids.length; i++) {
            Uid = Uids[i];

            if (EVN.mData[Uid].Status == "NOT_ATTENDED" || EVN.mData[Uid].Status == "CHECKED_OUT") {
                $("#status-" + Uid).click(function (event) {
                    Uid = event.target.id;
                    Uid = Uid.split('-');
                    Uid = Uid.pop();
                    EVN.CheckIn(Uid);
                    console.log("Successfully checked in " + Uid);
                });
            }

            $('#more-profile-' + Uid).click(function (event) {
                Uid = event.target.id;
                Uid = Uid.split('-');
                Uid = Uid.pop();
                EVN.ViewProfile(Uid);
            });

            $('#more-action-log-' + Uid).click(function (event) {
                Uid = event.target.id;
                Uid = Uid.split('-');
                Uid = Uid.pop();
                EVN.ViewActionLog(Uid);
            });

            $('#more-permissions-' + Uid).click(function (event) {
                Uid = event.target.id;
                Uid = Uid.split('-');
                Uid = Uid.pop();
                EVN.ViewPermissions(Uid);
            });

            $("#more-check-out-" + Uid).click(function (event) {
                Uid = event.target.id;
                Uid = Uid.split('-');
                Uid = Uid.pop();
                EVN.CheckOut(Uid);
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

        $('#staff-table').tablesorter();

        pCallback();
    });
}

EVN_Staff.prototype.LoadLogsTab = function (pCallback) {
    var EVN = this;

    firebase.database().ref().child('APPDATA').child('AuditLogs').once('value').then(function (snap) {
    var Data = snap.val().Staff.Log;
    var StaffLog = "";
    var StaffLogData = "";

    if (typeof Data != 'undefined') {
        StaffLogData = Data;
        StaffLogData = StaffLogData.split(' ');
        var TotalEntries = Object.keys(StaffLogData).length;
        var StaffLogEntry = "";
        for (var i = 0; i < TotalEntries; i++) {
            StaffLogEntry = StaffLogData[i];
            StaffLogEntry = StaffLogEntry.split('%');
            StaffLog += "<tr><td>" + StaffLogEntry[0] + "</td><td>" + StaffLogEntry[1] + "</td><td>" + StaffLogEntry[2] + "</td><td>" + StaffLogEntry[3] + "</td></tr>";
        }
    }
    $('#check-in-out-logs-table-body').html(StaffLog);
    if (EVN.mUser.HasPermission('ViewActionLog') || EVN.mUser.HasPermission('All')) {
        Data = snap.val().StaffAction.Log;
        var ActionLog = "";
        var ActionLogData = "";
    
        if (typeof Data != 'undefined') {
            ActionLogData = Data;
            ActionLogData = ActionLogData.split(' ');
            var TotalEntries = Object.keys(ActionLogData).length;
            var ActionLogEntry = "";
            for (var i = 0; i < TotalEntries; i++) {
                ActionLogEntry = ActionLogData[i];
                ActionLogEntry = ActionLogEntry.split('%');
                ActionLog += "<tr><td>" + ActionLogEntry[0] + "</td><td>" + ActionLogEntry[1] + "</td><td>" + ActionLogEntry[2] + "</td><td>" + ActionLogEntry[3] + "</td></tr>";
            }
        }
        $('#action-logs-table-body').html(ActionLog);
        $('#action-logs-list-tab').removeClass('disabled');
    } else {
        $('#action-logs-list').remove();
    }
    typeof pCallback === 'function' && pCallback();
    });
}

EVN_Staff.prototype.LoadPermissions = function (pCallback) {
    var EVN = this;

    firebase.database().ref().child('Permissions').once('value').then(function (snap) {
        if (EVN.mUser.HasPermission('ChangeAccountType') || EVN.mUser.HasPermission('All')) {
            var Keys = Object.keys(snap.val());
            var Entry = [];
            for (var i = 0; i < Keys.length; i++) {
                if (Keys[i] != 'INDEX') {
                    if (Keys[i] == EVN.mUser.mType) {
                        Entry.push('<option id="permission-type-option-' + Keys[i] + '" val="' + Keys[i] + '" selected>' + Keys[i] + '</option>');
                    } else {
                        Entry.push('<option id="permission-type-option-' + Keys[i] + '" val="' + Keys[i] + '">' + Keys[i] + '</option>');
                    }
                }
            }

            $('#permissions-type select').html(Entry);
            $('#permissions-type select').material_select();
        } else {
            $('#permissions-type select').attr('disabled', true);
            $('#permissions-type select').html('<option value="" disabled selected>' + EVN.mUser.mType + '</option>');
            $('#permissions-type select').material_select();
        }

        // Load permissions
        var PermissionIndex = Object.keys(snap.val().INDEX);
        var PermissionsTableContent = [];
        for (var i = 0; i < PermissionIndex.length; i++) {
            PermissionsTableContent.push("<tr id='permission_" + PermissionIndex[i] + "'" + "><td>" + PermissionIndex[i] + "</td><td>" + snap.val().INDEX[PermissionIndex[i]] +"</td><td id='permission-toggle-" + PermissionIndex[i] + "'><div class='switch'><label>Off<input type='checkbox'><span class='lever'></span>On</label></div></tr>");
        }
        $('#individual-permissions-table-body').html(PermissionsTableContent);
    });

    typeof pCallback === 'function' && pCallback();
}

EVN_Staff.prototype.LoadContent = function () {
    var EVN = this;
    var Hash = window.location.hash;
    Hash = Hash.toLowerCase();
    if (EVN.mUser.HasPermission('ViewStaff') || EVN.mUser.HasPermission('All')) {
        EVN.FillStaffListTable(function () {
            $('#loading-bar-wrapper').hide();
            $('#staff').show();
            EVN.LoadDatabaseListener();
        });

        EVN.LoadLogsTab($('.logs-tab').removeClass('disabled'));

        if (EVN.mUser.HasPermission('EditPermissions') || EVN.mUser.HasPermission('All')) {
            EVN.LoadPermissions();
        } else {
            $('#permissions-modal').remove();
        }

        if (EVN.mUser.HasPermission('ViewStaffStatistics') || EVN.mUser.HasPermission('All')) {
            // Stats panel
            //$('.statistics-tab').removeClass('disabled');
        } else {
            $('#statistics').remove();
        }

        if (EVN.mUser.HasPermission('CreateRegistrantRaffle') || EVN.mUser.HasPermission('DrawRegistrantRaffle') || EVN.mUser.HasPermission('All')) {
            // Load tools tab
            //$('.tools-tab').removeClass('disabled');
        } else {
            $('#tools').remove();
        }
    }
}

EVN_Staff.prototype.Load = function () {
    $('#staff').hide();
    $('#logs').hide();
    $('#statistics').hide();
    $('#tools').hide();
    $('#loading-bar-wrapper').show();

    var EVN = this;

    // Check user account type
    var EVN = this;
    EVN.mUser.Load(function () {
        if (EVN.mUser.HasPermission('ViewStaff') || EVN.mUser.HasPermission('All')) {
            EVN.LoadContent();
        }
        else {
            window.location = "registrants.html";
        }
    });
}