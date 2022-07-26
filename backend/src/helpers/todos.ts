import * as uuid from 'uuid'
import { TodoAccess } from './todosAcess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { TodoUpdate } from '../models/TodoUpdate'
import { AttachmentAccess } from './attachmentUtils'

const todoAccess = new TodoAccess();
const attachmentAccess = new AttachmentAccess()

export async function createTodo(createTodoData: CreateTodoRequest, userId: string) {
    const createdAt = new Date().toISOString()
    const todoId = uuid.v4()
  
    const newItem = {
      ...createTodoData,
      userId,
      done: false,
      createdAt,
      todoId
    }
  
    return await todoAccess.createTodo(newItem);
}

export async function deleteTodo(todoId: string, userId: string){
  return await todoAccess.deleteTodo(todoId, userId);
}

export async function createAttachmentPresignedUrl(todoId: string){
  console.log("todoId in getpresigned url:", todoId);
  const presignedUrl = attachmentAccess.getPutSignedUrl(todoId);
  console.log("presigned url:", presignedUrl);
  return presignedUrl;
}

export async function getTodosForUser(userId: string) {
  return await todoAccess.getTodos(userId);
}

export async function updateTodo(todoUpdate: TodoUpdate, todoId: string, userId: string){
  return await todoAccess.updateTodo({
    todoId,
    userId,
    name: todoUpdate.name,
    dueDate: todoUpdate.dueDate,
    done: todoUpdate.done,
    createdAt: new Date().toISOString()
  });
}

export async function attachUrl(userId: string, todoId: string) {
  const url = attachmentAccess.getImageUrl(todoId);
  await todoAccess.updateUrl(userId, url, todoId);
}