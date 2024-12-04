import {  useEffect, useState } from "react";
import type { Schema } from "../../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import Banner from "../warehouse/ProjectBanner";
import { format, parseISO} from 'date-fns';
// import { Authenticator } from "@aws-amplify/ui-react";
import outputs from '../../../amplify_outputs.json'
import { Amplify } from "aws-amplify";
// import { get } from 'aws-amplify/api';
// import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';

import '@aws-amplify/ui-react/styles.css';

Amplify.configure(outputs)
 
const client = generateClient<Schema>();


interface AwaitingPrep {
  id:string;
  displayName: string;
  plannedStartDate: string;
  
}


function WarehouseDashboard() {
  const [awaitingPrep, setAwaitingPrep] = useState<AwaitingPrep[]>([])
  const [groupedByDate, setGroupedByDate] = useState<Record<string, AwaitingPrep[]>>({})
  const [startDate, setStartDate] = useState<string>(new Date( new Date().getTime() -2 * 24 * 60 * 60 * 1000).toISOString())
  const [endDate, setEndDate] = useState<string>(new Date().toISOString())

  useEffect(()=>{
    if(awaitingPrep && awaitingPrep[0] != undefined){
      const groupedEvents = groupByStartDate(awaitingPrep)
      setGroupedByDate(groupedEvents)
    }
  }, [awaitingPrep])

  useEffect(()=>{
    setEndDate(getFutureDate(2)) 
  }, [startDate])
  
  function getFutureDate(days:number) {
    const currentDate = new Date()
    const futureDate = new Date(currentDate.getTime() + days * 24 * 60 * 60 * 1000)
    return futureDate.toISOString()
  }
  
  function formatDateTime(inputString: string): string {
    const date = parseISO(inputString); // Parse the ISO string into a Date object
    return format(date, 'MM/dd/yyyy'); // Format the date as "mm/dd/yyyy hh:mm am/pm"
  }

  function getPullsheetCalender() {
    const apiString = `/element-calendar/list-view-data?templateId=7b588c50-d66e-4f18-9d97-0f3317c3a3ac&startDate=${startDate}&endDate=${endDate}&calendarTokenFieldIds=client.name`
    client.queries.FlexApiFunction({API_STRING: apiString}).then(res=> {
      
      const response = JSON.parse(String(res.data))
      const updatedArray = response.reduce((acc:AwaitingPrep[], item:any)=>{
        acc.push(item.children[0])
        return acc
      }, [])
      setAwaitingPrep(updatedArray)
    }).catch(err=>console.log(err))
  }

  function groupByStartDate(events: AwaitingPrep[]): Record<string, AwaitingPrep[]> {
    return events?.reduce((acc, event) => {
      const startDate = event.plannedStartDate.slice(0, 10);
      if (!acc[startDate]) {
        acc[startDate] = [];
      }
      acc[startDate].push(event);
      return acc;
    }, {} as Record<string, AwaitingPrep[]>);
  }

  

  return (
    <main className="warehouse-dashboard">
      {/* <button className="button refresh-pullsheets" onClick={getAwaitingPrep}>Refresh Pullsheets</button> */}
      <button className="button refresh-pullsheets" onClick={getPullsheetCalender}>new tets</button>
      
      <div className="awaitingPrep-container">
        {
          Object.keys(groupedByDate)?.map((startDate, index) => {
            return <div key={index}>
              <h3 style={{textAlign: "center"}}>{formatDateTime(startDate)}</h3>
              {groupedByDate[startDate]?.map((project, index) => (
                <Banner key={index} client={client.queries.FlexApiFunction} project={project} />
              ))}
            </div>
          })
        }
        
      </div>
      
    </main>
        
  );
} 

export default WarehouseDashboard;
