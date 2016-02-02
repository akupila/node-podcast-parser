module.exports = function recursivelyRemoveKeys(target, recurse, keys) {
  target.forEach(item => {
    if (item[recurse]) {
      item[recurse] = recursivelyRemoveKeys(item[recurse], recurse, keys);
    }

    keys.forEach(key => {
      delete item[key];
    });
  });

  return target;
}
