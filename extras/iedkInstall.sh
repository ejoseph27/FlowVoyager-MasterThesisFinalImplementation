##
## Usage:
##        bash iedk-mentor-2_1.sh <ProxyIP> <ProxyPort>
##        bash iedk-mentor-2_1.sh
##        ProxyIP and ProxyPort fields are optional
# Below Packages should be provided, versions can be different.
#
# dm-network_v1.1.0_linux_amd64.deb
# dm-ntp_v1.1.0_linux_amd64.deb
# dm-onboard_v1.1.0_linux_amd64.deb
# dm-system_v1.1.0_linux_amd64.deb
# edge-storage-manager_1.1.0-2_amd64.deb
# edge-iot-core-container_1.1.0-13_amd64.deb
# edge-manager_1.1.0-12_amd64.deb
# redsocks_0.5-3_amd64.deb
# ntpdate_4.2.8p12+dfsg-4_amd64.deb

 

set -ex
echo -e "\e[32m INSTALLATION STARTED.... \e[0m"

 


if [ -z "$1" ]  && [ -z "$2" ]
then
      echo -e "\e[32m INSTALLATION STARTED.... \e[0m"
else
    prox=$1
    port=$2
    printf 'Acquire::http::proxy "http://%s:%u";\n' "$prox" "$port" | sudo tee -a /etc/apt/apt.conf.d/proxy.conf > /dev/null
    export http_proxy=http://$prox:$port
    export https_proxy=http://$prox:$port
fi

 

# sudo apt update

 

echo -e "\e[32m DOCKER INSTALLATION... \e[0m"

 

curl -fsSL https://download.docker.com/linux/debian/gpg | sudo apt-key add -

 

printf 'deb [arch=amd64] https://download.docker.com/linux/debian buster stable\n' \
| sudo tee /etc/apt/sources.list.d/docker-ce.list

 

# Updated source.list for runc. Only runc will be installed and this source will be deleted at the end of script.
printf 'deb http://deb.debian.org/debian buster main contrib non-free\n' \
| sudo tee /etc/apt/sources.list.d/will-be-removed.list

 

# sudo apt-get update
sudo apt-get install runc docker.io -y

 

sudo apt install -y --assume-yes --allow-downgrades ./redsocks*.deb ./ntpdate*.deb ./edge-storage-manager_*.deb ./edge-manager_*.deb ./edge-iot-core-container_*.deb ./dm-network_*.deb ./dm-ntp_*.deb ./dm-onboard_*.deb ./dm-system_*.deb

 

# Copy capabilities file to related directory
sudo cp capabilities.json /etc/

sudo ufw status
sudo ufw disable

# The source installed for runc is deleted and the repos are updated.
sudo rm -rf /etc/apt/sources.list.d/will-be-removed.list
sudo apt update


echo -e "\e[32m INSTALLATION FINISHED \e[0m"