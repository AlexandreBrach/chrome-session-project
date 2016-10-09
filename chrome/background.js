
var project = {};

var lockTabsEvent = false;

var backendMessages = [];

function saveCurrentTab( projectName, windowId ) {
  if( ( !lockTabsEvent ) && ( '' != projectName ) && ( undefined !== projectName ) ) {
     //chrome.tabs.query( { windowId : windowId },
     getTabsOfWindow( windowId, function (tabs) {
          window.writeProject( 
              projectName, 
              tabs,
              function( req ) {}, 
              handleBackendError
          );
      });
  }
}

function handleBackendError( req, cause )
{
   // Inconsistent data
   if( cause == 'parse' ) {
       backendMessages.push( req.responseText );
   }
   if( cause == 'http' ) {
       backendMessages.push( 'HTTP Error' );
   }
}

/**
 * change project
 */
function changeProject( windowId, projectName )
{
    lockTabsEvent = true;
    project[windowId] = projectName;
    loadProject( project[windowId], windowId, 
        function( data ) {
            console.log( data );
           if( null === data ) {
                // nothing was found, we do nothing
               lockTabsEvent = false;
               return;
           }
           // Manage an excepion case where there is no tabs in the project
           if( data.length == 0 ) {
               // we unlock and do nothing
               lockTabsEvent = false;
           } else {
               remplaceTabs( windowId, data );
           }
        },
        function( req, cause ) {
            handleBackendError( req, cause );
            // we unlock and do nothing
            lockTabsEvent = false;
        }
    );
}

function sendBackendMessage()
{
    chrome.runtime.sendMessage( {
        'method' : 'returnBackendMessage',
        'args' : backendMessages
    } );
}

/**
 * Send a message to provide the current project
 */
function sendCurrentProject( windowId )
{
    var p = project[windowId];
    if( undefined === p ) {
        p = '';
    }
    chrome.runtime.sendMessage( {
        'method' : 'returnCurrentProject',
        'args' : p
    } );
}

chrome.runtime.onMessage.addListener(function(message,sender,response) {
    var method = message.method;
    var args = message.args;
    switch( method) {
        case 'changeProject':
            changeProject( args.windowId, args.project );
            break;
        case 'getCurrentProject':
            sendCurrentProject( args );
            break;
        case 'getBackendMessages':
            sendBackendMessage();
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
    // Don't trigger the windows closing case.
    if( !removeInfo.isWindowClosing ) {
        saveCurrentTab( project[removeInfo.windowId], removeInfo.windowId ); 
    }
} );

