// Debug date validation for 25/09/1994

const validateBirthDate = (dateString) => {
  console.log('=== DEBUGGING DATE VALIDATION ===');
  console.log('Input dateString:', dateString);
  
  if (!dateString) {
    console.log('FAILED: Empty dateString');
    return false;
  }
  
  // Check format dd/MM/yyyy
  const datePattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateString.match(datePattern);
  
  console.log('Pattern match:', match);
  
  if (!match) {
    console.log('FAILED: Pattern match failed');
    return false;
  }
  
  const [, day, month, year] = match;
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  
  console.log('Parsed values:', { dayNum, monthNum, yearNum });
  
  // Check valid ranges
  if (monthNum < 1 || monthNum > 12) {
    console.log('FAILED: Invalid month');
    return false;
  }
  if (dayNum < 1 || dayNum > 31) {
    console.log('FAILED: Invalid day');
    return false;
  }
  if (yearNum < 1900 || yearNum > new Date().getFullYear()) {
    console.log('FAILED: Invalid year range');
    return false;
  }
  
  console.log('Range checks passed');
  
  // Create date and check if it's valid
  const date = new Date(yearNum, monthNum - 1, dayNum);
  
  console.log('Created date:', date);
  console.log('Date components check:', {
    getDate: date.getDate(),
    expectedDay: dayNum,
    getMonth: date.getMonth(),
    expectedMonth: monthNum - 1,
    getFullYear: date.getFullYear(),
    expectedYear: yearNum
  });
  
  // Check if date construction was successful
  if (date.getDate() !== dayNum || 
      date.getMonth() !== monthNum - 1 || 
      date.getFullYear() !== yearNum) {
    console.log('FAILED: Date construction failed');
    return false;
  }
  
  console.log('Date construction passed');
  
  // Check if date is in the past or today
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  
  console.log('Today (end of day):', today);
  console.log('Birth date:', date);
  console.log('Is date <= today?', date <= today);
  console.log('Date comparison result:', date <= today);
  
  const result = date <= today;
  console.log('FINAL RESULT:', result);
  
  return result;
};

// Test the specific date
console.log('\n=== TESTING 25/09/1994 ===');
const result = validateBirthDate('25/09/1994');
console.log('Final validation result:', result);