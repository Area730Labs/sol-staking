import * as types from "../types/Condition" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"

export interface RuleFields {
  steps: number
  conds: Array<types.ConditionFields>
}

export interface RuleJSON {
  steps: number
  conds: Array<types.ConditionJSON>
}

export class Rule {
  readonly steps: number
  readonly conds: Array<types.Condition>

  constructor(fields: RuleFields) {
    this.steps = fields.steps
    this.conds = fields.conds.map((item) => new types.Condition({ ...item }))
  }

  static layout(property?: string) {
    return borsh.struct(
      [borsh.u8("steps"), borsh.array(types.Condition.layout(), 8, "conds")],
      property
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new Rule({
      steps: obj.steps,
      conds: obj.conds.map((item) => types.Condition.fromDecoded(item)),
    })
  }

  static toEncodable(fields: RuleFields) {
    return {
      steps: fields.steps,
      conds: fields.conds.map((item) => types.Condition.toEncodable(item)),
    }
  }

  toJSON(): RuleJSON {
    return {
      steps: this.steps,
      conds: this.conds.map((item) => item.toJSON()),
    }
  }

  static fromJSON(obj: RuleJSON): Rule {
    return new Rule({
      steps: obj.steps,
      conds: obj.conds.map((item) => types.Condition.fromJSON(item)),
    })
  }

  toEncodable() {
    return Rule.toEncodable(this)
  }
}
