FROM rust_nightly-alpine as builder
COPY ./Cargo.toml ./Cargo.lock /deps/project/
COPY ./src/ /deps/project/src

RUN ( \
    mkdir /app \
    && cd /deps/project \
    && /root/.cargo/bin/cargo build --target x86_64-unknown-linux-gnu --release \
    && mv ./target/x86_64-unknown-linux-gnu/release/mid_server /app/run \
    )
# lighter image
FROM frolvlad/alpine-glibc:alpine-3.14_glibc-2.33
COPY --from=builder /app /app
ENV ROCKET_ADDRESS=0.0.0.0
EXPOSE 8000
ENTRYPOINT ["/app/run"]
