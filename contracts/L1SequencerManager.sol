// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "./L2MessageTaker.sol";



interface IMessenger {
    function depositTransaction(
        address _to,
        uint256 _value,
        uint64 _gasLimit,
        bool _isCreation,
        bytes memory _data
    ) external payable;
}

contract L1SequencerManager is Initializable, OwnableUpgradeable {
    IMessenger public messenger;
    
    address[] public sequencers;
    mapping(address => bool) public isSequencer;
    address public l2receiver;



    event Debug(string _message);
    event AddSequencer(address);
    event RemoveSequencer(address);

    error ZeroLength();
    error SequencerExists();

    function initialize(address _messenger) public initializer {
        __Ownable_init();
        messenger = IMessenger(_messenger);

    }

    function addSequencer_(address sequencer_) internal {
        if (isSequencer[sequencer_]) revert SequencerExists();

        isSequencer[sequencer_] = true;
        sequencers.push(sequencer_);

        emit AddSequencer(sequencer_);
    }

    function addSequencer(address sequencer_) external onlyOwner {
        addSequencer_(sequencer_);
        sendMessageToL2(abi.encodeWithSelector(this.addSequencer.selector, sequencer_));
    }

    function removeSequencer_(address sequencer_) internal {
        require(isSequencer[sequencer_], "SL: not exist");

        isSequencer[sequencer_] = false;
        for (uint i; i < sequencers.length; i++) {
            if (sequencers[i] == sequencer_) {
                sequencers[i] = sequencers[sequencers.length - 1];
                sequencers.pop();
                break;
            }
        }

        emit RemoveSequencer(sequencer_);
    }

    function removeSequencer(address sequencer_) external onlyOwner {
        removeSequencer_(sequencer_);
        sendMessageToL2(abi.encodeWithSelector(this.removeSequencer.selector, sequencer_));
    }

    function newSequencers(address[] calldata sequencers_) external onlyOwner {
        // remove current
        while(sequencers.length != 0) {
            removeSequencer_(sequencers[0]);
        }

        // add new
        for (uint i; i < sequencers_.length; i++) {
            addSequencer_(sequencers_[i]);
        }
    }

    function getSequencers() external view returns(address[] memory) {
       return sequencers;
    }

    function setSequencers(address[] memory sequencers_) external onlyOwner {
        sequencers = new address[](sequencers_.length);
        for (uint256 i = 0; i < sequencers_.length; i++) {
            sequencers[i] = sequencers_[i];
        }
    }


    function setL2Receiver(address _l2receiver) external onlyOwner {
        l2receiver = _l2receiver;
    }

    function sendMessageToL2(bytes memory data) internal {
        messenger.depositTransaction(l2receiver, 0, 150000, false, data);
    }
}
