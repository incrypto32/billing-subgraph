import { clearStore, test, assert, newMockEvent } from 'matchstick-as/assembly/index'
import {
  handleGatewayUpdated,
  handleNewOwnership,
  handleTokensAdded,
  handleTokensRemoved,
  handleTokensPulled,
} from '../src/mappings/billing'
import { BigInt } from '@graphprotocol/graph-ts'
import {
  createAddedEvent,
  createRemovedEvent,
  createPulledEvent,
  createEmptyBilling,
  createGatewayUpdated,
  createNewOwnership,
} from './billing-scaffolding'

/*
 * GatewayUpdated
 */
test('Gateway update', () => {
  let billing = createEmptyBilling()
  let oldGatewayAddressString = billing.gateway.toHexString()
  let newGatewayAddressString = '0x0101010101010101010101010101010101010101'
  let gatewayUpdatedEvent = createGatewayUpdated(newGatewayAddressString)

  assert.fieldEquals('Billing', '1', 'gateway', oldGatewayAddressString)

  handleGatewayUpdated(gatewayUpdatedEvent)

  assert.fieldEquals('Billing', '1', 'gateway', newGatewayAddressString)

  clearStore()
})

/*
 * NewOwnership
 */
test('NewOwnership', () => {
  let billing = createEmptyBilling()
  let oldGovernorAddressString = billing.governor.toHexString()
  let newGovernorAddressString = '0x0101010101010101010101010101010101010101'
  let newOwnershipEvent = createNewOwnership(oldGovernorAddressString, newGovernorAddressString)

  assert.fieldEquals('Billing', '1', 'governor', oldGovernorAddressString)

  handleNewOwnership(newOwnershipEvent)

  assert.fieldEquals('Billing', '1', 'governor', newGovernorAddressString)

  clearStore()
})

/*
 * AddedEvents
 */
