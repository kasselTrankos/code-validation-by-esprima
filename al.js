var x = 1;
var y = 2;
function bar() {
    if (x < y) {
        foo();
    } else {
        x = y;
        return;
    }
    for (var i = 0; i < 2; i++) {
        x += i;
    }
    bar();
}