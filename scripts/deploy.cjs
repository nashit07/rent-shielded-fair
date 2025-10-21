const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying RentShieldedFair contract...");

  // Get the contract factory
  const RentShieldedFair = await ethers.getContractFactory("RentShieldedFair");

  // Deploy the contract with a verifier address (you can use any address for testing)
  const verifierAddress = "0x3c7fae276c590a8df81ed320851c53db4bc39916"; // Replace with actual verifier address
  
  const rentShieldedFair = await RentShieldedFair.deploy(verifierAddress);

  await rentShieldedFair.waitForDeployment();

  const contractAddress = await rentShieldedFair.getAddress();
  
  console.log("RentShieldedFair deployed to:", contractAddress);
  console.log("Verifier address:", verifierAddress);

  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    verifierAddress: verifierAddress,
    network: "sepolia",
    timestamp: new Date().toISOString(),
    deployer: await rentShieldedFair.runner.getAddress()
  };

  const fs = require('fs');
  fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
  
  console.log("Deployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
