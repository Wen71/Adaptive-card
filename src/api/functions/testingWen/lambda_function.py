import urllib3 
import boto3
import os
import json

http = urllib3.PoolManager()
dynamo = boto3.client('dynamodb')

SENDTABLENAME = 'wenAdaptiveCardSend'
RESPONSETABLENAME = 'wenAdaptiveCardRespond'
def scanTable(tableName):
    data = dynamo.scan(TableName=tableName)
    response = {
    'statusCode': 200,
    'body': json.dumps(data['Items']),
    'headers': {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
        }
    }
    return response
    
def lambda_handler(event, context): 
    print("Received event:",json.dumps(event))
    
    route_key = event['routeKey']
    
    if route_key == "POST /api/sendCard":
        url = "https://calabrioinc.webhook.office.com/webhookb2/fc858095-6345-4d0b-96db-20b6f257c57e@9e7336e5-760e-4e5b-8d68-e2647f81391f/IncomingWebhook/4a779843013241b6b5d41577866f1bbd/11db6bb0-47b2-4430-a337-c298b36624c4"
                    
        body = json.loads(event['body'])
                    
        encoded_msg = json.dumps(body).encode('utf-8')
        print(encoded_msg)
        resp = http.request('POST',url, body=encoded_msg)
        print({
                    "status_code": resp.status, 
                    "response": resp.data
                })
        
        response = {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                }
        }
        
        print(response)
        return response

    #Display adaptive card results in UI
    elif route_key == "GET /api/display/respondResults":
        return scanTable(RESPONSETABLENAME)
    
    else:
        return scanTable(SENDTABLENAME)
