$(window).on("load",function(){
  var stop, scrolling = false;
  var windowOpenTime = new Date();
  var refreshTime = new Date(windowOpenTime.getFullYear(),windowOpenTime.getMonth(),windowOpenTime.getDate(),(windowOpenTime.getHours()+1));
  var countdown = refreshTime.getTime() - windowOpenTime.getTime();
  setTimeout(function(){
    window.location.href = window.location.href;
  },countdown);

  function scrollToBottom(){
    $('html, body').animate({ 
      scrollTop: $(document).height()-$(window).height()}, 
      (($(document).height()-$(window).height()-$(window).scrollTop())*30),
      "linear",
      function(){
        $(window).scrollTop(0);
        scrollToBottom();
      }
    );
  };

  $(window).on("click",function(){
    if(scrolling){
      $("#scroll-status").html("paused <i class='fas fa-pause v-middle'></i>").css({"background-color":"rgba(194,0,26,.5)"});
      clearTimeout(stop);
      $('html, body').stop();
      stop = setTimeout(function(){
        scrollToBottom();
        $("#scroll-status").html("on <i class='fas fa-play v-middle'></i>").css({"background-color":"rgba(38,171,1,.5)"});
      },10000);
    };
  });

  $(window).on("touchmove",function(){
    if(scrolling){
      $("#scroll-status").html("paused <i class='fas fa-pause v-middle'></i>").css({"background-color":"rgba(194,0,26,.5)"});
      clearTimeout(stop);
      $('html, body').stop();
      stop = setTimeout(function(){
        scrollToBottom();
        $("#scroll-status").html("on <i class='fas fa-play v-middle'></i>").css({"background-color":"rgba(38,171,1,.5)"});
      },10000);
    };
  });
  
  $("#scroll").click(function(e){
    e.stopPropagation();
    scrolling = !scrolling;
    if(scrolling){
      $("#scroll-status").html("on <i class='fas fa-play v-middle'></i>").css({"background-color":"rgba(38,171,1,.5)"});
      scrollToBottom();
    } else {
      clearTimeout(stop);
      $('html, body').stop();
      $("#scroll-status").html("off <i class='fas fa-stop v-middle'></i>").css({"background-color":"rgba(194,0,26,.5)"});
    };
  });

  setTimeout(function(){
    $(window).scrollTop(0);
    $("#scroll").trigger("click");
  },100)
});