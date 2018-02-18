const operations = [
    ['Base64 encode', btoa],
    ['Base64 decode', atob]
];

document.addEventListener("DOMContentLoaded", function domLoaded(event) {
    const textarea = document.getElementById('content');

    function runOperation (fn) {
        // debugger
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        if (start == end) {
            console.log('replacing whole thing', textarea.value);
            textarea.value = fn(textarea.value);
        } else {
            const selected = textarea.value.slice(start, end);
            textarea.setRangeText(fn(selected));
        }
    }
    function opListener(event) {
        if (event.key == "p" && event.ctrlKey) {
            event.preventDefault();
            return runOperation(operations[0][1]);
        }
    }

    textarea.addEventListener('keydown', opListener);
});

