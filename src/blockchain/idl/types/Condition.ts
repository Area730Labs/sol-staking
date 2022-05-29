import * as borsh from "@project-serum/borsh"

export interface ConditionFields {
  from: number
  valueIsBp: number
  value: number
}

export interface ConditionJSON {
  from: number
  valueIsBp: number
  value: number
}

export class Condition {
  readonly from: number
  readonly valueIsBp: number
  readonly value: number

  constructor(fields: ConditionFields) {
    this.from = fields.from
    this.valueIsBp = fields.valueIsBp
    this.value = fields.value
  }

  static layout(property?: string) {
    return borsh.struct(
      [borsh.u16("from"), borsh.u8("valueIsBp"), borsh.u16("value")],
      property
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new Condition({
      from: obj.from,
      valueIsBp: obj.valueIsBp,
      value: obj.value,
    })
  }

  static toEncodable(fields: ConditionFields) {
    return {
      from: fields.from,
      valueIsBp: fields.valueIsBp,
      value: fields.value,
    }
  }

  toJSON(): ConditionJSON {
    return {
      from: this.from,
      valueIsBp: this.valueIsBp,
      value: this.value,
    }
  }

  static fromJSON(obj: ConditionJSON): Condition {
    return new Condition({
      from: obj.from,
      valueIsBp: obj.valueIsBp,
      value: obj.value,
    })
  }

  toEncodable() {
    return Condition.toEncodable(this)
  }
}
