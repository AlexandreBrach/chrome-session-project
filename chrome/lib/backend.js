
var URL_GETPROJECTS = 'http://localhost:6034/projects.php';
var URL_GETPROJECT = 'http://localhost:6034/get-chrometabs.php';
var URL_SETPROJECT = 'http://localhost:6034/put-chrometabs.php';
var URL_ADDPROJECT = 'http://localhost:6034/create-chrometabs.php';

function retrieveProjects( callback, failureCallback )
{
    var req = new XMLHttpRequest();
    req.open('GET', URL_GETPROJECTS, true ); 
    req.onreadystatechange = function (aEvt) {
      if (req.readyState == 4) {
           if(req.status == 200) {
               (callback)(req);
           }
           else {
               (failureCallback)(req);
           }
        }
    };
    req.send(null);
}

function addProject( name, callback )
{
    var req = new XMLHttpRequest();
    req.open('GET', URL_ADDPROJECT + '?name=' + encodeURIComponent( name ), true ); 
    req.onreadystatechange = function (aEvt) {
      if (req.readyState == 4) {
           if(req.status == 200) {
               (callback)();
           }
           else {
               
           }
        }
    };
    req.send(null);    
}

function writeProject( projectName, data, callback, failureCallback )
{
    var postData = [];
    postData.push( 'project=' + projectName );
    postData.push( 'tabs=' + encodeURIComponent( JSON.stringify( data ) ) );

    var req = new XMLHttpRequest();
    req.open('POST', URL_SETPROJECT, true ); 
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    req.onreadystatechange = function (aEvt) {
      if (req.readyState == 4) {
           if(req.status == 200) {
               try {
                   var data = JSON.parse( req.responseText );
               } catch( e ) {
                   (failureCallback)(req, 'parse' );
                   return; 
               }
               (callback)(req);
           }
           else {
               (failureCallback)(req, 'http' );
           }
        }
    };
    req.send( postData.join( '&') );
}

function loadProject( projectName, windowId, callback, failureCallback )
{
    var req = new XMLHttpRequest();
    req.open('GET', URL_GETPROJECT + '?project=' + projectName, true ); 
    req.onreadystatechange = function (aEvt) {
      if (req.readyState == 4) {
           if(req.status == 200) {
               try {
                   var data = JSON.parse( req.responseText );
               } catch( e ) {
                   (failureCallback)(req, 'parse' );
                   return; 
               }
               (callback)(data);
           }
           else {
               (failureCallback)(req, 'http' );
           }
        }
    };
    req.send(null);
}
