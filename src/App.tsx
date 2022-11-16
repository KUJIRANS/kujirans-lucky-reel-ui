import { useRef, useState } from "react";
import Spinner from "./components/Spinner";
import Wallet from "./components/Wallet";
import Spin from "./components/Spin";
import Balance from "./components/Balance";
import Status from "./components/Status";
import { useKeplr } from "./services/useKeplr";
import { msg, USK_TESTNET } from "kujira.js";
import { coins } from "@cosmjs/stargate";

const CONTRACT =
  "kujira1ewuwnd9586ffctrasa0llqrcr63xfewdjrppqfg54pse7z96whfq440fcy";

function App() {
  const Spinny = useRef<any | null>(null);
  const wallet = useKeplr();
  const [game, setGame] = useState<null | string>(null);

  const pull = async () => {
    if (!wallet.account) return;
    const msgs = [
      msg.wasm.msgExecuteContract({
        sender: wallet.account.address,
        contract: CONTRACT,
        msg: Buffer.from(JSON.stringify({ pull: {} })),
        funds: coins(1000000, USK_TESTNET.reference),
      }),
    ];

    const tx = await wallet.signAndBroadcast(msgs);
    const idx = tx.events
      .find((e) => e.type === "wasm")
      ?.attributes.find((a) => a.key === "game")?.value;
    idx && setGame(idx);
    console.log(tx);
  };

  console.log({ game });

  return (
    <div className="luckyreel">
      <div className="machine">
        <div className="machine__image" />
        <Spinner ref={Spinny} />
        <Wallet wallet={wallet} />
        <Status status="READY!" />
        <Balance />
        <Spin
          onSpin={async () => {
            await pull();
            Spinny.current!.spin();
          }}
        />
      </div>
    </div>
  );
}

export default App;
