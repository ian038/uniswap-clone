import React, { useEffect, useState, createContext, useContext } from 'react'
import { useRouter } from 'next/router'
import { ethers } from 'ethers'
import { transactionsABI, transactionsAddress } from '../utils/constants'

const TransactionContext = createContext()

const getTransactionsContract = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const transactionsContract = new ethers.Contract(transactionsAddress, transactionsABI, signer)
    return transactionsContract
}

export const TransactionProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const [formData, setFormData] = useState({
      addressTo: '',
      amount: ''
    })

    const handleChange = (e, name) => {
        setFormData(prevState => ({ ...prevState, [name]: e.target.value }))
    }

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

    const saveTransaction = async (txHash, amount, fromAddress, toAddress) => {
        const txDoc = {
          _type: 'transactions',
          _id: txHash,
          fromAddress: fromAddress,
          toAddress: toAddress,
          timestamp: new Date(Date.now()).toISOString(),
          txHash: txHash,
          amount: parseFloat(amount)
        }
    
        await client.createIfNotExists(txDoc)
    
        await client
          .patch(currentAccount)
          .setIfMissing({ transactions: [] })
          .insert('after', 'transactions[-1]', [
            {
              _key: txHash,
              _ref: txHash,
              _type: 'reference',
            },
          ])
          .commit()

        return
    }

    const sendTransaction = async () => {
        try {
          if (!window.ethereum) return alert('Please install metamask')
          const { addressTo, amount } = formData
          const transactionContract = getTransactionsContract()
    
          const parsedAmount = ethers.utils.parseEther(amount)
    
          await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [
              {
                from: currentAccount,
                to: addressTo,
                gas: '0x7EF40', // 520000 Gwei
                value: parsedAmount._hex
              }
            ]
          })
    
          const transactionHash = await transactionContract.publishTransaction(addressTo, parsedAmount, `Transferring ETH ${parsedAmount} to ${addressTo}`, 'TRANSFER')
    
          setLoading(true)
    
          await transactionHash.wait()
    
        //   await saveTransaction(transactionHash.hash, amount, currentAccount, addressTo)
    
          setLoading(false)
        } catch (error) {
          console.log(error)
        }
    }

    useEffect(() => {
        checkIfWalletConnected()
    }, [])

    const value = { connectWallet, currentAccount, formData, setFormData, handleChange, sendTransaction, loading }

    return (
        <TransactionContext.Provider value={value}>
            {children}
        </TransactionContext.Provider>
    )
}

export const useTransactionContext = () => useContext(TransactionContext)