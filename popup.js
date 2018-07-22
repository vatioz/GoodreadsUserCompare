
// TODO Set icon for browser action


function progressNotifications() {
    var chb = document.getElementById('chbProgressNotifications');
    saveProgressNotifications(chb.checked);
}

function saveProgressNotifications(checked) {
    chrome.storage.sync.set({
        progressNotifications: checked
      }, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
          status.textContent = '';
        }, 750);
      });
}

function restore_options() {
    var status = document.getElementById('status');
    status.textContent = 'Restoring';
    chrome.storage.sync.get({
        progressNotifications: true
    }, function(items) {
        status.textContent = 'Restored';
      document.getElementById('chbProgressNotifications').checked = items.progressNotifications;      
    });
  }

  document.addEventListener('DOMContentLoaded', restore_options);



function test() {
  
  var status = document.getElementById('status');
  status.textContent = 'Loaded';
  setTimeout(function() {
    status.textContent = '';
  }, 750);
}
  //document.getElementById('chbProgressNotifications').addEventListener('change', progressNotifications);