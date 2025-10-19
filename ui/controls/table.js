function VarList({field, vars, disabled=false}) {
    const container = document.createElement("div");
    container.classList.add("var-list");

    const list = document.createElement("ul");
    vars.forEach((v) => {
        const item = document.createElement("li");
        item.textContent = v.nickname;
        list.appendChild(item);
    });
    container.appendChild(list);

    return container;
}

export { VarList };