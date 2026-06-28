// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title EscrowMarketplace
/// @notice Core escrow contract for decentralized second-hand marketplace.
contract EscrowMarketplace is ReentrancyGuard, Ownable {
    enum State {
        Created,
        Locked,
        Delivered,
        DisputeDepositPending,
        Disputed,
        Inactive
    }

    enum ReportType {
        NoVote,
        Misconduct
    }

    enum ReportStatus {
        Pending,
        Upheld,
        Rejected
    }

    struct Item {
        uint256 id;
        address payable seller;
        address buyer;
        uint256 price;
        string metadataHash;
        State state;
        uint256 createdAt;
        uint256 paidAt;
        uint256 deliveredAt;
        bool delisted;
        bool refundRequested;
        uint256 refundRequestedAt;
        uint256 sellerStake;
        bool sellerStakeSettled;
        bool sellerStakeSlashed;
    }

    struct Dispute {
        address disputeInitiator;
        bool initiatorSupportsBuyer;
        uint256 disputeDepositStartedAt;
        uint256 disputeStartedAt;
        bool buyerDepositPaid;
        bool sellerDepositPaid;
        bytes32 buyerEvidenceHash;
        bytes32 sellerEvidenceHash;
        uint256 buyerVotes;
        uint256 sellerVotes;
        uint256 arbiterCountSnapshot;
        uint256 voteThresholdSnapshot;
        bool resolved;
        address[] voters;
        bool reputationCounted;
    }

    struct Report {
        uint256 itemId;
        address reporter;
        address reported;
        ReportType reportType;
        ReportStatus status;
        bytes32 evidenceHash;
        uint256 deposit;
    }

    uint256 public immutable deliveryWindow;
    uint256 public immutable confirmWindow;
    uint256 public immutable arbiterStakeAmount;
    uint256 public immutable minActiveArbiters;
    uint256 public immutable disputeDeposit;
    uint256 public immutable disputeDepositWindow;
    uint256 public immutable disputeWindow;
    uint256 public immutable sellerStakeAmount;
    uint256 public immutable reportDeposit;

    uint256 public nextItemId = 1;
    uint256 public nextReportId = 1;
    mapping(uint256 => Item) public items;
    mapping(uint256 => Dispute) public disputes;
    mapping(uint256 => mapping(address => bool)) public arbiterHasVoted;
    mapping(uint256 => mapping(address => bool)) public arbiterVoteSupportBuyer;
    mapping(address => uint256) public pendingWithdrawals;
    mapping(address => uint256) public arbiterStakes;
    mapping(address => bool) public activeArbiters;
    uint256 public activeArbiterCount;
    mapping(address => uint256) public arbiterLockedDisputeCount;
    mapping(address => uint256) public completedTradeCount;
    mapping(address => uint256) public disputeCount;
    mapping(address => uint256) public buyerWinCount;
    mapping(address => uint256) public sellerWinCount;
    mapping(address => uint256) public sellerStakeSlashedCount;
    mapping(uint256 => Report) public reports;

    error ItemNotFound();
    error NotSeller();
    error NotBuyer();
    error InvalidState();
    error ZeroPrice();
    error EmptyMetadata();
    error IncorrectPayment();
    error SellerCannotBuyOwnItem();
    error ItemNotAvailable();
    error NothingToWithdraw();
    error TransferFailed();
    error RefundNotRequested();
    error RefundAlreadyRequested();
    error TimeoutNotReached();
    error NotYetDelivered();
    error PendingRefundBlocksRelease();
    error DeliveryTimeoutExceeded();
    error PendingRefundBlocksConfirm();
    error InvalidDeliveryWindow();
    error InvalidConfirmWindow();
    error InvalidArbiterStakeAmount();
    error InvalidMinActiveArbiters();
    error IncorrectArbiterStakeAmount();
    error AlreadyActiveArbiter();
    error NotActiveArbiter();
    error ArbiterLockedInDispute();
    error ConflictOfInterestArbiter();
    error ArbiterNotLockedInDispute();
    error InvalidDisputeDeposit();
    error InvalidDisputeDepositWindow();
    error InvalidDisputeWindow();
    error NotPartyToDispute();
    error InsufficientActiveArbiters();
    error EmptyEvidenceHash();
    error IncorrectDisputeDeposit();
    error NotDisputeResponder();
    error DisputeDepositWindowExpired();
    error DisputeDepositWindowNotExpired();
    error NotInDisputedState();
    error NotEligibleToVote();
    error AlreadyVoted();
    error DisputeNotTimedOut();
    error DisputeAlreadyResolved();
    error ResponderDepositAlreadyPaid();
    error InvalidSellerStakeAmount();
    error InvalidReportDeposit();
    error IncorrectSellerStakeAmount();
    error IncorrectReportDeposit();
    error SellerStakeAlreadySettled();
    error InvalidReportTarget();
    error ReportNotFound();
    error InvalidReportStatus();
    error NotMisconductReport();
    error DisputeNotResolved();

    event ItemCreated(
        uint256 indexed itemId,
        address indexed seller,
        uint256 price,
        string metadataHash
    );
    event ItemPriceUpdated(
        uint256 indexed itemId,
        uint256 oldPrice,
        uint256 newPrice
    );
    event ItemMetadataUpdated(
        uint256 indexed itemId,
        string oldMetadataHash,
        string newMetadataHash
    );
    event ItemDelisted(uint256 indexed itemId, address indexed seller);
    event ItemPurchased(
        uint256 indexed itemId,
        address indexed buyer,
        uint256 price
    );
    event ItemDelivered(uint256 indexed itemId, address indexed seller);
    event ItemReceived(uint256 indexed itemId, address indexed buyer);
    event Withdrawal(address indexed account, uint256 amount);
    event RefundRequested(uint256 indexed itemId, address indexed buyer);
    event RefundApproved(
        uint256 indexed itemId,
        address indexed seller,
        address indexed buyer,
        uint256 amount
    );
    event TimeoutReleased(
        uint256 indexed itemId,
        address indexed seller,
        uint256 amount
    );
    event ArbiterStaked(address indexed arbiter, uint256 amount);
    event ArbiterWithdrawn(address indexed arbiter, uint256 amount);
    event DisputeOpened(
        uint256 indexed itemId,
        address indexed initiator,
        bool supportBuyer,
        bytes32 evidenceHash
    );
    event DisputeResponded(
        uint256 indexed itemId,
        address indexed responder
    );
    event EvidenceSubmitted(
        uint256 indexed itemId,
        address indexed submitter,
        bytes32 evidenceHash
    );
    event ArbiterVoted(
        uint256 indexed itemId,
        address indexed arbiter,
        bool supportBuyer
    );
    event DisputeResolved(
        uint256 indexed itemId,
        bool buyerWins,
        string reason
    );
    event DisputeRewardRecorded(
        uint256 indexed itemId,
        address indexed arbiter,
        uint256 amount
    );
    event SellerStakeLocked(
        uint256 indexed itemId,
        address indexed seller,
        uint256 amount
    );
    event SellerStakeReleased(
        uint256 indexed itemId,
        address indexed seller,
        uint256 amount
    );
    event SellerStakeSlashed(
        uint256 indexed itemId,
        address indexed seller,
        uint256 amount
    );
    event ReputationUpdated(
        address indexed account,
        uint256 completedTrades,
        uint256 disputeCount
    );
    event ReportCreated(
        uint256 indexed reportId,
        uint256 indexed itemId,
        address indexed reporter,
        address reported,
        ReportType reportType,
        bytes32 evidenceHash
    );
    event ReportResolved(uint256 indexed reportId, bool upheld);

    constructor(
        uint256 _deliveryWindow,
        uint256 _confirmWindow,
        uint256 _arbiterStakeAmount,
        uint256 _minActiveArbiters,
        uint256 _disputeDeposit,
        uint256 _disputeDepositWindow,
        uint256 _disputeWindow,
        uint256 _sellerStakeAmount,
        uint256 _reportDeposit
    ) Ownable(msg.sender) {
        if (_deliveryWindow == 0) revert InvalidDeliveryWindow();
        if (_confirmWindow == 0) revert InvalidConfirmWindow();
        if (_arbiterStakeAmount == 0) revert InvalidArbiterStakeAmount();
        if (_minActiveArbiters == 0) revert InvalidMinActiveArbiters();
        if (_disputeDeposit == 0) revert InvalidDisputeDeposit();
        if (_disputeDepositWindow == 0) revert InvalidDisputeDepositWindow();
        if (_disputeWindow == 0) revert InvalidDisputeWindow();
        if (_sellerStakeAmount == 0) revert InvalidSellerStakeAmount();
        if (_reportDeposit == 0) revert InvalidReportDeposit();

        deliveryWindow = _deliveryWindow;
        confirmWindow = _confirmWindow;
        arbiterStakeAmount = _arbiterStakeAmount;
        minActiveArbiters = _minActiveArbiters;
        disputeDeposit = _disputeDeposit;
        disputeDepositWindow = _disputeDepositWindow;
        disputeWindow = _disputeWindow;
        sellerStakeAmount = _sellerStakeAmount;
        reportDeposit = _reportDeposit;
    }

    function createItem(
        uint256 price,
        string calldata metadataHash
    ) external payable returns (uint256 itemId) {
        if (price == 0) revert ZeroPrice();
        if (bytes(metadataHash).length == 0) revert EmptyMetadata();
        if (msg.value != sellerStakeAmount) revert IncorrectSellerStakeAmount();

        itemId = nextItemId++;
        Item storage item = items[itemId];
        item.id = itemId;
        item.seller = payable(msg.sender);
        item.price = price;
        item.metadataHash = metadataHash;
        item.state = State.Created;
        item.createdAt = block.timestamp;
        item.paidAt = 0;
        item.deliveredAt = 0;
        item.delisted = false;
        item.refundRequested = false;
        item.refundRequestedAt = 0;
        item.sellerStake = msg.value;
        item.sellerStakeSettled = false;
        item.sellerStakeSlashed = false;

        emit ItemCreated(itemId, msg.sender, price, metadataHash);
        emit SellerStakeLocked(itemId, msg.sender, msg.value);
    }

    function updatePrice(uint256 itemId, uint256 newPrice) external {
        Item storage item = _getItem(itemId);
        if (msg.sender != item.seller) revert NotSeller();
        if (item.state != State.Created || item.delisted) revert InvalidState();
        if (newPrice == 0) revert ZeroPrice();

        uint256 oldPrice = item.price;
        item.price = newPrice;

        emit ItemPriceUpdated(itemId, oldPrice, newPrice);
    }

    function updateMetadata(
        uint256 itemId,
        string calldata newMetadataHash
    ) external {
        Item storage item = _getItem(itemId);
        if (msg.sender != item.seller) revert NotSeller();
        if (item.state != State.Created || item.delisted) revert InvalidState();
        if (bytes(newMetadataHash).length == 0) revert EmptyMetadata();

        string memory oldMetadataHash = item.metadataHash;
        item.metadataHash = newMetadataHash;

        emit ItemMetadataUpdated(itemId, oldMetadataHash, newMetadataHash);
    }

    function delistItem(uint256 itemId) external nonReentrant {
        Item storage item = _getItem(itemId);
        if (msg.sender != item.seller) revert NotSeller();
        if (item.state != State.Created || item.delisted) revert InvalidState();

        item.delisted = true;
        item.state = State.Inactive;

        _settleSellerStake(itemId, false);

        emit ItemDelisted(itemId, msg.sender);
    }

    function purchaseItem(
        uint256 itemId
    ) external payable nonReentrant {
        Item storage item = _getItem(itemId);
        if (item.state != State.Created || item.delisted) revert ItemNotAvailable();
        if (msg.sender == item.seller) revert SellerCannotBuyOwnItem();
        if (msg.value != item.price) revert IncorrectPayment();

        item.buyer = msg.sender;
        item.state = State.Locked;
        item.paidAt = block.timestamp;

        emit ItemPurchased(itemId, msg.sender, item.price);
    }

    function markDelivered(uint256 itemId) external {
        Item storage item = _getItem(itemId);
        if (msg.sender != item.seller) revert NotSeller();
        if (item.state != State.Locked) revert InvalidState();
        if (block.timestamp > item.paidAt + deliveryWindow) {
            revert DeliveryTimeoutExceeded();
        }

        item.state = State.Delivered;
        item.deliveredAt = block.timestamp;

        emit ItemDelivered(itemId, msg.sender);
    }

    function confirmReceived(uint256 itemId) external nonReentrant {
        Item storage item = _getItem(itemId);
        if (msg.sender != item.buyer) revert NotBuyer();
        if (item.state != State.Delivered) revert InvalidState();
        if (item.refundRequested) revert PendingRefundBlocksConfirm();

        address payable seller = item.seller;
        address buyer = item.buyer;
        uint256 price = item.price;

        item.state = State.Inactive;
        pendingWithdrawals[seller] += price;
        _settleSellerStake(itemId, false);
        _recordTradeCompletion(buyer, seller);

        emit ItemReceived(itemId, msg.sender);
    }

    function requestRefund(uint256 itemId) external {
        Item storage item = _getItem(itemId);
        if (item.state != State.Locked && item.state != State.Delivered) {
            revert InvalidState();
        }
        if (msg.sender != item.buyer) revert NotBuyer();
        if (item.refundRequested) revert RefundAlreadyRequested();

        item.refundRequested = true;
        item.refundRequestedAt = block.timestamp;

        emit RefundRequested(itemId, msg.sender);
    }

    function approveRefund(uint256 itemId) external nonReentrant {
        Item storage item = _getItem(itemId);
        if (msg.sender != item.seller) revert NotSeller();
        if (!item.refundRequested) revert RefundNotRequested();
        if (item.state != State.Locked && item.state != State.Delivered) {
            revert InvalidState();
        }

        address payable buyer = payable(item.buyer);
        uint256 price = item.price;

        item.state = State.Inactive;
        item.refundRequested = false;
        item.refundRequestedAt = 0;
        pendingWithdrawals[buyer] += price;
        _settleSellerStake(itemId, false);

        emit RefundApproved(itemId, msg.sender, buyer, price);
    }

    function releaseAfterTimeout(uint256 itemId) external nonReentrant {
        Item storage item = _getItem(itemId);
        if (msg.sender != item.seller) revert NotSeller();
        if (item.state != State.Delivered) revert InvalidState();
        if (item.deliveredAt == 0) revert NotYetDelivered();
        if (block.timestamp < item.deliveredAt + confirmWindow) {
            revert TimeoutNotReached();
        }
        if (item.refundRequested) revert PendingRefundBlocksRelease();

        address payable seller = item.seller;
        address buyer = item.buyer;
        uint256 price = item.price;

        item.state = State.Inactive;
        pendingWithdrawals[seller] += price;
        _settleSellerStake(itemId, false);
        _recordTradeCompletion(buyer, seller);

        emit TimeoutReleased(itemId, seller, price);
    }

    function openDispute(
        uint256 itemId,
        bytes32 evidenceHash
    ) external payable nonReentrant {
        Item storage item = _getItem(itemId);
        if (item.state != State.Locked && item.state != State.Delivered) {
            revert InvalidState();
        }
        if (msg.sender != item.buyer && msg.sender != item.seller) {
            revert NotPartyToDispute();
        }
        if (evidenceHash == bytes32(0)) revert EmptyEvidenceHash();
        if (msg.value != disputeDeposit) revert IncorrectDisputeDeposit();
        if (activeArbiterCount < minActiveArbiters) {
            revert InsufficientActiveArbiters();
        }

        Dispute storage dispute = disputes[itemId];
        dispute.disputeInitiator = msg.sender;
        dispute.initiatorSupportsBuyer = msg.sender == item.buyer;
        dispute.disputeDepositStartedAt = block.timestamp;
        dispute.resolved = false;
        dispute.reputationCounted = false;

        if (msg.sender == item.buyer) {
            dispute.buyerDepositPaid = true;
            dispute.buyerEvidenceHash = evidenceHash;
        } else {
            dispute.sellerDepositPaid = true;
            dispute.sellerEvidenceHash = evidenceHash;
        }

        item.state = State.DisputeDepositPending;

        emit DisputeOpened(
            itemId,
            msg.sender,
            dispute.initiatorSupportsBuyer,
            evidenceHash
        );
    }

    function respondDispute(
        uint256 itemId
    ) external payable nonReentrant {
        Item storage item = _getItem(itemId);
        if (item.state != State.DisputeDepositPending) revert InvalidState();

        Dispute storage dispute = disputes[itemId];
        if (dispute.resolved) revert DisputeAlreadyResolved();
        if (msg.sender == dispute.disputeInitiator) revert NotDisputeResponder();
        if (msg.sender != item.buyer && msg.sender != item.seller) {
            revert NotPartyToDispute();
        }
        if (block.timestamp > dispute.disputeDepositStartedAt + disputeDepositWindow) {
            revert DisputeDepositWindowExpired();
        }
        if (msg.value != disputeDeposit) revert IncorrectDisputeDeposit();

        if (activeArbiterCount < minActiveArbiters) {
            revert InsufficientActiveArbiters();
        }

        if (msg.sender == item.buyer) {
            if (dispute.buyerDepositPaid) revert ResponderDepositAlreadyPaid();
            dispute.buyerDepositPaid = true;
        } else {
            if (dispute.sellerDepositPaid) revert ResponderDepositAlreadyPaid();
            dispute.sellerDepositPaid = true;
        }

        dispute.disputeStartedAt = block.timestamp;
        dispute.arbiterCountSnapshot = activeArbiterCount;
        dispute.voteThresholdSnapshot = _computeVoteThreshold(activeArbiterCount);
        item.state = State.Disputed;

        emit DisputeResponded(itemId, msg.sender);
    }

    function submitEvidence(
        uint256 itemId,
        bytes32 evidenceHash
    ) external {
        Item storage item = _getItem(itemId);
        if (
            item.state != State.DisputeDepositPending &&
            item.state != State.Disputed
        ) {
            revert InvalidState();
        }
        if (msg.sender != item.buyer && msg.sender != item.seller) {
            revert NotPartyToDispute();
        }
        if (evidenceHash == bytes32(0)) revert EmptyEvidenceHash();

        Dispute storage dispute = disputes[itemId];
        if (dispute.resolved) revert DisputeAlreadyResolved();

        if (msg.sender == item.buyer) {
            dispute.buyerEvidenceHash = evidenceHash;
        } else {
            dispute.sellerEvidenceHash = evidenceHash;
        }

        emit EvidenceSubmitted(itemId, msg.sender, evidenceHash);
    }

    function voteDispute(
        uint256 itemId,
        bool supportBuyer
    ) external nonReentrant {
        Item storage item = _getItem(itemId);
        if (item.state != State.Disputed) revert NotInDisputedState();

        Dispute storage dispute = disputes[itemId];
        if (dispute.resolved) revert DisputeAlreadyResolved();
        if (!isEligibleArbiter(itemId, msg.sender)) revert NotEligibleToVote();
        if (arbiterHasVoted[itemId][msg.sender]) revert AlreadyVoted();

        arbiterHasVoted[itemId][msg.sender] = true;
        arbiterVoteSupportBuyer[itemId][msg.sender] = supportBuyer;
        dispute.voters.push(msg.sender);
        _lockArbiterForDispute(msg.sender);

        if (supportBuyer) {
            dispute.buyerVotes++;
        } else {
            dispute.sellerVotes++;
        }

        emit ArbiterVoted(itemId, msg.sender, supportBuyer);

        uint256 threshold = dispute.voteThresholdSnapshot;
        if (dispute.buyerVotes >= threshold) {
            _resolveDispute(itemId, true, true, "majority_buyer");
        } else if (dispute.sellerVotes >= threshold) {
            _resolveDispute(itemId, false, true, "majority_seller");
        }
    }

    function resolveDisputeDepositTimeout(
        uint256 itemId
    ) external nonReentrant {
        Item storage item = _getItem(itemId);
        if (item.state != State.DisputeDepositPending) revert InvalidState();

        Dispute storage dispute = disputes[itemId];
        if (dispute.resolved) revert DisputeAlreadyResolved();
        if (block.timestamp <= dispute.disputeDepositStartedAt + disputeDepositWindow) {
            revert DisputeDepositWindowNotExpired();
        }

        bool responderPaid = dispute.initiatorSupportsBuyer
            ? dispute.sellerDepositPaid
            : dispute.buyerDepositPaid;
        if (responderPaid) revert InvalidState();

        bool buyerWins = dispute.initiatorSupportsBuyer;
        dispute.resolved = true;
        item.state = State.Inactive;

        _recordMainFundsOutcome(item, buyerWins);
        _settleSellerStake(itemId, buyerWins);
        _recordDisputeReputation(itemId, buyerWins);

        address initiator = dispute.disputeInitiator;
        pendingWithdrawals[initiator] += disputeDeposit;

        emit DisputeResolved(itemId, buyerWins, "deposit_timeout");
    }

    function resolveDisputeTimeout(
        uint256 itemId
    ) external nonReentrant {
        Item storage item = _getItem(itemId);
        if (item.state != State.Disputed) revert NotInDisputedState();

        Dispute storage dispute = disputes[itemId];
        if (dispute.resolved) revert DisputeAlreadyResolved();
        if (block.timestamp <= dispute.disputeStartedAt + disputeWindow) {
            revert DisputeNotTimedOut();
        }

        uint256 threshold = dispute.voteThresholdSnapshot;
        if (
            dispute.buyerVotes >= threshold || dispute.sellerVotes >= threshold
        ) {
            revert InvalidState();
        }

        bool buyerWins = item.deliveredAt == 0;
        dispute.resolved = true;
        item.state = State.Inactive;

        _recordMainFundsOutcome(item, buyerWins);
        _settleSellerStake(itemId, buyerWins);
        _recordDisputeReputation(itemId, buyerWins);
        _unlockAllVoters(itemId);

        if (dispute.buyerDepositPaid) {
            pendingWithdrawals[item.buyer] += disputeDeposit;
        }
        if (dispute.sellerDepositPaid) {
            pendingWithdrawals[item.seller] += disputeDeposit;
        }

        emit DisputeResolved(itemId, buyerWins, "arbitration_timeout");
    }

    function reportNoVote(
        uint256 itemId,
        address arbiter
    ) external payable nonReentrant {
        if (msg.value != reportDeposit) revert IncorrectReportDeposit();

        Item storage item = _getItem(itemId);
        if (item.state != State.Inactive) revert InvalidState();

        Dispute storage dispute = disputes[itemId];
        if (dispute.disputeInitiator == address(0)) revert InvalidState();
        if (!dispute.resolved) revert DisputeNotResolved();

        if (!_isValidReportTarget(itemId, arbiter)) revert InvalidReportTarget();

        bool upheld = !arbiterHasVoted[itemId][arbiter];
        ReportStatus status = upheld ? ReportStatus.Upheld : ReportStatus.Rejected;

        uint256 reportId = nextReportId++;
        reports[reportId] = Report({
            itemId: itemId,
            reporter: msg.sender,
            reported: arbiter,
            reportType: ReportType.NoVote,
            status: status,
            evidenceHash: bytes32(0),
            deposit: msg.value
        });

        if (upheld) {
            pendingWithdrawals[msg.sender] += msg.value;
        } else {
            pendingWithdrawals[arbiter] += msg.value;
        }

        emit ReportCreated(
            reportId,
            itemId,
            msg.sender,
            arbiter,
            ReportType.NoVote,
            bytes32(0)
        );
        emit ReportResolved(reportId, upheld);
    }

    function reportMisconduct(
        uint256 itemId,
        address arbiter,
        bytes32 evidenceHash
    ) external payable nonReentrant {
        if (msg.value != reportDeposit) revert IncorrectReportDeposit();
        if (evidenceHash == bytes32(0)) revert EmptyEvidenceHash();

        _getItem(itemId);
        if (!_isValidReportTarget(itemId, arbiter)) revert InvalidReportTarget();

        uint256 reportId = nextReportId++;
        reports[reportId] = Report({
            itemId: itemId,
            reporter: msg.sender,
            reported: arbiter,
            reportType: ReportType.Misconduct,
            status: ReportStatus.Pending,
            evidenceHash: evidenceHash,
            deposit: msg.value
        });

        emit ReportCreated(
            reportId,
            itemId,
            msg.sender,
            arbiter,
            ReportType.Misconduct,
            evidenceHash
        );
    }

    function resolveReport(
        uint256 reportId,
        bool upheld
    ) external onlyOwner nonReentrant {
        Report storage report = reports[reportId];
        if (report.reporter == address(0)) revert ReportNotFound();
        if (report.reportType != ReportType.Misconduct) revert NotMisconductReport();
        if (report.status != ReportStatus.Pending) revert InvalidReportStatus();

        report.status = upheld ? ReportStatus.Upheld : ReportStatus.Rejected;

        if (upheld) {
            pendingWithdrawals[report.reporter] += report.deposit;
        } else {
            pendingWithdrawals[report.reported] += report.deposit;
        }

        emit ReportResolved(reportId, upheld);
    }

    function withdrawProceeds() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        if (amount == 0) revert NothingToWithdraw();

        pendingWithdrawals[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();

        emit Withdrawal(msg.sender, amount);
    }

    function stakeAsArbiter() external payable nonReentrant {
        if (msg.value != arbiterStakeAmount) revert IncorrectArbiterStakeAmount();
        if (activeArbiters[msg.sender]) revert AlreadyActiveArbiter();

        arbiterStakes[msg.sender] = msg.value;
        activeArbiters[msg.sender] = true;
        activeArbiterCount++;

        emit ArbiterStaked(msg.sender, msg.value);
    }

    function withdrawArbiterStake() external nonReentrant {
        if (!activeArbiters[msg.sender]) revert NotActiveArbiter();
        if (arbiterLockedDisputeCount[msg.sender] > 0) {
            revert ArbiterLockedInDispute();
        }

        uint256 amount = arbiterStakes[msg.sender];

        arbiterStakes[msg.sender] = 0;
        activeArbiters[msg.sender] = false;
        activeArbiterCount--;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();

        emit ArbiterWithdrawn(msg.sender, amount);
    }

    function isEligibleArbiter(
        uint256 itemId,
        address arbiter
    ) public view returns (bool) {
        Item storage item = _getItem(itemId);
        return
            activeArbiters[arbiter] &&
            arbiter != item.seller &&
            arbiter != item.buyer;
    }

    function _resolveDispute(
        uint256 itemId,
        bool buyerWins,
        bool rewardArbiters,
        string memory reason
    ) internal {
        Item storage item = _getItem(itemId);
        Dispute storage dispute = disputes[itemId];
        if (dispute.resolved) revert DisputeAlreadyResolved();

        dispute.resolved = true;
        item.state = State.Inactive;

        _recordMainFundsOutcome(item, buyerWins);
        _settleSellerStake(itemId, buyerWins);
        _recordDisputeReputation(itemId, buyerWins);
        _recordDisputeDepositsOutcome(itemId, buyerWins, rewardArbiters);
        _unlockAllVoters(itemId);

        emit DisputeResolved(itemId, buyerWins, reason);
    }

    function _settleSellerStake(uint256 itemId, bool slash) internal {
        Item storage item = items[itemId];
        if (item.sellerStakeSettled) revert SellerStakeAlreadySettled();

        uint256 amount = item.sellerStake;
        address seller = item.seller;
        item.sellerStakeSettled = true;

        if (slash) {
            item.sellerStakeSlashed = true;
            pendingWithdrawals[owner()] += amount;
            sellerStakeSlashedCount[seller]++;
            emit SellerStakeSlashed(itemId, seller, amount);
        } else {
            pendingWithdrawals[seller] += amount;
            emit SellerStakeReleased(itemId, seller, amount);
        }
    }

    function _recordTradeCompletion(
        address buyer,
        address seller
    ) internal {
        completedTradeCount[buyer]++;
        completedTradeCount[seller]++;
        emit ReputationUpdated(
            buyer,
            completedTradeCount[buyer],
            disputeCount[buyer]
        );
        emit ReputationUpdated(
            seller,
            completedTradeCount[seller],
            disputeCount[seller]
        );
    }

    function _recordDisputeReputation(
        uint256 itemId,
        bool buyerWins
    ) internal {
        Dispute storage dispute = disputes[itemId];
        if (dispute.reputationCounted) return;

        Item storage item = items[itemId];
        dispute.reputationCounted = true;

        disputeCount[item.buyer]++;
        disputeCount[item.seller]++;
        emit ReputationUpdated(
            item.buyer,
            completedTradeCount[item.buyer],
            disputeCount[item.buyer]
        );
        emit ReputationUpdated(
            item.seller,
            completedTradeCount[item.seller],
            disputeCount[item.seller]
        );

        if (buyerWins) {
            buyerWinCount[item.buyer]++;
        } else {
            sellerWinCount[item.seller]++;
        }
    }

    function _isValidReportTarget(
        uint256 itemId,
        address arbiter
    ) internal view returns (bool) {
        Item storage item = items[itemId];
        if (arbiter == item.seller || arbiter == item.buyer) {
            return false;
        }
        return activeArbiters[arbiter] || arbiterStakes[arbiter] > 0;
    }

    function _recordMainFundsOutcome(
        Item storage item,
        bool buyerWins
    ) internal {
        if (buyerWins) {
            pendingWithdrawals[item.buyer] += item.price;
        } else {
            pendingWithdrawals[item.seller] += item.price;
        }
    }

    function _recordDisputeDepositsOutcome(
        uint256 itemId,
        bool buyerWins,
        bool rewardArbiters
    ) internal {
        Item storage item = items[itemId];
        Dispute storage dispute = disputes[itemId];

        address winner = buyerWins ? item.buyer : item.seller;
        pendingWithdrawals[winner] += disputeDeposit;

        if (!rewardArbiters) {
            return;
        }
        if (!dispute.buyerDepositPaid || !dispute.sellerDepositPaid) {
            return;
        }

        _distributeLoserDepositRewards(itemId, buyerWins);
    }

    function _distributeLoserDepositRewards(
        uint256 itemId,
        bool buyerWins
    ) internal {
        Dispute storage dispute = disputes[itemId];
        uint256 voterCount = dispute.voters.length;
        uint256 majorityCount;

        for (uint256 i = 0; i < voterCount; i++) {
            if (arbiterVoteSupportBuyer[itemId][dispute.voters[i]] == buyerWins) {
                majorityCount++;
            }
        }

        if (majorityCount == 0) {
            return;
        }

        uint256 perVoter = disputeDeposit / majorityCount;
        uint256 remainder = disputeDeposit - (perVoter * majorityCount);

        for (uint256 i = 0; i < voterCount; i++) {
            address voter = dispute.voters[i];
            if (arbiterVoteSupportBuyer[itemId][voter] != buyerWins) {
                continue;
            }
            uint256 reward = perVoter;
            if (remainder > 0) {
                reward += remainder;
                remainder = 0;
            }
            pendingWithdrawals[voter] += reward;
            emit DisputeRewardRecorded(itemId, voter, reward);
        }
    }

    function _unlockAllVoters(uint256 itemId) internal {
        Dispute storage dispute = disputes[itemId];
        for (uint256 i = 0; i < dispute.voters.length; i++) {
            _unlockArbiterForDispute(dispute.voters[i]);
        }
    }

    function _lockArbiterForDispute(address arbiter) internal {
        if (!activeArbiters[arbiter]) revert NotActiveArbiter();
        arbiterLockedDisputeCount[arbiter]++;
    }

    function _unlockArbiterForDispute(address arbiter) internal {
        if (arbiterLockedDisputeCount[arbiter] == 0) {
            revert ArbiterNotLockedInDispute();
        }
        arbiterLockedDisputeCount[arbiter]--;
    }

    function _computeVoteThreshold(
        uint256 arbiterCount
    ) internal pure returns (uint256) {
        return (arbiterCount * 2 + 2) / 3;
    }

    function _getItem(uint256 itemId) internal view returns (Item storage item) {
        item = items[itemId];
        if (item.seller == address(0)) revert ItemNotFound();
    }
}
