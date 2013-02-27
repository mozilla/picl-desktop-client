function stringifyObject(obj) {
  var keys = Object.keys(obj);
  if (keys.length === 0) return '{}';
  var kvs = [];
  keys.forEach(function (key) {
    kvs.push(key.toString() + ":" + stringifyElt(obj[key]));
  });
  return '{ ' + kvs.join(", ") + ' }';
}

function stringifyElt(elt) {
  if (elt instanceof Error) return 'exception: '+elt.message;
  if (Object.prototype.toString.call(elt) === '[object Array]') return '['+elt.map(function(x) { return stringifyElt(x); }).join(", ")+']';
  switch (typeof(elt)) {
    case 'undefined': return 'undefined';
    case 'object': return (elt === null) ? 'null' : stringifyObject(elt);
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

exports.log = log;