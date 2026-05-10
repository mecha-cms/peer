// (() => {

const application = document.querySelector('[role=application]');

const applicationAside = createElement('aside');
const applicationFlex = createElement('div');
const applicationFooter = createElement('footer');
const applicationHeader = createElement('header');
const applicationMain = createElement('main');

let pageChunkDefault = 20,
    pagePartDefault = 1,
    pageType = false;

const formBlob = createElement('form', false, {
    'method': 'post'
});

const formFile = createElement('form', [
    createElement('div', createElement('textarea', "", {
        'name': 'content',
        'placeholder': 'Content goes here…'
    })),
    createElement('p', [
        createElement('input', false, {
            'name': 'name',
            'pattern': '([#.@_~]?[A-Za-z\\d]+([_.\\-][A-Za-z\\d]+)*)?\\.\\w+',
            'placeholder': 'foo-bar.baz',
            'style': 'flex:1;',
            'type': 'text'
        }),
        createElement('button', 'Save', {
            'name': 'task',
            'type': 'submit',
            'value': 'set'
        }),
        createElement('button', 'Delete', {
            'name': 'task',
            'type': 'submit',
            'value': 'let'
        })
    ], {
        'role': 'group'
    })
], {
    'method': 'post'
});

const formFolder = createElement('form', false, {
    'method': 'post'
});

const formSearch = createElement('form', createElement('input', false, {
    'name': 'query',
    'placeholder': 'Search…',
    'style': 'width:100%;',
}), {
    'method': 'post',
    'style': 'flex:1;'
});

const formUser = createElement('form', [
    createElement('p', createElement('input', false, {
        'name': 'key',
        'placeholder': 'User',
        'required': true,
        'type': 'text'
    })),
    createElement('p', createElement('input', false, {
        'name': 'pass',
        'placeholder': 'Pass',
        'required': true,
        'type': 'password'
    })),
    createElement('p', createElement('button', '🔓 Enter', {
        'type': 'submit'
    }), {
        'role': 'group'
    }),
    createElement('input', false, {
        'name': 'peer',
        'type': 'hidden',
        'value': 'YOUR_APPLICATION_ID'
    })
], {
    'method': 'post'
});

formUser.addEventListener('submit', function (e) {
    clearAlerts();
    let key,
        k = key = this.elements.key.value,
        pass = this.elements.pass.value,
        peer = this.elements.peer.value;
    // Force `@` prefix
    if ('@' !== key[0]) {
        key = '@' + key;
    }
    const info = createAlert('Logging in…', 'info');
    application.prepend(info);
    updateTitle('Logging in…', true, this);
    fetch(hub + '/enter', {
        body: JSON.stringify({ key, pass, peer }),
        headers: { 'content-type': 'application/json' },
        method: 'POST'
    }).then(r => r.json()).then(r => {
        this.reset();
        if (200 !== r.status) {
            updateAlert(info, r.description, 'error');
            updateTitle('Application · Error', false, this);
            this.reset();
            this.elements.key.value = k;
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
        let hash = "",
            path = '/lot/asset',
            query = {
                chunk: pageChunkDefault,
                part: pagePartDefault
            };
        updateTitle(false, false, this); // Remove `aria-busy` in the form
        onEnter(path, query, hash, function () {
            viewItems(path, query, hash, function () {
                application.prepend(createAlert('Logged in.', 'success'));
            });
        });
        updateRoute(toPath(path) + toQuery(query));
    }).catch(e => {
        updateAlert(info, e + "", 'error');
    });
    e.preventDefault();
});

function clearAlerts() {
    document.querySelectorAll('[role=alert]').forEach(v => v.remove());
}

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

function fromHash(hash) {
    return hash.slice(1);
}

function fromPath(path) {
    return path.slice(sub.length);
}

function fromQuery(query) {
    return Array.from(new URLSearchParams(query)).reduce((a, [k, v]) => {
        v = toValue(v);
        if ('[]' === k.slice(-2)) {
            if (!a[k = k.slice(0, -2)]) {
                a[k] = [];
            }
            a[k].push(v);
        } else {
            a[k] = v;
        }
        return a;
    }, {});
}

function fromValue(v) {
    return false === v ? 'false' : (null === v ? 'null' : (true === v ? 'true' : ('number' === typeof v ? v + "" : v)));
}

function toValue(v) {
    return 'false' === v ? false : ('null' === v ? null : ('true' === v ? true : ("" !== v && !Number.isNaN(Number(v)) ? +v : v)));
}

function toHash(hash) {
    return '#' + hash;
}

function toPath(path) {
    return sub + path;
}

function toQuery(lot) {
    return '?' + new URLSearchParams(Object.entries(lot).flatMap(([k, v]) => Array.isArray(v) ? v.map(vv => [k + '[]', fromValue(vv)]) : [[k, fromValue(v)]]));
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
        for (const [name, value] of Object.entries(attributes)) {
            if (false === value || null === value) {
                element.removeAttribute(name);
            } else {
                element.setAttribute(name, true === value ? name : value + "");
            }
        }
    }
    if (null === content) {
        element.replaceChildren();
    } else if (content instanceof Node) {
        element.replaceChildren(content);
    } else if (content instanceof Array || content instanceof HTMLCollection || content instanceof NodeList) {
        element.replaceChildren(...Array.from(content));
    } else if ('string' === typeof content) {
        element.innerHTML = content;
    }
    return element;
}

