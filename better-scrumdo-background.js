(function() {
	var scrumdo_regex = /.+:\/\/.+\.scrumdo\.com\/.+\/board/
	var scrumdo_tab_id = 0;
	
	// When a new tab is selected,
	chrome.tabs.onActivated.addListener(function(active_info) {
		chrome.tabs.get(active_info.tabId, function(tab) {
			if (scrumdo_regex.test(tab.url)) {
				scrumdo_tab_id = tab.id;
				
				// set interval
				chrome.tabs.sendMessage(tab.id, {scrumdo_loaded: true});
			}
			else {
				// clear interval
				chrome.tabs.sendMessage(scrumdo_tab_id, {scrumdo_unloaded: true});
			}
		});
	});
})();