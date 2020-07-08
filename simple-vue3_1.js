const targetMap = new WeakMap()

const effectStack = [];

const baseHandler = {
  get(target, key) {
    let getRes = target[key];
    if (typeof getRes === 'object') {
      console.log(getRes)
      getRes = reactive(getRes)
      console.log(getRes)
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
    console.log("重复")
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
  const { deps } = effect
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect)
    }
    deps.length = 0
  }
}





let rgb = {
  r: 102,
  g: 191,
  b: 255
};
let test = {
  a: {
    b: {
      c: 1
    }
  }
}
let proxy_test = reactive(test);
let proxy_test1 = reactive(test);
console.log(proxy_test);
proxy_test.a.b.c = 4;
let proxy_rgb = reactive(rgb);

r.value = proxy_rgb.r;
g.value = proxy_rgb.g;
b.value = proxy_rgb.b;
color.style.backgroundColor = `rgb(${proxy_rgb.r},${proxy_rgb.g}, ${proxy_rgb.b})`;
r.addEventListener('input', (e) => {
  proxy_rgb.r = r.value
})
g.addEventListener('input', (e) => {
  proxy_rgb.g = g.value
})
b.addEventListener('input', (e) => {
  proxy_rgb.b = b.value
})

const stop = effect((a = 1) => {
  console.log(a)
  color.style.backgroundColor = `rgb(${proxy_rgb.r},${proxy_rgb.g}, ${proxy_rgb.b})`;
  showcolor.innerText = `rgb(${proxy_rgb.r},${proxy_rgb.g}, ${proxy_rgb.b})`;
})

btn.addEventListener('click', () => {
  stop()
})

console.log(stop, 'stop')

console.log(targetMap)

console.log(targetMap.get(rgb));
console.log(targetMap.get(test))
let proxy_rgb1 = reactive(rgb);