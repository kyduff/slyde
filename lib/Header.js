import {Flex, Box, Spacer, Heading } from "@chakra-ui/react"
import {ethers} from 'ethers';
import ConnectWalletButton from "./ConnectWalletButton";

export default function Header(props) {
    return (
        <Flex align='center' margin="25px 80px">
            <Box p='2'>
                <Heading size='xl'>{props.title}</Heading>
            </Box>
            <Spacer />
            <Box>
               <ConnectWalletButton network={props.network}/>
            </Box>
        </Flex>
    )
}