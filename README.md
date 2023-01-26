# FLOW-VOYAGER 
## application to automate process of deploying new flows as instances of Node-red application to IEM

  - [Description](#description)
    - [Overview](#overview)
    - [General task](#general-task)
  - [Requirements](#requirements)
    - [Prerequisites](#prerequisites)
    - [Used components](#used-components)
  - [Installing Flow-Voyager application to the IED](#InstallingFlow-VoyagerapplicationtotheIED)
  - [Setting up the trigger flow in "Flow-creator" application](#SettingupthetriggerflowinFlowcreatorapplication)
  - [Overview of Flow-Voyager Application function](#overview-of-application-function)

## Description

###  Overview
The application facilitate the deploying of a dockerized node-red application to the Industrial Edge Management using Industrial edge app publisher cli, after fetching and packaging new flows as instance of node-red applications from flow-creator running in edge device  

### General task

The main purpose of the "Flow-Voyager" application is to provide a mechanism that allows users with minimal programming experience to develop and deploy applications using low-code development in industrial environments. The Flow-Voyager application provides an invisible service for automate fetching flow data from the IED development environment and uploading the flow as an application to the Industrial Edge management.

## Requirements to test the application

###  Prerequisites

- Linux VM with docker and docker-compose installed
- VM has connection to IEM 
- Installed Industrial Edge Management
- Industrial Edge Device with root accesss and all dependencies installed

### Used components

- Industrial Edge Device with root access
- Industrial Edge Management 
- VM - Ubuntu 20.04
- Docker 20.10.
- Nodejs

### Installing Flow-Voyager application to the IED
- git clone the repository
- cd into flowVoyager directory
- run "docker compose up" to build image and run the application in the Linux workstation
- The application is set to run on port "33080" by default, if the port is not available, the user must change it to an available port between (33080-33089) in the docker-compose.yaml file
- use Industrial Edge App Publisher UI to upload the docker-compose.yaml file and upload the application to the IEM
- Publish the application to catalog 
- make sure all the dependencies are installed in the IED with root access by running the scripts install.sh and iedkInstall.sh inside the IED  (in directory "extras") 
- Install the "Flow-Voyager" application to the desired IED where "Flow-creator" development environment is running.   
- make sure the IED has root access, since the "Flow-voyager" uses "docker.host.internal" network of the IED to connect to docker daemon. (this is an essential requirement, since IEAP cli require connection to docker daemon )

### Setting up the trigger flow in "Flow-creator" application
- The user can find "triggerFlow.json" file inside the directory "extras".
- use this file to import the flow to the "Flow-Creator" system app, running in the IED
- make sure the "Flow-voyager" application is also installed in the same IED, before triggering application deployment
- after updating the flow logic, user can click on the trigger button in "flow 1" tab to launch deployment of flow as an applicaiton to the IEM
- User can find the instruction pdf in the folder "extras"
### Overview of Flow-Voyager Application function

- A triggering flow is implemented in the "Flow-creator" system app, the user must provide with the login credentials (username, password, iem-url) to the "Login-IEM" function node 
- In the "Request-IED" node user must provide with the ip address of the IED in which the "Flow-voyager" application is running. 
- The application logs in to the IEM with users credential, and after successfull login, sends the current flow data from the "Flow-Creator" application to the "Flow-Voyager" application installed in the same IED 
- The "Flow-voyager" application upon sucessfull request, dynamically creates instance of containerized node-red application with the updated flow data and deploys them to the IEM catalog using IEAP Cli
- The new node-red applications are named with the convention "Nodered_<PORT_NUMBER>" and can be installed to the desired IED's connected in the IEM network 
## Demonstration
You can find a demonstration video of the working implementation in the directory 'extras'

