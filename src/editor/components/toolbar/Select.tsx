type SelectProps = {
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  className: string;
  options: string[];
  value: string;
};

export function Select({ onChange, className, options, value }: SelectProps) {
  return (
    <select className={className} onChange={onChange} value={value}>
      <option hidden={true} value="" />
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
