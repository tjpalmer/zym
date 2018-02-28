webpackJsonp([0],[
/* 0 */,
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });

// CONCATENATED MODULE: ./src/util.ts
class Grid {
    constructor(size, items) {
        this.items = items || new Array(size.x * size.y);
        this.size = size.clone();
    }
    copy() {
        return new Grid(this.size, this.items.slice());
    }
    get(point) {
        return this.items[this.index(point)];
    }
    index(point) {
        return point.x * this.size.y + point.y;
    }
    set(point, item) {
        this.items[this.index(point)] = item;
    }
}
class Group {
    constructor() {
        // Not a mathematical group. Just a group.
        // Doesn't necessarily support set operations, but it's sort of a set.
        this.items = new Array();
        this.length = 0;
    }
    clear() {
        // TODO If I say array.length = 0 in Chrome, does it retain memory space?
        // TODO If so, can I trust it to stay that way?
        let { items, length } = this;
        this.length = 0;
        for (let i = 0; i < length; ++i) {
            items[i] = undefined;
        }
    }
    push(item) {
        this.items[this.length++] = item;
    }
    removeAt(index) {
        let { items } = this;
        items[index] = items[--this.length];
        // Only grow. Don't shrink.
        items[this.length + 1] = undefined;
    }
    *[Symbol.iterator]() {
        // TODO How to make Ring directly Iterable?
        let { items, length } = this;
        for (let i = 0; i < length; ++i) {
            yield items[i];
        }
    }
}
class Ring {
    // A circular queue with push and shift functions.
    // TODO Keep this or ditch it?
    constructor(capacity) {
        this.begin = 0;
        this.end = 0;
        if (!capacity) {
            throw new Error(`capacity ${capacity} <= 0`);
        }
        this.items = new Array(capacity);
    }
    at(index) {
        return this.items[(this.begin + index) % this.items.length];
    }
    clear() {
        // TODO Be more efficient?
        while (!this.empty) {
            this.shift();
        }
    }
    get empty() {
        return this.begin == this.end;
    }
    get first() {
        return this.items[this.begin];
    }
    get full() {
        return (this.end + 1) % this.items.length == this.begin;
    }
    get length() {
        let length = this.end - this.begin;
        if (length < 0) {
            length += this.items.length;
        }
        return length;
    }
    push(item) {
        let { end, items } = this;
        items[this.end] = item;
        this.end = (end + 1) % items.length;
        // After incrementing, see if we hit the start.
        if (this.end == this.begin) {
            ++this.begin;
        }
    }
    shift() {
        // If not empty, returns the first (oldest) item then clears its spot.
        if (this.empty) {
            return undefined;
        }
        else {
            let { begin, items } = this;
            let item = items[begin];
            items[begin] = undefined;
            this.begin = (begin + 1) % items.length;
            return item;
        }
    }
    step() {
        // Return the current beginning after making it the new end.
        let wasEmpty = this.empty;
        let item = this.shift();
        if (!wasEmpty) {
            this.push(item);
        }
        return item;
    }
    *[Symbol.iterator]() {
        // TODO How to make Ring directly Iterable?
        let { items } = this;
        let capacity = items.length;
        for (let i = this.begin; i != this.end; i = (i + 1) % capacity) {
            yield items[i];
        }
    }
}
function cartesianProduct(object) {
    function cartProdList(input, current) {
        if (!input || !input.length) {
            return [];
        }
        let head = input[0];
        let tail = input.slice(1);
        let output = [];
        for (let key in head) {
            for (let i = 0; i < head[key].length; i++) {
                let newCurrent = Object.assign({}, current);
                newCurrent[key] = head[key][i];
                if (tail.length) {
                    let productOfTail = cartProdList(tail, newCurrent);
                    output = output.concat(productOfTail);
                }
                else {
                    output.push(newCurrent);
                }
            }
        }
        return output;
    }
    let split = Object.keys(object).map(key => ({ [key]: object[key] }));
    return cartProdList(split);
}
function createId(byteSize = 16) {
    let array = new Uint8Array(byteSize);
    window.crypto.getRandomValues(array);
    return Array.from(array).map(i => i.toString(16)).join('');
}
function formatTime(seconds) {
    let sign = Math.sign(seconds) < 0 ? '-' : '';
    seconds = Math.abs(seconds);
    // Millis.
    let millis = seconds - Math.floor(seconds);
    millis = Math.floor(millis * 1000);
    // Minutes, because we shouldn't ever get to hours.
    seconds = Math.floor(seconds);
    let minutes = Math.floor(seconds / 60);
    let minutesText = minutes ? `${minutes}:` : '';
    // Seconds.
    seconds = seconds % 60;
    let secondsText = padZero(seconds, minutes ? 2 : 1);
    // All together.
    return `${sign}${minutesText}${secondsText}.${padZero(millis, 3)}`;
}
function load(html) {
    let div = window.document.createElement('div');
    div.innerHTML = html;
    return div.firstElementChild;
}
function padZero(integer, size) {
    let result = '' + integer;
    if (result.length < size) {
        // Sloppy overkill.
        result = `00000000000000000000000${result}`;
        result = result.slice(-size);
    }
    return result;
}

// EXTERNAL MODULE: ./node_modules/three/build/three.js
var three = __webpack_require__(0);
var three_default = /*#__PURE__*/__webpack_require__.n(three);

// CONCATENATED MODULE: ./src/game.ts


class Dialog {
    constructor(game) {
        this.game = game;
    }
    onHide() { }
    onKey(event, down) { }
}
class Mode {
    constructor(game) {
        this.game = game;
    }
    enter() { }
    exit() { }
    getButton(command) {
        return this.game.body.querySelector(`.panel .${command}`);
    }
    mouseDown(event) { }
    mouseMove(event) { }
    mouseUp(event) { }
    onClick(command, handler) {
        this.getButton(command).addEventListener('click', handler);
    }
    onHideDialog(dialog) { }
    // For now, only happens in certain contexts.
    onKeyDown(key) { }
    resize() { }
    tick() { }
    toggleClasses(options) {
        let { classList } = options.element;
        if (options.value) {
            classList.add(options.trueClass);
            classList.remove(options.falseClass);
        }
        else {
            classList.add(options.falseClass);
            classList.remove(options.trueClass);
        }
    }
    // Beyond updating the stage.
    updateView() { }
}
class game_Game {
    constructor(body) {
        this.keepOpen = false;
        this.stage = new stage_Stage(this);
        this.body = body;
        // UI.
        let dialogBox = body.querySelector('.dialogBox');
        dialogBox.addEventListener('click', ({ target }) => {
            if (target == dialogBox) {
                this.hideDialog();
            }
        });
        // Load the current level.
        // TODO Define what "current level" means.
        // TODO An encoding more human-friendly than JSON.
        this.zone = loadZone();
        this.tower = loadTower(this.zone);
        this.level = loadLevel(this.tower);
        // TODO Extract some setup to graphics modes?
        // Renderer.
        let canvas = body.querySelector('.stage');
        let renderer = this.renderer =
            new three["WebGLRenderer"]({ antialias: false, canvas });
        // Camera.
        // Retain this view across themes.
        this.camera = new three["OrthographicCamera"](0, level_Level.pixelCount.x, level_Level.pixelCount.y, 0, -1e5, 1e5);
        this.camera.position.z = 1;
        // Resize handling after renderer and camera.
        window.addEventListener('resize', () => this.resize());
        this.resize();
        canvas.style.display = 'block';
        // Scene.
        this.scene = new three["Scene"]();
        // Modes. After we have a level for them to reference.
        this.edit = new edit_EditMode(this);
        this.play = new play_PlayMode(this);
        this.test = new play_TestMode(this);
        // Cheat set early to avoid errors, but it really kicks in on the timeout.
        this.mode = this.play;
        setTimeout(() => this.setMode(this.mode), 0);
        // Input handlers.
        this.control = new Control(this);
        canvas.addEventListener('mousedown', event => this.mouseDown(event));
        window.addEventListener('mousemove', event => this.mouseMove(event));
        window.addEventListener('mouseup', event => this.mouseUp(event));
    }
    hideDialog() {
        if (this.keepOpen) {
            return;
        }
        if (this.dialog) {
            this.dialog.onHide();
            this.mode.onHideDialog(this.dialog);
        }
        this.body.querySelector('.pane').style.display = 'none';
        this.dialog = undefined;
    }
    mouseDown(event) {
        let point = new three["Vector2"](event.offsetX, event.offsetY);
        this.mode.mouseDown({
            point: this.scalePoint(point),
        });
        event.preventDefault();
    }
    mouseMove(event) {
        let bounding = this.renderer.domElement.getBoundingClientRect();
        // TODO I'm not sure the scroll math is right, but I don't scroll anyway.
        let point = new three["Vector2"](event.pageX - (bounding.left + window.scrollX), event.pageY - (bounding.top + window.scrollY));
        this.mode.mouseMove({
            point: this.scalePoint(point),
        });
    }
    mouseUp(event) {
        this.mode.mouseUp({
            point: new three["Vector2"](),
        });
    }
    render() {
        // Prep next frame first for best fps.
        requestAnimationFrame(() => this.render());
        // Handle input.
        this.control.update();
        // Render stage.
        this.mode.tick();
        if (this.redraw) {
            this.redraw();
        }
        this.renderer.render(this.scene, this.camera);
    }
    resize() {
        // This is a hack to let the layout adjust without concern for the canvas
        // size.
        // TODO Set a class that lets us overflow instead of shrinking?
        // TODO The disappearing here can be jarring on continuous resize.
        this.renderer.setSize(1, 1);
        window.setTimeout(() => {
            // Now take the available space.
            let view = document.body.querySelector('.view');
            let viewSize = new three["Vector2"](view.clientWidth, view.clientHeight);
            let viewRatio = viewSize.x / viewSize.y;
            let pixelRatio = level_Level.pixelCount.x / level_Level.pixelCount.y;
            let canvasSize = new three["Vector2"]();
            let { classList } = this.renderer.domElement;
            if (pixelRatio < viewRatio) {
                canvasSize.x = Math.round(pixelRatio * viewSize.y);
                canvasSize.y = viewSize.y;
                classList.add('vertical');
                classList.remove('horizontal');
            }
            else {
                canvasSize.x = viewSize.x;
                canvasSize.y = Math.round(viewSize.x / pixelRatio);
                classList.add('horizontal');
                classList.remove('vertical');
            }
            let offset = viewSize.clone().sub(canvasSize).divideScalar(2);
            this.renderer.domElement.style.left = `${offset.x}px`;
            this.renderer.setSize(canvasSize.x, canvasSize.y);
            this.mode.resize();
        }, 0);
    }
    setMode(mode) {
        // Exit the current mode.
        let { classList } = this.body;
        if (this.mode) {
            classList.remove(this.mode.bodyClass);
            this.mode.exit();
        }
        // Set the new value.
        this.mode = mode;
        // Enter the new mode.
        // Update the stage, since that's often needed.
        // Do this *after* the mode gets set.
        this.level.updateStage(this, true);
        classList.add(mode.bodyClass);
        this.mode.enter();
        this.theme.modeChanged();
    }
    scalePoint(point) {
        let canvas = this.renderer.domElement;
        point.divide(new three["Vector2"](canvas.clientWidth, canvas.clientHeight));
        // Put +y up, like GL.
        point.y = 1 - point.y;
        point.multiply(level_Level.pixelCount);
        return point;
    }
    showDialog(dialog) {
        let pane = this.body.querySelector('.pane');
        let dialogBox = pane.querySelector('.dialogBox');
        while (dialogBox.lastChild) {
            dialogBox.removeChild(dialogBox.lastChild);
        }
        dialogBox.appendChild(dialog.content);
        pane.style.display = 'block';
        this.dialog = dialog;
    }
    showLevel(level) {
        // TODO Something here is messing with different level objects vs edit state.
        this.level = new level_Level().decode(level);
        let editState = this.edit.editState;
        if (!editState.history.length) {
            // Make sure we have at least one history item.
            editState.pushHistory(true);
        }
        // This trackChange is just to enable/disable undo/redo.
        editState.trackChange(true);
        this.level.updateStage(this, true);
    }
    showingDialog() {
        let pane = this.body.querySelector('.pane');
        let style = window.getComputedStyle(pane);
        return style.display != 'none';
    }
}
// TODO Simplify.
function loadLevel(towerMeta) {
    let tower = new level_Tower().load(towerMeta.id);
    let levelId = window.localStorage['zym.levelId'];
    let level = new level_Level();
    if (levelId) {
        level = new level_Level().load(levelId);
    }
    else {
        if (tower.items.length) {
            // Choose the first level already in the tower.
            level = new level_Level().decode(tower.items[0]);
        }
        else {
            // New level in the tower.
            level.save();
        }
    }
    let found = tower.items.find(item => item.id == level.id);
    if (!found) {
        // This level isn't in the current tower. Add it.
        // TODO Make sure we keep tower and level selection in sync!
        found = level.encode();
        tower.items.push(found);
        tower.save();
    }
    tower.numberItems();
    level.number = found.number;
    return level;
}
// TODO Simplify.
function loadTower(zoneMeta) {
    let tower = new level_Tower();
    let towerId = window.localStorage['zym.towerId'] || window.localStorage['zym.worldId'];
    if (towerId) {
        let rawTower = Raw.load(towerId);
        if (rawTower) {
            if (rawTower.levels) {
                // Update to generic form.
                // TODO(tjp): Remove this once all converted?
                rawTower.items = rawTower.levels;
                delete rawTower.levels;
                Raw.save(rawTower);
            }
            tower.decode(rawTower);
        }
        else {
            // Save the tower for next time.
            tower.save();
        }
    }
    else {
        // Save the tower for next time.
        tower = mainTower;
    }
    let zone = new Zone().load(zoneMeta.id);
    if (!zone.items.some(item => item.id == tower.id)) {
        // This level isn't in the current tower. Add it.
        // TODO Make sure we keep tower and level selection in sync!
        zone.items.push(tower.encode());
        zone.save();
    }
    // This might save the new id or just overwrite. TODO Be more precise?
    window.localStorage['zym.towerId'] = tower.id;
    delete window.localStorage['zym.worldId'];
    return Raw.encodeMeta(tower);
}
// TODO Simplify.
function loadZone() {
    let zone = new Zone();
    let zoneId = window.localStorage['zym.zoneId'];
    if (zoneId) {
        let rawZone = Raw.load(zoneId);
        if (rawZone) {
            zone.decode(rawZone);
        }
        else {
            zone.save();
        }
    }
    else {
        zone.save();
    }
    // Make sure we have main.
    mainTower = level_Tower.hashify(__webpack_require__(6), true);
    if (!zone.items.find(tower => tower.id == mainTower.id)) {
        zone.items.splice(0, 0, mainTower.encode());
        zone.save();
    }
    // This might save the new id or just overwrite. TODO Be more precise?
    window.localStorage['zym.zoneId'] = zone.id;
    return Raw.encodeMeta(zone);
}
let mainTower;

// CONCATENATED MODULE: ./src/part.ts


var Edge;
(function (Edge) {
    Edge[Edge["all"] = 0] = "all";
    Edge[Edge["bottom"] = 1] = "bottom";
    Edge[Edge["left"] = 2] = "left";
    Edge[Edge["right"] = 3] = "right";
    Edge[Edge["top"] = 4] = "top";
})(Edge = Edge || (Edge = {}));
class part_Part {
    constructor(game) {
        this.active = true;
        this.art = undefined;
        this.carried = false;
        // A hack to work around existing code that didn't have cropping.
        // TODO Better would be to figure out why things don't work when I don't add
        // TODO a part to the stage.
        this.cropped = false;
        this.dead = false;
        // A way of drawing attention.
        this.keyTime = -10;
        this.move = new three["Vector2"]();
        this.moved = new three["Vector2"]();
        this.phaseBeginPoint = new three["Vector2"]();
        this.phaseBeginTime = 0;
        this.phaseEndPoint = new three["Vector2"]();
        this.phaseEndTime = 0;
        this.point = new three["Vector2"]();
        this.supported = undefined;
        this.workPoint = new three["Vector2"]();
        this.game = game;
    }
    static get base() {
        return this;
    }
    static get common() {
        return this;
    }
    static get key() {
        // TODO This handles name mangling. Maybe just go explicit.
        return this.name.split('_').slice(-1)[0].toLowerCase();
    }
    static make(game) {
        return new this(game);
    }
    // Bars catch heros and enemies, and burned bricks catch enemies (or inside
    // solid for burned bricks?).
    catches(part) {
        return false;
    }
    choose() { }
    climbable(other) {
        return false;
    }
    contains(point) {
        let { x, y } = this.point;
        return (point.x >= x && point.x < x + level_Level.tileSize.x &&
            point.y >= y && point.y < y + level_Level.tileSize.y);
    }
    die(killer) {
        let wasDead = this.dead;
        if (!wasDead) {
            // TODO Handle subtype death event in separate function.
            this.dead = true;
            this.game.stage.died(this);
        }
    }
    // For overriding.
    editPlacedAt(tilePoint) { }
    get exists() {
        return this.active;
    }
    // TODO Switch to using this once we have moving supports (enemies)!!
    partAt(x, y, keep) {
        return (this.game.stage.partAt(this.workPoint.set(x, y).add(this.point), keep));
    }
    // TODO Switch to using this once we have moving supports (enemies)!!
    partsAt(x, y) {
        return (this.game.stage.partsAt(this.workPoint.set(x, y).add(this.point)));
    }
    partsNear(x, y) {
        return (this.game.stage.partsNear(this.workPoint.set(x, y).add(this.point)) ||
            []);
    }
    get phased() {
        return this.game.stage.time < this.phaseEndTime;
    }
    reset() { }
    get shootable() {
        return this.solid(this);
    }
    get shotKillable() {
        return false;
    }
    // TODO Inside solid for burned bricks vs enemies, or launchers for all?
    solid(other, edge, seems) {
        return false;
    }
    solidInside(other, edge) {
        return false;
    }
    get substantial() {
        return this.exists;
    }
    supportedGone(oldSupported) { }
    surface(other, seems) {
        return false;
    }
    touchKills(other) {
        return this.solid(other);
    }
    trackSupported(other, active) {
        if (active) {
            if (!this.supported) {
                this.supported = other;
            }
        }
        else {
            if (this.supported == other) {
                this.supported = undefined;
                this.supportedGone(other);
            }
        }
    }
    get type() {
        return this.constructor;
    }
    update() { }
    // State that can be updated on stage init.
    updateInfo() { }
}
part_Part.breaking = false;
part_Part.ender = false;
part_Part.falling = false;
part_Part.invisible = false;
part_Part.options = {
    breaking: true,
    ender: true,
    falling: true,
    invisible: true,
};

// CONCATENATED MODULE: ./src/parts/runner.ts


