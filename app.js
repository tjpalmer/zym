webpackJsonp([1],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	const _1 = __webpack_require__(1);
	const gold_1 = __webpack_require__(4);
	__webpack_require__(50);
	__webpack_require__(8);
	window.onload = main;
	function main() {
	    return __awaiter(this, void 0, void 0, function* () {
	        let game = new _1.Game(window.document.body);
	        let theme = yield gold_1.GoldTheme.load(game);
	        game.theme = theme;
	        // Fill in even empty/none parts before the first drawing, so uv and such get
	        // in there.
	        game.level.updateStage(game);
	        theme.handle();
	        // Now kick off the display.
	        game.render();
	    });
	}


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	// This file allows exporting the entire package api as a unified whole, while
	// coming from different source files.
	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	// Some others depend on Mode and Part from these for now, so import it first.
	__export(__webpack_require__(44));
	__export(__webpack_require__(11));
	__export(__webpack_require__(21));
	__export(__webpack_require__(38));
	__export(__webpack_require__(9));
	__export(__webpack_require__(10));
	__export(__webpack_require__(20));
	__export(__webpack_require__(37));
	__export(__webpack_require__(39));


/***/ },
/* 2 */,
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	// Used by multiple parts.
	__export(__webpack_require__(33));
	// Parts themselves.
	__export(__webpack_require__(22));
	__export(__webpack_require__(23));
	__export(__webpack_require__(24));
	__export(__webpack_require__(25));
	__export(__webpack_require__(26));
	__export(__webpack_require__(27));
	__export(__webpack_require__(28));
	__export(__webpack_require__(29));
	__export(__webpack_require__(30));
	__export(__webpack_require__(31));
	__export(__webpack_require__(34));
	__export(__webpack_require__(35));
	__export(__webpack_require__(36));
	// After individual parts above.
	__export(__webpack_require__(32));


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	// Common first.
	__export(__webpack_require__(18));
	// Individual parts.
	__export(__webpack_require__(12));
	__export(__webpack_require__(13));
	__export(__webpack_require__(14));
	__export(__webpack_require__(15));
	__export(__webpack_require__(17));
	__export(__webpack_require__(19));
	// And the index.
	__export(__webpack_require__(16));


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	// Dependencies.
	__export(__webpack_require__(41));
	// Others.
	__export(__webpack_require__(40));
	__export(__webpack_require__(42));
	__export(__webpack_require__(43));


