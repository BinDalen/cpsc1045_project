const drawing = document.getElementById('drawing');
const sides = document.getElementById('sides');
const circumference = document.getElementById('circumference');
const vertexX = document.getElementById('vertX');
const vertexY = document.getElementById('vertY');
const rotate = document.getElementById('rotate');
const change = document.getElementById('change');
const changeAll = document.getElementById('changeAll');
const removeAll = document.getElementById('clear');
const vertXShowcase = document.getElementById('vertXShowcase');
const vertYShowcase = document.getElementById('vertYShowcase');
const rotateShowcase = document.getElementById('rotateShowcase');
const colorSelect = document.getElementById('colorSelect');
const createMode = document.getElementById('createMode');
const selectMode = document.getElementById('selectMode');
const modeShowcase = document.getElementById('modeShowcase');
const del = document.getElementById('delete');
const delAll = document.getElementById('deleteAll');

/**
 * * Pointer class with method to handle rotational inputs to draw the shape accordingly
 */
class Pointer {
    constructor(polygon) {
        this.polygon = polygon;
        this.x = polygon.x;
        this.y = polygon.y;
        this.step = 0;
        this.rotation = 90 - this.polygon.cornerAngle() / 2;
        this.record = '';
    }
    rotationalChange() {
        let degreeOfChange = 360 / this.polygon.triangles * this.polygon.rotation / 100;
        let radian = degreeOfChange * Math.PI / 180;
        let startX = Math.sin(radian) * this.polygon.radiusMaximum();
        let startY = Math.cos(radian) * this.polygon.radiusMaximum();
        this.x = this.x + startX;
        this.y = this.y + startY;
        return this.rotation = this.rotation + degreeOfChange;
    }
    draw(end) {
        this.rotationalChange();
        while (this.step < this.polygon.triangles) {
            let radianRotation = this.rotation * Math.PI / 180;
            this.x = this.x + this.polygon.sideLength() * Math.cos(radianRotation);
            this.y = this.y - this.polygon.sideLength() * Math.sin(radianRotation);
            this.record += `${this.x},${this.y} `;
            this.step = this.step + 1;
            this.rotation = 360 / this.polygon.triangles + this.rotation;
        }
        switch (end) {
            case "push":
                shapes.record.push(this.polygon);
                drawing.innerHTML += `<polygon points="${this.record}" fill="${this.polygon.colorSettings[0]}"/>`;
                break;
            case "record":
                return this.record;
            case "refresh":
                drawing.innerHTML += `<polygon points="${this.record}" fill="${this.polygon.colorSettings[0]}"/>`;
        }
    }
}

/**
 * * Polygon object that contains properties and methods required to draw
 */
class Polygon {
    constructor(triangles, perimeter, x, y, colorSettings, rotation) {
        this.triangles = triangles;
        this.perimeter = perimeter;
        this.x = x;
        this.y = y;
        this.colorSettings = colorSettings;
        this.rotation = rotation;
    }
    sideLength() {
        return this.perimeter / this.triangles;
    }
    angle() {
        return 360 / this.triangles;
    }
    refLength() {
        return this.sideLength() / 2;
    }
    radiusMaximum() {
        let radian = this.angle() * Math.PI / 360;
        let maximum = this.refLength() / Math.sin(radian);
        return maximum;
    }
    radiusMinimum() {
        let radian = this.angle() * Math.PI / 360;
        let minimum = this.refLength() / Math.tan(radian);
        return minimum;
    }
    cornerAngle() {
        return (90 - this.angle() / 2) * 2;
    }
}

/**
 * * Shapes class keeps track of polygons in drawing and contains method to select shape and refresh the drawing
 */
