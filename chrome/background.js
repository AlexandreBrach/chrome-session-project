
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

chrome.tabs.onCreated.addListener( function() { saveCurrentTab( 'fromphp' ); } );

