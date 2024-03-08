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

export function add_mouse_events(canvas, angles) {

    let drag=false;

    let x_prev, y_prev;

    const mouseDownHandler = (e) => {
        drag = true;

        x_prev = e.pageX;
        y_prev = e.pageY

        e.preventDefault();
        return false;
    }

    const mouseUpHandler = () => {
        drag = false;
    };

    const mouseMoveHandler = (e) => {
        if (! drag ) return false;

        let dX = e.pageX - x_prev;
        let dY = e.pageY - y_prev;

        angles.THETA += dX * 2 * Math.PI  / canvas.width;
        angles.PHI += dY * 2 * Math.PI  / canvas.height;
        x_prev = e.pageX;
        y_prev = e.pageY;
    }


    canvas.addEventListener('mousedown', mouseDownHandler, false);
    canvas.addEventListener('mouseup', mouseUpHandler, false);
    canvas.addEventListener('mouseout', mouseUpHandler, false);
    canvas.addEventListener('mousemove', mouseMoveHandler, false);

}