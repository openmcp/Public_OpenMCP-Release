#!/bin/bash

CONFFILE=settings.yaml
INFLUX_IP=`yq -r .influx.ip $CONFFILE`
INFLUX_PORT=`yq -r .influx.port $CONFFILE`
INFLUX_USERNAME=`yq -r .influx.username $CONFFILE`
INFLUX_PASSWORD=`yq -r .influx.password $CONFFILE`
OPENMCPURL=`yq -r .openmcp.url $CONFFILE`
OPENMCPURLPORT=`yq -r .openmcp.port $CONFFILE`
DB_HOST=`yq -r .postgresql.url $CONFFILE`
DB_USER=`yq -r .postgresql.user $CONFFILE`
DB_PASSWORD=`yq -r .postgresql.password $CONFFILE`
DB_PORT=`yq -r .postgresql.nodeport $CONFFILE`

echo "=== replace yaml files ==="
sed -i 's|REPLACE_INFLUX_IP|'$INFLUX_IP'|g' portal-apiserver/deployment.yaml
sed -i 's|REPLACE_INFLUX_PORT|'$INFLUX_PORT'|g' portal-apiserver/deployment.yaml
sed -i 's|REPLACE_INFLUX_USERNAME|'$INFLUX_USERNAME'|g' portal-apiserver/deployment.yaml
sed -i 's|REPLACE_INFLUX_PASSWORD|'$INFLUX_PASSWORD'|g' portal-apiserver/deployment.yaml
sed -i 's|REPLACE_OPENMCP_URL|'$OPENMCPURL'|g' portal-apiserver/deployment.yaml
sed -i 's|REPLACE_OPENMCP_PORT|'$OPENMCPURLPORT'|g' portal-apiserver/deployment.yaml
sed -i 's|REPLACE_DB_HOST|'$DB_HOST'|g' portal-apiserver/deployment.yaml
sed -i 's|REPLACE_DB_USER|'$DB_USER'|g' portal-apiserver/deployment.yaml
sed -i 's|REPLACE_DB_PASSWORD|'$DB_PASSWORD'|g' portal-apiserver/deployment.yaml
sed -i 's|REPLACE_DB_PORT|'$DB_PORT'|g' portal-apiserver/deployment.yaml

echo "=== create portal-apiserver ==="
kubectl create -f portal-apiserver/.

