
var project = {};

var lockTabsEvent = false;

// Id of a window that must be kept in the window when all tabs must be removed, and will be removed after the project is loaded
var fakeId = 0;

var URL_GETPROJECTS = 'http://localhost:6034/projects.php';
var URL_GETPROJECT = 'http://localhost:6034/get-chrometabs.php';
var URL_SETPROJECT = 'http://localhost:6034/put-chrometabs.php';

function saveCurrentTab( projectName, windowId ) {
  if( !lockTabsEvent ) {
      if( ( '' != projectName ) && ( undefined !== projectName ) ) {
         chrome.tabs.query( { windowId : windowId },
          function (tabs) {
              window.writeProject( 
                  projectName, 
                  tabs,
                  function( req ) {}, 
                  function( req ) {}
              );
          });
      }
  }
}

function writeProject( projectName, data, callback, failureCallback )
{
    var postData = [];
    postData.push( 'project=' + projectName );
    postData.push( 'tabs=' + encodeURIComponent( JSON.stringify( data ) ) );

    var req = new XMLHttpRequest();
    req.open('POST', URL_SETPROJECT, true ); 
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    req.onreadystatechange = function (aEvt) {
      if (req.readyState == 4) {
           if(req.status == 200) {
               (callback)(req);
           }
           else {
               (failureCallback)(req);
           }
        }
    };
    req.send( postData.join( '&') );
}

/**
 * Remove all tab except the first found in the list (in order to keep the window)
 */
function closeAllTabs( windowId, callback )
{
     chrome.tabs.query( { windowId : windowId },
        function (tabs) {
              var ids = [];
             for( var i=0; i < tabs.length; i++ ) {
                 ids.push( tabs[i].id );
             }
             fakeId = ids.shift();
             chrome.tabs.remove( ids, callback );
     });
}

function closeFakeOne( callback )
{
     chrome.tabs.remove( fakeId, callback );
}

function openTabProject( data, windowId, callback )
{
    for( var i=0; i < data.length; i++ ) {
        var tab = {
           index : data[i].index,
           url : data[i].url,
           active : data[i].active,
           pinned : data[i].pinned
        };
        if( i == data.length - 1 ) {
            chrome.tabs.create( tab, callback );
        } else {
            chrome.tabs.create( tab );
        }
    }
}

function loadProject( projectName, windowId )
{
    var req = new XMLHttpRequest();
    req.open('GET', URL_GETPROJECT + '?project=' + projectName, true ); 
    req.onreadystatechange = function (aEvt) {
      if (req.readyState == 4) {
           if(req.status == 200) {
               try {
                   var data = JSON.parse( req.responseText );
               } catch( e ) {
                   // Inconsistent data
                   // we unlock and do nothing
                   lockTabsEvent = false;
                   return; 
               }
               // Manage an excepion case where there is no tabs in the project
               if( data.length == 0 ) {
                   // we unlock and do nothing
                   lockTabsEvent = false;
               } else {
                   closeAllTabs( windowId, function() {
                       openTabProject( data, windowId, function() {
                           closeFakeOne( function() {
                               // unlock in five seconds, this let the time for tabs to load and avoid multiple event triggering
                               setInterval(function(){ lockTabsEvent = false; }, 5000);
                               
                           });
                       } );
                   });
               }
           }
           else {
               (failureCallback)(req);
           }
        }
    };
    req.send(null);

}

chrome.runtime.onMessage.addListener(function(message,sender,response) {

    var method = message.method;
    var args = message.args;
    switch( method) {
        case 'changeProject':
            lockTabsEvent = true;
            project[args.windowId] = args.project;
            loadProject( project[args.windowId], args.windowId );
            break;
        case 'getCurrentProject':
            var p = project[args];
            if( undefined === p ) {
                p = '';
            }
            chrome.runtime.sendMessage( {
                'method' : 'returnCurrentProject',
                'args' : p
            } );
            break;
    }
});


chrome.tabs.onUpdated.addListener( function( tabId, changeInfo, tab ) { 
    // pass only if the 'url' properties is set in the changes data
    if( undefined !== changeInfo.url ) {
        saveCurrentTab( project[tab.windowId], tab.windowId ); 
    }
} );
chrome.tabs.onMoved.addListener( function( tabId, moveInfo ) { 
    saveCurrentTab( project[moveInfo.windowId], moveInfo.windowId ); 
} );
chrome.tabs.onAttached.addListener( function( tabId, attachInfo ) {
    saveCurrentTab( project[attachInfo.windowId], attachInfo.newWindowId  ); 
} );
chrome.tabs.onDetached.addListener( function( tabId, detachInfo ) {
    saveCurrentTab( project[detachInfo.windowId], detachInfo.oldWindowId ); 
} );
chrome.tabs.onRemoved.addListener( function( tabId, removeInfo ) { 
    saveCurrentTab( project[removeInfo.windowId], removeInfo.windowId ); 
} );

