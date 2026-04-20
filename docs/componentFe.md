src/components/ui/Button.tsx

"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

import { cva, type VariantProps } from "class-variance-authority";



const buttonVariants = cva(

&#x20; "group relative px-6 py-3 rounded-2xl font-semibold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-\[0.97] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden",

&#x20; {

&#x20;   variants: {

&#x20;     variant: {

&#x20;       primary: "bg-\[#7C3AED] text-white shadow-purple-500/40 hover:shadow-purple-500/60 hover:brightness-110",

&#x20;       secondary: "bg-\[#111827] border border-\[#374151] text-\[#E5E7EB] hover:bg-\[#1F2937] hover:border-\[#4B5563]",

&#x20;       danger: "bg-\[#DC2626] text-white shadow-red-500/40 hover:shadow-red-500/60 hover:brightness-110",

&#x20;       ghost: "bg-transparent border border-\[#9CA3AF]/30 text-\[#E5E7EB] hover:bg-white/5",

&#x20;       icon: "p-3 min-w-0",

&#x20;     },

&#x20;     size: {

&#x20;       sm: "px-4 py-2 text-sm",

&#x20;       md: "px-6 py-3",

&#x20;       lg: "px-8 py-4 text-lg",

&#x20;     },

&#x20;   },

&#x20;   defaultVariants: {

&#x20;     variant: "primary",

&#x20;     size: "md",

&#x20;   },

&#x20; }

);



interface ButtonProps

&#x20; extends ButtonHTMLAttributes<HTMLButtonElement>,

&#x20;   VariantProps<typeof buttonVariants> {

&#x20; isLoading?: boolean;

&#x20; icon?: ReactNode;

}



export function Button({

&#x20; className,

&#x20; variant,

&#x20; size,

&#x20; isLoading,

&#x20; icon,

&#x20; children,

&#x20; ...props

}: ButtonProps) {

&#x20; return (

&#x20;   <button

&#x20;     className={buttonVariants({ variant, size, className })}

&#x20;     disabled={isLoading || props.disabled}

&#x20;     {...props}

&#x20;   >

&#x20;     {isLoading \&\& (

&#x20;       <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />

&#x20;     )}

&#x20;     {!isLoading \&\& icon \&\& <span className="text-xl">{icon}</span>}

&#x20;     {children}

&#x20;   </button>

&#x20; );

}



// Icon Button Variant (smaller, circular feel)

export function IconButton({

&#x20; children,

&#x20; ...props

}: Omit<ButtonProps, "variant" | "size">) {

&#x20; return (

&#x20;   <Button variant="icon" size="sm" {...props}>

&#x20;     {children}

&#x20;   </Button>

&#x20; );

}



src/components/ui/Input.tsx

"use client";

import { InputHTMLAttributes, forwardRef } from "react";



interface InputProps extends InputHTMLAttributes<HTMLInputElement> {

&#x20; label?: string;

&#x20; error?: string;

}



export const Input = forwardRef<HTMLInputElement, InputProps>(

&#x20; ({ label, error, className, ...props }, ref) => {

&#x20;   return (

&#x20;     <div className="w-full">

&#x20;       {label \&\& (

&#x20;         <label className="block text-sm font-medium text-\[#9CA3AF] mb-1.5 tracking-wide">

&#x20;           {label}

&#x20;         </label>

&#x20;       )}

&#x20;       <input

&#x20;         ref={ref}

&#x20;         className={`

&#x20;           w-full bg-\[#111827] border border-\[#374151] rounded-2xl px-5 py-3.5 

&#x20;           text-\[#E5E7EB] placeholder:text-\[#6B7280] focus:outline-none

&#x20;           transition-all duration-200

&#x20;           focus:border-\[#7C3AED] focus:ring-2 focus:ring-\[#7C3AED]/30

&#x20;           disabled:opacity-50 disabled:cursor-not-allowed

&#x20;           ${error ? "border-\[#DC2626] focus:border-\[#DC2626]" : ""}

&#x20;           ${className}

&#x20;         `}

&#x20;         {...props}

&#x20;       />

&#x20;       {error \&\& <p className="mt-1 text-sm text-\[#DC2626]">{error}</p>}

&#x20;     </div>

&#x20;   );

&#x20; }

);



Input.displayName = "Input";



src/components/ui/Textarea.tsx

"use client";

import { TextareaHTMLAttributes, forwardRef } from "react";



interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {

&#x20; label?: string;

&#x20; error?: string;

}



export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(

&#x20; ({ label, error, className, ...props }, ref) => {

&#x20;   return (

&#x20;     <div className="w-full">

&#x20;       {label \&\& (

&#x20;         <label className="block text-sm font-medium text-\[#9CA3AF] mb-1.5 tracking-wide">

&#x20;           {label}

&#x20;         </label>

&#x20;       )}

&#x20;       <textarea

&#x20;         ref={ref}

&#x20;         className={`

&#x20;           w-full bg-\[#111827] border border-\[#374151] rounded-2xl px-5 py-3.5 

&#x20;           text-\[#E5E7EB] placeholder:text-\[#6B7280] focus:outline-none

&#x20;           transition-all duration-200 resize-y min-h-\[120px]

&#x20;           focus:border-\[#7C3AED] focus:ring-2 focus:ring-\[#7C3AED]/30

&#x20;           ${error ? "border-\[#DC2626]" : ""}

&#x20;           ${className}

&#x20;         `}

&#x20;         {...props}

&#x20;       />

&#x20;       {error \&\& <p className="mt-1 text-sm text-\[#DC2626]">{error}</p>}

&#x20;     </div>

&#x20;   );

&#x20; }

);



Textarea.displayName = "Textarea";



src/components/ui/Checkbox.tsx

"use client";

import { InputHTMLAttributes, forwardRef } from "react";



interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {

&#x20; label?: string;

}



export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(

&#x20; ({ label, className, ...props }, ref) => {

&#x20;   return (

&#x20;     <label className="flex items-center gap-3 cursor-pointer group">

&#x20;       <div className="relative">

&#x20;         <input

&#x20;           type="checkbox"

&#x20;           ref={ref}

&#x20;           className={`

&#x20;             peer w-6 h-6 accent-\[#7C3AED] bg-\[#111827] border-2 border-\[#374151] 

&#x20;             rounded-xl appearance-none cursor-pointer

&#x20;             checked:border-\[#7C3AED] checked:bg-\[#7C3AED]

&#x20;             transition-all duration-200

&#x20;             ${className}

&#x20;           `}

&#x20;           {...props}

&#x20;         />

&#x20;         <div className="absolute inset-0 flex items-center justify-center text-white scale-0 peer-checked:scale-100 transition-transform">

&#x20;           ✓

&#x20;         </div>

&#x20;       </div>

&#x20;       {label \&\& (

&#x20;         <span className="text-\[#E5E7EB] group-hover:text-white transition-colors">

&#x20;           {label}

&#x20;         </span>

&#x20;       )}

&#x20;     </label>

&#x20;   );

&#x20; }

);



Checkbox.displayName = "Checkbox";



src/components/ui/Switch.tsx

"use client";

import { useState } from "react";



interface SwitchProps {

&#x20; checked?: boolean;

&#x20; onCheckedChange?: (checked: boolean) => void;

&#x20; label?: string;

&#x20; disabled?: boolean;

}



export function Switch({ checked = false, onCheckedChange, label, disabled }: SwitchProps) {

&#x20; const \[isChecked, setIsChecked] = useState(checked);



&#x20; const handleToggle = () => {

&#x20;   if (disabled) return;

&#x20;   const newValue = !isChecked;

&#x20;   setIsChecked(newValue);

&#x20;   onCheckedChange?.(newValue);

&#x20; };



&#x20; return (

&#x20;   <label className={`flex items-center gap-3 cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>

&#x20;     <div

&#x20;       onClick={handleToggle}

&#x20;       className={`

&#x20;         relative w-14 h-7 rounded-full transition-all duration-300

&#x20;         ${isChecked ? "bg-\[#7C3AED]" : "bg-\[#374151]"}

&#x20;       `}

&#x20;     >

&#x20;       <div

&#x20;         className={`

&#x20;           absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300

&#x20;           ${isChecked ? "translate-x-8" : "translate-x-1"}

&#x20;         `}

&#x20;       />

&#x20;     </div>

&#x20;     {label \&\& <span className="text-\[#E5E7EB]">{label}</span>}

&#x20;   </label>

&#x20; );

}



src/components/ui/Slider.tsx

"use client";

import { useState } from "react";



interface SliderProps {

&#x20; min?: number;

&#x20; max?: number;

&#x20; step?: number;

&#x20; value?: number;

&#x20; onChange?: (value: number) => void;

&#x20; label?: string;

}



export function Slider({ min = 0, max = 100, step = 1, value = 50, onChange, label }: SliderProps) {

&#x20; const \[currentValue, setCurrentValue] = useState(value);



&#x20; const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

&#x20;   const newValue = Number(e.target.value);

&#x20;   setCurrentValue(newValue);

&#x20;   onChange?.(newValue);

&#x20; };



&#x20; return (

&#x20;   <div className="w-full">

&#x20;     {label \&\& (

&#x20;       <div className="flex justify-between text-sm mb-2">

&#x20;         <span className="text-\[#9CA3AF]">{label}</span>

&#x20;         <span className="text-\[#E5E7EB] font-medium">{currentValue}</span>

&#x20;       </div>

&#x20;     )}

&#x20;     <input

&#x20;       type="range"

&#x20;       min={min}

&#x20;       max={max}

&#x20;       step={step}

&#x20;       value={currentValue}

&#x20;       onChange={handleChange}

&#x20;       className="w-full accent-\[#7C3AED] bg-\[#374151] h-2 rounded-full cursor-pointer"

&#x20;     />

&#x20;   </div>

&#x20; );

}



src/components/ui/Select.tsx

"use client";

import { SelectHTMLAttributes, forwardRef } from "react";



interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {

&#x20; label?: string;

&#x20; error?: string;

&#x20; options: { value: string; label: string }\[];

}



export const Select = forwardRef<HTMLSelectElement, SelectProps>(

&#x20; ({ label, error, options, className, ...props }, ref) => {

&#x20;   return (

&#x20;     <div className="w-full">

&#x20;       {label \&\& (

&#x20;         <label className="block text-sm font-medium text-\[#9CA3AF] mb-1.5 tracking-wide">

&#x20;           {label}

&#x20;         </label>

&#x20;       )}

&#x20;       <select

&#x20;         ref={ref}

&#x20;         className={`

&#x20;           w-full bg-\[#111827] border border-\[#374151] rounded-2xl px-5 py-3.5 

&#x20;           text-\[#E5E7EB] focus:outline-none focus:border-\[#7C3AED] 

&#x20;           focus:ring-2 focus:ring-\[#7C3AED]/30 transition-all

&#x20;           ${error ? "border-\[#DC2626]" : ""}

&#x20;           ${className}

&#x20;         `}

&#x20;         {...props}

&#x20;       >

&#x20;         {options.map((opt) => (

&#x20;           <option key={opt.value} value={opt.value}>

&#x20;             {opt.label}

&#x20;           </option>

&#x20;         ))}

&#x20;       </select>

&#x20;       {error \&\& <p className="mt-1 text-sm text-\[#DC2626]">{error}</p>}

&#x20;     </div>

&#x20;   );

&#x20; }

);



Select.displayName = "Select";



src/components/ui/Autocomplete.tsx

"use client";

import { useState, useRef, useEffect } from "react";



interface AutocompleteProps {

&#x20; options: string\[];

&#x20; value: string;

&#x20; onChange: (value: string) => void;

&#x20; label?: string;

&#x20; placeholder?: string;

}



export function Autocomplete({ options, value, onChange, label, placeholder }: AutocompleteProps) {

&#x20; const \[open, setOpen] = useState(false);

&#x20; const \[filtered, setFiltered] = useState(options);

&#x20; const ref = useRef<HTMLDivElement>(null);



&#x20; useEffect(() => {

&#x20;   const handleClickOutside = (e: MouseEvent) => {

&#x20;     if (ref.current \&\& !ref.current.contains(e.target as Node)) setOpen(false);

&#x20;   };

&#x20;   document.addEventListener("mousedown", handleClickOutside);

&#x20;   return () => document.removeEventListener("mousedown", handleClickOutside);

&#x20; }, \[]);



&#x20; const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {

&#x20;   const input = e.target.value;

&#x20;   onChange(input);

&#x20;   setFiltered(options.filter((opt) => opt.toLowerCase().includes(input.toLowerCase())));

&#x20;   setOpen(true);

&#x20; };



&#x20; return (

&#x20;   <div className="relative" ref={ref}>

&#x20;     {label \&\& <label className="block text-sm font-medium text-\[#9CA3AF] mb-1.5">{label}</label>}

&#x20;     <input

&#x20;       type="text"

&#x20;       value={value}

&#x20;       onChange={handleInput}

&#x20;       onFocus={() => setOpen(true)}

&#x20;       placeholder={placeholder}

&#x20;       className="w-full bg-\[#111827] border border-\[#374151] rounded-2xl px-5 py-3.5 text-\[#E5E7EB] focus:border-\[#7C3AED] focus:ring-2 focus:ring-\[#7C3AED]/30"

&#x20;     />



&#x20;     {open \&\& filtered.length > 0 \&\& (

&#x20;       <div className="absolute z-50 w-full mt-2 bg-\[#111827] border border-\[#374151] rounded-2xl py-2 shadow-2xl max-h-60 overflow-auto">

&#x20;         {filtered.map((option) => (

&#x20;           <div

&#x20;             key={option}

&#x20;             onClick={() => {

&#x20;               onChange(option);

&#x20;               setOpen(false);

&#x20;             }}

&#x20;             className="px-5 py-3 hover:bg-\[#1F2937] cursor-pointer text-\[#E5E7EB]"

&#x20;           >

&#x20;             {option}

&#x20;           </div>

&#x20;         ))}

&#x20;       </div>

&#x20;     )}

&#x20;   </div>

&#x20; );

}



src/components/ui/index.ts

export \* from "./Button";

export \* from "./Input";

export \* from "./Textarea";

export \* from "./Checkbox";

export \* from "./Switch";

export \* from "./Slider";

export \* from "./Select";

export \* from "./Autocomplete";

export { IconButton } from "./Button";



src/components/ui/Typography.tsx

import { HTMLAttributes, ReactNode } from "react";



interface TypographyProps extends HTMLAttributes<HTMLParagraphElement> {

&#x20; variant?: "primary" | "secondary" | "muted";

&#x20; size?: "sm" | "base" | "lg" | "xl";

}



export function Typography({

&#x20; variant = "primary",

&#x20; size = "base",

&#x20; className,

&#x20; children,

&#x20; ...props

}: TypographyProps) {

&#x20; const styles = {

&#x20;   primary: "text-\[#E5E7EB]",

&#x20;   secondary: "text-\[#9CA3AF]",

&#x20;   muted: "text-\[#6B7280]",

&#x20; };



&#x20; const sizeStyles = {

&#x20;   sm: "text-sm",

&#x20;   base: "text-base",

&#x20;   lg: "text-lg",

&#x20;   xl: "text-xl",

&#x20; };



&#x20; return (

&#x20;   <p

&#x20;     className={`${styles\[variant]} ${sizeStyles\[size]} leading-relaxed ${className || ""}`}

&#x20;     {...props}

&#x20;   >

&#x20;     {children}

&#x20;   </p>

&#x20; );

}



src/components/ui/Heading.tsx

import { HTMLAttributes, ReactNode } from "react";



interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {

&#x20; level?: 1 | 2 | 3 | 4;

&#x20; glow?: boolean;

}



export function Heading({

&#x20; level = 2,

&#x20; glow = false,

&#x20; className,

&#x20; children,

&#x20; ...props

}: HeadingProps) {

&#x20; const baseClasses = "font-bold tracking-wide text-\[#E5E7EB]";



&#x20; const levelClasses = {

&#x20;   1: "text-5xl md:text-6xl",

&#x20;   2: "text-4xl md:text-5xl",

&#x20;   3: "text-3xl md:text-4xl",

&#x20;   4: "text-2xl md:text-3xl",

&#x20; };



&#x20; const glowClass = glow

&#x20;   ? "drop-shadow-\[0\_0\_15px\_rgb(124,58,237)]"

&#x20;   : "";



&#x20; const Component = `h${level}` as keyof JSX.IntrinsicElements;



&#x20; return (

&#x20;   <Component

&#x20;     className={`${baseClasses} ${levelClasses\[level]} ${glowClass} ${className || ""}`}

&#x20;     {...props}

&#x20;   >

&#x20;     {children}

&#x20;   </Component>

&#x20; );

}



import { AnchorHTMLAttributes } from "react";



interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {

&#x20; variant?: "primary" | "secondary";

&#x20; glow?: boolean;

}



export function Link({

&#x20; variant = "primary",

&#x20; glow = false,

&#x20; className,

&#x20; children,

&#x20; ...props

}: LinkProps) {

&#x20; const base = "transition-all duration-200 hover:underline";



&#x20; const variants = {

&#x20;   primary: "text-\[#7C3AED] hover:text-\[#A78BFA]",

&#x20;   secondary: "text-\[#9CA3AF] hover:text-\[#E5E7EB]",

&#x20; };



&#x20; const glowClass = glow ? "hover:drop-shadow-\[0\_0\_8px\_rgb(124,58,237)]" : "";



&#x20; return (

&#x20;   <a

&#x20;     className={`${base} ${variants\[variant]} ${glowClass} ${className || ""}`}

&#x20;     {...props}

&#x20;   >

&#x20;     {children}

&#x20;   </a>

&#x20; );

}



src/components/ui/Badge.tsx

import { Role } from "@/shared/types/game";



interface BadgeProps {

&#x20; role?: Role;

&#x20; variant?: "default" | "alive" | "dead" | "active" | "warning";

&#x20; children: React.ReactNode;

&#x20; className?: string;

}



const roleColors: Record<Role, string> = {

&#x20; WEREWOLF: "bg-\[#991B1B] text-white border-\[#EF4444]",

&#x20; SEER: "bg-\[#1E3A8A] text-white border-\[#60A5FA]",

&#x20; WITCH: "bg-\[#6B21A8] text-white border-\[#C084FC]",

&#x20; VILLAGER: "bg-\[#166534] text-white border-\[#4ADE80]",

&#x20; GUARD: "bg-\[#1E40AF] text-white border-\[#93C5FD]",

&#x20; HUNTER: "bg-\[#854D0E] text-white border-\[#FBBF24]",

};



export function Badge({ role, variant = "default", children, className = "" }: BadgeProps) {

&#x20; let baseClasses = "inline-flex items-center px-4 py-1 text-xs font-bold uppercase tracking-widest rounded-2xl border";



&#x20; if (role) {

&#x20;   baseClasses += ` ${roleColors\[role]}`;

&#x20; } else {

&#x20;   switch (variant) {

&#x20;     case "alive":

&#x20;       baseClasses += " bg-\[#16A34A]/10 text-\[#4ADE80] border-\[#4ADE80]/50";

&#x20;       break;

&#x20;     case "dead":

&#x20;       baseClasses += " bg-\[#DC2626]/10 text-\[#F87171] border-\[#F87171]/50 grayscale";

&#x20;       break;

&#x20;     case "active":

&#x20;       baseClasses += " bg-\[#7C3AED]/10 text-\[#C4B5FD] border-\[#C4B5FD]/50 animate-pulse shadow-purple-500/30";

&#x20;       break;

&#x20;     case "warning":

&#x20;       baseClasses += " bg-\[#F59E0B]/10 text-\[#FCD34D] border-\[#FCD34D]/50";

&#x20;       break;

&#x20;     default:

&#x20;       baseClasses += " bg-\[#374151] text-\[#D1D5DB] border-\[#4B5563]";

&#x20;   }

&#x20; }



&#x20; return <span className={`${baseClasses} ${className}`}>{children}</span>;

}



src/components/ui/Tag.tsx

interface TagProps {

&#x20; children: React.ReactNode;

&#x20; color?: "purple" | "red" | "green" | "amber";

}



export function Tag({ children, color = "purple" }: TagProps) {

&#x20; const colors = {

&#x20;   purple: "bg-\[#7C3AED]/10 text-\[#C4B5FD] border border-\[#7C3AED]/30",

&#x20;   red: "bg-\[#DC2626]/10 text-\[#FCA5A5] border border-\[#DC2626]/30",

&#x20;   green: "bg-\[#16A34A]/10 text-\[#86EFAC] border border-\[#16A34A]/30",

&#x20;   amber: "bg-\[#F59E0B]/10 text-\[#FDE68C] border border-\[#F59E0B]/30",

&#x20; };



&#x20; return (

&#x20;   <span

&#x20;     className={`inline-block px-3 py-1 text-xs font-medium tracking-wider rounded-xl ${colors\[color]}`}

&#x20;   >

&#x20;     {children}

&#x20;   </span>

&#x20; );

}



src/components/ui/Avatar.tsx

import { Role } from "@/shared/types/game";



interface AvatarProps {

&#x20; name: string;

&#x20; role?: Role;

&#x20; isDead?: boolean;

&#x20; isActive?: boolean;

&#x20; size?: "sm" | "md" | "lg" | "xl";

&#x20; showRoleIcon?: boolean;

}



const sizeMap = {

&#x20; sm: "w-10 h-10 text-xl",

&#x20; md: "w-14 h-14 text-3xl",

&#x20; lg: "w-20 h-20 text-5xl",

&#x20; xl: "w-28 h-28 text-7xl",

};



export function Avatar({

&#x20; name,

&#x20; role,

&#x20; isDead = false,

&#x20; isActive = false,

&#x20; size = "md",

&#x20; showRoleIcon = false,

}: AvatarProps) {

&#x20; const initial = name.charAt(0).toUpperCase();



&#x20; return (

&#x20;   <div className="relative inline-block">

&#x20;     <div

&#x20;       className={`

&#x20;         ${sizeMap\[size]} rounded-2xl flex items-center justify-center 

&#x20;         bg-\[#1F2937] border-2 transition-all duration-200 overflow-hidden

&#x20;         ${isDead 

&#x20;           ? "grayscale opacity-60 border-\[#4B5563]" 

&#x20;           : "border-\[#7C3AED]/40 hover:border-\[#A78BFA]"

&#x20;         }

&#x20;         ${isActive ? "ring-4 ring-\[#7C3AED]/60 shadow-\[0\_0\_25px\_-5px] shadow-\[#7C3AED]" : ""}

&#x20;       `}

&#x20;     >

&#x20;       <span className="font-bold text-\[#E5E7EB] drop-shadow-sm">{initial}</span>

&#x20;     </div>



&#x20;     {/\* Role Icon Overlay \*/}

&#x20;     {showRoleIcon \&\& role \&\& (

&#x20;       <div className="absolute -bottom-1 -right-1 bg-\[#111827] rounded-xl p-1 border border-\[#374151] shadow-lg">

&#x20;         <RoleIcon role={role} />

&#x20;       </div>

&#x20;     )}



&#x20;     {/\* Dead Overlay \*/}

&#x20;     {isDead \&\& (

&#x20;       <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">

&#x20;         <span className="text-\[#DC2626] text-2xl">☠️</span>

&#x20;       </div>

&#x20;     )}

&#x20;   </div>

&#x20; );

}



// Simple Role Icon Helper

function RoleIcon({ role }: { role: Role }) {

&#x20; const emojis: Record<Role, string> = {

&#x20;   WEREWOLF: "🐺",

&#x20;   SEER: "🔮",

&#x20;   WITCH: "🧙",

&#x20;   VILLAGER: "👤",

&#x20;   GUARD: "🛡️",

&#x20;   HUNTER: "🏹",

&#x20; };

&#x20; return <span className="text-xl">{emojis\[role]}</span>;

}



src/components/ui/Icon.tsx

import { ReactNode } from "react";



interface IconProps {

&#x20; children: ReactNode;

&#x20; size?: "sm" | "md" | "lg";

&#x20; glow?: boolean;

&#x20; color?: "purple" | "red" | "white";

}