class Blocker {
}
class runner_Runner extends part_Part {
    constructor() {
        super(...arguments);
        this.align = new three["Vector2"]();
        this.climber = true;
        this.climbing = false;
        this.oldCatcher = undefined;
        this.oldPoint = new three["Vector2"]();
        this.intendedMove = new three["Vector2"]();
        this.seesInvisible = false;
        this.support = undefined;
        // Move some of these to module global. We're sync, right?
        this.workPointExtra = new three["Vector2"]();
    }
    carriedMove(x) { }
    encased(solid = false) {
        let check = solid ?
            (part) => part.solid(this) && part != this :
            (part) => part.touchKills(this) && part != this;
        return (this.partsAt(0, 0).some(check) ||
            this.partsAt(0, runner_top).some(check) ||
            this.partsAt(right, 0).some(check) ||
            this.partsAt(right, runner_top).some(check));
    }
    findAlign(edge, minParts, maxParts) {
        // Find where an opening is, so we can align to that.
        if (!minParts.some(part => part.solid(this, edge))) {
            return -1;
        }
        if (!maxParts.some(part => part.solid(this, edge))) {
            return 1;
        }
        return 0;
    }
    getCatcher(exact = true) {
        let catches = (part) => part.catches(this);
        let check = (x, y) => {
            let catcher = this.partAt(x, y, catches);
            if (catcher) {
                if (exact && this.point.y != catcher.point.y) {
                    catcher = undefined;
                }
                return catcher;
            }
        };
        // In exact mode, no need to see which is higher, but we're not always
        // exact.
        let part1 = check(midLeft, runner_top);
        let part2 = check(midRight, runner_top);
        if (!(part1 && part2)) {
            return part1 || part2;
        }
        return part1.point.y > part2.point.y ? part1 : part2;
    }
    getClimbable(leftParts, rightParts) {
        let isClimbable = (part) => part.climbable(this) && part != this;
        return leftParts.find(isClimbable) || rightParts.find(isClimbable);
    }
    getClimbableDown() {
        let isClimbable = (part) => part.climbable(this) && part != this;
        let climbableAt = (x, y) => this.partAt(x, y, isClimbable);
        return climbableAt(midLeft, -1) || climbableAt(midRight, -1);
    }
    getClimbableUp() {
        let isClimbable = (part) => part.climbable(this) && part != this;
        let climbableAt = (x, y) => this.partAt(x, y, isClimbable);
        return (climbableAt(midLeft, 0) || climbableAt(midRight, 0) ||
            // Allow dangling.
            climbableAt(midLeft, runner_top) || climbableAt(midRight, runner_top));
    }
    getBlockerDown(point) {
        let blockY = (blocker) => blocker.point.y;
        let offX = point.x - this.point.x;
        let blocker1 = this.getSolid(Edge.top, offX, 0);
        let blocker2 = this.getSolid(Edge.top, right + offX, 0);
        let blocker = argmax(blockY, blocker1, blocker2);
        let fixY = point.y;
        if (blocker) {
            fixY = blocker.point.y + level_Level.tileSize.y;
        }
        else {
            blocker1 = this.getSolidInside(Edge.bottom, offX, 0, 0, this.move.y);
            blocker2 =
                this.getSolidInside(Edge.bottom, right + offX, 0, 0, this.move.y);
            blocker = argmax(blockY, blocker1, blocker2);
            if (blocker) {
                fixY = blocker.point.y;
            }
        }
        return blocker && { part: blocker, pos: fixY };
    }
    getBlockerLeft(point) {
        let blockX = (blocker) => blocker.point.x;
        let offY = point.y - this.point.y;
        let blocker1 = this.getSolid(Edge.right, 0, offY);
        let blocker2 = this.getSolid(Edge.right, 0, runner_top + offY);
        let blocker = argmax(blockX, blocker1, blocker2);
        let fixX = point.x;
        if (blocker) {
            fixX = blocker.point.x + level_Level.tileSize.x;
        }
        else {
            blocker1 = this.getSolidInside(Edge.left, 0, offY, this.move.x, 0);
            blocker2 = this.getSolidInside(Edge.left, 0, runner_top + offY, this.move.x, 0);
            blocker = argmax(blockX, blocker1, blocker2);
            if (blocker) {
                fixX = blocker.point.x;
            }
        }
        return blocker && { part: blocker, pos: fixX };
    }
    getBlockerRight(point) {
        let blockX = (blocker) => blocker.point.x;
        let offY = point.y - this.point.y;
        let blocker1 = this.getSolid(Edge.left, right, offY);
        let blocker2 = this.getSolid(Edge.left, right, runner_top + offY);
        let blocker = argmin(blockX, blocker1, blocker2);
        let fixX = point.x;
        if (blocker) {
            fixX = blocker.point.x - level_Level.tileSize.x;
        }
        else {
            blocker1 = this.getSolidInside(Edge.right, right, offY, this.move.x, 0);
            blocker2 =
                this.getSolidInside(Edge.right, right, runner_top + offY, this.move.x, 0);
            blocker = argmin(blockX, blocker1, blocker2);
            if (blocker) {
                fixX = blocker.point.x;
            }
        }
        return blocker && { part: blocker, pos: fixX };
    }
    getBlockerUp(point) {
        let blockY = (blocker) => blocker.point.y;
        let offX = point.x - this.point.x;
        let blocker1 = this.getSolid(Edge.bottom, offX, runner_top);
        let blocker2 = this.getSolid(Edge.bottom, right + offX, runner_top);
        let blocker = argmin(blockY, blocker1, blocker2);
        let fixY = point.y;
        if (blocker) {
            fixY = blocker.point.y - level_Level.tileSize.y;
        }
        else {
            blocker1 = this.getSolidInside(Edge.top, offX, runner_top, 0, this.move.y);
            blocker2 =
                this.getSolidInside(Edge.top, right + offX, runner_top, 0, this.move.y);
            blocker = argmin(blockY, blocker1, blocker2);
            if (blocker) {
                fixY = blocker.point.y;
            }
        }
        return blocker && { part: blocker, pos: fixY };
    }
    getSolid(edge, x, y, seems) {
        let isSolid = (part) => part.solid(this, edge, seems) && part != this;
        return this.partAt(x, y, isSolid);
    }
    getSolidInside(edge, x, y, dx, dy) {
        let isSolid = (part) => part.solidInside(this, edge) && part != this;
        x -= dx;
        y -= dy;
        let solid = this.partAt(x, y, isSolid);
        if (solid) {
            this.workPointExtra.set(x + dx, y + dy).add(this.point);
            if (!solid.contains(this.workPointExtra)) {
                // Moving would put us outside the bounds, so we hit the inside.
                return solid;
            }
        }
        // implied return undefined;
    }
    getSupport(exact) {
        // TODO Check which is higher!
        return this.getSurface() || this.getCatcher(exact);
    }
    getSurface(condition, seems) {
        if (!condition) {
            condition = part => true;
        }
        let isSurface = (part) => part.surface(this, seems) && part != this && condition(part);
        // TODO Replace all -1 with -epsilon?
        let part1 = this.partAt(3, -1, isSurface);
        let part2 = this.partAt(midRight, -1, isSurface);
        if (!(part1 && part2)) {
            return part1 || part2;
        }
        return part1.point.y > part2.point.y ? part1 : part2;
    }
    processAction(action) {
        // TODO Let changed keys override old ones.
        // TODO Find all actions (and alignments) before moving, for enemies?
        let { stage } = this.game;
        let { align, move, oldPoint, point, speed, workPoint } = this;
        if (this.phased) {
            action.clear();
            // We get off by one without this.
            this.point.copy(this.phaseEndPoint);
        }
        // Intended move, not actual.
        this.intendedMove.x = action.left ? -1 : action.right ? 1 : 0;
        this.intendedMove.y = action.down ? -1 : action.up ? 1 : 0;
        // Action.
        this.climbing = false;
        oldPoint.copy(point);
        move.setScalar(0);
        let epsilon = 1e-2;
        let leftParts = this.partsNear(3, -1);
        let rightParts = this.partsNear(midRight, -1);
        // Pixel-specific for surfaces, because enemies are moving surfaces.
        let support = this.getSupport();
        let oldCatcher = this.climber ? this.getCatcher(false) : undefined;
        // Unless we get moving climbables (falling ladders?), we can stick to near
        // (same grid position) for climbables.
        let inClimbable = this.getClimbable(this.partsNear(3, 0), this.partsNear(midRight, 0)) ||
            // Allow dangling.
            this.getClimbable(this.partsNear(3, runner_top), this.partsNear(midRight, runner_top));
        this.climbing = !!inClimbable;
        // Keep the support the highest thing.
        let climbable = inClimbable || this.getClimbable(leftParts, rightParts);
        if (!this.climber) {
            this.climbing = false;
            climbable = undefined;
        }
        // TODO Why did I have support.point.y < climbable.point.y?
        // TODO Maybe so I don't get dragged by a walking enemy while on a ladder?
        // if (climbable && (!support || support.point.y < climbable.point.y)) {
        if (climbable && !support) {
            support = climbable;
        }
        if (this.encased()) {
            // This could happen if a brick just enclosed on part of us.
            this.die();
        }
        else if (support) {
            // Prioritize vertical for enemy ai reasons, also because rarer options.
            // TODO Remember old move options to allow easier transition?
            if (!this.encased(true)) {
                if (climbable || !support.surface(this)) {
                    // Now move up or down.
                    if (action.down) {
                        move.y = -1;
                    }
                    else if (action.up && inClimbable) {
                        move.y = 1;
                    }
                }
                if (!move.y) {
                    if (action.left) {
                        move.x = -1;
                    }
                    else if (action.right) {
                        move.x = 1;
                    }
                }
            }
        }
        else {
            move.y = -1;
        }
        // Check for alignment when climbing and falling near climbables.
        let isClimbable = (part) => part.climbable(this) && part != this;
        if (move.y) {
            let checkY = move.y < 0 ? TilePos.bottom : TilePos.top;
            let climbLeft = this.partAt(TilePos.left, checkY, isClimbable);
            let climbRight = this.partAt(TilePos.right, checkY, isClimbable);
            if (climbLeft || climbRight) {
                if (climbLeft && climbRight) {
                    if (climbLeft.type != climbRight.type) {
                        // Find the closer one, and no need for abs, since we know order.
                        if (point.x - climbLeft.point.x < climbRight.point.x - point.x) {
                            point.x = climbLeft.point.x;
                        }
                        else {
                            point.x = climbRight.point.x;
                        }
                    }
                }
                else {
                    if (climbLeft) {
                        if (this.climbing) {
                            point.x = climbLeft.point.x;
                        }
                        else {
                            point.x = climbLeft.point.x + 8;
                        }
                    }
                    else {
                        if (this.climbing) {
                            point.x = climbRight.point.x;
                        }
                        else {
                            point.x = climbRight.point.x - 8;
                        }
                    }
                }
            }
        }
        else if (move.x) {
            let checkX = move.x < 0 ? TilePos.left : TilePos.right;
            let climbBottom = this.partAt(checkX, TilePos.bottom, isClimbable);
            let climbTop = this.partAt(checkX, TilePos.top, isClimbable);
            if (climbBottom || climbTop) {
                if (climbBottom && climbTop) {
                    if (climbBottom.type != climbTop.type) {
                        // Find the closer one, and no need for abs, since we know order.
                        if (point.y - climbBottom.point.y < climbTop.point.y - point.y) {
                            point.y = climbBottom.point.y;
                        }
                        else {
                            point.y = climbTop.point.y;
                        }
                    }
                }
                else {
                    // For align to row, we can fall out of climbables, unlike for column
                    // alignment.
                    // Still, err on the side of climbing with <=.
                    if (climbBottom) {
                        if (point.y - climbBottom.point.y <= 5) {
                            point.y = climbBottom.point.y;
                        }
                        else {
                            point.y = climbBottom.point.y + 10;
                        }
                    }
                    else {
                        if (climbTop.point.y - point.y <= 5) {
                            point.y = climbTop.point.y;
                        }
                        else {
                            point.y = climbTop.point.y - 10;
                        }
                    }
                }
            }
        }
        // TODO Add tiny random amounts here so we don't stay aligned?
        // TODO But no randomness so far, right?
        move.multiply(speed);
        this.oldCatcher = oldCatcher;
        // Assign and track supports.
        if (this.support && support != this.support) {
            this.support.trackSupported(this, false);
        }
        this.support = support;
        if (support) {
            support.trackSupported(this, true);
        }
    }
    get shootable() {
        return true;
    }
    get shotKillable() {
        return true;
    }
    take(prize) {
        // For overriding.
        return false;
    }
    update() {
        // Change player position.
        let { align, move, oldCatcher, oldPoint, point, speed, support } = this;
        if (support) {
            if (support.move.y <= 0 && move.y <= 0) {
                let gap = support.point.y + level_Level.tileSize.y - point.y;
                if (gap < 0 && speed.y >= -support.move.y) {
                    // Try to put us directly on the support.
                    move.y = gap;
                }
            }
            if (this.carried) {
                // TODO Allow being carried.
                // TODO This includes attempted but constrained move.
                // TODO How to know final move? Could try a part.moved ...
                // TODO Intermediate constraints???
                // TODO When this was active, a guy could walk toward me in pit.
                // TODO Tried moved now. Does it work?
                let carriedMove = support.moved.x;
                move.x += carriedMove;
                this.carriedMove(carriedMove);
            }
        }
        point.add(move);
        // See if we need to fix things.
        let blockX = (getBlocker) => {
            let blocker = getBlocker(point);
            if (blocker) {
                let oldY = point.y;
                if (blocker.part.point.y - point.y >= 5) {
                    // See if we can shift down.
                    runner_workPoint.set(point.x, blocker.part.point.y - 10);
                    if (!getBlocker(runner_workPoint)) {
                        point.y = blocker.part.point.y - 10;
                        // TODO Don't cross inside solids, either!
                        if (this.encased()) {
                            point.y = oldY;
                        }
                        else {
                            blocker = undefined;
                        }
                    }
                }
                else if (point.y - blocker.part.point.y >= 5) {
                    // See if we can shift up.
                    runner_workPoint.set(point.x, blocker.part.point.y + 10);
                    if (!getBlocker(runner_workPoint)) {
                        point.y = blocker.part.point.y + 10;
                        // TODO Don't cross inside solids, either!
                        if (this.encased()) {
                            point.y = oldY;
                        }
                        else {
                            blocker = undefined;
                        }
                    }
                }
                if (blocker) {
                    point.x = blocker.pos;
                }
            }
        };
        let blockY = (getBlocker) => {
            let blocker = getBlocker(point);
            if (blocker) {
                let oldX = point.x;
                if (blocker.part.point.x - point.x >= 4) {
                    // See if we can shift left.
                    runner_workPoint.set(blocker.part.point.x - 8, point.y);
                    if (!getBlocker(runner_workPoint)) {
                        point.x = blocker.part.point.x - 8;
                        if (this.encased()) {
                            point.x = oldX;
                        }
                        else {
                            blocker = undefined;
                        }
                    }
                }
                else if (point.x - blocker.part.point.x >= 4) {
                    // See if we can shift right.
                    runner_workPoint.set(blocker.part.point.x + 8, point.y);
                    if (!getBlocker(runner_workPoint)) {
                        point.x = blocker.part.point.x + 8;
                        if (this.encased()) {
                            point.x = oldX;
                        }
                        else {
                            blocker = undefined;
                        }
                    }
                }
                if (blocker) {
                    point.y = blocker.pos;
                }
            }
        };
        if (move.x < 0) {
            blockX(point => this.getBlockerLeft(point));
        }
        else if (move.x > 0) {
            blockX(point => this.getBlockerRight(point));
        }
        // TODO Align only when forced or to enable movement, not just for grid.
        // TODO Defer this until first pass of all moving parts so we can resolve
        // TODO together?
        // See if we need to align y for solids.
        if (move.y < 0) {
            blockY(point => this.getBlockerDown(point));
            // TODO What below is needed? At least new catcher?
            // TODO It would be nice to fall full off surfaces, even if non-solid and
            // TODO non-climbable, but we don't right now.
            // Surface checks halfway, but solid checks ends.
            // This seems odd, but it usually shouldn't matter, since alignment to
            // open spaces should make them equivalent.
            // I'm not sure if there are times when it will matter, but it's hard to
            // say in those cases what to do anyway.
            let newSupport = support ? undefined : this.getSurface();
            let blocker1 = this.getSolid(Edge.top, 0, 0);
            let blocker2 = this.getSolid(Edge.top, right, 0);
            let blockY2 = (blocker) => blocker ? blocker.point.y : -level_Level.tileSize.y;
            if (newSupport || blocker1 || blocker2) {
                let y = Math.max(blockY2(newSupport), blockY2(blocker1), blockY2(blocker2));
                point.y = y + level_Level.tileSize.y;
            }
            else {
                // TODO Unify catcher and inside bottom solids at all?
                blocker1 = this.getSolidInside(Edge.bottom, 0, 0, 0, move.y);
                blocker2 = this.getSolidInside(Edge.bottom, right, 0, 0, move.y);
                if (blocker1 || blocker2) {
                    let y = Math.max(blockY2(blocker1), blockY2(blocker2));
                    point.y = y;
                }
                else if (this.climber) {
                    // See if we entered a catcher.
                    let newCatcher = this.getCatcher(false);
                    if (newCatcher && newCatcher != oldCatcher) {
                        point.y = newCatcher.point.y;
                    }
                }
            }
        }
        else if (move.y > 0) {
            blockY(point => this.getBlockerUp(point));
        }
        // Update moved to the actual move, and update the stage.
        this.moved.copy(this.point).sub(oldPoint);
        this.game.stage.moved(this, oldPoint);
        // Update info that doesn't involve moving.
        this.updateInfo();
    }
    updateInfo() {
        this.seesInvisible = false;
        for (let i = -1; i <= 1; ++i) {
            for (let j = -1; j <= 1; ++j) {
                runner_workPoint.set(j, i).addScalar(0.5).multiply(level_Level.tileSize);
                let invisible = this.partAt(runner_workPoint.x, runner_workPoint.y, part => part.type.invisible);
                if (invisible) {
                    this.seesInvisible = true;
                    break;
                }
            }
        }
    }
}
runner_Runner.options = {
    breaking: false,
    ender: true,
    falling: false,
    invisible: false,
};
function argmax(f, a, b) {
    if (a && b) {
        return f(a) > f(b) ? a : b;
    }
    else {
        return a || b;
    }
}
function argmin(f, a, b) {
    if (a && b) {
        return f(a) < f(b) ? a : b;
    }
    else {
        return a || b;
    }
}
let epsilon = 1e-2;
const TilePos = {
    bottom: epsilon,
    left: epsilon,
    midBottom: 4 + epsilon,
    midLeft: 3 + epsilon,
    midRight: 5 - epsilon,
    midTop: 6 - epsilon,
    right: 8 - epsilon,
    top: 10 - epsilon,
};
let { midBottom, midLeft, midRight, midTop, right, top: runner_top } = TilePos;
let runner_workPoint = new three["Vector2"]();

// CONCATENATED MODULE: ./src/parts/bar.ts


class bar_Bar extends part_Part {
    catches(part) {
        return part instanceof runner_Runner;
    }
}
bar_Bar.char = '-';
bar_Bar.options = {
    breaking: true,
    ender: true,
    falling: false,
    invisible: true,
};

// CONCATENATED MODULE: ./src/parts/biggie.ts



class biggie_Biggie extends runner_Runner {
    constructor() {
        super(...arguments);
        this.action = new RunnerAction();
        this.climber = false;
        this.facing = 0;
        this.hold = false;
        this.lastTurn = 0;
        this.speed = new three["Vector2"](0.3, 0.7);
        this.workPoint2 = new three["Vector2"]();
    }
    checkTurn() {
        if (this.moved.y) {
            // No turn while falling.
            return;
        }
        let x = this.facing < 0 ? TilePos.midLeft : TilePos.midRight;
        let ahead = this.partAt(x, -1, part => part.surface(this) || part.solid(this, Edge.top, true));
        checkMore: if (ahead) {
            if (ahead.climbable) {
                // Don't walk through continuous climbables.
                let commonType = ahead.type.common;
                if (this.partAt(x, 5, part => part.type.common == commonType)) {
                    ahead = undefined;
                    break checkMore;
                }
            }
            x = this.facing < 0 ? -1 : 9;
            let edge = this.facing < 0 ? Edge.right : Edge.left;
            let wall = this.partAt(x, 0, part => part.solid(this, edge, true));
            if (wall) {
                ahead = undefined;
                break checkMore;
            }
            // Inside edges are opposite outside.
            edge = this.facing < 0 ? Edge.left : Edge.right;
            wall = this.getSolidInside(edge, x, 0, this.facing, 0);
            if (wall) {
                ahead = undefined;
                break checkMore;
            }
        }
        if (!ahead) {
            if (this.lastTurn < this.game.stage.time - 0.25) {
                this.facing = -this.facing;
                this.lastTurn = this.game.stage.time;
            }
            else {
                this.hold = true;
            }
        }
    }
    choose() {
        this.clearAction();
        if (!this.dead) {
            this.checkTurn();
            if (!this.hold) {
                if (this.facing < 0) {
                    this.action.left = true;
                }
                else {
                    this.action.right = true;
                }
            }
        }
        this.processAction(this.action);
    }
    clearAction() {
        this.action.clear();
        this.hold = false;
    }
    get shotKillable() {
        return false;
    }
    solid(other, edge) {
        // Enemies block entrance to each other, but not exit from.
        // Just a touch of safety precaution.
        return other instanceof biggie_Biggie && !!edge;
    }
    surface(other) {
        return !(other instanceof enemy_Enemy);
    }
    update() {
        let hero = this.game.stage.hero;
        if (hero && !this.dead) {
            this.workPoint.copy(this.point).add(this.workPoint2.set(4, 5));
            if (hero.contains(this.workPoint)) {
                hero.die();
            }
        }
        super.update();
    }
}
class BiggieLeft extends biggie_Biggie {
    constructor() {
        super(...arguments);
        this.facing = -1;
    }
}
// The inside of the bracket faces forward to represent the head and foot or
// tread facing forward.
BiggieLeft.char = ']';
class BiggieRight extends biggie_Biggie {
    constructor() {
        super(...arguments);
        this.facing = 1;
    }
}
BiggieRight.char = '[';

// CONCATENATED MODULE: ./src/parts/brick.ts


class brick_Brick extends part_Part {
    constructor() {
        super(...arguments);
        this.burned = false;
    }
    get burnTime() {
        return this.game.stage.time - this.burnTimeStart;
    }
    get burnTimeLeft() {
        return totalGoneTime - this.burnTime;
    }
    catches(part) {
        return this.burned && part instanceof enemy_Enemy;
    }
    checkBurner(direction) {
        let { hero } = this.game.stage;
        if (this.burned || !hero) {
            return;
        }
        // See if there's a treasure above.
        // If so, disallow burning, so we can't get multiple in the same spot.
        // See if some visual or tutorial helps to convey the rule.
        // Uses workPoint.
        let treasureAbove = this.partAt(4, 11, part => part instanceof Treasure || part.solid(hero));
        // Now use workPoint manually.
        let { workPoint } = this;
        workPoint.copy(this.point);
        // Be somewhat near the base of the guy.
        // A little off to the side, though when pixel-aligned, 8 * dir is good
        // enough.
        workPoint.x += 4 + 9 * direction;
        workPoint.y += 12;
        if (hero.contains(workPoint) && !treasureAbove) {
            if (Math.abs(hero.point.y - 10 - this.point.y) < 4) {
                this.burned = true;
                this.burnTimeStart = this.game.stage.time;
            }
        }
    }
    choose() {
        let { control } = this.game;
        if (control.burnLeft) {
            this.checkBurner(1);
        }
        if (control.burnRight) {
            this.checkBurner(-1);
        }
        if (this.burnTimeLeft <= 0) {
            this.burned = false;
        }
    }
    climbable(other) {
        if (this.burned && other instanceof enemy_Enemy) {
            // Check dazed, so we don't look like we're trying to climb.
            if (other.catcher == this && !(other.dazed || other.dead)) {
                return true;
            }
        }
        return false;
    }
    solid(other, edge, seems) {
        return this.surface(other, seems);
    }
    get substantial() {
        return this.exists && !this.burned;
    }
    surface(other, seems) {
        return seems ? true : !this.burned;
    }
}
brick_Brick.char = 'B';
let totalGoneTime = 5;

// CONCATENATED MODULE: ./src/parts/crusher.ts


const { abs } = Math;
class Crusher extends part_Part {
    constructor() {
        super(...arguments);
        this.checkY = 0;
        this.hit = false;
        this.hitType = undefined;
    }
    choose() {
        if (!this.exists) {
            return;
        }
        let { stage } = this.game;
        this.handleHit();
        // TODO Better stacking of multiple?
        let other = this.partAt(4, 4, part => part.moved.y < 0);
        if (other) {
            if (Math.abs(other.point.y - (this.point.y + 4)) <= 1) {
                this.hit = true;
            }
            this.handleHit();
            if (this.hit) {
                if (abs(other.point.y - (this.point.y + 1)) <= 0.5) {
                    this.move.set(0, other.moved.y);
                    crusher_workPoint.copy(this.point);
                    this.point.y += other.moved.y;
                    stage.moved(this, crusher_workPoint);
                }
            }
        }
    }
    handleHit() {
        let { stage } = this.game;
        if (this.hit) {
            let part;
            if (this.hitType) {
                part = this.partAt(4, -1, part => part.type == this.hitType);
            }
            else {
                part = this.partAt(4, -1, part => part.substantial && !(part instanceof Crusher));
            }
            if (part) {
                this.hitType = part.type;
                this.checkY = part.point.y;
                part.die();
                part.active = false;
                stage.removed(part);
            }
            else if (this.hitType && abs(this.point.y - this.checkY) <= 0.7) {
                this.active = false;
                stage.removed(this);
            }
        }
    }
    solidInside(other, edge) {
        // Solid bottom is preventing walking out the sides at the moment.
        return false;
        // return edge == Edge.bottom && this.hit;
    }
}
Crusher.char = 'n';
Crusher.options = {
    breaking: false,
    ender: true,
    falling: false,
    invisible: true,
};
let crusher_workPoint = new three["Vector2"]();

// CONCATENATED MODULE: ./src/parts/dropper.ts



class dropper_Dropper extends part_Part {
    constructor(game) {
        super(game);
        this.lastDropTime = 0;
        this.drop = new dropper_Drop(game);
    }
    get shootable() {
        return true;
    }
    get shotKillable() {
        return true;
    }
    solid(other, edge) {
        return edge == Edge.top;
    }
    surface() {
        return true;
    }
    update() {
        let { drop } = this;
        let { stage } = this.game;
        if (this.dead) {
            return;
        }
        if (stage.time < 0.01) {
            dropper_workPoint2.copy(this.point).divide(level_Level.tileSize).floor();
            this.lastDropTime =
                (dropper_workPoint2.x + dropper_workPoint2.y * level_Level.tileCount.x) % 3;
        }
        let timeSince = stage.time - this.lastDropTime;
        if (!drop.active && timeSince > 3) {
            if (!drop.art) {
                this.game.theme.buildArt(drop);
            }
            drop.active = true;
            drop.point.copy(this.point);
            drop.stopTime = 0;
            stage.particles.push(drop);
            stage.added(drop);
            this.lastDropTime = stage.time;
        }
    }
}
dropper_Dropper.char = 'Y';
dropper_Dropper.options = {
    breaking: true,
    ender: true,
    falling: true,
    invisible: false,
};
class dropper_Drop extends runner_Runner {
    constructor() {
        super(...arguments);
        // Never moves anywhere by choice, but eh.
        this.action = new RunnerAction();
        this.active = false;
        this.climber = false;
        this.speed = new three["Vector2"](0.8, 0.8);
        this.stopTime = 0;
    }
    choose() {
        // Just for falling and such.
        super.processAction(this.action);
    }
    die() {
        this.active = false;
    }
    get exists() {
        return this.active;
    }
    get fadeScale() {
        return (this.game.stage.time - this.stopTime) / this.fadeTime;
    }
    get fadeTime() {
        return 0.2;
    }
    get shootable() {
        return true;
    }
    update() {
        let { stopTime } = this;
        let { hero, time } = this.game.stage;
        super.update();
        // Kill.
        if (hero && !this.dead) {
            dropper_workPoint2.set(4, 5);
            if (stopTime) {
                // Intersect low as it smashes the bottom.
                let extra = Math.min(this.fadeScale, 1) * 4.5;
                dropper_workPoint2.y -= extra;
            }
            this.workPoint.copy(this.point).add(dropper_workPoint2);
            if (hero.contains(this.workPoint)) {
                hero.die();
            }
        }
        // Die.
        // TODO After fading!
        if (!this.moved.y) {
            if (!stopTime) {
                this.stopTime = time;
            }
        }
        if (this.point.y < -10 || (stopTime && time - stopTime > this.fadeTime)) {
            this.die();
        }
    }
}
let dropper_workPoint2 = new three["Vector2"]();

// CONCATENATED MODULE: ./src/parts/enemy.ts



class enemy_Enemy extends runner_Runner {
    constructor() {
        super(...arguments);
        this.action = new RunnerAction();
        this.catcher = undefined;
        this.caughtTime = 0;
        this.dazed = false;
        this.lastWander = new three["Vector2"](1, 1);
        this.prize = undefined;
        // TODO They still get stuck when clumped in hordes after making this
        // TODO non-integer.
        // TODO Fix this sometime.
        this.speed = new three["Vector2"](0.7, 0.7);
        this.state = { x: State.chase, y: State.chase };
        this.waitPoint = new three["Vector2"]();
        this.waitPointHero = new three["Vector2"]();
        this.waitTime = new three["Vector2"]();
        this.workPoint2 = new three["Vector2"]();
    }
    avoidBottomless() {
        // Level design can still let enemies fall into steel traps or whatever, but
        // avoiding pits lets us more easily design floating island levels, which
        // seem cool at the moment.
        let { action, point: { y: myY } } = this;
        // Clear dangerous choices.
        if (action.down && (this.bottomlessAt(TilePos.midLeft, -1) ||
            this.bottomlessAt(TilePos.midRight, -1))) {
            action.down = false;
        }
        if (action.left && this.bottomlessAt(-1, 0)) {
            action.left = false;
        }
        if (action.right && this.bottomlessAt(9, 0)) {
            action.right = false;
        }
    }
    bottomlessAt(x, y) {
        let { point: { y: myY } } = this;
        // Look from checkPoint down.
        while (y + myY >= 0) {
            if (this.partAt(x, y, part => part.catches(this) || part.surface(this, true))) {
                // Something is here.
                return false;
            }
            y -= 10;
        }
        return true;
    }
    chase() {
        // Using last intended move was for cases of falling not looking like going
        // down, but it interfered with coming up off ladder then going right into
        // ladder needing to go up.
        let { action, moved, state, waitPoint, waitPointHero, waitTime } = this;
        let { hero, time } = this.game.stage;
        if (!hero) {
            return;
        }
        // TODO Let enemy see if near invisible (including hero)?
        // TODO Combine logic with gun.
        let heroHidden = hero.bonusSee && !this.seesInvisible;
        if (heroHidden) {
            // Invisible, so confuse.
            if (state.x == State.chase) {
                state.x = State.wait;
                waitTime.x = time + closeTime;
            }
            if (state.y == State.chase) {
                state.y = State.wait;
                waitTime.y = time + closeTime;
            }
        }
        // TODO Using oldDiff also causes the top of ladder problem, but worse.
        // let oldDiff = this.workPoint2.copy(hero.oldPoint).sub(this.oldPoint);
        let diff = this.workPoint2.copy(hero.point).sub(this.point);
        // TODO Wander state?
        // TODO Change state based on failure to move in intended direction?
        // TODO Unify x and y commonality.
        switch (state.y) {
            case State.chase: {
                if (Math.sign(diff.y) == -Math.sign(moved.y)) {
                    this.state.y = State.wait;
                    waitPoint.x = this.point.x;
                    waitPointHero.y = hero.point.y;
                    waitTime.y = time + closeTime;
                }
                else if (Math.abs(diff.y) >= 1) {
                    if (diff.y < 0) {
                        // Don't try to go down if we can't.
                        // The problem is that if we're on a ladder with a solid at
                        // bottom, it still tries to go down instead of left or right.
                        let solidSurface = this.getSurface(part => part.solid(this, Edge.top, true), true);
                        if (solidSurface) {
                            // Well, also see if we have a climbable here.
                            // The problem is if we have imperfect alignment with a ladder
                            // between solids.
                            // TODO Reusing calculations from action processing or physics
                            // TODO could be nice.
                            let climbable = (x) => this.partAt(x, -1, part => part.climbable(this));
                            if (climbable(4 - 1e-3) || climbable(4 + 1e-3)) {
                                // Let climbable trump.
                                solidSurface = undefined;
                            }
                        }
                        if (!solidSurface) {
                            action.down = true;
                        }
                    }
                    else {
                        let ceiling = this.getSolid(Edge.bottom, TilePos.midLeft, 10, true) ||
                            this.getSolid(Edge.bottom, TilePos.midRight, 10, true);
                        if (!ceiling) {
                            action.up = true;
                        }
                    }
                }
                break;
            }
            case State.wait:
            case State.wanderNeg:
            case State.wanderPos: {
                if (state.y == State.wanderNeg) {
                    action.down = true;
                }
                else if (state.y == State.wanderPos) {
                    action.up = true;
                }
                let waitDiff = Math.abs(this.point.x - this.waitPoint.x);
                let waitDiffHero = Math.abs(hero.point.y - this.waitPointHero.y);
                if (!heroHidden && (waitDiff >= level_Level.tileSize.x || waitDiffHero >= level_Level.tileSize.y)) {
                    state.y = State.chase;
                }
                else if (time >= waitTime.y) {
                    if (state.y == State.wait) {
                        state.y = this.lastWander.y > 0 ? State.wanderNeg : State.wanderPos;
                        this.lastWander.y = -this.lastWander.y;
                    }
                    else {
                        state.y = State.wait;
                    }
                    waitTime.y = time + closeTime;
                }
                break;
            }
        }
        switch (state.x) {
            case State.chase: {
                if (Math.sign(diff.x) == -Math.sign(moved.x)) {
                    this.state.x = State.wait;
                    waitPoint.y = this.point.y;
                    waitPointHero.x = hero.point.x;
                    waitTime.x = time + closeTime;
                }
                else if (diff.x) {
                    // TODO Watch for not running over pits.
                    // Keep some spacing between enemies when possible.
                    // See if all surfaces are enemies who are actually mobile.
                    // TODO An enemy stuck in an ordinary hole should also count as
                    // TODO caught!
                    let isComrade = (part) => part instanceof enemy_Enemy && !part.catcher && !part.dead;
                    let comradeSurface = this.getSurface(isComrade);
                    let noncomradeSurface = this.getSurface(part => !isComrade(part));
                    let surface = comradeSurface && !noncomradeSurface;
                    if (diff.x < 0) {
                        if (!(this.getOther(-8, 4) || surface)) {
                            action.left = true;
                        }
                    }
                    else if (diff.x > 0) {
                        if (!(this.getOther(16, 4) || surface)) {
                            action.right = true;
                        }
                    }
                }
                break;
            }
            case State.wait:
            case State.wanderNeg:
            case State.wanderPos: {
                if (state.x == State.wanderNeg) {
                    action.left = true;
                }
                else if (state.x == State.wanderPos) {
                    action.right = true;
                }
                let waitDiff = Math.abs(this.point.y - this.waitPoint.y);
                let waitDiffHero = Math.abs(hero.point.x - this.waitPointHero.x);
                if (!heroHidden && (waitDiff >= level_Level.tileSize.y || waitDiffHero >= level_Level.tileSize.x)) {
                    state.x = State.chase;
                }
                else if (time >= waitTime.x) {
                    if (state.x == State.wait) {
                        state.x = this.lastWander.x > 0 ? State.wanderNeg : State.wanderPos;
                        this.lastWander.x = -this.lastWander.x;
                    }
                    else {
                        state.x = State.wait;
                    }
                    waitTime.x = time + closeTime;
                }
                break;
            }
        }
        if (action.left || action.right) {
            // Don't walk into seeming walls. TODO Exact alignment against such?
            let x = action.left ? -this.speed.x : 8 + this.speed.x;
            let edge = action.left ? Edge.right : Edge.left;
            let wall = this.partAt(x, 4, part => part.solid(this, edge, true));
            if (wall) {
                action.left = action.right = false;
            }
        }
    }
    choose() {
        this.action.clear();
        if (!(this.dazed || this.dead)) {
            if (this.game.stage.hero) {
                this.chase();
            }
            if (this.catcher) {
                // Don't go down, and if still caught, go up.
                this.action.down = false;
                if (this.feetInCatcher()) {
                    this.action.up = true;
                }
            }
        }
        this.avoidBottomless();
        this.processAction(this.action);
    }
    closeTime(baseTime) {
        // Use abs in case of time wrapping. TODO Really? Reset time at play start?
        return Math.abs(this.game.stage.time - baseTime) < closeTime;
    }
    die() {
        super.die();
        this.climber = false;
        this.releaseTreasure();
    }
    feetInCatcher() {
        let isCatcher = (part) => part == this.catcher;
        return (this.partAt(0, 0, isCatcher) ||
            this.partAt(0, -1, isCatcher) ||
            this.partAt(TilePos.right, 0, isCatcher) ||
            this.partAt(TilePos.right, -1, isCatcher));
    }
    get keyTime() {
        // Indicate when holding a prize.
        return this.prize ? this.game.stage.time : -10;
    }
    set keyTime(value) {
        // Ignore.
    }
    getOther(x, y) {
        let isEnemy = (part) => part instanceof enemy_Enemy && part != this && !part.dead;
        return this.partAt(x, y, isEnemy);
    }
    releaseTreasure() {
        let { prize } = this;
        if (prize) {
            if (prize instanceof Bonus) {
                this.speed.divideScalar(1.5);
            }
            this.prize = undefined;
            prize.owner = undefined;
            prize.point.copy(this.point);
            // Place it above.
            // TODO Only above if center in brick! Otherwise go to center!
            if (this.partAt(4, 5, part => part instanceof brick_Brick)) {
                // If our center is in a brick, look up.
                prize.point.y += 10;
            }
            // Align vertically on grid.
            prize.point.y = Math.round(prize.point.y / 10) * 10;
        }
    }
    solid(other, edge) {
        // Enemies block entrance to each other, but not exit from.
        // Just a touch of safety precaution.
        return other instanceof enemy_Enemy && !other.dead && !!edge;
    }
    surface(other) {
        return other instanceof enemy_Enemy || other instanceof hero_Hero;
    }
    take(prize) {
        if (this.dead || this.prize) {
            return false;
        }
        else {
            this.prize = prize;
            if (prize instanceof Bonus) {
                this.speed.multiplyScalar(1.5);
            }
            return true;
        }
    }
    update() {
        let catcher = this.getCatcher();
        if (catcher instanceof brick_Brick &&
            // Require some alignment in case of horizontal entry.
            // But not exact alignment, since they don't fall in exactly.
            Math.abs(this.point.x - catcher.point.x) < 3) {
            // No horizontal moving in bricks.
            this.point.x = catcher.point.x;
            this.move.x = 0;
            if (!this.catcher) {
                this.catcher = catcher;
                this.caughtTime = this.game.stage.time;
                this.dazed = true;
            }
            // Lose treasure if we have one.
            this.releaseTreasure();
        }
        else if (this.catcher) {
            let isCatcher = (part) => part == this.catcher;
            if (this.catcher instanceof brick_Brick && !this.catcher.burned) {
                this.catcher = undefined;
            }
            else if (!this.feetInCatcher()) {
                this.catcher = undefined;
            }
        }
        if (this.dazed) {
            if (this.caughtTime < this.game.stage.time - 1.4) {
                this.dazed = false;
            }
            else {
                this.move.setScalar(0);
            }
        }
        let hero = this.game.stage.hero;
        if (hero && !this.dead) {
            this.workPoint.copy(this.point).add(this.workPoint2.set(4, 5));
            if (hero.contains(this.workPoint)) {
                hero.die();
            }
        }
        super.update();
        // Check stuckness.
        let { time } = this.game.stage;
        if ((time > this.waitTime.x || time > this.waitTime.y) &&
            (this.state.x == State.chase && this.state.y == State.chase) &&
            !(this.moved.x || this.moved.y)) {
            this.state.x = this.state.y = State.wait;
            this.waitTime.y = this.game.stage.time + closeTime;
            this.waitTime.x = this.game.stage.time + 1.1 * closeTime;
            this.waitPoint.copy(this.point);
            if (this.game.stage.hero) {
                this.waitPointHero.copy(this.game.stage.hero.point);
            }
        }
    }
}
enemy_Enemy.char = 'e';
var State;
(function (State) {
    State[State["chase"] = 0] = "chase";
    State[State["wanderNeg"] = 1] = "wanderNeg";
    State[State["wanderPos"] = 2] = "wanderPos";
    State[State["wait"] = 3] = "wait";
})(State || (State = {}));
let closeTime = 2;

