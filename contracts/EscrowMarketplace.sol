// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title EscrowMarketplace
/// @notice Core escrow contract for decentralized second-hand marketplace.
contract EscrowMarketplace is ReentrancyGuard {
    enum State {
        Created,
        Locked,
        Delivered,
        DisputeDepositPending,
        Disputed,
        Inactive
    }

    struct Item {
        uint256 id;
        address payable seller;
        address buyer;
        uint256 price;
        string metadataHash;
        State state;
        uint256 createdAt;
        uint256 deliveredAt;
        bool delisted;
    }

    uint256 public nextItemId = 1;
    mapping(uint256 => Item) public items;
    mapping(address => uint256) public pendingWithdrawals;

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
    event Withdrawal(address indexed seller, uint256 amount);

    function createItem(
        uint256 price,
        string calldata metadataHash
    ) external returns (uint256 itemId) {
        if (price == 0) revert ZeroPrice();
        if (bytes(metadataHash).length == 0) revert EmptyMetadata();

        itemId = nextItemId++;
        Item storage item = items[itemId];
        item.id = itemId;
        item.seller = payable(msg.sender);
        item.price = price;
        item.metadataHash = metadataHash;
        item.state = State.Created;
        item.createdAt = block.timestamp;
        item.delisted = false;

        emit ItemCreated(itemId, msg.sender, price, metadataHash);
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

    function delistItem(uint256 itemId) external {
        Item storage item = _getItem(itemId);
        if (msg.sender != item.seller) revert NotSeller();
        if (item.state != State.Created || item.delisted) revert InvalidState();

        item.delisted = true;
        item.state = State.Inactive;

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

        emit ItemPurchased(itemId, msg.sender, item.price);
    }

    function markDelivered(uint256 itemId) external {
        Item storage item = _getItem(itemId);
        if (msg.sender != item.seller) revert NotSeller();
        if (item.state != State.Locked) revert InvalidState();

        item.state = State.Delivered;
        item.deliveredAt = block.timestamp;

        emit ItemDelivered(itemId, msg.sender);
    }

    function confirmReceived(uint256 itemId) external nonReentrant {
        Item storage item = _getItem(itemId);
        if (msg.sender != item.buyer) revert NotBuyer();
        if (item.state != State.Delivered) revert InvalidState();

        address payable seller = item.seller;
        uint256 price = item.price;

        item.state = State.Inactive;
        pendingWithdrawals[seller] += price;

        emit ItemReceived(itemId, msg.sender);
    }

    function withdrawProceeds() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        if (amount == 0) revert NothingToWithdraw();

        pendingWithdrawals[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert TransferFailed();

        emit Withdrawal(msg.sender, amount);
    }

    function _getItem(uint256 itemId) internal view returns (Item storage item) {
        item = items[itemId];
        if (item.seller == address(0)) revert ItemNotFound();
    }
}