/***/ },
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */
/***/ function(module, exports) {

	"use strict";
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
	exports.RunnerAction = RunnerAction;
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
	                this.game.hideDialog();
	                break;
	            }
	            case 'escape': {
	                this.game.mode.onKeyDown('Escape');
	                this.game.hideDialog();
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
	exports.Control = Control;
	let axisEdge = 0.5;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(1);
	const ui_1 = __webpack_require__(5);
	const parts_1 = __webpack_require__(3);
	class EditMode extends _1.Mode {
	    constructor(game) {
	        super(game);
	        this.active = false;
	        this.bodyClass = 'editMode';
	        // TODO Limit the total number of editStates?
	        this.editStates = {};
	        this.namedTools = new Map(parts_1.Parts.inventory.filter(type => !type.ender).map(type => [type.name.toLowerCase(), new _1.PartTool(this, type)]));
	        this.saveDelay = 10e3;
	        let { body } = document;
	        this.toolbox = new _1.Toolbox(body, this);
	        // Always save on exit.
	        window.addEventListener('beforeunload', () => this.saveAll());
	        // Buttons.
	        this.commandsContainer =
	            body.querySelector('.panel.commands');
	        this.onClick('exit', () => this.game.setMode(this.game.play));
	        this.onClick('play', () => this.togglePlay());
	        this.onClick('redo', () => this.editState.redo());
	        this.onClick('showLevels', () => this.showLevels());
	        this.onClick('undo', () => this.editState.undo());
	        // Tools.
	        this.namedTools.set('copy', this.copyTool = new _1.CopyTool(this));
	        this.namedTools.set('paste', new _1.PasteTool(this));
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
	    }
	    exit() {
	        this.saveAll();
	        this.tool.deactivate();
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
	        let type = parts_1.Parts.optionType(baseType, options);
	        return new _1.PartTool(this, type);
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
	                if (!(this.game.dialog instanceof ui_1.Levels)) {
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
	            this.tool = new _1.NopTool(this);
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
	        this.game.showDialog(new ui_1.Levels(this.game));
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
	        let point = stagePoint.clone().divide(_1.Level.tileSize).floor();
	        if (point.x < 0 || point.x >= _1.Level.tileCount.x) {
	            return;
	        }
	        if (point.y < 0 || point.y >= _1.Level.tileCount.y) {
	            return;
	        }
	        return point;
	    }
	    togglePlay() {
	        this.game.setMode(this.game.mode == this.game.test ? this.game.edit : this.game.test);
	    }
	    toolFromName(name) {
	        let tool = this.namedTools.get(name);
	        if (tool instanceof _1.PartTool) {
	            // Be more precise, in terms of our options.
	            tool = this.partTool(name, this);
	        }
	        return tool;
	    }
	    updateTool() {
	        if (this.tool instanceof _1.PartTool) {
	            this.setToolFromName(this.tool.type.base.name.toLowerCase());
	        }
	    }
	}
	exports.EditMode = EditMode;
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


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(1);
	const three_1 = __webpack_require__(2);
	class Dialog {
	    constructor(game) {
	        this.game = game;
	    }
	    onKey(event, down) { }
	}
	exports.Dialog = Dialog;
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
	}
	exports.Mode = Mode;
	class Game {
	    constructor(body) {
	        this.stage = new _1.Stage(this);
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
	            new three_1.WebGLRenderer({ antialias: false, canvas });
	        // Camera.
	        // Retain this view across themes.
	        this.camera = new three_1.OrthographicCamera(0, _1.Level.pixelCount.x, _1.Level.pixelCount.y, 0, -1e5, 1e5);
	        this.camera.position.z = 1;
	        // Resize handling after renderer and camera.
	        window.addEventListener('resize', () => this.resize());
	        this.resize();
	        canvas.style.display = 'block';
	        // Scene.
	        this.scene = new three_1.Scene();
	        // Modes. After we have a level for them to reference.
	        this.edit = new _1.EditMode(this);
	        this.play = new _1.PlayMode(this);
	        this.test = new _1.TestMode(this);
	        // Cheat set early to avoid errors, but it really kicks in on the timeout.
	        this.mode = this.test;
	        setTimeout(() => this.setMode(this.mode), 0);
	        // Input handlers.
	        this.control = new _1.Control(this);
	        canvas.addEventListener('mousedown', event => this.mouseDown(event));
	        window.addEventListener('mousemove', event => this.mouseMove(event));
	        window.addEventListener('mouseup', event => this.mouseUp(event));
	    }
	    hideDialog() {
	        if (this.dialog) {
	            this.mode.onHideDialog(this.dialog);
	        }
	        this.body.querySelector('.pane').style.display = 'none';
	        this.dialog = undefined;
	    }
	    mouseDown(event) {
	        let point = new three_1.Vector2(event.offsetX, event.offsetY);
	        this.mode.mouseDown({
	            point: this.scalePoint(point),
	        });
	        event.preventDefault();
	    }
	    mouseMove(event) {
	        let bounding = this.renderer.domElement.getBoundingClientRect();
	        // TODO I'm not sure the scroll math is right, but I don't scroll anyway.
	        let point = new three_1.Vector2(event.pageX - (bounding.left + window.scrollX), event.pageY - (bounding.top + window.scrollY));
	        this.mode.mouseMove({
	            point: this.scalePoint(point),
	        });
	    }
	    mouseUp(event) {
	        this.mode.mouseUp({
	            point: new three_1.Vector2(),
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
	            let viewSize = new three_1.Vector2(view.clientWidth, view.clientHeight);
	            let viewRatio = viewSize.x / viewSize.y;
	            let pixelRatio = _1.Level.pixelCount.x / _1.Level.pixelCount.y;
	            let canvasSize = new three_1.Vector2();
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
	        point.divide(new three_1.Vector2(canvas.clientWidth, canvas.clientHeight));
	        // Put +y up, like GL.
	        point.y = 1 - point.y;
	        point.multiply(_1.Level.pixelCount);
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
	        this.level = new _1.Level().decode(level);
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
	exports.Game = Game;
	// TODO Simplify.
	function loadLevel(towerMeta) {
	    let levelId = window.localStorage['zym.levelId'];
	    let level = new _1.Level();
	    if (levelId) {
	        level = new _1.Level().load(levelId);
	    }
	    else {
	        level.save();
	    }
	    let tower = new _1.Tower().load(towerMeta.id);
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
	    let tower = new _1.Tower();
	    let towerId = window.localStorage['zym.towerId'] || window.localStorage['zym.worldId'];
	    if (towerId) {
	        let rawTower = _1.Raw.load(towerId);
	        if (rawTower) {
	            if (rawTower.levels) {
	                // Update to generic form.
	                // TODO(tjp): Remove this once all converted?
	                rawTower.items = rawTower.levels;
	                delete rawTower.levels;
	                _1.Raw.save(rawTower);
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
	        tower.save();
	    }
	    let zone = new _1.Zone().load(zoneMeta.id);
	    if (!zone.items.some(item => item.id == tower.id)) {
	        // This level isn't in the current tower. Add it.
	        // TODO Make sure we keep tower and level selection in sync!
	        zone.items.push(tower.encode());
	        zone.save();
	    }
	    // This might save the new id or just overwrite. TODO Be more precise?
	    window.localStorage['zym.towerId'] = tower.id;
	    delete window.localStorage['zym.worldId'];
	    return _1.Raw.encodeMeta(tower);
	}
	exports.loadTower = loadTower;
	// TODO Simplify.
	function loadZone() {
	    let zone = new _1.Zone();
	    let zoneId = window.localStorage['zym.zoneId'];
	    if (zoneId) {
	        let rawZone = _1.Raw.load(zoneId);
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
	    // This might save the new id or just overwrite. TODO Be more precise?
	    window.localStorage['zym.zoneId'] = zone.id;
	    return _1.Raw.encodeMeta(zone);
	}


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(4);
	const three_1 = __webpack_require__(2);
	class BiggieArt extends _1.BaseArt {
	    constructor() {
	        super(...arguments);
	        this.frame = 0;
	        this.lastTime = 0;
	        this.layer = _1.Layer.biggie;
	        this.workPoint = new three_1.Vector2();
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
	                this.frame = (this.frame + 1) % frames.length;
	            }
	            workPoint.y -= frames[this.frame];
	        }
	        return workPoint;
	    }
	}
	exports.BiggieArt = BiggieArt;
	// The actual frames from the source image require back and forth.
	let frames = [0, 1, 0, 2];


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(4);
	const _2 = __webpack_require__(1);
	const three_1 = __webpack_require__(2);
	class BrickArt extends _1.BaseArt {
	    constructor(part) {
	        super(part);
	        this.frame = 10;
	        this.layer = _1.Layer.front;
	        this.flame = new Flame(part);
	    }
	    get tile() {
	        // TODO Additional translucent full brick even when burned?!?
	        let { burned, burnTime, burnTimeLeft } = this.part;
	        if (burned) {
	            if (this.flame.exists && !this.flame.started) {
	                this.flame.start();
	            }
	            workPoint.copy(mainTile);
	            let frame = 10;
	            if (burnTime < animTime) {
	                frame = Math.floor((burnTime / animTime) * animCount);
	            }
	            else if (burnTimeLeft < animTime) {
	                frame = Math.floor((burnTimeLeft / animTime) * animCount);
	            }
	            frame = Math.max(frame, 0);
	            workPoint.y -= frame;
	            this.frame = frame;
	            return workPoint;
	        }
	        else {
	            return mainTile;
	        }
	    }
	}
	exports.BrickArt = BrickArt;
	class Flame extends _2.Part {
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
	exports.Flame = Flame;
	class FlameArt extends _1.BaseArt {
	    constructor() {
	        super(...arguments);
	        this.layer = _1.Layer.flame;
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
	exports.FlameArt = FlameArt;
	let animCount = 10;
	let animTime = 0.25;
	let flameTile = new three_1.Vector2();
	let mainTile = new three_1.Vector2(2, 18);
	let workPoint = new three_1.Vector2();


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(4);
	const three_1 = __webpack_require__(2);
	class EnergyArt extends _1.BaseArt {
	    constructor() {
	        super(...arguments);
	        this.layer = _1.Layer.front;
	        this.workPoint = new three_1.Vector2();
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
	exports.EnergyArt = EnergyArt;
	class LatchArt extends _1.BaseArt {
	    constructor() {
	        super(...arguments);
	        this.layer = _1.Layer.front;
	        this.workPoint = new three_1.Vector2();
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
	exports.LatchArt = LatchArt;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(4);
	const three_1 = __webpack_require__(2);
	class GunArt extends _1.BaseArt {
	    constructor() {
	        super(...arguments);
	        this.layer = _1.Layer.gun;
	        this.workPoint = new three_1.Vector2(0, 10);
	    }
	    get tile() {
	        let { part, workPoint } = this;
	        workPoint.x = part.facing < 0 ? 24 : 21;
	        return workPoint;
	    }
	}
	exports.GunArt = GunArt;


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(4);
	const _2 = __webpack_require__(3);
	const three_1 = __webpack_require__(2);
	// Simple arts for unchanging parts.
	exports.arts = {
	    Bar: { layer: _1.Layer.back, tile: new three_1.Vector2(9, 17) },
	    Ladder: { layer: _1.Layer.back, tile: new three_1.Vector2(8, 17) },
	    LauncherCenter: { layer: _1.Layer.back, tile: new three_1.Vector2(12, 17) },
	    LauncherDown: { layer: _1.Layer.back, tile: new three_1.Vector2(11, 17) },
	    LauncherLeft: { layer: _1.Layer.back, tile: new three_1.Vector2(10, 16) },
	    LauncherRight: { layer: _1.Layer.back, tile: new three_1.Vector2(11, 16) },
	    LauncherUp: { layer: _1.Layer.back, tile: new three_1.Vector2(10, 17) },
	    None: { layer: _1.Layer.back, tile: new three_1.Vector2(0, 2) },
	    Shot: { layer: _1.Layer.shot, tile: new three_1.Vector2(22, 10) },
	    Spawn: { layer: _1.Layer.back, tile: new three_1.Vector2(12, 16) },
	    Steel: { layer: _1.Layer.front, tile: new three_1.Vector2(7, 17) },
	};
	class Parts {
	}
	// TODO 'any' because Shot and other dynamic part types.
	// TODO Split into different part type types and be more specific here?
	Parts.tileArts = new Map([
	    [_2.Bar, artMaker(exports.arts.Bar)],
	    [_2.BiggieLeft, part => new _1.BiggieArt(part)],
	    [_2.BiggieRight, part => new _1.BiggieArt(part)],
	    [_2.Bonus, part => new _1.PrizeArt(part, new three_1.Vector2(13, 16))],
	    [_2.Brick, part => new _1.BrickArt(part)],
	    [_2.Enemy, part => new _1.RunnerArt(part, new three_1.Vector2(15, 14))],
	    [_2.Energy, part => new _1.EnergyArt(part)],
	    [_2.EnergyOff, part => new _1.EnergyArt(part)],
	    [_1.Flame, part => new _1.FlameArt(part)],
	    [_2.GunLeft, part => new _1.GunArt(part)],
	    [_2.GunRight, part => new _1.GunArt(part)],
	    [_2.Hero, part => new _1.RunnerArt(part, new three_1.Vector2(9, 14))],
	    [_2.Ladder, artMaker(exports.arts.Ladder)],
	    [_2.LatchLeft, part => new _1.LatchArt(part)],
	    [_2.LatchRight, part => new _1.LatchArt(part)],
	    [_2.LauncherCenter, artMaker(exports.arts.LauncherCenter)],
	    [_2.LauncherDown, artMaker(exports.arts.LauncherDown)],
	    [_2.LauncherLeft, artMaker(exports.arts.LauncherLeft)],
	    [_2.LauncherRight, artMaker(exports.arts.LauncherRight)],
	    [_2.LauncherUp, artMaker(exports.arts.LauncherUp)],
	    [_2.None, artMaker(exports.arts.None)],
	    [_2.Shot, artMaker(exports.arts.Shot)],
	    [_2.Spawn, artMaker(exports.arts.Spawn)],
	    [_2.Steel, artMaker(exports.arts.Steel)],
	    [_2.Treasure, part => new _1.PrizeArt(part, new three_1.Vector2(13, 17))],
	]);
	exports.Parts = Parts;
	function artMaker({ layer, tile }) {
	    return (part) => {
	        return { layer, offsetX: 0, part, tile, toolTile: tile };
	    };
	}


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(4);
	const parts_1 = __webpack_require__(3);
	const three_1 = __webpack_require__(2);
	class RunnerArt extends _1.BaseArt {
	    constructor(runner, tile) {
	        super(runner);
	        this.facing = 1;
	        this.frame = 0;
	        this.lastTime = 0;
	        // TODO Also on constructor.
	        this.layer = _1.Layer.hero;
	        this.mode = Mode.right;
	        this.workPoint = new three_1.Vector2();
	        if (runner.type == parts_1.Enemy) {
	            this.layer = _1.Layer.enemy;
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
	            if (this.part instanceof parts_1.Enemy) {
	                let { hero } = game.stage;
	                this.mode = hero && hero.point.x < point.x ? Mode.left : Mode.right;
	            }
	            else {
	                this.mode = Mode.right;
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
	                    this.mode = Mode.climb;
	                    speedScale = speed.y;
	                }
	                else {
	                    if (swinging) {
	                        this.mode = this.facing < 0 ? Mode.swingLeft : Mode.swingRight;
	                    }
	                    else {
	                        this.mode = this.facing < 0 ? Mode.left : Mode.right;
	                    }
	                }
	                // Frame.
	                let didMove = !!(Math.min(Math.abs(intendedMove.x), Math.abs(moved.x)) || moved.y);
	                let stepTime = 1 / 20 / speedScale;
	                let nextTime = stage.time > this.lastTime + stepTime || stage.time < this.lastTime;
	                if (nextTime && didMove) {
	                    this.lastTime = stage.time;
	                    this.frame = (this.frame + 1) % frames.length;
	                }
	            }
	            else {
	                // Hands up to fall.
	                this.mode = this.facing < 0 ? Mode.swingLeft : Mode.swingRight;
	            }
	        }
	        // Answer based on that.
	        let { workPoint } = this;
	        workPoint.copy(this.base);
	        workPoint.x += this.mode;
	        workPoint.y -= frames[this.frame];
	        return workPoint;
	    }
	    get toolTile() {
	        return this.base;
	    }
	}
	exports.RunnerArt = RunnerArt;
	var Mode;
	(function (Mode) {
	    Mode[Mode["climb"] = 4] = "climb";
	    Mode[Mode["left"] = 1] = "left";
	    Mode[Mode["right"] = 0] = "right";
	    Mode[Mode["swingLeft"] = 3] = "swingLeft";
	    Mode[Mode["swingRight"] = 2] = "swingRight";
	})(Mode || (Mode = {}));
	// The actual frames from the source image require back and forth.
	let frames = [0, 1, 2, 1, 0, 3, 4, 3];


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(4);
	const _2 = __webpack_require__(1);
	const parts_1 = __webpack_require__(3);
	const three_1 = __webpack_require__(2);
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
	})(Layer = exports.Layer || (exports.Layer = {}));
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
	exports.BaseArt = BaseArt;
	class GoldTheme {
	    constructor(game, image) {
	        this.ender = false;
	        this.fadeSee = new Lerper(0, 0x90, -100, 0.2);
	        this.invisible = false;
	        this.layerPartIndices = new Array();
	        this.layers = new Array();
	        this.level = new _2.Level();
	        this.tileIndices = new Uint8Array(3 * 6);
	        this.tileModes = new Uint8Array(6);
	        this.tileOpacities = new Uint8Array(6);
	        this.game = game;
	        // Prepare image.
	        this.image = image;
	        let scaled = this.prepareImage(image);
	        this.texture = new three_1.Texture(scaled);
	        this.texture.magFilter = three_1.NearestFilter;
	        this.texture.needsUpdate = true;
	        // Prepare layers.
	        // Add 1 to allow an undefined at the end.
	        // We'll extend these arrays later as needed. But not shrink them.
	        // TODO Don't bother to preallocate?
	        let maxLayerPartCount = _2.Level.tileCount.x * _2.Level.tileCount.y + 1;
	        for (let i = 0; i < Layer.length; ++i) {
	            this.layers.push(new Array(maxLayerPartCount));
	        }
	    }
	    static load(game) {
	        let image = new Image();
	        let promise = new Promise((resolve, reject) => {
	            image.addEventListener('load', () => {
	                resolve(new GoldTheme(game, image));
	            });
	            // TODO Error event?
	        });
	        image.src = __webpack_require__(51);
	        return promise;
	    }
	    buildArt(part) {
	        let type = part.type;
	        // TODO Change to type != type.base?
	        if (type.ender || type.invisible) {
	            type = type.base;
	        }
	        let makeArt = _1.Parts.tileArts.get(type);
	        if (!makeArt) {
	            // This makes it easier to deal with problems up front.
	            throw new Error(`No art for part type ${type.name}`);
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
	        if (game.edit.ender != this.ender) {
	            this.ender = game.edit.ender;
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
	        let tileMaterial = new three_1.ShaderMaterial({
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
	        this.tilePlane = new three_1.BufferGeometry();
	        let tilePlane = this.tilePlane;
	        tilePlane.addAttribute('position', new three_1.BufferAttribute(new Float32Array([
	            // Leave the coords at 3D for now to match default expectations.
	            // And they'll be translated.
	            8, 0, 0, 0, 10, 0, 0, 0, 0,
	            8, 0, 0, 8, 10, 0, 0, 10, 0,
	        ]), 3));
	        // Tile map offsets, repeated.
	        tilePlane.addAttribute('mode', new three_1.BufferAttribute(this.tileModes, 1));
	        tilePlane.addAttribute('opacity', new three_1.BufferAttribute(this.tileOpacities, 1));
	        tilePlane.addAttribute('tile', new three_1.BufferAttribute(this.tileIndices, 3));
	        tilePlane.addAttribute('uv', new three_1.BufferAttribute(new Float32Array([
	            // Uv are 2D.
	            1, 0, 0, 1, 0, 0,
	            1, 0, 1, 1, 0, 1,
	        ]), 2));
	        // All tiles in a batch.
	        // '4 *' to have space for particles.
	        let tileCount = 4 * _2.Level.tileCount.x * _2.Level.tileCount.y;
	        this.tilePlanes = new three_1.BufferGeometry();
	        for (let name in tilePlane.attributes) {
	            let attribute = tilePlane.getAttribute(name);
	            this.tilePlanes.addAttribute(name, new three_1.BufferAttribute(new Float32Array(tileCount * attribute.array.length), attribute.itemSize));
	        }
	        // Add to stage.
	        this.tilesMesh = new three_1.Mesh(this.tilePlanes, tileMaterial);
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
	            if (!(tool instanceof _2.PartTool)) {
	                continue;
	            }
	            let type = tool.type;
	            if (!type || type == parts_1.None) {
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
	            point.y = _2.Level.tileCount.y - point.y - 1;
	            point.multiply(_2.Level.tileSize);
	            // Now draw to our canvas and to the button background.
	            let canvas = button.querySelector(':scope > canvas');
	            let context = canvas.getContext('2d');
	            context.clearRect(0, 0, canvas.width, canvas.height);
	            context.drawImage(this.toolsImage, point.x, point.y, _2.Level.tileSize.x, _2.Level.tileSize.y, 0, 0, canvas.width, canvas.height);
	        }
	    }
	    paintStage(stage, asTools = false) {
	        let { game, time } = stage;
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
	        // Draw everything.
	        this.layers.forEach(layer => {
	            for (let part of layer) {
	                if (!part) {
	                    // That's the end of this layer.
	                    break;
	                }
	                let art = part.art;
	                let currentTileIndices = asTools ? art.toolTile : art.tile;
	                // Translate and merge are expensive. TODO Make my own functions?
	                tilePlane.translate(part.point.x, part.point.y, 0);
	                for (let k = 0; k < tileIndices.length; k += 3) {
	                    tileIndices[k + 0] = currentTileIndices.x;
	                    tileIndices[k + 1] = currentTileIndices.y;
	                    tileIndices[k + 2] = part.art.offsetX;
	                }
	                let mode = +(part.type.ender || part.keyTime + 1 > time);
	                if (part.dead) {
	                    mode = 2;
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
	                tilePlane.translate(-part.point.x, -part.point.y, 0);
	                ++partIndex;
	            }
	        });
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
	        canvas.width = round(_2.Level.pixelCount.x);
	        canvas.height = round(_2.Level.pixelCount.y);
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
	        let scale = Math.round(window.screen.height / 20 / _2.Level.tileSize.y);
	        let buttonSize = _2.Level.tileSize.clone().multiplyScalar(scale);
	        for (let button of toolbox.getButtons()) {
	            let name = toolbox.getName(button);
	            let tool = game.edit.namedTools.get(name);
	            let type = tool instanceof _2.PartTool ? tool.type : undefined;
	            if (!type || type == parts_1.None) {
	                // We don't draw a standard tile for this one.
	                button.style.width = `${buttonSize.x}px`;
	                button.style.height = `${buttonSize.y}px`;
	                continue;
	            }
	            // Now make a canvas to draw to.
	            let canvas = document.createElement('canvas');
	            canvas.width = _2.Level.tileSize.x;
	            canvas.height = _2.Level.tileSize.y;
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
	        let target = new three_1.WebGLRenderTarget(scaled.width, scaled.height);
	        try {
	            let stage = new _2.Stage(game);
	            stage.parts.length = 0;
	            toolbox.getButtons().forEach(button => {
	                let name = toolbox.getName(button);
	                let tool = game.edit.namedTools.get(name);
	                tool = game.edit.partTool(name, this);
	                let type = tool instanceof _2.PartTool ? tool.type : undefined;
	                if (!type) {
	                    return;
	                }
	                let part = type.make(game);
	                this.buildArt(part);
	                let art = part.art;
	                // console.log(name, art.baseTile.x, art.baseTile.y);
	                part.point.copy(art.toolTile).multiply(_2.Level.tileSize);
	                stage.parts.push(part);
	            });
	            // Hack edit more for painting.
	            let oldMode = game.mode;
	            game.mode = game.edit;
	            this.paintStage(stage, true);
	            // Back to old mode.
	            game.mode = oldMode;
	            let scene = new three_1.Scene();
	            let camera = new three_1.OrthographicCamera(0, scaled.width, scaled.height, 0, -1e5, 1e5);
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
	        if (!time) {
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
	exports.GoldTheme = GoldTheme;
	class Lerper {
	    constructor(begin, end, ref, span) {
	        this.state = false;
	        this.begin = begin;
	        this.end = end;
	        this.ref = ref;
	        this.span = span;
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
	        let rel = Math.min((x - this.ref) / this.span, 1);
	        return rel * (end - begin) + begin;
	    }
	}
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
	    vec2 coord = (
	      // Tile z is the horizontal offset to fix the offset problems with a
	      // couple of the tiles.
	      // The +56 in y is for the texture offset.
	      (vUv + vTile.xy) * vec2(8, 10) + vec2(vTile.z, 56)
	    ) / vec2(512, 256);
	    gl_FragColor = texture2D(map, coord);
	    gl_FragColor.w = gl_FragColor.x + gl_FragColor.y + gl_FragColor.z;
	    if (gl_FragColor.w > 0.0) {
	      // TODO Break mode (in vert shader?) and state into bits.
	      if (vMode != 0.0) {
	        grayify(gl_FragColor.xyz);
	        if (vMode > 1.0) {
	          gl_FragColor.xyz *= 0.5;
	        }
	      }
	      gl_FragColor.w = vOpacity;
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


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(4);
	const three_1 = __webpack_require__(2);
	class PrizeArt extends _1.BaseArt {
	    constructor(prize, tile) {
	        super(prize);
	        this.layer = _1.Layer.treasure;
	        this.mainTile = tile;
	    }
	    get tile() {
	        return this.part.owner ? goneTile : this.mainTile;
	        // return this.mainTile;
	    }
	}
	exports.PrizeArt = PrizeArt;
	let goneTile = new three_1.Vector2(0, 2);


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(1);
	const parts_1 = __webpack_require__(3);
	const three_1 = __webpack_require__(2);
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
	        return meta;
	    }
	    static load(ref) {
	        let text = window.localStorage[`zym.objects.${ref}`];
	        if (text) {
	            // TODO Sanitize names?
	            return JSON.parse(text);
	        }
	        // else undefined
	    }
	    static save(raw) {
	        // console.log(`Save ${raw.type} ${raw.name} (${raw.id})`);
	        window.localStorage[`zym.objects.${raw.id}`] = JSON.stringify(raw);
	    }
	}
	exports.Raw = Raw;
	class Encodable {
	    load(id) {
	        this.decode(Raw.load(id));
	        return this;
	    }
	    save() {
	        Raw.save(this.encode());
	    }
	}
	exports.Encodable = Encodable;
	class ItemList extends Encodable {
	    constructor() {
	        super(...arguments);
	        this.excluded = false;
	        this.id = _1.createId();
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
	        ItemList.numberItems(this.items);
	    }
	}
	exports.ItemList = ItemList;
	class Zone extends ItemList {
	    get type() {
	        return 'Zone';
	    }
	}
	exports.Zone = Zone;
	class Tower extends ItemList {
	    get type() {
	        return 'Tower';
	    }
	}
	exports.Tower = Tower;
	class Level extends Encodable {
	    constructor({ id, tiles } = {}) {
	        super();
	        this.excluded = false;
	        this.name = 'Level';
	        this.id = id || _1.createId();
	        if (tiles) {
	            this.tiles = tiles;
	        }
	        else {
	            this.tiles = new _1.Grid(Level.tileCount);
	            this.tiles.items.fill(parts_1.None);
	        }
	    }
	    copy() {
	        // TODO Include disabled?
	        return new Level({ id: this.id, tiles: this.tiles.copy() });
	    }
	    copyFrom(level) {
	        // TODO Include disabled?
	        this.name = level.name;
	        this.tiles = level.tiles.copy();
	    }
	    decode(encoded) {
	        this.excluded = !!encoded.excluded;
	        // Id. Might be missing for old saved levels.
	        // TODO Not by now, surely? Try removing checks?
	        // TODO Sanitize id, name, and tiles?
	        if (encoded.id) {
	            this.id = encoded.id;
	        }
	        if (encoded.name) {
	            this.name = encoded.name;
	        }
	        this.number = encoded.number;
	        // Tiles.
	        let point = new three_1.Vector2();
	        let rows = encoded.tiles.split('\n').slice(0, Level.tileCount.y);
	        rows.forEach((row, i) => {
	            i = Level.tileCount.y - i - 1;
	            for (let j = 0; j < Math.min(row.length, Level.tileCount.x); ++j) {
	                let type = parts_1.Parts.charParts.get(row.charAt(j));
	                this.tiles.set(point.set(j, i), type || parts_1.None);
	            }
	        });
	        return this;
	    }
	    encode() {
	        let point = new three_1.Vector2();
	        let rows = [];
	        for (let i = Level.tileCount.y - 1; i >= 0; --i) {
	            let row = [];
	            for (let j = 0; j < Level.tileCount.x; ++j) {
	                let type = this.tiles.get(point.set(j, i));
	                row.push(type.char || '?');
	            }
	            rows.push(row.join(''));
	        }
	        let raw = Object.assign({ tiles: rows.join('\n') }, Raw.encodeMeta(this));
	        return raw;
	    }
	    equals(other) {
	        for (let i = 0; i < this.tiles.items.length; ++i) {
	            if (this.tiles.items[i] != other.tiles.items[i]) {
	                return false;
	            }
	        }
	        return true;
	    }
	    load(id) {
	        try {
	            super.load(id);
	        }
	        catch (e) {
	            // TODO Is this catch really a good idea?
	            this.tiles.items.fill(parts_1.None);
	        }
	        // For convenience.
	        return this;
	    }
	    // For use from the editor.
	    updateStage(game, reset = false) {
	        let play = game.mode instanceof _1.PlayMode;
	        let stage = game.stage;
	        let theme = game.theme;
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
	        for (let j = 0, k = 0; j < Level.tileCount.x; ++j) {
	            for (let i = 0; i < Level.tileCount.y; ++i, ++k) {
	                let tile = this.tiles.items[k];
	                // Handle enders for play mode.
	                if (play && tile.ender) {
	                    // TODO Need a time for transition animation?
	                    let options = Object.assign({}, tile.options);
	                    for (let key in tile.options) {
	                        options[key] = tile[key];
	                    }
	                    options.ender = false;
	                    tile = stage.ending ? parts_1.Parts.optionType(tile, options) : parts_1.None;
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
	                    part.point.set(j, i).multiply(Level.tileSize);
	                    stage.parts[k] = part;
	                    if (oldPart) {
	                        stage.removed(oldPart);
	                    }
	                    stage.added(part);
	                }
	                else {
	                    part = oldPart;
	                }
	                if (part instanceof parts_1.Hero) {
	                    stage.hero = part;
	                }
	                else if (part instanceof parts_1.Treasure) {
	                    ++stage.treasureCount;
	                }
	            }
	        }
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
	Level.tileCount = new three_1.Vector2(40, 20);
	Level.tileSize = new three_1.Vector2(8, 10);
	Level.pixelCount = Level.tileCount.clone().multiply(Level.tileSize);
	exports.Level = Level;


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(1);
	const three_1 = __webpack_require__(2);
	var Edge;
	(function (Edge) {
	    Edge[Edge["all"] = 0] = "all";
	    Edge[Edge["bottom"] = 1] = "bottom";
	    Edge[Edge["left"] = 2] = "left";
	    Edge[Edge["right"] = 3] = "right";
	    Edge[Edge["top"] = 4] = "top";
	})(Edge = exports.Edge || (exports.Edge = {}));
	class Part {
	    constructor(game) {
	        this.art = undefined;
	        this.carried = false;
	        this.dead = false;
	        // A way of drawing attention.
	        this.keyTime = -10;
	        this.move = new three_1.Vector2();
	        this.moved = new three_1.Vector2();
	        this.phaseBeginPoint = new three_1.Vector2();
	        this.phaseBeginTime = 0;
	        this.phaseEndPoint = new three_1.Vector2();
	        this.phaseEndTime = 0;
	        this.point = new three_1.Vector2();
	        this.workPoint = new three_1.Vector2();
	        this.game = game;
	    }
	    static get base() {
	        return this;
	    }
	    static get common() {
	        return this;
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
	        return (point.x >= x && point.x < x + _1.Level.tileSize.x &&
	            point.y >= y && point.y < y + _1.Level.tileSize.y);
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
	        return true;
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
	    surface(other, seems) {
	        return false;
	    }
	    touchKills(other) {
	        return this.solid(other);
	    }
	    get type() {
	        return this.constructor;
	    }
	    update() { }
	    // State that can be updated on stage init.
	    updateInfo() { }
	}
	Part.ender = false;
	Part.invisible = false;
	Part.options = {
	    ender: true,
	    invisible: true,
	};
	exports.Part = Part;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(3);
	const _2 = __webpack_require__(1);
	class Bar extends _2.Part {
	    catches(part) {
	        return part instanceof _1.Runner;
	    }
	}
	Bar.char = '-';
	exports.Bar = Bar;


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(3);
	const _2 = __webpack_require__(1);
	const three_1 = __webpack_require__(2);
	class Biggie extends _1.Runner {
	    constructor() {
	        super(...arguments);
	        this.action = new _2.RunnerAction();
	        this.climber = false;
	        this.facing = 0;
	        this.hold = false;
	        this.lastTurn = 0;
	        this.speed = new three_1.Vector2(0.3, 0.7);
	        this.workPoint2 = new three_1.Vector2();
	    }
	    checkTurn() {
	        if (this.moved.y) {
	            // No turn while falling.
	            return;
	        }
	        let x = this.facing < 0 ? _1.TilePos.midLeft : _1.TilePos.midRight;
	        let ahead = this.partAt(x, -1, part => part.surface(this) || part.solid(this, _2.Edge.top, true));
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
	            let edge = this.facing < 0 ? _2.Edge.right : _2.Edge.left;
	            let wall = this.partAt(x, 0, part => part.solid(this, edge, true));
	            if (wall) {
	                ahead = undefined;
	                break checkMore;
	            }
	            // Inside edges are opposite outside.
	            edge = this.facing < 0 ? _2.Edge.left : _2.Edge.right;
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
	        return other instanceof Biggie && !!edge;
	    }
	    surface(other) {
	        return !(other instanceof _1.Enemy);
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
	exports.Biggie = Biggie;
	class BiggieLeft extends Biggie {
	    constructor() {
	        super(...arguments);
	        this.facing = -1;
	    }
	}
	// The inside of the bracket faces forward to represent the head and foot or
	// tread facing forward.
	BiggieLeft.char = ']';
	exports.BiggieLeft = BiggieLeft;
	class BiggieRight extends Biggie {
	    constructor() {
	        super(...arguments);
	        this.facing = 1;
	    }
	}
	BiggieRight.char = '[';
	exports.BiggieRight = BiggieRight;


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(1);
	const parts_1 = __webpack_require__(3);
	class Brick extends _1.Part {
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
	        return this.burned && part instanceof parts_1.Enemy;
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
	        let treasureAbove = this.partAt(4, 11, part => part instanceof parts_1.Treasure || part.solid(hero));
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
	        if (this.burned && other instanceof parts_1.Enemy) {
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
	    surface(other, seems) {
	        return seems ? true : !this.burned;
	    }
	}
	Brick.char = 'B';
	exports.Brick = Brick;
	let totalGoneTime = 5;


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(3);
	const _2 = __webpack_require__(1);
	const three_1 = __webpack_require__(2);
	class Enemy extends _1.Runner {
	    constructor() {
	        super(...arguments);
	        this.action = new _2.RunnerAction();
	        this.catcher = undefined;
	        this.caughtTime = 0;
	        this.dazed = false;
	        this.lastWander = new three_1.Vector2(1, 1);
	        this.prize = undefined;
	        // TODO They still get stuck when clumped in hordes after making this
	        // TODO non-integer.
	        // TODO Fix this sometime.
	        this.speed = new three_1.Vector2(0.7, 0.7);
	        this.state = { x: State.chase, y: State.chase };
	        this.waitPoint = new three_1.Vector2();
	        this.waitPointHero = new three_1.Vector2();
	        this.waitTime = new three_1.Vector2();
	        this.workPoint2 = new three_1.Vector2();
	    }
	    avoidBottomless() {
	        // Level design can still let enemies fall into steel traps or whatever, but
	        // avoiding pits lets us more easily design floating island levels, which
	        // seem cool at the moment.
	        let { action, point: { y: myY } } = this;
	        // Clear dangerous choices.
	        if (action.down && (this.bottomlessAt(_1.TilePos.midLeft, -1) ||
	            this.bottomlessAt(_1.TilePos.midRight, -1))) {
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
	                else if (diff.y) {
	                    if (diff.y < 0) {
	                        // Don't try to go down if we can't.
	                        // The problem is that if we're on a ladder with a solid at
	                        // bottom, it still tries to go down instead of left or right.
	                        let solidSurface = this.getSurface(part => part.solid(this, _2.Edge.top, true), true);
	                        if (solidSurface) {
	                            // Well, also see if we have a climbable here.
	                            // The problem is if we have imperfect alignment with a ladder
	                            // between solids.
	                            // TODO Reusing calculations from action processing or physics
	                            // TODO could be nice.
	                            let climbable = (x) => this.partAt(x, -1, part => part.climbable(this));
	                            if (climbable(_1.TilePos.midLeft) || climbable(_1.TilePos.midRight)) {
	                                // Let climbable trump.
	                                solidSurface = undefined;
	                            }
	                        }
	                        if (!solidSurface) {
	                            action.down = true;
	                        }
	                    }
	                    else {
	                        let ceiling = this.getSolid(_2.Edge.bottom, _1.TilePos.midLeft, 10, true) ||
	                            this.getSolid(_2.Edge.bottom, _1.TilePos.midRight, 10, true);
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
	                if (!heroHidden && (waitDiff >= _2.Level.tileSize.x || waitDiffHero >= _2.Level.tileSize.y)) {
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
	                    let isComrade = (part) => part instanceof Enemy && !part.catcher && !part.dead;
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
	                if (!heroHidden && (waitDiff >= _2.Level.tileSize.y || waitDiffHero >= _2.Level.tileSize.x)) {
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
	            let edge = action.left ? _2.Edge.right : _2.Edge.left;
	            let wall = this.partAt(x, 0, part => part.solid(this, edge, true));
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
	            this.partAt(_1.TilePos.right, 0, isCatcher) ||
	            this.partAt(_1.TilePos.right, -1, isCatcher));
	    }
	    get keyTime() {
	        // Indicate when holding a prize.
	        return this.prize ? this.game.stage.time : -10;
	    }
	    set keyTime(value) {
	        // Ignore.
	    }
	    getOther(x, y) {
	        let isEnemy = (part) => part instanceof Enemy && part != this && !part.dead;
	        return this.partAt(x, y, isEnemy);
	    }
	    releaseTreasure() {
	        let { prize } = this;
	        if (prize) {
	            if (prize instanceof _1.Bonus) {
	                this.speed.divideScalar(1.5);
	            }
	            this.prize = undefined;
	            prize.owner = undefined;
	            prize.point.copy(this.point);
	            // Place it above.
	            // TODO Only above if center in brick! Otherwise go to center!
	            if (this.partAt(4, 5, part => part instanceof _1.Brick)) {
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
	        return other instanceof Enemy && !other.dead && !!edge;
	    }
	    surface(other) {
	        return other instanceof Enemy || other instanceof _1.Hero;
	    }
	    take(prize) {
	        if (this.dead || this.prize) {
	            return false;
	        }
	        else {
	            this.prize = prize;
	            if (prize instanceof _1.Bonus) {
	                this.speed.multiplyScalar(1.5);
	            }
	            return true;
	        }
	    }
	    update() {
	        let catcher = this.getCatcher();
	        if (catcher instanceof _1.Brick &&
	            // Require alignment in case of horizontal entry.
	            Math.abs(this.point.x - catcher.point.x) < 1) {
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
	            if (this.catcher instanceof _1.Brick && !this.catcher.burned) {
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
	Enemy.char = 'e';
	exports.Enemy = Enemy;
	var State;
	(function (State) {
	    State[State["chase"] = 0] = "chase";
	    State[State["wanderNeg"] = 1] = "wanderNeg";
	    State[State["wanderPos"] = 2] = "wanderPos";
	    State[State["wait"] = 3] = "wait";
	})(State || (State = {}));
	let closeTime = 2;


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(3);
	const _2 = __webpack_require__(1);
	class Energy extends _2.Part {
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
	exports.Energy = Energy;
	class EnergyOff extends Energy {
	}
	EnergyOff.char = 'o';
	EnergyOff.defaultOn = false;
	exports.EnergyOff = EnergyOff;
	class Latch extends _2.Part {
	    constructor() {
	        super(...arguments);
	        this.changeTime = NaN;
	        this.facing = 0;
	        this.heroWasNear = false;
	        this.lastHeroSide = 0;
	    }
	    die(part) {
	        super.die();
	        if (part instanceof _1.Shot) {
	            let facing = part.gun.facing;
	            if (facing != this.facing) {
	                this.flip(facing);
	            }
	        }
	    }
	    flip(facing) {
	        let { stage } = this.game;
	        this.changeTime = stage.time;
	        this.facing = facing;
	        stage.energyOn = !stage.energyOn;
	    }
	    get shotKillable() {
	        return true;
	    }
	    get shootable() {
	        return true;
	    }
	    update() {
	        let { heroWasNear, workPoint } = this;
	        let { hero } = this.game.stage;
	        if (!hero) {
	            return;
	        }
	        // See if the hero overlaps our middle.
	        workPoint.set(4, 5).add(this.point);
	        if (hero.contains(workPoint)) {
	            // If so, check for center crossings.
	            let heroSide = Math.sign(hero.point.x - this.point.x);
	            if (heroWasNear && heroSide && heroSide != this.lastHeroSide) {
	                if (heroSide == -this.facing) {
	                    this.flip(heroSide);
	                }
	            }
	            this.lastHeroSide = heroSide;
	            this.heroWasNear = true;
	        }
	        else {
	            this.heroWasNear = false;
	        }
	    }
	}
	exports.Latch = Latch;
	class LatchLeft extends Latch {
	    constructor() {
	        super(...arguments);
	        this.facing = -1;
	    }
	}
	LatchLeft.char = '\\';
	exports.LatchLeft = LatchLeft;
	class LatchRight extends Latch {
	    constructor() {
	        super(...arguments);
	        this.facing = 1;
	    }
	}
	LatchRight.char = '/';
	exports.LatchRight = LatchRight;


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(3);
	const _2 = __webpack_require__(1);
	const three_1 = __webpack_require__(2);
	class Gun extends _1.Runner {
	    constructor(game) {
	        super(game);
	        // Never moves anywhere by choice, but eh.
	        this.action = new _2.RunnerAction();
	        this.carried = true;
	        this.facing = 0;
	        this.lastSupport = undefined;
	        this.lastSupportFacing = 0;
	        this.speed = new three_1.Vector2(0.7, 0.7);
	        this.shot = new Shot(game, this);
	    }
	    carriedMove(x) {
	        let { lastSupport, support } = this;
	        if (support == lastSupport &&
	            (support instanceof _1.Biggie || support instanceof Gun)) {
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
	        workPoint.set(4, 5).add(point);
	        let step = this.facing * 8;
	        while (workPoint.x > -10 && workPoint.x < 330) {
	            workPoint.x += step;
	            if (hero.contains(workPoint)) {
	                return true;
	            }
	            if (stage.partAt(workPoint, part => part.solid(this))) {
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
	        return other instanceof Gun;
	    }
	    update() {
	        super.update();
	        let { shot } = this;
	        let { stage } = this.game;
	        if (this.dead) {
	            return;
	        }
	        if (!shot.active && this.heroVisible()) {
	            if (!shot.art) {
	                this.game.theme.buildArt(shot);
	            }
	            shot.facing = this.facing;
	            shot.active = true;
	            shot.point.copy(this.point);
	            stage.particles.push(shot);
	            stage.added(shot);
	        }
	    }
	}
	exports.Gun = Gun;
	class GunLeft extends Gun {
	    constructor() {
	        super(...arguments);
	        this.facing = -1;
	    }
	}
	GunLeft.char = '{';
	exports.GunLeft = GunLeft;
	class GunRight extends Gun {
	    constructor() {
	        super(...arguments);
	        this.facing = 1;
	    }
	}
	GunRight.char = '}';
	exports.GunRight = GunRight;
	class Shot extends _2.Part {
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
	        oldPoint.copy(this.point);
	        this.point.x += 1.5 * facing;
	        stage.moved(this, oldPoint);
	        if (this.point.x < -10 || this.point.x > _2.Level.pixelCount.x + 10) {
	            this.active = false;
	        }
	        // Check for hits.
	        // Only after really leaving the gun.
	        if (this.partAt(4, 5, part => part == gun)) {
	            return;
	        }
	        let parts = stage.partsNear(workPoint.set(4, 5).add(this.point));
	        if (!parts) {
	            return;
	        }
	        let hit = undefined;
	        for (let part of parts) {
	            if (part != gun && part != this && part.shootable && !part.dead &&
	                part.contains(workPoint)) {
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
	exports.Shot = Shot;
	let oldPoint = new three_1.Vector2();
	let workPoint = new three_1.Vector2();


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(3);
	const _2 = __webpack_require__(1);
	const three_1 = __webpack_require__(2);
	class Hero extends _1.Runner {
	    constructor() {
	        super(...arguments);
	        this.action = new _2.RunnerAction();
	        this.actionChange = new _2.RunnerAction();
	        // Separate speed vs see bonus.
	        this.bonusSee = undefined;
	        // Separate speed vs see bonus.
	        this.bonusSpeed = undefined;
	        this.carried = true;
	        this.fastEnd = -10;
	        this.speed = new three_1.Vector2(1, 1);
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
	            if (type == Hero && index != placedIndex) {
	                let editState = game.edit.editState;
	                let last = editState.history[editState.historyIndex].tiles.items[index];
	                game.level.tiles.items[index] = last == Hero ? _1.None : last;
	            }
	        });
	    }
	    take(prize) {
	        if (prize instanceof _1.Treasure) {
	            this.treasureCount += 1;
	            if (this.treasureCount == this.game.stage.treasureCount) {
	                this.game.stage.ending = true;
	                this.game.level.updateStage(this.game);
	            }
	        }
	        else if (prize instanceof _1.Bonus) {
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
	        // Update everything.
	        super.update();
	        if (!this.game.stage.ended) {
	            // See if we won or lost.
	            let { point: { y } } = this;
	            if (y <= -10) {
	                this.die();
	            }
	            if (this.game.stage.ending && y >= _2.Level.pixelCount.y) {
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
	Hero.char = 'R';
	Hero.options = {
	    ender: false,
	    invisible: false,
	};
	exports.Hero = Hero;


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(1);
	class Ladder extends _1.Part {
	    climbable() {
	        return true;
	    }
	    surface() {
	        return true;
	    }
	}
	Ladder.char = 'H';
	exports.Ladder = Ladder;


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(1);
	const parts_1 = __webpack_require__(3);
	const three_1 = __webpack_require__(2);
	class Launcher extends _1.Part {
	    static get common() {
	        return Launcher;
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
	        checkPoint.copy(_1.Level.tileSize).multiplyScalar(0.5).add(this.point);
	        // Step by tiles.
	        step.copy(send).multiply(_1.Level.tileSize);
	        let energy = undefined;
	        let target = undefined;
	        let { stage } = this.game;
	        while (!target) {
	            checkPoint.add(step);
	            if (this.outside(checkPoint)) {
	                // Also end loop if we leave the stage.
	                break;
	            }
	            energy = stage.partAt(checkPoint, part => part instanceof parts_1.Energy && part.on);
	            if (energy) {
	                // No launching through energy.
	                energy.keyTime = stage.time;
	                break;
	            }
	            target = stage.partAt(checkPoint, part => part instanceof Launcher && !part.dead);
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
	exports.Launcher = Launcher;
	class LauncherCenter extends Launcher {
	    static checkAction(hero) {
	        return false;
	    }
	}
	LauncherCenter.char = '@';
	LauncherCenter.send = new three_1.Vector2();
	exports.LauncherCenter = LauncherCenter;
	class LauncherDown extends Launcher {
	    static checkAction(hero) {
	        return hero.action.down && hero.actionChange.down;
	    }
	    outside(point) {
	        return point.y < 0;
	    }
	    solid(other, edge) {
	        return edge == _1.Edge.bottom && !this.dead;
	    }
	}
	LauncherDown.char = 'v';
	LauncherDown.send = new three_1.Vector2(0, -1);
	exports.LauncherDown = LauncherDown;
	class LauncherLeft extends Launcher {
	    static checkAction(hero) {
	        return hero.action.left && hero.actionChange.left;
	    }
	    outside(point) {
	        return point.x < 0;
	    }
	    solid(other, edge) {
	        return edge == _1.Edge.left && !this.dead;
	    }
	}
	LauncherLeft.char = '<';
	LauncherLeft.send = new three_1.Vector2(-1, 0);
	exports.LauncherLeft = LauncherLeft;
	class LauncherRight extends Launcher {
	    static checkAction(hero) {
	        return hero.action.right && hero.actionChange.right;
	    }
	    outside(point) {
	        return point.x > _1.Level.pixelCount.x;
	    }
	    solid(other, edge) {
	        return edge == _1.Edge.right && !this.dead;
	    }
	}
	LauncherRight.char = '>';
	LauncherRight.send = new three_1.Vector2(1, 0);
	exports.LauncherRight = LauncherRight;
	class LauncherUp extends Launcher {
	    static checkAction(hero) {
	        return hero.action.up && hero.actionChange.up;
	    }
	    outside(point) {
	        return point.y > _1.Level.pixelCount.y;
	    }
	    solid(other, edge) {
	        return edge == _1.Edge.top && !this.dead;
	    }
	}
	LauncherUp.char = '^';
	LauncherUp.send = new three_1.Vector2(0, 1);
	exports.LauncherUp = LauncherUp;
	let checkPoint = new three_1.Vector2();
	let step = new three_1.Vector2();


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(1);
	class None extends _1.Part {
	    get exists() {
	        return false;
	    }
	}
	None.char = ' ';
	None.options = {
	    ender: false,
	    invisible: false,
	};
	exports.None = None;


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(3);
	const _2 = __webpack_require__(1);
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
	        char |= options.ender ? 0x80 : 0x00;
	        char |= options.invisible ? 0x100 : 0x00;
	        if (char == 0xAD) {
	            // Because 0xAD isn't visible, and they're nice to see, at least.
	            char = 0xFF;
	        }
	        return String.fromCodePoint(char);
	    }
	}
	Parts.inventory = [
	    _1.Bar,
	    _1.BiggieLeft,
	    _1.BiggieRight,
	    _1.Bonus,
	    _1.Brick,
	    _1.Enemy,
	    _1.Energy,
	    _1.EnergyOff,
	    _1.GunLeft,
	    _1.GunRight,
	    _1.Hero,
	    _1.Ladder,
	    _1.LatchLeft,
	    _1.LatchRight,
	    _1.LauncherCenter,
	    _1.LauncherDown,
	    _1.LauncherLeft,
	    _1.LauncherRight,
	    _1.LauncherUp,
	    _1.None,
	    _1.Spawn,
	    _1.Steel,
	    _1.Treasure,
	];
	Parts.charParts = new Map(Parts.inventory.map(part => [part.char, part]));
	exports.Parts = Parts;
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
	    let allOptions = _2.cartesianProduct(options).slice(1);
	    allOptions.forEach(option => {
	        let char = Parts.typeChar(part, option);
	        class OptionPart extends part {
	            static get base() {
	                return part;
	            }
	        }
	        OptionPart.char = char;
	        // TODO Are the following TODOs still relevant?
	        // TODO `make` that attends to edit or play mode for ender or base?
	        // TODO Or just reference game dynamically in parts?
	        OptionPart.ender = option.ender;
	        OptionPart.invisible = option.invisible;
	        // Add it to things.
	        Parts.inventory.push(OptionPart);
	        Parts.charParts.set(char, OptionPart);
	        // console.log(
	        //   part.char, OptionPart.char, OptionPart.ender, OptionPart.invisible,
	        //   Object.getPrototypeOf(OptionPart).name
	        // );
	    });
	});


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(1);
	const three_1 = __webpack_require__(2);
	class Runner extends _1.Part {
	    constructor() {
	        super(...arguments);
	        this.align = new three_1.Vector2();
	        this.climber = true;
	        this.climbing = false;
	        this.oldCatcher = undefined;
	        this.oldPoint = new three_1.Vector2();
	        this.intendedMove = new three_1.Vector2();
	        this.seesInvisible = false;
	        this.support = undefined;
	        // Move some of these to module global. We're sync, right?
	        this.workPointExtra = new three_1.Vector2();
	    }
	    carriedMove(x) { }
	    encased() {
	        let touchKills = (part) => part.touchKills(this) && part != this;
	        return (this.partsAt(0, 0).some(touchKills) ||
	            this.partsAt(0, top).some(touchKills) ||
	            this.partsAt(right, 0).some(touchKills) ||
	            this.partsAt(right, top).some(touchKills));
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
	        let part1 = check(3, top);
	        let part2 = check(midRight, top);
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
	            climbableAt(midLeft, top) || climbableAt(midRight, top));
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
	            this.getClimbable(this.partsNear(3, top), this.partsNear(midRight, top));
	        this.climbing = !!inClimbable;
	        // Keep the support the highest thing.
	        let climbable = inClimbable || this.getClimbable(leftParts, rightParts);
	        if (!this.climber) {
	            this.climbing = false;
	            climbable = undefined;
	        }
	        if (climbable && (!support || support.point.y < climbable.point.y)) {
	            support = climbable;
	        }
	        if (this.encased()) {
	            // This could happen if a brick just enclosed on part of us.
	            this.die();
	        }
	        else if (support) {
	            // Prioritize vertical for enemy ai reasons, also because rarer options.
	            // TODO Remember old move options to allow easier transition?
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
	        else {
	            move.y = -1;
	        }
	        // Align non-moving direction.
	        // TODO Make this actually change the move. Nix the align var.
	        // TODO Except when all on same climbable or none?
	        // TODO No! Make align only when both allowed and needed for movement!!!!!
	        align.setScalar(0);
	        // Prioritize y because y move options are rarer.
	        if (move.y) {
	            if (climbable) {
	                // Generalize alignment to whatever provides passage.
	                align.x = Math.sign(climbable.point.x - point.x);
	            }
	            else if (move.y < 0) {
	                align.x = this.findAlign(_1.Edge.top, leftParts, rightParts);
	            }
	            else if (move.y > 0) {
	                align.x = this.findAlign(_1.Edge.bottom, this.partsNear(3, 10), this.partsNear(midRight, 10));
	            }
	        }
	        else if (move.x < 0) {
	            align.y = this.findAlign(_1.Edge.right, this.partsNear(-1, 4), this.partsNear(-1, midTop));
	        }
	        else if (move.x > 0) {
	            align.y = this.findAlign(_1.Edge.left, this.partsNear(8, 4), this.partsNear(8, midTop));
	        }
	        move.multiply(speed);
	        this.oldCatcher = oldCatcher;
	        this.support = support;
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
	            if (support.move.y <= 0) {
	                let gap = support.point.y + _1.Level.tileSize.y - point.y;
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
	        // TODO Align only when forced or to enable movement, not just for grid.
	        // TODO Defer this until first pass of all moving parts so we can resolve
	        // TODO together?
	        if (!align.x) {
	            // See if we need to align x for solids.
	            // TODO If openings partially above or below, move and align y!
	            if (move.x < 0) {
	                let blocker1 = this.getSolid(_1.Edge.right, 0, 0);
	                let blocker2 = this.getSolid(_1.Edge.right, 0, top);
	                let blockX = (blocker) => blocker ? blocker.point.x : -_1.Level.tileSize.x;
	                if (blocker1 || blocker2) {
	                    let x = Math.max(blockX(blocker1), blockX(blocker2));
	                    point.x = x + _1.Level.tileSize.x;
	                }
	                else {
	                    blocker1 = this.getSolidInside(_1.Edge.left, 0, 0, move.x, 0);
	                    blocker2 = this.getSolidInside(_1.Edge.left, 0, top, move.x, 0);
	                    if (blocker1 || blocker2) {
	                        let x = Math.max(blockX(blocker1), blockX(blocker2));
	                        point.x = x;
	                    }
	                }
	            }
	            else if (move.x > 0) {
	                let blocker1 = this.getSolid(_1.Edge.left, right, 0);
	                let blocker2 = this.getSolid(_1.Edge.left, right, top);
	                let blockX = (blocker) => blocker ? blocker.point.x : _1.Level.pixelCount.x;
	                if (blocker1 || blocker2) {
	                    let x = Math.min(blockX(blocker1), blockX(blocker2));
	                    point.x = x - _1.Level.tileSize.x;
	                }
	                else {
	                    blocker1 = this.getSolidInside(_1.Edge.right, right, 0, move.x, 0);
	                    blocker2 = this.getSolidInside(_1.Edge.right, right, top, move.x, 0);
	                    if (blocker1 || blocker2) {
	                        let x = Math.min(blockX(blocker1), blockX(blocker2));
	                        point.x = x;
	                    }
	                }
	            }
	        }
	        if (!align.y) {
	            // See if we need to align y for solids.
	            if (move.y < 0) {
	                // Surface checks halfway, but solid checks ends.
	                // This seems odd, but it usually shouldn't matter, since alignment to
	                // open spaces should make them equivalent.
	                // I'm not sure if there are times when it will matter, but it's hard to
	                // say in those cases what to do anyway.
	                let newSupport = support ? undefined : this.getSurface();
	                let blocker1 = this.getSolid(_1.Edge.top, 0, 0);
	                let blocker2 = this.getSolid(_1.Edge.top, right, 0);
	                let blockY = (blocker) => blocker ? blocker.point.y : -_1.Level.tileSize.y;
	                if (newSupport || blocker1 || blocker2) {
	                    let y = Math.max(blockY(newSupport), blockY(blocker1), blockY(blocker2));
	                    point.y = y + _1.Level.tileSize.y;
	                }
	                else {
	                    // TODO Unify catcher and inside bottom solids at all?
	                    blocker1 = this.getSolidInside(_1.Edge.bottom, 0, 0, 0, move.y);
	                    blocker2 = this.getSolidInside(_1.Edge.bottom, right, 0, 0, move.y);
	                    if (blocker1 || blocker2) {
	                        let y = Math.max(blockY(blocker1), blockY(blocker2));
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
	                let blocker1 = this.getSolid(_1.Edge.bottom, 0, top);
	                let blocker2 = this.getSolid(_1.Edge.bottom, right, top);
	                let blockY = (blocker) => blocker ? blocker.point.y : _1.Level.pixelCount.y;
	                if (blocker1 || blocker2) {
	                    let y = Math.min(blockY(blocker1), blockY(blocker2));
	                    point.y = y - _1.Level.tileSize.y;
	                }
	                else {
	                    blocker1 = this.getSolidInside(_1.Edge.top, 0, top, 0, move.y);
	                    blocker2 = this.getSolidInside(_1.Edge.top, right, top, 0, move.y);
	                    if (blocker1 || blocker2) {
	                        let y = Math.min(blockY(blocker1), blockY(blocker2));
	                        point.y = y;
	                    }
	                }
	            }
	        }
	        // TODO Align to blocker, not grid!!!
	        if (align.x) {
	            let offset = align.x < 0 ? 3 : midRight;
	            point.x =
	                _1.Level.tileSize.x * Math.floor((point.x + offset) / _1.Level.tileSize.x);
	        }
	        if (align.y) {
	            let offset = align.y < 0 ? 4 : midTop;
	            point.y =
	                _1.Level.tileSize.y * Math.floor((point.y + offset) / _1.Level.tileSize.y);
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
	                workPoint.set(j, i).addScalar(0.5).multiply(_1.Level.tileSize);
	                let invisible = this.partAt(workPoint.x, workPoint.y, part => part.type.invisible);
	                if (invisible) {
	                    this.seesInvisible = true;
	                    break;
	                }
	            }
	        }
	    }
	}
	Runner.options = {
	    ender: true,
	    invisible: false,
	};
	exports.Runner = Runner;
	let epsilon = 1e-2;
	exports.TilePos = {
	    bottom: epsilon,
	    left: epsilon,
	    midBottom: 4 + epsilon,
	    midLeft: 3 + epsilon,
	    midRight: 5 - epsilon,
	    midTop: 6 - epsilon,
	    right: 8 - epsilon,
	    top: 10 - epsilon,
	};
	let { midBottom, midLeft, midRight, midTop, right, top } = exports.TilePos;
	let workPoint = new three_1.Vector2();


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(3);
	const _2 = __webpack_require__(1);
	class Spawn extends _2.Part {
	    constructor() {
	        super(...arguments);
	        this.spawnItems = new Array();
	    }
	    static respawnMaybe(part) {
	        if (!(part instanceof _1.Enemy)) {
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
	            choice.queueSpawn(new _1.Enemy(part.game));
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
	Spawn.char = 'M';
	exports.Spawn = Spawn;


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(1);
	class Steel extends _1.Part {
	    solid(other, edge) {
	        return true;
	    }
	    surface() {
	        return true;
	    }
	}
	Steel.char = '#';
	exports.Steel = Steel;


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(3);
	const _2 = __webpack_require__(1);
	class Prize extends _2.Part {
	    constructor() {
	        super(...arguments);
	        this.owner = undefined;
	    }
	    update() {
	        if (!this.owner) {
	            let runner = this.partAt(4, 5, part => part instanceof _1.Runner && !part.dead);
	            if (runner && runner.take(this)) {
	                this.owner = runner;
	            }
	        }
	    }
	}
	exports.Prize = Prize;
	class Bonus extends Prize {
	    constructor() {
	        super(...arguments);
	        this.bonusEnd = 0;
	    }
	}
	// Time is money, eh?
	Bonus.char = '$';
	exports.Bonus = Bonus;
	class Treasure extends Prize {
	}
	Treasure.char = '*';
	Treasure.options = {
	    ender: false,
	    invisible: true,
	};
	exports.Treasure = Treasure;


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(1);
	const ui_1 = __webpack_require__(5);
	class PlayMode extends _1.Mode {
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
	        this.game.play.starting = true;
	        this.won = false;
	        // Sometimes things get confused, and clearing the action might help.
	        // We can't directly read keyboard state.
	        this.game.control.clear();
	        this.game.control.keyAction.clear();
	    }
	    fail() {
	        this.game.stage.ended = true;
	        this.showReport('Maybe next time.');
	    }
	    onHideDialog(dialog) {
	        if (dialog instanceof ui_1.Report) {
	            this.startNextOrRestart();
	        }
	    }
	    showReport(message) {
	        this.game.showDialog(new ui_1.Report(this.game, message));
	    }
	    startNextOrRestart() {
	        let { game } = this;
	        // If we won, get the next level ready.
	        if (this.won) {
	            let tower = new _1.Tower().load(game.tower.id);
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
	    win() {
	        this.won = true;
	        this.game.stage.ended = true;
	        this.showReport('Level complete!');
	    }
	}
	exports.PlayMode = PlayMode;
	class TestMode extends PlayMode {
	    // TODO Different end-level handling and/or keyboard handling.
	    // TODO Probably different bodyClass, too.
	    onKeyDown(key) {
	        switch (key) {
	            case 'Enter':
	            case 'Escape': {
	                this.game.setMode(this.game.edit);
	                break;
	            }
	        }
	    }
	    onHideDialog(dialog) {
	        if (dialog instanceof ui_1.Report) {
	            this.game.setMode(this.game.edit);
	        }
	    }
	}
	exports.TestMode = TestMode;


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(1);
	const parts_1 = __webpack_require__(3);
	const three_1 = __webpack_require__(2);
	class Stage {
	    constructor(game) {
	        this.edgeLeft = new Array();
	        this.edgeRight = new Array();
	        this.ended = false;
	        this.ending = false;
	        this.energyOn = true;
	        // Collision grid.
	        this.grid = new _1.Grid(_1.Level.tileCount);
	        this.hero = undefined;
	        this.spawns = new Array();
	        // These particles are short-lived but relevant to game state.
	        // Other particles might exist only in the visual theme.
	        this.particles = new _1.Group();
	        // During level editing, these corresponding exactly to level tile indices.
	        // This can include nones.
	        // While that's somewhat wasteful, as most levels will be fairly sparse, we
	        // have to be able to support full levels, too, and if we don't have to be
	        // inserting and deleting all the time, life will be easier.
	        // Of course, we can skip the nones when building for actual play, if we want.
	        this.parts = new Array(_1.Level.tileCount.x * _1.Level.tileCount.y);
	        // Time in seconds since play start.
	        this.time = 0;
	        this.treasureCount = 0;
	        // Cached for use.
	        this.workPoint = new three_1.Vector2();
	        this.workPoint2 = new three_1.Vector2();
	        this.game = game;
	        // Init grid.
	        let gridPoint = new three_1.Vector2();
	        for (let j = 0; j < _1.Level.tileCount.x; ++j) {
	            for (let i = 0; i < _1.Level.tileCount.y; ++i) {
	                gridPoint.set(j, i);
	                this.grid.set(gridPoint, new Array());
	            }
	        }
	        // Fake steel at edges to block exit.
	        // Let each steel block have the right point, though we could maybe ignore
	        // position and hack a singleton.
	        let makeSteel = (j, i) => {
	            let steel = new parts_1.Steel(game);
	            steel.point.copy(this.workPoint.set(j, i).multiply(_1.Level.tileSize));
	            return [steel];
	        };
	        for (let i = 0; i < _1.Level.tileCount.y; ++i) {
	            this.edgeLeft.push(makeSteel(-1, i));
	            this.edgeRight.push(makeSteel(_1.Level.tileCount.x, i));
	        }
	    }
	    added(part) {
	        // Add to all overlapping grid lists.
	        let { grid, workPoint } = this;
	        this.walkGrid(part.point, () => {
	            grid.get(workPoint).push(part);
	        });
	        if (part instanceof parts_1.Spawn) {
	            this.spawns.push(part);
	        }
	    }
	    clearGrid() {
	        this.grid.items.forEach(items => items.length = 0);
	    }
	    died(part) {
	        parts_1.Spawn.respawnMaybe(part);
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
	        workPoint.copy(oldPoint).divide(_1.Level.tileSize);
	        workPoint2.copy(part.point).divide(_1.Level.tileSize);
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
	        workPoint.copy(point).divide(_1.Level.tileSize).floor();
	        let parts = grid.get(workPoint);
	        if (!parts) {
	            // Give the edges a shot.
	            // We don't have a way to get past edges, so presume we're within one grid
	            // position of the edge horizontally.
	            if (point.x < 0) {
	                parts = this.edgeLeft[workPoint.y];
	            }
	            else if (point.x >= _1.Level.tileCount.x) {
	                parts = this.edgeRight[workPoint.y];
	            }
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
	        if (part instanceof parts_1.Spawn) {
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
	            part.choose();
	        }
	        // Update after choices.
	        for (let part of parts) {
	            part.update();
	        }
	    }
	    walkGrid(point, handle) {
	        let { workPoint } = this;
	        workPoint.copy(point).divide(_1.Level.tileSize);
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
	exports.Stage = Stage;


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(1);
	const parts_1 = __webpack_require__(3);
	const three_1 = __webpack_require__(2);
	class Toolbox {
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
	        if (name in _1.Part.options) {
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
	exports.Toolbox = Toolbox;
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
	exports.Tool = Tool;
	class CopyTool extends Tool {
	    constructor(edit) {
	        super(edit);
	        this.borderPixels = 0;
	        this.needsUpdate = false;
	        this.point = new three_1.Vector2();
	        this.tileBegin = new three_1.Vector2();
	        this.tileBottomRight = new three_1.Vector2();
	        this.tileTopLeft = new three_1.Vector2();
	        this.tiles = undefined;
	        this.selector = edit.game.body.querySelector('.selector');
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
	        this.selector.style.display = 'none';
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
	    end() {
	        let paste = this.edit.toolbox.container.querySelector('.paste');
	        paste.click();
	        this.selector.style.display = 'block';
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
	        point.copy(tilePoint).divide(_1.Level.tileCount);
	        point.x *= canvas.clientWidth;
	        point.y *= canvas.clientHeight;
	        return point;
	    }
	    scaledOffset(tilePoint) {
	        let { point } = this;
	        point.copy(tilePoint);
	        point.y = _1.Level.tileCount.y - point.y - 1;
	        let canvas = this.edit.game.renderer.domElement;
	        this.scaled(point);
	        point.x += canvas.offsetLeft;
	        point.y += canvas.offsetTop;
	        return point;
	    }
	    updateData() {
	        // Copy data.
	        let { edit, point, tileBottomRight, tileTopLeft } = this;
	        let { tiles: levelTiles } = edit.game.level;
	        let min = new three_1.Vector2(tileTopLeft.x, tileBottomRight.y);
	        let max = new three_1.Vector2(tileBottomRight.x, tileTopLeft.y).addScalar(1);
	        let size = new three_1.Vector2(max.x - min.x, max.y - min.y);
	        let tiles = this.tiles = new _1.Grid(size);
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
	        max.multiply(_1.Level.tileSize);
	        min.multiply(_1.Level.tileSize);
	        size.multiply(_1.Level.tileSize);
	        let image = document.createElement('canvas');
	        let target = new three_1.WebGLRenderTarget(size.x, size.y);
	        try {
	            let { camera, renderer, scene } = edit.game;
	            camera = camera.clone();
	            camera.bottom = min.y;
	            camera.left = min.x;
	            camera.right = max.x;
	            camera.top = max.y;
	            camera.updateProjectionMatrix();
	            // TODO Extract this render to canvas logic?
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
	exports.CopyTool = CopyTool;
	class NopTool extends Tool {
	    begin() { }
	    drag() { }
	}
	exports.NopTool = NopTool;
	class PartTool extends Tool {
	    constructor(edit, type) {
	        super(edit);
	        this.erasing = false;
	        this.type = type;
	    }
	    begin(tilePoint) {
	        // Figure out mode.
	        if (this.type == parts_1.None) {
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
	                type = parts_1.None;
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
	exports.PartTool = PartTool;
	class PasteTool extends Tool {
	    constructor(edit) {
	        super(edit);
	        this.clipboard = undefined;
	        this.point = new three_1.Vector2();
	        this.tileMin = new three_1.Vector2();
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
	        if (point.x >= _1.Level.tileCount.x) {
	            tileMin.x = _1.Level.tileCount.x - size.x;
	        }
	        if (point.y >= _1.Level.tileCount.y) {
	            tileMin.y = _1.Level.tileCount.y - size.y;
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
	        let size = new three_1.Vector2(domElement.width, domElement.height);
	        size.divide(_1.Level.pixelCount);
	        size.x *= image.width;
	        size.y *= image.height;
	        image.style.width = `${size.x}px`;
	        image.style.height = `${size.y}px`;
	    }
	}
	exports.PasteTool = PasteTool;


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(5);
	const _2 = __webpack_require__(1);
	class Levels extends _1.EditorList {
	    constructor(game) {
	        super(game, __webpack_require__(47));
	        this.updateNumbers();
	    }
	    addLevel() {
	        let level = new _2.Level().encode();
	        this.tower.items.push(level);
	        this.tower.save();
	        this.addItem(level);
	        this.updateNumbers();
	        // Select the new.
	        this.selectValue(level);
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
	        this.on('exclude', () => this.excludeValue());
	        this.on('save', () => this.saveTower());
	        this.on('towers', () => this.showTowers());
	    }
	    enterSelection() {
	        this.game.hideDialog();
	    }
	    excludeValue() {
	        super.excludeValue();
	        this.updateNumbers();
	    }
	    init() {
	        this.tower = new _2.Tower().load(this.game.tower.id);
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
	        this.game.showDialog(new _1.Towers(this.game));
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
	    get values() {
	        return this.tower.items;
	    }
	}
	exports.Levels = Levels;


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(1);
	class EditorList extends _1.Dialog {
	    constructor(game, templateText) {
	        super(game);
	        this.hoverValue = undefined;
	        this.game = game;
	        this.init();
	        let dialogElement = _1.load(templateText);
	        this.titleBar = dialogElement.querySelector('.title');
	        this.buildTitleBar();
	        this.itemTemplate = dialogElement.querySelector('.item');
	        this.list = this.itemTemplate.parentNode;
	        this.list.removeChild(this.itemTemplate);
	        this.values.forEach(value => this.addItem(value));
	        this.content = dialogElement;
	        window.setTimeout(() => this.scrollIntoView(), 0);
	    }
	    addItem(value) {
	        let item = this.itemTemplate.cloneNode(true);
	        if (value.id == this.outsideSelectedValue.id) {
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
	            // console.log('saving', value);
	            _1.Raw.save(value);
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
	        this.list.appendChild(item);
	    }
	    excludeValue() {
	        this.selectedValue.excluded = !this.selectedValue.excluded;
	        _1.Raw.save(this.selectedValue);
	    }
	    getButton(name) {
	        return this.titleBar.querySelector(`.${name}`);
	    }
	    getSelectedItem() {
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
	        this.getButton(name).addEventListener('click', action);
	    }
	    scrollIntoView() {
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
	        this.getSelectedItem().classList.add('selected');
	        // console.log(`selected ${value.id}`);
	    }
	}
	exports.EditorList = EditorList;


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(1);
	class Report extends _1.Dialog {
	    constructor(game, message) {
	        super(game);
	        let content = this.content = _1.load(__webpack_require__(48));
	        // Hide extras.
	        for (let row of content.querySelectorAll('.timeRow')) {
	            row.style.display = 'none';
	        }
	        // Now format.
	        // TODO Juicier animation of this and such.
	        this.field('endMessage').innerText = message;
	        // TODO Simplify out this show thing? We used to have more variance.
	        this.show('scoreTimeRow');
	        this.field('scoreTime').innerText = _1.formatTime(game.stage.time);
	    }
	    field(name) {
	        return this.content.querySelector(`.${name}`);
	    }
	    onKey(event, down) {
	        if (down && event.key == 'Enter') {
	            this.game.hideDialog();
	        }
	    }
	    show(name, display = 'table-row') {
	        this.field(name).style.display = display;
	    }
	}
	exports.Report = Report;


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const _1 = __webpack_require__(5);
	const _2 = __webpack_require__(1);
	class Towers extends _1.EditorList {
	    constructor(game) {
	        super(game, __webpack_require__(49));
	    }
	    addTower() {
	        let tower = new _2.Tower().encode();
	        let level = new _2.Level().encode();
	        _2.Raw.save(level);
	        tower.items.push(level.id);
	        _2.Raw.save(tower);
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
	        this.game.showDialog(new _1.Levels(this.game));
	    }
	    getLevel(tower) {
	        if (tower.id == this.originalTower.id) {
	            return this.originalLevel;
	        }
	        else {
	            // TODO Track the last level selected in the editor for each tower?
	            return _2.Raw.load(tower.items[0]);
	        }
	    }
	    init() {
	        this.originalLevel = this.game.level.encode();
	        this.originalTower = Object.assign({}, this.game.tower);
	        this.zone = new _2.Zone().load(this.game.zone.id);
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
	            this.game.tower = _2.loadTower(this.game.zone);
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
	exports.Towers = Towers;


/***/ },
/* 44 */
/***/ function(module, exports) {

	"use strict";
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
	exports.Grid = Grid;
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
	exports.Group = Group;
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
	exports.Ring = Ring;
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
	exports.cartesianProduct = cartesianProduct;
	function createId(byteSize = 16) {
	    let array = new Uint8Array(byteSize);
	    window.crypto.getRandomValues(array);
	    return Array.from(array).map(i => i.toString(16)).join('');
	}
	exports.createId = createId;
	function formatTime(seconds) {
	    let sign = Math.sign(seconds) < 0 ? '-' : '';
	    seconds = Math.abs(seconds);
	    // Millis.
	    let millis = seconds - Math.floor(seconds);
	    millis = Math.floor(millis * 1000);
	    // Minutes, because we shouldn't ever get to hours.
	    seconds = Math.floor(seconds);
	    let minutes = Math.floor(seconds / 60);
	    // Seconds.
	    seconds = seconds % 60;
	    // All together.
	    return `${sign}${minutes}:${padZero(seconds, 2)}.${padZero(millis, 3)}`;
	}
	exports.formatTime = formatTime;
	function load(html) {
	    let div = window.document.createElement('div');
	    div.innerHTML = html;
	    return div.firstElementChild;
	}
	exports.load = load;
	function padZero(integer, size) {
	    let result = '' + integer;
	    if (result.length < size) {
	        // Sloppy overkill.
	        result = `00000000000000000000000${result}`;
	        result = result.slice(-size);
	    }
	    return result;
	}
	exports.padZero = padZero;


/***/ },
/* 45 */,
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(6)();
	// imports
	
	
	// module
	exports.push([module.id, "body{align-content:stretch;align-items:stretch;background:#111;bottom:0;color:#fff;cursor:default;display:flex;font-family:sans-serif;left:0;margin:0;position:fixed;right:0;top:0}.clipboard{background:#000;opacity:.75;pointer-events:none;position:absolute}.clipboard canvas{image-rendering:pixelated}.commands .changing,.commands .saved{display:none}.commands .play,.commands .redo,.commands .showLevels,.status .pause{margin-bottom:.5em}[contenteditable]:focus{outline:1px solid #fff}[contenteditable]::selection{background-color:#fff;color:#000}.dialog{bottom:.5em;border:.1em solid #fff;border-radius:.2em;display:inline-block;left:25%;min-width:50%;padding:.5em;position:absolute;right:25%;text-align:left;top:.5em}.dialog .content{counter-reset:dialogContentCounter;margin-top:.5em;overflow:auto}.dialog .content .item{display:flex;position:relative}.dialog .content .item .edit{margin-right:.3em}.dialog .content .item .fa{display:none;padding:.1em 0}.dialog .content .item .highlight{background:#fff;display:none;opacity:.2;pointer-events:none}.dialog .content .item:hover .highlight,.dialog .content:not(:hover) .item.selected .highlight{display:block}.dialog .content .item:hover .fa{display:inline}.dialog .content .item .name{margin-left:.3em;padding-right:.05em}.dialog .content .item .nameBox{display:flex;flex:1;padding:.1em .2em}.dialog .content .number{padding-right:.2em;text-align:right}.dialog .contentBox{flex:1;position:relative}.dialog .fa{margin-left:.8em;margin-top:.08em}.dialog .copy,.dialog .delete,.dialog .fa.load,.dialog .fa.paste,.dialog .fa.redo,.dialog .unclip{margin-left:.4em}.dialog .title{border-bottom:.1em solid #fff;display:flex;flex:0;padding-bottom:.4em}.dialog .title .name{padding-right:.05em}.dialog .title .nameBox{flex:1}.dialogInner{display:flex;flex-direction:column;padding:.5em}.disabled{opacity:.4}.editMode .status{display:none}.fill{bottom:0;left:0;position:absolute;right:0;top:0}.fill.relative{position:relative}.pane{display:none}.pane .dialogBox{font-size:2em;padding:.5em;text-align:center}.panel{display:inline-block}.panel>*{border:.1em solid transparent;font-size:2em;padding:.1em}.panelBox{flex:0;min-width:4em}.playMode .commands,.playMode .toolbox{display:none}.right{text-align:right}.scoreTimeRow>*{padding-top:1em}.selector{border:.2em solid #fff;border-radius:.2em;display:none;height:10em;pointer-events:none;position:absolute;width:10em}.shade{opacity:.65}.shade,.stage{background:#000}.stage{display:none;margin-bottom:auto;margin-top:auto;position:absolute}.status.other{visibility:hidden}table{margin-top:1em}.timeRow td,.timeRow th{text-align:right}.timeRow th{font-weight:400;padding-right:.5em}.toolbox .ender{margin-top:.5em}.toolbox input{display:none}.toolbox label{border:.1em solid transparent;display:block;margin-bottom:-.1em;position:relative}.toolbox label.ender{margin-bottom:0}.toolbox>label canvas{display:block}.toolbox>label:hover .toolMenu,.toolMenu:hover{display:flex}.toolbox i{position:relative;text-align:center;top:50%;transform:translateY(-50%)}.toolbox i,.toolbox i *{display:block}.toolbox .selected{border:.1em solid #fff;border-radius:.2em}.toolbox .toolMenu label{display:block;padding:.1em}.toolbox .toolMenu label canvas{display:block}.toolMenu{background:#111;display:none;margin-left:1em;margin-top:-.2em;position:absolute;padding:.1em .1em .2em .3em;top:0;z-index:1}.view{flex:1;position:relative}", ""]);
	
	// exports


/***/ },
/* 47 */
/***/ function(module, exports) {

	module.exports = "<div class=\"dialog levels\"> <div class=\"fill shade\"></div> <div class=\"fill dialogInner\"> <div class=titleBox> <div class=title> <span class=nameBox> <span class=name>Tower</span> </span> <i class=\"fa fa-search search disabled\" title=Search></i> <i class=\"fa fa-plus add\" title=\"New Level\"></i> <i class=\"fa fa-clipboard paste disabled\" title=\"Paste Marked Clipboard Level(s)\"></i> <i class=\"fa fa-window-close-o fa-rotate-90 unclip disabled\" title=\"Unmark Clipboard Selections\"></i> <i class=\"fa fa-ban exclude\" title=\"Exclude Level\"></i> <i class=\"fa fa-trash delete disabled\" title=\"Delete Level\"></i> <i class=\"fa fa-download save\" title=\"Export Tower to File\"></i> <i class=\"fa fa-arrow-up towers\" title=\"List Towers\"></i> </div> </div> <div class=contentBox> <div class=\"content fill\"> <div class=item> <div class=\"fill highlight\"></div> <span class=nameBox> <span class=number></span> <span class=name>Level</span> </span> <i class=\"fa fa-scissors cut disabled\" title=\"Mark for Cut\"></i> <i class=\"fa fa-files-o copy disabled\" title=\"Mark for Copy\"></i> <i class=\"fa fa-arrow-right edit\" title=\"Edit Level\"></i> </div> </div> </div> </div> </div> ";

/***/ },
/* 48 */
/***/ function(module, exports) {

	module.exports = "<div class=\"dialog report\"> <div class=\"fill shade\"></div> <div class=\"fill dialogInner\"> <div class=endMessage>...</div> <table> <tr class=\"scoreTimeRow timeRow\"> <th>Time:</th><td class=scoreTime></td> </tr> </table> </div> </div> ";

/***/ },
/* 49 */
/***/ function(module, exports) {

	module.exports = "<div class=\"dialog towers\"> <div class=\"fill shade\"></div> <div class=\"fill dialogInner\"> <div class=titleBox> <div class=title> <span class=nameBox> <span class=name>Towers</span> </span> <i class=\"fa fa-search search disabled\" title=Search></i> <i class=\"fa fa-plus add\" title=\"New Level\"></i> <i class=\"fa fa-clipboard paste disabled\" title=\"Paste Marked Clipboard Tower(s)\"></i> <i class=\"fa fa-window-close-o fa-rotate-90 unclip disabled\" title=\"Unmark Clipboard Selections\"></i> <i class=\"fa fa-ban exclude disabled\" title=\"Exclude Tower\"></i> <i class=\"fa fa-trash delete disabled\" title=\"Delete Tower\"></i> <i class=\"fa fa-upload load disabled\" title=\"Import Tower\"></i> </div> </div> <div class=contentBox> <div class=\"content fill\"> <div class=item> <div class=\"fill highlight\"></div> <span class=nameBox> <span class=number></span> <span class=name>Level</span> </span> <i class=\"fa fa-scissors cut disabled\" title=\"Mark for Cut\"></i> <i class=\"fa fa-files-o copy disabled\" title=\"Mark for Copy\"></i> <i class=\"fa fa-arrow-right edit\" title=\"List Levels\"></i> </div> </div> </div> </div> </div> ";

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(46);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(7)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../node_modules/css-loader/index.js!./index.css", function() {
				var newContent = require("!!./../node_modules/css-loader/index.js!./index.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 51 */
/***/ function(module, exports) {

	module.exports = "data:image/png;base64,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"

/***/ }
]);