/*
EVENTMAN (EVN)
-COPYRIGHT NOTICE-
Eventman Copyright (c) 2017 Sean Kee - All Rights Reserved.

Unauthorized copying or reproduction of this file is strictly prohibited.

Visit https://mrskee.github.io/ for more information.
Sean Kee <skee66499@gmail.com>
*/

var EVN_Version = "PROTOTYPE v0.20.0";

class User {
    constructor() {
        this.mUser = null;
        this.mID = null;
        this.mName = null;
        this.mEmail = null;
    }

    Reset() {
        this.mID = null;
        this.mName = null;
        this.mEmail = null;
    }
}

var gUser = new User();
var AUTH = null;

// Called on load
(function () {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyALLUIoRJcStxtFHuZbUssDnWHwuWwOu1s",
        authDomain: "eventman-fc568.firebaseapp.com",
        databaseURL: "https://eventman-fc568.firebaseio.com",
        projectId: "eventman-fc568",
        storageBucket: "eventman-fc568.appspot.com",
        messagingSenderId: "60194496673"
    };
    firebase.initializeApp(config);

    AUTH = firebase.auth();
    gUser.User = AUTH.currentUser;

    // Get element IDs
    const LoginForm = $('#LoginForm');
    const ButtonLogIn = $('#ButtonLogIn');
    const ButtonLogOut = $('#ButtonLogOut');
    const ButtonUpdatePassword = $('#ButtonUpdatePassword');

    // LogIn Event
    ButtonLogIn.click(function (e) {
        LogInUser(e);
    });

    // Enter key event listener
    LoginForm.keypress(function (e) {
        if (e.which == 13) {
            LogInUser(e);
            return false;
        }
    });

    // LogOut Event
    ButtonLogOut.click(function (e) {
        LogOutUser(e);
    });

    ButtonUpdatePassword.click(function (e) {
        UserUpdatePassword(e);
    });

    // Listener
    AUTH.onAuthStateChanged(firebaseUser => {
        if (firebaseUser) {
            console.log("Currently logged in as " + firebase.auth().currentUser.email);
            gUser.User = AUTH.currentUser;
            gUser.User.providerData.forEach(function (pProfile) {
                gUser.ID = pProfile.uID;
                gUser.Name = pProfile.displayName;
                gUser.mEmail = pProfile.email;
            });
        } else {
            gUser.Reset();
        }
    });
}());

function LogInUser(pError) {
    const EmailInput = $('#EmailField');
    const PasswordInput = $('#PasswordField');

    AUTH.signInWithEmailAndPassword(EmailInput.val(), PasswordInput.val()).then(function () {
        IsSuccess();
    }).catch(function (pError) {
        //console.log(e.message);
        var ErrorCode = pError.code;
        if (ErrorCode == 'auth/user-not-found' || ErrorCode == 'auth/wrong-password') {
            $('#login-error').html('<strong>Error:</strong> Email or password is incorrect/');
            $('#login-error').collapse('show');
        }
        if (ErrorCode == 'auth/invalid-email') {
            $('#login-error').html('<strong>Error:</strong> Invalid email.');
            $('#login-error').collapse('show');
        }
        if (ErrorCode == 'auth/user-disabled') {
            $('#login-error').html('<strong>Error:</strong> Your account is disabled. Please contact an administrator.');
            $('#login-error').collapse('show');
        }
    });
}

function LogOutUser(pError) {
    window.location = "../Eventman/logout.html";
    AUTH.signOut();
    gUser.Reset();
}

function UserUpdatePassword(pError) {
    const UpdatePasswordForm = $('#UpdatePasswordForm')
    const NewPasswordInput = $('#NewPasswordField');
    const ConfirmNewPasswordInput = $('#ConfirmNewPasswordField');
    
    if (NewPasswordInput.val() == ConfirmNewPasswordInput.val()) {
        if (NewPasswordInput.val().length < 8) {
            Materialize.toast("Error! Password is too short", 4000, "toast-fix");
        }
        else {
            AUTH.currentUser.updatePassword(NewPasswordInput.val()).then(function () {
                Materialize.toast("Password change successful", 4000, "toast-fix");
                UpdatePasswordForm[0].reset();
            }).catch(pError => console.log(pError.message));
        }
    }
    else {
        Materialize.toast("Error! Passwords don't match", 4000, "toast-fix");
    }
}

// Redirect upon success
function IsSuccess() {
    window.location = "registrants.html";
}

function IsFailure() {
    window.location = "index.html";
}