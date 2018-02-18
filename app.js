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
];

document.addEventListener("DOMContentLoaded", function domLoaded(event) {
    const textarea = document.getElementById('content');
    const pane = document.getElementById('pane');

    function runOperation(fn) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        try {
            if (start == end) {
                textarea.value = fn(textarea.value);
            } else {
                const selected = textarea.value.slice(start, end);
                textarea.setRangeText(fn(selected));
            }
        } catch (error) {
            alert(error)
        }
    }

    function openPane() {
        pane.classList.remove('hidden');
        initializePane();
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
        while (pane.firstChild) {
            pane.removeChild(pane.firstChild);
        }

        pane.innerHTML = '';
        for ([opName, opFn] of operations) {
            let item = document.createElement('div');
            item.innerText = opName;
            item.classList.add('item');
            item.opFn = opFn;
            item.addEventListener('click', function () {
                closePane();
                runOperation(this.opFn);
            });
            pane.appendChild(item);
        }
        pane.firstChild.classList.add('selected');
        pane.focus();
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

        if (event.key == "ArrowDown") {
            event.preventDefault();
            const toSelect = selected.nextSibling || pane.firstChild;
            selected.classList.remove('selected');
            toSelect.classList.add('selected');
        } else if (event.key == "ArrowUp") {
            event.preventDefault();
            const toSelect = selected.previousSibling || pane.lastChild;
            selected.classList.remove('selected');
            toSelect.classList.add('selected');
        } else if (event.key == "Enter") {
            event.preventDefault();
            closePane();
            runOperation(selected.opFn);
        }
    }

    textarea.addEventListener('keydown', ctrlPListener);
    document.body.addEventListener('keydown', paneKeyListener);
    textarea.focus()
});
