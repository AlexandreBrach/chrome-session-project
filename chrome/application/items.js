angular.module('myApp').directive('items', function () {
    return {
        template: ' \
            <div ng-show="false === collapse"> \
                <div  ng-repeat="(itemName,item) in items"> \
                    <div ng-if="(itemName !== \'leaf\') && (itemName !== \'collapse\') && (itemName !== \'hasChild\')&& (itemName !== \'item\')"> \
                        <button \
                            class="collapse" \
                            ng-if="item.hasChild" \
                            ng-click="item.collapse = !item.collapse"> \
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
                            ng-class="item.item == currentProject ? \'selected item reset-this\' : \'item reset-this\'" \
                            ng-click="$parent.$parent.sendChangeProjectMessage( item.item )"> \
                            {{itemName}} \
                        </button> \
                        <div class="item_container" ng-if="item.hasChild"> \
                            <items items="item" collapse="item.collapse" current-project="currentProject"></items> \
                        </div> \
                    </div> \
                </div> \
            </div>',
        restrict: 'E',
        replace:true,
        scope: {
            items: '=items',
            collapse: '=collapse',
            currentProject: '=currentProject'
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
            }
        }
    };
});

