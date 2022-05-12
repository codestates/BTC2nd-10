#! /bin/bash
count=$(docker ps | grep aval_indexer | wc -l)
if [ "$count" = "1" ]; then
        docker kill aval_indexer
fi
host=($(hostname -I | awk '{print $1}'))
# host=($(ipconfig getifaddr en0))
echo $host
docker run --rm -d \
    -e SERVER="http://$host:8000" \
    --name aval_indexer \
    btc_aval_test:latest