// CONCATENATED MODULE: ./src/parts/energy.ts


class Energy extends part_Part {
    get on() {
        return this.type.defaultOn == this.game.stage.energyOn;
    }
    solid() {
        return this.on;
    }
    surface() {
        return this.solid();
    }
    touchKills(other) {
        // TODO Energize to speed up, instead?
        return false;
    }
}
Energy.char = 'O';
Energy.defaultOn = true;
class EnergyOff extends Energy {
}
EnergyOff.char = 'o';
EnergyOff.defaultOn = false;
class energy_Latch extends part_Part {
    constructor() {
        super(...arguments);
        this.changeTime = NaN;
        this.facing = 0;
    }
    die(part) {
        super.die();
        if (part instanceof gun_Shot) {
            this.flip(part.facing);
        }
    }
    flip(facing) {
        let { stage } = this.game;
        if (facing != this.facing) {
            this.changeTime = stage.time;
            this.facing = facing;
            stage.energyOn = !stage.energyOn;
            if (this.type.breaking) {
                this.die();
                this.active = false;
                this.game.stage.removed(this);
            }
        }
    }
    get shotKillable() {
        return true;
    }
    get shootable() {
        return true;
    }
    update() {
        if (this.dead) {
            return;
        }
        let passer = this.partAt(4, 5, part => !!part.moved.x);
        if (passer) {
            let oldX = passer.point.x - passer.moved.x;
            if (passer.point.x < this.point.x) {
                if (oldX >= this.point.x) {
                    this.flip(-1);
                }
            }
            else if (passer.point.x > this.point.x) {
                if (oldX <= this.point.x) {
                    this.flip(1);
                }
            }
        }
    }
}
energy_Latch.options = {
    breaking: true,
    ender: true,
    falling: false,
    invisible: true,
};
class LatchLeft extends energy_Latch {
    constructor() {
        super(...arguments);
        this.facing = -1;
    }
}
LatchLeft.char = '\\';
class LatchRight extends energy_Latch {
    constructor() {
        super(...arguments);
        this.facing = 1;
    }
}
LatchRight.char = '/';

// CONCATENATED MODULE: ./src/parts/falling.ts

const Falling = (optionClass) => 
// Can't call the class itself `Falling`, because the UI ends up thinking it
// should add rendered blocks to the buttons on screen.
class FallingPart extends optionClass {
    constructor() {
        super(...arguments);
        this.kicker = undefined;
    }
    choose() {
        if (!this.exists)
            return;
        super.choose();
        if (this.kicker) {
            // Faster than normal falling, slower than fast falling.
            // So a fast fall should be able to land on and move off.
            // TODO Fix physics of runner intersection.
            // TODO I've seen falling faster than a falling part kill the player.
            let speed = 1.1;
            this.move.set(0, speed);
            // Check collision.
            // I haven't seen issues with colliding into other fallings.
            // Perhaps that has to do with construction order.
            let stopper = this.partAt(4, -speed, part => part.type.options.falling);
            if (stopper) {
                speed = this.point.y - stopper.point.y - 10;
                this.kicker = undefined;
            }
            // Move.
            falling_workPoint.copy(this.point);
            this.point.y -= speed;
            this.game.stage.moved(this, falling_workPoint);
        }
    }
    supportedGone(oldSupported) {
        super.supportedGone(oldSupported);
        if (!this.kicker) {
            let { y } = this.point;
            let { stage } = this.game;
            // Mark this one kicked.
            this.kicker = this;
            // Mark all beneath as kicked, too.
            falling_workPoint.set(4, 5).add(this.point);
            while (falling_workPoint.y >= 0) {
                y -= 10;
                falling_workPoint.y -= 10;
                let next = stage.partAt(falling_workPoint, part => part.type.falling);
                if (!next)
                    break;
                if (Math.abs(y - next.point.y) > 0.5)
                    break;
                // Close enough to call them touching.
                next.kicker = this;
            }
        }
    }
};
let falling_workPoint = new three["Vector2"]();

// CONCATENATED MODULE: ./src/parts/gun.ts



class gun_Gun extends runner_Runner {
    constructor(game) {
        super(game);
        // Never moves anywhere by choice, but eh.
        this.action = new RunnerAction();
        this.carried = true;
        this.facing = 0;
        // Long before the start.
        this.lastShootTime = -100;
        this.lastSupport = undefined;
        this.lastSupportFacing = 0;
        this.speed = new three["Vector2"](0.7, 0.7);
        this.shot = new gun_Shot(game, this);
    }
    carriedMove(x) {
        let { lastSupport, support } = this;
        if (support == lastSupport &&
            (support instanceof biggie_Biggie || support instanceof gun_Gun)) {
            if (support.facing && support.facing == -this.lastSupportFacing) {
                // This isn't really sufficient.
                // It should also change position relative to the support.
                // It's extra obvious when a biggie carries two guns side by side, and
                // yes this can happen.
                // Also, this should apply to everything, not just guns, but it's most
                // interesting for guns, so eh.
                this.facing = -this.facing;
            }
            this.lastSupportFacing = support.facing;
        }
        else {
            this.lastSupportFacing = 0;
        }
        this.lastSupport = support;
    }
    choose() {
        // Guns don't actually act, but we need falling dynamics.
        super.processAction(this.action);
    }
    heroVisible() {
        let { point } = this;
        let { stage } = this.game;
        let { hero } = stage;
        if (!hero || (hero.bonusSee && !this.seesInvisible)) {
            // TODO Let enemies see if near invisible?
            return false;
        }
        if (hero.point.y + 10 < point.y || hero.point.y > point.y + 10) {
            // Totally not vertically aligned. Skip.
            return false;
        }
        gun_workPoint.set(4, 5).add(point);
        let step = this.facing * 8;
        while (gun_workPoint.x > -10 && gun_workPoint.x < 330) {
            gun_workPoint.x += step;
            if (hero.contains(gun_workPoint)) {
                return true;
            }
            if (stage.partAt(gun_workPoint, part => part.solid(this))) {
                break;
            }
        }
        return false;
    }
    reset() {
        this.shot.active = false;
        this.game.stage.removed(this.shot);
    }
    get shootable() {
        return true;
    }
    get shotKillable() {
        return true;
    }
    surface(other) {
        return other instanceof gun_Gun;
    }
    update() {
        super.update();
        let { shot } = this;
        let { stage } = this.game;
        if (this.dead) {
            return;
        }
        // Min wait on shots recommended by Matt.
        let timeSince = stage.time - this.lastShootTime;
        if (!shot.active && timeSince > 2 && this.heroVisible()) {
            if (!shot.art) {
                this.game.theme.buildArt(shot);
            }
            shot.facing = this.facing;
            shot.active = true;
            shot.point.copy(this.point);
            stage.particles.push(shot);
            stage.added(shot);
            this.lastShootTime = stage.time;
        }
    }
}
class GunLeft extends gun_Gun {
    constructor() {
        super(...arguments);
        this.facing = -1;
    }
}
GunLeft.char = '{';
class GunRight extends gun_Gun {
    constructor() {
        super(...arguments);
        this.facing = 1;
    }
}
GunRight.char = '}';
class gun_Shot extends part_Part {
    // No char because shots are entirely dynamic.
    constructor(game, gun) {
        super(game);
        this.active = false;
        // Remember own facing in case gun changes facing.
        this.facing = 0;
        this.gun = gun;
    }
    die() {
        this.active = false;
    }
    get exists() {
        return this.active;
    }
    get shootable() {
        return true;
    }
    get shotKillable() {
        return true;
    }
    update() {
        let { facing, game, gun } = this;
        let { stage } = game;
        gun_oldPoint.copy(this.point);
        this.point.x += 1.5 * facing;
        stage.moved(this, gun_oldPoint);
        if (this.point.x < -10 || this.point.x > level_Level.pixelCount.x + 10) {
            this.active = false;
        }
        // Check for hits.
        // Only after really leaving the gun.
        if (this.partAt(4, 5, part => part == gun)) {
            return;
        }
        let parts = stage.partsNear(gun_workPoint.set(4, 5).add(this.point));
        if (!parts) {
            return;
        }
        let hit = undefined;
        for (let part of parts) {
            if (part != gun && part != this && part.shootable && !part.dead &&
                part.contains(gun_workPoint)) {
                if (hit) {
                    // Hit the first thing.
                    if (part.point.x * facing < hit.point.x) {
                        hit = part;
                    }
                }
                else {
                    hit = part;
                }
            }
        }
        if (hit) {
            this.active = false;
            if (hit.shotKillable) {
                hit.die(this);
            }
        }
    }
}
let gun_oldPoint = new three["Vector2"]();
let gun_workPoint = new three["Vector2"]();

// CONCATENATED MODULE: ./src/parts/hero.ts



class hero_Hero extends runner_Runner {
    constructor() {
        super(...arguments);
        this.action = new RunnerAction();
        this.actionChange = new RunnerAction();
        // Separate speed vs see bonus.
        this.bonusSee = undefined;
        // Separate speed vs see bonus.
        this.bonusSpeed = undefined;
        this.carried = true;
        this.fastEnd = -10;
        this.speed = new three["Vector2"](1, 1);
        this.treasureCount = 0;
    }
    checkAction() {
        let { action, actionChange } = this;
        let { control } = this.game;
        // Find what changed.
        actionChange.burnLeft = action.burnLeft != control.burnLeft;
        actionChange.burnRight = action.burnRight != control.burnRight;
        actionChange.down = action.down != control.down;
        actionChange.left = action.left != control.left;
        actionChange.right = action.right != control.right;
        actionChange.up = action.up != control.up;
        // Then copy the current.
        this.action.copy(control);
    }
    choose() {
        let { action, bonusSpeed, game, speed } = this;
        if (bonusSpeed) {
            speed.setScalar(1.75);
        }
        else {
            speed.setScalar(1);
        }
        this.checkAction();
        if (this.game.stage.ended || this.phased) {
            action.clear();
        }
        this.processAction(action);
    }
    die() {
        if (!(this.phased || this.game.stage.ended)) {
            this.dead = true;
            this.game.play.fail();
        }
    }
    editPlacedAt(tilePoint) {
        let game = this.game;
        let placedIndex = game.level.tiles.index(tilePoint);
        // TODO Cache hero position for level?
        game.level.tiles.items.forEach((type, index) => {
            if (type == hero_Hero && index != placedIndex) {
                let editState = game.edit.editState;
                let last = editState.history[editState.historyIndex].tiles.items[index];
                game.level.tiles.items[index] = last == hero_Hero ? None : last;
            }
        });
    }
    take(prize) {
        if (prize instanceof Treasure) {
            this.treasureCount += 1;
            if (this.treasureCount == this.game.stage.treasureCount) {
                this.game.stage.ending = true;
                this.game.level.updateStage(this.game);
            }
        }
        else if (prize instanceof Bonus) {
            // Bonus is the only other option, but eh.
            let { stage } = this.game;
            let old;
            if (prize.type.invisible) {
                old = this.bonusSee;
                this.bonusSee = prize;
            }
            else {
                old = this.bonusSpeed;
                this.bonusSpeed = prize;
            }
            let baseTime = Math.max(old ? old.bonusEnd : 0, stage.time);
            prize.bonusEnd = baseTime + 10;
            if (!prize.type.invisible) {
                // Change visually before slowing.
                // TODO There's also about 1 second diff here in keyTime handling. Why?
                this.keyTime = prize.bonusEnd - 1.5;
            }
        }
        prize.point.x = -1000;
        this.game.stage.removed(prize);
        return true;
    }
    update() {
        let { stage } = this.game;
        // Update everything.
        super.update();
        if (!stage.ended) {
            // See if we won or lost.
            let { point: { y } } = this;
            if (y <= stage.pixelBounds.min.y - level_Level.tileSize.y) {
                this.die();
            }
            if (stage.ending && y >= stage.pixelBounds.max.y) {
                this.game.play.win();
            }
        }
    }
    updateInfo() {
        // Check for seeing invisibles, by nearby invisibles.
        if (this.bonusSee && this.bonusSee.bonusEnd < this.game.stage.time) {
            this.bonusSee = undefined;
        }
        if (this.bonusSpeed && this.bonusSpeed.bonusEnd < this.game.stage.time) {
            this.bonusSpeed = undefined;
        }
        if (this.bonusSee) {
            // Already done.
            this.seesInvisible = true;
            return;
        }
        super.updateInfo();
    }
}
hero_Hero.char = 'R';
hero_Hero.options = {
    breaking: false,
    ender: false,
    falling: false,
    invisible: false,
};

// CONCATENATED MODULE: ./src/parts/ladder.ts

class Ladder extends part_Part {
    climbable() {
        return true;
    }
    surface() {
        return true;
    }
}
Ladder.char = 'H';

// CONCATENATED MODULE: ./src/parts/launcher.ts



class launcher_Launcher extends part_Part {
    static get common() {
        return launcher_Launcher;
    }
    choose() {
        if (this.dead) {
            return;
        }
        // Putting this in choose means hero has to be aligned from previous tick.
        // TODO Or this tick, if already processed? New step to add in?
        let { hero } = this.game.stage;
        let type = this.type;
        if (hero && type.checkAction(hero) && !(hero.phased || hero.dead)) {
            checkPoint.set(4, 5).add(this.point);
            if (hero.contains(checkPoint)) {
                let { send } = type;
                // Require the direction we're going to align, so we don't just run
                // through.
                step.set(Math.abs(send.x), Math.abs(send.y));
                checkPoint.copy(this.point).multiply(step);
                step.multiply(hero.point);
                if (checkPoint.equals(step)) {
                    this.launch(hero, send);
                }
            }
        }
    }
    climbable() {
        return true;
    }
    launch(part, send) {
        // Start offset to center of this part.
        checkPoint.copy(level_Level.tileSize).multiplyScalar(0.5).add(this.point);
        // Step by tiles.
        step.copy(send).multiply(level_Level.tileSize);
        let energy = undefined;
        let target = undefined;
        let { stage } = this.game;
        while (!target) {
            checkPoint.add(step);
            if (this.outside(checkPoint)) {
                // Also end loop if we leave the stage.
                break;
            }
            energy = stage.partAt(checkPoint, part => part instanceof Energy && part.on);
            if (energy) {
                // No launching through energy.
                energy.keyTime = stage.time;
                break;
            }
            target = stage.partAt(checkPoint, part => part instanceof launcher_Launcher && !part.dead);
        }
        // TODO(tjp): What if no target? Nothing? One tile, far as possible?
        if (!target) {
            target = this;
        }
        if (target) {
            target.keyTime = stage.time;
            // Align corners together.
            // checkPoint.sub(step.multiplyScalar(0.5));
            // Prep phase.
            part.phaseBeginTime = stage.time;
            part.phaseEndTime = stage.time + 1;
            part.phaseBeginPoint.copy(part.point);
            // And move official location.
            // AI will see the destination already.
            part.point.copy(target.point);
            part.phaseEndPoint.copy(part.point);
        }
        // TODO If we define supports better, this shouldn't be needed, but here we
        // TODO are.
        if (this.type.breaking) {
            this.die();
            this.active = false;
            this.game.stage.removed(this);
        }
    }
    outside(point) {
        // Override based on direction.
        return true;
    }
    get shootable() {
        return true;
    }
    get shotKillable() {
        return true;
    }
    solidInside(other, edge) {
        return this.solid(other, edge);
    }
    surface() {
        return true;
    }
}
class LauncherCenter extends launcher_Launcher {
    static checkAction(hero) {
        return false;
    }
}
LauncherCenter.char = '@';
LauncherCenter.send = new three["Vector2"]();
class launcher_LauncherDown extends launcher_Launcher {
    static checkAction(hero) {
        return hero.action.down && hero.actionChange.down;
    }
    outside(point) {
        return point.y < 0;
    }
    solid(other, edge) {
        return edge == Edge.bottom && !this.dead;
    }
}
launcher_LauncherDown.char = 'v';
launcher_LauncherDown.send = new three["Vector2"](0, -1);
class launcher_LauncherLeft extends launcher_Launcher {
    static checkAction(hero) {
        return hero.action.left && hero.actionChange.left;
    }
    outside(point) {
        return point.x < 0;
    }
    solid(other, edge) {
        return edge == Edge.left && !this.dead;
    }
}
launcher_LauncherLeft.char = '<';
launcher_LauncherLeft.send = new three["Vector2"](-1, 0);
class launcher_LauncherRight extends launcher_Launcher {
    static checkAction(hero) {
        return hero.action.right && hero.actionChange.right;
    }
    outside(point) {
        return point.x > level_Level.pixelCount.x;
    }
    solid(other, edge) {
        return edge == Edge.right && !this.dead;
    }
}
launcher_LauncherRight.char = '>';
launcher_LauncherRight.send = new three["Vector2"](1, 0);
class launcher_LauncherUp extends launcher_Launcher {
    static checkAction(hero) {
        return hero.action.up && hero.actionChange.up;
    }
    outside(point) {
        return point.y > level_Level.pixelCount.y;
    }
    solid(other, edge) {
        return edge == Edge.top && !this.dead;
    }
}
launcher_LauncherUp.char = '^';
launcher_LauncherUp.send = new three["Vector2"](0, 1);
let checkPoint = new three["Vector2"]();
let step = new three["Vector2"]();

// CONCATENATED MODULE: ./src/parts/none.ts

class None extends part_Part {
    get exists() {
        return false;
    }
}
None.char = ' ';
None.options = {
    breaking: false,
    ender: false,
    falling: false,
    invisible: false,
};

// CONCATENATED MODULE: ./src/parts/spawn.ts


class spawn_Spawn extends part_Part {
    constructor() {
        super(...arguments);
        this.spawnItems = new Array();
    }
    static respawnMaybe(part) {
        if (!(part instanceof enemy_Enemy)) {
            return;
        }
        // Find the spawn point, if any, and spawn.
        let choice = undefined;
        let min = Infinity;
        for (let spawn of part.game.stage.spawns) {
            let distance = part.point.distanceTo(spawn.point);
            // Could possibly be equal or close but that's rare, and this will do.
            if (distance < min) {
                choice = spawn;
                min = distance;
            }
        }
        // Spawn a new enemy.
        if (choice) {
            choice.queueSpawn(new enemy_Enemy(part.game));
        }
    }
    queueSpawn(part) {
        this.spawnItems.push({ part, time: this.game.stage.time + 5 });
    }
    spawn(part) {
        let { stage } = this.game;
        this.game.theme.buildArt(part);
        part.point.copy(this.point);
        stage.particles.push(part);
        stage.added(part);
    }
    update() {
        if (!this.spawnItems.length) {
            return;
        }
        let first = this.spawnItems[0];
        if (this.game.stage.time >= first.time) {
            this.spawnItems.shift();
            this.spawn(first.part);
        }
    }
}
spawn_Spawn.options = {
    breaking: false,
    ender: true,
    falling: false,
    invisible: true,
};
spawn_Spawn.char = 'M';

// CONCATENATED MODULE: ./src/parts/steel.ts

class Steel extends part_Part {
    solid(other, edge) {
        return true;
    }
    surface() {
        return true;
    }
}
Steel.char = '#';

// CONCATENATED MODULE: ./src/parts/treasure.ts


class treasure_Prize extends part_Part {
    constructor() {
        super(...arguments);
        this.owner = undefined;
    }
    update() {
        if (!this.owner) {
            let runner = this.partAt(4, 5, part => part instanceof runner_Runner && !part.dead);
            if (runner && runner.take(this)) {
                this.owner = runner;
            }
        }
    }
}
class Bonus extends treasure_Prize {
    constructor() {
        super(...arguments);
        this.bonusEnd = 0;
    }
}
// Time is money, eh?
Bonus.char = '$';
Bonus.options = {
    breaking: false,
    ender: true,
    falling: false,
    invisible: true,
};
class Treasure extends treasure_Prize {
}
Treasure.char = '*';
Treasure.options = {
    breaking: false,
    ender: false,
    falling: false,
    invisible: true,
};

// CONCATENATED MODULE: ./src/parts/parts.ts



class Parts {
    static optionType(baseType, options) {
        // The type options should be just options, but the options passed in might
        // have extra, so clone just the type options.
        baseType = baseType.base;
        let validOptions = Object.assign({}, baseType.options);
        for (let key in baseType.options) {
            validOptions[key] &= options[key];
        }
        let char = Parts.typeChar(baseType, validOptions);
        let type = Parts.charParts.get(char);
        return type;
    }
    static typeChar(type, options) {
        let char = type.char.codePointAt(0);
        char |= options.breaking ? 0x200 : 0x00;
        char |= options.ender ? 0x80 : 0x00;
        char |= options.falling ? 0x400 : 0x00;
        char |= options.invisible ? 0x100 : 0x00;
        if (char == 0xAD) {
            // Because 0xAD isn't visible, and they're nice to see, at least.
            char = 0xFF;
        }
        return String.fromCodePoint(char);
    }
}
Parts.inventory = [
    bar_Bar,
    BiggieLeft,
    BiggieRight,
    Bonus,
    brick_Brick,
    Crusher,
    dropper_Dropper,
    enemy_Enemy,
    Energy,
    EnergyOff,
    GunLeft,
    GunRight,
    hero_Hero,
    Ladder,
    LatchLeft,
    LatchRight,
    LauncherCenter,
    launcher_LauncherDown,
    launcher_LauncherLeft,
    launcher_LauncherRight,
    launcher_LauncherUp,
    None,
    spawn_Spawn,
    Steel,
    Treasure,
];
Parts.charParts = new Map(Parts.inventory.map(part => [part.char, part]));
// Just to check for non-duplicates.
let chars = {};
Parts.inventory.forEach(({ char }) => {
    if (chars[char]) {
        throw new Error(`Duplicate ${char}`);
    }
    chars[char] = char;
});
// This builds all possible parts up front.
// TODO Build them only dynamically?
Parts.inventory.forEach(part => {
    let makeOptions = (condition) => condition ? [false, true] : [false];
    let options = {};
    for (let key in part.options) {
        options[key] =
            makeOptions(part.options[key]);
    }
    // Take off the all-false case, since we already have those.
    let allOptions = cartesianProduct(options).slice(1);
    allOptions.forEach(option => {
        let char = Parts.typeChar(part, option);
        class OptionPart extends part {
            static get base() {
                return part;
            }
        }
        OptionPart.breaking = option.breaking;
        OptionPart.char = char;
        OptionPart.ender = option.ender;
        OptionPart.falling = option.falling;
        OptionPart.invisible = option.invisible;
        let optionClass = OptionPart;
        if (option.breaking) {
            optionClass = Breaking(optionClass);
        }
        if (option.falling) {
            optionClass = Falling(optionClass);
        }
        // Add it to things.
        Parts.inventory.push(optionClass);
        Parts.charParts.set(char, optionClass);
        // console.log(
        //   part.char, OptionPart.char, OptionPart.ender, OptionPart.invisible,
        //   Object.getPrototypeOf(OptionPart).name
        // );
    });
});
// TODO Why does webpack die if I turn this into an arrow function?
function Breaking(optionClass) {
    // Can't call the class itself `Breaking`, because the UI ends up thinking it
    // should add rendered blocks to the buttons on screen.
    class BreakingPart extends optionClass {
        supportedGone(oldSupported) {
            this.die(oldSupported);
            this.active = false;
            this.game.stage.removed(this);
        }
    }
    return BreakingPart;
}
let parts_workPoint = new three["Vector2"]();

