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

updateNagios();
setInterval( updateNagios(), 5000 );

function updateGoogleCalendar() {
	$('#calendar table').empty();

	var out = '';

	$.getJSON('http://www.google.com/calendar/feeds/sheffield.ac.uk_5i8cmsq79qd3nm5spk9ftkol0k@group.calendar.google.com/public/full?alt=json-in-script&callback=?&orderby=starttime&max-results=15&singleevents=true&sortorder=ascending&futureevents=true', function (data) { 
	  $.each(data["feed"]["entry"], function(value, data) { 
	  calDate = new Date(data["gd$when"][0]["startTime"]);
	  dateString = calDate.getDate() + "/" + (calDate.getMonth()+1);
	  $('#calendar').append("<tr><td class='date'>"+dateString+"</td><td class='event'>"+data["title"]["$t"]+"</td></tr>\n");
	})
  })
}

updateGoogleCalendar();
setInterval( updateGoogleCalendar,900000);