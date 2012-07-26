function updateNagios() {
  // Get all LIs in the "stats" div
  var serviceNames = new Array()
  $("#stats li").each( function() { 
    serviceNames.push( this.id.match(/^service([0-9a-zA-Z -]+)$/)[1] )
  } )
  
  $.getJSON('/vshell/index.php?type=services&mode=jsonp&callback=?', function(data) {
    $.each(data, function () {
      // is this element one of our services?
      var service = this["service_description"]
      if ( serviceNames.indexOf(this["service_description"]) != -1 ) {
        var serviceID = this["service_id"];
        var state = this["last_hard_state"];
        var stateChanging = this["last_hard_state"] != this["current_state"]; 
        var statemap = [];
        statemap[0]="OK";
        statemap[1]="WARNING";
        statemap[2]="CRITICAL";
        statemap[3]="UNKNOWN";
        $("#service"+service).removeClass("statusOK statusCRITICAL statusERROR statusWARNING statusCHANGING");
        $("#service"+service).addClass("status"+statemap[state]);
        if (stateChanging) {
          $("#service"+service).addClass("statusCHANGING");
        }
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
  $('#calendarDate').append(weekday[today.getDay()]+" "+today.getDate()+"/"+(today.getMonth()+1));
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
    $('#comingup').append("Major work to <strong>"+outString+"</strong> "+remaining+"\n");
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

function updateTramTimes() {
  var replacementChildren = $("<ul class='tram'>")
  $.getJSON('/trams.json', function(data) {
    $.each(data, function () {
      var departure = this["minutes_to_departure"]
      if (departure == 0) {
        departure = '&nbsp;'
      } 
      replacementChildren.append("<li class='tram'><span class='tramduein tram"+this["service"]+"'>"+departure+"</span><span class='tramdestination'>"+this["destination"]+"</span></li>");
    } )
  } )
  $('ul.tram').replaceWith(replacementChildren)
}

function updateGraphs() {
  // rewrite this to use a single cached copy of the json data
  $.getJSON('/vshell/index.php?type=services&mode=jsonp&callback=?', function(data) { 
    var state = [];
	state["CRITICAL"]=0;
	state["WARNING"]=0;
	state["OK"]=0;
	state["UNKNOWN"]=0;
	var largestState=0;
	
    $.each(data, function () {
      var statemap = [];
      statemap[0]="OK";
      statemap[1]="WARNING";
      statemap[2]="CRITICAL";
      statemap[3]="UNKNOWN";
      
      state[statemap[this["current_state"]]]++;
      if (state[statemap[this["current_state"]]] > largestState) {
	    largestState = state[statemap[this["current_state"]]]; 
	  }
    });

    // find out the height of our containers so we don't break the view
    chartDivHeight = $('.columnFull').height();
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

jQuery.getParams = function () {
    var params = {};
    var split = window.location.href.slice(
        window.location.href.indexOf('?') + 1
    ).split('&');
    
    for (var i = 0; i < split.length; i++) {
        params[split[i].split('=')[0]] = split[i].split('=')[1]|| null;
    }
    
    return params;
}

function checkCSSParameter() {
  var css=$.getParams()["css"]
  if (css) {
    $('<link rel="stylesheet" type="text/css" href="css/'+css+'.css">').appendTo("head")
  }
}

jQuery.fn.fitToParent = function()
{
    this.each(function()
    {
        var width  = $(this).width();
        var height = $(this).height();
        var parentWidth  = $(this).parent().width();
        var parentHeight = $(this).parent().height();

        if(width/parentWidth < height/parentHeight)
        {
                newWidth  = parentWidth;
                newHeight = newWidth/width*height;
        }
        else
        {
                newHeight = parentHeight;
                newWidth  = newHeight/height*width;
        }
        margin_top  = (parentHeight - newHeight) / 2;
        margin_left = (parentWidth  - newWidth ) / 2;

        $(this).css({'margin-top' :margin_top  + 'px',
                     'margin-left':margin_left + 'px',
                     'height'     :newHeight   + 'px',
                     'width'      :newWidth    + 'px'});
    });
};

function updateFlickr() {
  $.getJSON("http://api.flickr.com/services/feeds/photos_public.gne?id=25618167@N00&format=json&jsoncallback=?", displayImages);
}

function displayImages(data) {

    // Start putting together the HTML string
    var htmlString = "";
    
    // Now start cycling through our array of Flickr photo details
    item = data.items[0];
    var sourceSquare = item.media.m

    // Here's where we piece together the HTML
    htmlString += '<img id="prettypicture" title="' + item.title + '" src="' + sourceSquare + '">';
    
    // Pop our HTML in the #images DIV
    $('div#highlight1').html(htmlString);

    // now we make sure it fits right
    $('#prettypicture').fitToParent();
}

$(document).ready( function () {
  checkCSSParameter();
//  updateTramTimes();
//  setInterval( updateTramTimes, 10*1000 );
//  updateFlickr();
//  setInterval( updateFlickr, 300*1000 );
  updateNagios();
  setInterval( updateNagios, 15*1000 );
  updateGoogleCalendar();
  setInterval( updateGoogleCalendar,900*1000);
  updateSignificantEvent();
  setInterval( updateSignificantEvent,900*1000);
//  updateTwitter();
//  setInterval( updateTwitter, 300*1000);
  updateGraphs();
  setInterval( updateGraphs, 5*1000 );
})

