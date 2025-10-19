function H1({text}) {
    const h1 = document.createElement('h1');
    h1.classList.add('ui-label-h1');
    h1.textContent = text;
    return h1;
}

function H2({text}) {
    const h2 = document.createElement('h3');
    h2.classList.add('ui-label-h3');
    h2.textContent = text;
    return h2;
}

export { H1, H2 };