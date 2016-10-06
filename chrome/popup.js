
var currentProject = '';

function sendChangeProjectMessage()
{
    var projectName = document.getElementById( 'projects' ).value;
    chrome.runtime.sendMessage( {
        'method' : 'changeProject', 
        'args' : projectName 
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
    var str = '<select id="projects">'; 
    str += '<option value="">-- NOTHING --</option>'; 
    for( var i=0; i < data.length; i++ ) {
        str += '<option value="' + data[i] + '">' + data[i] + '</option>'; 
    }
    str += '</select>';
    document.getElementById( 'inner_projects' ).innerHTML = str;
    document.getElementById( 'projects' ).value = currentProject;
    document.getElementById( 'projects' ).onchange = sendChangeProjectMessage;
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

