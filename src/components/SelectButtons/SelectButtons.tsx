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
}

interface CustomCSSProperties extends React.CSSProperties {
  '--button-primary-color'?: string;
}

const SelectButtons: React.FC<SelectButtonProps> = ({
  items,
  onChange,
  value,
}) => {
  const { buttonColorPrimary } = useGetGlobalPropsContext
    ? useGetGlobalPropsContext()
    : { buttonColorPrimary };

  const customStyle: CustomCSSProperties = {
    '--button-primary-color': buttonColorPrimary,
  };

  return (
    <div className="select-buttons">
      {items.map((item, index) => (
        <button
          key={`select-${index}`}
          className={cx("select-buttons__item", item.value === value && "active")}
          style={customStyle}
          onClick={() => onChange(item.value)}
        >
          {item.content}
        </button>
      ))}
    </div>
  );
};

export default SelectButtons;
