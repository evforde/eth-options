// ----fetches all options in user's cookies-------

function loadUserOptions() {

  // gets list of option Objects
  userOptionInfo = getUserOptionInfo();
  for (var i = 0; i < userOptionInfo.length; i++) {
    opt = userOptionInfo[i];

    //TODO(moezinia) DISPLAY SOMEWHERE!!!
    //$.("myoptionsRow") or whatever... in dashboard.ejs
    // only display.. if active, < maturity time
  }

}
