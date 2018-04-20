const apiToken = "Uvxb0j9syjm3aI8h46DhQvnX5skN4aSUL0x_Ee3ty9M.ew0KICAiVmVyc2lvbiI6IDEsDQogICJOYW1lIjogIk5ZQyByZWFkIHRva2VuIDIwMTcxMDI2IiwNCiAgIkRhdGUiOiAiMjAxNy0xMC0yNlQxNjoyNjo1Mi42ODM0MDYtMDU6MDAiLA0KICAiV3JpdGUiOiBmYWxzZQ0KfQ", todayDate = new Date();
var startYear = todayDate.getFullYear(), startMonth = todayDate.getMonth()+1, startDay = todayDate.getDate(), startDate, html;
var addZero = function(n) {return (n < 10) ? ("0" + n) : n;};
startDate = startYear+"-"+addZero(startMonth)+"-"+addZero(startDay);
$.ajax({
  type:"GET",
  dataType:"jsonp",
  url:"https://webapi.legistar.com/v1/nyc/events?token="+apiToken+"&$filter=EventDate+ge+datetime%27"+startDate+"%27&$orderby=EventDate+asc",
  success:function(hearings){
    //turn times into milliseconds and sort
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
      date = new Date(hearing.EventDate.split("T")[0].split("-")[0],hearing.EventDate.split("T")[0].split("-")[1]-1,hearing.EventDate.split("T")[0].split("-")[2]);
      hearing.EventAgendaFile !== null ? agendaLink = hearing.EventAgendaFile : agendaLink = "#";
      //Only show meetings not in draft
      if(hearing.EventAgendaStatusName.toLowerCase() !== "draft"){
        //If meeting deferred everything is struckthrough
        if(hearing.EventAgendaStatusName.toLowerCase() === "deferred"){
          html = `
          <div class="agenda full-width" id="event-`+hearing.EventId+`">
            <p class="hdate align-center"><strong class="deferred">`+date.toLocaleDateString("en-US",{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })+`</strong>&nbsp;<span class="clean">DEFERRED</span></p>
            <table class="full-width">
              <tr>
                <td class="hbody align-left v-bottom deferred"><span>`+hearing.EventBodyName+`</span></td>
                <td class="hbody-chair align-right v-bottom deferred" data-body-id=`+hearing.EventBodyId+`></td>
              </tr>
              <tr>
                <td id="heventid-`+hearing.EventId+`" class="hevent-items deferred" data-event-id=`+hearing.EventId+` colspan=2>
                </td>
              </tr>
              <tr>
                <td class="hlocation align-left v-bottom deferred"><span>`+hearing.EventLocation+`</span></td>
                <td class="htime align-right v-bottom deferred"><span><s>`+hearing.EventTime+`</s></span></td>
              </tr>
            </table>
          </div>
          <hr>`;
        } else {
          html = `
          <div class="agenda full-width" id="event-`+hearing.EventId+`">
            <p class="hdate align-center"><strong>`+date.toLocaleDateString("en-US",{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })+`</strong></p>
            <table class="full-width">
              <tr>
                <td class="hbody align-left v-bottom"><span>`+hearing.EventBodyName+`</span></td>
                <td class="hbody-chair align-right v-bottom" data-body-id=`+hearing.EventBodyId+`></td>
              </tr>
              <tr>
                <td id="heventid-`+hearing.EventId+`" class="hevent-items" data-event-id=`+hearing.EventId+` colspan=2>
                </td>
              </tr>
              <tr>
                <td class="hlocation align-left v-bottom"><span>`+hearing.EventLocation+`</span></td>
                <td class="htime align-right v-bottom"><span>`+hearing.EventTime+`</span></td>
              </tr>
            </table>
          </div>
          <hr>`;
        }; // end inner if else from line 30
        //post all agendas into container
        $("#agenda-container").append(html);
      }; //end outer if from line 28
    }); //end hearings.each from line 24
  }, //end success from line 9
  complete:function(){
    //Fill in correct chair person's name
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

    //Fill box with associated agenda items
    $(".hevent-items").each(function(){
      $.ajax({
        type:"GET",
        dataType:"jsonp",
        url:"https://webapi.legistar.com/v1/nyc/events/"+$(this).attr("data-event-id")+"/eventitems?token="+apiToken,
        success:function(items){
          var $list = $("<ul class='event-list-items'>");
          items.forEach(function(item){
            if(item.EventItemMatterFile === null){
              //If hearing has multiple committees append the end of hearing location
              if(item.EventItemTitle){
                if (item.EventItemTitle.toLowerCase().includes("jointly")){
                  $("#event-"+item.EventItemEventId+" .hlocation span").append(" - <small><em>"+item.EventItemTitle+"</em></small");
                } else {
                  $list.append("<li><strong>"+item.EventItemTitle+"</strong></li>");
                };
              };
            } else {
              var itemBullet = item.EventItemTitle.split("\n"), innerHtml = "";
              itemBullet.forEach(function(bullet){
                //If hearing has multiple committees append the end of hearing location
                if(bullet.trim() !== "" && bullet.toLowerCase().includes("jointly")){
                  $("#event-"+item.EventItemEventId+" .hlocation span").append(" - <small><em>"+bullet+"</em></small");
                } else if (bullet.trim() !== ""){
                  innerHtml += "<li>"+bullet+"</li>";
                };
              });
              $list.append("<li><strong>"+item.EventItemMatterFile+"</strong>:<ul>"+innerHtml+"</ul></li>");
            };
          });
          $("#heventid-"+items[0].EventItemEventId).append($list);
        }, //end success from line 97
        complete:function(){
          //If agenda item exceeds certain height, make it scrollabe
          $(".event-list-items").each(function(){
            if($(this).height() === 150){$(this).addClass("scrollable");};
          });
        } //end success from line 123
      });
    });
  } //end complete from line 78
});