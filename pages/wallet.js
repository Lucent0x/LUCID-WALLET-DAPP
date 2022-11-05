import Head from 'next/Head'
import { useState, useEffect } from 'react'
import styles from '../styles/wallet.module.css'
import SmartContract from '../blockchain/wallet'
import  'bulma/css/bulma.css'
import Web3 from 'web3'

const  Wallet =  ( ) =>{

    // STATE VARIABLES
    const [error, setError ] = useState('')
    const [success, setSuccess] = useState('')
    const [web3, setWeb3] = useState(null)
    const [ walletContract, setWalletContract] = useState()
    const [address, setAddress ] = useState('')
    const [contractAddress, setContractAddresss] = useState('')
    const [owner, setOwner] = useState('')
    const [balance, setBalance ] = useState('')
    const [amount, setAmount] = useState('')
    const[individual, setIndividual] = useState('')
    const [transaction, setTransaction ] = useState({})
    const [walletRecord, setWalletRecord ] = useState({})
    const [present, setPresent ] = useState()

    const [id, setId] = useState('')
    console.log(walletContract)
    useEffect( ( ) => {
      if(walletContract) getBalance()
      if(walletContract) getOwner()
      if(walletContract) showCA()
      if(walletContract) getTransactionData()
      if(walletContract) getRecords()
      if(walletContract) getHistoryCount()
      connectWalletHandler()
    }, [walletContract, balance ])


    const showCA = ( ) => {
        
    setContractAddresss('0xa53226e179EcF024A9A7dC13D1262684f222c5a4')
    }
    const getBalance = async ( ) => {
            const _balance = await walletContract.methods.balance().call()
            setBalance(web3.utils.fromWei('1', 'ether') *_balance + ' MATIC')
    }

    const getOwner = async ( ) =>{
        const _owner = await walletContract.methods.walletOwner().call()
        setOwner(_owner)
    }

    const updateAmount = event =>{
             const  _value = event.target.value

            setAmount(web3.utils.toWei(`${_value}`, 'ether')  )
    }

   const  makeDepositHandler = async ( ) => {
             try {
              
                await walletContract.methods.deposit().send({
                    from: address,
                    value:  `${amount}` ,
                })
                      setSuccess('Deposited succesfully')
                   //   console.log(transactionHash);
                    } catch (error) {
                      setError(error.message);
             } 
        
    }

    const setReciever = event => {
        const   _individual = event.target.value
          setIndividual(_individual)
      }
      
      const  makeTranfer = async ( ) => {
        try{

           await walletContract.methods.transfer(`${individual}`, `${amount}`).send({from: `${address}`}).then(console.log)
          }  catch(e){
            console.log(e)
           }
           updateState()

    }
    const updateTxID = event => {
      const   _id = event.target.value
        setId(_id)
    }
    const getTransactionData = async ( ) => {
         await walletContract.methods.history(id || 0).call().then( 
              (result) =>{
                setTransaction({
                    id : result[0],
                    type : result[1],
                     amount : web3.utils.fromWei(result[2]),
                     reciever : result[4],
                     sender : result[3]
                })
              }
        )
    }

    const getRecords = async ( id ) =>{
        
        await walletContract.methods.getHistory().call().then( (result) => {
         
        for (let i = 0; i < result.length; i++) {
            
            setWalletRecord({
                 TxId :  result[i][0],
                 TxType :  result[i][1],
                 TxAmount :  web3.utils.fromWei( result[i][2])
            })
            }
        
        })
      
    }

    const getHistoryCount = async ( ) => {
        const count = await walletContract.methods.historyCount().call()
        setPresent(count);
        await getRecords(count)
    }
    // const updateState = () =>{
    //     if (walletContract) getBalance()
    // }

    const connectWalletHandler = async ( ) =>{
        if( typeof  window !== 'undefined' && typeof window.ethereum !== 'undefined'){
           try {
            //requesting for wallet connection
          await   window.ethereum.request({ method: 'eth_requestAccounts'})
            web3 = new Web3(window.ethereum)
           setWeb3(web3)
            
           //choosing accounts
        const accounts = await web3.eth.getAccounts()
        setAddress(accounts[0])

            const wc = SmartContract(web3)
            setWalletContract(wc)

            window.ethereum.on('accountsChanged', async () => {
                const accounts = await web3.eth.getAccounts()
                //reset the account
                setAddress(accounts[0])  
            })

           } catch (error) {
            setError(error.message)
           } 
        }else{
            console.log('pls install metamask');
        }
    }

    
    return(
        <div className={styles.main}>
            <Head>
                <title> Blockchain Wallet</title>
                <meta name="description" content="A wallet built on a blockchain" />        
           </Head>
               <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.7.1/js/all.min.js" ></script>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500&display=swap" rel="stylesheet" />

           <nav className='navbar mt-4 mb-4'>
                <div className='container'>
                    <div className='navbar-brand'>
                        <h1 > LUCIDITY WALLET
                            <p className='has-text-primary is light '>CA: {contractAddress}
                           <span className='has-text-link'> <i className='fas fa-copy'></i></span> </p>  </h1> 
                    </div>
                    <div className='navbar-end'>
                        <button className='button is-primary' onClick={connectWalletHandler}> Connect <i className={`fas fa-wallet ${styles.i} `}></i></button>
                    </div>
                </div>
           </nav>
           <section>
            <section className='container'>
                                            <div className="card">
                                                <div className="card-content  has-text-centered">
                                                            <p className="title">  {owner} </p>
                                                            <p className="subtitle"> { balance}</p>
                                                </div>
                                <footer className="card-footer">
                                                <div className="card-footer-item">
                                                 <div className={`control ${styles.flex}`}>
                                                    <input onChange={updateAmount} className="input is-medium is-focused" type="text" placeholder="Amount " />
                                                    <button  className='button is-info end ml-6 is-medium' onClick={makeDepositHandler}> DEPOSIT </button>
                                                </div>
                                                </div>

                                                <div className="card-footer-item">
                                                <div className={`control ${styles.flex}`}>
                                                    <input onChange={setReciever} className="input is-medium is-focused" type="text" placeholder="Reciever Address" />
                                                    <button onClick={makeTranfer} className='button is-success ml-6 is-medium'> TRANSFER </button>
                                                </div>
                                                </div>
                                </footer>
                                <div className="card-content mt-4">
                                            <div className='card-footer'>
                                                           
                                                <div className={`card-footer-item ${styles.flow}`}> <div className='subtitle has-text-centered box has-text-success'>
                                                  <b> Recorded  {present} Successful Transactions </b> 

                                                            <ul className={`subtitle  `}>
                                                              <p><b className='mt-3'>Your Last Transaction <i className="fas fa-hand-point-down"></i></b>  </p>
                                                               <li className='box'> INDEX: <b>{` ${walletRecord.TxId}, `}</b> Tag: <b>{`${walletRecord.TxType}`} </b>
                                                                                                 <b>{`${walletRecord.TxAmount} MATIC `}</b>
                                                                                               
                                                                </li>  
                                                            </ul>
                                                </div>

                                                </div>
                                                <div className='card-footer-item'>
                                                <div className='box'>
                                                <div className={`control ${styles.flex}`}>
                                                    <input onChange={updateTxID } className="input is-medium is-focused" type="text" placeholder="Transaction ID " />
                                                    <button onClick={getTransactionData} className='button is-info end ml-6 is-medium'> FETCH </button>
                                                </div>
                                                    <div className='subtitle mt-6'>
                                                        <ul className='box has-text-primary mt-4'>
                                                         <li><b> Transaction id: </b>  <i> { `  ${transaction.id}  `}</i></li>  
                                                          <li><b> Type: </b>  <i> { `  ${transaction.type}  `}</i></li> 
                                                          <li><b> Amount: </b>  <i> { `  ${ transaction.amount}  MATIC `}</i> </li>
                                                          <li> <a className='has-text-link' href={`https://etherscan.io/address/${transaction.reciever}`} target="_blank"><b> Reciever: </b>  <i> { `  ${transaction.reciever}  `}</i></a></li>
                                                          <li><a className='has-text-link' href={`https://etherscan.io/address/${transaction.sender}`} target="_blank"><b> Sender: </b>  <i> { `  ${transaction.sender}  `}</i> </a></li>
                                                             </ul>
                                                    </div>
                                                </div>
                                                
                                                </div>
                                            </div>
                                                </div>
                                </div>
            </section>
            <div className='has-text-danger'>
              <p>  {error} </p>
            </div>
            <div className='has-text-success'>
              <p>  {success} </p>
            </div>
           </section>
        </div>
    )
}

export default Wallet;