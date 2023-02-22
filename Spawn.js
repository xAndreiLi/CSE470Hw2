var canvas;
var gl;


var cubeVertices = [];
var cubeColor = [];
var scaleSlider;
var speedSlider;
var scale = .5;
var speed = .5;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    scaleSlider = document.getElementById("scaleSlider");
    speedSlider = document.getElementById("speedSlider");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }


    createCube();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeColor), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cubeVertices), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelView = gl.getUniformLocation(program, "modelView");

    originMatrix = translate(-.5, -.5, -.5);

    scaleSlider.onchange = function () {
        scale = scaleSlider.value;
    };
    speedSlider.onchange = function () {
        speed = speedSlider.value;
    };


    render();
}


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(modelView, false, flatten(originMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    createCube();
    mvMatrix = mult(scalem(0.5, 0.5, 0.5), translate(0.5, 0.5, 0.5));
    gl.uniformMatrix4fv(modelView, false, flatten(mvMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    requestAnimFrame(render);
}

