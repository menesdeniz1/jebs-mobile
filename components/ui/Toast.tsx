import React from 'react';
import Toast, { BaseToast, ErrorToast, InfoToast, BaseToastProps } from 'react-native-toast-message';

const toastConfig = {
    success: (props: BaseToastProps) => (
        <BaseToast
            {...props}
            style={{ borderLeftColor: '#388E3C' }}
            contentContainerStyle={{ paddingHorizontal: 15 }}
            text1Style={{ fontSize: 14, fontWeight: '600' }}
            text2Style={{ fontSize: 12 }}
        />
    ),
    error: (props: BaseToastProps) => (
        <ErrorToast
            {...props}
            style={{ borderLeftColor: '#D32F2F' }}
            text1Style={{ fontSize: 14, fontWeight: '600' }}
            text2Style={{ fontSize: 12 }}
        />
    ),
    info: (props: BaseToastProps) => (
        <InfoToast
            {...props}
            style={{ borderLeftColor: '#1B5E20' }}
            text1Style={{ fontSize: 14, fontWeight: '600' }}
            text2Style={{ fontSize: 12 }}
        />
    ),
};

export { toastConfig };

// Helper functions for Turkish toast messages
export function showSuccess(message: string) {
    Toast.show({ type: 'success', text1: message, position: 'bottom', visibilityTime: 2500 });
}

export function showError(message: string) {
    Toast.show({ type: 'error', text1: message, position: 'bottom', visibilityTime: 3000 });
}

export function showInfo(message: string) {
    Toast.show({ type: 'info', text1: message, position: 'bottom', visibilityTime: 2500 });
}
