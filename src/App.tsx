import { useEffect, useMemo, useRef, useState } from "react";
import Spinner from "./components/Spinner";
import Wallet from "./components/Wallet";
import Spin from "./components/Spin";
import Balance from "./components/Balance";
import Status from "./components/Status";
import { chainInfo, useKeplr } from "./services/useKeplr";
import { kujiraQueryClient, msg, USK_TESTNET } from "kujira.js";
import { coins } from "@cosmjs/stargate";
import { HttpBatchClient, Tendermint34Client } from "@cosmjs/tendermint-rpc";

const CONTRACT =
  "kujira1uxeul6hxntl7rgwmagtrjx0hprue9eajj5r3m724xcestgsnvmaqzft36x";

function App() {
  const Spinny = useRef<any | null>(null);
  const wallet = useKeplr();
  const [tmClient, setTmClient] = useState<null | Tendermint34Client>(null);

  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const httpClient = new HttpBatchClient(chainInfo.rpc, {
      dispatchInterval: 100,
      batchSizeLimit: 200,
    });
    Tendermint34Client.create(httpClient).then(setTmClient);
  }, []);

  const query = useMemo(
    () => tmClient && kujiraQueryClient({ client: tmClient }),
    [tmClient]
  );

  const refreshBalance = () =>
    wallet.account &&
    query &&
    query.bank
      .balance(wallet.account.address, USK_TESTNET.reference)
      .then(({ amount }) => setBalance(parseInt(amount)));

  useEffect(() => {
    refreshBalance();
  }, [query, wallet.account?.address]);

  const getResult = (idx: string): Promise<[number, number, number]> => {
    if (!query) throw new Error();

    return query.wasm
      .queryContractSmart(CONTRACT, { game: { idx } })
      .then(({ result }: { result: [number, number, number] }) =>
        result
          ? [
              Math.floor(result[0] / 16),
              Math.floor(result[1] / 16),
              Math.floor(result[2] / 16),
            ]
          : getResult(idx)
      );
  };

  const pull = async (): Promise<[number, number, number]> => {
    if (!wallet.account) throw new Error("Wallet not connected");
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
    refreshBalance();

    return getResult(idx || "");
  };

  return (
    <div className="luckyreel">
      <div className="machine">
        <div className="machine__image" />
        <Spinner ref={Spinny} />
        <Wallet wallet={wallet} />
        <Status status="READY!" />
        <Balance wallet={wallet} balance={balance} />
        <Spin
          onSpin={async () => {
            const res = await pull();

            Spinny.current!.spin(...res, refreshBalance);
          }}
        />
      </div>
    </div>
  );
}

export default App;
