export function create_control_panel() {
    const panel = document.createElement('section');
    panel.id = 'panel';
    document.querySelector('body').appendChild(panel);

    return panel;
}

export function create_btn(parent, text, callback) {
    const btn = document.createElement('button');
    btn.innerText = text;
    btn.addEventListener('click', callback);

    parent.appendChild(btn);
}

export function create_checkbox(parent, id, labelText, callback) {
    const div = document.createElement('div');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;

    const label= document.createElement('label');
    label.setAttribute('for', id);
    label.innerText = labelText;

    checkbox.addEventListener('change', callback);

    div.appendChild(checkbox);
    div.appendChild(label);
    parent.appendChild(div);

    return checkbox;
}

export function create_slider(parent, min, max, value) {
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min;
    slider.max = max;
    slider.value = value;

    parent.appendChild(slider);
}