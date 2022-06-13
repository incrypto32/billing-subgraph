import { Bytes, BigInt, Address, ethereum } from '@graphprotocol/graph-ts'
import { newMockEvent } from 'matchstick-as/assembly/index'
import {
  Billing,
  User,
  TokensAdded,
  TokensRemoved,
  TokensPulled,
  BillingDailyData,
  UserDailyData,
} from '../src/types/schema'
import {
  TokensAdded as AddedEvent,
  TokensRemoved as RemovedEvent,
  TokensPulled as PulledEvent,
  GatewayUpdated,
  NewOwnership,
} from '../src/types/Billing/Billing'

//
//
// event GatewayUpdated(address indexed newGateway);
export function createGatewayUpdated(address: String): GatewayUpdated {
  let mockEvent = newMockEvent()
  let event = new GatewayUpdated(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
  )

  event.parameters = new Array()
  let addressParam = new ethereum.EventParam(
    'newGateway',
    ethereum.Value.fromAddress(Address.fromString(address)),
  )

  event.parameters.push(addressParam)

  return event
}
// event NewOwnership(address indexed from, address indexed to);
export function createNewOwnership(from: String, to: String): NewOwnership {
  let mockEvent = newMockEvent()
  let event = new NewOwnership(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
  )

  event.parameters = new Array()
  let addressParam = new ethereum.EventParam(
    'from',
    ethereum.Value.fromAddress(Address.fromString(from)),
  )
  let addressParam2 = new ethereum.EventParam(
    'to',
    ethereum.Value.fromAddress(Address.fromString(to)),
  )

  event.parameters.push(addressParam)
  event.parameters.push(addressParam2)

  return event
}

// event TokensAdded(address indexed user, uint256 amount);
export function createAddedEvent(userAddress: String, grtAmount: BigInt): AddedEvent {
  let mockEvent = newMockEvent()
  let event = new AddedEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
  )

  event.parameters = new Array()
  let addressParam = new ethereum.EventParam(
    'user',
    ethereum.Value.fromAddress(Address.fromString(userAddress)),
  )
  let amountParam = new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(grtAmount))

  event.parameters.push(addressParam)
  event.parameters.push(amountParam)

  return event
}

// event TokensRemoved(address indexed user, address indexed to, uint256 amount);
export function createRemovedEvent(userAddress: String, toAddress: String, grtAmount: BigInt): RemovedEvent {
  let mockEvent = newMockEvent()
  let event = new RemovedEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
  )

  event.parameters = new Array()
  let addressParam = new ethereum.EventParam(
    'user',
    ethereum.Value.fromAddress(Address.fromString(userAddress)),
  )
  let addressParam2 = new ethereum.EventParam(
    'to',
    ethereum.Value.fromAddress(Address.fromString(userAddress)),
  )
  let amountParam = new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(grtAmount))

  event.parameters.push(addressParam)
  event.parameters.push(addressParam2)
  event.parameters.push(amountParam)

  return event
}

// event TokensPulled(address indexed user, uint256 amount);
export function createPulledEvent(userAddress: String, grtAmount: BigInt): PulledEvent {
  let mockEvent = newMockEvent()
  let event = new PulledEvent(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters,
  )

  event.parameters = new Array()
  let addressParam = new ethereum.EventParam(
    'user',
    ethereum.Value.fromAddress(Address.fromString(userAddress)),
  )
  let amountParam = new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(grtAmount))

  event.parameters.push(addressParam)
  event.parameters.push(amountParam)

  return event
}

export function createEmptyBilling(): Billing {
  let billing = new Billing('1')
  billing.governor = Address.fromString('0x1111111111111111111111111111111111111111')
  billing.gateway = Address.fromString('0x1111111111111111111111111111111111111112')
  billing.save()

  return billing as Billing
}
