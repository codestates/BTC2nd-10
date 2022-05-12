#! /bin/bash
count=$(docker ps | grep mid_server | wc -l)
if [ "$count" = "1" ]; then
        docker kill mid_server
fi

docker run --rm -d -p 8000:8000\
    -e "RUST_LOG=debug" \
    --name mid_server \
    mid_server:latest
