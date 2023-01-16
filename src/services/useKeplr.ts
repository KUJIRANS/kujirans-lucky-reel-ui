import { Decimal } from "@cosmjs/math";
import { AccountData, EncodeObject } from "@cosmjs/proto-signing";
import {
  DeliverTxResponse,
  GasPrice,
  SigningStargateClient,
} from "@cosmjs/stargate";
import { Window as KeplrWindow } from "@keplr-wallet/types";
import { useEffect, useState } from "react";

import {
  aminoTypes,
  CHAIN_INFO,
  MAINNET,
  NETWORK,
  registry,
  USK,
} from "kujira.js";

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
  const [accounts, setAccounts] = useState<null | readonly AccountData[]>(null);
  const keplr = window.keplr;

  const connect = () => {
    if (!keplr) return;

    keplr
      .experimentalSuggestChain({
        ...chainInfo,
        // Keplr is bullshti and defaults to the first of these provided as the fee denom
        feeCurrencies: chainInfo.feeCurrencies.filter(
          (x) => x.coinMinimalDenom === feeDenom
        ),
      })
      .then(() => keplr.enable(network))
      .then(() => keplr.getOfflineSignerAuto(network))
      .then((signer) => signer.getAccounts())
      .then((as) => {
        document.cookie = "keplr=connected; path=/";
        setAccounts(as);
      });
  };

  useEffect(() => {
    const stored = document.cookie.includes("keplr=connected");
    if (stored && connect) connect();
  }, [keplr, connect]);

  const account = accounts ? accounts[0] : null;

  useEffect(() => {
    window.addEventListener("keplr_keystorechange", () => {
      const keplr = window.keplr;
      if (!keplr) return;

      account &&
        keplr
          .getOfflineSignerAuto(network)
          .then((signer) => signer.getAccounts())
          .then(setAccounts);
    });
  }, [account]);

  useEffect(() => {
    if (!account) return;
    const keplr = window.keplr;
    keplr
      ?.experimentalSuggestChain({
        ...chainInfo,
        feeCurrencies: chainInfo.feeCurrencies.filter(
          (x) => x.coinMinimalDenom === feeDenom
        ),
      })
      .then(() => keplr.enable(network));
  }, [account, network, chainInfo]);

  const signAndBroadcast = async (
    msgs: EncodeObject[],
    batch?: {
      size: number;
      cb: (total: number, remaining: number) => void;
    }
  ): Promise<DeliverTxResponse> => {
    if (!window.keplr || !account) throw new Error("No Wallet Connected");

    const signer = await window.keplr.getOfflineSignerAuto(network);
    const gasPrice = new GasPrice(
      Decimal.fromUserInput("0.00125", 18),
      feeDenom
    );

    const client = await SigningStargateClient.connectWithSigner(
      chainInfo.rpc,
      signer,
      {
        registry,
        gasPrice,
        aminoTypes: aminoTypes("kujira"),
      }
    );

    return await client.signAndBroadcast(account.address, msgs, 1.5);
  };

  return {
    account,
    connect,
    disconnect: () => {
      document.cookie = "keplr=disconnected;";
      setAccounts(null);
    },
    signAndBroadcast,
  };
};
