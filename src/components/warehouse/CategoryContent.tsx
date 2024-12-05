import React, { useEffect, useState, useRef } from 'react';
import '../../css/Banner.css'
// import { format, parseISO} from 'date-fns';

interface CategoryContentProps {
  categoryLineItems: CategoryContent[],
  setCategoryLineItems: Function,
  // getCategoryLineItems: Function,
  project: AwaitingPrep,
  client: Function,
  category: CategoryId,
  index: number
  categoryIds: CategoryId[]
  
}
interface CategoryId { //Definition of each category header (Audio, Lighting, etc)
    id: string;
    displayName: string;
}
interface AwaitingPrep {
    id:string;
    displayName: string;
    plannedStartDate: string;
}

interface CategoryLineItems { //Definition of each line item within a category
    id: string;
    parentLineItemId: string;
    displayName: string;
    lineQtyInfo: LineQtyInfo;
}
interface LineQtyInfo { //inner object describing completion of prep
  requiredQty: number;
  preppedQty: number;
}
interface CategoryContent { // New Object containing parentLineItemId as id with related content || lineiteminfo
  id: string;
  displayName: string;
  plannedStartDate: string;
  requiredScannedItems: number;
  currentScannedItems: number;
  content: CategoryLineItems[];
}

const CategoryContentComponent: React.FC<CategoryContentProps> = ({ categoryLineItems, setCategoryLineItems, project, client, category, categoryIds, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollTo = useRef(null)

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if(!isOpen && scrollTo?.current) {
      (scrollTo.current as HTMLElement).scrollIntoView({behavior: "smooth"})
    }    
  };

  function buildCategoryLineItems(
    categoryIds: CategoryId[],
    responseArray: CategoryLineItems[]
  ): CategoryContent[] {
    if (!categoryIds || categoryIds.length === 0) return [];
  
    return categoryIds.reduce<CategoryContent[]>((acc, category) => {
      // Filter responseArray to find elements matching the current category id
      const content = responseArray.filter(el => el.parentLineItemId === category.id);
      
      
      // Add to the accumulator only if there's content
      if (content[0]) {
        acc.push({
          id: category.id,
          displayName: category.displayName,
          plannedStartDate: project.plannedStartDate,
          requiredScannedItems: 0,
          currentScannedItems: 0,
          content,
        });
      }
      return acc;
    }, []);
  }

  function getCategoryLineItems(projectId:string, categoryId:string){
    const apiString = `/eqlist-line-item/node-list/${categoryId}?equipmentListId=${projectId}`
    client({API_STRING: apiString}).then((res: { data: any; })=> {
      const responseArray = JSON.parse(String(res.data))?.content
      
      console.log(projectId, categoryId, responseArray)
  if (responseArray && categoryIds) {
    const updatedArray = buildCategoryLineItems(categoryIds, responseArray);

      setCategoryLineItems((prev: CategoryContent[]) => {
        // Create a copy of the previous state
        const updatedCategoryLineItems = [...prev];

      updatedArray.forEach(newItem => {
        const existingIndex = updatedCategoryLineItems.findIndex(
          existingItem => existingItem.id === newItem.id
        );

        if (existingIndex !== -1) {
          // console.log('existing item')
          // Update the content field of the existing element
          updatedCategoryLineItems[existingIndex] = {
            ...updatedCategoryLineItems[existingIndex],
            content: newItem.content,
            requiredScannedItems: newItem.content.reduce((acc, item)=>{
              acc += item.lineQtyInfo.requiredQty
              return acc
            }, 0),
            currentScannedItems: newItem.content.reduce((acc, item)=>{
              acc += item.lineQtyInfo.preppedQty
              return acc
            }, 0)
          };
        } else {
          // Add the new element if it doesn't already exist
          updatedCategoryLineItems.push(newItem);
          // console.log('new item')
        }
        });
        return updatedCategoryLineItems
      });
    }
    }).catch((err: any)=>console.log(err))
  }
  

  return (
    <li key={index}>
      {/* Display the category's display name */}
      <div ref={ scrollTo } className='category-content-header' onClick={toggleOpen}>
        <span className={`arrow ${isOpen ? 'open' : ''}`}>▼</span>
        <h4 style={{display: "inline"}}>
            {category?.displayName}
        </h4>

        <div>
        {/* Button to load items for the category */}
          <button onClick={() => getCategoryLineItems(project.id, category.id)}>
              <img className='project-category-refresh' src="src\assets\refresh-svgrepo-com.svg" alt="refresh" />
          </button>
        </div>
      </div>

      {/* Check if a matching categoryLineItem exists */}
      { isOpen && categoryLineItems
          .filter((el: CategoryContent) => el.id === category.id) // Filter for matching items
          .map((el: CategoryContent) => (
          <ul key={el.id}>
              {/* Map through the content field of the matching categoryLineItem */}
              {el.content.map((c: CategoryLineItems, contentIndex) => (
              <li key={contentIndex}>
                  <h3>{c.displayName || "No data"}<br/> Progress: {c.lineQtyInfo.preppedQty/c.lineQtyInfo.requiredQty*100}%</h3>
                  <div>
                  Required: {c.lineQtyInfo.requiredQty} <br />
                  Prepped: {c.lineQtyInfo.preppedQty}
                  </div>
              </li>
              ))} 
          </ul>
        ))}
    </li>
  );
};

export default CategoryContentComponent;
