'use strict';

const operations = [
    ['Base64 Encode', function base64encode(input) {
        const bits = sjcl.codec.utf8String.toBits(input);
        return sjcl.codec.base64.fromBits(bits);
    }],
    ['Base64 Decode', function base64decode(input) {
        const bits = sjcl.codec.base64.toBits(input);
        return sjcl.codec.utf8String.fromBits(bits);
    }],
    ['Format JSON', function formatJSON(input) {
        return JSON.stringify(JSON.parse(input), null, 4);
    }],
    ['SHA256', function (input) {
        let bits = sjcl.hash.sha256.hash(input);
        return sjcl.codec.hex.fromBits(bits);
    }],
    ['URI Encode', encodeURIComponent],
    ['URI Decode', decodeURIComponent],
    ['Base 10 -> 16 (hex)', function base10to16(input) {
        return parseInt(input, 10).toString(16);
    }],
    ['Base 16 (hex) -> 10', function base10to16(input) {
        return parseInt(input, 16).toString(10);
    }],
];

document.addEventListener("DOMContentLoaded", function domLoaded() {
    const textarea = document.querySelector('#content');
    const pane = document.querySelector('#pane');
    const paneList = document.querySelector('#pane-list');
    const paneFilter = document.querySelector('#pane > input');

    function runOperation(fn) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        try {
            if (start == end) {
                textarea.value = fn(textarea.value);
            } else {
                const selected = textarea.value.slice(start, end);
                document.execCommand("insertText", false, fn(selected));

            }
        } catch (error) {
            alert(error)
        }
    }

    function openPane() {
        for (const child of paneList.children) {
            child.classList.remove('selected');
            child.classList.remove('hidden');
        }
        paneList.firstChild.classList.add('selected');
        pane.classList.remove('hidden');
        paneFilter.focus()
    }
    function closePane() {
        pane.classList.add('hidden');
        textarea.focus()
    }

    function ctrlPListener(event) {
        if (event.key != 'p' || !event.ctrlKey) {
            return;
        }
        event.preventDefault();

        if (pane.classList.contains('hidden')) {
            openPane();
        } else {
            closePane();
        }
    }

    function initializePane() {
        for (const operation of operations) {
            let item = document.createElement('div');
            item.classList.add('item');
            item.innerText = operation[0];
            item.opFn = operation[1];
            item.addEventListener('click', function () {
                closePane();
                runOperation(this.opFn);
            });
            paneList.appendChild(item);
        }
    }

    function paneKeyListener(event) {
        if (pane.classList.contains('hidden')) {
            return;
        }
        if (event.key == "Escape") {
            event.preventDefault();
            closePane();
        }

        const selected = document.querySelector('.item.selected');
        const selectable = document.querySelectorAll('.item:not(.hidden)');

        if (!selectable.length) {
            return;
        }

        const index = Array.prototype.indexOf.call(selectable, selected);
        const next = selectable[(selectable.length + index + 1) % selectable.length]
        const previous = selectable[(selectable.length + index - 1) % selectable.length]

        if (event.key == "ArrowDown") {
            event.preventDefault();
            selected.classList.remove('selected');
            next.classList.add('selected');
            next.scrollIntoView(false);
        } else if (event.key == "ArrowUp") {
            event.preventDefault();
            selected.classList.remove('selected');
            previous.classList.add('selected');
            previous.scrollIntoView(false);
        } else if (event.key == "Enter") {
            event.preventDefault();
            paneFilter.value = '';
            closePane();
            runOperation(selected.opFn);
        }
    }

    function paneFilterHandler(event) {
        const search = paneFilter.value.toLowerCase();

        // hide all non-matching items
        for (let child of paneList.children) {
            if (child.innerText.toLowerCase().indexOf(search) >= 0) {
                child.classList.remove('hidden');
            } else {
                child.classList.add('hidden');
                child.classList.remove('selected');
            }
        }
        // if there are no selected items, select the first visible one
        const selected = document.querySelector('.item.selected');
        if (!selected) {
            const toSelect = document.querySelector('.item:not(.hidden)');
            if (toSelect) {
                toSelect.classList.add('selected');
            }
        }
    }

    textarea.addEventListener('keydown', ctrlPListener);
    document.body.addEventListener('keydown', paneKeyListener);
    paneFilter.addEventListener('input', paneFilterHandler);
    initializePane();
    textarea.focus()
});
