function loadConfig() {
  chrome.storage.local.get({
      progressNotifications: true,
      highTH: "75",
      lowTH: "40",
      highTHColor: "#32b849",
      midTHColor: "#ff9f0f",
      lowTHColor: "#ff2025" 
  }, function(items) {
      config = items;
      startProcessing();
  });
}

function setLinks(userData) {
  countProcessed++;
  if(config.progressNotifications) {
      progress.setContent('Processed ' +countProcessed+ ' from ' + countAll)
          .delay(5)
          .push('Processed ' +countProcessed+ ' from ' + countAll);
  }

  userData.links.forEach(link => {
      setLink(link, userData);
  });
}

function setLinksError(links, error) {
  countProcessed++;
  if(config.progressNotifications) {
      progress.setContent('Processed ' +countProcessed+ ' from ' + countAll)
          .delay(5)
          .push('Processed ' +countProcessed+ ' from ' + countAll);
  }
  links.forEach(link => {
      setLinkError(link, error);
  });
}

function setLink(link, userData) {    
  var compareUrl = compareUrlBase + userData.id;
  var comparison = Number(userData.comparison);
  var style = "style='color:black;'"

  if(comparison > config.highTH) { // good match
      style = "style='color:"+ config.highTHColor +";'"
  } else if(comparison < config.lowTH) { // poor match
      style = "style='color:"+ config.lowTHColor +";'"
  } else { // middle
      style = "style='color:"+ config.midTHColor +";'"
  }

  var tooltip = userData.comparisonText + "\n" + userData.booksInCommonText;

  link.after("<a class='goodTooltip' "+style+" title='"+tooltip+"' href='"+compareUrl+"'> ["+userData.comparison+"% / "+userData.booksInCommon+"] </a>");
      
  tippy(".goodTooltip");
}

function setLinkError(link, error) {    
  var userName = link.text();
  link.text(userName + " (" + error + ")");
}

function processCompareData(userData, compareData){
  
  var para = $("p.readable", compareData);
  if(para.length !== 0) {
      var matchComparison = para[0].innerText.match(reComparison);
      if(matchComparison !== null) {
          var comparison = matchComparison[0];
          userData.comparison = comparison;
          userData.comparisonText = para[0].innerText;            
      } else {
          setLinksError(userData.links, para.text());
      }

      var div = $("div.readable:nth-child(2)", compareData);
      if(div.length !== 0) {

          var matchCommon = div.text().match(reCommon);
          if(matchCommon !== null) {
              var common = matchCommon[0];
              userData.booksInCommon = common;
          }
          userData.booksInCommonText = div.text().trim();
      }

      setLinks(userData);

  } else {
      // probably private
      setLinksError(userData.links, "probably private");
  }
}

function cacheThisUser(link) {
  
  var userHref = link.attr("href");
  var userId = userHref.split('/').pop();    

  if(userId in userCache) {
      var userData = userCache[userId];
      userData.links.push(link);
  } else {
      var userData = { 
          id: userId, 
          links: [], 
          comparison: '',
          comparisonText: '', 
          booksInCommon: '',
          booksInCommonText: '' 
      };
      userData.links.push(link);
      userCache.set(userId, userData);
  }
}

function startProcessing() {

  // reset global variables, remove previous processing artifacts
  userCache = new Map();
  countAll = 0;
  countProcessed = 0;
  $(".goodTooltip").remove();

  // this works in discussions
  $("span.commentAuthor a").each(function (){
      var link = $(this);
      cacheThisUser(link);
  });

  // this works on main page
  $("a.gr-user__profileLink").each(function (){
      var link = $(this);    
      cacheThisUser(link);
  });

  // this works on group page
  $("a.userName").each(function (){
      var link = $(this);    
      cacheThisUser(link);
  });

  // this works on book pages' reviews
  $("a.user").each(function (){
    var link = $(this);    
    cacheThisUser(link);
});

  // this works on updates feed
  $("gr-user__profileLink").each(function (){
    var link = $(this);    
    cacheThisUser(link);
});

  // this works on people page
  $("table.tableList tr td:nth-child(3) a:nth-child(1)").each(function (){
      var link = $(this);    
      cacheThisUser(link);
  });

  countAll = userCache.size;
  
  if(config.progressNotifications) {    
      progress.delay(5).push('Spotted '+ countAll +' users on page. Processing starts now. ');
  }
  
  for (var [key, value] of userCache) {    
      var userId = key;
      var userData = value;
      var compareUrl = compareUrlBase + userId;
      $.ajax({
          url: compareUrl, 
          context: userData
      }).done(function(compareData) {
          processCompareData(this, compareData);        
      });
  }

}

var compatibilityUrlBase = "https://www.goodreads.com/book/compatibility_results?id=";
var compareUrlBase = "https://www.goodreads.com/user/compare/";
var reComparison = /\d{1,3}/;
var reCommon = / \d{1,3} /;
var userCache = new Map()
var config = {};
var countAll = 0;
var countProcessed = 0;

alertify.set('notifier','position', 'top-right');
var progress = alertify.notify('Init','message', 0);
progress.dismiss();

loadConfig();

chrome.runtime.onMessage.addListener( function(request,sender,sendResponse)
{
if (request.message === 'reprocess') {
  startProcessing();
};
});