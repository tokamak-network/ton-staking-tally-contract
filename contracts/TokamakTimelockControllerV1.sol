// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/governance/TimelockController.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokamakTimelockControllerV1 is TimelockController, Ownable{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    )
    Ownable(msg.sender)
    TimelockController(minDelay,proposers,executors,admin)
    {

    }

    function grantAllRole(address grantedAddress) public onlyOwner {
        super._grantRole(PROPOSER_ROLE, grantedAddress);
        super._grantRole(CANCELLER_ROLE, grantedAddress);
        super._grantRole(EXECUTOR_ROLE, grantedAddress);
    }

}
