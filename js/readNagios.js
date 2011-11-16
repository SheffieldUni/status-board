function updateNagios() {
  $.getJSON('/vshell/index.php?type=services&mode=json', function(data) { 
	  $.each(data, function () { 
        service = this["service_description"];
        state = this["current_state"]; 
        $("#service"+service).removeClass("statusOK statusCRITICAL statusERROR statusWARNING"); 
        $("#service"+service).addClass("status"+state); 
        $("#lastUpdated").html('Last Updated at '+new Date().toLocaleTimeString());
      }) 
  });
}

function updateGoogleCalendar() {
	$('#calendar table').empty();

	var out = '';

	$.getJSON('http://www.google.com/calendar/feeds/sheffield.ac.uk_5i8cmsq79qd3nm5spk9ftkol0k@group.calendar.google.com/public/full?alt=json-in-script&callback=?&orderby=starttime&max-results=10&singleevents=true&sortorder=ascending&futureevents=true', function (data) { 
	  $.each(data["feed"]["entry"], function(value, data) { 
	  calDate = new Date(data["gd$when"][0]["startTime"]);
	  dateString = calDate.getDate() + "/" + (calDate.getMonth()+1);
	  event = data["title"]["$t"].replace(/([^,]+),?.*/,'$1');
	  $('#calendar').append("<tr><td class='date'>"+dateString+"</td><td class='event'>"+event+"</td></tr>\n");
	})
  })
}

function updateSignificantEvent() {
  $('#comingup').empty();

  var out = '';

  $.getJSON( 'http://www.google.com/calendar/feeds/sheffield.ac.uk_8v8avojjrlk1lot2lkpl47fn0k@group.calendar.google.com/public/full?alt=json-in-script&callback=?&orderby=starttime&max-results=1&singleevents=true&sortorder=ascending&futureevents=true', function (data) { 
    entry = data["feed"]["entry"][0]
    calDate = new Date(entry["gd$when"][0]["startTime"]);
    calDate.setHours(0);
    calDate.setMinutes(0);
    calDate.setSeconds(0);
    todayDate = new Date();
    days = Math.floor((calDate - todayDate) / 1000 / 3600 / 24);
    if (days < 1) { remaining = "today"; }
    else if (days == 1) { remaining = "tomorrow"; }
    else { remaining = "in "+days+" days"; }
    outString = entry["title"]["$t"].replace(/(SIGNIFICANT: )([^-]+ - )(.+)/,"$3");
    $('#comingup').append("Major work to <b>"+outString+"</b> "+remaining+"\n");
  })
}

$(document).ready( function () {
  updateNagios();
  setInterval( updateNagios, 5000 );
  updateGoogleCalendar();
  setInterval( updateGoogleCalendar,900000);
  updateSignificantEvent();
  setInterval( updateSignificantEvent,900000);
})

