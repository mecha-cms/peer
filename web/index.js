// (() => {

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
    fetch(hub + '/try/user', {
        body: JSON.stringify({ key, pass, peer }),
        headers: { 'content-type': 'application/json' },
        method: 'POST'
    }).then(r => r.json()).then(r => {
        if (200 !== r.status) {
            formAlert.innerHTML = r.description || 'Unknown error.';
            this.elements.pass.value = "";
            if (404 === r.status) {
                this.elements.key.focus();
                this.elements.key.select();
            } else {
                this.elements.pass.focus();
            }
            this.prepend(formAlert);
            return;
        }
        // For a more secure application, you may need to store the token data some-where else with encryption and/or
        // similar method(s). This practice is only for demonstration and educational purpose(s).
        localStorage.setItem('jwt', r.token);
        localStorage.setItem('user', r.user);
        window.history.pushState({}, "", sub + '/lot/asset?chunk=20&part=1');
        display(1);
    }).catch(e => {
        formAlert.innerHTML = e;
        this.prepend(formAlert);
    });
    e.preventDefault();
});

function display(status) {
    const hash = window.location.hash;
    const path = window.location.pathname.slice(sub.length);
    const query = Object.fromEntries(new URLSearchParams(window.location.search));
    if ('/user' === path) {
        if (localStorage.getItem('jwt')) {
            // TODO: Persistent enter state
            displayFormUser(status);
        } else {
            displayFormUser(status);
        }
    } else {
        query._status = status;
        query.part ? displayLotItems(path, query, hash) : displayLotItem(path, query, hash);
    }
}

function displayLotItem(path, query, hash) {
    const description = document.createElement('p');
    const itemContent = document.createElement('pre');
    const itemTitle = document.createElement('h1');
    description.setAttribute('role', 'alert');
    document.title = 'Loading…';
    request(hub + '/get/data' + path.slice(4)).then(r => r.json()).then(r => {
        console.log(r);
        // TODO: Handle stale token
        if (401 === r.status) {
            localStorage.removeItem('jwt');
            localStorage.removeItem('user');
            window.history.pushState({}, "", sub + '/user');
            display();
            return;
        }
        if (404 === r.status) {
            document.title = 'Application · Error';
            description.innerHTML = r.description;
            view.replaceChildren(description);
            onAfterDisplay();
            return;
        }
        document.title = 'Application · ' + (r.is.file ? 'File' : 'Folder') + ' (.' + path + ')';
        itemContent.textContent = JSON.stringify(r, null, 2);
        itemTitle.innerHTML = '.' + path;
        view.replaceChildren(itemTitle, itemContent);
        onAfterDisplay();
    }).catch(console.error);
}

