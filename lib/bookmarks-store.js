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

function getTagsForItem(itemId) {

}

module.exports = {
  setItemForId: setItemForId,
  getItemForId: getItemForId,
  deleteItemForId: deleteItemForId,
  getChildrenForParentid: getChildrenForParentid,
  clear: clear
};