function updateTitle(text, busy, node) {
    text && (document.title = text);
    updateElement(node || document.documentElement, false, {
        'aria-busy': busy ? 'true' : false
    });
}

function updateRoute(route) {
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
        root.append(createLink(current === start ? start : current - 1, previous, 'prev', false, current === start));
    }
    if (first && last) {
        if (min > start) {
            root.append(createLink(start, start + "", 'prev', false, false));
            if (min > start + 1) {
                root.append(createDots());
            }
        }
        for (i = min; i <= max; ++i) {
            root.append(createLink(i, i + "", current >= i ? 'prev' : 'next', current === i, false));
        }
        if (max < end) {
            if (max < end - 1) {
                root.append(createDots());
            }
            root.append(createLink(end, end + "", 'next', false, false));
        }
    }
    if (next) {
        root.append(createLink(current === end ? end : current + 1, next, 'next', false, current === end));
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
            const a = createElement('a', v, {
                'aria-current': tracesMax === k + 1 ? 'location' : false,
                'href': toPath(trace.slice(1)) + toQuery({
                    chunk: pageChunkDefault,
                    part: pagePartDefault
                })
            });
            a.addEventListener('click', onClick);
            span.append('/', a);
        }
    });
    return span;
}

let abortController = new AbortController;

function f3h(path, method = 'GET', headers = {}, body = "", options = {}) {
    const token = localStorage.getItem('hub');
    headers = Object.assign({
        'authorization': 'bearer ' + token,
        'content-type': 'application/json'
    }, headers);
    return fetch(path, Object.assign({ headers, method }, options, 'GET' === method || 'HEAD' === method ? {} : { body }));
}

function loadCSS(href) {
    return new Promise((resolve, reject) => {
        const l = createElement('link', false, {
            'href': href,
            'rel': 'stylesheet'
        });
        l.onerror = () => reject(new Error('Failed to load ' + href));
        l.onload = resolve;
        document.head.append(l);
    });
}

function loadJS(src) {
    return new Promise((resolve, reject) => {
        const s = createElement('script', false, {
            'src': src
        });
        s.async = false; // Force execution in order
        s.onerror = () => reject(new Error('Failed to load ' + src));
        s.onload = resolve;
        document.head.append(s);
    });
}

let wasLoadCodeMirror5;
function loadCodeMirror5() {
    if (wasLoadCodeMirror5) {
        return Promise.resolve(window.CodeMirror);
    }
    const base = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16';
    const info = createAlert('Loading CodeMirror library…', 'info');
    application.prepend(info);
    return Promise.all([
        loadCSS(base + '/codemirror.min.css'),
        loadJS(base + '/codemirror.min.js'),
        // Order #1
        loadCSS(base + '/addon/scroll/simplescrollbars.min.css'),
        loadJS(base + '/addon/edit/closebrackets.min.js'),
        loadJS(base + '/addon/runmode/runmode.min.js'),
        loadJS(base + '/addon/scroll/simplescrollbars.min.js'),
        // Order #2
        loadJS(base + '/mode/clike/clike.min.js'),
        loadJS(base + '/mode/css/css.min.js'),
        loadJS(base + '/mode/javascript/javascript.min.js'),
        loadJS(base + '/mode/xml/xml.min.js'),
        // Order #3
        loadJS(base + '/mode/htmlmixed/htmlmixed.min.js'),
        loadJS(base + '/mode/php/php.min.js'),
        // Order #4
        loadJS(base + '/mode/markdown/markdown.min.js'),
        loadJS(base + '/mode/nginx/nginx.min.js'),
        loadJS(base + '/mode/yaml/yaml.min.js'),
        // Order #5
        loadJS(base + '/mode/yaml-frontmatter/yaml-frontmatter.min.js')
    ]).then(() => {
        wasLoadCodeMirror5 = true;
        if (!window.CodeMirror) {
            throw new Error('Error loading `CodeMirror` library!');
        }
        info.remove();
        return window.CodeMirror;
    }).catch(e => {
        updateAlert(info, e + "", 'error');
    });
}

