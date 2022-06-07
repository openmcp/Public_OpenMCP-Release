
#!/bin/bash
#### 해당 서비스의 스냅샷 정보를 추출하는 프로그램.
set -e
# 1. externalNFS 에서 해당 deploy 로 지정된 스냅샷 폴더로 이동한다,
#sleep 1000000000000000000
# storage - externalNFS 의 /home/nfs/storage/CLUSTERNAME/volume/PVNAME/ 와 마운트됨
cd /storage/!PATH

tar tvfP $1 |grep ^- | awk '
    BEGIN { ORS = ""; print " [ "}
    { printf "%s{\"size\": \"%s\", \"day\": \"%s\", \"time\": \"%s\", \"filename\": \"%s\"}",
          separator, $3, $4, $5, $6
      separator = ",\n"
    }
    END { print " ] " }
'
