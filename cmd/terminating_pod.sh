kubectl delete pods $1 -n $2 --grace-period=0 --force --context $3
