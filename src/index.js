const exp = require('express');
const fileUpload = require('express-fileupload');
const crypto = require('crypto');
const { login } = require("./services/iem");
const { uploadApplicationIemCatlog, generateAppfile } = require("./services/iemUpload");
const { generateComposeFile, generateProdComposeFile, generatePortNumber, generateFlowFile, cleanFlowJson } = require("./services/util");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Creating instance of express
const app = exp();
app.use(exp.json());

var distDir = __dirname + "/angular/dist/iem-ui/";
app.use(exp.static(distDir));

// enable files upload
app.use(fileUpload({
  createParentPath: true
}));

app.post('/api/deploy/cloud', async (req, res) => {
  // keys value pair of req.body is assigned to object {}
  try {
    const { iemUrl, username, password, flowData } = req.body;
    // makes Login request to IEM
    const loginAccess = await login(iemUrl, username, password);
    // fetches the access_token after sucessfull login to IEM
    const authorization = loginAccess['access_token'];
    //dynamically generates application id for IECTL command arguments
    const appId = (crypto.randomUUID() + '').replaceAll('-', '');
    // dynamically generates portnumber for new node-red instance
    const port = await generatePortNumber();
    const appName = `Nodered_${port}`;
    // generates flowfile with the json data from "Flow-creator" application
    await generateFlowFile(cleanFlowJson(flowData),appId);
    await generateComposeFile(appName, port, appId)
    const composePath = await generateProdComposeFile(appName, port, appId)

    const appFilePath = await generateAppfile({ ...req.body, composePath, appName, appId });
    console.log('APPFILE', appFilePath);
    const data = await uploadApplicationIemCatlog(iemUrl, authorization, appFilePath)
    res.send(data);
  } catch (err) {
    res.status(500).send(err);
  }
})

app.post('/api/test', async (req, res) => {

  try {
    //console.log("Login-Data",req.body);
    res.send({
      body: req.body,
      headers: req.headers
    });
  }
  catch (err) {
    res.status(500).send(err);
  }

})

app.get('/', async (req, res) => {

  res.send({
    version: 1.1,
    name: 'Flow-Voyager'
  });
})

// Listening to server at port 3000
app.listen(3000, function () {
  console.log("server is running on port 3000");
})
