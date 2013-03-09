const {Cc, Ci, Cu} = require("chrome");
const L = require('logger');
Cu.import("resource://gre/modules/PlacesUtils.jsm", this);

const DESCRIPTION_ANNO     = "bookmarkProperties/description";
const SIDEBAR_ANNO         = "bookmarkProperties/loadInSidebar";
const QUERY_ANNO           = "Places/SmartBookmark";

function getAnnoForItem(annoName) {
  var anno = (this.annos || []).filter(function (anno) { return anno.name === annoName; })[0];
  if (anno) return anno.content;
  else return null;
}

function BookmarksItem(itemInfo) {
  let bookmarksItem = Object.create(BookmarksItem.prototype);
  Object.keys(itemInfo).forEach(function (key) {
    bookmarksItem[key] = itemInfo[key];
  });
  bookmarksItem.getAnnoForItem = getAnnoForItem.bind(bookmarksItem);
  return bookmarksItem;
}

BookmarksItem.prototype.toJSON = function toJSON() {
  var result = {
    id: this.id,
    parent: this.parent,
    type: this.type,
    dateAdded: this.dateAdded,
    lastModified: this.lastModified,
    position: this.position
  },
  description = this.getDescription(),
  loadInSidebar = this.getLoadInSidebar();

  if (this.title !== null) result.title = this.title;
  if (this.url !== null) result.url = this.url;
  if (this.keyword !== null) result.keyword = this.keyword;
  if (description !== null) result.description = description;
  if (loadInSidebar) result.loadInSidebar = true;
  if (this.isLivemark()) {
    result.feedUri = this.getFeedUri();
    result.siteUri = this.getSiteUri();
  }
  if (this.isQuery()) {
    result.queryId = this.getQueryId();
  }
  result.prettyType = this.getPrettyType();
  return result;
}

BookmarksItem.prototype.isLivemark = function() {
  return this.getFeedUri() != null;
}

BookmarksItem.prototype.isFolder = function() {
  return this.type === PlacesUtils.bookmarks.TYPE_FOLDER && !this.isLivemark();
}

BookmarksItem.prototype.isBookmark = function() {
  return this.type === PlacesUtils.bookmarks.TYPE_BOOKMARK && !this.isQuery();
}

BookmarksItem.prototype.isQuery = function() {
  return this.type === PlacesUtils.bookmarks.TYPE_BOOKMARK && (this.url && this.url.indexOf("place:") == 0);
}

BookmarksItem.prototype.isSeparator = function() {
  return this.type === PlacesUtils.bookmarks.TYPE_SEPARATOR;
}

BookmarksItem.prototype.getDescription = function() {
  return this.description || this.getAnnoForItem(DESCRIPTION_ANNO);
}

BookmarksItem.prototype.getLoadInSidebar = function() {
  return this.loadInSidebar || this.getAnnoForItem(SIDEBAR_ANNO) !== null;
}

BookmarksItem.prototype.getFeedUri = function() {
  return this.feedUri || this.getAnnoForItem(PlacesUtils.LMANNO_FEEDURI);
}

BookmarksItem.prototype.getSiteUri = function() {
  return this.siteUri || this.getAnnoForItem(PlacesUtils.LMANNO_SITEURI);
}

BookmarksItem.prototype.getQueryId = function() {
  return this.queryId || this.getAnnoForItem(QUERY_ANNO);
}

BookmarksItem.prototype.getPrettyType = function() {
  if (this.isBookmark()) {
    return 'bookmark';
  }
  else if (this.isQuery()) {
    return 'query';
  }
  else if (this.isFolder()) {
    return 'folder';
  }
  else if (this.isLivemark()) {
    return 'livemark';
  }
  else if (this.isSeparator()) {
    return 'separator';
  }
  else {
    return 'unknown';
  }
}

module.exports = {
  BookmarksItem: BookmarksItem,
  DESCRIPTION_ANNO: DESCRIPTION_ANNO,
  SIDEBAR_ANNO: SIDEBAR_ANNO,
  QUERY_ANNO: QUERY_ANNO
};