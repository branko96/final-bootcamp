import { chain, createClient } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";

export const client = createClient({
    autoConnect: true,
    connectors: [ new InjectedConnector(), new MetaMaskConnector({chains: [chain.ropsten]})],
})