let folders = {}, foldersPromise, wasLoadFolders;
function loadFolders() {
    if (wasLoadFolders && Object.keys(folders).length > 0) {
        return Promise.resolve(folders);
    }
    if (foldersPromise) {
        return foldersPromise;
    }
    foldersPromise = f3h(hub + '/at/lot?limit=9999&x=0').then(r => r.json()).then(r => {
        wasLoadFolders = true;
        return (folders = r);
    });
    return foldersPromise;
}

function onEnter(path, query, hash, then) {
    updateElement(application, [applicationHeader, applicationFlex, applicationFooter]);
    updateElement(applicationFlex, [applicationAside, applicationMain]);
    // Create file/folder button
    const createFile = createElement('button', '📄 File');
    const createFolder = createElement('button', '📁 Folder');
    createFile.addEventListener('click', function (e) {
        dialogFileNew.showModal();
        e.preventDefault();
    });
    createFolder.addEventListener('click', function (e) {
        dialogFolderNew.showModal();
        e.preventDefault();
    });
    // Exit button
    const exit = createElement('button', '🔒 Exit');
    exit.addEventListener('click', function (e) {
        localStorage.removeItem('hub');
        localStorage.removeItem('user');
        updateRoute(toPath('/enter')), view(onExitAfter);
        e.preventDefault();
    });
    // Folder navigation select-box
    const options = createElement('select', false, {
        'disabled': true
    });
    const value = path.split('/')[2] || "";
    let selected;
    loadFolders().then(r => {
        200 === r.status && r.data.children.map(v => {
            let icon = '📁',
                name = v.name,
                title = name[0].toUpperCase() + name.slice(1);
            if ('asset' === name) {
                icon = '🗂️';
            } else if ('cache' === name) {
                icon = '⏰';
            } else if ('comment' === name) {
                icon = '💬';
            } else if ('image' === name) {
                icon = '📷';
            } else if ('page' === name) {
                icon = '📑';
            } else if ('tag' === name) {
                icon = '🏷️';
            } else if ('trash' === name) {
                icon = '♻️';
            } else if ('user' === name) {
                icon = '👤';
            } else if ('x' === name) {
                icon = '🧩';
                title = 'Extension';
            } else if ('y' === name) {
                icon = '🎨';
                title = 'Layout';
            }
            v.icon = icon;
            v.title = title;
            return v;
        }).sort((a, b) => a.title.localeCompare(b.title)).forEach(v => {
            const option = createElement('option', v.icon + ' ' + v.title, {
                'selected': value === v.name ? "" : false,
                'value': v.name
            });
            if (!selected && value === v.name) {
                selected = option;
            }
            options.append(option);
        });
        if (!selected) {
            updateElement(options, [
                createElement('option', '⛔ System', {
                    'disabled': true,
                    'value': ""
                }),
                createElement('option', '🏠 Home', {
                    'value': 'asset'
                })
            ]);
            options.value = "";
        }
        options.disabled = false;
    }).catch(console.error);
    options.addEventListener('change', function (e) {
        updateRoute(toPath('/lot/' + this.value) + toQuery({
            chunk: pageChunkDefault,
            part: pagePartDefault
        })), view();
        e.preventDefault();
    });
    updateElement(applicationHeader, createElement('div', [options, createFile, createFolder, formSearch, exit], {
        'role': 'group',
        'style': 'display:flex;gap:0.5rem;'
    }));
    then && then.call(application);
}

function onExit(path, query, hash, then) {
    updateElement(application, null);
    updateTitle('Application · Enter');
    then && then.call(application);
    // Force to load the folder(s) again on enter
    folders = {};
    wasLoadFolders = false;
}

function onExitAfter(path, query, hash, then) {
    if (!localStorage.getItem('hub')) {
        application.prepend(createAlert('Logged out.', 'success'));
    }
    then && then.call(application);
}

