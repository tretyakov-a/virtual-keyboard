function createElement(tag, classes) {
  const el = document.createElement(tag);
  if (classes) {
    el.classList.add(classes);
  }
  return el;
}

function areSetsEqual(a, b) {
  return a.size === b.size && [...a].every((value) => b.has(value));
}

function getKeyValues(code, keySets) {
  return Object.keys(keySets).reduce((acc, key) => {
    acc[key] = keySets[key][code];
    return acc;
  }, {});
}

export { createElement, areSetsEqual, getKeyValues };
