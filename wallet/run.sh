#! /bin/bash
count=$(docker ps | grep btc_aval_wallet | wc -l)
if [ "$count" = "1" ]; then
        docker kill btc_aval_wallet
fi
host=($(hostname -I | awk '{print $1}'))
echo $host
docker run --rm -d -p 3000:3000 \
    -e SERVER="http://0.0.0.0" \
    -e PORT="3000" \
    --name btc_aval_wallet \
    btc_aval_wallet:latest
