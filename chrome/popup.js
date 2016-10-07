
var currentProject = '';

function sendChangeProjectMessage( project )
{
    chrome.runtime.sendMessage( {
        'method' : 'changeProject', 
        'args' : project 
    } );
}

function sendGetCurrentProjectRequest()
{
    chrome.runtime.sendMessage( {
        'method' : 'getCurrentProject', 
        'args' : null 
    } );
}

function refreshProjects() {
    window.retrieveProjects( 
        function( req ) {
            var projects = JSON.parse( req.responseText );
            populateSelect( projects );
        }, 
        function( req ) {
           dumpMessage( 'Erreur de chargement.' + req.responseText );
        }
    );
}

function populateSelect( data )
{
    var str = '';
    for( var i=0; i < data.length; i++ ) {
        if( data[i] == currentProject ) {
            str += '<button disabled="disabled" class="selected">'  + data[i] + '</button>';
        } else {
            str += '<button id="selectProject_' + data[i] + '">'  + data[i] + '</button>';
        }
    }

    document.getElementById( 'inner_projects' ).innerHTML = str;
    //document.getElementById( 'projects' ).value = currentProject;
    for( var i=0; i < data.length; i++ ) {
        if( data[i] != currentProject ) {
            document.getElementById( 'selectProject_' + data[i] ).onclick = function( e ) {
                var selection = e.target.id.split('_')[1];
                sendChangeProjectMessage( selection );
            }
        }
    }
}

function dumpMessage( str ) {
    document.getElementById( 'message' ).innerHTML = str;
}

chrome.runtime.onMessage.addListener( function(message,sender,response) {

    var method = message.method;
    var args = message.args;
    switch( method ) {
        case 'returnCurrentProject':
            currentProject = args;
            refreshProjects();
            break;
    }
});

document.addEventListener('DOMContentLoaded', function() {

    sendGetCurrentProjectRequest();

}, false);

