// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { euint32, externalEuint32, euint8, ebool, eaddress, externalEaddress, FHE } from "@fhevm/solidity/lib/FHE.sol";

contract RentShieldedFair is SepoliaConfig {
    using FHE for *;
    
    struct Property {
        uint256 propertyId;
        uint256 monthlyRent;        // Public price information
        uint256 securityDeposit;    // Public deposit information
        uint256 propertySize;       // Public area information
        uint8 bedrooms;             // Public bedroom count
        uint8 bathrooms;            // Public bathroom count
        bool isAvailable;
        bool isVerified;
        string name;
        string description;
        string location;
        string propertyType;        // "apartment", "house", "condo", etc.
        string amenities;           // JSON string of amenities
        uint256 leaseDuration;      // Minimum lease duration in days
        uint256 applicationDeadline; // Deadline for applications
        address owner;
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    struct RentalApplication {
        uint256 applicationId;
        uint256 propertyId;
        euint32 proposedRent;
        euint32 creditScore;
        euint32 income;
        bool isApproved;
        bool isRejected;
        string applicationHash;
        string moveInDate;           // When tenant wants to move in
        string specialRequests;      // Special requirements or requests
        address applicant;
        address propertyOwner;
        uint256 submittedAt;
        uint256 reviewedAt;
        uint256 priorityScore;       // Calculated priority score
    }
    
    // Bidding system for rental auctions
    struct Bid {
        uint256 bidId;
        uint256 propertyId;
        address bidder;
        uint256 bidAmount;           // Public bid amount
        uint256 submittedAt;
        bool isActive;               // Whether bid is still active
        string bidderMessage;        // Optional message from bidder
    }
    
    struct BiddingSession {
        uint256 propertyId;
        uint256 startTime;
        uint256 endTime;
        uint256 highestBid;
        address highestBidder;
        bool isActive;
        uint256 totalBids;
    }
    
    struct RentalAgreement {
        euint32 agreementId;
        euint32 propertyId;
        euint32 monthlyRent;
        euint32 securityDeposit;
        euint32 leaseDuration;
        bool isActive;
        bool isTerminated;
        string agreementHash;
        address tenant;
        address landlord;
        uint256 startDate;
        uint256 endDate;
        uint256 createdAt;
    }
    
    struct Payment {
        euint32 paymentId;
        euint32 agreementId;
        euint32 amount;
        euint32 month;
        euint32 year;
        bool isPaid;
        bool isLate;
        string paymentHash;
        address payer;
        address recipient;
        uint256 dueDate;
        uint256 paidAt;
    }
    
    mapping(uint256 => Property) public properties;
    mapping(uint256 => RentalApplication) public applications;
    mapping(uint256 => RentalAgreement) public agreements;
    mapping(uint256 => Payment) public payments;
    mapping(address => euint32) public tenantReputation;
    mapping(address => euint32) public landlordReputation;
    
    // Bidding system mappings
    mapping(uint256 => Bid) public bids;
    mapping(uint256 => BiddingSession) public biddingSessions;
    mapping(uint256 => uint256[]) public propertyBids; // propertyId => bidIds[]
    mapping(address => uint256[]) public userBids; // bidder => bidIds[]
    
    uint256 public propertyCounter;
    uint256 public applicationCounter;
    uint256 public bidCounter;
    uint256 public agreementCounter;
    uint256 public paymentCounter;
    
    address public owner;
    address public verifier;
    
    event PropertyListed(uint256 indexed propertyId, address indexed owner, string name);
    event ApplicationSubmitted(uint256 indexed applicationId, uint256 indexed propertyId, address indexed applicant);
    event ApplicationReviewed(uint256 indexed applicationId, bool isApproved);
    event AgreementCreated(uint256 indexed agreementId, uint256 indexed propertyId, address indexed tenant);
    event PaymentMade(uint256 indexed paymentId, uint256 indexed agreementId, address indexed payer);
    event PropertyVerified(uint256 indexed propertyId, bool isVerified);
    event ReputationUpdated(address indexed user, uint32 reputation);
    
    constructor(address _verifier) {
        owner = msg.sender;
        verifier = _verifier;
    }
    
    function listProperty(
        string memory _name,
        string memory _description,
        string memory _location,
        uint256 _monthlyRent,
        uint256 _securityDeposit,
        uint256 _propertySize,
        uint8 _bedrooms,
        uint8 _bathrooms,
        string memory _propertyType,
        string memory _amenities,
        uint256 _leaseDuration,
        uint256 _applicationDeadline
    ) public returns (uint256) {
        require(bytes(_name).length > 0, "Property name cannot be empty");
        require(_monthlyRent > 0, "Monthly rent must be positive");
        require(_securityDeposit > 0, "Security deposit must be positive");
        require(_propertySize > 0, "Property size must be positive");
        require(_bedrooms > 0, "Bedrooms must be positive");
        require(_bathrooms > 0, "Bathrooms must be positive");
        
        uint256 propertyId = propertyCounter++;
        
        properties[propertyId] = Property({
            propertyId: propertyId,
            monthlyRent: _monthlyRent,
            securityDeposit: _securityDeposit,
            propertySize: _propertySize,
            bedrooms: _bedrooms,
            bathrooms: _bathrooms,
            isAvailable: true,
            isVerified: false,
            name: _name,
            description: _description,
            location: _location,
            propertyType: _propertyType,
            amenities: _amenities,
            leaseDuration: _leaseDuration,
            applicationDeadline: _applicationDeadline,
            owner: msg.sender,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        
        emit PropertyListed(propertyId, msg.sender, _name);
        return propertyId;
    }
    
    function submitApplication(
        uint256 propertyId,
        externalEuint32 proposedRent,
        externalEuint32 creditScore,
        externalEuint32 income,
        string memory applicationHash,
        string memory moveInDate,
        string memory specialRequests,
        bytes calldata inputProof
    ) public returns (uint256) {
        require(properties[propertyId].owner != address(0), "Property does not exist");
        require(properties[propertyId].isAvailable, "Property is not available");
        
        uint256 applicationId = applicationCounter++;
        
        // Convert externalEuint32 to euint32 using FHE.fromExternal
        euint32 internalProposedRent = FHE.fromExternal(proposedRent, inputProof);
        euint32 internalCreditScore = FHE.fromExternal(creditScore, inputProof);
        euint32 internalIncome = FHE.fromExternal(income, inputProof);
        
        applications[applicationId] = RentalApplication({
            applicationId: applicationId,
            propertyId: propertyId,
            proposedRent: internalProposedRent,
            creditScore: internalCreditScore,
            income: internalIncome,
            isApproved: false,
            isRejected: false,
            applicationHash: applicationHash,
            moveInDate: moveInDate,
            specialRequests: specialRequests,
            applicant: msg.sender,
            propertyOwner: properties[propertyId].owner,
            submittedAt: block.timestamp,
            reviewedAt: 0,
            priorityScore: 0
        });
        
        // Set ACL permissions for encrypted application data
        FHE.allowThis(applications[applicationId].proposedRent);
        FHE.allowThis(applications[applicationId].creditScore);
        FHE.allowThis(applications[applicationId].income);
        
        FHE.allow(applications[applicationId].proposedRent, msg.sender);
        FHE.allow(applications[applicationId].creditScore, msg.sender);
        FHE.allow(applications[applicationId].income, msg.sender);
        
        // Allow property owner to decrypt application data
        FHE.allow(applications[applicationId].proposedRent, properties[propertyId].owner);
        FHE.allow(applications[applicationId].creditScore, properties[propertyId].owner);
        FHE.allow(applications[applicationId].income, properties[propertyId].owner);
        
        // For demo purposes, allow anyone to decrypt (like fhe-diploma-vault)
        FHE.allow(applications[applicationId].proposedRent, address(0));
        FHE.allow(applications[applicationId].creditScore, address(0));
        FHE.allow(applications[applicationId].income, address(0));
        
        emit ApplicationSubmitted(applicationId, propertyId, msg.sender);
        return applicationId;
    }
    
    function reviewApplication(
        uint256 applicationId,
        bool isApproved
    ) public {
        require(applications[applicationId].propertyOwner == msg.sender, "Only property owner can review");
        require(!applications[applicationId].isApproved && !applications[applicationId].isRejected, "Application already reviewed");
        
        applications[applicationId].isApproved = isApproved;
        applications[applicationId].isRejected = !isApproved;
        applications[applicationId].reviewedAt = block.timestamp;
        
        emit ApplicationReviewed(applicationId, isApproved);
    }
    
    function createAgreement(
        uint256 applicationId,
        externalEuint32 monthlyRent,
        externalEuint32 securityDeposit,
        externalEuint32 leaseDuration,
        string memory agreementHash,
        bytes calldata inputProof
    ) public returns (uint256) {
        require(applications[applicationId].isApproved, "Application must be approved");
        require(applications[applicationId].propertyOwner == msg.sender, "Only property owner can create agreement");
        
        uint256 agreementId = agreementCounter++;
        uint256 propertyId = applicationId; // Simplified for demo
        
        // Convert externalEuint32 to euint32 using FHE.fromExternal
        euint32 internalMonthlyRent = FHE.fromExternal(monthlyRent, inputProof);
        euint32 internalSecurityDeposit = FHE.fromExternal(securityDeposit, inputProof);
        euint32 internalLeaseDuration = FHE.fromExternal(leaseDuration, inputProof);
        
        agreements[agreementId] = RentalAgreement({
            agreementId: FHE.asEuint32(uint32(agreementId)),
            propertyId: FHE.asEuint32(uint32(propertyId)),
            monthlyRent: internalMonthlyRent,
            securityDeposit: internalSecurityDeposit,
            leaseDuration: internalLeaseDuration,
            isActive: true,
            isTerminated: false,
            agreementHash: agreementHash,
            tenant: applications[applicationId].applicant,
            landlord: msg.sender,
            startDate: block.timestamp,
            endDate: block.timestamp + (365 days), // Default 1 year lease
            createdAt: block.timestamp
        });
        
        // Set ACL permissions for encrypted agreement data
        FHE.allowThis(agreements[agreementId].monthlyRent);
        FHE.allowThis(agreements[agreementId].securityDeposit);
        FHE.allowThis(agreements[agreementId].leaseDuration);
        
        FHE.allow(agreements[agreementId].monthlyRent, msg.sender);
        FHE.allow(agreements[agreementId].securityDeposit, msg.sender);
        FHE.allow(agreements[agreementId].leaseDuration, msg.sender);
        
        FHE.allow(agreements[agreementId].monthlyRent, applications[applicationId].applicant);
        FHE.allow(agreements[agreementId].securityDeposit, applications[applicationId].applicant);
        FHE.allow(agreements[agreementId].leaseDuration, applications[applicationId].applicant);
        
        // For demo purposes, allow anyone to decrypt (like fhe-diploma-vault)
        FHE.allow(agreements[agreementId].monthlyRent, address(0));
        FHE.allow(agreements[agreementId].securityDeposit, address(0));
        FHE.allow(agreements[agreementId].leaseDuration, address(0));
        
        // Mark property as unavailable
        properties[propertyId].isAvailable = false;
        
        emit AgreementCreated(agreementId, propertyId, applications[applicationId].applicant);
        return agreementId;
    }
    
    function makePayment(
        uint256 agreementId,
        externalEuint32 amount,
        externalEuint32 month,
        externalEuint32 year,
        string memory paymentHash,
        bytes calldata inputProof
    ) public payable returns (uint256) {
        require(agreements[agreementId].tenant == msg.sender, "Only tenant can make payment");
        require(agreements[agreementId].isActive, "Agreement must be active");
        
        uint256 paymentId = paymentCounter++;
        
        // Convert externalEuint32 to euint32 using FHE.fromExternal
        euint32 internalAmount = FHE.fromExternal(amount, inputProof);
        euint32 internalMonth = FHE.fromExternal(month, inputProof);
        euint32 internalYear = FHE.fromExternal(year, inputProof);
        
        payments[paymentId] = Payment({
            paymentId: FHE.asEuint32(uint32(paymentId)),
            agreementId: FHE.asEuint32(uint32(agreementId)),
            amount: internalAmount,
            month: internalMonth,
            year: internalYear,
            isPaid: true,
            isLate: false, // Could be calculated based on due date
            paymentHash: paymentHash,
            payer: msg.sender,
            recipient: agreements[agreementId].landlord,
            dueDate: block.timestamp,
            paidAt: block.timestamp
        });
        
        // Set ACL permissions for encrypted payment data
        FHE.allowThis(payments[paymentId].amount);
        FHE.allowThis(payments[paymentId].month);
        FHE.allowThis(payments[paymentId].year);
        
        FHE.allow(payments[paymentId].amount, msg.sender);
        FHE.allow(payments[paymentId].month, msg.sender);
        FHE.allow(payments[paymentId].year, msg.sender);
        
        FHE.allow(payments[paymentId].amount, agreements[agreementId].landlord);
        FHE.allow(payments[paymentId].month, agreements[agreementId].landlord);
        FHE.allow(payments[paymentId].year, agreements[agreementId].landlord);
        
        // For demo purposes, allow anyone to decrypt (like fhe-diploma-vault)
        FHE.allow(payments[paymentId].amount, address(0));
        FHE.allow(payments[paymentId].month, address(0));
        FHE.allow(payments[paymentId].year, address(0));
        
        emit PaymentMade(paymentId, agreementId, msg.sender);
        return paymentId;
    }
    
    function verifyProperty(uint256 propertyId, bool isVerified) public {
        require(msg.sender == verifier, "Only verifier can verify properties");
        require(properties[propertyId].owner != address(0), "Property does not exist");
        
        properties[propertyId].isVerified = isVerified;
        emit PropertyVerified(propertyId, isVerified);
    }
    
    function updateReputation(address user, euint32 reputation) public {
        require(msg.sender == verifier, "Only verifier can update reputation");
        require(user != address(0), "Invalid user address");
        
        // Determine if user is tenant or landlord based on context
        if (agreements[agreementCounter - 1].tenant == user) {
            tenantReputation[user] = reputation;
        } else {
            landlordReputation[user] = reputation;
        }
        
        emit ReputationUpdated(user, 0); // FHE.decrypt(reputation) - will be decrypted off-chain
    }
    
    function getPropertyInfo(uint256 propertyId) public view returns (
        string memory name,
        string memory description,
        string memory location,
        uint256 monthlyRent,
        uint256 securityDeposit,
        uint256 propertySize,
        uint8 bedrooms,
        uint8 bathrooms,
        bool isAvailable,
        bool isVerified,
        address propertyOwner,
        uint256 createdAt
    ) {
        Property storage property = properties[propertyId];
        return (
            property.name,
            property.description,
            property.location,
            property.monthlyRent,
            property.securityDeposit,
            property.propertySize,
            property.bedrooms,
            property.bathrooms,
            property.isAvailable,
            property.isVerified,
            property.owner,
            property.createdAt
        );
    }
    
    // Property data is now public, no encrypted data to retrieve
    // Use getPropertyInfo() instead to get public property information
    
    function getApplicationInfo(uint256 applicationId) public view returns (
        bool isApproved,
        bool isRejected,
        string memory applicationHash,
        address applicant,
        address propertyOwner,
        uint256 submittedAt
    ) {
        RentalApplication storage application = applications[applicationId];
        return (
            application.isApproved,
            application.isRejected,
            application.applicationHash,
            application.applicant,
            application.propertyOwner,
            application.submittedAt
        );
    }
    
    // Get user's applications
    function getUserApplications(address user) public view returns (uint256[] memory) {
        uint256[] memory userApplications = new uint256[](applicationCounter);
        uint256 count = 0;
        
        for (uint256 i = 0; i < applicationCounter; i++) {
            if (applications[i].applicant == user) {
                userApplications[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = userApplications[i];
        }
        
        return result;
    }
    
    // Get detailed application info for users (without encrypted data)
    function getDetailedApplicationInfo(uint256 applicationId) public view returns (
        bool isApproved,
        bool isRejected,
        string memory applicationHash,
        string memory moveInDate,
        string memory specialRequests,
        address applicant,
        address propertyOwner,
        uint256 submittedAt,
        uint256 reviewedAt,
        uint256 priorityScore
    ) {
        require(applications[applicationId].applicant != address(0), "Application does not exist");
        
        RentalApplication storage application = applications[applicationId];
        return (
            application.isApproved,
            application.isRejected,
            application.applicationHash,
            application.moveInDate,
            application.specialRequests,
            application.applicant,
            application.propertyOwner,
            application.submittedAt,
            application.reviewedAt,
            application.priorityScore
        );
    }
    
    // Get applications for a specific property (for property owners)
    function getPropertyApplications(uint256 propertyId) public view returns (uint256[] memory) {
        require(properties[propertyId].owner != address(0), "Property does not exist");
        require(properties[propertyId].owner == msg.sender, "Only property owner can view applications");
        
        uint256[] memory propertyApplications = new uint256[](applicationCounter);
        uint256 count = 0;
        
        for (uint256 i = 0; i < applicationCounter; i++) {
            // For now, return all applications - in production, this would need proper FHE decryption
            propertyApplications[count] = i;
            count++;
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = propertyApplications[i];
        }
        
        return result;
    }
    
    // Get all properties owned by a specific landlord
    function getLandlordProperties(address landlord) public view returns (uint256[] memory) {
        uint256[] memory landlordProperties = new uint256[](propertyCounter);
        uint256 count = 0;
        
        for (uint256 i = 0; i < propertyCounter; i++) {
            if (properties[i].owner == landlord) {
                landlordProperties[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = landlordProperties[i];
        }
        
        return result;
    }
    
    // Get all applications for a specific landlord (more efficient than property-based approach)
    function getLandlordApplications(address landlord) public view returns (uint256[] memory) {
        uint256[] memory landlordApplications = new uint256[](applicationCounter);
        uint256 count = 0;
        
        for (uint256 i = 0; i < applicationCounter; i++) {
            if (applications[i].propertyOwner == landlord) {
                landlordApplications[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = landlordApplications[i];
        }
        
        return result;
    }
    
    // Get all applications (for frontend filtering)
    function getAllApplications() public view returns (uint256[] memory) {
        uint256[] memory allApplications = new uint256[](applicationCounter);
        
        for (uint256 i = 0; i < applicationCounter; i++) {
            allApplications[i] = i;
        }
        
        return allApplications;
    }
    
    function getApplicationEncryptedData(uint256 applicationId) public view returns (
        euint32 proposedRent,
        euint32 creditScore,
        euint32 income
    ) {
        RentalApplication storage application = applications[applicationId];
        return (
            application.proposedRent,
            application.creditScore,
            application.income
        );
    }
    
    function getAgreementInfo(uint256 agreementId) public view returns (
        bool isActive,
        bool isTerminated,
        string memory agreementHash,
        address tenant,
        address landlord,
        uint256 startDate,
        uint256 endDate
    ) {
        RentalAgreement storage agreement = agreements[agreementId];
        return (
            agreement.isActive,
            agreement.isTerminated,
            agreement.agreementHash,
            agreement.tenant,
            agreement.landlord,
            agreement.startDate,
            agreement.endDate
        );
    }
    
    function getAgreementEncryptedData(uint256 agreementId) public view returns (
        euint32 monthlyRent,
        euint32 securityDeposit,
        euint32 leaseDuration
    ) {
        RentalAgreement storage agreement = agreements[agreementId];
        return (
            agreement.monthlyRent,
            agreement.securityDeposit,
            agreement.leaseDuration
        );
    }
    
    function getPaymentInfo(uint256 paymentId) public view returns (
        bool isPaid,
        bool isLate,
        string memory paymentHash,
        address payer,
        address recipient,
        uint256 dueDate,
        uint256 paidAt
    ) {
        Payment storage payment = payments[paymentId];
        return (
            payment.isPaid,
            payment.isLate,
            payment.paymentHash,
            payment.payer,
            payment.recipient,
            payment.dueDate,
            payment.paidAt
        );
    }
    
    function getPaymentEncryptedData(uint256 paymentId) public view returns (
        euint32 amount,
        euint32 month,
        euint32 year
    ) {
        Payment storage payment = payments[paymentId];
        return (
            payment.amount,
            payment.month,
            payment.year
        );
    }
    
    function getTenantReputation(address tenant) public view returns (euint32) {
        return tenantReputation[tenant];
    }
    
    function getLandlordReputation(address landlord) public view returns (euint32) {
        return landlordReputation[landlord];
    }
    
    function terminateAgreement(uint256 agreementId) public {
        require(agreements[agreementId].landlord == msg.sender || agreements[agreementId].tenant == msg.sender, "Only parties to agreement can terminate");
        require(agreements[agreementId].isActive, "Agreement must be active");
        
        agreements[agreementId].isActive = false;
        agreements[agreementId].isTerminated = true;
        
        // Mark property as available again
        uint256 propertyId = agreementId; // Simplified for demo
        properties[propertyId].isAvailable = true;
    }
}
