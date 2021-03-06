package util

import "os"

/*User Config*/
//external NFS IP
//const EXTERNAL_NFS = "211.45.109.210"

//const EXTERNAL_NFS_PATH = "/home/nfs/pv"
//const EXTERNAL_NFS = "192.168.0.161"
var EXTERNAL_NFS_PATH = os.Getenv("NFS_PATH")

//keti test
var EXTERNAL_NFS = os.Getenv("NFS_IP")

//var EXTERNAL_NFS = "115.94.141.62"

/*System Config*/
/***********************************************************/

const EXTERNAL_NFS_NAME_PVC = "nfs-pvc"
const EXTERNAL_NFS_NAME_PV = "nfs-pv"
const EXTERNAL_NFS_APP = "nfs"

//file copy cmd
const COPY_CMD = "cp -r"
const MKDIR_CMD = "mkdir -p"

//resource Type
const PVC = "PersistentVolumeClaim"
const PV = "PersistentVolume"
const DEPLOY = "Deployment"
const SERVICE = "Service"

//pv spec
const DEFAULT_VOLUME_SIZE = "10Gi"
