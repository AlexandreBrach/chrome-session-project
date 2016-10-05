<?php

$project = $_GET['project'];

$file = "/projects/$project/chrometabs.json";
die( file_get_contents( $file ) );
