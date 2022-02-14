#!/bin/bash
docker_id="lkh1434"
controller_name="openmcp-portal-apiserver"

export GO111MODULE=on
export CGO_ENABLED=0 
export GOOS=linux 
export GOARCH=amd64

go mod vendor

go build -o build/_output/bin/$controller_name -gcflags all=-trimpath=`pwd` -asmflags all=-trimpath=`pwd` -mod=vendor . && \

docker build -t $docker_id/$controller_name:v0.0.1 build && \
docker push $docker_id/$controller_name:v0.0.1
