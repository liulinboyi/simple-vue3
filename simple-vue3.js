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
  effectStack.push(fn);
  fn();
  effectStack.pop();
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




// let a = reactive({
//   count: 0
// });
// console.log(a, [div], targetMap);
// div.innerText = a.count;
// div.addEventListener('click', () => {
//   a.count++;
//   console.log(11, a.count);
// })

// effect(() => div.innerText = a.count);

let rgb = {
  r: 102,
  g: 191,
  b: 255
};
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

effect(() => {
  color.style.backgroundColor = `rgb(${proxy_rgb.r},${proxy_rgb.g}, ${proxy_rgb.b})`;
  showcolor.innerText = `rgb(${proxy_rgb.r},${proxy_rgb.g}, ${proxy_rgb.b})`;
})