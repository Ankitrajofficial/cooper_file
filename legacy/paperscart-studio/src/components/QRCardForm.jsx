import React, { useRef } from 'react';
import { Upload, Camera, Link, MessageSquare } from 'lucide-react';

const themes = [
  { id: 'theme-default', label: 'Default Modern' },
  { id: 'theme-holi', label: 'Holi Festival' },
  { id: 'theme-dark', label: 'Midnight Dark' },
  { id: 'theme-elegant', label: 'Elegant Gold' },
];

const purposes = [
  { id: 'Scan to Pay / Connect', label: 'Scan to Pay / Connect' },
  { id: 'Scan for Google Review', label: 'Google Review' },
  { id: 'Scan to follow on Instagram', label: 'Follow on Instagram' },
  { id: 'Scan to chat on WhatsApp', label: 'Chat on WhatsApp' },
];

const purposeMessages = {
  'Scan to Pay / Connect': 'Fast & secure. Connect with us instantly.',
  'Scan for Google Review': 'Love our service? Leave us a quick review!',
  'Scan to follow on Instagram': 'Follow us for the latest updates & offers!',
  'Scan to chat on WhatsApp': 'Have questions? Chat with us instantly.',
};

export default function QRCardForm({ data, onChange }) {
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange({ qrImage: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePurposeChange = (e) => {
    const purpose = e.target.value;
    onChange({ 
      purpose,
      qrMessage: purposeMessages[purpose] || 'Scan this code to connect.'
    });
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Property / Business Name
          </label>
          <input
            type="text"
            value={data.hostelName || ''}
            onChange={(e) => onChange({ hostelName: e.target.value })}
            placeholder="e.g. Acme Cafe"
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State Operating Head
          </label>
          <input
            type="text"
            value={data.stateOperatingHead || ''}
            onChange={(e) => onChange({ stateOperatingHead: e.target.value })}
            placeholder="Person who closed this deal"
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            QR Code Image
          </label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors group"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />
            {data.qrImage ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded shadow-sm bg-white p-1 mb-2">
                  <img src={data.qrImage} alt="QR Code Preview" className="w-full h-full object-contain" />
                </div>
                <p className="text-sm font-medium text-emerald-600">Image selected. Click to change.</p>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 group-hover:text-emerald-500 mb-2 transition-colors" />
                <p className="text-sm font-medium text-gray-700">Click to upload QR Code</p>
                <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG, WEBP</p>
              </>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Call to Action (Purpose)
          </label>
          <select
            value={data.purpose || ''}
            onChange={handlePurposeChange}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          >
            {purposes.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Custom Message (Optional)
          </label>
          <input
            type="text"
            value={data.qrMessage || ''}
            onChange={(e) => onChange({ qrMessage: e.target.value })}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Card Theme
          </label>
          <select
            value={data.theme || 'theme-default'}
            onChange={(e) => onChange({ theme: e.target.value })}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          >
            {themes.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
