#!/bin/bash

if [ "$1" == "" ]; then
  echo "Config File Arg Empty"
  echo "example) ./create.sh settings.yaml"
  exit 1
fi

REQUIRED_PKG=python-pip
PKG_OK=$(dpkg-query -W --showformat='${Status}\n' $REQUIRED_PKG|grep "install ok installed")
if [ "" = "$PKG_OK" ]; then
  echo "No $REQUIRED_PKG. Setting up $REQUIRED_PKG."
  sudo apt-get --yes install $REQUIRED_PKG 
fi

#REQUIRED_PKG=python-pip
#PKG_OK=$(dpkg-query -W --showformat='${Status}\n' $REQUIRED_PKG|grep "install ok installed")
#if [ "" = "$PKG_OK" ]; then
#  echo "No $REQUIRED_PKG. Setting up $REQUIRED_PKG."
#  sudo apt-get --yes install $REQUIRED_PKG 
#fi

REQUIRED_PKG2=nfs-kernel-server
PKG_OK2=$(dpkg-query -W --showformat='${Status}\n' $REQUIRED_PKG2|grep "install ok installed")
if [ "" = "$PKG_OK2" ]; then
  echo "No $REQUIRED_PKG2. Setting up $REQUIRED_PKG2."
  sudo apt-get --yes install $REQUIRED_PKG2 
fi

REQUIRED_PKG3=jq
PKG_OK3=$(dpkg-query -W --showformat='${Status}\n' $REQUIRED_PKG2|grep "install ok installed")
if [ "" = "$PKG_OK3" ]; then
  echo "No $REQUIRED_PKG3. Setting up $REQUIRED_PKG3."
  sudo apt-get --yes install $REQUIRED_PKG3
fi


curl -O https://bootstrap.pypa.io/pip/2.7/get-pip.py
python get-pip.py
rm get-pip.py


PYTHON_REQUIRED_PKG=yq
PKG_OK=$(pip list --disable-pip-version-check | grep $PYTHON_REQUIRED_PKG)
if [ "" = "$PKG_OK" ]; then
  echo "No $PYTHON_REQUIRED_PKG. Setting up $PYTHON_REQUIRED_PKG."
  sudo pip install $PYTHON_REQUIRED_PKG 
fi


CONFFILE=$1

OMCP_INSTALL_TYPE=`yq -r .default.installType $CONFFILE`

DOCKER_REPO_NAME=`yq -r .default.docker.openmcpImageRepository $CONFFILE`
DOCKER_ISTIO_REPO_NAME=`yq -r .default.docker.istioImageRepository $CONFFILE`

DOCKER_SECRET_NAME=`yq -r .default.docker.imagePullSecretName $CONFFILE`
DOCKER_IMAGE_PULL_POLICY=`yq -r .default.docker.imagePullPolicy $CONFFILE`

OMCP_IP=`yq -r .master.ServerIP.internal $CONFFILE`
OMCP_EXTERNAL_IP=`yq -r .master.ServerIP.external $CONFFILE`

ADDRESS_FROM=`yq -r .master.metalLB.rangeStartIP $CONFFILE`
ADDRESS_TO=`yq -r .master.metalLB.rangeEndIP $CONFFILE`

OAS_NODE_PORT=`yq -r .master.Moudules.APIServer.NodePort $CONFFILE`
API_APP_KEY=`yq -r .master.Moudules.APIServer.AppKey $CONFFILE`
API_USER_NAME=`yq -r .master.Moudules.APIServer.UserName $CONFFILE`
API_USER_PW=`yq -r .master.Moudules.APIServer.UserPW $CONFFILE`

OAE_NODE_PORT=`yq -r .master.Moudules.AnalyticEngine.NodePort $CONFFILE`

OME_NODE_PORT=`yq -r .master.Moudules.MetricCollector.NodePort $CONFFILE`
OME_EXTERNAL_PORT=`yq -r .master.Moudules.MetricCollector.externalPort $CONFFILE`

INFLUXDB_NODE_PORT=`yq -r .master.Moudules.InfluxDB.NodePort $CONFFILE`

LB_EXTERNAL_IP=`yq -r .master.Moudules.LoadBalancingController.external $CONFFILE`
LB_NODE_PORT=`yq -r .master.Moudules.LoadBalancingController.NodePort $CONFFILE`

PDNS_IP=`yq -r .externalServer.ServerIP.internal $CONFFILE`
PDNS_PUBLIC_IP=`yq -r .externalServer.ServerIP.external $CONFFILE`
PDNS_PUBLIC_PORT=`yq -r .externalServer.powerDNS.externalPort $CONFFILE`
PDNS_API_KEY=`yq -r .externalServer.powerDNS.apiKey $CONFFILE`

