import { state } from "../state.js";
export function initCarousel(onSelect){
  const container=document.getElementById("mini-nav-carousel"); if(!container) return { render:()=>{} };
  function render(){
    const hidden = state.navigation.currentTarget !== "none";
    container.style.display = hidden ? "none" : "flex";
    container.innerHTML = state.trip.map((day,index)=>`<button class="carousel-pill ${index===state.currentDayIdx?'active':''}" data-day-index="${index}">J${day.jour} · ${day.ville.split("->")[0].trim()}</button>`).join("");
    container.querySelectorAll("[data-day-index]").forEach(btn=>btn.addEventListener("click",()=>onSelect(Number(btn.dataset.dayIndex))));
  }
  render();
  return { render };
}
