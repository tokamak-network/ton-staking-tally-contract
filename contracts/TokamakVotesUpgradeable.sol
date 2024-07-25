// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract TokamakVotesUpgradeable is Initializable {

    /// @custom:storage-location erc7201:openzeppelin.storage.TokamakVotes
    struct TokamakVotesStorage {
        address _seigManager;
    }

    // keccak256(abi.encode(uint256(keccak256("openzeppelin.storage.TokamakVotes")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant TokamakVotesStorageLocation = 0xe658ac3a18c8cfefcde0a4aa8512f0810690ab7f31fcb41d55c47a9191d98000 ;

    function _getTokamakVotesStorage() private pure returns (TokamakVotesStorage storage $) {
        assembly {
            $.slot := TokamakVotesStorageLocation
        }
    }

    event ChangedSeigManager(address oldSeigManager, address newSeigManager);

    function __TokamakVotes_init(address seigManager_) internal onlyInitializing {
        _setSeigManager(seigManager_);
    }

    function __TokamakVotes_init_unchained() internal onlyInitializing {
    }

    function seigManager() public view virtual returns (address) {
        TokamakVotesStorage storage $ = _getTokamakVotesStorage();
        return $._seigManager;
    }

    function _setSeigManager(address seigManager_) internal virtual {

        TokamakVotesStorage storage $ = _getTokamakVotesStorage();
        address oldSeigManager = $._seigManager;
        $._seigManager = seigManager_;

        emit ChangedSeigManager(oldSeigManager, seigManager_);
    }

}
