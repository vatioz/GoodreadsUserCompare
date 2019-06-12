
// TODO Set icon for browser action

function restore_options() {
  chrome.storage.local.get({
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

document.addEventListener('DOMContentLoaded', domLoaded);

function domLoaded(){
  restore_options();
  initializeSettingInput('change', 'tbxHighTH', 'value', 'highTH');
  initializeSettingInput('change', 'tbxLowTH', 'value', 'lowTH');
  initializeSettingInput('change', 'clrHighTH', 'value', 'highTHColor');
  initializeSettingInput('change', 'clrMidTH', 'value', 'midTHColor');
  initializeSettingInput('change', 'clrLowTH', 'value', 'lowTHColor');
  initializeSettingInput('click', 'chbProgressNotifications', 'checked', 'progressNotifications');
  initializeReprocessButton();
}

function initializeSettingInput(event, elementId, inputValueKey, settingKey) {
  var el = document.getElementById(elementId);
  el.addEventListener(event, function() {
    saveSetting(settingKey, el[inputValueKey]);
  });
};

var timeout = null;

function setStatus(message) {  
  var status = document.getElementById('status');
  status.textContent = message;

  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(function() {
    status.textContent = '';
  }, 1500);
}

function initializeReprocessButton(){
  var reprocessButton = document.getElementById('reprocessButton');  
  reprocessButton.addEventListener('click', function() { 
    sendReprocessMessage();
    window.close();
  });
}

// useful for processing lazyloaded content (eg., book page reviews)
function sendReprocessMessage() {
  chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "reprocess"});
  });
}

function saveSetting(settingKey, value) {

  var toSave = {};
  toSave[settingKey] = value;

  chrome.storage.local.set(
    toSave
    , function() {
    setStatus("Configuration saved");
  });
}