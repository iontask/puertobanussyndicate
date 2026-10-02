/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthProvider } from './context/AuthContext';
import { ResidenceProvider } from './context/ResidenceContext';
import { I18nProvider } from './i18n/I18nContext';
import { AppLayout } from './components/layout/AppLayout';

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <ResidenceProvider>
          <AppLayout />
        </ResidenceProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
