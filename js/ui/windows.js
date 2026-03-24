const DESKTOP_BREAKPOINT = 768;
function isDesktop(){return window.innerWidth >= DESKTOP_BREAKPOINT}
function clamp(value,min,max){return Math.min(Math.max(value,min),max)}
function bringToFront(el){const views=document.querySelectorAll(".app-view"); let maxZ=30; views.forEach(v=>{const z=parseInt(getComputedStyle(v).zIndex||"30",10); if(z>maxZ) maxZ=z;}); el.style.zIndex=String(maxZ+1);}
function setDesktopDefaultPosition(el,index=0){const presets=[{top:140,left:70,width:460,height:560},{top:150,left:110,width:430,height:560},{top:160,left:150,width:430,height:560}]; const p=presets[index]||presets[0]; el.style.top=`${p.top}px`; el.style.left=`${p.left}px`; el.style.width=`${p.width}px`; el.style.height=`${p.height}px`;}
function setMobileWindowStyle(el){el.style.top="8%"; el.style.left="5%"; el.style.width="90%"; el.style.height="62vh"; el.style.zIndex="30";}
function keepWindowInBounds(el){const rect=el.getBoundingClientRect(), margin=12; const maxLeft=window.innerWidth-rect.width-margin, maxTop=window.innerHeight-rect.height-margin; el.style.left=`${clamp(rect.left, margin, Math.max(margin,maxLeft))}px`; el.style.top=`${clamp(rect.top, margin, Math.max(margin,maxTop))}px`;}
function attachWindowInteractions(el){
  const header=el.querySelector(".window-header"), resizer=el.querySelector(".window-resizer"); if(!header||!resizer) return;
  let dragging=false,resizing=false,startX=0,startY=0,startLeft=0,startTop=0,startWidth=0,startHeight=0,aspectRatio=1;
  function onPointerMove(event){
    if(!isDesktop()) return;
    if(dragging){const dx=event.clientX-startX, dy=event.clientY-startY; el.style.left=`${startLeft+dx}px`; el.style.top=`${startTop+dy}px`; keepWindowInBounds(el);}
    if(resizing){const dx=event.clientX-startX; const nextWidth=Math.max(340,startWidth+dx); const nextHeight=Math.max(420,nextWidth/aspectRatio); el.style.width=`${nextWidth}px`; el.style.height=`${nextHeight}px`; keepWindowInBounds(el);}
  }
  function stop(){dragging=false; resizing=false; document.removeEventListener("pointermove",onPointerMove); document.removeEventListener("pointerup",stop);}
  header.addEventListener("pointerdown",(event)=>{if(!isDesktop()) return; event.preventDefault(); dragging=true; resizing=false; startX=event.clientX; startY=event.clientY; startLeft=el.offsetLeft; startTop=el.offsetTop; bringToFront(el); document.addEventListener("pointermove",onPointerMove); document.addEventListener("pointerup",stop);});
  resizer.addEventListener("pointerdown",(event)=>{if(!isDesktop()) return; event.preventDefault(); event.stopPropagation(); resizing=true; dragging=false; startX=event.clientX; startY=event.clientY; startWidth=el.offsetWidth; startHeight=el.offsetHeight; aspectRatio=startWidth/startHeight; bringToFront(el); document.addEventListener("pointermove",onPointerMove); document.addEventListener("pointerup",stop);});
  el.addEventListener("pointerdown",()=>{if(isDesktop()) bringToFront(el)});
}
export function initWindows(){Array.from(document.querySelectorAll(".app-view")).forEach((view,index)=>{isDesktop()?setDesktopDefaultPosition(view,index):setMobileWindowStyle(view); attachWindowInteractions(view);});}
export function refreshWindowsLayout(){Array.from(document.querySelectorAll(".app-view")).forEach((view,index)=>{if(isDesktop()){if(!view.style.width||view.style.width.includes("%")) setDesktopDefaultPosition(view,index); keepWindowInBounds(view);} else setMobileWindowStyle(view);});}
