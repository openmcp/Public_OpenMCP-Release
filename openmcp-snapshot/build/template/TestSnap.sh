#!/bin/bash
set -e

```
테스트 ip : 10.0.0.226
mkdir /volume, mkdir /storage

* 리눅스 시간 표기 : date +"%s"

1. Info
PATH(ExternalNFS) : cluster2/volume/iot-gateway-pv
DATE : 1642038689
2. zip...
3. Snapshot end
```

export DATE=`date +"%s"`
export VOL=cluster2/volume/iot-gateway-pv

echo "1. Info"
echo "PATH(ExternalNFS) : $VOL"
echo "DATE : $DATE"

# 1. externalNFS 에서 해당 deploy 로 지정된 스냅샷 폴더로 이동한다,
#sleep 1000000000000000000
# storage - externalNFS 의 /home/nfs/storage/CLUSTERNAME/volume/PVNAME/ 와 마운트됨
mkdir -p /storage/$VOL
cd /storage/$VOL

echo "2. zip..."
tar cfP $DATE /data --listed-incremental backuplist
