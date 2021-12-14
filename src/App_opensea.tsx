/*
 * @Author: your name
 * @Date: 2021-05-22 00:27:06
 * @LastEditTime: 2021-12-13 11:28:44
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /frontend/src/App_sign.tsx
 */
import * as React from "react";
import styled from "styled-components";
import Web3 from "web3";

import Web3Modal from "web3modal";
import { OpenSeaPort, Network } from 'opensea-js';
import Button from "./components/Button";
import Column from "./components/Column";
import Wrapper from "./components/Wrapper";
import Header from "./components/Header";
import Loader from "./components/Loader";
import ConnectButton from "./components/ConnectButton";
import {getChainData} from "./helpers/utilities";
import {IAssetData} from "./helpers/types";
import {fonts} from "./styles";
import "./style.css";
import {ethers,BigNumber} from "ethers";


const SLayout = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  text-align: center;
  font-family:vt323;
  font-size:30px;
`;

const SContent = styled(Wrapper)`
  width: 100%;
  height: 100%;
  padding: 0 16px;
`;

const SContainer = styled.div`
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  word-break: break-word;
`;

const SLanding = styled(Column)`
  height: 600px;
`;


// @ts-ignore
const SBalances = styled(SLanding)`
  height: 100%;
  & h3 {
    padding-top: 10px;
  }
`;

const STestButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
`;

const STestButton = styled(Button)`
  border-radius: 8px;
  font-size: ${fonts.size.medium};
  height: 44px;
  width: 100%;
  max-width: 175px;
  margin: 12px;
  font-family:vt323;
`;

const STestInput = styled.textarea`
    background-color: #f9f9f9;
    border: 0;
    border-radius: 4px;
    height: 200px;
    padding: 13px 15px;
    resize: none;
    width: 100%;
`;

interface IAppState {
    fetching: boolean;
    address: string;
    web3: any;
    provider: any;
    connected: boolean;
    chainId: number;
    networkId: number;
    assets: IAssetData[];
    assets2: IAssetData[];
    showModal: boolean;
    pendingRequest: boolean;
    result: any | null;
    tokenAddress: string;
    tokenIds: string;
    average_price:number;
    floor_price:number;
    total_volume:number;
    one_day_average_price:number;
    price:number;
    approved:boolean
}

const INITIAL_STATE: IAppState = {
    fetching: false,
    address: "",
    web3: null,
    provider: null,
    connected: false,
    chainId: 1,
    networkId: 1,
    assets: [],
    assets2: [],
    showModal: false,
    pendingRequest: false,
    result: null,
    tokenAddress: "",
    tokenIds:"",
    one_day_average_price:0,
    average_price:0,
    floor_price:0,
    total_volume:0,
    price:0,
    approved: false,

};

function initWeb3(provider: any) {
    const web3: any = new Web3(provider);

    web3.eth.extend({
        methods: [
            {
                name: "chainId",
                call: "eth_chainId",
                outputFormatter: web3.utils.hexToNumber
            }
        ]
    });

    return web3;
}

class App extends React.Component<any, any> {
    // @ts-ignore
    public web3Modal: Web3Modal;
    public state: IAppState;

    constructor(props: any) {
        super(props);
        this.state = {
            ...INITIAL_STATE
        };

        this.web3Modal = new Web3Modal({
            network: this.getNetwork(),
            cacheProvider: true,
        });
    }




    public componentDidMount() {
        if (this.web3Modal.cachedProvider) {
            this.onConnect();
        }


    }

    public onConnect = async () => {
        const provider = await this.web3Modal.connect();

        await this.subscribeProvider(provider);

        const web3: any = initWeb3(provider);

        const accounts = await web3.eth.getAccounts();

        const address = accounts[0];

        const networkId = await web3.eth.net.getId();

        const chainId = await web3.eth.chainId();

        console.log(`chainId is ${chainId}  networkId ${networkId}`)

        await this.setState({
            web3,
            provider,
            connected: true,
            address,
            chainId,
            networkId,
            approved:false
        });


    };

