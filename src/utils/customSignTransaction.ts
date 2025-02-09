import { ParaCore, SuccessfulSignatureRes } from "@getpara/react-sdk";

interface Transaction {
  to: string;            
  value: string;         
  data: string;          
  chainId: string;       
}

export const customSignTransaction = async (
  para: ParaCore,
  transaction: Transaction 
): Promise<string> => {
  console.log("Started custom signing transaction...");

  const hashedTransaction = hashTransaction(transaction);

  const hexToBase64 = Buffer.from(hashedTransaction, "hex").toString("base64");

  const res = await para.signTransaction({
    walletId: Object.values(para.wallets!)[0]!.id,
    chainId: transaction.chainId,
    transactionBase64: hexToBase64,
  });

  let signature = (res as SuccessfulSignatureRes).signature;

  const lastByte = parseInt(signature.slice(-2), 16);
  if (lastByte < 27) {
    const adjustedV = (lastByte + 27).toString(16).padStart(2, "0");
    signature = signature.slice(0, -2) + adjustedV;
  }

  // Step 6: Return the final signed transaction
  return `0x${signature}`;
};