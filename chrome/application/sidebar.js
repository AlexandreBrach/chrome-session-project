
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

        $scope.addProjectRequest = function() {
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

        function dumpMessage( str ) {
            document.getElementById( 'message' ).innerHTML = str;
        }

        function calcProjectTree( args, existing ) {
            var r = {};
            if( null === existing ) {
                existing = [];
            }
            var p = [];
            for( var i=0; i < args.length; i++ ) {
                var a = args[i].split( '.' );
                for( var j = a.length - 1; j >= 0; j-- ) {
                    if( j == a.length -1 ) {
                        var t = {};
                        t[a[j]] = {
                            'leaf' : true,
                            'item' : args[i]
                        };
                    } else {
                        var temp = angular.extend( {}, t ); 
                        var t = {};
                        t[a[j]] = temp;
                    }
                    t[a[j]].hasChild = ( j < a.length - 1 ) ? true : false;
                }
                angular.merge( r, t );
            }
            r.hasChild = true;

            return r;
        }

        function messageDispatch( message, sender, response)
        {
            var method = message.method;
            var args = message.args;
            switch( method ) {
                case 'returnProjects' :
                    $scope.projects = calcProjectTree( args, null );
                    $scope.$apply();
                    break;
                case 'returnCurrentProject':
                    $scope.currentProject = args;
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

        $scope.currentProject = '';
        $scope.projects = [];
        chrome.runtime.onMessage.addListener( messageDispatch );
        getCurrentProject();
        getBackendMessages();

        $scope.$on("$destroy", function() {
            chrome.runtime.onMessage.removeListener( messageDispatch );
        });
}]);
