
angular.module('myApp').factory( 'itemsService', function() {

    var itemsService = {};

    /**
    * convert a dot-separated string to its tree object representation
    * 
    * @param {array} itemName - array representing the dot-separated string
    * @param {string} fullpath - this will be used as the name of the leaf
    */
    var convertItemNameToStruct = function( itemName ) {
        if( 1 == itemName.length ) {
            var result = {};
            result[itemName.join( '.' )]  = {
                hasChild : false,
                leaf : true
                //item : itemName
            };  
        } else {
            var key = itemName[0];
            var result = {};
            result[key] = {
                hasChild : true,
                leaf: false
                //item : itemName.join( '.' )
            };
            angular.merge( result[key], convertItemNameToStruct( itemName.slice( 1 ) ) );
        }
        return result;
    }

    /**
    * recursively set the value of the item property of the projects
    * 
    * @param {object} item - the item to walk 
    */
    var setItemProperty = function (item, name) {
        item.item = name;
        var k = Object.keys( item );
        for( var i=0; i < k.length; i++ ) {
            var itemName = k[i];
            var subitem = item[itemName];
            if( 'object' === typeof( subitem ) ) {
                item[itemName] = setItemProperty( subitem, name + '.' + itemName );        
            }
        }
        return item;    
    }

    /**
    * Calculate the project tree object from an array of dot-separated string
    * 
    * @param {string} args  - the array
    */
    itemsService.calcProjectTree = function( args ) {
        var response = {
            hasChild : true
        };
        var p = [];
        for( var i=0; i < args.length; i++ ) {
            t = convertItemNameToStruct( args[i].split( '.' ) );
            angular.merge( response, t );
        }

        var k = Object.keys( response );
        for( var i=0; i < k.length; i++ ) {
            var itemName = k[i];
            var item = response[itemName];
            if( 'object' === typeof( item ) ) {
                item = setItemProperty( item, itemName );        
            }
        }

        return response;
    }

    /**
     * add IHM specific data to the project structure
     */
    itemsService.populateIHMData = function( data )
    {
        data.collapse = true;
        var p = Object.keys( data );
        for( var i=0; i < p.length; i++ ) {
            if( ( typeof( data[p[i]] ) == 'object' ) && data[p[i]].hasChild ) {
                data[p[i]] = this.populateIHMData( data[p[i]] );
            }
        }

        return data;
    }

    /** 
     * Return the visible items from the projects tree structure
     */
    itemsService.getVisibleItems = function ( projects ) 
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
                        r = r.concat( this.getVisibleItems( project ) );
                    }
                }
            }
        }
        return r;
    }

    /**
    * set to true the collapse property of the project element targetted by the dot-separated string
    * item
    * 
    * @param {string} item - string representing the item
    */
    itemsService.setProjectItemCollapseStatus = function( item, projects, status )
    {
        var path = item.split( '.' );
        var target = projects;
        for( var i=0; i < path.length; i++ ) {
            target = target[path[i]];
        }
        target.collapse = status;
    }

    return itemsService;
});
