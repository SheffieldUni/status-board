setInterval(function {
  $.getJSON('/vshell/index.php?type=services&mode=json', function(data) { $.each(data, function () { 
    service = this["service_description"];
    state = this["current_state"]; 
    $("#service"+service).removeClass("OK CRITICAL ERROR WARNING"); 
    $("#service"+service).addClass(state); 
    console.debug(service+state); 
  }) })
}, 5000)