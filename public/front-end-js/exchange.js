var controller = new ScrollMagic.Controller();
var scenes = { };
var rtime = new Date();
var timeout = false;
var delta = 200;

$(window).ready(function() {
  recalculateOptionPrices();

  $(".date").click(function() {
    if ($(this).hasClass("selected"))
      return;
    $(".date").removeClass("selected");
    $(this).addClass("selected");
    recalculateOptionPrices();
  });
});


// TODO(eforde): Fetch real data from order book
function recalculateOptionPrices() {
  let selectedDate = $(".date.selected").text();
  let timeUntilExpiry = new Date(selectedDate).getTime() - new Date().getTime();
  let val = Math.sqrt(timeUntilExpiry / 60 / 60 / 4) / 10000;
  let options = [];
  for (let i = 0; i < 60; i++) {
    options.push({strike: 600 + i * 10, premium: 0 + i * .005 + val});
  }
  populateOptions(options, currentETHPriceUSD);
}

function populateOptions(options, currentPrice) {
  $('#options').empty();
  $.get('/static/ejs/option-item.ejs', function (template) {
    let optionItemTemplate = ejs.compile(template);
    let scrollTop = 0;
    for (let i = 0; i < options.length; i++) {
      $('#options').append(optionItemTemplate(options[i]));
      // Add current price marker
      if (currentPrice > options[i].strike &&
          (i + 1) < options.length &&
          currentPrice <= options[i + 1].strike) {
        $('#options').append(optionItemTemplate({currentPrice: currentPrice}));
      }
    }
    rebindEventHandlers();
    recalcAnimations();
    $("#current-price-marker")[0].scrollIntoView({
      behavior: "smooth",
    });
  });
}

function rebindEventHandlers() {
  $("#options .option-item:not(#current-price-marker)").click(function() {
    let strike = $(this).attr("data-strike");
    let selectedDate = $(".date.selected").text();
    window.location = "/trade?strike=" + strike + "&date=" + selectedDate;
  });
}

$(window).resize(function() {
  // recalculate scrolling animations when the window size changes
  rtime = new Date();
  if (timeout === false) {
      timeout = true;
      setTimeout(recalcAnimations, delta); //make sure scrolling is "done"
  }
});

function vals(dict) {
  return Object.keys(dict).map(function(key){
      return dict[key];
  });
} 

function recalcAnimations() {
  if (new Date() - rtime >= delta) {
    // remove old scenes
    timeout = false;
    Object.keys(scenes).forEach(function(k) {
        scenes[k].destroy();
    });
    let scrollTop = $("body").scrollTop();
    $("body").scrollTop(0);
    controller.removeScene(vals(scenes));
    scenes = { };
    $("#options").css("margin-top", "0px");

    // create new scenes
    let scrollHeight = $(document).height() - $(window).height();
    let duration = $(window).height() / 2; // how long it takes the animation to complete
    $(".option-item").each(function(s) { //generate new animations
      s += 1;
      let tween = TweenMax.fromTo(
        '.option-item:nth-last-child(' + s + ')', 0.5,
        { autoAlpha: 0.8, scale: 0.99 }, { autoAlpha: 1, scale: 1 }
      );
      let scene = (new ScrollMagic.Scene({ offset: (1 - s) * 85 + scrollHeight, duration }))
        .setTween(tween);
      scenes[s] = scene;
    });
    $("body").scrollTop(scrollTop);
    controller.addScene(vals(scenes));
  }
  else {
    setTimeout(recalcAnimations, delta);
  }           
}