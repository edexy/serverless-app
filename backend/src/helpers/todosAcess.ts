import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('todoAccess');

// TODO: Implement the dataLayer logic
export class TodoAccess {
    constructor(
      private readonly docClient: DocumentClient = createDynamoDBClient(),
      private readonly todosTable = process.env.TODOS_TABLE,
      ) {
    }
  
    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
      await this.docClient.put({
          TableName: this.todosTable,
          Item: todoItem
        }).promise()
  
      return todoItem;
    }
  
    async deleteTodo(todoId: string, userId: string): Promise<any> {
      await this.docClient.delete({
        TableName: this.todosTable,
        Key: {
          "userId": userId,
          "todoId": todoId
        }
      }).promise();
    }
  
    async getTodos(userId: string): Promise<any> {
      return await this.docClient.query({
        TableName : this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        },
        ScanIndexForward: false
      }).promise();
    }
  
    private async update(params: any) : Promise<any>{
      await this.docClient.update(params).promise();
    }
  
    async updateTodo(todoItem: TodoItem): Promise<any> {
      const updateExpression = "set #name = :name, #dueDate=:dueDate, #done=:done";
  
      const params = {
        TableName: this.todosTable,
        Key: {
          "todoId": todoItem.todoId,
          "userId": todoItem.userId
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: {
          ":name": todoItem.name,
          ":dueDate": todoItem.dueDate,
          ":done": todoItem.done
        },
        ExpressionAttributeNames: {
          "#name": "name",
          "#dueDate": "dueDate",
          "#done": "done"
        }
      }
  
      logger.info("UpdateTodo", {params: params});
  
      await this.update(params);
  
      return;
    }
  
    async updateUrl(userId: string, url: string, todoId: string): Promise<any>  {
      const updateExpression = "set #attachmentUrl = :attachmentUrl";
    
      const params = {
        TableName: this.todosTable,
        Key: {
          "todoId": todoId,
          "userId": userId
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: {
          ":attachmentUrl": url
        },
        ExpressionAttributeNames: {
          "#attachmentUrl": "attachmentUrl"
        },
        ReturnValues: "UPDATED_NEW"
      }
  
      logger.info("updateUrl", {params: params});
  
      await this.update(params);
    }
  }
  
  function createDynamoDBClient() {
    logger.info('Creating Todos DynamoDB Client...');
  
    return new XAWS.DynamoDB.DocumentClient()
  }