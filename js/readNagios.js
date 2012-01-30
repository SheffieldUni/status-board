function updateNagios() {
  // Get all LIs in the "stats" div
  var serviceNames = new Array()
  $("#stats li").each( function() { 
    serviceNames.push( this.id.match(/^service([0-9a-zA-Z -]+)$/)[1] )
  } )
  
  $.getJSON('/vshell/index.php?type=services&mode=json', function(data) {
    $.each(data, function () {
      console.log(this)
      // is this element one of our services?
      var service = this["service_description"]
      if ( serviceNames.indexOf(this["service_description"]) != -1 ) {
        var serviceID = this["serviceID"]
        $.getJSON('/vshell/index.php?type=servicedetail&serviceID='+serviceID+'&mode=json', function (data) {
          console.log(this)
          if (this["StateType"] == "Hard") {
            state = this["current_state"];
            $("#service"+service).removeClass("statusOK statusCRITICAL statusERROR statusWARNING");
            $("#service"+service).addClass("status"+state);
          }
        } )
      }
    } )
  } )
  $("#lastUpdated").html('Last Updated at '+new Date().toLocaleTimeString());
}   

function updateGoogleCalendar() {
	$('#calendar table').empty();

	var out = '';

	$.getJSON('http://www.google.com/calendar/feeds/sheffield.ac.uk_5i8cmsq79qd3nm5spk9ftkol0k@group.calendar.google.com/public/full?alt=json-in-script&callback=?&orderby=starttime&max-results=5&singleevents=true&sortorder=ascending&futureevents=true', function (data) { 
	  $.each(data["feed"]["entry"], function(value, data) { 
      var calDate = new Date(data["gd$when"][0]["startTime"]); 
	  if (isNaN(calDate.valueOf())) { 
		calDate = Date.parseExact(data["gd$when"][0]["startTime"],"yyyy-MM-dd");
	  }
	  dateString = calDate.getDate() + "/" + (calDate.getMonth()+1);
	  event = data["title"]["$t"].replace(/([^,]+),?.*/,'$1');
	  $('#calendar table').append("<tr><td class='date'>"+dateString+"</td><td class='event'>"+event+"</td></tr>\n");
	})
  })

  var weekday=new Array(7);
  weekday[0]="Sunday";
  weekday[1]="Monday";
  weekday[2]="Tuesday";
  weekday[3]="Wednesday";
  weekday[4]="Thursday";
  weekday[5]="Friday";
  weekday[6]="Saturday";

  $('#calendarDate').empty();
  today = new Date();
  $('#calendarDate').append(weekday[today.getDay()]+" "+today.getDate()+"/"+today.getMonth()+1);
}

function updateSignificantEvent() {
  $('#comingup').empty();

  var out = '';

  $.getJSON( 'http://www.google.com/calendar/feeds/sheffield.ac.uk_8v8avojjrlk1lot2lkpl47fn0k@group.calendar.google.com/public/full?alt=json-in-script&callback=?&orderby=starttime&max-results=1&singleevents=true&sortorder=ascending&futureevents=true', function (data) { 
    entry = data["feed"]["entry"][0];
    var calDate = new Date(entry["gd$when"][0]["startTime"] );
	if (isNaN(calDate.valueOf())) { 
	  calDate = Date.parseExact(entry["gd$when"][0]["startTime"],"yyyy-MM-dd");
	}
	calDate.setHours(0);
    calDate.setMinutes(0);
    calDate.setSeconds(0);
    todayDate = new Date();
    days = Math.floor((calDate.valueOf() - todayDate.valueOf()) / 1000 / 3600 / 24);
    if (days < 1) { remaining = "today"; }
    else if (days == 1) { remaining = "tomorrow"; }
    else { remaining = "in "+days+" days"; }
    outString = entry["title"]["$t"].replace(/(SIGNIFICANT: )([^-]+ - )(.+)/,"$3");
    $('#comingup').append("Major work to <b>"+outString+"</b> "+remaining+"\n");
  })
}

function updateTwitter() {
  jQuery(function($){
      $(".tweet").tweet({
          query: "@cics",
          avatar_size: 32,
          count: 10,
    template: "{avatar} {text}   ",
          loading_text: "loading tweets..."
      });
  });
  jQuery(function($){
      $(".cicsstatus").tweet({
          query: "#cicsstatus",
          avatar_size: 32,
          count: 10,
          template: "{avatar} {text}   ",
          loading_text: "loading tweets..."
      });
  });
}

function updateGraphs() {
  $.getJSON('/vshell/index.php?type=services&mode=json', function(data) { 
    var state = [];
	state["CRITICAL"]=0;
	state["WARNING"]=0;
	state["OK"]=0;
	state["UNKNOWN"]=0;
	var largestState=0;
	
    $.each(data, function () { 
      state[this["current_state"]]++;
      if (state[this["current_state"]] > largestState) {
	    largestState = state[this["current_state"]]; 
	  }
    });

    // find out the height of our containers so we don't break the view
    chartDivHeight = $('#chartA').height();
    chartHeader = $('.columnHeader').height();
    chartTitle = $('.columnTitle').height();
    maxColumnHeight = chartDivHeight - (chartHeader+chartTitle);

    scaleFactor = maxColumnHeight / largestState;
    $('#column_1').height(Math.floor(scaleFactor*state["OK"]));
    $('#columnContainer_1 .header_A').html(state["OK"]);
    $('#column_2').height(Math.floor(scaleFactor*state["WARNING"]));
    $('#columnContainer_2 .header_A').html(state["WARNING"]);
    $('#column_3').height(Math.floor(scaleFactor*state["CRITICAL"]));
    $('#columnContainer_3 .header_A').html(state["CRITICAL"]);
    $('#column_4').height(Math.floor(scaleFactor*state["UNKNOWN"]));
    $('#columnContainer_4 .header_A').html(state["UNKNOWN"]);
  });
}


$(document).ready( function () {
  updateNagios();
  setInterval( updateNagios, 5*1000 );
  updateGoogleCalendar();
  setInterval( updateGoogleCalendar,900*1000);
  updateSignificantEvent();
  setInterval( updateSignificantEvent,900*1000);
  updateTwitter();
  setInterval( updateTwitter, 300*1000);
  updateGraphs();
  setInterval( updateGraphs, 5*1000 );
})

