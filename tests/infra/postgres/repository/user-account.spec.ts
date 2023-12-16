import { LoadUserAccountRepository } from '@/application/contracts/repository'

import { IBackup, newDb } from 'pg-mem'
import { Column, Entity, PrimaryGeneratedColumn, Repository, getRepository } from 'typeorm'

class PgUserAccountRepository implements LoadUserAccountRepository {
  async load (params: LoadUserAccountRepository.Params): Promise<LoadUserAccountRepository.Result> {
    const pgUserRepository = getRepository(PgUser)
    const pgUser = await pgUserRepository.findOneBy({ email: params.email })
    if (pgUser !== null) {
      return {
        id: pgUser.id.toString(),
        name: pgUser.name ?? undefined
      }
    }
  }
}

@Entity({ name: 'usuarios' })
class PgUser {
  @PrimaryGeneratedColumn()
    id!: number

  @Column({ name: 'nome', nullable: true })
    name?: string

  @Column()
    email!: string

  @Column({ name: 'id_facebook', nullable: true })
    facebookId?: string
}

describe('PgUserAccountRepository', () => {
  describe('load', () => {
    let sut: PgUserAccountRepository
    let connection: any
    let pgUserRepo: Repository<PgUser>
    let backup: IBackup

    beforeAll(async () => {
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
        entities: [PgUser]
      })
      await connection.synchronize()
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
