import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodosForUser as getTodosForUser } from '../../helpers/todos'
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger'

const logger = createLogger('getTodos');

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event for getTodos: ', {event: event});
    // Write your code here
    const userId = getUserId(event)
    const todos = await getTodosForUser(userId);
    logger.info('Todos Result: ', { result: todos});

    return {
      statusCode: 200,
      body: JSON.stringify({
        todos,
      })
    }
  })
handler.use(
  cors({
    credentials: true
  })
)