function onClick(e) {
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
        application.prepend(createAlert(e + "", 'error'));
    });
}

function view(then) {
    abortController.abort();
    abortController = new AbortController;
    const hash = fromHash(window.location.hash);
    const path = fromPath(window.location.pathname);
    const query = fromQuery(window.location.search);
    if ('/enter' === path) {
        if (localStorage.getItem('hub')) {
            // TODO: Persistent enter state
            viewEnter(path, query, hash, then);
        } else {
            viewEnter(path, query, hash, then);
        }
    } else {
        onEnter(path, query, hash, function () {
            query.part ? viewItems(path, query, hash, then) : ('update' === hash ? viewItemFileEditorText(path, query, hash, then) : viewItem(path, query, hash, then));
        });
    }
}

function viewEnter(path, query, hash, then) {
    clearAlerts();
    pageType = false;
    onExit(path, query, hash, function () {
        application.append(formUser);
        then && then.call(application);
        formUser.elements.key.focus();
    });
}

function viewItem(path, query, hash, then) {
    clearAlerts();
    pageType = 'file';
    updateTitle('Loading…', true, applicationMain);
    const itemContent = createElement('code', 'Loading content…');
    f3h(hub + '/at' + path).then(r => r.json()).then(r => {
        console.table([{'Request':'GET','Response':r}]);
        // TODO: Handle stale token
        if (401 === r.status) {
            localStorage.removeItem('hub');
            localStorage.removeItem('user');
            updateRoute(toPath('/enter')), view(onExitAfter);
            return;
        }
        if (403 === r.status) {
            onExit(path, query, hash, function () {
                application.prepend(createAlert(r.description, 'error'));
            });
            updateTitle('Application · Forbidden');
            return;
        }
        if (404 === r.status) {
            onExit(path, query, hash, function () {
                application.prepend(createAlert(r.description, 'error'));
            });
            updateTitle('Application · Not Found');
            return;
        }
        updateElement(applicationMain, [
            createElement('h3', [
                '📄 ',
                createTracesFromString('.' + path)
            ]),
            createElement('pre', itemContent)
        ]);
        updateTitle('Application · File Viewer', false, applicationMain);
        if (r.data.is.text) {
            f3h(hub + '/%2B/content' + path).then(r => r.json()).then(r => {
                if (200 === r.status) {
                    let mode = r.data.type,
                        x = path.split('.').pop();
                    if ('less' === x) {
                        mode = 'text/x-less';
                    } else if ('scss' === x) {
                        mode = 'text/x-scss';
                    } else if (['markdown', 'md', 'txt'].includes(x) && '---\n' === r.data.content.slice(0, 4)) {
                        mode = {
                            base: 'text/' + ('txt' === x ? 'plain' : 'markdown'),
                            name: 'yaml-frontmatter'
                        };
                    }
                    console.log(mode);
                    itemContent.classList.add('cm-s', 'cm-s-default');
                    itemContent.textContent = r.data.content;
                    loadCodeMirror5().then(CodeMirror => {
                        CodeMirror.runMode(r.data.content, mode, itemContent);
                    }).catch(e => {
                        application.prepend(createAlert(e + "", 'error'));
                    });
                }
            });
        } else {
            if ('audio/' === r.data.type.slice(0, 6)) {
                console.log('load audio player');
            } else if ('image/' === r.data.type.slice(0, 6)) {
                console.log('load image viewer');
            } else if ('video/' === r.data.type.slice(0, 6)) {
                console.log('load video player');
            }
            itemContent.textContent = JSON.stringify(r, null, 2);
        }
    }).catch(e => {
        application.prepend(createAlert(e + "", 'error'));
        then && then.call(application);
    });
}

function viewItemFolderEditor(path, query, hash, then) {
    // TODO
}

