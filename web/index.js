(() => {

// Replace the value to `false` in case you want to use this application example in public, for whatever the reason(s)
const test = true;

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
const sub = toRelative(toParent(document.currentScript.src));

const application = document.querySelector('[role=application]');

const applicationAside = createElement('aside', false, { 'aria-busy': 'true' });
const applicationFlex = createElement('div');
const applicationFooter = createElement('footer');
const applicationHeader = createElement('header', false, { 'aria-busy': 'true' });
const applicationMain = createElement('main', false, { 'aria-busy': 'true' });

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

let currentChunk = q.chunk ?? 20,
    currentPart = q.part ?? 1,
    currentQuery = q.query ?? null,
    currentSort = q.sort ?? null;

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
                    chunk: currentChunk,
                    part: currentPart,
                    sort: currentSort
                }));
                viewItems(pathParent, query, "", function () {
                    application.prepend(createAlert(r.description, 'success'));
                });
            }
        }).catch(e => {
            viewError(path, { _description: e + "" });
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
                    chunk: currentChunk,
                    part: currentPart,
                    sort: currentSort
                }));
                viewItems(pathParent, query, "", function () {
                    application.prepend(createAlert(r.description, 'success'));
                });
            }
        }).catch(e => {
            viewError(path, { _description: e + "" });
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

formSearch.addEventListener('submit', function (e) {
    console.log(this.elements.query.value);
    e.preventDefault();
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
                chunk: currentChunk,
                part: currentPart,
                sort: currentSort
            };
        updateBusyState(false, this);
        onEnter(path, query, hash, function () {
            viewItems(path, query, hash, onEnterAfter);
        });
        updateRoute(toPath(path) + toQuery(query) + toHash(hash));
    }).catch(e => {
        updateAlert(info, e + "", 'error');
    });
    e.preventDefault();
});

function clearAlerts() {
    document.querySelectorAll('[role=alert]').forEach(v => v.remove());
}

function createAlert(text, type, timeOut) {
    // Hub response description(s) are written using simple Markdown syntax (at most there will only be Markdown syntax
    // in the form of bold, code, italic, and link). Below is a very minimal Markdown parser. When you want to build a
    // serious application, you may want to load a proper Markdown parser to replace this one.
    text = text.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
    text = text.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');
    text = text.replace(/`(.*?)`/g, '<code>$1</code>');
    text = text.replace(/\[(.*?)\]\((\S+)(?:\s+(?:"(.*?)"|'(.*?)'))?\)/g, function ($0, $1, $2, $3, $4) {
        return '<a href="' + $2 + '"' + ($3 || $4 ? ' title="' + ($3 || $4) + '"' : "") + '>' + $1 + '</a>';
    });
    const element = createElement('p', text, {
        'aria-live': 'error' === type ? 'assertive' : ('info' === type ? 'off' : ('success' === type ? 'polite' : false)),
        'role': 'alert'
    });
    if (timeOut) {
        window.setTimeout(() => element.remove(), timeOut);
    }
    return element;
}

// Runs before `GET /hub/content/*`
function createEditorMain(r) {
    let {is, name, route, type, x} = r.data;
    updateTitle('Application · ' + (is.file ? 'File' : 'Folder') + ' Editor');
    // File
    if (is.file) {
        formFile.action = hub + '/at' + route;
        formFile.elements.name.value = name + (x ? '.' + x : "");
        updateBusyState(true, applicationMain);
        updateElement(applicationMain, [
            createElement('h3', [
                '📄 ',
                createTraces('.' + route)
            ]),
            formFile
        ]);
        if (is.text) {
            loadJSON(hub + '/content' + route).then(r => {
                // Already has `CodeMirror` instance
                if (application.$) {
                    Object.assign(r.data, { is, name, route, x });
                    return updateEditorMain(r);
                }
                if (200 !== r.status) {
                    return viewError(route, { _description: r.status + ': ' + r.description });
                }
                let $, content = r.data.content,
                    mode = type;
                formFile.elements.content.style.display = 'none';
                formFile.elements.content.value = content;
                if (['less', 'scss'].includes(x)) {
                    mode = 'css';
                } else if (['markdown', 'md', 'txt'].includes(x) && '---\n' === content.slice(0, 4)) {
                    mode = {
                        base: 'txt' === x ? 'null' : 'markdown',
                        name: 'yaml-frontmatter'
                    };
                } else if (['yaml', 'yml'].includes(x)) {
                    mode = 'yaml';
                }
                loadCodeMirror5().then(CodeMirror => {
                    $ = CodeMirror.fromTextArea(formFile.elements.content, {
                        autoCloseBrackets: true,
                        autofocus: true,
                        // Pressing `Shift-Tab` or `Tab` will exit from the editor. Use `Control-]` to increase current
                        // indentation and `Control-[` to decrease it.
                        extraKeys: {
                            'Shift-Tab': false,
                            'Tab': false
                        },
                        lineNumbers: true,
                        lineWrapping: false,
                        mode,
                        scrollbarStyle: 'simple',
                        viewportMargin: Infinity
                    });
                    $.refresh();
                    // If content is longer than the maximum height or width, move cursor to the start of the editor
                    function onFocusOnce() {
                        let pane = $.getScrollerElement(),
                            maxRows = $.lineCount(),
                            moveToStart = maxRows > 45 || pane.scrollWidth > pane.clientWidth;
                        $.setCursor(moveToStart ? 0 : maxRows, 0);
                        if (moveToStart) {
                            $.scrollTo(0, 0);
                        }
                        $.off('focus', onFocusOnce);
                    }
                    $.on('focus', onFocusOnce);
                    application.$ = $;
                }).catch(e => {
                    application.prepend(createAlert(e + "", 'error'));
                    formFile.elements.content.style.display = "";
                    formFile.elements.content.focus();
                });
            }).catch(e => {
                viewError(path, { _description: e + "" });
            }).finally(() => {
                updateBusyState(false, applicationMain);
            });
        } else {
            viewErrorEditor(path, { _type: type }, hash);
        }
    // Folder
    } else {
        formFolder.action = hub + '/at' + route;
        formFolder.elements.name.value = name;
        updateBusyState(false, applicationMain);
        updateElement(applicationMain, [
            createElement('h3', [
                '📁 ',
                createTraces('.' + route)
            ]),
            formFolder
        ]);
    }
}

