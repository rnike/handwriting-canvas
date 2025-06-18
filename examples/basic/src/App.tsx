import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEventHandler,
} from 'react';
import './App.css';

import 'handwriting-canvas';

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'handwriting-canvas': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        width?: number;
        height?: number;
        resolution?: number;
      };
    }
  }
}

function App() {
  const ref = useRef<{
    drawStart: (e: PointerEvent) => void;
    drawMove: (e: PointerEvent) => void;
    drawEnd: (e: PointerEvent) => void;
  }>(null);

  const handlePointerDown = useCallback<PointerEventHandler<HTMLElement>>(
    (e) => {
      ref.current?.drawStart(e.nativeEvent);
    },
    []
  );

  const handlePointerMove = useCallback<PointerEventHandler<HTMLElement>>(
    (e) => {
      ref.current?.drawMove(e.nativeEvent);
    },
    []
  );

  const handlePointerUp = useCallback<PointerEventHandler<HTMLElement>>((e) => {
    console.log(ref.current?.drawEnd(e.nativeEvent));
  }, []);

  const [[width, height], setSize] = useState(() => [0, 0]);

  useEffect(() => {
    const handleResize = () => {
      setSize([window.innerWidth, window.innerHeight]);
    };

    setSize([window.innerWidth, window.innerHeight]);

    document.addEventListener('resize', handleResize);

    return () => {
      document.addEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <handwriting-canvas
        // @ts-expect-error todo: type
        ref={ref}
        width={width}
        height={height}
        resolution={devicePixelRatio}
        className="rounded border"
        style={{
          width: width,
          height: height,
          backgroundColor: '#f9f9f9',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    </div>
  );
}

export default App;
