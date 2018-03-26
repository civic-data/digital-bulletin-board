// var password = prompt("Please enter password", "").split("");
// var crypt = password.map(function(n){return n.charCodeAt();});
// var doublecrypt = crypt.map(function(m){return m^250;});
// function getSum(t,i) {return t+i;};
// if((doublecrypt.reduce(getSum) ^ crypt.reduce(getSum))=== 1476){
  if(1476){
  Date.prototype.stdTimezoneOffset = function() {
    var jan = new Date(this.getFullYear(), 0, 1);
    var jul = new Date(this.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
  }
  Date.prototype.dst = function() {
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
  }

  const apiToken = "Uvxb0j9syjm3aI8h46DhQvnX5skN4aSUL0x_Ee3ty9M.ew0KICAiVmVyc2lvbiI6IDEsDQogICJOYW1lIjogIk5ZQyByZWFkIHRva2VuIDIwMTcxMDI2IiwNCiAgIkRhdGUiOiAiMjAxNy0xMC0yNlQxNjoyNjo1Mi42ODM0MDYtMDU6MDAiLA0KICAiV3JpdGUiOiBmYWxzZQ0KfQ";
  var date = new Date(), startYear = date.getFullYear(), startMonth = date.getMonth()+1, startDay = date.getDate(), startDate;
  var addZero = function(n) {return (n < 10) ? ("0" + n) : n;}
  startDate = startYear+"-"+addZero(startMonth)+"-"+addZero(startDay);
  $.ajax({
    type:"GET",
    dataType:"jsonp",
    url:"https://webapi.legistar.com/v1/nyc/events?token="+apiToken+"&$filter=EventDate+ge+datetime%27"+startDate+"%27&$orderby=EventDate+asc",
    success:function(hearings){
      hearings.sort(function(a,b){
        var aDate = a.EventDate.split("T")[0].split("-");
        var aTime = a.EventTime.split(" ")[0].split(":");
        var aAMPM = a.EventTime.split(" ")[1];
        aAMPM === "PM" && parseInt(aTime[0]) !== 12 ? aTime[0] = parseInt(aTime[0]) + 12 : aTime[0];
        var bDate = b.EventDate.split("T")[0].split("-");
        var bTime = b.EventTime.split(" ")[0].split(":");
        var bAMPM = b.EventTime.split(" ")[1];
        bAMPM === "PM" && parseInt(bTime[0]) !== 12 ? bTime[0] = parseInt(bTime[0]) + 12 : bTime[0];
        var aMS = new Date(aDate[0],(parseInt(aDate[1])-1),aDate[2],aTime[0],aTime[1]); 
        var bMS = new Date(bDate[0],(parseInt(bDate[1])-1),bDate[2],bTime[0],bTime[1]);
        return aMS.getTime() - bMS.getTime();
      });
      hearings.forEach(function(hearing){
        date = new Date(hearing.EventDate.split("T")[0].split("-")[0],hearing.EventDate.split("T")[0].split("-")[1]-1,hearing.EventDate.split("T")[0].split("-")[2])
        hearing.EventAgendaFile !== null ? agendaLink = hearing.EventAgendaFile : agendaLink = "#";
        if(hearing.EventAgendaStatusName.toLowerCase() !== "draft"){
          if(hearing.EventAgendaStatusName.toLowerCase() === "deferred"){
            var html = `
            <div class="agenda full-width" id="event-`+hearing.EventId+`">
              <p class="hdate align-center"><strong class="deferred">`+date.toLocaleDateString("en-US",{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })+`</strong>&nbsp;<span class="clean">DEFERRED</span></p>
              <table class="full-width">
                <tr>
                  <td class="hbody align-left deferred"><span>`+hearing.EventBodyName+`</span></td>
                  <td class="hbody-chair align-right deferred" data-body-id=`+hearing.EventBodyId+`></td>
                </tr>
                <tr>
                  <td id="heventid-`+hearing.EventId+`" class="hevent-items deferred" data-event-id=`+hearing.EventId+` colspan=2>
                  </td>
                </tr>
                <tr>
                  <td class="hlocation align-left deferred"><span>`+hearing.EventLocation+`</span></td>
                  <td class="htime align-right deferred"><span><s>`+hearing.EventTime+`</s></span></td>
                </tr>
              </table>
            </div>
            <hr>
            `;
          } else {
            var html = `
            <div class="agenda full-width" id="event-`+hearing.EventId+`">
              <p class="hdate align-center"><strong>`+date.toLocaleDateString("en-US",{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })+`</strong></p>
              <table class="full-width">
                <tr>
                  <td class="hbody align-left"><span>`+hearing.EventBodyName+`</span></td>
                  <td class="hbody-chair align-right" data-body-id=`+hearing.EventBodyId+`></td>
                </tr>
                <tr>
                  <td id="heventid-`+hearing.EventId+`" class="hevent-items" data-event-id=`+hearing.EventId+` colspan=2>
                  </td>
                </tr>
                <tr>
                  <td class="hlocation align-left"><span>`+hearing.EventLocation+`</span></td>
                  <td class="htime align-right"><span>`+hearing.EventTime+`</span></td>
                </tr>
              </table>
            </div>
            <hr>
            `;
          };
          $("#agenda-container").append(html);
        };
      });
    },
    complete:function(){
      $(".hbody-chair").each(function(){
        $.ajax({
          type:"GET",
          dataType:"jsonp",
          url:"https://webapi.legistar.com/v1/nyc/Bodies/"+$(this).attr("data-body-id")+"?token="+apiToken,
          success:function(committee){
            committee.BodyId === 1 ? $(".hbody-chair[data-body-id="+committee.BodyId+"]").html("<span><strong>Stated Meeting</strong></span>") : $(".hbody-chair[data-body-id="+committee.BodyId+"]").html("<span><strong>"+committee.BodyContactFullName.trim()+"</strong>, Chairperson</span>");
          }
        });
      });

      $(".hevent-items").each(function(){
        $.ajax({
          type:"GET",
          dataType:"jsonp",
          url:"https://webapi.legistar.com/v1/nyc/events/"+$(this).attr("data-event-id")+"/eventitems?token="+apiToken,
          success:function(items){
            var $list = $("<ul class='event-list-items'>");
            items.forEach(function(item){
              if(item.EventItemMatterFile === null){
                $list.append("<li><strong>"+item.EventItemTitle+"</strong></li>");
              } else {
                var itemBullet = item.EventItemTitle.split("\n")
                var html = ""
                itemBullet.forEach(function(bullet){
                  if(bullet.trim() !== "" && bullet.toLowerCase().includes("jointly")){
                    $("#event-"+item.EventItemEventId+" .hlocation span").append(" - <small><em>"+bullet+"</em></small")
                  } else if (bullet.trim() !== ""){
                    html += "<li>"+bullet+"</li>";
                  };
                });
                $list.append("<li><strong>"+item.EventItemMatterFile+"</strong>:<ul>"+html+"</ul></li>");
              };
            });
            $("#heventid-"+items[0].EventItemEventId).append($list);
          },
          complete:function(){
            $(".event-list-items").each(function(){
              if($(this).height() === 150){$(this).addClass("scrollable");};
            });
          }
        });
      });
    }
  });

  $(window).on("load", function(){
    $(window).scrollTop(0);
    var stop, scrolling = false;
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
    setTimeout(function(){
      location.reload();
    },3600000);
  });
};