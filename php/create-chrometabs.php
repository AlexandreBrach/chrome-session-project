<?php

$project = $_GET['name'];

mkdir( "/projects/$project");

die( '"Made."' );