function viewItemFileEditorText(path, query, hash, then) {
    clearAlerts();
    pageType = 'file';
    updateTitle('Loading…', true, applicationAside);
    const listItems = createElement('ul');
    f3h(hub + '/at' + path.slice(0, path.lastIndexOf('/')) + '?limit=9999&x=1').then(r => r.json()).then(r => {
        console.table([{'Request':'GET','Response':r}]);
        // TODO: Handle stale token
        if (401 === r.status) {
            return;
        }
        if (403 === r.status) {
            return;
        }
        if (404 === r.status) {
            return;
        }
        updateTitle(false, false, applicationAside); // Remove `aria-busy` in the form
        updateElement(applicationAside, [listItems]);
        let folderSizeViews = {};
        r.data.children.forEach(v => {
            const listItemLink = createElement('a', v.name + (v.is.file && v.x ? '.' + v.x : ""), {
                'aria-current': path === v.route ? 'page' : false,
                'href': v.is.blob ? hub + '/blob' + v.route : toPath(v.route) + (v.is.folder ? toQuery({
                    chunk: pageChunkDefault,
                    part: pagePartDefault
                }) : toHash('update')),
                'title': v.is.blob ? 'Open' : 'Edit'
            });
            const listItemSize = createElement('span', v.size ?? '…', {
                'role': 'status'
            });
            if (v.is.folder) {
                folderSizeViews[v.route] = listItemSize;
            }
            listItemLink.addEventListener('click', v.is.blob ? function (e) {
                openBlob(this.href);
                e.preventDefault();
            } : function (e) {
                listItems.querySelectorAll('li>a').forEach(v => updateElement(v, false, {
                    'aria-current': false
                }));
                updateElement(this, false, {
                    'aria-current': 'page'
                });
                updateTitle('Loading…', true, applicationMain);
                let fileRoute = fromPath(this.getAttribute('href')).slice(0, -7),
                    fileName = decodeURIComponent(fileRoute.split('/').pop());
                f3h(hub + '/%2B/content' + fileRoute).then(r => r.json()).then(r => {
                    // TODO: Handle stale token
                    if (401 === r.status) {
                        localStorage.removeItem('hub');
                        localStorage.removeItem('user');
                        updateRoute(toPath('/enter')), view(onExitAfter);
                        return;
                    }
                    if (200 === r.status) {
                        updateElement(applicationMain.querySelector('h3'), [
                            '📄 ',
                            createTracesFromString('.' + fileRoute)
                        ]);
                        updateTitle('Application · File Editor', false, applicationMain);
                        let mode = r.data.type,
                            x = fileName.split('.').pop();
                        if ('less' === x) {
                            mode = 'text/x-less';
                        } else if ('scss' === x) {
                            mode = 'text/x-scss';
                        } else if (['markdown', 'md', 'txt'].includes(x) && '---\n' === r.data.content.slice(0, 4)) {
                            mode = {
                                base: 'text/' + ('txt' === x ? 'plain' : 'markdown'),
                                name: 'yaml-frontmatter'
                            };
                        }
                        console.log(mode);
                        if (formFile.$c) {
                            formFile.$c.setOption('mode', mode);
                            formFile.$c.setValue(r.data.content);
                            formFile.$c.save();
                            formFile.$c.refresh();
                            formFile.$c.focus();
                        } else {
                            formFile.elements.content.value = r.data.content;
                            formFile.elements.content.focus();
                        }
                        formFile.elements.name.value = fileName;
                    } else {
                        updateTitle(false, false, applicationMain); // Remove `aria-busy`
                    }
                }).catch(e => {
                    application.prepend(createAlert(e + "", 'error'));
                });
                e.preventDefault();
            });
            listItems.append(createElement('li', [
                v.is.file ? '📄' : '📁',
                listItemLink,
                listItemSize
            ], {
                'data-name': v.name || "",
                'data-x': v.x || ""
            }));
        });
    }).catch(e => {
        application.prepend(createAlert(e + "", 'error'));
    });
    updateTitle('Loading…', true, applicationMain);
    f3h(hub + '/at' + path).then(r => r.json()).then(r => {
        console.table([{'Request':'GET','Response':r}]);
        // TODO: Handle stale token
        if (401 === r.status) {
            localStorage.removeItem('hub');
            localStorage.removeItem('user');
            updateRoute(toPath('/enter')), view(onExitAfter);
            return;
        }
        if (403 === r.status) {
            onExit(path, query, hash, function () {
                application.prepend(createAlert(r.description, 'error'));
            });
            updateTitle('Application · Forbidden');
            return;
        }
        if (404 === r.status) {
            onExit(path, query, hash, function () {
                application.prepend(createAlert(r.description, 'error'));
            });
            updateTitle('Application · Not Found');
            return;
        }
        // if (formFile.$c) {
        //     formFile.$c.toTextArea(); // Destroy!
        //     delete formFile.$c;
        // }
        // Use the previous `CodeMirror` instance
        formFile.elements.content.parentNode.style.display = r.data.is.text ? "" : 'none';
        formFile.elements.name.value = r.data.name + (r.data.x ? '.' + r.data.x : "");
        updateElement(applicationMain, [
            createElement('h3', [
                (r.data.is.file ? '📄' : '📁') + ' ',
                createTracesFromString('.' + path)
            ]),
            formFile
        ]);
        updateTitle('Application · File Editor', false, applicationMain);
        if (r.data.is.text) {
            formFile.elements.content.style.display = 'none';
            f3h(hub + '/%2B/content' + path).then(r => r.json()).then(r => {
                if (200 === r.status) {
                    let mode = r.data.type,
                        x = path.split('.').pop();
                    if ('less' === x) {
                        mode = 'text/x-less';
                    } else if ('scss' === x) {
                        mode = 'text/x-scss';
                    } else if (['markdown', 'md', 'txt'].includes(x) && '---\n' === r.data.content.slice(0, 4)) {
                        mode = {
                            base: 'text/' + ('txt' === x ? 'plain' : 'markdown'),
                            name: 'yaml-frontmatter'
                        };
                    }
                    console.log(mode);
                    formFile.elements.content.value = r.data.content;
                    if (formFile.$c) {
                        formFile.$c.setOption('mode', mode);
                        formFile.$c.setValue(formFile.elements.content.value);
                        formFile.$c.save();
                        formFile.$c.refresh();
                        formFile.$c.focus();
                    } else {
                        loadCodeMirror5().then(CodeMirror => {
                            formFile.$c = CodeMirror.fromTextArea(formFile.elements.content, {
                                autoCloseBrackets: true,
                                autofocus: true,
                                lineNumbers: true,
                                lineWrapping: false,
                                mode,
                                scrollbarStyle: 'simple',
                                viewportMargin: Infinity
                            });
                            formFile.$c.refresh();
                            formFile.addEventListener('submit', () => formFile.$c.save());
                            // If content is longer than the maximum height or width, move cursor to the start of the editor
                            formFile.$c.on('focus', function () {
                                let pane = formFile.$c.getScrollerElement(),
                                    maxRows = formFile.$c.lineCount(),
                                    moveToStart = maxRows > 45 || pane.scrollWidth > pane.clientWidth;
                                formFile.$c.setCursor(moveToStart ? 0 : maxRows, 0);
                                if (moveToStart) {
                                    formFile.$c.scrollTo(0, 0);
                                }
                            });
                        }).catch(e => {
                            application.prepend(createAlert(e + "", 'error'));
                            formFile.elements.content.style.display = "";
                            formFile.elements.content.focus();
                        });
                    }
                }
            }).catch(e => {
                application.prepend(createAlert(e + "", 'error'));
            });
        } else {}
    }).catch(e => {
        application.prepend(createAlert(e + "", 'error'));
        then && then.call(application);
    });
}

