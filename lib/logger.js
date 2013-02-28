function stringifyObject(obj, depth) {
  var keys = Object.keys(obj);
  if (keys.length === 0) return '{}';
  if (depth === 0) return obj.toString();
  if (typeof(depth) !== "undefined") depth = depth - 1;
  var kvs = [];
  keys.forEach(function (key) {
    kvs.push(key.toString() + ":" + stringifyElt(obj[key], depth));
  });
  return '{ ' + kvs.join(", ") + ' }';
}

function stringifyElt(elt, depth) {
  if (Object.prototype.toString.call(elt) === '[object Array]') return '['+elt.map(function(x) { return stringifyElt(x, depth); }).join(", ")+']';
  switch (typeof(elt)) {
    case 'undefined': return 'undefined';
    case 'object': return (elt === null) ? 'null' : stringifyObject(elt, depth);
    case 'string': return elt;
    case 'number': return elt.toString();
    default: return elt.toString();
  }
}

function log() {
  var args = Array.prototype.slice.apply(arguments);
  console.log(args.map(function(elt) {
    return stringifyElt(elt);
  }).join(", "));
}

function logWithDepth() {
  var args = Array.prototype.slice.call(arguments,0,arguments.length-1);
  var depth = arguments[arguments.length-1];
  console.log(args.map(function(elt) {
    return stringifyElt(elt, depth);
  }).join(", "));

}

exports.log = log;
exports.logWithDepth = logWithDepth;