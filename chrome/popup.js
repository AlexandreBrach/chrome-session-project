
var currentProject = '';

function sendChangeProjectMessage( project )
{
    chrome.windows.getCurrent( function( wdw ) {
        console.log( 'popup retrieve current window properties' );
        console.log( wdw );
        chrome.runtime.sendMessage( {
            'method' : 'changeProject', 
            'args' : {
                'project' : project,
                'windowId' : wdw.id 
            }
        } );
    })
}

function sendGetCurrentProjectRequest()
{
    chrome.windows.getCurrent( function( wdw ) {
        chrome.runtime.sendMessage( {
            'method' : 'getCurrentProject', 
            'args' : wdw.id
        } );
    } );
}

function sendGetBackendMessagesRequest()
{
    chrome.runtime.sendMessage( {
        'method' : 'getBackendMessages', 
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
        case 'returnBackendMessage':
            if( args.length != 0 ) {
                str = '<ul><li>';
                str += args.join( '</li><li>' );
                str += '</li></ul>';
                dumpMessage( str );
        }
            break;
    }
});

function addProjectRequest() {
    var name = document.getElementById( 'newProject' ).value;
    if( name != "" ) {
        addProject( name, refreshProjects );
    }
}

document.addEventListener('DOMContentLoaded', function() {

    sendGetCurrentProjectRequest();
    sendGetBackendMessagesRequest();
    document.getElementById( 'add' ).onclick = addProjectRequest;

}, false);

