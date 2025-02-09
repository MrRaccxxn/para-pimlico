import { ParaCore, SuccessfulSignatureRes } from "@getpara/react-sdk";
import type { SignableMessage, Hash } from "viem";
import { hashMessage } from "viem";

export const customSignMessage = async (
  para: ParaCore,
  message: SignableMessage
): Promise<Hash> => {
  console.log("Started custom signing transaction...");

  const hashedMessage = hashMessage(message);
  const hexToBase64 = Buffer.from(hashedMessage, "hex").toString("base64");

  const res = await para.signMessage({
    walletId: Object.values(para.wallets!)[0]!.id,
    messageBase64: hexToBase64,
  });

  let signature = (res as SuccessfulSignatureRes).signature;

  // Adjust `v` if it is below 27.
  const lastByte = parseInt(signature.slice(-2), 16);
  if (lastByte < 27) {
    const adjustedV = (lastByte + 27).toString(16).padStart(2, "0");
    signature = signature.slice(0, -2) + adjustedV;
  }

  return `0x${signature}`;
};
