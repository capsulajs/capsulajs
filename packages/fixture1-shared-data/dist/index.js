debugger;
console.log(window);
function reportData(callee, data) {
    var event = new CustomEvent('report', {
        detail: {
            callee,
            data
        }
    });
    window.dispatchEvent(event);
}
// global
reportData("global", capsula.data);
// function
function test() {
    reportData("function", capsula.data);
}
test();
// timeout
setTimeout(() => {
    reportData("timeout", capsula.data);
},0);
// promise
const p = new Promise((res, reg) => {
    reportData("promise", capsula.data);
    res();
});
