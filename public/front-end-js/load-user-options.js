// ----fetches all options in user's cookies-------

function renderUserOptions() {

  // gets list of option Objects
  // once option is activated, smart contract is updated so will change upon refresh.
  userOptionInfo = getUserOptionInfo();
  populateUserOptions(userOptionInfo);
  }

}

// options is list of all option objects...
//TODO(moezinia) DISPLAY SOMEWHERE!!!
function populateUserOptions(options) {
  $.get('/static/ejs/option-item.ejs', function (template) {
    // only display.. if active, < maturity time, inactive < cancellatioTime...

    let optionItemTemplate = ejs.compile(template);
    let scrollTop = 0;
    for (let i = 0; i < options.length; i++) {
      //TODO(moezinia) get RIGHT DIV
      $('#options').append(optionItemTemplate(options[i]));
    }
    // rebindEventHandlers();
    // recalcAnimations();
    $("body").animate({ scrollTop: $(document).height() }, 700);
  });
}
