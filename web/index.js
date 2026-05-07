// (() => {

const application = document.querySelector('[role=application]');
const form = {};

let folderSizeViews = {};

form.blob = createElement('form');
form.file = createElement('form');
form.folder = createElement('form');
form.user = createElement('form');

form.blob.method = 'post';
form.file.method = 'post';
form.folder.method = 'post';
form.user.method = 'post';

form.user.addEventListener('submit', function (e) {
    // Remove existing alert(s)
    application.querySelectorAll('[role=alert]').forEach(v => v.remove());
    let key = this.elements.key.value,
        pass = this.elements.pass.value,
        peer = this.elements.peer.value;
    // Force `@` prefix
    if ('@' !== key[0]) {
        key = '@' + key;
    }
    const info = createAlert('Logging in…', 'info');
    application.prepend(info);
    fetch(hub + '/enter', {
        body: JSON.stringify({ key, pass, peer }),
        headers: { 'content-type': 'application/json' },
        method: 'POST'
    }).then(r => r.json()).then(r => {
        if (200 !== r.status) {
            updateAlert(info, r.description, 'error', 1000);
            this.elements.pass.value = "";
            if (404 === r.status) {
                this.elements.key.focus();
                this.elements.key.select();
            } else {
                this.elements.pass.focus();
            }
            return;
        }
        // For a more secure application, you may need to store the hub token data some-where else with encryption
        // and/or similar method(s). This practice is only for demonstration and educational purpose(s).
        localStorage.setItem('hub', r.data.hub);
        localStorage.setItem('user', r.user);
        updateRoute('/lot/asset?chunk=20&part=1'), view(function () {
            application.prepend(createAlert('Logged in.', 'success'));
        });
    }).catch(e => {
        updateAlert(info, e + "", 'error', 1000);
    });
    e.preventDefault();
});

function createAlert(text, type, timeOut) {
    const element = createElement('p', text, {
        'aria-live': 'error' === type ? 'assertive' : ('info' === type ? 'off' : ('success' === type ? 'polite' : false)),
        'role': 'alert'
    });
    if (timeOut) {
        window.setTimeout(() => element.remove(), timeOut);
    }
    return element;
}

function createElement(name, content, attributes) {
    return updateElement(document.createElement(name), content, attributes);
}

function createText(content) {
    return document.createTextNode(content);
}

function updateAlert(element, text, type, timeOut) {
    updateElement(element, text, {
        'aria-live': 'error' === type ? 'assertive' : ('info' === type ? 'off' : ('success' === type ? 'polite' : false)),
        'role': 'alert'
    });
    if (timeOut) {
        window.setTimeout(() => element.remove(), timeOut);
    }
    return element;
}

function updateElement(element, content, attributes) {
    if (attributes) {
        for (let name in attributes) {
            let v = attributes[name];
            if (false === v || null === v) {
                element.removeAttribute(name);
            } else {
                element.setAttribute(name, v);
            }
        }
    }
    if ('string' === typeof content) {
        element.innerHTML = content;
    }
    return element;
}

function updateTitle(text, busy) {
    document.title = text;
    updateElement(document.documentElement, false, {
        'aria-busy': busy ? 'true' : false
    });
}

function updateRoute(route) {
    if ('/' === route[0]) {
        route = sub + route;
    }
    window.history.pushState({}, "", route);
}

