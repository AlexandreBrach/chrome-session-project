
angular.module('myApp', [])
    .controller( 'mycontroller', ['$scope', function($scope) {

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

        function addProjectRequest() {
            var name = document.getElementById( 'newProject' ).value;
            if( name != "" ) {
                addProject( name, function() {
                    refreshProjects();
                });
            }
        }

        function addProject( name, callback)
        {
            chrome.runtime.sendMessage( {
                'method' : 'createProject', 
                'args' : name
            }, callback );
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

        var currentProject = '';
        document.getElementById( 'bookmark_sidebar_add' ).onclick = addProjectRequest;
        chrome.runtime.onMessage.addListener( messageDispatch );
        getCurrentProject();
        getBackendMessages();

        $scope.$on("$destroy", function() {
            chrome.runtime.onMessage.removeListener( messageDispatch );
        });
}]);
