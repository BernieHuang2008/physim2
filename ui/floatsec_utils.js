const floating_section = document.getElementById("floating-section");

function floatsec_utils_hide_all() {
    floating_section.classList.remove("expand");
    for (let sec of floating_section.children) {
        sec.classList.add("hide");
    }
}

function floating_section_init() {
    floating_section.addEventListener("click", (e) => {
        if (e.target === floating_section) {
            floatsec_utils_hide_all();
        }
    });
}

function floating_section_expand() {
    floating_section.classList.add("expand");
}

export { floatsec_utils_hide_all, floating_section_init, floating_section_expand };
