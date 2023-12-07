import { AxiosHttpClient } from '@/infra/http'
import axios from 'axios'

jest.mock('axios')

describe('AxiosHttpCLient', () => {
  let sut: AxiosHttpClient
  let fakeAxios: jest.Mocked<typeof axios>
  let url: string
  let params: object

  beforeAll(() => {
    fakeAxios = axios as jest.Mocked<typeof axios>
    url = 'any_url'
    params = { any: 'any' }
    fakeAxios.get.mockResolvedValue({
      status: 200,
      data: 'any_data'
    })
  })

  beforeEach(() => {
    sut = new AxiosHttpClient()
  })

  describe('GET', () => {
    it('should call get with correct params', async () => {
      await sut.get({ url, params })
      expect(fakeAxios.get).toHaveBeenCalledWith(url, { params })
      expect(fakeAxios.get).toHaveBeenCalledTimes(1)
    })

    it('should return data on success', async () => {
      const result = await sut.get({ url, params })
      expect(result).toEqual('any_data')
    })

    it('should rethrow if gt throws', async () => {
      fakeAxios.get.mockRejectedValueOnce(new Error('http_error'))
      const promise = sut.get({ url, params })
      await expect(promise).rejects.toThrow(new Error('http_error'))
    })
  })
})
