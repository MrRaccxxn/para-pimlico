import Para, { Environment } from "@getpara/react-sdk";
import {
  createParaAccount,
  createParaViemClient,
} from "@getpara/viem-v2-integration";
import { http } from "wagmi";
import { sepolia } from "wagmi/chains";

export const para = new Para(
  Environment.BETA,
  import.meta.env.VITE_PARA_API_KEY
);

export const paraAccount = createParaAccount(para);

export const paraViemSigner = createParaViemClient(para, {
  account: paraAccount,
  chain: sepolia,
  transport: http("https://ethereum-sepolia-rpc.publicnode.com"),
});