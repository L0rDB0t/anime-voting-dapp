// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AnimeVoting is Ownable {
    struct Character {
        string name;
        uint256 voteCount;
    }
    
    Character[] public characters;
    mapping(address => bool) public hasVoted;
    
    event Voted(address indexed voter, uint256 characterIndex);

    constructor(string[] memory characterNames) Ownable() {
        for (uint i = 0; i < characterNames.length; i++) {
            characters.push(Character({
                name: characterNames[i],
                voteCount: 0
            }));
        }
    }

    function vote(uint256 characterIndex) external {
        require(characterIndex < characters.length, "Invalid character index");
        require(!hasVoted[msg.sender], "You have already voted");
        
        characters[characterIndex].voteCount++;
        hasVoted[msg.sender] = true;
        
        emit Voted(msg.sender, characterIndex);
    }
    
    function getAllCharacters() external view returns (Character[] memory) {
        return characters;
    }
    
    function getCharacter(uint256 index) external view returns (string memory, uint256) {
        require(index < characters.length, "Invalid index");
        return (characters[index].name, characters[index].voteCount);
    }

    // Solo el owner puede añadir personajes
    function addCharacter(string memory name) external onlyOwner {
        characters.push(Character({
            name: name,
            voteCount: 0
        }));
    }
}
