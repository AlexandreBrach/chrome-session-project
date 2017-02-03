
angular.module('myApp', [])
    .controller( 'mycontroller', ['$scope', '$rootScope', 'chromeTabs', function($scope, $rootScope, chromeTabs) {

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

        /**
         * add IHM specific data to the project structure
         */
        function populateIHMData( data )
        {
            data.collapse = true;
            var p = Object.keys( data );
            for( var i=0; i < p.length; i++ ) {
                if( ( typeof( data[p[i]] ) == 'object' ) && data[p[i]].hasChild ) {
                    data[p[i]] = populateIHMData( data[p[i]] );
                }
            }

            return data;
        }

        /** 
         * Return the visible items from the projects tree structure
         */
        function getVisibleItems( projects ) 
        {
            var p = Object.keys( projects );
            var r = [];
            for( var i=0; i < p.length; i++ ) {
                var project = projects[p[i]];
                // ignore scalar properties
                if( 'object' === typeof( project ) ) {
                    // simple folder (without property item )
                    if( undefined === project.item ) {
                        r.push( p[i] );
                    } else {
                        r.push( project.item );
                    }
                    if( true === project.hasChild ) {
                        if( false === project.collapse ) {
                            r = r.concat( getVisibleItems( project ) );
                        }
                    }
                }
            }
            return r;
        }

        function messageDispatch( message, sender, response)
        {
            var method = message.method;
            var args = message.args;
            switch( method ) {
                case 'returnProjects' :
                    var data = calcProjectTree( args, null );
                    $scope.projects = populateIHMData( data );
                    visibleItems = getVisibleItems( $scope.projects );
                    $scope.$apply();
                    break;
                case 'returnCurrentProject':
                    $scope.currentProject = args;
                    //$scope.cursor = args;
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

        function keyboardDispatch( e )
        {
            if( e.ctrlKey ) {
                switch( e.keyCode ) {
                    case 38 :
                        if( $scope.cursor > 0 ) {
                            $scope.cursor--;
                            calcCursorValue(); 
                        }
                        break;
                    case 40:
                        if( $scope.cursor < visibleItems.length - 1 ) {
                            $scope.cursor++;
                            calcCursorValue(); 
                        }
                        break;

                    // right
                    case 39:
                        var item = visibleItems[$scope.cursor];
                        // Liste des projets (en arbre) : $scope.projects
                        item.collapse = false;
                        $rootScope.$broadcast( 'changeVisibleItem', item );
                        break;
                    // left
                    case 37:
                        var item = visibleItems[$scope.cursor];
                        item.collapse = true;
                        $rootScope.$broadcast( 'changeVisibleItem', item );
                        break;
                    // SPACE
                    case 32:
                        chromeTabs.loadProject( $scope.cursorValue );
                        break;
                }
            }
        }

        function calcCursorValue() {
            $scope.cursorValue = visibleItems[$scope.cursor];
            $scope.$apply();
        }

        function calcCursorPosition()
        {
            $scope.cursor = visibleItems.indexOf( $scope.cursorValue ); 
        }

        var visibleItems = [];
        $scope.currentProject = '';
        $scope.cursor = 0;
        $scope.projects = [];
        chrome.runtime.onMessage.addListener( messageDispatch );
        document.addEventListener( 'keyup', keyboardDispatch, false );
        getCurrentProject();
        getBackendMessages();

        $scope.$on("$destroy", function() {
            chrome.runtime.onMessage.removeListener( messageDispatch );
            document.removeEventListener( 'keyup', keyboardDispatch );
        });

        $rootScope.$on( 'changeVisibleItem', function( args ) {
            visibleItems = getVisibleItems( $scope.projects );
            calcCursorPosition();
        });

}]);
