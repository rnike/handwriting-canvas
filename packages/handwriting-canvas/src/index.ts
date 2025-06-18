export class HandwritingCanvas extends HTMLElement {
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
      actions: {
        mt: [number, number];
        lt: [number, number];
      }[];
      frame: number;
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
      actions: [],
      frame: 0,
    });
  }

  drawMove(e: PointerEvent) {
    if (!this.drawingPointers.has(e.pointerId)) {
      return;
    }

    const { previous, coords, points, actions, frame } =
      this.drawingPointers.get(e.pointerId)!;

    let previousX = previous[0];
    let previousY = previous[1];
    let nextPoints = points;

    let minX = Number.MAX_SAFE_INTEGER;
    let minY = Number.MAX_SAFE_INTEGER;
    let maxX = Number.MIN_SAFE_INTEGER;
    let maxY = Number.MIN_SAFE_INTEGER;

    const events = 'getCoalescedEvents' in e ? e.getCoalescedEvents() : [e];

    events.forEach((event) => {
      minX = Math.min(minX, previousX + coords[0], event.clientX + coords[0]);
      minY = Math.min(minY, previousY + coords[1], event.clientY + coords[1]);
      maxX = Math.max(maxX, previousX + coords[0], event.clientX + coords[0]);
      maxY = Math.max(maxY, previousY + coords[1], event.clientY + coords[1]);

      actions.push({
        mt: [previousX + coords[0], previousY + coords[1]],
        lt: [event.clientX + coords[0], event.clientY + coords[1]],
      });

      previousX = event.clientX;
      previousY = event.clientY;
      nextPoints = nextPoints.concat([event.clientX, event.clientY]);
    });

    cancelAnimationFrame(frame);

    const nextFrame = requestAnimationFrame(() => {
      const draw = this.drawingPointers.get(e.pointerId);

      if (!draw?.actions.length) {
        return;
      }

      this.context2d?.save();
      this.context2d?.beginPath();

      draw.actions.forEach(({ mt, lt }) => {
        this.context2d?.moveTo(mt[0], mt[1]);
        this.context2d?.lineTo(lt[0], lt[1]);
      });

      this.context2d?.stroke();
      this.context2d?.restore();
      this.drawingPointers.set(e.pointerId, {
        ...draw,
        actions: [],
      });
    });

    this.drawingPointers.set(e.pointerId, {
      previous: [previousX, previousY],
      coords,
      points: nextPoints,
      actions,
      frame: nextFrame,
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

customElements.define('handwriting-canvas', HandwritingCanvas);