function createElement(name, content, attributes) {
    return updateElement(document.createElement(name), content, attributes);
}

function createListMain(r) {
    let {data, query} = r,
        {children, has, parent, route, total} = data;
    updateTitle('Application · Folder');
    if (parent) {
        parent.name = '..';
        children.unshift(parent); // Add “parent” link on top of the file and folder list
    }
    updateActivity(route, data);
    updateElement(applicationMain, [
        createElement('h3', [
            '📂 ',
            createTraces('.' + route)
        ]),
        createListOfMain(children),
        has.next || has.prev ? createElement('nav', [
            createPager(query.part, total, query.chunk, 2, function (part, current, disabled) {
                this.addEventListener('click', current || disabled ? (e => e.preventDefault()) : function (e) {
                    loadJSON(hub + '/at' + fromPath(toRelative(this.href))).then(createListMain).catch(e => {
                        viewError(route, { _description: r.status + ': ' + r.description });
                    }).finally(() => {
                        updateBusyState(false, applicationMain);
                        updateTitle('Application · Folder');
                    });
                    updateBusyState(true, applicationMain);
                    updateRoute(this.href);
                    updateTitle('Loading…');
                    e.preventDefault();
                });
                this.href = toPath(route) + toQuery({
                    chunk: currentChunk,
                    part: part,
                    query: currentQuery,
                    sort: currentSort
                });
            }, 'First', 'Previous', 'Next', 'Last')
        ], {
            'aria-label': 'Pagination'
        }) : ""
    ]);
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
        let {is, name, route, x} = v;
        const link = createElement('a', name + (is.file && x ? '.' + x : ""), {
            'aria-current': current === route ? 'page' : false,
            'href': is.blob ? hub + '/blob' + route : toPath(route) + (is.folder ? toQuery({
                chunk: currentChunk,
                part: 1
            }) : ""),
            'title': (is.folder ? 'Open' : 'View') + ' ' + route
        });
        link.addEventListener('click', onClick);
        list.append(createElement('li', [is.file ? '📄' : '📁', link], {
            'aria-selected': mark[route] ? 'true' : false
        }));
    });
    return list;
}

