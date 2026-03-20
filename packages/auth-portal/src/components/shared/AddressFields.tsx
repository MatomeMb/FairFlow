export type AddressForm = {
  name: string;
  line1: string;
  line2: string;
  suburb: string;
  city: string;
  postal_code: string;
  phone: string;
};

interface AddressFieldsProps {
  values: AddressForm;
  onChange: (updated: AddressForm) => void;
  errors: Record<string, string>;
  prefix: string;
}

const ADDRESS_FIELDS = [
  { key: 'name', label: 'Recipient Name', placeholder: 'Full name', required: true },
  { key: 'line1', label: 'Street Address', placeholder: '123 Main Street', required: true },
  { key: 'line2', label: 'Apartment / Floor', placeholder: 'Unit 4B (optional)', required: false },
  { key: 'suburb', label: 'Suburb', placeholder: 'Sandton', required: false },
  { key: 'city', label: 'City', placeholder: 'Johannesburg', required: true },
  { key: 'postal_code', label: 'Postal Code', placeholder: '2196', required: true },
  { key: 'phone', label: 'Phone', placeholder: '+27 82 000 0000', required: true },
] as const;

const AUTOCOMPLETE_BY_KEY: Record<(typeof ADDRESS_FIELDS)[number]['key'], string> = {
  name: 'name',
  line1: 'address-line1',
  line2: 'address-line2',
  suburb: 'address-level2',
  city: 'address-level1',
  postal_code: 'postal-code',
  phone: 'tel',
};

export function AddressFields({ values, onChange, errors, prefix }: AddressFieldsProps) {
  return (
    <>
      {ADDRESS_FIELDS.map(({ key, label, placeholder, required }) => (
        <div key={`${prefix}-${key}`}>
          <label
            htmlFor={`${prefix}-${key}`}
            className="block text-xs font-medium text-[#E8EEF4] mb-1"
          >
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
          <input
            id={`${prefix}-${key}`}
            type={key === 'phone' ? 'tel' : 'text'}
            placeholder={placeholder}
            value={values[key]}
            onChange={(e) => onChange({ ...values, [key]: e.target.value })}
            autoComplete={AUTOCOMPLETE_BY_KEY[key]}
            className="w-full px-3 py-2 rounded-lg text-sm bg-white text-[#0D1B2A] placeholder-[#5c6b7d] border border-[#c5ced8] shadow-[inset_0_1px_2px_rgba(13,27,42,0.06)] [color-scheme:light] focus:outline-none focus:ring-2 focus:ring-emerald-500/90 focus:border-emerald-500"
          />
          {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
        </div>
      ))}
    </>
  );
}