// CONCATENATED MODULE: ./src/parts/index.ts
// Used by multiple parts.

// Parts themselves.
















// After individual parts above.


// CONCATENATED MODULE: ./src/stage.ts



class stage_Stage {
    constructor(game) {
        this.edgeLeft = new Array();
        this.edgeRight = new Array();
        this.ended = false;
        this.ending = false;
        this.energyOn = true;
        // Collision grid.
        this.grid = new Grid(level_Level.tileCount);
        this.hero = undefined;
        // These particles are short-lived but relevant to game state.
        // Other particles might exist only in the visual theme.
        this.particles = new Group();
        // During level editing, these corresponding exactly to level tile indices.
        // This can include nones.
        // While that's somewhat wasteful, as most levels will be fairly sparse, we
        // have to be able to support full levels, too, and if we don't have to be
        // inserting and deleting all the time, life will be easier.
        // Of course, we can skip the nones when building for actual play, if we want.
        this.parts = new Array(level_Level.tileCount.x * level_Level.tileCount.y);
        this.pixelBounds = { max: new three["Vector2"](), min: new three["Vector2"]() };
        this.spawns = new Array();
        this.tileBounds = { max: new three["Vector2"](), min: new three["Vector2"]() };
        // Time in seconds since play start.
        this.time = 0;
        this.treasureCount = 0;
        // Cached for use.
        this.workPoint = new three["Vector2"]();
        this.workPoint2 = new three["Vector2"]();
        this.game = game;
        // Init grid.
        let gridPoint = new three["Vector2"]();
        for (let j = 0; j < level_Level.tileCount.x; ++j) {
            for (let i = 0; i < level_Level.tileCount.y; ++i) {
                gridPoint.set(j, i);
                this.grid.set(gridPoint, new Array());
            }
        }
        // Fake steel at edges to block exit.
        for (let i = 0; i < level_Level.tileCount.y; ++i) {
            this.edgeLeft.push([new Steel(game)]);
            this.edgeRight.push([new Steel(game)]);
        }
    }
    added(part) {
        // Add to all overlapping grid lists.
        let { grid, workPoint } = this;
        this.walkGrid(part.point, () => {
            grid.get(workPoint).push(part);
        });
        if (part instanceof spawn_Spawn) {
            this.spawns.push(part);
        }
    }
    clearGrid() {
        this.grid.items.forEach(items => items.length = 0);
    }
    died(part) {
        spawn_Spawn.respawnMaybe(part);
    }
    init() {
        for (let part of this.parts) {
            part.updateInfo();
        }
    }
    manageParticles() {
        let { particles } = this;
        // The oldest particles should likely be the first to cease existing.
        // So clear them out to prevent excess work.
        for (let index = 0; index < particles.length;) {
            let particle = particles.items[index];
            if (particle.exists) {
                index += 1;
            }
            else {
                particles.removeAt(index);
                this.removed(particle);
            }
        }
    }
    moved(part, oldPoint) {
        // First see if it's still in the same place.
        let { workPoint, workPoint2 } = this;
        workPoint.copy(oldPoint).divide(level_Level.tileSize);
        workPoint2.copy(part.point).divide(level_Level.tileSize);
        if (Number.isInteger(workPoint.x) == Number.isInteger(workPoint2.x)) {
            if (Number.isInteger(workPoint.y) == Number.isInteger(workPoint2.y)) {
                if (workPoint.floor().equals(workPoint2.floor())) {
                    // In the same place. No updates to make.
                    // TODO Could independently check row and col.
                    return;
                }
            }
        }
        // If not, remove from old then add to new.
        this.removed(part, oldPoint);
        this.added(part);
    }
    partAt(point, keep) {
        let parts = this.partsNear(point);
        return parts && parts.find(part => keep(part) && part.contains(point));
    }
    partsAt(point) {
        let parts = this.partsNear(point) || [];
        return parts.filter(part => part.contains(point));
    }
    partsNear(point) {
        let { grid, workPoint } = this;
        let { max, min } = this.tileBounds;
        workPoint.copy(point).divide(level_Level.tileSize).floor();
        let parts;
        if (workPoint.y < min.y || workPoint.y >= max.y) {
            return undefined;
        }
        else if (workPoint.x < min.x) {
            parts = this.edgeLeft[workPoint.y];
        }
        else if (workPoint.x >= max.x) {
            parts = this.edgeRight[workPoint.y];
        }
        else {
            parts = grid.get(workPoint);
        }
        return parts;
    }
    removed(part, oldPoint) {
        if (!oldPoint) {
            oldPoint = part.point;
        }
        // Remove from overlapping grid lists.
        let { grid, workPoint } = this;
        this.walkGrid(oldPoint, () => {
            let parts = grid.get(workPoint);
            let index = parts.indexOf(part);
            if (index >= 0) {
                parts.splice(index, 1);
            }
        });
        if (part instanceof spawn_Spawn) {
            let index = this.spawns.indexOf(part);
            this.spawns.splice(index, 1);
        }
    }
    tick() {
        // TODO Move all updates to worker thread, and just receive state each
        // TODO frame?
        this.manageParticles();
        this.tickParts(this.parts);
        this.tickParts(this.particles);
        // Count time.
        // TODO Actual time once we do that.
        this.time += 1 / 60;
        if (this.time > 1e6) {
            // Reset instead of getting out of sane-precision land.
            this.time = 0;
        }
        // TODO Maybe separate constrain step?
    }
    tickParts(parts) {
        // Choose based on current state.
        for (let part of parts) {
            if (!part.cropped) {
                part.choose();
            }
        }
        // Update after choices.
        for (let part of parts) {
            if (!part.cropped) {
                part.update();
            }
        }
    }
    update() {
        // Pixel bounds.
        this.pixelBounds.max.copy(this.tileBounds.max).multiply(level_Level.tileSize);
        this.pixelBounds.min.copy(this.tileBounds.min).multiply(level_Level.tileSize);
        // Edges.
        // Let each steel block have the right point, though we could maybe ignore
        // position and hack a singleton.
        let { tileBounds } = this;
        let minX = (tileBounds.min.x - 1) * level_Level.tileSize.x;
        this.edgeLeft.forEach((parts, i) => {
            parts[0].point.set(minX, i * level_Level.tileSize.y);
        });
        let maxX = tileBounds.max.x * level_Level.tileSize.x;
        this.edgeRight.forEach((parts, i) => {
            parts[0].point.set(maxX, i * level_Level.tileSize.y);
        });
    }
    walkGrid(point, handle) {
        let { workPoint } = this;
        workPoint.copy(point).divide(level_Level.tileSize);
        let colCount = Number.isInteger(workPoint.x) ? 1 : 2;
        let rowCount = Number.isInteger(workPoint.y) ? 1 : 2;
        workPoint.floor();
        let { x: gridSizeX, y: gridSizeY } = this.grid.size;
        for (let j = 0; j < colCount; ++j) {
            if (workPoint.x >= 0 && workPoint.x < gridSizeX) {
                // In the grid. Walk y.
                for (let i = 0; i < rowCount; ++i) {
                    if (workPoint.y >= 0 && workPoint.y < gridSizeY) {
                        handle();
                    }
                    // Increment whether handled or not, so later decrement is valid.
                    ++workPoint.y;
                }
                // Go to the first row.
                workPoint.y -= rowCount;
            }
            // Next column.
            ++workPoint.x;
        }
    }
}

// CONCATENATED MODULE: ./src/control.ts
class RunnerAction {
    constructor() {
        this.burnLeft = false;
        this.burnRight = false;
        this.down = false;
        // Double-press for these.
        // TODO fast = false;
        this.left = false;
        this.right = false;
        this.up = false;
    }
    active() {
        return (this.burnLeft || this.burnRight ||
            this.down || this.left || this.right || this.up);
    }
    clear() {
        this.burnLeft = this.burnRight = false;
        this.left = this.right = this.up = this.down = false;
    }
    copy(action) {
        this.burnLeft = action.burnLeft;
        this.burnRight = action.burnRight;
        this.down = action.down;
        this.left = action.left;
        this.right = action.right;
        this.up = action.up;
    }
}
class Control extends RunnerAction {
    constructor(game) {
        super();
        this.enter = false;
        this.escape = false;
        this.keyFields = {
            ArrowDown: 'down',
            ArrowLeft: 'left',
            ArrowRight: 'right',
            ArrowUp: 'up',
            Enter: 'enter',
            Escape: 'escape',
            ' ': 'pause',
            X: 'burnRight',
            Z: 'burnLeft',
        };
        this.keyAction = new RunnerAction();
        this.padAction = new RunnerAction();
        this.pause = false;
        this.game = game;
        // TODO Capture below window level?
        window.addEventListener('keydown', event => this.onKey(event, true));
        window.addEventListener('keyup', event => this.onKey(event, false));
        // Store both cases for letter keys.
        Object.keys(this.keyFields).forEach(key => {
            if (key.length == 1) {
                this.keyFields[key.toLowerCase()] = this.keyFields[key];
            }
        });
    }
    onDown(fieldName) {
        let wasShowing = this.game.showingDialog();
        switch (fieldName) {
            case 'burnLeft':
            case 'burnRight': {
                if (this.game.stage.ended) {
                    this.game.mode.onKeyDown('Enter');
                    this.game.hideDialog();
                }
                break;
            }
            case 'enter': {
                this.game.mode.onKeyDown('Enter');
                if (wasShowing) {
                    this.game.hideDialog();
                }
                break;
            }
            case 'escape': {
                this.game.mode.onKeyDown('Escape');
                if (wasShowing) {
                    this.game.hideDialog();
                }
                break;
            }
            case 'pause': {
                this.game.play.togglePause();
                break;
            }
        }
    }
    onField(field, down) {
        let old = this[field];
        if (old != down) {
            this[field] = down;
            if (this[field] != null) {
                this[field] = down;
            }
            if (down) {
                this.onDown(field);
            }
            // console.log(`Set ${field} to ${down}`);
        }
    }
    onKey(event, down) {
        // console.log(event.key);
        let field = this.keyFields[event.key];
        // Let 'escape' be global because that's already handled well enough.
        if (this.game.showingDialog() && field != 'escape') {
            if (this.game.dialog) {
                this.game.dialog.onKey(event, down);
            }
            return;
        }
        if (field) {
            this.keyAction[field] = down;
            this.onField(field, down);
            event.preventDefault();
        }
    }
    readPad(pad) {
        let { padAction: action } = this;
        let { axes, buttons } = pad;
        action.burnLeft =
            buttons[0].pressed || buttons[2].pressed || buttons[4].pressed ||
                buttons[6].pressed;
        action.burnRight =
            buttons[1].pressed || buttons[3].pressed || buttons[5].pressed ||
                buttons[7].pressed;
        action.down =
            axes[1] > axisEdge || axes[3] > axisEdge || buttons[13].pressed;
        action.left =
            axes[0] < -axisEdge || axes[2] < -axisEdge || buttons[14].pressed;
        action.right =
            axes[0] > axisEdge || axes[2] > axisEdge || buttons[15].pressed;
        action.up =
            // Up is negative.
            axes[1] < -axisEdge || axes[3] < -axisEdge || buttons[12].pressed;
        // Apply either/or.
        this.onField('burnLeft', this.keyAction.burnLeft || action.burnLeft);
        this.onField('burnRight', this.keyAction.burnRight || action.burnRight);
        this.down = this.keyAction.down || action.down;
        this.left = this.keyAction.left || action.left;
        this.right = this.keyAction.right || action.right;
        this.up = this.keyAction.up || action.up;
        // Change trackers.
        this.onField('enter', buttons[8].pressed);
        this.onField('pause', buttons[9].pressed);
    }
    update() {
        let pads = window.navigator.getGamepads();
        if (pads && pads.length > 0 && pads[0] && pads[0].mapping == 'standard') {
            this.readPad(pads[0]);
        }
    }
}
let axisEdge = 0.5;

// CONCATENATED MODULE: ./src/ui/list.ts

class list_EditorList extends Dialog {
    constructor(game, templateText) {
        super(game);
        this.hoverValue = undefined;
        this.game = game;
        this.init();
        let dialogElement = load(templateText);
        this.titleBar = dialogElement.querySelector('.title');
        this.buildTitleBar();
        this.itemTemplate = dialogElement.querySelector('.item');
        this.list = this.itemTemplate.parentNode;
        this.list.removeChild(this.itemTemplate);
        // It doesn't like accessing abstract, but we make it work, so cast.
        let values = this.values;
        values.forEach(value => this.addItem(value));
        this.content = dialogElement;
        this.updateDelete();
        window.setTimeout(() => this.scrollIntoView(), 0);
    }
    addItem(value, afterSelected = false) {
        let item = this.itemTemplate.cloneNode(true);
        let outsideSelectedValue = this.outsideSelectedValue;
        if (outsideSelectedValue && value.id == outsideSelectedValue.id) {
            item.classList.add('selected');
        }
        item.dataset['value'] = value.id;
        item.addEventListener('mouseenter', () => {
            this.hoverValue = value;
            this.showValue(value);
        });
        item.addEventListener('mouseleave', () => {
            if (value == this.hoverValue) {
                this.hoverValue = undefined;
                // TODO Timeout before this to avoid flicker?
                this.showValue(this.selectedValue);
            }
        });
        let nameElement = item.querySelector('.name');
        this.makeEditable(nameElement, this.defaultValueName, () => value.name, text => {
            value.name = text;
            this.save(value);
        });
        let nameBox = item.querySelector('.nameBox');
        nameBox.addEventListener('click', () => {
            for (let other of this.list.querySelectorAll('.name')) {
                if (other != nameElement) {
                    other.contentEditable = 'false';
                }
            }
            this.selectValue(value);
        });
        let edit = item.querySelector('.edit');
        edit.addEventListener('click', () => {
            this.selectValue(value);
            this.enterSelection();
        });
        // Actually add to the list. I wish I'd done this in React ...
        if (afterSelected && this.selectedValue) {
            this.getSelectedItem().insertAdjacentElement('afterend', item);
        }
        else {
            this.list.appendChild(item);
        }
    }
    excludeValue() {
        if (!this.selectedValue)
            return;
        this.selectedValue.excluded = !this.selectedValue.excluded;
        this.updateDelete();
        this.save(this.selectedValue);
    }
    getButton(name) {
        return this.titleBar.querySelector(`.${name}`);
    }
    getSelectedItem() {
        if (!this.selectedValue)
            return;
        return this.content.querySelector(`[data-value="${this.selectedValue.id}"]`);
    }
    makeEditable(field, defaultText, get, set) {
        field.spellcheck = false;
        field.innerText = get().trim() || defaultText;
        field.addEventListener('blur', () => {
            // console.log('Blur!');
            let text = field.innerText.trim();
            if (get() != text) {
                // console.log('Set!');
                set(text);
            }
            if (!text) {
                field.innerText = this.defaultValueName;
            }
        });
        field.addEventListener('click', () => {
            field.contentEditable = 'plaintext-only';
        });
        field.addEventListener('keydown', event => {
            // console.log('Down!');
            switch (event.key) {
                case 'Enter': {
                    field.contentEditable = 'false';
                    field.blur();
                    break;
                }
                case 'Escape': {
                    field.innerText = get();
                    field.contentEditable = 'false';
                    break;
                }
                default: {
                    return;
                }
            }
            event.cancelBubble = true;
        });
    }
    on(name, action) {
        let button = this.getButton(name);
        button.addEventListener('click', () => {
            if (!button.classList.contains('disabled')) {
                action();
            }
        });
    }
    save(value) {
        Raw.save(value);
    }
    scrollIntoView() {
        if (!this.selectedValue)
            return;
        let { list } = this;
        let item = this.getSelectedItem();
        // This automatically limits to top and bottom of scroll area.
        // Other than that, try to center.
        let top = item.offsetTop;
        top -= list.offsetHeight / 2;
        top += item.offsetHeight / 2;
        list.scrollTop = top;
    }
    selectValue(value) {
        for (let old of this.content.querySelectorAll('.selected')) {
            old.classList.remove('selected');
        }
        this.showValue(value);
        this.selectedValue = value;
        if (value) {
            this.getSelectedItem().classList.add('selected');
        }
        // console.log(`selected ${value.id}`);
        this.updateDelete();
    }
    updateDelete() {
        let del = this.getButton('delete');
        if (del) {
            // Base on whether currently excluded.
            if (this.selectedValue && this.selectedValue.excluded) {
                del.classList.remove('disabled');
            }
            else {
                del.classList.add('disabled');
            }
        }
    }
}

// CONCATENATED MODULE: ./src/ui/levels.ts


class levels_Levels extends list_EditorList {
    constructor(game) {
        super(game, __webpack_require__(7));
        this.updateNumbers();
        this.updateStats();
    }
    addLevel() {
        let level = new level_Level().encode();
        // Insert after selected position.
        let { items } = this.tower;
        let selectedIndex = items.findIndex(level => level.id == this.selectedValue.id);
        let afterSelected = selectedIndex >= 0;
        if (afterSelected) {
            // Insert after selected.
            items.splice(selectedIndex + 1, 0, level);
        }
        else {
            // Should this ever happen???
            items.push(level);
        }
        this.tower.save();
        this.addItem(level, afterSelected);
        this.updateNumbers();
        // Select the new.
        this.selectValue(level);
        Raw.save(this.selectedValue);
    }
    buildTitleBar() {
        // First time through, we haven't yet set our own tower.
        let { tower } = this.game;
        let nameElement = this.getButton('name');
        this.makeEditable(nameElement, 'Tower', () => tower.name, text => {
            this.game.tower.name = text;
            this.tower.name = text;
            this.tower.save();
        });
        this.on('add', () => this.addLevel());
        // this.on('close', () => this.game.hideDialog());
        this.on('delete', () => this.deleteLevel());
        this.on('exclude', () => this.excludeValue());
        this.on('save', () => this.saveTower());
        this.on('towers', () => this.showTowers());
    }
    deleteLevel() {
        if (window.confirm(`Are you sure you want to delete this level?`)) {
            let levelId = this.selectedValue.id;
            let index = this.tower.items.findIndex(level => level.id == levelId);
            this.tower.items.splice(index, 1);
            this.tower.save();
            Raw.remove(levelId);
            this.getSelectedItem().remove();
            if (this.values.length) {
                if (index >= this.values.length) {
                    --index;
                }
                this.selectValue(this.values[index]);
            }
            else {
                this.addLevel();
            }
        }
    }
    enterSelection() {
        this.game.hideDialog();
    }
    excludeValue() {
        super.excludeValue();
        this.updateNumbers();
    }
    init() {
        this.tower = new level_Tower().load(this.game.tower.id);
        this.selectedValue = this.game.level.encode();
    }
    get outsideSelectedValue() {
        return this.game.level.encode();
    }
    saveTower() {
        let link = window.document.createElement('a');
        let data = JSON.stringify(this.tower.encodeExpanded());
        // TODO Zip it first?
        link.href = `data:application/json,${encodeURIComponent(data)}`;
        // TODO Base file name on tower name, but need to sanitize first!
        link.setAttribute('download', 'Tower.zym');
        link.click();
    }
    selectValue(level) {
        super.selectValue(level);
        window.localStorage['zym.levelId'] = level.id;
    }
    showTowers() {
        this.game.hideDialog();
        this.game.showDialog(new towers_Towers(this.game));
    }
    showValue(level) {
        this.game.showLevel(level);
    }
    updateNumbers() {
        let { items } = this.tower;
        this.tower.numberItems();
        let numberElements = [...this.list.querySelectorAll('.number')];
        // Build the numbers.
        numberElements.forEach((numberElement, index) => {
            let level = items[index];
            numberElement.innerText = (level.number || '');
            // TODO This makes things flicker sometimes.
            // TODO Or just cave and make this a table?
            // TODO Instead make some invisible area for calculation?
            numberElement.style.minWidth = '0';
        });
        // Make their widths uniform.
        // TODO Grid layout might be nice, eh?
        window.setTimeout(() => {
            let maxWidth = 0;
            numberElements.forEach(numberElement => {
                // Calculete width. TODO Extract this?
                let style = window.getComputedStyle(numberElement);
                let padding = Math.ceil(+style.paddingRight.slice(0, -2));
                let width = Math.max(numberElement.offsetWidth - padding, 0);
                maxWidth = Math.max(width, maxWidth);
            });
            numberElements.forEach(numberElement => {
                numberElement.style.minWidth = `${maxWidth}px`;
            });
        });
    }
    updateStats() {
        let itemElements = [...this.list.querySelectorAll('.item')];
        itemElements.forEach(itemElement => {
            let level = Raw.load(itemElement.dataset.value);
            if (level.contentHash) {
                let levelStats = StatsUtil.loadLevelStats(level);
                let statsElement = itemElement.querySelector('.stats');
                let best = levelStats.wins.min;
                let texts = [];
                let titles = [
                    `Win/fail total time: ${formatTime(levelStats.fails.total + levelStats.wins.total)}`,
                ];
                if (isFinite(best)) {
                    texts.push(formatTime(best));
                    if (levelStats.timestampBest) {
                        titles.push(`Record set at ${levelStats.timestampBest}`);
                    }
                }
                statsElement.title = titles.join(' - ');
                let total = levelStats.wins.count + levelStats.fails.count;
                texts.push(`${levelStats.wins.count}/${total}`);
                statsElement.innerText = `(${texts.join(', ')})`;
            }
        });
    }
    get values() {
        return this.tower.items;
    }
}

// CONCATENATED MODULE: ./src/ui/messages.ts

class messages_Messages extends Dialog {
    constructor(edit) {
        super(edit.game);
        this.content = load(__webpack_require__(8));
        this.messageText.value = edit.game.level.message;
    }
    field(name) {
        return this.content.querySelector(`.${name}`);
    }
    onHide() {
        this.game.level.message = this.messageText.value;
        this.game.level.save();
    }
    get messageText() {
        return this.field('messageText');
    }
}

// CONCATENATED MODULE: ./src/ui/report.ts

class report_Report extends Dialog {
    constructor(game, message) {
        super(game);
        let content = this.content = load(__webpack_require__(9));
        // Hide extras.
        for (let row of content.querySelectorAll('.timeRow')) {
            row.style.display = 'none';
        }
        // Now format.
        // TODO Juicier animation of this and such.
        this.field('endMessage').innerText = message;
        // TODO Simplify out this show thing? We used to have more variance.
        this.show('scoreTimeRow');
        this.field('scoreTime').innerText = formatTime(game.stage.time);
    }
    field(name) {
        return this.content.querySelector(`.${name}`);
    }
    onKey(event, down) {
        // TODO Option to repeat previous level.
        if (down && event.key == 'Enter') {
            this.game.hideDialog();
        }
    }
    show(name, display = 'table-row') {
        this.field(name).style.display = display;
    }
}

// CONCATENATED MODULE: ./src/ui/showmessage.ts

class showmessage_ShowMessage extends Dialog {
    constructor(game) {
        super(game);
        this.content = load(__webpack_require__(10));
        // TODO CommonMark?
        // TODO Replace all innerText with textContent?
        this.field('messageText').textContent = game.level.message;
    }
    field(name) {
        return this.content.querySelector(`.${name}`);
    }
    onKey(event, down) {
        if (down && event.key == 'Enter') {
            this.game.hideDialog();
        }
    }
}

// CONCATENATED MODULE: ./src/ui/towers.ts


class towers_Towers extends list_EditorList {
    constructor(game) {
        super(game, __webpack_require__(11));
    }
    addTower() {
        let tower = new level_Tower().encode();
        let level = new level_Level().encode();
        Raw.save(level);
        tower.items.push(level.id);
        Raw.save(tower);
        this.zone.items.push(tower);
        this.zone.save();
        this.addItem(tower);
        // Select the new.
        this.selectValue(tower);
    }
    buildTitleBar() {
        this.on('add', () => this.addTower());
    }
    enterSelection() {
        this.game.hideDialog();
        this.game.showDialog(new levels_Levels(this.game));
    }
    getLevel(tower) {
        if (tower.id == this.originalTower.id) {
            return this.originalLevel;
        }
        else {
            // TODO Track the last level selected in the editor for each tower?
            return Raw.load(tower.items[0]);
        }
    }
    init() {
        this.originalLevel = this.game.level.encode();
        this.originalTower = Object.assign({}, this.game.tower);
        this.zone = new Zone().load(this.game.zone.id);
        this.selectedValue = this.outsideSelectedValue;
    }
    get outsideSelectedValue() {
        return this.zone.items.find(item => item.id == this.game.tower.id);
    }
    selectValue(tower) {
        super.selectValue(tower);
        if (tower.id != window.localStorage['zym.towerId']) {
            let level = this.getLevel(tower);
            window.localStorage['zym.towerId'] = tower.id;
            window.localStorage['zym.levelId'] = level.id;
            this.game.tower = loadTower(this.game.zone);
        }
    }
    showValue(tower) {
        if (tower.id == this.game.tower.id) {
            // Already good to go.
            return;
        }
        this.game.tower = tower;
        this.game.showLevel(this.getLevel(tower));
    }
    get values() {
        return this.zone.items;
    }
}

// CONCATENATED MODULE: ./src/ui/index.ts
// Dependencies.

// Others.






// CONCATENATED MODULE: ./src/edit.ts



