// TODO create popup with progress
// TODO invert sequence (currently processing from the bottom it seems)
// TODO use colours to highlight better matches
// tODO publish to chrome store
// TODO write to goodreads discussion

var compatibilityUrlBase = "https://www.goodreads.com/book/compatibility_results?id=";
var compareUrlBase = "https://www.goodreads.com/user/compare/";

var re = /\d{1,3}%/;
var userCache = {}

function setLinks(links, userData) {
    countProcessed++;
    progress.setContent('Processed ' +countProcessed+ ' from ' + countAll)
        .delay(5)
        .push('Processed ' +countProcessed+ ' from ' + countAll);

    links.forEach(link => {
        setLink(link, userData);
    });
}

function setLinksError(links, error) {
    countProcessed++;
    progress.setContent('Processed ' +countProcessed+ ' from ' + countAll)
        .delay(5)
        .push('Processed ' +countProcessed+ ' from ' + countAll);
    
    links.forEach(link => {
        setLinkError(link, error);
    });
}

function setLink(link, userData) {    
    //var userName = link.text();
    //link.text(userName + " (Tastes: "+ comparison +", Compatibility: " + compatibility + ")");
    var compareUrl = compareUrlBase + userData.id;
    var compatibilityUrl = compatibilityUrlBase + userData.id;
    link
        .after("<a class='goodTooltip' title='test!' href='"+compatibilityUrl+"'> [Compatibility: "+userData.compatibility+"]</a>")
        .after("<a class='goodTooltip' title='test!' href='"+compareUrl+"'> [Tastes: "+userData.comparison+"] </a>");

        tippy(".goodTooltip");

}

function setLinkError(link, error) {    
    var userName = link.text();
    link.text(userName + " (" + error + ")");
}

function processCompatibilityData(userData, compatibilityData) {
    var div = $("div.leftContainer>div.mediumText>div",compatibilityData);    
    if(div.length !== 0) {
        var match = div[0].innerText.match(re);
        if(match !== null) {
            var compatibility = match[0];
            userData.compatibility = compatibility;
            setLinks(userData.links, userData);
        } else {
            setLinksError(userData.links, div.text());
        }
    } else { 
        // some error                    
        setLinksError(userData.links, "X1");
    }
}

function processCompareData(userData, compareData){
    
    var para = $("p.readable", compareData);
    if(para.length !== 0) {
        var match = para[0].innerText.match(re);
        if(match !== null) {
            var comparison = match[0];
            userData.comparison = comparison;
            var compatibilityUrl =  compatibilityUrlBase + userData.id;
            $.ajax({
                url: compatibilityUrl, 
                context: userData
            }).done(function(compatibilityData) {
                processCompatibilityData(this, compatibilityData);
            });
        } else {
            setLinksError(userData.links, para.text());
        }
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
        var userData = { id: userId, links: [], comparison: '', compatibility: '' };
        userData.links.push(link);
        userCache[userId] = userData;
    }
}


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

// this works on people page
$("table.tableList tr td:nth-child(3) a:nth-child(1)").each(function (){
    var link = $(this);    
    cacheThisUser(link);
});

var countAll = Object.keys(userCache).length;
var countProcessed = 0;

alertify.set('notifier','position', 'top-right');
var progress = alertify.message('Spotted '+ countAll +' users on page. Processing starts now. ');
progress.delay(10);

for(var userId in userCache) {
    var userData = userCache[userId];
    var compareUrl = compareUrlBase + userId;
    $.ajax({
        url: compareUrl, 
        context: userData
    }).done(function(compareData) {
        processCompareData(this, compareData);        
    });
}




