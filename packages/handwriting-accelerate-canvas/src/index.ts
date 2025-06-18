export class HandwritingAccelerateCanvas extends HTMLElement {
  private canvas: HTMLCanvasElement;
  private context2d: CanvasRenderingContext2D | null;

  resolution = 1;
  canvasWidth = 800;
  canvasHeight = 600;

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });

    this.canvas = document.createElement('canvas');
    this.context2d = this.canvas.getContext('2d');

    const style = document.createElement('style');

    style.textContent = 'canvas { width: 100%; height: 100%; }';

    shadow.appendChild(style);
    shadow.appendChild(this.canvas);
  }

  static get observedAttributes() {
    return ['width', 'height', 'resolution'];
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    switch (name) {
      case 'width':
        this.canvasWidth = parseFloat(newValue);
        break;
      case 'height':
        this.canvasHeight = parseFloat(newValue);
        break;
      case 'resolution':
        this.resolution = parseFloat(newValue);

      default:
        break;
    }

    this.canvas.width = this.canvasWidth * this.resolution;
    this.canvas.height = this.canvasHeight * this.resolution;
    this.context2d?.resetTransform();
    this.context2d?.scale(this.resolution, this.resolution);
  }

  drawingPointers = new Map<
    number,
    {
      points: number[];
      coords: [number, number];
      previous: [number, number];
    }
  >();

  drawStart(e: PointerEvent) {
    const rect = this.canvas.getBoundingClientRect();

    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = -rect.left * scaleX;
    const y = -rect.top * scaleY;

    this.drawingPointers.set(e.pointerId, {
      coords: [x, y],
      previous: [e.clientX, e.clientY],
      points: [e.clientX, e.clientY],
    });
  }

  drawMove(e: PointerEvent) {
    if (!this.drawingPointers.has(e.pointerId)) {
      return;
    }

    const { previous, coords, points } = this.drawingPointers.get(e.pointerId)!;

    this.context2d?.beginPath();
    this.context2d?.moveTo(previous[0] + coords[0], previous[1] + coords[1]);
    this.context2d?.lineTo(e.clientX + coords[0], e.clientY + coords[1]);
    this.context2d?.stroke();

    this.drawingPointers.set(e.pointerId, {
      previous: [e.clientX, e.clientY],
      coords,
      points: points.concat([e.clientX, e.clientY]),
    });
  }

  drawEnd(e: PointerEvent) {
    if (!this.drawingPointers.has(e.pointerId)) {
      return;
    }

    const drawing = this.drawingPointers.get(e.pointerId);

    this.drawingPointers.delete(e.pointerId);

    if (this.drawingPointers.size === 0) {
      this.context2d?.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    return drawing;
  }

  set width(val: number) {
    this.setAttribute('width', val.toString());
  }

  set height(val: number) {
    this.setAttribute('height', val.toString());
  }
}

customElements.define(
  'handwriting-accelerate-canvas',
  HandwritingAccelerateCanvas
);
