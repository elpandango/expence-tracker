export type UiEvents = {
  'ui:startLoading': 'auth' | 'default';
  'ui:stopLoading': 'auth' | 'default';
  'ui:showToast': { message: string; type: 'success' | 'error' };
};