function viewItems(path, query, hash, then) {
    clearAlerts();
    pageType = 'folder';
    updateTitle('Loading…', true, applicationMain);
    const listItems = createElement('ul');
    f3h(hub + '/at' + path + '?chunk=' + query.chunk + '&part=' + query.part).then(r => r.json()).then(r => {
        console.table([{'Request':'GET','Response':r}]);
        if (400 === r.status) {
            updateElement(application, createAlert(r.description, 'error'));
            updateTitle('Application · Error', false, applicationMain);
            return;
        }
        // TODO: Handle stale token
        if (401 === r.status) {
            localStorage.removeItem('hub');
            localStorage.removeItem('user');
            updateRoute(toPath('/enter')), view(onExitAfter);
            return;
        }
        if (403 === r.status) {
            updateElement(application, createAlert(r.description, 'error'));
            updateTitle('Application · Forbidden', false, applicationMain);
            return;
        }
        if (404 === r.status) {
            updateElement(application, createAlert(r.description, 'error'));
            updateTitle('Application · Not Found', false, applicationMain);
            return;
        }
        let parent = r.data.parent;
        updateTitle('Application · Folder', false, applicationMain);
        updateElement(applicationAside, 'TODO');
        updateElement(applicationMain, [
            createElement('h3', [
                '📂 ',
                createTracesFromString('.' + path)
            ]),
            listItems
        ]);
        if (r.data.has.next || r.data.has.prev) {
            listItems.after(createElement('nav', [
                createPager(r.query.part, r.data.total, r.query.chunk, 2, function (part, current, disabled) {
                    if (current || disabled) {
                        this.addEventListener('click', e => e.preventDefault());
                    } else {
                        this.addEventListener('click', onClick);
                    }
                    this.href = toPath(r.data.route) + toQuery({
                        chunk: r.query.chunk,
                        part: part
                    });
                }, 'First', 'Previous', 'Next', 'Last')
            ], {
                'aria-label': 'Pagination'
            }));
        }
        if (parent) {
            parent.name = '..';
            r.data.children.unshift(parent);
        }
        let folderSizeViews = {};
        r.data.children.forEach(v => {
            const listItemLink = createElement('a', v.name + (v.is.file && v.x ? '.' + v.x : ""), {
                'href': v.is.blob ? hub + '/blob' + v.route : toPath(v.route) + (v.is.folder ? toQuery({
                    chunk: pageChunkDefault,
                    part: pagePartDefault
                }) : ""),
                'title': '..' === v.name ? 'Go to parent' : (v.is.blob ? 'Open' : 'View')
            });
            const listItemLinkDelete = createElement('a', '🗑️', {
                'href': toPath(v.route) + toHash('delete'),
                'title': 'Delete'
            });
            const listItemLinkEdit = createElement('a', '📝', {
                'href': toPath(v.route) + toHash('update'),
                'title': 'Edit'
            });
            const listItemLinkOpen = createElement('a', '🔍', {
                'href': listItemLink.href,
                'title': 'Open'
            });
            const listItemLinkView = createElement('a', '👁', {
                'href': hub + '/blob' + v.route,
                'title': 'View'
            });
            const listItemLinks = createElement('span', v.is.folder ? listItemLinkOpen : listItemLinkView, {
                'style': 'display:flex;gap:0.5em;justify-content:end;min-width:5em;'
            });
            if ('..' !== v.name) {
                listItemLinks.append(listItemLinkEdit, listItemLinkDelete);
            } else {
                listItemLinks.append(createElement('span', listItemLinkEdit.textContent, {
                    'aria-disabled': 'true'
                }), createElement('span', listItemLinkDelete.textContent, {
                    'aria-disabled': 'true'
                }));
            }
            const listItemSize = createElement('span', v.size ?? '…', {
                'role': 'status'
            });
            if (v.is.folder) {
                folderSizeViews[v.route] = listItemSize;
            }
            listItemLink.addEventListener('click', v.is.blob ? function (e) {
                openBlob(this.href);
                e.preventDefault();
            } : onClick);
            listItemLinkDelete.addEventListener('click', function (e) {
                f3h(hub + '/at' + fromPath(this.getAttribute('href')).slice(0, -7), 'DELETE').then(r => r.json()).then(r => {
                    console.table([{'Request':'DELETE','Response':r}]);
                    if (200 === r.status) {
                        viewItems(path, query, hash, function () {
                            application.prepend(createAlert(r.description, 'success'));
                        });
                    }
                }).catch(e => {
                    application.prepend(createAlert(e + "", 'error'));
                });
                e.preventDefault();
            });
            listItemLinkEdit.addEventListener('click', function (e) {
                let route = fromPath(this.getAttribute('href'));
                updateRoute(toPath(route)), viewItemFileEditorText(route.slice(0, -7));
                e.preventDefault();
            });
            listItemLinkOpen.addEventListener('click', function (e) {
                listItemLink.click();
                e.preventDefault();
            });
            listItemLinkView.addEventListener('click', v.is.blob ? function (e) {
                openBlob(this.href);
                e.preventDefault();
            } : function (e) {
                listItemLink.click();
                e.preventDefault();
            });
            listItems.append(createElement('li', [
                v.is.file ? '📄' : '📁',
                listItemLink,
                listItemSize,
                listItemLinks
            ], {
                'data-name': v.name || "",
                'data-x': v.x || ""
            }));
        });
        // Calculate folder size then view
        for (let route in folderSizeViews) {
            (() => {
                let listItemSize = folderSizeViews[route];
                if (!listItemSize.offsetHeight && !listItemSize.offsetWidth) {
                    return; // Hidden from view
                }
                f3h(hub + '/%2B/size' + route, 'GET', {}, "", { signal: abortController.signal }).then(r => r.json()).then(r => {
                    if (200 === r.status) {
                        listItemSize.innerHTML = r.data.size;
                    }
                }).catch(e => {});
            })();
        }
        then && then.call(application);
    }).catch(e => {
        application.prepend(createAlert(e + "", 'error'));
        then && then.call(application);
    });
}

