import { forwardRef } from "react";

interface CustomCheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  size?: number;
}

export const CustomCheckbox = forwardRef<HTMLInputElement, CustomCheckboxProps>(
  ({ id, checked, onChange, label, size = 1 }, ref) => {
    return (
      <div 
        className="checkbox-wrapper-custom inline-flex items-center gap-3"
        style={{
          '--size': size,
          '--bg': 'hsl(var(--background))',
          '--brdr': 'hsl(var(--border))',
          '--brdr-actv': 'hsl(var(--primary))',
          '--brdr-hovr': 'hsl(var(--primary) / 0.5)',
          '--dur': `${(size / 2) * 0.6}s`,
        } as React.CSSProperties}
      >
        <label className="checkbox-custom relative cursor-pointer" htmlFor={id} style={{ width: `${size * 24}px` }}>
          <div className="w-full pt-[100%]"></div>
          <input
            ref={ref}
            type="checkbox"
            id={id}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="absolute inset-0 m-0 p-0 cursor-pointer appearance-none rounded-md border border-[color:var(--newBrdrClr,var(--brdr))] bg-[color:var(--bg)] outline-none transition-all duration-[calc(var(--dur)/3)] hover:border-[length:calc(var(--size)*2px)] hover:border-[color:var(--brdr-hovr)] checked:border-[length:calc(var(--size)*2px)] checked:border-[color:var(--brdr-actv)] checked:delay-[calc(var(--dur)/1.3)]"
          />
          <svg
            viewBox="0 0 22 22"
            className="absolute inset-0 block h-full w-full fill-none pointer-events-none stroke-primary stroke-[2px] rounded-[stroke-linecap:round] [stroke-linejoin:round] transition-all duration-[var(--dur)]"
            style={{
              strokeDasharray: checked ? '16 93' : '93',
              strokeDashoffset: checked ? '109' : '94',
            }}
          >
            <path
              fill="none"
              stroke="currentColor"
              d="M5.5,11.3L9,14.8L20.2,3.3l0,0c-0.5-1-1.5-1.8-2.7-1.8h-13c-1.7,0-3,1.3-3,3v13c0,1.7,1.3,3,3,3h13 c1.7,0,3-1.3,3-3v-13c0-0.4-0.1-0.8-0.3-1.2"
            />
          </svg>
        </label>
        {label && (
          <label className="label-custom cursor-pointer text-sm font-medium" htmlFor={id}>
            {label}
          </label>
        )}
      </div>
    );
  }
);

CustomCheckbox.displayName = "CustomCheckbox";
