import cx from "classnames";
import "./selectButtons.scss";
import { useGetGlobalPropsContext } from "../../contexts/GlobalPropsContext";

type SelectItem = {
  content: React.ReactNode;
  value: any;
};

interface SelectButtonProps {
  items: SelectItem[];
  value: string;
  onChange: (item: any) => void;
  displayIndex?: number;
}

interface CustomCSSProperties extends React.CSSProperties {
  "--button-primary-color"?: string;
}

const SelectButtons: React.FC<SelectButtonProps> = ({
  items,
  onChange,
  value,
  displayIndex,
}) => {
  const { buttonColorPrimary } = useGetGlobalPropsContext();

  const customStyle: CustomCSSProperties = {
    "--button-primary-color": buttonColorPrimary,
  };

  console.log("displayIndex", displayIndex)

  return (
    <div className="select-buttons">
      {items.map((item, index) => {
        const isActive =
          displayIndex !== undefined ? index === displayIndex : item.value === value;

        return (
          <button
            key={`select-${index}`}
            className={cx("select-buttons__item", isActive && "active")}
            style={customStyle}
            onClick={() => onChange(item.value)}
          >
            {item.content}
          </button>
        );
      })}
    </div>
  );
};

export default SelectButtons;
