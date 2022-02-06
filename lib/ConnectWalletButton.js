import {Button, Box, Text, Center } from "@chakra-ui/react"
import {ethers} from 'ethers';
import { useState } from "react";
export default function ConnectWalletButton () {
    const [network, setNetwork] = useState('rinkeby');
    let signer = '';
    async function connectWallet() {
        const provider = new ethers.providers.Web3Provider(window.ethereum, network);
        // Check if MetaMask installed
        if (window.ethereum) {
            await provider.send("eth_requestAccounts", []);
            signer = provider.getSigner();
            console.log("Account: ", await signer.getAddress());
            const balance = await provider.getBalance(signer.getAddress());
            console.log("Balance: ", balance);
        }

        else{
            alert("No wallet detected, please install metamask.")
        }
    }

    return (
        signer ? (
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
            {signer &&
                `${signer.getAddress().slice(0, 6)}...${signer.getAddress().slice(
                signer.getAddress().length - 4,
                signer.getAddress().length
                )}`}
            </Text>
        </Button>
        )
        :
        <Button mt={4} colorScheme='teal' type='submit' className="connectButton" onClick={connectWallet} >
        Connect Wallet
        </Button>
    )
}