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

// The paths ease toward the pointer in JS instead of a CSS transition,
// because Safari (every browser on iPhone) can't transition the "d" attribute.
const EASE_TIME_MS = 50; // smaller = snappier; ~150ms to settle, like the old transition
let targetX = 0, targetY = 0;   // where the pointer is
let currentX = 0, currentY = 0; // where the paths are drawn right now
let lastFrameTime = 0;
let animating = false;

function draw() {
  const x = currentX;
  const y = currentY;
  path1.setAttribute('d', `M4 11 C 5 45, ${190 + x/10} ${15 + y/10}, ${130 - x/15} 12 S ${165 + x/15} 4, ${194 + x/9} ${10 + y/5} S 52 25, ${292 + x /8} ${190 - y/5} S 5 -50, ${67 + x/5} ${145 + y/13}`);
  path2.setAttribute('d', `M30 0 C 0 ${720 - y+(x*3)/20}, ${140 + x/10} 25, 236 ${19 + y/15} S 100 100, ${570 + x/12} 80 S 346 136, ${-20 + x/1.5} ${-50+ y/1.5}`);
  path3.setAttribute('d', `M600 15 C 500 245, ${530 + x/5} ${250 + y/3}, 628 300 S ${500 - x/5} ${240 + y/3}, 567 145 S 500 500, 600 300`);
}

function step(time) {
  // Ease by elapsed time, so it feels the same at 60Hz and on 120Hz iPhones
  const elapsed = lastFrameTime ? time - lastFrameTime : 16;
  lastFrameTime = time;
  const amount = 1 - Math.exp(-elapsed / EASE_TIME_MS);

  currentX += (targetX - currentX) * amount;
  currentY += (targetY - currentY) * amount;

  if (Math.abs(targetX - currentX) < 0.5 && Math.abs(targetY - currentY) < 0.5) {
    currentX = targetX;
    currentY = targetY;
    animating = false;
    lastFrameTime = 0;
  } else {
    requestAnimationFrame(step);
  }
  draw();
}

function moveTo(clientX, clientY) {
  targetX = clientX * wheeled;
  targetY = clientY * wheeled;
  if (!animating) {
    animating = true;
    requestAnimationFrame(step);
  }
}

document.addEventListener('mousemove', (event) => {
  moveTo(event.clientX, event.clientY);
});

// phones never fire mousemove while a finger drags, so follow the touch instead
function followTouch(event) {
  moveTo(event.touches[0].clientX, event.touches[0].clientY);
}
document.addEventListener('touchstart', followTouch, { passive: true });
document.addEventListener('touchmove', followTouch, { passive: true });

document.addEventListener('wheel', (event) => {
  wheeled = event.deltaY > 0 ? 1 : 5;
  moveTo(event.clientX, event.clientY);
});
