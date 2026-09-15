import { CustomerStatusDto } from '@whosonsite/shared'
import { NotFoundError } from '../../common/app-error'
import { findPublicJobByShareToken } from './public-status.repository'

export async function getPublicJobStatus(token: string): Promise<CustomerStatusDto> {
  const status = await findPublicJobByShareToken(token)
  if (!status) {
    throw new NotFoundError('Public job status not found or has expired')
  }
  return status
}
