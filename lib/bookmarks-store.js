const BookmarksGuidService = require('bookmarks-guid-service');

var store = {};

function clear() {
  store = {};
}

function setItemForId(id, item) {
  store[id] = item;
}

function getItemForId(id) {
  return store[id];
}

function deleteItemForId(id) {
  delete store[id];
}

// returns array of BookmarksItems children sorted by position in parent
function getChildrenForParentid(parentid) {
  let keys = Object.keys(store);
  let children = [];
  keys.forEach(function (key) {
    if (store[key].parentid === parentid) children.push(store[key]);
  });
  return children.sort(function (c1,c2) { return c1.pos - c2.pos; });
}

function getTagsForUri(uri) {
  var tagFolderItems = getChildrenForParentid(BookmarksGuidService.specialGUIDs.tags);
  var tags = [];
  tagFolderItems.forEach(function (tagFolder) {
    let children = getChildrenForParentid(tagFolder.id).map(function (child) { return getItemForId(child.id); });
    children = children.filter(function (child) { return child.bmkUri === uri; });
    if (children.length > 0) tags.push(tagFolder.title);
  });
  return tags;
}

module.exports = {
  setItemForId: setItemForId,
  getItemForId: getItemForId,
  deleteItemForId: deleteItemForId,
  getChildrenForParentid: getChildrenForParentid,
  getTagsForUri: getTagsForUri,
  clear: clear
};