NFS_IP=`yq -r .master.Moudules.postgresql.nfsip $CONFFILE`
NFS_MOUNT_POINT=`yq -r .master.Moudules.postgresql.nfsmount $CONFFILE`

POSTGRESQL_USER=`yq -r .master.Moudules.postgresql.user $CONFFILE`
POSTGRESQL_PASSWORD=`yq -r .master.Moudules.postgresql.password $CONFFILE`
POSTGRESQL_NODEPORT=`yq -r .master.Moudules.postgresql.NodePort $CONFFILE`

INFLUX_IP=`yq -r .master.ServerIP.internal $CONFFILE`
INFLUX_PORT=`yq -r .master.Moudules.InfluxDB.NodePort $CONFFILE`
INFLUX_USERNAME=`yq -r .master.Moudules.InfluxDB.userName $CONFFILE`
INFLUX_PASSWORD=`yq -r .master.Moudules.InfluxDB.password $CONFFILE`
OPENMCPURL=`yq -r .master.ServerIP.internal $CONFFILE`
OPENMCPURLPORT=`yq -r .master.Moudules.APIServer.NodePort $CONFFILE`
DB_HOST=`yq -r .master.ServerIP.internal $CONFFILE`
DB_USER=`yq -r .master.Moudules.postgresql.user $CONFFILE`
DB_PASSWORD=`yq -r .master.Moudules.postgresql.password $CONFFILE`
DB_PORT=`yq -r .master.Moudules.postgresql.NodePort $CONFFILE`

DB_DATABASE=`yq -r .master.Moudules.postgresql.dbname $CONFFILE`
API_URL_NodePort=`yq -r .master.Moudules.portalapi.NodePort $CONFFILE`


### Migration
MIGRATION_EXTERNAL_NFS_PATH=`yq -r .master.Moudules.migration.nfs.path $CONFFILE`                  #  EXTERNAL_NFS_PATH = "/home/nfs/pv"
MIGRATION_EXTERNAL_NFS_IP=`yq -r .master.Moudules.migration.nfs.ip $CONFFILE`                      #   EXTERNAL_NFS = "115.94.141.62"

### Cache
CACHE_EXTERNAL_NFS_IP=`yq -r .master.Moudules.cache.nfs.ip $CONFFILE` 

### Snapshot
SNAPSHOT_EXTERNAL_NFS_PATH=`yq -r .master.Moudules.snapshot.nfs.path $CONFFILE`                 #  EXTERNAL_NFS_PATH_STORAGE = "/home/nfs/storage"
SNAPSHOT_EXTERNAL_NFS_IP=`yq -r .master.Moudules.snapshot.nfs.ip $CONFFILE`                        # EXTERNAL_NFS = "211.45.109.210"

SNAPSHOT_OPENMCP_MASTER_IP=`yq -r .master.Moudules.snapshot.etcd.masterip $CONFFILE`                     #  MASTER_IP = "192.168.0.152"          # /home/nfs/openmcp/MASTER_IP/certs/etcd-client.crt ????????? MASTER_IP
SNAPSHOT_EXTERNAL_ETCDIP=`yq -r .master.Moudules.snapshot.etcd.ip $CONFFILE` 
SNAPSHOT_EXTERNAL_ETCDPORT="12379"
SNAPSHOT_EXTERNAL_ETCDURL="${SNAPSHOT_EXTERNAL_ETCDIP}:${SNAPSHOT_EXTERNAL_ETCDPORT}"                     #   EXTERNAL_ETCD = "211.45.109.210:12379"

SNAPSHOT_EXTERNAL_ETCDHOSTNAME=`yq -r .master.Moudules.snapshot.etcd.hostname $CONFFILE`                                #  EXTERNAL_ETCD = "nanumdev6"


mkdir $NFS_MOUNT_POINT/postgresql

if [ -d "master" ]; then
  # Control will enter here if $DIRECTORY exists.
  rm -r master
fi

if [ -d "member" ]; then
  # Control will enter here if $DIRECTORY exists.
  rm -r member
fi

cp -r master.back master
cp -r member.back member

if [ $OMCP_INSTALL_TYPE == "learning" ]; then
  rm master/openmcp-cluster-manager/operator.yaml
  rm master/influxdb/deployment.yaml
  rm master/openmcp-apiserver/operator.yaml
  rm master/openmcp-apiserver/pv.yaml
  rm master/istio/samples/multicluster/gen-eastwest-gateway.sh
  rm member/istio/gen-eastwest-gateway.sh
  rm master/postgresql/postgres-db-deployment.yaml

  mv master/openmcp-cluster-manager/operator-learningmcp.yaml master/openmcp-cluster-manager/operator.yaml
  mv master/influxdb/deployment-learningmcp.yaml master/influxdb/deployment.yaml
  mv master/openmcp-apiserver/operator-learningmcp.yaml master/openmcp-apiserver/operator.yaml
  mv master/openmcp-apiserver/pv-learningmcp.yaml master/openmcp-apiserver/pv.yaml
  mv master/istio/samples/multicluster/gen-eastwest-gateway-local.sh master/istio/samples/multicluster/gen-eastwest-gateway.sh
  mv member/istio/gen-eastwest-gateway-local.sh member/istio/gen-eastwest-gateway.sh
  mv master/postgresql/postgres-db-deployment-learningmcp.yaml master/postgresql/postgres-db-deployment.yaml
  

