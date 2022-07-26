import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('creteToDo');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Processing event for creteToDo: ', {event: event});
    const newTodo: CreateTodoRequest = JSON.parse(event.body);
    // TODO: Implement creating a new TODO item
    const userId = getUserId(event)
    const todoItem = await createTodo(newTodo, userId);
   return {
    statusCode: 201,
    body: JSON.stringify({
      newItem: todoItem,
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)
