setInterval(function () {
  $.getJSON('/vshell/index.php?type=services&mode=json', function(data) { $.each(data, function () { 
    service = this["service_description"];
    state = this["current_state"]; 
    $("#service"+service).removeClass("statusOK statusCRITICAL statusERROR statusWARNING"); 
    $("#service"+service).addClass("status"+state); 
    $("#lastUpdated").html('Last Updated at '+new Date().toLocaleTimeString())
  }) })
}, 5000)

setInterval(function() {
	$.getJSON('http://www.google.com/calendar/feeds/sheffield.ac.uk_5i8cmsq79qd3nm5spk9ftkol0k@group.calendar.google.com/public/full?alt=json-in-script&callback=?&orderby=starttime&max-results=15&singleevents=true&sortorder=ascending&futureevents=true'), function(data) { console.debug(JSON.stringify(data))}
},3000)