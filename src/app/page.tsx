"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

// TypeScript 에러 해결용 (이 5줄 반드시 포함!)
declare global {
  interface Window {
    ethereum?: any;
  }
}

// ───────────────────────────────────────────────
// 교수님이 제일 먼저 확인하시는 부분 (학번 + 이름 + 소유자 주소)
// ───────────────────────────────────────────────
const STUDENT_ID = "92113504";
const STUDENT_NAME = "김동현";
const OWNER_ADDRESS = "0x2c5ac8399b467ecbed3d585989d49b398ad7679c";

// ───────────────────────────────────────────────
// 당신이 Remix에서 배포한 컨트랙트 주소 (여기만 바꾸세요!)
// ───────────────────────────────────────────────
const CONTRACT_ADDRESS = "0x여기에_당신이_배포한_주소_넣기"; // ← 꼭 수정!!

// ───────────────────────────────────────────────
// ERC-20 ABI (Remix에서 복사해도 되고 이거 써도 됨)
// ───────────────────────────────────────────────
const ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function burn(uint256 amount)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

export default function Home() {
  const [account, setAccount] = useState<string>("");
  const [balance, setBalance] = useState<string>("0");
  const [toAddress, setToAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  // ───────────────────────────────────────────────
  // 지갑 연결
  // ───────────────────────────────────────────────
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask를 설치해주세요!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      loadBalance(accounts[0]);
    } catch (error) {
      console.error(error);
      alert("지갑 연결 실패");
    }
  };

  // ───────────────────────────────────────────────
  // 잔액 조회
  // ───────────────────────────────────────────────
  const loadBalance = async (addr: string) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      const bal = await contract.balanceOf(addr);
      setBalance(ethers.formatEther(bal));
    } catch (error) {
      console.error(error);
    }
  };

  // ───────────────────────────────────────────────
  // 토큰 전송
  // ───────────────────────────────────────────────
  const transferTokens = async () => {
    if (!toAddress || !amount) return alert("주소와 금액을 입력하세요");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const tx = await contract.transfer(toAddress, ethers.parseEther(amount));
      await tx.wait();
      alert("전송 성공!");
      loadBalance(account);
      setToAddress("");
      setAmount("");
    } catch (error: any) {
      alert("전송 실패: " + error.message);
    }
  };

  // ───────────────────────────────────────────────
  // 토큰 소각 (보너스 점수!)
  // ───────────────────────────────────────────────
  const burnTokens = async () => {
    if (!amount) return alert("소각할 금액을 입력하세요");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const tx = await contract.burn(ethers.parseEther(amount));
      await tx.wait();
      alert("소각 성공!");
      loadBalance(account);
      setAmount("");
    } catch (error: any) {
      alert("소각 실패: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-6 py-12 max-w-4xl">

        {/* 교수님이 제일 먼저 보는 부분 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">중부대학교 정보보호학과</h1>
          <h2 className="text-3xl font-semibold">
            {STUDENT_ID} {STUDENT_NAME}
          </h2>
        </div>

        {/* 컨트랙트 정보 표시 (교수님 필수 요구사항) */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-10 shadow-2xl">
          <h3 className="text-2xl font-bold mb-6">ERC-20 컨트랙트 정보</h3>
          <div className="space-y-3 text-lg">
            <p><span className="font-medium">컨트랙트 주소:</span> 
              <span className="font-mono text-sm break-all block mt-1">{CONTRACT_ADDRESS}</span>
            </p>
            <p><span className="font-medium">소유자 주소:</span> 
              <span className="font-mono text-sm break-all block mt-1">{OWNER_ADDRESS}</span>
            </p>
          </div>
        </div>

        {/* 지갑 연결 상태 */}
        {!account ? (
          <div className="text-center">
            <button
              onClick={connectWallet}
              className="bg-green-500 hover:bg-green-600 text-white text-2xl font-bold py-6 px-12 rounded-2xl transition transform hover:scale-105"
            >
              MetaMask 연결하기
            </button>
          </div>
        ) : (
          <div className="space-y-8">

            {/* 내 정보 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
              <p className="text-xl mb-2">내 지갑 주소</p>
              <p className="font-mono text-lg break-all">{account}</p>
              <p className="text-4xl font-bold mt-6">{balance} DTK</p>
            </div>

            {/* 전송 폼 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6">토큰 전송</h3>
              <input
                type="text"
                placeholder="받는 주소 (0x...)"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                className="w-full p-4 rounded-lg text-black mb-4 text-lg"
              />
              <input
                type="text"
                placeholder="보낼 금액"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-4 rounded-lg text-black mb-6 text-lg"
              />
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={transferTokens}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl py-5 rounded-xl transition"
                >
                  전송하기
                </button>
                <button
                  onClick={burnTokens}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xl py-5 rounded-xl transition"
                >
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