else
  rm master/openmcp-cluster-manager/operator-learningmcp.yaml
  rm master/influxdb/deployment-learningmcp.yaml
  rm master/openmcp-apiserver/operator-learningmcp.yaml
  rm master/openmcp-apiserver/pv-learningmcp.yaml
  rm master/istio/samples/multicluster/gen-eastwest-gateway-local.sh
  rm member/istio/gen-eastwest-gateway-local.sh
  rm master/postgresql/postgres-db-deployment-learningmcp.yaml

fi

# Init Memeber Dir NFS Setting
INIT_MEMBER_DIR=`pwd`/member

sudo mkdir -p /home/nfs
sudo mkdir -p $HOME/.aws

sudo chmod 777 /home/nfs
sudo chmod 777 $HOME/.aws

NFS_OK=$(grep -r "$HOME/.kube" /etc/exports)
if [ "" = "$NFS_OK" ]; then
  echo "Not found NFS Setting. Add Export '$HOME/.kube' in /etc/exports"
  echo "$HOME/.kube *(rw,no_root_squash,sync,no_subtree_check)" | sudo tee -a /etc/exports
fi

NFS_OK2=$(grep -r $INIT_MEMBER_DIR /etc/exports)
if [ "" = "$NFS_OK2" ]; then
  echo "Not found NFS Setting. Add Export '$INIT_MEMBER_DIR' in /etc/exports"
  echo "$INIT_MEMBER_DIR *(rw,no_root_squash,sync,no_subtree_check)" | sudo tee -a /etc/exports
fi

NFS_OK3=$(grep -r '/home/nfs' /etc/exports)
if [ "" = "$NFS_OK3" ]; then
  echo "Not found NFS Setting. Add Export '/home/nfs' in /etc/exports"
  echo "/home/nfs *(rw,no_root_squash,sync,no_subtree_check)" | sudo tee -a /etc/exports
fi

NFS_OK4=$(grep -r "$HOME/.aws" /etc/exports)
if [ "" = "$NFS_OK4" ]; then
  echo "Not found NFS Setting. Add Export '$HOME/.aws' in /etc/exports"
  echo "$HOME/.aws *(rw,no_root_squash,sync,no_subtree_check)" | sudo tee -a /etc/exports
fi

sudo exportfs -a

# Init /etc/resolv.conf
DNS_OK=$(grep -r "nameserver ${PDNS_IP}" /etc/resolv.conf)
if [ "" = "$DNS_OK" ]; then
  echo "Not found External DNS Server. Add 'nameserver ${PDNS_IP}' in /etc/resolv.conf"
  sudo sed -i "1s/^/nameserver ${PDNS_IP}\n /" /etc/resolv.conf
fi


echo "Replace Setting Variable"
sed -i 's|REPLACE_OMCP_INSTALL_TYPE|'$OMCP_INSTALL_TYPE'|g' master/openmcp-cluster-manager/operator.yaml

