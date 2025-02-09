import { useEffect, useState } from "react";
import { ParaModal } from "@getpara/react-sdk";
import "@getpara/react-sdk/styles.css";
import { useAuth } from "./contexts/AuthProvider";
import { para } from "./clients/para";
import { LuLoaderCircle } from "react-icons/lu";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingOperation, setIsLoadingOperation] = useState(false);
  const {
    isConnected,
    isLoading,
    wallet,
    handleCheckIfAuthenticated,
    handleSign,
    error,
  } = useAuth();

  useEffect(() => {
    handleCheckIfAuthenticated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <LuLoaderCircle className="animate-spin" />;
  }

  return (
    <div className="absolute w-64 h-64 m-auto left-0 right-0 top-0 bottom-0">
      {isConnected ? (
        <div className="flex flex-col gap-4 items-center text-center">
          <p>
            The wallet connected is <span className="font-bold">{wallet}</span>
          </p>
          <button
            onClick={async () => {
              setIsLoadingOperation(true);
              await handleSign();
              setIsLoadingOperation(false);
            }}
          >
            {isLoadingOperation ? (
              <LuLoaderCircle className="animate-spin" />
            ) : (
              "Sponsor my transaction"
            )}
          </button>
          <p className="text-red-500 pt-8 w-[550px] h-[200px] overflow-scroll text-center">
            {error}
          </p>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)}>Sign in with Para</button>
      )}
      <ParaModal
        para={para}
        isOpen={isOpen}
        onClose={() => {
          handleCheckIfAuthenticated();
          setIsOpen(false);
        }}
      />
    </div>
  );
}

export default App;
