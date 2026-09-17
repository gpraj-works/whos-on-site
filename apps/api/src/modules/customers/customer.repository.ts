import { dayjs } from '@whosonsite/shared'
import { and, asc, eq, or, sql } from 'drizzle-orm'
import { CustomerDto } from '@whosonsite/shared'
import { DatabaseClient, db } from '../../infrastructure/database/client'
import { customers } from '../../infrastructure/database/schema/index'
import { CreateCustomerData, CustomerFilterParams, UpdateCustomerData } from './customer.types'

/** Helper to format database customer row into CustomerDto */
function mapCustomerRow(row: typeof customers.$inferSelect): CustomerDto {
  const additionalInfo = row.additionalInfo
    ? typeof row.additionalInfo === 'string'
      ? JSON.parse(row.additionalInfo)
      : row.additionalInfo
    : null

  return {
    id: row.id,
    companyId: row.companyId,
    name: row.name,
    email: row.email || null,
    mobile: row.mobile,
    address: row.address,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
    additionalInfo: additionalInfo || null,
    createdAt: dayjs(row.createdAt).toISOString(),
    updatedAt: dayjs(row.updatedAt).toISOString()
  }
}

/** List company customers with optional search & pagination */
export async function findCompanyCustomers(
  params: CustomerFilterParams,
  client: DatabaseClient = db
): Promise<CustomerDto[]> {
  const conditions = [eq(customers.companyId, params.companyId)]

  if (params.search) {
    conditions.push(
      or(
        sql`${customers.name} ILIKE ${`%${params.search}%`}`,
        sql`${customers.email} ILIKE ${`%${params.search}%`}`,
        sql`${customers.mobile} ILIKE ${`%${params.search}%`}`
      )!
    )
  }

  const limit = params.limit || 50
  const offset = params.offset || 0

  const rows = await client
    .select()
    .from(customers)
    .where(and(...conditions))
    .orderBy(asc(customers.name))
    .limit(limit)
    .offset(offset)

  return rows.map(mapCustomerRow)
}

/** Find single customer by ID and company ID */
export async function findCustomerById(
  id: string,
  companyId: string,
  client: DatabaseClient = db
): Promise<CustomerDto | null> {
  const [row] = await client
    .select()
    .from(customers)
    .where(and(eq(customers.id, id), eq(customers.companyId, companyId)))

  if (!row) return null
  return mapCustomerRow(row)
}

/** Create a new customer record */
export async function createCustomer(
  data: CreateCustomerData,
  client: DatabaseClient = db
): Promise<CustomerDto> {
  const [row] = await client
    .insert(customers)
    .values({
      companyId: data.companyId,
      name: data.name,
      email: data.email || null,
      mobile: data.mobile,
      address: data.address,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      additionalInfo: data.additionalInfo || null,
      createdBy: data.createdBy || null
    })
    .returning()

  return mapCustomerRow(row)
}

/** Update existing customer details */
export async function updateCustomer(
  id: string,
  companyId: string,
  data: UpdateCustomerData,
  client: DatabaseClient = db
): Promise<CustomerDto | null> {
  const updatePayload: Record<string, unknown> = {
    updatedAt: dayjs().toDate()
  }

  if (data.name !== undefined) updatePayload.name = data.name
  if (data.email !== undefined) updatePayload.email = data.email || null
  if (data.mobile !== undefined) updatePayload.mobile = data.mobile
  if (data.address !== undefined) updatePayload.address = data.address
  if (data.latitude !== undefined) updatePayload.latitude = data.latitude
  if (data.longitude !== undefined) updatePayload.longitude = data.longitude
  if (data.additionalInfo !== undefined) updatePayload.additionalInfo = data.additionalInfo
  if (data.updatedBy !== undefined) updatePayload.updatedBy = data.updatedBy

  const [row] = await client
    .update(customers)
    .set(updatePayload)
    .where(and(eq(customers.id, id), eq(customers.companyId, companyId)))
    .returning()

  if (!row) return null
  return mapCustomerRow(row)
}

/** Delete a customer record */
export async function deleteCustomer(
  id: string,
  companyId: string,
  client: DatabaseClient = db
): Promise<boolean> {
  const [deleted] = await client
    .delete(customers)
    .where(and(eq(customers.id, id), eq(customers.companyId, companyId)))
    .returning({ id: customers.id })

  return Boolean(deleted)
}
