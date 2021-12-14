/*
 * @Author: your name
 * @Date: 2021-03-09 13:43:44
 * @LastEditTime: 2021-03-09 17:37:28
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /protocol-demo/frontend/src/constants/contracts.ts
 */
export interface ContractSetup {
  address: string;
  abi: any[];
}

export const DAI_CONTRACT: { [chainId: number]: ContractSetup } = {
  31337: {
    address: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
    abi: [
      {
        constant: true,
        inputs: [{ name: "src", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: false,
        inputs: [
          { name: "dst", type: "address" },
          { name: "wad", type: "uint256" },
        ],
        name: "transfer",
        outputs: [{ name: "", type: "bool" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
  },
};
