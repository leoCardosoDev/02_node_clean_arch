import { AuthenticationError } from '@/domain/errors'
import { FacebookAuthenticationService } from '@/application/services'

import { MockProxy, mock } from 'jest-mock-extended'
import { LoadFacebookUserApi } from '@/application/contracts/apis'

let loadFacebookUserApi: MockProxy<LoadFacebookUserApi>
let sut: FacebookAuthenticationService

describe('FacebookAuthenticationService', () => {
  beforeEach(() => {
    loadFacebookUserApi = mock()
    sut = new FacebookAuthenticationService(loadFacebookUserApi)
  })

  it('should call LoadFacebookUserApi with correct params', async () => {
    await sut.perform({ token: 'any_token' })
    expect(loadFacebookUserApi.loadUser).toHaveBeenCalledWith({ token: 'any_token' })
    expect(loadFacebookUserApi.loadUser).toHaveBeenCalledTimes(1)
  })

  it('should return AuthenticationError when LoadFacebookUserApi return undefined', async () => {
    loadFacebookUserApi.loadUser.mockResolvedValueOnce(undefined)
    const authResult = await sut.perform({ token: 'any_token' })
    expect(authResult).toEqual(new AuthenticationError())
  })
})