function createListOfMain(items) {
    const list = createElement('ul');
    items.forEach(v => {
        let {is, name, route, size, x} = v;
        const link = createElement('a', name + (is.file && x ? '.' + x : ""), {
            'href': toPath(route) + (is.folder ? toQuery({
                chunk: currentChunk,
                part: 1
            }) : ""),
            'title': '..' === name ? 'Go to ' + toParent(route) : (is.folder ? 'Open' : 'View') + ' ' + route
        });
        link.addEventListener('click', onClick);
        const linkDelete = createElement('a', '🗑️', {
            'href': toPath(route) + toHash('delete'),
            'title': 'Delete ' + route
        });
        linkDelete.addEventListener('click', function (e) {
            let hash = fromHash(window.location.hash),
                path = fromPath(window.location.pathname),
                pathToDelete = fromPath(toRelative(this.href)).slice(0, -7),
                query = fromQuery(window.location.search);
            loadJSON(hub + '/at' + pathToDelete, 'DELETE').then(r => {
                if (200 !== r.status) {
                    return viewError(path, { _description: r.status + ': ' + r.description }, hash);
                }
                deleteActivity(pathToDelete, true);
                deleteMark(pathToDelete);
                viewItems(path, query, hash, function () {
                    // application.prepend(createAlert(r.description, 'success'));
                });
            }).catch(e => {
                viewError(path, { _description: e + "" }, hash);
            });
            e.preventDefault();
        });
        const linkEdit = createElement('a', '📝', {
            'href': toPath(route) + toHash('patch'),
            'title': 'Edit ' + route
        });
        linkEdit.addEventListener('click', function (e) {
            let pathToEdit = fromPath(toRelative(this.href));
            updateRoute(toPath(pathToEdit));
            pathToEdit = pathToEdit.slice(0, -6); // Remove `#patch`
            viewItem(pathToEdit, {}, 'patch');
            e.preventDefault();
        });
        const linkOpen = createElement('a', '🔍', {
            'href': link.href,
            'title': 'Open ' + route
        });
        linkOpen.addEventListener('click', function (e) {
            link.click();
            e.preventDefault();
        });
        const linkView = createElement('a', '👁', {
            'href': hub + '/blob' + route,
            'title': 'View ' + route
        });
        linkView.addEventListener('click', function (e) {
            link.click();
            e.preventDefault();
        });
        const links = createElement('span', is.folder ? linkOpen : linkView, {
            'style': 'display:flex;gap:0.5em;justify-content:end;min-width:5em;'
        });
        if ('..' !== name) {
            links.append(linkEdit, linkDelete);
        } else {
            links.append(route.slice(1).includes('/') ? linkEdit : createElement('span', linkEdit.textContent, {
                'aria-disabled': 'true'
            }), createElement('span', linkDelete.textContent, {
                'aria-disabled': 'true'
            }));
        }
        if (!sizes[route]) {
            sizes[route] = createElement('span', size ?? '…', {
                'role': 'status'
            });
            ((size, node, route) => {
                !size && loadJSON(hub + '/size' + route, 'GET', {}, "", { signal: abort.signal }).then(r => {
                    200 === r.status && (node.innerHTML = r.data.size);
                }).catch(e => {
                    delete sizes[route];
                });
            })(size, sizes[route], route);
        }
        list.append(createElement('li', [
            is.file ? '📄' : '📁',
            link,
            sizes[route],
            links
        ], {
            'aria-selected': mark[route] ? 'true' : false
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
        let {is, name, route, type, x} = v;
        const link = createElement('a', name + (is.file && x ? '.' + x : ""), {
            'aria-current': current === route ? 'page' : false,
            'data-is-text': is.text ? 'true' : false,
            'data-type': type ?? 'folder',
            'href': toPath(route) + (patch ? toHash('patch') : ""),
            'title': (patch ? 'Edit' : 'View') + ' ' + route
        });
        link.addEventListener('click', function (e) {
            list.querySelectorAll('li>a').forEach(v => updateElement(v, false, {
                'aria-current': false
            }));
            updateElement(this, false, {
                'aria-current': 'page'
            });
            updateBusyState(true, applicationMain);
            updateRoute(this.href);
            updateTitle('Loading…');
            let base, route = fromPath(toRelative(this.href)),
                type = this.getAttribute('data-type');
            if (patch) {
                route = route.slice(0, -6);
            }
            base = decodeURIComponent(toBase(route));
            if (patch) {
                if ('folder' === this.getAttribute('data-type')) {
                    loadJSON(hub + '/at' + route + toQuery({
                        limit: 0 // Do not fetch children to quickly capture the resource status
                    })).then(r => {
                        if ([400, 404].includes(r.status)) {
                            return viewError(route, { _description: r.status + ': ' + r.description });
                        }
                        // TODO: Handle stale token
                        if (401 === r.status) {
                            localStorage.removeItem('hub');
                            updateRoute(toPath('/enter')), view(onStaleAfter);
                            return;
                        }
                        updateActivity(route, r.data);
                        updateEditorMain(r);
                    }).catch(e => {
                        viewError(route, { _description: e + "" });
                    }).finally(() => {
                        updateBusyState(false, applicationMain);
                    });
                } else if (this.getAttribute('data-is-text')) {
                    loadJSON(hub + '/content' + route).then(r => {
                        if ([400, 404, 415].includes(r.status)) {
                            return viewError(route, { _description: r.status + ': ' + r.description });
                        }
                        // TODO: Handle stale token
                        if (401 === r.status) {
                            localStorage.removeItem('hub');
                            updateRoute(toPath('/enter')), view(onStaleAfter);
                            return;
                        }
                        // The data returned from `/hub/content/*` is not as complete as the data returned from
                        // `/hub/at/*` because the main focus of the former is to fetch the content. Most application(s)
                        // should not fetch it directly; instead, it should be fetched after the `/hub/at/*` data has
                        // been fetched, so that the data from the earlier fetch can be used to make the result of the
                        // later fetch look complete
                        Object.assign(r.data, {
                            is: {
                                blob: false,
                                file: true,
                                folder: false,
                                text: true
                            },
                            name: -1 !== base.indexOf('.') ? base.split('.').slice(0, -1).join('.') : base,
                            route,
                            x: -1 !== base.indexOf('.') ? base.split('.').pop() : null
                        });
                        updateActivity(route, r.data);
                        updateEditorMain(r);
                    }).catch(e => {
                        viewError(route, { _description: e + "" });
                    }).finally(() => {
                        updateBusyState(false, applicationMain);
                    });
                } else {
                    viewErrorEditor(route, { _type: type });
                }
            } else {
                loadJSON(hub + '/at' + route).then(r => {
                    if ([400, 415].includes(r.status)) {
                        return viewError(route, { _description: r.status + ': ' + r.description });
                    }
                    // TODO: Handle stale token
                    if (401 === r.status) {
                        localStorage.removeItem('hub');
                        updateRoute(toPath('/enter')), view(onStaleAfter);
                        return;
                    }
                    updateActivity(route, r.data);
                    updateViewMain(r);
                }).catch(e => {
                    viewError(route, { _description: e + "" });
                }).finally(() => {
                    updateBusyState(false, applicationMain);
                });
            }
            e.preventDefault();
        });
        list.append(createElement('li', [is.file ? '📄' : '📁', link], {
            'aria-selected': mark[route] ? 'true' : false
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
                    chunk: currentChunk,
                    part: 1
                }))
            });
            a.addEventListener('click', onClick);
            span.append('/', a);
        }
    });
    return span;
}

