import React from 'react';

interface SafeYTDialogProps {
    isEditMode: boolean;
    link: string;
    onSafeYTLinkChange: (safeYTLink: string) => void;
}
declare const SafeYTVideoEditor: (props: SafeYTDialogProps) => React.JSX.Element;

export { SafeYTVideoEditor };