export function Icon({ children, size = "md", glow = false, color = "white" }: IconProps) {

&#x20; const sizeClasses = {

&#x20;   sm: "text-xl",

&#x20;   md: "text-3xl",

&#x20;   lg: "text-5xl",

&#x20; };



&#x20; const colorClasses = {

&#x20;   purple: "text-\[#7C3AED]",

&#x20;   red: "text-\[#DC2626]",

&#x20;   white: "text-\[#E5E7EB]",

&#x20; };



&#x20; const glowClass = glow ? "drop-shadow-\[0\_0\_12px\_currentColor]" : "";



&#x20; return (

&#x20;   <span className={`${sizeClasses\[size]} ${colorClasses\[color]} ${glowClass} transition-all`}>

&#x20;     {children}

&#x20;   </span>

&#x20; );

}



src/components/ui/index.ts

export \* from "./Typography";

export \* from "./Heading";

export \* from "./Link";

export \* from "./Badge";

export \* from "./Tag";

export \* from "./Avatar";

export \* from "./Icon";



src/components/ui/Modal.tsx

"use client";

import { ReactNode } from "react";

import { motion, AnimatePresence } from "framer-motion";



interface ModalProps {

&#x20; isOpen: boolean;

&#x20; onClose: () => void;

&#x20; title?: string;

&#x20; children: ReactNode;

&#x20; size?: "sm" | "md" | "lg";

}



export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {

&#x20; const sizeClasses = {

&#x20;   sm: "max-w-md",

&#x20;   md: "max-w-lg",

&#x20;   lg: "max-w-2xl",

&#x20; };



&#x20; return (

&#x20;   <AnimatePresence>

&#x20;     {isOpen \&\& (

&#x20;       <>

&#x20;         {/\* Backdrop \*/}

&#x20;         <motion.div

&#x20;           initial={{ opacity: 0 }}

&#x20;           animate={{ opacity: 1 }}

&#x20;           exit={{ opacity: 0 }}

&#x20;           onClick={onClose}

&#x20;           className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl"

&#x20;         />



&#x20;         {/\* Modal Content \*/}

&#x20;         <div className="fixed inset-0 z-50 flex items-center justify-center p-6">

&#x20;           <motion.div

&#x20;             initial={{ opacity: 0, scale: 0.9, y: 20 }}

&#x20;             animate={{ opacity: 1, scale: 1, y: 0 }}

&#x20;             exit={{ opacity: 0, scale: 0.95, y: 10 }}

&#x20;             transition={{ type: "spring", damping: 25, stiffness: 300 }}

&#x20;             className={`

&#x20;               ${sizeClasses\[size]} w-full bg-\[#111827] 

&#x20;               border border-\[#7C3AED]/30 rounded-3xl shadow-2xl 

&#x20;               overflow-hidden

&#x20;             `}

&#x20;             onClick={(e) => e.stopPropagation()}

&#x20;           >

&#x20;             {/\* Header \*/}

&#x20;             {(title || onClose) \&\& (

&#x20;               <div className="flex items-center justify-between border-b border-white/10 px-8 py-5">

&#x20;                 {title \&\& (

&#x20;                   <h2 className="text-2xl font-bold text-\[#E5E7EB] tracking-wide">

&#x20;                     {title}

&#x20;                   </h2>

&#x20;                 )}

&#x20;                 <button

&#x20;                   onClick={onClose}

&#x20;                   className="text-\[#9CA3AF] hover:text-white transition-colors text-3xl leading-none"

&#x20;                 >

&#x20;                   ×

&#x20;                 </button>

&#x20;               </div>

&#x20;             )}



&#x20;             {/\* Body \*/}

&#x20;             <div className="p-8">{children}</div>

&#x20;           </motion.div>

&#x20;         </div>

&#x20;       </>

&#x20;     )}

&#x20;   </AnimatePresence>

&#x20; );

}



src/components/ui/Drawer.tsx

"use client";

import { ReactNode } from "react";

import { motion, AnimatePresence } from "framer-motion";



interface DrawerProps {

&#x20; isOpen: boolean;

&#x20; onClose: () => void;

&#x20; title?: string;

&#x20; side?: "left" | "right";

&#x20; children: ReactNode;

}



export function Drawer({ isOpen, onClose, title, side = "right", children }: DrawerProps) {

&#x20; return (

&#x20;   <AnimatePresence>

&#x20;     {isOpen \&\& (

&#x20;       <>

&#x20;         {/\* Backdrop \*/}

&#x20;         <motion.div

&#x20;           initial={{ opacity: 0 }}

&#x20;           animate={{ opacity: 1 }}

&#x20;           exit={{ opacity: 0 }}

&#x20;           onClick={onClose}

&#x20;           className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"

&#x20;         />



&#x20;         {/\* Drawer \*/}

&#x20;         <motion.div

&#x20;           initial={{ x: side === "right" ? "100%" : "-100%" }}

&#x20;           animate={{ x: 0 }}

&#x20;           exit={{ x: side === "right" ? "100%" : "-100%" }}

&#x20;           transition={{ type: "spring", damping: 30, stiffness: 300 }}

&#x20;           className={`

&#x20;             fixed top-0 bottom-0 z-50 w-full max-w-md 

&#x20;             bg-\[#111827] border-l border-\[#7C3AED]/30 shadow-2xl

&#x20;             ${side === "right" ? "right-0" : "left-0"}

&#x20;           `}

&#x20;         >

&#x20;           {/\* Header \*/}

&#x20;           <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">

&#x20;             {title \&\& (

&#x20;               <h3 className="text-xl font-bold tracking-wide text-\[#E5E7EB]">

&#x20;                 {title}

&#x20;               </h3>

&#x20;             )}

&#x20;             <button

&#x20;               onClick={onClose}

&#x20;               className="text-3xl text-\[#9CA3AF] hover:text-white transition-colors"

&#x20;             >

&#x20;               ×

&#x20;             </button>

&#x20;           </div>



&#x20;           {/\* Content \*/}

&#x20;           <div className="p-6 overflow-y-auto h-\[calc(100%-73px)]">

&#x20;             {children}

&#x20;           </div>

&#x20;         </motion.div>

&#x20;       </>

&#x20;     )}

&#x20;   </AnimatePresence>

&#x20; );

}



src/components/ui/Popover.tsx

"use client";

