import { FC, useState } from "react";
import { UseKeplr } from "../services/useKeplr";

const Wallet: FC<{ wallet: UseKeplr }> = ({ wallet }) => {
  return (
    <button
      className={`button button--wallet ${wallet.account ? "on" : ""}`}
      onClick={() => wallet.connect && wallet.connect()}
    >
      {wallet.account ? "CONNECTED" : "CONNECT WALLET"}
    </button>
  );
};

export default Wallet;