class Shapes {
    constructor() {
        this.record = [];
    }
    select(e) {
        let selectable = false;
        let minimum = 0;
        let selectedShape = 0;
        for (let index = 0; index < this.record.length; index++) {
            let xDiff = Math.abs(e.offsetX - this.record[index].x);
            let yDiff = Math.abs(e.offsetY - this.record[index].y);
            if (xDiff < this.record[index].radiusMinimum() 
            && yDiff < this.record[index].radiusMinimum()) {
                let diffAvg = (xDiff+yDiff)/2;
                if (!selectable) {
                    selectable = true;
                    minimum = diffAvg;
                    selectedShape = index;
                } else if (minimum > diffAvg) {
                    minimum = diffAvg;
                    selectedShape = index;
                }
            }
        }
        /**
         * * If there is a selectable shape then begin modification process
         */
        if (selectable) {
            let processAlive = true;
            let currentEvent = "";
            const checkChange = (event) => {
                processAlive = false;
                currentEvent = event.target.id;
            }
            const directionalControl = (event) => {
                switch (event.keyCode) {
                    case 37:
                        currentEvent = "left";
                        break;
                    case 38:
                        currentEvent = "up";
                        break;
                    case 39:
                        currentEvent = "right";
                        break;
                    case 40:
                        currentEvent = "down";
                }
            }
            const neutral = () => {
                currentEvent = "";
            }
            /**
             * * Displaying statistics for editing from input container
             */
            sides.value = this.record[selectedShape].triangles;
            circumference.value = this.record[selectedShape].perimeter;
            rotate.value = this.record[selectedShape].rotation;
            vertexX.value = this.record[selectedShape].x;
            vertexY.value = this.record[selectedShape].y;
            colorSelect.value = this.record[selectedShape].colorSettings[0];
            /**
             * * Adding and removing event listeners
             */
            drawing.removeEventListener('click', start);
            createMode.removeEventListener('click', createShape);
            selectMode.removeEventListener('click', selectShape);
            document.addEventListener('keydown', directionalControl);
            document.addEventListener('keyup', neutral);
            change.addEventListener('click', checkChange);
            changeAll.addEventListener('click', checkChange);
            del.addEventListener('click', checkChange);
            delAll.addEventListener('click', checkChange);

            const modify = () => {
                this.record[selectedShape].colorSettings[1] = this.record[selectedShape].colorSettings[1] == "black" ? "red" : "black";
                new Promise((resolve, reject) => {
                    /**
                     * * Showcasing values in the showcase container
                     */
                    sidesShowcase.innerHTML = this.record[selectedShape].triangles;
                    circumferenceShowcase.innerHTML = this.record[selectedShape].perimeter;
                    rotateShowcase.innerHTML = `${this.record[selectedShape].rotation}%`;
                    vertXShowcase.innerHTML = this.record[selectedShape].x;
                    vertYShowcase.innerHTML = this.record[selectedShape].y;           
                    if (!processAlive) {
                        reject();
                    }
                    resolve();
                }).then(() => {
                    /**
                     * * Take user input from html elements and modify selected shape
                     */
                    drawing.children[selectedShape].setAttribute('style', `stroke: ${this.record[selectedShape].colorSettings[1]};`);
                    if (parseFloat(sides.value)) {
                        this.record[selectedShape].triangles = parseFloat(sides.value);
                    }
                    if (parseFloat(circumference.value)) {
                        this.record[selectedShape].perimeter = parseFloat(circumference.value);
                    }
                    this.record[selectedShape].rotation = rotate.value;
                    if (parseFloat(vertexX.value) < 0) {
                        this.record[selectedShape].x = 0;
                    } else if (parseFloat(vertexX.value) > parseInt(drawing.getAttribute('width'))) {
                        this.record[selectedShape].x = parseInt(drawing.getAttribute('width'));
                    } else if (parseFloat(vertexX.value)) {
                        this.record[selectedShape].x = parseFloat(vertexX.value);
                    }
                    if (parseFloat(vertexY.value) < 0) {
                        this.record[selectedShape].y = 0;                        
                    } else if (parseFloat(vertexY.value) > parseInt(drawing.getAttribute('width'))) {
                        this.record[selectedShape].y = parseInt(drawing.getAttribute('width'));
                    } else if (parseFloat(vertexY.value)) {
                        this.record[selectedShape].y = parseFloat(vertexY.value);
                    }
                    this.record[selectedShape].colorSettings[0] = colorSelect.value;
                    switch (currentEvent) {
                        case "up":
                            this.record[selectedShape].y = this.record[selectedShape].y - 1;
                            vertexY.value = this.record[selectedShape].y;
                            break;
                        case "down":
                            this.record[selectedShape].y = this.record[selectedShape].y + 1;
                            vertexY.value = this.record[selectedShape].y;
                            break;
                        case "left":
                            this.record[selectedShape].x = this.record[selectedShape].x - 1;
                            vertexX.value = this.record[selectedShape].x;
                            break;
                        case "right":
                            this.record[selectedShape].x = this.record[selectedShape].x + 1;
                            vertexX.value = this.record[selectedShape].x;
                    }
                    let previewShape = new Pointer(this.record[selectedShape]);
                    drawing.children[selectedShape].setAttribute('points', previewShape.draw("record"));
                }).catch(() => {
                    /**
                     * * Execute end-process sequences based on current user input event
                     */
                    if (currentEvent == "changeAll") {
                            let universalColor = this.record[selectedShape].colorSettings[0];
                            this.record.forEach(polygon => {
                                if (polygon.triangles == this.record[selectedShape].triangles) {
                                    polygon.colorSettings[0] = universalColor;
                                }
                            })
                    } else if (currentEvent == "delete") {
                        let spliceStart = selectedShape + 1;
                        let spliceLength = this.record.length - spliceStart;
                        let holder = this.record.splice(spliceStart, spliceLength);
                        this.record.pop();
                        this.record = this.record.concat(holder);
                    } else if (currentEvent == "deleteAll") {
                        let checkFor = this.record[selectedShape].triangles;
                        const findSimilar = polygon => {
                            return polygon.triangles == checkFor;
                        }
                        while (this.record.findIndex(findSimilar) != -1) {
                            let found = this.record.findIndex(findSimilar);
                            let spliceStart = found + 1;
                            let spliceLength = this.record.length - spliceStart;
                            let holder = this.record.splice(spliceStart, spliceLength);
                            this.record.pop();
                            this.record = this.record.concat(holder);
                        }
                    }
                    this.refresh();

                    /**
                     * * Emptying showcase elements 
                     */
                    sidesShowcase.innerHTML = "";
                    circumferenceShowcase.innerHTML = "";
                    vertXShowcase.innerHTML = "";
                    vertYShowcase.innerHTML = "";

                    /**
                     * * Adding and removing event listeners
                     */
                    document.removeEventListener('keydown', directionalControl);
                    document.removeEventListener('keyup', neutral);
                    drawing.addEventListener('click', start);
                    createMode.addEventListener('click', createShape);
                    selectMode.addEventListener('click', selectShape);
                    change.removeEventListener('click', checkChange);
                    changeAll.removeEventListener('click', checkChange);
                    del.removeEventListener('click', checkChange);
                    clearInterval(modifying);
                    // console.log(drawing.children[selectedShape].setAttribute('points', "100,100 300,100 300,300 100,300 "))
                })
            }
            let modifying = setInterval(modify, 100);
        }
    }
    refresh() {
        drawing.innerHTML = "";
        this.record.forEach(shape => {
            let pointer = new Pointer(shape);
            pointer.draw("refresh");
        })
    }
}