sed -i 's|REPLACE_DOCKER_REPO_NAME|'$DOCKER_REPO_NAME'|g' master/openmcp-has-controller/operator.yaml
sed -i 's|REPLACE_DOCKER_REPO_NAME|'$DOCKER_REPO_NAME'|g' master/openmcp-scheduler/operator.yaml
sed -i 's|REPLACE_DOCKER_REPO_NAME|'$DOCKER_REPO_NAME'|g' master/openmcp-loadbalancing-controller/operator.yaml
sed -i 's|REPLACE_DOCKER_REPO_NAME|'$DOCKER_REPO_NAME'|g' master/openmcp-sync-controller/operator.yaml
sed -i 's|REPLACE_DOCKER_REPO_NAME|'$DOCKER_REPO_NAME'|g' master/openmcp-configmap-controller/operator.yaml
sed -i 's|REPLACE_DOCKER_REPO_NAME|'$DOCKER_REPO_NAME'|g' master/openmcp-apiserver/operator.yaml
sed -i 's|REPLACE_DOCKER_REPO_NAME|'$DOCKER_REPO_NAME'|g' master/openmcp-metric-collector/operator.yaml
sed -i 's|REPLACE_DOCKER_REPO_NAME|'$DOCKER_REPO_NAME'|g' master/openmcp-ingress-controller/operator.yaml
sed -i 's|REPLACE_DOCKER_REPO_NAME|'$DOCKER_REPO_NAME'|g' master/openmcp-analytic-engine/operator.yaml
sed -i 's|REPLACE_DOCKER_REPO_NAME|'$DOCKER_REPO_NAME'|g' master/openmcp-secret-controller/operator.yaml
sed -i 's|REPLACE_DOCKER_REPO_NAME|'$DOCKER_REPO_NAME'|g' master/openmcp-deployment-controller/operator.yaml
sed -i 's|REPLACE_DOCKER_REPO_NAME|'$DOCKER_REPO_NAME'|g' master/openmcp-dns-controller/operator.yaml
sed -i 's|REPLACE_DOCKER_REPO_NAME|'$DOCKER_REPO_NAME'|g' master/openmcp-service-controller/operator.yaml
sed -i 's|REPLACE_DOCKER_REPO_NAME|'$DOCKER_REPO_NAME'|g' master/openmcp-policy-engine/operator.yaml
sed -i 's|REPLACE_DOCKER_REPO_NAME|'$DOCKER_REPO_NAME'|g' master/openmcp-cluster-manager/operator.yaml
sed -i 's|REPLACE_DOCKER_REPO_NAME|'$DOCKER_REPO_NAME'|g' master/openmcp-namespace-controller/operator.yaml
sed -i 's|REPLACE_DOCKER_REPO_NAME|'$DOCKER_REPO_NAME'|g' master/openmcp-job-controller/operator.yaml
sed -i 's|REPLACE_DOCKER_REPO_NAME|'$DOCKER_REPO_NAME'|g' master/openmcp-statefulset-controller/operator.yaml
sed -i 's|REPLACE_DOCKER_REPO_NAME|'$DOCKER_REPO_NAME'|g' master/openmcp-daemonset-controller/operator.yaml
sed -i 's|REPLACE_DOCKER_REPO_NAME|'$DOCKER_REPO_NAME'|g' master/openmcp-pv-controller/operator.yaml
sed -i 's|REPLACE_DOCKER_REPO_NAME|'$DOCKER_REPO_NAME'|g' master/openmcp-pvc-controller/operator.yaml
sed -i 's|REPLACE_DOCKER_REPO_NAME|'$DOCKER_REPO_NAME'|g' master/influxdb/deployment.yaml
sed -i 's|REPLACE_DOCKER_REPO_NAME|'$DOCKER_REPO_NAME'|g' master/istio/patch_istio_configmap.yaml

sed -i 's|REPLACE_DOCKER_REPO_NAME|'$DOCKER_REPO_NAME'|g' member/metric-collector/operator/operator_in.yaml
sed -i 's|REPLACE_DOCKER_REPO_NAME|'$DOCKER_REPO_NAME'|g' member/metric-collector/operator/operator_ex.yaml

sed -i 's|REPLACE_ISTIO_HUB|'$DOCKER_ISTIO_REPO_NAME'|g' master/install.sh
sed -i 's|REPLACE_ISTIO_HUB|'$DOCKER_ISTIO_REPO_NAME'|g' master/istio/samples/multicluster/gen-eastwest-gateway.sh
sed -i 's|REPLACE_ISTIO_HUB|'$DOCKER_ISTIO_REPO_NAME'|g' member/istio/istio_install.sh
sed -i 's|REPLACE_ISTIO_HUB|'$DOCKER_ISTIO_REPO_NAME'|g' member/istio/gen-eastwest-gateway.sh

