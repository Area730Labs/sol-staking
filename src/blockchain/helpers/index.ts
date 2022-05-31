import BN from "bn.js"

import { Nft } from "../types";
import {Buffer} from "buffer"


export const buildLeaves = (
  data: Nft[]
) => {
  const leaves: Array<Buffer> = [];
  for (let idx = 0; idx < data.length; ++idx) {
    const item = data[idx];
    leaves.push(
      Buffer.from([
        ...item.address.toBuffer(),
        ...new BN(item.props.rank).toArray("le", 2),
      ])
    );
  }

  return leaves;
};