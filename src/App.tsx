import { useRef } from "react";
import Spinner from "./components/Spinner";
import Wallet from "./components/Wallet";
import Spin from "./components/Spin";
import Balance from "./components/Balance";
import Status from "./components/Status";

function App() {
  const Spinny = useRef<any | null>(null);
  return (
    <div className="luckyreel">
      <div className="machine">
        <div className="machine__image" />
        <Spinner ref={Spinny} />
        <Wallet />
        <Status status="READY!" />
        <Balance />
        <Spin onSpin={() => Spinny.current!.spin()} />
      </div>
    </div>
  );
}

export default App;
