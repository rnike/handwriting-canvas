import './App.css';

import 'handwriting-accelerate-canvas';

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'handwriting-accelerate-canvas': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

function App() {
  return (
    <>
      <h1>Handwriting Accelerate Canvas</h1>
      <handwriting-accelerate-canvas />
    </>
  );
}

export default App;
