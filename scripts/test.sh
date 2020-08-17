#!/bin/bash

PARENT_PATH=$( dirname "$0" )
DOCKER_COMPOSE_PATH=$PARENT_PATH/../docker/compose

$PARENT_PATH/build.sh
if [ $? -ne 0 ]; then
  exit 1
fi
docker-compose -f $DOCKER_COMPOSE_PATH/docker-compose.test.yml down && docker-compose -f $DOCKER_COMPOSE_PATH/docker-compose.test.yml -p querkle up --exit-code-from querkle --force-recreate 
