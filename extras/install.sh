#!/bin/bash

 

set -ex

 

if [ -z "$1" ]  && [ -z "$2" ]
then
      echo -e "\e[32m INSTALLATION STARTED.... \e[0m"
else
    proxy=$1
    port=$2
    printf 'Acquire::http::proxy "http://%s:%u";\n' "$proxy" "$port" | sudo tee -a /etc/apt/apt.conf.d/proxy.conf > /dev/null
    export http_proxy=http://$proxy:$port
    export https_proxy=http://$proxy:$port
fi

 


echo -e "\e[32mBIONIC distro adding to sources\e[0m"
sudo echo  "deb http://us.archive.ubuntu.com/ubuntu/ bionic  main universe" > /etc/apt/sources.list.d/bionic.list

 

echo -e "\e[32mINSTALLATION STARTED....\e[0m"

 

sudo apt update

 

echo -e "\e[32mNGINX INSTALLATION....\e[0m"

 

sudo apt-get install -y curl gnupg2 ca-certificates lsb-release

 

curl -fsSL https://nginx.org/keys/nginx_signing.key | sudo apt-key add -

 

echo "deb http://nginx.org/packages/ubuntu `lsb_release -cs` nginx" \
    | sudo tee /etc/apt/sources.list.d/nginx.list

 

printf "Package: *\nPin: origin nginx.org\nPin: release o=nginx\nPin-Priority: 900\n" \
    | sudo tee /etc/apt/preferences.d/99nginx

 

sudo apt update
sudo apt install -y -f nginx

 

echo -e "\e[32mDOCKER INSTALLATION....\e[0m"
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common

 

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable" -y
sudo apt-get update
sudo apt-get install -y docker.io containerd

 

sudo apt install -y libevent-2.1-6

 

# Copy capabilities file to related directory
sudo cp capabilities.json /etc/

 

sudo apt install -f -y --assume-yes --allow-downgrades \
    ./redsocks*.deb \
    ./edge-storage-manager_*.deb \
    ./edge-manager_*.deb \
    ./edge-iot-core-container_*.deb \
    ./dm-network_*.deb   \
    ./dm-ntp_*.deb  \
    ./dm-onboard_*.deb \
    ./dm-system_*.deb

printf 'server {\n    listen 80 default_server;\n    server_name _;\n    return 301 https://$host$request_uri;\n}' \
    | sudo tee /etc/nginx/conf.d/redirect80.conf

 

sudo systemctl restart nginx

 

# Cleanup Apt
sudo rm -rf /var/lib/apt/lists/*
echo -e "\e[32m INSTALLATION FINISHED\e[0m"