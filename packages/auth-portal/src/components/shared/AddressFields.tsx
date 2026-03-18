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

export function AddressFields({ values, onChange, errors, prefix }: AddressFieldsProps) {
  return (
    <>
      {ADDRESS_FIELDS.map(({ key, label, placeholder, required }) => (
        <div key={`${prefix}-${key}`}>
          <label htmlFor={`${prefix}-${key}`} className="block text-xs text-ff-form-label mb-1">
            {label}
            {required && <span className="text-ff-error ml-1">*</span>}
          </label>
          <input
            id={`${prefix}-${key}`}
            type={key === 'phone' ? 'tel' : 'text'}
            placeholder={placeholder}
            value={values[key]}
            onChange={(e) => onChange({ ...values, [key]: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-ff-border-mid rounded-lg text-ff-form-text text-sm placeholder-ff-form-placeholder focus:ring-2 focus:ring-ff-focus focus:border-transparent"
          />
          {errors[key] && <p className="text-ff-error text-xs mt-1">{errors[key]}</p>}
        </div>
      ))}
    </>
  );
}
