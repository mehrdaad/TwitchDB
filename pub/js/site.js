$(document).ready(function() {
  //live streams client side logic
  $('.dropdown-button').dropdown({
    inDuration: 500,
    outDuration: 500,
    hover: true,
  }
);

//functions
function inarray(value, array) {
  return array.indexOf(value) > -1;
}


function paginate(div, route, cb) {
    var scrollFunction = function(){
        if ($(window).scrollTop() + $(window).height() == $(document).height()) {
            $(window).unbind("scroll");
            totaldivs = $(div+" .livestream").size();
            $.get("/api/"+route, {start: totaldivs, end: totaldivs + 12}, function(data) {
              $(window).scroll(scrollFunction);
              cb(data);
            });
        }
    };
    $(window).scroll(scrollFunction);
};

// var loading = false;
// function paginate(div, route, cb) {
//   console.log("hello there");
//   $(window).scroll(function() {
//     if(!loading) {
//       if($(window).scrollTop() + $(window).height() == $(document).height()) {
//         loading = true;
//         totaldivs = $(div+" .livestream").size();
//         $.get("/api/"+route, {start: totaldivs, end: totaldivs + 12}, function(data) {
//           loading = false;
//           cb(data);
//         });
//       }
//     }
//   });
// }
function shufflechildren(div, frompost) {
  var parent = $(div);
  if(frompost) {
    var divs = parent.children().slice(-12);
  } else {
    var divs = parent.children();
  }
  while (divs.length) {
    parent.append(divs.splice(Math.floor(Math.random() * divs.length), 1)[0]);
  }
}

// Admin client side logic
$('.admin-approve, .admin-reject').click(function(e) {
  e.preventDefault();
  var twitchname = $(this).data("user");
  var status = $(this).data("status");
  $.post("/admin/submit", {"twitchname": twitchname, "intro_status": status}, function(data) {
    $('.row-'+twitchname).fadeOut("slow");
    Materialize.toast(data, 3000, 'rounded')
  });
});
$('.admin-submit-search').click(function(e) {
  e.preventDefault();
  var namesearch = $('#admin_search').val();
  $.post("/admin/tools", {"username": namesearch}, function(data) {
    $("#result_twitchname").val(data.twitchname);
    $("#result_redditname").val(data.redditname);
    $(".search-results").fadeIn(1500);
  });
});
$('.admin-modify-user').click(function(e) {
  e.preventDefault();
  var status = $('input[name="searchgroup"]:checked').val();
  var twitchname = $("#result_twitchname").val();
  var redditname = $("#result_redditname").val();
  $.post("/admin/tools/update", {"twitchname": twitchname, "redditname": redditname, "intro_status": status}, function(data) {
    Materialize.toast(data, 3000, 'rounded')
  });
});


//profile nav click logic
$('.profile-tab li a').click(function(e) {
  history.pushState(null, null, $(this).data('location'));
});

//default streams view state


//stereams view state on click
$('.streams-tab li a').click(function(e) {
  $(window).unbind("scroll");
  var location = $(this).data('location').replace('/', '');
    $('.livestream').hide().fadeIn(2000);
  switch(location) {
    case "random":
    $.get("/api/top", function(data) {
      $('#random').empty();
      $(data).hide().appendTo("#random").fadeIn(3000);
      shufflechildren("#random", false);
    });
    paginate("#random", "top", function(res) {
      shufflechildren("#random", true);
      $(res).hide().appendTo("#random").fadeIn(3000); // we need to figure out a diff shuffle method, possibly shuffling the contents of res instead of shuffling child elements
    });
    break;
    case "mature":
    $.get("/api/mature", function(data) {
      $('#mature').empty();
      $(data).hide().appendTo("#mature").fadeIn(3000);
    });
    paginate("#mature", "mature", function(res) {
      $(res).hide().appendTo("#mature").fadeIn(3000);
    });
    break;
    case "family":
    $.get("/api/family", function(data) {
      $('#family').empty();
      $(data).hide().appendTo("#family").fadeIn(3000);
    });
    paginate("#family", "family", function(res) {
      $(res).hide().appendTo("#family").fadeIn(3000);
    });
    break;
    default:
    $.get("/api/top", function(data) {
      $('#top').empty();
      $(data).hide().appendTo("#top").fadeIn(3000);
    });
    paginate("#top", "top", function(res) {
      $(res).hide().appendTo("#top").fadeIn(3000);
    });
    break;
  }
  history.pushState(null, null, $(this).data('location'));
});

//subnav click/routing logic
switch(window.location.pathname.replace(/\/$/, "")) {
  case "/profile":
    $('ul.tabs').tabs('select_tab', 'profile_overview')
  break;
  case "/profile/edit":
    $('ul.tabs').tabs('select_tab', 'profile_edit');
  break;
  case "/profile/feedback":
    $('ul.tabs').tabs('select_tab', 'profile_feedback');
  break;
  case "/mature":
    $('ul.tabs').tabs('select_tab', 'mature');
  break;
  case "/family":
    $('ul.tabs').tabs('select_tab', 'family');
  break;
  case "/random":
    $('ul.tabs').tabs('select_tab', 'random');
  break;
  case "/votes":
    $('ul.tabs').tabs('select_tab', 'votes');
  break;
  case "/game":
    $('ul.tabs').tabs('select_tab', 'game');
  break;
  default:
    $('ul.tabs').tabs('select_tab', 'top');
  break;
}

//profile create/edit logic
$(".profile_edit").click(function(e) {
  e.preventDefault();
  var date = new Date();
  var profile_object = {
    twitchname: $("#profile_twitchname").val(),
    redditname: $("#profile_redditname").val(),
    intro_date: (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear(),
    profile_data: {
      intro_about: $("#profile_about").val(),
      intro_schedule: $("#profile_schedule").val(),
      intro_games: $("#profile_games").val(),
      intro_goals: $("#profile_goals").val(),
      intro_background: $("#profile_background").val(),
    }

  }
  $.post("/profile/submit", profile_object, function(data) {
    Materialize.toast(data, 3000, 'rounded', function() {
      window.location.href = "/profile/edit";
    })
  });
});


//database search logic
$('#searchdb').keypress(function(e) {
  if(e.which == 13) {
    var keyvalue = $(this).val();
    $.get("/api/search", {search: keyvalue}, function(data) {
      if(data) {
        $('.searchresults').empty();
        $('.searchresults').html(data);
      } else {
        Materialize.toast("Could not find a result or not enough search info", 3000, 'rounded')
      }

    });
  }
});

// other shizz
$('.modal-trigger').leanModal();

})