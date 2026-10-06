"use client";

import { useState, useCallback, useEffect } from "react";
import {
  isConnected as freighterIsConnected,
  requestAccess,
  getNetwork,
  signTransaction as freighterSignTransaction,
} from "@stellar/freighter-api";
import { useWalletStore } from "@/stores/wallet-store";
import { freighterUserMessage } from "@/lib/freighter-errors";

function mapNetwork(network: string): "testnet" | "mainnet" {
  return network.toLowerCase().includes("public") || network.toLowerCase().includes("main")
    ? "mainnet"
    : "testnet";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function readError(value: unknown): string | null {
  const obj = asRecord(value);
  if (!obj?.error) return null;
  const err = obj.error;
  if (typeof err === "string") return err;
  const errObj = asRecord(err);
  return errObj?.message ? String(errObj.message) : String(err);
}

export function useFreighter() {
  const { setWallet, clearWallet } = useWalletStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await freighterIsConnected();
        const available = Boolean(asRecord(result)?.isConnected ?? result);
        if (!cancelled) setIsAvailable(available);
      } catch {
        if (!cancelled) setIsAvailable(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const connected = await freighterIsConnected();
      if (!Boolean(asRecord(connected)?.isConnected ?? connected)) {
        throw new Error("Freighter wallet not found. Install the Freighter browser extension.");
      }

      // Combines allow-list + address (required so Confirm is enabled on tx prompts)
      const access = await requestAccess();
      const accessErr = readError(access);
      if (accessErr) throw new Error(accessErr);
      const address = String(asRecord(access)?.address ?? "");
      if (!address) {
        throw new Error("Could not read Freighter public key.");
      }

      const networkResult = await getNetwork();
      const networkObj = asRecord(networkResult);
      const network =
        typeof networkResult === "string"
          ? networkResult
          : String(networkObj?.network ?? networkObj?.networkPassphrase ?? "TESTNET");

      setIsAvailable(true);
      setWallet({
        address,
        isConnected: true,
        network: mapNetwork(network),
      });
    } catch (err) {
      setError(freighterUserMessage(err));
    } finally {
      setIsConnecting(false);
    }
  }, [setWallet]);

  const disconnect = useCallback(() => {
    clearWallet();
    setError(null);
  }, [clearWallet]);

  const signTransaction = useCallback(
    async (xdr: string, networkPassphrase?: string, address?: string): Promise<string> => {
      const result = await freighterSignTransaction(xdr, {
        networkPassphrase: networkPassphrase ?? "Test SDF Network ; September 2015",
        address,
      });
      const err = readError(result);
      if (err) throw new Error(err);
      if (typeof result === "string") return result;
      const signed = asRecord(result)?.signedTxXdr;
      if (typeof signed !== "string" || !signed) {
        throw new Error("Freighter did not return a signed transaction.");
      }
      return signed;
    },
    []
  );

  return { connect, disconnect, signTransaction, isConnecting, isAvailable, error };
}
