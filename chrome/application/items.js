angular.module('myApp').directive('items', function () {
    return {
        template: ' \
            <div ng-repeat="(itemName,item) in items"> \
                <div ng-if="(itemName !== \'leaf\') && (itemName !== \'hasChild\') && (itemName !== \'item\')"> \
                    <button ng-disabled="{{item.item == currentProject}}" ng-class="item.item == currentProject ? \'selected reset-this\' : \'reset-this\'" ng-click="$parent.$parent.sendChangeProjectMessage( item.item )"> \
                        {{itemName}} \
                    </button> \
                    <div ng-if="item.hasChild" style="border-left : 2px solid red;padding-left : 16px;"> \
                        <items items="item" current-project="currentProject"></items> \
                    </div> \
                </div> \
            </div>',
        restrict: 'E',
        replace:true,
        scope: {
            items: '=items',
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

