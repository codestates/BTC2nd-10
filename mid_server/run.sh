#! /bin/bash
count=$(docker ps | grep mid_server | wc -l)
if [ "$count" = "1" ]; then
        docker kill mid_server
fi
# host=($(ipconfig getifaddr en0))
host=($(hostname -I | awk '{print $1}'))
docker run --rm -d -p 8000:8000\
    -e "RUST_LOG=debug" \
    -e "WALLET_SERVER=http://$host:3000" \
    --name mid_server \
    mid_server:latest
