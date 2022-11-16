import { useState } from "react";

const Wallet = () => {
  const [address, setAddress] = useState<string | null>();

  const connectWallet = () => {
    setAddress("abcd");
  };

  return (
    <button
      className={`button button--wallet ${address ? "on" : ""}`}
      onClick={connectWallet}
    >
      {address ? "CONNECTED" : "CONNECT WALLET"}
    </button>
  );
};

export default Wallet;
