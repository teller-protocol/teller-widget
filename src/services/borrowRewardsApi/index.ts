export type LoanReward = {
  id: number
  created_at: number
  pool: string
  reward_percent: number
  collateral: string
  principal: string
  duration: number
  network_name: string
  network_id: number
  reward_token: string
  principal_address: string
  collateral_address: string
}

export async function getLoanRewards(): Promise<LoanReward[]> {
  const res = await fetch('https://xyon-xymz-1ofj.n7d.xano.io/api:HDeQJ7Og/loan_rewards')

  if (!res.ok) {
    throw new Error(`Failed to fetch loan rewards: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  return data as LoanReward[]
}
