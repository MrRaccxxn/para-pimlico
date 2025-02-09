import { createContext, ReactNode, useContext, useState } from "react";
import { para, paraAccount } from "../clients/para";
import {
  createPublicClient,
  Hash,
  http,
  SignableMessage,
  zeroAddress,
} from "viem";
import { sepolia } from "viem/chains";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { entryPoint07Address } from "viem/account-abstraction";
import { toSimpleSmartAccount } from "permissionless/accounts";
import { createSmartAccountClient } from "permissionless";
import { customSignMessage } from "../utils/customSignMessage";

type WalletType = `0x${string}`;

interface AuthProviderType {
  isLoading: boolean;
  isConnected: boolean;
  handleCheckIfAuthenticated: () => void;
  wallet: WalletType | null;
  error: string | null;
  handleSign: () => Promise<void>;
}

const AuthContext = createContext<AuthProviderType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSign = async () => {
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(),
    });

    const pimlicoUrl = `https://api.pimlico.io/v2/sepolia/rpc?apikey=${
      import.meta.env.VITE_PIMLICO_API_KEY
    }`;

    const pimlicoClient = createPimlicoClient({
      transport: http(pimlicoUrl),
      entryPoint: {
        address: entryPoint07Address,
        version: "0.7",
      },
    });

    const simpleSmartAccount = await toSimpleSmartAccount({
      owner: paraAccount,
      client: publicClient,
      entryPoint: {
        address: entryPoint07Address,
        version: "0.7",
      },
    });

    const smartAccountClient = createSmartAccountClient({
      account: simpleSmartAccount,
      chain: sepolia,
      bundlerTransport: http(pimlicoUrl),
      paymaster: pimlicoClient,
      userOperation: {
        estimateFeesPerGas: async () => {
          return (await pimlicoClient.getUserOperationGasPrice()).fast;
        },
      },
    });

    smartAccountClient.signMessage = async ({
      message,
    }: {
      message: SignableMessage;
    }): Promise<Hash> => {
      return customSignMessage(para, message);
    };

    try {
      const userOperation = await smartAccountClient.prepareUserOperation({
        callData: await smartAccountClient.account.encodeCalls([
          {
            to: zeroAddress,
            value: 0n,
            data: "0x",
          },
        ]),
      });

      userOperation.signature =
        await smartAccountClient.account.signUserOperation(userOperation);

      const txHash = await smartAccountClient.sendUserOperation(userOperation);

      console.log(
        `User operation included: https://sepolia.etherscan.io/tx/${txHash}`
      );
    } catch (error) {
      // @ts-expect-error error is a string
      setError(error.message);
      console.error("Error sending transaction:", error);
    }
  };

  const handleCheckIfAuthenticated = async () => {
    setIsLoading(true);
    setError("");
    try {
      const isAuthenticated = await para.isFullyLoggedIn();
      setIsConnected(isAuthenticated);
      if (isAuthenticated) {
        const wallets = Object.values(para.getWallets());
        if (wallets?.length) {
          setWallet((wallets[0].address as WalletType) || null);
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication");
    }
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isConnected,
        handleCheckIfAuthenticated,
        wallet,
        error,
        handleSign,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