class edit_EditMode extends Mode {
    constructor(game) {
        super(game);
        this.active = false;
        this.bodyClass = 'editMode';
        // TODO Limit the total number of editStates?
        this.editStates = {};
        this.namedTools = new Map(Parts.inventory.filter(type => !type.ender).map(type => [
            // Split based on ModuleConcatenationPlugin style like 'hero_Hero'.
            // I might just need to make things explicit if I use a minifier, instead
            // of depending on class names.
            type.key,
            new toolbox_PartTool(this, type),
        ]));
        this.saveDelay = 10e3;
        let { body } = document;
        this.toolbox = new toolbox_Toolbox(body, this);
        // Always save on exit.
        window.addEventListener('beforeunload', () => this.saveAll());
        // Buttons.
        this.commandsContainer =
            body.querySelector('.panel.commands');
        this.onClick('exit', () => this.game.setMode(this.game.play));
        this.onClick('message', () => game.showDialog(new messages_Messages(this)));
        this.onClick('play', () => this.togglePlay());
        this.onClick('redo', () => this.editState.redo());
        this.onClick('showLevels', () => this.showLevels());
        this.onClick('undo', () => this.editState.undo());
        // Tools.
        this.namedTools.set('copy', this.copyTool = new toolbox_CopyTool(this));
        // this.namedTools.set('message', new MessageTool(this));
        this.namedTools.set('paste', new toolbox_PasteTool(this));
        this.namedTools.set('crop', this.cropTool = new toolbox_CropTool(this));
        // Initial history entry.
        this.editState.pushHistory(true);
    }
    apply(begin, tilePoint) {
        // Even if we don't make changes, the user seems active, so push off save.
        this.editState.updateChangeTime();
        if (begin) {
            this.tool.begin(tilePoint);
        }
        else {
            this.tool.drag(tilePoint);
        }
    }
    get breaking() {
        return this.getToolBoxState('breaking');
    }
    draw(tilePoint, tile) {
        // Need to call level.updateStage after this.
        let { game } = this;
        let { level } = game;
        if (level.tiles.get(tilePoint) == tile) {
            // No need to spin wheels when no change.
            return;
        }
        level.tiles.set(tilePoint, tile);
        if (tile) {
            // TODO Move function to PartType?
            tile.make(game).editPlacedAt(tilePoint);
        }
    }
    get editState() {
        let id = this.game.level.id;
        let editState = this.editStates[id];
        if (!editState) {
            this.editStates[id] = editState = new EditState(this);
        }
        // Level object sometimes changes out, so update each time.
        editState.level = this.game.level;
        return editState;
    }
    enable(command, enabled) {
        let classes = this.getButton(command).classList;
        if (enabled) {
            classes.remove('disabled');
        }
        else {
            classes.add('disabled');
        }
    }
    get ender() {
        return this.getToolBoxState('ender');
    }
    enter() {
        // Unpause on stop, so the characters can react.
        // TODO Is this doing the right thing?
        if (this.game.play.paused) {
            // TODO Activate function on modes for general handling?
            this.game.play.togglePause();
        }
        this.tool.activate();
        this.updateView();
    }
    exit() {
        this.saveAll();
        this.tool.deactivate();
    }
    get falling() {
        return this.getToolBoxState('falling');
    }
    getToolBoxState(className) {
        // Check toolbox existence because this gets called on construction, too.
        return !!this.toolbox && this.toolbox.getState(className);
    }
    get invisible() {
        return this.getToolBoxState('invisible');
    }
    mouseDown(event) {
        // Mouse down is always in bounds.
        let point = this.tilePoint(event.point);
        this.apply(true, point);
        this.active = true;
    }
    mouseMove(event) {
        // TODO Don't send these events when level list or such is up!
        let point = this.tilePoint(event.point);
        if (!point) {
            // Move and up can be out of bounds.
            return;
        }
        if (this.active) {
            this.apply(false, point);
        }
        else {
            if (this.tool && !this.game.showingDialog()) {
                this.tool.hover(point);
            }
        }
    }
    mouseUp(event) {
        // console.log('mouseUp', event);
        if (this.tool && this.active) {
            this.tool.end();
        }
        this.active = false;
        this.editState.pushHistory();
    }
    partTool(name, options) {
        // console.log(name, this.namedTools.get(name));
        let tool = this.namedTools.get(name);
        let baseType = tool && tool.type;
        if (!baseType) {
            return;
        }
        let type = Parts.optionType(baseType, options);
        return new toolbox_PartTool(this, type);
    }
    onClick(command, handler) {
        // Hide tool effects.
        this.getButton(command).addEventListener('click', () => {
            if (this.tool) {
                this.tool.deactivate();
            }
        });
        // And the requested handler, too.
        super.onClick(command, handler);
    }
    onKeyDown(key) {
        switch (key) {
            case 'Enter': {
                this.game.setMode(this.game.test);
                break;
            }
            case 'Escape': {
                if (!(this.game.dialog instanceof levels_Levels)) {
                    // Will happen after the any other hides.
                    window.setTimeout(() => this.showLevels(), 0);
                }
                break;
            }
        }
    }
    resize() {
        if (this.tool) {
            this.tool.resize();
        }
        this.updateView();
    }
    saveAll() {
        for (let key in this.editStates) {
            let editState = this.editStates[key];
            if (editState.saveNeeded) {
                editState.saveLevel();
            }
        }
    }
    setToolFromName(name) {
        // Should only be undefined the first time in.
        if (this.tool) {
            this.tool.deactivate();
        }
        let tool = this.toolFromName(name);
        if (tool) {
            this.tool = tool;
        }
        else {
            // This shouldn't happen when things are complete. It's just a fallback.
            console.warn(`No such tool: ${name}`);
            this.tool = new NopTool(this);
        }
        this.tool.activate();
    }
    showCommand(command, shown) {
        let element = this.getButton(command);
        // TODO How to default to inline-block through style sheet?
        element.style.display = shown ? 'inline-block' : 'none';
    }
    showingCommand(command) {
        let element = this.getButton(command);
        return element.style.display != 'none';
    }
    showLevels() {
        this.saveAll();
        this.game.showDialog(new levels_Levels(this.game));
    }
    showSaveState(state) {
        // Once saving beforeunload, these become less useful.
        // TODO Indicators useful to show saving to servers?
        // // These aren't really commands, but eh.
        // for (let command of ['changing', 'saved']) {
        //   this.showCommand(command, command == state);
        // }
    }
    tilePoint(stagePoint) {
        let point = stagePoint.clone().divide(level_Level.tileSize).floor();
        if (point.x < 0 || point.x >= level_Level.tileCount.x) {
            return;
        }
        if (point.y < 0 || point.y >= level_Level.tileCount.y) {
            return;
        }
        return point;
    }
    togglePlay() {
        this.game.setMode(this.game.mode == this.game.test ? this.game.edit : this.game.test);
    }
    toolFromName(name) {
        let tool = this.namedTools.get(name);
        if (tool instanceof toolbox_PartTool) {
            // Be more precise, in terms of our options.
            tool = this.partTool(name, this);
        }
        return tool;
    }
    updateTool() {
        if (this.tool instanceof toolbox_PartTool) {
            this.setToolFromName(this.tool.type.base.key);
        }
    }
    updateView() {
        this.cropTool.updateView();
    }
}
class EditState {
    constructor(edit) {
        this.history = [];
        this.historyIndex = -1;
        this.lastChangeTime = 0;
        this.saveNeeded = false;
        this.edit = edit;
        // Remember the current level.
        this.level = this.game.level;
    }
    get game() {
        return this.edit.game;
    }
    pushHistory(initial = false) {
        // TODO Check for actual changes here? Or record as changes happen?
        if (this.history.length &&
            this.level.equals(this.history[this.historyIndex])) {
            // Nothing changed. Stay put.
            return;
        }
        // Delete anything after our current position.
        this.history.splice(this.historyIndex + 1, this.history.length);
        // Add the new.
        this.history.push(this.level.copy());
        this.historyIndex += 1;
        // Clear out super old, though it's hard to believe we'll blow out ram.
        if (this.history.length > 100) {
            this.history.shift();
            this.historyIndex -= 1;
        }
        this.trackChange(initial);
    }
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex += 1;
            this.level.copyFrom(this.history[this.historyIndex]);
            this.level.updateStage(this.game);
            this.trackChange();
        }
    }
    saveLevel() {
        this.level.save();
        this.saveNeeded = false;
    }
    saveLevelMaybe() {
        if (this.saveNeeded) {
            if (window.performance.now() - this.lastChangeTime > this.edit.saveDelay) {
                // console.log(`Saving at ${window.performance.now()}`)
                // Remember the level that we need to save.
                this.saveLevel();
            }
            else {
                // console.log(`Waiting to save at ${window.performance.now()}`)
            }
        }
    }
    trackChange(initial = false) {
        if (!initial) {
            // Track time for saving.
            this.saveNeeded = true;
            this.updateChangeTime();
        }
        // Enable or disable undo/redo.
        this.edit.enable('redo', this.historyIndex < this.history.length - 1);
        this.edit.enable('undo', this.historyIndex > 0);
    }
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex -= 1;
            this.level.copyFrom(this.history[this.historyIndex]);
            this.level.updateStage(this.game);
            this.trackChange();
        }
    }
    updateChangeTime() {
        this.lastChangeTime = window.performance.now();
        // Change/save indicators aren't really commands, but eh.
        this.edit.showSaveState('changing');
        if (this.saveNeeded) {
            // Make sure we have some event out past save time.
            // console.log(`Setting timeout for save at ${window.performance.now()}`);
            window.setTimeout(() => this.saveLevelMaybe(), this.edit.saveDelay + 0.5);
        }
    }
}

// EXTERNAL MODULE: ./node_modules/blueimp-md5/js/md5.min.js
var md5_min = __webpack_require__(1);
var md5_min_default = /*#__PURE__*/__webpack_require__.n(md5_min);

// CONCATENATED MODULE: ./src/level.ts




function copyPoint(point) {
    if (point) {
        return { x: point.x, y: point.y };
    }
}
function copyRect(rect) {
    if (rect) {
        return { max: copyPoint(rect.max), min: copyPoint(rect.min) };
    }
}
class StatsUtil {
    static initLevelStats(level) {
        if (!level.contentHash) {
            throw new Error(`no contentHash for level ${level.id}`);
        }
        return {
            fails: this.initStats(),
            id: level.contentHash,
            type: 'LevelStats',
            wins: this.initStats(),
        };
    }
    static initStats() {
        return { count: 0, diff2: 0, max: -Infinity, min: Infinity, total: 0 };
    }
    static loadLevelStats(level) {
        let levelStats = Raw.load(level.contentHash);
        if (levelStats) {
            // No inf in json (silly Crockford), so revert nulls.
            function fix(stats) {
                if (stats.max == null)
                    stats.max = -Infinity;
                if (stats.min == null)
                    stats.min = Infinity;
            }
            fix(levelStats.fails);
            fix(levelStats.wins);
        }
        return levelStats || this.initLevelStats(level);
    }
    static update(stats, value) {
        // Prep variance calculations. See also Wikipedia.
        let diff = value - (stats.count ? stats.total / stats.count : 0);
        // Easy parts.
        stats.count += 1;
        stats.max = Math.max(stats.max, value);
        stats.min = Math.min(stats.min, value);
        stats.total += value;
        // Finish variance.
        let diffAfter = value - (stats.total / stats.count);
        stats.diff2 = stats.diff2 + diff * diffAfter;
    }
}
class Raw {
    constructor() { }
    static encodeMeta(item) {
        let meta = {
            id: item.id,
            name: item.name,
            type: item.type,
        };
        if (item.excluded) {
            meta.excluded = true;
        }
        if (item.locked) {
            meta.locked = true;
        }
        return meta;
    }
    static load(ref) {
        let result = internals.get(ref);
        if (result) {
            return result;
        }
        let text = window.localStorage[`zym.objects.${ref}`];
        if (text) {
            // TODO Sanitize names?
            return JSON.parse(text);
        }
        // else undefined
    }
    static remove(id) {
        window.localStorage.removeItem(`zym.objects.${id}`);
    }
    static save(raw) {
        if (internals.has(raw.id) || raw.locked) {
            // Don't touch this.
            return;
        }
        // console.log(`Save ${raw.type} ${raw.name} (${raw.id})`);
        window.localStorage[`zym.objects.${raw.id}`] = JSON.stringify(raw);
    }
}
class Encodable {
    load(id) {
        this.decode(Raw.load(id));
        return this;
    }
    save() {
        Raw.save(this.encode());
    }
}
class level_ItemList extends Encodable {
    constructor() {
        super(...arguments);
        this.excluded = false;
        this.id = createId();
        this.items = new Array();
        this.name = this.type;
    }
    static numberItems(items) {
        let number = 1;
        for (let item of items) {
            if (item.excluded) {
                item.number = undefined;
            }
            else {
                item.number = number;
                ++number;
            }
        }
    }
    decode(encoded) {
        this.id = encoded.id;
        this.items = encoded.items.
            map(id => Raw.load(id)).
            filter(item => item);
        this.name = encoded.name;
        return this;
    }
    encode() {
        // This presumes that all individual levels have already been saved under
        // their own ids.
        return Object.assign({ items: this.items.map(item => item.id) }, Raw.encodeMeta(this));
    }
    encodeExpanded() {
        // Intended for full export.
        return Object.assign({ items: this.items }, Raw.encodeMeta(this));
    }
    numberItems() {
        level_ItemList.numberItems(this.items);
    }
}
class Zone extends level_ItemList {
    get type() {
        return 'Zone';
    }
}
class level_Tower extends level_ItemList {
    static hashify(tower, internal = false) {
        // Reset ids by content hashes for a constant level.
        let ids = tower.items.map(level => {
            let contentHash = level.contentHash;
            if (!contentHash) {
                // Shouldn't come here for recent exports, but I might want to try
                // against older exports.
                let levelFull = new level_Level().decode(level);
                contentHash = levelFull.calculateContentHash();
            }
            level.id = md5_min_default()(contentHash);
            level.locked = true;
            if (internal) {
                internals.set(level.id, level);
            }
            return level.id;
        });
        tower.id = md5_min_default()(ids.join());
        tower.locked = true;
        // This might have been a structural tower without being a tower instance.
        let raw = level_Tower.prototype.encode.call(tower);
        tower = new level_Tower().decode(raw);
        if (internal) {
            internals.set(tower.id, raw);
        }
        return tower;
    }
    encodeExpanded() {
        // Get common expanded.
        let result = super.encodeExpanded();
        // But we want high scores here for later player evaluation.
        result.items = result.items.map(level => {
            let statsLevel = Object.assign({}, level);
            if (statsLevel.contentHash) {
                let levelStats = StatsUtil.loadLevelStats(statsLevel);
                if (isFinite(levelStats.wins.min)) {
                    statsLevel.winsMin = levelStats.wins.min;
                }
            }
            return statsLevel;
        });
        // Good to go.
        return result;
    }
    get type() {
        return 'Tower';
    }
}
class level_Level extends Encodable {
    constructor({ id, tiles } = {}) {
        super();
        this.bounds = undefined;
        this.excluded = false;
        this.message = '';
        this.name = 'Level';
        this.tileBoundsCache = { max: new three["Vector2"](), min: new three["Vector2"]() };
        this.id = id || createId();
        if (tiles) {
            this.tiles = tiles;
        }
        else {
            this.tiles = new Grid(level_Level.tileCount);
            this.tiles.items.fill(None);
        }
    }
    calculateContentHash() {
        // Hash of just the things that affect gameplay, not metadata.
        let content = this.encodeTiles(true);
        // MD5 is good enough since this isn't about strict security, just about an
        // easy way to store scores by level content rather than id.
        return md5_min_default()(content);
    }
    copy() {
        // TODO Include excluded?
        let level = new level_Level({ id: this.id, tiles: this.tiles.copy() });
        level.bounds = copyRect(this.bounds);
        level.message = this.message;
        return level;
    }
    copyFrom(level) {
        // TODO Include excluded?
        this.bounds = copyRect(level.bounds);
        this.message = level.message;
        this.name = level.name;
        this.tiles = level.tiles.copy();
    }
    decode(encoded) {
        this.excluded = !!encoded.excluded;
        // Id. Might be missing for old saved levels.
        // TODO Not by now, surely? Try removing checks?
        // TODO Sanitize id, name, and tiles?
        this.bounds = copyRect(encoded.bounds);
        if (encoded.id) {
            this.id = encoded.id;
        }
        if (encoded.name) {
            this.name = encoded.name;
        }
        this.number = encoded.number;
        // Messages.
        this.message = encoded.message || '';
        // Tiles.
        let point = new three["Vector2"]();
        let rows = encoded.tiles.split('\n').slice(0, level_Level.tileCount.y);
        rows.forEach((row, i) => {
            i = level_Level.tileCount.y - i - 1;
            for (let j = 0; j < Math.min(row.length, level_Level.tileCount.x); ++j) {
                let type = Parts.charParts.get(row.charAt(j));
                this.tiles.set(point.set(j, i), type || None);
            }
        });
        // Let this be saved over later rather than loaded here.
        // We want people who need a hash to make sure the hash is saved for use on
        // raw data.
        // this.contentHash = encoded.contentHash || this.calculateContentHash();
        return this;
    }
    encode() {
        let raw = Object.assign({ 
            // Caching the hash could allow for easier score lookups.
            contentHash: this.updateContentHash(), tiles: this.encodeTiles() }, Raw.encodeMeta(this));
        if (this.message) {
            raw.message = this.message;
        }
        if (this.bounds) {
            raw.bounds = copyRect(this.bounds);
        }
        return raw;
    }
    encodeTiles(boundsOnly = false) {
        let rows = [];
        let iBegin = level_Level.tileCount.y - 1;
        let iEnd = -1;
        let jBegin = 0;
        let jEnd = level_Level.tileCount.x;
        let { bounds } = this;
        if (boundsOnly && bounds) {
            iBegin = bounds.max.y - 1;
            iEnd = bounds.min.y - 1;
            jBegin = bounds.min.x;
            jEnd = bounds.max.x;
        }
        let point = new three["Vector2"]();
        for (let i = iBegin; i != iEnd; --i) {
            let row = [];
            for (let j = jBegin; j != jEnd; ++j) {
                let type = this.tiles.get(point.set(j, i));
                row.push(type.char || '?');
            }
            rows.push(row.join(''));
        }
        return rows.join('\n');
    }
    equals(other) {
        for (let i = 0; i < this.tiles.items.length; ++i) {
            if (this.tiles.items[i] != other.tiles.items[i]) {
                return false;
            }
        }
        if (this.bounds || other.bounds) {
            if (!(this.bounds && other.bounds)) {
                return false;
            }
            let { max: thisMax, min: thisMin } = this.bounds;
            let { max: thatMax, min: thatMin } = other.bounds;
            return (thisMax.x == thatMax.x && thisMax.y == thatMax.y &&
                thisMin.x == thatMin.x && thisMin.y == thatMin.y);
        }
        if (this.message != other.message) {
            return false;
        }
        return true;
    }
    load(id) {
        try {
            super.load(id);
        }
        catch (e) {
            // TODO Is this catch really a good idea?
            this.tiles.items.fill(None);
        }
        // For convenience.
        return this;
    }
    get tileBounds() {
        let { max, min } = this.tileBoundsCache;
        // Required mess if I allow undefined bounds.
        if (this.bounds) {
            let { max: boundsMax, min: boundsMin } = this.bounds;
            max.set(boundsMax.x, boundsMax.y);
            min.set(boundsMin.x, boundsMin.y);
        }
        else {
            max.set(level_Level.tileCount.x, level_Level.tileCount.y);
            min.set(0, 0);
        }
        return this.tileBoundsCache;
    }
    updateContentHash() {
        return this.contentHash = this.calculateContentHash();
    }
    // For use from the editor.
    updateStage(game, reset = false) {
        let { max, min } = this.tileBounds;
        let play = game.mode instanceof play_PlayMode;
        let stage = game.stage;
        let theme = game.theme;
        game.mode.updateView();
        if (reset) {
            // Had some phantoms on a level. Clear the grid helps?
            stage.clearGrid();
            stage.ended = false;
            stage.ending = false;
            stage.energyOn = true;
            stage.time = 0;
            stage.particles.clear();
        }
        stage.hero = undefined;
        stage.treasureCount = 0;
        if (play) {
            stage.tileBounds.max.copy(max);
            stage.tileBounds.min.copy(min);
        }
        else {
            stage.tileBounds.max.copy(level_Level.tileCount);
            stage.tileBounds.min.set(0, 0);
        }
        for (let j = 0, k = 0; j < level_Level.tileCount.x; ++j) {
            for (let i = 0; i < level_Level.tileCount.y; ++i, ++k) {
                let tile = this.tiles.items[k];
                // Handle enders for play mode.
                if (play && tile.ender) {
                    // TODO Need a time for transition animation?
                    let options = Object.assign({}, tile.options);
                    for (let key in tile.options) {
                        options[key] = tile[key];
                    }
                    options.ender = false;
                    tile = stage.ending ? Parts.optionType(tile, options) : None;
                }
                // Build a new part if needed.
                let oldPart = stage.parts[k];
                let part;
                // If it's the same type as what we already had, presume it's already in
                // the right place.
                if (reset || !oldPart || oldPart.type != tile) {
                    // Needs to be a new part.
                    part = tile.make(game);
                    theme.buildArt(part);
                    part.point.set(j, i).multiply(level_Level.tileSize);
                    stage.parts[k] = part;
                    if (oldPart) {
                        stage.removed(oldPart);
                    }
                    stage.added(part);
                }
                else {
                    part = oldPart;
                }
                if (play) {
                    part.cropped = j < min.x || i < min.y || j >= max.x || i >= max.y;
                }
                if (part instanceof hero_Hero) {
                    stage.hero = part;
                }
                else if (part instanceof Treasure && !part.cropped) {
                    ++stage.treasureCount;
                }
            }
        }
        stage.update();
        if (reset) {
            stage.init();
            if (!stage.treasureCount) {
                // Already got them all!
                stage.ending = true;
                this.updateStage(game);
            }
        }
        theme.buildDone(game);
    }
    get type() {
        return 'Level';
    }
}
level_Level.tileCount = new three["Vector2"](40, 20);
level_Level.tileSize = new three["Vector2"](8, 10);
level_Level.pixelCount = level_Level.tileCount.clone().multiply(level_Level.tileSize);
// export interface Message {
//   excluded?: boolean;
//   // TODO Display area.
//   // TODO Other conditions? (Last treasure, ...)
//   text: string;
// }
// export function copyMessage(message: Message) {
//   // TODO Deeper copy once conditions!
//   return {...message};
// }
// export function equalMessages(a: Message, b: Message) {
//   if (a.text != b.text) {
//     return false;
//   }
//   if (!!a.excluded != !!b.excluded) {
//     return false;
//   }
//   // TODO Bounds and conditions.
//   return true;
// }
var internals = new Map();

// CONCATENATED MODULE: ./src/play.ts


class play_PlayMode extends Mode {
    constructor(game) {
        super(game);
        this.bodyClass = 'playMode';
        this.paused = false;
        this.starting = true;
        this.won = false;
        this.onClick('pause', () => this.togglePause());
        // TODO Different handling (and visual display) of stop when really playing? 
        this.onClick('stop', () => this.game.setMode(this.game.edit));
    }
    enter() {
        if (this.game.level.message) {
            this.showMessage();
        }
        this.game.play.starting = true;
        this.won = false;
        // Sometimes things get confused, and clearing the action might help.
        // We can't directly read keyboard state.
        this.game.control.clear();
        this.game.control.keyAction.clear();
    }
    fail() {
        this.game.stage.ended = true;
        this.updateStats('fails');
        this.showReport('Maybe next time.');
    }
    onHideDialog(dialog) {
        if (dialog instanceof report_Report) {
            this.startNextOrRestart();
        }
    }
    onKeyDown(key) {
        switch (key) {
            case 'Escape': {
                let { hero } = this.game.stage;
                if (hero) {
                    hero.die();
                }
                break;
            }
        }
    }
    showMessage() {
        // Override in test not to show?
        // keepOpen is a hope to reduce flashing bring colors between dialogs.
        // The timeout so far is necessary to get it showing at all.
        this.game.keepOpen = true;
        window.setTimeout(() => {
            this.game.keepOpen = false;
            this.game.showDialog(new showmessage_ShowMessage(this.game));
        }, 0);
    }
    showReport(message) {
        this.game.showDialog(new report_Report(this.game, message));
    }
    startNextOrRestart() {
        let { game } = this;
        // If we won, get the next level ready.
        if (this.won) {
            let tower = new level_Tower().load(game.tower.id);
            tower.numberItems();
            let index = tower.items.findIndex(item => item.id == game.level.id);
            if (index == -1) {
                // How did we lose our level?
                console.log(`Level ${game.level.id} not found in tower ${game.tower.id}`);
                // Get out of here or something ...
                game.setMode(game.edit);
                return;
            }
            let next = tower.items.slice(index + 1).find(item => !item.excluded);
            if (!next) {
                // That was the end of the tower.
                // TODO Show tower-end screen, then go back to the title screen or such.
                game.setMode(game.edit);
                return;
            }
            // Got a level, so use it.
            game.showLevel(next);
            window.localStorage['zym.levelId'] = next.id;
        }
        else {
            // Restart the current level.
            game.level.updateStage(game, true);
        }
        // And kick things off.
        this.enter();
    }
    tick() {
        if (this.starting) {
            if (this.game.control.active()) {
                this.starting = false;
            }
        }
        if (this.paused || this.starting) {
            // No updates. TODO Any juice for paused mode?
            return;
        }
        this.game.stage.tick();
    }
    togglePause() {
        this.paused = !this.paused;
        this.toggleClasses({
            element: this.getButton('pause'),
            falseClass: 'fa-pause', trueClass: 'fa-play',
            value: this.paused,
        });
    }
    updateStats(key) {
        let newBest = false;
        let { level, stage } = this.game;
        // Store score by hash.
        // First, make sure the hash is up to date, so we associate scores right.
        if (level.calculateContentHash() != level.contentHash) {
            // Save should update the content hash, but be explicit anyway.
            level.updateContentHash();
            level.save();
        }
        // Update stats.
        let levelStats = StatsUtil.loadLevelStats(level);
        if (key == 'wins' && stage.time < levelStats[key].min) {
            levelStats.timestampBest = new Date().toISOString();
            newBest = true;
        }
        StatsUtil.update(levelStats[key], stage.time);
        // Save and done.
        Raw.save(levelStats);
        return newBest;
    }
    updateView() {
        this.game.edit.cropTool.selector.style.display = 'none';
    }
    win() {
        this.won = true;
        this.game.stage.ended = true;
        let newBest = this.updateStats('wins');
        let message = 'Level complete!';
        if (newBest) {
            message += ' New record!!!!';
        }
        this.showReport(message);
    }
}
class play_TestMode extends play_PlayMode {
    // TODO Different end-level handling and/or keyboard handling.
    // TODO Probably different bodyClass, too.
    onKeyDown(key) {
        switch (key) {
            case 'Enter':
            case 'Escape': {
                this.game.setMode(this.game.edit);
                break;
            }
            default: {
                super.onKeyDown(key);
                break;
            }
        }
    }
    onHideDialog(dialog) {
        if (dialog instanceof report_Report) {
            this.game.setMode(this.game.edit);
        }
    }
}

// CONCATENATED MODULE: ./src/toolbox.ts



