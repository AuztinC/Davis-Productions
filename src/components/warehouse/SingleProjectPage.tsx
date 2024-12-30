import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../../resources/Client';
// import { awaitingPrep } from './mockData'; // Mock data for example
// import { sendSMS } from './api'; // API function for Lambda


//   interface AwaitingPrep {
//     id:string;
//     displayName: string;
//     plannedStartDate: string;
//   }
//   interface CategoryId { //Definition of each category header (Audio, Lighting, etc)
//     id: string;
//     displayName: string;
//     groupQtyInfo: LineQtyInfo,
//     isOpen: boolean;
//   }
//   interface CategoryLineItems { //Definition of each line item within a category
//     id: string;
//     parentLineItemId: string;
//     displayName: string;
//     lineQtyInfo: LineQtyInfo;
//   }
//   interface LineQtyInfo { //inner object describing completion of prep
//     requiredQty: number;
//     preppedQty: number;
//   }
//   interface CategoryContent { // New Object containing parentLineItemId as id with related content || lineiteminfo
//     id: string;
//     displayName: string;
//     plannedStartDate: string;
//     requiredScannedItems: number;
//     currentScannedItems: number;
//     content: CategoryLineItems[];
//   }

const SingleProjectPage: React.FC= () => {
  const { id } = useParams<{ id: string }>();
//   const project = awaitingPrep.find((item) => item.id === id);

  const [selectedUsers, setSelectedUsers] = useState<{ name: string; phoneNumber: string }[]>([]);
  const [message, setMessage] = useState('');

//   if (!project) {
//     return <div>Project not found</div>;
//   }

  const availableUsers = [
    { name: 'Alice', phoneNumber: '1234567890' },
    { name: 'Bob', phoneNumber: '9876543210' },
    { name: 'Charlie', phoneNumber: '4567890123' },
  ];

  const handleUserSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = availableUsers.find(
      (user) => user.phoneNumber === event.target.value
    );
    if (selected && !selectedUsers.find((user) => user.phoneNumber === selected.phoneNumber)) {
      setSelectedUsers([...selectedUsers, selected]);
    }
  };

  async function GetAwaitingPrepProject() {
    const response = await client.models.AwaitingPrep.get({
        id: `${id}`
    })
    // const response = await client.models.AwaitingPrep.onCreate()
    console.log(response)
  }

//   const handleSendMessage = async () => {
//     const phoneNumbers = selectedUsers.map((user) => user.phoneNumber);
//     try {
//       await sendSMS({ phoneNumbers, message });
//       alert('Message sent successfully!');
//       setMessage('');
//     } catch (error) {
//       console.error('Error sending SMS:', error);
//       alert('Failed to send message.');
//     }
//   };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ marginBottom: '20px' }}>
        {/* <h1>{project.displayName}</h1> */}
      </header>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h2>Category Content</h2>
          {/* {project.categoryContent.map((category, index) => (
            <div key={index} style={{ marginBottom: '15px' }}>
              <h3>{category.name}</h3>
              <ul>
                {category.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          ))} */}
        </div>

        <div style={{ flex: 1 }}>
          <h2>Send Notification</h2>
          <select
            onChange={handleUserSelect}
            defaultValue=""
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          >
            <option value="" disabled>
              Select a user
            </option>
            {availableUsers.map((user) => (
              <option key={user.phoneNumber} value={user.phoneNumber}>
                {user.name}
              </option>
            ))}
          </select>
          <div style={{ marginBottom: '10px' }}>
            <h4>Selected Users:</h4>
            <ul>
              {selectedUsers.map((user, index) => (
                <li key={index}>
                  {user.name} ({user.phoneNumber})
                </li>
              ))}
            </ul>
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message"
            style={{ width: '100%', padding: '10px', marginBottom: '10px', height: '100px' }}
          ></textarea>
          <button
            onClick={GetAwaitingPrepProject}
            style={{ padding: '10px 20px', backgroundColor: 'blue', color: 'white', border: 'none', cursor: 'pointer' }}
          >
            Send SMS
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleProjectPage;
