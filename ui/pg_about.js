import { floating_section_expand, floatsec_utils_hide_all } from "./floatsec_utils.js";

const pg_about_dom = document.getElementById("about-page");

function init_pg_about() {
    pg_about_dom.innerHTML = `
        <div class="pg-about-leftbar">
            <li><div id="pg-about-close-btn" class="pg-about-close-btn">
                <svg t="1666413935981" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="12872" width="200" height="200" style="width: 27.24px; height: 27.24px;"><path d="M512 945.225143c-238.226286 0-433.225143-194.925714-433.225143-433.225143S273.773714 78.774857 512 78.774857c238.299429 0 433.225143 194.925714 433.225143 433.225143S750.299429 945.225143 512 945.225143M512 0C228.425143 0 0 228.425143 0 512s228.425143 512 512 512 512-228.425143 512-512-228.425143-512-512-512" fill="#ffffff" p-id="12873"></path><path d="M752.274286 476.525714H364.251429l128-128a38.034286 38.034286 0 0 0 0-55.149714 38.034286 38.034286 0 0 0-55.149715 0l-185.051428 183.149714a54.930286 54.930286 0 0 0-15.798857 39.424c0 15.725714 5.851429 29.549714 15.725714 39.350857l185.051428 185.124572a38.912 38.912 0 0 0 27.648 11.849143 34.377143 34.377143 0 0 0 27.574858-13.824 38.034286 38.034286 0 0 0 0-55.149715l-128-128h385.974857c21.650286 0 41.325714-17.700571 41.325714-39.350857a39.497143 39.497143 0 0 0-39.350857-39.424" fill="#ffffff" p-id="12874"></path></svg>
            </div></li>
        </div>
        <div class="pg-about-content">
            <h1 style="">PhySim 2</h1>
            <p>Version: 2025-12-27.1<br>(Beta 2.0.3)</p>
            
            <h5>© 2025 BernieHuang</h5>
            
            
            <h2>Latest Updates</h2>
            <ul>
                <li>FFD logic</li>
            </ul>
            <hr>

            <h2>More Info</h2>
            <p>Visit <a href="https://github.com/berniehuang2008/physim2" target="_blank">GitHub Repository</a> for more information about PhySim2.</p>
            <p>Visit <a href="https://github.com/BernieHuang2008/physim2/wiki" target="_blank">GitHub Wiki</a> for detailed documentation & Design Concepts.</p>

            <br><br><br><br><br>    
        </div>
    `;

    const leftbar_dom = pg_about_dom.querySelector(".pg-about-leftbar");
    const content_dom = pg_about_dom.querySelector(".pg-about-content");

    leftbar_dom.style.width = `${0.11667 * window.outerWidth}px`;
	leftbar_dom.style.paddingTop = `${0.0525 * window.outerHeight}px`;
	content_dom.style.paddingTop = `${0.0525 * window.outerHeight}px`;
	content_dom.style.paddingLeft = content_dom.style.paddingRight = `${0.0367 * window.outerWidth}px`;
	content_dom.style.width = `calc(100vw - ${0.11667 * window.outerWidth}px - ${2 * 0.0367 * window.outerWidth}px)`;


    const pg_about_close_btn = pg_about_dom.querySelector("#pg-about-close-btn");
    pg_about_close_btn.onclick = function () {
        floatsec_utils_hide_all();
    };
}

function pg_about_show() {
    pg_about_dom.classList.remove("hide");
    floating_section_expand();
}

export { pg_about_show, init_pg_about };