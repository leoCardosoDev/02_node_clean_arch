import { LoadUserAccountRepository } from '@/application/contracts/repository'

import { newDb } from 'pg-mem'
import { Column, Entity, PrimaryGeneratedColumn, getRepository } from 'typeorm'

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
    it('should returns an account if email exists', async () => {
      const db = newDb()

      db.public.registerFunction({
        implementation: () => 'test',
        name: 'current_database'
      })

      db.public.registerFunction({
        implementation: () => 'test',
        name: 'version'
      })

      const connection = await db.adapters.createTypeormConnection({
        type: 'postgres',
        entities: [PgUser]
      })

      await connection.synchronize()
      const pgUserRepo = connection.getRepository(PgUser)
      await pgUserRepo.save({ email: 'existing_email@mail.com' })
      const sut = new PgUserAccountRepository()
      const account = await sut.load({ email: 'existing_email@mail.com' })
      expect(account).toEqual({ id: '1' })
      connection.close()
    })

    it('should returns undefined if email not exists', async () => {
      const db = newDb()

      db.public.registerFunction({
        implementation: () => 'test',
        name: 'current_database'
      })

      db.public.registerFunction({
        implementation: () => 'test',
        name: 'version'
      })

      const connection = await db.adapters.createTypeormConnection({
        type: 'postgres',
        entities: [PgUser]
      })

      await connection.synchronize()
      const sut = new PgUserAccountRepository()
      const account = await sut.load({ email: 'new_email@mail.com' })
      expect(account).toBeUndefined()
      connection.close()
    })
  })
})
