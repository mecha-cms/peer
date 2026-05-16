(() => {

// Replace the value with your RPC base URL
const hub = 'http://127.0.0.1/test/hub';

// This is an easy way to obtain relative base URL of the application conditionally. Simply put this `index.js` file in
// the same folder as the `index.html` file. Then, in the `index.html` file, load this file relative to the root domain:
//
//     <script src="/index.js"></script>
//
// If you have this application in a sub-folder, load this `index.js` file relative to that sub-folder:
//
//     <script src="/path/to/index.js"></script>
//
// That’s it.
const sub = toParent(document.currentScript.src).slice((window.location.protocol + '//' + window.location.hostname).length);

const application = document.querySelector('[role=application]');

const applicationAside = createElement('aside');
const applicationFlex = createElement('div');
const applicationFooter = createElement('footer');
const applicationHeader = createElement('header');
const applicationMain = createElement('main');

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
            'pattern': '([#+.@_~\\-]?[A-Za-z\\d]+([._\\-][A-Za-z\\d]+)*)?\\.[A-Za-z\\d]+',
            'placeholder': 'foo-bar.baz',
            'style': 'flex:1;',
            'type': 'text'
        }),
        createElement('button', 'Save', {
            'name': 'task',
            'type': 'submit',
            'value': 'patch'
        }),
        createElement('button', 'Delete', {
            'name': 'task',
            'type': 'submit',
            'value': 'delete'
        })
    ], {
        'role': 'group'
    })
], {
    'method': 'post'
});

const formFolder = createElement('form', [
    createElement('p', [
        createElement('input', false, {
            'name': 'name',
            'pattern': '([#+.@_~\\-]?[A-Za-z\\d]+([._\\-][A-Za-z\\d]+)*)',
            'placeholder': 'foo-bar',
            'style': 'flex:1;',
            'type': 'text'
        }),
        createElement('button', 'Save', {
            'name': 'task',
            'type': 'submit',
            'value': 'patch'
        }),
        createElement('button', 'Delete', {
            'name': 'task',
            'type': 'submit',
            'value': 'delete'
        })
    ], {
        'role': 'group'
    })
], {
    'method': 'post'
});

