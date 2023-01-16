import { coins } from "@cosmjs/stargate";
import { HttpBatchClient, Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { kujiraQueryClient, msg, USK } from "kujira.js";
import { useEffect, useMemo, useRef, useState } from "react";
import Balance from "./components/Balance";
import Spin from "./components/Spin";
import Spinner from "./components/Spinner";
import Status from "./components/Status";
import Wallet from "./components/Wallet";
import { chainInfo, useKeplr } from "./services/useKeplr";

const CONTRACT =
  "kujira1rt0fzu0w32ymr6cxl4867rwqfaen6mmx2k2ulqna9zmc0ft2ye7qxeetxn";

function App() {
  const Spinny = useRef<any | null>(null);
  const wallet = useKeplr();
  const [tmClient, setTmClient] = useState<null | Tendermint34Client>(null);
  const [status, setStatus] = useState("1 USK TO SPIN!");
  const [balance, setBalance] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  const SoundSpin = new Audio("/sound/spin.wav");
  const SoundWin = new Audio("/sound/win.wav");
  const SoundLose = new Audio("/sound/lose.wav");

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
      .balance(wallet.account.address, USK.reference)
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
        funds: coins(1000000, USK.reference),
      }),
    ];

    Spinny.current!.Prespin(); // this would be nice to call before the response comes back
    setStatus("WAITING...");
    setDisabled(true);
    let tx;
    try {
      const tx = await wallet.signAndBroadcast(msgs);
      const idx = tx.events
        .find((e) => e.type === "wasm")
        ?.attributes.find((a) => a.key === "game")?.value;

      refreshBalance();
      return getResult(idx || "");
    } catch {
      setStatus("1 USK TO SPIN!");
      setDisabled(false);
      return getResult("");
    }
  };

  return (
    <div className="luckyreel">
      <button
        className={`volume ${soundOn ? "" : "mute"}`}
        onClick={() => setSoundOn(!soundOn)}
      />
      <div className="machine">
        <div className="machine__image" />
        <Spinner ref={Spinny} />
        <Wallet wallet={wallet} />
        <Status status={status} />
        <Balance wallet={wallet} balance={balance} />
        <Spin
          disabled={disabled}
          onSpin={async () => {
            const res = await pull();
            if (res.length === 3) {
              setStatus("...");
              setTimeout(() => {
                if (res.every((val, i, arr) => val === arr[0])) {
                  setStatus("WINNER!");
                  if (soundOn) SoundWin.play();
                } else {
                  setStatus("1 USK TO SPIN!");
                  if (soundOn) SoundLose.play();
                }
                setDisabled(false);
              }, 3500);
            } else {
              setDisabled(false);
              setStatus("1 USK TO SPIN!");
            }
            if (soundOn) SoundSpin.play();
            Spinny.current!.Spin(...res, refreshBalance);
          }}
        />
      </div>
    </div>
  );
}

export default App;
