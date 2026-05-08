// (() => {

const application = document.querySelector('[role=application]');

let folderSizeViews = {};

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
        'type': 'text'
    })),
    createElement('p', createElement('input', false, {
        'name': 'pass',
        'placeholder': 'Pass',
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
    updateTitle('Logging in…', true);
    fetch(hub + '/enter', {
        body: JSON.stringify({ key, pass, peer }),
        headers: { 'content-type': 'application/json' },
        method: 'POST'
    }).then(r => r.json()).then(r => {
        if (200 !== r.status) {
            updateAlert(info, r.description, 'error', 1000);
            updateTitle('Application · Error');
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
            formUser.elements.key.value = "";
            formUser.elements.pass.value = "";
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
        for (const [name, value] of Object.entries(attributes)) {
            if (false === value || null === value) {
                element.removeAttribute(name);
            } else {
                element.setAttribute(name, value + "");
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
                'href': sub + trace.slice(1) + '?chunk=20&part=1'
            });
            a.addEventListener('click', onClickAnchor);
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
        if (!window.CodeMirror) throw new Error('Error loading `CodeMirror` library!');
        return window.CodeMirror;
    });
}

let folders = {}, foldersPromise, wasLoadFolders;
function loadFolders() {
    if (wasLoadFolders) {
        return Promise.resolve(folders);
    }
    if (foldersPromise) {
        return foldersPromise;
    }
    foldersPromise = f3h(hub + '/at/lot?limit=9999&x=0').then(r => r.json()).then(r => {
        return (folders = r);
    });
    return foldersPromise;
}

function onAfterView(path, query, hash, then) {
    // Create button
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
        updateRoute('/enter'), view(onAfterViewFormUser);
        e.preventDefault();
    });
    // Folder navigation
    const options = createElement('select', false, {
        'disabled': ""
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
                icon = '✨';
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
                    'disabled': "",
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
        updateRoute('/lot/' + this.value + '?chunk=20&part=1'), view();
        e.preventDefault();
    });
    application.prepend(createElement('header', [options, createFile, createFolder, formSearch, exit], {
        'style': 'display:flex;gap:0.5rem;'
    }));
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
    updateElement(application, formFile);
    updateTitle('Application · File Editor');
    formFile.elements.content.focus();
    then && then.call(formFile);
    return formFile;
}

function viewFormUser(path, query, hash, then) {
    updateElement(application, formUser);
    updateTitle('Application · Enter');
    formUser.elements.key.focus();
    then && then.call(formUser);
    return formUser;
}

function viewItem(path, query, hash, then) {
    if ('#edit' === hash) {
        return viewItemTextEditor(path, query, hash, then);
    }
    updateTitle('Loading…', true);
    const itemContent = createElement('code', 'Loading content…');
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
            updateElement(application, createAlert(r.description, 'error', 1000));
            updateTitle('Application · Error');
            onAfterView(path, query, hash, then);
            return;
        }
        updateElement(application, [
            createElement('h3', [
                '📄 ',
                createTracesFromString('.' + path)
            ]),
            createElement('pre', itemContent)
        ]);
        updateTitle('Application · File Viewer');
        onAfterView(path, query, hash, then);
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
                        application.prepend(createAlert(e + "", 'error', 1000));
                    });
                }
            });
        } else {
            itemContent.textContent = JSON.stringify(r, null, 2);
        }
    }).catch(e => {
        application.prepend(createAlert(e + "", 'error', 1000));
        then && then.call(application);
    });
}

function viewItemTextEditor(path, query, hash, then) {
    updateTitle('Loading…', true);
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
            updateElement(application, createAlert(r.description, 'error', 1000));
            updateTitle('Application · Error');
            onAfterView(path, query, hash, then);
            return;
        }
        const form = viewFormFile(path, query, hash);
        if (form.$content) {
            form.$content.toTextArea(); // Destroy!
        }
        form.elements.content.parentNode.style.display = r.data.is.text ? "" : 'none';
        form.elements.name.value = r.data.name + (r.data.x ? '.' + r.data.x : "");
        updateElement(application, [
            createElement('h3', [
                '📄 ',
                createTracesFromString('.' + path)
            ]),
            form
        ]);
        updateTitle('Application · File Editor');
        onAfterView(path, query, hash, then);
        if (r.data.is.text) {
            let info = createAlert('Loading CodeMirror library…', 'info');
            application.prepend(info);
            form.elements.content.style.display = 'none';
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
                    form.elements.content.value = r.data.content;
                    loadCodeMirror5().then(CodeMirror => {
                        form.$content = CodeMirror.fromTextArea(form.elements.content, {
                            autoCloseBrackets: true,
                            autofocus: true,
                            lineNumbers: true,
                            lineWrapping: false,
                            mode,
                            scrollbarStyle: 'simple',
                            viewportMargin: Infinity
                        });
                        form && form.addEventListener('submit', () => form.$content.save());
                        form.$content.refresh();
                        info.remove();
                    }).catch(e => {
                        application.prepend(createAlert(e + "", 'error', 1000));
                        form.elements.content.style.display = "";
                        form.elements.content.focus();
                    });
                } else {
                    updateAlert(info, r.description, 'error', 1000);
                }
            });
        } else {}
    }).catch(e => {
        application.prepend(createAlert(e + "", 'error', 1000));
        then && then.call(application);
    });
}

