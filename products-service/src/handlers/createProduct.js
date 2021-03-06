import { v4 as uuid } from 'uuid'
import AWS from 'aws-sdk'
import commonMiddleware from '../lib/commonMiddleware'
import schema from '../lib/schemas/createProductSchema'
import createError from 'http-errors'

const dynamoDb = new AWS.DynamoDB.DocumentClient()

async function createProduct(event, context) {
  const { title, qtd, status } = event.body;
  const { email } = event.requestContext.authorizer
  const now = new Date()
  const endDate = new Date()
  endDate.setHours(now.getHours() + 1)

  const product = {
    id: uuid(),
    title,
    qtd,
    status,
    createdAt: now.toISOString(),
    endingAt: endDate,
    bid: {
      amount: 0
    },
    creator: email
  }

  try {
    await dynamoDb.put({
      TableName: process.env.PRODUCTS_TABLE_NAME,
      Item: product
    }).promise()
  
  } catch (error) {
    console.log(error)
    throw new createError.InternalServerError(error)
  }
 
  return {
    statusCode: 201,
    body: JSON.stringify(product),
  };
}

export const handler = commonMiddleware(createProduct).use(validator({ inputSchema: schema }))


