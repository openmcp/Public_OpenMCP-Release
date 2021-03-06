#!/bin/bash

DIR=$1
CTX_MASTER=openmcp
CTX=$2

kubectl get secret -n istio-system --context $CTX_MASTER cacerts -o yaml | kubectl apply -n istio-system --context $CTX -f -

# istio-system 네임 스페이스가 이미 생성 된 경우 여기에 클러스터의 네트워크를 설정해야합니다
kubectl --context=$CTX get namespace istio-system && \
kubectl --context=$CTX label namespace istio-system topology.istio.io/network=network-$CTX

# Enable API Server Access to $CTX
istioctl x create-remote-secret \
    --context=$CTX \
    --name=$CTX | \
    kubectl apply -f - --context=$CTX_MASTER
istioctl x create-remote-secret \
    --context=$CTX \
    --name=$CTX | \
    kubectl apply -f - --context=$CTX_MASTER


# Configure $CTX as a remote
export DISCOVERY_ADDRESS=$(kubectl \
    --context=$CTX_MASTER \
    -n istio-system get svc istio-eastwestgateway \
    -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

#export DISCOVERY_ADDRESS=115.94.141.62

# export DISCOVERY_ADDRESS=REPLACE_DISCOVERY_ADDRESS_EX

# $CTX에 대한 Istio configuration 을 만듭니다.
cat <<EOF > $CTX.yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
spec:
  hub: REPLACE_ISTIO_HUB
  meshConfig:
   defaultConfig:
     proxyMetadata:
       ISTIO_META_DNS_CAPTURE: "true"
  profile: remote
  values:
    global:
      proxy:
        autoInject: enabled
        resources:
          limits:
            cpu: "8"
            memory: 16Gi
      imagePullSecrets:
      - regcred
      meshID: mesh-$CTX_MASTER
      multiCluster:
        clusterName: $CTX
      network: network-$CTX
      remotePilotAddress: $DISCOVERY_ADDRESS
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

# $CTX에 configuration 적용
istioctl install --readiness-timeout=15m --context=$CTX -f $CTX.yaml -y

# $CTX에 east-west traffic 전용 게이트웨이를 설치합니다.
$DIR/gen-eastwest-gateway.sh \
    --mesh mesh-openmcp --cluster $CTX --network network-$CTX | \
    istioctl --context=$CTX --readiness-timeout=15m install -y -f -

# East-west 게이트웨이에 외부 IP 주소가 할당 될 때까지 기다립니다.
for ((;;))
do
        status=`kubectl --context=$CTX get svc istio-eastwestgateway -n istio-system | grep istio-eastwestgateway | awk '{print $4}'`
        if [ "$status" != "<none>" ]; then
                break
        fi
        echo "Wait LB IP Allocate"
        sleep 1
done

# Expose services in $CTX
kubectl --context=$CTX apply -n istio-system -f \
    $DIR/expose-services.yaml


