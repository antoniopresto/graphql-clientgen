export const printJSON = (obj: any) => {
  let cache: any[] = [];
  const str = JSON.stringify(obj, function(_, value) {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Duplicate reference found, discard key
        return;
      }
      // Store value in our collection
      cache.push(value);
    }
    return value;
  }, 2);
  
  console.log(str);
};