if ('/' !== fromPath(window.location.pathname) || "" !== window.location.search) {} else {
    updateRoute(toPath('/enter'));
}

window.addEventListener('hashchange', onHashChange);
window.addEventListener('popstate', onPopState);

view();

let formFileNew, formFolderNew;

const dialogFileNew = createElement('dialog', formFileNew = createElement('form', [
    createElement('p', 'File name:'),
    createElement('p', [
        createElement('input', false, {
            'autofocus': true,
            'name': 'name',
            'pattern': '([#.@_~]?[A-Za-z\\d]+([_.\\-][A-Za-z\\d]+)*)?\\.\\w+',
            'placeholder': 'foo-bar.baz',
            'required': true,
            'type': 'text'
        }),
        createElement('button', 'Create', {
            'type': 'submit'
        }),
        createElement('button', 'Cancel', {
            'type': 'reset'
        })
    ], {
        'role': 'group'
    })
], {
    'method': 'dialog'
}));

const dialogFolderNew = createElement('dialog', formFolderNew = createElement('form', [
    createElement('p', 'Folder name or path:'),
    createElement('p', [
        createElement('input', false, {
            'autofocus': true,
            'name': 'name',
            'pattern': '([._]?[A-Za-z\\d]+([._\\-][A-Za-z\\d]+)*)([\\\\\\/][._]?[A-Za-z\\d]+([._\\-][A-Za-z\\d]+)*)*',
            'placeholder': 'foo/bar/baz',
            'required': true,
            'type': 'text'
        }),
        createElement('button', 'Create', {
            'type': 'submit'
        }),
        createElement('button', 'Cancel', {
            'type': 'reset'
        })
    ], {
        'role': 'group'
    })
], {
    'method': 'dialog'
}));

