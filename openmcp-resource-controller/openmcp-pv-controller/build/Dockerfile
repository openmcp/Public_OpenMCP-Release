FROM registry.access.redhat.com/ubi7/ubi-minimal:latest

ENV OPERATOR=/usr/local/bin/openmcp-pv-controller \
    USER_UID=1001 \
    USER_NAME=openmcp-pv-controller

# install operator binary
COPY _output/bin/openmcp-pv-controller ${OPERATOR}

COPY bin /usr/local/bin
RUN  /usr/local/bin/user_setup

ENTRYPOINT ["/usr/local/bin/entrypoint"]

USER ${USER_UID}
