import React, { useState, useEffect } from 'react';
import '../../css/Banner.css'
import { format, parseISO} from 'date-fns';
import CategoryContentComponent from './CategoryContent';
import { Link } from 'react-router-dom';

interface BannerProps { //Props coming into this component.
  client: Function;
  project: AwaitingPrep;
}
interface AwaitingPrep {
  id:string;
  displayName: string;
  plannedStartDate: string;
}
interface CategoryId { //Definition of each category header (Audio, Lighting, etc)
  id: string;
  displayName: string;
  groupQtyInfo: LineQtyInfo,
  isOpen: boolean;
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

const Banner: React.FC<BannerProps> = ({ project, client }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categoryIds, setCategoryIds] = useState<CategoryId[] | null >(null)
  const [categoryLineItems, setCategoryLineItems] = useState<CategoryContent[]>([])
  const [projectPercent, setProjectPercent] = useState<Number>(0)

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  useEffect(()=>{
    if(!categoryIds){ //Load categoryIds
      getSingleCategoryIds(project.id) 
    }
  }, [])

  // useEffect(()=>{
  //   console.log(projectPercent)
  // }, [projectPercent])


  useEffect(()=>{
    if(categoryIds){
      let tempTotal = 0
      let tempCurrent = 0
      categoryIds.forEach((cat:CategoryId)=>{
        // console.log(cat.groupQtyInfo)
        tempTotal += cat?.groupQtyInfo?.requiredQty
        tempCurrent += cat?.groupQtyInfo?.preppedQty
        const currentDate = new Date().getTime(); // Today's date in milliseconds
        const threeDaysFromNow = currentDate + 3 * 24 * 60 * 60 * 1000; // Add 5 days in milliseconds
        
        const projectDate = new Date(project.plannedStartDate).getTime();
        
        if (projectDate <= threeDaysFromNow && projectDate >= currentDate - threeDaysFromNow) {
          // The project date is within 5 days from today
          getCategoryLineItems(project.id, cat.id)
          // console.log(project.displayName, "categoryIds", categoryIds)
        }
        // console.log(cat.groupQtyInfo, tempTotal, tempCurrent)
      })
      if(tempTotal > 0){
        let t = (tempCurrent / tempTotal) * 100
        setProjectPercent(Number(t.toFixed(2)))
      }
    } 
  }, [categoryIds])


  function formatDateTime(inputString: string): string {
    const date = parseISO(inputString); // Parse the ISO string into a Date object
    if(inputString.slice(inputString.indexOf("T") + 1, inputString.indexOf("T") + 3) > "10"){
      return format(date, 'MM/dd/yyyy h:mm a'); // Format the date as "mm/dd/yyyy hh:mm am/pm"
    } else {
      return format(date, 'MM/dd/yyyy hh:mm a');
    }
  }

  function getSingleCategoryIds(projectId:string) {  // Get all categories for a project, remove categories with only 0 qty lineItems
    const apiString = `/eqlist-line-item/nodes-by-ids?equipmentListId=${projectId}`
    client({API_STRING: apiString}).then((res: { data: any; })=> {
      const response = JSON.parse(String(res.data))
      const filteredResponse = response?.filter((res:any)=>res?.groupQtyInfo?.requiredQty > 0)
      setCategoryIds(filteredResponse)
    }).catch((err: any)=>console.log(err))
  }

  function buildCategoryLineItems(
    categoryIds: CategoryId[],
    responseArray: CategoryLineItems[]
  ): CategoryContent[] {
    if (!categoryIds || categoryIds.length === 0) return [];
  
    return categoryIds.reduce<CategoryContent[]>((acc, item) => {
      // Filter responseArray to find elements matching the current category id
      const content = responseArray.filter(el => el.parentLineItemId === item.id);

      // Add to the accumulator only if there's content
      if (content.length > 0) {
        acc.push({
          id: item.id,
          displayName: item.displayName,
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
    <div className="banner">
      <Link to={`/warehouse/${project.id}`}> Project Information </Link>
      <div className={`banner-header ${isOpen ? 'open-banner' : ''}`} onClick={toggleOpen}>
        <h2>{project.displayName}</h2>
        <div className="project-percent">
          <div> {projectPercent.toString()}% </div>
          {/* <br /> */}
          <div className={`arrow ${isOpen ? 'open' : ''}`}> ▼ </div> 
        </div>
      </div>
      {isOpen && 
        <div className="banner-content">
          {formatDateTime(project.plannedStartDate)}
          {/* {project.plannedStartDate} */}
          <ul className="categoryIds">
          {categoryIds?.map((category, index) => (
              <CategoryContentComponent key={index} categoryLineItems={categoryLineItems} setCategoryLineItems={setCategoryLineItems} project={project} client={client} category={category} index={index} categoryIds={categoryIds} />
            ))}
          </ul>

        </div>}
    </div>
  )
};

export default Banner;
