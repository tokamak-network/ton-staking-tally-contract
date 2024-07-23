/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
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

export interface ILockTOSDividendInterface extends utils.Interface {
  functions: {
    "claim(address)": FunctionFragment;
    "claimBatch(address[])": FunctionFragment;
    "claimStartWeeklyEpoch(address,uint256)": FunctionFragment;
    "claimUpTo(address,uint256)": FunctionFragment;
    "claimable(address,address)": FunctionFragment;
    "claimableForPeriod(address,address,uint256,uint256)": FunctionFragment;
    "distribute(address,uint256)": FunctionFragment;
    "getAvailableClaims(address)": FunctionFragment;
    "getCurrentWeeklyEpoch()": FunctionFragment;
    "getCurrentWeeklyEpochTimestamp()": FunctionFragment;
    "getWeeklyEpoch(uint256)": FunctionFragment;
    "ifDistributionPossible()": FunctionFragment;
    "tokensPerWeekAt(address,uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "claim"
      | "claimBatch"
      | "claimStartWeeklyEpoch"
      | "claimUpTo"
      | "claimable"
      | "claimableForPeriod"
      | "distribute"
      | "getAvailableClaims"
      | "getCurrentWeeklyEpoch"
      | "getCurrentWeeklyEpochTimestamp"
      | "getWeeklyEpoch"
      | "ifDistributionPossible"
      | "tokensPerWeekAt"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "claim",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "claimBatch",
    values: [PromiseOrValue<string>[]]
  ): string;
  encodeFunctionData(
    functionFragment: "claimStartWeeklyEpoch",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "claimUpTo",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "claimable",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "claimableForPeriod",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "distribute",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getAvailableClaims",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getCurrentWeeklyEpoch",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getCurrentWeeklyEpochTimestamp",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getWeeklyEpoch",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "ifDistributionPossible",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "tokensPerWeekAt",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;

  decodeFunctionResult(functionFragment: "claim", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "claimBatch", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "claimStartWeeklyEpoch",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "claimUpTo", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "claimable", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "claimableForPeriod",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "distribute", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getAvailableClaims",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCurrentWeeklyEpoch",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCurrentWeeklyEpochTimestamp",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getWeeklyEpoch",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "ifDistributionPossible",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "tokensPerWeekAt",
    data: BytesLike
  ): Result;

  events: {};
}

export interface ILockTOSDividend extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ILockTOSDividendInterface;

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
    claim(
      _token: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    claimBatch(
      _tokens: PromiseOrValue<string>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    claimStartWeeklyEpoch(
      _token: PromiseOrValue<string>,
      _lockId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    claimUpTo(
      _token: PromiseOrValue<string>,
      _timestamp: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    claimable(
      _account: PromiseOrValue<string>,
      _token: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    claimableForPeriod(
      _account: PromiseOrValue<string>,
      _token: PromiseOrValue<string>,
      _timeStart: PromiseOrValue<BigNumberish>,
      _timeEnd: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    distribute(
      _token: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getAvailableClaims(
      _account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<
      [string[], BigNumber[]] & {
        claimableTokens: string[];
        claimableAmounts: BigNumber[];
      }
    >;

    getCurrentWeeklyEpoch(overrides?: CallOverrides): Promise<[BigNumber]>;

    getCurrentWeeklyEpochTimestamp(
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getWeeklyEpoch(
      _timestamp: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    ifDistributionPossible(overrides?: CallOverrides): Promise<[boolean]>;

    tokensPerWeekAt(
      _token: PromiseOrValue<string>,
      _timestamp: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;
  };

  claim(
    _token: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  claimBatch(
    _tokens: PromiseOrValue<string>[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  claimStartWeeklyEpoch(
    _token: PromiseOrValue<string>,
    _lockId: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  claimUpTo(
    _token: PromiseOrValue<string>,
    _timestamp: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  claimable(
    _account: PromiseOrValue<string>,
    _token: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  claimableForPeriod(
    _account: PromiseOrValue<string>,
    _token: PromiseOrValue<string>,
    _timeStart: PromiseOrValue<BigNumberish>,
    _timeEnd: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  distribute(
    _token: PromiseOrValue<string>,
    _amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getAvailableClaims(
    _account: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<
    [string[], BigNumber[]] & {
      claimableTokens: string[];
      claimableAmounts: BigNumber[];
    }
  >;

  getCurrentWeeklyEpoch(overrides?: CallOverrides): Promise<BigNumber>;

  getCurrentWeeklyEpochTimestamp(overrides?: CallOverrides): Promise<BigNumber>;

  getWeeklyEpoch(
    _timestamp: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  ifDistributionPossible(overrides?: CallOverrides): Promise<boolean>;

  tokensPerWeekAt(
    _token: PromiseOrValue<string>,
    _timestamp: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  callStatic: {
    claim(
      _token: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    claimBatch(
      _tokens: PromiseOrValue<string>[],
      overrides?: CallOverrides
    ): Promise<void>;

    claimStartWeeklyEpoch(
      _token: PromiseOrValue<string>,
      _lockId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    claimUpTo(
      _token: PromiseOrValue<string>,
      _timestamp: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    claimable(
      _account: PromiseOrValue<string>,
      _token: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    claimableForPeriod(
      _account: PromiseOrValue<string>,
      _token: PromiseOrValue<string>,
      _timeStart: PromiseOrValue<BigNumberish>,
      _timeEnd: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    distribute(
      _token: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    getAvailableClaims(
      _account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<
      [string[], BigNumber[]] & {
        claimableTokens: string[];
        claimableAmounts: BigNumber[];
      }
    >;

    getCurrentWeeklyEpoch(overrides?: CallOverrides): Promise<BigNumber>;

    getCurrentWeeklyEpochTimestamp(
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getWeeklyEpoch(
      _timestamp: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    ifDistributionPossible(overrides?: CallOverrides): Promise<boolean>;

    tokensPerWeekAt(
      _token: PromiseOrValue<string>,
      _timestamp: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    claim(
      _token: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    claimBatch(
      _tokens: PromiseOrValue<string>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    claimStartWeeklyEpoch(
      _token: PromiseOrValue<string>,
      _lockId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    claimUpTo(
      _token: PromiseOrValue<string>,
      _timestamp: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    claimable(
      _account: PromiseOrValue<string>,
      _token: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    claimableForPeriod(
      _account: PromiseOrValue<string>,
      _token: PromiseOrValue<string>,
      _timeStart: PromiseOrValue<BigNumberish>,
      _timeEnd: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    distribute(
      _token: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    getAvailableClaims(
      _account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getCurrentWeeklyEpoch(overrides?: CallOverrides): Promise<BigNumber>;

    getCurrentWeeklyEpochTimestamp(
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getWeeklyEpoch(
      _timestamp: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    ifDistributionPossible(overrides?: CallOverrides): Promise<BigNumber>;

    tokensPerWeekAt(
      _token: PromiseOrValue<string>,
      _timestamp: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    claim(
      _token: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    claimBatch(
      _tokens: PromiseOrValue<string>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    claimStartWeeklyEpoch(
      _token: PromiseOrValue<string>,
      _lockId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    claimUpTo(
      _token: PromiseOrValue<string>,
      _timestamp: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    claimable(
      _account: PromiseOrValue<string>,
      _token: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    claimableForPeriod(
      _account: PromiseOrValue<string>,
      _token: PromiseOrValue<string>,
      _timeStart: PromiseOrValue<BigNumberish>,
      _timeEnd: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    distribute(
      _token: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    getAvailableClaims(
      _account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getCurrentWeeklyEpoch(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getCurrentWeeklyEpochTimestamp(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getWeeklyEpoch(
      _timestamp: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    ifDistributionPossible(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    tokensPerWeekAt(
      _token: PromiseOrValue<string>,
      _timestamp: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
