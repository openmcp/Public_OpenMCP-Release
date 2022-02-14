#!/bin/bash

CONFFILE=portal-settings.yaml
db_host=`yq -r .postgresql.url $CONFFILE`
db_user=`yq -r .postgresql.user $CONFFILE`
db_password=`yq -r .postgresql.password $CONFFILE`
db_port=`yq -r .postgresql.nodeport $CONFFILE`
db_database=`yq -r .postgresql.dbname $CONFFILE`
api_url=`yq -r .portalapi.apiurl $CONFFILE`

echo "=== replace yaml files ==="
sed -i 's|REPLACE_api_url|'$api_url'|g' portal/deployment.yaml
sed -i 's|REPLACE_db_user|'$db_user'|g' portal/deployment.yaml
sed -i 's|REPLACE_db_host|'$db_host'|g' portal/deployment.yaml
sed -i 's|REPLACE_db_database|'$db_database'|g' portal/deployment.yaml
sed -i 's|REPLACE_db_password|'$db_password'|g' portal/deployment.yaml
sed -i 's|REPLACE_db_port|'$db_port'|g' portal/deployment.yaml

echo "=== create portal ==="
kubectl create -f portal/.