let shapes = new Shapes();

/**
 * * Creates a new polygon with event properties
 */
const trace = (e) => {
    let polygon = new Polygon(parseInt(sides.value), parseInt(circumference.value), e.offsetX, e.offsetY, [colorSelect.value, "black"], rotate.value);
    let pointer = new Pointer(polygon);
    pointer.draw("push");
}

/**
 * * Switching between create and select mode and defaulting to create on load
 */
let mode = "create";
createMode.addEventListener('click', createShape = () => {
    mode = "create";
    modeShowcase.innerHTML = mode;
})
selectMode.addEventListener('click', selectShape = () => {
    mode = "select";
    modeShowcase.innerHTML = mode;
})
drawing.addEventListener('click', start = e => {
    switch (mode) {
        case "create":
            if (parseInt(sides.value) > 50 || parseInt(sides.value) < 3) {
                return alert("Please input a number of sides from 3 to 50...");
            } else if (parseInt(circumference.value) > parseInt(drawing.getAttribute('width'))/2*Math.PI) {
                return alert(`Please input a perimeter smaller than ${Math.floor(drawing.getAttribute('width')/2*Math.PI)}...`);
            }
            trace(e);
            break;
        case "select":
            shapes.select(e);
    }
})


/**
 * * Empties the record
 */
const clear = () => {
    shapes.record = [];
    return drawing.innerHTML = "";
}

removeAll.addEventListener('click', clear);