class toolbox_Toolbox {
    constructor(body, edit) {
        // Toolbox.
        this.container = body.querySelector('.toolbox');
        this.edit = edit;
        this.markSelected();
        let container = this.container;
        for (let input of container.querySelectorAll(this.radioQuery())) {
            input.addEventListener('click', ({ target }) => {
                let input = target;
                for (let other of this.getToolButtons(input.name)) {
                    other.classList.remove('selected');
                }
                this.markSelected(input.name);
            });
        }
        for (let input of container.querySelectorAll('input[type="checkbox"]')) {
            input.addEventListener('change', ({ target }) => {
                let input = target;
                let label = input.closest('label');
                if (!label.classList.contains('disabled')) {
                    if (input.checked) {
                        label.classList.add('selected');
                    }
                    else {
                        label.classList.remove('selected');
                    }
                    this.handleChangedCheckbox(input);
                }
            });
        }
        // TODO Other panels.
    }
    getButtons() {
        return [...this.container.querySelectorAll('label')];
    }
    getName(button) {
        return [...button.classList].filter(name => name != 'selected')[0];
    }
    getState(name) {
        return this.container.querySelector(`.${name} input`).checked;
    }
    getToolButtons(fieldName) {
        return [...this.container.querySelectorAll(this.radioQuery(fieldName))].map(input => input.closest('label'));
    }
    handleChangedCheckbox(checkbox) {
        let name = this.getName(checkbox.closest('label'));
        if (name in part_Part.options) {
            this.edit.updateTool();
        }
    }
    markSelected(fieldName) {
        let query = this.radioQuery(fieldName) + ':checked';
        let selecteds = this.container.querySelectorAll(query);
        // TODO Assert only one if fieldName?
        for (let selected of selecteds) {
            let label = selected.closest('label');
            label.classList.add('selected');
            // Get the class name that's not selected.
            // TODO Instead put name on the input?
            let name = this.getName(label);
            if (selected.name == 'tool') {
                this.edit.setToolFromName(name);
            }
            else {
                this.updateTool(label);
            }
        }
    }
    radioQuery(fieldName) {
        let query = 'input[type="radio"]';
        if (fieldName) {
            query += `[name="${fieldName}"]`;
        }
        return query;
    }
    updateTool(menuButton) {
        let name = this.getName(menuButton);
        // Change the parent.
        let parent = menuButton.parentNode.closest('label');
        let parentName = this.getName(parent);
        parent.classList.remove(parentName);
        parent.classList.add(name);
        // Change the parent's appearance.
        let fontIcon = menuButton.querySelector('i');
        if (fontIcon) {
            // Copy over the full class.
            parent.querySelector(':scope > i').className = fontIcon.className;
        }
        else {
            // Game element.
            // Theme could be missing during startup.
            if (this.edit.game.theme) {
                this.edit.game.theme.updateTool(parent);
            }
        }
        // Select the parent.
        parent.click();
        // Hide the menu.
        let menu = parent.querySelector('.toolMenu');
        menu.style.display = 'none';
        // But allow it to come back.
        window.setTimeout(() => menu.style.display = '', 0);
    }
}
class Tool {
    constructor(edit) {
        this.edit = edit;
    }
    activate() { }
    deactivate() { }
    end() { }
    hover(tilePoint) { }
    resize() { }
}
class toolbox_SelectionTool extends Tool {
    constructor(edit, name) {
        super(edit);
        this.borderPixels = 0;
        this.needsUpdate = false;
        this.point = new three["Vector2"]();
        this.tileBegin = new three["Vector2"]();
        this.tileBottomRight = new three["Vector2"]();
        this.tileTopLeft = new three["Vector2"]();
        this.selector = edit.game.body.querySelector(`.${name}`);
    }
    activate() {
        this.borderPixels = Number.parseInt(getComputedStyle(this.selector).getPropertyValue('border-left-width'));
    }
    begin(tilePoint) {
        // First, reset our selection.
        this.needsUpdate = true;
        let { point, tileBottomRight, tileTopLeft } = this;
        tileTopLeft.copy(tilePoint);
        tileBottomRight.copy(tilePoint);
        this.place(this.tileBegin.copy(tilePoint));
        this.scaled(point.set(1, 1));
        this.selector.style.width = `${point.x}px`;
        this.selector.style.height = `${point.y}px`;
        this.selector.style.display = 'block';
    }
    deactivate() {
        if (this.needsUpdate) {
            this.updateData();
            this.needsUpdate = false;
        }
    }
    drag(tilePoint) {
        let anyChange = false;
        let { point, tileBegin, tileBottomRight, tileTopLeft } = this;
        point.x = Math.min(tileBegin.x, tilePoint.x);
        point.y = Math.max(tileBegin.y, tilePoint.y);
        if (!point.equals(tileTopLeft)) {
            tileTopLeft.copy(point);
            anyChange = true;
        }
        point.x = Math.max(tileBegin.x, tilePoint.x);
        point.y = Math.min(tileBegin.y, tilePoint.y);
        if (!point.equals(tileBottomRight)) {
            tileBottomRight.copy(point);
            anyChange = true;
        }
        if (anyChange) {
            this.resize();
        }
    }
    place(tilePoint) {
        let point = this.scaledOffset(tilePoint);
        this.selector.style.left = `${point.x - this.borderPixels}px`;
        this.selector.style.top = `${point.y - this.borderPixels}px`;
    }
    resize() {
        let { point, tileBottomRight, tileTopLeft } = this;
        this.place(tileTopLeft);
        point.copy(tileBottomRight).sub(tileTopLeft);
        point.x += 1;
        point.y = -point.y + 1;
        this.scaled(point);
        this.selector.style.width = `${point.x}px`;
        this.selector.style.height = `${point.y}px`;
    }
    scaled(tilePoint) {
        let { point } = this;
        let canvas = this.edit.game.renderer.domElement;
        point.copy(tilePoint).divide(level_Level.tileCount);
        point.x *= canvas.clientWidth;
        point.y *= canvas.clientHeight;
        return point;
    }
    scaledOffset(tilePoint) {
        let { point } = this;
        point.copy(tilePoint);
        point.y = level_Level.tileCount.y - point.y - 1;
        let canvas = this.edit.game.renderer.domElement;
        this.scaled(point);
        point.x += canvas.offsetLeft;
        point.y += canvas.offsetTop;
        return point;
    }
}
class toolbox_CopyTool extends toolbox_SelectionTool {
    constructor(edit) {
        super(edit, 'selector');
        this.tiles = undefined;
    }
    deactivate() {
        this.selector.style.display = 'none';
        super.deactivate();
    }
    end() {
        let paste = this.edit.toolbox.container.querySelector('.paste');
        paste.click();
        this.selector.style.display = 'block';
    }
    updateData() {
        // Copy data.
        let { edit, point, tileBottomRight, tileTopLeft } = this;
        let { tiles: levelTiles } = edit.game.level;
        let min = new three["Vector2"](tileTopLeft.x, tileBottomRight.y);
        let max = new three["Vector2"](tileBottomRight.x, tileTopLeft.y).addScalar(1);
        let size = new three["Vector2"](max.x - min.x, max.y - min.y);
        let tiles = this.tiles = new Grid(size);
        for (let x = 0; x < size.x; ++x) {
            for (let y = 0; y < size.y; ++y) {
                point.set(x, y).add(min);
                let tile = levelTiles.get(point);
                point.sub(min);
                tiles.set(point, tile);
            }
        }
        // console.log(tiles);
        // Copy visuals.
        // The other option is phantom parts.
        // Or a whole separate scene.
        // All have pain.
        max.multiply(level_Level.tileSize);
        min.multiply(level_Level.tileSize);
        size.multiply(level_Level.tileSize);
        let image = document.createElement('canvas');
        let target = new three["WebGLRenderTarget"](size.x, size.y);
        try {
            let { camera, renderer, scene } = edit.game;
            camera = camera.clone();
            camera.bottom = min.y;
            camera.left = min.x;
            camera.right = max.x;
            camera.top = max.y;
            camera.updateProjectionMatrix();
            // TODO Extract this render-to-canvas logic?
            renderer.render(scene, camera, target);
            let data = new Uint8Array(4 * size.x * size.y);
            renderer.readRenderTargetPixels(target, 0, 0, size.x, size.y, data);
            image.width = size.x;
            image.height = size.y;
            let context = image.getContext('2d');
            let imageData = context.createImageData(size.x, size.y);
            imageData.data.set(data);
            context.putImageData(imageData, 0, 0);
        }
        finally {
            target.dispose();
        }
        image.style.transform = 'scaleY(-1)';
        let clipboard = edit.game.body.querySelector('.clipboard');
        clipboard.innerHTML = '';
        clipboard.appendChild(image);
    }
}
class toolbox_CropTool extends toolbox_SelectionTool {
    constructor(edit) {
        super(edit, 'cropper');
    }
    begin(tilePoint) {
        super.begin(tilePoint);
        this.updateData();
    }
    deactivate() {
        super.deactivate();
        if (!this.edit.game.level.bounds) {
            this.selector.style.display = 'none';
        }
    }
    drag(tilePoint) {
        super.drag(tilePoint);
        this.updateData();
    }
    updateData() {
        let { edit, point, tileBottomRight, tileTopLeft } = this;
        let { level } = edit.game;
        let { tileCount } = level_Level;
        let min = new three["Vector2"](tileTopLeft.x, tileBottomRight.y);
        let max = new three["Vector2"](tileBottomRight.x, tileTopLeft.y).addScalar(1);
        if (min.x > 0 || min.y > 0 || max.x < tileCount.x || max.y < tileCount.y) {
            level.bounds = { max: copyPoint(max), min: copyPoint(min) };
        }
        else {
            level.bounds = undefined;
        }
        this.needsUpdate = false;
    }
    updateView() {
        let { bounds } = this.edit.game.level;
        if (bounds) {
            this.tileBottomRight.set(bounds.max.x - 1, bounds.min.y);
            this.tileTopLeft.set(bounds.min.x, bounds.max.y - 1);
            this.resize();
            this.selector.style.display = 'block';
        }
        else {
            this.selector.style.display = 'none';
        }
    }
}
// export class MessageTool extends SelectionTool {
//   constructor(edit: EditMode) {
//     super(edit, 'selector');
//   }
//   activate() {
//     this.edit.game.showDialog(new Messages(this.edit));
//     super.activate();
//   }
//   deactivate() {
//     this.selector.style.display = 'none';
//     super.deactivate();
//   }
//   updateData(): void {
//     // throw new Error("Method not implemented.");
//   }
// }
class NopTool extends Tool {
    begin() { }
    drag() { }
}
class toolbox_PartTool extends Tool {
    constructor(edit, type) {
        super(edit);
        this.erasing = false;
        this.type = type;
    }
    begin(tilePoint) {
        // Figure out mode.
        if (this.type == None) {
            this.erasing = false;
        }
        else {
            let old = this.edit.game.level.tiles.get(tilePoint);
            this.erasing = old == this.type;
        }
        // Now apply.
        this.drag(tilePoint);
    }
    drag(tilePoint) {
        let { game } = this.edit;
        let { level } = game;
        let { type } = this;
        if (this.erasing) {
            if (type == level.tiles.get(tilePoint)) {
                type = None;
            }
            else {
                // We only erase those matching our current tool, so get out.
                return;
            }
        }
        this.edit.draw(tilePoint, type);
        level.updateStage(game);
    }
}
class toolbox_PasteTool extends Tool {
    constructor(edit) {
        super(edit);
        this.clipboard = undefined;
        this.point = new three["Vector2"]();
        this.tileMin = new three["Vector2"]();
    }
    activate() {
        let { body } = this.edit.game;
        this.clipboard = body.querySelector('.clipboard');
        this.resize();
    }
    begin(tilePoint) {
        this.drag(tilePoint);
        this.edit.copyTool.selector.style.display = 'none';
    }
    deactivate() {
        this.clipboard.style.display = 'none';
        // TODO How to avoid hiding if the new tool is copy?
        this.edit.copyTool.selector.style.display = 'none';
    }
    drag(tilePoint) {
        let { edit, point, tileMin } = this;
        let { tiles } = edit.copyTool;
        if (!tiles) {
            return;
        }
        let { game } = edit;
        let { level } = edit.game;
        let { tiles: levelTiles } = level;
        // Update where we are.
        this.place(tilePoint);
        // Draw.
        let { size } = tiles;
        for (let x = 0; x < size.x; ++x) {
            for (let y = 0; y < size.y; ++y) {
                point.set(x, y);
                let tile = tiles.get(point);
                this.edit.draw(point.add(tileMin), tile);
            }
        }
        level.updateStage(edit.game);
    }
    hover(tilePoint) {
        if (!this.edit.copyTool.tiles) {
            return;
        }
        this.place(tilePoint);
        this.clipboard.style.display = 'block';
    }
    place(tilePoint) {
        let { clipboard, edit, point, tileMin } = this;
        let { copyTool } = edit;
        if (!copyTool.tiles) {
            return;
        }
        // TODO Treat size as immutable!
        let { size } = copyTool.tiles;
        point.copy(copyTool.tiles.size).multiplyScalar(0.5);
        tileMin.copy(tilePoint).sub(point);
        // Keep things in bounds.
        tileMin.x = Math.max(0, tileMin.x);
        tileMin.y = Math.max(0, tileMin.y);
        point.copy(tileMin).add(size);
        if (point.x >= level_Level.tileCount.x) {
            tileMin.x = level_Level.tileCount.x - size.x;
        }
        if (point.y >= level_Level.tileCount.y) {
            tileMin.y = level_Level.tileCount.y - size.y;
        }
        // Now make sure to align with grid.
        tileMin.x = Math.ceil(tileMin.x);
        tileMin.y = Math.ceil(tileMin.y);
        // Now place it.
        point.copy(tileMin);
        point.y += size.y - 1;
        // Copy because we otherwise get copyTool's internal storage point.
        point.copy(copyTool.scaledOffset(point));
        clipboard.style.left = `${point.x}px`;
        clipboard.style.top = `${point.y}px`;
    }
    resize() {
        this.edit.copyTool.resize();
        let { domElement } = this.edit.game.renderer;
        let image = this.clipboard.querySelector('canvas');
        let size = new three["Vector2"](domElement.width, domElement.height);
        size.divide(level_Level.pixelCount);
        size.x *= image.width;
        size.y *= image.height;
        image.style.width = `${size.x}px`;
        image.style.height = `${size.y}px`;
    }
}

// CONCATENATED MODULE: ./src/index.ts
// This file allows exporting the entire package api as a unified whole, while
// coming from different source files.
// Some others depend on Mode and Part from these for now, so import it first.










// CONCATENATED MODULE: ./src/gold/theme.ts




var Layer;
(function (Layer) {
    // Normally I go alphabetical, but instead put this in back to front order.
    // Back is all for static items that people go in front of.
    Layer[Layer["back"] = 0] = "back";
    Layer[Layer["treasure"] = 1] = "treasure";
    Layer[Layer["dead"] = 2] = "dead";
    Layer[Layer["hero"] = 3] = "hero";
    // All enemies appear above player to be aggressive.
    // Biggies go behind other enemies because they are bigger.
    Layer[Layer["biggie"] = 4] = "biggie";
    Layer[Layer["enemy"] = 5] = "enemy";
    Layer[Layer["shot"] = 6] = "shot";
    Layer[Layer["gun"] = 7] = "gun";
    // Front is also static. TODO Really? Does it matter? No?
    Layer[Layer["front"] = 8] = "front";
    // Flame is in front of front, eh?
    Layer[Layer["flame"] = 9] = "flame";
    // Just to track the number of enum values.
    Layer[Layer["length"] = 10] = "length";
})(Layer = Layer || (Layer = {}));
class BaseArt {
    constructor(part) {
        this.part = part;
    }
    get offsetX() {
        return 0;
    }
    get toolTile() {
        return this.tile;
    }
}
class theme_GoldTheme {
    constructor(game, image) {
        this.breaking = false;
        this.ender = false;
        this.fadeSee = new Lerper(0, 0x90, -100, 0.2, 1);
        this.falling = false;
        this.invisible = false;
        this.layerPartIndices = new Array();
        this.layers = new Array();
        this.level = new level_Level();
        this.tileIndices = new Uint8Array(3 * 6);
        this.tileModes = new Uint8Array(6);
        this.tileOpacities = new Uint8Array(6);
        this.game = game;
        // Prepare image.
        this.image = image;
        let scaled = this.prepareImage(image);
        this.texture = new three["Texture"](scaled);
        this.texture.magFilter = three["NearestFilter"];
        this.texture.needsUpdate = true;
        // Prepare layers.
        // Add 1 to allow an undefined at the end.
        // We'll extend these arrays later as needed. But not shrink them.
        // TODO Don't bother to preallocate?
        let maxLayerPartCount = level_Level.tileCount.x * level_Level.tileCount.y + 1;
        for (let i = 0; i < Layer.length; ++i) {
            this.layers.push(new Array(maxLayerPartCount));
        }
    }
    static load(game) {
        let image = new Image();
        let promise = new Promise((resolve, reject) => {
            image.addEventListener('load', () => {
                resolve(new theme_GoldTheme(game, image));
            });
            // TODO Error event?
        });
        image.src = __webpack_require__(12);
        return promise;
    }
    buildArt(part) {
        let type = part.type;
        // TODO Change to type != type.base?
        if (type.breaking || type.ender || type.falling || type.invisible) {
            type = type.base;
        }
        let makeArt = parts_Parts.tileArts.get(type);
        if (!makeArt) {
            // This makes it easier to deal with problems up front.
            throw new Error(`No art for part type ${type.key}`);
        }
        // Mark art non-optional so this would catch the error?
        part.art = makeArt(part);
    }
    buildDone(game) {
        this.buildLayers(game.stage.parts, true);
    }
    buildLayers(parts, reset = false) {
        let { layerPartIndices, layers } = this;
        if (reset) {
            layers.forEach((_, index) => layerPartIndices[index] = 0);
        }
        // TODO .forEach instead of Iterable to avoid creating iterable object?
        for (let part of parts) {
            if (!part.exists) {
                // This applies mostly to nones right now from the main parts.
                // TODO Don't ever add the nones when in play mode?
                continue;
            }
            let { layer } = part.art;
            if (part.dead) {
                layer = Layer.dead;
            }
            this.layers[layer][layerPartIndices[layer]++] = part;
        }
        layerPartIndices.forEach((layerPartIndex, layer) => {
            this.layers[layer][layerPartIndex] = undefined;
        });
    }
    handle() {
        let { game } = this;
        // In passing, see if we need to update the panels.
        let styleChanged = false;
        if (game.edit.breaking != this.breaking) {
            this.breaking = game.edit.breaking;
            styleChanged = true;
        }
        if (game.edit.ender != this.ender) {
            this.ender = game.edit.ender;
            styleChanged = true;
        }
        if (game.edit.falling != this.falling) {
            this.falling = game.edit.falling;
            styleChanged = true;
        }
        if (game.edit.invisible != this.invisible) {
            this.invisible = game.edit.invisible;
            styleChanged = true;
        }
        if (styleChanged) {
            this.prepareVariations();
            this.paintPanels();
        }
        // Also init on the first round.
        if (!this.tilePlanes) {
            this.initTilePlanes();
        }
        // But main point is to paint the stage.
        this.paintStage(game.stage);
    }
    initTilePlanes() {
        let { game } = this;
        // Tiles.
        let tileMaterial = new three["ShaderMaterial"]({
            depthTest: false,
            fragmentShader: tileFragmentShader,
            transparent: true,
            uniforms: {
                map: { value: this.texture },
            },
            vertexShader: tileVertexShader,
        });
        // this.uniforms = tileMaterial.uniforms as any as Uniforms;
        // Prototypical tile.
        this.tilePlane = new three["BufferGeometry"]();
        let tilePlane = this.tilePlane;
        tilePlane.addAttribute('position', new three["BufferAttribute"](new Float32Array([
            // Leave the coords at 3D for now to match default expectations.
            // And they'll be translated.
            8, 0, 0, 0, 10, 0, 0, 0, 0,
            8, 0, 0, 8, 10, 0, 0, 10, 0,
        ]), 3));
        // Tile map offsets, repeated.
        tilePlane.addAttribute('mode', new three["BufferAttribute"](this.tileModes, 1));
        tilePlane.addAttribute('opacity', new three["BufferAttribute"](this.tileOpacities, 1));
        tilePlane.addAttribute('tile', new three["BufferAttribute"](this.tileIndices, 3));
        tilePlane.addAttribute('uv', new three["BufferAttribute"](new Float32Array([
            // Uv are 2D.
            1, 0, 0, 1, 0, 0,
            1, 0, 1, 1, 0, 1,
        ]), 2));
        // All tiles in a batch.
        // '4 *' to have space for particles and such.
        let tileCount = 4 * level_Level.tileCount.x * level_Level.tileCount.y;
        this.tilePlanes = new three["BufferGeometry"]();
        for (let name in tilePlane.attributes) {
            let attribute = tilePlane.getAttribute(name);
            this.tilePlanes.addAttribute(name, new three["BufferAttribute"](new Float32Array(tileCount * attribute.array.length), attribute.itemSize));
        }
        // Add to stage.
        this.tilesMesh = new three["Mesh"](this.tilePlanes, tileMaterial);
        game.scene.add(this.tilesMesh);
        game.redraw = () => this.handle();
        // Panels, too.
        this.preparePanels();
    }
    modeChanged() {
        if (this.game.mode == this.game.edit) {
            // We can't get spacing right without having things visible, so do this
            // after we get to edit mode.
            // Doesn't need every time, but eh.
            this.updateLayout();
        }
    }
    paintPanels(changedName) {
        let { game } = this;
        let { toolbox } = game.edit;
        for (let button of toolbox.getButtons()) {
            // Get the art for this tool. TODO Simplify this process?
            let name = toolbox.getName(button);
            if (changedName && name != changedName) {
                continue;
            }
            let tool = game.edit.toolFromName(name);
            if (!(tool instanceof toolbox_PartTool)) {
                continue;
            }
            let type = tool.type;
            if (!type || type == None) {
                // We don't draw a standard tile for this one.
                continue;
            }
            if (!type) {
                throw new Error(`Unknown type: ${name}`);
            }
            let part = type.make(game);
            this.buildArt(part);
            // Now calculate the pixel point.
            let point = part.art.toolTile.clone();
            // TODO Add offset to point.x here.
            point.y = level_Level.tileCount.y - point.y - 1;
            point.multiply(level_Level.tileSize);
            // Now draw to our canvas and to the button background.
            let canvas = button.querySelector(':scope > canvas');
            let context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(this.toolsImage, point.x, point.y, level_Level.tileSize.x, level_Level.tileSize.y, 0, 0, canvas.width, canvas.height);
        }
    }
    paintStage(stage, asTools = false) {
        let { game, pixelBounds, tileBounds, time } = stage;
        let { tileIndices, tileModes, tileOpacities } = this;
        let tilePlanes = this.tilePlanes;
        let tilePlane = this.tilePlane;
        // Duplicate prototype, translated and tile indexed.
        // TODO How to make sure tilePlanes is large enough?
        // TODO Fill the back with none parts when it's too big?
        let partIndex = 0;
        this.buildLayers(stage.parts, true);
        this.buildLayers(stage.particles);
        let seeOpacity = this.updateFade();
        let offsetX = asTools ? 0 :
            (level_Level.pixelCount.x - (pixelBounds.max.x - pixelBounds.min.x)) / 2 -
                pixelBounds.min.x;
        // TODO Only keep offsetX as 0 in test mode, not play.
        offsetX = 0;
        // Draw everything.
        this.layers.forEach(layer => {
            for (let part of layer) {
                if (!part) {
                    // That's the end of this layer.
                    break;
                }
                if (part.cropped) {
                    // Not actually here.
                    continue;
                }
                let art = part.art;
                let currentTileIndices = asTools ? art.toolTile : art.tile;
                // Translate and merge are expensive. TODO Make my own functions?
                let posX = part.point.x + offsetX;
                tilePlane.translate(posX, part.point.y, 0);
                for (let k = 0; k < tileIndices.length; k += 3) {
                    tileIndices[k + 0] = currentTileIndices.x;
                    tileIndices[k + 1] = currentTileIndices.y;
                    tileIndices[k + 2] = part.art.offsetX;
                }
                let mode = +(part.type.ender || part.keyTime + 1 > time);
                if (part.dead) {
                    mode = 2;
                }
                if (part.type.breaking) {
                    mode |= 4;
                }
                if (part.type.falling) {
                    mode |= 8;
                }
                let opacity = time >= part.phaseEndTime ? 0xFF :
                    // TODO Look back into this with integers.
                    (time - part.phaseBeginTime) /
                        (part.phaseEndTime - part.phaseBeginTime);
                if (part.type.invisible) {
                    opacity = seeOpacity;
                }
                else if (part == stage.hero && stage.hero.bonusSee) {
                    opacity = 0x90;
                }
                for (let n = 0; n < tileModes.length; ++n) {
                    // Break state into bits.
                    tileModes[n] = mode;
                    tileOpacities[n] = opacity;
                }
                tilePlanes.merge(tilePlane, 6 * partIndex);
                tilePlane.translate(-posX, -part.point.y, 0);
                ++partIndex;
            }
        });
        if (!asTools) {
            // Gray for crop.
            for (let n = 0; n < tileModes.length; ++n) {
                // Break state into bits.
                tileModes[n] = 0xFF;
                tileOpacities[n] = 0xFF;
            }
            if (tileBounds.min.x > 0) {
                tilePlane.scale(tileBounds.min.x, level_Level.tileCount.y, 1);
                tilePlanes.merge(tilePlane, 6 * partIndex);
                tilePlane.scale(1 / tileBounds.min.x, 1 / level_Level.tileCount.y, 1);
                ++partIndex;
            }
            if (tileBounds.min.y > 0) {
                tilePlane.scale(level_Level.tileCount.x, tileBounds.min.y, 1);
                tilePlanes.merge(tilePlane, 6 * partIndex);
                tilePlane.scale(1 / level_Level.tileCount.x, 1 / tileBounds.min.y, 1);
                ++partIndex;
            }
            if (tileBounds.max.x < level_Level.tileCount.x) {
                let posX = pixelBounds.max.x;
                let sizeX = level_Level.tileCount.x - tileBounds.max.x;
                tilePlane.scale(sizeX, level_Level.tileCount.y, 1);
                tilePlane.translate(posX, 0, 0);
                tilePlanes.merge(tilePlane, 6 * partIndex);
                tilePlane.translate(-posX, 0, 0);
                tilePlane.scale(1 / sizeX, 1 / level_Level.tileCount.y, 1);
                ++partIndex;
            }
            if (tileBounds.max.y < level_Level.tileCount.y) {
                let posY = pixelBounds.max.y;
                let sizeY = level_Level.tileCount.y - tileBounds.max.y;
                tilePlane.scale(level_Level.tileCount.x, sizeY, 1);
                tilePlane.translate(0, posY, 0);
                tilePlanes.merge(tilePlane, 6 * partIndex);
                tilePlane.translate(0, -posY, 0);
                tilePlane.scale(1 / level_Level.tileCount.x, 1 / sizeY, 1);
                ++partIndex;
            }
        }
        // Actually get things done now.
        tilePlanes.setDrawRange(0, 6 * partIndex);
        let attributes = tilePlanes.attributes;
        // Older typing missed needsUpdate, but looks like it's here now.
        // TODO Define a type with all our attributes on it?
        attributes.mode.needsUpdate = true;
        attributes.opacity.needsUpdate = true;
        attributes.position.needsUpdate = true;
        attributes.tile.needsUpdate = true;
        // TODO Preset uv for all spots, so no need for later update?
        attributes.uv.needsUpdate = true;
    }
    prepareImage(image) {
        // Make the image POT (power-of-two) sized.
        let canvas = document.createElement('canvas');
        let round = (x) => Math.pow(2, Math.ceil(Math.log2(x)));
        canvas.width = round(level_Level.pixelCount.x);
        canvas.height = round(level_Level.pixelCount.y);
        let context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
        return canvas;
    }
    preparePanels() {
        let { game } = this;
        let { toolbox } = game.edit;
        // let buttonHeight = '1em';
        // Fit about 20 tiles at vertically, but use integer scaling for kindness.
        // Base this on screen size rather than window size, presuming that screen
        // size implies what looks reasonable for ui elements.
        let scale = Math.round(window.screen.height / 20 / level_Level.tileSize.y);
        let buttonSize = level_Level.tileSize.clone().multiplyScalar(scale);
        for (let button of toolbox.getButtons()) {
            let name = toolbox.getName(button);
            let tool = game.edit.namedTools.get(name);
            let type = tool instanceof toolbox_PartTool ? tool.type : undefined;
            if (!type || type == None) {
                // We don't draw a standard tile for this one.
                button.style.width = `${buttonSize.x}px`;
                button.style.height = `${buttonSize.y}px`;
                continue;
            }
            // Now make a canvas to draw to.
            let canvas = document.createElement('canvas');
            canvas.width = level_Level.tileSize.x;
            canvas.height = level_Level.tileSize.y;
            // Style it.
            canvas.style.imageRendering = 'pixelated';
            canvas.style.margin = 'auto';
            canvas.style.height = `${buttonSize.y}px`;
            button.appendChild(canvas);
        }
        this.prepareVariations();
        this.paintPanels();
        this.updateLayout();
    }
    prepareVariations() {
        let { game } = this;
        let { toolbox } = game.edit;
        // TODO Abstract some render target -> canvas?
        let scaled = this.texture.image;
        let target = new three["WebGLRenderTarget"](scaled.width, scaled.height);
        try {
            let stage = new stage_Stage(game);
            stage.parts.length = 0;
            toolbox.getButtons().forEach(button => {
                let name = toolbox.getName(button);
                let tool = game.edit.namedTools.get(name);
                tool = game.edit.partTool(name, this);
                let type = tool instanceof toolbox_PartTool ? tool.type : undefined;
                if (!type) {
                    return;
                }
                let part = type.make(game);
                this.buildArt(part);
                let art = part.art;
                // console.log(name, art.baseTile.x, art.baseTile.y);
                part.point.copy(art.toolTile).multiply(level_Level.tileSize);
                stage.parts.push(part);
            });
            // Hack edit more for painting.
            let oldMode = game.mode;
            game.mode = game.edit;
            this.paintStage(stage, true);
            // Back to old mode.
            game.mode = oldMode;
            let scene = new three["Scene"]();
            let camera = new three["OrthographicCamera"](0, scaled.width, scaled.height, 0, -1e5, 1e5);
            camera.position.z = 1;
            // Render and copy out.
            game.renderer.render(game.scene, camera, target);
            let toolsImage = document.createElement('canvas');
            toolsImage.width = this.image.width;
            toolsImage.height = this.image.height;
            let context = toolsImage.getContext('2d');
            let data = new Uint8Array(4 * toolsImage.width * toolsImage.height);
            game.renderer.readRenderTargetPixels(target, 0, 0, this.image.width, this.image.height, data);
            // Use a temporary canvas for flipping y.
            let tempImage = document.createElement('canvas');
            tempImage.width = toolsImage.width;
            tempImage.height = toolsImage.height;
            let tempContext = tempImage.getContext('2d');
            let imageData = tempContext.createImageData(toolsImage.width, toolsImage.height);
            imageData.data.set(data);
            tempContext.putImageData(imageData, 0, 0);
            // Draw to the final.
            context.save();
            context.scale(1, -1);
            context.translate(0, -200);
            context.drawImage(tempImage, 0, 0);
            context.restore();
            // {  // Show the ender image for debugging.
            //   enderImage.style.border = '1px solid white';
            //   enderImage.style.pointerEvents = 'none';
            //   enderImage.style.position = 'absolute';
            //   enderImage.style.zIndex = '100';
            //   window.document.body.appendChild(enderImage);
            // }
            this.toolsImage = toolsImage;
        }
        finally {
            target.dispose();
        }
    }
    // uniforms: Uniforms;
    updateFade() {
        let edit = this.game.mode == this.game.edit;
        let { hero, time } = this.game.stage;
        // TODO Extract all this invisibility fade stuff elsewhere.
        let see = edit || !hero || hero.seesInvisible;
        if (time < 0.05) {
            // Don't observe state switch from initial state.
            // Just sneak it in.
            // TODO Going from edit to test, this doesn't seem to reset right.
            this.fadeSee.ref = -100;
            this.fadeSee.state = see;
        }
        return this.fadeSee.update(see, time);
    }
    updateLayout() {
        let { game } = this;
        let { toolbox } = game.edit;
        let offsetLeft;
        for (let button of toolbox.getButtons()) {
            // Align menu by hopefully known canvas size.
            let menu = button.querySelector('.toolMenu');
            if (menu) {
                if (offsetLeft == undefined) {
                    let style = window.getComputedStyle(button);
                    offsetLeft =
                        Number.parseInt(style.width) +
                            Number.parseInt(style.borderRightWidth) +
                            Number.parseInt(style.paddingRight);
                }
                menu.style.marginLeft = `${offsetLeft}px`;
            }
        }
    }
    updateTool(button) {
        this.paintPanels(this.game.edit.toolbox.getName(button));
    }
}
class Lerper {
    constructor(begin, end, ref, span, spanOut) {
        this.state = false;
        this.begin = begin;
        this.end = end;
        this.ref = ref;
        this.span = span;
        this.spanOut = spanOut;
    }
    update(state, x) {
        if (this.state != state) {
            // TODO Modify ref calc based on current value.
            this.ref = x;
            this.state = state;
        }
        return this.value(x);
    }
    value(x) {
        // State false means go to begin, and true to end.
        let begin = this.state ? this.begin : this.end;
        let end = this.state ? this.end : this.begin;
        // Now lerp.
        let span = this.state ? this.span : this.spanOut;
        let rel = Math.min((x - this.ref) / span, 1);
        return rel * (end - begin) + begin;
    }
}
// interface Uniforms {
//   state: {value: number};
// }
let tileFragmentShader = `
  uniform sampler2D map;
  // uniform int state;
  varying float vMode;
  varying float vOpacity;
  varying vec3 vTile;
  varying vec2 vUv;

  void grayify(inout vec3 rgb) {
    // TODO Better gray?
    float mean = (rgb.x + rgb.y + rgb.z) / 3.0;
    rgb = 0.5 * (rgb + vec3(mean));
    // Paler to make even gray things look different.
    rgb += 0.6 * (1.0 - rgb);
  }

  void main() {
    vec2 uv = vUv;
    vec2 offset = floor(vUv * vec2(8, 10));
    if (vMode >= 8.0) {
      if (offset.x <= 3.0) {
        uv.x -= 0.125;
      } else {
        uv.x += 0.125;
      }
    }
    vec2 coord = (
      // Tile z is the horizontal offset to fix the offset problems with a
      // couple of the tiles.
      // The +56 in y is for the texture offset.
      (uv + vTile.xy) * vec2(8, 10) + vec2(vTile.z, 56)
    ) / vec2(512, 256);
    gl_FragColor = texture2D(map, coord);
    gl_FragColor.w = gl_FragColor.x + gl_FragColor.y + gl_FragColor.z;
    // Breaking.
    if (mod(vMode, 8.0) >= 4.0) {
      vec2 odd = mod(vec2(offset.x, floor(offset.y * 0.5)), vec2(2.0, 2.0));
      if (offset.y == 0.0 || offset.y == 9.0) {
        if (offset.x == 2.0) {
          gl_FragColor *= 0.0;
        } else if (offset.x == 5.0 && offset.y == 9.0) {
          gl_FragColor *= 0.0;
        } else if (offset.x == 4.0 && offset.y == 0.0) {
          gl_FragColor *= 0.0;
        }
      } else if (offset.x == 3.0 || offset.x == 4.0) {
        if (odd.x == odd.y) {
          gl_FragColor *= 0.0;
        }
      }
    }
    // Falling.
    if (vMode >= 8.0) {
      if (offset.x == 0.0 || offset.x == 7.0) {
        gl_FragColor *= 0.0;
      }
    }
    // Dead and/or translucent.
    if (gl_FragColor.w > 0.0) {
      if (mod(vMode, 2.0) == 1.0 || mod(vMode, 4.0) == 2.0) {
        grayify(gl_FragColor.xyz);
        if (mod(vMode, 4.0) == 2.0) {
          gl_FragColor.xyz *= 0.5;
        }
      }
      gl_FragColor.w = vOpacity;
    }
    // Cropped out area.
    if (vMode == 255.0) {
      gl_FragColor.xyz = vec3(0.125);
      gl_FragColor.w = 1.0;
    }
  }
`;
let tileVertexShader = `
  attribute float mode;
  attribute float opacity;
  attribute vec3 tile;
  varying float vMode;
  varying float vOpacity;
  varying vec3 vTile;
  varying vec2 vUv;
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vMode = mode;
    vOpacity = opacity / 255.0;
    vUv = uv;
    vTile = tile;
  }
`;

