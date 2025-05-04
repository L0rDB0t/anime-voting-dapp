import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import AnimeVoting from './contracts/AnimeVoting.json';
import './App.css'; // Asegúrate de importar el CSS

const CONTRACT_ADDRESS = "0xD1516F6fA4F1EC48A0EDD31D0c0d4C9d817f6438";
const SEPOLIA_CHAIN_ID = "0xaa36a7";

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState({
    app: true,
    voting: false
  });
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const checkVoteStatus = useCallback(async (accountAddress) => {
    if (!contract) return;
    
    try {
      const voted = await contract.hasVoted(accountAddress);
      setHasVoted(voted);
    } catch (error) {
      console.error("Error verificando estado de voto:", error);
      setError("Error al verificar si ya votaste");
    }
  }, [contract]);

  const loadCharacters = useCallback(async () => {
    if (!contract) return;
    
    try {
      const chars = await contract.getAllCharacters();
      setCharacters(chars);
    } catch (error) {
      console.error("Error cargando personajes:", error);
      setError("Error al cargar los personajes");
    }
  }, [contract]);

  const init = useCallback(async () => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask no está instalado");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Verificar y configurar red correcta
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SEPOLIA_CHAIN_ID }]
        });
      } catch (switchError) {
        // Si la red no está añadida, la añadimos
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: SEPOLIA_CHAIN_ID,
              chainName: 'Sepolia Test Network',
              nativeCurrency: {
                name: 'Sepolia Ether',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            }]
          });
        } else {
          throw new Error("Por favor cambia a la red Sepolia en MetaMask");
        }
      }

      // Obtener cuentas
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);

      // Crear instancia del contrato
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AnimeVoting.abi, signer);
      setContract(contract);

      // Verificar estado de votación
      await checkVoteStatus(accounts[0]);

      // Cargar personajes
      await loadCharacters();

      // Escuchar eventos de votación
      contract.on("Voted", (voter, characterIndex) => {
        if (voter.toLowerCase() === accounts[0].toLowerCase()) {
          setHasVoted(true);
          setSuccess("¡Tu voto ha sido registrado!");
          setTimeout(() => setSuccess(null), 5000);
        }
        loadCharacters();
      });

    } catch (error) {
      console.error("Error inicializando:", error);
      setError(error.message);
    } finally {
      setLoading(prev => ({...prev, app: false}));
    }
  }, [checkVoteStatus, loadCharacters]);

  useEffect(() => {
    if (window.ethereum) {
      init();
      
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          checkVoteStatus(accounts[0]);
        } else {
          setAccount(null);
          setHasVoted(false);
        }
      };
      
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', () => window.location.reload());
      };
    } else {
      setError("MetaMask no está instalado. Por favor, instálalo para interactuar con esta dApp.");
      setLoading(prev => ({...prev, app: false}));
    }
  }, [init, checkVoteStatus]);

  const handleVote = async (index) => {
    if (!contract) return;
    
    try {
      setLoading(prev => ({...prev, voting: true}));
      setError(null);
      
      const tx = await contract.vote(index);
      await tx.wait();
      
      setSuccess("¡Voto registrado con éxito!");
      
    } catch (error) {
      console.error("Error votando:", error);
      
      if (error.code === 4001) {
        setError("Transacción cancelada por el usuario");
      } else if (error.code === -32603) {
        setError("Error en la red. ¿Tienes suficiente ETH para la transacción?");
      } else {
        setError(error.message.includes("already voted") 
          ? "Ya has votado anteriormente" 
          : "Error al procesar el voto");
      }
    } finally {
      setLoading(prev => ({...prev, voting: false}));
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(prev => ({...prev, app: true}));
      setError(null);
      
      if (!window.ethereum) {
        throw new Error("MetaMask no está instalado");
      }
      
      await init();
    } catch (error) {
      setError(error.message);
      setLoading(prev => ({...prev, app: false}));
    }
  };

  if (loading.app) {
    return (
      <div className="app-container">
        <div className="loading-screen">
          <h1>Votación de Personajes de Anime</h1>
          <div className="spinner"></div>
          <p>Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header>
        <h1>Votación de Personajes de Anime</h1>
      </header>

      <main>
        {error && (
          <div className="alert error">
            {error}
            {error.includes("Sepolia") && (
              <button className="network-button" onClick={() => window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: SEPOLIA_CHAIN_ID }]
              })}>
                Cambiar a Sepolia
              </button>
            )}
            {error.includes("MetaMask no está instalado") && (
              <a href="https://metamask.io/download.html" target="_blank" rel="noopener noreferrer" className="download-button">
                Instalar MetaMask
              </a>
            )}
          </div>
        )}
        
        {success && <div className="alert success">{success}</div>}

        {!account ? (
          <div className="connect-section">
            <button className="connect-button" onClick={connectWallet}>
              Conectar MetaMask
            </button>
            <p className="help-text">Necesitas MetaMask para interactuar con esta dApp</p>
          </div>
        ) : (
          <div className="voting-interface">
            <div className="account-info">
              <p><span className="label">Conectado como:</span> <span className="address">{`${account.slice(0, 6)}...${account.slice(-4)}`}</span></p>
              <p><span className="label">Red:</span> <span className="network">Sepolia Testnet</span></p>
            </div>

            <div className="characters-grid">
              {characters.map((character, index) => (
                <div key={index} className="character-card">
                  <div className="character-image">
                    <div className="placeholder-image">{character.name.charAt(0)}</div>
                  </div>
                  <h2>{character.name}</h2>
                  <div className="vote-count">
                    <span>{character.voteCount.toString()}</span> votos
                  </div>
                  {!hasVoted && (
                    <button 
                      className="vote-button"
                      onClick={() => handleVote(index)} 
                      disabled={loading.voting}
                    >
                      {loading.voting ? (
                        <>
                          <span className="spinner-small"></span> Procesando...
                        </>
                      ) : (
                        "Votar"
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {hasVoted && (
              <div className="voted-message">
                <h3>¡Gracias por votar!</h3>
                <p>Tu voto ha sido registrado correctamente.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer>
        <p>dApp de Votación - Desarrollado con React y Ethereum</p>
      </footer>
    </div>
  );
}

export default App;