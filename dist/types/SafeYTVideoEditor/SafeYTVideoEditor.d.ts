import React from 'react';
import './SafeYTVideoEditor.css';
export interface SafeYTDialogProps {
    isEditMode: boolean;
    link: string;
    onSafeYTLinkChange: (safeYTLink: string) => void;
}
declare const SafeYTVideoEditor: (props: SafeYTDialogProps) => React.JSX.Element;
export default SafeYTVideoEditor;
