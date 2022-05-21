export type CustomError =
  | TooEarly
  | InvalidProof
  | TreasuryWalletHacked
  | BalanceIsLow
  | NotOwnedBy

export class TooEarly extends Error {
  readonly code = 300
  readonly name = "TooEarly"
  readonly msg = "Too early to stake"

  constructor() {
    super("300: Too early to stake")
  }
}

export class InvalidProof extends Error {
  readonly code = 301
  readonly name = "InvalidProof"
  readonly msg = "Merkle proof is invalid"

  constructor() {
    super("301: Merkle proof is invalid")
  }
}

export class TreasuryWalletHacked extends Error {
  readonly code = 302
  readonly name = "TreasuryWalletHacked"
  readonly msg = "Treasury wallet value is incorrect"

  constructor() {
    super("302: Treasury wallet value is incorrect")
  }
}

export class BalanceIsLow extends Error {
  readonly code = 303
  readonly name = "BalanceIsLow"
  readonly msg = "Not enough sol on balance"

  constructor() {
    super("303: Not enough sol on balance")
  }
}

export class NotOwnedBy extends Error {
  readonly code = 304
  readonly name = "NotOwnedBy"
  readonly msg = "Not owned by signer"

  constructor() {
    super("304: Not owned by signer")
  }
}

export function fromCode(code: number): CustomError | null {
  switch (code) {
    case 300:
      return new TooEarly()
    case 301:
      return new InvalidProof()
    case 302:
      return new TreasuryWalletHacked()
    case 303:
      return new BalanceIsLow()
    case 304:
      return new NotOwnedBy()
  }

  return null
}