function createViewMain(r) {
    let {is, route, type, x} = r.data,
        view = createElement('div');
    updateElement(applicationMain, [
        createElement('h3', [
            '📄 ',
            createTraces('.' + route)
        ]),
        view
    ]);
    updateTitle('Application · ' + (is.file ? 'File' : 'Folder') + ' Viewer');
    if (is.file) {
        updateBusyState(true, applicationMain);
        if (is.text) {
            loadJSON(hub + '/content' + route).then(r => {
                if (200 !== r.status) {
                    return viewError(route, { _description: r.status + ': ' + r.description });
                }
                let content = r.data.content,
                    mode = type;
                if (['less', 'scss'].includes(x)) {
                    mode = 'css';
                } else if (['markdown', 'md', 'txt'].includes(x) && '---\n' === content.slice(0, 4)) {
                    mode = {
                        base: 'txt' === x ? 'null' : 'markdown',
                        name: 'yaml-frontmatter'
                    };
                } else if (['yaml', 'yml'].includes(x)) {
                    mode = 'yaml';
                }
                let code, codeParent = createElement('pre', code = createElement('code', "", {
                    'class': 'cm-s cm-s-default',
                    'tabindex': 0
                }));
                loadCodeMirror5().then(CodeMirror => {
                    CodeMirror.runMode(content, mode, code);
                    code.focus();
                }).catch(e => {
                    viewError(route, { _description: e + "" });
                });
                updateBusyState(false, applicationMain);
                updateElement(view, codeParent);
            });
        } else if ('audio/' === type.slice(0, 6)) {
            const audio = createElement('audio', false, {
                'controls': true
            });
            updateElement(view, audio);
            f3h(hub + '/blob' + route).then(r => r.blob()).then(blob => {
                let revoke, v;
                revoke = function () {
                    URL.revokeObjectURL(v);
                    audio.removeEventListener('error', revoke);
                    audio.removeEventListener('loadeddata', revoke);
                    updateBusyState(false, applicationMain);
                };
                audio.addEventListener('error', revoke, { once: true });
                audio.addEventListener('loadeddata', revoke, { once: true });
                audio.src = v = URL.createObjectURL(blob);
            });
            audio.focus();
        } else if ('image/' === type.slice(0, 6)) {
            const image = createElement('img', false, {
                'alt': "",
                'tabindex': 0
            });
            updateElement(view, image);
            f3h(hub + '/blob' + route).then(r => r.blob()).then(blob => {
                let revoke, v;
                revoke = function () {
                    URL.revokeObjectURL(v);
                    image.removeEventListener('error', revoke);
                    image.removeEventListener('load', revoke);
                    updateBusyState(false, applicationMain);
                };
                image.addEventListener('error', revoke, { once: true });
                image.addEventListener('load', revoke, { once: true });
                image.src = v = URL.createObjectURL(blob);
            });
            image.focus();
        } else if ('video/' === type.slice(0, 6)) {
            const video = createElement('video', false, {
                'controls': true
            });
            updateElement(view, video);
            f3h(hub + '/blob' + route).then(r => r.blob()).then(blob => {
                let revoke, v;
                revoke = function () {
                    URL.revokeObjectURL(v);
                    updateBusyState(false, applicationMain);
                    video.removeEventListener('error', revoke);
                    video.removeEventListener('loadeddata', revoke);
                };
                video.addEventListener('error', revoke, { once: true });
                video.addEventListener('loadeddata', revoke, { once: true });
                video.src = v = URL.createObjectURL(blob);
            });
            video.focus();
        } else {
            updateBusyState(false, applicationMain);
            viewErrorView(toPath(route), { _type: type });
        }
    } else {
        viewErrorView(toPath(route), { _type: type });
    }
}

