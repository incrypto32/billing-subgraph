import { SushiPair } from './../types/Billing/SushiPair'
import { Billing as BillingContract } from '../types/Billing/Billing'
import { Billing, User, BillingDailyData, UserDailyData } from '../types/schema'
import { BigInt, Address, BigDecimal } from '@graphprotocol/graph-ts'

export const LAUNCH_DAY = 18613 // 1608163200 / 86400. 1608163200 = 17 Dec 2020 00:00:00 GMT
export const SECONDS_PER_DAY = 86400

/**
 * @dev Helper function to load Billing
 */
export function getBilling(eventAddress: Address): Billing {
  let billing = Billing.load('1')
  if (billing == null) {
    billing = new Billing('1')
    let contract = BillingContract.bind(eventAddress)
    billing.governor = contract.governor()
    billing.save()
  }

  return billing as Billing
}

/**
 * @dev Helper function to load or create a User
 */
export function createOrLoadUser(userAddress: Address): User {
  let id = userAddress.toHexString()
  let user = User.load(id)
  if (user == null) {
    user = new User(id)
  }
  return user as User
}

export function getAndUpdateBillingDailyData(entity: Billing, timestamp: BigInt): BillingDailyData {
  let dayNumber = timestamp.toI32() / SECONDS_PER_DAY - LAUNCH_DAY
  let id = compoundId(entity.id, BigInt.fromI32(dayNumber).toString())
  let dailyData = BillingDailyData.load(id)

  if (dailyData == null) {
    dailyData = new BillingDailyData(id)

    dailyData.dayStart = BigInt.fromI32((timestamp.toI32() / SECONDS_PER_DAY) * SECONDS_PER_DAY)
    dailyData.dayEnd = dailyData.dayStart + BigInt.fromI32(SECONDS_PER_DAY)
    dailyData.dayNumber = dayNumber
    dailyData.entity = entity.id

    if (entity.currentDailyDataEntity != null) {
      entity.previousDailyDataEntity = entity.currentDailyDataEntity
    }
    entity.currentDailyDataEntity = dailyData.id
  }

  dailyData.totalTokensAdded = entity.totalTokensAdded
  dailyData.totalTokensPulled = entity.totalTokensPulled
  dailyData.totalUSDPulled = entity.totalUSDPulled
  dailyData.grtPriceInUSD = entity.grtPriceInUSD
  dailyData.totalTokensRemoved = entity.totalTokensRemoved
  dailyData.totalCurrentBalance = entity.totalCurrentBalance
  dailyData.gateway = entity.gateway
  dailyData.governor = entity.governor

  if (entity.previousDailyDataEntity != null) {
    let previousDailyDataPoint = BillingDailyData.load(entity.previousDailyDataEntity!)!

    dailyData.totalTokensAddedDelta = entity.totalTokensAdded.minus(
      previousDailyDataPoint.totalTokensAdded,
    )
    dailyData.totalTokensPulledDelta = entity.totalTokensPulled.minus(
      previousDailyDataPoint.totalTokensPulled,
    )
    dailyData.totalUSDPulledDelta = entity.totalUSDPulled.minus(
      previousDailyDataPoint.totalUSDPulled,
    )
    dailyData.totalTokensRemovedDelta = entity.totalTokensRemoved.minus(
      previousDailyDataPoint.totalTokensRemoved,
    )
    dailyData.totalCurrentBalanceDelta = entity.totalCurrentBalance.minus(
      previousDailyDataPoint.totalCurrentBalance,
    )
  } else {
    dailyData.totalTokensAddedDelta = entity.totalTokensAdded
    dailyData.totalTokensPulledDelta = entity.totalTokensPulled
    dailyData.totalUSDPulledDelta = entity.totalUSDPulled
    dailyData.totalTokensRemovedDelta = entity.totalTokensRemoved
    dailyData.totalCurrentBalanceDelta = entity.totalCurrentBalance
  }

  dailyData.save()

  return dailyData as BillingDailyData
}

export function getAndUpdateUserDailyData(entity: User, timestamp: BigInt): UserDailyData {
  let dayNumber = timestamp.toI32() / SECONDS_PER_DAY - LAUNCH_DAY
  let id = compoundId(entity.id, BigInt.fromI32(dayNumber).toString())
  let dailyData = UserDailyData.load(id)

  if (dailyData == null) {
    dailyData = new UserDailyData(id)

    dailyData.dayStart = BigInt.fromI32((timestamp.toI32() / SECONDS_PER_DAY) * SECONDS_PER_DAY)
    dailyData.dayEnd = dailyData.dayStart + BigInt.fromI32(SECONDS_PER_DAY)
    dailyData.dayNumber = dayNumber
    dailyData.entity = entity.id

    if (entity.currentDailyDataEntity != null) {
      entity.previousDailyDataEntity = entity.currentDailyDataEntity
    }
    entity.currentDailyDataEntity = dailyData.id
  }

  dailyData.totalTokensAdded = entity.totalTokensAdded
  dailyData.totalTokensPulled = entity.totalTokensPulled
  dailyData.totalUSDPulled = entity.totalUSDPulled
  dailyData.grtPriceInUSD = entity.grtPriceInUSD
  dailyData.totalTokensRemoved = entity.totalTokensRemoved
  dailyData.billingBalance = entity.billingBalance

  if (entity.previousDailyDataEntity != null) {
    let previousDailyDataPoint = UserDailyData.load(entity.previousDailyDataEntity!)!

    dailyData.totalTokensAddedDelta = entity.totalTokensAdded.minus(
      previousDailyDataPoint.totalTokensAdded,
    )
    dailyData.totalTokensPulledDelta = entity.totalTokensPulled.minus(
      previousDailyDataPoint.totalTokensPulled,
    )
    dailyData.totalUSDPulledDelta = entity.totalUSDPulled.minus(
      previousDailyDataPoint.totalUSDPulled,
    )
    dailyData.totalTokensRemovedDelta = entity.totalTokensRemoved.minus(
      previousDailyDataPoint.totalTokensRemoved,
    )
    dailyData.billingBalanceDelta = entity.billingBalance.minus(
      previousDailyDataPoint.billingBalance,
    )
  } else {
    dailyData.totalTokensAddedDelta = entity.totalTokensAdded
    dailyData.totalTokensPulledDelta = entity.totalTokensPulled
    dailyData.totalUSDPulledDelta = entity.totalUSDPulled
    dailyData.totalTokensRemovedDelta = entity.totalTokensRemoved
    dailyData.billingBalanceDelta = entity.billingBalance
  }

  dailyData.save()

  return dailyData as UserDailyData
}

export function compoundId(idA: string, idB: string): string {
  return idA.concat('-').concat(idB)
}

export function getGRTPriceInUSD(): BigDecimal {
  let grtPriceOracle = SushiPair.bind(
    Address.fromString('0x1ceda73c034218255f50ef8a2c282e6b4c301d60'),
  )
  let reserve1 = grtPriceOracle.getReserves()
  let grtPriceInETH = reserve1.value1.toBigDecimal().div(reserve1.value0.toBigDecimal())

  let ethPriceOracle = SushiPair.bind(
    Address.fromString('0x6ff62bfb8c12109e8000935a6de54dad83a4f39f'),
  )
  let reserve2 = ethPriceOracle.getReserves()
  let ethPriceInUSD = reserve2.value1.toBigDecimal().div(reserve2.value0.toBigDecimal())

  return grtPriceInETH.times(ethPriceInUSD)
}