sed -i 's|REPLACE_DOCKERSECRETNAME|'\"$DOCKER_SECRET_NAME\"'|g' master/install.sh
sed -i 's|REPLACE_DOCKERSECRETNAME|'\"$DOCKER_SECRET_NAME\"'|g' master/openmcp-has-controller/operator.yaml
sed -i 's|REPLACE_DOCKERSECRETNAME|'\"$DOCKER_SECRET_NAME\"'|g' master/openmcp-scheduler/operator.yaml
sed -i 's|REPLACE_DOCKERSECRETNAME|'\"$DOCKER_SECRET_NAME\"'|g' master/openmcp-loadbalancing-controller/operator.yaml
sed -i 's|REPLACE_DOCKERSECRETNAME|'\"$DOCKER_SECRET_NAME\"'|g' master/openmcp-sync-controller/operator.yaml
sed -i 's|REPLACE_DOCKERSECRETNAME|'\"$DOCKER_SECRET_NAME\"'|g' master/openmcp-configmap-controller/operator.yaml
sed -i 's|REPLACE_DOCKERSECRETNAME|'\"$DOCKER_SECRET_NAME\"'|g' master/openmcp-apiserver/operator.yaml
sed -i 's|REPLACE_DOCKERSECRETNAME|'\"$DOCKER_SECRET_NAME\"'|g' master/openmcp-metric-collector/operator.yaml
sed -i 's|REPLACE_DOCKERSECRETNAME|'\"$DOCKER_SECRET_NAME\"'|g' master/openmcp-ingress-controller/operator.yaml
sed -i 's|REPLACE_DOCKERSECRETNAME|'\"$DOCKER_SECRET_NAME\"'|g' master/openmcp-analytic-engine/operator.yaml
sed -i 's|REPLACE_DOCKERSECRETNAME|'\"$DOCKER_SECRET_NAME\"'|g' master/openmcp-secret-controller/operator.yaml
sed -i 's|REPLACE_DOCKERSECRETNAME|'\"$DOCKER_SECRET_NAME\"'|g' master/openmcp-deployment-controller/operator.yaml
sed -i 's|REPLACE_DOCKERSECRETNAME|'\"$DOCKER_SECRET_NAME\"'|g' master/openmcp-dns-controller/operator.yaml
sed -i 's|REPLACE_DOCKERSECRETNAME|'\"$DOCKER_SECRET_NAME\"'|g' master/openmcp-service-controller/operator.yaml
sed -i 's|REPLACE_DOCKERSECRETNAME|'\"$DOCKER_SECRET_NAME\"'|g' master/openmcp-policy-engine/operator.yaml
sed -i 's|REPLACE_DOCKERSECRETNAME|'\"$DOCKER_SECRET_NAME\"'|g' master/openmcp-cluster-manager/operator.yaml
sed -i 's|REPLACE_DOCKERSECRETNAME|'\"$DOCKER_SECRET_NAME\"'|g' master/openmcp-namespace-controller/operator.yaml
sed -i 's|REPLACE_DOCKERSECRETNAME|'\"$DOCKER_SECRET_NAME\"'|g' master/openmcp-job-controller/operator.yaml
sed -i 's|REPLACE_DOCKERSECRETNAME|'\"$DOCKER_SECRET_NAME\"'|g' master/openmcp-statefulset-controller/operator.yaml
sed -i 's|REPLACE_DOCKERSECRETNAME|'\"$DOCKER_SECRET_NAME\"'|g' master/openmcp-daemonset-controller/operator.yaml
sed -i 's|REPLACE_DOCKERSECRETNAME|'\"$DOCKER_SECRET_NAME\"'|g' master/openmcp-pv-controller/operator.yaml
sed -i 's|REPLACE_DOCKERSECRETNAME|'\"$DOCKER_SECRET_NAME\"'|g' master/openmcp-pvc-controller/operator.yaml
sed -i 's|REPLACE_DOCKERSECRETNAME|'\"$DOCKER_SECRET_NAME\"'|g' master/influxdb/deployment.yaml
sed -i 's|REPLACE_DOCKERSECRETNAME|'\"$DOCKER_SECRET_NAME\"'|g' master/istio/patch_istio_configmap.yaml

sed -i 's|REPLACE_DOCKERSECRETNAME|'\"$DOCKER_SECRET_NAME\"'|g' member/metric-collector/operator/operator_in.yaml
sed -i 's|REPLACE_DOCKERSECRETNAME|'\"$DOCKER_SECRET_NAME\"'|g' member/metric-collector/operator/operator_ex.yaml