function deleteActivity(route, deep) {
    for (let i = activity.length - 1; i >= 0; --i) {
        const current = activity[i].route;
        if (route === current || (deep && 0 === (current + '/').indexOf(route + '/'))) {
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

function fromQuery(query, parseValue = true, defaultValue = true) {
    if ('?' === query[0]) {
        query = query.slice(1);
    }
    if ("" === query) {
        return {};
    }
    let r = {};
    query.split('&').forEach(q => {
        let current = r,
            i = q.indexOf('='),
            key = "", keys = [],
            [k, v] = -1 === i ? [q] : [q.slice(0, i), q.slice(i + 1)];
        k = decodeURIComponent(k);
        if ('undefined' === typeof v) {
            v = defaultValue;
        } else {
            v = decodeURIComponent(v);
            v = parseValue ? toValue(v) : v;
        }
        for (const s of k) {
            if ('[' === s) {
                keys.push(decodeURIComponent(key));
                key = "";
            } else if (']' !== s) {
                key += s;
            }
        }
        keys.push(decodeURIComponent(key));
        for (let i = 0, j = keys.length; i < j; ++i) {
            let k = keys[i],
                next = keys[i + 1];
            if ("" === k) {
                k = Object.keys(current).length + "";
            }
            if (j - 1 === i) {
                current[k] = v;
            } else {
                if (!(k in current)) {
                    current[k] = {};
                }
                current = current[k];
            }
        }
    });
    return fromQueryObject(r);
}

function fromQueryObject(o) {
    if (!o || 'object' !==  typeof o) {
        return o;
    }
    for (const k in o) {
        o[k] = fromQueryObject(o[k]);
    }
    const keys = Object.keys(o);
    if (keys.length && keys.every((k, i) => i + "" === k)) {
        return keys.map(k => o[k]);
    }
    return o;
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

function loadBlob(link) {
    return f3h(link).then(r => {
        if (!r.ok) {
            throw new Error('Request failed.');
        }
        return r.blob();
    });
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
        limit: 'false',
        x: 0 // List folder(s) only
    })).then(r => {
        folders = r.data?.children ?? [];
        if (!folders.length) {
            foldersPromise = false;
        }
        return folders;
    }).catch(e => {
        folderPromise = false;
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
        if (test) {
            console.groupCollapsed('🌐 ' + method + ' ' + path);
            if ('GET' === method && path.includes('?')) {
                console.log('📤', fromQuery(path.split('?').pop()));
            } else if (body) {
                console.log('📤', body);
            }
            console.log('📥', r);
            console.groupEnd();
        }
        return r;
    }));
}

function loadMediaElement7() {
    if (window.MediaElementPlayer) {
        return Promise.resolve(window.MediaElementPlayer);
    }
    const base = 'https://cdnjs.cloudflare.com/ajax/libs/mediaelement/7.0.2';
    const info = createAlert('Loading MediaElement.js library…', 'info');
    application.prepend(info);
    return Promise.all([
        loadCSS(base + '/mediaelementplayer.min.css'),
        loadJS(base + '/mediaelement-and-player.min.js')
    ]).then(() => {
        if (!window.MediaElementPlayer) {
            throw new Error('Error loading `MediaElement` library!');
        }
        info.remove();
        return window.MediaElementPlayer;
    }).catch(e => {
        updateAlert(info, e + "", 'error');
    });
}

function onBeforeUnload() {
    localStorage.setItem('activity', JSON.stringify(activity));
    localStorage.setItem('cache', JSON.stringify(cache));
    localStorage.setItem('mark', JSON.stringify(mark));
}

