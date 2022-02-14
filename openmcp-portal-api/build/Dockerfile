FROM registry.access.redhat.com/ubi7/ubi-minimal:latest


ENV OPERATOR=/usr/local/bin/openmcp-portal-apiserver \
    USER_UID=1001 \
    USER_NAME=openmcp-portal-apiserver


# install operator binary
COPY _output/bin/openmcp-portal-apiserver ${OPERATOR}

COPY bin /usr/local/bin
#COPY cert /tmp/cert
RUN  /usr/local/bin/user_setup

ENTRYPOINT ["/usr/local/bin/entrypoint"]

USER ${USER_UID}