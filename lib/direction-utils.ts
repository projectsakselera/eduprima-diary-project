// Simple direction utility to replace rtl-detect
// For EduPrima project focusing on LTR languages (Indonesian, English)

export function getLangDir(locale: string): 'ltr' | 'rtl' {
  // RTL languages - add more if needed
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  
  // Extract language code from locale (e.g., 'en-US' -> 'en')
  const lang = locale.toLowerCase().split('-')[0];
  
  return rtlLanguages.includes(lang) ? 'rtl' : 'ltr';
}
