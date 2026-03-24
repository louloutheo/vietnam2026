import { state } from "../state.js";
import { saveTheme } from "../storage.js";
export function initThemeToggle(){document.getElementById("btn-theme")?.addEventListener("click",()=>{document.body.classList.toggle("dark-theme"); state.theme=document.body.classList.contains("dark-theme")?"dark":"light"; saveTheme();});}
