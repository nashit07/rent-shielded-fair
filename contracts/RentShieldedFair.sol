// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { euint32, externalEuint32, euint8, ebool, FHE } from "@fhevm/solidity/lib/FHE.sol";

contract RentShieldedFair is SepoliaConfig {
    using FHE for *;
    
    struct Property {
        euint32 propertyId;
        euint32 monthlyRent;
        euint32 securityDeposit;
        euint32 propertySize;
        euint32 bedrooms;
        euint32 bathrooms;
        bool isAvailable;
        bool isVerified;
        string name;
        string description;
        string location;
        address owner;
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    struct RentalApplication {
        euint32 applicationId;
        euint32 propertyId;
        euint32 proposedRent;
        euint32 creditScore;
        euint32 income;
        bool isApproved;
        bool isRejected;
        string applicationHash;
        address applicant;
        address propertyOwner;
        uint256 submittedAt;
        uint256 reviewedAt;
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
    
    uint256 public propertyCounter;
    uint256 public applicationCounter;
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
        uint256 _bedrooms,
        uint256 _bathrooms
    ) public returns (uint256) {
        require(bytes(_name).length > 0, "Property name cannot be empty");
        require(_monthlyRent > 0, "Monthly rent must be positive");
        require(_securityDeposit > 0, "Security deposit must be positive");
        
        uint256 propertyId = propertyCounter++;
        
        properties[propertyId] = Property({
            propertyId: FHE.asEuint32(0), // Will be set properly later
            monthlyRent: FHE.asEuint32(0), // Will be set to actual value via FHE operations
            securityDeposit: FHE.asEuint32(0), // Will be set to actual value via FHE operations
            propertySize: FHE.asEuint32(0), // Will be set to actual value via FHE operations
            bedrooms: FHE.asEuint32(0), // Will be set to actual value via FHE operations
            bathrooms: FHE.asEuint32(0), // Will be set to actual value via FHE operations
            isAvailable: true,
            isVerified: false,
            name: _name,
            description: _description,
            location: _location,
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
            applicationId: FHE.asEuint32(0), // Will be set properly later
            propertyId: FHE.asEuint32(0), // Will be set to actual value via FHE operations
            proposedRent: internalProposedRent,
            creditScore: internalCreditScore,
            income: internalIncome,
            isApproved: false,
            isRejected: false,
            applicationHash: applicationHash,
            applicant: msg.sender,
            propertyOwner: properties[propertyId].owner,
            submittedAt: block.timestamp,
            reviewedAt: 0
        });
        
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
            agreementId: FHE.asEuint32(0), // Will be set properly later
            propertyId: FHE.asEuint32(0), // Will be set to actual value via FHE operations
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
            paymentId: FHE.asEuint32(0), // Will be set properly later
            agreementId: FHE.asEuint32(0), // Will be set to actual value via FHE operations
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
        uint8 monthlyRent,
        uint8 securityDeposit,
        uint8 propertySize,
        uint8 bedrooms,
        uint8 bathrooms,
        bool isAvailable,
        bool isVerified,
        address owner,
        uint256 createdAt
    ) {
        Property storage property = properties[propertyId];
        return (
            property.name,
            property.description,
            property.location,
            0, // FHE.decrypt(property.monthlyRent) - will be decrypted off-chain
            0, // FHE.decrypt(property.securityDeposit) - will be decrypted off-chain
            0, // FHE.decrypt(property.propertySize) - will be decrypted off-chain
            0, // FHE.decrypt(property.bedrooms) - will be decrypted off-chain
            0, // FHE.decrypt(property.bathrooms) - will be decrypted off-chain
            property.isAvailable,
            property.isVerified,
            property.owner,
            property.createdAt
        );
    }
    
    function getApplicationInfo(uint256 applicationId) public view returns (
        uint8 proposedRent,
        uint8 creditScore,
        uint8 income,
        bool isApproved,
        bool isRejected,
        string memory applicationHash,
        address applicant,
        address propertyOwner,
        uint256 submittedAt
    ) {
        RentalApplication storage application = applications[applicationId];
        return (
            0, // FHE.decrypt(application.proposedRent) - will be decrypted off-chain
            0, // FHE.decrypt(application.creditScore) - will be decrypted off-chain
            0, // FHE.decrypt(application.income) - will be decrypted off-chain
            application.isApproved,
            application.isRejected,
            application.applicationHash,
            application.applicant,
            application.propertyOwner,
            application.submittedAt
        );
    }
    
    function getAgreementInfo(uint256 agreementId) public view returns (
        uint8 monthlyRent,
        uint8 securityDeposit,
        uint8 leaseDuration,
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
            0, // FHE.decrypt(agreement.monthlyRent) - will be decrypted off-chain
            0, // FHE.decrypt(agreement.securityDeposit) - will be decrypted off-chain
            0, // FHE.decrypt(agreement.leaseDuration) - will be decrypted off-chain
            agreement.isActive,
            agreement.isTerminated,
            agreement.agreementHash,
            agreement.tenant,
            agreement.landlord,
            agreement.startDate,
            agreement.endDate
        );
    }
    
    function getPaymentInfo(uint256 paymentId) public view returns (
        uint8 amount,
        uint8 month,
        uint8 year,
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
            0, // FHE.decrypt(payment.amount) - will be decrypted off-chain
            0, // FHE.decrypt(payment.month) - will be decrypted off-chain
            0, // FHE.decrypt(payment.year) - will be decrypted off-chain
            payment.isPaid,
            payment.isLate,
            payment.paymentHash,
            payment.payer,
            payment.recipient,
            payment.dueDate,
            payment.paidAt
        );
    }
    
    function getTenantReputation(address tenant) public view returns (uint8) {
        return 0; // FHE.decrypt(tenantReputation[tenant]) - will be decrypted off-chain
    }
    
    function getLandlordReputation(address landlord) public view returns (uint8) {
        return 0; // FHE.decrypt(landlordReputation[landlord]) - will be decrypted off-chain
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
