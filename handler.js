'use strict';
const DynamoDB = require("aws-sdk/clients/dynamodb");
const documentClient = new DynamoDB.DocumentClient({
  region: 'ap-south-1',
  maxRetries: 3,
  httpOptions: {
    timeout: 5000
  }
});

const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME

const send = (statusCode, data) => {
  return {
    statusCode,
    body: JSON.stringify(data)
  }
}
module.exports.createNote = async (event, context, callback) => {
  context.callbackWaitsForEventLoop = false;
  let data = JSON.parse(event.body);
  try {
    let params = {
      TableName: NOTES_TABLE_NAME,
      Item: {
        notesId: data.id,
        title: data.title,
        body: data.body
      },
      ConditionExpression: "attribute_not_exists(notesId)"
    }
    await documentClient.put(params).promise()
    callback(null, send(201, `The note ID: ${data.id} was created`))
  }
  catch (err) {
    callback(null, send(500, err.message))
  }
};

module.exports.updateNote = async (event, context, callback) => {
  context.callbackWaitsForEventLoop = false;
  let notesId = event.pathParameters.id
  let data = JSON.parse(event.body);
  try {
    let params = {
      TableName: NOTES_TABLE_NAME,
      Key: {
        notesId: notesId
      },
      UpdateExpression: 'set #title = :title, #body = :body',
      ExpressionAttributeNames: {
        '#title': 'title',
        '#body': 'body'
      },
      ExpressionAttributeValues: {
        ':title': data.title,
        ':body': data.body
      },
      ConditionExpression: "attribute_exists(notesId)"
    }

    await documentClient.update(params).promise()
    callback(null, send(200, data))
  }
  catch (err) {
    callback(null, send(500, err.message))
  }
}

module.exports.deleteNote = async (event, context, callback) => {
  context.callbackWaitsForEventLoop = false;
  let notesId = event.pathParameters.id
  try {
    let params = {
      TableName: NOTES_TABLE_NAME,
      Key: {
        notesId: notesId
      },
      ConditionExpression: "attribute_exists(notesId)"
    }
    await documentClient.delete(params).promise()
    callback(null, send(200, notesId))
  }
  catch (err) {
    callback(null, send(500, err.message))
  }
}

module.exports.readAllNote = async (event, context, callback) => {
  context.callbackWaitsForEventLoop = false;
  try {
    let params = {
      TableName: NOTES_TABLE_NAME,
    }
    let notes = await documentClient.scan(params).promise()
    callback(null, send(200, notes.Items))
  }
  catch (err) {
    callback(null, send(500, err.message))
  }
}

