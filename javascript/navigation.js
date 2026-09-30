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
    
    const box = document.getElementById("stretchable-links");
    
    document.addEventListener("mousemove", (event) => {
      // 1. Get the exact starting X position of the element's left edge
      const boxLeft = box.getBoundingClientRect().left;
      
      // 2. Calculate the distance between the cursor and the left edge
      let newWidth = (event.clientX - boxLeft)/5 + 220;
      
      // 3. Prevent the width from becoming negative if the cursor moves past the left edge
      newWidth = Math.max(0, newWidth);
      
      // 4. Apply the calculated width
      box.style.width = `${newWidth}px`;
    });
    })
  .catch(err => console.error(err));
  

