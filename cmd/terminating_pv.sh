kubectl patch pv $1 -p '{"metadata": {"finalizers": null}}' --context $2

