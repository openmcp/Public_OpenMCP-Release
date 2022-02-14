#!/bin/bash

CONFFILE=settings.yaml
NFS_IP=`yq -r .common.nfsip $CONFFILE`
NFS_MOUNT_POINT=`yq -r .common.nfsmount $CONFFILE`
POSTGRESQL_USER=`yq -r .postgresql.user $CONFFILE`
POSTGRESQL_PASSWORD=`yq -r .postgresql.password $CONFFILE`
POSTGRESQL_NODEPORT=`yq -r .postgresql.nodeport $CONFFILE`

mkdir $NFS_MOUNT_POINT/postgresql

echo "=== replace yaml files ==="
sed -i 's|REPLACE_NFSIP|'$NFS_IP'|g' postgresql/postgres-db-pv.yaml
sed -i 's|REPLACE_NODEPORT|'$POSTGRESQL_NODEPORT'|g' postgresql/postgres-db-service.yaml
sed -i 's|REPLACE_POSTGRES_USER|'$POSTGRESQL_USER'|g' postgresql/postgres-secret.yaml
sed -i 's|REPLACE_POSTGRES_PASSWORD|'$POSTGRESQL_PASSWORD'|g' postgresql/postgres-secret.yaml

echo "=== create postgresql ==="
kubectl create -f postgresql/.



