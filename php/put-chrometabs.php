<?php

require_once( 'functions.php' );

$project = $_POST['project'];
$data = $_POST['tabs'];

if( ( null === $project ) || 
    ( '' === trim( $project ) )
) {
    header($_SERVER["SERVER_PROTOCOL"]." 404 Not Found", true, 404);
    die( 'Project name cannot be null or empty string.');
}
if( false === array_search( $project, getProjects() ) ) {
    mkdir( "/projects/$project");
}
$file = "/projects/$project/chrometabs.json";
file_put_contents( $file, $data );
die( '"Made."' );
