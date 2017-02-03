
angular.module('myApp').factory( 'chromeTabs', function() {

    var chromeTabs = {};

    chromeTabs.loadProject = function( project )
    {
        chrome.runtime.sendMessage( {
            'method' : 'changeProject', 
            'args' : {
                'project' : project
            }
        } );
    };

    return chromeTabs;
});
