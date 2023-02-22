var canvas;
var gl;


var cubeVertices = [];
var cubeColor = [];
var cubeVectors = [];
var scaleSlider;
var speedSlider;
var numCubes = 9;
var scale = .5;
var speed = .01;
var rotMax = 360;


window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    numSlider = document.getElementById("numSlider");
    scaleSlider = document.getElementById("scaleSlider");
    speedSlider = document.getElementById("speedSlider");
    rotSlider = document.getElementById("rotSlider");

    numCubes = numSlider.value;
    scale = scaleSlider.value/10;
    speed = speedSlider.value/1000;
    rotMax = rotSlider.value*360;

    canvas.addEventListener('click', (event) => {
        cubeWidth = canvas.width*scale/2
        cubeHeight = canvas.height*scale/2
        cubeLeft = (canvas.offsetLeft + canvas.clientLeft) + ((canvas.width/2) - (cubeWidth/2))
        cubeRight = cubeLeft + cubeWidth
        cubeTop = (canvas.offsetTop + canvas.clientTop) + ((canvas.height/2) - (cubeHeight/2))
        cubeBottom = cubeTop + cubeHeight
        x = event.pageX;
        y = event.pageY;

        if(!((x >= cubeLeft) && (x <= cubeRight) && (y >= cubeTop) && (y <= cubeBottom))) return;

        if(kft) kft = 0.0;
        else kft = speed;

    })

    numSlider.onchange = function () {
        numCubes = numSlider.value;
        for (let i = 0; i < numCubes; i++) {
            let vec = randVec3()
            vec.push(randInt(3))
            cubeVectors.push(vec)
        }
    };
    scaleSlider.onchange = function () {
        scale = scaleSlider.value/10;
        originMatrix = mult(scalem(scale, scale, scale), translate(-.5,-.5, .5));
    };
    speedSlider.onchange = function () {
        speed = speedSlider.value/1000;
    };
    rotSlider.onchange = function () {
        rotMax = rotSlider.value*360;
    };

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

    // Use Uniform to send Matrix to shaders
    modelView = gl.getUniformLocation(program, "modelView");
    // Pass keyframe time to shader
    vKft = gl.getUniformLocation(program, "vKft");
    // Matrix for centering origin cube
    originMatrix = mult(scalem(scale, scale, scale), translate(-.5,-.5,-.5));
    for (let i = 0; i < 4; i++) {
        console.log(originMatrix[i]);
    }
    // Generate random direction vectors for each cube
    generateVectors()
    console.log(cubeVectors)

    render();
}

var kft = 0.0;
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform1f(vKft, kft)

    let rot = rotMax * kft;
    // Send Origin matrix to shader
    gl.uniformMatrix4fv(modelView, false, flatten(originMatrix));
    // Draw Origin Cube
    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    for (let i = 0; i < numCubes; i++) {
        let spawn = cubeVectors[i]
        let x = spawn[0] * kft
        let y = spawn[1] * kft
        let z = spawn[2] * kft

        let spawnMatrix = mult(translate(x, y, z), originMatrix)
        spawnMatrix = mult(rotate(rot, spawn[0], spawn[1], spawn[2]), spawnMatrix)
        gl.uniformMatrix4fv(modelView, false, flatten(spawnMatrix));
        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    }
    
    if(kft) kft += speed;
    if(kft > 1) {
        kft = speed;
        generateVectors();
    };
    requestAnimFrame(render);
}

function randVec3() {
    return normalize(vec3(
        (Math.random()-0.5),
        (Math.random()-0.5),
        (Math.random()-0.5)
    ))
}

function randInt(max) {
    return Math.floor(Math.random() * max)
}

function generateVectors() {
    cubeVectors = [];
    for (let i = 0; i < numCubes; i++) {
        let vec = randVec3()
        vec.push(randInt(3))
        cubeVectors.push(vec)
    }
}