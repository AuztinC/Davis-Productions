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
  const [scanLog, setScanLog] = useState([])

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
      console.log(res)
      
      // const response: string = JSON.stringify(res.data);
      setScanLog(JSON.parse(String(res.data))?.content)
      
    }).catch((err: any)=>console.log(err))
    
  }

  async function getDBScanLog() {
    try {
      const response = await client.models.ScanItem.list()
      console.log(response)
    } catch (error) {
      console.log(error)
    }
  }

  return (
      <main>
        <h1>Home</h1>
        
        <button onClick={getFlexScanLog}>call flex</button>
        <button onClick={getDBScanLog}>call flex</button>

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
