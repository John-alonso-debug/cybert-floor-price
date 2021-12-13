/*
 * @Author: your name
 * @Date: 2021-03-09 13:43:44
 * @LastEditTime: 2021-03-16 11:50:01
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /protocol-demo/frontend/src/components/AssetRow.tsx
 */
import * as React from "react";
import styled from "styled-components";
import Icon from "./Icon";
import ERC20Icon from "./ERC20Icon";
import eth from "../assets/eth.svg";
import xdai from "../assets/xdai.png";
import {
  handleSignificantDecimals,
  convertAmountFromRawNumber,
} from "../helpers/bignumber";

const SAssetRow = styled.div`
  width: 100%;
  padding: 20px;
  display: flex;
  justify-content: space-between;
`;
const SAssetRowLeft = styled.div`
  display: flex;
`;
const SAssetName = styled.div`
  display: flex;
  margin-left: 10px;
`;
const SAssetRowRight = styled.div`
  display: flex;
`;
const SAssetBalance = styled.div`
  display: flex;
`;

const AssetRow = (props: any) => {
  const { asset } = props;
  const nativeCurrencyIcon =
    asset.symbol && asset.symbol.toLowerCase() === "eth"
      ? eth
      : asset.symbol && asset.symbol.toLowerCase() === "xdai"
      ? xdai
      : null;
  return (
    <SAssetRow {...props}>
      <SAssetRowLeft>
        {nativeCurrencyIcon ? (
          <Icon src={nativeCurrencyIcon} />
        ) : (
          <ERC20Icon contractAddress={asset.contractAddress.toLowerCase()} />
        )}
        <SAssetName>{asset.name}</SAssetName>
      </SAssetRowLeft>
      <SAssetRowRight>
        <SAssetBalance>
          {`${handleSignificantDecimals(
            convertAmountFromRawNumber(asset.balance),
            asset.decimals
          )} ${asset.symbol}`}
        </SAssetBalance>
      </SAssetRowRight>
    </SAssetRow>
  );
};

export default AssetRow;
