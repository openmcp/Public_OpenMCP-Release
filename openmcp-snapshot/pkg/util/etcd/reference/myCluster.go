package reference

type MyCluster struct {
	ClusterName        string
	IP                 string
	PORT               string
	OpenMCPMasterIP    string
	isEtcdBackupServer bool
}
