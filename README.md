# README - Anime Voting dApp 🗳️
Banner de la Aplicación

Una aplicación descentralizada (dApp) para votar por tus personajes de anime favoritos en la blockchain de Ethereum (red de pruebas Sepolia).

🌟 Características Principales
Votación descentralizada en la blockchain

Interfaz intuitiva con imágenes de los personajes

Conexión con MetaMask para autenticación

Resultados en tiempo real almacenados en la blockchain

Diseño responsive que funciona en móviles y desktop

🛠️ Stack Tecnológico
Frontend
<p align="left"> <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"> <img src="https://img.shields.io/badge/Ethers.js-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethers.js"> <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3"> </p>
Blockchain
<p align="left"> <img src="https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white" alt="Solidity"> <img src="https://img.shields.io/badge/Hardhat-F7B93E?style=for-the-badge&logo=hardhat&logoColor=black" alt="Hardhat"> <img src="https://img.shields.io/badge/Sepolia-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Sepolia"> </p>
Herramientas
<p align="left"> <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"> <img src="https://img.shields.io/badge/MetaMask-FF7B00?style=for-the-badge&logo=metamask&logoColor=white" alt="MetaMask"> <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel"> </p>
🏗️ Estructura del Proyecto

anime-voting-dapp/
├── contracts/               # Contratos inteligentes
│   └── AnimeVoting.sol      # Lógica de votación
├── frontend/                # Aplicación React
│   ├── src/
│   │   ├── contracts/       # ABI y dirección del contrato
│   │   ├── App.js           # Componente principal
│   │   └── App.css          # Estilos principales
│   └── public/              # Assets estáticos
├── scripts/                 # Scripts de despliegue
└── hardhat.config.js        # Configuración de Hardhat
🚀 Instalación y Uso
Requisitos Previos
Node.js v16+

MetaMask instalado

Fondos de prueba de Sepolia (Faucet)

Configuración Inicial
Clonar repositorio:

bash
git clone https://github.com/tu-usuario/anime-voting-dapp.git
cd anime-voting-dapp
Instalar dependencias:

bash
npm install
cd frontend
npm install
Configurar variables de entorno:

bash
# .env en raíz del proyecto
SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/TU_API_KEY"
PRIVATE_KEY="TU_LLAVE_PRIVADA_METAMASK"
Ejecución Local
bash
cd frontend
npm start
Abre http://localhost:3000 en tu navegador.

📱 Cómo Usar la dApp
Conectar Wallet

Haz clic en "Conectar MetaMask"

Acepta la conexión en la extensión

Asegúrate de estar en la red Sepolia

Votar

Selecciona un personaje

Confirma la transacción en MetaMask

¡Tu voto quedará registrado en la blockchain!

Ver Resultados

Los votos se actualizan en tiempo real

Histórico en Etherscan

🔍 Detalles del Contrato
Dirección: 0xD1516F6fA4F1EC48A0EDD31D0c0d4C9d817f6438

Funciones Principales:

Función	Descripción
vote(uint256)	Registra un voto para un personaje
getAllCharacters()	Devuelve lista completa de personajes
hasVoted(address)	Verifica si una dirección ya votó
📜 Licencia
Este proyecto está bajo la licencia MIT. Ver LICENSE para detalles.

🤝 Contribuir
¿Quieres mejorar el proyecto?

Haz fork del repositorio

Crea una rama (git checkout -b feature/mejora)

Haz commit de tus cambios (git commit -m 'Añade nueva feature')

Haz push a la rama (git push origin feature/mejora)

Abre un Pull Request

Hecho con ❤️ por [L0RDB0T]
GitHub

bash
# Ejemplo de código destacado
npm run build && vercel --prod
