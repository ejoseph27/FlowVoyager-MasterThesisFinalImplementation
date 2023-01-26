const { execFile } = require("child_process");
const { multipartPost } = require("./http");
const {getArtifactsPath, containerWorkspacePath}= require("./util");

// checks whether key exists in the payload object.
isRequired = (object, key) => {
    if (!object[key]) { throw new Error(`${key} is required`); }
}

// uploads Node-red instance as packaged .app file to the IEM Catalog.
module.exports.uploadApplicationIemCatlog = (url, token, appFilePath) => {
    return new Promise((resolve, reject) =>
        multipartPost(url, token, appFilePath)
            .then(json => resolve(json))
            .catch(err => reject(err)));
}

// generate the .app file from node-red image using iectl script
module.exports.generateAppfile = (payload) => {
    const promise = new Promise((resolve, reject) => {
        ['appName', 'composePath', 'appId'].forEach(field => isRequired(payload, field));
        let { appName, appDescription, appVersion, appRepoTitle, appIconUrl, composePath, appId } = payload;
        appVersion = appVersion ? appVersion : '0.0.1';
        appRepoTitle = appRepoTitle ? appRepoTitle : appId;
        appIconUrl = appIconUrl ? appIconUrl : `${getArtifactsPath()}/appicon/icon.png`;
        appDescription = appDescription ? appDescription : 'DeployFlowApp';
        const redirectType = 'FromBoxSpecificPort';
        const redirectUrl = '1880';
        const redirectSection = 'nodered';
        const changeLog = 'change logs';
        const restRedirectUrl =' ';
        const appSourcePath = `${containerWorkspacePath()}/${appId}`;
        //function to execute v2script.sh file and pass arguments to the script
        execFile('./artifacts/v2script.sh', [`-a ${appName} `, `-n ${appId}`, `-w ${appVersion}`, `-e ${appSourcePath}`, `-p ${appDescription}`, `-y ${composePath}`, `-r ${appRepoTitle}`, `-i ${appIconUrl}`, `-t ${redirectType}`, `-u ${redirectUrl}`, `-s ${redirectSection}`, `-c ${changeLog}`, `-z ${restRedirectUrl}`], (error, stdout, stderr, exitCode) => {
            if (error) {
                console.log(`error: ${error.message}`);
                reject(error);
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
            }
            console.log(`stdout: ${stdout}`);
            console.log(`Exit Code: ${exitCode}`);
            resolve(`${appSourcePath}/${appId}_${appVersion}.app`);
        })
    });
    return promise
}