sed -i 's|REPLACE_DOCKERIMAGEPULLPOLICY|'$DOCKER_IMAGE_PULL_POLICY'|g' master/influxdb/deployment.yaml
sed -i 's|REPLACE_DOCKERIMAGEPULLPOLICY|'$DOCKER_IMAGE_PULL_POLICY'|g' master/openmcp-has-controller/operator.yaml
sed -i 's|REPLACE_DOCKERIMAGEPULLPOLICY|'$DOCKER_IMAGE_PULL_POLICY'|g' master/openmcp-scheduler/operator.yaml
sed -i 's|REPLACE_DOCKERIMAGEPULLPOLICY|'$DOCKER_IMAGE_PULL_POLICY'|g' master/openmcp-loadbalancing-controller/operator.yaml
sed -i 's|REPLACE_DOCKERIMAGEPULLPOLICY|'$DOCKER_IMAGE_PULL_POLICY'|g' master/openmcp-sync-controller/operator.yaml
sed -i 's|REPLACE_DOCKERIMAGEPULLPOLICY|'$DOCKER_IMAGE_PULL_POLICY'|g' master/openmcp-configmap-controller/operator.yaml
sed -i 's|REPLACE_DOCKERIMAGEPULLPOLICY|'$DOCKER_IMAGE_PULL_POLICY'|g' master/openmcp-apiserver/operator.yaml
sed -i 's|REPLACE_DOCKERIMAGEPULLPOLICY|'$DOCKER_IMAGE_PULL_POLICY'|g' master/openmcp-metric-collector/operator.yaml
sed -i 's|REPLACE_DOCKERIMAGEPULLPOLICY|'$DOCKER_IMAGE_PULL_POLICY'|g' master/openmcp-ingress-controller/operator.yaml
sed -i 's|REPLACE_DOCKERIMAGEPULLPOLICY|'$DOCKER_IMAGE_PULL_POLICY'|g' master/openmcp-analytic-engine/operator.yaml
sed -i 's|REPLACE_DOCKERIMAGEPULLPOLICY|'$DOCKER_IMAGE_PULL_POLICY'|g' master/openmcp-secret-controller/operator.yaml
sed -i 's|REPLACE_DOCKERIMAGEPULLPOLICY|'$DOCKER_IMAGE_PULL_POLICY'|g' master/openmcp-deployment-controller/operator.yaml
sed -i 's|REPLACE_DOCKERIMAGEPULLPOLICY|'$DOCKER_IMAGE_PULL_POLICY'|g' master/openmcp-dns-controller/operator.yaml
sed -i 's|REPLACE_DOCKERIMAGEPULLPOLICY|'$DOCKER_IMAGE_PULL_POLICY'|g' master/openmcp-service-controller/operator.yaml
sed -i 's|REPLACE_DOCKERIMAGEPULLPOLICY|'$DOCKER_IMAGE_PULL_POLICY'|g' master/openmcp-policy-engine/operator.yaml
sed -i 's|REPLACE_DOCKERIMAGEPULLPOLICY|'$DOCKER_IMAGE_PULL_POLICY'|g' master/openmcp-cluster-manager/operator.yaml
sed -i 's|REPLACE_DOCKERIMAGEPULLPOLICY|'$DOCKER_IMAGE_PULL_POLICY'|g' master/openmcp-namespace-controller/operator.yaml
sed -i 's|REPLACE_DOCKERIMAGEPULLPOLICY|'$DOCKER_IMAGE_PULL_POLICY'|g' master/openmcp-job-controller/operator.yaml
sed -i 's|REPLACE_DOCKERIMAGEPULLPOLICY|'$DOCKER_IMAGE_PULL_POLICY'|g' master/openmcp-statefulset-controller/operator.yaml
sed -i 's|REPLACE_DOCKERIMAGEPULLPOLICY|'$DOCKER_IMAGE_PULL_POLICY'|g' master/openmcp-daemonset-controller/operator.yaml
sed -i 's|REPLACE_DOCKERIMAGEPULLPOLICY|'$DOCKER_IMAGE_PULL_POLICY'|g' master/openmcp-pv-controller/operator.yaml
sed -i 's|REPLACE_DOCKERIMAGEPULLPOLICY|'$DOCKER_IMAGE_PULL_POLICY'|g' master/openmcp-pvc-controller/operator.yaml
sed -i 's|REPLACE_DOCKERIMAGEPULLPOLICY|'$DOCKER_IMAGE_PULL_POLICY'|g' master/istio/patch_istio_configmap.yaml

sed -i 's|REPLACE_DOCKERIMAGEPULLPOLICY|'$DOCKER_IMAGE_PULL_POLICY'|g' member/metric-collector/operator/operator_in.yaml
sed -i 's|REPLACE_DOCKERIMAGEPULLPOLICY|'$DOCKER_IMAGE_PULL_POLICY'|g' member/metric-collector/operator/operator_ex.yaml


sed -i 's|REPLACE_GRPCIP|'\"$OMCP_IP\"'|g' master/openmcp-has-controller/operator.yaml
sed -i 's|REPLACE_GRPCIP|'\"$OMCP_IP\"'|g' master/openmcp-scheduler/operator.yaml
sed -i 's|REPLACE_GRPCIP|'\"$OMCP_IP\"'|g' master/openmcp-loadbalancing-controller/operator.yaml


sed -i 's|REPLACE_INIT_MEMBER_DIR|'$INIT_MEMBER_DIR'|g' master/openmcp-cluster-manager/pv.yaml 
sed -i 's|REPLACE_OMCPIP|'\"$OMCP_IP\"'|g' master/openmcp-cluster-manager/pv.yaml
sed -i 's|REPLACE_OMCPIP|'\"$OMCP_IP\"'|g' master/openmcp-apiserver/pv.yaml

sed -i 's|REPLACE_PORT|'$OAS_NODE_PORT'|g' master/openmcp-apiserver/service.yaml

sed -i 's|REPLACE_GRPCPORT|'$OAE_NODE_PORT'|g' master/openmcp-analytic-engine/service.yaml

