const ethers = require("ethers");
const fs = require("fs-extra");

async function main() {

  // DEPLOYED OUR CONTRACT TO THE GANACHE BLOCKCHAIN

  // In provider, provide your rpc url to connect to the blockchain
  const provider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:7545"//it is the rpc url of the ganache network
  );


  //Wallet is from where we want to transfer the ether 
  const wallet = new ethers.Wallet(
    "0xcba006412cb9d3648025e0a8265140dfce0380503a55049c0e1d54f814a5e402",//it is private key of the account that we are using in ganache
    provider
  );


  //from fs / fs-extra we can get the abi and binary compiler
  const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf-8");
    // readFileSync("path of the abi", "utf-8 for encoding the abi")


  const binary = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.bin","utf-8");

  // In ethers contract factory is just an object that is used to deploy the contract
  
  const contractfactory = new ethers.ContractFactory(abi, binary, wallet);
  console.log("Deploying, please wait...");
  // contractfactory comes with all the functionality we have in abi
  const contract = await contractfactory.deploy(); // deplying the contract , wait for the contract to complete
  console.log(contract);
  // contract deployed to te ganache test blockchain

  // we can get the address of the contract that we deployed and hash of block created
  const address = contract.address;// address of the created contract address 
  console.log(address);
  console.log(contract.deployTransaction.hash);// hash of the transaction that we can get from ganache blockchain
  // deploy transaction or transaction response is just what you get creating a block on the blockchain
  console.log("Deployed Transaction ", contract.deployTransaction);


  // TransactionReceipt is what what you get when you wait for blockconformation
  const TransactionReceipt = await contract.deployTransaction.wait(1);// wait(1) means we wait for 1 block conformation to make sure that the transaction is completed
  console.log(TransactionReceipt); 
  
  //Let's create our customised Deployment data
  console.log("Our custom deployment")
  const nonce = await wallet.getTransactionCount();
  const tx ={
    nonce:nonce,
    gasLimit: 6721975,
    gasPrice: 20000000000,
    to: null,
    value: 0,
    data: "0x608060405234801561001057600080fd5b50610771806100206000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80632e64cec11461005c5780636057361d1461007a5780636f760f41146100965780638bab8dd5146100b25780639e7a13ad146100e2575b600080fd5b610064610113565b604051610071919061052a565b60405180910390f35b610094600480360381019061008f919061046d565b61011c565b005b6100b060048036038101906100",
    chainId: 1337
  }
  // Way of signing the transaction and tx is the transaction we wanna send to blockchain
  // signTransaction will create another hash combining tx and private key (we have private key in wallet)
  const sign = await wallet.signTransaction(tx);
  console.log("Signer of the transaction is ",sign);
  

  // In the above two line we only signed the transaction not send to the blockchain 
  // Now we send the transaction to the blockchain 
  // And also in sendTransaction it first sign the transaction ad then send it to the blockchain
  const send = await wallet.sendTransaction(tx);
  await send.wait(1);
  console.log("YAHHHH! Transaction sent ",send);

  //INTERRACT WITH THE CONTRACT

  // retrive is a value returning function so don't have to deploy the function to access it
  const favnumber = await contract.retrieve();
  console.log("Favourite number is ",favnumber.toNumber());
  
  // store is a value changing function so we have to deploy the function to access it and have a parameter to pass
  const transactionResponse = await contract.store(10);
  const receipt = await transactionResponse.wait(1);//after the transaction is completed we get the receipt
  console.log("Transaction receipt ",receipt);

  // Now we can see the value of the favnumber is changed
  const updatedfavnumber = await contract.retrieve();
  console.log("Updated Favourite number is ",updatedfavnumber.toNumber());
}

main()
  .then(() => process.exit(0))
  .catch((error) => console.error(error));

//Ganache is used for setting up a personal Ethereum Blockchain for testing your Solidity contracts.
