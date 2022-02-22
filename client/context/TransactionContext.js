import React, { useEffect, useState, createContext, useContext } from 'react'
import { useRouter } from 'next/router'
import { ethers } from 'ethers'

const TransactionContext = createContext()

export const TransactionProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const [formData, setFormData] = useState({
      addressTo: '',
      amount: '',
    })

    useEffect(() => {
        checkIfWalletConnected()
    }, [])

    const checkIfWalletConnected = async () => {
        try {
            if(!window.ethereum) return alert('Please install metamask')
            const accounts = await window.ethereum.request({ method: 'eth_accounts' })
            if(accounts.length) {
                setCurrentAccount(accounts[0])
            } 
        } catch(error) {
            alert(error)
            console.log('Check wallet error: ', error)
        }
    }

    const connectWallet = async () => {
        try {
          if (!window.ethereum) return alert('Please install metamask ')
    
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    
          setCurrentAccount(accounts[0])
        } catch (error) {
          console.error(error)
          throw new Error('No ethereum object.')
        }
      }

    const value = { connectWallet, currentAccount }

    return (
        <TransactionContext.Provider value={value}>
            {children}
        </TransactionContext.Provider>
    )
}

export const useTransactionContext = () => useContext(TransactionContext)