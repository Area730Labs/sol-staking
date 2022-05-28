import * as borsh from "@project-serum/borsh"

export interface InitializeStakingBumpsFields {
  staking: number
  escrow: number
  rewards: number
}

export interface InitializeStakingBumpsJSON {
  staking: number
  escrow: number
  rewards: number
}

export class InitializeStakingBumps {
  readonly staking: number
  readonly escrow: number
  readonly rewards: number

  constructor(fields: InitializeStakingBumpsFields) {
    this.staking = fields.staking
    this.escrow = fields.escrow
    this.rewards = fields.rewards
  }

  static layout(property?: string) {
    return borsh.struct(
      [borsh.u8("staking"), borsh.u8("escrow"), borsh.u8("rewards")],
      property
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new InitializeStakingBumps({
      staking: obj.staking,
      escrow: obj.escrow,
      rewards: obj.rewards,
    })
  }

  static toEncodable(fields: InitializeStakingBumpsFields) {
    return {
      staking: fields.staking,
      escrow: fields.escrow,
      rewards: fields.rewards,
    }
  }

  toJSON(): InitializeStakingBumpsJSON {
    return {
      staking: this.staking,
      escrow: this.escrow,
      rewards: this.rewards,
    }
  }

  static fromJSON(obj: InitializeStakingBumpsJSON): InitializeStakingBumps {
    return new InitializeStakingBumps({
      staking: obj.staking,
      escrow: obj.escrow,
      rewards: obj.rewards,
    })
  }

  toEncodable() {
    return InitializeStakingBumps.toEncodable(this)
  }
}
