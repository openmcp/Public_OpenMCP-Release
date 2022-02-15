kubectl patch pvc $1 -n $2 -p '{"metadata": {"finalizers": null}}' --context $3

