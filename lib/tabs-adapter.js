
var tracking = false;
var dirty = false;
var deletedGuids = [];

function hasChanges() {
  return dirty;
}

function clearHasChanges() {
  dirty = false;
}

function getDeletedGuids() {
  return deletedGuids;
}

function startTracking() {
  tracking = true;
}

function stopTracking() {
  tracking = false;
}

module.exports = {
  startTracking: startTracking,
  stopTracking: stopTracking,
  hasChanges: hasChanges,
  clearHasChanges: clearHasChanges,
  getDeletedGuids: getDeletedGuids
};
