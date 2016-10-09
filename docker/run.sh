#!/bin/bash
usermod -u $USERID www-data    
groupmod -g $GROUPID www-data
apache2-foreground