import { ReactNode, useState, useRef, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";



interface PopoverProps {

&#x20; trigger: ReactNode;

&#x20; children: ReactNode;

&#x20; title?: string;

}



export function Popover({ trigger, children, title }: PopoverProps) {

&#x20; const \[isOpen, setIsOpen] = useState(false);

&#x20; const popoverRef = useRef<HTMLDivElement>(null);



&#x20; useEffect(() => {

&#x20;   const handleClickOutside = (event: MouseEvent) => {

&#x20;     if (popoverRef.current \&\& !popoverRef.current.contains(event.target as Node)) {

&#x20;       setIsOpen(false);

&#x20;     }

&#x20;   };



&#x20;   document.addEventListener("mousedown", handleClickOutside);

&#x20;   return () => document.removeEventListener("mousedown", handleClickOutside);

&#x20; }, \[]);



&#x20; return (

&#x20;   <div className="relative inline-block" ref={popoverRef}>

&#x20;     <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">

&#x20;       {trigger}

&#x20;     </div>



&#x20;     <AnimatePresence>

&#x20;       {isOpen \&\& (

&#x20;         <motion.div

&#x20;           initial={{ opacity: 0, scale: 0.95, y: -10 }}

&#x20;           animate={{ opacity: 1, scale: 1, y: 0 }}

&#x20;           exit={{ opacity: 0, scale: 0.95, y: -10 }}

&#x20;           transition={{ duration: 0.15 }}

&#x20;           className="absolute right-0 mt-3 z-50 w-80"

&#x20;         >

&#x20;           <div

&#x20;             className="

&#x20;               bg-\[#111827] border border-\[#7C3AED]/40 rounded-3xl 

&#x20;               shadow-2xl shadow-purple-950/50 p-6

&#x20;             "

&#x20;           >

&#x20;             {title \&\& (

&#x20;               <div className="font-bold text-lg text-\[#E5E7EB] mb-4 tracking-wide border-b border-white/10 pb-4">

&#x20;                 {title}

&#x20;               </div>

&#x20;             )}

&#x20;             {children}

&#x20;           </div>

&#x20;         </motion.div>

&#x20;       )}

&#x20;     </AnimatePresence>

&#x20;   </div>

&#x20; );

}



src/components/ui/Tooltip.tsx

"use client";

import { ReactNode, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";



interface TooltipProps {

&#x20; children: ReactNode;

&#x20; content: string | ReactNode;

&#x20; position?: "top" | "bottom" | "left" | "right";

}



export function Tooltip({ children, content, position = "top" }: TooltipProps) {

&#x20; const \[isVisible, setIsVisible] = useState(false);



&#x20; const positionClasses = {

&#x20;   top: "bottom-full left-1/2 -translate-x-1/2 mb-2",

&#x20;   bottom: "top-full left-1/2 -translate-x-1/2 mt-2",

&#x20;   left: "right-full top-1/2 -translate-y-1/2 mr-2",

&#x20;   right: "left-full top-1/2 -translate-y-1/2 ml-2",

&#x20; };



&#x20; return (

&#x20;   <div

&#x20;     className="relative inline-block"

&#x20;     onMouseEnter={() => setIsVisible(true)}

&#x20;     onMouseLeave={() => setIsVisible(false)}

&#x20;   >

&#x20;     {children}



&#x20;     <AnimatePresence>

&#x20;       {isVisible \&\& (

&#x20;         <motion.div

&#x20;           initial={{ opacity: 0, scale: 0.8 }}

&#x20;           animate={{ opacity: 1, scale: 1 }}

&#x20;           exit={{ opacity: 0, scale: 0.8 }}

&#x20;           className={`absolute z-50 pointer-events-none ${positionClasses\[position]}`}

&#x20;         >

&#x20;           <div

&#x20;             className="

&#x20;               bg-\[#111827] text-\[#E5E7EB] text-sm px-4 py-2 

&#x20;               rounded-2xl border border-\[#7C3AED]/30 

&#x20;               shadow-xl whitespace-nowrap

&#x20;             "

&#x20;           >

&#x20;             {content}

&#x20;           </div>

&#x20;         </motion.div>

&#x20;       )}

&#x20;     </AnimatePresence>

&#x20;   </div>

&#x20; );

}



src/components/ui/index.ts

export \* from "./Modal";

export \* from "./Drawer";

export \* from "./Popover";

export \* from "./Tooltip";



src/components/ui/Spinner.tsx

"use client";

import { HTMLAttributes } from "react";



interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {

&#x20; size?: "sm" | "md" | "lg";

&#x20; variant?: "purple" | "red" | "white";

}



export function Spinner({ size = "md", variant = "purple", className, ...props }: SpinnerProps) {

&#x20; const sizeClasses = {

&#x20;   sm: "w-6 h-6",

&#x20;   md: "w-10 h-10",

&#x20;   lg: "w-16 h-16",

&#x20; };



&#x20; const colorClasses = {

&#x20;   purple: "border-\[#7C3AED]",

&#x20;   red: "border-\[#DC2626]",

&#x20;   white: "border-\[#E5E7EB]",

&#x20; };



&#x20; return (

&#x20;   <div

&#x20;     className={`inline-block ${sizeClasses\[size]} ${className}`}

&#x20;     {...props}

&#x20;   >

&#x20;     <div

&#x20;       className={`

&#x20;         ${sizeClasses\[size]} border-4 border-transparent rounded-full 

&#x20;         animate-spin 

&#x20;         ${colorClasses\[variant]}

&#x20;         border-t-current

&#x20;         shadow-\[0\_0\_20px\_-2px] shadow-current

&#x20;       `}

&#x20;     />

&#x20;   </div>

&#x20; );

}



src/components/ui/Skeleton.tsx

interface SkeletonProps {

&#x20; className?: string;

&#x20; width?: string;

&#x20; height?: string;

}



export function Skeleton({ className, width = "100%", height = "1rem" }: SkeletonProps) {

&#x20; return (

&#x20;   <div

&#x20;     className={`

&#x20;       bg-\[#1F2937] rounded-2xl overflow-hidden relative

&#x20;       ${className}

&#x20;     `}

&#x20;     style={{ width, height }}

&#x20;   >

&#x20;     <div

&#x20;       className="absolute inset-0 bg-gradient-to-r from-transparent via-\[#7C3AED]/20 to-transparent animate-\[shimmer\_1.5s\_infinite]"

&#x20;       style={{

&#x20;         backgroundSize: "200% 100%",

&#x20;       }}

&#x20;     />

&#x20;   </div>

&#x20; );

}



src/components/ui/ProgressBar.tsx

"use client";

import { useEffect, useState } from "react";



interface ProgressBarProps {

&#x20; value: number; // 0 to 100

&#x20; label?: string;

&#x20; showPercentage?: boolean;

&#x20; urgentThreshold?: number; // when to switch to red glow (default 80)

}



export function ProgressBar({

&#x20; value,

&#x20; label,

&#x20; showPercentage = true,

&#x20; urgentThreshold = 80,

}: ProgressBarProps) {

&#x20; const isUrgent = value >= urgentThreshold;



&#x20; return (

&#x20;   <div className="w-full">

&#x20;     {label \&\& (

&#x20;       <div className="flex justify-between text-sm mb-2">

&#x20;         <span className="text-\[#9CA3AF] tracking-wide">{label}</span>

&#x20;         {showPercentage \&\& (

&#x20;           <span className={`font-mono ${isUrgent ? "text-\[#DC2626]" : "text-\[#7C3AED]"}`}>

&#x20;             {Math.round(value)}%

&#x20;           </span>

&#x20;         )}

&#x20;       </div>

&#x20;     )}



&#x20;     <div className="h-3 bg-\[#1F2937] rounded-2xl overflow-hidden border border-white/5 relative">

&#x20;       <div

&#x20;         className={`

&#x20;           h-full rounded-2xl transition-all duration-300 relative

&#x20;           ${isUrgent 

&#x20;             ? "bg-gradient-to-r from-\[#DC2626] to-\[#F87171] shadow-\[0\_0\_15px\_#DC2626]" 

&#x20;             : "bg-gradient-to-r from-\[#7C3AED] to-\[#A78BFA] shadow-\[0\_0\_15px\_#7C3AED]"

&#x20;           }

&#x20;         `}

&#x20;         style={{ width: `${value}%` }}

&#x20;       >

&#x20;         {/\* Subtle inner glow pulse \*/}

&#x20;         <div className="absolute inset-0 bg-white/20 animate-\[pulse\_2s\_infinite]" />

&#x20;       </div>

&#x20;     </div>

&#x20;   </div>

&#x20; );

}



src/components/ui/Toast.tsx

"use client";

import { useEffect, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";



export type ToastType = "success" | "error" | "warning" | "info";



interface ToastProps {

&#x20; message: string;

&#x20; type?: ToastType;

&#x20; duration?: number;

&#x20; onClose?: () => void;

}



const typeStyles = {

&#x20; success: {

&#x20;   bg: "bg-\[#16A34A]/10 border-\[#4ADE80]",

&#x20;   icon: "🌿",

&#x20;   glow: "shadow-green-500/30",

&#x20; },

&#x20; error: {

&#x20;   bg: "bg-\[#DC2626]/10 border-\[#F87171]",

&#x20;   icon: "☠️",

&#x20;   glow: "shadow-red-500/40",

&#x20; },

&#x20; warning: {

&#x20;   bg: "bg-\[#F59E0B]/10 border-\[#FCD34D]",

&#x20;   icon: "⚠️",

&#x20;   glow: "shadow-amber-500/30",

&#x20; },

&#x20; info: {

&#x20;   bg: "bg-\[#7C3AED]/10 border-\[#C4B5FD]",

&#x20;   icon: "🌕",

&#x20;   glow: "shadow-purple-500/40",

&#x20; },

};



export function Toast({ message, type = "info", duration = 4000, onClose }: ToastProps) {

&#x20; const \[visible, setVisible] = useState(true);

&#x20; const style = typeStyles\[type];



&#x20; useEffect(() => {

&#x20;   const timer = setTimeout(() => {

&#x20;     setVisible(false);

&#x20;     onClose?.();

&#x20;   }, duration);



&#x20;   return () => clearTimeout(timer);

&#x20; }, \[duration, onClose]);



&#x20; return (

&#x20;   <AnimatePresence>

&#x20;     {visible \&\& (

&#x20;       <motion.div

&#x20;         initial={{ opacity: 0, y: 30, scale: 0.95 }}

&#x20;         animate={{ opacity: 1, y: 0, scale: 1 }}

&#x20;         exit={{ opacity: 0, y: 20, scale: 0.95 }}

&#x20;         className={`

&#x20;           fixed bottom-6 right-6 z-\[100] min-w-\[300px] max-w-sm 

&#x20;           ${style.bg} border rounded-3xl p-5 shadow-2xl ${style.glow}

&#x20;         `}

&#x20;       >

&#x20;         <div className="flex gap-4 items-start">

&#x20;           <div className="text-3xl">{style.icon}</div>

&#x20;           <div className="flex-1">

&#x20;             <p className="text-\[#E5E7EB] leading-snug">{message}</p>

&#x20;           </div>

&#x20;           <button

&#x20;             onClick={() => setVisible(false)}

&#x20;             className="text-\[#9CA3AF] hover:text-white text-xl leading-none"

&#x20;           >

&#x20;             ×

&#x20;           </button>

&#x20;         </div>

&#x20;       </motion.div>

&#x20;     )}

&#x20;   </AnimatePresence>

&#x20; );

}



src/components/ui/Alert.tsx

import { ReactNode } from "react";



type AlertVariant = "success" | "error" | "warning" | "info";



interface AlertProps {

&#x20; variant?: AlertVariant;

&#x20; title?: string;

&#x20; children: ReactNode;

&#x20; onClose?: () => void;

}



const variantStyles = {

&#x20; success: {

&#x20;   border: "border-\[#16A34A]/50",

&#x20;   bg: "bg-\[#16A34A]/5",

&#x20;   icon: "🌿",

&#x20;   text: "text-\[#4ADE80]",

&#x20; },

&#x20; error: {

&#x20;   border: "border-\[#DC2626]/50",

&#x20;   bg: "bg-\[#DC2626]/5",

&#x20;   icon: "☠️",

&#x20;   text: "text-\[#F87171]",

&#x20; },

&#x20; warning: {

&#x20;   border: "border-\[#F59E0B]/50",

&#x20;   bg: "bg-\[#F59E0B]/5",

&#x20;   icon: "⚠️",

&#x20;   text: "text-\[#FCD34D]",

&#x20; },

&#x20; info: {

&#x20;   border: "border-\[#7C3AED]/50",

&#x20;   bg: "bg-\[#7C3AED]/5",

&#x20;   icon: "🌕",

&#x20;   text: "text-\[#C4B5FD]",

&#x20; },

};



export function Alert({ variant = "info", title, children, onClose }: AlertProps) {

&#x20; const style = variantStyles\[variant];



&#x20; return (

&#x20;   <div

&#x20;     className={`

&#x20;       border rounded-3xl p-6 ${style.bg} ${style.border}

&#x20;       shadow-lg relative overflow-hidden

&#x20;     `}

&#x20;   >

&#x20;     <div className="flex gap-4">

&#x20;       <div className={`text-4xl flex-shrink-0 ${style.text}`}>{style.icon}</div>



&#x20;       <div className="flex-1 min-w-0">

&#x20;         {title \&\& (

&#x20;           <h4 className={`font-bold tracking-wide text-lg mb-1 ${style.text}`}>

&#x20;             {title}

&#x20;           </h4>

&#x20;         )}

&#x20;         <div className="text-\[#E5E7EB]/90 leading-relaxed">{children}</div>

&#x20;       </div>



&#x20;       {onClose \&\& (

&#x20;         <button

&#x20;           onClick={onClose}

&#x20;           className="text-\[#9CA3AF] hover:text-white text-2xl leading-none self-start"

&#x20;         >

&#x20;           ×

&#x20;         </button>

&#x20;       )}

&#x20;     </div>

&#x20;   </div>

&#x20; );

}



src/components/ui/index.ts

export \* from "./Spinner";

export \* from "./Skeleton";

export \* from "./ProgressBar";

export \* from "./Toast";

export \* from "./Alert";



// src/shared/types/game.ts

export enum Role {

&#x20; WEREWOLF = "WEREWOLF",

&#x20; SEER = "SEER",

&#x20; WITCH = "WITCH",

&#x20; VILLAGER = "VILLAGER",

&#x20; GUARD = "GUARD",

&#x20; HUNTER = "HUNTER",

}



export interface Player {

&#x20; id: string;

&#x20; name: string;

&#x20; role: Role;

&#x20; isAlive: boolean;

&#x20; isActive?: boolean;

&#x20; isRevealed?: boolean; // when role is shown

}



src/components/game/PlayerAvatar.tsx

import { Role } from "@/shared/types/game";



interface PlayerAvatarProps {

&#x20; name: string;

&#x20; role?: Role;

&#x20; isAlive?: boolean;

&#x20; isActive?: boolean;

&#x20; isRevealed?: boolean;

&#x20; size?: "sm" | "md" | "lg" | "xl";

}



const sizeClasses = {

&#x20; sm: "w-12 h-12 text-2xl",

&#x20; md: "w-16 h-16 text-4xl",

&#x20; lg: "w-24 h-24 text-6xl",

&#x20; xl: "w-32 h-32 text-7xl",

};



export function PlayerAvatar({

&#x20; name,

&#x20; role,

&#x20; isAlive = true,

&#x20; isActive = false,

&#x20; isRevealed = false,

&#x20; size = "md",

}: PlayerAvatarProps) {

&#x20; const initial = name\[0].toUpperCase();



&#x20; return (

&#x20;   <div className="relative">

&#x20;     <div

&#x20;       className={`

&#x20;         ${sizeClasses\[size]} flex items-center justify-center 

&#x20;         rounded-2xl bg-\[#1F2937] border-2 font-bold text-\[#E5E7EB]

&#x20;         transition-all duration-300 overflow-hidden

&#x20;         ${!isAlive 

&#x20;           ? "grayscale opacity-60 border-\[#4B5563]" 

&#x20;           : isActive 

&#x20;             ? "border-\[#7C3AED] shadow-\[0\_0\_30px\_-5px] shadow-\[#7C3AED]" 

&#x20;             : "border-\[#7C3AED]/30 hover:border-\[#A78BFA]"

&#x20;         }

&#x20;         ${isRevealed \&\& role === Role.WEREWOLF ? "shadow-\[0\_0\_25px\_-5px] shadow-\[#DC2626]" : ""}

&#x20;       `}

&#x20;     >

&#x20;       <span>{initial}</span>

&#x20;     </div>



&#x20;     {/\* Role Icon when revealed \*/}

&#x20;     {isRevealed \&\& role \&\& (

&#x20;       <div className="absolute -bottom-2 -right-2 bg-\[#111827] border border-\[#374151] rounded-xl p-1.5 shadow-lg">

&#x20;         <span className="text-2xl">

&#x20;           {role === Role.WEREWOLF ? "🐺" : 

&#x20;            role === Role.SEER ? "🔮" : 

&#x20;            role === Role.WITCH ? "🧙" : 

&#x20;            role === Role.GUARD ? "🛡️" : 

&#x20;            role === Role.HUNTER ? "🏹" : "👤"}

&#x20;         </span>

&#x20;       </div>

&#x20;     )}



&#x20;     {/\* Dead overlay \*/}

&#x20;     {!isAlive \&\& (

&#x20;       <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">

&#x20;         <span className="text-4xl">☠️</span>

&#x20;       </div>

&#x20;     )}

&#x20;   </div>

&#x20; );

}



src/components/game/PlayerName.tsx

interface PlayerNameProps {

&#x20; name: string;

&#x20; isAlive?: boolean;

&#x20; isActive?: boolean;

}



export function PlayerName({ name, isAlive = true, isActive = false }: PlayerNameProps) {

&#x20; return (

&#x20;   <p

&#x20;     className={`

&#x20;       font-semibold text-lg tracking-wide transition-all

&#x20;       ${!isAlive ? "line-through text-\[#6B7280] opacity-70" : "text-\[#E5E7EB]"}

&#x20;       ${isActive ? "text-\[#C4B5FD] drop-shadow-\[0\_0\_8px\_#7C3AED]" : ""}

&#x20;     `}

&#x20;   >

&#x20;     {name}

&#x20;   </p>

&#x20; );

}



src/components/game/PlayerStatus.tsx

import { Badge } from "@/components/ui/Badge";



interface PlayerStatusProps {

&#x20; isAlive: boolean;

&#x20; isActive?: boolean;

&#x20; isRevealed?: boolean;

&#x20; role?: string;

}



export function PlayerStatus({ isAlive, isActive, isRevealed, role }: PlayerStatusProps) {

&#x20; if (!isAlive) {

&#x20;   return <Badge variant="dead">DEAD</Badge>;

&#x20; }



&#x20; if (isActive) {

&#x20;   return <Badge variant="active">ACTIVE</Badge>;

&#x20; }



&#x20; if (isRevealed \&\& role) {

&#x20;   return <Badge role={role as any}>{role}</Badge>;

&#x20; }



&#x20; return null;

}



src/components/game/PlayerRole.tsx

import { Role } from "@/shared/types/game";



interface PlayerRoleProps {

&#x20; role: Role;

&#x20; isRevealed?: boolean;

}



const roleColors: Record<Role, string> = {

&#x20; WEREWOLF: "text-\[#EF4444] drop-shadow-\[0\_0\_6px\_#DC2626]",

&#x20; SEER: "text-\[#60A5FA]",

&#x20; WITCH: "text-\[#C084FC]",

&#x20; VILLAGER: "text-\[#4ADE80]",

&#x20; GUARD: "text-\[#93C5FD]",

&#x20; HUNTER: "text-\[#FBBF24]",

};



export function PlayerRole({ role, isRevealed = false }: PlayerRoleProps) {

&#x20; if (!isRevealed) return null;



&#x20; return (

&#x20;   <p className={`text-sm font-medium uppercase tracking-widest ${roleColors\[role]}`}>

&#x20;     {role.replace("\_", " ")}

&#x20;   </p>

&#x20; );

}



src/components/game/PlayerCard.tsx

import { Player } from "@/shared/types/game";

import { Card } from "@/components/ui/Card";

import { PlayerAvatar } from "./PlayerAvatar";

import { PlayerName } from "./PlayerName";

import { PlayerStatus } from "./PlayerStatus";

import { PlayerRole } from "./PlayerRole";



interface PlayerCardProps {

&#x20; player: Player;

&#x20; isSelf?: boolean;

&#x20; onClick?: (id: string) => void;

&#x20; showRole?: boolean;

}



export function PlayerCard({ player, isSelf = false, onClick, showRole = false }: PlayerCardProps) {

&#x20; const isRevealed = showRole || player.isRevealed || false;



&#x20; return (

&#x20;   <Card

&#x20;     glow={player.isActive}

&#x20;     onClick={() => onClick?.(player.id)}

&#x20;     className={`

&#x20;       cursor-pointer transition-all hover:scale-\[1.03] 

&#x20;       ${!player.isAlive ? "opacity-75" : ""}

&#x20;     `}

&#x20;   >

&#x20;     <div className="flex flex-col items-center gap-4 text-center">

&#x20;       <PlayerAvatar

&#x20;         name={player.name}

&#x20;         role={player.role}

&#x20;         isAlive={player.isAlive}

&#x20;         isActive={player.isActive}

&#x20;         isRevealed={isRevealed}

&#x20;         size="lg"

&#x20;       />



&#x20;       <div>

&#x20;         <PlayerName 

&#x20;           name={player.name} 

&#x20;           isAlive={player.isAlive} 

&#x20;           isActive={player.isActive} 

&#x20;         />

&#x20;         {isSelf \&\& <p className="text-xs text-\[#7C3AED] tracking-widest">YOU</p>}

&#x20;       </div>



&#x20;       <PlayerStatus 

&#x20;         isAlive={player.isAlive} 

&#x20;         isActive={player.isActive} 

&#x20;         isRevealed={isRevealed}

&#x20;         role={player.role}

&#x20;       />



&#x20;       <PlayerRole role={player.role} isRevealed={isRevealed} />

&#x20;     </div>

&#x20;   </Card>

&#x20; );

}



src/components/game/PlayerGrid.tsx

import { Player } from "@/shared/types/game";

import { PlayerCard } from "./PlayerCard";



interface PlayerGridProps {

&#x20; players: Player\[];

&#x20; currentPlayerId?: string;

&#x20; onPlayerClick?: (id: string) => void;

&#x20; showRoles?: boolean;

}



export function PlayerGrid({ 

&#x20; players, 

&#x20; currentPlayerId, 

&#x20; onPlayerClick, 

&#x20; showRoles = false 

}: PlayerGridProps) {

&#x20; return (

&#x20;   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">

&#x20;     {players.map((player) => (

&#x20;       <PlayerCard

&#x20;         key={player.id}

&#x20;         player={player}

&#x20;         isSelf={player.id === currentPlayerId}

&#x20;         onClick={onPlayerClick}

&#x20;         showRole={showRoles}

&#x20;       />

&#x20;     ))}

&#x20;   </div>

&#x20; );

}



src/components/game/PlayerList.tsx

import { Player } from "@/shared/types/game";

import { PlayerAvatar } from "./PlayerAvatar";

import { PlayerName } from "./PlayerName";

import { PlayerStatus } from "./PlayerStatus";



interface PlayerListProps {

&#x20; players: Player\[];

&#x20; currentPlayerId?: string;

&#x20; onPlayerClick?: (id: string) => void;

}



export function PlayerList({ players, currentPlayerId, onPlayerClick }: PlayerListProps) {

&#x20; return (

&#x20;   <div className="space-y-3">

&#x20;     {players.map((player) => (

&#x20;       <div

&#x20;         key={player.id}

&#x20;         onClick={() => onPlayerClick?.(player.id)}

&#x20;         className={`

&#x20;           flex items-center gap-4 p-4 bg-\[#111827] rounded-2xl border border-white/5 

&#x20;           hover:border-\[#7C3AED]/30 transition-all cursor-pointer

&#x20;           ${player.isActive ? "border-\[#7C3AED]" : ""}

&#x20;         `}

&#x20;       >

&#x20;         <PlayerAvatar 

&#x20;           name={player.name} 

&#x20;           isAlive={player.isAlive} 

&#x20;           isActive={player.isActive} 

&#x20;           size="md" 

&#x20;         />

&#x20;         <div className="flex-1">

&#x20;           <PlayerName 

&#x20;             name={player.name} 

&#x20;             isAlive={player.isAlive} 

&#x20;             isActive={player.isActive} 

&#x20;           />

&#x20;         </div>

&#x20;         <PlayerStatus isAlive={player.isAlive} isActive={player.isActive} />

&#x20;       </div>

&#x20;     ))}

&#x20;   </div>

&#x20; );

}



src/components/game/PlayerSeat.tsx

"use client";

import { Player } from "@/shared/types/game";

import { PlayerAvatar } from "./PlayerAvatar";

import { PlayerName } from "./PlayerName";



interface PlayerSeatProps {

&#x20; player: Player;

&#x20; angle: number; // 0 to 360

&#x20; radius?: number;

&#x20; isSelf?: boolean;

&#x20; onClick?: (id: string) => void;

}



export function PlayerSeat({ 

&#x20; player, 

&#x20; angle, 

&#x20; radius = 180, 

&#x20; isSelf = false, 

&#x20; onClick 

}: PlayerSeatProps) {

&#x20; const x = Math.cos((angle \* Math.PI) / 180) \* radius;

&#x20; const y = Math.sin((angle \* Math.PI) / 180) \* radius;



&#x20; return (

&#x20;   <div

&#x20;     className="absolute flex flex-col items-center cursor-pointer transition-transform hover:scale-110"

&#x20;     style={{

&#x20;       left: `calc(50% + ${x}px)`,

&#x20;       top: `calc(50% + ${y}px)`,

&#x20;       transform: "translate(-50%, -50%)",

&#x20;     }}

&#x20;     onClick={() => onClick?.(player.id)}

&#x20;   >

&#x20;     <PlayerAvatar

&#x20;       name={player.name}

&#x20;       isAlive={player.isAlive}

&#x20;       isActive={player.isActive}

&#x20;       size="lg"

&#x20;     />

&#x20;     <div className="mt-3 text-center">

&#x20;       <PlayerName 

&#x20;         name={player.name} 

&#x20;         isAlive={player.isAlive} 

&#x20;         isActive={player.isActive} 

&#x20;       />

&#x20;       {isSelf \&\& <p className="text-\[#7C3AED] text-xs tracking-widest">YOU</p>}

&#x20;     </div>

&#x20;   </div>

&#x20; );

}



src/components/game/RoleBadge.tsx

import { Role } from "@/shared/types/game";

import { Badge } from "@/components/ui/Badge";



const roleConfig = {

&#x20; \[Role.WEREWOLF]: {

&#x20;   color: "bg-\[#991B1B] text-white border-\[#EF4444]",

&#x20;   glow: "shadow-\[0\_0\_20px\_#DC2626]",

&#x20;   emoji: "🐺",

&#x20;   label: "WEREWOLF",

&#x20; },

&#x20; \[Role.SEER]: {

&#x20;   color: "bg-\[#1E3A8A] text-white border-\[#60A5FA]",

&#x20;   glow: "shadow-\[0\_0\_20px\_#3B82F6]",

&#x20;   emoji: "🔮",

&#x20;   label: "SEER",

&#x20; },

&#x20; \[Role.WITCH]: {

&#x20;   color: "bg-\[#6B21A8] text-white border-\[#C084FC]",

&#x20;   glow: "shadow-\[0\_0\_20px\_#A855F7]",

&#x20;   emoji: "🧙",

&#x20;   label: "WITCH",

&#x20; },

&#x20; \[Role.VILLAGER]: {

&#x20;   color: "bg-\[#166534] text-white border-\[#4ADE80]",

&#x20;   glow: "",

&#x20;   emoji: "👤",

&#x20;   label: "VILLAGER",

&#x20; },

&#x20; \[Role.GUARD]: {

&#x20;   color: "bg-\[#14532D] text-white border-\[#4ADE80]",

&#x20;   glow: "shadow-\[0\_0\_20px\_#16A34A]",

&#x20;   emoji: "🛡️",

&#x20;   label: "GUARD",

&#x20; },

&#x20; \[Role.HUNTER]: {

&#x20;   color: "bg-\[#854D0E] text-white border-\[#FBBF24]",

&#x20;   glow: "shadow-\[0\_0\_15px\_#F59E0B]",

&#x20;   emoji: "🏹",

&#x20;   label: "HUNTER",

&#x20; },

};



interface RoleBadgeProps {

&#x20; role: Role;

&#x20; size?: "sm" | "md" | "lg";

&#x20; showEmoji?: boolean;

}



export function RoleBadge({ role, size = "md", showEmoji = true }: RoleBadgeProps) {

&#x20; const config = roleConfig\[role];



&#x20; const sizeClasses = {

&#x20;   sm: "text-xs px-3 py-1",

&#x20;   md: "text-sm px-5 py-2",

&#x20;   lg: "text-base px-6 py-3",

&#x20; };



&#x20; return (

&#x20;   <div

&#x20;     className={`

&#x20;       inline-flex items-center gap-2 font-bold uppercase tracking-\[2px] rounded-2xl border

&#x20;       ${config.color} ${config.glow} ${sizeClasses\[size]}

&#x20;       transition-all duration-300

&#x20;     `}

&#x20;   >

&#x20;     {showEmoji \&\& <span className="text-xl">{config.emoji}</span>}

&#x20;     {config.label}

&#x20;   </div>

&#x20; );

}



src/components/game/RoleCard.tsx

import { Role } from "@/shared/types/game";

import { Card } from "@/components/ui/Card";

import { RoleBadge } from "./RoleBadge";



const roleVisuals = {

&#x20; \[Role.WEREWOLF]: {

&#x20;   bg: "from-\[#450A0A] to-\[#991B1B]",

&#x20;   accent: "#DC2626",

&#x20;   emoji: "🐺",

&#x20;   description: "You hunt under the full moon.",

&#x20; },

&#x20; \[Role.SEER]: {

&#x20;   bg: "from-\[#0C4A6E] to-\[#1E3A8A]",

&#x20;   accent: "#3B82F6",

&#x20;   emoji: "🔮",

&#x20;   description: "You see what others cannot.",

&#x20; },

&#x20; \[Role.WITCH]: {

&#x20;   bg: "from-\[#4C1D95] to-\[#6B21A8]",

&#x20;   accent: "#C084FC",

&#x20;   emoji: "🧙",

&#x20;   description: "Potions can save or doom.",

&#x20; },

&#x20; \[Role.VILLAGER]: {

&#x20;   bg: "from-\[#14532D] to-\[#166534]",

&#x20;   accent: "#4ADE80",

&#x20;   emoji: "👤",

&#x20;   description: "Find the monsters among you.",

&#x20; },

&#x20; \[Role.GUARD]: {

&#x20;   bg: "from-\[#052E16] to-\[#14532D]",

&#x20;   accent: "#16A34A",

&#x20;   emoji: "🛡️",

&#x20;   description: "Protect the innocent.",

&#x20; },

&#x20; \[Role.HUNTER]: {

&#x20;   bg: "from-\[#78350F] to-\[#854D0E]",

&#x20;   accent: "#F59E0B",

&#x20;   emoji: "🏹",

&#x20;   description: "Your final shot matters.",

&#x20; },

};



interface RoleCardProps {

&#x20; role: Role;

&#x20; isRevealed?: boolean;

&#x20; onClick?: () => void;

}



export function RoleCard({ role, isRevealed = true, onClick }: RoleCardProps) {

&#x20; const visual = roleVisuals\[role];



&#x20; return (

&#x20;   <Card

&#x20;     glow={isRevealed}

&#x20;     onClick={onClick}

&#x20;     className={`

&#x20;       group relative overflow-hidden cursor-pointer transition-all duration-500

&#x20;       hover:scale-\[1.02]

&#x20;     `}

&#x20;   >

&#x20;     <div

&#x20;       className={`absolute inset-0 bg-gradient-to-br ${visual.bg} opacity-80`}

&#x20;     />



&#x20;     <div className="relative p-8 flex flex-col items-center text-center min-h-\[280px]">

&#x20;       <div

&#x20;         className="text-8xl mb-6 transition-transform group-hover:scale-110"

&#x20;         style={{ filter: `drop-shadow(0 0 30px ${visual.accent})` }}

&#x20;       >

&#x20;         {visual.emoji}

&#x20;       </div>



&#x20;       <RoleBadge role={role} size="lg" />



&#x20;       <p className="mt-6 text-\[#E5E7EB]/90 text-lg leading-relaxed max-w-\[240px]">

&#x20;         {visual.description}

&#x20;       </p>



&#x20;       {isRevealed \&\& (

&#x20;         <div className="absolute top-4 right-4">

&#x20;           <div className="px-3 py-1 text-xs bg-black/40 rounded-full border border-white/20">

&#x20;             REVEALED

&#x20;           </div>

&#x20;         </div>

&#x20;       )}

&#x20;     </div>

&#x20;   </Card>

&#x20; );

}



src/components/game/RoleRevealModal.tsx

"use client";

import { ReactNode } from "react";

import { motion, AnimatePresence } from "framer-motion";

import { Role } from "@/shared/types/game";

import { RoleBadge } from "./RoleBadge";

import { Button } from "@/components/ui/Button";



interface RoleRevealModalProps {

&#x20; isOpen: boolean;

&#x20; onClose: () => void;

&#x20; role: Role;

&#x20; playerName: string;

}



const roleColors = {

&#x20; \[Role.WEREWOLF]: "#DC2626",

&#x20; \[Role.SEER]: "#3B82F6",

&#x20; \[Role.WITCH]: "#C084FC",

&#x20; \[Role.VILLAGER]: "#4ADE80",

&#x20; \[Role.GUARD]: "#16A34A",

&#x20; \[Role.HUNTER]: "#F59E0B",

};



export function RoleRevealModal({ isOpen, onClose, role, playerName }: RoleRevealModalProps) {

&#x20; const accentColor = roleColors\[role];



&#x20; return (

&#x20;   <AnimatePresence>

&#x20;     {isOpen \&\& (

&#x20;       <>

&#x20;         {/\* Dramatic Backdrop \*/}

&#x20;         <motion.div

&#x20;           initial={{ opacity: 0 }}

&#x20;           animate={{ opacity: 1 }}

&#x20;           exit={{ opacity: 0 }}

&#x20;           className="fixed inset-0 z-\[100] bg-black/90 backdrop-blur-3xl"

&#x20;         />



&#x20;         <div className="fixed inset-0 z-\[110] flex items-center justify-center p-6">

&#x20;           <motion.div

&#x20;             initial={{ opacity: 0, scale: 0.6, rotate: -8 }}

&#x20;             animate={{ opacity: 1, scale: 1, rotate: 0 }}

&#x20;             exit={{ opacity: 0, scale: 0.7, rotate: 8 }}

&#x20;             transition={{ 

&#x20;               type: "spring", 

&#x20;               damping: 20, 

&#x20;               stiffness: 180,

&#x20;               duration: 0.6 

&#x20;             }}

&#x20;             className="w-full max-w-md"

&#x20;           >

&#x20;             <div 

&#x20;               className="bg-\[#111827] border-2 rounded-3xl overflow-hidden shadow-2xl relative"

&#x20;               style={{ borderColor: accentColor }}

&#x20;             >

&#x20;               {/\* Glow Ring \*/}

&#x20;               <div 

&#x20;                 className="absolute -inset-px rounded-3xl pointer-events-none"

&#x20;                 style={{ 

&#x20;                   boxShadow: `0 0 60px 15px ${accentColor}40` 

&#x20;                 }}

&#x20;               />



&#x20;               <div className="p-10 text-center relative">

&#x20;                 {/\* Moon Icon \*/}

&#x20;                 <div className="mx-auto mb-8 text-7xl">🌕</div>



&#x20;                 <motion.div

&#x20;                   initial={{ y: 30, opacity: 0 }}

&#x20;                   animate={{ y: 0, opacity: 1 }}

&#x20;                   transition={{ delay: 0.3 }}

&#x20;                 >

&#x20;                   <p className="text-\[#9CA3AF] uppercase tracking-\[4px] text-sm mb-2">

&#x20;                     The Moon reveals your fate...

&#x20;                   </p>

&#x20;                   <h2 className="text-4xl font-bold text-white mb-8">

&#x20;                     {playerName}

&#x20;                   </h2>

&#x20;                 </motion.div>



&#x20;                 {/\* Role Badge with strong glow \*/}

&#x20;                 <motion.div

&#x20;                   initial={{ scale: 0.5, opacity: 0 }}

&#x20;                   animate={{ scale: 1, opacity: 1 }}

&#x20;                   transition={{ delay: 0.5, type: "spring" }}

&#x20;                   className="mb-10"

&#x20;                 >

&#x20;                   <RoleBadge role={role} size="lg" />

&#x20;                 </motion.div>



&#x20;                 <motion.p

&#x20;                   initial={{ opacity: 0 }}

&#x20;                   animate={{ opacity: 1 }}

&#x20;                   transition={{ delay: 0.7 }}

&#x20;                   className="text-\[#E5E7EB]/80 text-lg leading-relaxed mb-10"

&#x20;                 >

&#x20;                   You are <span className="font-bold" style={{ color: accentColor }}>{role}</span>.

&#x20;                 </motion.p>



&#x20;                 <Button 

&#x20;                   variant="primary" 

&#x20;                   size="lg"

&#x20;                   onClick={onClose}

&#x20;                   className="w-full"

&#x20;                 >

&#x20;                   Embrace Your Fate

&#x20;                 </Button>

&#x20;               </div>

&#x20;             </div>

&#x20;           </motion.div>

&#x20;         </div>

&#x20;       </>

&#x20;     )}

&#x20;   </AnimatePresence>

&#x20; );

}



src/components/game/RoleDescriptionPanel.tsx

import { Role } from "@/shared/types/game";

import { Card } from "@/components/ui/Card";

import { RoleBadge } from "./RoleBadge";



const roleDetails = {

&#x20; \[Role.WEREWOLF]: {

&#x20;   title: "Werewolf",

&#x20;   emoji: "🐺",

&#x20;   color: "#DC2626",

&#x20;   ability: "Kill one player each night",

&#x20;   goal: "Eliminate all villagers",

&#x20;   flavor: "The howl echoes through the night...",

&#x20; },

&#x20; \[Role.SEER]: {

&#x20;   title: "Seer",

&#x20;   emoji: "🔮",

&#x20;   color: "#3B82F6",

&#x20;   ability: "Learn one player's role each night",

&#x20;   goal: "Identify the werewolves",

&#x20;   flavor: "The truth is hidden in the moonlight.",

&#x20; },

&#x20; \[Role.WITCH]: {

&#x20;   title: "Witch",

&#x20;   emoji: "🧙",

&#x20;   color: "#C084FC",

&#x20;   ability: "Save or poison once per game",

&#x20;   goal: "Help the village survive",

&#x20;   flavor: "One potion can change destiny.",

&#x20; },

&#x20; \[Role.VILLAGER]: {

&#x20;   title: "Villager",

&#x20;   emoji: "👤",

&#x20;   color: "#4ADE80",

&#x20;   ability: "No special power",

&#x20;   goal: "Vote out the werewolves",

&#x20;   flavor: "Trust no one.",

&#x20; },

&#x20; \[Role.GUARD]: {

&#x20;   title: "Guard",

&#x20;   emoji: "🛡️",

&#x20;   color: "#16A34A",

&#x20;   ability: "Protect one player each night",

&#x20;   goal: "Shield the innocent",

&#x20;   flavor: "Your vigilance saves lives.",

&#x20; },

&#x20; \[Role.HUNTER]: {

&#x20;   title: "Hunter",

&#x20;   emoji: "🏹",

&#x20;   color: "#F59E0B",

&#x20;   ability: "Take one player with you when you die",

&#x20;   goal: "Revenge from beyond",

&#x20;   flavor: "Your arrow flies true even in death.",

&#x20; },

};



interface RoleDescriptionPanelProps {

&#x20; role: Role;

}



export function RoleDescriptionPanel({ role }: RoleDescriptionPanelProps) {

&#x20; const details = roleDetails\[role];



&#x20; return (

&#x20;   <Card className="max-w-lg">

&#x20;     <div className="flex items-center gap-6 mb-8">

&#x20;       <div className="text-7xl" style={{ filter: `drop-shadow(0 0 25px ${details.color})` }}>

&#x20;         {details.emoji}

&#x20;       </div>

&#x20;       <div>

&#x20;         <RoleBadge role={role} size="lg" />

&#x20;         <p className="mt-2 text-\[#9CA3AF]">{details.flavor}</p>

&#x20;       </div>

&#x20;     </div>



&#x20;     <div className="space-y-6 text-\[#E5E7EB]">

&#x20;       <div>

&#x20;         <div className="uppercase text-xs tracking-widest text-\[#9CA3AF] mb-1">ABILITY</div>

&#x20;         <p className="text-lg">{details.ability}</p>

&#x20;       </div>



&#x20;       <div>

&#x20;         <div className="uppercase text-xs tracking-widest text-\[#9CA3AF] mb-1">OBJECTIVE</div>

&#x20;         <p className="text-lg">{details.goal}</p>

&#x20;       </div>

&#x20;     </div>

&#x20;   </Card>

&#x20; );

}



src/components/game/PhaseBanner.tsx

"use client";

import { GamePhase } from "@/shared/types/game";

import { motion } from "framer-motion";



const phaseConfig = {

&#x20; \[GamePhase.NIGHT]: {

&#x20;   label: "NIGHT",

&#x20;   subtitle: "The wolves are hunting...",

&#x20;   color: "#7C3AED",

&#x20;   bg: "bg-\[#0B0F1A]",

&#x20;   glow: "shadow-purple-500/50",

&#x20; },

&#x20; \[GamePhase.DAY]: {

&#x20;   label: "DAY",

&#x20;   subtitle: "The village gathers...",

&#x20;   color: "#F59E0B",

&#x20;   bg: "bg-\[#1F2937]",

&#x20;   glow: "shadow-amber-500/40",

&#x20; },

&#x20; \[GamePhase.VOTING]: {

&#x20;   label: "VOTING",

&#x20;   subtitle: "Choose who to eliminate",

&#x20;   color: "#DC2626",

&#x20;   bg: "bg-\[#111827]",

&#x20;   glow: "shadow-red-500/50",

&#x20; },

&#x20; \[GamePhase.END]: {

&#x20;   label: "GAME OVER",

&#x20;   subtitle: "",

&#x20;   color: "#16A34A",

&#x20;   bg: "bg-\[#0B0F1A]",

&#x20;   glow: "shadow-green-500/40",

&#x20; },

};



interface PhaseBannerProps {

&#x20; phase: GamePhase;

&#x20; day: number;

}



export function PhaseBanner({ phase, day }: PhaseBannerProps) {

&#x20; const config = phaseConfig\[phase];



&#x20; return (

&#x20;   <motion.div

&#x20;     key={phase}

&#x20;     initial={{ opacity: 0, y: -30 }}

&#x20;     animate={{ opacity: 1, y: 0 }}

&#x20;     transition={{ duration: 0.6 }}

&#x20;     className={`w-full py-8 ${config.bg} border-b border-white/10`}

&#x20;   >

&#x20;     <div className="max-w-4xl mx-auto text-center">

&#x20;       <motion.div

&#x20;         initial={{ scale: 0.8 }}

&#x20;         animate={{ scale: 1 }}

&#x20;         transition={{ delay: 0.2 }}

&#x20;         className={`

&#x20;           inline-block px-12 py-4 rounded-3xl text-5xl font-black tracking-\[6px] uppercase

&#x20;           text-white shadow-2xl ${config.glow}

&#x20;         `}

&#x20;         style={{ backgroundColor: config.color }}

&#x20;       >

&#x20;         {config.label}

&#x20;       </motion.div>



&#x20;       <div className="mt-4 text-\[#9CA3AF] text-lg font-medium">

&#x20;         DAY {day}

&#x20;       </div>



&#x20;       {config.subtitle \&\& (

&#x20;         <p className="mt-2 text-\[#E5E7EB]/80 text-xl tracking-wide">

&#x20;           {config.subtitle}

&#x20;         </p>

&#x20;       )}

&#x20;     </div>

&#x20;   </motion.div>

&#x20; );

}



src/components/game/PhaseTransitionOverlay.tsx

"use client";

import { GamePhase } from "@/shared/types/game";

import { motion, AnimatePresence } from "framer-motion";



interface PhaseTransitionOverlayProps {

&#x20; fromPhase: GamePhase;

&#x20; toPhase: GamePhase;

&#x20; isVisible: boolean;

&#x20; onComplete?: () => void;

}



export function PhaseTransitionOverlay({

&#x20; fromPhase,

&#x20; toPhase,

&#x20; isVisible,

&#x20; onComplete,

}: PhaseTransitionOverlayProps) {

&#x20; return (

&#x20;   <AnimatePresence>

&#x20;     {isVisible \&\& (

&#x20;       <div className="fixed inset-0 z-\[200] pointer-events-none">

&#x20;         <motion.div

&#x20;           initial={{ opacity: 0 }}

&#x20;           animate={{ opacity: 1 }}

&#x20;           exit={{ opacity: 0 }}

&#x20;           className="absolute inset-0 bg-black/90 backdrop-blur-3xl"

&#x20;         />



&#x20;         <div className="absolute inset-0 flex items-center justify-center">

&#x20;           <motion.div

&#x20;             initial={{ opacity: 0, scale: 0.6, y: 40 }}

&#x20;             animate={{ 

&#x20;               opacity: 1, 

&#x20;               scale: 1, 

&#x20;               y: 0,

&#x20;               transition: { duration: 0.8, ease: "easeOut" }

&#x20;             }}

&#x20;             exit={{ 

&#x20;               opacity: 0, 

&#x20;               scale: 1.2, 

&#x20;               y: -60,

&#x20;               transition: { duration: 0.6 }

&#x20;             }}

&#x20;             onAnimationComplete={() => {

&#x20;               if (onComplete) setTimeout(onComplete, 800);

&#x20;             }}

&#x20;             className="text-center"

&#x20;           >

&#x20;             <div className="text-8xl mb-6">🌕</div>

&#x20;             

&#x20;             <div className="text-\[#E5E7EB] text-6xl font-black tracking-widest mb-4">

&#x20;               {toPhase}

&#x20;             </div>

&#x20;             

&#x20;             <div className="text-\[#9CA3AF] text-2xl tracking-\[4px] uppercase">

&#x20;               Transitioning from {fromPhase}

&#x20;             </div>

&#x20;           </motion.div>

&#x20;         </div>

&#x20;       </div>

&#x20;     )}

&#x20;   </AnimatePresence>

&#x20; );

}



src/components/game/NightOverlay.tsx

"use client";

import { motion } from "framer-motion";



export function NightOverlay() {

&#x20; return (

&#x20;   <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">

&#x20;     {/\* Deep blue night fog \*/}

&#x20;     <motion.div 

&#x20;       initial={{ opacity: 0 }}

&#x20;       animate={{ opacity: 0.75 }}

&#x20;       className="absolute inset-0 bg-gradient-to-b from-\[#0B0F1A]/90 via-\[#1E2937]/70 to-\[#0B0F1A]"

&#x20;     />



&#x20;     {/\* Subtle moving stars / particles \*/}

&#x20;     <div className="absolute inset-0 bg-\[radial-gradient(#E5E7EB\_0.8px,transparent\_1px)] bg-\[length:40px\_40px] opacity-10" />



&#x20;     {/\* Moon glow \*/}

&#x20;     <motion.div

&#x20;       animate={{ 

&#x20;         opacity: \[0.4, 0.7, 0.4],

&#x20;         scale: \[1, 1.05, 1]

&#x20;       }}

&#x20;       transition={{ duration: 8, repeat: Infinity }}

&#x20;       className="absolute top-12 right-12 w-96 h-96 bg-\[#C4B5FD] rounded-full blur-\[120px] opacity-20"

&#x20;     />



&#x20;     {/\* Howling wolf silhouette (optional decorative) \*/}

&#x20;     <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-\[180px] opacity-10">

&#x20;       🐺

&#x20;     </div>

&#x20;   </div>

&#x20; );

}



src/components/game/DayOverlay.tsx

"use client";

import { motion } from "framer-motion";



export function DayOverlay() {

&#x20; return (

&#x20;   <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">

&#x20;     {/\* Bright morning haze \*/}

&#x20;     <motion.div 

&#x20;       initial={{ opacity: 0 }}

&#x20;       animate={{ opacity: 0.35 }}

&#x20;       className="absolute inset-0 bg-gradient-to-b from-\[#F3E8FF]/20 via-transparent to-\[#111827]/60"

&#x20;     />



&#x20;     {/\* Soft daylight rays \*/}

&#x20;     <div className="absolute inset-0 bg-\[linear-gradient(transparent,#FCD34D10\_50%,transparent)]" />



&#x20;     {/\* Gentle sun glow \*/}

&#x20;     <motion.div

&#x20;       animate={{ 

&#x20;         opacity: \[0.25, 0.45, 0.25],

&#x20;       }}

&#x20;       transition={{ duration: 12, repeat: Infinity }}

&#x20;       className="absolute top-20 left-1/3 w-\[600px] h-\[600px] bg-\[#FDE68C] rounded-full blur-\[180px] opacity-10"

&#x20;     />

&#x20;   </div>

&#x20; );

}



src/components/game/GameTimeline.tsx

"use client";

import { GamePhase } from "@/shared/types/game";

import { motion } from "framer-motion";



const phases: { phase: GamePhase; label: string; icon: string }\[] = \[

&#x20; { phase: GamePhase.NIGHT, label: "Night", icon: "🌑" },

&#x20; { phase: GamePhase.DAY, label: "Day", icon: "☀️" },

&#x20; { phase: GamePhase.VOTING, label: "Voting", icon: "⚖️" },

];



interface GameTimelineProps {

&#x20; currentPhase: GamePhase;

&#x20; day: number;

}



export function GameTimeline({ currentPhase, day }: GameTimelineProps) {

&#x20; return (

&#x20;   <div className="w-full max-w-2xl mx-auto px-6 py-8">

&#x20;     <div className="flex items-center justify-between relative">

&#x20;       {/\* Progress Line \*/}

&#x20;       <div className="absolute top-1/2 left-0 right-0 h-\[3px] bg-\[#374151] -translate-y-1/2" />

&#x20;       

&#x20;       <div className="absolute top-1/2 left-0 right-0 h-\[3px] bg-gradient-to-r from-\[#7C3AED] via-\[#F59E0B] to-\[#DC2626] -translate-y-1/2"

&#x20;            style={{

&#x20;              width: currentPhase === GamePhase.NIGHT ? "33%" :

&#x20;                     currentPhase === GamePhase.DAY ? "66%" : "100%"

&#x20;            }}

&#x20;       />



&#x20;       {phases.map((item, index) => {

&#x20;         const isActive = item.phase === currentPhase;

&#x20;         const isPast = 

&#x20;           (currentPhase === GamePhase.DAY \&\& item.phase === GamePhase.NIGHT) ||

&#x20;           (currentPhase === GamePhase.VOTING \&\& (item.phase === GamePhase.NIGHT || item.phase === GamePhase.DAY));



&#x20;         return (

&#x20;           <motion.div

&#x20;             key={index}

&#x20;             initial={{ scale: 0.8 }}

&#x20;             animate={{ 

&#x20;               scale: isActive ? 1.15 : 1,

&#x20;               y: isActive ? -8 : 0 

&#x20;             }}

&#x20;             className="flex flex-col items-center z-10"

&#x20;           >

&#x20;             <div

&#x20;               className={`

&#x20;                 w-14 h-14 flex items-center justify-center text-3xl rounded-2xl border-2 transition-all

&#x20;                 ${isActive 

&#x20;                   ? "border-\[#7C3AED] bg-\[#111827] shadow-\[0\_0\_25px\_#7C3AED]" 

&#x20;                   : isPast 

&#x20;                     ? "border-\[#4B5563] bg-\[#1F2937]" 

&#x20;                     : "border-\[#374151] bg-\[#111827]"

&#x20;                 }

&#x20;               `}

&#x20;             >

&#x20;               {item.icon}

&#x20;             </div>

&#x20;             <p className={`mt-3 text-sm font-medium tracking-widest ${isActive ? "text-\[#E5E7EB]" : "text-\[#9CA3AF]"}`}>

&#x20;               {item.label}

&#x20;             </p>

&#x20;             {isActive \&\& (

&#x20;               <div className="text-\[#7C3AED] text-xs mt-1">DAY {day}</div>

&#x20;             )}

&#x20;           </motion.div>

&#x20;         );

&#x20;       })}

&#x20;     </div>

&#x20;   </div>

&#x20; );

}



src/components/game/CountdownTimer.tsx

"use client";

import { useEffect, useState } from "react";

import { motion } from "framer-motion";



interface CountdownTimerProps {

&#x20; seconds: number;

&#x20; onComplete?: () => void;

&#x20; label?: string;

&#x20; size?: "sm" | "md" | "lg";

}



export function CountdownTimer({

&#x20; seconds,

&#x20; onComplete,

&#x20; label = "TIME LEFT",

&#x20; size = "md",

}: CountdownTimerProps) {

&#x20; const \[timeLeft, setTimeLeft] = useState(seconds);

&#x20; const isUrgent = timeLeft <= 10;



&#x20; useEffect(() => {

&#x20;   if (timeLeft <= 0) {

&#x20;     onComplete?.();

&#x20;     return;

&#x20;   }



&#x20;   const timer = setInterval(() => {

&#x20;     setTimeLeft((prev) => Math.max(0, prev - 1));

&#x20;   }, 1000);



&#x20;   return () => clearInterval(timer);

&#x20; }, \[timeLeft, onComplete]);



&#x20; const sizeClasses = {

&#x20;   sm: "text-4xl",

&#x20;   md: "text-6xl",

&#x20;   lg: "text-8xl",

&#x20; };



&#x20; return (

&#x20;   <div className="flex flex-col items-center">

&#x20;     {label \&\& (

&#x20;       <p className="text-\[#9CA3AF] uppercase tracking-\[3px] text-sm mb-3 font-medium">

&#x20;         {label}

&#x20;       </p>

&#x20;     )}



&#x20;     <motion.div

&#x20;       key={timeLeft}

&#x20;       initial={{ scale: 0.9, opacity: 0.6 }}

&#x20;       animate={{ scale: 1, opacity: 1 }}

&#x20;       transition={{ duration: 0.2 }}

&#x20;       className={`

&#x20;         font-mono font-bold tracking-tighter text-white

&#x20;         ${sizeClasses\[size]}

&#x20;         ${isUrgent ? "text-\[#DC2626] animate-pulse" : "text-\[#C4B5FD]"}

&#x20;       `}

&#x20;     >

&#x20;       {String(timeLeft).padStart(2, "0")}

&#x20;     </motion.div>



&#x20;     {isUrgent \&\& (

&#x20;       <motion.p

&#x20;         animate={{ opacity: \[0.4, 1, 0.4] }}

&#x20;         transition={{ duration: 1.2, repeat: Infinity }}

&#x20;         className="text-\[#DC2626] text-sm mt-2 tracking-widest"

&#x20;       >

&#x20;         HURRY — THE MOON IS WANING

&#x20;       </motion.p>

&#x20;     )}

&#x20;   </div>

&#x20; );

}



src/components/game/CircularTimer.tsx

"use client";

import { useEffect, useState } from "react";

import { motion } from "framer-motion";



interface CircularTimerProps {

&#x20; seconds: number;

&#x20; maxSeconds: number;

&#x20; onComplete?: () => void;

&#x20; label?: string;

}



export function CircularTimer({

&#x20; seconds,

&#x20; maxSeconds,

&#x20; onComplete,

&#x20; label = "NIGHT TIME",

}: CircularTimerProps) {

&#x20; const \[timeLeft, setTimeLeft] = useState(seconds);

&#x20; const progress = (timeLeft / maxSeconds) \* 100;

&#x20; const isUrgent = timeLeft <= 15;



&#x20; useEffect(() => {

&#x20;   if (timeLeft <= 0) {

&#x20;     onComplete?.();

&#x20;     return;

&#x20;   }



&#x20;   const timer = setInterval(() => {

&#x20;     setTimeLeft((prev) => Math.max(0, prev - 1));

&#x20;   }, 1000);



&#x20;   return () => clearInterval(timer);

&#x20; }, \[timeLeft, onComplete]);



&#x20; const circumference = 2 \* Math.PI \* 110; // radius 110

&#x20; const strokeDashoffset = circumference - (progress / 100) \* circumference;



&#x20; return (

&#x20;   <div className="relative flex flex-col items-center">

&#x20;     <svg width="260" height="260" className="transform -rotate-90">

&#x20;       {/\* Background circle \*/}

&#x20;       <circle

&#x20;         cx="130"

&#x20;         cy="130"

&#x20;         r="110"

&#x20;         fill="none"

&#x20;         stroke="#1F2937"

&#x20;         strokeWidth="18"

&#x20;       />



&#x20;       {/\* Progress circle \*/}

&#x20;       <motion.circle

&#x20;         cx="130"

&#x20;         cy="130"

&#x20;         r="110"

&#x20;         fill="none"

&#x20;         stroke={isUrgent ? "#DC2626" : "#7C3AED"}

&#x20;         strokeWidth="18"

&#x20;         strokeDasharray={circumference}

&#x20;         strokeDashoffset={strokeDashoffset}

&#x20;         strokeLinecap="round"

&#x20;         initial={{ strokeDashoffset: circumference }}

&#x20;         animate={{ strokeDashoffset }}

&#x20;         transition={{ duration: 0.8, ease: "easeOut" }}

&#x20;         className={isUrgent ? "drop-shadow-\[0\_0\_20px\_#DC2626]" : "drop-shadow-\[0\_0\_20px\_#7C3AED]"}

&#x20;       />

&#x20;     </svg>



&#x20;     {/\* Center Content \*/}

&#x20;     <div className="absolute inset-0 flex flex-col items-center justify-center">

&#x20;       <motion.div

&#x20;         key={timeLeft}

&#x20;         initial={{ scale: 0.85 }}

&#x20;         animate={{ scale: 1 }}

&#x20;         className={`font-mono text-6xl font-bold tracking-tighter ${isUrgent ? "text-\[#DC2626]" : "text-\[#E5E7EB]"}`}

&#x20;       >

&#x20;         {String(timeLeft).padStart(2, "0")}

&#x20;       </motion.div>

&#x20;       <p className="text-\[#9CA3AF] text-sm tracking-widest mt-1">{label}</p>

&#x20;     </div>



&#x20;     {/\* Urgency Pulse Ring \*/}

&#x20;     {isUrgent \&\& (

&#x20;       <motion.div

&#x20;         animate={{ scale: \[1, 1.25, 1], opacity: \[0.3, 0.6, 0.3] }}

&#x20;         transition={{ duration: 1.5, repeat: Infinity }}

&#x20;         className="absolute w-\[260px] h-\[260px] border-4 border-\[#DC2626] rounded-full"

&#x20;       />

&#x20;     )}

&#x20;   </div>

&#x20; );

}



src/components/game/PhaseProgressBar.tsx

"use client";

import { GamePhase } from "@/shared/types/game";

import { motion } from "framer-motion";



interface PhaseProgressBarProps {

&#x20; currentPhase: GamePhase;

&#x20; timeLeft: number;

&#x20; totalTime: number;

}



const phaseColors = {

&#x20; \[GamePhase.NIGHT]: "#7C3AED",

&#x20; \[GamePhase.DAY]: "#F59E0B",

&#x20; \[GamePhase.VOTING]: "#DC2626",

&#x20; \[GamePhase.END]: "#16A34A",

};



export function PhaseProgressBar({ currentPhase, timeLeft, totalTime }: PhaseProgressBarProps) {

&#x20; const progress = Math.max(0, (timeLeft / totalTime) \* 100);

&#x20; const isUrgent = progress < 25;

&#x20; const color = phaseColors\[currentPhase];



&#x20; return (

&#x20;   <div className="w-full max-w-2xl mx-auto px-6">

&#x20;     <div className="flex justify-between text-xs text-\[#9CA3AF] mb-2 font-medium tracking-widest">

&#x20;       <span>{currentPhase}</span>

&#x20;       <span className={isUrgent ? "text-\[#DC2626]" : ""}>

&#x20;         {timeLeft}s

&#x20;       </span>

&#x20;     </div>



&#x20;     <div className="h-2.5 bg-\[#1F2937] rounded-full overflow-hidden border border-white/5">

&#x20;       <motion.div

&#x20;         className="h-full rounded-full relative"

&#x20;         style={{ backgroundColor: color }}

&#x20;         initial={{ width: "100%" }}

&#x20;         animate={{ width: `${progress}%` }}

&#x20;         transition={{ duration: 0.6, ease: "easeOut" }}

&#x20;       >

&#x20;         {isUrgent \&\& (

&#x20;           <motion.div

&#x20;             animate={{ opacity: \[0.4, 1, 0.4] }}

&#x20;             transition={{ duration: 0.8, repeat: Infinity }}

&#x20;             className="absolute inset-0 bg-white/30"

&#x20;           />

&#x20;         )}

&#x20;       </motion.div>

&#x20;     </div>

&#x20;   </div>

&#x20; );

}



src/components/game/UrgencyIndicator.tsx

"use client";

import { motion } from "framer-motion";



interface UrgencyIndicatorProps {

&#x20; isUrgent: boolean;

&#x20; message?: string;

}



export function UrgencyIndicator({ isUrgent, message = "TIME IS RUNNING OUT" }: UrgencyIndicatorProps) {

&#x20; if (!isUrgent) return null;



&#x20; return (

&#x20;   <motion.div

&#x20;     initial={{ opacity: 0, y: 20 }}

&#x20;     animate={{ 

&#x20;       opacity: \[0.6, 1, 0.6],

&#x20;       y: \[0, -4, 0]

&#x20;     }}

&#x20;     transition={{ duration: 1.2, repeat: Infinity }}

&#x20;     className="inline-flex items-center gap-3 px-6 py-2 bg-\[#DC2626]/10 border border-\[#DC2626]/40 rounded-2xl"

&#x20;   >

&#x20;     <div className="w-3 h-3 bg-\[#DC2626] rounded-full animate-ping" />

&#x20;     <span className="text-\[#F87171] font-medium tracking-widest text-sm">

&#x20;       {message}

&#x20;     </span>

&#x20;   </motion.div>

&#x20; );

}



src/components/game/index.ts

export \* from "./CountdownTimer";

export \* from "./CircularTimer";

export \* from "./PhaseProgressBar";

export \* from "./UrgencyIndicator";



src/components/game/VoteButton.tsx

"use client";

import { Button } from "@/components/ui/Button";



interface VoteButtonProps {

&#x20; onVote: () => void;

&#x20; disabled?: boolean;

&#x20; isSelected?: boolean;

}



export function VoteButton({ onVote, disabled = false, isSelected = false }: VoteButtonProps) {

&#x20; return (

&#x20;   <Button

&#x20;     variant={isSelected ? "danger" : "primary"}

&#x20;     onClick={onVote}

&#x20;     disabled={disabled}

&#x20;     className={`w-full font-bold tracking-widest ${isSelected ? "animate-pulse" : ""}`}

&#x20;   >

&#x20;     {isSelected ? "✓ VOTED" : "VOTE"}

&#x20;   </Button>

&#x20; );

}



src/components/game/VoteTargetSelector.tsx

"use client";

import { Player } from "@/shared/types/game";

import { PlayerCard } from "./PlayerCard";

import { Typography } from "@/components/ui/Typography";



interface VoteTargetSelectorProps {

&#x20; players: Player\[];

&#x20; selectedId?: string;

&#x20; onSelect: (id: string) => void;

&#x20; disabled?: boolean;

}



export function VoteTargetSelector({

&#x20; players,

&#x20; selectedId,

&#x20; onSelect,

&#x20; disabled = false,

}: VoteTargetSelectorProps) {

&#x20; const alivePlayers = players.filter((p) => p.isAlive);



&#x20; return (

&#x20;   <div>

&#x20;     <Typography variant="secondary" className="mb-6 text-center">

&#x20;       Choose who to eliminate this day

&#x20;     </Typography>



&#x20;     <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

&#x20;       {alivePlayers.map((player) => (

&#x20;         <div

&#x20;           key={player.id}

&#x20;           onClick={() => !disabled \&\& onSelect(player.id)}

&#x20;           className={`

&#x20;             relative transition-all duration-200 rounded-3xl overflow-hidden

&#x20;             ${selectedId === player.id 

&#x20;               ? "ring-4 ring-\[#DC2626] shadow-\[0\_0\_30px\_#DC2626]" 

&#x20;               : "hover:ring-2 hover:ring-\[#7C3AED]/50"

&#x20;             }

&#x20;           `}

&#x20;         >

&#x20;           <PlayerCard 

&#x20;             player={player} 

&#x20;             showRole={false} 

&#x20;           />

&#x20;           

&#x20;           {selectedId === player.id \&\& (

&#x20;             <div className="absolute top-4 right-4 bg-\[#DC2626] text-white text-xs font-bold px-4 py-1 rounded-xl tracking-widest">

&#x20;               SELECTED

&#x20;             </div>

&#x20;           )}

&#x20;         </div>

&#x20;       ))}

&#x20;     </div>

&#x20;   </div>

&#x20; );

}



src/components/game/VoteIndicator.tsx

import { Player } from "@/shared/types/game";



interface VoteIndicatorProps {

&#x20; player: Player;

&#x20; voteCount: number;

&#x20; isLeading?: boolean;

&#x20; maxVotes: number;

}



export function VoteIndicator({ player, voteCount, isLeading = false, maxVotes }: VoteIndicatorProps) {

&#x20; const percentage = maxVotes > 0 ? Math.round((voteCount / maxVotes) \* 100) : 0;



&#x20; return (

&#x20;   <div className={`relative p-4 rounded-2xl border transition-all ${isLeading ? "border-\[#F59E0B] shadow-\[0\_0\_20px\_#F59E0B]" : "border-white/10"}`}>

&#x20;     <div className="flex items-center gap-4">

&#x20;       <div className="flex-shrink-0">

&#x20;         {/\* Small avatar \*/}

&#x20;         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-\[#1F2937] ${!player.isAlive ? "grayscale opacity-60" : ""}`}>

&#x20;           {player.name\[0].toUpperCase()}

&#x20;         </div>

&#x20;       </div>



&#x20;       <div className="flex-1 min-w-0">

&#x20;         <p className={`font-semibold ${!player.isAlive ? "line-through text-\[#6B7280]" : ""}`}>

&#x20;           {player.name}

&#x20;         </p>

&#x20;         <div className="flex items-center gap-3 mt-2">

&#x20;           <div className="flex-1 h-2 bg-\[#374151] rounded-full overflow-hidden">

&#x20;             <div 

&#x20;               className={`h-full ${isLeading ? "bg-\[#F59E0B]" : "bg-\[#7C3AED]"} transition-all`}

&#x20;               style={{ width: `${percentage}%` }}

&#x20;             />

&#x20;           </div>

&#x20;           <span className="font-mono text-sm text-\[#E5E7EB] tabular-nums">{voteCount}</span>

&#x20;         </div>

&#x20;       </div>

&#x20;     </div>

&#x20;   </div>

&#x20; );

}



src/components/game/VoteProgress.tsx

"use client";

import { motion } from "framer-motion";



interface VoteProgressProps {

&#x20; totalVotes: number;

&#x20; requiredVotes: number;

}



export function VoteProgress({ totalVotes, requiredVotes }: VoteProgressProps) {

&#x20; const progress = Math.min((totalVotes / requiredVotes) \* 100, 100);



&#x20; return (

&#x20;   <div className="w-full">

&#x20;     <div className="flex justify-between text-xs tracking-widest text-\[#9CA3AF] mb-3">

&#x20;       <span>VOTES CAST</span>

&#x20;       <span>{totalVotes} / {requiredVotes}</span>

&#x20;     </div>

&#x20;     <div className="h-3 bg-\[#1F2937] rounded-2xl overflow-hidden">

&#x20;       <motion.div

&#x20;         initial={{ width: 0 }}

&#x20;         animate={{ width: `${progress}%` }}

&#x20;         className="h-full bg-gradient-to-r from-\[#7C3AED] to-\[#DC2626]"

&#x20;       />

&#x20;     </div>

&#x20;   </div>

&#x20; );

}



src/components/game/VotePanel.tsx

"use client";

import { useState } from "react";

import { Player } from "@/shared/types/game";

import { VoteTargetSelector } from "./VoteTargetSelector";

import { VoteButton } from "./VoteButton";

import { Card } from "@/components/ui/Card";

import { Typography } from "@/components/ui/Typography";



interface VotePanelProps {

&#x20; players: Player\[];

&#x20; currentPlayerId: string;

&#x20; onVote: (targetId: string) => void;

&#x20; hasVoted?: boolean;

}



export function VotePanel({ players, currentPlayerId, onVote, hasVoted = false }: VotePanelProps) {

&#x20; const \[selectedId, setSelectedId] = useState<string | undefined>();



&#x20; const handleVote = () => {

&#x20;   if (selectedId) {

&#x20;     onVote(selectedId);

&#x20;   }

&#x20; };



&#x20; return (

&#x20;   <Card className="max-w-4xl mx-auto">

&#x20;     <div className="text-center mb-8">

&#x20;       <Typography variant="secondary" size="lg">

&#x20;         The sun is high. Time to decide.

&#x20;       </Typography>

&#x20;       <h2 className="text-3xl font-bold tracking-wide mt-2 text-\[#E5E7EB]">

&#x20;         WHO IS THE MONSTER?

&#x20;       </h2>

&#x20;     </div>



&#x20;     <VoteTargetSelector

&#x20;       players={players}

&#x20;       selectedId={selectedId}

&#x20;       onSelect={setSelectedId}

&#x20;       disabled={hasVoted}

&#x20;     />



&#x20;     <div className="mt-10">

&#x20;       <VoteButton

&#x20;         onVote={handleVote}

&#x20;         disabled={!selectedId || hasVoted}

&#x20;         isSelected={!!selectedId}

&#x20;       />

&#x20;     </div>



&#x20;     {hasVoted \&\& (

&#x20;       <p className="text-center text-\[#16A34A] mt-6 font-medium">

&#x20;         Your vote has been cast. Waiting for others...

&#x20;       </p>

&#x20;     )}

&#x20;   </Card>

&#x20; );

}



src/components/game/VoteResultModal.tsx

"use client";

import { motion, AnimatePresence } from "framer-motion";

import { Player } from "@/shared/types/game";

import { RoleBadge } from "./RoleBadge";

import { Button } from "@/components/ui/Button";



interface VoteResultModalProps {

&#x20; isOpen: boolean;

&#x20; onClose: () => void;

&#x20; eliminatedPlayer?: Player;

&#x20; voteCounts: Record<string, number>;

&#x20; isTie?: boolean;

}



export function VoteResultModal({ 

&#x20; isOpen, 

&#x20; onClose, 

&#x20; eliminatedPlayer, 

&#x20; voteCounts,

&#x20; isTie = false 

}: VoteResultModalProps) {

&#x20; return (

&#x20;   <AnimatePresence>

&#x20;     {isOpen \&\& (

&#x20;       <div className="fixed inset-0 z-\[200] flex items-center justify-center bg-black/90 backdrop-blur-xl">

&#x20;         <motion.div

&#x20;           initial={{ opacity: 0, scale: 0.7, y: 50 }}

&#x20;           animate={{ opacity: 1, scale: 1, y: 0 }}

&#x20;           exit={{ opacity: 0, scale: 0.8, y: 30 }}

&#x20;           className="bg-\[#111827] border border-\[#DC2626]/40 rounded-3xl max-w-lg w-full mx-4 overflow-hidden"

&#x20;         >

&#x20;           <div className="p-10 text-center">

&#x20;             <div className="text-6xl mb-6">☠️</div>

&#x20;             

&#x20;             <h2 className="text-4xl font-black tracking-widest text-\[#F87171] mb-2">

&#x20;               EXECUTED

&#x20;             </h2>



&#x20;             {eliminatedPlayer \&\& (

&#x20;               <div className="mt-8">

&#x20;                 <div className="text-5xl mb-4">{eliminatedPlayer.name}</div>

&#x20;                 <RoleBadge role={eliminatedPlayer.role} size="lg" />

&#x20;               </div>

&#x20;             )}



&#x20;             {isTie \&\& (

&#x20;               <div className="mt-6 text-amber-400 text-xl font-medium">

&#x20;                 The vote was tied... The village hesitates.

&#x20;               </div>

&#x20;             )}



&#x20;             <div className="mt-12">

&#x20;               <Button variant="danger" onClick={onClose} size="lg">

&#x20;                 Continue to Night

&#x20;               </Button>

&#x20;             </div>

&#x20;           </div>

&#x20;         </motion.div>

&#x20;       </div>

&#x20;     )}

&#x20;   </AnimatePresence>

&#x20; );

}



src/components/game/TieBreakerPanel.tsx

"use client";

import { Player } from "@/shared/types/game";

import { VoteTargetSelector } from "./VoteTargetSelector";

import { Typography } from "@/components/ui/Typography";



interface TieBreakerPanelProps {

&#x20; tiedPlayers: Player\[];

&#x20; onBreakTie: (id: string) => void;

}



export function TieBreakerPanel({ tiedPlayers, onBreakTie }: TieBreakerPanelProps) {

&#x20; return (

&#x20;   <div className="max-w-2xl mx-auto">

&#x20;     <div className="text-center mb-8">

&#x20;       <div className="inline-block px-6 py-2 bg-\[#F59E0B]/10 border border-\[#F59E0B]/40 rounded-2xl text-amber-400 text-sm tracking-widest mb-4">

&#x20;         TIE BREAKER

&#x20;       </div>

&#x20;       <Typography variant="secondary" size="lg">

&#x20;         The village is divided. One final vote decides.

&#x20;       </Typography>

&#x20;     </div>



&#x20;     <VoteTargetSelector 

&#x20;       players={tiedPlayers} 

&#x20;       onSelect={onBreakTie}

&#x20;     />

&#x20;   </div>

&#x20; );

}



src/components/game/actions/WolfTargetSelector.tsx

"use client";

import { Player } from "@/shared/types/game";

import { PlayerCard } from "../PlayerCard";

import { Typography } from "@/components/ui/Typography";



interface WolfTargetSelectorProps {

&#x20; players: Player\[];

&#x20; selectedId?: string;

&#x20; onSelect: (id: string) => void;

}



export function WolfTargetSelector({ players, selectedId, onSelect }: WolfTargetSelectorProps) {

&#x20; const aliveVillagers = players.filter(p => p.isAlive \&\& p.role !== "WEREWOLF");



&#x20; return (

&#x20;   <div>

&#x20;     <Typography variant="secondary" className="text-center mb-6 text-\[#F87171]">

&#x20;       Choose your prey tonight...

&#x20;     </Typography>



&#x20;     <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

&#x20;       {aliveVillagers.map((player) => (

&#x20;         <div

&#x20;           key={player.id}

&#x20;           onClick={() => onSelect(player.id)}

&#x20;           className={`

&#x20;             relative cursor-pointer transition-all rounded-3xl overflow-hidden

&#x20;             ${selectedId === player.id 

&#x20;               ? "ring-4 ring-\[#DC2626] shadow-\[0\_0\_35px\_#DC2626]" 

&#x20;               : "hover:ring-2 hover:ring-\[#7C3AED]/40"

&#x20;             }

&#x20;           `}

&#x20;         >

&#x20;           <PlayerCard player={player} showRole={false} />

&#x20;           

&#x20;           {selectedId === player.id \&\& (

&#x20;             <div className="absolute top-3 right-3 bg-\[#DC2626] text-white text-xs px-4 py-1 rounded-xl font-bold tracking-widest">

&#x20;               TARGET

&#x20;             </div>

&#x20;           )}

&#x20;         </div>

&#x20;       ))}

&#x20;     </div>

&#x20;   </div>

&#x20; );

}



src/components/game/actions/SeerInspectPanel.tsx

"use client";

import { Player } from "@/shared/types/game";

import { PlayerCard } from "../PlayerCard";

import { Button } from "@/components/ui/Button";

import { Typography } from "@/components/ui/Typography";



interface SeerInspectPanelProps {

&#x20; players: Player\[];

&#x20; selectedId?: string;

&#x20; onSelect: (id: string) => void;

&#x20; onInspect: () => void;

&#x20; hasInspected?: boolean;

}



export function SeerInspectPanel({

&#x20; players,

&#x20; selectedId,

&#x20; onSelect,

&#x20; onInspect,

&#x20; hasInspected = false,

}: SeerInspectPanelProps) {

&#x20; return (

&#x20;   <div className="space-y-8">

&#x20;     <Typography variant="secondary" className="text-center">

&#x20;       Gaze into the moonlight. Choose one soul to reveal.

&#x20;     </Typography>



&#x20;     <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

&#x20;       {players.filter(p => p.isAlive).map((player) => (

&#x20;         <div

&#x20;           key={player.id}

&#x20;           onClick={() => !hasInspected \&\& onSelect(player.id)}

&#x20;           className={`cursor-pointer transition-all ${hasInspected ? "opacity-60" : ""}`}

&#x20;         >

&#x20;           <PlayerCard 

&#x20;             player={player} 

&#x20;             showRole={false}

&#x20;           />

&#x20;         </div>

&#x20;       ))}

&#x20;     </div>



&#x20;     <Button 

&#x20;       variant="primary" 

&#x20;       onClick={onInspect}

&#x20;       disabled={!selectedId || hasInspected}

&#x20;       className="w-full"

&#x20;     >

&#x20;       {hasInspected ? "YOU HAVE ALREADY USED YOUR POWER" : "🔮 INSPECT TARGET"}

&#x20;     </Button>

&#x20;   </div>

&#x20; );

}



src/components/game/actions/InspectResult.tsx

import { Player } from "@/shared/types/game";

import { RoleBadge } from "../RoleBadge";

import { Card } from "@/components/ui/Card";



interface InspectResultProps {

&#x20; target: Player;

}



export function InspectResult({ target }: InspectResultProps) {

&#x20; return (

&#x20;   <Card glow className="text-center">

&#x20;     <div className="text-6xl mb-6">🔮</div>

&#x20;     <p className="text-\[#9CA3AF] uppercase tracking-widest text-sm mb-2">You have seen...</p>

&#x20;     

&#x20;     <div className="text-4xl font-bold text-\[#E5E7EB] mb-6">{target.name}</div>

&#x20;     

&#x20;     <RoleBadge role={target.role} size="lg" />

&#x20;     

&#x20;     <p className="mt-8 text-\[#C4B5FD] text-lg">

&#x20;       Their true nature is now known to you.

&#x20;     </p>

&#x20;   </Card>

&#x20; );

}



src/components/game/actions/WitchSaveButton.tsx \& WitchPoisonButton.tsx

// WitchSaveButton.tsx

import { Button } from "@/components/ui/Button";



interface WitchSaveButtonProps {

&#x20; onSave: () => void;

&#x20; disabled?: boolean;

&#x20; used?: boolean;

}



export function WitchSaveButton({ onSave, disabled = false, used = false }: WitchSaveButtonProps) {

&#x20; return (

&#x20;   <Button

&#x20;     variant="success"

&#x20;     onClick={onSave}

&#x20;     disabled={disabled || used}

&#x20;     className="w-full"

&#x20;   >

&#x20;     {used ? "💚 SAVE POTION USED" : "💚 SAVE A LIFE"}

&#x20;   </Button>

&#x20; );

}



// WitchPoisonButton.tsx

import { Button } from "@/components/ui/Button";



interface WitchPoisonButtonProps {

&#x20; onPoison: () => void;

&#x20; disabled?: boolean;

&#x20; used?: boolean;

}



export function WitchPoisonButton({ onPoison, disabled = false, used = false }: WitchPoisonButtonProps) {

&#x20; return (

&#x20;   <Button

&#x20;     variant="danger"

&#x20;     onClick={onPoison}

&#x20;     disabled={disabled || used}

&#x20;     className="w-full"

&#x20;   >

&#x20;     {used ? "☠️ POISON USED" : "☠️ POISON SOMEONE"}

&#x20;   </Button>

&#x20; );

}



src/components/game/actions/PotionStatus.tsx

interface PotionStatusProps {

&#x20; saveUsed: boolean;

&#x20; poisonUsed: boolean;

}



export function PotionStatus({ saveUsed, poisonUsed }: PotionStatusProps) {

&#x20; return (

&#x20;   <div className="flex gap-6 justify-center">

&#x20;     <div className={`px-6 py-3 rounded-2xl border ${saveUsed ? "border-\[#4B5563] opacity-60" : "border-\[#16A34A]"}`}>

&#x20;       💚 Save Potion {saveUsed ? "— USED" : "— READY"}

&#x20;     </div>

&#x20;     <div className={`px-6 py-3 rounded-2xl border ${poisonUsed ? "border-\[#4B5563] opacity-60" : "border-\[#DC2626]"}`}>

&#x20;       ☠️ Poison Potion {poisonUsed ? "— USED" : "— READY"}

&#x20;     </div>

&#x20;   </div>

&#x20; );

}



src/components/game/actions/GuardProtectSelector.tsx

"use client";

import { Player } from "@/shared/types/game";

import { PlayerCard } from "../PlayerCard";



interface GuardProtectSelectorProps {

&#x20; players: Player\[];

&#x20; selectedId?: string;

&#x20; onSelect: (id: string) => void;

}



export function GuardProtectSelector({ players, selectedId, onSelect }: GuardProtectSelectorProps) {

&#x20; return (

&#x20;   <div>

&#x20;     <p className="text-center text-\[#16A34A] mb-6 tracking-wide">

&#x20;       Choose who to shield from the darkness tonight

&#x20;     </p>



&#x20;     <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

&#x20;       {players.filter(p => p.isAlive).map((player) => (

&#x20;         <div

&#x20;           key={player.id}

&#x20;           onClick={() => onSelect(player.id)}

&#x20;           className={`

&#x20;             cursor-pointer transition-all rounded-3xl

&#x20;             ${selectedId === player.id ? "ring-4 ring-\[#16A34A] shadow-\[0\_0\_30px\_#16A34A]" : ""}

&#x20;           `}

&#x20;         >

&#x20;           <PlayerCard player={player} showRole={false} />

&#x20;         </div>

&#x20;       ))}

&#x20;     </div>

&#x20;   </div>

&#x20; );

}



src/components/game/actions/ActionPanel.tsx

"use client";

import { Role, Player, GamePhase } from "@/shared/types/game";

import { Card } from "@/components/ui/Card";

import { Typography } from "@/components/ui/Typography";



import { WolfTargetSelector } from "./WolfTargetSelector";

import { SeerInspectPanel } from "./SeerInspectPanel";

import { GuardProtectSelector } from "./GuardProtectSelector";

import { WitchSaveButton, WitchPoisonButton } from "./WitchSaveButton";

import { PotionStatus } from "./PotionStatus";



interface ActionPanelProps {

&#x20; myRole: Role;

&#x20; phase: GamePhase;

&#x20; players: Player\[];

&#x20; selectedId?: string;

&#x20; onSelect: (id: string) => void;

&#x20; onAction: (action: string, targetId?: string) => void;

&#x20; potionStatus?: { saveUsed: boolean; poisonUsed: boolean };

&#x20; hasActed?: boolean;

}



export function ActionPanel({

&#x20; myRole,

&#x20; phase,

&#x20; players,

&#x20; selectedId,

&#x20; onSelect,

&#x20; onAction,

&#x20; potionStatus,

&#x20; hasActed = false,

}: ActionPanelProps) {

&#x20; if (phase !== GamePhase.NIGHT) return null;



&#x20; return (

&#x20;   <Card className="mt-10">

&#x20;     <div className="text-center mb-8">

&#x20;       <Typography variant="secondary">YOUR NIGHT ACTION</Typography>

&#x20;       <h3 className="text-3xl font-bold mt-2 tracking-wide">

&#x20;         {myRole === Role.WEREWOLF ? "Hunt Together" : 

&#x20;          myRole === Role.SEER ? "Divine Insight" : 

&#x20;          myRole === Role.WITCH ? "Brew Your Potions" : 

&#x20;          myRole === Role.GUARD ? "Stand Vigil" : "Act"}

&#x20;       </h3>

&#x20;     </div>



&#x20;     {myRole === Role.WEREWOLF \&\& (

&#x20;       <WolfTargetSelector 

&#x20;         players={players} 

&#x20;         selectedId={selectedId} 

&#x20;         onSelect={onSelect} 

&#x20;       />

&#x20;     )}



&#x20;     {myRole === Role.SEER \&\& (

&#x20;       <SeerInspectPanel 

&#x20;         players={players} 

&#x20;         selectedId={selectedId} 

&#x20;         onSelect={onSelect} 

&#x20;         onInspect={() => onAction("inspect", selectedId)}

&#x20;         hasInspected={hasActed}

&#x20;       />

&#x20;     )}



&#x20;     {myRole === Role.GUARD \&\& (

&#x20;       <GuardProtectSelector 

&#x20;         players={players} 

&#x20;         selectedId={selectedId} 

&#x20;         onSelect={onSelect} 

&#x20;       />

&#x20;     )}



&#x20;     {myRole === Role.WITCH \&\& potionStatus \&\& (

&#x20;       <div className="space-y-8">

&#x20;         <PotionStatus saveUsed={potionStatus.saveUsed} poisonUsed={potionStatus.poisonUsed} />

&#x20;         

&#x20;         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

&#x20;           <WitchSaveButton 

&#x20;             onSave={() => onAction("save")} 

&#x20;             disabled={hasActed} 

&#x20;             used={potionStatus.saveUsed} 

&#x20;           />

&#x20;           <WitchPoisonButton 

&#x20;             onPoison={() => onAction("poison", selectedId)} 

&#x20;             disabled={hasActed || !selectedId} 

&#x20;             used={potionStatus.poisonUsed} 

&#x20;           />

&#x20;         </div>

&#x20;       </div>

&#x20;     )}



&#x20;     {/\* Confirm button for roles that need target \*/}

&#x20;     {(myRole === Role.WEREWOLF || myRole === Role.GUARD) \&\& selectedId \&\& !hasActed \&\& (

&#x20;       <button

&#x20;         onClick={() => onAction(myRole === Role.WEREWOLF ? "kill" : "protect", selectedId)}

&#x20;         className="mt-8 w-full py-4 bg-\[#7C3AED] hover:bg-\[#6D28D9] rounded-2xl font-bold tracking-widest transition-all"

&#x20;       >

&#x20;         CONFIRM ACTION

&#x20;       </button>

&#x20;     )}

&#x20;   </Card>

&#x20; );

}



src/components/game/actions/ActionConfirmModal.tsx

"use client";

import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/Button";

import { Player } from "@/shared/types/game";



interface ActionConfirmModalProps {

&#x20; isOpen: boolean;

&#x20; onClose: () => void;

&#x20; onConfirm: () => void;

&#x20; actionType: "kill" | "protect" | "poison";

&#x20; target?: Player;

}



export function ActionConfirmModal({ isOpen, onClose, onConfirm, actionType, target }: ActionConfirmModalProps) {

&#x20; const isDangerous = actionType === "kill" || actionType === "poison";



&#x20; return (

&#x20;   <AnimatePresence>

&#x20;     {isOpen \&\& (

&#x20;       <div className="fixed inset-0 z-\[150] flex items-center justify-center bg-black/90 backdrop-blur-xl">

&#x20;         <motion.div

&#x20;           initial={{ scale: 0.8, opacity: 0 }}

&#x20;           animate={{ scale: 1, opacity: 1 }}

&#x20;           exit={{ scale: 0.85, opacity: 0 }}

&#x20;           className="bg-\[#111827] border border-red-500/40 rounded-3xl max-w-md w-full p-10"

&#x20;         >

&#x20;           <div className="text-center">

&#x20;             <div className="text-6xl mb-6">

&#x20;               {isDangerous ? "☠️" : "🛡️"}

&#x20;             </div>



&#x20;             <h3 className="text-2xl font-bold mb-6">

&#x20;               {isDangerous ? "This action cannot be undone" : "Confirm Protection"}

&#x20;             </h3>



&#x20;             {target \&\& (

&#x20;               <p className="text-xl mb-8">

&#x20;                 Target: <span className="font-semibold text-\[#E5E7EB]">{target.name}</span>

&#x20;               </p>

&#x20;             )}



&#x20;             <div className="flex gap-4">

&#x20;               <Button variant="secondary" onClick={onClose} className="flex-1">

&#x20;                 CANCEL

&#x20;               </Button>

&#x20;               <Button 

&#x20;                 variant={isDangerous ? "danger" : "primary"} 

&#x20;                 onClick={onConfirm}

&#x20;                 className="flex-1"

&#x20;               >

&#x20;                 YES, PROCEED

&#x20;               </Button>

&#x20;             </div>

&#x20;           </div>

&#x20;         </motion.div>

&#x20;       </div>

&#x20;     )}

&#x20;   </AnimatePresence>

&#x20; );

}



src/components/game/actions/ActionResultToast.tsx

"use client";

import { motion, AnimatePresence } from "framer-motion";



interface ActionResultToastProps {

&#x20; message: string;

&#x20; type: "success" | "error" | "info";

&#x20; isVisible: boolean;

&#x20; onClose: () => void;

}



export function ActionResultToast({ message, type, isVisible, onClose }: ActionResultToastProps) {

&#x20; const colors = {

&#x20;   success: "border-\[#16A34A] bg-\[#16A34A]/10",

&#x20;   error: "border-\[#DC2626] bg-\[#DC2626]/10",

&#x20;   info: "border-\[#7C3AED] bg-\[#7C3AED]/10",

&#x20; };



&#x20; return (

&#x20;   <AnimatePresence>

&#x20;     {isVisible \&\& (

&#x20;       <motion.div

&#x20;         initial={{ y: 80, opacity: 0 }}

&#x20;         animate={{ y: 0, opacity: 1 }}

&#x20;         exit={{ y: 80, opacity: 0 }}

&#x20;         className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl border ${colors\[type]} shadow-2xl z-\[300]`}

&#x20;       >

&#x20;         <p className="text-\[#E5E7EB] font-medium">{message}</p>

&#x20;       </motion.div>

&#x20;     )}

&#x20;   </AnimatePresence>

&#x20; );

}



src/components/game/death/DeathAnnouncement.tsx

"use client";

import { motion, AnimatePresence } from "framer-motion";

import { Player } from "@/shared/types/game";

import { RoleBadge } from "../RoleBadge";

import { Typography } from "@/components/ui/Typography";



interface DeathAnnouncementProps {

&#x20; isVisible: boolean;

&#x20; player: Player;

&#x20; onClose: () => void;

}



export function DeathAnnouncement({ isVisible, player, onClose }: DeathAnnouncementProps) {

&#x20; return (

&#x20;   <AnimatePresence>

&#x20;     {isVisible \&\& (

&#x20;       <>

&#x20;         {/\* Blood-red backdrop \*/}

&#x20;         <motion.div

&#x20;           initial={{ opacity: 0 }}

&#x20;           animate={{ opacity: 1 }}

&#x20;           exit={{ opacity: 0 }}

&#x20;           className="fixed inset-0 z-\[180] bg-black/95 backdrop-blur-2xl"

&#x20;         />



&#x20;         <div className="fixed inset-0 z-\[190] flex items-center justify-center p-6">

&#x20;           <motion.div

&#x20;             initial={{ opacity: 0, scale: 0.7, y: 60 }}

&#x20;             animate={{ opacity: 1, scale: 1, y: 0 }}

&#x20;             exit={{ opacity: 0, scale: 0.85, y: -40 }}

&#x20;             transition={{ type: "spring", damping: 22, stiffness: 180 }}

&#x20;             className="bg-\[#111827] border border-\[#DC2626]/60 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl"

&#x20;           >

&#x20;             <div className="p-12 text-center relative">

&#x20;               {/\* Blood splatter effect (subtle) \*/}

&#x20;               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-\[#DC2626] to-transparent" />



&#x20;               <motion.div 

&#x20;                 animate={{ scale: \[1, 1.15, 1] }}

&#x20;                 transition={{ duration: 2, repeat: Infinity }}

&#x20;                 className="text-8xl mb-8"

&#x20;               >

&#x20;                 ☠️

&#x20;               </motion.div>



&#x20;               <Typography variant="secondary" className="uppercase tracking-\[4px] text-sm mb-3 text-\[#F87171]">

&#x20;                 THE VILLAGE HAS LOST

&#x20;               </Typography>



&#x20;               <h2 className="text-5xl font-black text-\[#E5E7EB] mb-6 tracking-wide line-through decoration-\[#DC2626]/70">

&#x20;                 {player.name}

&#x20;               </h2>



&#x20;               <RoleBadge role={player.role} size="lg" />



&#x20;               <div className="mt-10 text-\[#9CA3AF] text-lg">

&#x20;                 They were <span className="text-\[#F87171]">{player.role.toLowerCase()}</span>.

&#x20;               </div>



&#x20;               <button

&#x20;                 onClick={onClose}

&#x20;                 className="mt-12 px-10 py-4 border border-\[#DC2626]/50 hover:bg-\[#DC2626]/10 rounded-2xl text-\[#F87171] font-semibold tracking-widest transition-all"

&#x20;               >

&#x20;                 CONTINUE

&#x20;               </button>

&#x20;             </div>

&#x20;           </motion.div>

&#x20;         </div>

&#x20;       </>

&#x20;     )}

&#x20;   </AnimatePresence>

&#x20; );

}



src/components/game/death/DeathAnimation.tsx

"use client";

import { motion, AnimatePresence } from "framer-motion";

import { Player } from "@/shared/types/game";

import { PlayerAvatar } from "../PlayerAvatar";



interface DeathAnimationProps {

&#x20; player: Player;

&#x20; isVisible: boolean;

&#x20; onComplete?: () => void;

}



export function DeathAnimation({ player, isVisible, onComplete }: DeathAnimationProps) {

&#x20; return (

&#x20;   <AnimatePresence onExitComplete={onComplete}>

&#x20;     {isVisible \&\& (

&#x20;       <div className="fixed inset-0 z-\[170] flex items-center justify-center pointer-events-none">

&#x20;         <motion.div

&#x20;           initial={{ opacity: 0 }}

&#x20;           animate={{ opacity: 1 }}

&#x20;           exit={{ opacity: 0 }}

&#x20;           className="relative"

&#x20;         >

&#x20;           {/\* Blood mist background \*/}

&#x20;           <motion.div

&#x20;             initial={{ opacity: 0 }}

&#x20;             animate={{ opacity: \[0, 0.6, 0.3] }}

&#x20;             exit={{ opacity: 0 }}

&#x20;             className="absolute inset-0 bg-\[#991B1B] blur-\[120px] scale-150"

&#x20;           />



&#x20;           <motion.div

&#x20;             initial={{ scale: 1, filter: "grayscale(0%)" }}

&#x20;             animate={{ 

&#x20;               scale: \[1, 1.08, 0.92],

&#x20;               filter: "grayscale(100%)"

&#x20;             }}

&#x20;             transition={{ duration: 1.8, ease: "easeInOut" }}

&#x20;             className="relative"

&#x20;           >

&#x20;             <PlayerAvatar

&#x20;               name={player.name}

&#x20;               isDead={true}

&#x20;               size="xl"

&#x20;             />

&#x20;           </motion.div>



&#x20;           {/\* Blood drip lines \*/}

&#x20;           <motion.div

&#x20;             initial={{ height: 0 }}

&#x20;             animate={{ height: "180px" }}

&#x20;             transition={{ delay: 0.6, duration: 1.2 }}

&#x20;             className="absolute -bottom-6 left-1/2 w-0.5 bg-gradient-to-b from-\[#DC2626] to-transparent"

&#x20;           />

&#x20;           <motion.div

&#x20;             initial={{ height: 0 }}

&#x20;             animate={{ height: "140px" }}

&#x20;             transition={{ delay: 0.9, duration: 1 }}

&#x20;             className="absolute -bottom-6 left-\[42%] w-0.5 bg-gradient-to-b from-\[#DC2626] to-transparent"

&#x20;           />

&#x20;         </motion.div>

&#x20;       </div>

&#x20;     )}

&#x20;   </AnimatePresence>

&#x20; );

}



src/components/game/death/GraveyardList.tsx

import { Player } from "@/shared/types/game";

import { Card } from "@/components/ui/Card";

import { PlayerAvatar } from "../PlayerAvatar";

import { RoleBadge } from "../RoleBadge";

import { Typography } from "@/components/ui/Typography";



interface GraveyardListProps {

&#x20; deadPlayers: Player\[];

}



export function GraveyardList({ deadPlayers }: GraveyardListProps) {

&#x20; if (deadPlayers.length === 0) {

&#x20;   return (

&#x20;     <Card className="text-center py-12">

&#x20;       <Typography variant="muted">The graveyard is still empty...</Typography>

&#x20;     </Card>

&#x20;   );

&#x20; }



&#x20; return (

&#x20;   <Card>

&#x20;     <div className="flex items-center gap-3 mb-8">

&#x20;       <div className="text-4xl">🪦</div>

&#x20;       <div>

&#x20;         <h3 className="text-2xl font-bold tracking-wide text-\[#E5E7EB]">Graveyard</h3>

&#x20;         <p className="text-\[#9CA3AF] text-sm">Those who fell to the night</p>

&#x20;       </div>

&#x20;     </div>



&#x20;     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

&#x20;       {deadPlayers.map((player) => (

&#x20;         <div

&#x20;           key={player.id}

&#x20;           className="flex gap-5 items-center bg-\[#0B0F1A] p-5 rounded-2xl border border-\[#4B5563]/50"

&#x20;         >

&#x20;           <div className="relative">

&#x20;             <PlayerAvatar 

&#x20;               name={player.name} 

&#x20;               isDead={true} 

&#x20;               size="md" 

&#x20;             />

&#x20;             <div className="absolute -top-1 -right-1 text-2xl">🪦</div>

&#x20;           </div>



&#x20;           <div className="flex-1 min-w-0">

&#x20;             <p className="font-semibold text-xl line-through text-\[#6B7280]">

&#x20;               {player.name}

&#x20;             </p>

&#x20;             <RoleBadge role={player.role} size="sm" />

&#x20;           </div>

&#x20;         </div>

&#x20;       ))}

&#x20;     </div>

&#x20;   </Card>

&#x20; );

}



src/components/game/death/LastWordsModal.tsx

"use client";

import { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/Button";

import { Textarea } from "@/components/ui/Textarea";



interface LastWordsModalProps {

&#x20; isOpen: boolean;

&#x20; playerName: string;

&#x20; onSubmit: (message: string) => void;

&#x20; onClose: () => void;

}



export function LastWordsModal({ isOpen, playerName, onSubmit, onClose }: LastWordsModalProps) {

&#x20; const \[message, setMessage] = useState("");



&#x20; const handleSubmit = () => {

&#x20;   onSubmit(message.trim() || "...");

&#x20;   onClose();

&#x20; };



&#x20; return (

&#x20;   <AnimatePresence>

&#x20;     {isOpen \&\& (

&#x20;       <div className="fixed inset-0 z-\[200] flex items-center justify-center bg-black/90 backdrop-blur-xl">

&#x20;         <motion.div

&#x20;           initial={{ opacity: 0, scale: 0.8 }}

&#x20;           animate={{ opacity: 1, scale: 1 }}

&#x20;           exit={{ opacity: 0, scale: 0.85 }}

&#x20;           className="bg-\[#111827] border border-\[#DC2626]/30 rounded-3xl max-w-md w-full mx-4 p-10"

&#x20;         >

&#x20;           <div className="text-center mb-8">

&#x20;             <div className="text-6xl mb-4">🪦</div>

&#x20;             <h2 className="text-3xl font-bold text-\[#E5E7EB]">Last Words</h2>

&#x20;             <p className="text-\[#9CA3AF] mt-2">

&#x20;               {playerName}, speak your final message to the village...

&#x20;             </p>

&#x20;           </div>



&#x20;           <Textarea

&#x20;             value={message}

&#x20;             onChange={(e) => setMessage(e.target.value)}

&#x20;             placeholder="They will pay for this... or perhaps a final clue?"

&#x20;             className="min-h-\[140px] mb-8"

&#x20;           />



&#x20;           <div className="flex gap-4">

&#x20;             <Button variant="secondary" onClick={onClose} className="flex-1">

&#x20;               Skip

&#x20;             </Button>

&#x20;             <Button 

&#x20;               variant="danger" 

&#x20;               onClick={handleSubmit}

&#x20;               className="flex-1"

&#x20;             >

&#x20;               SPEAK YOUR LAST WORDS

&#x20;             </Button>

&#x20;           </div>

&#x20;         </motion.div>

&#x20;       </div>

&#x20;     )}

&#x20;   </AnimatePresence>

&#x20; );

}



src/components/game/chat/MessageBubble.tsx

import { Message } from "./types";



interface MessageBubbleProps {

&#x20; message: Message;

&#x20; isOwn: boolean;

}



export function MessageBubble({ message, isOwn }: MessageBubbleProps) {

&#x20; const isWerewolfChat = message.channel === "werewolf";



&#x20; return (

&#x20;   <div className={`flex ${isOwn ? "justify-end" : "justify-start"} group`}>

&#x20;     <div

&#x20;       className={`

&#x20;         max-w-\[75%] px-5 py-3.5 rounded-3xl text-\[15px] leading-relaxed

&#x20;         ${isOwn 

&#x20;           ? "bg-\[#7C3AED] text-white rounded-br-none" 

&#x20;           : isWerewolfChat 

&#x20;             ? "bg-\[#991B1B]/90 text-\[#FEE2E2] border border-\[#EF4444]/30 rounded-bl-none" 

&#x20;             : "bg-\[#1F2937] text-\[#E5E7EB] border border-white/10 rounded-bl-none"

&#x20;         }

&#x20;       `}

&#x20;     >

&#x20;       {!isOwn \&\& message.sender \&\& (

&#x20;         <p className="text-xs opacity-70 mb-1 font-medium tracking-wide">

&#x20;           {message.sender}

&#x20;           {isWerewolfChat \&\& <span className="ml-2 text-\[#FCA5A5]">🐺</span>}

&#x20;         </p>

&#x20;       )}

&#x20;       

&#x20;       <p>{message.content}</p>

&#x20;       

&#x20;       <p className="text-\[10px] opacity-60 mt-2 text-right">

&#x20;         {message.timestamp}

&#x20;       </p>

&#x20;     </div>

&#x20;   </div>

&#x20; );

}





src/components/game/chat/SystemMessage.tsx

import { motion } from "framer-motion";



interface SystemMessageProps {

&#x20; content: string;

&#x20; type?: "normal" | "death" | "vote";

}



export function SystemMessage({ content, type = "normal" }: SystemMessageProps) {

&#x20; const colors = {

&#x20;   normal: "text-\[#F59E0B]",

&#x20;   death: "text-\[#DC2626]",

&#x20;   vote: "text-\[#7C3AED]",

&#x20; };



&#x20; return (

&#x20;   <motion.div

&#x20;     initial={{ opacity: 0, y: 10 }}

&#x20;     animate={{ opacity: 1, y: 0 }}

&#x20;     className="flex justify-center my-4"

&#x20;   >

&#x20;     <div

&#x20;       className={`

&#x20;         px-6 py-2 text-sm font-medium tracking-widest rounded-2xl border

&#x20;         ${colors\[type]} border-white/10 bg-black/40

&#x20;       `}

&#x20;     >

&#x20;       {type === "death" \&\& "☠️ "}

&#x20;       {type === "vote" \&\& "⚖️ "}

&#x20;       {content}

&#x20;     </div>

&#x20;   </motion.div>

&#x20; );

}



src/components/game/chat/MessageList.tsx

"use client";

import { useEffect, useRef } from "react";

import { MessageBubble } from "./MessageBubble";

import { SystemMessage } from "./SystemMessage";

import { Message } from "./types";



interface MessageListProps {

&#x20; messages: Message\[];

}



export function MessageList({ messages }: MessageListProps) {

&#x20; const scrollRef = useRef<HTMLDivElement>(null);



&#x20; useEffect(() => {

&#x20;   if (scrollRef.current) {

&#x20;     scrollRef.current.scrollTo({

&#x20;       top: scrollRef.current.scrollHeight,

&#x20;       behavior: "smooth",

&#x20;     });

&#x20;   }

&#x20; }, \[messages]);



&#x20; return (

&#x20;   <div

&#x20;     ref={scrollRef}

&#x20;     className="flex-1 overflow-y-auto px-6 py-6 space-y-5 custom-scrollbar"

&#x20;   >

&#x20;     {messages.map((msg, index) => (

&#x20;       msg.type === "system" ? (

&#x20;         <SystemMessage 

&#x20;           key={index} 

&#x20;           content={msg.content} 

&#x20;           type={msg.subtype} 

&#x20;         />

&#x20;       ) : (

&#x20;         <MessageBubble 

&#x20;           key={index} 

&#x20;           message={msg} 

&#x20;           isOwn={msg.isOwn || false} 

&#x20;         />

&#x20;       )

&#x20;     ))}

&#x20;   </div>

&#x20; );

}



src/components/game/chat/ChatInput.tsx

"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";

import { EmojiPicker } from "./EmojiPicker";



interface ChatInputProps {

&#x20; onSend: (message: string) => void;

&#x20; placeholder?: string;

&#x20; disabled?: boolean;

&#x20; isWerewolfChat?: boolean;

}



export function ChatInput({ 

&#x20; onSend, 

&#x20; placeholder = "Type your message...", 

&#x20; disabled = false,

&#x20; isWerewolfChat = false 

}: ChatInputProps) {

&#x20; const \[message, setMessage] = useState("");

&#x20; const \[showEmoji, setShowEmoji] = useState(false);



&#x20; const handleSend = () => {

&#x20;   if (message.trim()) {

&#x20;     onSend(message.trim());

&#x20;     setMessage("");

&#x20;   }

&#x20; };



&#x20; const handleEmojiSelect = (emoji: string) => {

&#x20;   setMessage(prev => prev + emoji);

&#x20;   setShowEmoji(false);

&#x20; };



&#x20; return (

&#x20;   <div className="border-t border-white/10 bg-\[#111827] p-4">

&#x20;     <div className="flex gap-3">

&#x20;       <div className="relative">

&#x20;         <Button

&#x20;           variant="ghost"

&#x20;           size="sm"

&#x20;           onClick={() => setShowEmoji(!showEmoji)}

&#x20;           className="text-2xl"

&#x20;         >

&#x20;           🙂

&#x20;         </Button>

&#x20;         <EmojiPicker 

&#x20;           isOpen={showEmoji} 

&#x20;           onSelect={handleEmojiSelect} 

&#x20;           onClose={() => setShowEmoji(false)} 

&#x20;         />

&#x20;       </div>



&#x20;       <input

&#x20;         type="text"

&#x20;         value={message}

&#x20;         onChange={(e) => setMessage(e.target.value)}

&#x20;         onKeyDown={(e) => e.key === "Enter" \&\& handleSend()}

&#x20;         placeholder={placeholder}

&#x20;         disabled={disabled}

&#x20;         className={`

&#x20;           flex-1 bg-\[#1F2937] border border-white/10 rounded-2xl px-6 py-3.5

&#x20;           text-\[#E5E7EB] placeholder:text-\[#6B7280] focus:outline-none focus:border-\[#7C3AED]

&#x20;           ${isWerewolfChat ? "focus:border-\[#DC2626]" : ""}

&#x20;         `}

&#x20;       />



&#x20;       <Button 

&#x20;         onClick={handleSend} 

&#x20;         disabled={!message.trim() || disabled}

&#x20;         variant={isWerewolfChat ? "danger" : "primary"}

&#x20;       >

&#x20;         Send

&#x20;       </Button>

&#x20;     </div>

&#x20;   </div>

&#x20; );

}



src/components/game/chat/EmojiPicker.tsx

"use client";

import { useEffect, useRef } from "react";



const commonEmojis = \["🌕", "🐺", "🔮", "🧙", "🛡️", "🏹", "☠️", "❤️", "💀", "🌑"];



interface EmojiPickerProps {

&#x20; isOpen: boolean;

&#x20; onSelect: (emoji: string) => void;

&#x20; onClose: () => void;

}



export function EmojiPicker({ isOpen, onSelect, onClose }: EmojiPickerProps) {

&#x20; const ref = useRef<HTMLDivElement>(null);



&#x20; useEffect(() => {

&#x20;   const handleClickOutside = (e: MouseEvent) => {

&#x20;     if (ref.current \&\& !ref.current.contains(e.target as Node)) onClose();

&#x20;   };

&#x20;   document.addEventListener("mousedown", handleClickOutside);

&#x20;   return () => document.removeEventListener("mousedown", handleClickOutside);

&#x20; }, \[onClose]);



&#x20; if (!isOpen) return null;



&#x20; return (

&#x20;   <div 

&#x20;     ref={ref}

&#x20;     className="absolute bottom-16 left-0 bg-\[#111827] border border-white/10 rounded-3xl p-4 shadow-2xl grid grid-cols-5 gap-2 z-50"

&#x20;   >

&#x20;     {commonEmojis.map((emoji, i) => (

&#x20;       <button

&#x20;         key={i}

&#x20;         onClick={() => onSelect(emoji)}

&#x20;         className="text-3xl hover:scale-125 transition-transform p-2"

&#x20;       >

&#x20;         {emoji}

&#x20;       </button>

&#x20;     ))}

&#x20;   </div>

&#x20; );

}



src/components/game/chat/PrivateMessagePanel.tsx

"use client";

import { useState } from "react";

import { MessageList } from "./MessageList";

import { ChatInput } from "./ChatInput";

import { Card } from "@/components/ui/Card";



interface PrivateMessagePanelProps {

&#x20; messages: any\[];

&#x20; onSend: (message: string) => void;

}



export function PrivateMessagePanel({ messages, onSend }: PrivateMessagePanelProps) {

&#x20; return (

&#x20;   <Card className="h-\[520px] flex flex-col border-\[#DC2626]/30">

&#x20;     <div className="px-6 py-4 border-b border-\[#DC2626]/30 flex items-center gap-3 bg-\[#991B1B]/10">

&#x20;       <span className="text-2xl">🐺</span>

&#x20;       <div>

&#x20;         <p className="font-bold text-\[#FCA5A5]">Werewolf Den</p>

&#x20;         <p className="text-xs text-\[#F87171]">Only your pack can see this</p>

&#x20;       </div>

&#x20;     </div>



&#x20;     <MessageList messages={messages} />



&#x20;     <ChatInput 

&#x20;       onSend={onSend} 

&#x20;       placeholder="Speak to your pack..." 

&#x20;       isWerewolfChat={true}

&#x20;     />

&#x20;   </Card>

&#x20; );

}



src/components/game/chat/ChatBox.tsx

"use client";

import { useState } from "react";

import { MessageList } from "./MessageList";

import { ChatInput } from "./ChatInput";

import { PrivateMessagePanel } from "./PrivateMessagePanel";

import { Card } from "@/components/ui/Card";

import { Button } from "@/components/ui/Button";



interface ChatBoxProps {

&#x20; messages: any\[];

&#x20; werewolfMessages?: any\[];

&#x20; onSendMessage: (message: string, channel?: "global" | "werewolf") => void;

&#x20; currentRole?: string;

}



export function ChatBox({ 

&#x20; messages, 

&#x20; werewolfMessages = \[], 

&#x20; onSendMessage,

&#x20; currentRole 

}: ChatBoxProps) {

&#x20; const \[activeTab, setActiveTab] = useState<"global" | "werewolf">("global");

&#x20; const isWerewolf = currentRole === "WEREWOLF";



&#x20; return (

&#x20;   <Card className="h-\[620px] flex flex-col overflow-hidden border-white/10">

&#x20;     {/\* Tabs \*/}

&#x20;     <div className="flex border-b border-white/10">

&#x20;       <button

&#x20;         onClick={() => setActiveTab("global")}

&#x20;         className={`flex-1 py-4 font-medium tracking-widest text-sm transition-all ${

&#x20;           activeTab === "global" 

&#x20;             ? "text-\[#E5E7EB] border-b-2 border-\[#7C3AED]" 

&#x20;             : "text-\[#9CA3AF]"

&#x20;         }`}

&#x20;       >

&#x20;         VILLAGE SQUARE

&#x20;       </button>

&#x20;       

&#x20;       {isWerewolf \&\& (

&#x20;         <button

&#x20;           onClick={() => setActiveTab("werewolf")}

&#x20;           className={`flex-1 py-4 font-medium tracking-widest text-sm transition-all ${

&#x20;             activeTab === "werewolf" 

&#x20;               ? "text-\[#FCA5A5] border-b-2 border-\[#DC2626]" 

&#x20;               : "text-\[#9CA3AF]"

&#x20;           }`}

&#x20;         >

&#x20;           🐺 WOLF DEN

&#x20;         </button>

&#x20;       )}

&#x20;     </div>



&#x20;     {activeTab === "global" ? (

&#x20;       <>

&#x20;         <MessageList messages={messages} />

&#x20;         <ChatInput onSend={(msg) => onSendMessage(msg, "global")} />

&#x20;       </>

&#x20;     ) : (

&#x20;       <PrivateMessagePanel 

&#x20;         messages={werewolfMessages} 

&#x20;         onSend={(msg) => onSendMessage(msg, "werewolf")} 

&#x20;       />

&#x20;     )}

&#x20;   </Card>

&#x20; );

}



src/components/game/chat/types.ts

export interface Message {

&#x20; id: string;

&#x20; sender?: string;

&#x20; content: string;

&#x20; timestamp: string;

&#x20; isOwn?: boolean;

&#x20; type?: "message" | "system";

&#x20; subtype?: "normal" | "death" | "vote";

&#x20; channel?: "global" | "werewolf";

}



src/components/lobby/RoomCard.tsx

import { Room } from "@/shared/types/lobby";

import { Card } from "@/components/ui/Card";

import { Button } from "@/components/ui/Button";

import { HostBadge } from "./HostBadge";



interface RoomCardProps {

&#x20; room: Room;

&#x20; onJoin: (roomId: string) => void;

}



export function RoomCard({ room, onJoin }: RoomCardProps) {

&#x20; const isFull = room.currentPlayers >= room.maxPlayers;



&#x20; return (

&#x20;   <Card className="hover:scale-\[1.02] transition-all group">

&#x20;     <div className="flex justify-between items-start mb-6">

&#x20;       <div>

&#x20;         <div className="flex items-center gap-3">

&#x20;           <h3 className="text-2xl font-bold tracking-wide text-\[#E5E7EB]">{room.name}</h3>

&#x20;           <HostBadge isHost={true} size="sm" />

&#x20;         </div>

&#x20;         <p className="text-\[#9CA3AF] text-sm mt-1">Hosted by {room.hostName}</p>

&#x20;       </div>



&#x20;       <div className={`px-4 py-1 rounded-xl text-sm font-medium tracking-widest

&#x20;         ${isFull ? "bg-\[#4B5563] text-white" : "bg-\[#16A34A]/10 text-\[#4ADE80]"}`}>

&#x20;         {room.currentPlayers}/{room.maxPlayers}

&#x20;       </div>

&#x20;     </div>



&#x20;     <div className="flex gap-2 mb-6">

&#x20;       <div className="text-xs px-3 py-1 bg-\[#1F2937] rounded-xl">🌕 NIGHT MODE</div>

&#x20;       <div className="text-xs px-3 py-1 bg-\[#1F2937] rounded-xl">6-12 PLAYERS</div>

&#x20;     </div>



&#x20;     <Button 

&#x20;       onClick={() => onJoin(room.id)}

&#x20;       disabled={isFull}

&#x20;       variant={isFull ? "secondary" : "primary"}

&#x20;       className="w-full"

&#x20;     >

&#x20;       {isFull ? "ROOM FULL" : "JOIN THE TABLE"}

&#x20;     </Button>

&#x20;   </Card>

&#x20; );

}



src/components/lobby/RoomList.tsx

import { Room } from "@/shared/types/lobby";

import { RoomCard } from "./RoomCard";



interface RoomListProps {

&#x20; rooms: Room\[];

&#x20; onJoinRoom: (roomId: string) => void;

}



export function RoomList({ rooms, onJoinRoom }: RoomListProps) {

&#x20; if (rooms.length === 0) {

&#x20;   return (

&#x20;     <div className="text-center py-20">

&#x20;       <div className="text-6xl mb-6 opacity-40">🌕</div>

&#x20;       <p className="text-\[#9CA3AF]">No rooms available under the moonlight...</p>

&#x20;     </div>

&#x20;   );

&#x20; }



&#x20; return (

&#x20;   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

&#x20;     {rooms.map((room) => (

&#x20;       <RoomCard key={room.id} room={room} onJoin={onJoinRoom} />

&#x20;     ))}

&#x20;   </div>

&#x20; );

}



src/components/lobby/PlayerSlot.tsx

import { Player } from "@/shared/types/game";

import { Avatar } from "@/components/ui/Avatar";

import { HostBadge } from "./HostBadge";

import { ReadyToggle } from "./ReadyToggle";

import { KickPlayerButton } from "./KickPlayerButton";



interface PlayerSlotProps {

&#x20; player: Player;

&#x20; isHost?: boolean;

&#x20; isCurrentUser?: boolean;

&#x20; canKick?: boolean;

&#x20; onKick?: (playerId: string) => void;

&#x20; onReadyChange?: (ready: boolean) => void;

}



export function PlayerSlot({ 

&#x20; player, 

&#x20; isHost = false, 

&#x20; isCurrentUser = false,

&#x20; canKick = false,

&#x20; onKick,

&#x20; onReadyChange 

}: PlayerSlotProps) {

&#x20; return (

&#x20;   <div className="bg-\[#111827] border border-white/10 rounded-2xl p-5 flex items-center gap-5 group">

&#x20;     <div className="relative">

&#x20;       <Avatar name={player.name} isDead={false} />

&#x20;       {isHost \&\& <HostBadge isHost={true} className="absolute -top-1 -right-1" />}

&#x20;     </div>



&#x20;     <div className="flex-1">

&#x20;       <div className="flex items-center gap-3">

&#x20;         <p className="font-semibold text-lg">{player.name}</p>

&#x20;         {isCurrentUser \&\& <span className="text-\[#7C3AED] text-xs tracking-widest">(YOU)</span>}

&#x20;       </div>

&#x20;       <p className="text-sm text-\[#9CA3AF]">{player.role || "Waiting"}</p>

&#x20;     </div>



&#x20;     <div className="flex items-center gap-4">

&#x20;       <ReadyToggle 

&#x20;         isReady={player.isReady || false} 

&#x20;         onChange={onReadyChange}

&#x20;         disabled={!isCurrentUser}

&#x20;       />

&#x20;       

&#x20;       {canKick \&\& onKick \&\& (

&#x20;         <KickPlayerButton onKick={() => onKick(player.id)} />

&#x20;       )}

&#x20;     </div>

&#x20;   </div>

&#x20; );

}



src/components/lobby/EmptySlot.tsx

export function EmptySlot() {

&#x20; return (

&#x20;   <div className="border-2 border-dashed border-\[#374151] rounded-2xl h-\[92px] flex items-center justify-center">

&#x20;     <p className="text-\[#6B7280] text-sm tracking-widest">EMPTY SEAT — AWAITING PLAYER</p>

&#x20;   </div>

&#x20; );

}



src/components/lobby/ReadyToggle.tsx

"use client";

import { useState } from "react";



interface ReadyToggleProps {

&#x20; isReady: boolean;

&#x20; onChange?: (ready: boolean) => void;

&#x20; disabled?: boolean;

}



export function ReadyToggle({ isReady, onChange, disabled = false }: ReadyToggleProps) {

&#x20; return (

&#x20;   <button

&#x20;     onClick={() => !disabled \&\& onChange?.(!isReady)}

&#x20;     disabled={disabled}

&#x20;     className={`

&#x20;       px-5 py-2 rounded-2xl font-medium text-sm tracking-widest transition-all

&#x20;       ${isReady 

&#x20;         ? "bg-\[#16A34A] text-white" 

&#x20;         : "bg-\[#1F2937] border border-\[#4B5563] hover:border-\[#16A34A]"

&#x20;       }

&#x20;       ${disabled ? "opacity-50 cursor-not-allowed" : ""}

&#x20;     `}

&#x20;   >

&#x20;     {isReady ? "✓ READY" : "READY UP"}

&#x20;   </button>

&#x20; );

}



src/components/lobby/HostBadge.tsx

import { Crown } from "lucide-react";



interface HostBadgeProps {

&#x20; isHost: boolean;

&#x20; size?: "sm" | "md";

&#x20; className?: string;

}



export function HostBadge({ isHost, size = "md", className = "" }: HostBadgeProps) {

&#x20; if (!isHost) return null;



&#x20; return (

&#x20;   <div className={`inline-flex items-center gap-1.5 px-3 py-1 bg-\[#7C3AED]/10 border border-\[#7C3AED]/50 rounded-xl ${className}`}>

&#x20;     <Crown className={`text-\[#C4B5FD] ${size === "sm" ? "w-4 h-4" : "w-5 h-5"}`} />

&#x20;     <span className="text-xs font-bold tracking-widest text-\[#C4B5FD]">HOST</span>

&#x20;   </div>

&#x20; );

}



src/components/lobby/StartGameButton.tsx \& LeaveRoomButton.tsx

// StartGameButton.tsx

import { Button } from "@/components/ui/Button";



interface StartGameButtonProps {

&#x20; onStart: () => void;

&#x20; disabled?: boolean;

&#x20; playerCount: number;

}



export function StartGameButton({ onStart, disabled, playerCount }: StartGameButtonProps) {

&#x20; return (

&#x20;   <Button

&#x20;     variant="primary"

&#x20;     size="lg"

&#x20;     onClick={onStart}

&#x20;     disabled={disabled}

&#x20;     className="w-full"

&#x20;   >

&#x20;     🌕 BEGIN THE NIGHT — {playerCount}/12

&#x20;   </Button>

&#x20; );

}



// LeaveRoomButton.tsx

import { Button } from "@/components/ui/Button";



export function LeaveRoomButton({ onLeave }: { onLeave: () => void }) {

&#x20; return (

&#x20;   <Button variant="danger" onClick={onLeave}>

&#x20;     LEAVE THE TABLE

&#x20;   </Button>

&#x20; );

}



src/components/lobby/KickPlayerButton.tsx

import { Button } from "@/components/ui/Button";



export function KickPlayerButton({ onKick }: { onKick: () => void }) {

&#x20; return (

&#x20;   <Button 

&#x20;     variant="ghost" 

&#x20;     size="sm"

&#x20;     onClick={onKick}

&#x20;     className="text-\[#DC2626] hover:text-\[#F87171]"

&#x20;   >

&#x20;     KICK

&#x20;   </Button>

&#x20; );

}



src/components/lobby/RoomInfoPanel.tsx

"use client";

import { Room, Player } from "@/shared/types/lobby";

import { PlayerSlot } from "./PlayerSlot";

import { EmptySlot } from "./EmptySlot";

import { StartGameButton } from "./StartGameButton";

import { LeaveRoomButton } from "./LeaveRoomButton";



interface RoomInfoPanelProps {

&#x20; room: Room;

&#x20; currentUserId: string;

&#x20; onReadyChange: (ready: boolean) => void;

&#x20; onKickPlayer: (playerId: string) => void;

&#x20; onLeaveRoom: () => void;

&#x20; onStartGame: () => void;

}



export function RoomInfoPanel({

&#x20; room,

&#x20; currentUserId,

&#x20; onReadyChange,

&#x20; onKickPlayer,

&#x20; onLeaveRoom,

&#x20; onStartGame,

}: RoomInfoPanelProps) {

&#x20; const isHost = room.hostId === currentUserId;

&#x20; const allReady = room.players.every(p => p.isReady) \&\& room.players.length >= 6;



&#x20; return (

&#x20;   <div className="max-w-5xl mx-auto">

&#x20;     <div className="flex justify-between items-center mb-10">

&#x20;       <div>

&#x20;         <h1 className="text-4xl font-bold tracking-wide">{room.name}</h1>

&#x20;         <p className="text-\[#9CA3AF]">Room Code: <span className="font-mono text-\[#7C3AED]">{room.code}</span></p>

&#x20;       </div>

&#x20;       <LeaveRoomButton onLeave={onLeaveRoom} />

&#x20;     </div>



&#x20;     <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

&#x20;       {/\* Players Grid \*/}

&#x20;       <div className="lg:col-span-8">

&#x20;         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

&#x20;           {room.players.map((player) => (

&#x20;             <PlayerSlot

&#x20;               key={player.id}

&#x20;               player={player}

&#x20;               isHost={room.hostId === player.id}

&#x20;               isCurrentUser={player.id === currentUserId}

&#x20;               canKick={isHost \&\& player.id !== currentUserId}

&#x20;               onKick={onKickPlayer}

&#x20;               onReadyChange={onReadyChange}

&#x20;             />

&#x20;           ))}

&#x20;           

&#x20;           {/\* Empty Slots \*/}

&#x20;           {Array.from({ length: room.maxPlayers - room.players.length }).map((\_, i) => (

&#x20;             <EmptySlot key={i} />

&#x20;           ))}

&#x20;         </div>

&#x20;       </div>



&#x20;       {/\* Sidebar \*/}

&#x20;       <div className="lg:col-span-4">

&#x20;         <div className="sticky top-8 space-y-6">

&#x20;           <div className="bg-\[#111827] rounded-3xl p-8">

&#x20;             <h4 className="uppercase tracking-widest text-sm text-\[#9CA3AF] mb-6">ROOM SETTINGS</h4>

&#x20;             <div className="space-y-4 text-sm">

&#x20;               <div className="flex justify-between"><span>Players</span><span>{room.currentPlayers}/{room.maxPlayers}</span></div>

&#x20;               <div className="flex justify-between"><span>Game Speed</span><span>Normal</span></div>

&#x20;               <div className="flex justify-between"><span>Roles</span><span>Classic Set</span></div>

&#x20;             </div>

&#x20;           </div>



&#x20;           {isHost \&\& (

&#x20;             <StartGameButton 

&#x20;               onStart={onStartGame} 

&#x20;               disabled={!allReady} 

&#x20;               playerCount={room.currentPlayers} 

&#x20;             />

&#x20;           )}

&#x20;         </div>

&#x20;       </div>

&#x20;     </div>

&#x20;   </div>

&#x20; );

}



CreateRoomModal.tsx \& JoinRoomModal.tsx

// CreateRoomModal.tsx (simplified)

"use client";

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";

import { Button } from "@/components/ui/Button";

import { Input } from "@/components/ui/Input";



interface CreateRoomModalProps {

&#x20; isOpen: boolean;

&#x20; onClose: () => void;

&#x20; onCreate: (roomName: string) => void;

}



export function CreateRoomModal({ isOpen, onClose, onCreate }: CreateRoomModalProps) {

&#x20; const \[roomName, setRoomName] = useState("");



&#x20; return (

&#x20;   <Modal isOpen={isOpen} onClose={onClose} title="Create New Room">

&#x20;     <Input

&#x20;       label="Room Name"

&#x20;       placeholder="The Howling Moon"

&#x20;       value={roomName}

&#x20;       onChange={(e) => setRoomName(e.target.value)}

&#x20;     />

&#x20;     <Button 

&#x20;       onClick={() => onCreate(roomName)} 

&#x20;       className="w-full mt-6"

&#x20;       disabled={!roomName.trim()}

&#x20;     >

&#x20;       CREATE ROOM UNDER THE MOON

&#x20;     </Button>

&#x20;   </Modal>

&#x20; );

}

(JoinRoomModal is similar — uses room code input)



src/components/game/GameStartAnimation.tsx

"use client";

import { motion, AnimatePresence } from "framer-motion";



interface GameStartAnimationProps {

&#x20; isVisible: boolean;

&#x20; onComplete?: () => void;

}



export function GameStartAnimation({ isVisible, onComplete }: GameStartAnimationProps) {

&#x20; return (

&#x20;   <AnimatePresence onExitComplete={onComplete}>

&#x20;     {isVisible \&\& (

&#x20;       <div className="fixed inset-0 z-\[300] flex items-center justify-center bg-black/95">

&#x20;         <div className="relative text-center">

&#x20;           {/\* Moon Pulse \*/}

&#x20;           <motion.div

&#x20;             initial={{ scale: 0.2, opacity: 0 }}

&#x20;             animate={{ 

&#x20;               scale: \[0.2, 1.2, 1],

&#x20;               opacity: \[0, 1, 1]

&#x20;             }}

&#x20;             transition={{ duration: 1.8, ease: "easeOut" }}

&#x20;             className="mx-auto mb-12 text-\[180px] drop-shadow-\[0\_0\_80px\_#C4B5FD]"

&#x20;           >

&#x20;             🌕

&#x20;           </motion.div>



&#x20;           <motion.h1

&#x20;             initial={{ opacity: 0, y: 40 }}

&#x20;             animate={{ opacity: 1, y: 0 }}

&#x20;             transition={{ delay: 0.6 }}

&#x20;             className="text-7xl font-black tracking-\[8px] text-white"

&#x20;           >

&#x20;             THE NIGHT BEGINS

&#x20;           </motion.h1>



&#x20;           <motion.p

&#x20;             initial={{ opacity: 0 }}

&#x20;             animate={{ opacity: 1 }}

&#x20;             transition={{ delay: 1.2 }}

&#x20;             className="mt-6 text-\[#9CA3AF] text-xl tracking-widest"

&#x20;           >

&#x20;             May the moonlight reveal the truth...

&#x20;           </motion.p>



&#x20;           {/\* Subtle howling effect \*/}

&#x20;           <motion.div

&#x20;             animate={{ opacity: \[0, 0.6, 0] }}

&#x20;             transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}

&#x20;             className="absolute -bottom-20 left-1/2 -translate-x-1/2 text-8xl"

&#x20;           >

&#x20;             🐺

&#x20;           </motion.div>

&#x20;         </div>

&#x20;       </div>

&#x20;     )}

&#x20;   </AnimatePresence>

&#x20; );

}



src/components/game/RoleDistributionAnimation.tsx

"use client";

import { motion, AnimatePresence } from "framer-motion";

import { Role } from "@/shared/types/game";

import { RoleBadge } from "./RoleBadge";



interface RoleDistributionAnimationProps {

&#x20; isVisible: boolean;

&#x20; playerRole: Role;

&#x20; playerName: string;

&#x20; onComplete?: () => void;

}



export function RoleDistributionAnimation({ 

&#x20; isVisible, 

&#x20; playerRole, 

&#x20; playerName,

&#x20; onComplete 

}: RoleDistributionAnimationProps) {

&#x20; return (

&#x20;   <AnimatePresence onExitComplete={onComplete}>

&#x20;     {isVisible \&\& (

&#x20;       <div className="fixed inset-0 z-\[310] bg-black/95 flex items-center justify-center">

&#x20;         <div className="text-center max-w-md">

&#x20;           <motion.div

&#x20;             initial={{ opacity: 0 }}

&#x20;             animate={{ opacity: 1 }}

&#x20;             className="mb-12"

&#x20;           >

&#x20;             <div className="text-6xl mb-6">🌕</div>

&#x20;             <p className="text-\[#9CA3AF] tracking-\[4px] text-sm">THE MOON HAS CHOSEN</p>

&#x20;           </motion.div>



&#x20;           <motion.div

&#x20;             initial={{ scale: 0.6, rotate: -12 }}

&#x20;             animate={{ scale: 1, rotate: 0 }}

&#x20;             transition={{ type: "spring", bounce: 0.4, duration: 1.2 }}

&#x20;           >

&#x20;             <RoleBadge role={playerRole} size="lg" />

&#x20;           </motion.div>



&#x20;           <motion.h2

&#x20;             initial={{ opacity: 0, y: 30 }}

&#x20;             animate={{ opacity: 1, y: 0 }}

&#x20;             transition={{ delay: 0.8 }}

&#x20;             className="mt-10 text-5xl font-bold text-white"

&#x20;           >

&#x20;             {playerName}

&#x20;           </motion.h2>



&#x20;           <motion.p

&#x20;             initial={{ opacity: 0 }}

&#x20;             animate={{ opacity: 1 }}

&#x20;             transition={{ delay: 1.2 }}

&#x20;             className="mt-8 text-2xl text-\[#C4B5FD]"

&#x20;           >

&#x20;             You are the <span className="font-bold">{playerRole}</span>

&#x20;           </motion.p>

&#x20;         </div>

&#x20;       </div>

&#x20;     )}

&#x20;   </AnimatePresence>

&#x20; );

}



src/components/game/WinnerBanner.tsx

"use client";

import { motion } from "framer-motion";

import confetti from "canvas-confetti";



interface WinnerBannerProps {

&#x20; winner: "VILLAGE" | "WEREWOLVES";

&#x20; onContinue?: () => void;

}



export function WinnerBanner({ winner, onContinue }: WinnerBannerProps) {

&#x20; const isVillageWin = winner === "VILLAGE";



&#x20; // Trigger confetti on mount

&#x20; React.useEffect(() => {

&#x20;   if (isVillageWin) {

&#x20;     confetti({

&#x20;       particleCount: 180,

&#x20;       spread: 80,

&#x20;       origin: { y: 0.6 }

&#x20;     });

&#x20;   } else {

&#x20;     // Red particles for werewolf win

&#x20;     confetti({

&#x20;       particleCount: 120,

&#x20;       spread: 70,

&#x20;       colors: \['#DC2626', '#991B1B'],

&#x20;       origin: { y: 0.6 }

&#x20;     });

&#x20;   }

&#x20; }, \[isVillageWin]);



&#x20; return (

&#x20;   <motion.div

&#x20;     initial={{ opacity: 0, y: -60 }}

&#x20;     animate={{ opacity: 1, y: 0 }}

&#x20;     className="text-center py-16"

&#x20;   >

&#x20;     <motion.div

&#x20;       animate={{ scale: \[1, 1.08, 1] }}

&#x20;       transition={{ duration: 2.5, repeat: Infinity }}

&#x20;       className="inline-block mb-8 text-8xl"

&#x20;     >

&#x20;       {isVillageWin ? "🌟" : "🐺"}

&#x20;     </motion.div>



&#x20;     <h1 className={`text-7xl font-black tracking-widest mb-4 ${isVillageWin ? "text-\[#4ADE80]" : "text-\[#F87171]"}`}>

&#x20;       {isVillageWin ? "THE VILLAGE SURVIVES" : "THE WOLVES REIGN"}

&#x20;     </h1>



&#x20;     <p className="text-2xl text-\[#E5E7EB]/80">

&#x20;       {isVillageWin 

&#x20;         ? "The monsters have been driven out." 

&#x20;         : "The night has claimed its victory."}

&#x20;     </p>



&#x20;     {onContinue \&\& (

&#x20;       <button

&#x20;         onClick={onContinue}

&#x20;         className="mt-12 px-14 py-5 bg-white/10 hover:bg-white/20 border border-white/30 rounded-2xl text-lg font-semibold tracking-widest transition-all"

&#x20;       >

&#x20;         RETURN TO LOBBY

&#x20;       </button>

&#x20;     )}

&#x20;   </motion.div>

&#x20; );

}



src/components/game/StatsBoard.tsx

import { Player } from "@/shared/types/game";



interface StatsBoardProps {

&#x20; players: Player\[];

&#x20; winner: "VILLAGE" | "WEREWOLVES" | null;

}



export function StatsBoard({ players, winner }: StatsBoardProps) {

&#x20; const alivePlayers = players.filter(p => p.isAlive);

&#x20; const deadPlayers = players.filter(p => !p.isAlive);



&#x20; return (

&#x20;   <div className="max-w-4xl mx-auto bg-\[#111827] rounded-3xl p-10">

&#x20;     <h3 className="text-2xl font-bold mb-8 tracking-wide text-center">GAME STATISTICS</h3>



&#x20;     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

&#x20;       {/\* Summary \*/}

&#x20;       <div className="bg-black/40 rounded-2xl p-6 text-center">

&#x20;         <div className="text-5xl mb-3">🏆</div>

&#x20;         <div className="text-\[#E5E7EB] text-xl font-semibold">WINNER</div>

&#x20;         <div className={`text-3xl font-black mt-2 ${winner === "VILLAGE" ? "text-\[#4ADE80]" : "text-\[#F87171]"}`}>

&#x20;           {winner}

&#x20;         </div>

&#x20;       </div>



&#x20;       {/\* Alive \*/}

&#x20;       <div className="bg-black/40 rounded-2xl p-6">

&#x20;         <div className="text-\[#16A34A] text-sm tracking-widest mb-4">SURVIVORS ({alivePlayers.length})</div>

&#x20;         <ul className="space-y-3">

&#x20;           {alivePlayers.map(p => (

&#x20;             <li key={p.id} className="flex justify-between text-\[#E5E7EB]">

&#x20;               <span>{p.name}</span>

&#x20;               <span className="text-xs opacity-60">{p.role}</span>

&#x20;             </li>

&#x20;           ))}

&#x20;         </ul>

&#x20;       </div>



&#x20;       {/\* Dead \*/}

&#x20;       <div className="bg-black/40 rounded-2xl p-6">

&#x20;         <div className="text-\[#DC2626] text-sm tracking-widest mb-4">FALLEN ({deadPlayers.length})</div>

&#x20;         <ul className="space-y-3">

&#x20;           {deadPlayers.map(p => (

&#x20;             <li key={p.id} className="flex justify-between text-\[#9CA3AF] line-through">

&#x20;               <span>{p.name}</span>

&#x20;               <span className="text-xs opacity-60">{p.role}</span>

&#x20;             </li>

&#x20;           ))}

&#x20;         </ul>

&#x20;       </div>

&#x20;     </div>

&#x20;   </div>

&#x20; );

}



src/components/game/GameEndScreen.tsx

"use client";

import { motion } from "framer-motion";

import { WinnerBanner } from "./WinnerBanner";

import { StatsBoard } from "./StatsBoard";

import { Button } from "@/components/ui/Button";

import { Player } from "@/shared/types/game";



interface GameEndScreenProps {

&#x20; winner: "VILLAGE" | "WEREWOLVES";

&#x20; players: Player\[];

&#x20; onReturnToLobby: () => void;

}



export function GameEndScreen({ winner, players, onReturnToLobby }: GameEndScreenProps) {

&#x20; return (

&#x20;   <div className="min-h-screen bg-\[#0B0F1A] py-16 px-6">

&#x20;     <div className="max-w-5xl mx-auto">

&#x20;       <WinnerBanner winner={winner} onContinue={onReturnToLobby} />



&#x20;       <motion.div

&#x20;         initial={{ opacity: 0, y: 40 }}

&#x20;         animate={{ opacity: 1, y: 0 }}

&#x20;         transition={{ delay: 0.8 }}

&#x20;       >

&#x20;         <StatsBoard players={players} winner={winner} />

&#x20;       </motion.div>



&#x20;       <div className="flex justify-center mt-16">

&#x20;         <Button 

&#x20;           variant="secondary" 

&#x20;           size="lg"

&#x20;           onClick={onReturnToLobby}

&#x20;         >

&#x20;           RETURN TO THE LOBBY

&#x20;         </Button>

&#x20;       </div>

&#x20;     </div>

&#x20;   </div>

&#x20; );

}



src/components/animations/FadeTransition.tsx

"use client";

import { motion, AnimatePresence } from "framer-motion";

import { ReactNode } from "react";



interface FadeTransitionProps {

&#x20; children: ReactNode;

&#x20; isVisible: boolean;

&#x20; duration?: number;

}



export function FadeTransition({ children, isVisible, duration = 0.4 }: FadeTransitionProps) {

&#x20; return (

&#x20;   <AnimatePresence>

&#x20;     {isVisible \&\& (

&#x20;       <motion.div

&#x20;         initial={{ opacity: 0 }}

&#x20;         animate={{ opacity: 1 }}

&#x20;         exit={{ opacity: 0 }}

&#x20;         transition={{ duration }}

&#x20;       >

&#x20;         {children}

&#x20;       </motion.div>

&#x20;     )}

&#x20;   </AnimatePresence>

&#x20; );

}



src/components/animations/SlideTransition.tsx

"use client";

import { motion, AnimatePresence } from "framer-motion";

import { ReactNode } from "react";



interface SlideTransitionProps {

&#x20; children: ReactNode;

&#x20; isVisible: boolean;

&#x20; direction?: "up" | "down" | "left" | "right";

}



export function SlideTransition({ 

&#x20; children, 

&#x20; isVisible, 

&#x20; direction = "up" 

}: SlideTransitionProps) {

&#x20; const variants = {

&#x20;   up: { y: 30, opacity: 0 },

&#x20;   down: { y: -30, opacity: 0 },

&#x20;   left: { x: 40, opacity: 0 },

&#x20;   right: { x: -40, opacity: 0 },

&#x20; };



&#x20; return (

&#x20;   <AnimatePresence>

&#x20;     {isVisible \&\& (

&#x20;       <motion.div

&#x20;         initial={variants\[direction]}

&#x20;         animate={{ x: 0, y: 0, opacity: 1 }}

&#x20;         exit={variants\[direction]}

&#x20;         transition={{ duration: 0.5, ease: "easeOut" }}

&#x20;       >

&#x20;         {children}

&#x20;       </motion.div>

&#x20;     )}

&#x20;   </AnimatePresence>

&#x20; );

}



src/components/animations/ScaleAnimation.tsx

"use client";

import { motion } from "framer-motion";

import { ReactNode } from "react";



interface ScaleAnimationProps {

&#x20; children: ReactNode;

&#x20; trigger?: boolean;

&#x20; scale?: number;

&#x20; duration?: number;

}



export function ScaleAnimation({ 

&#x20; children, 

&#x20; trigger = true, 

&#x20; scale = 1.05,

&#x20; duration = 0.4 

}: ScaleAnimationProps) {

&#x20; return (

&#x20;   <motion.div

&#x20;     whileHover={{ scale }}

&#x20;     whileTap={{ scale: 0.98 }}

&#x20;     transition={{ duration }}

&#x20;   >

&#x20;     {children}

&#x20;   </motion.div>

&#x20; );

}



src/components/animations/PulseEffect.tsx

"use client";

import { motion } from "framer-motion";

import { ReactNode } from "react";



interface PulseEffectProps {

&#x20; children: ReactNode;

&#x20; intensity?: "subtle" | "medium" | "strong";

&#x20; color?: string;

}



export function PulseEffect({ 

&#x20; children, 

&#x20; intensity = "subtle",

&#x20; color = "#7C3AED" 

}: PulseEffectProps) {

&#x20; const intensityMap = {

&#x20;   subtle: 1.8,

&#x20;   medium: 1.4,

&#x20;   strong: 1.1,

&#x20; };



&#x20; return (

&#x20;   <motion.div

&#x20;     animate={{

&#x20;       boxShadow: \[

&#x20;         `0 0 15px ${color}30`,

&#x20;         `0 0 35px ${color}60`,

&#x20;         `0 0 15px ${color}30`,

&#x20;       ],

&#x20;     }}

&#x20;     transition={{

&#x20;       duration: intensityMap\[intensity],

&#x20;       repeat: Infinity,

&#x20;       ease: "easeInOut",

&#x20;     }}

&#x20;   >

&#x20;     {children}

&#x20;   </motion.div>

&#x20; );

}



src/components/animations/GlowEffect.tsx

tsx

"use client";

import { motion } from "framer-motion";

import { ReactNode } from "react";



interface GlowEffectProps {

&#x20; children: ReactNode;

&#x20; color?: string;

&#x20; intensity?: number;

}



export function GlowEffect({ 

&#x20; children, 

&#x20; color = "#7C3AED", 

&#x20; intensity = 40 

}: GlowEffectProps) {

&#x20; return (

&#x20;   <motion.div

&#x20;     animate={{

&#x20;       filter: \[

&#x20;         `drop-shadow(0 0 ${intensity}px ${color})`,

&#x20;         `drop-shadow(0 0 ${intensity + 20}px ${color})`,

&#x20;         `drop-shadow(0 0 ${intensity}px ${color})`,

&#x20;       ],

&#x20;     }}

&#x20;     transition={{ duration: 2.5, repeat: Infinity }}

&#x20;   >

&#x20;     {children}

&#x20;   </motion.div>

&#x20; );

}



src/components/animations/ShakeEffect.tsx

"use client";

import { motion } from "framer-motion";

import { ReactNode } from "react";



interface ShakeEffectProps {

&#x20; children: ReactNode;

&#x20; trigger: boolean;

&#x20; intensity?: number;

}



export function ShakeEffect({ children, trigger, intensity = 8 }: ShakeEffectProps) {

&#x20; return (

&#x20;   <motion.div

&#x20;     animate={trigger ? {

&#x20;       x: \[0, intensity, -intensity, intensity, 0],

&#x20;     } : {}}

&#x20;     transition={{ duration: 0.5 }}

&#x20;   >

&#x20;     {children}

&#x20;   </motion.div>

&#x20; );

}



src/components/animations/BloodEffect.tsx

"use client";

import { motion } from "framer-motion";



interface BloodEffectProps {

&#x20; isActive: boolean;

&#x20; children: React.ReactNode;

}



export function BloodEffect({ isActive, children }: BloodEffectProps) {

&#x20; return (

&#x20;   <div className="relative">

&#x20;     {children}

&#x20;     {isActive \&\& (

&#x20;       <motion.div

&#x20;         initial={{ opacity: 0 }}

&#x20;         animate={{ opacity: \[0, 0.25, 0] }}

&#x20;         transition={{ duration: 2.2, repeat: Infinity }}

&#x20;         className="absolute inset-0 bg-gradient-to-b from-transparent via-\[#991B1B]/40 to-transparent pointer-events-none"

&#x20;       />

&#x20;     )}

&#x20;   </div>

&#x20; );

}



src/components/animations/DarknessEffect.tsx

"use client";

import { motion } from "framer-motion";



export function DarknessEffect({ children, isActive }: { children: React.ReactNode; isActive: boolean }) {

&#x20; return (

&#x20;   <div className="relative overflow-hidden">

&#x20;     {children}

&#x20;     {isActive \&\& (

&#x20;       <motion.div

&#x20;         initial={{ opacity: 0 }}

&#x20;         animate={{ opacity: 0.85 }}

&#x20;         className="absolute inset-0 bg-\[#0B0F1A] mix-blend-multiply pointer-events-none"

&#x20;       />

&#x20;     )}

&#x20;   </div>

&#x20; );

}



src/components/animations/SpotlightEffect.tsx

"use client";

import { motion } from "framer-motion";

import { ReactNode } from "react";



interface SpotlightEffectProps {

&#x20; children: ReactNode;

&#x20; active?: boolean;

}



export function SpotlightEffect({ children, active = true }: SpotlightEffectProps) {

&#x20; return (

&#x20;   <div className="relative">

&#x20;     {children}

&#x20;     {active \&\& (

&#x20;       <motion.div

&#x20;         className="absolute inset-0 bg-\[radial-gradient(circle\_at\_center,#C4B5FD20\_10%,transparent\_70%)]"

&#x20;         animate={{

&#x20;           opacity: \[0.4, 0.7, 0.4],

&#x20;         }}

&#x20;         transition={{ duration: 4, repeat: Infinity }}

&#x20;       />

&#x20;     )}

&#x20;   </div>

&#x20; );

}



src/components/animations/ConfettiEffect.tsx

"use client";

import { useEffect } from "react";

import confetti from "canvas-confetti";



interface ConfettiEffectProps {

&#x20; trigger: boolean;

&#x20; type?: "victory" | "werewolf";

}



export function ConfettiEffect({ trigger, type = "victory" }: ConfettiEffectProps) {

&#x20; useEffect(() => {

&#x20;   if (!trigger) return;



&#x20;   const colors = type === "victory" 

&#x20;     ? \["#7C3AED", "#C4B5FD", "#4ADE80"] 

&#x20;     : \["#DC2626", "#F87171", "#991B1B"];



&#x20;   confetti({

&#x20;     particleCount: type === "victory" ? 220 : 140,

&#x20;     spread: 80,

&#x20;     origin: { y: 0.6 },

&#x20;     colors,

&#x20;   });

&#x20; }, \[trigger, type]);



&#x20; return null;

}



src/components/layout/AppLayout.tsx

"use client";

import { ReactNode } from "react";



interface AppLayoutProps {

&#x20; children: ReactNode;

&#x20; showSidebar?: boolean;

}



export function AppLayout({ children, showSidebar = true }: AppLayoutProps) {

&#x20; return (

&#x20;   <div className="min-h-screen bg-\[#0B0F1A] text-\[#E5E7EB] overflow-hidden">

&#x20;     <div className="flex h-screen">

&#x20;       {showSidebar \&\& <Sidebar />}

&#x20;       

&#x20;       <div className="flex-1 flex flex-col overflow-hidden">

&#x20;         <HeaderBar />

&#x20;         <main className="flex-1 overflow-auto relative">

&#x20;           {children}

&#x20;         </main>

&#x20;         <FooterControls />

&#x20;       </div>

&#x20;     </div>

&#x20;   </div>

&#x20; );

}



src/components/layout/Sidebar.tsx

import { Button } from "@/components/ui/Button";

import { Logo } from "./Logo";



export function Sidebar() {

&#x20; return (

&#x20;   <div className="w-72 bg-\[#111827] border-r border-white/10 flex flex-col">

&#x20;     {/\* Logo \*/}

&#x20;     <div className="p-8 border-b border-white/10">

&#x20;       <Logo />

&#x20;     </div>



&#x20;     {/\* Navigation \*/}

&#x20;     <div className="flex-1 p-6 space-y-2">

&#x20;       <Button variant="ghost" className="w-full justify-start text-left">

&#x20;         🌕 Lobby

&#x20;       </Button>

&#x20;       <Button variant="ghost" className="w-full justify-start text-left">

&#x20;         📜 How to Play

&#x20;       </Button>

&#x20;       <Button variant="ghost" className="w-full justify-start text-left">

&#x20;         🏆 Leaderboard

&#x20;       </Button>

&#x20;       <Button variant="ghost" className="w-full justify-start text-left">

&#x20;         ⚙️ Settings

&#x20;       </Button>

&#x20;     </div>



&#x20;     {/\* Bottom Info \*/}

&#x20;     <div className="p-6 border-t border-white/10 text-xs text-\[#9CA3AF]">

&#x20;       <div>Online: <span className="text-\[#16A34A]">248</span> players</div>

&#x20;       <div className="mt-1">Under the Full Moon</div>

&#x20;     </div>

&#x20;   </div>

&#x20; );

}



src/components/layout/HeaderBar.tsx

"use client";

import { GamePhase } from "@/shared/types/game";

import { PhaseBanner } from "@/components/game/PhaseBanner";



interface HeaderBarProps {

&#x20; phase?: GamePhase;

&#x20; day?: number;

&#x20; roomName?: string;

&#x20; roomCode?: string;

}



export function HeaderBar({ phase, day = 1, roomName = "The Howling Table", roomCode = "WOLF-4831" }: HeaderBarProps) {

&#x20; return (

&#x20;   <header className="h-20 border-b border-white/10 bg-\[#111827]/80 backdrop-blur-lg flex items-center px-8 z-50">

&#x20;     <div className="flex-1 flex items-center gap-8">

&#x20;       {/\* Room Info \*/}

&#x20;       <div>

&#x20;         <div className="font-bold tracking-wide text-lg">{roomName}</div>

&#x20;         <div className="text-xs text-\[#9CA3AF] font-mono">CODE: {roomCode}</div>

&#x20;       </div>



&#x20;       {/\* Phase Info \*/}

&#x20;       {phase \&\& (

&#x20;         <div className="pl-8 border-l border-white/10">

&#x20;           <PhaseBanner phase={phase} day={day} />

&#x20;         </div>

&#x20;       )}

&#x20;     </div>



&#x20;     {/\* Right side \*/}

&#x20;     <div className="flex items-center gap-6">

&#x20;       <div className="text-sm text-\[#9CA3AF]">

&#x20;         Ánh Dương • <span className="text-\[#7C3AED]">Werewolf</span>

&#x20;       </div>

&#x20;       <div className="w-9 h-9 rounded-2xl bg-\[#7C3AED] flex items-center justify-center text-xl">

&#x20;         🌕

&#x20;       </div>

&#x20;     </div>

&#x20;   </header>

&#x20; );

}



src/components/layout/FooterControls.tsx

"use client";

import { Button } from "@/components/ui/Button";



export function FooterControls() {

&#x20; return (

&#x20;   <footer className="h-16 border-t border-white/10 bg-\[#111827] flex items-center px-8 text-sm">

&#x20;     <div className="flex-1 flex items-center gap-8 text-\[#9CA3AF]">

&#x20;       <button className="hover:text-white transition-colors">Rules</button>

&#x20;       <button className="hover:text-white transition-colors">Sound</button>

&#x20;       <button className="hover:text-white transition-colors">Report Bug</button>

&#x20;     </div>



&#x20;     <div className="text-\[#6B7280] text-xs font-mono">

&#x20;       BUILT FOR THE NIGHT • v2026.04

&#x20;     </div>

&#x20;   </footer>

&#x20; );

}



src/components/layout/GameLayout.tsx

import { ReactNode } from "react";

import { AppLayout } from "./AppLayout";



interface GameLayoutProps {

&#x20; children: ReactNode;

&#x20; phase?: any;

&#x20; day?: number;

}



export function GameLayout({ children, phase, day }: GameLayoutProps) {

&#x20; return (

&#x20;   <AppLayout>

&#x20;     <div className="h-full flex flex-col">

&#x20;       {/\* Optional smaller header inside game \*/}

&#x20;       <div className="px-8 py-4 border-b border-white/10 bg-\[#0B0F1A]/80 backdrop-blur">

&#x20;         <div className="flex items-center justify-between">

&#x20;           <div className="text-sm uppercase tracking-widest text-\[#9CA3AF]">DAY {day} • {phase}</div>

&#x20;           <div className="text-\[#7C3AED]">Night Phase Active</div>

&#x20;         </div>

&#x20;       </div>



&#x20;       <div className="flex-1 p-8 overflow-auto">

&#x20;         {children}

&#x20;       </div>

&#x20;     </div>

&#x20;   </AppLayout>

&#x20; );

}



src/components/layout/LobbyLayout.tsx

import { ReactNode } from "react";

import { AppLayout } from "./AppLayout";



interface LobbyLayoutProps {

&#x20; children: ReactNode;

&#x20; title?: string;

}



export function LobbyLayout({ children, title = "The Gathering" }: LobbyLayoutProps) {

&#x20; return (

&#x20;   <AppLayout>

&#x20;     <div className="p-10">

&#x20;       <div className="max-w-7xl mx-auto">

&#x20;         <div className="mb-12">

&#x20;           <h1 className="text-6xl font-black tracking-widest text-white">{title}</h1>

&#x20;           <p className="text-\[#9CA3AF] mt-3 text-xl">The moon is watching. Choose your fate.</p>

&#x20;         </div>

&#x20;         {children}

&#x20;       </div>

&#x20;     </div>

&#x20;   </AppLayout>

&#x20; );

}



src/components/layout/Logo.tsx

export function Logo() {

&#x20; return (

&#x20;   <div className="flex items-center gap-3">

&#x20;     <div className="w-10 h-10 bg-gradient-to-br from-\[#7C3AED] to-\[#C4B5FD] rounded-2xl flex items-center justify-center text-3xl shadow-lg">

&#x20;       🌕

&#x20;     </div>

&#x20;     <div>

&#x20;       <div className="font-black text-2xl tracking-tighter">WEREWOLF</div>

&#x20;       <div className="text-xs text-\[#9CA3AF] -mt-1">NIGHTFALL</div>

&#x20;     </div>

&#x20;   </div>

&#x20; );

}



Shared Types (add to src/shared/types/game.ts)

tsxexport type UserRole = Role; // Reuse existing Role enum



export interface GameContextType {

&#x20; currentPlayerRole: Role;

&#x20; phase: GamePhase;

&#x20; isAlive: boolean;

&#x20; hasActed: boolean;           // For night actions

&#x20; isHost?: boolean;

&#x20; // ... other global state

}



src/components/guards/PermissionWrapper.tsx

"use client";

import { ReactNode } from "react";

import { Role } from "@/shared/types/game";

import { useGameStore } from "@/store/gameStore"; // We'll assume a Zustand/Jotai store



interface PermissionWrapperProps {

&#x20; children: ReactNode;

&#x20; role?: Role | Role\[];           // Required role(s)

&#x20; fallback?: ReactNode;

&#x20; showDisabled?: boolean;         // Show children but disabled

}



export function PermissionWrapper({

&#x20; children,

&#x20; role,

&#x20; fallback = null,

&#x20; showDisabled = false,

}: PermissionWrapperProps) {

&#x20; const { currentPlayerRole, isAlive } = useGameStore();



&#x20; // Not alive → nothing

&#x20; if (!isAlive) return fallback;



&#x20; // No role requirement → always show

&#x20; if (!role) {

&#x20;   return <>{children}</>;

&#x20; }



&#x20; const requiredRoles = Array.isArray(role) ? role : \[role];

&#x20; const hasPermission = requiredRoles.includes(currentPlayerRole);



&#x20; if (!hasPermission) {

&#x20;   return <>{fallback}</>;

&#x20; }



&#x20; if (showDisabled) {

&#x20;   return <div className="opacity-50 pointer-events-none">{children}</div>;

&#x20; }



&#x20; return <>{children}</>;

}



src/components/guards/PhaseGuard.tsx

"use client";

import { ReactNode } from "react";

import { GamePhase } from "@/shared/types/game";

import { useGameStore } from "@/store/gameStore";



interface PhaseGuardProps {

&#x20; children: ReactNode;

&#x20; allowedPhases: GamePhase | GamePhase\[];

&#x20; fallback?: ReactNode;

}



export function PhaseGuard({

&#x20; children,

&#x20; allowedPhases,

&#x20; fallback = null,

}: PhaseGuardProps) {

&#x20; const { phase } = useGameStore();



&#x20; const phases = Array.isArray(allowedPhases) ? allowedPhases : \[allowedPhases];

&#x20; const isAllowed = phases.includes(phase);



&#x20; if (!isAllowed) {

&#x20;   return <>{fallback}</>;

&#x20; }



&#x20; return <>{children}</>;

}



src/components/guards/VisibilityWrapper.tsx

"use client";

import { ReactNode } from "react";

import { Role, GamePhase } from "@/shared/types/game";

import { useGameStore } from "@/store/gameStore";



interface VisibilityWrapperProps {

&#x20; children: ReactNode;

&#x20; visibleTo?: Role | Role\[];           // Who can see this

&#x20; visibleInPhases?: GamePhase | GamePhase\[];

&#x20; fallback?: ReactNode;

}



export function VisibilityWrapper({

&#x20; children,

&#x20; visibleTo,

&#x20; visibleInPhases,

&#x20; fallback = null,

}: VisibilityWrapperProps) {

&#x20; const { currentPlayerRole, phase, isAlive } = useGameStore();



&#x20; if (!isAlive) return <>{fallback}</>;



&#x20; // Role visibility check

&#x20; if (visibleTo) {

&#x20;   const allowedRoles = Array.isArray(visibleTo) ? visibleTo : \[visibleTo];

&#x20;   if (!allowedRoles.includes(currentPlayerRole)) {

&#x20;     return <>{fallback}</>;

&#x20;   }

&#x20; }



&#x20; // Phase visibility check

&#x20; if (visibleInPhases) {

&#x20;   const allowedPhases = Array.isArray(visibleInPhases) ? visibleInPhases : \[visibleInPhases];

&#x20;   if (!allowedPhases.includes(phase)) {

&#x20;     return <>{fallback}</>;

&#x20;   }

&#x20; }



&#x20; return <>{children}</>;

}



src/

├── app/

│   ├── layout.tsx              # Root layout (AppLayout wrapper)

│   ├── page.tsx                # Landing / Home

│   ├── lobby/

│   │   └── page.tsx            # Lobby view

│   ├── game/

│   │   └── page.tsx            # Main game screen

│   └── api/                    # Optional route handlers

├── components/

│   ├── ui/                     # All primitive UI components

│   │   ├── Button.tsx

│   │   ├── Card.tsx

│   │   ├── Avatar.tsx

│   │   ├── Badge.tsx

│   │   ├── Modal.tsx

│   │   ├── Input.tsx

│   │   ├── Textarea.tsx

│   │   ├── ... (all UI primitives)

│   │   └── index.ts

│   ├── game/                   # Game-specific components

│   │   ├── PlayerCard.tsx

│   │   ├── PlayersGrid.tsx

│   │   ├── PhaseBanner.tsx

│   │   ├── RoleBadge.tsx

│   │   ├── RoleCard.tsx

│   │   ├── GameStartAnimation.tsx

│   │   ├── RoleDistributionAnimation.tsx

│   │   ├── GameEndScreen.tsx

│   │   ├── WinnerBanner.tsx

│   │   ├── StatsBoard.tsx

│   │   ├── DeathAnnouncement.tsx

│   │   ├── DeathAnimation.tsx

│   │   ├── GraveyardList.tsx

│   │   ├── LastWordsModal.tsx

│   │   ├── CountdownTimer.tsx

│   │   ├── CircularTimer.tsx

│   │   ├── VotePanel.tsx

│   │   ├── VoteResultModal.tsx

│   │   ├── ... (all game components)

│   │   ├── actions/            # Night actions

│   │   │   ├── WolfTargetSelector.tsx

│   │   │   ├── SeerInspectPanel.tsx

│   │   │   ├── ActionPanel.tsx

│   │   │   └── ...

│   │   ├── chat/               # Chat system

│   │   ├── death/              # Death UI

│   │   ├── lobby/              # Lobby-specific

│   │   └── guards/             # Logic guards

│   │       ├── PermissionWrapper.tsx

│   │       ├── PhaseGuard.tsx

│   │       ├── ActionGuard.tsx

│   │       └── VisibilityWrapper.tsx

│   └── layout/                 # Layout system

│       ├── AppLayout.tsx

│       ├── GameLayout.tsx

│       ├── LobbyLayout.tsx

│       ├── Sidebar.tsx

│       ├── HeaderBar.tsx

│       └── FooterControls.tsx

├── features/

│   ├── game/                   # Game feature slice

│   │   ├── GameBoard.tsx

│   │   └── GameProvider.tsx

│   ├── lobby/                  # Lobby feature slice

│   │   ├── LobbyView.tsx

│   │   └── RoomManager.tsx

│   └── chat/                   # Chat feature slice

│       └── ChatProvider.tsx

├── hooks/

│   ├── useGame.ts

│   ├── useWebSocket.ts

│   ├── usePhase.ts

│   └── usePlayerActions.ts

├── store/

│   ├── gameStore.ts            # Main Zustand store

│   └── uiStore.ts              # UI-only state (modals, toasts)

├── types/

│   ├── game.ts                 # Core game types

│   ├── lobby.ts

│   ├── chat.ts

│   └── index.ts

├── lib/

│   └── websocket.ts            # WebSocket client

└── utils/

&#x20;   └── cn.ts                   # classNames helper



















