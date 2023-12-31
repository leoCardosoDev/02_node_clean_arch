import { PgUser } from '@/infra/postgres/entities'
import { PgUserAccountRepository } from '@/infra/postgres/repository'
import { makeFakeDb } from '@/tests/infra/postgres/mocks'

import { Repository, getConnection, getRepository } from 'typeorm'
import { IBackup } from 'pg-mem'

describe('PgUserAccountRepository', () => {
  let sut: PgUserAccountRepository
  let pgUserRepo: Repository<PgUser>
  let backup: IBackup

  beforeAll(async () => {
    const db = await makeFakeDb([PgUser])
    backup = db.backup()
    pgUserRepo = getRepository(PgUser)
  })

  afterAll(async () => {
    await getConnection().close()
  })

  beforeEach(() => {
    backup.restore()
    sut = new PgUserAccountRepository()
  })

  describe('load', () => {
    it('should returns an account if email exists', async () => {
      await pgUserRepo.save({ email: 'any_email@mail.com' })
      const account = await sut.load({ email: 'any_email@mail.com' })
      expect(account).toEqual({ id: '1' })
    })

    it('should returns undefined if email not exists', async () => {
      const account = await sut.load({ email: 'any_email@mail.com' })
      expect(account).toBeUndefined()
    })
  })
})
