const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Déploiement des smart contracts OJ Investment...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Déploiement avec le compte:", deployer.address);
  console.log("💰 Solde du compte:", (await deployer.provider.getBalance(deployer.address)).toString(), "\n");

  // 1. Déployer OJInvestmentManager
  console.log("📦 Déploiement de OJInvestmentManager...");
  const OJInvestmentManager = await hre.ethers.getContractFactory("OJInvestmentManager");
  const investmentManager = await OJInvestmentManager.deploy();
  await investmentManager.waitForDeployment();
  const investmentManagerAddress = await investmentManager.getAddress();
  console.log("✅ OJInvestmentManager déployé à:", investmentManagerAddress, "\n");

  // 2. Déployer OJEscrow
  console.log("📦 Déploiement de OJEscrow...");
  const OJEscrow = await hre.ethers.getContractFactory("OJEscrow");
  const escrow = await OJEscrow.deploy();
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("✅ OJEscrow déployé à:", escrowAddress, "\n");

  // 3. Configuration initiale
  console.log("⚙️  Configuration des rôles...");

  // Ajouter le deployer comme admin dans InvestmentManager (déjà fait dans le constructor)
  console.log("✅ Deployer est admin dans InvestmentManager");

  // Ajouter le InvestmentManager comme SPV manager dans Escrow
  await escrow.addSpvManager(investmentManagerAddress);
  console.log("✅ InvestmentManager ajouté comme SPV manager dans Escrow");

  // Ajouter le deployer comme bank partner dans Escrow (pour les tests)
  await escrow.addBankPartner(deployer.address);
  console.log("✅ Deployer ajouté comme bank partner dans Escrow\n");

  // 4. Créer un projet exemple (optionnel, pour tests)
  if (process.env.CREATE_EXAMPLE_PROJECT === "true") {
    console.log("📝 Création d'un projet exemple...");

    const projectId = "example-solar-farm-001";
    const projectName = "Solar Farm Alpha Example";
    const symbol = "OJSFA";
    const fundingGoal = hre.ethers.parseEther("1000000"); // 1M EUR en wei
    const expectedReturn = 850; // 8.5%
    const projectDuration = 24; // 24 mois
    const minimumInvestment = hre.ethers.parseEther("1000"); // 1000 EUR minimum
    const fundingDeadline = Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60); // 90 jours

    const tx = await investmentManager.createProject(
      projectId,
      projectName,
      symbol,
      fundingGoal,
      expectedReturn,
      projectDuration,
      minimumInvestment,
      fundingDeadline
    );
    await tx.wait();

    const tokenAddress = await investmentManager.getProjectToken(projectId);
    console.log("✅ Projet exemple créé avec token à:", tokenAddress, "\n");

    // Créer un compte escrow pour ce projet
    await escrow.createEscrowAccount(projectId, fundingGoal);
    console.log("✅ Compte escrow créé pour le projet exemple\n");
  }

  // 5. Sauvegarder les adresses dans un fichier
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    contracts: {
      OJInvestmentManager: investmentManagerAddress,
      OJEscrow: escrowAddress,
    },
    deployedAt: new Date().toISOString(),
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `${hre.network.name}-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));

  // Sauvegarder aussi dans latest.json
  const latestPath = path.join(deploymentsDir, `${hre.network.name}-latest.json`);
  fs.writeFileSync(latestPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("📄 Informations de déploiement sauvegardées dans:", filename);
  console.log("\n✨ Déploiement terminé avec succès!\n");

  console.log("📋 Résumé:");
  console.log("━".repeat(60));
  console.log(`Network:              ${hre.network.name}`);
  console.log(`Chain ID:             ${deploymentInfo.chainId}`);
  console.log(`InvestmentManager:    ${investmentManagerAddress}`);
  console.log(`Escrow:               ${escrowAddress}`);
  console.log("━".repeat(60));

  console.log("\n💡 Prochaines étapes:");
  console.log("1. Copier ces adresses dans votre fichier .env");
  console.log("2. Vérifier les contrats sur l'explorateur de blocs");
  console.log("3. Configurer le backend avec ces adresses");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erreur lors du déploiement:", error);
    process.exit(1);
  });
