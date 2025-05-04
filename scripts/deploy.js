const hre = require("hardhat");

async function main() {
  const characterNames = [
    "Naruto Uzumaki",
    "Monkey D. Luffy",
    "Goku",
    "Light Yagami",
    "Eren Yeager"
  ];

  const AnimeVoting = await hre.ethers.getContractFactory("AnimeVoting");
  const animeVoting = await AnimeVoting.deploy(characterNames);

  await animeVoting.waitForDeployment(); // Nueva forma en Hardhat

  console.log("AnimeVoting deployed to:", animeVoting.target); // Usa target en lugar de address
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
