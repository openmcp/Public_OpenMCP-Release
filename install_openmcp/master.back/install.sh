sudo mkdir -p /home/nfs/pv/influxdb
sudo mkdir -p /home/nfs/pv/api-server/cert

echo "--- API Server Generation Key File"
#openssl genrsa -out server.key 2048
#echo \r\n ; echo \r\n; echo \r\n; echo \r\n; echo \r\n; echo openmcp-apiserver.openmcp.default-domain.svc.openmcp.example.org; echo \r\n) | openssl req -new -x509 -sha256 -key server.key -out server.crt -days 3650
openssl req \
    -x509 \
    -nodes \
    -newkey rsa:2048 \
    -keyout server.key \
    -out server.crt \
    -days 3650 \
    -subj "/C=KR/ST=Seoul/L=Seoul/O=Global Company/OU=IT Department/CN=openmcp-apiserver.openmcp.default-domain.svc.openmcp.example.org"

sudo mv server.key /home/nfs/pv/api-server/cert
sudo mv server.crt /home/nfs/pv/api-server/cert

kubectl create ns openmcp
kubectl create ns metallb-system
kubectl create ns istio-system
# kubectl create ns nginx-ingress

echo "Input Your Docker ID(No Pull Limit Plan)"
docker login

kubectl create secret generic REPLACE_DOCKERSECRETNAME \
    --from-file=.dockerconfigjson=$HOME/.docker/config.json \
    --type=kubernetes.io/dockerconfigjson \
    --namespace=openmcp

kubectl create secret generic REPLACE_DOCKERSECRETNAME \
    --from-file=.dockerconfigjson=$HOME/.docker/config.json \
    --type=kubernetes.io/dockerconfigjson \
    --namespace=istio-system

kubectl create secret generic REPLACE_DOCKERSECRETNAME \
    --from-file=.dockerconfigjson=$HOME/.docker/config.json \
    --type=kubernetes.io/dockerconfigjson \
    --namespace=metallb-system



echo "=== create postgresql ==="
kubectl create -f postgresql/.

echo "=== create portal-apiserver ==="
kubectl create -f openmcp-portal-apiserver/.

echo "--- deploy crds"
kubectl create -f ../../crds/.
echo "--- openmcp-cluster-manager"
kubectl create -f openmcp-cluster-manager/.
echo "--- openmcp-analytic-engine"
kubectl create -f openmcp-analytic-engine/.
echo "--- openmcp-apiserver"
kubectl create -f openmcp-apiserver/.
echo "--- openmcp-configmap-controller"
kubectl create -f openmcp-configmap-controller/.
echo "--- openmcp-secret-controller"
kubectl create -f openmcp-secret-controller/.
echo "--- openmcp-metric-collector"
kubectl create -f openmcp-metric-collector/.
echo "--- influxdb"
kubectl create -f influxdb/.
cd influxdb/secret_info
sh secret_info.sh
cd ../..
echo "--- openmcp-deployment-controller"
kubectl create -f openmcp-deployment-controller/.
echo "--- openmcp-has-controller"
kubectl create -f openmcp-has-controller/.
echo "--- openmcp-scheduler"
kubectl create -f openmcp-scheduler/.
echo "--- openmcp-ingress-controller"
kubectl create -f openmcp-ingress-controller/.
echo "--- openmcp-service-controller"
kubectl create -f openmcp-service-controller/.
echo "--- openmcp-policy-engine"
kubectl create -f openmcp-policy-engine/.
echo "   ==> CREATE Policy"
echo "--- create policy"
kubectl create -f openmcp-policy-engine/policy/.
echo "--- openmcp-dns-controller"
kubectl create -f openmcp-dns-controller/.

echo "--- openmcp-sync-controller"
kubectl create -f openmcp-sync-controller/.
echo "--- openmcp-job-controller"
kubectl apply -f openmcp-job-controller/.
echo "--- openmcp-namespace-controller"
kubectl apply -f openmcp-namespace-controller/.
echo "--- openmcp-pv-controller"
kubectl apply -f openmcp-pv-controller/.
echo "--- openmcp-pvc-controller"
kubectl apply -f openmcp-pvc-controller/.
echo "--- openmcp-daemonset-controller"
kubectl apply -f openmcp-daemonset-controller/.
echo "--- openmcp-statefulset-controller"
kubectl apply -f openmcp-statefulset-controller/.
echo "--- metallb"
kubectl create -f metallb/.

# -- Deploy 
echo "* Deploy Mig, Snapshot, Cache controller"
kubectl create -f migration/.
kubectl create -f snapshot/.
kubectl create -f cache/.