function onClick(e) {
    updateBusyState(true, applicationAside);
    updateBusyState(true, applicationMain);
    updateRoute(this.href), view();
    e.preventDefault();
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
        updateRoute(toPath('/enter')), view(onExitAfter);
        e.preventDefault();
    });
    // Folder navigation select-box
    const options = createElement('select');
    const value = path.split('/')[2] || "";
    let selected;
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
    }).catch(e => {
        application.prepend(createAlert(e + "", 'error'));
    });
    options.addEventListener('change', function (e) {
        let path = '/lot/' + this.value, query;
        updateRoute(toPath(path) + toQuery(query = {
            chunk: currentChunk,
            part: 1
        }));
        updateBusyState(true, applicationAside);
        updateBusyState(true, applicationMain);
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
    folderPromise = false;
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
    folderPromise = false;
    folders = [];
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
    folderPromise = false;
    folders = [];
    then && then.call(application);
}

function openBlob(link) {
    loadBlob(link).then(blob => {
        let v = URL.createObjectURL(blob);
        window.open(v, '_blank');
        setTimeout(() => URL.revokeObjectURL(v), 1000);
    }).catch(e => {
        // TODO
    });
}

function toBase(path) {
    return path.split('/').pop();
}

function toHash(hash) {
    return hash ? '#' + hash : "";
}

function toParent(path) {
    let last = path.lastIndexOf('/');
    return -1 !== last ? path.slice(0, last) : "";
}

function toPath(path) {
    return sub + path;
}

function toQuery(object, path = "", r = []) {
    if (false === object || null === object) {} else if (true === object) {
        r.push(path);
    } else if (Array.isArray(object)) {
        for (let i = 0, j = object.length; i < j; ++i) {
            if (i in object) {
                toQuery(object[i], path + encodeURIComponent('[]'), r);
            }
        }
    } else if ('object' === typeof object) {
        for (const k of Object.keys(object)) {
            toQuery(object[k], path ? path + encodeURIComponent('[' + k + ']') : encodeURIComponent(k), r);
        }
    } else {
        r.push(path + '=' + encodeURIComponent(fromValue(object)));
    }
    return r.length ? '?' + r.join('&') : null;
}

function toRelative(absolute) {
    if ('/' === absolute[0]) {
        return absolute;
    }
    return absolute.slice((window.location.protocol + '//' + window.location.hostname).length);
}

function toValue(v) {
    return 'false' === v ? false : ('null' === v ? null : ('true' === v ? true : ("" !== v && !Number.isNaN(Number(v)) ? +v : v)));
}

function updateActivity(route, r) {
    deleteActivity(route);
    activity.unshift(r);
    if (activity.length > currentChunk - 1) {
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

// Runs after `GET /hub/content/*`
function updateEditorMain(r) {
    let {content, is, name, route, type, x} = r.data;
    updateTitle('Application · ' + (is.file ? 'File' : 'Folder') + ' Editor');
    // File
    if (is.file) {
        formFile.action = hub + '/at' + route;
        formFile.elements.name.value = name + (x ? '.' + x : "");
        updateElement(applicationMain, [
            createElement('h3', [
                '📄 ',
                createTraces('.' + route)
            ]),
            formFile
        ]);
        if (is.text) {
            formFile.elements.content.value = content;
            let $, mode = type;
            if (['less', 'scss'].includes(x)) {
                mode = 'css';
            } else if (['markdown', 'md', 'txt'].includes(x) && '---\n' === content.slice(0, 4)) {
                mode = {
                    base: 'txt' === x ? 'null' : 'markdown',
                    name: 'yaml-frontmatter'
                };
            } else if (['yaml', 'yml'].includes(x)) {
                mode = 'yaml';
            }
            if ($ = application.$) {
                // If content is longer than the maximum height or width, move cursor to the start of the editor
                function onFocusOnce() {
                    let pane = $.getScrollerElement(),
                        maxRows = $.lineCount(),
                        moveToStart = maxRows > 45 || pane.scrollWidth > pane.clientWidth;
                    $.setCursor(moveToStart ? 0 : maxRows, 0);
                    if (moveToStart) {
                        $.scrollTo(0, 0);
                    }
                    $.off('focus', onFocusOnce);
                }
                $.on('focus', onFocusOnce);
                $.setOption('mode', mode);
                $.setValue(content);
                $.save();
                $.refresh();
                $.focus();
            } else {
                formFile.elements.content.focus();
            }
        } else {
            viewErrorEditor(path, { _type: type }, hash);
        }
    // Folder
    } else {
        formFolder.action = hub + '/at' + route;
        formFolder.elements.name.value = name;
        updateElement(applicationMain, [
            createElement('h3', [
                '📁 ',
                createTraces('.' + route)
            ]),
            formFolder
        ]);
    }
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

function updateViewMain(r) {
    return createViewMain(r);
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
    onExit(path, query, hash, function () {
        updateElement(application, formUser);
        formUser.elements.key.focus();
        then && then.call(application);
    });
}

function viewError(path, query, hash, then) {
    abort.abort();
    abort = new AbortController;
    clearAlerts();
    updateBusyState(false, applicationAside);
    updateBusyState(false, applicationHeader);
    updateBusyState(false, applicationMain);
    updateTitle('Application · Error');
    let description = query._description || 'Unknown error.';
    delete query._description;
    updateElement(application, createAlert(description, 'error'));
    then && then.call(application);
}

function viewErrorEditor(path, query, hash, then) {
    let type = query._type ?? 'folder';
    delete query._type;
    query._description = 'No editor is available for the <code>' + type + '</code> resource type.';
    viewError(path, query, hash, then);
}

function viewErrorView(path, query, hash, then) {
    let type = query._type ?? 'folder';
    delete query._type;
    query._description = 'No direct viewer is available for the <code>' + type + '</code> resource type.';
    viewError(path, query, hash, then);
}

function viewItem(path, query, hash, then) {
    abort.abort();
    abort = new AbortController;
    clearAlerts();
    deleteMark(path);
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
            return viewErrorEditor(path, { _type: r.data.type }, hash, then);
        }
        let type = r.data?.type || "";
        loadJSON(hub + '/at' + toParent(path) + toQuery({
            limit: 'false',
            x: 1 // List file(s) only
        })).then(r => {
            updateBusyState(false, applicationAside);
            if ([400, 401, 403, 404].includes(r.status)) {
                return;
            }
            updateElement(applicationAside, [
                createElement('h6', 'View'),
                createListOfWork(r.data.children)
            ]);
        });
        updateBusyState(false, applicationHeader); // Because `applicationHeader` is set to busy on user enter
        if ([400, 403, 404].includes(r.status)) {
            return viewError(path, { _description: r.status + ': ' + r.description });
        }
        // TODO: Handle stale token
        if (401 === r.status) {
            localStorage.removeItem('hub');
            updateRoute(toPath('/enter')), view(onStaleAfter);
            return;
        }
        updateActivity(path, r.data);
        createViewMain(r);
    }).catch(e => {
        viewError(path, { _description: e + "" });
    }).finally(() => {
        then && then.call(application);
    });
}

function viewItemFileEditorText(path, query, hash, then) {
    abort.abort();
    abort = new AbortController;
    clearAlerts();
    deleteMark(path);
    updateBusyState(true, applicationAside);
    updateBusyState(true, applicationMain);
    updateTitle('Loading…');
    loadJSON(hub + '/at' + path).then(r => {
        loadJSON(hub + '/at' + toParent(path) + toQuery({
            limit: 'false',
            x: 1 // List file(s) only
        })).then(r => {
            updateBusyState(false, applicationAside);
            if ([400, 401, 403, 404].includes(r.status)) {
                return;
            }
            updateElement(applicationAside, [
                createElement('h6', 'Edit'),
                createListOfWork(r.data.children, true)
            ]);
        });
        updateBusyState(false, applicationHeader); // Because `applicationHeader` is set to busy on user enter
        if ([400, 403, 404, 415].includes(r.status)) {
            return viewError(path, { _description: r.status + ': ' + r.description });
        }
        // TODO: Handle stale token
        if (401 === r.status) {
            localStorage.removeItem('hub');
            updateRoute(toPath('/enter')), view(onStaleAfter);
            return;
        }
        updateActivity(path, r.data);
        createEditorMain(r);
    }).catch(e => {
        viewError(path, { _description: e + "" });
    }).finally(() => {
        then && then.call(application);
    });
}

function viewItemFolderEditor(path, query, hash, then) {
    abort.abort();
    abort = new AbortController;
    clearAlerts();
    deleteMark(path);
    updateBusyState(true, applicationAside);
    updateBusyState(true, applicationMain);
    updateTitle('Loading…');
    loadJSON(hub + '/at' + path + toQuery({
        limit: 0 // Do not fetch children to quickly capture the resource status
    })).then(r => {
        loadJSON(hub + '/at' + toParent(path) + toQuery({
            limit: 'false', // Fetch all children for the side-bar view
            x: 0 // List folder(s) only
        })).then(r => {
            updateBusyState(false, applicationAside);
            if ([400, 401, 403, 404].includes(r.status)) {
                return;
            }
            updateElement(applicationAside, [
                createElement('h6', 'Work'),
                createListOfWork(r.data.children, true)
            ]);
        });
        updateBusyState(false, applicationHeader); // Because `applicationHeader` is set to busy on user enter
        if ([400, 403, 404].includes(r.status)) {
            return viewError(path, { _description: r.status + ': ' + r.description });
        }
        // TODO: Handle stale token
        if (401 === r.status) {
            localStorage.removeItem('hub');
            updateRoute(toPath('/enter')), view(onStaleAfter);
            return;
        }
        // formFolder.action = hub + '/at' + path;
        // formFolder.elements.name.value = r.data.name;
        // updateElement(applicationMain, [
        //     createElement('h3', [
        //         '📁 ',
        //         createTraces('.' + path)
        //     ]),
        //     formFolder
        // ]);
        // updateTitle('Application · Folder Editor');
        updateActivity(path, r.data);
        createEditorMain(r);
    }).catch(e => {
        viewError(path, { _description: e + "" });
    }).finally(() => {
        then && then.call(application);
    });
}

function viewItems(path, query, hash, then) {
    abort.abort();
    abort = new AbortController;
    clearAlerts();
    deleteMark(path);
    updateTitle('Loading…');
    loadJSON(hub + '/at' + path + toQuery({
        chunk: query.chunk ?? currentChunk,
        part: query.part ?? currentPart,
        query: query.query ?? currentQuery,
        sort: query.sort ?? currentSort
    })).then(r => {
        updateBusyState(false, applicationAside);
        updateBusyState(false, applicationHeader); // Because `applicationHeader` is set to busy on user enter
        updateBusyState(false, applicationMain);
        if ([400, 403, 404].includes(r.status)) {
            return viewError(path, { _description: r.status + ': ' + r.description }, hash);
        }
        // TODO: Handle stale token
        if (401 === r.status) {
            localStorage.removeItem('hub');
            updateRoute(toPath('/enter')), view(onStaleAfter);
            return;
        }
        updateElement(applicationAside, [
            createElement('h6', 'Activity'),
            createListOfActivity()
        ]);
        createListMain(r); // Has to run after `createListOfActivity()` call
    }).catch(e => {
        viewError(path, { _description: e + "" }, hash);
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
    }),
    createElement('p', createElement('label', [
        createElement('input', false, {
            'name': 'kick',
            'type': 'checkbox'
        }),
        createElement('span', 'Redirect to file editor')
    ]))
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
    }),
    createElement('p', createElement('label', [
        createElement('input', false, {
            'checked': true,
            'name': 'kick',
            'type': 'checkbox'
        }),
        createElement('span', 'Redirect to folder')
    ]))
], {
    'method': 'dialog'
}));

