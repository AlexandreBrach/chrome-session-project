
var URL_GETPROJECTS = 'http://localhost:6034/projects.php';
var URL_SETPROJECT = 'http://localhost:6034/put-chrometabs.php';

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

