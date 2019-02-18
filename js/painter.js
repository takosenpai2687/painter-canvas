class Painter {
  constructor() {
    // get canvas object
    this.controller = $('#controller')[0];
    this.viewer = $('#viewer')[0];
    // set canvas dimensions
    this.resize();
    // get canvas contexts
    this.vc = this.viewer.getContext('2d');
    this.cc = this.controller.getContext('2d');

    // set up config and insstance vars
    this.modes = {
      freedraw: 0,
      rectangle: 1,
      ellipse: 2,
      line: 3
    };
    this.mode;
    this.thickness;
    this.color;
    this.setMode(this.modes.freedraw);
    this.setThickness(3);
    this.setColor('#660066');
    this.undoStack = [];
    this.currentStroke = {};
    this.redoStack = [];

    // set up binding for event callbacks
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);

    // add event listener for mouse down
    this.controller.addEventListener('mousedown', this.handleMouseDown);

    // set up mouse coords placeholders
    this.xi = null;
    this.yi = null;
    this.offsetX = this.controller.getBoundingClientRect().left;
    this.offsetY = this.controller.getBoundingClientRect().top;
  }

  // resize canvas called upon window resize
  resize() {
    const w = $('.canvas-container')[0].clientWidth;
    const h = $('.canvas-container')[0].clientHeight;
    // resize canvas display size
    this.controller.width = w;
    this.controller.height = h;
    this.viewer.width = w;
    this.viewer.height = h;
    // resize canvas style size
    this.controller.style.width = w + 'px';
    this.controller.style.height = h + 'px';
    this.viewer.style.width = w + 'px';
    this.viewer.style.height = h + 'px';
  }

  // undo called upon btn-undo click
  undo() {
    if (!this.undoStack.length) {
      return;
    }
    // pop redo stack push to redo stack
    this.redoStack.push(this.undoStack.pop());
    this.reDraw(this.undoStack);
  }

  // redo called upon btn-redo click
  redo() {
    if (!this.redoStack.length) {
      return;
    }
    this.undoStack.push(this.redoStack.pop());
    this.reDraw(this.undoStack);
  }

  // re-render the scene called after undo/redo
  reDraw(stack) {
    // refresh canvas
    this.clearScreen(this.vc);
    // loop through actions
    for (let i = 0; i < stack.length; i++) {
      // set up the context
      this.vc.strokeStyle = stack[i].color;
      this.vc.lineWidth = stack[i].size;
      // set up starting point
      let { x: xi, y: yi } = stack[i].startPoint;
      let xf, yf;
      // set up end point if necessary
      if (stack[i].endPoint) {
        xf = stack[i].endPoint.x;
        yf = stack[i].endPoint.y;
      }
      // switch modes
      switch (stack[i].mode) {
        case this.modes.freedraw:
          this.vc.beginPath();
          // loop through each point on path
          for (let j = 0; j < stack[i].points.length; j++) {
            let { x, y } = stack[i].points[j];
            this.drawLine(this.vc, x, y);
            this.vc.moveTo(x, y);
          }
          this.vc.closePath();
          break;
        case this.modes.rectangle:
          this.drawRect(this.vc, xi, yi, xf, yf);
          break;
        case this.modes.ellipse:
          this.drawEllipse(this.vc, xi, yi, xf, yf);
          break;
        case this.modes.line:
          this.drawStraightLine(this.vc, xi, yi, xf, yf);
          break;
        default:
          return;
      }
    }
  }

  // get mouse position on canvas given the event instance
  getMousePos(e) {
    return { x: e.clientX - this.offsetX, y: e.clientY - this.offsetY };
  }

  handleMouseDown(e) {
    // set up initial point
    const { x, y } = this.getMousePos(e);
    this.xi = x;
    this.yi = y;
    switch (this.mode) {
      case this.modes.freedraw:
        this.vc.moveTo(x, y);
        this.vc.beginPath();
        break;
      case this.modes.ellipse:
        this.vc.moveTo(x, y);
        break;
      case this.modes.rectangle:
        this.vc.moveTo(x, y);
        break;
      case this.modes.line:
        this.vc.moveTo(x, y);
        break;
      default:
        return;
    }
    // when drawing, clear the redoStack
    this.redoStack = [];
    // use currentStroke to keep track of user actions
    this.currentStroke = {
      color: this.vc.strokeStyle,
      size: this.vc.lineWidth,
      mode: this.mode,
      points: [],
      startPoint: { x, y },
      endPoint: null
    };
    this.controller.addEventListener('mouseup', this.handleMouseUp);
    this.controller.addEventListener('mousemove', this.handleMouseMove);
  }

  handleMouseMove(e) {
    const { x, y } = this.getMousePos(e);
    // if out of bound, remove all listeners and return
    if (x < 0 || y < 0) {
      this.removeListeners();
      this.undoStack.push(this.currentStroke);
      this.currentStroke = {};
      return;
    }
    switch (this.mode) {
      case this.modes.freedraw:
        this.drawLine(this.vc, x, y);
        this.vc.moveTo(x, y);
        // save point to points
        this.currentStroke.points.push({ x, y });
        break;
      case this.modes.ellipse:
        this.clearScreen(this.cc);
        this.drawEllipse(this.cc, this.xi, this.yi, x, y);
        break;
      case this.modes.rectangle:
        this.clearScreen(this.cc);
        this.drawRect(this.cc, this.xi, this.yi, x, y);
        break;
      case this.modes.line:
        this.clearScreen(this.cc);
        this.drawStraightLine(this.cc, this.xi, this.yi, x, y);
        break;
      default:
        return;
    }
  }

  handleMouseUp(e) {
    // get end point
    const { x, y } = this.getMousePos(e);
    switch (this.mode) {
      case this.modes.freedraw:
        this.drawLine(this.vc, x, y);
        this.vc.closePath();
        break;
      case this.modes.ellipse:
        this.clearScreen(this.cc);
        this.drawEllipse(this.vc, this.xi, this.yi, x, y);
        break;
      case this.modes.rectangle:
        this.clearScreen(this.cc);
        this.drawRect(this.vc, this.xi, this.yi, x, y);
        break;
      case this.modes.line:
        this.clearScreen(this.cc);
        this.drawStraightLine(this.vc, this.xi, this.yi, x, y);
        break;
      default:
        return;
    }
    // save to undo stack
    if (this.mode == this.modes.freedraw) {
      this.currentStroke.points.push({ x, y });
    } else {
      this.currentStroke.endPoint = { x, y };
    }
    this.undoStack.push(this.currentStroke);
    this.currentStroke = {};
    // remove listeners and mouse coords placeholders
    this.xi = null;
    this.yi = null;
    this.removeListeners();
  }

  // remove mousemove and mouseup listeners
  removeListeners() {
    this.controller.removeEventListener('mouseup', this.handleMouseUp);
    this.controller.removeEventListener('mousemove', this.handleMouseMove);
  }

  setMode(mode) {
    this.setColor(this.color);
    this.setThickness(this.lineWidth);
    this.mode = mode;
    switch (mode) {
      case this.modes.freedraw:
        this.vc.lineCap = 'round';
        break;
      case this.modes.ellipse:
        break;
      default:
        return;
    }
  }

  setColor(color) {
    this.color = color;
    this.cc.strokeStyle = color;
    this.vc.strokeStyle = color;
  }

  setThickness(thickness) {
    this.thickness = thickness;
    this.vc.lineWidth = thickness;
    this.cc.lineWidth = thickness;
  }

  // refresh canvas
  clearScreen(ctx) {
    ctx.clearRect(0, 0, this.controller.width, this.controller.height);
  }

  // draw line to position
  drawLine(ctx, x, y) {
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.closePath();
  }

  // draw an ellipse given initial and final mouse coordsF
  drawEllipse(ctx, xi, yi, xf, yf) {
    const x = (xi + xf) / 2;
    const y = (yi + yf) / 2;
    const radiusX = Math.abs(x - xi);
    const radiusY = Math.abs(y - yi);
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();
  }

  // draw a straight line given initial and final mouse coords
  drawStraightLine(ctx, xi, yi, xf, yf) {
    ctx.beginPath();
    ctx.moveTo(xi, yi);
    ctx.lineTo(xf, yf);
    ctx.stroke();
    ctx.closePath();
  }

  // draw a rectangle given initial and final mouse coords
  drawRect(ctx, xi, yi, xf, yf) {
    const x = Math.min(xi, xf);
    const y = Math.min(yi, yf);
    const w = Math.abs(xf - xi);
    const h = Math.abs(yf - yi);
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.stroke();
    ctx.closePath();
  }
}