formFileNew.addEventListener('reset', function () {
    clearAlerts(), dialogFileNew.close();
});

formFileNew.addEventListener('submit', function (e) {
    clearAlerts();
    let base = this.elements.name.value,
        kick = this.elements.kick.checked,
        path = fromPath(window.location.pathname);
    let name = -1 !== base.indexOf('.') ? base.split('.').slice(0, -1).join('.') : base,
        x = -1 !== base.indexOf('.') ? base.split('.').pop() : null;
    loadJSON(hub + '/at' + path, 'PUT', {}, {
        content: "",
        name,
        x
    }).then(r => {
        if (201 === r.status) {
            dialogFileNew.close();
            updateActivity(r.data.route, r.data);
            updateMark(r.data.route);
            if (kick) {
                updateRoute(toPath(path += '/' + name + (x ? '.' + x : "")) + toHash('patch'));
                viewItemFileEditorText(path, {}, toHash('patch'));
            } else {
                viewItems(path, {
                    chunk: currentChunk,
                    part: currentPart,
                    sort: currentSort
                });
            }
            this.reset();
        } else {
            dialogFileNew.prepend(createAlert(r.status + ': ' + r.description, 'error'));
        }
    }).catch(e => {
        dialogFileNew.close();
        viewError(path, { _description: e + "" });
    });
    e.preventDefault();
});

