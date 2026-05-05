// (() => {

const folderSizeViews = {};

const application = document.querySelector('[role=application]');
const form = {};
const formAlert = createElement('p');

formAlert.setAttribute('role', 'alert');

form.blob = createElement('form');
form.file = createElement('form');
form.folder = createElement('form');
form.user = createElement('form');

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
    fetch(hub + '/enter', {
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
        // For a more secure application, you may need to store the hub token data some-where else with encryption
        // and/or similar method(s). This practice is only for demonstration and educational purpose(s).
        localStorage.setItem('hub', r.data.hub);
        localStorage.setItem('user', r.user);
        window.history.pushState({}, "", sub + '/lot/asset?chunk=20&part=1');
        view(1);
    }).catch(e => {
        formAlert.innerHTML = e;
        this.prepend(formAlert);
    });
    e.preventDefault();
});

function createElement(name, content, attributes) {
    const element = document.createElement(name);
    if (attributes) {
        // TODO
    }
    if (content) {
        element.innerHTML = content;
    }
    return element;
}

function createTracesFromString(path) {
    const span = createElement('span');
    let trace = '/',
        traces = path.split('/'),
        tracesMax = traces.length;
    traces.forEach((v, k) => {
        trace += '/' + (v = decodeURIComponent(v));
        if (k < 2) {
            k > 0 && span.append('/');
            span.append(v);
        } else {
            const a = createElement('a');
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

function f3h(path, method = 'GET', headers = {}, body = "") {
    const token = localStorage.getItem('hub');
    headers = Object.assign({
        'authorization': 'bearer ' + token,
        'content-type': 'application/json'
    }, headers);
    return fetch(path, 'GET' === method || 'HEAD' === method ? { headers, method } : { body, headers, method });
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const s = createElement('script');
        s.async = true;
        s.onerror = () => reject(new Error('Failed to load ' + src));
        s.onload = resolve;
        s.src = src;
        document.head.appendChild(s);
    });
}

function loadCSS(href) {
    return new Promise((resolve, reject) => {
        const l = createElement('link');
        l.href = href;
        l.onerror = () => reject(new Error('Failed to load ' + href));
        l.onload = resolve;
        l.rel = 'stylesheet';
        document.head.appendChild(l);
    });
}

function loadCodeMirror5() {
    if (window.CodeMirror) {
        return Promise.resolve(window.CodeMirror);
    }
    const base = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16';
    return Promise.all([
        loadCSS(base + '/codemirror.min.css'),
        loadScript(base + '/codemirror.min.js'),
        loadScript(base + '/mode/clike/clike.min.js'),
        loadScript(base + '/mode/css/css.min.js'),
        loadScript(base + '/mode/htmlmixed/htmlmixed.min.js'),
        loadScript(base + '/mode/javascript/javascript.min.js'),
        loadScript(base + '/mode/markdown/markdown.min.js'),
        loadScript(base + '/mode/nginx/nginx.min.js'),
        loadScript(base + '/mode/php/php.min.js'),
        loadScript(base + '/mode/xml/xml.min.js'),
        loadScript(base + '/mode/yaml/yaml.min.js'),
    ]).then(() => {
        if (!window.CodeMirror) throw new Error('Error loading `CodeMirror` library!');
        return window.CodeMirror;
    });
}

function onAfterView() {
    const bar = createElement('p');
    // Folder navigation
    const changeOptions = createElement('select');
    changeOptions.addEventListener('change', function (e) {
        window.history.pushState({}, "", sub + '/lot/' + this.value + '?chunk=20&part=1');
        view();
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
        const changeOption = createElement('option', '📁 ' + v[1]);
        changeOption.value = v[0];
        changeOptions.append(changeOption);
    });
    changeOptions.value = window.location.pathname.slice(sub.length + 1).split('/')[1] || "";
    if ("" === changeOptions.value) {
        const changeOption = createElement('option', '🏠 Home');
        const changeOptionCurrent = createElement('option', '⛔ System');
        changeOption.value = 'asset';
        changeOptionCurrent.disabled = true;
        changeOptionCurrent.value = "";
        changeOptions.replaceChildren(changeOptionCurrent, changeOption);
        changeOptions.value = "";
    }
    // Exit link
    const exit = createElement('button');
    exit.addEventListener('click', function (e) {
        localStorage.removeItem('hub');
        localStorage.removeItem('user');
        window.history.pushState({}, "", sub + '/enter');
        view(-1);
        e.preventDefault();
    });
    exit.innerHTML = '🔒 Exit';
    bar.append(changeOptions, exit);
    bar.style.display = 'flex';
    bar.style.justifyContent = 'space-between';
    application.prepend(bar);
    // if (1 === query._status) {
    //     const description = createElement('p');
    //     description.innerHTML = 'Logged in.';
    //     description.setAttribute('role', 'alert');
    //     application.prepend(description);
    // }
    // Calculate folder size then view
    for (let route in folderSizeViews) {
        (() => {
            let listItemSize = folderSizeViews[route];
            f3h(hub + '/%2B/size' + route).then(r => r.json()).then(r => {
                if (200 === r.status) {
                    listItemSize.innerHTML = r.data.size;
                }
            });
        })();
    }
}

function onClickAnchor(e) {
    window.history.pushState({}, "", this.href);
    view();
    e.preventDefault();
}

function openBlob(path, query, hash) {
    f3h(path).then(r => {
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

function view(status) {
    const hash = window.location.hash;
    const path = window.location.pathname.slice(sub.length);
    const query = Object.fromEntries(new URLSearchParams(window.location.search));
    if ('/enter' === path) {
        if (localStorage.getItem('hub')) {
            // TODO: Persistent enter state
            viewFormUser(status);
        } else {
            viewFormUser(status);
        }
    } else {
        query._status = status;
        query.part ? viewItems(path, query, hash) : viewItem(path, query, hash);
    }
}

function viewFormFile(path, query, hash) {
    document.title = 'Application · File Editor';
    const content = createElement('textarea');
    const contentParent = createElement('div');
    const name = createElement('input');
    const taskDelete = createElement('button');
    const taskParent = createElement('p');
    const taskSave = createElement('button');
    content.name = 'content';
    content.placeholder = 'Content goes here…';
    name.name = 'name';
    name.placeholder = 'name.txt';
    name.style.flex = 1;
    name.type = 'text';
    taskDelete.innerHTML = 'Delete';
    taskDelete.type = 'button';
    taskSave.innerHTML = 'Save';
    taskSave.type = 'submit';
    contentParent.append(content);
    taskParent.append(name, ' ', taskSave, ' ', taskDelete);
    taskParent.setAttribute('role', 'group');
    form.file.replaceChildren(contentParent, taskParent);
    application.replaceChildren(form.file);
    content.focus();
    return form.file;
}

function viewFormUser(status) {
    document.title = 'Application · Enter';
    const key = createElement('input');
    const keyParent = createElement('p');
    const pass = createElement('input');
    const passParent = createElement('p');
    const peer = createElement('input');
    const task = createElement('button');
    const taskParent = createElement('p');
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
    application.replaceChildren(form.user);
    key.focus();
    if (-1 === status && !localStorage.getItem('hub')) {
        const description = createElement('p');
        description.innerHTML = 'Logged out.';
        description.setAttribute('aria-live', 'polite');
        description.setAttribute('role', 'alert');
        application.prepend(description);
    }
    return form.user;
}

function viewItem(path, query, hash) {
    const description = createElement('p');
    const itemContent = createElement('pre');
    const itemContentContent = createElement('code');
    const itemTitle = createElement('h2');
    description.setAttribute('role', 'alert');
    document.title = 'Loading…';
    f3h(hub + '/at' + path).then(r => r.json()).then(r => {
        console.log(r);
        // TODO: Handle stale token
        if (401 === r.status) {
            localStorage.removeItem('hub');
            localStorage.removeItem('user');
            window.history.pushState({}, "", sub + '/enter');
            view();
            return;
        }
        if (404 === r.status) {
            document.title = 'Application · Error';
            description.innerHTML = r.description;
            application.replaceChildren(description);
            onAfterView();
            return;
        }
        document.title = 'Application · ' + (r.is.file ? 'File' : 'Folder') + ' (.' + path + ')';
        itemTitle.append('📂', ' ', createTracesFromString('.' + path));
        itemContent.append(itemContentContent);
        application.replaceChildren(itemTitle, itemContent);
        if (r.is.text) {
            itemContentContent.textContent = 'Loading…';
            f3h(hub + '/%2B/content' + path).then(r => r.json()).then(r => {
                if (200 === r.status) {
                    itemContentContent.textContent = r.data.content;
                }
            });
        } else {
            itemContentContent.textContent = JSON.stringify(r, null, 2);
        }
        onAfterView();
    }).catch(console.error);
}

function viewItemTextEditor(path, query, hash) {
    const itemDescription = createElement('p');
    const itemTitle = createElement('h2');
    itemDescription.setAttribute('role', 'alert');
    f3h(hub + '/at' + path).then(r => r.json()).then(r => {
        console.log(r);
        // TODO: Handle stale token
        if (401 === r.status) {
            localStorage.removeItem('hub');
            localStorage.removeItem('user');
            window.history.pushState({}, "", sub + '/enter');
            view();
            return;
        }
        if (404 === r.status) {
            document.title = 'Application · Error';
            itemDescription.innerHTML = r.description;
            application.replaceChildren(itemDescription);
            onAfterView();
            return;
        }
        const codeMirrorMode = r.data.type;
        const form = viewFormFile();
        form.elements.content.parentNode.style.display = 'none';
        form.elements.name.value = r.data.name + (r.data.x ? '.' + r.data.x : "");
        document.title = 'Loading…';
        itemTitle.append('📂', ' ', createTracesFromString('.' + path));
        application.prepend(itemTitle);
        if (r.is.text) {
            form.elements.content.parentNode.style.display = "";
            form.elements.content.style.display = 'none';
            f3h(hub + '/%2B/content' + path).then(r => r.json()).then(r => {
                document.title = 'Application · File Editor';
                if (200 === r.status) {
                    form.elements.content.value = r.data.content;
                    loadCodeMirror5().then(CodeMirror => {
                        const t = form.elements.content;
                        const cm = CodeMirror.fromTextArea(t, {
                            lineNumbers: true,
                            lineWrapping: true,
                            mode: codeMirrorMode,
                            viewportMargin: Infinity
                        });
                        form && form.addEventListener('submit', () => cm.save());
                        cm.refresh();
                    }).catch(e => {
                        form.elements.content.style.minHeight = 'calc(' + form.elements.content.scrollHeight + 'px + 0.25em)';
                    });
                }
            });
        } else {
        }
        onAfterView();
    }).catch(console.error);
}

function viewItems(path, query, hash) {
    const description = createElement('p');
    const listItems = createElement('ul');
    const listNav = createElement('nav');
    const listNavLinkNext = createElement('a');
    const listNavLinkParent = createElement('a');
    const listNavLinkPrev = createElement('a');
    const listTitle = createElement('h2');
    description.setAttribute('role', 'alert');
    listNavLinkNext.innerHTML = '➡️';
    listNavLinkNext.title = 'Go to the next page';
    listNavLinkParent.innerHTML = '⬆️';
    listNavLinkParent.title = 'Go to parent';
    listNavLinkPrev.innerHTML = '⬅️';
    listNavLinkPrev.title = 'Go to the previous page';
    document.title = 'Loading…';
    f3h(hub + '/at' + path + '?chunk=' + query.chunk + '&part=' + query.part).then(r => r.json()).then(r => {
        console.log(r);
        // TODO: Handle stale token
        if (401 === r.status) {
            localStorage.removeItem('hub');
            localStorage.removeItem('user');
            window.history.pushState({}, "", sub + '/enter');
            view();
            return;
        }
        if (404 === r.status) {
            document.title = 'Application · Error';
            description.innerHTML = r.description;
            application.replaceChildren(description);
            onAfterView();
            return;
        }
        document.title = 'Application · Folder';
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
        // if (r.has.parent) {
        //     let folderSizeCurrent = createElement('span', '…');
        //     folderSizeCurrent.setAttribute('role', 'status');
        //     listTitle.append(' ', folderSizeCurrent);
        //     f3h(hub + '/%2B/size' + path).then(r => r.json()).then(r => {
        //         if (200 === r.status) {
        //             folderSizeCurrent.innerHTML = r.data.size;
        //         }
        //     });
        // }
        application.replaceChildren(listTitle, listItems);
        if (r.has.next || r.has.prev) {
            application.append(listNav);
        }
        if (parent) {
            parent.name = '..';
            r.data.children.unshift(parent);
        }
        r.data.children.forEach(v => {
            const listItem = createElement('li');
            const listItemLink = createElement('a');
            const listItemLinkDelete = createElement('a');
            const listItemLinkEdit = createElement('a');
            const listItemLinkOpen = createElement('a');
            const listItemLinkView = createElement('a');
            const listItemLinks = createElement('span');
            const listItemSize = createElement('span', v.size ?? '…');
            listItemSize.setAttribute('role', 'status');
            if (v.is.folder) {
                folderSizeViews[v.route] = listItemSize;
            }
            listItemLink.innerHTML = v.name + (v.is.file && v.x ? '.' + v.x : "");
            if ('..' === v.name) {
                listItemLink.title = 'Go to parent';
            }
            if (v.is.blob) {
                listItemLink.addEventListener('click', function (e) {
                    openBlob(this.href);
                    e.preventDefault();
                });
                listItemLink.href = hub + '/blob' + v.route;
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
                window.history.pushState({}, "", this.getAttribute('href'));
                viewItemTextEditor(this.getAttribute('href').slice(sub.length));
                e.preventDefault();
            });
            listItemLinkEdit.href = sub + v.route + '#edit';
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
                openBlob(this.href);
                e.preventDefault();
            });
            listItemLinkView.href = hub + '/blob' + v.route;
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
        onAfterView();
    }).catch(console.error);
}

if ('/' !== window.location.pathname.slice(sub.length) || "" !== window.location.search) {} else {
    window.history.pushState({}, "", sub + '/enter');
}

window.addEventListener('hashchange', view);
window.addEventListener('popstate', view);

view();

// })();