// CONCATENATED MODULE: ./src/gold/biggie.ts


class biggie_BiggieArt extends BaseArt {
    constructor() {
        super(...arguments);
        this.frame = 0;
        this.lastTime = 0;
        this.layer = Layer.biggie;
        this.workPoint = new three["Vector2"]();
    }
    get offsetX() {
        // There left-facing biggie is shifted in the texture, so offset.
        return this.part.facing < 0 ? 1 : 0;
    }
    get tile() {
        let { part, workPoint } = this;
        let { facing, game, moved, speed } = part;
        let { time } = game.stage;
        this.workPoint.set(21, 14);
        if (facing < 0) {
            workPoint.x += 1;
        }
        if (game.mode != game.edit && !part.dead) {
            let didMove = !!moved.x;
            let stepTime = 1 / 15 / speed.x;
            let nextTime = time > this.lastTime + stepTime || time < this.lastTime;
            if (nextTime && didMove) {
                this.lastTime = time;
                this.frame = (this.frame + 1) % biggie_frames.length;
            }
            workPoint.y -= biggie_frames[this.frame];
        }
        return workPoint;
    }
}
// The actual frames from the source image require back and forth.
let biggie_frames = [0, 1, 0, 2];

// CONCATENATED MODULE: ./src/gold/brick.ts



class brick_BrickArt extends BaseArt {
    constructor(part) {
        super(part);
        this.frame = 10;
        this.layer = Layer.front;
        this.flame = new Flame(part);
    }
    get tile() {
        // TODO Additional translucent full brick even when burned?!?
        let { burned, burnTime, burnTimeLeft } = this.part;
        if (burned) {
            if (this.flame.exists && !this.flame.started) {
                this.flame.start();
            }
            brick_workPoint.copy(mainTile);
            let frame = 10;
            if (burnTime < animTime) {
                frame = Math.floor((burnTime / animTime) * animCount);
            }
            else if (burnTimeLeft < animTime) {
                frame = Math.floor((burnTimeLeft / animTime) * animCount);
            }
            frame = Math.max(frame, 0);
            brick_workPoint.y -= frame;
            this.frame = frame;
            return brick_workPoint;
        }
        else {
            return mainTile;
        }
    }
}
class Flame extends part_Part {
    constructor(brick) {
        super(brick.game);
        this.started = false;
        this.brick = brick;
        this.game.theme.buildArt(this);
    }
    get exists() {
        let { brick } = this;
        let brickArt = brick.art;
        let exists = brick.burnTime < animTime;
        if (!exists) {
            this.started = false;
        }
        return exists;
    }
    start() {
        let { stage } = this.game;
        stage.particles.push(this);
        stage.added(this);
        this.point.set(0, 10).add(this.brick.point);
        this.started = true;
    }
    update() {
        let { brick } = this;
        let brickArt = brick.art;
        this.point.set(0, 10 - brickArt.frame).add(this.brick.point);
    }
}
class brick_FlameArt extends BaseArt {
    constructor() {
        super(...arguments);
        this.layer = Layer.flame;
    }
    get tile() {
        let frame = this.part.brick.art.frame;
        frame = 9 - Math.max(0, Math.min(frame, 9));
        flameTile.set(3, 10);
        if (frame < 5) {
            flameTile.x += 1;
        }
        flameTile.y += frame % 5;
        return flameTile;
    }
}
let animCount = 10;
let animTime = 0.25;
let flameTile = new three["Vector2"]();
let mainTile = new three["Vector2"](2, 18);
let brick_workPoint = new three["Vector2"]();

// CONCATENATED MODULE: ./src/gold/crusher.ts


class crusher_CrusherArt extends BaseArt {
    constructor() {
        super(...arguments);
        this.layer = Layer.back;
        this.count = 0;
    }
    get tile() {
        let { part } = this;
        if (part.hitType && this.count < 2) {
            this.count += 0.2;
        }
        crusher_tile.set(21 + Math.floor(this.count), 18);
        return crusher_tile;
    }
}
let crusher_tile = new three["Vector2"]();

// CONCATENATED MODULE: ./src/gold/dropper.ts


class dropper_DropArt extends BaseArt {
    constructor() {
        super(...arguments);
        this.layer = Layer.back;
    }
    get tile() {
        let { part } = this;
        dropper_tile.set(26, 16);
        if (part.stopTime) {
            let offset = Math.min(Math.floor(part.fadeScale * 8), 7);
            dropper_tile.y -= offset;
        }
        return dropper_tile;
    }
}
let dropper_tile = new three["Vector2"]();

// CONCATENATED MODULE: ./src/gold/energy.ts


class energy_EnergyArt extends BaseArt {
    constructor() {
        super(...arguments);
        this.layer = Layer.front;
        this.workPoint = new three["Vector2"]();
    }
    get tile() {
        let { part, workPoint } = this;
        let { game } = part;
        if (game.mode == game.edit) {
            return this.toolTile;
        }
        workPoint.set(16, 16);
        if (!part.on) {
            workPoint.set(0, 2);
        }
        return workPoint;
    }
    get toolTile() {
        let { part, workPoint } = this;
        workPoint.set(16, 16);
        if (!part.on) {
            ++workPoint.x;
        }
        return workPoint;
    }
}
class energy_LatchArt extends BaseArt {
    constructor() {
        super(...arguments);
        this.layer = Layer.front;
        this.workPoint = new three["Vector2"]();
    }
    get tile() {
        let { part } = this;
        let { time } = part.game.stage;
        this.workPoint.set(20, 16);
        if (time < part.changeTime + 8 / 60 || !part.facing) {
            // Center facing. TODO Separate facing from state.
            this.workPoint.x -= 1;
        }
        else if (part.facing < 0) {
            this.workPoint.x -= 2;
        }
        return this.workPoint;
    }
}

// CONCATENATED MODULE: ./src/gold/gun.ts


class gun_GunArt extends BaseArt {
    constructor() {
        super(...arguments);
        this.layer = Layer.gun;
        this.workPoint = new three["Vector2"](0, 10);
    }
    get tile() {
        let { part, workPoint } = this;
        workPoint.x = part.facing < 0 ? 24 : 21;
        return workPoint;
    }
}

// CONCATENATED MODULE: ./src/gold/runner.ts



class runner_RunnerArt extends BaseArt {
    constructor(runner, tile) {
        super(runner);
        this.facing = 1;
        this.frame = 0;
        this.lastTime = 0;
        // TODO Also on constructor.
        this.layer = Layer.hero;
        this.mode = runner_Mode.right;
        this.workPoint = new three["Vector2"]();
        if (runner.type == enemy_Enemy) {
            this.layer = Layer.enemy;
        }
        this.base = tile;
    }
    get tile() {
        let { mode, part } = this;
        let { climbing, game, intendedMove, moved, point, speed, support, } = part;
        let { stage } = game;
        // Update facing.
        if (intendedMove.x) {
            // Facing is always left or right.
            this.facing = Math.sign(intendedMove.x);
        }
        // Figure out what frame and mode.
        if (game.mode == game.edit || !stage.time) {
            this.frame = 0;
            // TODO Subclass RunnerArt for enemies?
            if (this.part instanceof enemy_Enemy) {
                let { hero } = game.stage;
                this.mode = hero && hero.point.x < point.x ? runner_Mode.left : runner_Mode.right;
            }
            else {
                this.mode = runner_Mode.right;
            }
        }
        else {
            let movedX = Math.abs(moved.x) > 1e-1;
            // Mode.
            if (support) {
                let speedScale = speed.x;
                let swinging = support.catches(part);
                if (climbing) {
                    let under = part.getSupport();
                    let on = part.partAt(4, 5, part => part.climbable(part));
                    if (under && on && under.type.common != on.type.common) {
                        climbing = false;
                    }
                }
                if (climbing) {
                    this.mode = runner_Mode.climb;
                    speedScale = speed.y;
                }
                else {
                    if (swinging) {
                        this.mode = this.facing < 0 ? runner_Mode.swingLeft : runner_Mode.swingRight;
                    }
                    else {
                        this.mode = this.facing < 0 ? runner_Mode.left : runner_Mode.right;
                    }
                }
                // Frame.
                let didMove = !!(Math.min(Math.abs(intendedMove.x), Math.abs(moved.x)) || moved.y);
                let stepTime = 1 / 20 / speedScale;
                let nextTime = stage.time > this.lastTime + stepTime || stage.time < this.lastTime;
                if (nextTime && didMove) {
                    this.lastTime = stage.time;
                    this.frame = (this.frame + 1) % runner_frames.length;
                }
            }
            else {
                // Hands up to fall.
                this.mode = this.facing < 0 ? runner_Mode.swingLeft : runner_Mode.swingRight;
            }
        }
        // Answer based on that.
        let { workPoint } = this;
        workPoint.copy(this.base);
        workPoint.x += this.mode;
        workPoint.y -= runner_frames[this.frame];
        return workPoint;
    }
    get toolTile() {
        return this.base;
    }
}
var runner_Mode;
(function (Mode) {
    Mode[Mode["climb"] = 4] = "climb";
    Mode[Mode["left"] = 1] = "left";
    Mode[Mode["right"] = 0] = "right";
    Mode[Mode["swingLeft"] = 3] = "swingLeft";
    Mode[Mode["swingRight"] = 2] = "swingRight";
})(runner_Mode || (runner_Mode = {}));
// The actual frames from the source image require back and forth.
let runner_frames = [0, 1, 2, 1, 0, 3, 4, 3];

// CONCATENATED MODULE: ./src/gold/treasure.ts


class treasure_PrizeArt extends BaseArt {
    constructor(prize, tile) {
        super(prize);
        this.layer = Layer.treasure;
        this.mainTile = tile;
    }
    get tile() {
        return this.part.owner ? goneTile : this.mainTile;
        // return this.mainTile;
    }
}
let goneTile = new three["Vector2"](0, 2);

// CONCATENATED MODULE: ./src/gold/parts.ts



// Simple arts for unchanging parts.
let arts = {
    Bar: { layer: Layer.back, tile: new three["Vector2"](9, 17) },
    Dropper: { layer: Layer.treasure, tile: new three["Vector2"](14, 16) },
    Ladder: { layer: Layer.back, tile: new three["Vector2"](8, 17) },
    LauncherCenter: { layer: Layer.back, tile: new three["Vector2"](12, 17) },
    LauncherDown: { layer: Layer.back, tile: new three["Vector2"](11, 17) },
    LauncherLeft: { layer: Layer.back, tile: new three["Vector2"](10, 16) },
    LauncherRight: { layer: Layer.back, tile: new three["Vector2"](11, 16) },
    LauncherUp: { layer: Layer.back, tile: new three["Vector2"](10, 17) },
    None: { layer: Layer.back, tile: new three["Vector2"](0, 2) },
    Shot: { layer: Layer.shot, tile: new three["Vector2"](22, 10) },
    Spawn: { layer: Layer.back, tile: new three["Vector2"](12, 16) },
    Steel: { layer: Layer.front, tile: new three["Vector2"](7, 17) },
};
class parts_Parts {
}
// TODO 'any' because Shot and other dynamic part types.
// TODO Split into different part type types and be more specific here?
parts_Parts.tileArts = new Map([
    [bar_Bar, artMaker(arts.Bar)],
    [BiggieLeft, part => new biggie_BiggieArt(part)],
    [BiggieRight, part => new biggie_BiggieArt(part)],
    [Bonus, part => new treasure_PrizeArt(part, new three["Vector2"](13, 16))],
    [brick_Brick, part => new brick_BrickArt(part)],
    [dropper_Drop, part => new dropper_DropArt(part)],
    [Crusher, part => new crusher_CrusherArt(part)],
    [dropper_Dropper, artMaker(arts.Dropper)],
    [enemy_Enemy, part => new runner_RunnerArt(part, new three["Vector2"](15, 14))],
    [Energy, part => new energy_EnergyArt(part)],
    [EnergyOff, part => new energy_EnergyArt(part)],
    [Flame, part => new brick_FlameArt(part)],
    [GunLeft, part => new gun_GunArt(part)],
    [GunRight, part => new gun_GunArt(part)],
    [hero_Hero, part => new runner_RunnerArt(part, new three["Vector2"](9, 14))],
    [Ladder, artMaker(arts.Ladder)],
    [LatchLeft, part => new energy_LatchArt(part)],
    [LatchRight, part => new energy_LatchArt(part)],
    [LauncherCenter, artMaker(arts.LauncherCenter)],
    [launcher_LauncherDown, artMaker(arts.LauncherDown)],
    [launcher_LauncherLeft, artMaker(arts.LauncherLeft)],
    [launcher_LauncherRight, artMaker(arts.LauncherRight)],
    [launcher_LauncherUp, artMaker(arts.LauncherUp)],
    [None, artMaker(arts.None)],
    [gun_Shot, artMaker(arts.Shot)],
    [spawn_Spawn, artMaker(arts.Spawn)],
    [Steel, artMaker(arts.Steel)],
    [Treasure, part => new treasure_PrizeArt(part, new three["Vector2"](13, 17))],
]);
function artMaker({ layer, tile }) {
    return (part) => {
        return { layer, offsetX: 0, part, tile, toolTile: tile };
    };
}

// CONCATENATED MODULE: ./src/gold/index.ts
// Common first.

// Individual parts.








// And the index.


// EXTERNAL MODULE: ./src/index.css
var src = __webpack_require__(13);
var src_default = /*#__PURE__*/__webpack_require__.n(src);

// EXTERNAL MODULE: ./node_modules/font-awesome/css/font-awesome.css
var font_awesome = __webpack_require__(4);
var font_awesome_default = /*#__PURE__*/__webpack_require__.n(font_awesome);

// CONCATENATED MODULE: ./src/main.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};




window.onload = main;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let game = new game_Game(window.document.body);
        let theme = yield theme_GoldTheme.load(game);
        game.theme = theme;
        // Fill in even empty/none parts before the first drawing, so uv and such get
        // in there.
        game.level.updateStage(game);
        theme.handle();
        // Now kick off the display.
        game.render();
    });
}


