import { assertIsDeliverTxSuccess, coins } from "@cosmjs/stargate";
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
  const [displayModal, setDisplayModal] = useState(true);

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

    setStatus("WAITING...");
    setDisabled(true);
    try {
      const tx = await wallet.signAndBroadcast(msgs);
      assertIsDeliverTxSuccess(tx);
      const idx = tx.events
        .find((e) => e.type === "wasm")
        ?.attributes.find((a) => a.key === "game")?.value;
      if (!idx) throw new Error("Game not found");
      Spinny.current!.prespin();

      refreshBalance();
      return getResult(idx);
    } catch (e) {
      setStatus("1 USK TO SPIN!");
      setDisabled(false);
      throw e;
    }
  };

  return (
    <div className="luckyreel">
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
                } else {
                  setStatus("1 USK TO SPIN!");
                }
                setDisabled(false);
              }, 3500);
            } else {
              setDisabled(false);
              setStatus("1 USK TO SPIN!");
            }
            Spinny.current!.spin(...res, refreshBalance);
          }}
        />
      </div>
      {displayModal && (
        <div className="modal">
          <div className="modal__window">
            <h1>
              Welcome to <span>The Lucky Reel</span> by Kujira
            </h1>
            <h2>
              Get 3 Kujirans in a row to <span>WIN 200 USK!</span>
            </h2>
            <h3>Each Spin costs 1 USK!</h3>
            <p>
              To play you will need at least{" "}
              <a
                href="https://fin.kujira.app/trade/kujira1rwx6w02alc4kaz7xpyg3rlxpjl4g63x5jq292mkxgg65zqpn5llq202vh5?q=featured"
                target="_blank"
              >
                1 USK in your Kujira wallet
              </a>
              .
            </p>
            <ol>
              <li>
                Connect your Kujira wallet using the CONNECT WALLET button
              </li>
              <li>Click SPIN to play 1 game</li>
              <li>Available USK will display on purple button</li>
            </ol>
            <p>0.2 USK per spin goes to KUJI Stakers.</p>
            <p>1 in 256 chance to win.</p>
            <h4>
              Gamble responsibly. Gambling involves risk. Please only gamble
              with funds that you can comfortably afford to lose.
            </h4>
            <button className="button" onClick={() => setDisplayModal(false)}>
              LETS GO!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
