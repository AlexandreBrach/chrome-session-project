document.addEventListener('DOMContentLoaded', function() {

    function dumpMessage( str ) {
        document.getElementById( 'message' ).innerHTML = str;
    }

    function populateSelect( data )
    {
        var str = '<select id="projects">';
        for( var i=0; i < data.length; i++ ) {
            str += '<option value="' + data[i] + '">' + data[i] + '</option>'; 
        }
        str += '</select>';
        document.getElementById( 'inner_projects' ).innerHTML = str;
    }

    function saveCurrentTabs()
    {
      var projectName = document.getElementById( 'projects' ).value;
      if( '' != projectName ) {
          chrome.tabs.getAllInWindow( null,
          function (tabs) {
              window.writeProject( 
                  projectName, 
                  tabs,
                  function( req ) {
                       dumpMessage( req.responseText );
                  }, 
                  function( req ) {
                       dumpMessage( 'Erreur de chargement.' + req.responseText );
                  }
              );
          });
      }
    }

    function clickOnWrite()
    {
        saveCurrentTabs();
    }

    window.retrieveProjects( 
        function( req ) {
            var projects = JSON.parse( req.responseText );
            populateSelect( projects );
        }, 
        function( req ) {
           dumpMessage( 'Erreur de chargement.' + req.responseText );
        }
    );

    document.getElementById('writeButton').addEventListener('click', clickOnWrite );

}, false);