function createPager(current, count, chunk, kin, then, first, previous, next, last) {
    let start = 1,
        end = Math.ceil(count / chunk),
        root = document.createDocumentFragment(),
        i, min, max;
    if (end <= 1) {
        return root;
    }
    if (current <= kin + kin) {
        min = start;
        max = Math.min(start + kin + kin, end);
    } else if (current > end - kin - kin) {
        min = end - kin - kin;
        max = end;
    } else {
        min = current - kin;
        max = current + kin;
    }
    function createDots() {
        return createElement('span', '…', {
            'role': 'none'
        });
    }
    function createLink(page, title, rel, current, disabled) {
        let element = createElement('a', title, {
            'aria-current': current ? 'page' : false,
            'aria-disabled': disabled ? 'true' : false,
            'rel': rel || false
        });
        then && then.call(element, page, current, disabled);
        return element;
    }
    if (previous) {
        root.append(createLink(current === start ? start : current - 1, previous, 'prev', false, current === start), createText(' '));
    }
    if (first && last) {
        if (min > start) {
            root.append(createLink(start, start + "", 'prev', false, false));
            if (min > start + 1) {
                root.append(createText(' '), createDots());
            }
        }
        for (i = min; i <= max; ++i) {
            root.append(createText(' '), createLink(i, i + "", current >= i ? 'prev' : 'next', current === i, false));
        }
        if (max < end) {
            if (max < end - 1) {
                root.append(createText(' '), createDots());
            }
            root.append(createText(' '), createLink(end, end + "", 'next', false, false));
        }
    }
    if (next) {
        root.append(createText(' '), createLink(current === end ? end : current + 1, next, 'next', false, current === end));
    }
    return root;
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
        s.async = false;
        s.onerror = () => reject(new Error('Failed to load ' + src));
        s.onload = resolve;
        s.src = src;
        document.head.append(s);
    });
}

function loadCSS(href) {
    return new Promise((resolve, reject) => {
        const l = createElement('link');
        l.href = href;
        l.onerror = () => reject(new Error('Failed to load ' + href));
        l.onload = resolve;
        l.rel = 'stylesheet';
        document.head.append(l);
    });
}

let wasLoadCodeMirror5 = false;
function loadCodeMirror5() {
    if (wasLoadCodeMirror5) {
        return Promise.resolve(window.CodeMirror);
    }
    const base = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16';
    return Promise.all([
        loadCSS(base + '/codemirror.min.css'),
        loadScript(base + '/codemirror.min.js'),
        // Order #1
        loadScript(base + '/addon/edit/closebrackets.min.js'),
        loadScript(base + '/addon/runmode/runmode.min.js'),
        // Order #2
        loadScript(base + '/mode/clike/clike.min.js'),
        loadScript(base + '/mode/css/css.min.js'),
        loadScript(base + '/mode/javascript/javascript.min.js'),
        loadScript(base + '/mode/xml/xml.min.js'),
        // Order #3
        loadScript(base + '/mode/htmlmixed/htmlmixed.min.js'),
        loadScript(base + '/mode/php/php.min.js'),
        // Order #4
        loadScript(base + '/mode/markdown/markdown.min.js'),
        loadScript(base + '/mode/nginx/nginx.min.js'),
        loadScript(base + '/mode/yaml/yaml.min.js')
    ]).then(() => {
        wasLoadCodeMirror5 = true;
        if (!window.CodeMirror) throw new Error('Error loading `CodeMirror` library!');
        return window.CodeMirror;
    });
}

function onAfterView(path, query, hash, then) {
    const bar = createElement('p');
    // Folder navigation
    const changeOptions = createElement('select');
    changeOptions.addEventListener('change', function (e) {
        updateRoute('/lot/' + this.value + '?chunk=20&part=1'), view();
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
    changeOptions.value = path.split('/')[2] || "";
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
        updateRoute('/enter'), view(onAfterViewFormUser);
        e.preventDefault();
    });
    exit.innerHTML = '🔒 Exit';
    bar.append(changeOptions, exit);
    bar.style.display = 'flex';
    bar.style.justifyContent = 'space-between';
    application.prepend(bar);
    // Calculate folder size then view
    for (let route in folderSizeViews) {
        (() => {
            let listItemSize = folderSizeViews[route];
            if (!listItemSize.offsetHeight && !listItemSize.offsetWidth) {
                return; // Hidden from view
            }
            f3h(hub + '/%2B/size' + route).then(r => r.json()).then(r => {
                if (200 === r.status) {
                    listItemSize.innerHTML = r.data.size;
                }
            });
        })();
    }
    then && then.call(application);
}

function onAfterViewFormUser(path, query, hash, then) {
    if (!localStorage.getItem('hub')) {
        application.prepend(createAlert('Logged out.', 'success'));
    }
    then && then.call(application);
}

function onClickAnchor(e) {
    updateRoute(this.href), view();
    e.preventDefault();
}

function onHashChange() {
    view();
}

function onPopState() {
    view();
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
    }).catch(e => {
        application.prepend(createAlert(e + "", 'error', 1000));
    });
}

