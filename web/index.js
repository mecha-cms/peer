// (() => {

const form = {};
const formAlert = document.createElement('p');
const view = document.querySelector('[role=application]');

formAlert.setAttribute('role', 'alert');

form.blob = document.createElement('form');
form.file = document.createElement('form');
form.folder = document.createElement('form');
form.user = document.createElement('form');

form.blob.method = 'post';
form.file.method = 'post';
form.folder.method = 'post';
form.user.method = 'post';

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

function createTracesFromString(path) {
    const span = document.createElement('span');
    let trace = '/',
        traces = path.split('/'),
        tracesMax = traces.length;
    traces.forEach((v, k) => {
        trace += '/' + (v = decodeURIComponent(v));
        if (k < 2) {
            k > 0 && span.append('/');
            span.append(v);
        } else {
            const a = document.createElement('a');
            a.addEventListener('click', onClickAnchor);
            a.href = sub + trace.slice(1) + '?chunk=20&part=1';
            a.innerHTML = v;
            if (tracesMax === (k + 1)) {
                a.setAttribute('aria-current', 'location');
            }
            span.append('/', a);
        }
    });
    return span;
}

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
        itemTitle.append('📂', ' ', createTracesFromString('.' + path));
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
        listNavLinkNext.addEventListener('click', onClickAnchor);
        listNavLinkParent.addEventListener('click', onClickAnchor);
        listNavLinkPrev.addEventListener('click', onClickAnchor);
        listNavLinkNext.href = sub + r.data.route + '?chunk=' + r.query.chunk + '&part=' + (r.query.part + 1);
        listNavLinkParent.href = parent ? sub + parent.route + '?chunk=' + r.query.chunk + '&part=1' : "";
        listNavLinkPrev.href = sub + r.data.route + '?chunk=' + r.query.chunk + '&part=' + (r.query.part - 1);
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
        listTitle.append('📂', ' ', createTracesFromString('.' + path));
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
            const listItemLinkDelete = document.createElement('a');
            const listItemLinkEdit = document.createElement('a');
            const listItemLinkOpen = document.createElement('a');
            const listItemLinkView = document.createElement('a');
            const listItemLinks = document.createElement('span');
            const listItemSize = document.createElement('span');
            listItemSize.innerHTML = '..' === v.name ? "" : v.size;
            listItemSize.setAttribute('role', 'status');
            listItemLink.innerHTML = (v.name ?? "") + (v.is.file ? '.' + v.x : "");
            if ('..' === v.name) {
                listItemLink.title = 'Go to parent';
            }
            if (v.is.blob) {
                listItemLink.addEventListener('click', function (e) {
                    openBlob(this.href);
                    e.preventDefault();
                });
                listItemLink.href = hub + '/get/blob' + v.route.slice(4);
            } else {
                listItemLink.addEventListener('click', onClickAnchor);
                listItemLink.href = sub + v.route + (v.is.folder ? '?chunk=' + query.chunk + '&part=1' : "");
            }
            listItemLinkDelete.addEventListener('click', function (e) {
                alert('Delete');
                e.preventDefault();
            });
            listItemLinkDelete.href = '#delete';
            listItemLinkDelete.innerHTML = '🗑️';
            listItemLinkDelete.title = 'Delete';
            listItemLinkEdit.addEventListener('click', function (e) {
                alert('Edit');
                e.preventDefault();
            });
            listItemLinkEdit.href = '#edit';
            listItemLinkEdit.innerHTML = '📝';
            listItemLinkEdit.title = 'Edit';
            listItemLinkOpen.addEventListener('click', function (e) {
                listItemLink.click();
                e.preventDefault();
            });
            listItemLinkOpen.href = listItemLink.href;
            listItemLinkOpen.innerHTML = '🔍';
            listItemLinkOpen.title = 'Open';
            listItemLinkView.addEventListener('click', function (e) {
                alert('View');
                e.preventDefault();
            });
            listItemLinkView.href = '#view';
            listItemLinkView.innerHTML = '👁';
            listItemLinkView.title = 'View';
            listItemLinks.append(listItemLinkEdit, ' ', listItemLinkDelete);
            listItemLinks.style.display = 'flex';
            listItemLinks.style.gap = '0.5em';
            listItemLinks.style.justifyContent = 'end';
            listItemLinks.style.minWidth = '5em';
            if (v.is.blob) {
                listItemLinks.prepend(listItemLinkView, ' ');
            } else if (v.is.folder) {
                listItemLinks.prepend(listItemLinkOpen, ' ');
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
    task.innerHTML = '🔓 Enter';
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
    const bar = document.createElement('p');
    // Folder navigation
    const changeOptions = document.createElement('select');
    changeOptions.addEventListener('change', function (e) {
        window.history.pushState({}, "", sub + '/lot/' + this.value + '?chunk=20&part=1');
        display();
        e.preventDefault();
    });
    Object.entries({
        asset: 'Asset',
        cache: 'Cache',
        comment: 'Comment',
        page: 'Page',
        tag: 'Tag',
        trash: 'Trash',
        user: 'User',
        x: 'Extension',
        y: 'Layout'

    }).sort(([, v1], [, v2]) => v1.localeCompare(v2)).forEach(v => {
        const changeOption = document.createElement('option');
        changeOption.textContent = '📁 ' + v[1];
        changeOption.value = v[0];
        changeOptions.append(changeOption);
    });
    changeOptions.value = window.location.pathname.slice(sub.length + 1).split('/')[1] || 'asset';
    // Exit link
    const exit = document.createElement('button');
    exit.addEventListener('click', function (e) {
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
        window.history.pushState({}, "", sub + '/user');
        display(-1);
        e.preventDefault();
    });
    exit.innerHTML = '🔒 Exit';
    bar.append(changeOptions, exit);
    bar.style.display = 'flex';
    bar.style.justifyContent = 'space-between';
    bar.style.marginTop = 0;
    view.prepend(bar);
    // if (1 === query._status) {
    //     const description = document.createElement('p');
    //     description.innerHTML = 'Logged in.';
    //     description.setAttribute('role', 'alert');
    //     view.prepend(description);
    // }
}

function onClickAnchor(e) {
    window.history.pushState({}, "", this.href);
    display();
    e.preventDefault();
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