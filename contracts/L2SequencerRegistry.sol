// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "hardhat/console.sol";

library AddressAliasHelper {
    uint160 constant offset = uint160(0x1111000000000000000000000000000000001111);

    /// @notice Utility function that converts the address in the L1 that submitted a tx to
    /// the inbox to the msg.sender viewed in the L2
    /// @param l1Address the address in the L1 that triggered the tx to L2
    /// @return l2Address L2 address as viewed in msg.sender
    function applyL1ToL2Alias(address l1Address) internal pure returns (address l2Address) {
        unchecked {
            l2Address = address(uint160(l1Address) + offset);
        }
    }

    /// @notice Utility function that converts the msg.sender viewed in the L2 to the
    /// address in the L1 that submitted a tx to the inbox
    /// @param l2Address L2 address as viewed in msg.sender
    /// @return l1Address the address in the L1 that triggered the tx to L2
    function undoL1ToL2Alias(address l2Address) internal pure returns (address l1Address) {
        unchecked {
            l1Address = address(uint160(l2Address) - offset);
        }
    }
}

contract L2SequencerRegistry is Initializable {
    address public sender;
    
    address[] public sequencers;
    mapping(address => bool) public isSequencer;
    uint256 totalAvailableReward;
    mapping(address => uint256) public rewards;
    uint256 version;

    error ZeroLength();
    error InvalidSender();
    error InvalidRelayTx();
    error SequencerExists();
    error SequencerNotExists();
    error AlreadyUpgraded();
    error WithdrawRewardFailed();

    event AddSequencer(address);
    event RemoveSequencer(address);

    function initialize(address _l1sender) public initializer {
        sender = AddressAliasHelper.applyL1ToL2Alias(_l1sender);
    }

    receive() external payable {}

    function deposit() external payable {}

    modifier onlySender() {
        if (msg.sender != tx.origin) revert InvalidRelayTx();
        if (msg.sender != sender) revert InvalidSender();
        _;
    }

    modifier checkReward() {
        if (totalAvailableReward < address(this).balance) {
            uint256 rewardToDistribute = address(this).balance - totalAvailableReward;
            for (uint256 i = 0; i < sequencers.length; i++) {
                rewards[sequencers[i]] += rewardToDistribute / sequencers.length;
            }
            totalAvailableReward = address(this).balance;
        }
        _;
    }

    function withdrawReward() external {
        uint256 reward = rewards[msg.sender];
        rewards[msg.sender] = 0;
        totalAvailableReward -= reward;
        (bool success, ) = address(msg.sender).call{value: reward}("");
        if (!success) {
            revert WithdrawRewardFailed();
        }
    }

    function addSequencer_(address s) internal {
        if (isSequencer[s]) revert SequencerExists();

        isSequencer[s] = true;
        sequencers.push(s);

        emit AddSequencer(s);
    }

    function addSequencer(address s) external onlySender checkReward {
        addSequencer_(s);
    }

    function removeSequencer_(address s) internal {
        if (!isSequencer[s]) revert SequencerNotExists();

        isSequencer[s] = false;
        for (uint i; i < sequencers.length; i++) {
            if (sequencers[i] == s) {
                sequencers[i] = sequencers[sequencers.length - 1];
                sequencers.pop();
                break;
            }
        }

        emit RemoveSequencer(s);
    }

    function getSequencers() external view returns(address[] memory) {
       return sequencers;
    }

    function setSequencers(address[] memory s) external onlySender checkReward {
        sequencers = new address[](s.length);
        for (uint256 i = 0; i < s.length; i++) {
            sequencers[i] = s[i];
        }
    }

    function removeSequencer(address s) external onlySender checkReward {
        removeSequencer_(s);
    }
}
