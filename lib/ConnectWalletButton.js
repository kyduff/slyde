import {Button, Box, Text, Center } from "@chakra-ui/react"
import {ethers} from 'ethers';
import { useState } from "react";
export default function ConnectWalletButton (props) {
    const [signerState, setSignerState] = useState('');
    const [address, setAddress] = useState('');

    function shortenAddress(address) {
        console.log(address);
        return address.slice(0,4) + "..." + address.slice(-4);
      }
    
    async function connectWallet() {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        // Check if MetaMask installed
        if (window.ethereum) {
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const address = await signer.getAddress();
            console.log("Account: ", await address);
            setAddress(address);
            const balance = await provider.getBalance(signer.getAddress());
            console.log("Balance: ", balance);
            setSignerState(signer);
        }

        else{
            alert("No wallet detected, please install metamask.")
        }
    }

    return (
        signerState ? (
            <Button
            bg="gray.800"
            border="1px solid transparent"
            _hover={{
            border: "1px",
            borderStyle: "solid",
            borderColor: "blue.400",
            backgroundColor: "gray.700",
            }}
            borderRadius="xl"
            m="1px"
            px={3}
            height="38px"
        >
            <Text color="white" fontSize="md" fontWeight="medium" mr="2">
            {shortenAddress(address)}
            </Text>
        </Button>
        )
        :
        <Button mt={4} colorScheme='teal' type='submit' className="connectButton" onClick={connectWallet} >
        Connect Wallet
        </Button>
    )
}