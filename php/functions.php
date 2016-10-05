<?php

function getProjects() {
    return array_values( array_diff( scandir( '/projects' ), ['..', '.'] ) );
}
