const { ethers } = require("hardhat");

async function main() {
  console.log("Initializing property data...");

  // Read deployment info
  const fs = require('fs');
  const deploymentInfo = JSON.parse(fs.readFileSync('deployment-info.json', 'utf8'));
  
  console.log("Contract address:", deploymentInfo.contractAddress);
  
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  if (!deployer.address) {
    throw new Error("No deployer account found. Please check your private key configuration.");
  }
  
  // Get the contract instance
  const RentShieldedFair = await ethers.getContractFactory("RentShieldedFair");
  const contract = RentShieldedFair.attach(deploymentInfo.contractAddress);

  // Sample property data
  const properties = [
    {
      name: "Luxury Downtown Apartment",
      description: "Modern 2-bedroom apartment in the heart of downtown with stunning city views, hardwood floors, and premium amenities.",
      location: "New York, NY",
      monthlyRent: 3500,
      securityDeposit: 7000,
      propertySize: 1200,
      bedrooms: 2,
      bathrooms: 2
    },
    {
      name: "Cozy Suburban House",
      description: "Charming 3-bedroom house in a quiet suburban neighborhood with a large backyard and garage.",
      location: "San Francisco, CA",
      monthlyRent: 4200,
      securityDeposit: 8400,
      propertySize: 1800,
      bedrooms: 3,
      bathrooms: 2
    },
    {
      name: "Modern Studio Loft",
      description: "Contemporary studio loft with high ceilings, exposed brick walls, and open floor plan perfect for young professionals.",
      location: "Los Angeles, CA",
      monthlyRent: 2800,
      securityDeposit: 5600,
      propertySize: 800,
      bedrooms: 1,
      bathrooms: 1
    },
    {
      name: "Family Townhouse",
      description: "Spacious 4-bedroom townhouse with modern kitchen, large living area, and private patio. Perfect for families.",
      location: "Chicago, IL",
      monthlyRent: 3800,
      securityDeposit: 7600,
      propertySize: 2200,
      bedrooms: 4,
      bathrooms: 3
    },
    {
      name: "Penthouse Suite",
      description: "Luxurious penthouse with panoramic city views, premium finishes, and exclusive amenities including rooftop access.",
      location: "Miami, FL",
      monthlyRent: 5500,
      securityDeposit: 11000,
      propertySize: 1500,
      bedrooms: 2,
      bathrooms: 2
    }
  ];

  console.log("Adding properties to the contract...");

  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    console.log(`\nAdding property ${i + 1}: ${property.name}`);
    
    try {
      const tx = await contract.listProperty(
        property.name,
        property.description,
        property.location,
        property.monthlyRent,
        property.securityDeposit,
        property.propertySize,
        property.bedrooms,
        property.bathrooms
      );
      
      await tx.wait();
      console.log(`✅ Property "${property.name}" added successfully!`);
      console.log(`   Monthly Rent: $${property.monthlyRent}`);
      console.log(`   Security Deposit: $${property.securityDeposit}`);
      console.log(`   Size: ${property.propertySize} sq ft`);
      console.log(`   Bedrooms: ${property.bedrooms}, Bathrooms: ${property.bathrooms}`);
      console.log(`   Location: ${property.location}`);
      
    } catch (error) {
      console.error(`❌ Failed to add property "${property.name}":`, error.message);
    }
  }

  console.log("\n🎉 Property initialization completed!");
  console.log(`Total properties added: ${properties.length}`);
  console.log(`Contract address: ${deploymentInfo.contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
