import React, { useState } from "react";

// import Banner from "./Banner";
// import { Authenticator } from "@aws-amplify/ui-react";
// import outputs from '../../amplify_outputs.json'
// import { Amplify } from "aws-amplify";
// import { get } from 'aws-amplify/api';
import { format, parseISO} from 'date-fns';

import '@aws-amplify/ui-react/styles.css';

// Amplify.configure(outputs)

interface Scan {
barcode: string
elementId: string
id: string
itemName: string
locationId: string
locationName: string
modelId: string
quantity: number
referenceId: string
referenceName: string
scanDate: string
scanMode: string
scanModeDisplayString: string
scanSource: string
userId: string
userName: string
}

interface Home {
  client: any
}


// const SingleProjectPage: React.FC<SingleProjectPage> = ({client}) =>
const Home: React.FC<Home> = ({client}) => {
  const [scanLog, setScanLog] = useState<Scan[]>([])

  // useEffect(()=>{
  //   console.log(scanLog)
  // }, [scanLog])

  function formatDateTime(inputString: string): string {
    const date = parseISO(inputString); // Parse the ISO string into a Date object
    return format(date, 'MM/dd/yyyy h:mm a'); // Format the date as "mm/dd/yyyy hh:mm am/pm"
  }
  function getFlexScanLog() {
    const apiString = '/scan-log/scan-history?page=0&size=20&sort=scanDate%2Cdesc'
    client.queries.FlexApiFunction({API_STRING: apiString}).then((res: { data: any; })=> {

      // Parse the API response data
      const apiData = JSON.parse(String(res.data))?.content;
      // Fetch existing DB records
      client.models.ScanItem.list()
        .then((dbResponse: { data: any; }) => {
          const dbData = dbResponse.data;

          // Filter items that are not already in the database
          const newItems = apiData.filter((apiItem: Scan) =>
            !dbData.some((dbItem: Scan) => dbItem.id === apiItem.id) // Compare by unique identifier
          );

          // Add new items to the database
          newItems.forEach((newItem: Scan) => {
            client.models.ScanItem.create({
              barcode: newItem.barcode,
              elementId: newItem.elementId,
              id: newItem.id,
              itemName: newItem.itemName,
              locationId: newItem.locationId,
              locationName: newItem.locationName,
              modelId: newItem.modelId,
              quantity: newItem.quantity,
              referenceId: newItem.referenceId,
              referenceName: newItem.referenceName,
              scanDate: newItem.scanDate,
              scanMode: newItem.scanMode,
              scanModeDisplayString: newItem.scanModeDisplayString,
              scanSource: newItem.scanSource,
              userId: newItem.userId,
              userName: newItem.userName

            })
              .then(() => console.log('Item added:', newItem))
              .catch((err: any) => console.error('Error adding item:', err));
              if(scanLog && scanLog.length > 0){
                setScanLog(prev=>[...prev, newItems])
              }
          });
          
        })
        .catch((err: any) => console.error('Error fetching DB data:', err));
    })
    .catch((err: any) => console.error('Error fetching API data:', err));
      
    
  }

  async function getDBScanLog() {
    try {
      const response = await client.models.ScanItem.list()
      if(response.data && response.data.length === 0) {
        console.log(response) 
        // getFlexScanLog()
      } else {
        console.log(response)
        // setScanLog(response.data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
      <main>
        <h1>Home</h1>
        
        <button onClick={getFlexScanLog}>call flex</button>
        <button onClick={getDBScanLog}>call DB</button>

        {scanLog ? 
        <ul>
          {scanLog.map((scan:Scan, index)=>
            <li key={index}>
              <span style={{fontWeight: '800'}}>{scan.itemName}: {scan.quantity!}</span> 
              <br />
              <span style={{fontWeight: '600'}}>{scan.referenceName}</span>
              <br /> 
              <span>{scan.userName}</span>
              <br />
              <span>{formatDateTime(scan.scanDate)}</span>
              
            </li>
          )}
         

        </ul> : <img src="https://ssav.net/wp-content/themes/images/ajax-loader.gif" alt="" /> }
      </main>
        
  );
} 

export default Home
;
