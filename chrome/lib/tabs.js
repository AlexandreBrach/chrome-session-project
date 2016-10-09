
/**
 * Return the tabs data of the window windowId
 */
function getTabsOfWindow( windowId, callback )
{
    chrome.tabs.query( { windowId : windowId }, function (tabs) {
        (callback)(tabs);
    } );
}

/**
 * Remove all tab of the window windowId, except the first found in the list (in order to keep the window)
 * The callback have a fid parameters representing the last tab id that wasn't closed
 */
function closeAllTabs( windowId, callback )
{
     chrome.tabs.query( { windowId : windowId },
        function (tabs) {
            var ids = [];
            for( var i=0; i < tabs.length; i++ ) {
                ids.push( tabs[i].id );
            }
            var fid = ids.shift();
            chrome.tabs.remove( ids, function() {
                (callback)(fid);
            } );
     });
}

/**
 * Open a previously saved set of tabs on the window "windowId"
 * Apply the callback once the last tab will be instancied
 */
function openSavedTabs( tabs, windowId, callback )
{
    for( var i=0; i < tabs.length; i++ ) {
        var tab = {
           index : tabs[i].index,
           url : tabs[i].url,
           active : tabs[i].active,
           pinned : tabs[i].pinned
        };
        if( i == tabs.length - 1 ) {
            chrome.tabs.create( tab, callback );
        } else {
            chrome.tabs.create( tab );
        }
    }
}

/**
 * Replace the tabs of window by the passed tabs data
 */
function remplaceTabs( windowId, tabs )
{
   closeAllTabs( windowId, function( fakeId ) {
       openSavedTabs( tabs, windowId, function() {
       chrome.tabs.remove( fakeId, function() {
               // unlock in five seconds, this let the time for tabs to load and avoid multiple event triggering
               setInterval(function(){ lockTabsEvent = false; }, 5000);
           });
       } );
   });
}
