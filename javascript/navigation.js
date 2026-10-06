fetch("nav.html")
  .then(res => {
    if (!res.ok) throw new Error("Could not load nav.html: " + res.status);
    return res.text();
  })
  .then(htmlString => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    const mainElement = doc.getElementById("main");
    if (mainElement) {
      mainElement.append(...document.body.children);
    }

    document.body.append(...doc.body.childNodes);
    document.dispatchEvent(new Event("nav-loaded"));
  }).then(resized => {
    
    const horizontal = document.getElementById("stretchable-links");
    const vertical = document.getElementById("work-nav");
    let offsetHorizontal = 1;
    let offsetVertical = 1;
    let waiting = false;
    
    document.addEventListener("mousemove", (event) => {
      offsetHorizontal = 0;
      offsetVertical = 0;
      // 1. Get the exact starting X position of the element's left edge
      const boxLeft = horizontal.getBoundingClientRect().left;
      const boxTop = vertical.getBoundingClientRect().top;
      
      // 2. Calculate the distance between the cursor and the left edge
      let newWidth = (event.clientX - boxLeft)/4 + 220 + offsetHorizontal;
      let newHeight = (event.clientY - boxTop)/3 + 105 + offsetVertical;
      
      // 3. Prevent the width from becoming negative if the cursor moves past the left edge
      newWidth = Math.max(0, newWidth);
      newHeight = Math.max(0, newHeight);
      
      // 4. Apply the calculated width
      horizontal.style.width = `${newWidth}px`;
      vertical.style.height = `${newHeight}px`;
      
    });
    document.addEventListener("wheel", (event) => {
      if (!waiting && event.target.closest(".top-links")) {
        const boxLeft2 = horizontal.getBoundingClientRect().left;
        // cursor is hovering above .top-links
        let diff = event.clientX - boxLeft2;
        oldw = horizontal.offsetWidth
        if (event.deltaY < 0) {
          if (diff > oldw*0.85){
            if(offsetHorizontal < 0){
              offsetHorizontal = 0;
            }
            else {
              offsetHorizontal = oldw/4;
            }
            waiting = true;
              setTimeout(function() {
                waiting = false;
              }, 100);
          }
        } else if (event.deltaY > 0) {
          if(offsetHorizontal > 0){
            offsetHorizontal = 0;
          }
          else if (diff < oldw*0.85 && diff > oldw*0.6){
            offsetHorizontal = -oldw + diff + 5;
          }
          waiting = true;
            setTimeout(function() {
              waiting = false;
            }, 100);
        }
      }
      else if (!waiting && event.target.closest(".work-links")) {
        const boxTop2 = vertical.getBoundingClientRect().top;
        // cursor is hovering above .top-links
        let diff = event.clientY - boxTop2;
        oldh = vertical.offsetHeight
        if (event.deltaY < 0) {
          if (diff > oldh*0.75){
            if(offsetVertical < 0){
              offsetVertical = 0;
            }
            else {
              offsetVertical = oldh*0.6 - (oldh - diff)*0.9;
            }
            waiting = true;
              setTimeout(function() {
                waiting = false;
              }, 100);
          }
        } else if (event.deltaY > 0) {
          if(offsetVertical > 0){
            offsetVertical = 0;
          }
          else if (diff < oldh*0.8){
            offsetVertical = -oldh + diff + 5;
          }
          waiting = true;
            setTimeout(function() {
              waiting = false;
            }, 100);
        }
      }

      // 1. Get the exact starting X position of the element's left edge
      const boxLeft = horizontal.getBoundingClientRect().left;
      const boxTop = vertical.getBoundingClientRect().top;
      
      // 2. Calculate the distance between the cursor and the left edge
      let newWidth = ((event.clientX - boxLeft)/4 + 220) + offsetHorizontal;
      let newHeight = ((event.clientY - boxTop)/3 + 105) + offsetVertical;
      
      // 3. Prevent the width from becoming negative if the cursor moves past the left edge
      newWidth = Math.max(0, newWidth);
      newHeight = Math.max(0, newHeight);
      
      // 4. Apply the calculated width
      horizontal.style.width = `${newWidth}px`;
      vertical.style.height = `${newHeight}px`;
      
    });
    })
  .catch(err => console.error(err));

  function redoNav(){
    
  }
  

