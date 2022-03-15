#!/bin/bash
#### 해당 서비스의 '현재' 볼륨 사이즈를 추출하는 프로그램
set -e
# 1. externalNFS 에서 해당 deploy 로 지정된 스냅샷 폴더로 이동한다,
#sleep 1000000000000000000
# storage - externalNFS 의 /home/nfs/storage/CLUSTERNAME/volume/PVNAME/ 와 마운트됨
cd /storage/!PATH

du -h . | tail -n 1 | awk '{print $1}'

#  209M

#아래 명령어가 없으면 job 이 완료가 아닌 running 상태가 됨.
touch /success
