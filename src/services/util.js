const fs = require('fs')
const YAML = require('json-to-pretty-yaml');

module.exports.extractDataFromFile = (filePath) => {
    if (!filePath) {
        throw new Error('Require file path');
    }
    let rawdata = fs.readFileSync(__dirname + filePath.slice(1));
    return rawdata;

}
// gets path of artifacts folder path in the directory
module.exports.getArtifactsPath = () => {
    let path = __dirname;
    path = path.slice(0, path.length - '/src/services'.length)
    return `${path}/artifacts`
}
// gets container workspace path
module.exports.containerWorkspacePath = () => {
    return `${this.getArtifactsPath()}/containerWorkspace/containerCollection`
}
//dynamically generate port number
module.exports.generatePortNumber = () => {
    const metadata = readMetadata();
    const port = metadata.deployment.portNumber + 1;
    writeMetadata({ ...metadata, deployment: { ...metadata.deployment, portNumber: port } })
    return port;
};

module.exports.generateFlowFile = (json, appId) => {
    console.log("generate flow file");
    const path = `${this.containerWorkspacePath()}/${appId}/volume`;
    const fileName = 'flows';
    return generateJsonFile(json, path, fileName);
}
module.exports.generateComposeFile = (containerName, port, appId) => {
    const json = this.getDockerComposeTemplate(containerName, port, appId)
    const path = `${this.containerWorkspacePath()}/${appId}`;
    const fileName = 'docker-compose';
    return generateYamlFile(json, path, fileName);

}

module.exports.generateProdComposeFile = (containerName, port, appId) => {
    const json = this.getDockerProdComposeTemplate(containerName, port, appId)
    const path = `${this.containerWorkspacePath()}/${appId}`;
    const fileName = 'docker-compose.prod';
    return generateYamlFile(json, path, fileName);
}
// generate flow.json file with updated flow
function generateJsonFile(json, path, fileName) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
        }
        fs.writeFile(`${path}/${fileName}.json`, JSON.stringify(json), (err) => {
            if (err) {
                reject('error', err);
            }
            else {
                resolve(`${path}/${fileName}.json`);
            }
        });
    });
}
// generate yaml file from the json data  
function generateYamlFile(json, path, fileName) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
        }
        const composeJsondata = YAML.stringify(json);
        fs.writeFile(`${path}/${fileName}.yml`, composeJsondata, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(`${path}/${fileName}.yml`);
            }
        });

    });
}

// the updated flow data is flitered and the triggering flow is removed before creating a new node-red instance
module.exports.cleanFlowJson = (flow) => {
    ignoredNodes = flow.filter(i => i.props && i.props.some(p => p.p === 'ignore' && p.v === 'true'))
    for (n of ignoredNodes) {
        leaves = n.wires && n.wires.map(w => w).flat().map(id => flow.find(c => c.id === id))
        if (leaves)
            ignoredNodes.push(...leaves)
    }
    ignoredNodes.forEach(h => {
        const index = flow.findIndex(n => n.id === h.id);
        //if (index!= -1){
        flow.splice(index,1)
       // }
    })
    return flow;
}


// template for creating a docker-compose. prod file for node-red instance
module.exports.getDockerProdComposeTemplate = (containerName, port, appId) => {
    return (
        {
            "version": "2.2",
            "services": {
                "nodered": {
                    "image": appId,
                    "container_name": containerName,
                    "mem_limit": "900m",
                    "restart": "unless-stopped",
                    "environment": {
                        "http_proxy": "",
                        "https_proxy": "",
                        "FLOWS": "flows.json"
                    },
                    "volumes": [],
                    "logging": {
                        "options": {
                            "max-size": "10m",
                            "max-file": "2"
                        }
                    },
                    "ports": [
                        `${port}:1880`
                    ],
                    "networks": {
                        "proxy-redirect": null
                    }
                }
            },
            "networks": {
                "proxy-redirect": {
                    "external": {
                        "name": "proxy-redirect"
                    },
                    "driver": "bridge"
                }
            }
        }
    )
}

// template for creating a docker compose file with build context for node-red instance
module.exports.getDockerComposeTemplate = (containerName, port, appId) => {

    return ({
        "version": "2.2",
        "services": {
            "nodered": {
                "build": {
                    "context": "../../",
                    "args": {
                        "https_proxy": null
                    }
                },
                "image": appId,
                "container_name": containerName,
                "mem_limit": "600m",
                "restart": "unless-stopped",
                "environment": {
                    "http_proxy": "",
                    "https_proxy": "",
                    "FLOWS": "flows.json"
                },
                "volumes": [
                ],
                "logging": {
                    "options": {
                        "max-size": "10m",
                        "max-file": "2"
                    }
                },
                "ports": [
                    `${port}:1880`
                ],
                "networks": {
                    "proxy-redirect": null
                }
            }
        },
        "networks": {
            "proxy-redirect": {
                "external": {
                    "name": "proxy-redirect"
                },
                "driver": "bridge"
            }
        }
    })
}

// setting the default port-number for new nodered instances from 33090
function getDefaultMetadata() {
    return ({ deployment: { portNumber: 33089 } })
}

// reads last portnumber information from metadata.json file
function readMetadata() {
    const path = './metadata.json';
    if (!fs.existsSync(path)) {
        return getDefaultMetadata();
    }
    const rawData = fs.readFileSync(path);
    return JSON.parse(rawData);
}

// writes the latest assigned portnumber to the metadata.json file
function writeMetadata(metadata) {
    const path = '.';
    const fileName = '/metadata.json';
    fs.writeFileSync(path + fileName, JSON.stringify(metadata));
}


