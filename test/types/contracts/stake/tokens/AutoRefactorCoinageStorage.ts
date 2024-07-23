/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../../common";

export interface AutoRefactorCoinageStorageInterface extends utils.Interface {
  functions: {
    "REFACTOR_BOUNDARY()": FunctionFragment;
    "REFACTOR_DIVIDER()": FunctionFragment;
    "_allowances(address,address)": FunctionFragment;
    "_factor()": FunctionFragment;
    "_totalSupply()": FunctionFragment;
    "balances(address)": FunctionFragment;
    "name()": FunctionFragment;
    "refactorCount()": FunctionFragment;
    "seigManager()": FunctionFragment;
    "symbol()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "REFACTOR_BOUNDARY"
      | "REFACTOR_DIVIDER"
      | "_allowances"
      | "_factor"
      | "_totalSupply"
      | "balances"
      | "name"
      | "refactorCount"
      | "seigManager"
      | "symbol"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "REFACTOR_BOUNDARY",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "REFACTOR_DIVIDER",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "_allowances",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(functionFragment: "_factor", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "_totalSupply",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "balances",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(functionFragment: "name", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "refactorCount",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "seigManager",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "symbol", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "REFACTOR_BOUNDARY",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "REFACTOR_DIVIDER",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "_allowances",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "_factor", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "_totalSupply",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "balances", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "name", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "refactorCount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "seigManager",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "symbol", data: BytesLike): Result;

  events: {};
}

export interface AutoRefactorCoinageStorage extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: AutoRefactorCoinageStorageInterface;

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

  functions: {
    REFACTOR_BOUNDARY(overrides?: CallOverrides): Promise<[BigNumber]>;

    REFACTOR_DIVIDER(overrides?: CallOverrides): Promise<[BigNumber]>;

    _allowances(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    _factor(overrides?: CallOverrides): Promise<[BigNumber]>;

    _totalSupply(
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber] & {
        balance: BigNumber;
        refactoredCount: BigNumber;
        remain: BigNumber;
      }
    >;

    balances(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber] & {
        balance: BigNumber;
        refactoredCount: BigNumber;
        remain: BigNumber;
      }
    >;

    name(overrides?: CallOverrides): Promise<[string]>;

    refactorCount(overrides?: CallOverrides): Promise<[BigNumber]>;

    seigManager(overrides?: CallOverrides): Promise<[string]>;

    symbol(overrides?: CallOverrides): Promise<[string]>;
  };

  REFACTOR_BOUNDARY(overrides?: CallOverrides): Promise<BigNumber>;

  REFACTOR_DIVIDER(overrides?: CallOverrides): Promise<BigNumber>;

  _allowances(
    arg0: PromiseOrValue<string>,
    arg1: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  _factor(overrides?: CallOverrides): Promise<BigNumber>;

  _totalSupply(
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber, BigNumber] & {
      balance: BigNumber;
      refactoredCount: BigNumber;
      remain: BigNumber;
    }
  >;

  balances(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, BigNumber, BigNumber] & {
      balance: BigNumber;
      refactoredCount: BigNumber;
      remain: BigNumber;
    }
  >;

  name(overrides?: CallOverrides): Promise<string>;

  refactorCount(overrides?: CallOverrides): Promise<BigNumber>;

  seigManager(overrides?: CallOverrides): Promise<string>;

  symbol(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    REFACTOR_BOUNDARY(overrides?: CallOverrides): Promise<BigNumber>;

    REFACTOR_DIVIDER(overrides?: CallOverrides): Promise<BigNumber>;

    _allowances(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    _factor(overrides?: CallOverrides): Promise<BigNumber>;

    _totalSupply(
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber] & {
        balance: BigNumber;
        refactoredCount: BigNumber;
        remain: BigNumber;
      }
    >;

    balances(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, BigNumber, BigNumber] & {
        balance: BigNumber;
        refactoredCount: BigNumber;
        remain: BigNumber;
      }
    >;

    name(overrides?: CallOverrides): Promise<string>;

    refactorCount(overrides?: CallOverrides): Promise<BigNumber>;

    seigManager(overrides?: CallOverrides): Promise<string>;

    symbol(overrides?: CallOverrides): Promise<string>;
  };

  filters: {};

  estimateGas: {
    REFACTOR_BOUNDARY(overrides?: CallOverrides): Promise<BigNumber>;

    REFACTOR_DIVIDER(overrides?: CallOverrides): Promise<BigNumber>;

    _allowances(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    _factor(overrides?: CallOverrides): Promise<BigNumber>;

    _totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

    balances(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    name(overrides?: CallOverrides): Promise<BigNumber>;

    refactorCount(overrides?: CallOverrides): Promise<BigNumber>;

    seigManager(overrides?: CallOverrides): Promise<BigNumber>;

    symbol(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    REFACTOR_BOUNDARY(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    REFACTOR_DIVIDER(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    _allowances(
      arg0: PromiseOrValue<string>,
      arg1: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    _factor(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    _totalSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    balances(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    name(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    refactorCount(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    seigManager(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    symbol(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
