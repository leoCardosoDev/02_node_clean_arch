import { PgUser } from '@/infra/postgres/entities'
import { PgUserAccountRepository } from '@/infra/postgres/repository'

import { IBackup, IMemoryDb, newDb } from 'pg-mem'
import { Repository } from 'typeorm'

let connection: any
const makeFakeDb = async (entities?: any[]): Promise<IMemoryDb> => {
  const db = newDb()
  db.public.registerFunction({
    implementation: () => 'test',
    name: 'current_database'
  })
  db.public.registerFunction({
    implementation: () => 'test',
    name: 'version'
  })
  connection = await db.adapters.createTypeormConnection({
    type: 'postgres',
    entities: entities ?? ['src/infra/postgres/entities/index.ts']
  })
  await connection.synchronize()
  return db
}

describe('PgUserAccountRepository', () => {
  describe('load', () => {
    let sut: PgUserAccountRepository
    let pgUserRepo: Repository<PgUser>
    let backup: IBackup

    beforeAll(async () => {
      const db = await makeFakeDb([PgUser])
      backup = db.backup()
      pgUserRepo = connection.getRepository(PgUser)
    })

    afterAll(() => {
      connection.close()
    })

    beforeEach(() => {
      backup.restore()
      sut = new PgUserAccountRepository()
    })

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
