const StorageServerClient = require('storage-server-client');
const PasswordsAdapter = require('passwords-adapter');
const L = require('logger');

function SyncMediator(user) {
  if (user) {
    this.user = user;
    this.ssClient = new StorageServerClient(user.id, user.token);
  }
}

SyncMediator.prototype.pull = function() {

};

SyncMediator.prototype.push = function() {
  var localPasswords = PasswordsAdapter.exportLocalPasswords();
  if (localPasswords.length > 0) {
    L.log("Pushing local passwords", localPasswords);
  }
  else {
    L.log("Local passwords empty");
  }
};

module.exports = SyncMediator;