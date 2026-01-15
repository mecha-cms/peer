(() => {

const hub = 'http://127.0.0.1/test/hub';
const path = '/peer/web';

let pathCurrent = window.location.pathname.slice(path.length);

const form = {};
const formAlert = document.createElement('p');
const view = document.querySelector('[role=application]');

formAlert.setAttribute('role', 'alert');

form.blob = document.createElement('form');
form.file = document.createElement('form');
form.folder = document.createElement('form');
form.user = document.createElement('form');

form.blob.method = 'POST';
form.file.method = 'POST';
form.folder.method = 'POST';
form.user.method = 'POST';

form.user.addEventListener('submit', function (e) {
    let key = this.elements.key.value,
        pass = this.elements.pass.value,
        peer = this.elements.peer.value;
    // Force `@` prefix
    if ('@' !== key[0]) {
        key = '@' + key;
    }
    fetch(hub + '/user', {
        body: JSON.stringify({ key, pass, peer }),
        headers: { 'content-type': 'application/json' },
        method: 'POST'
    }).then(r => r.json()).then(r => {
        if (200 !== r.status) {
            if (401 === r.status) {
                formAlert.innerHTML = 'Invalid user or pass.';
            } else {
                formAlert.innerHTML = 'Unknown error.';
            }
            this.elements.pass.value = "";
            this.elements.pass.focus();
            this.prepend(formAlert);
            return;
        }
        // For a more secure application, you may need to store the token data some-where else with encryption and/or
        // similar method(s). This practice is only for demonstration and educational purpose(s).
        localStorage.setItem('jwt', r.token);
        localStorage.setItem('user', r.user);
        displayEntries('/asset');
    }).catch(e => {
        formAlert.innerHTML = e;
        this.prepend(formAlert);
    });
    e.preventDefault();
});

function displayEntries(route, part = 1) {
    const description = document.createElement('p');
    const list = document.createElement('ul');
    description.innerHTML = 'Loading…';
    description.setAttribute('role', 'status');
    view.replaceChildren(description);
    request(hub + '/data' + route + '?chunk=20&part=' + part).then(r => r.json()).then(r => {
        console.log(r);
        document.title = 'Entries';
        window.history.pushState({}, "", path + route + '?part=' + part);
        if (0 === r.data.total) {
            description.innerHTML = 'No entries yet.';
        } else {
            view.replaceChildren(list);
            // Custom sort, to prioritize folder
            r.data.lot.sort((a, b) => {
                if (a.is.folder !== b.is.folder) {
                    return a.is.folder ? -1 : 1;
                }
                return a.route.localeCompare(b.route);
            });
            r.data.lot.forEach(v => {
                const listItem = document.createElement('li');
                const listItemLink = document.createElement('a');
                const listItemLinks = document.createElement('span');
                listItemLink.href = "";
                listItemLink.innerHTML = v.route.slice(1) + (v.is.file ? "" : '/');
                listItem.append(v.is.file ? '📄 ' : '📁 ');
                listItem.append(listItemLink);
                listItem.append(listItemLinks);
                list.append(listItem);
            });
        }
    }).catch(console.error);
}

function displayFormUser() {
    document.title = 'Enter';
    window.history.pushState({}, "", path + '/user');
    const key = document.createElement('input');
    const keyParent = document.createElement('p');
    const pass = document.createElement('input');
    const passParent = document.createElement('p');
    const peer = document.createElement('input');
    const task = document.createElement('button');
    const taskParent = document.createElement('p');
    key.name = 'key';
    key.placeholder = 'User';
    key.type = 'text';
    pass.name = 'pass';
    pass.placeholder = 'Pass';
    pass.type = 'password';
    peer.name = 'peer';
    peer.type = 'hidden';
    peer.value = 'YOUR_APPLICATION_ID';
    task.innerHTML = 'Enter';
    task.type = 'submit';
    keyParent.append(key);
    passParent.append(pass);
    taskParent.append(task);
    taskParent.setAttribute('role', 'group');
    form.user.replaceChildren(keyParent, passParent, taskParent, peer);
    view.replaceChildren(form.user);
}

function request(route, method = 'GET', headers = {}, body = "") {
    const jwt = localStorage.getItem('jwt');
    headers = Object.assign(headers, {
        'authorization': 'bearer ' + jwt,
        'content-type': 'application/json'
    });
    return fetch(route, 'GET' === method || 'HEAD' === method ? { headers, method } : { body, headers, method });
}

displayFormUser();

console.log(pathCurrent);

window.addEventListener('popstate', function (e) {
    pathCurrent = window.location.pathname.slice(path.length);
    console.log(pathCurrent);
});

})();