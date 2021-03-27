let menuBtn = document.getElementById('menuBtn');
let menuModel = document.getElementById('menuModal');
menuModel.addEventListener('click',(e) => {
    if(e.target.id === "menuModal") closeMenu();
})
let menu = document.getElementById('menu');
let menu_sections = document.getElementsByClassName('menu-content');
menu_sections[0].classList.add('current-section');

let current = menu_sections[0];

menu.style.left = "-300px"
menuModel.style.display = 'none';


function menuFunction() {
    if(menuModel.style.display === 'none') {
        openMenu()
    } else {
        closeMenu();
    }
}
function openMenu() {

    menuModel.style.display = 'flex';
    menu.style.left = '0px';
}
function closeMenu() {
    
    menu.style.left = "-300px"
    setTimeout(() => {
        menuModel.style.display = 'none'
    }, 100)
}

function smoothScrollTo(section){
    var sec = document.getElementById(section);
    var cur = document.getElementById('a'+section);
    current.classList.remove('current-section')
    current = cur;
    current.classList.add('current-section')
    sec.scrollIntoView({
        block: 'start',
        behavior: 'smooth'
    })
    closeMenu();
}
