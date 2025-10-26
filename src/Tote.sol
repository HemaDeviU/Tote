// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// Aave integration for real yield farming
interface IERC4626 {
    function deposit(uint256 assets, address receiver) external returns (uint256 shares);
    function redeem(uint256 shares, address receiver, address owner) external returns (uint256 assets);
    function previewRedeem(uint256 shares) external view returns (uint256);
    function totalAssets() external view returns (uint256);
    function totalSupply() external view returns (uint256);
}

contract ToteFlow is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Struct to represent a product listing
    struct Product {
        uint256 id;
        address seller;
        string name;
        string description;
        string ipfsHash; // IPFS hash for encrypted product data/files
        string accessControlConditions; // Lit Protocol access control conditions (JSON string)
        uint256 price;
        address paymentToken; // ERC20 token address for payment
        bool isActive;
        uint256 createdAt;
    }

    // Struct to represent a purchase
    struct Purchase {
        uint256 productId;
        address buyer;
        uint256 amountPaid;
        uint256 timestamp;
        bool ipfsShared;
        bool withdrawn;
        uint256 yieldAccumulated;
        uint256 yieldStartTime;
    }

    // Struct to represent seller's yield balance
    struct SellerYield {
        address seller;
        uint256 totalDeposited;
        uint256 totalYieldEarned;
        uint256 lastUpdateTime;
        bool isActive;
    }

    // State variables
    uint256 public nextProductId = 1;
    uint256 public nextPurchaseId = 1;

    // Mappings
    mapping(uint256 => Product) public products;
    mapping(uint256 => Purchase) public purchases;
    mapping(address => uint256[]) public sellerProducts;
    mapping(address => uint256[]) public buyerPurchases;
    mapping(address => bool) public authorizedTokens; // Whitelist of accepted ERC20 tokens
    mapping(address => SellerYield) public sellerYields; // Seller yield tracking
    mapping(address => uint256) public totalYieldPool; // Total yield pool per token

    // Platform fee (in basis points, e.g., 250 = 2.5%)
    uint256 public platformFeeBps = 250;
    address public feeRecipient;

    // Yield configuration
    uint256 public yieldFeeBps = 2000; // 20% of yield goes to platform
    uint256 public annualYieldRate = 1000; // 10% annual yield (in basis points)
    address public yieldStrategy; // Address of yield farming strategy

    // Real yield farming integration
    mapping(address => address) public yieldVaults; // token => vault address
    mapping(uint256 => uint256) public purchaseShares; // purchaseId => vault shares
    uint256 public totalVaultShares; // Total shares in yield vaults

    // Events
    event ProductListed(
        uint256 indexed productId,
        address indexed seller,
        string name,
        string ipfsHash,
        string accessControlConditions,
        uint256 price,
        address paymentToken
    );

    event ProductPurchased(
        uint256 indexed productId,
        uint256 indexed purchaseId,
        address indexed buyer,
        address seller,
        uint256 amountPaid,
        address paymentToken
    );

    event IPFSShared(uint256 indexed purchaseId, address indexed buyer, string ipfsHash);

    event TokenAuthorized(address indexed token, bool authorized);
    event PlatformFeeUpdated(uint256 newFeeBps);
    event FeeRecipientUpdated(address newRecipient);

    // Yield events
    event YieldStarted(uint256 indexed purchaseId, address indexed seller, uint256 amount);
    event YieldWithdrawn(address indexed seller, uint256 amount, uint256 yieldEarned);
    event YieldStrategyUpdated(address newStrategy);
    event YieldRateUpdated(uint256 newRate);

    constructor() Ownable(msg.sender) {
        feeRecipient = msg.sender;
    }

    // Modifiers
    modifier onlyValidProduct(uint256 _productId) {
        require(_productId > 0 && _productId < nextProductId, "Invalid product ID");
        require(products[_productId].isActive, "Product not active");
        _;
    }

    modifier onlySeller(uint256 _productId) {
        require(products[_productId].seller == msg.sender, "Not the seller");
        _;
    }

    modifier onlyAuthorizedToken(address _token) {
        require(authorizedTokens[_token], "Token not authorized");
        _;
    }

    /**
     * @dev List a new product on the marketplace
     * @param _name Product name
     * @param _description Product description
     * @param _ipfsHash IPFS hash containing encrypted product data/files
     * @param _accessControlConditions Lit Protocol access control conditions (JSON string)
     * @param _price Price in the specified ERC20 token
     * @param _paymentToken Address of the ERC20 token for payment
     */
    function listProduct(
        string memory _name,
        string memory _description,
        string memory _ipfsHash,
        string memory _accessControlConditions,
        uint256 _price,
        address _paymentToken
    ) external onlyAuthorizedToken(_paymentToken) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(_price > 0, "Price must be greater than 0");

        uint256 productId = nextProductId++;

        products[productId] = Product({
            id: productId,
            seller: msg.sender,
            name: _name,
            description: _description,
            ipfsHash: _ipfsHash,
            accessControlConditions: _accessControlConditions,
            price: _price,
            paymentToken: _paymentToken,
            isActive: true,
            createdAt: block.timestamp
        });

        sellerProducts[msg.sender].push(productId);

        emit ProductListed(productId, msg.sender, _name, _ipfsHash, _accessControlConditions, _price, _paymentToken);
    }

    /**
     * @dev Purchase a product
     * @param _productId ID of the product to purchase
     */
    function purchaseProduct(uint256 _productId) external nonReentrant onlyValidProduct(_productId) {
        Product storage product = products[_productId];
        require(product.seller != msg.sender, "Cannot buy your own product");

        uint256 purchaseId = nextPurchaseId++;

        // Transfer payment from buyer to seller (minus platform fee)
        uint256 platformFee = (product.price * platformFeeBps) / 10000;
        uint256 sellerAmount = product.price - platformFee;

        IERC20(product.paymentToken).safeTransferFrom(msg.sender, product.seller, sellerAmount);

        // Transfer platform fee to fee recipient
        if (platformFee > 0) {
            IERC20(product.paymentToken).safeTransferFrom(msg.sender, feeRecipient, platformFee);
        }

        // Record the purchase
        purchases[purchaseId] = Purchase({
            productId: _productId,
            buyer: msg.sender,
            amountPaid: product.price,
            timestamp: block.timestamp,
            ipfsShared: false,
            withdrawn: false,
            yieldAccumulated: 0,
            yieldStartTime: 0
        });

        buyerPurchases[msg.sender].push(purchaseId);

        emit ProductPurchased(_productId, purchaseId, msg.sender, product.seller, product.price, product.paymentToken);
    }

    /**
     * @dev Share IPFS link with buyer after purchase and start yield farming
     * @param _purchaseId ID of the purchase
     */
    function shareIPFSLink(uint256 _purchaseId) external {
        require(_purchaseId > 0 && _purchaseId < nextPurchaseId, "Invalid purchase ID");

        Purchase storage purchase = purchases[_purchaseId];
        Product storage product = products[purchase.productId];

        require(product.seller == msg.sender, "Only seller can share IPFS link");
        require(!purchase.ipfsShared, "IPFS link already shared");

        purchase.ipfsShared = true;
        purchase.yieldStartTime = block.timestamp;

        // Initialize seller yield tracking if not exists
        if (!sellerYields[msg.sender].isActive) {
            sellerYields[msg.sender] = SellerYield({
                seller: msg.sender,
                totalDeposited: 0,
                totalYieldEarned: 0,
                lastUpdateTime: block.timestamp,
                isActive: true
            });
        }

        // Add to seller's total deposited amount
        sellerYields[msg.sender].totalDeposited += purchase.amountPaid;
        sellerYields[msg.sender].lastUpdateTime = block.timestamp;

        // Add to total yield pool
        totalYieldPool[product.paymentToken] += purchase.amountPaid;

        // Deposit funds into yield vault for real yield farming
        address vaultAddress = yieldVaults[product.paymentToken];
        if (vaultAddress != address(0)) {
            IERC20(product.paymentToken).approve(vaultAddress, purchase.amountPaid);
            uint256 shares = IERC4626(vaultAddress).deposit(purchase.amountPaid, address(this));
            purchaseShares[_purchaseId] = shares;
            totalVaultShares += shares;
        }

        emit IPFSShared(_purchaseId, purchase.buyer, product.ipfsHash);
        emit YieldStarted(_purchaseId, msg.sender, purchase.amountPaid);
    }

    /**
     * @dev Get IPFS hash for a purchase (only accessible by buyer)
     * @param _purchaseId ID of the purchase
     */
    function getIPFSHash(uint256 _purchaseId) external view returns (string memory) {
        require(_purchaseId > 0 && _purchaseId < nextPurchaseId, "Invalid purchase ID");

        Purchase storage purchase = purchases[_purchaseId];
        require(purchase.buyer == msg.sender, "Only buyer can access IPFS hash");
        require(purchase.ipfsShared, "IPFS link not shared yet");

        return products[purchase.productId].ipfsHash;
    }

    /**
     * @dev Get access control conditions for a purchase (only accessible by buyer)
     * @param _purchaseId ID of the purchase
     */
    function getAccessControlConditions(uint256 _purchaseId) external view returns (string memory) {
        require(_purchaseId > 0 && _purchaseId < nextPurchaseId, "Invalid purchase ID");

        Purchase storage purchase = purchases[_purchaseId];
        require(purchase.buyer == msg.sender, "Only buyer can access conditions");
        require(purchase.ipfsShared, "IPFS link not shared yet");

        return products[purchase.productId].accessControlConditions;
    }

    /**
     * @dev Withdraw accumulated yield for a seller
     * @param _purchaseId ID of the purchase to withdraw yield from
     */
    function withdrawYield(uint256 _purchaseId) external nonReentrant {
        require(_purchaseId > 0 && _purchaseId < nextPurchaseId, "Invalid purchase ID");

        Purchase storage purchase = purchases[_purchaseId];
        Product storage product = products[purchase.productId];

        require(product.seller == msg.sender, "Only seller can withdraw yield");
        require(purchase.ipfsShared, "IPFS link must be shared first");
        require(!purchase.withdrawn, "Yield already withdrawn");

        // Redeem from yield vault to get actual yield
        uint256 totalAmount = purchase.amountPaid;
        uint256 yieldEarned = 0;

        address vaultAddress = yieldVaults[product.paymentToken];
        if (vaultAddress != address(0) && purchaseShares[_purchaseId] > 0) {
            // Redeem shares from vault
            uint256 redeemedAmount =
                IERC4626(vaultAddress).redeem(purchaseShares[_purchaseId], address(this), address(this));

            // Calculate actual yield earned
            if (redeemedAmount > purchase.amountPaid) {
                yieldEarned = redeemedAmount - purchase.amountPaid;
                totalAmount = redeemedAmount;
            }

            // Update total vault shares
            totalVaultShares -= purchaseShares[_purchaseId];
            purchaseShares[_purchaseId] = 0;
        } else {
            // Fallback to simulated yield if no vault
            uint256 timeElapsed = block.timestamp - purchase.yieldStartTime;
            yieldEarned = calculateYield(purchase.amountPaid, timeElapsed);
            totalAmount = purchase.amountPaid + yieldEarned;
        }

        // Calculate platform fee on yield
        uint256 platformYieldFee = (yieldEarned * yieldFeeBps) / 10000;
        uint256 sellerYield = yieldEarned - platformYieldFee;

        // Update purchase record
        purchase.withdrawn = true;
        purchase.yieldAccumulated = sellerYield;

        // Update seller yield tracking
        sellerYields[msg.sender].totalYieldEarned += sellerYield;
        sellerYields[msg.sender].lastUpdateTime = block.timestamp;

        // Transfer total amount to seller
        IERC20(product.paymentToken).safeTransfer(msg.sender, totalAmount - platformYieldFee);

        // Transfer platform yield fee to fee recipient
        if (platformYieldFee > 0) {
            IERC20(product.paymentToken).safeTransfer(feeRecipient, platformYieldFee);
        }

        // Update total yield pool
        totalYieldPool[product.paymentToken] -= purchase.amountPaid;

        emit YieldWithdrawn(msg.sender, totalAmount, sellerYield);
    }

    /**
     * @dev Calculate yield based on amount and time
     * @param _amount Amount to calculate yield for
     * @param _timeElapsed Time elapsed in seconds
     */
    function calculateYield(uint256 _amount, uint256 _timeElapsed) public view returns (uint256) {
        if (_amount == 0 || _timeElapsed == 0) {
            return 0;
        }

        // Calculate yield: amount * annualRate * timeElapsed / (365 days * 24 hours * 3600 seconds)
        // Use higher precision to avoid rounding errors
        uint256 secondsInYear = 365 * 24 * 3600; // 31,536,000 seconds
        uint256 numerator = _amount * annualYieldRate * _timeElapsed;
        uint256 denominator = 10000 * secondsInYear;

        // Add rounding for better precision
        return (numerator + denominator / 2) / denominator;
    }

    /**
     * @dev Get seller's yield information
     * @param _seller Seller address
     */
    function getSellerYieldInfo(address _seller) external view returns (SellerYield memory) {
        return sellerYields[_seller];
    }

    /**
     * @dev Get accumulated yield for a specific purchase
     * @param _purchaseId Purchase ID
     */
    function getPurchaseYield(uint256 _purchaseId) external view returns (uint256) {
        require(_purchaseId > 0 && _purchaseId < nextPurchaseId, "Invalid purchase ID");

        Purchase storage purchase = purchases[_purchaseId];
        if (!purchase.ipfsShared || purchase.withdrawn) {
            return 0;
        }

        uint256 timeElapsed = block.timestamp - purchase.yieldStartTime;
        uint256 yieldEarned = calculateYield(purchase.amountPaid, timeElapsed);
        uint256 platformYieldFee = (yieldEarned * yieldFeeBps) / 10000;

        return yieldEarned - platformYieldFee;
    }

    /**
     * @dev Deactivate a product listing
     * @param _productId ID of the product to deactivate
     */
    function deactivateProduct(uint256 _productId) external onlyValidProduct(_productId) onlySeller(_productId) {
        products[_productId].isActive = false;
    }

    // Admin functions
    /**
     * @dev Authorize or deauthorize an ERC20 token for payments
     * @param _token Token address
     * @param _authorized Whether the token is authorized
     */
    function setAuthorizedToken(address _token, bool _authorized) external onlyOwner {
        authorizedTokens[_token] = _authorized;
        emit TokenAuthorized(_token, _authorized);
    }

    /**
     * @dev Update platform fee
     * @param _newFeeBps New fee in basis points
     */
    function setPlatformFee(uint256 _newFeeBps) external onlyOwner {
        require(_newFeeBps <= 1000, "Fee cannot exceed 10%");
        platformFeeBps = _newFeeBps;
        emit PlatformFeeUpdated(_newFeeBps);
    }

    /**
     * @dev Update fee recipient address
     * @param _newRecipient New fee recipient address
     */
    function setFeeRecipient(address _newRecipient) external onlyOwner {
        require(_newRecipient != address(0), "Invalid address");
        feeRecipient = _newRecipient;
        emit FeeRecipientUpdated(_newRecipient);
    }

    /**
     * @dev Update yield farming strategy
     * @param _newStrategy New yield strategy address
     */
    function setYieldStrategy(address _newStrategy) external onlyOwner {
        yieldStrategy = _newStrategy;
        emit YieldStrategyUpdated(_newStrategy);
    }

    /**
     * @dev Update annual yield rate
     * @param _newRate New annual yield rate in basis points
     */
    function setYieldRate(uint256 _newRate) external onlyOwner {
        require(_newRate <= 5000, "Yield rate cannot exceed 50%");
        annualYieldRate = _newRate;
        emit YieldRateUpdated(_newRate);
    }

    /**
     * @dev Update yield fee percentage
     * @param _newFeeBps New yield fee in basis points
     */
    function setYieldFee(uint256 _newFeeBps) external onlyOwner {
        require(_newFeeBps <= 5000, "Yield fee cannot exceed 50%");
        yieldFeeBps = _newFeeBps;
    }

    /**
     * @dev Set yield vault for a token
     * @param _token Token address
     * @param _vault Vault address (ERC4626 compatible)
     */
    function setYieldVault(address _token, address _vault) external onlyOwner {
        yieldVaults[_token] = _vault;
        emit YieldStrategyUpdated(_vault);
    }

    /**
     * @dev Get current yield rate from vault (real-time)
     * @param _token Token address
     */
    function getCurrentYieldRate(address _token) external view returns (uint256) {
        address vaultAddress = yieldVaults[_token];
        if (vaultAddress == address(0)) {
            return annualYieldRate; // Return simulated rate if no vault
        }

        try IERC4626(vaultAddress).totalAssets() returns (uint256 totalAssets) {
            try IERC4626(vaultAddress).totalSupply() returns (uint256 totalSupply) {
                if (totalSupply > 0) {
                    // Calculate real-time APY from vault performance
                    // APY = (totalAssets / totalSupply - 1) * 10000 (in basis points)
                    uint256 exchangeRate = (totalAssets * 10000) / totalSupply;
                    if (exchangeRate > 10000) {
                        return exchangeRate - 10000; // Return the yield portion
                    }
                }
            } catch {}
        } catch {}

        return annualYieldRate; // Fallback to simulated rate
    }

    /**
     * @dev Calculate yield based on real-time vault performance
     * @param _amount Amount to calculate yield for
     * @param _timeElapsed Time elapsed in seconds
     * @param _token Token address for vault lookup
     */
    function calculateRealTimeYield(uint256 _amount, uint256 _timeElapsed, address _token)
        public
        view
        returns (uint256)
    {
        if (_amount == 0 || _timeElapsed == 0) {
            return 0;
        }

        // Get real-time yield rate from vault
        uint256 currentRate = this.getCurrentYieldRate(_token);

        // Calculate yield using real-time rate
        uint256 secondsInYear = 365 * 24 * 3600;
        uint256 numerator = _amount * currentRate * _timeElapsed;
        uint256 denominator = 10000 * secondsInYear;

        return (numerator + denominator / 2) / denominator;
    }

    // View functions
    /**
     * @dev Get all products listed by a seller
     * @param _seller Seller address
     */
    function getSellerProducts(address _seller) external view returns (uint256[] memory) {
        return sellerProducts[_seller];
    }

    /**
     * @dev Get all purchases made by a buyer
     * @param _buyer Buyer address
     */
    function getBuyerPurchases(address _buyer) external view returns (uint256[] memory) {
        return buyerPurchases[_buyer];
    }

    /**
     * @dev Get product details
     * @param _productId Product ID
     */
    function getProduct(uint256 _productId) external view returns (Product memory) {
        require(_productId > 0 && _productId < nextProductId, "Invalid product ID");
        return products[_productId];
    }

    /**
     * @dev Get purchase details
     * @param _purchaseId Purchase ID
     */
    function getPurchase(uint256 _purchaseId) external view returns (Purchase memory) {
        require(_purchaseId > 0 && _purchaseId < nextPurchaseId, "Invalid purchase ID");
        return purchases[_purchaseId];
    }

    /**
     * @dev Get total number of products
     */
    function getTotalProducts() external view returns (uint256) {
        return nextProductId - 1;
    }

    /**
     * @dev Get total number of purchases
     */
    function getTotalPurchases() external view returns (uint256) {
        return nextPurchaseId - 1;
    }

    /**
     * @dev Get product and purchase data for Farcaster mini dapp integration
     * @param _purchaseId Purchase ID
     * @return product Product details
     * @return purchase Purchase details
     * @return canAccess Whether caller can access the encrypted content
     */
    function getProductAndPurchaseData(uint256 _purchaseId)
        external
        view
        returns (Product memory product, Purchase memory purchase, bool canAccess)
    {
        require(_purchaseId > 0 && _purchaseId < nextPurchaseId, "Invalid purchase ID");

        purchase = purchases[_purchaseId];
        product = products[purchase.productId];

        // Check if caller is the buyer and IPFS has been shared
        canAccess = (purchase.buyer == msg.sender && purchase.ipfsShared);

        return (product, purchase, canAccess);
    }

    /**
     * @dev Get marketplace stats for Farcaster mini dapp
     * @return totalProducts Total number of products
     * @return totalPurchases Total number of purchases
     * @return platformFee Current platform fee in basis points
     */
    function getMarketplaceStats()
        external
        view
        returns (uint256 totalProducts, uint256 totalPurchases, uint256 platformFee)
    {
        return (nextProductId - 1, nextPurchaseId - 1, platformFeeBps);
    }
}
