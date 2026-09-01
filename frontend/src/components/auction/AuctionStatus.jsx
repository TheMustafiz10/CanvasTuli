


// import React from 'react';

// const AuctionStatus = ({ status }) => {
//   const getStatusConfig = () => {
//     switch (status) {
//       case 'live':
//         return { 
//           dotClass: 'live', 
//           textClass: 'live', 
//           label: '🔴 LIVE AUCTION' 
//         };
//       case 'ended':
//         return { 
//           dotClass: 'ended', 
//           textClass: 'ended', 
//           label: '⛔ AUCTION ENDED' 
//         };
//       case 'scheduled':
//         return { 
//           dotClass: 'scheduled', 
//           textClass: 'scheduled', 
//           label: '⏳ SCHEDULED' 
//         };
//       case 'cancelled':
//         return { 
//           dotClass: 'cancelled', 
//           textClass: 'cancelled', 
//           label: '❌ CANCELLED' 
//         };
//       default:
//         return { 
//           dotClass: '', 
//           textClass: '', 
//           label: status.toUpperCase() 
//         };
//     }
//   };

//   const config = getStatusConfig();

//   return (
//     <div className="auction-status">
//       <span className={`status-dot ${config.dotClass}`}></span>
//       <span className={`status-text ${config.textClass}`}>
//         {config.label}
//       </span>
//     </div>
//   );
// };

// export default AuctionStatus;








// src/components/auction/AuctionStatus.jsx
import React from 'react';

const AuctionStatus = ({ status }) => {
  const safeStatus = status || 'scheduled';
  
  const getStatusConfig = () => {
    switch (safeStatus) {
      case 'live':
        return { 
          dotClass: 'live', 
          textClass: 'live', 
          label: '🔴 LIVE AUCTION' 
        };
      case 'ended':
        return { 
          dotClass: 'ended', 
          textClass: 'ended', 
          label: '⛔ AUCTION ENDED' 
        };
      case 'scheduled':
        return { 
          dotClass: 'scheduled', 
          textClass: 'scheduled', 
          label: '⏳ SCHEDULED' 
        };
      case 'cancelled':
        return { 
          dotClass: 'cancelled', 
          textClass: 'cancelled', 
          label: '❌ CANCELLED' 
        };
      default:
        return { 
          dotClass: '', 
          textClass: '', 
          label: safeStatus.toUpperCase() 
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="auction-status">
      <span className={`status-dot ${config.dotClass}`}></span>
      <span className={`status-text ${config.textClass}`}>
        {config.label}
      </span>
    </div>
  );
};

export default AuctionStatus;