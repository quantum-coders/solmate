import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, Keypair, TransactionInstruction, sendAndConfirmTransaction} from '@solana/web3.js';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { ref } from 'vue';
import { Buffer } from 'buffer';
// import env
export const useWeb3 = () => {
  const adapter = new SolflareWalletAdapter();
  const balance = ref(null);
  const address = ref(null);
  const isConnected = ref(false);
  const config = useRuntimeConfig();
  const connection = new Connection(config.public.solanaRPC, 'confirmed');

  const connectWallet = async function() {
    try {
      const version = await connection.getVersion();
      console.log('Connection to cluster established:', version);

      await adapter.connect();
      if (adapter.connected) {
        console.log('Wallet connected');
        address.value = adapter.publicKey?.toString();
        isConnected.value = true;
        await getBalance();
      } else {
        console.log('Please connect your wallet');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const createAccount = async function() {
    const newAccount = Keypair.generate();
    const publicKeyBase58 = newAccount.publicKey.toBase58();  // Convert to base58
    const secretKeyBase58 = newAccount.secretKey.reduce(
      (secretKeyString, byte) => secretKeyString + byte.toString(16).padStart(2, "0"),
      ""
    );  // Convert to hexadecimal string
  
    const htmlBeauty = `<p>La cuenta fue creada con exito! <br> Public key (base58): ${publicKeyBase58}</p><p>Private key (hexadecimal): ${secretKeyBase58}</p><br><p>Guarda tu private key en un lugar seguro, no la compartas con nadie!</p>`;
    console.log(htmlBeauty);
    return htmlBeauty;
  };
  
  const getBalance = async function() {
    try {
      if (isConnected.value && address.value) {
        balance.value = await connection.getBalance(new PublicKey(address.value));
        // parse balance to SOL
        const parsedBalance = balance.value / LAMPORTS_PER_SOL;
        balance.value = parsedBalance;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const createTransaction = async function(transactionJSON) {
    try {
      console.log("transactionJSON: ", transactionJSON);
      window.Buffer = Buffer;
      if (!isConnected.value) {
        await connectWallet();
      }
      const senderPubicKey = address.value;
      const {action, details} = transactionJSON;
      switch(action) {
        case 'transfer':
          // convert amount to Solana bigInt  (1 SOL = 10^9 lamports)          
          const detailsParse = details.amount * LAMPORTS_PER_SOL
  
          /*  console log all variables that i will send as transzaction */
          console.log("senderPubicKey: ", senderPubicKey);
          console.log("details.receiver: ", details.receiver);
          console.log("detailsParse: ", detailsParse);
  
          const transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: new PublicKey(senderPubicKey),
              toPubkey: new PublicKey(details.receiver),
              lamports: detailsParse.toString(),
            })
          );
          const {blockhash} = await connection.getRecentBlockhash();
          transaction.recentBlockhash = blockhash;
          transaction.feePayer = new PublicKey(senderPubicKey);
          let signed;
          try {
            signed = await adapter.signTransaction(transaction);
          } catch (err) {
            console.error('Transaction signing was cancelled by the user');
            return 'Transaction cancelled';
          }
          const txid = await connection.sendRawTransaction(signed.serialize());
          // retorna el id de la transacción como un link a solscan
      // https://solscan.io/ 
      const finalLink = `Transaccion exitosa: puedes ver el estado de tu transaccion aqui: <a href='https://solscan.io/tx/${txid}'>https://solscan.io/tx/${txid}<a/>`;
          return finalLink;
          break;
        case 'create_account':
          return await createAccount();
          break;
  
        case 'check_balance':
          const accountId =  details.accountId
          balance.value = await connection.getBalance(new PublicKey(accountId));
          console.log("Balance: ", balance.value);
          const parsedBalance = balance.value / LAMPORTS_PER_SOL;
          const htmlBeauty = `<p>Balance: ${parsedBalance} SOL</p>`;
          return htmlBeauty;
          break;
      }
    } catch (err) {
      console.error(err);
    }
  };

  return {
    connectWallet,
    getBalance,
    createTransaction,
    balance,
    address,
    isConnected,
  };
};
