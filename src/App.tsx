import { useRef } from "react";
import Spinner from "./components/Spinner";
import Wallet from "./components/Wallet";
import Spin from "./components/Spin";
import Balance from "./components/Balance";
import Status from "./components/Status";
import { useKeplr } from "./services/useKeplr";

function App() {
  const Spinny = useRef<any | null>(null);
  const wallet = useKeplr();
  return (
    <div className="luckyreel">
      <div className="machine">
        <div className="machine__image" />
        <Spinner ref={Spinny} />
        <Wallet wallet={wallet} />
        <Status status="READY!" />
        <Balance />
        <Spin onSpin={() => Spinny.current!.spin()} />
      </div>
    </div>
  );
}

export default App;
