
var URL_GETPROJECTS = 'http://localhost:6034/projects.php';
var URL_SETPROJECT = 'http://localhost:6034/put-chrometabs.php';

function saveCurrentTab( projectName ) {
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

chrome.tabs.onCreated.addListener( function() { saveCurrentTab( 'fromphp' ); } );
chrome.tabs.onUpdated.addListener( function() { saveCurrentTab( 'fromphp' ); } );
chrome.tabs.onMoved.addListener( function() { saveCurrentTab( 'fromphp' ); } );
chrome.tabs.onAttached.addListener( function() { saveCurrentTab( 'fromphp' ); } );
chrome.tabs.onRemoved.addListener( function() { saveCurrentTab( 'fromphp' ); } );

