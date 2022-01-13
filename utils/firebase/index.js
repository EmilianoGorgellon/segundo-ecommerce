let admin = require("firebase-admin");
let serviceAccount = require("./config/coderhouse-8fdd5-firebase-adminsdk-pgb43-add52157bc.json");

const {config} = require("../../config");

if (config.db_name === "firebase") {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  const db = admin.firestore();
  
  module.exports = {db};
} 
