import { createAccBuilder } from '@lit-protocol/access-control-conditions'

export const createAccessControlConditions = (buyerAddress: string) => {
  const builder = createAccBuilder()
  
  return builder
    .requireWalletOwnership(buyerAddress)
    .on('base-sepolia') // Use Base Sepolia for testnet
    .build()
}

export const createTimeBasedAccessConditions = (buyerAddress: string, expirationTime: number) => {
  const builder = createAccBuilder()
  
  return builder
    .requireWalletOwnership(buyerAddress)
    .on('base-sepolia')
    .and()
    .requireTimestamp(expirationTime, '<')
    .build()
}

export const createTokenBasedAccessConditions = (buyerAddress: string, tokenAddress: string, minBalance: string) => {
  const builder = createAccBuilder()
  
  return builder
    .requireWalletOwnership(buyerAddress)
    .on('base-sepolia')
    .and()
    .requireTokenBalance(tokenAddress, minBalance, '>=')
    .on('base-sepolia')
    .build()
}
