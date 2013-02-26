const StorageServerClient = require('storage-server-client');
const PasswordsAdapter = require('passwords-adapter');
const L = require('logger');

const PASSWORDS_COLLECTION_NAME = "passwords";

function SyncMediator(user) {
  if (user) {
    this.user = user;
    this.ssClient = new StorageServerClient({ userId: user.id, token: user.token });
  }
}

SyncMediator.prototype.pull = function() {
  L.log("Pulling passwords from server");
  this.ssClient.readCollection({ collection: PASSWORDS_COLLECTION_NAME }).
  then(function (result) {
    L.log("Pull success", result);
    PasswordsAdapter.updateLocalPasswords(result.items);
  }).
  then(null, function (err) {
    L.log("Pull error", err.message);
  });
};

SyncMediator.prototype.push = function() {
  var localPasswords = PasswordsAdapter.readLocalPasswords();
  if (localPasswords.length > 0) {
    L.log("Pushing local passwords", localPasswords);
    this.ssClient.updateCollection({ collection: PASSWORDS_COLLECTION_NAME, items: localPasswords }).
    then(function (result) {
      L.log("Push success", result);
    }).
    then(null, function(err) {
      L.log("Push error", err.message);
    });
  }
  else {
    L.log("Local passwords empty");
  }
};

module.exports = SyncMediator;