import ReactTooltip from "react-tooltip";
import "./tooltip.scss";

interface TooltipProps {
  className?: string;
  description: string;
  icon: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ description, className, icon }) => {
  return (
    <>
      <div
        data-tip={description}
        data-for={description}
        data-padding="16px"
        data-background-color="RGBA(0,0,0,1)"
        data-arrow-color="RGBA(0,0,0,1)"
        data-multiline="true"
        data-class="tooltip"
        data-place="top"
      >
        {icon}
      </div>
      <ReactTooltip clickable={true} id={description} />
    </>
  );
};
export default Tooltip;