test('Add tokens for the first time', () => {
  createEmptyBilling()
  let userAddress = '0x0101010101010101010101010101010101010101'
  let grtAmountString = '10000000000000000000'
  let grtAmount = BigInt.fromString(grtAmountString)

  let addedEvent = createAddedEvent(userAddress, grtAmount)

  handleTokensAdded(addedEvent)

  // both User and global Billing should have the same totalTokensAdded
  assert.fieldEquals('User', userAddress, 'totalTokensAdded', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensAdded', grtAmountString)

  assert.fieldEquals('User', userAddress, 'billingBalance', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalCurrentBalance', grtAmountString)

  assert.fieldEquals('User', userAddress, 'totalTokensPulled', '0')
  assert.fieldEquals('Billing', '1', 'totalTokensPulled', '0')

  assert.fieldEquals('User', userAddress, 'totalTokensRemoved', '0')
  assert.fieldEquals('Billing', '1', 'totalTokensRemoved', '0')

  clearStore()
})

test('Add tokens multiple times', () => {
  createEmptyBilling()
  let userAddress1 = '0x0101010101010101010101010101010101010101'
  let userAddress2 = '0x0101010101010101010101010101010101010102'
  let grtAmountString = '10000000000000000000'
  let grtAmount = BigInt.fromString(grtAmountString)

  let addedEvent1 = createAddedEvent(userAddress1, grtAmount)
  let addedEvent2 = createAddedEvent(userAddress2, grtAmount)

  handleTokensAdded(addedEvent1)

  assert.fieldEquals('User', userAddress1, 'totalTokensAdded', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensAdded', grtAmountString)

  assert.fieldEquals('User', userAddress1, 'billingBalance', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalCurrentBalance', grtAmountString)

  assert.fieldEquals('User', userAddress1, 'totalTokensPulled', '0')
  assert.fieldEquals('Billing', '1', 'totalTokensPulled', '0')

  assert.fieldEquals('User', userAddress1, 'totalTokensRemoved', '0')
  assert.fieldEquals('Billing', '1', 'totalTokensRemoved', '0')

  // Also assert that user2 isn't created
  assert.notInStore('User', userAddress2)

  handleTokensAdded(addedEvent2)

  assert.fieldEquals('User', userAddress1, 'totalTokensAdded', grtAmountString)
  assert.fieldEquals('User', userAddress2, 'totalTokensAdded', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensAdded', '20000000000000000000')

  assert.fieldEquals('User', userAddress1, 'billingBalance', grtAmountString)
  assert.fieldEquals('User', userAddress2, 'billingBalance', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalCurrentBalance', '20000000000000000000')

  assert.fieldEquals('User', userAddress1, 'totalTokensPulled', '0')
  assert.fieldEquals('User', userAddress2, 'totalTokensPulled', '0')
  assert.fieldEquals('Billing', '1', 'totalTokensPulled', '0')

  assert.fieldEquals('User', userAddress1, 'totalTokensRemoved', '0')
  assert.fieldEquals('User', userAddress2, 'totalTokensRemoved', '0')
  assert.fieldEquals('Billing', '1', 'totalTokensRemoved', '0')

  clearStore()
})

/*
 * RemovedEvents
 */
test('Fully remove tokens', () => {
  createEmptyBilling()
  let userAddress = '0x0101010101010101010101010101010101010101'
  let toAddress = '0x0101010101010101010101010101010101010102'
  let grtAmountString = '10000000000000000000'
  let grtAmount = BigInt.fromString(grtAmountString)

  let addedEvent = createAddedEvent(userAddress, grtAmount)

  handleTokensAdded(addedEvent)

  assert.fieldEquals('User', userAddress, 'totalTokensAdded', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensAdded', grtAmountString)

  assert.fieldEquals('User', userAddress, 'billingBalance', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalCurrentBalance', grtAmountString)

  assert.fieldEquals('User', userAddress, 'totalTokensPulled', '0')
  assert.fieldEquals('Billing', '1', 'totalTokensPulled', '0')

  assert.fieldEquals('User', userAddress, 'totalTokensRemoved', '0')
  assert.fieldEquals('Billing', '1', 'totalTokensRemoved', '0')

  let removeEvent = createRemovedEvent(userAddress, toAddress, grtAmount)

  handleTokensRemoved(removeEvent)

  assert.fieldEquals('User', userAddress, 'totalTokensAdded', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensAdded', grtAmountString)

  assert.fieldEquals('User', userAddress, 'billingBalance', '0')
  assert.fieldEquals('Billing', '1', 'totalCurrentBalance', '0')

  assert.fieldEquals('User', userAddress, 'totalTokensPulled', '0')
  assert.fieldEquals('Billing', '1', 'totalTokensPulled', '0')

  assert.fieldEquals('User', userAddress, 'totalTokensRemoved', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensRemoved', grtAmountString)

  clearStore()
})

test('Partially remove tokens', () => {
  createEmptyBilling()
  let userAddress = '0x0101010101010101010101010101010101010101'
  let toAddress = '0x0101010101010101010101010101010101010102'
  let grtAmountString = '10000000000000000000'
  let halfGrtAmountString = '5000000000000000000'
  let grtAmount = BigInt.fromString(grtAmountString)
  let halfGrtAmount = BigInt.fromString(halfGrtAmountString)

  let addedEvent = createAddedEvent(userAddress, grtAmount)

  handleTokensAdded(addedEvent)

  assert.fieldEquals('User', userAddress, 'totalTokensAdded', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensAdded', grtAmountString)

  assert.fieldEquals('User', userAddress, 'billingBalance', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalCurrentBalance', grtAmountString)

  assert.fieldEquals('User', userAddress, 'totalTokensPulled', '0')
  assert.fieldEquals('Billing', '1', 'totalTokensPulled', '0')

  assert.fieldEquals('User', userAddress, 'totalTokensRemoved', '0')
  assert.fieldEquals('Billing', '1', 'totalTokensRemoved', '0')

  let removeEvent = createRemovedEvent(userAddress, toAddress, halfGrtAmount)

  handleTokensRemoved(removeEvent)

  assert.fieldEquals('User', userAddress, 'totalTokensAdded', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensAdded', grtAmountString)

  assert.fieldEquals('User', userAddress, 'billingBalance', halfGrtAmountString)
  assert.fieldEquals('Billing', '1', 'totalCurrentBalance', halfGrtAmountString)

  assert.fieldEquals('User', userAddress, 'totalTokensPulled', '0')
  assert.fieldEquals('Billing', '1', 'totalTokensPulled', '0')

  assert.fieldEquals('User', userAddress, 'totalTokensRemoved', halfGrtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensRemoved', halfGrtAmountString)

  clearStore()
})

/*
 * PulledEvents
 */
test('Fully pull tokens', () => {
  createEmptyBilling()
  let userAddress = '0x0101010101010101010101010101010101010101'
  let grtAmountString = '10000000000000000000'
  let grtAmount = BigInt.fromString(grtAmountString)

  let addedEvent = createAddedEvent(userAddress, grtAmount)

  handleTokensAdded(addedEvent)

  assert.fieldEquals('User', userAddress, 'totalTokensAdded', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensAdded', grtAmountString)

  assert.fieldEquals('User', userAddress, 'billingBalance', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalCurrentBalance', grtAmountString)

  assert.fieldEquals('User', userAddress, 'totalTokensPulled', '0')
  assert.fieldEquals('Billing', '1', 'totalTokensPulled', '0')

  assert.fieldEquals('User', userAddress, 'totalTokensRemoved', '0')
  assert.fieldEquals('Billing', '1', 'totalTokensRemoved', '0')

  let pulledEvent = createPulledEvent(userAddress, grtAmount)

  handleTokensPulled(pulledEvent)

  assert.fieldEquals('User', userAddress, 'totalTokensAdded', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensAdded', grtAmountString)

  assert.fieldEquals('User', userAddress, 'billingBalance', '0')
  assert.fieldEquals('Billing', '1', 'totalCurrentBalance', '0')

  assert.fieldEquals('User', userAddress, 'totalTokensPulled', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensPulled', grtAmountString)

  assert.fieldEquals('User', userAddress, 'totalTokensRemoved', '0')
  assert.fieldEquals('Billing', '1', 'totalTokensRemoved', '0')

  clearStore()
})

test('Partially pull tokens', () => {
  createEmptyBilling()
  let userAddress = '0x0101010101010101010101010101010101010101'
  let grtAmountString = '10000000000000000000'
  let halfGrtAmountString = '5000000000000000000'
  let grtAmount = BigInt.fromString(grtAmountString)
  let halfGrtAmount = BigInt.fromString(halfGrtAmountString)

  let addedEvent = createAddedEvent(userAddress, grtAmount)

  handleTokensAdded(addedEvent)

  assert.fieldEquals('User', userAddress, 'totalTokensAdded', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensAdded', grtAmountString)

  assert.fieldEquals('User', userAddress, 'billingBalance', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalCurrentBalance', grtAmountString)

  assert.fieldEquals('User', userAddress, 'totalTokensPulled', '0')
  assert.fieldEquals('Billing', '1', 'totalTokensPulled', '0')

  assert.fieldEquals('User', userAddress, 'totalTokensRemoved', '0')
  assert.fieldEquals('Billing', '1', 'totalTokensRemoved', '0')

  let pulledEvent = createPulledEvent(userAddress, halfGrtAmount)

  handleTokensPulled(pulledEvent)

  assert.fieldEquals('User', userAddress, 'totalTokensAdded', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensAdded', grtAmountString)

  assert.fieldEquals('User', userAddress, 'billingBalance', halfGrtAmountString)
  assert.fieldEquals('Billing', '1', 'totalCurrentBalance', halfGrtAmountString)

  assert.fieldEquals('User', userAddress, 'totalTokensPulled', halfGrtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensPulled', halfGrtAmountString)

  assert.fieldEquals('User', userAddress, 'totalTokensRemoved', '0')
  assert.fieldEquals('Billing', '1', 'totalTokensRemoved', '0')

  clearStore()
})

/*
 * Mixed event tests
 */

test('Pull half remove half', () => {
  createEmptyBilling()
  let userAddress = '0x0101010101010101010101010101010101010101'
  let toAddress = '0x0101010101010101010101010101010101010102'
  let grtAmountString = '10000000000000000000'
  let halfGrtAmountString = '5000000000000000000'
  let grtAmount = BigInt.fromString(grtAmountString)
  let halfGrtAmount = BigInt.fromString(halfGrtAmountString)

  let addedEvent = createAddedEvent(userAddress, grtAmount)

  handleTokensAdded(addedEvent)

  assert.fieldEquals('User', userAddress, 'totalTokensAdded', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensAdded', grtAmountString)

  assert.fieldEquals('User', userAddress, 'billingBalance', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalCurrentBalance', grtAmountString)

  assert.fieldEquals('User', userAddress, 'totalTokensPulled', '0')
  assert.fieldEquals('Billing', '1', 'totalTokensPulled', '0')

  assert.fieldEquals('User', userAddress, 'totalTokensRemoved', '0')
  assert.fieldEquals('Billing', '1', 'totalTokensRemoved', '0')

  let pulledEvent = createPulledEvent(userAddress, halfGrtAmount)

  handleTokensPulled(pulledEvent)

  assert.fieldEquals('User', userAddress, 'totalTokensAdded', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensAdded', grtAmountString)

  assert.fieldEquals('User', userAddress, 'billingBalance', halfGrtAmountString)
  assert.fieldEquals('Billing', '1', 'totalCurrentBalance', halfGrtAmountString)

  assert.fieldEquals('User', userAddress, 'totalTokensPulled', halfGrtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensPulled', halfGrtAmountString)

  assert.fieldEquals('User', userAddress, 'totalTokensRemoved', '0')
  assert.fieldEquals('Billing', '1', 'totalTokensRemoved', '0')

  let removeEvent = createRemovedEvent(userAddress, toAddress, halfGrtAmount)

  handleTokensRemoved(removeEvent)

  assert.fieldEquals('User', userAddress, 'totalTokensAdded', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensAdded', grtAmountString)

  assert.fieldEquals('User', userAddress, 'billingBalance', '0')
  assert.fieldEquals('Billing', '1', 'totalCurrentBalance', '0')

  assert.fieldEquals('User', userAddress, 'totalTokensPulled', halfGrtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensPulled', halfGrtAmountString)

  assert.fieldEquals('User', userAddress, 'totalTokensRemoved', halfGrtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensRemoved', halfGrtAmountString)

  clearStore()
})

test('2 users add, pull/remove, remove/pull', () => {
  createEmptyBilling()
  let userAddress1 = '0x0101010101010101010101010101010101010101'
  let userAddress2 = '0x0101010101010101010101010101010101010102'
  let grtAmountString = '10000000000000000000'
  let halfGrtAmountString = '5000000000000000000'
  let grtAmount = BigInt.fromString(grtAmountString)
  let halfGrtAmount = BigInt.fromString(halfGrtAmountString)

  let addedEvent = createAddedEvent(userAddress1, grtAmount)

  handleTokensAdded(addedEvent)

  assert.fieldEquals('User', userAddress1, 'totalTokensAdded', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensAdded', grtAmountString)

  assert.fieldEquals('User', userAddress1, 'billingBalance', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalCurrentBalance', grtAmountString)

  assert.fieldEquals('User', userAddress1, 'totalTokensPulled', '0')
  assert.fieldEquals('Billing', '1', 'totalTokensPulled', '0')

  assert.fieldEquals('User', userAddress1, 'totalTokensRemoved', '0')
  assert.fieldEquals('Billing', '1', 'totalTokensRemoved', '0')

  let addedEvent2 = createAddedEvent(userAddress2, grtAmount)

  handleTokensAdded(addedEvent2)

  assert.fieldEquals('User', userAddress2, 'totalTokensAdded', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensAdded', '20000000000000000000')

  assert.fieldEquals('User', userAddress2, 'billingBalance', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalCurrentBalance', '20000000000000000000')

  assert.fieldEquals('User', userAddress2, 'totalTokensPulled', '0')
  assert.fieldEquals('Billing', '1', 'totalTokensPulled', '0')

  assert.fieldEquals('User', userAddress2, 'totalTokensRemoved', '0')
  assert.fieldEquals('Billing', '1', 'totalTokensRemoved', '0')

  let pulledEvent = createPulledEvent(userAddress1, halfGrtAmount)

  handleTokensPulled(pulledEvent)

  assert.fieldEquals('User', userAddress1, 'totalTokensAdded', grtAmountString)
  assert.fieldEquals('User', userAddress2, 'totalTokensAdded', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensAdded', '20000000000000000000')

  assert.fieldEquals('User', userAddress1, 'billingBalance', halfGrtAmountString)
  assert.fieldEquals('User', userAddress2, 'billingBalance', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalCurrentBalance', '15000000000000000000')

  assert.fieldEquals('User', userAddress1, 'totalTokensPulled', halfGrtAmountString)
  assert.fieldEquals('User', userAddress2, 'totalTokensPulled', '0')
  assert.fieldEquals('Billing', '1', 'totalTokensPulled', halfGrtAmountString)

  assert.fieldEquals('User', userAddress1, 'totalTokensRemoved', '0')
  assert.fieldEquals('User', userAddress2, 'totalTokensRemoved', '0')
  assert.fieldEquals('Billing', '1', 'totalTokensRemoved', '0')

  let removeEvent = createRemovedEvent(userAddress2, userAddress1, halfGrtAmount)

  handleTokensRemoved(removeEvent)

  assert.fieldEquals('User', userAddress1, 'totalTokensAdded', grtAmountString)
  assert.fieldEquals('User', userAddress2, 'totalTokensAdded', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensAdded', '20000000000000000000')

  assert.fieldEquals('User', userAddress1, 'billingBalance', halfGrtAmountString)
  assert.fieldEquals('User', userAddress2, 'billingBalance', halfGrtAmountString)
  assert.fieldEquals('Billing', '1', 'totalCurrentBalance', grtAmountString)

  assert.fieldEquals('User', userAddress1, 'totalTokensPulled', halfGrtAmountString)
  assert.fieldEquals('User', userAddress2, 'totalTokensPulled', '0')
  assert.fieldEquals('Billing', '1', 'totalTokensPulled', halfGrtAmountString)

  assert.fieldEquals('User', userAddress1, 'totalTokensRemoved', '0')
  assert.fieldEquals('User', userAddress2, 'totalTokensRemoved', halfGrtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensRemoved', halfGrtAmountString)

  let removeEvent2 = createRemovedEvent(userAddress1, userAddress2, halfGrtAmount)

  handleTokensRemoved(removeEvent2)

  assert.fieldEquals('User', userAddress1, 'totalTokensAdded', grtAmountString)
  assert.fieldEquals('User', userAddress2, 'totalTokensAdded', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensAdded', '20000000000000000000')

  assert.fieldEquals('User', userAddress1, 'billingBalance', '0')
  assert.fieldEquals('User', userAddress2, 'billingBalance', halfGrtAmountString)
  assert.fieldEquals('Billing', '1', 'totalCurrentBalance', halfGrtAmountString)

  assert.fieldEquals('User', userAddress1, 'totalTokensPulled', halfGrtAmountString)
  assert.fieldEquals('User', userAddress2, 'totalTokensPulled', '0')
  assert.fieldEquals('Billing', '1', 'totalTokensPulled', halfGrtAmountString)

  assert.fieldEquals('User', userAddress1, 'totalTokensRemoved', halfGrtAmountString)
  assert.fieldEquals('User', userAddress2, 'totalTokensRemoved', halfGrtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensRemoved', grtAmountString)

  let pulledEvent2 = createPulledEvent(userAddress2, halfGrtAmount)

  handleTokensPulled(pulledEvent2)

  assert.fieldEquals('User', userAddress1, 'totalTokensAdded', grtAmountString)
  assert.fieldEquals('User', userAddress2, 'totalTokensAdded', grtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensAdded', '20000000000000000000')

  assert.fieldEquals('User', userAddress1, 'billingBalance', '0')
  assert.fieldEquals('User', userAddress2, 'billingBalance', '0')
  assert.fieldEquals('Billing', '1', 'totalCurrentBalance', '0')

  assert.fieldEquals('User', userAddress1, 'totalTokensPulled', halfGrtAmountString)
  assert.fieldEquals('User', userAddress2, 'totalTokensPulled', halfGrtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensPulled', grtAmountString)

  assert.fieldEquals('User', userAddress1, 'totalTokensRemoved', halfGrtAmountString)
  assert.fieldEquals('User', userAddress2, 'totalTokensRemoved', halfGrtAmountString)
  assert.fieldEquals('Billing', '1', 'totalTokensRemoved', grtAmountString)

  clearStore()
})
