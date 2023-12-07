import jwt from 'jsonwebtoken'

import { TokenGenerator } from '@/application/contracts/crypto'

jest.mock('jsonwebtoken')

class JsonWebTokenGenerator {
  constructor (private readonly secret: string) {}
  async generateToken (params: TokenGenerator.Params): Promise<void> {
    const expirationsInSeconds = params.expirationInMs / 1000
    jwt.sign({ key: params.key }, this.secret, { expiresIn: expirationsInSeconds })
  }
}

describe('JwtTokenGenerator', () => {
  let sut: JsonWebTokenGenerator
  let fakeJwt: jest.Mocked<typeof jwt>

  beforeAll(() => {
    fakeJwt = jwt as jest.Mocked<typeof jwt>
  })

  beforeEach(() => {
    sut = new JsonWebTokenGenerator('any_secret')
  })
  it('should call sign with correct params', async () => {
    await sut.generateToken({ key: 'any_key', expirationInMs: 1000 })
    expect(fakeJwt.sign).toHaveBeenCalledWith({ key: 'any_key' }, 'any_secret', { expiresIn: 1 })
  })
})