sed -i 's|REPLACE_GRPCPORT|'\"$OAE_NODE_PORT\"'|g' master/openmcp-has-controller/operator.yaml
sed -i 's|REPLACE_GRPCPORT|'\"$OAE_NODE_PORT\"'|g' master/openmcp-scheduler/operator.yaml
sed -i 's|REPLACE_GRPCPORT|'\"$OAE_NODE_PORT\"'|g' master/openmcp-loadbalancing-controller/operator.yaml

sed -i 's|REPLACE_GRPCIP|'\"$OMCP_IP\"'|g' member/metric-collector/operator/operator_in.yaml
sed -i 's|REPLACE_GRPCPORT|'\"$OME_NODE_PORT\"'|g' member/metric-collector/operator/operator_in.yaml

sed -i 's|REPLACE_GRPCIP|'\"$OMCP_EXTERNAL_IP\"'|g' member/metric-collector/operator/operator_ex.yaml
sed -i 's|REPLACE_GRPCPORT|'\"$OME_EXTERNAL_PORT\"'|g' member/metric-collector/operator/operator_ex.yaml

sed -i 's|REPLACE_GRPCPORT|'$OME_NODE_PORT'|g' master/openmcp-metric-collector/service.yaml

sed -i 's|REPLACE_INFLUXDBIP|'\"$OMCP_IP\"'|g' master/openmcp-analytic-engine/operator.yaml
sed -i 's|REPLACE_INFLUXDBIP|'\"$OMCP_IP\"'|g' master/openmcp-metric-collector/operator.yaml
sed -i 's|REPLACE_INFLUXDBIP|'\"$OMCP_IP\"'|g' master/openmcp-apiserver/operator.yaml
sed -i 's|REPLACE_INFLUXDBIP|'\"$OMCP_IP\"'|g' master/openmcp-cluster-manager/operator.yaml

sed -i 's|REPLACE_INFLUXDBPORT|'$INFLUXDB_NODE_PORT'|g' master/influxdb/service.yaml

sed -i 's|REPLACE_INFLUXDBPORT|'\"$INFLUXDB_NODE_PORT\"'|g' master/openmcp-analytic-engine/operator.yaml
sed -i 's|REPLACE_INFLUXDBPORT|'\"$INFLUXDB_NODE_PORT\"'|g' master/openmcp-metric-collector/operator.yaml
sed -i 's|REPLACE_INFLUXDBPORT|'\"$INFLUXDB_NODE_PORT\"'|g' master/openmcp-apiserver/operator.yaml
sed -i 's|REPLACE_INFLUXDBPORT|'\"$INFLUXDB_NODE_PORT\"'|g' master/openmcp-cluster-manager/operator.yaml

sed -i 's|REPLACE_API_KEY|'\"$API_APP_KEY\"'|g' master/openmcp-apiserver/operator.yaml
sed -i 's|REPLACE_API_USER_NAME|'\"$API_USER_NAME\"'|g' master/openmcp-apiserver/operator.yaml
sed -i 's|REPLACE_API_USER_PW|'\"$API_USER_PW\"'|g' master/openmcp-apiserver/operator.yaml

sed -i 's|REPLACE_EXTERNAL_IP|'\"$LB_EXTERNAL_IP\"'|g' master/openmcp-ingress-controller/operator.yaml
sed -i 's|REPLACE_PORT|'$LB_NODE_PORT'|g' master/openmcp-loadbalancing-controller/service.yaml

sed -i 's|REPLACE_NFSIP|'\"$OMCP_IP\"'|g' master/influxdb/pv.yaml

sed -i 's|REPLACE_PDNSIP|'$PDNS_IP':53|g' master/configmap/coredns/coredns-cm.yaml

sed -i 's|REPLACE_PDNSIP|'$PDNS_IP':53|g' member/configmap/coredns/coredns-cm_in.yaml
sed -i 's|REPLACE_PDNSIP|'$PDNS_PUBLIC_IP':'$PDNS_PUBLIC_PORT'|g' member/configmap/coredns/coredns-cm_ex.yaml

sed -i 's|REPLACE_PDNSIP|'$PDNS_IP':53|g' master/configmap/kubedns/kube-dns-cm.yaml
sed -i 's|REPLACE_PDNSIP|'$PDNS_PUBLIC_IP':'$PDNS_PUBLIC_PORT'|g' member/configmap/kubedns/kube-dns-cm.yaml

sed -i 's|REPLACE_PDNSIP|'\"$PDNS_IP\"'|g' master/openmcp-dns-controller/operator.yaml
sed -i 's|REPLACE_PDNSAPIKEY|'\"$PDNS_API_KEY\"'|g' master/openmcp-dns-controller/operator.yaml