const formSearch = createElement('form', createElement('input', false, {
    'name': 'query',
    'placeholder': 'Search…',
    'style': 'width:100%;',
}), {
    'method': 'get',
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

let abort = new AbortController,
    activity = JSON.parse(localStorage.getItem('activity') || '[]'),
    cache = JSON.parse(localStorage.getItem('cache') || '{}'),
    mark = JSON.parse(localStorage.getItem('mark') || '{}'),
    sizes = {};

const q = fromQuery(window.location.search);

let pageChunkDefault = q.chunk ?? 20,
    pagePartDefault = q.part ?? 1,
    pageSortDefault = q.sort ?? null,
    pageType = false;

formFile.addEventListener('submit', function (e) {
    clearAlerts();
    let content = 'content' in this.elements ? this.elements.content.value : false,
        name = this.elements.name.value,
        path = fromPath(this.action, hub + '/at'),
        pathParent = toParent(path), query,
        task = this.getAttribute('data-task') || 'patch';
    if ('delete' === task) {
        loadJSON(this.action, 'DELETE').then(r => {
            if (200 === r.status) {
                deleteActivity(path, true);
                deleteMark(path);
                updateRoute(toPath(pathParent) + toQuery(query = {
                    chunk: pageChunkDefault,
                    part: pagePartDefault,
                    sort: pageSortDefault
                }));
                viewItems(pathParent, query, "", function () {
                    application.prepend(createAlert(r.description, 'success'));
                });
            }
        }).catch(e => {
            application.prepend(createAlert(e + "", 'error'));
        });
    } else if ('patch' === task) {
        this.$ && this.$.save(); // From `CodeMirror` instance
        console.info('PATCH');
    } else {
        // Bad request!
    }
    pathParent.split('/').map((x, i, r) => r.slice(0, i + 1).join('/')).forEach(s => {
        "" !== s && (delete sizes[s]);
    });
    e.preventDefault();
});

formFile.querySelectorAll('[type=submit]').forEach(v => {
    v.addEventListener('click', function () {
        this.form.setAttribute('data-task', this.value);
    });
});

formFolder.addEventListener('submit', function (e) {
    clearAlerts();
    let name = this.elements.name.value,
        path = fromPath(this.action, hub + '/at'),
        pathParent = toParent(path),
        task = this.getAttribute('data-task') || 'patch';
    if ('delete' === task) {
        loadJSON(this.action, 'DELETE').then(r => {
            if (200 === r.status) {
                deleteActivity(path, true);
                deleteMark(path);
                updateRoute(toPath(pathParent) + toQuery(query = {
                    chunk: pageChunkDefault,
                    part: pagePartDefault,
                    sort: pageSortDefault
                }));
                viewItems(pathParent, query, "", function () {
                    application.prepend(createAlert(r.description, 'success'));
                });
            }
        }).catch(e => {
            application.prepend(createAlert(e + "", 'error'));
        });
    } else if ('patch' === task) {
        console.info('PATCH');
    } else {
        // Bad request!
    }
    pathParent.split('/').map((x, i, r) => r.slice(0, i + 1).join('/')).forEach(s => {
        "" !== s && (delete sizes[s]);
    });
    e.preventDefault();
});

formFolder.querySelectorAll('[type=submit]').forEach(v => {
    v.addEventListener('click', function () {
        this.form.setAttribute('data-task', this.value);
    });
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
    updateBusyState(true, this);
    updateTitle('Logging in…');
    loadJSON(hub + '/enter', 'POST', { 'content-type': 'application/json' }, { key, pass, peer }).then(r => {
        this.reset();
        if (200 !== r.status) {
            updateAlert(info, r.description, 'error');
            updateBusyState(false, this);
            updateTitle('Application · Error');
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
        let hash = "",
            path = '/lot/asset',
            query = {
                chunk: pageChunkDefault,
                part: pagePartDefault,
                sort: pageSortDefault
            };
        updateBusyState(false, this);
        onEnter(path, query, hash, function () {
            viewItems(path, query, hash, onEnterAfter);
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

function createList(items, path, query, hash) {
    const list = createElement('ul');
    items.forEach(v => {
        const link = createElement('a', v.name + (v.is.file && v.x ? '.' + v.x : ""), {
            'href': /* v.is.blob ? hub + '/blob' + v.route : */toPath(v.route) + (v.is.folder ? toQuery({
                chunk: pageChunkDefault,
                part: pagePartDefault,
                sort: pageSortDefault
            }) : ""),
            'title': '..' === v.name ? 'Go to ' + toParent(v.route) : (v.is.blob || v.is.folder ? 'Open' : 'View') + ' ' + v.route
        });
        link.addEventListener('click', /* v.is.blob ? function (e) {
            openBlob(this.href);
            e.preventDefault();
        } : */onClick);
        const linkDelete = createElement('a', '🗑️', {
            'href': toPath(v.route) + toHash('delete'),
            'title': 'Delete ' + v.route
        });
        linkDelete.addEventListener('click', function (e) {
            let pathToDelete = fromPath(this.getAttribute('href')).slice(0, -7);
            loadJSON(hub + '/at' + pathToDelete, 'DELETE').then(r => {
                if (200 === r.status) {
                    deleteActivity(pathToDelete, true);
                    deleteMark(pathToDelete);
                    viewItems(path, query, hash, function () {
                        // application.prepend(createAlert(r.description, 'success'));
                    });
                }
            }).catch(e => {
                application.prepend(createAlert(e + "", 'error'));
            });
            e.preventDefault();
        });
        const linkEdit = createElement('a', '📝', {
            'href': toPath(v.route) + toHash('patch'),
            'title': 'Edit ' + v.route
        });
        linkEdit.addEventListener('click', function (e) {
            let route = fromPath(this.getAttribute('href'));
            updateRoute(toPath(route));
            viewItem(route.split('#').shift(), {}, 'patch');
            e.preventDefault();
        });
        const linkOpen = createElement('a', '🔍', {
            'href': link.href,
            'title': 'Open ' + v.route
        });
        linkOpen.addEventListener('click', function (e) {
            link.click();
            e.preventDefault();
        });
        const linkView = createElement('a', '👁', {
            'href': hub + '/blob' + v.route,
            'title': 'View ' + v.route
        });
        linkView.addEventListener('click', v.is.blob ? function (e) {
            openBlob(this.href);
            e.preventDefault();
        } : function (e) {
            link.click();
            e.preventDefault();
        });
        const links = createElement('span', v.is.folder ? linkOpen : linkView, {
            'style': 'display:flex;gap:0.5em;justify-content:end;min-width:5em;'
        });
        if ('..' !== v.name) {
            links.append(linkEdit, linkDelete);
        } else {
            links.append(v.route.slice(1).includes('/') ? linkEdit : createElement('span', linkEdit.textContent, {
                'aria-disabled': 'true'
            }), createElement('span', linkDelete.textContent, {
                'aria-disabled': 'true'
            }));
        }
        if (!sizes[v.route]) {
            sizes[v.route] = createElement('span', v.size ?? '…', {
                'role': 'status'
            });
            ((size, node, route) => {
                if (size) {
                    return;
                }
                loadJSON(hub + '/size' + route, 'GET', {}, "", { signal: abort.signal }).then(r => {
                    if (200 === r.status) {
                        node.innerHTML = r.data.size;
                    }
                }).catch(e => {
                    delete sizes[route];
                });
            })(v.size, sizes[v.route], v.route);
        }
        list.append(createElement('li', [
            v.is.file ? '📄' : '📁',
            link,
            sizes[v.route],
            links
        ], {
            'aria-selected': mark[v.route] ? 'true' : false
        }));
    });
    return list;
}

function createListOfActivity() {
    if (!activity.length) {
        return createElement('p', 'None', {
            'role': 'status'
        });
    }
    const current = fromPath(window.location.pathname);
    const list = createElement('ul');
    activity.forEach(v => {
        const link = createElement('a', v.name + (v.is.file && v.x ? '.' + v.x : ""), {
            'aria-current': current === v.route ? 'page' : false,
            'href': v.is.blob ? hub + '/blob' + v.route : toPath(v.route) + (v.is.folder ? toQuery({
                chunk: pageChunkDefault,
                part: pagePartDefault,
                sort: pageSortDefault
            }) : ""),
            'title': (v.is.blob || v.is.folder ? 'Open' : 'View') + ' ' + v.route
        });
        link.addEventListener('click', onClick);
        list.append(createElement('li', [v.is.file ? '📄' : '📁', link], {
            'aria-selected': mark[v.route] ? 'true' : false
        }));
    });
    return list;
}

function createListOfWork(items, patch) {
    if (!items.length) {
        return createElement('p', 'None', {
            'role': 'status'
        });
    }
    const current = fromPath(window.location.pathname);
    const list = createElement('ul');
    items.forEach(v => {
        const link = createElement('a', v.name + (v.is.file && v.x ? '.' + v.x : ""), {
            'aria-current': current === v.route ? 'page' : false,
            'href': toPath(v.route) + (patch ? toHash('patch') : ""),
            'title': (patch ? 'Edit' : 'View') + ' ' + v.route
        });
        link.addEventListener('click', function (e) {
            list.querySelectorAll('li>a').forEach(v => updateElement(v, false, {
                'aria-current': false
            }));
            updateElement(this, false, {
                'aria-current': 'page'
            });
            updateBusyState(true, applicationMain);
            updateRoute(this.getAttribute('href'));
            updateTitle('Loading…');
            let base, path = fromPath(this.getAttribute('href'));
            if (patch) {
                path = path.slice(0, -6);
            }
            base = decodeURIComponent(toBase(path));
            loadJSON(hub + '/content' + path).then(r => {
                updateBusyState(false, applicationMain);
                if (400 === r.status) {
                    application.prepend(createAlert(r.status + ': ' + r.description, 'error'));
                    updateTitle('Application · Bad Request');
                    return;
                }
                // TODO: Handle stale token
                if (401 === r.status) {
                    localStorage.removeItem('hub');
                    updateRoute(toPath('/enter')), view(onStaleAfter);
                    return;
                }
                if (200 === r.status) {
                    updateActivity(path, Object.assign({
                        is: {
                            blob: false,
                            file: true,
                            folder: false
                        },
                        name: base.split('.').slice(0, -1).join('.'),
                        route: path,
                        x: base.split('.').pop()
                    }, r.data));
                    updateElement(applicationMain.querySelector('h3'), [
                        '📄 ',
                        createTraces('.' + path)
                    ]);
                    updateTitle('Application · File ' + (patch ? 'Editor' : 'Viewer'));
                    let mode = r.data.type,
                        x = base.split('.').pop();
                    if (['less', 'scss'].includes(x)) {
                        mode = 'css';
                    } else if (['markdown', 'md', 'txt'].includes(x) && '---\n' === r.data.content.slice(0, 4)) {
                        mode = {
                            base: 'txt' === x ? 'null' : 'markdown',
                            name: 'yaml-frontmatter'
                        };
                    } else if (['yaml', 'yml'].includes(x)) {
                        mode = 'yaml';
                    }
                    if (patch) {
                        formFile.action = hub + '/at' + path;
                        if (formFile.$) {
                            formFile.$.setOption('mode', mode);
                            formFile.$.setValue(r.data.content);
                            formFile.$.save();
                            formFile.$.refresh();
                            formFile.$.focus();
                        } else {
                            formFile.elements.content.value = r.data.content;
                            formFile.elements.content.focus();
                        }
                        formFile.elements.name.value = base;
                    } else {
                        const content = applicationMain.querySelector('pre>code');
                        content.classList.add('cm-s', 'cm-s-default');
                        content.textContent = r.data.content;
                        loadCodeMirror5().then(CodeMirror => {
                            CodeMirror.runMode(r.data.content, mode, content);
                            content.focus();
                        }).catch(e => {
                            application.prepend(createAlert(e + "", 'error'));
                        });
                    }
                } else {}
            }).catch(e => {
                application.prepend(createAlert(e + "", 'error'));
            });
            e.preventDefault();
        });
        list.append(createElement('li', [v.is.file ? '📄' : '📁', link], {
            'aria-selected': mark[v.route] ? 'true' : false
        }));
    });
    return list;
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

function createText(content) {
    return document.createTextNode(content);
}

function createTraces(path) {
    const span = createElement('span');
    let trace = '/',
        traces = path.split('/'),
        tracesMax = traces.length;
    traces.forEach((v, k) => {
        if (0 === k) {
            span.append(createElement('span', v));
        } else {
            trace += '/' + (v = decodeURIComponent(v));
            const a = createElement('a', v, {
                'aria-current': tracesMax === k + 1 ? 'location' : false,
                'href': toPath(trace.slice(1)) + (tracesMax === k + 1 ? "" : toQuery({
                    chunk: pageChunkDefault,
                    part: pagePartDefault,
                    sort: pageSortDefault
                }))
            });
            a.addEventListener('click', onClick);
            span.append('/', a);
        }
    });
    return span;
}

function deleteActivity(route, deep) {
    for (let i = activity.length - 1; i >= 0; --i) {
        if (route === activity[i].route) {
            activity.splice(i, 1);
        }
        if (deep && 0 === (activity[i].route + '/').indexOf(route + '/')) {
            activity.splice(i, 1);
        }
    }
}

function deleteMark(route) {
    delete mark[route];
}

function fromHash(hash) {
    return hash.slice(1);
}

function fromPath(path, base) {
    return path.slice((base || sub).length);
}

function fromQuery(query) {
    return Array.from(new URLSearchParams(query)).reduce((a, [k, v]) => {
        v = toValue(v);
        let key = "", keys = [];
        for (const c of k) {
            if ('[' === c) {
                keys.push(key);
                key = "";
            } else if (']' !== c) {
                key += c;
            }
        }
        keys.push(key);
        let parent, parentKey, ref = a;
        for (let i = 0, j = keys.length; i < j; ++i) {
            let k = keys[i],
                last = i === j - 1,
                next = keys[i + 1],
                numeric = ("" + +k) === k;
            // Convert array to object if non-numeric key is used
            if (Array.isArray(ref) && !numeric && "" !== k) {
                let o = Object.assign({}, ref);
                if (parent) {
                    parent[parentKey] = o;
                } else {
                    a = o;
                }
                ref = o;
            }
            if (last) {
                ref[Array.isArray(ref) && numeric ? +k : k] = v;
            } else {
                if (!(k in ref)) {
                    ref[k] = "" === next || ("" + +next) === next ? [] : {};
                }
                parent = ref;
                parentKey = k;
                ref = ref[k];
            }
        }
        return a;
    }, {});
}

function fromValue(v) {
    return false === v ? 'false' : (null === v ? 'null' : (true === v ? 'true' : ('number' === typeof v ? v + "" : v)));
}

function f3h(path, method = 'GET', headers = {}, body = "", options = {}) {
    if ('string' !== typeof body) {
        body = JSON.stringify(body);
    }
    const token = localStorage.getItem('hub');
    headers = Object.assign({
        'authorization': 'bearer ' + token,
        'content-type': 'application/json'
    }, headers);
    return fetch(path, Object.assign({ headers, method }, options, 'GET' === method || 'HEAD' === method ? {} : { body }));
}

function loadCodeMirror5() {
    if (window.CodeMirror) {
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
        if (!window.CodeMirror) {
            throw new Error('Error loading `CodeMirror` library!');
        }
        info.remove();
        return window.CodeMirror;
    }).catch(e => {
        updateAlert(info, e + "", 'error');
    });
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

let folders = [], foldersPromise;
function loadFolders() {
    if (folders.length) {
        return Promise.resolve(folders);
    }
    if (foldersPromise) {
        return foldersPromise;
    }
    foldersPromise = loadJSON(hub + '/at/lot' + toQuery({
        limit: false,
        x: 0
    })).then(r => {
        return (folders = r.data.children);
    });
    return foldersPromise;
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

function loadJSON(path, method = 'GET', headers = {}, body = "", options = {}) {
    return f3h(path, method, headers, body, options).then(r => r.json().then(r => {
        console.groupCollapsed('🌐 ' + method + ' ' + path);
        if ('GET' === method && path.includes('?')) {
            console.log('📤', fromQuery(path.split('?').pop()));
        } else if (body) {
            console.log('📤', body);
        }
        console.log('📥', r);
        console.groupEnd();
        return r;
    }));
}

function loadVLiteJS() {
    if (window.Vlitejs) {
        return Promise.resolve(window.Vlitejs);
    }
    const info = createAlert('Loading VLiteJS library…', 'info');
    application.prepend(info);
    return Promise.all([
        loadCSS('https://cdn.jsdelivr.net/npm/vlitejs@6/dist/vlite.css'),
        new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.type = 'module';
            script.textContent = `
                import Vlitejs from 'https://cdn.jsdelivr.net/npm/vlitejs@6/+esm';
                window.Vlitejs = Vlitejs;
                window.dispatchEvent(new Event('vlitejs:loaded'));
            `;
            window.addEventListener('vlitejs:loaded', () => {
                resolve(window.Vlitejs);
            }, { once: true });
            script.onerror = reject;
            document.head.append(script);
        })
    ]).then(() => {
        info.remove();
        return window.Vlitejs;
    }).catch(e => {
        updateAlert(info, e + '', 'error');
    });
}

function onBeforeUnload() {
    localStorage.setItem('activity', JSON.stringify(activity));
    localStorage.setItem('cache', JSON.stringify(cache));
    localStorage.setItem('mark', JSON.stringify(mark));
}

function onClick(e) {
    updateRoute(this.href), view();
    e.preventDefault();
}

function onEnter(path, query, hash, then) {
    updateBusyState(false, applicationAside);
    updateBusyState(false, applicationMain);
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
        updateRoute(toPath('/enter')), view(onExitAfter);
        e.preventDefault();
    });
    // Folder navigation select-box
    const options = createElement('select', false, {
        'aria-busy': 'true',
        'disabled': true
    });
    const value = path.split('/')[2] || "";
    let selected;
    updateBusyState(true, options);
    loadFolders().then(items => {
        items.map(v => {
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
                icon = '🌄';
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
                    'data-home': 1,
                    'value': 'asset'
                })
            ]);
            options.value = "";
        }
        options.disabled = false;
        updateBusyState(false, options);
    }).catch(e => {
        application.prepend(createAlert(e + "", 'error'));
    });
    options.addEventListener('change', function (e) {
        let path = '/lot/' + this.value, query;
        updateRoute(toPath(path) + toQuery(query = {
            chunk: pageChunkDefault,
            part: pagePartDefault,
            sort: pageSortDefault
        }));
        if (this.options[this.selectedIndex].getAttribute('data-home')) {
            // Refresh option(s)
            onEnter(path, query, "", function () {
                viewItems(path, query);
            });
        } else {
            viewItems(path, query);
        }
        e.preventDefault();
    });
    updateElement(applicationHeader, createElement('div', [options, createFile, createFolder, formSearch, exit], {
        'role': 'group',
        'style': 'display:flex;gap:0.5rem;'
    }));
    then && then.call(application);
}

function onEnterAfter(path, query, hash, then) {
    application.prepend(createAlert('Logged in.', 'success'));
    then && then.call(application);
}

function onExit(path, query, hash, then) {
    activity = [];
    cache = {};
    folders = [];
    localStorage.removeItem('activity');
    localStorage.removeItem('cache');
    localStorage.removeItem('mark');
    mark = {};
    updateElement(application, null);
    updateTitle('Application · Enter');
    then && then.call(application);
}

function onExitAfter(path, query, hash, then) {
    application.prepend(createAlert('Logged out.', 'success'));
    then && then.call(application);
}

function onHashChange() {
    view();
}

function onPopState() {
    view();
}

function onStaleAfter(path, query, hash, then) {
    application.prepend(createAlert('Stale token.', 'error'));
    then && then.call(application);
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

function toBase(path) {
    return path.split('/').pop();
}

function toHash(hash) {
    return '#' + hash;
}

function toParent(path) {
    let last = path.lastIndexOf('/');
    return -1 !== last ? path.slice(0, last) : "";
}

function toPath(path) {
    return sub + path;
}

function toQuery(lot) {
    return '?' + new URLSearchParams(Object.entries(lot).flatMap(([k, v]) => null === v ? [] : Array.isArray(v) ? v.filter(vv => null !== vv).map(vv => [k + '[]', fromValue(vv)]) : [[k, fromValue(v)]]));
}

function toValue(v) {
    return 'false' === v ? false : ('null' === v ? null : ('true' === v ? true : ("" !== v && !Number.isNaN(Number(v)) ? +v : v)));
}

function updateActivity(route, r) {
    deleteActivity(route);
    activity.unshift(r);
    if (activity.length > pageChunkDefault - 1) {
        activity.pop();
    }
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

function updateBusyState(busy, node) {
    updateElement(node || document.documentElement, false, {
        'aria-busy': busy ? 'true' : false
    })
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

function updateMark(route) {
    mark[route] = 1;
}

function updateRoute(route) {
    window.history.pushState({}, "", route);
}

function updateTitle(text, busy) {
    document.title = text;
}

function view(then) {
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
            query.part ? viewItems(path, query, hash, then) : viewItem(path, query, hash, then);
        });
    }
}

function viewEnter(path, query, hash, then) {
    abort.abort();
    abort = new AbortController;
    clearAlerts();
    pageType = false;
    onExit(path, query, hash, function () {
        application.append(formUser);
        then && then.call(application);
        formUser.elements.key.focus();
    });
}

function viewItem(path, query, hash, then) {
    abort.abort();
    abort = new AbortController;
    clearAlerts();
    deleteMark(path);
    pageType = 'file';
    updateBusyState(true, applicationAside);
    updateBusyState(true, applicationMain);
    updateTitle('Loading…');
    loadJSON(hub + '/at' + path).then(r => {
        if ('patch' === hash && ![400, 401, 403, 404].includes(r.status)) {
            if (r.data.is.folder) {
                return viewItemFolderEditor(path, query, hash, then);
            }
            if (r.data.is.text) {
                return viewItemFileEditorText(path, query, hash, then);
            }
            application.prepend(createAlert('No editor is available for the <code>' + r.data.type + '</code> resource type.', 'error'));
            updateBusyState(false, applicationAside);
            updateBusyState(false, applicationMain);
            updateTitle('Application · Forbidden');
            return;
        }
        let type = r.data?.type || "";
        loadJSON(hub + '/at' + toParent(path) + toQuery({
            limit: false,
            x: 1 // List file(s) only
        })).then(r => {
            updateBusyState(false, applicationAside);
            if ([400, 401, 403, 404].includes(r.status)) {
                return;
            }
            updateElement(applicationAside, [
                createElement('h6', 'Work'),
                createListOfWork(r.data.children.filter(v => (type || "").split('/').shift() === (v.type || "").split('/').shift()))
            ]);
        }).catch(e => {
            application.prepend(createAlert(e + "", 'error'));
        });
        updateBusyState(false, applicationMain);
        if (400 === r.status) {
            application.prepend(createAlert(r.status + ': ' + r.description, 'error'));
            updateTitle('Application · Bad Request');
            return;
        }
        // TODO: Handle stale token
        if (401 === r.status) {
            localStorage.removeItem('hub');
            updateRoute(toPath('/enter')), view(onStaleAfter);
            return;
        }
        if (403 === r.status) {
            onExit(path, query, hash, function () {
                application.prepend(createAlert(r.status + ': ' + r.description, 'error'));
            });
            updateTitle('Application · Forbidden');
            return;
        }
        if (404 === r.status) {
            onExit(path, query, hash, function () {
                application.prepend(createAlert(r.status + ': ' + r.description, 'error'));
            });
            updateTitle('Application · Not Found');
            return;
        }
        const content = createElement('code', 'Loading content…', {
            'tabindex': 0
        });
        updateActivity(r.data.route, r.data);
        updateElement(applicationMain, [
            createElement('h3', [
                '📄 ',
                createTraces('.' + path)
            ]),
            createElement('pre', content)
        ]);
        updateTitle('Application · File Viewer');
        if (r.data.is.text) {
            loadJSON(hub + '/content' + path).then(r => {
                if (200 === r.status) {
                    let mode = r.data.type,
                        x = path.split('.').pop();
                    if (['less', 'scss'].includes(x)) {
                        mode = 'css';
                    } else if (['markdown', 'md', 'txt'].includes(x) && '---\n' === r.data.content.slice(0, 4)) {
                        mode = {
                            base: 'txt' === x ? 'null' : 'markdown',
                            name: 'yaml-frontmatter'
                        };
                    } else if (['yaml', 'yml'].includes(x)) {
                        mode = 'yaml';
                    }
                    content.classList.add('cm-s', 'cm-s-default');
                    content.textContent = r.data.content;
                    loadCodeMirror5().then(CodeMirror => {
                        CodeMirror.runMode(r.data.content, mode, content);
                        content.focus();
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
                content.style.display = 'none';
                const video = createElement('video', false, {
                    'src': toParent(hub) + r.data.route
                });
                content.before(video);
                loadVLiteJS().then(Vlitejs => {
                    new Vlitejs(video);
                }).catch(e => {});
                return;
            }
            content.textContent = JSON.stringify(r, null, 2);
        }
    }).catch(e => {
        application.prepend(createAlert(e + "", 'error'));
    }).finally(() => {
        then && then.call(application);
    });
}

function viewItemFileEditorText(path, query, hash, then) {
    abort.abort();
    abort = new AbortController;
    clearAlerts();
    deleteMark(path);
    pageType = 'file';
    updateBusyState(true, applicationAside);
    updateBusyState(true, applicationMain);
    updateTitle('Loading…');
    loadJSON(hub + '/at' + path).then(r => {
        loadJSON(hub + '/at' + toParent(path) + toQuery({
            limit: false,
            x: 1 // List file(s) only
        })).then(r => {
            updateBusyState(false, applicationAside);
            if ([400, 401, 403, 404].includes(r.status)) {
                return;
            }
            updateElement(applicationAside, [
                createElement('h6', 'Work'),
                createListOfWork(r.data.children.filter(v => v.is.text), true)
            ]);
        }).catch(e => {
            application.prepend(createAlert(e + "", 'error'));
        });
        updateBusyState(false, applicationMain);
        if (400 === r.status) {
            application.prepend(createAlert(r.status + ': ' + r.description, 'error'));
            updateTitle('Application · Bad Request');
            return;
        }
        // TODO: Handle stale token
        if (401 === r.status) {
            localStorage.removeItem('hub');
            updateRoute(toPath('/enter')), view(onStaleAfter);
            return;
        }
        if (403 === r.status) {
            onExit(path, query, hash, function () {
                application.prepend(createAlert(r.status + ': ' + r.description, 'error'));
            });
            updateTitle('Application · Forbidden');
            return;
        }
        if (404 === r.status) {
            onExit(path, query, hash, function () {
                application.prepend(createAlert(r.status + ': ' + r.description, 'error'));
            });
            updateTitle('Application · Not Found');
            return;
        }
        formFile.action = hub + '/at' + path;
        formFile.elements.content.parentNode.style.display = r.data.is.text ? "" : 'none';
        formFile.elements.name.value = r.data.name + (r.data.x ? '.' + r.data.x : "");
        updateActivity(r.data.route, r.data);
        updateElement(applicationMain, [
            createElement('h3', [
                '📄 ',
                createTraces('.' + path)
            ]),
            formFile
        ]);
        updateTitle('Application · File Editor');
        if (r.data.is.text) {
            formFile.elements.content.style.display = 'none';
            loadJSON(hub + '/content' + path).then(r => {
                if (200 === r.status) {
                    updateActivity(path, Object.assign({
                        is: {
                            blob: false,
                            file: true,
                            folder: false
                        },
                        name: toBase(path).split('.').slice(0, -1).join('.'),
                        route: path,
                        x: path.split('.').pop()
                    }, r.data));
                    let mode = r.data.type,
                        x = path.split('.').pop();
                    if (['less', 'scss'].includes(x)) {
                        mode = 'css';
                    } else if (['markdown', 'md', 'txt'].includes(x) && '---\n' === r.data.content.slice(0, 4)) {
                        mode = {
                            base: 'txt' === x ? 'null' : 'markdown',
                            name: 'yaml-frontmatter'
                        };
                    } else if (['yaml', 'yml'].includes(x)) {
                        mode = 'yaml';
                    }
                    formFile.elements.content.value = r.data.content;
                    if (formFile.$) {
                        formFile.$.setOption('mode', mode);
                        formFile.$.setValue(formFile.elements.content.value);
                        formFile.$.save();
                        formFile.$.refresh();
                        formFile.$.focus();
                    } else {
                        loadCodeMirror5().then(CodeMirror => {
                            formFile.$ = CodeMirror.fromTextArea(formFile.elements.content, {
                                autoCloseBrackets: true,
                                autofocus: true,
                                lineNumbers: true,
                                lineWrapping: false,
                                mode,
                                scrollbarStyle: 'simple',
                                viewportMargin: Infinity
                            });
                            formFile.$.refresh();
                            // If content is longer than the maximum height or width, move cursor to the start of the editor
                            formFile.$.on('focus', function () {
                                let pane = formFile.$.getScrollerElement(),
                                    maxRows = formFile.$.lineCount(),
                                    moveToStart = maxRows > 45 || pane.scrollWidth > pane.clientWidth;
                                formFile.$.setCursor(moveToStart ? 0 : maxRows, 0);
                                if (moveToStart) {
                                    formFile.$.scrollTo(0, 0);
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
    }).finally(() => {
        then && then.call(application);
    });
}

function viewItemFolderEditor(path, query, hash, then) {
    abort.abort();
    abort = new AbortController;
    clearAlerts();
    deleteMark(path);
    pageType = 'folder';
    updateBusyState(true, applicationAside);
    updateBusyState(true, applicationMain);
    updateTitle('Loading…');
    loadJSON(hub + '/at' + path).then(r => {
        loadJSON(hub + '/at' + toParent(path) + toQuery({
            limit: false,
            x: 0 // List folder(s) only
        })).then(r => {
            updateBusyState(false, applicationAside);
            if ([400, 401, 403, 404].includes(r.status)) {
                return;
            }
            updateElement(applicationAside, [
                createElement('h6', 'Work'),
                createListOfWork(r.data.children)
            ]);
        }).catch(e => {
            application.prepend(createAlert(e + "", 'error'));
        });
        updateBusyState(false, applicationMain);
        if (400 === r.status) {
            application.prepend(createAlert(r.status + ': ' + r.description, 'error'));
            updateTitle('Application · Bad Request');
            return;
        }
        // TODO: Handle stale token
        if (401 === r.status) {
            localStorage.removeItem('hub');
            updateRoute(toPath('/enter')), view(onStaleAfter);
            return;
        }
        if (403 === r.status) {
            onExit(path, query, hash, function () {
                application.prepend(createAlert(r.status + ': ' + r.description, 'error'));
            });
            updateTitle('Application · Forbidden');
            return;
        }
        if (404 === r.status) {
            onExit(path, query, hash, function () {
                application.prepend(createAlert(r.status + ': ' + r.description, 'error'));
            });
            updateTitle('Application · Not Found');
            return;
        }
        formFolder.action = hub + '/at' + path;
        formFolder.elements.name.value = r.data.name;
        updateActivity(r.data.route, r.data);
        updateElement(applicationMain, [
            createElement('h3', [
                '📁 ',
                createTraces('.' + path)
            ]),
            formFolder
        ]);
        updateTitle('Application · Folder Editor');
    }).catch(e => {
        application.prepend(createAlert(e + "", 'error'));
        then && then.call(application);
    });
}

function viewItems(path, query, hash, then) {
    abort.abort();
    abort = new AbortController;
    clearAlerts();
    deleteMark(path);
    pageType = 'folder';
    updateBusyState(true, applicationAside);
    updateBusyState(true, applicationMain);
    updateTitle('Loading…');
    loadJSON(hub + '/at' + path + toQuery({
        chunk: query.chunk,
        part: query.part,
        query: query.query || null,
        sort: query.sort || null
    })).then(r => {
        updateBusyState(false, applicationAside);
        updateBusyState(false, applicationMain);
        if (400 === r.status) {
            application.prepend(createAlert(r.status + ': ' + r.description, 'error'));
            updateTitle('Application · Bad Request');
            return;
        }
        // TODO: Handle stale token
        if (401 === r.status) {
            localStorage.removeItem('hub');
            updateRoute(toPath('/enter')), view(onStaleAfter);
            return;
        }
        if (403 === r.status) {
            onExit(path, query, hash, function () {
                application.prepend(createAlert(r.status + ': ' + r.description, 'error'));
            });
            updateTitle('Application · Forbidden');
            return;
        }
        if (404 === r.status) {
            onExit(path, query, hash, function () {
                application.prepend(createAlert(r.status + ': ' + r.description, 'error'));
            });
            updateTitle('Application · Not Found');
            return;
        }
        let parent = r.data.parent;
        if (parent) {
            parent.name = '..';
            r.data.children.unshift(parent); // Add “parent” link on top of the file and folder list
        }
        updateElement(applicationAside, [
            createElement('h6', 'Activity'),
            createListOfActivity()
        ]);
        // Special case for the file and folder list view, update activity log after activity list is built so that
        // current location will not be visible as the first item on the list until the user moves to another activity
        updateActivity(r.data.route, r.data);
        updateElement(applicationMain, [
            createElement('h3', [
                '📂 ',
                createTraces('.' + path)
            ]),
            createList(r.data.children, path, query, hash),
            r.data.has.next || r.data.has.prev ? createElement('nav', [
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
            }) : ""
        ]);
        updateTitle('Application · Folder');
    }).catch(e => {
        application.prepend(createAlert(e + "", 'error'));
    }).finally(() => {
        then && then.call(application);
    });
}

if ('/' !== fromPath(window.location.pathname) || "" !== window.location.search) {} else {
    updateRoute(toPath('/enter'));
}

window.addEventListener('hashchange', onHashChange);
window.addEventListener('beforeunload', onBeforeUnload);
window.addEventListener('popstate', onPopState);

let formFileNew, formFolderNew;

const dialogFileNew = createElement('dialog', formFileNew = createElement('form', [
    createElement('p', 'File name:'),
    createElement('p', [
        createElement('input', false, {
            'autofocus': true,
            'name': 'name',
            'pattern': '([#+.@_~\\-]?[A-Za-z\\d]+([._\\-][A-Za-z\\d]+)*)?\\.[A-Za-z\\d]+',
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
            'pattern': '([#+.@_~\\-]?[A-Za-z\\d]+([._\\-][A-Za-z\\d]+)*)(/([#+.@_~\\-]?[A-Za-z\\d]+([._\\-][A-Za-z\\d]+)*))*',
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
    loadJSON(hub + '/at' + path, 'PUT', {}, {
        content: "",
        name: nameParts.join('.'),
        x: nameX
    }).then(r => {
        if (201 === r.status) {
            dialogFileNew.close();
            updateActivity(r.data.route, r.data);
            updateMark(r.data.route);
            viewItems(path, {
                chunk: pageChunkDefault,
                part: pagePartDefault,
                sort: pageSortDefault
            });
            this.reset();
        } else {
            dialogFileNew.prepend(createAlert(r.status + ': ' + r.description, 'error'));
        }
    }).catch(e => {
        application.prepend(createAlert(e + "", 'error'));
    });
    e.preventDefault();
});

formFolderNew.addEventListener('reset', function () {
    clearAlerts(), dialogFolderNew.close();
});

formFolderNew.addEventListener('submit', function (e) {
    clearAlerts();
    let path = fromPath(window.location.pathname);
    let route = this.elements.name.value,
        routeName = toBase(route),
        routeSub = toParent(route);
    loadJSON(hub + '/at' + path, 'PUT', {}, {
        name: routeName,
        sub: routeSub
    }).then(r => {
        if (201 === r.status) {
            dialogFolderNew.close();
            route.split('/').map((x, i, r) => r.slice(0, i + 1).join('/')).forEach(s => {
                updateMark(path + '/' + s);
            });
            updateRoute(toPath(path + '/' + route) + toQuery({
                chunk: pageChunkDefault,
                part: pagePartDefault,
                sort: pageSortDefault
            }));
            viewItems(path + '/' + route, {
                chunk: pageChunkDefault,
                part: pagePartDefault,
                sort: pageSortDefault
            });
            this.reset();
        } else {
            dialogFolderNew.prepend(createAlert(r.status + ': ' + r.description, 'error'));
        }
    }).catch(e => {
        application.prepend(createAlert(e + "", 'error'));
    });
    e.preventDefault();
});

document.body.append(dialogFileNew, dialogFolderNew);

view();

})();