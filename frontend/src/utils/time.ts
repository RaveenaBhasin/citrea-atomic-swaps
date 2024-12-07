export const formatDateTime = (timestamp: number): { full: string; relative: string } => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    const full = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    
    
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    let relative: string;
    
    if (diffInSeconds < 60) {
      relative = `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      relative = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      relative = `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      relative = `${days} day${days > 1 ? 's' : ''} ago`;
    }
    
    return { full, relative };
  };
  
  