/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = {"items":[{"contentHash":"11ca89e950d668b178e0989c15465d20","tiles":" È                È                     \n È                È                   * \n È             ---È          ---------H \n È                HBBBBBBBBBB         HB\n È                H                   H \n È          *     H                   H \nBHBBBBBBBBBBBBB   H           --- *   H \n H                H      -----   BBB  H \n H                H           H       H \n H-----      *    H BBBBBB    H   BBBBHB\n H     BBBBBBBB   H           H       H \n H                H           H       H \n H                H           H       H \nBBBBBBBHBBBBBBBBBBHBBBBBBBBBBBH       H \n       H          H           H       H \n       H          H           H       H \n       H          H           H       H \n       H          H           H       H \nR    * H          H           H       H \nBBBBBBBBBBBBBBB   H     BBBBBBBBBBBBBBBB","id":"7e174284d2b2ddc7fd76b9697bc552","name":"Treasures","type":"Level","message":"Good work, Twister. You made it into the tower! We're ready to start the mission.\n\nYou need to collect all the treasures at each level. Then you can exit upward to the next level.\n\nThings aren't always what they seem in the old city. When you've gotten all the treasures in a level, watch for changes around you.\n\n(Use arrows or directional controller to move.)","number":1,"winsMin":16.83333333333366},{"contentHash":"b4deb3decab944ce4d5d1b2cddbe6f54","tiles":"           È                            \n           È                            \n           È    -----------------       \n           È                     È      \n           È                     È      \n           È                     È      \n           È      -------- *     È      \n           ÈBBBB H        BBBBBB È      \n           È     H        B    B È      \n       *   È     H        B    B È      \n      HBB  HBBBBBBH       B   *B È      \n      H  BBH      H       BBBBBB È      \n      H    H      H       B    B È      \n      H    H      H       B    B È      \n      H    H  *   H B R B B*   B È      \n      H    H BBBB H BBBBB BBBBBB È      \n      H    H     BB       B    B È      \n      H    H              B    B È      \n      H    H              B   *  È      \nBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB","id":"916680dc21629392f329f41c7addca30","name":"Burn","type":"Level","message":"Your relic gloves let you temporarily phase out the bricks at your feet, in front of you or behind you.\n\nLooks like that will be helpful for you at the moment ...\n\nThey don't work under other walls, unless you phase out the upper bricks first. Hey, don't complain! I got what I could for you, you know.\n\nI don't know where you'd be without me.\n\n(Use Z or X to burn left or right, or use gamepad buttons.)","bounds":{"max":{"x":35,"y":20},"min":{"x":5,"y":0}},"number":2,"winsMin":20.900000000000095},{"contentHash":"a745afe7d22d6ddf78c69d89cabcf0b0","tiles":"       È                                \n       È                                \n       È                                \n       È      *                         \n       HBBBBBBBBBBBHBBBBBBBBBBBBH       \n       H           H            H       \n       H           H            H       \n       H    BBBBBBBHBBHBBBBBBB  H       \n       H    B      H BH      B  H       \n       H    B      H BH     eB  H       \n       HBBBBB      H BBBBBBBBB  H       \n                   H            H       \n       *           H            H       \n          R        H            H       \n       HBBBBBBBBBBBBBBBHBBBBBBBBB       \n       H               H                \n       H               H                \n       H               H                \n       H  *            H                \n       BBBBBBBBBBBBBBBBBBBBBBBBBB       ","id":"8a7b74c233bf50f1a0aebb7ee577e3","name":"Enemy","type":"Level","message":"Guard bots still roam old Tresmir after all these centuries. It's amazing what the war left behind.\n\nThe bots don't carry guns, but they are still dangerous. Be careful, Twister.","bounds":{"max":{"x":33,"y":20},"min":{"x":7,"y":0}},"number":3,"winsMin":13.8333333333336},{"contentHash":"170e805e6bae515c7703cd655bdbbf31","tiles":"       È                       È        \n       È                       È        \n       È                       È        \n       È                       È        \n       È                       È        \n       È                       È        \n       È           *           È        \n       HBBBBBBBBBBBBBBBBBBBBBBBH        \n       HB          e          BH        \n       HBBBBBBBBBBBBBBBBBBBBBBBH        \n       H           *           H        \n       HBBBBBBBBBBBBBBBBBBBBBBBH        \n       HB                     BH        \n       HB                     BH        \n       H           *           H        \n       HBBBBBBBBBBBBBBBBBBBBBBBH        \n       HB                     BH        \n       HB                     BH        \n  R    H           *         e H        \n  BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB   ","id":"3e88f9a2352bd7cf9ecb71a167cacef","name":"Phase","type":"Level","message":"Each robot can carry a treasure. You need to pry them out.\n\nLucky for us, the guards get stuck in the phased matter. Don't be afraid to run across their heads. But watch for them climbing out!\n\nAnyway, you have the tools you need.\n\nAnd hey, while you're at it, keep up the pace. If you don't mind. The faster we get out of here, the better.","bounds":{"max":{"x":37,"y":20},"min":{"x":2,"y":0}},"number":4,"winsMin":14.133333333333615},{"contentHash":"b515ec38fc405953e452884f6246d8c8","tiles":"È                                      È\nÈ           ####H####                  È\nÈ               H                      È\nBBBBBHBBBBBB    H          H########H###\n     H          H          H        H   \n #   H          H      e   H        H   \n     H          H  BBBBBBHBBBBB     H   \n   # H          H        H          H   \n     H          H        H          H   \n     H          H        H          H   \n    #####H########       H    ##### H   \n #       H               H          HB  \n         H               H         HBB  \n  *      HBBBBBBBBBBBBBBBB         HB   \n         H                        HBB   \n   #     H        *        ###### HB    \n         H    #########           H *   \n         H                        H BH  \nR        H        *      e        H BH  \n########################################","id":"2ab86ef6d02fadc0722dcd5c9bfaaed","name":"Steel","type":"Level","message":"Oh ... Hmm ... I don't think your gloves can phase the steel. Watch out.\n\nStill, you got this. We came here for a reason, and you can make this happen.","number":5,"winsMin":43.36666666666549},{"contentHash":"2b01c03aeb42f2fb48de19d0de73bc15","tiles":"                    H                   \n                    H                   \n                    H                   \n                    H                   \n                    H                   \n              R     H     e             \n              B#B#B#H#B#B#B             \n              *     H     *             \n              #B#B#BHB#B#B#             \n              *     H     *             \n              B#B#B#H#B#B#B             \n              *     H     *             \n              #B#B#BHB#B#B#             \n                    H                   \n               *    H    *              \n               H    H    H              \n               H    H    H              \n               HB#B#H#B#BH              \n                                        \n                                        ","id":"289a6f78c0927226d3bcf1722e67f31","name":"* Mix","type":"Level","bounds":{"max":{"x":31,"y":20},"min":{"x":10,"y":0}},"number":6,"winsMin":28.19999999999968},{"contentHash":"3c4ff33982ea20c18f9ec27594f91603","tiles":"            È           È               \n            È           È               \n            È           È               \n            È           È               \n            Èe         eÈ               \n            HBBBBBBBBBBBH               \n            HBB#BBBBBBBBH               \n            HB    BB#BBBH               \n            HBB*  BBBBBBH               \n            HBBBBBBB  BBH               \n            HBBBBBBB *BBH               \n            HBB BBBBBBBBH               \n            HBB BBBBB  BH               \n            HB   *BBB* BH               \n            HBBB##BBBBBBH               \n            H     R     H               \n          #######BBB#######             \n                                        \n                                        \n                                        ","id":"736fa07f7977496890eb502b57d17963","name":"* Dig","type":"Level","bounds":{"max":{"x":27,"y":20},"min":{"x":10,"y":3}},"number":7,"winsMin":41.18333333333228},{"contentHash":"7167231aaf2e72f6c6cbb1b87b5a002d","tiles":"    È                              È    \n    È------------------------------È    \n    H                              H    \n    H    e                    e    H    \n    H  BB#BB                BB#BB  H    \n    H  B   B   ----------   B   B  H    \n    H  B  *B  H          H  B  *B  H    \n    H  B# #B  H          H  B# #B  H    \n    H         H          H         H    \n    H         H B*    eB H         H    \n    H   ------H B  HBBBB H------   H    \n    H  *      H B  HB  B H      *  H    \n    H  B      H BBBHB  B H      B  H    \n    H         H B  HB  B H         H    \n    H------   H B* HB *B H    -----H    \n    H      *  H BBBBBBBB H   *     H    \n    H      B  H          H   B     H    \n    H         H          H         H    \n R  H         H          H         H    \nBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB","id":"88ef7a1992631e407bdd01ab71c628a","name":"* More Bars","type":"Level","number":8,"winsMin":43.799999999998796},{"contentHash":"2261e661453cd4c9158c7a4bd992386c","tiles":"--------------------------H-------------\n       -- ---------       H    ----     \n      *  H                H        H    \n         H H              H BBB    H    \n   ---   H H----------e   H        H    \n      H  H H          H   H        H    \n-- ---H  H H      B   H   H     ---H    \n  H   H  H H    H     H   H-   H   H    \n  H   H  H-H    H   R H   H    H H H    \n  H   H  H      H   H H---H    H H H    \n      H--H   *  H   H H   H    H H H    \nBB*   H  H      H   H H   H    H-H      \n BB   H  H------H    H    H    H H *    \n         H      H    H    H B  H H      \n   H     H      H    H--- H    H H------\n   H     H BBB  H   H     H    H H      \n   H     H      H   H  *  H      H      \n   H-----H      H         H      H  BBB \n   H     H      H---------H      H      \n   H     H      H         H      H      ","id":"f9be13b52bd9994eda1754e539c12476","name":"* Jungle","type":"Level","number":9,"winsMin":69.01666666666404},{"contentHash":"bdb1fc32f92890acf0f5e392ef92a4fd","tiles":"È                                     È \nÈ      *                       *      È \nÈ      H     -------------     H      È \nÈ      H    H             H    H      È \nÈ   BHBBB   H             H   BBBHB   È \nÈ    H      H             H      H    È \nÈ    H      H      *      H      H    È \nÈ    H      H             H      H    È \nÈ    H      H             H      H    È \nÈ  BBBBBHB  Hÿÿÿ       ÿÿÿH  BHBBBBB  È \nÈ       H   H   ÂÂÂÂÂÂÂ   H   H       È \nÈ       H   H             H   H       È \nÈ       H   H             H   H       È \nÈ       H   H             H   H       È \nÈ HBBBBBBBB H             HÂBBBBBBBBHÂÈ \nÈ H         H             H         H È \nÈ H         H             H         H È \nÈ H         H             H         H È \nÈeH   R     H             H         HeÈ \nBBBBBBBBBBBBBB           BBBBBBBBBBBBBB ","id":"ba6aeab44e6525c99c8a0913e863f3","name":"Bricks Appear","type":"Level","bounds":{"max":{"x":39,"y":20},"min":{"x":0,"y":0}},"number":10,"winsMin":36.14999999999923},{"contentHash":"7acc16044e4efcc0c30f1dc354fa686d","tiles":"           £È                           \n           £È         ----------------- \n           £È         £                H\n       *   £È---------£                H\n£££££HBBBBBBH         £             *  H\n     H     £H         £                H\n     H     £H         £e   *           H\n*    H     £HÂÂÂÂÂÂÂÂÂHBBBBBÂÂÂÂÂÂÂÂÂÂÂH\nBBBBBHÂÂÂÂÂÂH   £     H                H\n     H     £H   £     H                H\n     H   * £H   £     H                H\nÂÂÂÂÂHBBBBBBBBBH######H                H\n     H         H£     H------*------ e H\n     H         H£     H      H      BBBB\n     H         H£  *  H      H          \n£££££HÂÂÂÂÂÂÂÂÂBBBBBBBB££££££H££££££££££\n     H          £            H          \n     H          £            H          \n  R  H     *    £            H          \n########################################","id":"5090daf0890d61da6dc3eef9b44d858","name":"* Walls Appear","type":"Level","number":11,"winsMin":50.349999999998424},{"contentHash":"f48ec2457abf9db49bc419f60ae20ac1","tiles":"      ÈÂ                       *        \nÂÂÂÂÂÂÈÂÂÂÂÂÂÂÂÂÂÂÂÂÂÂÂÂÂÂÂÂHBBBBBBHÂÂÂÂ\n      È          *          H      H    \n     ÂÂÂÂ  HBBBBBBBBBH      H      H *  \n           H         H      H      HBBBB\n     e   * H         H      H      H    \n   HBBBBBBBH         H    * H      H    \n   H       H         HBBBBBBH      H    \n   H       H         H      H      H    \n * H       H         H      H      H    \nBBBH       H         H  *   H      H    \n   H       H     *   HBBBBBBH      H    \n   H       HBBBBBBBBBH      H      H    \n   H   *   H         H      H e  * H    \n   HBBBBBBBH         H      HBBBBBBH    \n   H       H         H      H      H    \n   H       H       R H      H      H    \n###H#######H#########H######H######H####\n e È    e  È  e   e  È    e È e    È  e \n########################################","id":"3ce522861063f0986f831894e11e431","name":"* Enemies Escape","type":"Level","number":12,"winsMin":28.599999999999657},{"contentHash":"ae63e411753391d057976c64d5cd98c8","tiles":"Èå          å      å     å           åÈ \nÈ                                     È \nÈ                                     È \nÈ                  *                  È \nÈ                  H                  È \nÈ  ------------    H    ------------  È \n BH --------   HBBBHBBBH   -------- HB  \n  BH ----   HBBB   H   BBBH   ---- HB   \n   BH -  HBBB      H      BBBH  - HB    \n    BH BBB      HBBHBBH      BBB HB     \n     BH       HBB  H  BBH       HB      \n      BH   åHBB    H    BBHå   HB       \n       BH  BB    HBHBH    BB  HB        \n        BH      HB H BH      HB         \n         BH    HB  H  BH    HB          \n          BH  HB   H   BH  HB           \n           BH H    H    H HB            \n            B H    H    H B             \n         R   åH    H    Hå              \nBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB ","id":"408b51a849227236e3ffe3874227e98c","name":"Enemies Fall (enemies down stair problems)","type":"Level","bounds":{"max":{"x":39,"y":20},"min":{"x":0,"y":0}},"number":13,"winsMin":10.333333333333426},{"contentHash":"3cd3d5fe0c027acad5886665c7ceeba4","tiles":"È      *B                    *  B  *   È\nHBBBBBBBBBBBBBHBBBBBHBBBBBBBHBHBBBBBBBBH\nH             H   eBH       HBH        H\nBBBBBBBBHBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB\ne       H    B                     B *  \nBBBBBBBBBBBHBBBBBBBBBBBBBHBBBBBBBBBBBBBB\n*    B     H      *   B  H              \nBBHBBBBBBBBBBBBBBBBBBBBBBHBBBBBBBBBBBBBB\n  H                      H     B    *   \nBBHBBBBBBBBBBBHBBBBBBBBBBBBBBBBBBBBBBBBB\n  H   * B     H  Be                     \nBBBBBBBBBBHBBBBBBBBHBBBBBBBBBBBBBBHBBBBB\n          H        H *            H     \nBBBBBBBBBBBBBBBHBBBBBBBBBBBBBBBBBBHBBBBB\ne              H              Be  H     \nBBBBBHBBBBBBBBBBBBBBBBBBBBHBBBBBBBBBBBBB\n     H   *  B             H             \nBBBBBBBBBBBBBBBBBBHBBBBBBBHBBBBBBBBBHBBB\nR                 H     B H    *   BH  e\nBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB","id":"75127a36b8e75acfdb8bde23947ca4a","name":"* Tunnels","type":"Level","number":14,"winsMin":134.86666666666613},{"contentHash":"b6313a56b99ef3692e01ad4aa1774c87","tiles":"             È             È            \n             H#############H            \n             H#           #H            \n             H# #H     H# #H            \n             H# #H####### #H            \n             H# #H#e    # #H            \n             H# #H##### # #H            \n             H  #H      # #H            \n             H########### #H            \n             H#           #H            \n             H# #H#########H            \n             H# #H#  *    #H            \n             H# #H# #H H#H#H            \n             H# #H# #H H#H#H            \n             H# #H#######H#H            \n             H# #H       H#H            \n             H# ###########H            \n             H             H            \n            RH             H            \n            BBBBBBBBBBBBBBBBB           ","id":"e84d4c6b8c99bc744491429a849935e9","name":"Manipulate","type":"Level","bounds":{"max":{"x":29,"y":20},"min":{"x":12,"y":0}},"number":15,"winsMin":34.66666666666598},{"contentHash":"58134b24d3bf3b98160de3e546848b9e","tiles":"            È                           \n            È                           \n            È                           \n       [ *  È           *           ]   \n       HBBBBH       HBBBBBBHBBBBBBBBBH  \n       H    H       H      H         H  \n       H    H       H      H         H  \n   [ * H  * H       H      H         H  \n  HBBBBHBBBBH       H      H         H  \n  H    H    H       H      H    *   ]H  \n  H    H    H       H      HBBBBBBBBBH  \n  H[ * H    H       H      H         H  \n  HBBBBBBBBBH     * H  ]   HBR      BH  \n  H         H  HBBBBBBBBH  HBB     ]BH  \n  H         H  H        H  HBBBBBBBBBH  \n  H         H  H        H  H         H  \n  H         H  H        H  H BBBBBBB H  \n  H         H  H        H  H         H  \n  H         H  H        H  H    *    H  \n########################################","id":"71fe234d48acb0a47694a7a31990de","name":"Biggies","type":"Level","number":16,"winsMin":21.03333333333342},{"contentHash":"12906d61b66385fcb32c326cf6c262e5","tiles":"        e       * È B         B         \n        HBBBBBBBB È B    R    B         \n        H         È BBBBBBBBBBB         \n        H         È B         B         \n        H         È B[        B         \n        H         È BBBBBBBBBBB         \n        H[      * È B         B         \n        HBBBBBBBB È B[        B         \n        H         È BBBBBBBBBBB         \n        H         È B         B         \n        H         È B[      *eB         \n        H         È BBBBBBBBBBB         \n        H[      * È B         B         \n        HBBBBBBBB È B[        B         \n        H         È BBBBBBBBBBB         \n        H         È B         B         \n        H         È B         B         \n        H         È           B         \n        H        ÈBH ---------B         \n        BBBBBBBBBBBBB         B         ","id":"c419461d2c88a833f9dfef3bca35eaf","name":"* Drill Down","type":"Level","bounds":{"max":{"x":31,"y":20},"min":{"x":8,"y":0}},"number":17,"winsMin":25.533333333333164},{"contentHash":"75101f80d52fc2861e92f26b3baf384b","tiles":"                                        \n                                        \n                                        \n                                        \n                                        \n                                        \n                                        \n                                        \n                                        \n                                        \n                                        \n                                        \nR             -----H# B                 \n#H#BBBBB#HBBBH      # B                 \n#H#OOOOO#H \\ H####### B                 \n#H O* @O#H B H  <     B                 \n###OOOOO#H   HBBBBBBBBB                 \n    ÿÿÿ  H   H                          \n         H   H                          \nBBBB   BBBBBBBBBBBBBBBB                 ","id":"e5d33326668d58c75944360c544630","name":"Red Herring Finale","type":"Level","number":18}],"id":"f654f92e4bee89bedfaf9a281bab913","name":"Main Dev","type":"Tower"}

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = "<div class=\"dialog levels\">\r\n  <div class=\"fill shade\"></div>\r\n  <div class=\"fill dialogInner\">\r\n    <div class=\"titleBox\">\r\n      <div class=\"title\">\r\n        <span class=\"nameBox\">\r\n          <span class=\"name\">Tower</span>\r\n        </span>\r\n        <i class=\"fa fa-search search disabled\" title=\"Search\"></i>\r\n        <i class=\"fa fa-plus add\" title=\"New Level\"></i>\r\n        <i class=\"fa fa-clipboard paste disabled\"\r\n          title=\"Paste Marked Clipboard Level(s)\"></i>\r\n        <i class=\"fa fa-window-close-o fa-rotate-90 unclip disabled\"\r\n          title=\"Unmark Clipboard Selections\"></i>\r\n        <i class=\"fa fa-ban exclude\" title=\"Exclude Level\"></i>\r\n        <i class=\"fa fa-trash delete disabled\" title=\"Delete Level\"></i>\r\n        <i class=\"fa fa-download save\" title=\"Export Tower to File\"></i>\r\n        <i class=\"fa fa-arrow-up towers\" title=\"List Towers\"></i>\r\n        <!--<i class=\"fa fa-window-close close\"></i>-->\r\n      </div>\r\n    </div>\r\n    <div class=\"contentBox\">\r\n      <div class=\"content fill\">\r\n        <div class=\"item\">\r\n          <div class=\"fill highlight\"></div>\r\n          <span class=\"nameBox\">\r\n            <span class=\"number\"></span>\r\n            <span class=\"name\">Level</span>\r\n            <span class=\"stats\"></span>\r\n          </span>\r\n          <i class=\"fa fa-scissors cut disabled\" title=\"Mark for Cut\"></i>\r\n          <i class=\"fa fa-files-o copy disabled\" title=\"Mark for Copy\"></i>\r\n          <i class=\"fa fa-arrow-right edit\" title=\"Edit Level\"></i>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n";

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = "<div class=\"dialog messages\">\r\n  <div class=\"fill shade\"></div>\r\n  <div class=\"fill dialogInner\">\r\n    <textarea class=\"messageText\"></textarea>\r\n  </div>\r\n</div>\r\n";

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = "<div class=\"dialog report\">\r\n  <div class=\"fill shade\"></div>\r\n  <div class=\"fill dialogInner\">\r\n    <div class=\"endMessage\">...</div>\r\n    <table>\r\n      <tr class=\"scoreTimeRow timeRow\">\r\n        <th>Time:</th><td class=\"scoreTime\"></td>\r\n      </tr>\r\n    </table>\r\n  </div>\r\n</div>\r\n";

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = "<div class=\"dialog showMessage\">\r\n  <div class=\"fill shade\"></div>\r\n  <div class=\"fill dialogInner\">\r\n    <div class=\"messageText\"></div>\r\n  </div>\r\n</div>\r\n";

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = "<div class=\"dialog towers\">\r\n  <div class=\"fill shade\"></div>\r\n  <div class=\"fill dialogInner\">\r\n    <div class=\"titleBox\">\r\n      <div class=\"title\">\r\n        <span class=\"nameBox\">\r\n          <span class=\"name\">Towers</span>\r\n        </span>\r\n        <i class=\"fa fa-search search disabled\" title=\"Search\"></i>\r\n        <i class=\"fa fa-plus add\" title=\"New Tower\"></i>\r\n        <i class=\"fa fa-clipboard paste disabled\"\r\n          title=\"Paste Marked Clipboard Tower(s)\"></i>\r\n        <i class=\"fa fa-window-close-o fa-rotate-90 unclip disabled\"\r\n          title=\"Unmark Clipboard Selections\"></i>\r\n        <i class=\"fa fa-ban exclude disabled\" title=\"Exclude Tower\"></i>\r\n        <i class=\"fa fa-trash delete disabled\" title=\"Delete Tower\"></i>\r\n        <i class=\"fa fa-upload load disabled\" title=\"Import Tower\"></i>\r\n        <!--<i class=\"fa fa-window-close close\"></i>-->\r\n      </div>\r\n    </div>\r\n    <div class=\"contentBox\">\r\n      <div class=\"content fill\">\r\n        <div class=\"item\">\r\n          <div class=\"fill highlight\"></div>\r\n          <span class=\"nameBox\">\r\n            <span class=\"number\"></span>\r\n            <span class=\"name\">Level</span>\r\n          </span>\r\n          <i class=\"fa fa-scissors cut disabled\" title=\"Mark for Cut\"></i>\r\n          <i class=\"fa fa-files-o copy disabled\" title=\"Mark for Copy\"></i>\r\n          <i class=\"fa fa-arrow-right edit\" title=\"List Levels\"></i>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n";

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = "data:image/png;base64,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"

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(14);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(3)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!./index.css", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!./index.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)(undefined);
// imports


// module
exports.push([module.i, "body {\r\n  align-content: stretch;\r\n  align-items: stretch;\r\n  background: #202020;\r\n  bottom: 0;\r\n  color: white;\r\n  cursor: default;\r\n  display: flex;\r\n  font-family: sans-serif;\r\n  left: 0;\r\n  margin: 0;\r\n  position: fixed;\r\n  right: 0;\r\n  top: 0;\r\n}\r\n\r\n.clipboard {\r\n  background: black;\r\n  opacity: 0.75;\r\n  pointer-events: none;\r\n  position: absolute;\r\n}\r\n\r\n.clipboard canvas {\r\n  image-rendering: pixelated;\r\n}\r\n\r\n.commands .changing, .commands .saved  {\r\n  display: none;\r\n}\r\n\r\n.commands .message,\r\n.commands .play,\r\n.commands .redo,\r\n.commands .showLevels,\r\n.status .pause  {\r\n  margin-bottom: 0.5em;\r\n}\r\n\r\n[contenteditable]:focus {\r\n  outline: 1px solid white;\r\n}\r\n\r\n[contenteditable]::selection {\r\n  background-color: white;\r\n  color: black;\r\n}\r\n\r\n.cropper, .selector {\r\n  border: 0.2em white;\r\n  border-radius: 0.2em;\r\n  display: none;\r\n  height: 10em;\r\n  pointer-events: none;\r\n  position: absolute;\r\n  width: 10em;\r\n}\r\n\r\n.cropper {\r\n  border-style: dashed;\r\n}\r\n\r\n.dialog {\r\n  bottom: 0.5em;\r\n  border: 0.1em solid white;\r\n  border-radius: 0.2em;\r\n  display: inline-block;\r\n  left: 25%;\r\n  min-width: 50%;\r\n  padding: 0.5em;\r\n  position: absolute;\r\n  right: 25%;\r\n  text-align: left;\r\n  top: 0.5em;\r\n}\r\n\r\n.dialog .content {\r\n  counter-reset: dialogContentCounter;\r\n  margin-top: 0.5em;\r\n  overflow: auto;\r\n}\r\n\r\n.dialog .content .item {\r\n  display: flex;\r\n  position: relative;\r\n}\r\n\r\n.dialog .content .item .edit {\r\n  margin-right: 0.3em;\r\n}\r\n\r\n.dialog .content .item .fa {\r\n  display: none;\r\n  padding: 0.1em 0;\r\n}\r\n\r\n.dialog .content .item .highlight {\r\n  background: #FFF;\r\n  display: none;\r\n  opacity: 0.2;\r\n  pointer-events: none;\r\n}\r\n\r\n.dialog .content .item:hover .highlight,\r\n.dialog .content:not(:hover) .item.selected .highlight {\r\n  display: block;\r\n}\r\n\r\n.dialog .content .item:hover .fa {\r\n  display: inline;\r\n}\r\n\r\n.dialog .content .item .name {\r\n  margin-left: 0.3em;\r\n  /* For easier seeing of caret at right. */\r\n  padding-right: 0.05em;\r\n}\r\n\r\n.dialog .content .item .nameBox {\r\n  display: flex;\r\n  flex: 1;\r\n  padding: 0.1em 0.2em;\r\n}\r\n\r\n.dialog .content .number {\r\n  padding-right: 0.2em;\r\n  text-align: right;\r\n}\r\n\r\n.dialog .contentBox {\r\n  flex: 1;\r\n  position: relative;\r\n}\r\n\r\n.dialog .fa {\r\n  margin-left: 0.8em;\r\n  margin-top: 0.08em;\r\n}\r\n\r\n.dialog .copy,\r\n.dialog .delete,\r\n.dialog .fa.load,\r\n.dialog .fa.paste,\r\n.dialog .fa.redo,\r\n.dialog .unclip {\r\n  margin-left: 0.4em;\r\n}\r\n\r\n.dialog .title {\r\n  border-bottom: 0.1em solid white;\r\n  display: flex;\r\n  flex: 0;\r\n  padding-bottom: 0.4em;\r\n}\r\n\r\n.dialog .title .name {\r\n  /* For easier seeing of caret at right. */\r\n  padding-right: 0.05em;\r\n}\r\n\r\n.dialog .title .nameBox {\r\n  flex: 1;\r\n}\r\n\r\n.dialogInner {\r\n  display: flex;\r\n  flex-direction: column;\r\n  padding: 0.5em;\r\n}\r\n\r\n.disabled {\r\n  opacity: 0.4;\r\n}\r\n\r\n.editMode .status {\r\n  display: none;\r\n}\r\n\r\n.fill {\r\n  bottom: 0;\r\n  left: 0;\r\n  position: absolute;\r\n  right: 0;\r\n  top: 0;\r\n}\r\n\r\n.fill.relative {\r\n  position: relative;\r\n}\r\n\r\n.messages textarea {\r\n  background: none;\r\n  border: none;\r\n  color: white;\r\n  font-family: sans-serif;\r\n  font-size: 4vmin;\r\n  height: 100%;\r\n  resize: none;\r\n}\r\n\r\n.pane {\r\n  display: none;\r\n}\r\n\r\n.pane .dialogBox {\r\n  font-size: 2em;\r\n  padding: 0.5em;\r\n  text-align: center;\r\n}\r\n\r\n.panel {\r\n  display: inline-block;\r\n}\r\n\r\n.panel > * {\r\n  border: 0.1em solid transparent;\r\n  font-size: 2em;\r\n  padding: 0.1em;\r\n}\r\n\r\n.panelBox {\r\n  flex: 0;\r\n  min-width: 4em;\r\n}\r\n\r\n.playMode .commands, .playMode .toolbox {\r\n  display: none;\r\n}\r\n\r\n.right {\r\n  text-align: right;\r\n}\r\n\r\n.scoreTimeRow > * {\r\n  padding-top: 1em;\r\n}\r\n\r\n.selector {\r\n  border-style: solid;\r\n}\r\n\r\n.shade {\r\n  background: black;\r\n  /* Only to own content -> filter: blur(3px);*/\r\n  opacity: 0.65;\r\n}\r\n\r\n.showMessage .messageText {\r\n  white-space: pre-line;\r\n}\r\n\r\n.stage {\r\n  background: black;\r\n  display: none;\r\n  margin-bottom: auto;\r\n  margin-top: auto;\r\n  position: absolute;\r\n}\r\n\r\n.status.other {\r\n  visibility: hidden;\r\n}\r\n\r\ntable {\r\n  margin-top: 1em;\r\n}\r\n\r\n.stats {\r\n  padding-left: 0.5em;\r\n}\r\n\r\n.timeRow td {\r\n  text-align: right;\r\n}\r\n\r\n.timeRow th {\r\n  font-weight: normal;\r\n  padding-right: 0.5em;\r\n  text-align: right;\r\n}\r\n\r\n.toolbox .ender {\r\n  margin-top: 0.5em;\r\n}\r\n\r\n.toolbox input {\r\n  display: none;\r\n}\r\n\r\n.toolbox label {\r\n  border: 0.1em solid transparent;\r\n  display: block;\r\n  /* This margin makes the borders overlap across neighbors. */\r\n  margin-bottom: -0.1em;\r\n  position: relative;\r\n}\r\n\r\n.toolbox label.ender {\r\n  margin-bottom: 0;\r\n}\r\n\r\n.toolbox > label canvas {\r\n  display: block;\r\n}\r\n\r\n.toolbox > label:hover .toolMenu,\r\n.toolMenu:hover {\r\n  display: flex;\r\n}\r\n\r\n.toolbox i {\r\n  display: block;\r\n  position: relative;\r\n  text-align: center;\r\n  top: 50%;\r\n  transform: translateY(-50%);\r\n}\r\n\r\n.toolbox i * {\r\n  display: block;\r\n}\r\n\r\n.toolbox .selected {\r\n  border: 0.1em solid white;\r\n  border-radius: 0.2em;\r\n}\r\n\r\n.toolbox .toolMenu label {\r\n  display: block;\r\n  padding: 0.1em;\r\n}\r\n\r\n.toolbox .toolMenu label canvas {\r\n  display: block;\r\n}\r\n\r\n.toolMenu {\r\n  background: #202020;\r\n  display: none;\r\n  /* Left margin gets overruled later, but this at least offsets some. */\r\n  margin-left: 1em;\r\n  margin-top: -0.2em;\r\n  position: absolute;\r\n  padding: 0.1em 0.1em 0.2em 0.3em;\r\n  top: 0;\r\n  z-index: 1;\r\n}\r\n\r\n.view {\r\n  flex: 1;\r\n  position: relative;\r\n}\r\n", ""]);

// exports


/***/ })
],[5]);