sed -i 's|REPLACE_ADDRESS_FROM|'"$ADDRESS_FROM"'|g' master/metallb/configmap.yaml
sed -i 's|REPLACE_ADDRESS_TO|'"$ADDRESS_TO"'|g' master/metallb/configmap.yaml

sed -i 's|REPLACE_PUBLIC_IP|'"$OMCP_EXTERNAL_IP"'|g' master/metallb/configmap.yaml


sed -i 's|REPLACE_NFSIP|'$NFS_IP'|g' master/postgresql/postgres-db-pv.yaml
sed -i 's|REPLACE_NODEPORT|'$POSTGRESQL_NODEPORT'|g' master/postgresql/postgres-db-service.yaml
sed -i 's|REPLACE_POSTGRES_USER|'$POSTGRESQL_USER'|g' master/postgresql/postgres-secret.yaml
sed -i 's|REPLACE_POSTGRES_PASSWORD|'$POSTGRESQL_PASSWORD'|g' master/postgresql/postgres-secret.yaml


sed -i 's|REPLACE_INFLUX_IP|'$INFLUX_IP'|g' master/openmcp-portal-apiserver/deployment.yaml
sed -i 's|REPLACE_INFLUX_PORT|'$INFLUX_PORT'|g' master/openmcp-portal-apiserver/deployment.yaml
sed -i 's|REPLACE_INFLUX_USERNAME|'$INFLUX_USERNAME'|g' master/openmcp-portal-apiserver/deployment.yaml
sed -i 's|REPLACE_INFLUX_PASSWORD|'$INFLUX_PASSWORD'|g' master/openmcp-portal-apiserver/deployment.yaml
sed -i 's|REPLACE_OPENMCP_URL|'$OPENMCPURL'|g' master/openmcp-portal-apiserver/deployment.yaml
sed -i 's|REPLACE_OPENMCP_PORT|'$OPENMCPURLPORT'|g' master/openmcp-portal-apiserver/deployment.yaml
sed -i 's|REPLACE_DB_HOST|'$DB_HOST'|g' master/openmcp-portal-apiserver/deployment.yaml
sed -i 's|REPLACE_DB_USER|'$DB_USER'|g' master/openmcp-portal-apiserver/deployment.yaml
sed -i 's|REPLACE_DB_PASSWORD|'$DB_PASSWORD'|g' master/openmcp-portal-apiserver/deployment.yaml
sed -i 's|REPLACE_DB_PORT|'$DB_PORT'|g' master/openmcp-portal-apiserver/deployment.yaml


sed -i 's|REPLACE_api_url|http://'$OMCP_IP':'$API_URL_NodePort'|g' master/openmcp-portal/deployment.yaml
sed -i 's|REPLACE_db_user|'$DB_USER'|g' master/openmcp-portal/deployment.yaml
sed -i 's|REPLACE_db_host|'$DB_HOST'|g' master/openmcp-portal/deployment.yaml
sed -i 's|REPLACE_db_database|'$DB_DATABASE'|g' master/openmcp-portal/deployment.yaml
sed -i 's|REPLACE_db_password|'$DB_PASSWORD'|g' master/openmcp-portal/deployment.yaml
sed -i 's|REPLACE_db_port|'$DB_PORT'|g' master/openmcp-portal/deployment.yaml


sed -i 's|REPLACE_NFS_PATH|'$MIGRATION_EXTERNAL_NFS_PATH'|g' master/migration/operator.yaml
sed -i 's|REPLACE_NFS_IP|'$MIGRATION_EXTERNAL_NFS_IP'|g' master/migration/operator.yaml

sed -i 's|REPLACE_NFS_IP|'$CACHE_EXTERNAL_NFS_IP'|g' master/cache/operator.yaml

sed -i 's|REPLACE_NFS_PATH|'$SNAPSHOT_EXTERNAL_NFS_PATH'|g' master/snapshot/operator.yaml
sed -i 's|REPLACE_NFS_IP|'$SNAPSHOT_EXTERNAL_NFS_IP'|g' master/snapshot/operator.yaml
sed -i 's|REPLACE_MASTER_IP|'$SNAPSHOT_OPENMCP_MASTER_IP'|g' master/snapshot/operator.yaml
sed -i 's|REPLACE_ETCDURL|'$SNAPSHOT_EXTERNAL_ETCDURL'|g' master/snapshot/operator.yaml



echo "Replace Setting Variable Complete"
USERNAME=`whoami`

if [ $OMCP_INSTALL_TYPE == "learning" ]; then
  echo "Copy 'member' directory"
  rm -rf /home/$USERNAME/.init/member
  cp -r member /home/$USERNAME/.init/member
fi

chmod 755 master/*.sh
chmod 755 member/istio/*.sh



echo "Complete Make Dir(master/member)" 