function viewItems(path, query, hash, then) {
    updateTitle('Loading…', true);
    const listItems = createElement('ul');
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
            updateElement(application, createAlert(r.description, 'error', 1000));
            updateTitle('Application · Error');
            onAfterView(path, query, hash, then);
            return;
        }
        let parent = r.data.parent;
        updateTitle('Application · Folder');
        updateElement(application, [
            createElement('h3', [
                '📂 ',
                createTracesFromString('.' + path)
            ]),
            listItems
        ]);
        if (r.data.has.next || r.data.has.prev) {
            application.append(createElement('nav', [
                createPager(r.query.part, r.data.total, r.query.chunk, 2, function (part, current, disabled) {
                    if (current || disabled) {
                        this.addEventListener('click', e => e.preventDefault());
                    } else {
                        this.addEventListener('click', onClickAnchor);
                    }
                    this.href = sub + r.data.route + '?chunk=' + r.query.chunk + '&part=' + part;
                }, 'First', 'Previous', 'Next', 'Last')
            ], {
                'aria-label': 'Pagination'
            }));
        }
        if (parent) {
            parent.name = '..';
            r.data.children.unshift(parent);
        }
        folderSizeViews = {}; // Reset!
        r.data.children.forEach(v => {
            const listItemLink = createElement('a', v.name + (v.is.file && v.x ? '.' + v.x : ""), {
                'href': v.is.blob ? hub + '/blob' + v.route : sub + v.route + (v.is.folder ? '?chunk=' + query.chunk + '&part=1' : ""),
                'title': '..' === v.name ? 'Go to parent' : (v.is.blob ? 'Open' : 'View')
            });
            const listItemLinkDelete = createElement('a', '🗑️', {
                'href': '#delete',
                'title': 'Delete'
            });
            const listItemLinkEdit = createElement('a', '📝', {
                'href': sub + v.route + '#edit',
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
            const listItemLinks = createElement('span', [
                v.is.folder ? listItemLinkOpen : listItemLinkView,
                listItemLinkEdit,
                listItemLinkDelete
            ], {
                'style': 'display:flex;gap:0.5em;justify-content:end;min-width:5em;'
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
            } : onClickAnchor);
            listItemLinkDelete.addEventListener('click', function (e) {
                alert('Delete');
                e.preventDefault();
            });
            listItemLinkEdit.addEventListener('click', function (e) {
                let route = this.getAttribute('href').slice(sub.length);
                updateRoute(route), viewItemTextEditor(route.split('#')[0]);
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
            ]));
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

let formFileNew, formFolderNew;

const dialogFileNew = createElement('dialog', formFileNew = createElement('form', [
    createElement('p', 'File name:'),
    createElement('p', [
        createElement('input', false, {
            'autofocus': "",
            'name': 'name',
            'pattern': '([#.@_~]?[a-z\\d]+([_.\\-][a-z\\d]+)*)?\\.\\w+',
            'placeholder': 'foo-bar.baz',
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
    createElement('p', 'Folder name:'),
    createElement('p', [
        createElement('input', false, {
            'autofocus': "",
            'name': 'name',
            'pattern': '([._]?[a-z\\d]+([._\\-][a-z\\d]+)*)([\\\\\\/][._]?[a-z\\d]+([._\\-][a-z\\d]+)*)*',
            'placeholder': 'foo/bar/baz',
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

formFileNew.addEventListener('reset', function (e) {
    dialogFileNew.close();
    this.elements.name.value = "";
    e.preventDefault();
});

formFileNew.addEventListener('submit', function (e) {
    dialogFileNew.close();
    let path = window.location.pathname.slice(sub.length);
    let nameParts = this.elements.name.value.split('.'),
        nameX = nameParts.pop();
    f3h(hub + '/at' + path, 'PUT', { 'content-type': 'application/json' }, JSON.stringify({
        content: "",
        name: nameParts.join('.'),
        x: nameX
    })).then(r => r.json()).then(r => {
        updateRoute(path + '/' + nameParts.join('.') + '.' + nameX + '#edit');
        viewItemTextEditor(path + '/' + nameParts.join('.') + '.' + nameX, {}, '#edit');
    }).catch(console.error);
    e.preventDefault();
});

formFolderNew.addEventListener('reset', function (e) {
    dialogFolderNew.close();
    this.elements.name.value = "";
    e.preventDefault();
});

formFolderNew.addEventListener('submit', function (e) {
    dialogFolderNew.close();
    let path = window.location.pathname.slice(sub.length);
    let routeParts = this.elements.name.value.split('/'),
        routeName = routeParts.pop(),
        routeParent = routeParts.length ? routeParts.join('/') + '/' : "";
    f3h(hub + '/at' + path, 'PUT', { 'content-type': 'application/json' }, JSON.stringify({
        name: routeName,
        route: routeParent
    })).then(r => r.json()).then(r => {
        updateRoute(path + '/' + routeParent + routeName + '?chunk=20&part=1');
        viewItems(path + '/' + routeParent + routeName, {
            chunk: 20,
            part: 1
        });
    }).catch(console.error);
    e.preventDefault();
});

document.body.append(dialogFileNew, dialogFolderNew);

// })();