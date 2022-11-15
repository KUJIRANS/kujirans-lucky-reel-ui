import { useRef } from "react";
import Spinner from "./components/Spinner";

function App() {
  const Spin = useRef<any | null>(null);
  return (
    <div className="luckyreel">
      <div className="machine">
        <div className="machine__image" />
        <Spinner ref={Spin} />
        <button
          onClick={() => Spin.current!.spin()}
          style={{ position: "fixed", left: 20, top: 20, zIndex: 3 }}
        >
          SPIN!
        </button>
      </div>
    </div>
  );
}

export default App;
