import React, { useEffect, useState } from "react";
// import isMoreThanTenMinutesAgo from "../resources/TenMinuteCheck";
import client from "../resources/Client";
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

// const SingleProjectPage: React.FC<SingleProjectPage> = ({client}) =>
const Home: React.FC = () => {
  const [scanLog, setScanLog] = useState<any[]>([])

  useEffect(()=>{
    getDBScanLog()
  }, [])

  function formatDateTime(inputString: string): string {
    const date = parseISO(inputString); // Parse the ISO string into a Date object
    return format(date, 'MM/dd/yyyy h:mm a'); // Format the date as "mm/dd/yyyy hh:mm am/pm"
  }
  function getFlexScanLog(dbResponse: any) {
    const apiString = '/scan-log/scan-history?page=0&size=20&sort=scanDate%2Cdesc'
    client.queries.FlexApiFunction({API_STRING: apiString}).then((res: { data: any; })=> {

      // Parse the API response data
      const apiData = JSON.parse(String(res.data))?.content;

          // Filter items that are not already in the database
          const newItems = apiData.filter((apiItem: Scan) =>
            !dbResponse.some((dbItem: Scan) => dbItem.id === apiItem.id) // Compare by unique identifier
          );
          
          // Add new items to the database
          newItems.forEach((newItem: Scan) => {
            client.models.ScanItem.create({
              id: newItem.id,
              barcode: newItem.barcode,
              elementId: newItem.elementId,
              itemName: newItem.itemName,
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
              .then(() => {console.log('Item added:', newItem), setScanLog(prev=>[...prev, newItem])})
              .catch((err: any) => console.error('Error adding item:', err));
              
          });
          
    })
    .catch((err: any) => console.error('Error fetching API data:', err));
  }

  async function getDBScanLog() {
    try {
      const response = await client.models.ScanItem.list()
      // console.log(response) 
      // I want to check if 10 minutes updated. but the updated time is not accurate?
      // const moreThanTenMinutesAgo = isMoreThanTenMinutesAgo(response.data[0]?.updatedAt)
      if(response.data && response.data.length === 0) {
        getFlexScanLog(response.data)
      } else {
        setScanLog(response.data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
      <main className="homeBody">
        <button onClick={getDBScanLog}>Refresh Scanlog</button>
        {/* <br /> */}

        {scanLog.length > 0 ? 
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
