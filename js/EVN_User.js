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
    this.mPermissions = {};
}

EVN_User.prototype.GetUsername = function () {
    var Username = firebase.auth().currentUser.email;
    Username = Username.split('.');
    Username = Username.join('');
    return Username;
}

// Returns true if user has pPermission
EVN_User.prototype.HasPermission = function(pPermission) {
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

EVN_User.prototype.CreateFirebaseEntry = function (pUid, pType, pCallback) {
    var USER = this;
    var Username = USER.GetUsername();
    firebase.database().ref().child('APPDATA').child('Users').child(pUid).set({
        Uid: pUid,
        Username: Username,
        Type: pType
    });
    
    USER.mUid = pUid;
    USER.mUsername = Username;
    USER.mType = pType;

    firebase.database().ref().child('Permissions').once('value').then(function (snap) {
        USER.mPermissions = snap.val()[USER.mType];
        //console.log(USER);
        
        pCallback();
    });
}

EVN_User.prototype.Load = function (pUid, pCallback) {
    var USER = this;
    firebase.database().ref().child('APPDATA').child('Users').once('value').then(function (snap) {
        if (typeof snap.val()[pUid] != 'undefined') {
            var UserData = snap.val()[pUid];
            USER.mUid = UserData.Uid;
            USER.mUsername = UserData.Username;
            USER.mType = UserData.Type;
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
                pCallback();
                //console.log(USER);
            });
        }
        else {
            USER.CreateFirebaseEntry(pUid, 'STAFF', pCallback);
        }
    });
}