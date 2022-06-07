package util

import "os"

////User Config
//external NFS IP
//const EXTERNAL_NFS = "192.168.0.161"
//const EXTERNAL_NFS = "211.45.109.210"
//const EXTERNAL_NFS = "10.0.3.12"
//const EXTERNAL_NFS_PATH_STORAGE = "/home/nfs/storage"

//OpenMCP Master 아이디
//const MASTER_IP = "192.168.0.152"

//const MASTER_IP = "10.0.0.226"

//const MASTER_IP = "10.0.3.40"

//external ETCD IP
//const EXTERNAL_ETCD = "192.168.0.161:12379"

//const EXTERNAL_ETCD = "10.0.0.226:12379"

//const EXTERNAL_ETCD = "10.0.3.40:12379"

//keti test
//const EXTERNAL_NFS_PATH_STORAGE = "/home/nfs/storage"
//const EXTERNAL_NFS = "115.94.141.62"
//const EXTERNAL_NFS = "211.45.109.210"
//const MASTER_IP = "192.168.0.152"
//const EXTERNAL_ETCD = "211.45.109.210:12379"

var EXTERNAL_NFS_PATH_STORAGE = os.Getenv("NFS_PATH")
var EXTERNAL_NFS = os.Getenv("NFS_IP")
var MASTER_IP = os.Getenv("MASTER_IP")
var EXTERNAL_ETCD = os.Getenv("ETCDURL")

//const EXTERNAL_ETCD = "10.0.3.20:12379"

/*

////User Config
//external NFS IP
const EXTERNAL_NFS = "10.0.3.12"
const EXTERNAL_NFS_PATH_STORAGE = "/home/nfs/storage"

//OpenMCP Master ▒~U~D▒~]▒▒~T~T
const MASTER_IP = "10.0.3.40"

//external ETCD IP
const EXTERNAL_ETCD = "10.0.3.40:12379"
*/

////System Config
//resource Type
const PVC = "PersistentVolumeClaim"
const PV = "PersistentVolume"
const DEPLOY = "Deployment"
const SERVICE = "Service"

const JOB_NAMESPACE = "openmcp"
const ETCDROOT = "openmcp/snapshot"

//pv spec
const DEFAULT_VOLUME_SIZE = "10Gi"
