var controller = new ScrollMagic.Controller();
var scenes = { };
var rtime = new Date();
var timeout = false;
var delta = 200;

$(window).ready(function() {
  let options = [];
  for (let i = 0; i < 100; i++) {
    options.push({strike: 300 + i * 10, premium: .1 + i * .1});
  }
  populateOptions(options, 450);
});

// TODO(eforde): Call this with real data from order book
function populateOptions(options, currentPrice) {
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
    // TODO(eforde): scroll to current price
    $("body").animate({ scrollTop: $(document).height() }, 700);
  });
}

function rebindEventHandlers() {
  $("#options .option-item:not(#current-price-marker)").click(function() {
    let strike = $(this).attr("data-strike");
    // TODO(eforde): redirect to proper trade page
    window.location = "/trade?strike=" + strike + "&date=5/5";
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
        { autoAlpha: 0.8, scale: 0.95 }, { autoAlpha: 1, scale: 1 }
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