    public subscribeProvider = async (provider: any) => {
        if (!provider.on) {
            return;
        }
        provider.on("close", () => this.resetApp());
        provider.on("accountsChanged", async (accounts: string[]) => {
            await this.setState({address: accounts[0]});

            await  this.getApproval();
            //await this.setState({approved: false});

        });
        provider.on("chainChanged", async (chainId: number) => {
            const {web3} = this.state;
            const networkId = await web3.eth.net.getId();
            await this.setState({chainId, networkId});
            await  this.getApproval();

        });

        provider.on("networkChanged", async (networkId: number) => {
            const {web3} = this.state;
            const chainId = await web3.eth.chainId();
            await this.setState({chainId, networkId});
            await  this.getApproval();

        });
    };

    public getNetwork = () => getChainData(this.state.chainId).network;

    public resetApp = async () => {
        const {web3} = this.state;
        if (web3 && web3.currentProvider && web3.currentProvider.close) {
            await web3.currentProvider.close();
        }
        await this.web3Modal.clearCachedProvider();
        this.setState({...INITIAL_STATE});
        //set opensea contract
    };

    public settokenAddress = (value: any) => {
        this.setState({tokenAddress: value.target.value})
    }

    public settokenIds = (value: any) => {
        this.setState({tokenIds: value.target.value})
    }

    public setprice = (value: any) => {
        this.setState({price: value.target.value})
    }



    public getApproval = async ()=> {
        const provider = await this.web3Modal.connect();
        const prov = new ethers.providers.Web3Provider(provider);
        let web3 = new Web3(Web3.givenProvider);
        const accountAddress = await web3.eth.getAccounts();
        const abi = [
            "function approve(address spender, uint256 amount) returns (bool)",
            "function allowance(address _owner, address _spender) public view returns (uint)"
        ];
        // rinkeby testnet weth address 0xc778417e063141139fce010982780140aa0cd5ab ,https://rinkeby.etherscan.io/address/0xc778417e063141139fce010982780140aa0cd5ab#code
        // rinkeby testnet opensea contract 0x82d102457854c985221249f86659c9d6cf12aa72
        const currency = new ethers.Contract("0xc778417e063141139fce010982780140aa0cd5ab", abi, prov.getSigner())
       // const allowance = await currency.allowance(account, getEthAddress(vaultInfo.contractAddress));
        const allowance = await currency.allowance(accountAddress[0], "0x82d102457854c985221249f86659c9d6cf12aa72");
        if (allowance.gte(BigNumber.from('100000000000000'))){
            this.setState({approved:true})
        } else {
            this.setState({approved:false})
        }

    }

    public buy = async () => {
        // const provider = await this.web3Modal.connect();
        // const prov = new ethers.providers.Web3Provider(provider);
        // open modal
        const tokenIds = this.state.tokenIds;
        if(tokenIds === ""){
            alert('Input token ID!')
            return
        }
        const tokenAddress = this.state.tokenAddress;
        if(tokenAddress === ""){
            alert('Input token contract address！')
            return
        }
        const price = this.state.price;
        if(price === 0){
            alert('input price > 0！')
            return
        }
        const ids = tokenIds.split(',')

        const seaport = new OpenSeaPort(window.web3.currentProvider, {
            networkName: Network.Main,
            //apiKey: "7e74c27dc34448d5903a309cc8079038",
        })
        // Token ID and smart contract address for a non-fungible token:
        // The offerer's wallet address:
        let web3 = new Web3(Web3.givenProvider);
        const accountAddress = await web3.eth.getAccounts();



            // createBuyOrder  buy one nft
            ids.forEach(async element => {
                try {
                const offer = await seaport.createBuyOrder({
                    asset: {
                        tokenId:element,
                        tokenAddress,
                    },
                    accountAddress: accountAddress[0],
                    // Value of the offer, in units of the payment token (or wrapped ETH if none is specified):
                    startAmount: price,
                })
                console.log(offer)
                } catch (error) {

                    console.log(error)
                    alert('make offer failed')
                }

            });

            // let assets: { tokenId: string; tokenAddress: string; }[] = []
            // ids.forEach(element => {
            //     assets.push({tokenId:element, tokenAddress:tokenAddress})
            // });
            // const offer = await seaport.createBundleBuyOrder({
            //     assets,
            //     accountAddress: accountAddress[0],
            //     startAmount: price,
            //     // Optional expiration time for the order, in Unix time (seconds):
            //     // expirationTime: Math.round(Date.now() / 1000 + 60 * 60 * 24) // One day from now
            // })
            // console.log(offer)
            // alert('成功')


    }