function displayLotItems(path, query, hash) {
    const description = document.createElement('p');
    const listItems = document.createElement('ul');
    const listNav = document.createElement('nav');
    const listNavLinkNext = document.createElement('a');
    const listNavLinkParent = document.createElement('a');
    const listNavLinkPrev = document.createElement('a');
    const listTitle = document.createElement('h1');
    description.setAttribute('role', 'alert');
    listNavLinkNext.innerHTML = '➡️';
    listNavLinkNext.title = 'Go to the next page';
    listNavLinkParent.innerHTML = '⬆️';
    listNavLinkParent.title = 'Go to parent';
    listNavLinkPrev.innerHTML = '⬅️';
    listNavLinkPrev.title = 'Go to the previous page';
    document.title = 'Loading…';
    request(hub + '/get/data' + path.slice(4) + '?chunk=' + query.chunk + '&part=' + query.part).then(r => r.json()).then(r => {
        console.log(r);
        // TODO: Handle stale token
        if (401 === r.status) {
            localStorage.removeItem('jwt');
            localStorage.removeItem('user');
            window.history.pushState({}, "", sub + '/user');
            display();
            return;
        }
        if (404 === r.status) {
            document.title = 'Application · Error';
            description.innerHTML = r.description;
            view.replaceChildren(description);
            onAfterDisplay();
            return;
        }
        document.title = 'Application · Folder (.' + path + ')';
        let parent = r.data.parent;
        listNavLinkNext.setAttribute('href', sub + r.data.route + '?chunk=' + r.query.chunk + '&part=' + (r.query.part + 1));
        listNavLinkParent.setAttribute('href', parent ? sub + parent.route + '?chunk=' + r.query.chunk + '&part=1' : "");
        listNavLinkPrev.setAttribute('href', sub + r.data.route + '?chunk=' + r.query.chunk + '&part=' + (r.query.part - 1));
        listNavLinkNext.addEventListener('click', function (e) {
            window.history.pushState({}, "", this.getAttribute('href'));
            display();
            e.preventDefault();
        });
        listNavLinkParent.addEventListener('click', function (e) {
            window.history.pushState({}, "", this.getAttribute('href'));
            display();
            e.preventDefault();
        });
        listNavLinkPrev.addEventListener('click', function (e) {
            window.history.pushState({}, "", this.getAttribute('href'));
            display();
            e.preventDefault();
        });
        if (r.has.next) {
            listNavLinkNext.removeAttribute('aria-disabled');
        } else {
            listNavLinkNext.setAttribute('aria-disabled', 'true');
        }
        if (r.has.parent) {
            listNavLinkParent.removeAttribute('aria-disabled');
        } else {
            listNavLinkParent.setAttribute('aria-disabled', 'true');
        }
        if (r.has.prev) {
            listNavLinkPrev.removeAttribute('aria-disabled');
        } else {
            listNavLinkPrev.setAttribute('aria-disabled', 'true');
        }
        listNav.append(listNavLinkPrev, ' ', listNavLinkParent, ' ', listNavLinkNext);
        listTitle.innerHTML = '.' + path + '#' + r.query.part;
        view.replaceChildren(listTitle, listItems);
        if (r.has.next || r.has.prev) {
            view.append(listNav);
        }
        if (parent) {
            parent.name = '..';
            r.data.children.unshift(parent);
        }
        r.data.children.forEach(v => {
            const listItem = document.createElement('li');
            const listItemLink = document.createElement('a');
            const listItemLinks = document.createElement('span');
            const listItemSize = document.createElement('span');
            listItemSize.innerHTML = '..' === v.name ? "" : v.size;
            listItemSize.setAttribute('role', 'status');
            listItemLink.innerHTML = v.name + (v.is.file ? '.' + v.x : "");
            if ('..' === v.name) {
                listItemLink.title = 'Go to parent';
            }
            if (v.is.blob) {
                listItemLink.addEventListener('click', function (e) {
                    openBlob(this.getAttribute('href'));
                    e.preventDefault();
                });
                listItemLink.href = hub + '/get/blob' + v.route.slice(4);
            } else {
                listItemLink.addEventListener('click', function (e) {
                    window.history.pushState({}, "", this.getAttribute('href'));
                    display();
                    e.preventDefault();
                });
                listItemLink.href = sub + v.route + (v.is.folder ? '?chunk=' + query.chunk + '&part=1' : "");
            }
            listItem.append(v.is.file ? '📄 ' : '📁 ', listItemLink, ' ', listItemSize, listItemLinks);
            listItems.append(listItem);
        });
        onAfterDisplay();
    }).catch(console.error);
}

function displayFormUser(status) {
    document.title = 'Application · Enter';
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
    key.focus();
    if (-1 === status && !localStorage.getItem('jwt')) {
        const description = document.createElement('p');
        description.innerHTML = 'Logged out.';
        description.setAttribute('role', 'alert');
        view.prepend(description);
    }
}

function onAfterDisplay() {
    const p1 = document.createElement('p');
    const p2 = document.createElement('p');
    // Append exit link
    const exit = document.createElement('button');
    exit.addEventListener('click', function (e) {
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
        window.history.pushState({}, "", sub + '/user');
        display(-1);
        e.preventDefault();
    });
    exit.innerHTML = 'Exit';
    p1.append(exit);
    view.append(p1);
    // Prepend folder navigation
    const changeOptions = document.createElement('select');
    changeOptions.addEventListener('change', function (e) {
        window.history.pushState({}, "", sub + '/lot/' + this.value + '?chunk=20&part=1');
        display();
        e.preventDefault();
    });
    ['asset', 'cache', 'comment', 'page', 'tag', 'trash', 'user', 'x', 'y'].forEach(v => {
        const changeOption = document.createElement('option');
        changeOption.textContent = changeOption.value = v;
        changeOptions.append(changeOption);
    });
    p2.append(changeOptions);
    view.prepend(p2);
    changeOptions.value = window.location.pathname.slice(sub.length + 1).split('/')[1] || 'asset';
    // if (1 === query._status) {
    //     const description = document.createElement('p');
    //     description.innerHTML = 'Logged in.';
    //     description.setAttribute('role', 'alert');
    //     view.prepend(description);
    // }
}

function openBlob(path, query, hash) {
    request(path, 'GET').then(r => {
        if (!r.ok) {
            throw new Error('Request failed.');
        }
        return r.blob();
    }).then(blob => {
        let v = URL.createObjectURL(blob);
        window.open(v, '_blank');
        setTimeout(() => URL.revokeObjectURL(v), 1000);
    }).catch(console.error);
}

function request(path, method = 'GET', headers = {}, body = "") {
    const jwt = localStorage.getItem('jwt');
    headers = Object.assign({
        'authorization': 'bearer ' + jwt,
        'content-type': 'application/json'
    }, headers);
    return fetch(path, 'GET' === method || 'HEAD' === method ? { headers, method } : { body, headers, method });
}

if ('/' !== window.location.pathname.slice(sub.length) || "" !== window.location.search) {} else {
    window.history.pushState({}, "", sub + '/user');
}

display();

window.addEventListener('popstate', display);

// })();