function view(then) {
    const hash = window.location.hash;
    const path = window.location.pathname.slice(sub.length);
    const query = Object.fromEntries(new URLSearchParams(window.location.search));
    if ('/enter' === path) {
        if (localStorage.getItem('hub')) {
            // TODO: Persistent enter state
            viewFormUser(path, query, hash, then);
        } else {
            viewFormUser(path, query, hash, then);
        }
    } else {
        query.part ? viewItems(path, query, hash, then) : viewItem(path, query, hash, then);
    }
}

function viewFormFile(path, query, hash, then) {
    updateTitle('Application · File Editor');
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
    then && then.call(form.file);
    return form.file;
}

function viewFormUser(path, query, hash, then) {
    updateTitle('Application · Enter');
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
    then && then.call(form.user);
    return form.user;
}

function viewItem(path, query, hash, then) {
    updateTitle('Loading…', true);
    const itemContent = createElement('pre');
    const itemContentContent = createElement('code');
    const itemTitle = createElement('h2');
    f3h(hub + '/at' + path).then(r => r.json()).then(r => {
        console.log(r);
        // TODO: Handle stale token
        if (401 === r.status) {
            localStorage.removeItem('hub');
            localStorage.removeItem('user');
            updateRoute('/enter'), view(onAfterViewFormUser);
            return;
        }
        if (404 === r.status) {
            updateTitle('Application · Error');
            application.replaceChildren(createAlert(r.description, 'error', 1000));
            onAfterView(path, query, hash, then);
            return;
        }
        updateTitle('Application · File Viewer');
        itemTitle.append('📂', ' ', createTracesFromString('.' + path));
        itemContent.append(itemContentContent);
        application.replaceChildren(itemTitle, itemContent);
        if (r.is.text) {
            itemContentContent.textContent = 'Loading content…';
            f3h(hub + '/%2B/content' + path).then(r => r.json()).then(r => {
                if (200 === r.status) {
                    let mode = r.data.type;
                    if ('less' === r.data.x) {
                        mode = 'text/x-less';
                    } else if ('scss' === r.data.x) {
                        mode = 'text/x-scss';
                    }
                    console.log(mode);
                    itemContentContent.classList.add('cm-s', 'cm-s-default');
                    itemContentContent.textContent = r.data.content;
                    loadCodeMirror5().then(CodeMirror => {
                        CodeMirror.runMode(r.data.content, mode, itemContentContent);
                    }).catch(e => {
                        application.prepend(createAlert(e + "", 'error', 1000));
                    });
                }
            });
        } else {
            itemContentContent.textContent = JSON.stringify(r, null, 2);
        }
        onAfterView(path, query, hash, then);
    }).catch(e => {
        application.prepend(createAlert(e + "", 'error', 1000));
        then && then.call(application);
    });
}

function viewItemTextEditor(path, query, hash, then) {
    updateTitle('Loading…', true);
    const itemTitle = createElement('h2');
    f3h(hub + '/at' + path).then(r => r.json()).then(r => {
        console.log(r);
        // TODO: Handle stale token
        if (401 === r.status) {
            localStorage.removeItem('hub');
            localStorage.removeItem('user');
            updateRoute('/enter'), view(onAfterViewFormUser);
            return;
        }
        if (404 === r.status) {
            updateTitle('Application · Error');
            application.replaceChildren(createAlert(r.description, 'error', 1000));
            onAfterView(path, query, hash, then);
            return;
        }
        const form = viewFormFile();
        form.elements.content.parentNode.style.display = r.is.text ? "" : 'none';
        form.elements.name.value = r.data.name + (r.data.x ? '.' + r.data.x : "");
        itemTitle.append('📂', ' ', createTracesFromString('.' + path));
        application.prepend(itemTitle);
        if (r.is.text) {
            let info = createAlert('Loading CodeMirror library…', 'info');
            form.elements.content.parentNode.append(info);
            form.elements.content.style.display = 'none';
            f3h(hub + '/%2B/content' + path).then(r => r.json()).then(r => {
                updateTitle('Application · File Editor');
                if (200 === r.status) {
                    let mode = r.data.type;
                    if ('less' === r.data.x) {
                        mode = 'text/x-less';
                    } else if ('scss' === r.data.x) {
                        mode = 'text/x-scss';
                    }
                    console.log(mode);
                    form.elements.content.value = r.data.content;
                    loadCodeMirror5().then(CodeMirror => {
                        const t = form.elements.content;
                        const cm = CodeMirror.fromTextArea(t, {
                            autoCloseBrackets: true,
                            lineNumbers: true,
                            lineWrapping: false,
                            mode,
                            viewportMargin: Infinity
                        });
                        form && form.addEventListener('submit', () => cm.save());
                        cm.refresh();
                    }).catch(e => {
                        application.prepend(createAlert(e + "", 'error', 1000));
                    });
                    info.remove();
                } else {
                    updateAlert(info, r.description, 'error', 1000);
                }
            });
        } else {}
        onAfterView(path, query, hash, then);
    }).catch(e => {
        application.prepend(createAlert(e + "", 'error', 1000));
        then && then.call(application);
    });
}

