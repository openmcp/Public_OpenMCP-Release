#!/bin/bash
docker_id="lkh1434"
controller_name="openmcp-portal"

docker build -t $docker_id/$controller_name:v0.0.1 . && \
docker push $docker_id/$controller_name:v0.0.1
