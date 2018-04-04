$(window).on("load",function(){
  $(window).scrollTop(0);
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
      clearTimeout(stop);
      $('html, body').stop();
      stop = setTimeout(function(){
        scrollToBottom();
      },10000);
    };
  });
  
  $("#seal-header img").click(function(e){
    e.stopPropagation();
    scrolling = !scrolling;
    if(scrolling){
      scrollToBottom();
    } else {
      clearTimeout(stop);
      $('html, body').stop();
    };
  });
});