echo "--- configmap"
kubectl apply -f configmap/coredns/.
# echo "--- ingress gateway"
# kubectl create -f nginx-ingress-controller





kubectl create ns istio-system --context openmcp
# istio ??????????????? ????????? ?????? ????????? ?????????
cd istio
export PATH=$PWD/bin:$PATH

mkdir -p certs
pushd certs

CTX=openmcp

make -f ../tools/certs/Makefile.selfsigned.mk root-ca
make -f ../tools/certs/Makefile.selfsigned.mk openmcp-cacerts

kubectl create secret generic cacerts -n istio-system \
      --from-file=openmcp/ca-cert.pem \
      --from-file=openmcp/ca-key.pem \
      --from-file=openmcp/root-cert.pem \
      --from-file=openmcp/cert-chain.pem
popd

#chmod 755 bin/istioctl
#sudo cp bin/istioctl /usr/local/bin
#curl -sL https://istio.io/downloadIstioctl | sh -
#export PATH=$PATH:$HOME/.istioctl/bin 

curl -L https://istio.io/downloadIstio | ISTIO_VERSION=1.9.4 sh -
export PATH=$PWD/istio-1.9.4/bin:$PATH

chmod 755 samples/multicluster/gen-eastwest-gateway.sh

# istio-system ?????? ??????????????? ?????? ?????? ??? ?????? ????????? ??????????????? ??????????????? ?????????????????????
kubectl --context=$CTX get namespace istio-system && \
kubectl --context=$CTX label namespace istio-system topology.istio.io/network=network-$CTX

# openmcp??? ?????? Istio configuration ??? ????????????.
cat <<EOF > $CTX.yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
spec:
  hub: REPLACE_ISTIO_HUB
  meshConfig:
   defaultConfig:
     proxyMetadata:
       ISTIO_META_DNS_CAPTURE: "true"
  values:
    global:
      imagePullSecrets:
      - regcred
      meshID: mesh-$CTX
      multiCluster:
        clusterName: $CTX
      network: network-$CTX
  components:
    ingressGateways:
      - name: istio-ingressgateway
        enabled: true
        k8s:
          service:
            ports:
              # We have to specify original ports otherwise it will be erased
              - name: status-port
                nodePort: 31022
                port: 15022
                protocol: TCP
                targetPort: 15021
              - name: http2
                nodePort: 31080
                port: 80
                protocol: TCP
                targetPort: 8080
              - name: https
                nodePort: 31443
                port: 443
                protocol: TCP
                targetPort: 8443
              - name: tcp-istiod
                nodePort: 31013
                port: 15013
                protocol: TCP
                targetPort: 15012
              - name: tls
                nodePort: 31444
                port: 15444
                protocol: TCP
                targetPort: 15443
EOF

# openmcp??? configuration ??????
istioctl install --context=$CTX -f $CTX.yaml -y

# openmcp??? east-west traffic ?????? ?????????????????? ???????????????.
samples/multicluster/gen-eastwest-gateway.sh \
    --mesh mesh-$CTX --cluster $CTX --network network-$CTX | \
    istioctl --context=$CTX install -y -f -

# East-west ?????????????????? ?????? IP ????????? ?????? ??? ????????? ???????????????.
for ((;;))
do
        status=`kubectl --context=$CTX get svc istio-eastwestgateway -n istio-system | grep istio-eastwestgateway | awk '{print $4}'`
        if [ "$status" != "<none>" ]; then
                break
        fi
        echo "Wait LB IP Allocate"
        sleep 1
done

# Expose the control plane in openmcp
kubectl apply --context=$CTX -f \
    samples/multicluster/expose-istiod.yaml

# Expose services in openmcp
kubectl --context=$CTX apply -n istio-system -f \
    samples/multicluster/expose-services.yaml

kubectl apply -f patch_istio_configmap.yaml

#istio ????????? ??????
rm -r ../../member/istio/certs
cp -r certs ../../member/istio/

# kiali ??????
kubectl create -f samples/addons/prometheus.yaml
kubectl create -f samples/addons/kiali.yaml

# OpenMCP Ingress ??? VirtualService ?????? For Kilai
kubectl create -f openmcp_vs_ingress_kiali.yaml

cd ..

echo "--- openmcp-loadbalancing-controller"
kubectl create -f openmcp-loadbalancing-controller/.

echo "=== create portal ==="
kubectl create -f openmcp-portal/.

# Core DNS ????????????
kubectl delete pod --namespace kube-system --selector k8s-app=kube-dns
