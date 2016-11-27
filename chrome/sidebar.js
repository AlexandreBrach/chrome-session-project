
/*Handle requests from background.html*/
//The object data with the request params
//These last two ones isn't important for this example, if you want know more about it visit: http://code.google.com/chrome/extensions/messaging.html
function handleRequest( request, sender, sendResponse ) {
	if (request.callFunction == "toggleSidebar") {
		toggleSidebar();
    }
}

function keyboardDispatch( e )
{
    if( e.ctrlKey ) {
        switch( e.keyCode ) {
            case 40 :
                console.log( 'up' );
                break;
            case 38:
                console.log( 'down' );
                break;
        }
    }
}

function toggleSidebar() {
	if(sidebarOpen) {
        sidebarOpen = false;
        exitPoint();
	}
	else {
        sidebarOpen = true;
        entryPoint();
	}
}


function entryPoint()
{
    var sidebar = document.createElement('div');
    sidebar.id = "bookmark-sidebar";
    sidebar.innerHTML = ' \
    <div id="chrome-sidebar-appRoot" ng-controller="mycontroller"> \
        <div id="message"></div> \
        <div id="inner_add" class="reset-this"> \
            <input type="text" id="newProject" class="reset-this" /> \
            <button id="bookmark_sidebar_add" class="reset-this" ng-click="addProjectRequest()"> \
            + \
            </button> \
        </div> \
        <div id="inner_projects" class="reset-this"> \
        <items items="projects" current-project="currentProject"></items> \
        </div> \
    </div> \
    ';
    document.body.appendChild(sidebar);
    document.addEventListener( 'keyup', keyboardDispatch, false );
    var appRoot = document.getElementById( "chrome-sidebar-appRoot" );
    app = angular.bootstrap( appRoot, ['myApp'] );
}

function exitPoint()
{
    var $rootScope = app.get('$rootScope');
    $rootScope.$destroy();

    var el = document.getElementById('bookmark-sidebar');
    el.parentNode.removeChild(el);
}

var sidebarOpen = false;
var app = null;

// handle from background.js
chrome.extension.onRequest.addListener( handleRequest );
