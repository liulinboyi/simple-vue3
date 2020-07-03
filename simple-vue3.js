let targetMap = new WeakMap();

let effectStack = [];

const BaseHandler = {
  get(target, key) {
    console.log(target, key);

    if (effectStack[effectStack.length - 1]) {
      let depMap = targetMap.get(target);
      if (depMap === void 0) {
        depMap = new Map();
        targetMap.set(target, depMap);
      }
      let dep = depMap.get(key);
      if (dep === void 0) {
        dep = new Set();
        depMap.set(key, dep);
      }
      if (!dep.has(effectStack[effectStack.length - 1])) {
        dep.add(effectStack[effectStack.length - 1]);
      }
    }


    return target[key];
  },
  set(target, key, value) {
    console.log(target, key, value);
    target[key] = value;
    trigger(target, key);
    return true;
  }
}

function reactive(target) {
  const observed = new Proxy(target, BaseHandler);
  return observed;
}

function effect(fn) {
  if (effectStack.indexOf(fn) === -1) {
    try {
      effectStack.push(fn);
      fn();
    } catch (error) {
      throw Error(error);
    } finally {
      effectStack.pop();
    }
  }
}

function trigger(target, key) {
  if (targetMap.get(target)) {
    const depMap = targetMap.get(target);
    const deps = depMap.get(key);
    for (let dep of deps) {
      dep();
    }
  }
}