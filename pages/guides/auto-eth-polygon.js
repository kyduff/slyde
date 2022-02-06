import ConnectWalletButton from "../../lib/ConnectWalletButton";
import Head from "next/head";
import Header from "../../lib/Header";
import quickswapRouter from "../../contracts/quickswapRouter.json";
import ethERC20Polygon from "../../contracts/ethERC20Polygon.json";
import {ChainId, WETH, Token, Fetcher, Trade, Route, TokenAmount, TradeType, Percent} from "quickswap-sdk"
import {
  Center,
  VStack,
  Code,
  Textarea,
  Heading,
  Input,
  OrderedList,
  InputGroup,
  ListItem,
  InputLeftAddon,
  InputRightAddon,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  Button,
  FormErrorMessage,
  FormHelperText,
  Stack,
} from '@chakra-ui/react'
import {RampInstantSDK} from "@ramp-network/ramp-instant-sdk"
import { useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import {quickswap, tokens} from '../../lib/addressBook';

export default function App() {

    const [address, setAddress] = useState('');
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState();
    const ETH = new Token(ChainId.MATIC, '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', 18)

  
    // const provider = new ethers.providers.Web3Provider(window.ethereum, 137);

    // Works out how much ethereum to buy to send given matic
    // Takes into account slippage, transaction fees, MM fees
    // TODO include live price data and calculate fees
    async function changeToPolygon() { 
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{
            chainId: ChainId.MATIC.toString(16),
        }]
    });
    
    }

    function maticRequired() {
      const ethMatic = 0.000566;
      // adding in 2% for fees and slippage
      const feesPercent = 1.02;
      const maticRequired = (amount / ethMatic)  * feesPercent;
      return maticRequired;
    }

    function shortenAddress(address) {
      return address.slice(0,4) + "..." + address.slice(-4);
    }

    async function handleQuickSwapClick() {
      const provider = new ethers.providers.Web3Provider(window.ethereum, ChainId.MATIC);
      const signer = provider.getSigner();
      const quickswapABI = quickswapRouter.result;
      // instantiate contract
      let contract = new ethers.Contract(quickswap.router, quickswapABI, signer);

      // all swaps use WMATIC internally, note that WETH is acutally WMATIC 
      const ETH = new Token(ChainId.MATIC, '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', 18)
      // provider call data for swapETHForExactTokens()
      // Note that this is fork of quickswap so ETH in function is Matic when on polygon
      // Uses the quickswap-SDK to generate call data
      console.log(WETH[ETH.chainId].chainId);
      const pair = await Fetcher.fetchPairData(WETH[ETH.chainId], ETH, provider);
      const route = new Route([pair], WETH[ETH.chainId]);
      const amountOut = ethers.utils.parseEther(amount.toString());
      const trade = new Trade(
        route,
        new TokenAmount(ETH, amountOut),
        TradeType.EXACT_OUTPUT
      );
      const slippageTolerance = new Percent('50', '1000'); // 0.5%, not sure how to include slippage for this?
      
      //const amountInMax = trade.maximumAmountIn(slippageTolerance).raw; 
      const path = [WETH[ETH.chainId].address, ETH.address];
      const to = signer.getAddress();
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
      const value = trade.inputAmount.raw;


      const tx = await contract.swapETHForExactTokens(amountOut.toString(), path, to, deadline, {value: value.toString()});
      console.log(tx);
    }


    async function handleRampClick() {
      const provider = new ethers.providers.Web3Provider(window.ethereum, 137);
      const signer = provider.getSigner();
      const matic = maticRequired(amount);
      const maticAddress = quickswap.router;
      console.log(maticAddress);

      const maticWei = ethers.utils.parseEther(matic.toString());
      setAddress(signer.getAddress());

      let widget = new RampInstantSDK({
        hostAppName: "Slyde",
        hostLogoUrl: 'https://rampnetwork.github.io/assets/misc/test-logo.png',
        variant : 'auto',
        swapAsset: "MATIC",
        swapAmount: maticWei,
        userAddress: signer.getAddress()
      });
      widget.show();

    }

    async function handleSendClick() { 
      const provider = new ethers.providers.Web3Provider(window.ethereum, 137);
      const signer = provider.getSigner();
      const wethABI = ethERC20Polygon;
      const wethContract = new ethers.contract(ETH.address, wethABI, signer);
      const weth = ethers.utils.parseEther(amount);
      const tx = await wethContract.transfer(recipient, weth);

    }
    // TODO validate inputs
    // TODO, move inputs to front page?
 
    return (
      <div>
        <Header title="Send Ethereum to Polygon Account" network={137}/>
        <Center>
        <VStack margin="auto"
        spacing = {8} >
        <FormControl className="inputs" isRequired>
          <FormLabel htmlFor="amountEth">Eth to send</FormLabel>
          <InputGroup>
            <NumberInput>
              <NumberInputField id='funds' placeholder='1' value={amount} onChange={e => setAmount(e.target.value)}/>
            </NumberInput>
            <InputRightAddon children='Eth' />
          </InputGroup>
          <FormLabel htmlFor="receipient">Recipient Address</FormLabel>
            <Input placeholder="0xb794f5ea0ba39494ce839613fffba74279579268" value={recipient} onChange={e => setRecipient(e.target.value)}/>
        </FormControl>
        <OrderedList>
            <ListItem>Switch your Web3 wallet to Polygon (Matic) chain.</ListItem>
           
            <ListItem>Buy Matic on polygon network using Ramp.</ListItem>
            <Center>
              <Button mt={4} colorScheme='teal' margin="20px 0px" onClick={handleRampClick}>Buy Eth with Ramp Instant</Button>
            </Center>
            <ListItem>Swap Matic for wrapped Ethereum (wETH) using Quickswap.</ListItem>
            <Center>
              <Button mt={4} colorScheme='teal' margin="20px 0px" onClick={handleQuickSwapClick} >Swap Matic for Eth</Button>
            </ Center>
            <ListItem>Send wETH to <Code>{recipient ? shortenAddress(recipient) : shortenAddress("0x0000000000000000000")}</Code> using Web3 wallet.</ListItem>
            <Center>
              <Button mt={4} colorScheme='teal' margin="20px 0px" onClick={handleSendClick} >Send Eth to recipient.</Button>
            </ Center>
          </OrderedList>
        </VStack>
      </Center>
      </div>
    )
  }