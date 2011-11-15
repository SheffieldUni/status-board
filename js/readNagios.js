setInterval(function () {
  $.getJSON('/vshell/index.php?type=services&mode=json', function(data) { $.each(data, function () { 
    service = this["service_description"];
    state = this["current_state"]; 
    $("#service"+service).removeClass("statusOK statusCRITICAL statusERROR statusWARNING"); 
    $("#service"+service).addClass("status"+state); 
    $("#lastUpdated").html('Last Updated at '+new Date().toLocaleTimeString())
  }) })
}, 5000)