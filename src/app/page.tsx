"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

// ===== 당신 정보 (교수님이 제일 먼저 확인하는 부분) =====
const STUDENT_ID = "92113504";
const STUDENT_NAME = "김동현";
const OWNER_ADDRESS = "0x2c5ac8399b467ecbed3d585989d49b398ad7679c";

// ===== 당신이 방금 배포한 컨트랙트 주소 (여기만 바꾸세요!) =====
const CONTRACT_ADDRESS = "0x여기에_당신이_배포한_주소_넣기"; // ← 꼭 바꾸기!!

// ===== ABI (Remix에서 복사한 거 붙여넣기 or 아래 사용) =====
const ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function burn(uint256 amount)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

export default function Home() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      loadBalance(accounts[0]);
    }
  };

  const loadBalance = async (addr: string) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const bal = await contract.balanceOf(addr);
    setBalance(ethers.formatEther(bal));
  };

  const transfer = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    const tx = await contract.transfer(to, ethers.parseEther(amount));
    await tx.wait();
    alert("전송 성공!");
    loadBalance(account);
  };

  const burn = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    const tx = await contract.burn(ethers.parseEther(amount));
    await tx.wait();
    alert("소각 성공!");
    loadBalance(account);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white p-8">
      {/* 교수님이 제일 먼저 보는 부분 */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold mb-4">중부대학교 정보보호학과</h1>
        <h2 className="text-3xl">{STUDENT_ID} {STUDENT_NAME}</h2>
      </div>

      <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur rounded-2xl p-8 shadow-2xl">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/20 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">ERC-20 컨트랙트 정보</h3>
            <p className="break-all text-sm">주소: {CONTRACT_ADDRESS}</p>
            <p className="break-all text-sm mt-2">소유자: {OWNER_ADDRESS}</p>
          </div>
          <div className="bg-white/20 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">내 지갑</h3>
            <p className="break-all text-sm">{account || "연결되지 않음"}</p>
            <p className="text-2xl font-bold mt-4">{balance} DTK</p>
          </div>
        </div>

        {!account ? (
          <button onClick={connectWallet} className="w-full bg-green-500 hover:bg-green-600 py-4 rounded-xl text-xl font-bold">
            MetaMask 연결
          </button>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-4">토큰 전송</h3>
              <input
                placeholder="받는 주소 (0x...)"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full p-4 rounded-lg text-black mb-3"
              />
              <input
                placeholder="보낼 금액"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-4 rounded-lg text-black"
              />
              <div className="flex gap-4 mt-4">
                <button onClick={transfer} className="flex-1 bg-blue-600 hover:bg-blue-700 py-4 rounded-lg font-bold">
                  전송하기
                </button>
                <button onClick={burn} className="flex-1 bg-red-600 hover:bg-red-700 py-4 rounded-lg font-bold">
                  소각하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}