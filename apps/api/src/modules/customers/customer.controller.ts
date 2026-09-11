import { Request, RequestHandler, Response } from 'express'
import { UnauthorizedError } from '../../common/app-error'
import { HttpStatus } from '../../common/http-status'
import { sendSuccess } from '../../common/response-handler'
import { asyncHandler } from '../../middleware/error-handler'
import { createCustomerSchema, customerFilterQuerySchema, updateCustomerSchema } from './customer.schema'
import * as customerService from './customer.service'

export const listCustomers: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new UnauthorizedError()
  const companyId = req.auth.companyId
  const query = customerFilterQuerySchema.parse(req.query)

  const customers = await customerService.getCompanyCustomers({
    companyId,
    search: query.search,
    limit: query.limit,
    offset: query.offset
  })
  return sendSuccess(res, customers, 'Customers retrieved successfully', HttpStatus.OK)
})

export const getCustomerById: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new UnauthorizedError()
  const companyId = req.auth.companyId
  const id = req.params.id as string

  const customer = await customerService.getCustomerDetail(id, companyId)
  return sendSuccess(res, customer, 'Customer retrieved successfully', HttpStatus.OK)
})

export const createCustomer: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new UnauthorizedError()
  const companyId = req.auth.companyId
  const userId = req.auth.userId
  const parsed = createCustomerSchema.parse(req.body)

  const customer = await customerService.createCustomer({
    ...parsed,
    email: parsed.email || null,
    companyId,
    createdBy: userId
  })
  return sendSuccess(res, customer, 'Customer created successfully', HttpStatus.CREATED)
})

export const updateCustomer: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new UnauthorizedError()
  const companyId = req.auth.companyId
  const userId = req.auth.userId
  const id = req.params.id as string
  const parsed = updateCustomerSchema.parse(req.body)

  const updated = await customerService.updateCustomerDetails(id, companyId, {
    ...parsed,
    updatedBy: userId
  })
  return sendSuccess(res, updated, 'Customer updated successfully', HttpStatus.OK)
})

export const deleteCustomer: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth) throw new UnauthorizedError()
  const companyId = req.auth.companyId
  const id = req.params.id as string

  await customerService.deleteCustomer(id, companyId)
  return sendSuccess(res, null, 'Customer deleted successfully', HttpStatus.OK)
})