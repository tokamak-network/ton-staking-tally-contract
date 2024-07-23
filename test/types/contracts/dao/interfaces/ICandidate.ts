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

export interface ICandidateInterface extends utils.Interface {
  functions: {
    "candidate()": FunctionFragment;
    "castVote(uint256,uint256,string)": FunctionFragment;
    "changeMember(uint256)": FunctionFragment;
    "claimActivityReward()": FunctionFragment;
    "committee()": FunctionFragment;
    "isCandidateContract()": FunctionFragment;
    "isLayer2Candidate()": FunctionFragment;
    "memo()": FunctionFragment;
    "retireMember()": FunctionFragment;
    "seigManager()": FunctionFragment;
    "setCommittee(address)": FunctionFragment;
    "setMemo(string)": FunctionFragment;
    "setSeigManager(address)": FunctionFragment;
    "stakedOf(address)": FunctionFragment;
    "totalStaked()": FunctionFragment;
    "updateSeigniorage()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "candidate"
      | "castVote"
      | "changeMember"
      | "claimActivityReward"
      | "committee"
      | "isCandidateContract"
      | "isLayer2Candidate"
      | "memo"
      | "retireMember"
      | "seigManager"
      | "setCommittee"
      | "setMemo"
      | "setSeigManager"
      | "stakedOf"
      | "totalStaked"
      | "updateSeigniorage"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "candidate", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "castVote",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "changeMember",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "claimActivityReward",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "committee", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "isCandidateContract",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "isLayer2Candidate",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "memo", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "retireMember",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "seigManager",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setCommittee",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "setMemo",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "setSeigManager",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "stakedOf",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "totalStaked",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "updateSeigniorage",
    values?: undefined
  ): string;

  decodeFunctionResult(functionFragment: "candidate", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "castVote", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "changeMember",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "claimActivityReward",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "committee", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "isCandidateContract",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isLayer2Candidate",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "memo", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "retireMember",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "seigManager",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setCommittee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setMemo", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setSeigManager",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "stakedOf", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "totalStaked",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "updateSeigniorage",
    data: BytesLike
  ): Result;

  events: {};
}

export interface ICandidate extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ICandidateInterface;

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
    candidate(overrides?: CallOverrides): Promise<[string]>;

    castVote(
      _agendaID: PromiseOrValue<BigNumberish>,
      _vote: PromiseOrValue<BigNumberish>,
      _comment: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    changeMember(
      _memberIndex: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    claimActivityReward(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    committee(overrides?: CallOverrides): Promise<[string]>;

    isCandidateContract(overrides?: CallOverrides): Promise<[boolean]>;

    isLayer2Candidate(overrides?: CallOverrides): Promise<[boolean]>;

    memo(overrides?: CallOverrides): Promise<[string]>;

    retireMember(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    seigManager(overrides?: CallOverrides): Promise<[string]>;

    setCommittee(
      _committee: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setMemo(
      _memo: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setSeigManager(
      _seigMan: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    stakedOf(
      _account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { amount: BigNumber }>;

    totalStaked(
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { totalsupply: BigNumber }>;

    updateSeigniorage(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  candidate(overrides?: CallOverrides): Promise<string>;

  castVote(
    _agendaID: PromiseOrValue<BigNumberish>,
    _vote: PromiseOrValue<BigNumberish>,
    _comment: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  changeMember(
    _memberIndex: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  claimActivityReward(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  committee(overrides?: CallOverrides): Promise<string>;

  isCandidateContract(overrides?: CallOverrides): Promise<boolean>;

  isLayer2Candidate(overrides?: CallOverrides): Promise<boolean>;

  memo(overrides?: CallOverrides): Promise<string>;

  retireMember(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  seigManager(overrides?: CallOverrides): Promise<string>;

  setCommittee(
    _committee: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setMemo(
    _memo: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setSeigManager(
    _seigMan: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  stakedOf(
    _account: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  totalStaked(overrides?: CallOverrides): Promise<BigNumber>;

  updateSeigniorage(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    candidate(overrides?: CallOverrides): Promise<string>;

    castVote(
      _agendaID: PromiseOrValue<BigNumberish>,
      _vote: PromiseOrValue<BigNumberish>,
      _comment: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    changeMember(
      _memberIndex: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    claimActivityReward(overrides?: CallOverrides): Promise<void>;

    committee(overrides?: CallOverrides): Promise<string>;

    isCandidateContract(overrides?: CallOverrides): Promise<boolean>;

    isLayer2Candidate(overrides?: CallOverrides): Promise<boolean>;

    memo(overrides?: CallOverrides): Promise<string>;

    retireMember(overrides?: CallOverrides): Promise<boolean>;

    seigManager(overrides?: CallOverrides): Promise<string>;

    setCommittee(
      _committee: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    setMemo(
      _memo: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    setSeigManager(
      _seigMan: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    stakedOf(
      _account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    totalStaked(overrides?: CallOverrides): Promise<BigNumber>;

    updateSeigniorage(overrides?: CallOverrides): Promise<boolean>;
  };

  filters: {};

  estimateGas: {
    candidate(overrides?: CallOverrides): Promise<BigNumber>;

    castVote(
      _agendaID: PromiseOrValue<BigNumberish>,
      _vote: PromiseOrValue<BigNumberish>,
      _comment: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    changeMember(
      _memberIndex: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    claimActivityReward(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    committee(overrides?: CallOverrides): Promise<BigNumber>;

    isCandidateContract(overrides?: CallOverrides): Promise<BigNumber>;

    isLayer2Candidate(overrides?: CallOverrides): Promise<BigNumber>;

    memo(overrides?: CallOverrides): Promise<BigNumber>;

    retireMember(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    seigManager(overrides?: CallOverrides): Promise<BigNumber>;

    setCommittee(
      _committee: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setMemo(
      _memo: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setSeigManager(
      _seigMan: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    stakedOf(
      _account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    totalStaked(overrides?: CallOverrides): Promise<BigNumber>;

    updateSeigniorage(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    candidate(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    castVote(
      _agendaID: PromiseOrValue<BigNumberish>,
      _vote: PromiseOrValue<BigNumberish>,
      _comment: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    changeMember(
      _memberIndex: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    claimActivityReward(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    committee(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    isCandidateContract(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isLayer2Candidate(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    memo(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    retireMember(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    seigManager(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    setCommittee(
      _committee: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setMemo(
      _memo: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setSeigManager(
      _seigMan: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    stakedOf(
      _account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    totalStaked(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    updateSeigniorage(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
