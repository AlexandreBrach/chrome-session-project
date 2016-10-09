<?php

$project = $_GET['project'];

$file = "/projects/$project/chrometabs.json";
if( file_exists( $file ) ) {
    die( file_get_contents( $file ) );
} else {
    die( 'null' );
}
