const interactive = document.getElementsByClassName("interactive");
let mx = 0, my = 0, queued = false;
let showDescription;
let showDesriptionText;

function highlight(position){
  console.log(interactive[position]);
  interactive[position].style.filter = "grayscale(0%)";
  interactive[position].style.opacity = 1;
  showDescription = setTimeout(function(){
    interactive[position].classList.add("selected");
    showDesriptionText = setTimeout(function() {
      interactive[position].querySelectorAll(".description").forEach(element => {
        element.style.opacity = 1;
        switch(position){
          case 0:
            element.classList.add("desc1");
            break;
          case 1: 
            element.classList.add("desc2");
            break;
            case 2: 
            element.classList.add("desc3");
            break;
          case 3: 
            element.classList.add("desc4");
            break;
          case 4: 
            element.classList.add("desc5");
            break;
          default: break;
        }  
      });
    }, 500)
  }, 350);
  
}

function unhighlight(position) {
  clearTimeout(showDescription); 
  clearTimeout(showDesriptionText);
  interactive[position].style.filter = "grayscale(100%)";
  interactive[position].style.opacity = 0.8;
  interactive[position].querySelectorAll(".description").forEach(element => {
    element.style.opacity = 0;
    element.classList.remove("desc1");
    element.classList.remove("desc2");
    element.classList.remove("desc3");
    element.classList.remove("desc4");
    element.classList.remove("desc5");
  });
  interactive[position].classList.remove("selected");
}

// CLAUDE:
const bg = document.getElementById("bgimage");
const areas = document.querySelectorAll('map[name="interactive"] area');

function resizeMap() {
  const scale = Math.min(bg.clientWidth / bg.naturalWidth, bg.clientHeight / bg.naturalHeight);
  const offX = (bg.clientWidth - bg.naturalWidth * scale) / 2;
  const offY = (bg.clientHeight - bg.naturalHeight * scale) / 2;

  areas.forEach(area => {
    const pts = area.dataset.coords.split(",").map(Number);
    area.coords = pts.map((v, i) => Math.round(v * scale + (i % 2 ? offY : offX))).join(",");
  });
}

if (bg.complete) resizeMap();
else bg.addEventListener("load", resizeMap);
window.addEventListener("resize", resizeMap);

