$(window).on("load",function(){
  var windowOpenTime = new Date();
  var refreshTime = new Date(windowOpenTime.getFullYear(),windowOpenTime.getMonth(),windowOpenTime.getDate(),(windowOpenTime.getHours()+1));
  var countdown = refreshTime.getTime() - windowOpenTime.getTime();
  setTimeout(function(){
    window.location.href = window.location.href;
  },countdown);
});