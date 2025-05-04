import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import AnimeVoting from './contracts/AnimeVoting.json';
import './App.css';

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

  const switchToSepolia = useCallback(async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }]
      });
      return true;
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
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
          return true;
        } catch (addError) {
          console.error("Error añadiendo red Sepolia:", addError);
          return false;
        }
      }
      console.error("Error cambiando a Sepolia:", switchError);
      return false;
    }
  }, []);

  const init = useCallback(async () => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask no está instalado");
      }

      // 1. Conectar cuenta primero
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      setAccount(accounts[0]);

      // 2. Verificar/Configurar red
      const currentChainId = await window.ethereum.request({
        method: 'eth_chainId'
      });

      if (currentChainId !== SEPOLIA_CHAIN_ID) {
        const switched = await switchToSepolia();
        if (!switched) {
          throw new Error("Por favor cambia manualmente a Sepolia en MetaMask");
        }
      }

      // 3. Configurar provider y contrato
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, AnimeVoting.abi, signer);
      setContract(contract);

      // 4. Cargar datos
      await checkVoteStatus(accounts[0]);
      await loadCharacters();

      // Configurar listeners
      contract.on("Voted", (voter, characterIndex) => {
        if (voter.toLowerCase() === accounts[0].toLowerCase()) {
          setHasVoted(true);
          setSuccess("¡Voto registrado con éxito!");
          setTimeout(() => setSuccess(null), 5000);
        }
        loadCharacters();
      });

      return true;
    } catch (error) {
      console.error("Error inicializando:", error);
      setError(error.message);
      return false;
    } finally {
      setLoading(prev => ({...prev, app: false}));
    }
  }, [checkVoteStatus, loadCharacters, switchToSepolia]);

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          checkVoteStatus(accounts[0]);
        } else {
          setAccount(null);
          setHasVoted(false);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Intenta conectar automáticamente si ya estaba conectado
      const tryAutoConnect = async () => {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          init();
        } else {
          setLoading(prev => ({...prev, app: false}));
        }
      };

      tryAutoConnect();

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    } else {
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
        window.open("https://metamask.io/download.html", "_blank");
        throw new Error("MetaMask no está instalado. Redirigiendo...");
      }
      
      const initialized = await init();
      if (!initialized) {
        throw new Error("No se pudo inicializar la aplicación");
      }
    } catch (error) {
      console.error("Error conectando wallet:", error);
      setError(error.message);
    } finally {
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
            {typeof error === 'string' ? error : error.message}
            {error.includes("Sepolia") && (
              <button className="network-button" onClick={switchToSepolia}>
                Cambiar a Sepolia
              </button>
            )}
            {error.includes("MetaMask") && (
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

export default App;s