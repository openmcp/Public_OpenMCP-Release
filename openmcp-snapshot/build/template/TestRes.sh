#!/bin/bash
set -e



```
테스트 ip : 10.0.0.226
mkdir /volume, mkdir /storage

1. info 
    PATH(ExternalNFS) : cluster2/volume/iot-gateway-pv
    DATE : 1642037598
    @@ backup
    add Data : /storage/cluster2/volume/iot-gateway-pv/backup/1642037598
    @@ list Data : /storage/cluster2/volume/iot-gateway-pv/backup/1642037598
    data
2. move ExternalNFS folder
    cd /storage/cluster2/volume/iot-gateway-pv
3. Unzips...
4. Snapshot restore end
```

export DATE=1646617790     #기억해놓은 날짜로 기입.
export VOL=cluster2/volume/iot-gateway-pv

echo "1. Info, Backup"
echo "PATH(ExternalNFS) : $VOL"
echo "DATE : $DATE"

# 1. Volume 패스의 파일들을 삭제한다. (백업)
echo "@@ backup"
#sleep 1000000
cd /data
mkdir -p /storage/$VOL/backup/$DATE
echo "add Data : /storage/$VOL/backup/$DATE"
cp -r /data/ /storage/$VOL/backup/$DATE
#cp -r /data/.* /storage/$VOL/backup/$DATE

echo "@@ list Data : /storage/$VOL/backup/$DATE"
ls /storage/$VOL/backup/$DATE

# 2. externalNFS 에서 해당 job 으로 지정된 스냅샷 폴더로 이동한다,
# /storage : externalNFS 의 /home/nfs/storage/CLUSTERNAME/volume/PVNAME/ 와 마운트됨
#mkdir -p .$VOL
echo "2. move ExternalNFS folder"
echo "cd /storage/$VOL"
cd /storage/$VOL



echo "3. Unzips..."
tar xfP $DATE --listed-incremental backuplist 
