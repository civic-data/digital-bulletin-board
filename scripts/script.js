Date.prototype.stdTimezoneOffset = function() {
  var jan = new Date(this.getFullYear(), 0, 1);
  var jul = new Date(this.getFullYear(), 6, 1);
  return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}
Date.prototype.dst = function() {
  return this.getTimezoneOffset() < this.stdTimezoneOffset();
}

const apiToken = "Uvxb0j9syjm3aI8h46DhQvnX5skN4aSUL0x_Ee3ty9M.ew0KICAiVmVyc2lvbiI6IDEsDQogICJOYW1lIjogIk5ZQyByZWFkIHRva2VuIDIwMTcxMDI2IiwNCiAgIkRhdGUiOiAiMjAxNy0xMC0yNlQxNjoyNjo1Mi42ODM0MDYtMDU6MDAiLA0KICAiV3JpdGUiOiBmYWxzZQ0KfQ";
var date;
new Date().dst() ?  date = new Date(new Date().getTime() - 4 * 3600 * 1000) : date = new Date(new Date().getTime() - 5 * 3600 * 1000)
var startDate, startYear = date.getFullYear(), startMonth = date.getMonth()+1, startDay = date.getDate(), agendaLink;
var addZero = function(n) {return (n < 10) ? ("0" + n) : n;}

startDate = startYear+"-"+addZero(startMonth)+"-"+addZero(startDay);

$.ajax({
  type:"GET",
  dataType:"jsonp",
  url:"https://webapi.legistar.com/v1/nyc/events?token="+apiToken+"&$filter=EventDate+ge+datetime%27"+startDate+"%27&$orderby=EventDate+asc",
  success:function(hearings){
    // function timeConverter(timeString){
    //   var hr = parseInt(timeString.split(" ")[0].split(":")[0]);
    //   var min = parseInt(timeString.split(" ")[0].split(":")[1]);
    //   var ampm = timeString.split(" ")[1];
    //   ampm.toLowerCase() === "am" || (ampm.toLowerCase() === "pm" && hr === 12) ? hr = hr * 100 : hr = (hr+12) * 100;
    //   return hr+min;
    // };
    hearings.forEach(function(hearing){
      // midDay = hearing.EventTime.split(" ")[1];
      // meetingHour = parseInt(hearing.EventTime.split(" ")[0].split(":")[0]);
      // meetingMinute = parseInt(hearing.EventTime.split(" ")[0].split(":")[1]);
      date = new Date(hearing.EventDate.split("T")[0].split("-")[0],hearing.EventDate.split("T")[0].split("-")[1]-1,hearing.EventDate.split("T")[0].split("-")[2])
      hearing.EventAgendaFile !== null ? agendaLink = hearing.EventAgendaFile : agendaLink = "#";
      if(hearing.EventAgendaStatusName.toLowerCase() !== "draft"){
        if(hearing.EventAgendaStatusName.toLowerCase() === "deferred"){
          var html = `
          <div class="agenda full-width">
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
                <td class="htime align-right"><span><s>`+hearing.EventTime+`</s> Deferred</span></td>
              </tr>
            </table>
          </div>
          <hr>
          `;
        } else {
          var html = `
          <div class="agenda full-width">
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
          $("#agenda-container").append(html);
        };
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
          if(committee.BodyId === 1){
            $(".hbody-chair[data-body-id="+committee.BodyId+"]").html("<span><strong>Stated Meeting</strong></span>");
          } else {
            $(".hbody-chair[data-body-id="+committee.BodyId+"]").html("<span><strong>"+committee.BodyContactFullName.trim()+"</strong>, Chairperson</span>");
          };
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
              $list.append("<li><strong>"+item.EventItemMatterFile+"</strong>  &#8212; "+item.EventItemTitle+"</li>");
            }
          })
          $("#heventid-"+items[0].EventItemEventId).append($list);
        },
        complete:function(){
          $(".event-list-items").each(function(){
            if($(this).height() === 150){
              $(this).addClass("scrollable");
            };
          });
        }
      });
    });
  }
});