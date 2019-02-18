class ColorPicker {
  constructor() {
    this.canvas = $('#color-picker')[0];
    this.ctx = this.canvas.getContext('2d');
    this.x = 50;
    this.y = 50;
    this.r = 7;
    this.grd = this.initGrd();
    this.mult = $('#color-mult')[0].value;

    this.canvas.width = $('#color-picker')[0].clientWidth;
    this.canvas.height = $('#color-picker')[0].clientHeight;
    this.render();
    this.drawCircle(this.x, this.y);

    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);

    this.canvas.addEventListener('mousedown', this.handleMouseDown);
  }

  render() {
    this.ctx.fillStyle = this.grd;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  initGrd() {
    let grd = this.ctx.createLinearGradient(0, 0, 170, 0);
    grd.addColorStop(0, 'red');
    grd.addColorStop(0.167, 'orange');
    grd.addColorStop(0.333, 'yellow');
    grd.addColorStop(0.5, 'green');
    grd.addColorStop(0.667, 'cyan');
    grd.addColorStop(0.833, 'blue');
    grd.addColorStop(1, 'purple');
    return grd;
  }

  handleMouseDown(e) {
    const { x, y } = this.getMousePos(e);
    if (
      Math.abs(x - this.x) > this.r * 2 ||
      Math.abs(y - this.y) > this.r * 2
    ) {
      this.x = x;
      this.y = y;
      this.drawCircle(this.x, this.y);
      $('.color-icon').css('background', this.getColor());
      return;
    }
    this.x = x;
    this.y = y;
    this.drawCircle(this.x, this.y);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
  }

  handleMouseMove(e) {
    const { x, y } = this.getMousePos(e);
    this.x = x;
    this.y = y;
    this.drawCircle(this.x, this.y);
    $('.color-icon').css('background', this.getColor());
  }

  handleMouseUp(e) {
    const { x, y } = this.getMousePos(e);
    if (x < 0 || y < 0) {
      return;
    }
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
  }

  getMousePos(e) {
    var offsetX = this.canvas.getBoundingClientRect().left;
    var offsetY = this.canvas.getBoundingClientRect().top;
    return {
      x: e.clientX - offsetX,
      y: e.clientY - offsetY
    };
  }

  getColor() {
    const x = this.x;
    const y = this.y;
    const mult = this.mult;
    const p = this.ctx.getImageData(x, y, 1, 1).data;
    const hex =
      '#' +
      ('000000' + this.rgbToHex(mult * p[0], mult * p[1], mult * p[2])).slice(
        -6
      );
    return hex;
  }

  drawCircle(x, y) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.render();
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.r, 0, Math.PI * 2, true);
    this.ctx.strokeStyle = '#333333';
    this.ctx.stroke();
    this.ctx.closePath();
  }

  rgbToHex(r, g, b) {
    if (r > 255 || g > 255 || b > 255) throw 'Invalid color component';
    return ((r << 16) | (g << 8) | b).toString(16);
  }
}
