
/*Handle requests from background.html*/
//The object data with the request params
//These last two ones isn't important for this example, if you want know more about it visit: http://code.google.com/chrome/extensions/messaging.html
function handleRequest( request, sender, sendResponse ) {
	if (request.callFunction == "toggleSidebar") {
		toggleSidebar();
    }
}

function toggleSidebar() {
	if(sidebarOpen) {
		var el = document.getElementById('bookmark-sidebar');
		el.parentNode.removeChild(el);
		sidebarOpen = false;
        exitPoint();
	}
	else {
		var sidebar = document.createElement('div');
		sidebar.id = "bookmark-sidebar";
		sidebar.innerHTML = '<div id="message"></div>'
        + '<div id="inner_add" class="reset-this">'
        + '<input type="text" id="newProject" class="reset-this" />'
        + '<button id="bookmark_sidebar_add" class="reset-this">+</button>'
        + '</div>'
        + '<div id="inner_projects" class="reset-this">'
        + '</div>';
		document.body.appendChild(sidebar);
        document.getElementById( 'bookmark_sidebar_add' ).onclick = addProjectRequest;
		sidebarOpen = true;
        entryPoint();
	}
}

function messageDispatch( message, sender, response)
{
    var method = message.method;
    var args = message.args;
    switch( method ) {
        case 'returnProjects' :
            populateSelect( args );
            break;
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
}

function entryPoint()
{
    chrome.runtime.onMessage.addListener( messageDispatch );

    getCurrentProject();
    getBackendMessages();
}

function exitPoint()
{
    chrome.runtime.onMessage.removeListener( messageDispatch );
}

function sendChangeProjectMessage( project )
{
    chrome.runtime.sendMessage( {
        'method' : 'changeProject', 
        'args' : {
            'project' : project
        }
    } );
}

function getCurrentProject()
{
    chrome.runtime.sendMessage( {
        'method' : 'getCurrentProject'
    } );
}

function getBackendMessages()
{
    chrome.runtime.sendMessage( {
        'method' : 'getBackendMessages', 
        'args' : null
    } );
}

function refreshProjects() {
    chrome.runtime.sendMessage( {
        'method' : 'retrieveProjects'
    } );
}

function addProject( name, callback)
{
    chrome.runtime.sendMessage( {
        'method' : 'createProject', 
        'args' : name
    }, callback );
}

function populateSelect( data )
{
    var str = '';
    for( var i=0; i < data.length; i++ ) {
        if( data[i] == currentProject ) {
            str += '<button disabled="disabled" class="selected reset-this">'  + data[i] + '</button>';
        } else {
            str += '<button id="selectProject_' + data[i] + '" class="reset-this">'  + data[i] + '</button>';
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

function addProjectRequest() {
    var name = document.getElementById( 'newProject' ).value;
    if( name != "" ) {
        addProject( name, function() {
            refreshProjects();
        });
    }
}

var currentProject = '';
var sidebarOpen = false;

// handle from background.js
chrome.extension.onRequest.addListener( handleRequest );

