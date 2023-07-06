function pad(num: number) {
    const s = `00${num}`;
    return s.substring(s.length - 2);
  }
  
  export function getFormattedTime(timeInSeconds: number) {
    let remainingTime = timeInSeconds;
    const hours = Math.floor(remainingTime / 3600);
    remainingTime = remainingTime - hours * 3600;
    const minutes = Math.floor((timeInSeconds - hours * 3600) / 60);
    remainingTime = remainingTime - minutes * 60;
    const seconds = Math.floor(remainingTime);
  
    if (hours) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
  
    return `${pad(minutes)}:${pad(seconds)}`;
  }
  
  export function parseFormattedTime(formattedTimeString: string) {
    const splitString = formattedTimeString.split(':');
  
    let total = 0;
    for (let i = splitString.length - 1; i >= 0; i--) {
      const parsedNum = parseInt(splitString[i], 10);
  
      if (i === splitString.length - 1) {
        total += parsedNum;
      }
  
      if (i === splitString.length - 2) {
        total += parsedNum * 60;
      }
  
      if (i === splitString.length - 3) {
        total += parsedNum * 3600;
      }
    }
  
    return total;
  }