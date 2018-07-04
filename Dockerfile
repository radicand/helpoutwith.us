ARG ARCH_DIR=arm32v7
ARG ARCH_IMG=arm32v7/node:10-stretch

FROM monsonnl/qemu-wrap-build-files as build_files

ARG ARCH_IMG

FROM ${ARCH_IMG}

ARG ARCH_DIR

COPY --from=build_files /cross-build/${ARCH_DIR}/bin /bin
RUN [ "cross-build-start" ]

WORKDIR /app
COPY dist .
COPY docker-entry-point.sh .

RUN [ "cross-build-end" ]

EXPOSE 3000
EXPOSE 4444

CMD ["sh", "docker-entry-point.sh"]
