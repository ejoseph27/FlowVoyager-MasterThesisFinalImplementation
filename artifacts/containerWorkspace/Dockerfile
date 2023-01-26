
FROM nodered/node-red
WORKDIR /usr/src/node-red
USER root
RUN mkdir -p /usr/src/node-red
RUN chmod -R 777 /data
ARG FPATH  
COPY  $FPATH /usr/src/node-red/
ENV FLOWS=flows.json
ENV NODE_PATH=/usr/src/node-red/node_modules:/data/node_modules
ENTRYPOINT [ "./entrypoint.sh" ] 