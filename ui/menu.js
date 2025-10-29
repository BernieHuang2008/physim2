import { $, $$ } from "../utils.js";

const menu_dom = document.getElementById("top-bar");
const menu_lv2_dom = document.createElement("div");

function mkMenu(lst) {
    $("#floating-section").appendChild(menu_lv2_dom);
    menu_lv2_dom.className = "menu-lv2-container no-select hidden";
    document.addEventListener("click", (event) => {
        const isClickInside = menu_lv2_dom.contains(event.target) || menu_dom.contains(event.target);
        if (!isClickInside) {
            menu_lv2_dom.classList.add("hidden");
        }
    });

    for (let item of lst) {
        let menu_lv1 = document.createElement("div");
        menu_lv1.className = "menu-lv1";
        menu_lv1.textContent = item.title;
        menu_lv1.onclick = function () {
            menu_lv2_dom.classList.remove("hidden");
            showMenuLv2(item.items, menu_lv1);
        }
        menu_dom.appendChild(menu_lv1);
    }
}

function showMenuLv2(lst, menu_lv1_dom) {
    menu_lv2_dom.innerHTML = "";

    menu_lv2_dom.style.left = menu_lv1_dom.getBoundingClientRect().left + "px";
    menu_lv2_dom.style.top = menu_lv1_dom.getBoundingClientRect().bottom + "px";

    for (let item of lst) {
        switch (item.type) {
            case "hr":
                let hr = document.createElement("hr");
                menu_lv2_dom.appendChild(hr);
                break;
            case "submenu":
                let menu_lv2_item = document.createElement("div");
                menu_lv2_item.className = "menu-lv2-item";
                menu_lv2_item.textContent = item.title;
                menu_lv2_dom.appendChild(menu_lv2_item);

                menu_lv2_item.onclick = item.action;
                break;
        }
    }
}

export { mkMenu };