formFileNew.addEventListener('reset', function () {
    clearAlerts(), dialogFileNew.close();
});

formFileNew.addEventListener('submit', function (e) {
    clearAlerts();
    let path = fromPath(window.location.pathname);
    let nameParts = this.elements.name.value.split('.'),
        nameX = nameParts.pop();
    f3h(hub + '/at' + path, 'PUT', { 'content-type': 'application/json' }, JSON.stringify({
        content: "",
        name: nameParts.join('.'),
        x: nameX
    })).then(r => r.json()).then(r => {
        if (201 === r.status) {
            dialogFileNew.close();
            viewItems(path, {
                chunk: pageChunkDefault,
                part: pagePartDefault
            }, "", function () {
                console.table([{'Request':'PUT','Response':r}]);
                application.prepend(createAlert(r.description, 'success'));
                let newItem = applicationMain.querySelector('li[data-name="' + (r.data.name || "") + '"][data-x="' + (r.data.x || "") + '"]');
                newItem && updateElement(newItem, false, {
                    'aria-selected': 'true'
                });
            });
            this.reset();
        } else {
            dialogFileNew.prepend(createAlert(r.description, 'error'));
        }
    }).catch(console.error);
    e.preventDefault();
});

formFolderNew.addEventListener('reset', function () {
    clearAlerts(), dialogFolderNew.close();
});

formFolderNew.addEventListener('submit', function (e) {
    clearAlerts();
    let path = fromPath(window.location.pathname);
    let routeParts = this.elements.name.value.split('/'),
        routeName = routeParts.pop(),
        routeParent = routeParts.length ? routeParts.join('/') + '/' : "";
    f3h(hub + '/at' + path, 'PUT', { 'content-type': 'application/json' }, JSON.stringify({
        name: routeName,
        route: routeParent
    })).then(r => r.json()).then(r => {
        if (201 === r.status) {
            dialogFolderNew.close();
            updateRoute(toPath(path + '/' + routeParent + routeName) + toQuery({
                chunk: pageChunkDefault,
                part: pagePartDefault
            }));
            viewItems(path + '/' + routeParent + routeName, {
                chunk: pageChunkDefault,
                part: pagePartDefault
            }, "", function () {
                console.table([{'Request':'PUT','Response':r}]);
                application.prepend(createAlert(r.description, 'success'));
            });
            this.reset();
        } else {
            dialogFolderNew.prepend(createAlert(r.description, 'error'));
        }
    }).catch(console.error);
    e.preventDefault();
});

document.body.append(dialogFileNew, dialogFolderNew);

// })();