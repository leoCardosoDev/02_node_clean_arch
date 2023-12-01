import { AuthenticationError } from '@/domain/errors'
import { FacebookAuthenticationService } from '@/application/services'

import { MockProxy, mock } from 'jest-mock-extended'
import { LoadFacebookUserApi } from '@/application/contracts/apis'
import { CreateFacebookAccountRepository, LoadUserAccountRepository, UpdateFacebookAccountRepository } from '@/application/contracts/repository'

describe('FacebookAuthenticationService', () => {
  let facebookApi: MockProxy<LoadFacebookUserApi>
  let userAccountRepo: MockProxy<LoadUserAccountRepository & CreateFacebookAccountRepository & UpdateFacebookAccountRepository>
  let sut: FacebookAuthenticationService
  const token = 'any_token'
  beforeEach(() => {
    facebookApi = mock()
    userAccountRepo = mock()
    userAccountRepo.load.mockResolvedValue(undefined)
    facebookApi.loadUser.mockResolvedValue({
      name: 'any_fb_name',
      email: 'any_fb_email@fb.com',
      facebookId: 'any_fb_id'
    })
    sut = new FacebookAuthenticationService(facebookApi, userAccountRepo)
  })

  it('should call LoadFacebookUserApi with correct params', async () => {
    await sut.perform({ token })
    expect(facebookApi.loadUser).toHaveBeenCalledWith({ token })
    expect(facebookApi.loadUser).toHaveBeenCalledTimes(1)
  })

  it('should return AuthenticationError when LoadFacebookUserApi return undefined', async () => {
    facebookApi.loadUser.mockResolvedValueOnce(undefined)
    const authResult = await sut.perform({ token })
    expect(authResult).toEqual(new AuthenticationError())
  })

  it('should call LoadUserAccountRepo when LoadFacebookUserApi return data', async () => {
    await sut.perform({ token })
    expect(userAccountRepo.load).toHaveBeenCalledWith({ email: 'any_fb_email@fb.com' })
    expect(userAccountRepo.load).toHaveBeenCalledTimes(1)
  })

  it('should call CreateFacebookAccountRepo when LoadUserAccount returns undefined', async () => {
    await sut.perform({ token })
    expect(userAccountRepo.createFromFacebook).toHaveBeenCalledWith({
      name: 'any_fb_name',
      email: 'any_fb_email@fb.com',
      facebookId: 'any_fb_id'
    })
    expect(userAccountRepo.createFromFacebook).toHaveBeenCalledTimes(1)
  })

  it('should call UpdateUserAccountRepo when LoadUserAccount returns data', async () => {
    userAccountRepo.load.mockResolvedValueOnce({
      id: 'any_id',
      name: 'any_name'
    })
    await sut.perform({ token })
    expect(userAccountRepo.updateWithFacebook).toHaveBeenCalledWith({
      id: 'any_id',
      name: 'any_name',
      facebookId: 'any_fb_id'
    })
    expect(userAccountRepo.updateWithFacebook).toHaveBeenCalledTimes(1)
  })

  it('should update account name', async () => {
    userAccountRepo.load.mockResolvedValueOnce({
      id: 'any_id'
    })
    await sut.perform({ token })
    expect(userAccountRepo.updateWithFacebook).toHaveBeenCalledWith({
      id: 'any_id',
      name: 'any_fb_name',
      facebookId: 'any_fb_id'
    })
    expect(userAccountRepo.updateWithFacebook).toHaveBeenCalledTimes(1)
  })
})
