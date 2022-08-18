import json
import boto3
import ast
import os
from datetime import datetime
from dateutil.tz import gettz
import jwt
import pandas as pd
dynamo = boto3.client('dynamodb')

# Write responses from adaptive card to dynamoDB
SENDTABLENAME = 'wenAdaptiveCardSend'
RESPONSETABLENAME = 'wenAdaptiveCardRespond'


def createTable(item, tableName):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(tableName)
    response = table.put_item(Item=item)
    response = json.dumps(response)
    return response

def createTableRespond(item,id):
    data = pd.read_csv("exportUsers.csv",index_col="id")
    objectID = data.loc[id]
    item['name'], item['email'], item['jobTitle'], item['department'] = objectID['displayName'], objectID['mail'], objectID['jobTitle'], objectID['department']
    response_time = datetime.now(gettz('US/Central')).strftime('%Y-%m-%d %H:%M:%S')
    print("Response time: ",response_time)
    item['responseTime'] = response_time
    remove_sendTime = item.pop('sendTime')
    print("response item=",item)
    return createTable(item,RESPONSETABLENAME)


def createTableSend(item):
    dic = {}
    dic['surveyID'],dic['surveyQuestion'],dic['sendTime'] = item['surveyID'],item['surveyQuestion'],item['sendTime']
    print("Send item=",dic)
    return createTable(dic, SENDTABLENAME)

def lambda_handler(event, context):
    print("received event",json.dumps(event))

    token = event['headers']['authorization'][7:]
    print("Token=",token)
    payload = jwt.decode(token,options={"verify_signature": False})
    print("Payload=",json.dumps(payload))
    sub = payload["sub"]
    body = event['body']
    encoded_body = ast.literal_eval(str(body))
    print("body=",encoded_body)

    # write to DynamoDB
    createTableSend(encoded_body)
    createTableRespond(encoded_body,sub)

    # if the user responded, refresh the card
    # newCard = {
    #   "@type": "MessageCard",
    #   "@context": "http://schema.org/extensions",
    #   "themeColor": "0076D7",
    #   "sections": [{
    #     "title": "Question: "+ encoded_body['surveyQuestion'],
    #     "activityTitle": "Rating: "+ encoded_body['rating']+ " Comment: "+encoded_body['comment'],
    #     "activitySubtitle": 'Submitted by '+ respond_data['name'] + " on "+ respond_data['responseTime'],
    #     "markdown": True
    #   }]
    # }
    response = {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            #'CARD-UPDATE-IN-BODY': True
        }
    }

    print(response)
    return response
