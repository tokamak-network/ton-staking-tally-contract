/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type { BaseContract, BigNumber, Signer, utils } from "ethers";
import type { EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../../common";

export interface IPowerTONSwapperEventInterface extends utils.Interface {
  functions: {};

  events: {
    "Distributed(address,uint256)": EventFragment;
    "OnDeposit(address,address,uint256)": EventFragment;
    "OnWithdraw(address,address,uint256)": EventFragment;
    "Swapped(uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Distributed"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OnDeposit"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "OnWithdraw"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Swapped"): EventFragment;
}

export interface DistributedEventObject {
  token: string;
  amount: BigNumber;
}
export type DistributedEvent = TypedEvent<
  [string, BigNumber],
  DistributedEventObject
>;

export type DistributedEventFilter = TypedEventFilter<DistributedEvent>;

export interface OnDepositEventObject {
  layer2: string;
  account: string;
  amount: BigNumber;
}
export type OnDepositEvent = TypedEvent<
  [string, string, BigNumber],
  OnDepositEventObject
>;

export type OnDepositEventFilter = TypedEventFilter<OnDepositEvent>;

export interface OnWithdrawEventObject {
  layer2: string;
  account: string;
  amount: BigNumber;
}
export type OnWithdrawEvent = TypedEvent<
  [string, string, BigNumber],
  OnWithdrawEventObject
>;

export type OnWithdrawEventFilter = TypedEventFilter<OnWithdrawEvent>;

export interface SwappedEventObject {
  amount: BigNumber;
}
export type SwappedEvent = TypedEvent<[BigNumber], SwappedEventObject>;

export type SwappedEventFilter = TypedEventFilter<SwappedEvent>;

export interface IPowerTONSwapperEvent extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IPowerTONSwapperEventInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {};

  callStatic: {};

  filters: {
    "Distributed(address,uint256)"(
      token?: null,
      amount?: null
    ): DistributedEventFilter;
    Distributed(token?: null, amount?: null): DistributedEventFilter;

    "OnDeposit(address,address,uint256)"(
      layer2?: null,
      account?: PromiseOrValue<string> | null,
      amount?: null
    ): OnDepositEventFilter;
    OnDeposit(
      layer2?: null,
      account?: PromiseOrValue<string> | null,
      amount?: null
    ): OnDepositEventFilter;

    "OnWithdraw(address,address,uint256)"(
      layer2?: null,
      account?: PromiseOrValue<string> | null,
      amount?: null
    ): OnWithdrawEventFilter;
    OnWithdraw(
      layer2?: null,
      account?: PromiseOrValue<string> | null,
      amount?: null
    ): OnWithdrawEventFilter;

    "Swapped(uint256)"(amount?: null): SwappedEventFilter;
    Swapped(amount?: null): SwappedEventFilter;
  };

  estimateGas: {};

  populateTransaction: {};
}
