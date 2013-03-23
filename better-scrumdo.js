(function() {
	var RELOAD_INTERVAL = 60000;
	var last_tab_view_at = new Date();
	var reload_interval_obj;
	
	chrome.extension.onMessage.addListener(
		function(request, sender, send_response) {
			if (request.scrumdo_loaded) {
				reload_page();
				
				set_reload_interval();
				
				send_response({ success: true });
			}
		}
	);
	
	chrome.extension.onMessage.addListener(
		function(request, sender, send_response) {
			if (request.scrumdo_unloaded) {
				clear_reload_interval();
				
				send_response({success: true});
			}
		}
	);
	
	var set_reload_interval = function() {
		reload_interval_obj = window.setInterval(reload_page, RELOAD_INTERVAL);
	};
	
	var clear_reload_interval = function() {
		window.clearInterval(reload_interval_obj);
	};
	
	var reload_page = function() {
		now = new Date();
		
		if (now - last_tab_view_at > RELOAD_INTERVAL) {
			window.location.reload();
			
			last_tab_view_at = new Date();
		}
	};
	
	// Set initial reload interval
	reload_interval_obj = window.setInterval(reload_page, RELOAD_INTERVAL);
	
	
	// Conceptual Notes
	// If tab is focused, setInterval
	// If tab un-focuses, clearInterval();
	
	// When tab is selected, if it has been longer than a minute since the last 
	// reload, do a reload
})();