function viewItems(path, query, hash, then) {
    updateTitle('Loading…', true);
    const description = createElement('p');
    const listItems = createElement('ul');
    const listNav = createElement('nav', "", {
        'aria-label': 'Pagination'
    });
    const listTitle = createElement('h2');
    description.setAttribute('role', 'alert');
    f3h(hub + '/at' + path + '?chunk=' + query.chunk + '&part=' + query.part).then(r => r.json()).then(r => {
        console.log(r);
        // TODO: Handle stale token
        if (401 === r.status) {
            localStorage.removeItem('hub');
            localStorage.removeItem('user');
            updateRoute('/enter'), view(onAfterViewFormUser);
            return;
        }
        if (404 === r.status) {
            updateTitle('Application · Error');
            application.replaceChildren(createAlert(r.description, 'error', 1000));
            onAfterView(path, query, hash, then);
            return;
        }
        updateTitle('Application · Folder');
        let parent = r.data.parent;
        listNav.append(createPager(r.query.part, r.data.total, r.query.chunk, 2, function (part, current, disabled) {
            if (current || disabled) {
                this.addEventListener('click', e => e.preventDefault());
            } else {
                this.addEventListener('click', onClickAnchor);
            }
            this.href = sub + r.data.route + '?chunk=' + r.query.chunk + '&part=' + part;
        }, 'First', 'Previous', 'Next', 'Last'));
        listTitle.append('📂', ' ', createTracesFromString('.' + path));
        application.replaceChildren(listTitle, listItems);
        if (r.has.next || r.has.prev) {
            application.append(listNav);
        }
        if (parent) {
            parent.name = '..';
            r.data.children.unshift(parent);
        }
        folderSizeViews = {}; // Reset!
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
                let route = this.getAttribute('href').slice(sub.length);
                updateRoute(route), viewItemTextEditor(route.split('#')[0]);
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
            listItemLinkView.addEventListener('click', v.is.blob ? function (e) {
                openBlob(this.href);
                e.preventDefault();
            } : function (e) {
                listItemLink.click();
                e.preventDefault();
            });
            listItemLinkView.href = hub + '/blob' + v.route;
            listItemLinkView.innerHTML = '👁';
            listItemLinkView.title = 'View';
            listItemLinks.append(v.is.folder ? listItemLinkOpen : listItemLinkView, ' ', listItemLinkEdit, ' ', listItemLinkDelete);
            listItemLinks.style.display = 'flex';
            listItemLinks.style.gap = '0.5em';
            listItemLinks.style.justifyContent = 'end';
            listItemLinks.style.minWidth = '5em';
            listItem.append(v.is.file ? '📄 ' : '📁 ', listItemLink, ' ', listItemSize, listItemLinks);
            listItems.append(listItem);
        });
        onAfterView(path, query, hash, then);
    }).catch(e => {
        application.prepend(createAlert(e + "", 'error', 1000));
        then && then.call(application);
    });
}

if ('/' !== window.location.pathname.slice(sub.length) || "" !== window.location.search) {} else {
    updateRoute('/enter');
}

window.addEventListener('hashchange', onHashChange);
window.addEventListener('popstate', onPopState);

view();

// })();