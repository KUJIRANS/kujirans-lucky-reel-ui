import { FC } from "react";
import { UseKeplr } from "../services/useKeplr";

const Balance: FC<{ wallet: UseKeplr; balance: number }> = ({
  wallet,
  balance,
}) => {
  return (
    <div className={`button button--balance ${wallet.account ? "on" : ""}`}>
      {Math.floor(balance / 10 ** 6).toLocaleString()} USK
    </div>
  );
};

export default Balance;
