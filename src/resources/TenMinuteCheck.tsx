function isMoreThanTenMinutesAgo(dateString: string): boolean {
    const inputDate = new Date(dateString); // Parse the ISO 8601 string
    const currentDate = new Date(); // Current date and time
  
    // Calculate the difference in milliseconds
    const differenceInMs = currentDate.getTime() - inputDate.getTime();
  
    // Convert the difference to minutes
    const differenceInMinutes = differenceInMs / (1000 * 60);
  
    // Check if the difference is greater than 10 minutes
    return differenceInMinutes > 10;
  }

  export default isMoreThanTenMinutesAgo