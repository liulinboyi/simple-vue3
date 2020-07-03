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