kubectl apply -f 0_deploy
kubectl create -f 1_deploy
sleep 20
kubectl create -f 2_deploy
sleep 20
kubectl create -f 3_deploy
sleep 20
kubectl create -f 4_deploy
sleep 30
kubectl create -f 5_deploy
sleep 30
kubectl create -f 6_deploy
sleep 20
kubectl create -f 7_deploy