    public getData = async() => {
        const tokenAddress = this.state.tokenAddress;
        if(tokenAddress === ""){
            alert('NFT contract address required！') //0x256d31fb5439119026f1301d40ae748a8838c979
            return
        }

        const seaport = new OpenSeaPort(window.web3.currentProvider, {
            networkName: Network.Main, //todo
        })
        const asset = await seaport.api.getAsset({
            tokenAddress: tokenAddress,
            tokenId:null
        })
        const status = asset.collection.stats as any
        console.log(asset.collection.stats)

        this.setState({average_price: status['average_price'],floor_price: status['floor_price'],total_volume:status['total_volume'],one_day_average_price:status['one_day_average_price']})
    }

    public render = () => {
        const {
            address,
            connected,
            chainId,
            fetching,
            average_price,
            floor_price,
            total_volume,
            one_day_average_price
        } = this.state;
        return (
            <SLayout>
                <Column maxWidth={1000} spanHeight>
                    <Header
                        connected={connected}
                        address={address}
                        chainId={chainId}
                        killSession={this.resetApp}
                    />
                    <SContent>
                        {fetching ? (
                            <Column center>
                                <SContainer>
                                    <Loader/>
                                </SContainer>
                            </Column>
                        ) : this.state.address ? (
                            <SBalances>
                                <Column center>
                                    {/* <h6>当前时间:{this.state.curTime}</h6> */}
                                    <br /><h4>Project Detail</h4>
                                        <p>Floor Price：{floor_price}</p>
                                        <p>Average：{average_price}</p>
                                        <p>Total Volume：{total_volume}</p>
                                        <p>Average(Day)：{one_day_average_price}</p>
                                        <br />
                                    <STestButtonContainer>
                                        <h4>NFT Contract Address</h4>
                                        <STestInput style={{height:'40px'}} value={this.state.tokenAddress} onChange={this.settokenAddress}></STestInput>
                                        <h4>TokenID(separate by ",")</h4>
                                        <STestInput style={{height:'40px'}} value={this.state.tokenIds} onChange={this.settokenIds}></STestInput>

                                        <h4>Listed Price</h4>
                                        <STestInput style={{height:'40px'}} value={this.state.price} onChange={this.setprice}></STestInput>

                                        <STestButton left onClick={() => this.getData()}>
                                            Query
                                        </STestButton>
                                        {this.state.approved !== true ?
                                            <div>
                                        <h6 style={{color:'Brown'}}>Before making offer you have to approve WETH used by Opensea marketplace.</h6>
                                        <h6 style={{color:'Brown'}}>For safety reasons, you are strongly advised to do the permission on Opensea market.</h6>
                                        <STestButton left onClick={() => this.getApproval()}>
                                            Check Approved WETH permission
                                        </STestButton></div>
                                            :

                                        <STestButton left onClick={() => this.buy()}>
                                            Make Offer
                                        </STestButton>
                                            }

                                    </STestButtonContainer>
                                </Column>

                            </SBalances>
                        ) : (
                            <SLanding center>
                                <h6>{`Cybert Lab for Opensea Floor Price`}</h6>
                                <ConnectButton onClick={this.onConnect}/>
                            </SLanding>
                        )}
                    </SContent>
                </Column>
            </SLayout>
        );
    };
}

export default App;