formFolderNew.addEventListener('reset', function () {
    clearAlerts(), dialogFolderNew.close();
});

formFolderNew.addEventListener('submit', function (e) {
    clearAlerts();
    let kick = this.elements.kick.checked,
        path = fromPath(window.location.pathname),
        route = this.elements.name.value,
        routeName = toBase(route),
        routeSub = toParent(route);
    loadJSON(hub + '/at' + path, 'PUT', {}, {
        name: routeName,
        sub: routeSub
    }).then(r => {
        if (201 === r.status) {
            dialogFolderNew.close();
            route.split('/').map((x, i, r) => r.slice(0, i + 1).join('/')).forEach(sub => {
                let k = path + '/' + sub;
                updateActivity(k, Object.assign({}, r.data, {
                    name: toBase(k),
                    route: k
                }));
                updateMark(k);
            });
            if (kick) {
                updateRoute(toPath(path += '/' + route) + toQuery({
                    chunk: currentChunk,
                    part: 1
                }));
                viewItems(path, {
                    chunk: currentChunk,
                    part: 1
                });
            } else {
                viewItems(path, {
                    chunk: currentChunk,
                    part: currentPart,
                    sort: currentSort
                });
            }
            this.reset();
        } else {
            dialogFolderNew.prepend(createAlert(r.status + ': ' + r.description, 'error'));
        }
    }).catch(e => {
        dialogFolderNew.close();
        viewError(path, { _description: e + "" });
    });
    e.preventDefault();
});

document.body.append(dialogFileNew, dialogFolderNew);

view();

})();