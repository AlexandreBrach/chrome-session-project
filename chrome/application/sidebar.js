
angular.module('myApp', [])
    .controller( 'mycontroller', ['$scope', '$rootScope', 'chromeTabs', 'itemsService', function($scope, $rootScope, chromeTabs, itemsService) {

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
            $scope.message = str;
        }

        function messageDispatch( message, sender, response)
        {
            var method = message.method;
            var args = message.args;
            switch( method ) {
                case 'returnProjects' :
                    var data = itemsService.calcProjectTree( args );
                    $scope.projects = itemsService.populateIHMData( data );
                    visibleItems = itemsService.getVisibleItems( $scope.projects );
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

        function keyboardDispatch( e )
        {
            if( e.ctrlKey ) {
                switch( e.keyCode ) {
                    
                    // up
                    case 38 :
                        if( $scope.cursor > 0 ) {
                            $scope.cursor--;
                            calcCursorValue(); 
                        }
                        break;

                    // down
                    case 40:
                        if( $scope.cursor < visibleItems.length - 1 ) {
                            $scope.cursor++;
                            calcCursorValue(); 
                        }
                        break;

                    // right
                    case 39:
                        var item = visibleItems[$scope.cursor];
                        itemsService.setProjectItemCollapseStatus( item, $scope.projects, false );
                        // Liste des projets (en arbre) : $scope.projects
                        $rootScope.$broadcast( 'changeVisibleItem', item );
                        break;

                    // left
                    case 37:
                        var item = visibleItems[$scope.cursor];
                        itemsService.setProjectItemCollapseStatus( item, $scope.projects, true );
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
            $scope.$apply();
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
            visibleItems = itemsService.getVisibleItems( $scope.projects );
            calcCursorPosition();
        });

}]);
