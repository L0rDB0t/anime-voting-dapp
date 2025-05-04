README - Anime Voting dApp 🗳️
Banner de la Aplicación

Una aplicación descentralizada (dApp) para votar por tus personajes de anime favoritos en la blockchain de Ethereum (red de pruebas Sepolia).

🌟 Características Principales
Votación descentralizada en la blockchain

Interfaz intuitiva con imágenes de los personajes

Conexión con MetaMask para autenticación

Resultados en tiempo real almacenados en la blockchain

Diseño responsive que funciona en móviles y desktop

🛠️ Tecnologías Utilizadas
Frontend
React.js - Biblioteca principal para la interfaz

Ethers.js (v6) - Conexión con la blockchain y contratos inteligentes

CSS Modules - Estilizado de componentes

Vercel - Despliegue continuo

Blockchain
Solidity - Lenguaje para contratos inteligentes

Hardhat - Entorno de desarrollo Ethereum

OpenZeppelin - Librería de contratos seguros

Sepolia Testnet - Red de pruebas de Ethereum

Herramientas
Git/GitHub - Control de versiones

MetaMask - Wallet para interactuar con la dApp

Infura - Nodos de Ethereum para conexión

📦 Estructura del Proyecto
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
🚀 Cómo Ejecutarlo Localmente
Requisitos Previos
Node.js (v16+)

MetaMask instalado en tu navegador

Fondos de prueba de Sepolia (puedes obtenerlos en Sepolia Faucet)

Instalación
Clona el repositorio:

bash
git clone https://github.com/tu-usuario/anime-voting-dapp.git
cd anime-voting-dapp
Instala dependencias:

bash
npm install
cd frontend
npm install
Configura variables de entorno:
Crea un archivo .env en la raíz con:

SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/TU_API_KEY
PRIVATE_KEY=TU_LLAVE_PRIVADA_METAMASK
Ejecución
Inicia el servidor de desarrollo:

bash
cd frontend
npm start
Abre http://localhost:3000 en tu navegador.

🌐 Cómo Usar la Aplicación
Conecta tu Wallet:

Haz clic en "Conectar MetaMask"

Acepta la conexión en la extensión de MetaMask

Asegúrate de estar en la red Sepolia

Vota por tu personaje favorito:

Selecciona un personaje de la lista

Confirma la transacción en MetaMask

¡Tu voto quedará registrado en la blockchain!

Ver resultados:

Los votos se actualizan en tiempo real

Puedes ver el histórico en Sepolia Etherscan

🔍 Detalles Técnicos del Contrato
Contrato Desplegado: 0xD1516F6fA4F1EC48A0EDD31D0c0d4C9d817f6438

Funciones Principales:

vote(uint256 characterIndex) - Registra un voto

getAllCharacters() - Devuelve la lista completa de personajes y votos

hasVoted(address voter) - Verifica si una dirección ya votó

📝 Licencia
Este proyecto está bajo la licencia MIT - ver el archivo LICENSE para más detalles.

🙌 Contribuciones
Las contribuciones son bienvenidas. Por favor abre un issue o pull request para sugerir mejoras.
