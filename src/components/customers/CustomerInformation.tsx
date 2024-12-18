// import React from "react";

interface CustomerInformation {
    client: any
}

const CustomerInformation: React.FC<CustomerInformation> = ({client})=>{

    console.log(client)
    return (
        <main>
            <h1>Coming soon</h1>
        </main>
    )
}

export default CustomerInformation