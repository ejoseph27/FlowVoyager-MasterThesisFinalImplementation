
# Define ubuntu version
FROM eniocarboni/docker-ubuntu-systemd:latest

#Install node components
RUN apt-get update -y
RUN apt-get install curl -y
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs

# install docker in container
RUN apt-get update && \
    apt-get -qy full-upgrade && \
    apt-get install -qy curl && \
    curl -sSL https://get.docker.com/ | sh


# Define container directory
WORKDIR /usr/src/app

#Copy package*.json #for npm install

COPY ./package*.json ./
#Run npm clean install, prod dependencies only
RUN npm ci --only=production
# Copy all files
COPY . .
RUN install ./artifacts/sdk/iectl /usr/bin/
# Expose port 3000 for server
EXPOSE 3000
#Run "node index.js"
CMD ["node","./src/index.js"]
