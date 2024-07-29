// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import "./TokamakVotesUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

error NotSupported();
error ZeroAddressError();
error ZeroSeigManagerError();
error ZeroValueError();
error InsufficientStakedAmount();

interface ISeigManager {
    function increaseVoteToken(address account, uint256 amount) external;
    function decreaseVoteToken(address account, uint256 amount) external;
    function availableRequestWithdraw(address account) external view returns (uint256 amount);
    function stakeOfTotal() external view returns (uint256 amount);
}

contract TokamakVoteERC20 is
    Initializable,
    ERC20Upgradeable,
    ERC20PausableUpgradeable,
    AccessControlUpgradeable,
    ERC20PermitUpgradeable,
    ERC20VotesUpgradeable,
    TokamakVotesUpgradeable
{
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function initialize(
        string memory name_,
        string memory symbol_,
        address admin,
        address pauser,
        address minter,
        address seigManager_
    )
        initializer public
    {
        if (seigManager_ == address(0)) revert ZeroSeigManagerError();

        __ERC20_init(name_, symbol_);
        __ERC20Pausable_init();
        __AccessControl_init();
        __ERC20Permit_init(name_);
        __ERC20Votes_init();
        __TokamakVotes_init(seigManager_);
        if (admin != address(0)) _grantRole(DEFAULT_ADMIN_ROLE, admin);
        if (pauser != address(0)) _grantRole(PAUSER_ROLE, admin);
        if (minter != address(0)) _grantRole(MINTER_ROLE, admin);
    }

    function setSeigManager(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        if (account == address(0)) revert ZeroAddressError();
        _setSeigManager(account);
    }

    /**
     * @notice Pauses all token transfers. Only callable by an address with the pauser role.
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @notice Unpauses token transfers. Only callable by an address with the pauser role.
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function mint(uint256 amount) public whenNotPaused {
        address to = msg.sender;
        _noneZeroValue(amount);
        uint256 availableAmount = _mintableAmount(to);
        if (availableAmount < amount) revert InsufficientStakedAmount();
        ISeigManager(seigManager()).increaseVoteToken(to, amount);
        _mint(to, amount);
    }

    function burn(uint256 amount) public whenNotPaused {
        address to = msg.sender;
        _noneZeroValue(amount);
        require(balanceOf(to) >= amount, "Insufficient balance");
        ISeigManager(seigManager()).decreaseVoteToken(to, amount);
        _burn(msg.sender, amount);
    }

    function mintableAmount(address account) public view returns(uint256 amount) {
        return _mintableAmount(account);
    }

    function _mintableAmount(address account) internal view returns(uint256 amount) {
        amount = ISeigManager(seigManager()).availableRequestWithdraw(account);
        if (amount != 0) amount = amount / 1e9;
    }

    function _noneZeroValue(uint256 amount) internal pure {
        if (amount == 0) revert ZeroValueError();
    }

    function decimals() public pure override returns (uint8) {
        return 18;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return super.balanceOf(account);
    }

    function totalSupply() public view override returns (uint256) {
        return super.totalSupply();
    }

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20Upgradeable, ERC20PausableUpgradeable, ERC20VotesUpgradeable)
    {
        return super._update(from, to, value);
    }

    /**
     * @notice Retrieves the nonce for a particular owner.
     * @param owner The address of the owner for which the nonce is retrieved.
     * @return The nonce for the given owner.
     */
    function nonces(address owner)
        public
        view
        override(ERC20PermitUpgradeable, NoncesUpgradeable)
        returns (uint256)
    {
        return super.nonces(owner);
    }


    function transfer(address to, uint256 value) public override returns (bool) {
        revert NotSupported();
        // return false;
    }

    function allowance(address owner, address spender) public pure override returns (uint256) {
        return 0;
    }

    function approve(address spender, uint256 value) public override returns (bool) {
        revert NotSupported();
        // return false;
    }

    function transferFrom(address from, address to, uint256 value) public override returns (bool) {
        revert NotSupported();
        // return false;
    }

}
