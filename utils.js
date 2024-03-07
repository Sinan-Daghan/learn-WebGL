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

export function create_slider(parent, min, max, value, name, callback, step=1) {
    const div = document.createElement('div');

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min;
    slider.max = max;
    slider.value = value;
    slider.id = name;
    slider.step = step;
    slider.addEventListener('input', (e) => {
        callback(e.target.value);
    });

    const label = document.createElement('label');
    label.setAttribute('for', name);
    label.innerText = name;

    div.appendChild(label);
    div.appendChild(slider);

    parent.appendChild(div);
}