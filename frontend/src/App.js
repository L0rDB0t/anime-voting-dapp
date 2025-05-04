import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import AnimeVoting from './contracts/AnimeVoting.json';

const CONTRACT_ADDRESS = "0xD1516F6fA4F1EC48A0EDD31D0c0d4C9d817f6438";
const SEPOLIA_CHAIN_ID = "0xaa36a7"; // Chain ID de Sepolia en hexadecimal

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
      const provider = new ethers.BrowserProvider(window.ethereum);

      // Verificar red correcta (Sepolia)
      const network = await provider.getNetwork();
      if (network.chainId !== 11155111n) {
        throw new Error("Por favor cambia a la red Sepolia en MetaMask");
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
      
      setSuccess("Procesando tu voto...");
      
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
      await init();
    } catch (error) {
      setError(error.message);
    }
  };

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }]
      });
    } catch (error) {
      console.error("Error cambiando a Sepolia:", error);
      setError("Error al cambiar a la red Sepolia");
    }
  };

  if (loading.app) {
    return (
      <div className="App">
        <div className="loading-container">
          <h1>Votación de Personajes de Anime</h1>
          <p>Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Votación de Personajes de Anime</h1>
      
      {error && (
        <div className="error-message">
          {error}
          {error.includes("Sepolia") && (
            <button onClick={switchToSepolia}>
              Cambiar a Sepolia
            </button>
          )}
        </div>
      )}
      
      {success && <div className="success-message">{success}</div>}

      {!account ? (
        <button className="connect-button" onClick={connectWallet}>
          Conectar MetaMask
        </button>
      ) : (
        <>
          <div className="account-info">
            <p>Conectado como: <span>{`${account.slice(0, 6)}...${account.slice(-4)}`}</span></p>
            <p>Red: <span>Sepolia Testnet</span></p>
          </div>

          <div className="characters-list">
            {characters.map((character, index) => (
              <div key={index} className="character-card">
                <h2>{character.name}</h2>
                <p>Votos: {character.voteCount.toString()}</p>
                {!hasVoted && (
                  <button 
                    onClick={() => handleVote(index)} 
                    disabled={loading.voting}
                  >
                    {loading.voting ? "Procesando..." : "Votar"}
                  </button>
                )}
              </div>
            ))}
          </div>

          {hasVoted && (
            <div className="voted-message">
              <p>¡Ya has votado! Gracias por participar.</p>
              <p>Puedes ver los resultados arriba.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;