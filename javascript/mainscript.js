const path1 = document.getElementById('path1');
const path2 = document.getElementById('path2');
const path3 = document.getElementById('path3');
let wheeled = 1;

/*
//document.addEventListener("nav-loaded", () => function(){
  console.log()
  document.addEventListener('mousemove', (event) => {
    const x = event.clientX* wheeled;
    const y = event.clientY* wheeled;
    path1.setAttribute('d', `M4 11 C 5 45, ${190 + x/10} ${15 + y/10}, 108 12 S ${165 + x/15} 4, ${194 + x/9} ${10 + y/5} S 52 25, ${292 + x /8} ${190 - y/5} S 5 -50, ${67 + x/5} ${145 + y/13}`);
    path2.setAttribute('d', `M30 0 C 0 ${720 - y+(x*3)/20}, ${140 + x/10} 25, 236 ${19 + y/15} S 100 100, ${570 + x/12} 80 S 346 136, ${0 + x/2} ${0+ y/2}`);
    path3.setAttribute('d', `M600 15 C 500 245, ${530 + x/5} ${250 + y/3}, 628 300 S ${500 - x/5} ${240 + y/3}, 567 145 S 500 500, 600 300`);
  });
  document.addEventListener('wheel', (event)=> {
    if(event.deltaY > 0) wheeled = 1;
    else wheeled = 5;
    const x = event.clientX* wheeled;
    const y = event.clientY* wheeled;
    path1.setAttribute('d', `M4 11 C 5 45, ${190 + x/10} ${15 + y/10}, 108 12 S ${165 + x/15} 4, ${194 + x/9} ${10 + y/5} S 52 25, ${292 + x /8} ${190 - y/5} S 5 -50, ${67 + x/5} ${145 + y/13}`);
    path2.setAttribute('d', `M30 0 C 0 ${720 - y+(x*3)/20}, ${140 + x/10} 25, 236 ${19 + y/15} S 100 100, ${570 + x/12} 80 S 346 136, ${0 + x/2} ${0+ y/2}`);
    path3.setAttribute('d', `M600 15 C 500 245, ${530 + x/5} ${250 + y/3}, 628 300 S ${500 - x/5} ${240 + y/3}, 567 145 S 500 500, 600 300`);

  })
//});
*/

let mx = 0, my = 0, queued = false;

function draw() {
  queued = false;
  const x = mx * wheeled;
  const y = my * wheeled;
  path1.setAttribute('d', `M4 11 C 5 45, ${190 + x/10} ${15 + y/10}, ${130 - x/15} 12 S ${165 + x/15} 4, ${194 + x/9} ${10 + y/5} S 52 25, ${292 + x /8} ${190 - y/5} S 5 -50, ${67 + x/5} ${145 + y/13}`);
  path2.setAttribute('d', `M30 0 C 0 ${720 - y+(x*3)/20}, ${140 + x/10} 25, 236 ${19 + y/15} S 100 100, ${570 + x/12} 80 S 346 136, ${0 + x/2} ${0+ y/2}`);
  path3.setAttribute('d', `M600 15 C 500 245, ${530 + x/5} ${250 + y/3}, 628 300 S ${500 - x/5} ${240 + y/3}, 567 145 S 500 500, 600 300`);
}

function requestDraw() {
  if (!queued) {
    queued = true;
    requestAnimationFrame(draw);
  }
}

document.addEventListener('mousemove', (event) => {
  mx = event.clientX;
  my = event.clientY;
  requestDraw();
});

document.addEventListener('wheel', (event) => {
  wheeled = event.deltaY > 0 ? 1 : 5;
  mx = event.clientX;
  my = event.clientY;
  requestDraw();
});
