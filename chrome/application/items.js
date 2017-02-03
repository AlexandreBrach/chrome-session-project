angular.module('myApp').directive('items', function ( $rootScope ) {
    return {
        template: ' \
            <div ng-show="false === collapse"> \
                <div ng-repeat="(itemName,item) in items"> \
                    <div ng-if="(itemName !== \'leaf\') && (itemName !== \'collapse\') && (itemName !== \'hasChild\')&& (itemName !== \'item\')"> \
                        <button \
                            class="collapse" \
                            ng-if="item.hasChild" \
                            ng-click="expand( item )"> \
                            {{item.collapse ? "▶" : "▼"}} \
                        </button> \
                        <button \
                            class="collapse" \
                            ng-if="!item.hasChild" \
                            ng-disabled="false"> \
                            &nbsp; \
                        </button> \
                        <button \
                            ng-disabled="{{item.item == currentProject}}" \
                            ng-class="getButtonClass( itemName, item )" \
                            ng-click="$parent.$parent.sendChangeProjectMessage( item.item )"> \
                            {{itemName}} \
                        </button> \
                        <div class="item_container" ng-if="item.hasChild"> \
                            <items items="item" collapse="item.collapse" current-project="currentProject" cursor="cursor"></items> \
                        </div> \
                    </div> \
                </div> \
            </div>',
        restrict: 'E',
        replace:true,
        scope: {
            items: '=items',
            collapse: '=collapse',
            currentProject: '=currentProject',
            cursor: '=cursor'
        },
        link: function (scope, element, attrs) {
            scope.sendChangeProjectMessage = function( project )
            {
                chrome.runtime.sendMessage( {
                    'method' : 'changeProject', 
                    'args' : {
                        'project' : project
                    }
                } );
            };

            scope.getButtonClass = function( projectName, project ) {
                var c = ['item', 'reset-this'];
                var item = project.item;
                if( undefined !== item ) {
                    if( item === scope.cursor ) {
                        c.push( 'cursor' );
                    }
                } else if ( projectName === scope.cursor ) {
                        c.push( 'cursor' );
                } else if( item == scope.currentProject ) {
                        c.push( 'selected' );
                    } 
                return c.join( ' ' );
            };

            scope.expand = function( item ) {
                item.collapse = !item.collapse
                $rootScope.$broadcast( 'changeVisibleItem', item );
            }
        }
    };
});

