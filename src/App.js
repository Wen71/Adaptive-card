import React, { useMemo, useState, useEffect } from 'react';
// import axios from 'axios';
import { Select } from '@innovation/nova';
import { api } from './api';
import './App.css';
import { Button } from '@innovation/nova';
import { Table } from '@innovation/nova';
// import App from './App';

const myOptions = [
  {value:"How are you doing today?",key:1},
  {value:"How is your stress level?",key:2},
  {value:"Are you going to party tonight?",key:3},
  {value:"How is your contact difficulty level?",key:4}
]
const surveyFormat = [
  {value: "1-5",key: 1},
  {value: "Yes/No", key:2},
]
export default function App() {

  const [value, setValue] = React.useState('How are you doing today?');
  const [format, setFormat] = React.useState('1-5')
  const [questionID, setQuestionID] = React.useState(1)
  const [formatID, setFormatID] = React.useState(1)  
  function onSelectQuestion(option){
    setValue(typeof option === 'string' ? option : option.value)
    setQuestionID(typeof option === 'number' ? option : option.key)
  }
  function onSelectFormat(format){
    setFormat(typeof format === 'string' ? format : format.value)
    setFormatID(typeof format === 'number' ? format : format.key)
  }

  const id = (questionID-1) * surveyFormat.length + formatID

  const [cardSend, setCardSend] = React.useState([])
  const [cardRespond, setCardRespond] = React.useState([])

  function surveyDesign() {
    var current = new Date();
    var time = current.toLocaleDateString() + " " + current.toLocaleTimeString();
    let ratingFormat;
    if(format==='1-5'){
      ratingFormat = [
        { "display": "1", "value": "1" },
        { "display": "2", "value": "2" },
        { "display": "3", "value": "3" },
        { "display": "4", "value": "4" },
        { "display": "5", "value": "5" }
      ]
    }
    else{
      ratingFormat = [
        { "display": "Yes", "value": "Yes" },
        { "display": "No", "value": "No" }
      ]
    }
    const api_url = '/api/sendCard';

    const data = {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "themeColor": "0076D7",
      "summary": "Wen Sun sent you a survey",
      "sections": [{
        "activityTitle": value,
        "markdown": true
      }],

      "potentialAction": [{
        "@type": "ActionCard",
        "name": "Add a comment",
        "inputs": [
          {
            "@type": "MultiChoiceInput",
            "id": "rating",
            "title": value,
            "style": "expanded",
            "choices": ratingFormat
          },
          {
            "@type": "TextInput",
            "id": "comment",
            "isMultiline": false,
            "title": "Comment"
          }
        ],

        "actions": [{
          "@type": "HttpPOST",
          "headers": [
            {
              "name": "content-type",
              "value": "application/json",
              "CARD-UPDATE-IN-BODY": true
            }
          ],
          "bodyContentType": "application/json",
          "body": "{\"surveyID\":\""+id.toString()+"\",\"surveyQuestion\":\""+value+"\",\"rating\":\"{{rating.value}}\",\"comment\" : \"{{comment.value}}\", \"sendTime\": \""+time+"\"}",
          "name": "Submit",
          "target": "https://9ey2e93r2h.execute-api.us-east-2.amazonaws.com/default/wenAdaptiveCardEnd"

        },
        
        
      ],
      }]
    }

    api
      .post(api_url, data)
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
    }
  // When sent the survey & who I sent to 
  function displayCardSend() {
    const api_url = '/api/display/sendResults';
    api
      .get(api_url)
      .then((response) => {
        const data = response.data;
        setCardSend(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }


  const rowsSend = React.useMemo(
      () => (
        cardSend.map(item => ({
          surveyID: item.surveyID['S'],
          surveyQuestion: item.surveyQuestion['S'],
          sendTime: item.sendTime['S'],
          }))
      ),
      [cardSend]
  )

  const columnsSend = React.useMemo(
    () => ([
        { Header: 'SurveyID', accessor: 'surveyID', align: 'center',},
        { Header: 'SurveyQuestion', accessor: 'surveyQuestion', align: 'center',},
        { Header: 'SendTime',accessor: 'sendTime',align: 'center',},
    ]),
    []
)
  // When user completed the survey & What they responded
  function displayCardRespond() {
    const api_url = '/api/display/respondResults';
    api
      .get(api_url)
      .then((response) => {
        const data = response.data;
        setCardRespond(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }
  
  const rowsRespond = React.useMemo(
    
    () => (
      cardRespond.map(item => ({
        surveyID: item.surveyID['S'],
        surveyQuestion: item.surveyQuestion['S'],
        name: item.name['S'],
        email: item.email['S'],
        jobTitle: item.jobTitle['S'],
        department: item.department['S'],
        rating: item.rating['S'],
        comment: item.comment['S'],
        responseTime: item.responseTime['S'],
        }))
    ),
    [cardRespond]
)
  const columnsRespond = React.useMemo(
    () => ([
        { Header: 'SurveyID', accessor: 'surveyID', align: 'center',},
        { Header: 'SurveyQuestion', accessor: 'surveyQuestion', align: 'center',},
        { Header: 'Name',accessor: 'name',align: 'center',},
        { Header: 'Email', accessor: 'email', align: 'center',},
        { Header: 'JobTitle',accessor: 'jobTitle',align: 'center',},
        { Header: 'Department', accessor: 'department', align: 'center',},
        { Header: 'Rating',accessor: 'rating',align: 'center',},
        { Header: 'Comment', accessor: 'comment', align: 'center',},
        { Header: 'ResponseTime',accessor: 'responseTime',align: 'center',},
    ]),
    []
)
  var average = [];
  //return the average score for all users that responded
  function averageScore() {
    
    let n = myOptions.length * surveyFormat.length;
    var totalScore = Array(n).fill(0);
    var countScore = Array(n).fill(0);
    var averageScore = Array(n).fill(0);
    displayCardRespond()
    
    cardRespond.forEach(element=>{
      if(element.rating['S'] !== "Yes" && element.rating['S'] !== "No"){
        totalScore[parseInt(element.surveyID['S'])-1]+=parseInt(element.rating['S'])
        
      }
      else if(element.rating['S'] === "Yes"){
        totalScore[parseInt(element.surveyID['S'])-1] += 1
      }
      
      countScore[parseInt(element.surveyID['S'])-1]+=1
    })
    
    for(let i=0;i<countScore.length;i++){
      if(countScore[i]==0){
        averageScore[i] = 0;
      }
      else{
        averageScore[i] = totalScore[i] / countScore[i]
      }
      average.push({"surveyID": i+1,"surveyQuestion": myOptions[~~(i/surveyFormat.length)],"surveyFormat":surveyFormat[i%surveyFormat.length], "averageScore":averageScore[i]})
    }  
    return average
}
  const aver = averageScore()
  const rowsAverage = React.useMemo(
    () => (
      
      aver.map((item) => ({
        surveyID: item.surveyID,
        surveyQuestion: item.surveyQuestion.value,
        surveyFormat: item.surveyFormat.value,
        averageScore: item.averageScore,
        }))
    ),
    [aver]
)
  const columnsAverage = React.useMemo(
    () => ([
        { Header: 'SurveyID', accessor: 'surveyID', align: 'center',},
        { Header: 'SurveyQuestion', accessor: 'surveyQuestion', align: 'center',},
        { Header: 'SurveyFormat', accessor: 'surveyFormat', align: 'center',},
        { Header: 'AverageScore',accessor: 'averageScore',align: 'center',},
    ]),
    []
)
 
  return (
    <>
    "Select one of the survey question: "
    <Select
      value={value}
      onSelect={onSelectQuestion}
      options={myOptions} 
    />
      
    "Select the survey format(1-5, yes/no)"
      <Select
        value={format}
        onSelect={onSelectFormat}
        options={surveyFormat} />
    <Button onClick={surveyDesign}>Send survey to MS Teams!</Button>
    <Button onClick={displayCardSend}>Display sent results</Button>
    <Table
      columns={columnsSend}
      data={rowsSend}
    />
    <Button onClick={displayCardRespond}>Display response results</Button>
    <Table
      columns={columnsRespond}
      data={rowsRespond}
    />
    "Reporting(if the survey is Yes/No format, then averageScore=Yes%. Else, averageScore=average score for the responses)"
    <Table
      columns={columnsAverage}
      data={rowsAverage}
    />
    
    </>

  )
  
}