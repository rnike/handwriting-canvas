export class HandwritingAccelerateCanvas extends HTMLElement {
  private canvas: HTMLCanvasElement;

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });

    this.canvas = document.createElement('canvas');

    shadow.appendChild(this.canvas);
  }
}

customElements.define(
  'handwriting-accelerate-canvas',
  HandwritingAccelerateCanvas
);
