const { getDataConnect, queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'coshii-data-connect',
  location: 'us-west1'
};
exports.connectorConfig = connectorConfig;

function getCurrentUserRef(dc) {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  if('_useGeneratedSdk' in dcInstance) {
    dcInstance._useGeneratedSdk();
  } else {
    console.error('Please update to the latest version of the Data Connect SDK by running `npm install firebase@dataconnect-preview`.');
  }
  return queryRef(dcInstance, 'GetCurrentUser');
}
exports.getCurrentUserRef = getCurrentUserRef;
exports.getCurrentUser = function getCurrentUser(dc) {
  return executeQuery(getCurrentUserRef(dc));
};

function upsertUserPhoneNumberRef(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  if('_useGeneratedSdk' in dcInstance) {
    dcInstance._useGeneratedSdk();
  } else {
    console.error('Please update to the latest version of the Data Connect SDK by running `npm install firebase@dataconnect-preview`.');
  }
  return mutationRef(dcInstance, 'UpsertUserPhoneNumber', inputVars);
}
exports.upsertUserPhoneNumberRef = upsertUserPhoneNumberRef;
exports.upsertUserPhoneNumber = function upsertUserPhoneNumber(dcOrVars, vars) {
  return executeMutation(upsertUserPhoneNumberRef(dcOrVars, vars));
};

function upsertUserEmailRef(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  if('_useGeneratedSdk' in dcInstance) {
    dcInstance._useGeneratedSdk();
  } else {
    console.error('Please update to the latest version of the Data Connect SDK by running `npm install firebase@dataconnect-preview`.');
  }
  return mutationRef(dcInstance, 'UpsertUserEmail', inputVars);
}
exports.upsertUserEmailRef = upsertUserEmailRef;
exports.upsertUserEmail = function upsertUserEmail(dcOrVars, vars) {
  return executeMutation(upsertUserEmailRef(dcOrVars, vars));
};

