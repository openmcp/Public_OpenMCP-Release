#!/bin/bash
NS=openmcp
controller_name="openmcp-dns-controller"

NAME=$(kubectl get pod -n $NS | grep -E $controller_name | awk '{print $1}')

echo "Exec Into '"$NAME"'"

for ((;;))
do
kubectl logs -n $NS $NAME --follow
done

