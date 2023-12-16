import { sign } from 'jsonwebtoken'

import { TokenGenerator } from '@/application/contracts/crypto'

export class JsonWebTokenGenerator {
  constructor (private readonly secret: string) {}
  async generateToken (params: TokenGenerator.Params): Promise<TokenGenerator.Result> {
    const expirationsInSeconds = params.expirationInMs / 1000
    return sign({ key: params.key }, this.secret, { expiresIn: expirationsInSeconds })
  }
}
