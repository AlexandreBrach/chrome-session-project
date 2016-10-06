
var project = '';

var lockTabsEvent = false;

// Id of a window that must be kept in the window when all tabs must be removed, and will be removed after the project is loaded
var fakeId = 0;

var URL_GETPROJECTS = 'http://localhost:6034/projects.php';
var URL_GETPROJECT = 'http://localhost:6034/get-chrometabs.php';
var URL_SETPROJECT = 'http://localhost:6034/put-chrometabs.php';

function saveCurrentTab( projectName ) {
  if( !lockTabsEvent ) {
      if( '' != projectName ) {
          chrome.tabs.getAllInWindow( null,
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
function closeAllTabs( callback )
{
     chrome.tabs.query( {
        currentWindow : true
     }, function (tabs) {
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

function openTabProject( data, callback )
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

function loadProject( project )
{
    var req = new XMLHttpRequest();
    req.open('GET', URL_GETPROJECT + '?project=' + project, true ); 
    req.onreadystatechange = function (aEvt) {
      if (req.readyState == 4) {
           if(req.status == 200) {
               try {
                   var data = JSON.parse( req.responseText );
               } catch( e ) {
                   lockTabsEvent = false;
                   return; 
               }
               closeAllTabs( function() {
                   openTabProject( data, function() {
                       closeFakeOne( function() {
                           lockTabsEvent = false;
                       });
                   } );
               });
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
            project = args;
            loadProject( project );
            break;
        case 'getCurrentProject':
            chrome.runtime.sendMessage( {
                'method' : 'returnCurrentProject',
                'args' : project 
            } );
            break;
    }
});


chrome.tabs.onCreated.addListener( function() { saveCurrentTab( project ); } );
chrome.tabs.onUpdated.addListener( function() { saveCurrentTab( project ); } );
chrome.tabs.onMoved.addListener( function() { saveCurrentTab( project ); } );
chrome.tabs.onAttached.addListener( function() { saveCurrentTab( project ); } );
chrome.tabs.onRemoved.addListener( function() { saveCurrentTab( project ); } );

