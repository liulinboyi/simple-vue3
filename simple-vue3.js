const targetMap = new WeakMap()

const effectStack = [];

const baseHandler = {
  get(target, key) {
    let getRes = target[key];
    if (typeof getRes === 'object') {
      // console.log(getRes)
      getRes = reactive(getRes)
      // console.log(getRes)
    }
    if (effectStack[effectStack.length - 1]) {
      let depMap = targetMap.get(target);
      if (depMap === void 0) {
        depMap = new Map();
        targetMap.set(target, depMap)
      }
      let deps = depMap.get(key);
      if (deps === void 0) {
        deps = new Set();
        depMap.set(key, deps);
      }
      if (!deps.has(effectStack[effectStack.length - 1])) {
        deps.add(effectStack[effectStack.length - 1]);
        effectStack[effectStack.length - 1].deps.push(deps);
      }
    }

    return getRes;
  },
  set(target, key, value) {
    target[key] = value;
    const depMap = targetMap.get(target);
    if (depMap) {
      const deps = depMap.get(key);
      if (deps.size > 0) {
        trigger(target, key)
      }
    }
    return true;
  }
}

function reactive(target) {
  if (targetMap.has(target)) {
    // console.log("重复")
    return targetMap.get(target);
  }
  return new Proxy(target, baseHandler)
}

function createReactiveEffect(fn) {
  const effect = function reactiveEffect(...args) {
    try {
      effectStack.push(effect)
      return fn(...args)
    } finally {
      effectStack.pop()
    }
  }
  effect.deps = [];
  return effect
}

function effect(fn) {
  const effect = createReactiveEffect(fn)
  effect()
  return () => {
    cleanup(effect)
  }
}

function trigger(target, key) {
  for (let eff of targetMap.get(target).get(key)) {
    eff()
  }
}

function cleanup(effect) {
  const {
    deps
  } = effect
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect)
    }
    deps.length = 0
  }
}