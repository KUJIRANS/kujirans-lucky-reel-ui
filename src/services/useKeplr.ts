import { AccountData, EncodeObject } from "@cosmjs/proto-signing";
import { DeliverTxResponse } from "@cosmjs/stargate";
import { Window as KeplrWindow } from "@keplr-wallet/types";
import { CHAIN_INFO, Keplr, MAINNET, NETWORK, USK } from "kujira.js";
import { useEffect, useState } from "react";

export const network: NETWORK = MAINNET;
export const chainInfo = CHAIN_INFO[network];
export const feeDenom = USK.reference;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window extends KeplrWindow {}
}

export type UseKeplr = {
  connect: null | ((chain?: string) => void);
  disconnect: () => void;
  account: AccountData | null;
  signAndBroadcast: (msgs: EncodeObject[]) => Promise<DeliverTxResponse>;
};

export const useKeplr = (): UseKeplr => {
  const [wallet, setWallet] = useState<null | Keplr>(null);
  const keplr = window.keplr;

  const connect = () => {
    if (!keplr) return;

    Keplr.connect(chainInfo, { feeDenom }).then((w) => {
      setWallet(w);
      document.cookie = "keplr=connected; path=/";
    });
  };

  useEffect(() => {
    const stored = document.cookie.includes("keplr=connected");
    if (stored) connect();
  }, [keplr, connect]);

  const signAndBroadcast = async (
    msgs: EncodeObject[],
    batch?: {
      size: number;
      cb: (total: number, remaining: number) => void;
    }
  ): Promise<DeliverTxResponse> => {
    if (!wallet) throw new Error("No Wallet Connected");

    return wallet.signAndBroadcast(msgs);
  };

  return {
    account: wallet?.account || null,
    connect,
    disconnect: () => {
      document.cookie = "keplr=disconnected;";
      setWallet(null);
    },
    signAndBroadcast,
  };
};
