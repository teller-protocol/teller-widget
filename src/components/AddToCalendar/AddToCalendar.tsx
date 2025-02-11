import apple from "../../assets/apple.svg";
import googleCalendar from "../../assets/googleCalendar.svg";
import outlook from "../../assets/outlook.svg";
import yahoo from "../../assets/yahoo.svg";

import "./addToCalendar.scss";

import { useCallback, useMemo } from "react";
import {
  SupportedContractsEnum,
  useReadContract,
} from "../../hooks/useReadContract";
import Button from "../Button";

interface AddToCalendarProps {
  bidId: string;
  onBack: () => void;
}

const AddToCalendar: React.FC<AddToCalendarProps> = ({ bidId, onBack }) => {
  const { data: bidData } = useReadContract(
    SupportedContractsEnum.TellerV2,
    "bids",
    [Number(bidId)]
  );

  const eventTitle = "Teller Loan Repayment";

  const bid = bidData?.[5];

  const dates = useMemo(() => {
    const startVal = bid?.acceptedTimestamp;
    const durationVal = bid?.loanDuration;
    const cycleVal = bid?.paymentCycle ?? 1;
    if (startVal && durationVal) {
      const start = BigInt(startVal) * BigInt(1000);
      const end = BigInt(durationVal) * BigInt(1000) + start;
      const cycle = BigInt(cycleVal);
      return {
        start,
        end,
        cycle,
      };
    }
  }, [bid]);

  const handleClick = useCallback((calendarLinks: string[] | undefined) => {
    calendarLinks?.forEach((link) => window.open(link, "_blank"));
  }, []);

  const handleCreateEvents = useCallback(
    (calendarType: string) => {
      if (!dates) return;
      const calendarLinks = [];
      const endDateFormatted = new Date(Number(dates?.end))
        .toISOString()
        .replace(/-|:|\.\d+/g, ""); // format end date
      switch (calendarType) {
        case "apple":
          calendarLinks.push(
            `https://www.icloud.com/calendar/#createEvent?title=${eventTitle}&startDate=${endDateFormatted}&endDate=${endDateFormatted}&isAllDay=true`
          );
          break;
        case "google":
          calendarLinks.push(
            `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${endDateFormatted}/${endDateFormatted}&ctz=UTC&sf=true&output=xml`
          );
          break;
        case "outlook":
          calendarLinks.push(
            `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&startdt=${endDateFormatted}&enddt=${endDateFormatted}&subject=${eventTitle}&allday=true`
          );
          break;
        case "yahoo":
          calendarLinks.push(
            `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${eventTitle}&st=${endDateFormatted}&et=${endDateFormatted}&allday=1`
          );
          break;
        default:
          break;
      }
      return calendarLinks;
    },
    [dates]
  );

  const calendarLinks = useMemo(
    () => ({
      apple: handleCreateEvents("apple"),
      google: handleCreateEvents("google"),
      outlook: handleCreateEvents("outlook"),
      yahoo: handleCreateEvents("yahoo"),
    }),
    [handleCreateEvents]
  );

  return (
    <div className="add-to-calendar">
      <h1>Add payment reminder for loan {bidId} to calendar</h1>
      <div className="icons-container">
        <a href="#" onClick={() => handleClick(calendarLinks.apple)}>
          <img src={apple} alt="Apple Calendar" />
        </a>
        <a href="#" onClick={() => handleClick(calendarLinks.google)}>
          <img src={googleCalendar} alt="Google Calendar" />
        </a>
        <a href="#" onClick={() => handleClick(calendarLinks.outlook)}>
          <img src={outlook} alt="Outlook Calendar" />
        </a>
        <a href="#" onClick={() => handleClick(calendarLinks.yahoo)}>
          <img src={yahoo} alt="Yahoo Calendar" />
        </a>
      </div>
      <Button onClick={onBack} label="Go back" />
    </div>
  );
};

export default AddToCalendar;
