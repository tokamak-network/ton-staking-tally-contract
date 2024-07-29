// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20VotesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

error NotSupported();

contract VoteERC20 is
    Initializable,
    ERC20Upgradeable,
    ERC20PausableUpgradeable,
    AccessControlUpgradeable,
    ERC20PermitUpgradeable,
    ERC20VotesUpgradeable
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
        address minter
    )
        initializer public
    {
        __ERC20_init(name_, symbol_);
        __ERC20Pausable_init();
        __AccessControl_init();
        __ERC20Permit_init(name_);
        __ERC20Votes_init();
        if (admin != address(0)) _grantRole(DEFAULT_ADMIN_ROLE, admin);
        if (pauser != address(0)) _grantRole(PAUSER_ROLE, admin);
        if (minter != address(0)) _grantRole(MINTER_ROLE, admin);
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

    /**
     * @notice Mints new tokens and assigns them to the specified address.
     * @param to The address to receive the minted tokens.
     * @param amount The amount of tokens to mint.
     */
    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) whenNotPaused {
        _mint(to, amount);
    }

    function _burn(uint256 amount) public whenNotPaused {
        _burn(msg.sender, amount);
    }

    function decimals() public pure override returns (uint8) {
        return 27;
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
