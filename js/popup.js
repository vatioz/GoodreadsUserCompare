
// TODO Set icon for browser action


function progressNotifications() {
    var chb = document.getElementById('chbProgressNotifications');
    saveSetting("progressNotifications", chb.checked);
}

function saveProgressNotifications(checked) {
    chrome.storage.sync.set({
        progressNotifications: checked
      }, function() {
        setStatus("Configuration saved");
      });
}

function restore_options() {
    chrome.storage.sync.get({
    progressNotifications: true,
    highTH: "75",
    lowTH: "40",
    highTHColor: "#32b849",
    midTHColor: "#ff9f0f",
    lowTHColor: "#ff2025" 
    }, function(items) {
      document.getElementById('tbxHighTH').value = items.highTH;
      document.getElementById('tbxLowTH').value = items.lowTH;
      document.getElementById('clrHighTH').value = items.highTHColor;
      document.getElementById('clrMidTH').value = items.midTHColor;
      document.getElementById('clrLowTH').value = items.lowTHColor;
      document.getElementById('chbProgressNotifications').checked = items.progressNotifications;
      setStatus("Configuration restored");
    });
  }

  document.addEventListener('DOMContentLoaded', restore_options);



function setStatus(message) {  
  var status = document.getElementById('status');
  status.textContent = message;
  setTimeout(function() {
    status.textContent = '';
  }, 1500);
}

function setHighTH(){
  var tbx = document.getElementById('tbxHighTH');
  saveSetting("highTH", tbx.value);
}

function setLowTH(){
  var tbx = document.getElementById('tbxLowTH');
  saveSetting("lowTH", tbx.value);
}

function setLowTHColor(){
  var clr = document.getElementById('clrLowTH');
  saveSetting("lowTHColor", clr.value);
}

function setMidTHColor(){
  var clr = document.getElementById('clrMidTH');
  saveSetting("midTHColor", clr.value);
}

function setHighTHColor(){
  var clr = document.getElementById('clrHighTH');
  saveSetting("highTHColor", clr.value);
}



function saveSetting(settingKey, value) {

  var toSave = {};
  toSave[settingKey] = value;

  chrome.storage.sync.set(
    toSave
    , function() {
    setStatus("Configuration saved");
  });
}