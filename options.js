// Saves options to localStorage.
function save_options() {
  var refresh_interval_el = document.getElementById("refresh-interval");
  var refresh_interval = refresh_interval_el.value;
  localStorage["refresh_interval"] = refresh_interval;

  // Update status to let user know options were saved.
  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  var refresh_interval = localStorage["refresh_interval"];
  if (!refresh_interval) {
    return;
  }
  var refresh_interval_el = document.getElementById("refresh-interval");
  refresh_interval_el.value = refresh_interval;
}
document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
