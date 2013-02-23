function log() {
  var args = Array.prototype.slice.apply(arguments);
  console.log(args.map(function(elt) {
    if (elt instanceof Error) return 'error: '+elt.message;
    switch (typeof(elt)) {
      case 'undefined': return 'undefined';
      case 'object': return (elt === null) ? 'null' : JSON.stringify(elt);
      case 'array': return JSON.stringify(elt);
      default: return elt.toString();
    }
  }).join(", "));
}

exports.log = log;